import {
  createDocumentEnvelope,
  replaceDocumentContent,
  type DocumentEnvelope,
} from './document-envelope.js';
import { detachPortableAssetData } from './asset-definition.js';

/** Trusted host attestation about the exact initial envelope, not a load operation. */
export interface DocumentLoadedEvidence {
  readonly kind: 'storage-load';
  readonly confirmation: string;
}

/** Host must provide only after persisting the exact ticket payload successfully. */
export interface DocumentCommitEvidence {
  readonly kind: 'storage-commit';
  readonly confirmation: string;
}

/** In-memory, session-bound capability. A copy/deserialized ticket is not valid. */
export interface DocumentSaveTicket {
  readonly revision: number;
  readonly envelope: DocumentEnvelope;
}

export type DocumentSaveOutcome =
  | { readonly status: 'committed'; readonly evidence: DocumentCommitEvidence }
  | { readonly status: 'failed' | 'cancelled' };

function portableRecord(value: unknown, field: string): Readonly<Record<string, unknown>> {
  const data = detachPortableAssetData(value, field);
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new TypeError(`${field} requires a portable data record`);
  }
  return data as Readonly<Record<string, unknown>>;
}

function storageEvidence(value: unknown, kind: string): void {
  const data = portableRecord(value, 'Document storage evidence');
  if (Object.keys(data).length !== 2 || !Object.hasOwn(data, 'kind')
    || !Object.hasOwn(data, 'confirmation') || data.kind !== kind
    || typeof data.confirmation !== 'string' || data.confirmation.trim().length === 0) {
    throw new TypeError(`Document storage evidence requires ${kind} and non-empty confirmation`);
  }
}

/** Session metadata is never part of the authored envelope. Evidence is host-trusted. */
export interface DocumentSessionSnapshot {
  readonly state: 'created' | 'open' | 'closed';
  readonly envelope: DocumentEnvelope;
  /** Caller-supplied in-memory revert target, NOT a storage/saved baseline. */
  readonly revertBaseline: DocumentEnvelope | null;
  /** Positive session-local generation, independent of all schema/storage versions. */
  readonly currentRevision: number;
  readonly savedRevision: number | null;
  readonly savedEnvelope: DocumentEnvelope | null;
  /** Conservative Object.is content equality; not deep equality or a UI assertion. */
  readonly isDirty: boolean;
}

/** A live capability, not portable authored content or a UI tab/view. */
export interface DocumentSession {
  /** Available after close; retained snapshots remain immutable. */
  readonly getSnapshot: () => DocumentSessionSnapshot;
  /** Activate captured data only; no file read, decode, saved claim or reopen. */
  readonly open: () => DocumentSessionSnapshot;
  /** Whole-content replacement; canonical content-owner validation stays caller-side. */
  readonly replaceContent: (content: unknown) => DocumentSessionSnapshot;
  /** Restore only the explicitly supplied in-memory baseline; no storage reload. */
  readonly revert: () => DocumentSessionSnapshot;
  /** Restore only a host-confirmed loaded/committed snapshot, never an invented baseline. */
  readonly revertToSaved: () => DocumentSessionSnapshot;
  /** Capture exact generation/payload, without IO or a saved-state transition. */
  readonly prepareSave: () => DocumentSaveTicket;
  /** One-shot trusted host outcome. Older acknowledgements cannot roll saved state back. */
  readonly completeSave: (ticket: DocumentSaveTicket, outcome: DocumentSaveOutcome) => DocumentSessionSnapshot;
  /** Host explicitly admits discard. No UI removal, IO or saved acknowledgement. */
  readonly close: (disposition: 'discard') => DocumentSessionSnapshot;
}

/**
 * Capture an envelope and an explicit optional revert target, then start created.
 * A non-null baseline must match identity, kind and both schema versions. Its
 * source is caller-supplied memory, never inferred storage evidence. Null means
 * revert is unavailable, including for a never-saved newly authored document.
 *
 * Each factory call is independent, even for the same Document ID. Hosts must
 * share one capability across views when desired; there is no uniqueness registry,
 * synchronization, tab binding, Render lifecycle or session ID in serialized data.
 * All mutators require their documented state; closed is terminal (including a
 * second close). Invalid input leaves state unchanged. Close still needs explicit
 * discard even when clean. Revision starts at 1; an Object.is content no-op does
 * not increment, distinct records increment even if structurally equal. Reverting
 * to a different target increments generation without claiming a new saved revision.
 * Overflow rejects. UI selection/zoom are never inputs to authored generation.
 *
 * Without loadedEvidence the initial document is unsaved, even with a caller-memory
 * revertBaseline. Evidence attests the exact initial envelope, NOT revertBaseline.
 * Save outcomes are trusted host declarations, not independently verified disk IO.
 * Failed/cancelled tickets retire without advancing saved state. Valid older commit
 * acknowledgements retire without rolling the latest saved revision backward; the
 * host must order actual writes/resolve storage conflicts. No async save engine.
 * The final snapshot retains content for host inspection/recovery;
 * caller-held snapshots are never revoked. No resources are disposed here.
 */
