import {
  createSceneMembership, addSceneObject, getSceneObject, removeSceneObject,
  replaceSceneObject, updateSceneObjectPlacement, reorderSceneObjects,
} from '@rpg-platform/editor';

const original = createSceneMembership({
  scene: { identity: { projectId: 'demo', sceneId: 'room' } },
  objects: [{ definition: { objectId: 'lamp', displayName: 'Lamp', classification: 'decoration' },
    assetReference: { projectId: 'demo', assetId: 'lamp-image', expectedKind: 'image' },
    layerKey: 'decorations', placement: { coordinateSpaceId: 'author', point: { x: 1, y: 2 } } }],
});
const originalText = JSON.stringify(original);
const added = addSceneObject(original, { definition: { objectId: 'glow' },
  attachment: { kind: 'attachment', target: { sceneId: 'room', objectId: 'lamp' } } });
const hostPlacement = { coordinateSpaceId: 'author', point: { x: 4, y: 6 } };
const replaced = replaceSceneObject(added, 'lamp', { ...getSceneObject(added, 'lamp')!, placement: hostPlacement });
const updated = updateSceneObjectPlacement(replaced, 'lamp', {
  coordinateSpaceId: 'other-space', point: { x: -8, y: 0 },
});
const removed = removeSceneObject(updated, 'lamp');
hostPlacement.point.x = 99;
console.log('add -> replace -> update -> remove', JSON.stringify({ original, added, replaced, updated, removed }));
console.log('capture / original', {
  originalUnchanged: originalText === JSON.stringify(original),
  freshCandidates: original !== added && added !== replaced && replaced !== updated && updated !== removed,
  hostStillMutable: !Object.isFrozen(hostPlacement.point),
  detachedPoint: !Object.is(getSceneObject(replaced, 'lamp')?.placement?.point, hostPlacement.point),
  frozenSnapshot: Object.isFrozen(updated) && Object.isFrozen(updated.scene.identity)
    && Object.isFrozen(updated.objects) && Object.isFrozen(updated.objects[0])
    && Object.isFrozen(updated.objects[0]?.definition) && Object.isFrozen(updated.objects[0]?.assetReference)
    && Object.isFrozen(updated.objects[0]?.placement?.point),
});
const cleared = updateSceneObjectPlacement(updated, 'lamp', null);
const relationshipChanged = replaceSceneObject(added, 'glow', { ...getSceneObject(added, 'glow')!, attachment: null });
console.log('clear placement / relationship / reorder', JSON.stringify({ cleared, relationshipChanged,
  reordered: reorderSceneObjects(updated, ['glow', 'lamp']) }));
console.log('complete replacement clears optional metadata',
  JSON.stringify(replaceSceneObject(updated, 'lamp', { definition: { objectId: 'lamp' } })));
const independent = createSceneMembership({ scene: { identity: { projectId: 'demo', sceneId: 'other-room' } },
  objects: [{ definition: { objectId: 'lamp' } }] });
console.log('independent Scene unchanged', JSON.stringify(independent));
try { removeSceneObject(updated, 'missing'); }
catch (error) { if (!(error instanceof TypeError)) throw error; console.log('missing remove', error.message); }
try { replaceSceneObject(updated, 'missing', { definition: { objectId: 'lamp' } }); }
catch (error) { if (!(error instanceof TypeError)) throw error; console.log('missing replace', error.message); }
try { updateSceneObjectPlacement(updated, 'missing', null); }
catch (error) { if (!(error instanceof TypeError)) throw error; console.log('missing update', error.message); }
try { removeSceneObject(updated, 'bad key'); }
catch (error) { if (!(error instanceof TypeError)) throw error; console.log('invalid identity', error.message); }
try { replaceSceneObject(updated, 'lamp', { definition: { objectId: 'renamed' } }); }
catch (error) { if (!(error instanceof TypeError)) throw error; console.log('rename rejected', error.message); }
try { updateSceneObjectPlacement(updated, 'lamp', { coordinateSpaceId: 'author', point: { x: NaN, y: 0 } }); }
catch (error) { if (!(error instanceof TypeError)) throw error; console.log('invalid placement', error.message); }
try { replaceSceneObject(updated, 'lamp', { ...getSceneObject(updated, 'lamp')!,
  assetReference: { projectId: 'foreign', assetId: 'image' } }); }
catch (error) { if (!(error instanceof TypeError)) throw error; console.log('foreign Asset', error.message); }
console.log('retained snapshots after failures', JSON.stringify({ original, updated, independent }));
console.log('AUTHORED_CANDIDATES_ONLY / NO_HISTORY_STORE / VISUAL_NOT_VERIFIED');
