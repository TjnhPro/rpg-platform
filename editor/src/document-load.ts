import { diagnoseDocument, type DocumentValidationContext, type DocumentValidationResult } from './document-diagnostics.js';
import { createDocumentSession, type DocumentSession } from './document-session.js';

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
  | { readonly status: 'not-found'; readonly locator: string }
  | { readonly status: 'read-failed'; readonly locator: string;
      readonly reason: 'permission-denied' | 'io-error' | 'unavailable' }
  | (DocumentLoadCapture & { readonly status: 'parse-failed' | 'unsupported-schema' | 'validation-diagnostics' })
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
  if (read.status === 'not-found') return Object.freeze({ status: 'not-found', locator });
  if (read.status === 'read-failed') {
    if (!['permission-denied', 'io-error', 'unavailable'].includes(read.reason)) {
      throw new TypeError('Invalid document read failure reason');
    }
    return Object.freeze({ status: 'read-failed', locator, reason: read.reason });
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
    return Object.freeze({ ...capture, status: validation.diagnostics.some(item => item.code === 'UNSUPPORTED_SCHEMA')
      ? 'unsupported-schema' : 'parse-failed' });
  }
  if (!validation.readEligibility.strict) {
    return Object.freeze({ ...capture, status: 'validation-diagnostics' });
  }
  // Evidence attests only that the port returned this input, not a storage commit.
  const session = createDocumentSession(validation.document, null,
    { kind: 'storage-load', confirmation: 'explicit-read-port' });
  session.open();
  return Object.freeze({ ...capture, status: 'loaded', session });
}
