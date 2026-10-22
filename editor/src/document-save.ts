import { serializeDocument } from './document-codec.js';
import { diagnoseDocument, type DocumentValidationContext, type DocumentValidationResult } from './document-diagnostics.js';
import type { DocumentSession, DocumentSessionSnapshot, DocumentSaveTicket } from './document-session.js';
import type { DocumentStorageObservation } from './document-load.js';
import { detachPortableAssetData } from './asset-definition.js';
import { persistenceFailure, type DocumentPersistenceFailure,
  type DocumentCleanupReceipt, type DocumentCleanupResult } from './document-persistence.js';

export type DocumentWritePrecondition =
  | { readonly kind: 'absent' }
  | { readonly kind: 'revision'; readonly identity: string | null; readonly revision: string }
  | { readonly kind: 'unknown' };

export interface DocumentWriteRequest {
  readonly locator: string;
  readonly text: string;
  /** Session generation, NEVER a storage token. */
  readonly revision: number;
  readonly expected: DocumentWritePrecondition;
}

export type DocumentCommitReceipt =
  | { readonly status: 'committed'; readonly confirmation: string; readonly observation: DocumentStorageObservation }
  | { readonly status: 'failed'; readonly reason?: 'permission-denied' | 'io-error' | 'interrupted-write' }
  | { readonly status: 'conflicted' }
  | { readonly status: 'uncertain' };

/**
 * Trusted host capability. Preconditions MUST be enforced atomically with the
 * write against all writers, not read/check followed by unconditional overwrite.
 * create-only supports absent only; compare-and-swap also supports revision.
 * atomic-publish promises full payload publication with no partial target visible;
 * it does not promise power-loss durability. Conflict protection alone is not
 * sufficient. failed guarantees target unchanged and no pending write; otherwise
 * return uncertain. No unconditional overwrite fallback is allowed.
 */
export interface DocumentWritePort {
  readonly conflictProtection: 'create-only' | 'compare-and-swap' | 'unavailable';
  readonly publication: 'atomic-publish' | 'unavailable';
  commit(request: DocumentWriteRequest): Promise<DocumentCommitReceipt>;
  /**
   * Optional host-owned cleanup, called ONCE after commit settles, with the same
   * frozen request. Host must release handles before settling commit and retain
   * per-request artifact ownership. Delete ONLY artifacts proven disposable;
   * retain any potential sole valid copy, especially on uncertain/failed writes.
   * Never rollback, republish, retry, or delete the destination here. No hook
   * means cleanup is not configured, not that storage needs no cleanup.
   * Must settle promptly; this coordinator has no cancellation/timeout authority.
   */
  cleanup?(request: DocumentWriteRequest, outcome: DocumentCommitReceipt['status']): Promise<DocumentCleanupReceipt>;
}

export type DocumentSaveResult =
  | { readonly status: 'blocked'; readonly reason: 'session-not-open' | 'busy'
      | 'previous-write-uncertain' | 'CONFLICT_UNDETECTABLE' | 'ATOMIC_PUBLICATION_UNAVAILABLE' | 'serialization-rejected';
      readonly failure?: DocumentPersistenceFailure }
  | { readonly status: 'validation-diagnostics'; readonly validation: DocumentValidationResult;
      readonly failure: DocumentPersistenceFailure }
  | { readonly status: 'conflicted' | 'failed' | 'uncertain'; readonly revision: number;
      readonly failure: DocumentPersistenceFailure; readonly cleanup: DocumentCleanupResult }
  | { readonly status: 'committed'; readonly revision: number;
      readonly observation: DocumentStorageObservation; readonly snapshot: DocumentSessionSnapshot;
      readonly acknowledgement: 'applied' | 'session-closed'; readonly cleanup: DocumentCleanupResult };

// Shared across calls in this module instance; no queue/registry of documents.
const active = new WeakSet<DocumentSession>();
const uncertain = new WeakSet<DocumentSession>();

/**
 * Capture one ticket, strict validation/serialization, conditional host commit,
 * then acknowledge THAT ticket only. Edits during IO remain newer and dirty.
 * Unknown/malformed/thrown commit outcomes quarantine this session from further
 * coordinator writes; recovery/reconciliation is deliberately not implemented.
 * Hosts must use this entrypoint for coordinated saves, not bypass it through
 * the low-level trusted session acknowledgement seam. No retry or migration.
 */
