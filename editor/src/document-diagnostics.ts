import { deserializeDocument, type DocumentDecodeDiagnostic } from './document-codec.js';
import type { DocumentEnvelope } from './document-envelope.js';
import { diagnoseSceneMembership, type SceneDiagnosticCode } from './scene-diagnostics.js';
import { diagnoseAssetReference, type AssetDiagnosticCode } from './asset-diagnostics.js';
import type { AssetCatalog } from './asset-catalog.js';
import { readAssetDefinitionSnapshot } from './asset-snapshot.js';
import { detachPortableAssetData } from './asset-definition.js';
import { AssetValidationError } from './asset-validation.js';
import { createCoordinateSpaceDefinition, type CoordinateSpaceDefinition,
  type CoordinateSpaceReference } from './coordinate-space.js';
import { describeSceneObjectSpatialPoint } from './scene-spatial-point.js';
import { matchesSceneDocumentProfile } from './document-scene-profile.js';
import { diagnoseProjectManifest } from './project-diagnostics.js';

export type DocumentDiagnosticCode = DocumentDecodeDiagnostic['code'] | SceneDiagnosticCode | AssetDiagnosticCode
  | 'CONTENT_NOT_CHECKED' | 'CONTENT_CONTRACT_MISMATCH' | 'DOCUMENT_PROJECT_MISMATCH'
  | 'ASSET_REFERENCES_NOT_CHECKED' | 'SPATIAL_REFERENCES_NOT_CHECKED'
  | 'SPACE_TARGET_NOT_FOUND' | 'INVALID_SPATIAL_SPACE' | 'INVALID_TEXT_CONTENT' | 'UNSUPPORTED_CONTENT_PROFILE';

/** Safe portable context only; paths start at document, never a backend handle. */
export interface DocumentDiagnostic {
  readonly group: 'envelope' | 'schema' | 'payload' | 'reference' | 'spatial' | 'context';
  readonly code: DocumentDiagnosticCode;
  readonly severity: 'error' | 'warning';
  readonly path: string;
  readonly reference: Readonly<Record<string, string | null>>;
  readonly details: Readonly<Record<string, string | number | boolean | null>>;
}

/**
 * Trusted host binding, selected explicitly for this kind AND content version.
 * No universal kind names, global registry, auto-discovery or migration.
 * Catalog must be an existing factory snapshot. Resolver is synchronous, explicit
 * and authored-data-only; it must not do IO. Its exceptions propagate unchanged.
 */
export type DocumentValidationContext = {
  readonly documentKind: string;
  readonly contentSchemaVersion: number | null;
} & (
  | { readonly owner: 'scene'; readonly catalog?: AssetCatalog;
      readonly resolveCoordinateSpace?: (reference: CoordinateSpaceReference) => CoordinateSpaceDefinition | undefined }
  | { readonly owner: 'asset'; readonly catalog?: AssetCatalog }
  | { readonly owner: 'coordinate-space' }
  | { readonly owner: 'text' }
  | { readonly owner: 'project' }
);

export interface DocumentValidationResult {
  readonly status: 'valid' | 'invalid' | 'unresolved' | 'not-checked';
  /** Original decoded capture, NEVER an owner factory projection or repair. */
  readonly document: DocumentEnvelope | null;
  readonly diagnostics: readonly DocumentDiagnostic[];
  readonly checks: {
    readonly content: 'CHECKED' | 'NOT_CHECKED';
    readonly assetReferences: 'CHECKED' | 'NOT_CHECKED' | 'NOT_APPLICABLE';
    readonly spatialReferences: 'CHECKED' | 'NOT_CHECKED' | 'NOT_APPLICABLE';
    readonly fileExistence: 'NOT_CHECKED';
  };
  /** Advisory admission only; does not open/adopt a session or grant writes. */
  readonly readEligibility: { readonly inspect: boolean; readonly strict: boolean };
  readonly writeEligibility: 'NOT_ESTABLISHED';
}

function diagnostic(group: DocumentDiagnostic['group'], code: DocumentDiagnosticCode,
  path: string, reference: DocumentDiagnostic['reference'] = {},
  details: DocumentDiagnostic['details'] = {}, severity: DocumentDiagnostic['severity'] = 'error'): DocumentDiagnostic {
  return Object.freeze({ group, code, severity, path,
    reference: Object.freeze({ ...reference }), details: Object.freeze({ ...details }) });
}

// Display hints only, from already decoded portable data; not space validation.
function spaceHint(value: unknown): DocumentDiagnostic['reference'] {
  if (typeof value !== 'object' || value === null || !('reference' in value)) return {};
  const reference = value.reference;
  if (typeof reference !== 'object' || reference === null) return {};
  return {
    projectId: 'projectId' in reference && typeof reference.projectId === 'string' ? reference.projectId : null,
    coordinateSpaceId: 'coordinateSpaceId' in reference && typeof reference.coordinateSpaceId === 'string'
      ? reference.coordinateSpaceId : null,
  };
}

