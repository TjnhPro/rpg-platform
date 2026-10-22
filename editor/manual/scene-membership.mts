import {
  createSceneDefinition, createSceneMembership, addSceneObject,
  listSceneObjects, getSceneObject, createAssetCatalog, createAssetReference,
  resolveAssetReference, diagnoseAssetReference,
} from '@rpg-platform/editor';

const scene = createSceneDefinition({ identity: { projectId: 'demo', sceneId: 'room-1' } });
const reference = { projectId: 'demo', assetId: 'monster-image', expectedKind: 'image' };
const player = { definition: { objectId: 'player-visual', displayName: 'Player placeholder' } };
const firstMonster = {
  definition: { objectId: 'monster-1', displayName: 'Monster placeholder' },
  assetReference: reference,
};
const hostObjects = [player, firstMonster];
const inputBefore = JSON.stringify(hostObjects);
const initial = createSceneMembership({ scene, objects: hostObjects });
const withTwo = addSceneObject(initial, {
  definition: { objectId: 'monster-2' }, assetReference: createAssetReference(reference),
});
const complete = addSceneObject(withTwo, {
  definition: { objectId: 'monster-3' }, assetReference: reference,
});
console.log('one player and three monsters', listSceneObjects(complete));
console.log('candidate counts', initial.objects.length, withTwo.objects.length, complete.objects.length);
console.log('capture', {
  inputUnchanged: JSON.stringify(hostObjects) === inputBefore,
  detached: !Object.is(initial.objects, hostObjects) && !Object.is(initial.objects[1], firstMonster),
  definitionDetached: !Object.is(initial.objects[1]?.definition, firstMonster.definition),
  referenceDetached: !Object.is(initial.objects[1]?.assetReference, reference),
  sceneDetached: initial.scene !== scene && initial.scene.identity !== scene.identity,
  frozen: Object.isFrozen(complete) && Object.isFrozen(complete.scene)
    && Object.isFrozen(complete.scene.identity) && Object.isFrozen(complete.objects)
    && complete.objects.every(entry => Object.isFrozen(entry)
      && Object.isFrozen(entry.definition)
      && (entry.assetReference === null || Object.isFrozen(entry.assetReference))),
});
reference.assetId = 'host-edited-target';
firstMonster.definition.objectId = 'host-edited-object';
hostObjects.length = 0;
console.log('after host edits', getSceneObject(complete, 'monster-1'), initial.objects.length);
console.log('missing local key', getSceneObject(complete, 'absent'));
const catalog = createAssetCatalog({ projectId: 'demo', definitions: [{
  identity: { projectId: 'demo', assetId: 'monster-image' }, kind: 'image', metadata: {},
}] });
for (const object of listSceneObjects(complete)) {
  if (object.assetReference === null) continue;
  const result = resolveAssetReference(catalog, object.assetReference);
  console.log('shared Asset target', object.definition.objectId, result.status,
    result.status === 'resolved' && result.definition === catalog.definitions[0],
    Object.keys(object));
}
const emptyCatalog = createAssetCatalog({ projectId: 'demo' });
const retained = getSceneObject(complete, 'monster-1')!;
console.log('missing target via Phase 2', diagnoseAssetReference(emptyCatalog, retained.assetReference),
  'objects retained', complete.objects.length, 'no registration', emptyCatalog.definitions.length);
for (const operation of ['add-duplicate', 'create-duplicate', 'foreign-binding'] as const) {
  try {
    if (operation === 'add-duplicate') addSceneObject(complete, player);
    else if (operation === 'create-duplicate') createSceneMembership({ scene, objects: [player, player] });
    else addSceneObject(complete, { definition: { objectId: 'foreign' },
      assetReference: { projectId: 'other-project', assetId: 'image' } });
  } catch (error) {
    if (!(error instanceof TypeError)) throw error;
    console.log(operation, error.name, error.message, 'source count', complete.objects.length);
  }
}
console.log('empty / assetless / separate scene', createSceneMembership({ scene }),
  createSceneMembership({ scene, objects: [player] }),
  createSceneMembership({ scene: { identity: { projectId: 'demo', sceneId: 'room-2' } }, objects: [player] }));
console.log('AUTHORED_MEMBERSHIP_ONLY / ASSETS_NOT_LOADED / VISUAL_NOT_VERIFIED');
