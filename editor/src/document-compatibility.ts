import { serializeDocument } from './document-codec.js';
import { createDocumentEnvelope, type DocumentEnvelope, type DocumentContentValue } from './document-envelope.js';
import { diagnoseDocument, type DocumentValidationContext, type DocumentValidationResult } from './document-diagnostics.js';

/** One explicitly selected forward content-profile step, never an envelope upgrade. */
export interface DocumentMigration {
  readonly name: string;
  readonly documentKind: string;
  readonly sourceContentSchemaVersion: number;
  readonly targetContentSchemaVersion: number;
  /** Trusted synchronous pure owner callback; no IO, sessions or external mutation. */
  readonly transform: (content: DocumentContentValue) => unknown;
}

export interface DocumentCompatibilityResult {
  readonly status: 'writable-compatible' | 'read-only' | 'rejected';
  readonly reason: 'current' | 'migration-needed' | 'migration-unavailable'
    | 'unsupported-envelope' | 'malformed' | 'kind-mismatch' | 'future-content' | 'validation-rejected';
  /** Original text and decoded data, not a projection, session or write permit. */
  readonly text: string;
  readonly validation: DocumentValidationResult;
  readonly writeEligibility: 'NOT_ESTABLISHED';
}

export type DocumentMigrationResult =
  | { readonly status: 'migrated'; readonly migration: string; readonly originalText: string;
      readonly candidate: DocumentEnvelope; readonly validation: DocumentValidationResult;
      readonly writeEligibility: 'NOT_ESTABLISHED' }
  | { readonly status: 'blocked'; readonly reason: 'source-not-migratable' | 'already-current'
      | 'migration-unavailable' | 'transform-failed' | 'candidate-rejected' | 'data-loss' | 'validation-rejected';
      readonly compatibility: DocumentCompatibilityResult; readonly validation?: DocumentValidationResult };

function captureTarget(target: DocumentValidationContext): DocumentValidationContext {
  const captured = Object.freeze({ ...target });
  if (!['scene', 'asset', 'coordinate-space', 'text'].includes(captured.owner)
    || typeof captured.documentKind !== 'string' || !captured.documentKind || /\s/u.test(captured.documentKind)
    || (captured.contentSchemaVersion !== null
      && (!Number.isSafeInteger(captured.contentSchemaVersion) || captured.contentSchemaVersion < 1))) {
    throw new TypeError('Compatibility requires an explicit supported target owner binding');
  }
  return captured;
}

function captureMigration(migration: DocumentMigration | undefined): DocumentMigration | undefined {
  if (migration === undefined) return undefined;
  const captured = Object.freeze({ ...migration });
  if (typeof captured.name !== 'string' || !captured.name.trim()
    || typeof captured.documentKind !== 'string' || !captured.documentKind || /\s/u.test(captured.documentKind)
    || !Number.isSafeInteger(captured.sourceContentSchemaVersion) || captured.sourceContentSchemaVersion < 1
    || !Number.isSafeInteger(captured.targetContentSchemaVersion)
    || captured.targetContentSchemaVersion <= captured.sourceContentSchemaVersion
    || typeof captured.transform !== 'function') {
    throw new TypeError('Migration requires a named, explicit forward content-version step');
  }
  return captured;
}

/**
 * Inspect without invoking a transform or IO. Only current envelope schema 1 can
 * be interpreted. Read-only means inspectable portable data, not semantic validity
 * of an older owner profile. Writable-compatible means current owner checks pass;
 * safe Save still requires the existing coordinator and actual host guarantees.
 */
