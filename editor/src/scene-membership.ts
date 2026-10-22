import { createSceneDefinition, createSceneIdentity, type SceneIdentity, type SceneDefinition, type SceneDefinitionInput } from './scene-definition.js';
import { createSceneObjectDefinition, type SceneObjectDefinition, type SceneObjectDefinitionInput } from './scene-object-definition.js';
import { createAssetReference, type AssetReference, type AssetReferenceInput } from './asset-reference.js';

/** Target inside the owning project; only the owning Scene is supported today. */
export interface SceneObjectReference {
  readonly sceneId: string;
  readonly objectId: string;
}

/** Authored presentation intent only: no parent, transform or runtime following. */
export interface SceneObjectAttachment {
  readonly kind: 'attachment';
  readonly target: SceneObjectReference;
}

/**
 * Authored numeric pair in a caller-named space. x/y are data slots, not screen
 * pixels or a world/local transform. Units, axes, origin and projection belong
 * to Feature 04; this record does not define or resolve that space.
 */
export interface SceneObjectPlacement {
  readonly coordinateSpaceId: string;
  readonly point: { readonly x: number; readonly y: number };
}

export interface SceneObjectMembershipInput {
  readonly definition: SceneObjectDefinitionInput;
  readonly assetReference?: AssetReferenceInput | null;
  /** Opaque authoring key, not a numeric depth or renderer sorting instruction. */
  readonly layerKey?: string | null;
  readonly attachment?: SceneObjectAttachment | null;
  readonly placement?: SceneObjectPlacement | null;
}

/** One owned authored definition and optional logical Asset target, never Asset data. */
export interface SceneObjectMembership {
  readonly definition: SceneObjectDefinition;
  readonly assetReference: AssetReference | null;
  readonly layerKey?: string | null;
  readonly attachment?: SceneObjectAttachment | null;
  readonly placement?: SceneObjectPlacement | null;
}

export interface SceneMembershipInput {
  readonly scene: SceneDefinitionInput;
  readonly objects?: readonly SceneObjectMembershipInput[];
}

/** Factory snapshot; list order is declaration/append order, not render order. */
export interface SceneMembership {
  readonly scene: SceneDefinition;
  readonly objects: readonly SceneObjectMembership[];
}

function capturePlacement(input: SceneObjectPlacement): SceneObjectPlacement {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new TypeError('Placement must be an object');
  }
  const { coordinateSpaceId, point } = input;
  if (typeof coordinateSpaceId !== 'string' || coordinateSpaceId.length === 0 || /\s/u.test(coordinateSpaceId)) {
    throw new TypeError('coordinateSpaceId must be a non-empty string without whitespace');
  }
  if (typeof point !== 'object' || point === null || Array.isArray(point)) {
    throw new TypeError('Placement point must be an object');
  }
  const { x, y } = point;
  if (typeof x !== 'number' || !Number.isFinite(x) || typeof y !== 'number' || !Number.isFinite(y)) {
    throw new TypeError('Placement point x/y must be finite numbers');
  }
  return Object.freeze({ coordinateSpaceId, point: Object.freeze({ x, y }) });
}

function captureAttachment(
  input: SceneObjectAttachment, scene: SceneIdentity, sourceId: string,
): SceneObjectAttachment {
  if (typeof input !== 'object' || input === null || Array.isArray(input)
    || input.kind !== 'attachment') throw new TypeError('Expected an attachment relationship');
  const { target } = input;
  if (typeof target !== 'object' || target === null || Array.isArray(target)) {
    throw new TypeError('Attachment target must be a Scene object reference');
  }
  const sceneId = createSceneIdentity({ projectId: scene.projectId, sceneId: target.sceneId }).sceneId;
  const objectId = createSceneObjectDefinition({ objectId: target.objectId }).objectId;
  if (sceneId !== scene.sceneId) throw new TypeError('Cross-Scene attachments are not supported');
  if (objectId === sourceId) throw new TypeError('An object cannot attach to itself');
  // Preserve missing targets. This is not hierarchical: no traversal or cycle policy.
  return Object.freeze({ kind: 'attachment', target: Object.freeze({ sceneId, objectId }) });
}

/**
 * Capture all data through the existing Scene/Object/Asset factories. Enforce
 * scene-local object uniqueness and project-local bindings, without target lookup.
 * Missing Assets remain authored references; kind/target diagnostics belong to
 * Phase 2. Known construction fields only, not a versioned document reader.
 */
