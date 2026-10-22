import {
  createSceneMembership, createAssetCatalog, describeSceneObjectVisual, getAssetDefinition,
  resolveAssetReference, listSceneObjects, getSceneObject, removeAssetDefinition,
  diagnoseSceneMembership, type SceneObjectVisualDescription,
} from '@rpg-platform/editor';
import { prepareVisualResource, type VisualResourceDescriptor } from '@rpg-platform/runtime-render';

const hostPlacement = { coordinateSpaceId: 'author-space', point: { x: 4, y: 6 } };
const catalog = createAssetCatalog({ projectId: 'demo', definitions: [
  { identity: { projectId: 'demo', assetId: 'lantern-image' }, kind: 'image',
    metadata: { privateAuthoringNote: 'not forwarded' }, sources: [
      { role: 'image', locator: { type: 'project-relative', path: 'art/lantern.png' } },
    ] },
  { identity: { projectId: 'demo', assetId: 'notes' }, kind: 'text', metadata: {} },
  { identity: { projectId: 'demo', assetId: 'sourceless' }, kind: 'image', metadata: {} },
] });
const scene = createSceneMembership({ scene: { identity: { projectId: 'demo', sceneId: 'room' } }, objects: [
  { definition: { objectId: 'left', displayName: 'Left lantern' },
    assetReference: { projectId: 'demo', assetId: 'lantern-image', expectedKind: 'image' },
    placement: hostPlacement, layerKey: 'decorations' },
  { definition: { objectId: 'right' },
    assetReference: { projectId: 'demo', assetId: 'lantern-image', expectedKind: 'image' },
    placement: { coordinateSpaceId: 'author-space', point: { x: 20, y: -3 } },
    attachment: { kind: 'attachment', target: { sceneId: 'room', objectId: 'left' } } },
] });
const before = JSON.stringify(scene);
const left: SceneObjectVisualDescription = describeSceneObjectVisual(scene, 'left', catalog, 'image/png');
const right = describeSceneObjectVisual(scene, 'right', catalog);
const leftResolution = resolveAssetReference(catalog, getSceneObject(scene, 'left')!.assetReference!);
const rightResolution = resolveAssetReference(catalog, getSceneObject(scene, 'right')!.assetReference!);
console.log('one canonical Asset definition', leftResolution.status === 'resolved' && rightResolution.status === 'resolved'
  && leftResolution.definition === rightResolution.definition && leftResolution.definition === getAssetDefinition(catalog, 'lantern-image'));
hostPlacement.point.x = 100;
console.log('two distinct descriptions / placements', JSON.stringify({ left, right }));
console.log('ordered caller projection', listSceneObjects(scene).map(entry =>
  describeSceneObjectVisual(scene, entry.definition.objectId, catalog).correlation.objectId));
if (left.status === 'described' && right.status === 'described') {
  const neutral: VisualResourceDescriptor = left.descriptor;
  const preparedLeft = prepareVisualResource(neutral);
  const preparedRight = prepareVisualResource(right.descriptor);
  console.log('real public Render handoff', JSON.stringify({ preparedLeft, preparedRight }));
  console.log('boundary / detachment', {
    distinctDescriptions: left !== right,
    projectionDetached: !Object.is(left.placement, getSceneObject(scene, 'left')?.placement),
    frozen: Object.isFrozen(left) && Object.isFrozen(left.correlation) && Object.isFrozen(left.placement?.point)
      && Object.isFrozen(left.descriptor.sources[0]?.locator),
    renderDetached: neutral !== preparedLeft.descriptor,
    descriptorKeys: Object.keys(neutral),
    resourceIdentityKeys: Object.keys(neutral.identity),
    mediaHints: [left.descriptor.mediaType, right.descriptor.mediaType],
  });
}
const absentCatalogEntry = removeAssetDefinition(catalog, 'lantern-image');
console.log('missing Asset projection', JSON.stringify(describeSceneObjectVisual(scene, 'left', absentCatalogEntry)));
console.log('missing Asset diagnostics remain separate', JSON.stringify(diagnoseSceneMembership(scene, absentCatalogEntry)));
const unsupported = createSceneMembership({ scene: scene.scene, objects: [
  { definition: { objectId: 'text-only' } },
  { definition: { objectId: 'nonvisual' }, assetReference: { projectId: 'demo', assetId: 'notes' } },
  { definition: { objectId: 'no-image-source' }, assetReference: { projectId: 'demo', assetId: 'sourceless' } },
] });
console.log('explicit unsupported cases', JSON.stringify(listSceneObjects(unsupported).map(entry =>
  describeSceneObjectVisual(unsupported, entry.definition.objectId, catalog))));
try { describeSceneObjectVisual(scene, 'missing', catalog); }
catch (error) { if (!(error instanceof TypeError)) throw error; console.log('missing object', error.message); }
try { describeSceneObjectVisual(scene, 'bad key', catalog); }
catch (error) { if (!(error instanceof TypeError)) throw error; console.log('invalid object ID', error.message); }
console.log('scene unchanged', before === JSON.stringify(scene));
console.log('RESOURCE_METADATA_HANDOFF_ONLY / PLACEMENT_NOT_CONSUMED_BY_RENDER / RESOURCE_LOADING_NOT_PERFORMED / VISUAL_NOT_VERIFIED');
