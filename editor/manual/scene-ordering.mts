import {
  createSceneMembership, addSceneObject, reorderSceneObjects, listSceneObjects,
  getSceneObject, type SceneObjectAttachment,
} from '@rpg-platform/editor';

const hostTarget = { sceneId: 'room', objectId: 'player' };
const attachment: SceneObjectAttachment = { kind: 'attachment', target: hostTarget };
const hostOrder = ['spark', 'player', 'caption'];
const initial = createSceneMembership({
  scene: { identity: { projectId: 'demo', sceneId: 'room' } },
  objects: [
    { definition: { objectId: 'player', displayName: 'Player visual' }, layerKey: 'actors',
      assetReference: { projectId: 'demo', assetId: 'player-image' } },
    { definition: { objectId: 'spark' }, layerKey: 'effects',
      attachment },
    { definition: { objectId: 'caption' }, layerKey: 'text' },
  ],
});
const renamed = createSceneMembership({ scene: initial.scene,
  objects: initial.objects.map(entry => entry.definition.objectId === 'caption'
    ? { ...entry, definition: { ...entry.definition, displayName: 'Edited caption' } } : entry),
});
console.log('order before / unrelated label edit',
  listSceneObjects(initial).map(e => e.definition.objectId),
  listSceneObjects(renamed).map(e => e.definition.objectId));
const reordered = reorderSceneObjects(renamed, hostOrder);
console.log('explicit order / unchanged original', reordered.objects.map(e => e.definition.objectId),
  initial.objects.map(e => e.definition.objectId));
console.log('identity and binding before / after', getSceneObject(initial, 'player'), getSceneObject(reordered, 'player'));
console.log('attachment before host edit', getSceneObject(reordered, 'spark')?.attachment);
hostTarget.objectId = 'caller-edit';
hostOrder.reverse();
console.log('detached reference/order after host edits', getSceneObject(reordered, 'spark')?.attachment,
  reordered.objects.map(e => e.definition.objectId));
console.log('frozen', Object.isFrozen(reordered), Object.isFrozen(reordered.objects),
  Object.isFrozen(getSceneObject(reordered, 'spark')?.attachment),
  Object.isFrozen(getSceneObject(reordered, 'spark')?.attachment?.target));
const forward = addSceneObject(reordered, { definition: { objectId: 'unresolved-effect' },
  attachment: { kind: 'attachment', target: { sceneId: 'room', objectId: 'future-visual' } } });
console.log('missing target intent retained', getSceneObject(forward, 'unresolved-effect'),
  getSceneObject(forward, 'future-visual'));
const plain = createSceneMembership({ scene: initial.scene, objects: [{ definition: { objectId: 'text-only' } }] });
console.log('no relation/layer required / old entry keys', plain, Object.keys(plain.objects[0]!));
console.log('null optional values', createSceneMembership({ scene: initial.scene,
  objects: [{ definition: { objectId: 'optional' }, layerKey: null, attachment: null }] }));
for (const order of [['player'], ['player', 'player', 'caption'], ['player', 'spark', 'unknown']]) {
  try { reorderSceneObjects(initial, order); }
  catch (error) {
    if (!(error instanceof TypeError)) throw error;
    console.log('invalid permutation', error.message, 'source IDs', initial.objects.map(e => e.definition.objectId));
  }
}
for (const target of [{ sceneId: 'elsewhere', objectId: 'player' }, { sceneId: 'room', objectId: 'spark' }]) {
  try { addSceneObject(plain, { definition: { objectId: 'spark' }, attachment: { kind: 'attachment', target } }); }
  catch (error) {
    if (!(error instanceof TypeError)) throw error;
    console.log('unsupported attachment', error.message);
  }
}
console.log('AUTHORED_ORDER_AND_INTENT_ONLY / NO_TRANSFORM_PROPAGATION / VISUAL_NOT_VERIFIED');
