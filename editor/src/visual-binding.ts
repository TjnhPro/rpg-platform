import { createAssetReference, type AssetReferenceInput } from './asset-reference.js';
import { createAssetCatalog, resolveAssetReference, type AssetCatalog } from './asset-catalog.js';
import { describeResolvedVisualAsset } from './asset-visual.js';
import { describeSceneObjectVisual, type SceneObjectVisualDescription } from './scene-visual.js';
import { getSceneObject, replaceSceneObject, type SceneMembership } from './scene-membership.js';

/** Resolution diagnostics remain canonical; no IO/existence claim. */
export function readVisualBinding(membership: SceneMembership, objectId: string, catalog: AssetCatalog): SceneObjectVisualDescription {
  if (catalog.projectId !== membership.scene.identity.projectId) throw new TypeError('Binding catalog project mismatch');
  return describeSceneObjectVisual(membership, objectId, createAssetCatalog(catalog));
}

/** Explicit null clears only reference. Validate exact target/kind and public descriptor. */
export function setVisualBinding(membership: SceneMembership, objectId: string, catalog: AssetCatalog,
  input: AssetReferenceInput | null): SceneMembership {
  if (catalog.projectId !== membership.scene.identity.projectId) throw new TypeError('Binding catalog project mismatch');
  const object = getSceneObject(membership, objectId);
  if (!object) throw new TypeError('Binding object missing');
  const assets = createAssetCatalog(catalog);
  const reference = input === null ? null : createAssetReference(input);
  if (reference) {
    const resolution = resolveAssetReference(assets, reference);
    if (resolution.status !== 'resolved') throw new TypeError(`Visual binding:${resolution.reason}`);
    const visual = describeResolvedVisualAsset(resolution);
    if (visual.status !== 'described') throw new TypeError(`UNSUPPORTED_VISUAL:${visual.reason}`);
  }
  return replaceSceneObject(membership, objectId, { ...object, assetReference: reference });
}
