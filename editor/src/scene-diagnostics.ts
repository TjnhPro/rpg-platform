import { createSceneMembership, type SceneMembership, type SceneMembershipInput } from './scene-membership.js';
import { diagnoseAssetReference, type AssetDiagnosticCode } from './asset-diagnostics.js';
import { type AssetCatalog } from './asset-catalog.js';
import { SceneValidationError, type SceneValidationCode } from './scene-validation.js';

export type SceneDiagnosticCode = SceneValidationCode | AssetDiagnosticCode | 'OBJECT_TARGET_NOT_FOUND';

/** Source membership and supplied target hints; unavailable own string values are null. */
export interface SceneDiagnosticTarget {
  readonly projectId: string | null;
  readonly sceneId: string | null;
  readonly objectId: string | null;
  readonly assetId: string | null;
  readonly relatedObjectId: string | null;
}

/** Portable frozen data. Paths start at membership, followed by dots/array indices. */
export interface SceneDiagnostic {
  readonly code: SceneDiagnosticCode;
  readonly target: SceneDiagnosticTarget;
  readonly path: string;
  readonly details: Readonly<Record<string, string | number | boolean | null>>;
}

export type SceneMembershipDiagnosticResult = { readonly fileExistence: 'NOT_CHECKED' } & (
  | { readonly status: 'invalid'; readonly membership: null;
      readonly assetReferences: 'NOT_CHECKED'; readonly diagnostics: readonly SceneDiagnostic[] }
  | { readonly status: 'valid' | 'unresolved'; readonly membership: SceneMembership;
      readonly assetReferences: 'CHECKED' | 'NOT_CHECKED'; readonly diagnostics: readonly SceneDiagnostic[] }
);

// Do not invoke accessors again when constructing hints after a known failure.
function ownValue(input: unknown, key: string): unknown {
  if (typeof input !== 'object' || input === null) return undefined;
  const descriptor = Object.getOwnPropertyDescriptor(input, key);
  return descriptor && 'value' in descriptor ? descriptor.value : undefined;
}

function stringValue(input: unknown, key: string): string | null {
  const value = ownValue(input, key);
  return typeof value === 'string' ? value : null;
}

function targetHint(input: unknown, index: string | undefined): SceneDiagnosticTarget {
  const identity = ownValue(ownValue(input, 'scene'), 'identity');
  const entry = index === undefined ? undefined : ownValue(ownValue(input, 'objects'), index);
  return Object.freeze({ projectId: stringValue(identity, 'projectId'), sceneId: stringValue(identity, 'sceneId'),
    objectId: stringValue(ownValue(entry, 'definition'), 'objectId'),
    assetId: stringValue(ownValue(entry, 'assetReference'), 'assetId'),
    relatedObjectId: stringValue(ownValue(ownValue(entry, 'attachment'), 'target'), 'objectId') });
}

function diagnostic(code: SceneDiagnosticCode, target: SceneDiagnosticTarget, path: string,
  details: SceneDiagnostic['details']): SceneDiagnostic {
  return Object.freeze({ code, target: Object.freeze({ ...target }), path, details: Object.freeze({ ...details }) });
}

/**
 * Canonical capture first: one deterministic structural error, never guessed from
 * TypeError messages. Then assess every declared local attachment and, only with
 * a caller-supplied factory catalog, each Asset reference via Phase 2 diagnostics.
 * Order is membership order, attachment before Asset. No repair, IO or hierarchy
 * policy. Unknown host errors propagate. Valid does not mean unchecked Assets exist.
 */
export function diagnoseSceneMembership(input: unknown, catalog?: AssetCatalog): SceneMembershipDiagnosticResult {
  let membership: SceneMembership;
  try { membership = createSceneMembership(input as SceneMembershipInput); }
  catch (error) {
    if (!(error instanceof SceneValidationError)) throw error;
    const index = /^objects\[(\d+)\]/u.exec(error.path)?.[1];
    return Object.freeze({ status: 'invalid', membership: null, assetReferences: 'NOT_CHECKED',
      fileExistence: 'NOT_CHECKED', diagnostics: Object.freeze([
        diagnostic(error.code, targetHint(input, index), error.path ? `membership.${error.path}` : 'membership',
          { constraint: error.rule }),
      ]) });
  }
  const diagnostics: SceneDiagnostic[] = [];
  const ids = new Set(membership.objects.map(entry => entry.definition.objectId));
  for (const [index, entry] of membership.objects.entries()) {
    const path = `membership.objects[${index}]`;
    const target: SceneDiagnosticTarget = { ...membership.scene.identity, objectId: entry.definition.objectId,
      assetId: entry.assetReference?.assetId ?? null, relatedObjectId: entry.attachment?.target.objectId ?? null };
    if (entry.attachment && !ids.has(entry.attachment.target.objectId)) {
      diagnostics.push(diagnostic('OBJECT_TARGET_NOT_FOUND', target, `${path}.attachment.target.objectId`,
        { lookupScope: 'SUPPLIED_SCENE_MEMBERSHIP' }));
    }
    if (catalog !== undefined && entry.assetReference !== null) {
      const result = diagnoseAssetReference(catalog, entry.assetReference);
      if (result.diagnostic !== null) {
        diagnostics.push(diagnostic(result.diagnostic.code, target,
          `${path}.assetReference${result.diagnostic.path.slice('reference'.length)}`, result.diagnostic.details));
      }
    }
  }
  return Object.freeze({ status: diagnostics.length === 0 ? 'valid' : 'unresolved', membership,
    assetReferences: catalog === undefined ? 'NOT_CHECKED' : 'CHECKED', fileExistence: 'NOT_CHECKED',
    diagnostics: Object.freeze(diagnostics) });
}
