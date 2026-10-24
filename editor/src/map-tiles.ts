import { addSceneObject, replaceSceneObject, removeSceneObject, createSceneMembership, type SceneObjectMembership } from './scene-membership.js';
import { createSceneIdentity, type SceneIdentity } from './scene-definition.js';
import { createAssetReference, type AssetReference } from './asset-reference.js';
import { requireMapProfile, requireMapImage, type MapProfileSnapshot } from './map-profile.js';
import { mapCellPlacement, mapCanonicalCell } from './map-grid.js';
import { mapMembershipCandidate } from './map-edit.js';
import type { MapCell } from './map-bounds.js';
import type { DocumentEnvelope } from './document-envelope.js';
import type { AssetCatalog } from './asset-catalog.js';

function target(source: MapProfileSnapshot, sceneInput: SceneIdentity, layerKey: string, cell: MapCell): SceneObjectMembership | undefined {
  const scene = createSceneIdentity(sceneInput);
  if (scene.projectId !== source.identity.projectId || scene.sceneId !== source.identity.sceneId) throw new TypeError('STALE_MAP_SCENE');
  if (source.profile.layers.find(layer => layer.layerKey === layerKey)?.role !== 'tiles') throw new TypeError('MAP_LAYER_ROLE_MISMATCH');
  mapCellPlacement(source, cell);
  return source.membership.objects.find(entry => {
    if (entry.definition.classification !== 'editor-map:tile' || entry.layerKey !== layerKey) return false;
    const at = mapCanonicalCell(source, { space: { projectId: source.identity.projectId, coordinateSpaceId: entry.placement!.coordinateSpaceId }, point: entry.placement!.point });
    return at.row === cell.row && at.column === cell.column;
  });
}
export function setMapTile(document: DocumentEnvelope, input: { readonly scene: SceneIdentity; readonly layerKey: string;
  readonly cell: MapCell; readonly newObjectId: string; readonly reference: AssetReference }, catalog: AssetCatalog): DocumentEnvelope {
  const source = requireMapProfile(document, catalog), existing = target(source, input.scene, input.layerKey, input.cell);
  const reference = createAssetReference(input.reference); requireMapImage(catalog, reference, source.identity.projectId);
  const entry = createSceneMembership({ scene: source.membership.scene, objects: [{
    ...(existing ?? {}), definition: existing?.definition ?? { objectId: input.newObjectId, classification: 'editor-map:tile' },
    assetReference: reference, layerKey: input.layerKey, placement: mapCellPlacement(source, input.cell)
  }] }).objects[0]!;
  return mapMembershipCandidate(source, existing ? replaceSceneObject(source.membership, existing.definition.objectId, entry)
    : addSceneObject(source.membership, entry), catalog);
}
export function removeMapTile(document: DocumentEnvelope, input: { readonly scene: SceneIdentity; readonly layerKey: string; readonly cell: MapCell }, catalog: AssetCatalog): DocumentEnvelope {
  const source = requireMapProfile(document, catalog), existing = target(source, input.scene, input.layerKey, input.cell);
  return existing ? mapMembershipCandidate(source, removeSceneObject(source.membership, existing.definition.objectId), catalog) : source.document;
}
