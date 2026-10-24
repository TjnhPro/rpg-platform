import type { RenderVisualSpriteLayout } from '@rpg-platform/runtime-render';
import { createAssetReference, type AssetReference } from './asset-reference.js';
import { addSceneObject, replaceSceneObject, removeSceneObject, createSceneMembership } from './scene-membership.js';
import { requireMapProfile, requireMapImage } from './map-profile.js';
import { mapMembershipCandidate } from './map-edit.js';
import type { DocumentEnvelope } from './document-envelope.js';
import type { AssetCatalog } from './asset-catalog.js';

/** Caller supplies a new object ID only when absent; replacements retain identity. */
export function setMapBackground(document: DocumentEnvelope, input: { readonly objectId: string; readonly layerKey: string;
  readonly reference: AssetReference }, catalog: AssetCatalog): DocumentEnvelope {
  const source = requireMapProfile(document, catalog), reference = createAssetReference(input.reference);
  requireMapImage(catalog, reference, source.identity.projectId);
  if (source.profile.layers.find(layer => layer.layerKey === input.layerKey)?.role !== 'background') throw new TypeError('MAP_LAYER_ROLE_MISMATCH');
  const existing = source.membership.objects.find(entry => entry.definition.classification === 'editor-map:background');
  if (existing && existing.definition.objectId !== input.objectId) throw new TypeError('BACKGROUND_ID_MUST_REMAIN_STABLE');
  const entry = createSceneMembership({ scene: source.membership.scene, objects: [{
    ...(existing ?? {}), definition: existing?.definition ?? { objectId: input.objectId, classification: 'editor-map:background' },
    assetReference: reference, layerKey: input.layerKey,
    placement: { coordinateSpaceId: source.profile.space.reference.coordinateSpaceId, point: source.profile.grid.origin }
  }] }).objects[0]!;
  return mapMembershipCandidate(source, existing ? replaceSceneObject(source.membership, input.objectId, entry)
    : addSceneObject(source.membership, entry), catalog);
}
export function clearMapBackground(document: DocumentEnvelope, catalog: AssetCatalog): DocumentEnvelope {
  const source = requireMapProfile(document, catalog);
  const existing = source.membership.objects.find(entry => entry.definition.classification === 'editor-map:background');
  return existing ? mapMembershipCandidate(source, removeSceneObject(source.membership, existing.definition.objectId), catalog) : source.document;
}
/** Explicit world extent independent of texture pixel dimensions; placement is grid origin. */
export function describeMapBackgroundLayout(document: DocumentEnvelope, catalog?: AssetCatalog): RenderVisualSpriteLayout {
  const { profile } = requireMapProfile(document, catalog);
  const width = profile.extentCells.width * profile.grid.cellSize.width, height = profile.extentCells.height * profile.grid.cellSize.height;
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) throw new TypeError('MAP_LAYOUT_EXTENT');
  return Object.freeze({ unit: profile.space.unit, width, height,
    x: profile.grid.indexing.columnDirection === 'negative-x' ? -width : 0,
    y: profile.grid.indexing.rowDirection === 'negative-y' ? -height : 0 });
}
