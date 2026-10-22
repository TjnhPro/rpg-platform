import { detachPortableAssetData } from './asset-definition.js';

/** Logical Document key, project-local and distinct from content IDs and locations. */
export interface DocumentIdentity {
  readonly projectId: string;
  readonly documentId: string;
}

/** Portable data only; this type does not assert any content-owner schema. */
export type DocumentContentValue =
  | null | boolean | number | string
  | readonly DocumentContentValue[]
  | DocumentContentRecord;

/** Unknown portable content fields are retained, not interpreted or projected. */
export interface DocumentContentRecord {
  readonly [key: string]: DocumentContentValue;
}

export interface DocumentEnvelopeInput {
  /** Supported envelope shape, not a codec revision or package version. */
  readonly schemaVersion: 1;
  readonly identity: DocumentIdentity;
  /** Exact open classification; not proof of a supported validator or codec. */
  readonly documentKind: string;
  /** Explicit positive safe integer, or null when the content owner is unversioned. */
  readonly contentSchemaVersion: number | null;
  /** Caller selects authored content; only physical portability is checked here. */
  readonly content: unknown;
}

/** Detached authored envelope, with no session, storage, workspace or Render state. */
export interface DocumentEnvelope {
  readonly schemaVersion: 1;
  readonly identity: DocumentIdentity;
  readonly documentKind: string;
  readonly contentSchemaVersion: number | null;
  readonly content: DocumentContentValue;
}

function record(value: unknown, keys: readonly string[], field: string): void {
  if (typeof value !== 'object' || value === null || Array.isArray(value)
    || (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null)
    || Reflect.ownKeys(value).length !== keys.length
    || !keys.every(key => {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      return descriptor !== undefined && descriptor.enumerable && 'value' in descriptor;
    })) {
    throw new TypeError(`${field} requires exactly the supported enumerable data fields: ${keys.join(', ')}`);
  }
}

function key(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.length === 0 || /\s/u.test(value)) {
    throw new TypeError(`${field} must be a non-empty string without whitespace`);
  }
  return value;
}

/**
 * Capture explicit exact keys. Equality compares projectId AND documentId,
 * case-sensitively, with no trimming, Unicode normalization, generation, content
 * lookup or uniqueness registry. Unknown fields reject instead of being dropped.
 */
export function createDocumentIdentity(input: DocumentIdentity): DocumentIdentity {
  record(input, ['projectId', 'documentId'], 'Document identity');
  return Object.freeze({
    projectId: key(input.projectId, 'projectId'),
    documentId: key(input.documentId, 'documentId'),
  });
}

/**
 * Capture only envelope schema 1. Deeply detach/freeze finite portable primitives,
 * plain data records and dense arrays, reusing Editor's existing data detacher.
 * Reject cycles, negative zero, accessors, symbols, nonenumerable/custom properties
 * and class/host instances. Unknown portable CONTENT keys survive; unsupported
 * ENVELOPE/identity fields and versions reject without altering the caller's data.
 *
 * No content-kind/schema validation, project-reference resolution or write-safety
 * inference: the caller must use canonical content-owner APIs first. This is not
 * a decoder, codec, session, Save/Load or migration API. No format codec revision,
 * storage binding, dirty flag or editing revision is invented here.
 * Invalid input throws TypeError; host/proxy exceptions and resource limits are
 * not converted into successful capture. Pass data records, not live objects.
 */
export function createDocumentEnvelope(input: DocumentEnvelopeInput): DocumentEnvelope {
  record(input, ['schemaVersion', 'identity', 'documentKind', 'contentSchemaVersion', 'content'], 'Document envelope');
  if (input.schemaVersion !== 1) {
    throw new TypeError('Unsupported Document envelope schemaVersion; expected exactly 1');
  }
  const identity = createDocumentIdentity(input.identity);
  const documentKind = key(input.documentKind, 'documentKind');
  const contentSchemaVersion = input.contentSchemaVersion;
  if (contentSchemaVersion !== null
    && (typeof contentSchemaVersion !== 'number' || !Number.isSafeInteger(contentSchemaVersion) || contentSchemaVersion < 1)) {
    throw new TypeError('contentSchemaVersion must be a positive safe integer or explicit null for unversioned content');
  }
  return Object.freeze({
    schemaVersion: 1,
    identity,
    documentKind,
    contentSchemaVersion,
    content: detachPortableAssetData(input.content, 'Document content'),
  });
}
