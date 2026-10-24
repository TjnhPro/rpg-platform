import { createDocumentEnvelope, type DocumentEnvelope, type DocumentContentRecord } from './document-envelope.js';
import { serializeDocument, deserializeDocument } from './document-codec.js';
import { replaceSceneDocumentObject } from './document-scene-edit.js';
import { requireMapProfile, mapDocumentContext, type MapProfileSnapshot } from './map-profile.js';
import { createVisualInspectorContext, type VisualInspectorBinding, type VisualInspectorSelection,
  type VisualInspectorContext, type VisualInspectorSnapshot } from './visual-inspector-context.js';
import { readVisualPropertiesProfile, type VisualPropertiesProfile } from './visual-properties-profile.js';
import { setVisualPosition } from './visual-position.js';
import { setVisualDirection } from './visual-direction.js';
import { setVisualLayer } from './visual-layer.js';
import { setVisualScale } from './visual-scale.js';
import { setVisualAnchor } from './visual-anchor.js';
import { setVisualVisibility } from './visual-visibility.js';
import { setVisualBinding } from './visual-binding.js';
import { getSceneObject } from './scene-membership.js';
import type { SpatialPoint2D } from './coordinate-space.js';
import type { AssetReferenceInput } from './asset-reference.js';
import type { AssetCatalog } from './asset-catalog.js';
import type { VisualOrientation2D, VisualAnchor2D, PlanarTransform2D } from '@rpg-platform/runtime-render';

export type VisualPropertyEdit =
  | Readonly<{ kind: 'position'; point: SpatialPoint2D }>
  | Readonly<{ kind: 'direction'; orientation: VisualOrientation2D }>
  | Readonly<{ kind: 'layer'; layerKey: string | null }>
  | Readonly<{ kind: 'scale'; scale: PlanarTransform2D['scale'] }>
  | Readonly<{ kind: 'anchor'; anchor: VisualAnchor2D }>
  | Readonly<{ kind: 'visibility'; visible: boolean }>
  | Readonly<{ kind: 'binding'; reference: AssetReferenceInput | null }>;

/** Profile meanings are validated separately from the generic strict Scene gate. */
export function validateVisualSceneDocument(document: DocumentEnvelope, catalog: AssetCatalog): MapProfileSnapshot {
  const map = requireMapProfile(document, catalog);
  if (catalog.projectId !== map.identity.projectId) throw new TypeError('Visual catalog project mismatch');
  for (const object of map.membership.objects) {
    if (object.layerKey != null && !map.profile.layers.some(layer => layer.layerKey === object.layerKey)) throw new TypeError('Visual object layer missing');
    const profile = readVisualPropertiesProfile(map.document, object.definition.objectId, map.profile.space);
    if (profile.status === 'unsupported') throw new TypeError(`UNSUPPORTED_VISUAL_PROFILE:${profile.reason}`);
    if (profile.status === 'supported' && (profile.profile.anchor || profile.profile.orientation)
      && (!object.placement || object.placement.coordinateSpaceId !== map.profile.space.reference.coordinateSpaceId)) {
      throw new TypeError('Visual anchor/orientation requires matching Scene placement');
    }
  }
  return map;
}

export interface VisualDocumentEditor extends VisualInspectorContext {
  readonly apply: (selection: VisualInspectorSelection, edit: VisualPropertyEdit) => VisualInspectorSnapshot;
}

/** One focused, guarded adoption. No save baseline, IO or duplicate dirty state. */
export function createVisualDocumentEditor(input: VisualInspectorBinding): VisualDocumentEditor {
  const binding = Object.freeze({ ...input });
  const context = createVisualInspectorContext(binding);
  return Object.freeze({ ...context, apply(selection: VisualInspectorSelection, inputEdit: VisualPropertyEdit): VisualInspectorSnapshot {
    const current = context.read(selection);
    if (current.status !== 'selected') throw new TypeError(`Visual edit unavailable:${current.status}`);
    const source = validateVisualSceneDocument(current.document.envelope, binding.catalog);
    // Bound data capture prevents accessors, nonfinite values and unknown graph shapes.
    const decoded = deserializeDocument(serializeDocument(createDocumentEnvelope({ ...source.document, content: inputEdit })));
    if (decoded.status !== 'decoded') throw new TypeError('Visual edit capture rejected');
    const edit = decoded.document.content as unknown as VisualPropertyEdit;
    const fields: Record<VisualPropertyEdit['kind'], string> = { position: 'point', direction: 'orientation', layer: 'layerKey',
      scale: 'scale', anchor: 'anchor', visibility: 'visible', binding: 'reference' };
    if (!edit || !Object.hasOwn(fields, edit.kind) || Object.keys(edit).length !== 2 || !Object.hasOwn(edit, fields[edit.kind])) throw new TypeError('Unknown visual edit');
    const id = selection.objectId, space = source.profile.space;
    let membership = source.membership;
    let profile: VisualPropertiesProfile = current.visual.status === 'supported' ? current.visual.profile : { schemaVersion: 1 };
    let visualChanged = true;
    switch (edit.kind) {
      case 'position': membership = setVisualPosition(membership, id, space, edit.point); visualChanged = false; break;
      case 'layer': membership = setVisualLayer(source.document, id, edit.layerKey, binding.catalog); visualChanged = false; break;
      case 'binding': membership = setVisualBinding(membership, id, binding.catalog, edit.reference); visualChanged = false; break;
      case 'direction': profile = setVisualDirection(profile, space, edit.orientation); break;
      case 'scale': profile = setVisualScale(profile, edit.scale); break;
      case 'anchor': profile = setVisualAnchor(profile, membership, id, space, edit.anchor); break;
      case 'visibility': profile = setVisualVisibility(profile, edit.visible); break;
    }
    let candidate = replaceSceneDocumentObject(source.document, id, getSceneObject(membership, id)!, mapDocumentContext(source.document, binding.catalog));
    if (visualChanged) {
      const content = candidate.content as DocumentContentRecord;
      const entries = content['objects'] as readonly DocumentContentRecord[];
      candidate = createDocumentEnvelope({ ...candidate, content: { ...content,
        objects: entries.map(entry => (entry['definition'] as DocumentContentRecord)['objectId'] === id
          ? { ...entry, metadata: { ...(entry['metadata'] as DocumentContentRecord | undefined), editorVisual: profile } } : entry) } });
    }
    const checked = validateVisualSceneDocument(candidate, binding.catalog);
    // The source token must still be active after all validators, before ONE adoption.
    if (context.read(selection).status !== 'selected') throw new TypeError('Stale visual selection');
    binding.document.replaceContent(checked.document.content);
    return context.select(id);
  } });
}
