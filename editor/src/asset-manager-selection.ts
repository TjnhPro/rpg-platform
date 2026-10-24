import { createAssetReference, type AssetReference, type AssetReferenceInput } from './asset-reference.js';
import { resolveAssetReference } from './asset-catalog.js';
import { requireAssetManagerProject, type AssetManagerProject } from './asset-manager-project.js';

export type AssetSelectionResult = { readonly projectId: string; readonly generation: number } & (
  | { readonly status: 'resolved'; readonly reference: AssetReference }
  | { readonly status: 'not-selected' | 'not-found' | 'wrong-project' | 'kind-mismatch' | 'subresource-unsupported';
      readonly reference: null }
);
const selections = new WeakMap<AssetManagerProject, AssetReference>();
/** No cached resolution or definition; every read revalidates the current context/catalog. */
export function getManagedAssetSelection(context: AssetManagerProject): AssetSelectionResult {
  const { snapshot } = requireAssetManagerProject(context);
  const base = { projectId: snapshot.projectId, generation: snapshot.generation };
  const selected = selections.get(context);
  if (!selected) return Object.freeze({ ...base, status: 'not-selected', reference: null });
  const result = resolveAssetReference(snapshot.catalog, selected);
  if (result.status === 'resolved') return Object.freeze({ ...base, status: 'resolved', reference: result.reference });
  const statuses = { PROJECT_MISMATCH: 'wrong-project', TARGET_NOT_FOUND: 'not-found',
    KIND_MISMATCH: 'kind-mismatch', SUBRESOURCE_NOT_SUPPORTED: 'subresource-unsupported' } as const;
  return Object.freeze({ ...base, status: statuses[result.reason], reference: null });
}
/** Replaces prior intent atomically; malformed input clears prior selection then throws. */
export function selectManagedAsset(context: AssetManagerProject, input: AssetReferenceInput | null): AssetSelectionResult {
  requireAssetManagerProject(context);
  selections.delete(context);
  if (input !== null) selections.set(context, createAssetReference(input));
  return getManagedAssetSelection(context);
}
