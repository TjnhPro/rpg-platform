/** Safe, portable diagnostics. No raw exceptions, paths or backend handles. */
export interface DocumentPersistenceFailure {
  readonly code: 'IO_DENIED' | 'READ_FAILED' | 'NOT_FOUND' | 'PARSE_FAILED'
    | 'UNSUPPORTED_SCHEMA' | 'VALIDATION_REJECTED' | 'EXTERNAL_CONFLICT'
    | 'WRITE_FAILED' | 'WRITE_INTERRUPTED' | 'COMMIT_UNCERTAIN' | 'CLEANUP_FAILED';
  /** This foundation has no rollback, reconciliation or recovery capability. */
  readonly recovery: 'RECOVERY_NOT_AVAILABLE';
  /** Advice only; never dispatches IO or authorizes an overwrite/retry. */
  readonly nextAction: 'inspect-storage' | 'correct-input' | 'review-precondition' | 'explicit-retry';
}

export type DocumentCleanupReceipt = { readonly status: 'cleaned' | 'retained' | 'failed' };

export type DocumentCleanupResult =
  | { readonly status: 'not-configured' | 'cleaned' | 'retained' }
  | { readonly status: 'failed'; readonly failure: DocumentPersistenceFailure };

export function persistenceFailure(
  code: DocumentPersistenceFailure['code'], nextAction: DocumentPersistenceFailure['nextAction'],
): DocumentPersistenceFailure {
  return Object.freeze({ code, recovery: 'RECOVERY_NOT_AVAILABLE', nextAction });
}
