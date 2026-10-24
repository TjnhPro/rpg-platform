import type { RenderVisualLayerInput, RenderVisualInstanceOrder } from '@rpg-platform/runtime-render';
import { requireMapProfile, replaceMapProfile, type MapLayerDefinition } from './map-profile.js';
import type { DocumentEnvelope } from './document-envelope.js';
import type { AssetCatalog } from './asset-catalog.js';

export function addMapLayer(document: DocumentEnvelope, layer: MapLayerDefinition, catalog?: AssetCatalog): DocumentEnvelope {
  const source = requireMapProfile(document, catalog);
  return replaceMapProfile(source.document, { ...source.profile, layers: [...source.profile.layers, layer] }, catalog);
}
/** Keys are stable: this is a full role/visibility replacement of an existing key. */
export function updateMapLayer(document: DocumentEnvelope, layer: MapLayerDefinition, catalog?: AssetCatalog): DocumentEnvelope {
  const source = requireMapProfile(document, catalog);
  if (!source.profile.layers.some(item => item.layerKey === layer.layerKey)) throw new TypeError('MISSING_MAP_LAYER');
  return replaceMapProfile(source.document, { ...source.profile,
    layers: source.profile.layers.map(item => item.layerKey === layer.layerKey ? layer : item) }, catalog);
}
export function reorderMapLayers(document: DocumentEnvelope, keys: readonly string[], catalog?: AssetCatalog): DocumentEnvelope {
  const source = requireMapProfile(document, catalog);
  if (keys.length !== source.profile.layers.length || new Set(keys).size !== keys.length) throw new TypeError('MAP_LAYER_PERMUTATION');
  const layers = keys.map(key => {
    const layer = source.profile.layers.find(item => item.layerKey === key);
    if (!layer) throw new TypeError('MISSING_MAP_LAYER'); return layer;
  });
  return replaceMapProfile(source.document, { ...source.profile, layers }, catalog);
}
export function removeMapLayer(document: DocumentEnvelope, key: string, catalog?: AssetCatalog): DocumentEnvelope {
  const source = requireMapProfile(document, catalog);
  if (!source.profile.layers.some(item => item.layerKey === key)) throw new TypeError('MISSING_MAP_LAYER');
  if (source.membership.objects.some(entry => entry.layerKey === key)) throw new TypeError('MAP_LAYER_IN_USE');
  return replaceMapProfile(source.document, { ...source.profile, layers: source.profile.layers.filter(item => item.layerKey !== key) }, catalog);
}
/** Explicit Render requests; no scene mutation, GPU sorting or authored object reorder. */
export function describeMapLayers(document: DocumentEnvelope, catalog?: AssetCatalog): {
  readonly layers: readonly RenderVisualLayerInput[];
  readonly objects: readonly { readonly objectId: string; readonly order: RenderVisualInstanceOrder }[];
} {
  const source = requireMapProfile(document, catalog);
  return Object.freeze({
    layers: Object.freeze(source.profile.layers.map((layer, priority) => Object.freeze({ layerKey: layer.layerKey, priority, visible: layer.visible }))),
    objects: Object.freeze(source.membership.objects.flatMap((entry, order) =>
      source.profile.layers.some(layer => layer.layerKey === entry.layerKey)
        ? [Object.freeze({ objectId: entry.definition.objectId, order: Object.freeze({ layerKey: entry.layerKey!, order }) })] : []))
  });
}
