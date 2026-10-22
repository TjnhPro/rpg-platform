import { createSceneMembership, getSceneObject, type SceneMembership, type SceneObjectPlacement } from './scene-membership.js';
import { resolveAssetReference, type AssetCatalog } from './asset-catalog.js';
import { describeResolvedVisualAsset, type AssetVisualDescription } from './asset-visual.js';

/**
 * Caller-retained correlation/placement, not a Render handle or instance. Only
 * the described resource descriptor crosses the existing Render boundary today.
 */
export type SceneObjectVisualDescription = {
  readonly correlation: { readonly projectId: string; readonly sceneId: string; readonly objectId: string };
  readonly placement: SceneObjectPlacement | null;
} & (AssetVisualDescription | { readonly status: 'unsupported'; readonly reason: 'NO_ASSET_REFERENCE' });

/**
 * Describe one object from a factory membership/catalog. Reuse canonical capture,
 * Phase 2 resolution and image projection. Media hint is explicit per call, never
 * inferred. Missing object throws TypeError; unsupported visuals retain correlation.
 * Placement omission projects to null without injecting coordinates. Labels, layers,
 * attachments, UI and gameplay data are not interpreted or forwarded to Render.
 * No IO, resource loading, instance allocation, session access or frame submission.
 */
export function describeSceneObjectVisual(
  membership: SceneMembership, objectId: string, catalog: AssetCatalog, mediaType: string | null = null,
): SceneObjectVisualDescription {
  const entry = getSceneObject(membership, objectId);
  if (entry === undefined) throw new TypeError('Cannot describe a missing Scene objectId');
  const captured = createSceneMembership({ scene: membership.scene, objects: [entry] });
  const object = captured.objects[0]!;
  const correlation = Object.freeze({ ...captured.scene.identity, objectId: object.definition.objectId });
  const description: AssetVisualDescription | { readonly status: 'unsupported'; readonly reason: 'NO_ASSET_REFERENCE' }
    = object.assetReference === null ? { status: 'unsupported', reason: 'NO_ASSET_REFERENCE' }
      : describeResolvedVisualAsset(resolveAssetReference(catalog, object.assetReference), mediaType);
  return Object.freeze({ correlation, placement: object.placement ?? null, ...description });
}
