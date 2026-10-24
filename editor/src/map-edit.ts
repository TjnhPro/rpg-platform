import { createDocumentEnvelope, type DocumentEnvelope, type DocumentContentRecord } from './document-envelope.js';
import { requireMapProfile, type MapProfileSnapshot } from './map-profile.js';
import type { SceneMembership } from './scene-membership.js';
import type { AssetCatalog } from './asset-catalog.js';

/** Merge a canonical membership candidate while retaining every surviving extension. */
export function mapMembershipCandidate(source: MapProfileSnapshot, membership: SceneMembership, catalog: AssetCatalog): DocumentEnvelope {
  const content = source.document.content as DocumentContentRecord;
  const originals = content['objects'] as readonly DocumentContentRecord[];
  const objects = membership.objects.map(entry => {
    const old = originals.find(item => (item['definition'] as DocumentContentRecord)['objectId'] === entry.definition.objectId);
    const metadata = (value: DocumentContentRecord | undefined) => value && Object.hasOwn(value, 'metadata') ? { metadata: value['metadata']! } : {};
    return { ...entry, ...metadata(old), definition: { ...entry.definition, ...metadata(old?.['definition'] as DocumentContentRecord | undefined) } };
  });
  return requireMapProfile(createDocumentEnvelope({ ...source.document, content: { ...content, objects } }), catalog).document;
}
