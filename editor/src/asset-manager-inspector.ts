import type { AssetDefinition } from './asset-definition.js';
import type { AssetReference, AssetReferenceInput } from './asset-reference.js';
import { diagnoseAssetDefinition, diagnoseAssetReference, type AssetDiagnostic } from './asset-diagnostics.js';
import { describeAssetBrowserCategory, type AssetBrowserCategoryResult } from './asset-manager-category.js';
import { requireAssetManagerProject, type AssetManagerProject } from './asset-manager-project.js';

export type AssetInspectorResult = { readonly projectId: string; readonly fileExistence: 'NOT_CHECKED' } & (
  | { readonly status: 'not-selected' }
  | { readonly status: 'invalid-reference' | 'removed' | 'foreign-project' | 'unresolved'; readonly diagnostic: AssetDiagnostic }
  | { readonly status: 'resolved' | 'invalid-metadata'; readonly reference: AssetReference;
      readonly definition: AssetDefinition; readonly category: AssetBrowserCategoryResult;
      readonly diagnostics: readonly AssetDiagnostic[] }
);
/** Portable projection from the current catalog, never a stale selected definition. */
export function inspectManagedAsset(context: AssetManagerProject, input: AssetReferenceInput | null): AssetInspectorResult {
  const { snapshot } = requireAssetManagerProject(context);
  const base = { projectId: snapshot.projectId, fileExistence: 'NOT_CHECKED' as const };
  if (input === null) return Object.freeze({ ...base, status: 'not-selected' });
  const resolution = diagnoseAssetReference(snapshot.catalog, input);
  if (resolution.status === 'invalid')
    return Object.freeze({ ...base, status: 'invalid-reference', diagnostic: resolution.diagnostic });
  if (resolution.status === 'unresolved') {
    const status = resolution.diagnostic.code === 'TARGET_NOT_FOUND' ? 'removed'
      : resolution.diagnostic.code === 'PROJECT_MISMATCH' ? 'foreign-project' : 'unresolved';
    return Object.freeze({ ...base, status, diagnostic: resolution.diagnostic });
  }
  const definition = resolution.definition;
  const diagnosis = diagnoseAssetDefinition(definition);
  const diagnostics: AssetDiagnostic[] = [];
  if (diagnosis.status === 'invalid') diagnostics.push(diagnosis.diagnostic);
  for (const dependency of definition.dependencies) {
    const result = diagnoseAssetReference(snapshot.catalog, dependency);
    if (result.status !== 'resolved') diagnostics.push(result.diagnostic);
  }
  const category = describeAssetBrowserCategory(definition);
  return Object.freeze({ ...base, status: category.status === 'invalid' || diagnosis.status === 'invalid'
    ? 'invalid-metadata' : 'resolved', reference: resolution.reference, definition, category,
    diagnostics: Object.freeze(diagnostics) });
}
