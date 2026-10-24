import { addSceneObject } from './scene-membership.js';
import { createDocumentEnvelope, type DocumentEnvelope, type DocumentContentRecord } from './document-envelope.js';
import { requireVisualPlacementObject } from './visual-placement-move.js';
import { prepareVisualPlacementIdentity } from './visual-placement-identity.js';
import { resolveVisualPlacementPosition, type VisualPlacementPosition } from './visual-placement-position.js';
import { validateVisualSceneDocument } from './visual-document-edit.js';
import type { AssetCatalog } from './asset-catalog.js';
import type { SceneIdentity } from './scene-definition.js';

/** Fresh caller identity + explicit target point; never copies unknown identity-bound extensions. */
export function duplicateVisualObject(document: DocumentEnvelope, catalog: AssetCatalog, scene: SceneIdentity,
  objectId: string, newObjectId: string, position: VisualPlacementPosition): DocumentEnvelope {
  const { source, object } = requireVisualPlacementObject(document, catalog, scene, objectId);
  if (object.attachment != null) throw new TypeError('PLACEMENT_DUPLICATE_ATTACHMENT_UNSUPPORTED');
  const content = source.document.content as DocumentContentRecord;
  const entries = content['objects'] as readonly DocumentContentRecord[];
  const original = entries.find(entry => (entry['definition'] as DocumentContentRecord)['objectId'] === objectId)!;
  const metadata = original['metadata'] as DocumentContentRecord | undefined;
  const definitionMetadata = (original['definition'] as DocumentContentRecord)['metadata'] as DocumentContentRecord | undefined;
  // Only the typed Phase16 extension has known clone ownership. Other originals remain untouched.
  if ((metadata && Object.keys(metadata).some(key => key !== 'editorVisual'))
    || (definitionMetadata && Object.keys(definitionMetadata).length)) throw new TypeError('PLACEMENT_DUPLICATE_UNKNOWN_METADATA');
  const definition = prepareVisualPlacementIdentity(source.membership, scene, { ...object.definition, objectId: newObjectId });
  const point = resolveVisualPlacementPosition(source.document, catalog, position);
  const membership = addSceneObject(source.membership, { ...object, definition,
    placement: { coordinateSpaceId: point.space.coordinateSpaceId, point: point.point } });
  const known = membership.objects[membership.objects.length - 1]!;
  const candidate = createDocumentEnvelope({ ...source.document, content: { ...content,
    objects: [...entries, { ...known, ...(metadata ? { metadata } : {}), definition: {
      ...known.definition, ...(definitionMetadata ? { metadata: definitionMetadata } : {}) } }] } });
  return validateVisualSceneDocument(candidate, catalog).document;
}
