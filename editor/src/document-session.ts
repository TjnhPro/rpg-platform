import {
  createDocumentEnvelope,
  replaceDocumentContent,
  type DocumentEnvelope,
} from './document-envelope.js';

/** Session metadata is never part of the authored envelope. No saved claim. */
export interface DocumentSessionSnapshot {
  readonly state: 'created' | 'open' | 'closed';
  readonly envelope: DocumentEnvelope;
  /** Caller-supplied in-memory revert target, NOT a storage/saved baseline. */
  readonly revertBaseline: DocumentEnvelope | null;
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
 * second close). Errors leave session state unchanged. Close conservatively needs
 * explicit discard even without edits: no equality, dirty/revision or saved policy
 * is inferred. The final snapshot retains content for host inspection/recovery;
 * caller-held snapshots are never revoked. No resources are disposed here.
 */
export function createDocumentSession(
  envelope: DocumentEnvelope,
  revertBaseline: DocumentEnvelope | null,
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
  let state: DocumentSessionSnapshot['state'] = 'created';
  const getSnapshot = (): DocumentSessionSnapshot => Object.freeze({
    state, envelope: current, revertBaseline: baseline,
  });
  const requireState = (expected: 'created' | 'open'): void => {
    if (state !== expected) throw new Error(`Document session requires ${expected}; current state is ${state}`);
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
      const next = replaceDocumentContent(current, content);
      current = next;
      return getSnapshot();
    },
    revert: (): DocumentSessionSnapshot => {
      requireState('open');
      if (baseline === null) throw new Error('Document session has no caller-supplied revert baseline');
      current = baseline;
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
