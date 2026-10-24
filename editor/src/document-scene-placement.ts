import { createDocumentEnvelope, type DocumentEnvelope, type DocumentContentRecord } from './document-envelope.js';
import { serializeDocument, deserializeDocument } from './document-codec.js';
import { validateVisualSceneDocument, createVisualDocumentEditor } from './visual-document-edit.js';
import { createVisualPlacementContext, readVisualPlacementScene, type VisualPlacementBinding, type VisualPlacementIntent } from './visual-placement-context.js';
import { placeVisualObject, type PlaceVisualObjectRequest } from './visual-placement-create.js';
import { moveVisualObject } from './visual-placement-move.js';
import { duplicateVisualObject } from './visual-placement-duplicate.js';
import { deleteVisualObject } from './visual-placement-delete.js';
import type { VisualPlacementPosition } from './visual-placement-position.js';
import type { VisualPropertiesProfile } from './visual-properties-profile.js';
import type { VisualInspectorSelection } from './visual-inspector-context.js';
import type { AssetCatalog } from './asset-catalog.js';

/** Focused insert only; existing rich entries/Scene/content are never projected away. */
export function insertVisualSceneDocumentObject(document: DocumentEnvelope, catalog: AssetCatalog,
  request: PlaceVisualObjectRequest): DocumentEnvelope {
  const source = validateVisualSceneDocument(document, catalog);
  const result = placeVisualObject(source.document, catalog, request);
  const content = source.document.content as DocumentContentRecord;
  const entries = content['objects'] as readonly DocumentContentRecord[];
  const known = result.membership.objects[result.membership.objects.length - 1]!;
  const candidate = createDocumentEnvelope({ ...source.document, content: { ...content,
    objects: [...entries, { ...known, ...(result.visual ? { metadata: { editorVisual: result.visual } } : {}) }] } });
  return validateVisualSceneDocument(candidate, catalog).document;
}

export interface VisualPlacementCreateInput {
  readonly objectId: string; readonly displayName?: string | null;
  readonly position: VisualPlacementPosition; readonly visual?: VisualPropertiesProfile;
}
export type VisualPlacementEdit = Readonly<{ kind: 'move'; position: VisualPlacementPosition }>
  | Readonly<{ kind: 'duplicate'; newObjectId: string; position: VisualPlacementPosition }>
  | Readonly<{ kind: 'delete' }>;

/** One canonical DocumentSession and ONE shared Phase16 selection/editor context. */
export function createVisualPlacementEditor(input: VisualPlacementBinding) {
  const binding = Object.freeze({ ...input }), initial = readVisualPlacementScene(binding);
  const inspector = createVisualDocumentEditor({ ...binding, catalog: initial.catalog });
  const placement = createVisualPlacementContext(binding);
  let disposed = false;
  const read = () => {
    if (disposed) throw new TypeError('PLACEMENT_EDITOR_CLOSED');
    const current = readVisualPlacementScene(binding);
    if (current.catalog !== initial.catalog || current.catalogGeneration !== initial.catalogGeneration) throw new TypeError('PLACEMENT_CATALOG_CHANGED_REBIND');
    return current;
  };
  const capture = <T>(document: DocumentEnvelope, value: T): T => {
    const decoded = deserializeDocument(serializeDocument({ ...document, content: value } as unknown as DocumentEnvelope));
    if (decoded.status !== 'decoded') throw new TypeError('PLACEMENT_COMMAND_CAPTURE');
    return decoded.document.content as unknown as T;
  };
  const unchanged = (source: ReturnType<typeof read>) => {
    const current = read();
    if (current.document.currentRevision !== source.document.currentRevision || current.document.envelope !== source.document.envelope
      || current.project.currentRevision !== source.project.currentRevision) throw new TypeError('STALE_PLACEMENT_REVISION');
  };
  const invalidate = () => { placement.invalidate(); inspector.invalidate(); };
  return Object.freeze({ inspector, placement, invalidate,
    dispose() { disposed = true; placement.dispose(); inspector.invalidate(); },
    place(intent: VisualPlacementIntent, inputCreate: VisualPlacementCreateInput) {
      const source = read(); placement.read(intent);
      const create = capture(source.document.envelope, inputCreate);
      if (!create || Object.keys(create).some(key => !['objectId', 'displayName', 'position', 'visual'].includes(key))) throw new TypeError('PLACEMENT_CREATE_FIELDS');
      const candidate = insertVisualSceneDocumentObject(source.document.envelope, source.catalog, {
        scene: source.map.identity, definition: { objectId: create.objectId, classification: intent.classification,
          ...(Object.hasOwn(create, 'displayName') ? { displayName: create.displayName } : {}) },
        reference: intent.reference, layerKey: intent.layerKey, position: create.position,
        ...(Object.hasOwn(create, 'visual') ? { visual: create.visual } : {}) });
      unchanged(source); placement.read(intent);
      binding.document.replaceContent(candidate.content);
      placement.invalidate();
      return inspector.select(create.objectId);
    },
    edit(selection: VisualInspectorSelection, expectedRevision: number, inputEdit: VisualPlacementEdit) {
      const source = read();
      if (expectedRevision !== source.document.currentRevision) throw new TypeError('STALE_PLACEMENT_REVISION');
      if (inspector.read(selection).status !== 'selected') throw new TypeError('STALE_PLACEMENT_SELECTION');
      const edit = capture(source.document.envelope, inputEdit);
      if (!edit || !['move', 'duplicate', 'delete'].includes(edit.kind)
        || Object.keys(edit).length !== (edit.kind === 'duplicate' ? 3 : edit.kind === 'move' ? 2 : 1)) throw new TypeError('PLACEMENT_EDIT_FIELDS');
      const document = source.document.envelope, catalog = source.catalog, scene = source.map.identity, id = selection.objectId;
      const candidate = edit.kind === 'move' ? moveVisualObject(document, catalog, scene, id, edit.position)
        : edit.kind === 'duplicate' ? duplicateVisualObject(document, catalog, scene, id, edit.newObjectId, edit.position)
          : deleteVisualObject(document, catalog, scene, id);
      unchanged(source);
      if (inspector.read(selection).status !== 'selected') throw new TypeError('STALE_PLACEMENT_SELECTION');
      binding.document.replaceContent(candidate.content);
      placement.invalidate();
      if (edit.kind === 'delete') { inspector.clear(); return inspector.read(); }
      return inspector.select(edit.kind === 'duplicate' ? edit.newObjectId : id);
    }
  });
}
export type VisualPlacementEditor = ReturnType<typeof createVisualPlacementEditor>;
