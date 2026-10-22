import { createAssetIdentity } from './asset-identity.js';
import { AssetValidationError, atAssetPath } from './asset-validation.js';

/** Explicit project-local target keys; no source locator or in-memory target. */
export interface AssetReferenceInput {
  readonly projectId: string;
  readonly assetId: string;
  readonly expectedKind?: string | null;
  /** Opaque authored address only; no frame/clip/direction grammar or discovery. */
  readonly subresourceId?: string | null;
}

/** Detached serializable snapshot; null means no expectation/address was supplied. */
export interface AssetReference {
  readonly projectId: string;
  readonly assetId: string;
  readonly expectedKind: string | null;
  readonly subresourceId: string | null;
}

/**
 * Validate and freeze reference data, without looking up the target. IDs reuse
 * identity semantics. expectedKind is exact nonempty whitespace-free resource/data
 * text; subresourceId is nonblank opaque text preserved verbatim. Omitted/null
 * optional fields become null. No IO, normalization, catalog or kind matching.
 */
export function createAssetReference(input: AssetReferenceInput): AssetReference {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new AssetValidationError('INVALID_STRUCTURE', '', 'NONNULL_NONARRAY_OBJECT', 'Asset reference input must be an object');
  }
  const { projectId, assetId, expectedKind = null, subresourceId = null } = input;
  const target = createAssetIdentity({ projectId, assetId });
  if (expectedKind !== null && (typeof expectedKind !== 'string'
    || expectedKind.length === 0 || /\s/u.test(expectedKind))) {
    throw new AssetValidationError('INVALID_REFERENCE', 'expectedKind', 'WHITESPACE_FREE_KIND_OR_NULL',
      'expectedKind must be a non-empty resource/data kind without whitespace or null');
  }
  if (subresourceId !== null && (typeof subresourceId !== 'string' || subresourceId.trim().length === 0)) {
    throw new AssetValidationError('INVALID_REFERENCE', 'subresourceId', 'NONBLANK_STRING_OR_NULL',
      'subresourceId must be nonblank opaque text or null');
  }
  return Object.freeze({
    projectId: target.projectId, assetId: target.assetId, expectedKind, subresourceId,
  });
}

/** Internal direct-edge construction, not a package-root API or target resolver. */
export function detachAssetDependencies(
  input: readonly AssetReferenceInput[], projectId: string,
): readonly AssetReference[] {
  if (!Array.isArray(input)) throw new AssetValidationError('INVALID_DEPENDENCY', 'dependencies', 'ARRAY', 'dependencies must be an array');
  const result: AssetReference[] = [];
  const targets = new Set<string>();
  for (const candidate of input) {
    const path = `dependencies[${result.length}]`;
    const reference = atAssetPath(path, () => createAssetReference(candidate));
    if (reference.projectId !== projectId) {
      throw new AssetValidationError('INVALID_DEPENDENCY', `${path}.projectId`, 'SAME_PROJECT',
        'Direct asset dependencies must target the definition project');
    }
    // One asset-to-asset edge per target, irrespective of expectation or subresource.
    if (targets.has(reference.assetId)) throw new AssetValidationError('DUPLICATE_DEPENDENCY', `${path}.assetId`,
      'UNIQUE_TARGET_ASSET', 'Duplicate direct dependency target asset');
    targets.add(reference.assetId);
    result.push(reference);
  }
  return Object.freeze(result);
}
