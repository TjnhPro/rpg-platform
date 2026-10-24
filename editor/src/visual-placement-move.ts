import { createSceneIdentity, type SceneIdentity } from './scene-definition.js';
import { getSceneObject } from './scene-membership.js';
import { updateSceneObjectSpatialPlacement } from './scene-spatial-placement.js';
import { validateVisualSceneDocument } from './visual-document-edit.js';
import { replaceSceneDocumentObject } from './document-scene-edit.js';
import { mapDocumentContext } from './map-profile.js';
import { resolveVisualPlacementPosition, type VisualPlacementPosition } from './visual-placement-position.js';
import type { DocumentEnvelope } from './document-envelope.js';
import type { AssetCatalog } from './asset-catalog.js';

/** Current canonical object; terrain entries remain owned by the Map tool. */
export function requireVisualPlacementObject(document: DocumentEnvelope, catalog: AssetCatalog, sceneInput: SceneIdentity, objectId: string) {
  const source = validateVisualSceneDocument(document, catalog), scene = createSceneIdentity(sceneInput);
  if (scene.projectId !== source.identity.projectId || scene.sceneId !== source.identity.sceneId) throw new TypeError('PLACEMENT_SCENE_MISMATCH');
  const object = getSceneObject(source.membership, objectId);
  if (!object) throw new TypeError('PLACEMENT_OBJECT_MISSING');
  if (object.definition.classification?.startsWith('editor-map:')
    || source.profile.layers.find(layer => layer.layerKey === object.layerKey)?.role !== 'objects') throw new TypeError('PLACEMENT_OBJECT_OWNER');
  return { source, object };
}

/** Pure metadata-preserving candidate; session guards/adoption belong to VP10. */
export function moveVisualObject(document: DocumentEnvelope, catalog: AssetCatalog, scene: SceneIdentity,
  objectId: string, position: VisualPlacementPosition): DocumentEnvelope {
  const { source } = requireVisualPlacementObject(document, catalog, scene, objectId);
  const point = resolveVisualPlacementPosition(source.document, catalog, position);
  const membership = updateSceneObjectSpatialPlacement(source.membership, objectId, source.profile.space, point);
  const candidate = replaceSceneDocumentObject(source.document, objectId, getSceneObject(membership, objectId)!, mapDocumentContext(source.document, catalog));
  return validateVisualSceneDocument(candidate, catalog).document;
}