export function createSceneMembership(input: SceneMembershipInput): SceneMembership {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new TypeError('Scene membership input must be an object');
  }
  const { scene: sceneInput, objects = [] } = input;
  const scene = createSceneDefinition(sceneInput);
  if (!Array.isArray(objects)) throw new TypeError('Scene objects must be an array');
  const result: SceneObjectMembership[] = [];
  const ids = new Set<string>();
  for (const entry of objects) {
    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
      throw new TypeError('Scene object membership must be an object');
    }
    const { definition: definitionInput, assetReference: referenceInput = null, layerKey, attachment, placement } = entry;
    const definition = createSceneObjectDefinition(definitionInput);
    if (ids.has(definition.objectId)) throw new TypeError('Duplicate Scene objectId');
    const assetReference = referenceInput === null ? null : createAssetReference(referenceInput);
    if (assetReference !== null && assetReference.projectId !== scene.identity.projectId) {
      throw new TypeError('Scene Asset binding must target the Scene project');
    }
    if (layerKey !== undefined && layerKey !== null
      && (typeof layerKey !== 'string' || layerKey.length === 0 || /\s/u.test(layerKey))) {
      throw new TypeError('layerKey must be a non-empty string without whitespace or null');
    }
    const capturedAttachment = attachment === undefined || attachment === null
      ? attachment : captureAttachment(attachment, scene.identity, definition.objectId);
    const capturedPlacement = placement === undefined || placement === null
      ? placement : capturePlacement(placement);
    ids.add(definition.objectId);
    result.push(Object.freeze({ definition, assetReference,
      ...(layerKey === undefined ? {} : { layerKey }),
      ...(capturedAttachment === undefined ? {} : { attachment: capturedAttachment }),
      ...(capturedPlacement === undefined ? {} : { placement: capturedPlacement }),
    }));
  }
  return Object.freeze({ scene, objects: Object.freeze(result) });
}

/** Append into a fresh validated candidate; never mutate or upsert the source. */
export function addSceneObject(
  membership: SceneMembership, object: SceneObjectMembershipInput,
): SceneMembership {
  return createSceneMembership({ scene: membership.scene, objects: [...membership.objects, object] });
}

/** Read the frozen ordered list from a factory snapshot; no allocation or IO. */
export function listSceneObjects(membership: SceneMembership): readonly SceneObjectMembership[] {
  return membership.objects;
}

/** Exact scene-local lookup; absent returns undefined, invalid key throws TypeError. */
export function getSceneObject(
  membership: SceneMembership, objectId: string,
): SceneObjectMembership | undefined {
  const key = createSceneObjectDefinition({ objectId }).objectId;
  return membership.objects.find((entry) => entry.definition.objectId === key);
}

/** Remove exactly one existing object; retain other entries and authored references. */
export function removeSceneObject(membership: SceneMembership, objectId: string): SceneMembership {
  const current = getSceneObject(membership, objectId);
  if (current === undefined) throw new TypeError('Cannot remove a missing Scene objectId');
  return createSceneMembership({ scene: membership.scene,
    objects: membership.objects.filter(entry => entry !== current) });
}

/**
 * Replace a complete entry at its existing position, never rename or upsert.
 * Omitted optional replacement fields clear their previous values. Use a spread
 * of the existing entry when changing only selected metadata. Capture and validate
 * the whole candidate before returning; failures leave the source untouched.
 */
export function replaceSceneObject(
  membership: SceneMembership, objectId: string, replacement: SceneObjectMembershipInput,
): SceneMembership {
  const current = getSceneObject(membership, objectId);
  if (current === undefined) throw new TypeError('Cannot replace a missing Scene objectId');
  const candidate = createSceneMembership({ scene: membership.scene,
    objects: membership.objects.map(entry => entry === current ? replacement : entry) });
  const index = membership.objects.indexOf(current);
  if (candidate.objects[index]!.definition.objectId !== current.definition.objectId) {
    throw new TypeError('Replacement must retain the existing Scene objectId');
  }
  return candidate;
}

/** Replace only placement, preserving all other authored fields; null clears it. */
export function updateSceneObjectPlacement(
  membership: SceneMembership, objectId: string, placement: SceneObjectPlacement | null,
): SceneMembership {
  const current = getSceneObject(membership, objectId);
  if (current === undefined) throw new TypeError('Cannot update a missing Scene objectId');
  return replaceSceneObject(membership, objectId, { ...current, placement });
}

/**
 * Explicit full permutation of existing IDs; no insert/delete/identity or binding
 * edits. Returns a fresh candidate, preserving metadata and the original snapshot.
 * This changes authored list order only, never z sorting or attachment semantics.
 */
export function reorderSceneObjects(membership: SceneMembership, objectIds: readonly string[]): SceneMembership {
  if (!Array.isArray(objectIds) || objectIds.length !== membership.objects.length) {
    throw new TypeError('Object order must contain every existing objectId exactly once');
  }
  const byId = new Map(membership.objects.map(entry => [entry.definition.objectId, entry]));
  const ordered: SceneObjectMembership[] = [];
  for (const objectId of objectIds) {
    const key = createSceneObjectDefinition({ objectId }).objectId;
    const entry = byId.get(key);
    if (entry === undefined) throw new TypeError('Object order contains an unknown or duplicate objectId');
    ordered.push(entry);
    byId.delete(key);
  }
  return createSceneMembership({ scene: membership.scene, objects: ordered });
}
