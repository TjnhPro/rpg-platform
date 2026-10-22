import {
  createSceneObjectDefinition,
  type SceneObjectDefinitionInput,
} from '@rpg-platform/editor';

const host = {
  objectId: 'visual-0012',
  displayName: 'Lantern placeholder',
  classification: 'decoration',
};
const before = JSON.stringify(host);
const first = createSceneObjectDefinition(host);
const recapture = createSceneObjectDefinition(host);
const second = createSceneObjectDefinition({ objectId: 'visual-0013' });
console.log('definitions', first, second);
console.log('capture', {
  inputUnchanged: before === JSON.stringify(host),
  callerMutable: !Object.isFrozen(host),
  detached: first !== host,
  independentCaptures: first !== recapture,
  frozen: Object.isFrozen(first) && Object.isFrozen(second),
});
host.objectId = 'edited-host-id';
host.displayName = 'Renamed host label';
host.classification = 'host-only-label';
console.log('after host edits / repeated reads', first, first.objectId, recapture);
console.log('known fields only', Object.keys(first));
console.log('case retained', createSceneObjectDefinition({ objectId: 'Visual-0012' }));
console.log('same key standalone: no membership registry',
  createSceneObjectDefinition({ objectId: 'visual-0012' }));
for (const invalid of [
  { objectId: '' },
  { objectId: 'bad key' },
  { objectId: 12 },
  { objectId: 'label-example', displayName: '   ' },
  { objectId: 'label-example', classification: {} },
]) {
  try {
    createSceneObjectDefinition(invalid as unknown as SceneObjectDefinitionInput);
  } catch (error) {
    if (!(error instanceof TypeError)) throw error;
    console.log('invalid caller data', error.name, error.message);
  }
}
console.log('AUTHORED_DATA_ONLY / NO_MEMBERSHIP / RENDERING_NOT_PERFORMED / VISUAL_NOT_VERIFIED');