export function inspectDocumentCompatibility(
  text: string, target: DocumentValidationContext, migration?: DocumentMigration,
): DocumentCompatibilityResult {
  const binding = captureTarget(target), step = captureMigration(migration);
  let validation = diagnoseDocument(text);
  const finish = (status: DocumentCompatibilityResult['status'], reason: DocumentCompatibilityResult['reason']) =>
    Object.freeze({ status, reason, text, validation, writeEligibility: 'NOT_ESTABLISHED' as const });
  const source = validation.document;
  if (source === null) return finish('rejected', validation.diagnostics.some(d => d.code === 'UNSUPPORTED_SCHEMA')
    ? 'unsupported-envelope' : 'malformed');
  if (source.documentKind !== binding.documentKind) return finish('rejected', 'kind-mismatch');
  if (source.contentSchemaVersion === binding.contentSchemaVersion) {
    validation = diagnoseDocument(text, binding);
    return validation.readEligibility.strict ? finish('writable-compatible', 'current')
      : finish('rejected', 'validation-rejected');
  }
  if (source.contentSchemaVersion !== null && binding.contentSchemaVersion !== null
    && source.contentSchemaVersion > binding.contentSchemaVersion) return finish('rejected', 'future-content');
  const available = step !== undefined && step.documentKind === source.documentKind
    && step.sourceContentSchemaVersion === source.contentSchemaVersion
    && step.targetContentSchemaVersion === binding.contentSchemaVersion;
  return finish('read-only', available ? 'migration-needed' : 'migration-unavailable');
}

/** Conservative additive profile: retain every old value/key and array position. */
function preserves(source: DocumentContentValue, candidate: DocumentContentValue): boolean {
  if (source === null || typeof source !== 'object') return Object.is(source, candidate);
  if (candidate === null || typeof candidate !== 'object' || Array.isArray(source) !== Array.isArray(candidate)) return false;
  if (Array.isArray(source)) {
    return Array.isArray(candidate) && source.length === candidate.length
      && source.every((value, index) => preserves(value, candidate[index]!));
  }
  const before = source as Readonly<Record<string, DocumentContentValue>>;
  const after = candidate as Readonly<Record<string, DocumentContentValue>>;
  return Object.keys(before).every(key => Object.hasOwn(after, key) && preserves(before[key]!, after[key]!));
}

/**
 * Opt-in one-step candidate only. Source versions/kind must match exactly; no
 * chaining, downgrade, registry or automatic open/save. Capture a portable bounded
 * candidate through the existing codec, preserve old content structurally, then
 * validate through existing target owners/references. No session/saved-state mutation.
 * Transform exceptions become safe transform-failed; trusted validation resolver
 * exceptions still propagate. Callback purity/semantic compatibility is host-owned.
 */
export function migrateDocument(
  text: string, target: DocumentValidationContext, migration?: DocumentMigration,
): DocumentMigrationResult {
  const binding = captureTarget(target), step = captureMigration(migration);
  const compatibility = inspectDocumentCompatibility(text, binding, step);
  const blocked = (reason: Extract<DocumentMigrationResult, { status: 'blocked' }>['reason']): DocumentMigrationResult =>
    Object.freeze({ status: 'blocked', reason, compatibility });
  if (compatibility.status === 'writable-compatible') return blocked('already-current');
  if (compatibility.status !== 'read-only') return blocked('source-not-migratable');
  if (compatibility.reason !== 'migration-needed' || step === undefined) return blocked('migration-unavailable');
  const source = compatibility.validation.document!;
  let content: unknown;
  try { content = step.transform(source.content); }
  catch { return blocked('transform-failed'); }
  let encoded: string;
  try {
    // Bound/validate callback output BEFORE recursive detachment in the factory.
    encoded = serializeDocument({ ...source, contentSchemaVersion: step.targetContentSchemaVersion,
      content } as DocumentEnvelope);
  } catch (error) {
    if (!(error instanceof TypeError) && !(error instanceof RangeError)) throw error;
    return blocked('candidate-rejected');
  }
  // Decode first for bounded portable data; never validate an owner's projection.
  const capture = diagnoseDocument(encoded);
  const candidate = capture.document!;
  if (!preserves(source.content, candidate.content)) return blocked('data-loss');
  const validation = diagnoseDocument(encoded, binding);
  if (!validation.readEligibility.strict) return Object.freeze({ status: 'blocked',
    reason: 'validation-rejected', compatibility, validation });
  return Object.freeze({ status: 'migrated', migration: step.name, originalText: text,
    candidate: createDocumentEnvelope(candidate), validation, writeEligibility: 'NOT_ESTABLISHED' });
}
