import { diagnoseDocument, type DocumentValidationContext, type DocumentValidationResult } from './document-diagnostics.js';
import { createDocumentSession, type DocumentSession } from './document-session.js';
import { persistenceFailure, type DocumentPersistenceFailure } from './document-persistence.js';

/** Host observations, independent of authored identity and session revisions. */
export interface DocumentStorageObservation {
  /** Host-observed storage identity; null means unknown, not the Document ID. */
  readonly identity: string | null;
  /** Opaque host token for this read; null means unknown. No atomicity implied. */
  readonly revision: string | null;
}

export type DocumentReadResult =
  | { readonly status: 'read'; readonly text: string; readonly observation: DocumentStorageObservation }
  | { readonly status: 'not-found' }
  | { readonly status: 'read-failed'; readonly reason: 'permission-denied' | 'io-error' | 'unavailable' };

/**
 * Trusted host port. Host owns locator authorization, size limits, strict text
 * decoding and mapping expected IO failures. Unexpected exceptions propagate.
 * Text is the exact decoded input; no lossy replacement decoding or normalization.
 * Observation must describe these bytes, not a later stat or invented ETag.
 */
export interface DocumentReadPort {
  read(locator: string): Promise<DocumentReadResult>;
}

interface DocumentLoadCapture {
  readonly locator: string;
  /** Exact host text retained even for rejected/future envelopes. Never rewritten. */
  readonly text: string;
  readonly observation: DocumentStorageObservation;
  readonly validation: DocumentValidationResult;
}

export type DocumentLoadResult =
  | { readonly status: 'not-found'; readonly locator: string; readonly failure: DocumentPersistenceFailure }
  | { readonly status: 'read-failed'; readonly locator: string;
      readonly reason: 'permission-denied' | 'io-error' | 'unavailable'; readonly failure: DocumentPersistenceFailure }
  | (DocumentLoadCapture & { readonly status: 'parse-failed' | 'unsupported-schema' | 'validation-diagnostics';
      readonly failure: DocumentPersistenceFailure })
  | (DocumentLoadCapture & { readonly status: 'loaded'; readonly session: DocumentSession });

/**
 * One read -> existing codec/diagnostics -> new open session only on strict
 * admission. No existing session argument, registry, writes, renderer or retry.
 * Inspect-only data stays a capture without a live mutable session capability.
 * Clean means equal to this read, not proof storage has not subsequently changed.
 */
export async function loadDocument(
  port: DocumentReadPort, locator: string, context?: DocumentValidationContext,
): Promise<DocumentLoadResult> {
  if (typeof locator !== 'string' || locator.trim().length === 0) {
    throw new TypeError('Document load requires an explicit non-empty host locator');
  }
  const read = await port.read(locator);
  if (read.status === 'not-found') return Object.freeze({ status: 'not-found', locator,
    failure: persistenceFailure('NOT_FOUND', 'inspect-storage') });
  if (read.status === 'read-failed') {
    if (!['permission-denied', 'io-error', 'unavailable'].includes(read.reason)) {
      throw new TypeError('Invalid document read failure reason');
    }
    return Object.freeze({ status: 'read-failed', locator, reason: read.reason,
      failure: persistenceFailure(read.reason === 'permission-denied' ? 'IO_DENIED' : 'READ_FAILED', 'inspect-storage') });
  }
  if (read.status !== 'read' || typeof read.text !== 'string'
    || typeof read.observation !== 'object' || read.observation === null
    || ![read.observation.identity, read.observation.revision].every(value => value === null
      || (typeof value === 'string' && value.trim().length !== 0))) {
    throw new TypeError('Document read requires exact text and explicit nullable storage observations');
  }
  const text = read.text;
  const observation = Object.freeze({ identity: read.observation.identity, revision: read.observation.revision });
  const validation = diagnoseDocument(text, context);
  const capture = { locator, text, observation, validation };
  if (validation.document === null) {
    const unsupported = validation.diagnostics.some(item => item.code === 'UNSUPPORTED_SCHEMA');
    return Object.freeze({ ...capture, status: unsupported ? 'unsupported-schema' : 'parse-failed',
      failure: persistenceFailure(unsupported ? 'UNSUPPORTED_SCHEMA' : 'PARSE_FAILED', 'correct-input') });
  }
  if (!validation.readEligibility.strict) {
    return Object.freeze({ ...capture, status: 'validation-diagnostics',
      failure: persistenceFailure('VALIDATION_REJECTED', 'correct-input') });
  }
  // Evidence attests only that the port returned this input, not a storage commit.
  const session = createDocumentSession(validation.document, null,
    { kind: 'storage-load', confirmation: 'explicit-read-port' });
  session.open();
  return Object.freeze({ ...capture, status: 'loaded', session });
}
