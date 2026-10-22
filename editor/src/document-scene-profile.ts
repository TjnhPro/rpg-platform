import type { DocumentContentValue } from './document-envelope.js';
import type { SceneMembership } from './scene-membership.js';

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Internal comparison of already bounded portable data against an owner snapshot. */
export function sameDocumentSnapshot(
  source: unknown, expected: unknown, metadataRecords: ReadonlySet<object> = new Set(),
): boolean {
  if (source === null || typeof source !== 'object') return Object.is(source, expected);
  if (Array.isArray(source)) return Array.isArray(expected) && source.length === expected.length
    && source.every((value, index) => sameDocumentSnapshot(value, expected[index], metadataRecords));
  if (!record(expected)) return false;
  const input = source as Record<string, unknown>;
  const keys = Object.keys(input);
  if (metadataRecords.has(source) && Object.hasOwn(input, 'metadata')) {
    if (!record(input['metadata'])) return false;
    keys.splice(keys.indexOf('metadata'), 1);
  }
  return keys.length === Object.keys(expected).length && keys.every(key => Object.hasOwn(expected, key)
    && sameDocumentSnapshot(input[key], expected[key], metadataRecords));
}

/**
 * Document-only Scene snapshot profile: canonical owner fields plus optional
 * opaque portable metadata records on membership, Scene, entry and definition.
 * Nothing else is silently normalized/projected. No interpretation of metadata.
 * Call only after bounded codec capture and successful canonical Scene validation.
 */
export function matchesSceneDocumentProfile(source: DocumentContentValue, expected: SceneMembership): boolean {
  if (!record(source) || !record(source['scene']) || !Array.isArray(source['objects'])) return false;
  const metadataRecords = new Set<object>([source, source['scene']]);
  for (const entry of source['objects']) {
    if (!record(entry) || !record(entry['definition'])) return false;
    metadataRecords.add(entry);
    metadataRecords.add(entry['definition']);
  }
  return sameDocumentSnapshot(source, expected, metadataRecords);
}
