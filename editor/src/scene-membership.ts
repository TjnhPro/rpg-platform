import { createSceneDefinition, type SceneDefinition, type SceneDefinitionInput } from './scene-definition.js';
import { createSceneObjectDefinition, type SceneObjectDefinition, type SceneObjectDefinitionInput } from './scene-object-definition.js';
import { createAssetReference, type AssetReference, type AssetReferenceInput } from './asset-reference.js';

export interface SceneObjectMembershipInput {
  readonly definition: SceneObjectDefinitionInput;
  readonly assetReference?: AssetReferenceInput | null;
}

/** One owned authored definition and optional logical Asset target, never Asset data. */
export interface SceneObjectMembership {
  readonly definition: SceneObjectDefinition;
  readonly assetReference: AssetReference | null;
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
    const { definition: definitionInput, assetReference: referenceInput = null } = entry;
    const definition = createSceneObjectDefinition(definitionInput);
    if (ids.has(definition.objectId)) throw new TypeError('Duplicate Scene objectId');
    const assetReference = referenceInput === null ? null : createAssetReference(referenceInput);
    if (assetReference !== null && assetReference.projectId !== scene.identity.projectId) {
      throw new TypeError('Scene Asset binding must target the Scene project');
    }
    ids.add(definition.objectId);
    result.push(Object.freeze({ definition, assetReference }));
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
