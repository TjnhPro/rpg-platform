import { requireMapProfile, validateMapLayerMembership, type MapLayerDefinition } from './map-profile.js';
import { getSceneObject, replaceSceneObject, type SceneMembership } from './scene-membership.js';
import type { DocumentEnvelope } from './document-envelope.js';
import type { AssetCatalog } from './asset-catalog.js';

export interface VisualLayerRead {
  readonly status: 'absent' | 'null' | 'assigned' | 'missing';
  readonly layerKey: string | null | undefined;
  readonly layers: readonly MapLayerDefinition[];
}
/** Real current Map layer set; no parallel registry or inferred default. */
export function readVisualLayer(document: DocumentEnvelope, objectId: string, catalog: AssetCatalog): VisualLayerRead {
  const map = requireMapProfile(document, catalog), object = getSceneObject(map.membership, objectId);
  if (!object) throw new TypeError('Visual layer object missing');
  const layerKey = object.layerKey;
  return Object.freeze({ status: !Object.hasOwn(object, 'layerKey') ? 'absent' : layerKey === null ? 'null'
    : map.profile.layers.some(layer => layer.layerKey === layerKey) ? 'assigned' : 'missing', layerKey, layers: map.profile.layers });
}

/** Only an existing same-Scene layer or explicit null; preserves object order. */
export function setVisualLayer(document: DocumentEnvelope, objectId: string, layerKey: string | null, catalog: AssetCatalog): SceneMembership {
  const map = requireMapProfile(document, catalog), object = getSceneObject(map.membership, objectId);
  if (!object) throw new TypeError('Visual layer object missing');
  if (layerKey !== null && !map.profile.layers.some(layer => layer.layerKey === layerKey)) throw new TypeError('Unknown Scene layer');
  const candidate = replaceSceneObject(map.membership, objectId, { ...object, layerKey });
  validateMapLayerMembership(map.profile, candidate);
  return candidate;
}
