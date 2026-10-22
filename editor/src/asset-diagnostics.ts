import { getAssetDefinition, resolveAssetReference, type AssetCatalog, type AssetReferenceResolution } from './asset-catalog.js';
import { createAssetDefinition, type AssetDefinition, type AssetDefinitionInput } from './asset-definition.js';
import { type AssetReference, type AssetReferenceInput } from './asset-reference.js';
import { AssetValidationError, type AssetValidationCode } from './asset-validation.js';

export type AssetDiagnosticCode = AssetValidationCode
  | 'PROJECT_MISMATCH' | 'TARGET_NOT_FOUND' | 'KIND_MISMATCH' | 'SUBRESOURCE_NOT_SUPPORTED';

/** Supplied key hints for invalid data; null means an own string value was unavailable. */
export interface AssetDiagnosticTarget {
  readonly projectId: string | null;
  readonly assetId: string | null;
}

/** Portable data only. path uses reference/definition roots, dots and array indices. */
export interface AssetDiagnostic {
  readonly code: AssetDiagnosticCode;
  readonly target: AssetDiagnosticTarget;
  readonly path: string;
  readonly details: Readonly<Record<string, string | number | boolean | null>>;
}

export type AssetReferenceDiagnosticResult = { readonly fileExistence: 'NOT_CHECKED' } & (
  | { readonly status: 'resolved'; readonly reference: AssetReference;
      readonly definition: AssetDefinition; readonly diagnostic: null }
  | { readonly status: 'unresolved'; readonly reference: AssetReference; readonly diagnostic: AssetDiagnostic }
  | { readonly status: 'invalid'; readonly reference: null; readonly diagnostic: AssetDiagnostic }
);

export type AssetDefinitionDiagnosticResult = { readonly fileExistence: 'NOT_CHECKED' } & (
  | { readonly status: 'valid'; readonly definition: AssetDefinition; readonly diagnostic: null }
  | { readonly status: 'invalid'; readonly definition: null; readonly diagnostic: AssetDiagnostic }
);

// Read hints without invoking accessors or retaining arbitrary input objects.
function ownValue(input: unknown, key: string): unknown {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) return undefined;
  const descriptor = Object.getOwnPropertyDescriptor(input, key);
  return descriptor && 'value' in descriptor ? descriptor.value : undefined;
}

function targetHint(input: unknown): AssetDiagnosticTarget {
  const projectId = ownValue(input, 'projectId');
  const assetId = ownValue(input, 'assetId');
  return Object.freeze({ projectId: typeof projectId === 'string' ? projectId : null,
    assetId: typeof assetId === 'string' ? assetId : null });
}

function diagnostic(code: AssetDiagnosticCode, target: AssetDiagnosticTarget, path: string,
  details: AssetDiagnostic['details']): AssetDiagnostic {
  return Object.freeze({ code, target: Object.freeze({ projectId: target.projectId, assetId: target.assetId }), path,
    details: Object.freeze({ ...details }) });
}

function invalidDiagnostic(error: AssetValidationError, root: string, target: AssetDiagnosticTarget): AssetDiagnostic {
  return diagnostic(error.code, target, error.path ? `${root}.${error.path}` : root,
    { constraint: error.rule });
}

/**
 * One deterministic first diagnostic; reuses the v0.2.5 resolver and its priority.
 * Catalog must be a factory snapshot. Unknown host exceptions still propagate.
 * No file probe, reference rewrite, resource error classification or graph traversal.
 */
export function diagnoseAssetReference(catalog: AssetCatalog, input: unknown): AssetReferenceDiagnosticResult {
  let result: AssetReferenceResolution;
  try { result = resolveAssetReference(catalog, input as AssetReferenceInput); }
  catch (error) {
    // Unrecognized host/getter/Proxy/runtime exceptions are not authored-data errors.
    if (!(error instanceof AssetValidationError)) throw error;
    return Object.freeze({ status: 'invalid', reference: null, fileExistence: 'NOT_CHECKED',
      diagnostic: invalidDiagnostic(error, 'reference', targetHint(input)) });
  }
  if (result.status === 'resolved') {
    return Object.freeze({ ...result, diagnostic: null, fileExistence: 'NOT_CHECKED' });
  }
  const { reference, reason } = result;
  let path: string;
  let details: AssetDiagnostic['details'];
  switch (reason) {
    case 'PROJECT_MISMATCH':
      path = 'reference.projectId';
      details = { expectedProjectId: catalog.projectId, actualProjectId: reference.projectId };
      break;
    case 'TARGET_NOT_FOUND':
      path = 'reference.assetId';
      details = { lookupScope: 'SUPPLIED_PROJECT_CATALOG' };
      break;
    case 'KIND_MISMATCH': {
      // The resolver established that this exact target exists; no new resolution policy.
      const target = getAssetDefinition(catalog, reference.assetId)!;
      path = 'reference.expectedKind';
      details = { expectedKind: reference.expectedKind, actualKind: target.kind };
      break;
    }
    case 'SUBRESOURCE_NOT_SUPPORTED':
      path = 'reference.subresourceId';
      details = { subresourceId: reference.subresourceId, verification: 'UNSUPPORTED' };
      break;
  }
  return Object.freeze({ status: 'unresolved', reference, fileExistence: 'NOT_CHECKED',
    diagnostic: diagnostic(reason, reference, path, details) });
}

/** Validate a single authored descriptor through its existing factory, without catalog/IO. */
export function diagnoseAssetDefinition(input: unknown): AssetDefinitionDiagnosticResult {
  try {
    const definition = createAssetDefinition(input as AssetDefinitionInput);
    return Object.freeze({ status: 'valid', definition, diagnostic: null, fileExistence: 'NOT_CHECKED' });
  } catch (error) {
    if (!(error instanceof AssetValidationError)) throw error;
    return Object.freeze({ status: 'invalid', definition: null, fileExistence: 'NOT_CHECKED',
      diagnostic: invalidDiagnostic(error, 'definition', targetHint(ownValue(input, 'identity'))) });
  }
}
