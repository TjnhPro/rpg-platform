import { readAssetDefinitionSnapshot } from './asset-snapshot.js';
import type { AssetDefinition } from './asset-definition.js';

export const assetBrowserCategories = Object.freeze([
  Object.freeze({ value: 'player', label: 'Player' }),
  Object.freeze({ value: 'monster', label: 'Monster' }),
  Object.freeze({ value: 'map', label: 'Map' }),
  Object.freeze({ value: 'item', label: 'Item' }),
  Object.freeze({ value: 'vfx', label: 'VFX' }),
  Object.freeze({ value: 'uncategorized', label: 'Uncategorized' }),
]);
export type AssetBrowserCategoryResult =
  | { readonly status: 'valid'; readonly category: string; readonly authored: boolean }
  | { readonly status: 'invalid'; readonly code: 'INVALID_BROWSER_CATEGORY' };
/** Exact optional metadata; no mutation, kind inference or normalization. */
export function describeAssetBrowserCategory(definition: AssetDefinition): AssetBrowserCategoryResult {
  const asset = readAssetDefinitionSnapshot(definition);
  if (!Object.hasOwn(asset.metadata, 'editorBrowserCategory'))
    return Object.freeze({ status: 'valid', category: 'uncategorized', authored: false });
  const value = asset.metadata['editorBrowserCategory'];
  if (typeof value !== 'string' || value.trim().length === 0)
    return Object.freeze({ status: 'invalid', code: 'INVALID_BROWSER_CATEGORY' });
  return Object.freeze({ status: 'valid', category: value, authored: true });
}
