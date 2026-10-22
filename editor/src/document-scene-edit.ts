import type { DocumentEnvelope, DocumentContentRecord, DocumentContentValue } from './document-envelope.js';
import { serializeDocument, deserializeDocument } from './document-codec.js';
import { diagnoseDocument, type DocumentValidationContext } from './document-diagnostics.js';
import { createSceneMembership, replaceSceneObject, type SceneObjectMembership, type SceneMembershipInput } from './scene-membership.js';
import { sameDocumentSnapshot } from './document-scene-profile.js';

/**
 * Replace one object's KNOWN owner snapshot, retaining source Document metadata
 * at every supported Scene extension slot. Reuse canonical Scene replacement;
 * no second Scene schema, spatial math, reference repair or arbitrary path patch.
 *
 * Context must explicitly bind the current Scene kind/version and all references.
 * Source and candidate must be strict-valid; rejected/future/unchecked content is
 * inspect-only. Replacement must be a complete canonical SceneObjectMembership
 * snapshot without extra fields (use existing owner factories/operations first).
 * This API cannot edit metadata; it preserves that data without understanding it.
 * Omitted optional known fields clear as in replaceSceneObject. IDs cannot rename.
 *
 * Returns a frozen detached envelope. No schema bump, session/revision mutation,
 * Save/Load or IO. TypeError rejects unsupported profiles, missing targets and
 * owner validation failures; codec resource RangeError and trusted host exceptions
 * propagate. Existing low-level whole-content APIs remain trusted replacement seams.
 */
export function replaceSceneDocumentObject(
  document: DocumentEnvelope, objectId: string, replacement: SceneObjectMembership,
  context: Extract<DocumentValidationContext, { owner: 'scene' }>,
): DocumentEnvelope {
  if (context.owner !== 'scene') throw new TypeError('Scene Document edit requires the Scene owner binding');
  const binding = Object.freeze({ ...context });
  const validation = diagnoseDocument(serializeDocument(document), binding);
  if (!validation.readEligibility.strict || validation.document === null) {
    throw new TypeError('Scene Document source must satisfy the current writable content profile');
  }
  const source = validation.document;
  // Bound and detach replacement before invoking recursive owner construction.
  const decoded = deserializeDocument(serializeDocument({ ...source,
    content: replacement as unknown as DocumentContentValue }));
  if (decoded.status !== 'decoded') throw new TypeError('Scene Document replacement cannot be captured');
  const membership = createSceneMembership(source.content as unknown as SceneMembershipInput);
  const candidate = replaceSceneObject(membership, objectId, decoded.document.content as unknown as SceneObjectMembership);
  const index = membership.objects.findIndex(entry => entry.definition.objectId === objectId);
  const known = candidate.objects[index]!;
  if (!sameDocumentSnapshot(decoded.document.content, known)) {
    throw new TypeError('Scene Document replacement requires a canonical known-field snapshot');
  }
  const content = source.content as DocumentContentRecord;
  const entries = content['objects'] as readonly DocumentContentRecord[];
  const original = entries[index]!;
  const definition = original['definition'] as DocumentContentRecord;
  const metadata = (value: DocumentContentRecord) => Object.hasOwn(value, 'metadata') ? { metadata: value['metadata']! } : {};
  const updated = { ...known, ...metadata(original), definition: { ...known.definition, ...metadata(definition) } };
  const text = serializeDocument({ ...source, content: { ...content,
    objects: entries.map((entry, position) => position === index ? updated : entry) } as DocumentContentValue });
  const checked = diagnoseDocument(text, binding);
  if (!checked.readEligibility.strict || checked.document === null) {
    throw new TypeError('Scene Document candidate failed canonical validation');
  }
  return checked.document;
}
