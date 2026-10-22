import { getAssetDefinition, resolveAssetReference, updateAssetDefinition, type AssetCatalog } from './asset-catalog.js';
import { createAssetReference, type AssetReference, type AssetReferenceInput } from './asset-reference.js';
import { createResourceLocator, type ResourceLocator } from './asset-sources.js';

/**
 * Replace exactly one ordered source locator in a factory catalog candidate.
 * Identity, sourceId, role, metadata and dependencies retain their values. No IO,
 * inferred revision or content equivalence claim; host commits the new snapshot.
 */
export function relocateAssetSource(
  catalog: AssetCatalog, assetId: string, sourceIndex: number, locator: ResourceLocator,
): AssetCatalog {
  const definition = getAssetDefinition(catalog, assetId);
  if (definition === undefined) throw new TypeError('Cannot relocate a missing catalog assetId');
  if (!Number.isSafeInteger(sourceIndex) || sourceIndex < 0 || sourceIndex >= definition.sources.length) {
    throw new TypeError('sourceIndex must select an existing ordered source');
  }
  const nextLocator = createResourceLocator(locator);
  const sources = definition.sources.map((source, index) => index === sourceIndex
    ? { role: source.role, locator: nextLocator } : source);
  return updateAssetDefinition(catalog, { ...definition, sources });
}

/**
 * Explicitly propose a new assetId for one reference, preserving its project/kind/
 * subresource expectation. Only return a reference when the new target resolves.
 * Old target may be absent; no other holder or catalog is edited. Unknown targets,
 * kind mismatch and unverifiable subresources throw TypeError without a candidate.
 */
export function rebindAssetReference(
  catalog: AssetCatalog, input: AssetReferenceInput, targetAssetId: string,
): AssetReference {
  const reference = createAssetReference(input);
  const result = resolveAssetReference(catalog, { ...reference, assetId: targetAssetId });
  if (result.status === 'unresolved') throw new TypeError(`Cannot rebind reference: ${result.reason}`);
  return result.reference;
}
