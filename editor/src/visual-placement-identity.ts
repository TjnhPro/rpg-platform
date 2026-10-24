import { createSceneObjectDefinition, type SceneObjectDefinitionInput, type SceneObjectDefinition } from './scene-object-definition.js';
import { createSceneIdentity, type SceneIdentity } from './scene-definition.js';
import { createSceneMembership, getSceneObject, type SceneMembership } from './scene-membership.js';

/** Suggested authoring labels only; Scene's open classification contract remains. */
export const visualPlacementLabels = Object.freeze(['player', 'monster', 'npc', 'item', 'vfx'] as const);

/** Exact caller ID, scoped to the explicit Scene. Never generate, normalize or upsert. */
export function prepareVisualPlacementIdentity(membership: SceneMembership, sceneInput: SceneIdentity,
  input: SceneObjectDefinitionInput): SceneObjectDefinition {
  const source = createSceneMembership(membership), scene = createSceneIdentity(sceneInput);
  if (scene.projectId !== source.scene.identity.projectId || scene.sceneId !== source.scene.identity.sceneId)
    throw new TypeError('PLACEMENT_SCENE_MISMATCH');
  const definition = createSceneObjectDefinition(input);
  if (getSceneObject(source, definition.objectId)) throw new TypeError('PLACEMENT_DUPLICATE_ID');
  return definition;
}
