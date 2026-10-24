import type { AssetDefinition } from './asset-definition.js';
import { createAssetReference, type AssetReference } from './asset-reference.js';
import { describeAssetBrowserCategory } from './asset-manager-category.js';
import { requireAssetManagerProject, type AssetManagerProject } from './asset-manager-project.js';

export interface AssetSearchRequest {
  readonly projectId: string;
  readonly query: string;
  readonly category?: string;
  readonly kind?: string;
}
export interface AssetSearchResult {
  readonly projectId: string;
  readonly generation: number;
  readonly definitions: readonly AssetDefinition[];
  readonly references: readonly AssetReference[];
  readonly count: number;
}
/** No locale folding, Unicode normalization, sorting, storage or retained index. */
export function searchManagedAssets(context: AssetManagerProject, request: AssetSearchRequest): AssetSearchResult {
  const { snapshot } = requireAssetManagerProject(context);
  if (!request || typeof request !== 'object' || Array.isArray(request)
    || Object.keys(request).some(key => !['projectId', 'query', 'category', 'kind'].includes(key))
    || request.projectId !== snapshot.projectId || typeof request.query !== 'string' || request.query.length > 1024)
    throw new TypeError('INVALID_ASSET_SEARCH');
  for (const value of [request.category, request.kind]) {
    if (value !== undefined && (typeof value !== 'string' || value.trim().length === 0 || value.length > 1024))
      throw new TypeError('INVALID_ASSET_FILTER');
  }
  const query = request.query.trim().toLowerCase();
  const definitions = snapshot.catalog.definitions.filter(asset => {
    if (request.kind !== undefined && asset.kind !== request.kind) return false;
    if (request.category !== undefined) {
      const category = describeAssetBrowserCategory(asset);
      if (category.status !== 'valid' || (request.category === 'uncategorized'
        ? category.authored : category.category !== request.category)) return false;
    }
    const name = asset.metadata['editorDisplayName'];
    return asset.identity.assetId.toLowerCase().includes(query)
      || (typeof name === 'string' && name.toLowerCase().includes(query));
  });
  const references = definitions.map(asset => createAssetReference({ ...asset.identity,
    expectedKind: asset.kind, subresourceId: null }));
  return Object.freeze({ projectId: snapshot.projectId, generation: snapshot.generation,
    definitions: Object.freeze(definitions), references: Object.freeze(references), count: definitions.length });
}
