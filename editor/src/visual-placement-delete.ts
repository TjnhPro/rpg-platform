import { removeSceneObject } from './scene-membership.js';
import { createDocumentEnvelope, type DocumentEnvelope, type DocumentContentRecord } from './document-envelope.js';
import { requireVisualPlacementObject } from './visual-placement-move.js';
import { validateVisualSceneDocument } from './visual-document-edit.js';
import type { AssetCatalog } from './asset-catalog.js';
import type { SceneIdentity } from './scene-definition.js';

/** Reject known inbound relationships; remove one authored object, no cascade or IO. */
export function deleteVisualObject(document: DocumentEnvelope, catalog: AssetCatalog, scene: SceneIdentity,
  objectId: string): DocumentEnvelope {
  const { source } = requireVisualPlacementObject(document, catalog, scene, objectId);
  const inbound = source.membership.objects.filter(entry => entry.attachment?.target.objectId === objectId);
  if (inbound.length) throw new TypeError(`PLACEMENT_INBOUND_ATTACHMENT:${inbound.map(entry => entry.definition.objectId).join(',')}`);
  const membership = removeSceneObject(source.membership, objectId);
  const retained = new Set(membership.objects.map(entry => entry.definition.objectId));
  const content = source.document.content as DocumentContentRecord;
  const entries = content['objects'] as readonly DocumentContentRecord[];
  const candidate = createDocumentEnvelope({ ...source.document, content: { ...content,
    objects: entries.filter(entry => retained.has((entry['definition'] as DocumentContentRecord)['objectId'] as string)) } });
  return validateVisualSceneDocument(candidate, catalog).document;
}
