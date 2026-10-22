import {
  createSceneIdentity, createSceneDefinition, createSceneObjectDefinition,
  createSceneMembership, addSceneObject, listSceneObjects, getSceneObject,
  replaceSceneObject, updateSceneObjectPlacement, reorderSceneObjects, removeSceneObject,
} from '@rpg-platform/editor';

// Finite authoring observations only. No persistence, renderer or test assertions.
const identity = createSceneIdentity({ projectId: 'demo', sceneId: 'room' });
const hostDefinition = { objectId: 'lantern', displayName: 'Lantern',
  classification: 'decoration', futureNote: { text: 'caller-owned' } };
const hostInput = { scene: createSceneDefinition({ identity }), activeTab: 'inspector', objects: [
  { definition: hostDefinition,
    assetReference: { projectId: 'demo', assetId: 'lantern-image', expectedKind: 'image' },
    layerKey: 'decorations' },
] };
const original = createSceneMembership(hostInput);
const added = addSceneObject(original, { definition: createSceneObjectDefinition({ objectId: 'glow' }),
  attachment: { kind: 'attachment', target: { sceneId: identity.sceneId, objectId: 'lantern' } } });
const current = getSceneObject(added, 'lantern')!;
const renamedLabel = replaceSceneObject(added, 'lantern', { ...current,
  definition: { ...current.definition, displayName: 'Warm lantern' } });
const placed = updateSceneObjectPlacement(renamedLabel, 'lantern', {
  coordinateSpaceId: 'author-space', point: { x: 4, y: 6 },
});
const ordered = reorderSceneObjects(placed, ['glow', 'lantern']);
const glow = getSceneObject(ordered, 'glow')!;
const detachedRelation = replaceSceneObject(ordered, 'glow', { ...glow, attachment: null });
const final = removeSceneObject(detachedRelation, 'glow');
console.log('assembled / final snapshots', JSON.stringify({ original, final }));
console.log('identity and binding through unrelated edits',
  [original, added, renamedLabel, placed, ordered, detachedRelation, final].map(snapshot => ({
    scene: snapshot.scene.identity,
    objectId: getSceneObject(snapshot, 'lantern')?.definition.objectId,
    assetReference: getSceneObject(snapshot, 'lantern')?.assetReference,
    order: listSceneObjects(snapshot).map(entry => entry.definition.objectId),
  })));
console.log('retained relationship candidates', JSON.stringify({
  attached: getSceneObject(added, 'glow')?.attachment,
  cleared: getSceneObject(detachedRelation, 'glow')?.attachment,
  removed: getSceneObject(final, 'glow') ?? null,
}));
hostDefinition.displayName = 'Host edit after capture';
hostDefinition.futureNote.text = 'still caller-owned';
console.log('known fields only / caller retains unknown data', {
  membershipKeys: Object.keys(final),
  sceneKeys: Object.keys(final.scene),
  entryKeys: Object.keys(getSceneObject(final, 'lantern')!),
  definitionKeys: Object.keys(getSceneObject(final, 'lantern')!.definition),
  originalLabel: getSceneObject(original, 'lantern')?.definition.displayName,
  finalLabel: getSceneObject(final, 'lantern')?.definition.displayName,
  callerNote: hostDefinition.futureNote.text,
  callerActiveTab: hostInput.activeTab,
  capturedFrozen: Object.isFrozen(final) && Object.isFrozen(final.scene.identity)
    && Object.isFrozen(final.objects) && Object.isFrozen(final.objects[0]?.definition)
    && Object.isFrozen(final.objects[0]?.assetReference) && Object.isFrozen(final.objects[0]?.placement?.point),
  callerStillMutable: !Object.isFrozen(hostDefinition) && !Object.isFrozen(hostDefinition.futureNote),
});
console.log('AUTHORED_RECORDS_ONLY / UNKNOWN_FIELDS_NOT_ROUND_TRIPPED / NO_DOCUMENT_IO / VISUAL_NOT_VERIFIED');