export function createDocumentSession(
  envelope: DocumentEnvelope,
  revertBaseline: DocumentEnvelope | null,
  loadedEvidence?: DocumentLoadedEvidence,
): DocumentSession {
  let current = createDocumentEnvelope(envelope);
  const baseline = revertBaseline === null ? null : createDocumentEnvelope(revertBaseline);
  if (baseline !== null && (baseline.identity.projectId !== current.identity.projectId
    || baseline.identity.documentId !== current.identity.documentId
    || baseline.documentKind !== current.documentKind
    || baseline.schemaVersion !== current.schemaVersion
    || baseline.contentSchemaVersion !== current.contentSchemaVersion)) {
    throw new TypeError('Document revert baseline must match identity, kind and schema versions');
  }
  if (loadedEvidence !== undefined) storageEvidence(loadedEvidence, 'storage-load');
  let state: DocumentSessionSnapshot['state'] = 'created';
  let currentRevision = 1;
  let savedRevision: number | null = loadedEvidence === undefined ? null : 1;
  let savedEnvelope: DocumentEnvelope | null = loadedEvidence === undefined ? null : current;
  const tickets = new WeakSet<DocumentSaveTicket>();
  const getSnapshot = (): DocumentSessionSnapshot => Object.freeze({
    state, envelope: current, revertBaseline: baseline,
    currentRevision, savedRevision, savedEnvelope,
    isDirty: savedEnvelope === null || !Object.is(current.content, savedEnvelope.content),
  });
  const requireState = (expected: 'created' | 'open'): void => {
    if (state !== expected) throw new Error(`Document session requires ${expected}; current state is ${state}`);
  };
  const adopt = (next: DocumentEnvelope): void => {
    if (Object.is(current.content, next.content)) return;
    if (currentRevision === Number.MAX_SAFE_INTEGER) throw new RangeError('Document revision exhausted');
    current = next;
    currentRevision += 1;
  };
  return Object.freeze({
    getSnapshot,
    open: (): DocumentSessionSnapshot => {
      requireState('created');
      state = 'open';
      return getSnapshot();
    },
    replaceContent: (content: unknown): DocumentSessionSnapshot => {
      requireState('open');
      if (Object.is(current.content, content)) return getSnapshot();
      const next = replaceDocumentContent(current, content);
      adopt(next);
      return getSnapshot();
    },
    revert: (): DocumentSessionSnapshot => {
      requireState('open');
      if (baseline === null) throw new Error('Document session has no caller-supplied revert baseline');
      adopt(baseline);
      return getSnapshot();
    },
    revertToSaved: (): DocumentSessionSnapshot => {
      requireState('open');
      if (savedEnvelope === null) throw new Error('Document session has no storage-confirmed saved snapshot');
      adopt(savedEnvelope);
      return getSnapshot();
    },
    prepareSave: (): DocumentSaveTicket => {
      requireState('open');
      const ticket = Object.freeze({ revision: currentRevision, envelope: current });
      tickets.add(ticket);
      return ticket;
    },
    completeSave: (ticket: DocumentSaveTicket, outcome: DocumentSaveOutcome): DocumentSessionSnapshot => {
      requireState('open');
      if (!tickets.has(ticket)) throw new TypeError('Unknown, foreign or already completed Document save ticket');
      const data = portableRecord(outcome, 'Document save outcome');
      if (!Object.hasOwn(data, 'status')) throw new TypeError('Invalid Document save outcome');
      if (data.status === 'committed' && Object.keys(data).length === 2 && Object.hasOwn(data, 'evidence')) {
        storageEvidence(data.evidence, 'storage-commit');
        if (savedRevision === null || ticket.revision >= savedRevision) {
          savedRevision = ticket.revision;
          savedEnvelope = ticket.envelope;
        }
      } else if ((data.status !== 'failed' && data.status !== 'cancelled') || Object.keys(data).length !== 1) {
        throw new TypeError('Document save outcome requires committed evidence, failed or cancelled');
      }
      tickets.delete(ticket);
      return getSnapshot();
    },
    close: (disposition: 'discard'): DocumentSessionSnapshot => {
      if (state === 'closed') throw new Error('Document session is closed');
      if (disposition !== 'discard') throw new TypeError('Document close requires explicit host discard admission');
      state = 'closed';
      return getSnapshot();
    },
  });
}