export async function saveDocument(
  session: DocumentSession, port: DocumentWritePort, locator: string,
  expected: DocumentWritePrecondition, context?: DocumentValidationContext,
): Promise<DocumentSaveResult> {
  if (typeof locator !== 'string' || locator.trim().length === 0) {
    throw new TypeError('Document save requires an explicit host locator');
  }
  if (!['absent', 'revision', 'unknown'].includes(expected.kind)
    || (expected.kind === 'revision' && (typeof expected.revision !== 'string'
      || expected.revision.trim().length === 0 || (expected.identity !== null
        && (typeof expected.identity !== 'string' || expected.identity.trim().length === 0))))) {
    throw new TypeError('Document save requires an explicit storage precondition');
  }
  const precondition: DocumentWritePrecondition = Object.freeze(expected.kind === 'revision'
    ? { kind: 'revision', identity: expected.identity, revision: expected.revision } : { kind: expected.kind });
  const blocked = (reason: Extract<DocumentSaveResult, { status: 'blocked' }>['reason']): DocumentSaveResult =>
    Object.freeze({ status: 'blocked', reason,
      ...(reason === 'previous-write-uncertain' ? { failure: persistenceFailure('COMMIT_UNCERTAIN', 'inspect-storage') }
        : reason === 'serialization-rejected' ? { failure: persistenceFailure('VALIDATION_REJECTED', 'correct-input') } : {}) });
  if (active.has(session)) return blocked('busy');
  if (uncertain.has(session)) return blocked('previous-write-uncertain');
  if (session.getSnapshot().state !== 'open') return blocked('session-not-open');
  if (precondition.kind === 'unknown' || !['create-only', 'compare-and-swap'].includes(port.conflictProtection)
    || (precondition.kind === 'revision' && port.conflictProtection !== 'compare-and-swap')) {
    return blocked('CONFLICT_UNDETECTABLE');
  }
  if (port.publication !== 'atomic-publish') return blocked('ATOMIC_PUBLICATION_UNAVAILABLE');
  active.add(session);
  let ticket: DocumentSaveTicket | undefined;
  let retired = false;
  try {
    ticket = session.prepareSave();
    let text: string;
    try { text = serializeDocument(ticket.envelope); }
    catch (error) {
      if (!(error instanceof TypeError) && !(error instanceof RangeError)) throw error;
      return blocked('serialization-rejected');
    }
    const validation = diagnoseDocument(text, context);
    if (!validation.readEligibility.strict) return Object.freeze({ status: 'validation-diagnostics', validation,
      failure: persistenceFailure('VALIDATION_REJECTED', 'correct-input') });
    // Trusted resolver callbacks must not silently close the session before IO.
    if (session.getSnapshot().state !== 'open') return blocked('session-not-open');
    const request = Object.freeze({ locator, text, revision: ticket.revision, expected: precondition });
    let receipt: DocumentCommitReceipt = { status: 'uncertain' };
    try {
      receipt = detachPortableAssetData(await port.commit(request), 'Document commit receipt') as unknown as DocumentCommitReceipt;
    }
    catch { /* IO may already have committed; no raw exception or invented receipt. */ }
    const validCommit = receipt?.status === 'committed' && typeof receipt.confirmation === 'string'
      && receipt.confirmation.trim().length !== 0 && typeof receipt.observation === 'object'
      && receipt.observation !== null && [receipt.observation.identity, receipt.observation.revision]
        .every(value => value === null || (typeof value === 'string' && value.trim().length !== 0));
    const validFailure = receipt?.status === 'failed' && (receipt.reason === undefined
      || ['permission-denied', 'io-error', 'interrupted-write'].includes(receipt.reason));
    if (!validCommit && !validFailure && receipt?.status !== 'conflicted') receipt = { status: 'uncertain' };
    if (receipt.status === 'uncertain') uncertain.add(session);
    // Cleanup is secondary evidence and cannot replace the primary commit result.
    const cleanup = await cleanupWrite(port, request, receipt.status);
    if (receipt?.status === 'failed' || receipt?.status === 'conflicted') {
      const failure = receipt.status === 'conflicted' ? persistenceFailure('EXTERNAL_CONFLICT', 'review-precondition')
        : persistenceFailure(receipt.reason === 'permission-denied' ? 'IO_DENIED'
          : receipt.reason === 'interrupted-write' ? 'WRITE_INTERRUPTED' : 'WRITE_FAILED', 'explicit-retry');
      return Object.freeze({ status: receipt.status, revision: ticket.revision, failure, cleanup });
    }
    if (receipt.status !== 'committed') {
      return Object.freeze({ status: 'uncertain', revision: ticket.revision,
        failure: persistenceFailure('COMMIT_UNCERTAIN', 'inspect-storage'), cleanup });
    }
    const observation = Object.freeze({ identity: receipt.observation.identity, revision: receipt.observation.revision });
    const closed = session.getSnapshot().state === 'closed';
    const snapshot = closed ? session.getSnapshot() : session.completeSave(ticket,
      { status: 'committed', evidence: { kind: 'storage-commit', confirmation: receipt.confirmation } });
    retired = !closed;
    return Object.freeze({ status: 'committed', revision: ticket.revision, observation, snapshot,
      acknowledgement: closed ? 'session-closed' : 'applied', cleanup });
  } finally {
    if (ticket !== undefined && !retired && session.getSnapshot().state === 'open') {
      session.completeSave(ticket, { status: 'failed' });
    }
    active.delete(session);
  }
}

async function cleanupWrite(
  port: DocumentWritePort, request: DocumentWriteRequest, outcome: DocumentCommitReceipt['status'],
): Promise<DocumentCleanupResult> {
  try {
    if (port.cleanup === undefined) return Object.freeze({ status: 'not-configured' });
    const receipt = detachPortableAssetData(await port.cleanup(request, outcome), 'Document cleanup receipt') as unknown as DocumentCleanupReceipt;
    if (receipt?.status === 'cleaned' || receipt?.status === 'retained') return Object.freeze({ status: receipt.status });
  } catch { /* Cleanup failure must not hide a known commit, conflict or uncertainty. */ }
  return Object.freeze({ status: 'failed', failure: persistenceFailure('CLEANUP_FAILED', 'inspect-storage') });
}