/**
 * Bounded JSON decode -> explicit binding -> canonical content owner -> references.
 * Structural owners retain first-error policy; all checkable references follow
 * their declaration order. Scene diagnostics precede its spatial pass. Missing
 * context produces warnings, never invented missing physical files. Diagnostic
 * reads retain every decoded source field, invalid reference and unknown extension.
 * Scene strict admission requires a complete owner snapshot plus only the declared
 * opaque metadata slots; unknown structural fields/default-normalized input remain
 * inspect-only. Asset snapshot and coordinate-space owners retain their own policy.
 * Inspect allows any decoded portable envelope; strict requires status valid.
 * Neither policy establishes save preconditions, storage evidence or write safety.
 */
export function diagnoseDocument(text: string, context?: DocumentValidationContext): DocumentValidationResult {
  const decoded = deserializeDocument(text);
  const diagnostics: DocumentDiagnostic[] = [];
  let content: DocumentValidationResult['checks']['content'] = 'NOT_CHECKED';
  let assets: DocumentValidationResult['checks']['assetReferences'] = 'NOT_CHECKED';
  let spaces: DocumentValidationResult['checks']['spatialReferences'] = 'NOT_CHECKED';
  const document = decoded.status === 'decoded' ? decoded.document : null;
  function finish(): DocumentValidationResult {
    const errors = diagnostics.filter(item => item.severity === 'error');
    const status = errors.some(item => item.group !== 'reference') ? 'invalid'
      : errors.length !== 0 ? 'unresolved'
      : diagnostics.length !== 0 ? 'not-checked' : 'valid';
    return Object.freeze({ status, document, diagnostics: Object.freeze(diagnostics),
      checks: Object.freeze({ content, assetReferences: assets, spatialReferences: spaces, fileExistence: 'NOT_CHECKED' }),
      readEligibility: Object.freeze({ inspect: document !== null, strict: status === 'valid' }),
      writeEligibility: 'NOT_ESTABLISHED' });
  }
  if (decoded.status === 'rejected') {
    diagnostics.push(diagnostic(decoded.diagnostic.code === 'UNSUPPORTED_SCHEMA' ? 'schema' : 'envelope',
      decoded.diagnostic.code, decoded.diagnostic.code === 'UNSUPPORTED_SCHEMA' ? 'document.schemaVersion' : 'document'));
    return finish();
  }
  // document is non-null after successful canonical decode.
  const source = decoded.document;
  if (context === undefined) {
    diagnostics.push(diagnostic('context', 'CONTENT_NOT_CHECKED', 'document.content', {}, {}, 'warning'));
    return finish();
  }
  const { owner, documentKind, contentSchemaVersion } = context;
  if (!['scene', 'asset', 'coordinate-space', 'text', 'project'].includes(owner)
    || typeof documentKind !== 'string' || documentKind.length === 0 || /\s/u.test(documentKind)
    || (contentSchemaVersion !== null && (!Number.isSafeInteger(contentSchemaVersion) || contentSchemaVersion < 1))) {
    throw new TypeError('Document validation requires a supported explicit host binding');
  }
  if (source.documentKind !== documentKind || source.contentSchemaVersion !== contentSchemaVersion) {
    diagnostics.push(diagnostic('schema', 'CONTENT_CONTRACT_MISMATCH',
      source.documentKind !== documentKind ? 'document.documentKind' : 'document.contentSchemaVersion',
      {}, { expectedKind: documentKind, expectedContentSchemaVersion: contentSchemaVersion }));
    return finish();
  }
  function project(actualProjectId: string, path: string): void {
    if (actualProjectId !== source.identity.projectId) diagnostics.push(diagnostic('payload',
      'DOCUMENT_PROJECT_MISMATCH', path, { projectId: actualProjectId },
      { expectedProjectId: source.identity.projectId }));
  }
  function unchecked(code: 'ASSET_REFERENCES_NOT_CHECKED' | 'SPATIAL_REFERENCES_NOT_CHECKED', path: string): void {
    diagnostics.push(diagnostic('context', code, path, {}, {}, 'warning'));
  }
  assets = spaces = 'NOT_APPLICABLE';
  if (context.owner === 'scene') {
    const result = diagnoseSceneMembership(source.content, context.catalog);
    content = 'CHECKED';
    if (result.membership !== null) {
      project(result.membership.scene.identity.projectId, 'document.content.scene.identity.projectId');
      if (!matchesSceneDocumentProfile(source.content, result.membership)) {
        diagnostics.push(diagnostic('schema', 'UNSUPPORTED_CONTENT_PROFILE', 'document.content'));
      }
    }
    for (const item of result.diagnostics) {
      diagnostics.push(diagnostic(result.status === 'invalid' ? 'payload' : 'reference', item.code,
        'document.content' + item.path.slice('membership'.length), { ...item.target }, item.details));
    }
    if (result.membership === null) {
      assets = spaces = 'NOT_CHECKED';
      return finish();
    }
    const membership = result.membership;
    if (membership.objects.some(entry => entry.assetReference !== null)) {
      assets = context.catalog === undefined ? 'NOT_CHECKED' : 'CHECKED';
      if (assets === 'NOT_CHECKED') unchecked('ASSET_REFERENCES_NOT_CHECKED', 'document.content.objects');
    }
    for (const [index, entry] of membership.objects.entries()) {
      const placement = entry.placement;
      if (placement === undefined || placement === null) continue;
      const path = `document.content.objects[${index}].placement`;
      const reference = Object.freeze({ ...membership.scene.identity,
        objectId: entry.definition.objectId, coordinateSpaceId: placement.coordinateSpaceId });
      if (context.resolveCoordinateSpace === undefined) {
        if (spaces !== 'NOT_CHECKED') unchecked('SPATIAL_REFERENCES_NOT_CHECKED', 'document.content.objects');
        spaces = 'NOT_CHECKED';
        continue;
      }
      spaces = 'CHECKED';
      // Invoke host outside catches: unknown resolver exceptions are not authored errors.
      const supplied = context.resolveCoordinateSpace(Object.freeze({
        projectId: reference.projectId, coordinateSpaceId: reference.coordinateSpaceId }));
      if (supplied === undefined) {
        diagnostics.push(diagnostic('reference', 'SPACE_TARGET_NOT_FOUND', path + '.coordinateSpaceId', reference));
        continue;
      }
      let portable: unknown;
      try { portable = detachPortableAssetData(supplied, 'space'); }
      catch (error) {
        if (!(error instanceof AssetValidationError)) throw error;
        diagnostics.push(diagnostic('spatial', 'INVALID_SPATIAL_SPACE', path, reference));
        continue;
      }
      // Captured plain data now has no accessors/host callbacks. Coarse TypeError
      // is the current spatial owner's contract; never parse its message.
      try { describeSceneObjectSpatialPoint(membership, entry.definition.objectId, portable as CoordinateSpaceDefinition); }
      catch (error) {
        if (!(error instanceof TypeError)) throw error;
        diagnostics.push(diagnostic('spatial', 'INVALID_SPATIAL_SPACE', path, reference));
      }
    }
  } else if (context.owner === 'asset') {
    content = 'CHECKED';
    let asset;
    try { asset = readAssetDefinitionSnapshot(source.content); }
    catch (error) {
      if (!(error instanceof AssetValidationError)) throw error;
      diagnostics.push(diagnostic(error.code === 'UNSUPPORTED_SCHEMA_VERSION' ? 'schema' : 'payload',
        error.code, 'document.content' + error.path.slice('snapshot'.length), {}, { constraint: error.rule }));
      assets = 'NOT_CHECKED';
      return finish();
    }
    project(asset.identity.projectId, 'document.content.identity.projectId');
    if (asset.dependencies.length !== 0) {
      assets = context.catalog === undefined ? 'NOT_CHECKED' : 'CHECKED';
      if (context.catalog === undefined) unchecked('ASSET_REFERENCES_NOT_CHECKED', 'document.content.dependencies');
      else for (const [index, reference] of asset.dependencies.entries()) {
        const result = diagnoseAssetReference(context.catalog, reference);
        if (result.diagnostic !== null) {
          const item = result.diagnostic;
          diagnostics.push(diagnostic('reference', item.code,
            `document.content.dependencies[${index}]` + item.path.slice('reference'.length),
            { ...item.target }, item.details));
        }
      }
    }
  } else if (context.owner === 'coordinate-space') {
    content = 'CHECKED';
    let space;
    try { space = createCoordinateSpaceDefinition(source.content as unknown as CoordinateSpaceDefinition); }
    catch (error) {
      if (!(error instanceof TypeError)) throw error;
      diagnostics.push(diagnostic('spatial', 'INVALID_SPATIAL_SPACE', 'document.content', spaceHint(source.content)));
      return finish();
    }
    project(space.reference.projectId, 'document.content.reference.projectId');
  } else if (context.owner === 'project') {
    content = 'CHECKED';
    if (documentKind !== 'project' || contentSchemaVersion !== 1) {
      diagnostics.push(diagnostic('schema', 'CONTENT_CONTRACT_MISMATCH', 'document.documentKind',
        {}, { expectedKind: 'project', expectedContentSchemaVersion: 1 }));
      return finish();
    }
    const result = diagnoseProjectManifest(source.content);
    for (const item of result.diagnostics) diagnostics.push(diagnostic('payload',
      'CONTENT_CONTRACT_MISMATCH', 'document.content' + item.path.slice('project'.length), {}, { projectCode: item.code }));
    if (result.manifest !== null) project(result.manifest.projectId, 'document.content.projectId');
  } else {
    content = 'CHECKED';
    if (typeof source.content !== 'string') {
      diagnostics.push(diagnostic('payload', 'INVALID_TEXT_CONTENT', 'document.content'));
    }
  }
  return finish();
}
