import {
  diagnoseSceneMembership, createSceneMembership, createAssetCatalog, createAssetDefinition,
  removeAssetDefinition, removeSceneObject, type SceneMembershipInput, type SceneMembershipDiagnosticResult,
} from '@rpg-platform/editor';

const scene = { identity: { projectId: 'demo', sceneId: 'room' } };
const input: SceneMembershipInput = { scene, objects: [
  { definition: { objectId: 'lamp' }, assetReference: { projectId: 'demo', assetId: 'image', expectedKind: 'image' } },
  { definition: { objectId: 'glow' }, attachment: { kind: 'attachment', target: { sceneId: 'room', objectId: 'lamp' } } },
] };
const original = createSceneMembership(input);
const originalText = JSON.stringify(original);
const catalog = createAssetCatalog({ projectId: 'demo', definitions: [
  createAssetDefinition({ identity: { projectId: 'demo', assetId: 'image' }, kind: 'image', metadata: {} }),
] });
const empty: SceneMembershipDiagnosticResult = diagnoseSceneMembership({ scene }, catalog);
console.log('empty valid', JSON.stringify(empty));
console.log('present Asset', JSON.stringify(diagnoseSceneMembership(original, catalog)));
console.log('absent catalog', JSON.stringify(diagnoseSceneMembership(original)));
const assetDeleted = removeAssetDefinition(catalog, 'image');
const assetMissing = diagnoseSceneMembership(original, assetDeleted);
console.log('Asset deleted / file NOT_CHECKED', JSON.stringify(assetMissing));
const dangling = removeSceneObject(original, 'lamp');
console.log('dangling local object', JSON.stringify(diagnoseSceneMembership(dangling)));
console.log('kind mismatch', JSON.stringify(diagnoseSceneMembership({ scene, objects: [
  { definition: { objectId: 'lamp' }, assetReference: { projectId: 'demo', assetId: 'image', expectedKind: 'audio' } },
] }, catalog)));
console.log('subresource unsupported', JSON.stringify(diagnoseSceneMembership({ scene, objects: [
  { definition: { objectId: 'lamp' }, assetReference: { projectId: 'demo', assetId: 'image', subresourceId: 'frame' } },
] }, catalog)));
console.log('wrong project catalog', JSON.stringify(diagnoseSceneMembership(original, createAssetCatalog({ projectId: 'other' }))));
console.log('malformed', JSON.stringify(diagnoseSceneMembership(null)));
console.log('duplicate', JSON.stringify(diagnoseSceneMembership({ scene, objects: [
  { definition: { objectId: 'lamp' } }, { definition: { objectId: 'lamp' } },
] })));
console.log('invalid placement', JSON.stringify(diagnoseSceneMembership({ scene, objects: [
  { definition: { objectId: 'lamp' }, placement: { coordinateSpaceId: 'author', point: { x: NaN, y: 0 } } },
] })));
console.log('invalid Asset reference', JSON.stringify(diagnoseSceneMembership({ scene, objects: [
  { definition: { objectId: 'lamp' }, assetReference: { projectId: 'demo', assetId: '' } },
] }, catalog)));
console.log('inconsistent project binding', JSON.stringify(diagnoseSceneMembership({ scene, objects: [
  { definition: { objectId: 'lamp' }, assetReference: { projectId: 'foreign', assetId: 'image' } },
] })));
console.log('self relation', JSON.stringify(diagnoseSceneMembership({ scene, objects: [
  { definition: { objectId: 'lamp' }, attachment: { kind: 'attachment', target: { sceneId: 'room', objectId: 'lamp' } } },
] })));
console.log('cross Scene relation', JSON.stringify(diagnoseSceneMembership({ scene, objects: [
  { definition: { objectId: 'lamp' }, attachment: { kind: 'attachment', target: { sceneId: 'other', objectId: 'glow' } } },
] })));
console.log('missing relation key', JSON.stringify(diagnoseSceneMembership({ scene, objects: [
  { definition: { objectId: 'lamp' }, attachment: { kind: 'attachment', target: { sceneId: 'room' } } },
] })));
console.log('nonhierarchical reciprocal attachments', JSON.stringify(diagnoseSceneMembership({ scene, objects: [
  { definition: { objectId: 'lamp' }, attachment: { kind: 'attachment', target: { sceneId: 'room', objectId: 'glow' } } },
  { definition: { objectId: 'glow' }, attachment: { kind: 'attachment', target: { sceneId: 'room', objectId: 'lamp' } } },
] })));
console.log('multiple unresolved in declaration order', JSON.stringify(diagnoseSceneMembership({ scene, objects: [
  { definition: { objectId: 'orphan' }, attachment: { kind: 'attachment', target: { sceneId: 'room', objectId: 'lost' } },
    assetReference: { projectId: 'demo', assetId: 'gone' } },
] }, assetDeleted)));
const hostError = new TypeError('host accessor');
try { diagnoseSceneMembership({ get scene() { throw hostError; } }); }
catch (error) { console.log('unknown host exception propagated', error === hostError); }
console.log('no mutation / frozen result', {
  sourceUnchanged: originalText === JSON.stringify(original),
  detachedSnapshot: assetMissing.membership !== original,
  frozen: Object.isFrozen(assetMissing) && Object.isFrozen(assetMissing.diagnostics)
    && Object.isFrozen(assetMissing.diagnostics[0]) && Object.isFrozen(assetMissing.diagnostics[0]?.target)
    && Object.isFrozen(assetMissing.diagnostics[0]?.details),
});
console.log('AUTHORED_DIAGNOSTICS_ONLY / FILE_EXISTENCE_NOT_CHECKED / CYCLE_POLICY_DEFERRED / VISUAL_NOT_VERIFIED');
