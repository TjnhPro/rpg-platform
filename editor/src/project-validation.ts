import { detachPortableAssetData } from './asset-definition.js';
import { AssetValidationError } from './asset-validation.js';
import { createDocumentIdentity } from './document-envelope.js';

/** Project-owned structured input failure. Unknown host exceptions propagate. */
export class ProjectValidationError extends TypeError {
  constructor(readonly code: string, readonly path: string) {
    super(`${code} at ${path}`);
  }
}
export function projectFail(code: string, path: string): never {
  throw new ProjectValidationError(code, path);
}
export function projectData(input: unknown): unknown {
  try { return detachPortableAssetData(input, 'project'); }
  catch (error) {
    if (!(error instanceof AssetValidationError)) throw error;
    return projectFail('INVALID_PORTABLE_DATA', error.path);
  }
}
export function projectRecord(input: unknown, required: readonly string[], optional: readonly string[], path: string): Record<string, unknown> {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) return projectFail('INVALID_STRUCTURE', path);
  const value = input as Record<string, unknown>;
  if (required.some(key => !Object.hasOwn(value, key))
    || Object.keys(value).some(key => !required.includes(key) && !optional.includes(key))) return projectFail('INVALID_FIELDS', path);
  return value;
}
export function projectKey(value: unknown, path: string): string {
  if (typeof value !== 'string' || value.length === 0 || /\s/u.test(value)) return projectFail('INVALID_ID', path);
  // Reuse the established identity convention, never folder-derived.
  return createDocumentIdentity({ projectId: value, documentId: value }).projectId;
}
