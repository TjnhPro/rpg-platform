import {
  createSceneMembership, addSceneObject, reorderSceneObjects, getSceneObject,
  type SceneObjectPlacement,
} from '@rpg-platform/editor';

const hostPlacement = { coordinateSpaceId: 'author-space-a', point: { x: 12.5, y: -3 } };
const otherPlacement: SceneObjectPlacement = {
  coordinateSpaceId: 'author-space-b', point: { x: -8, y: 25 },
};
const before = JSON.stringify(hostPlacement);
const initial = createSceneMembership({
  scene: { identity: { projectId: 'demo', sceneId: 'room' } },
  objects: [
    { definition: { objectId: 'lantern' }, placement: hostPlacement,
      assetReference: { projectId: 'demo', assetId: 'lantern-image' }, layerKey: 'decorations' },
    { definition: { objectId: 'glow' }, placement: otherPlacement,
      attachment: { kind: 'attachment', target: { sceneId: 'room', objectId: 'lantern' } } },
  ],
});
console.log('separate authored spaces/points', JSON.stringify(initial.objects));
console.log('capture', {
  inputUnchanged: before === JSON.stringify(hostPlacement),
  callerMutable: !Object.isFrozen(hostPlacement) && !Object.isFrozen(hostPlacement.point),
  placementDetached: !Object.is(getSceneObject(initial, 'lantern')?.placement, hostPlacement),
  pointDetached: !Object.is(getSceneObject(initial, 'lantern')?.placement?.point, hostPlacement.point),
  placementFrozen: Object.isFrozen(getSceneObject(initial, 'lantern')?.placement),
  pointFrozen: Object.isFrozen(getSceneObject(initial, 'lantern')?.placement?.point),
});
hostPlacement.coordinateSpaceId = 'edited-host-space';
hostPlacement.point.x = 99;
console.log('capture after host edits', getSceneObject(initial, 'lantern'));
const replacement = { coordinateSpaceId: 'author-space-c', point: { x: 4, y: 6 } };
const candidate = createSceneMembership({ scene: initial.scene,
  objects: initial.objects.map(entry => entry.definition.objectId === 'lantern'
    ? { ...entry, placement: replacement } : entry),
});
replacement.point.y = 100;
console.log('original / replacement candidate', getSceneObject(initial, 'lantern'), getSceneObject(candidate, 'lantern'));
const appended = addSceneObject(candidate, { definition: { objectId: 'text-only' } });
const reordered = reorderSceneObjects(appended, ['text-only', 'glow', 'lantern']);
console.log('add/reorder retain placement/attachment', JSON.stringify(reordered.objects));
console.log('no placement required / old keys', Object.keys(getSceneObject(reordered, 'text-only')!));
console.log('empty / null placement', createSceneMembership({ scene: initial.scene }),
  createSceneMembership({ scene: initial.scene,
    objects: [{ definition: { objectId: 'nullable' }, placement: null }] }));
for (const invalid of [
  { coordinateSpaceId: '', point: { x: 0, y: 0 } },
  { coordinateSpaceId: 'bad key', point: { x: 0, y: 0 } },
  { coordinateSpaceId: 'space', point: { x: NaN, y: 0 } },
  { coordinateSpaceId: 'space', point: { x: 0, y: Infinity } },
  { coordinateSpaceId: 'space', point: { x: '2', y: 0 } },
  { coordinateSpaceId: 'space' },
]) {
  try { addSceneObject(initial, { definition: { objectId: 'invalid-placement' },
    placement: invalid as unknown as SceneObjectPlacement }); }
  catch (error) {
    if (!(error instanceof TypeError)) throw error;
    console.log('invalid placement', error.message, 'source count', initial.objects.length);
  }
}
console.log('AUTHORED_PLACEMENT_DATA_ONLY / SPACE_NOT_RESOLVED / NO_CONVERSION / VISUAL_NOT_VERIFIED');
