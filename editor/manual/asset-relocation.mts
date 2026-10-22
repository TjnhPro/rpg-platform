import {
  createAssetCatalog, createAssetDefinition, createAssetReference, getAssetDefinition,
  relocateAssetSource, rebindAssetReference, readAssetDefinitionSnapshot, diagnoseAssetReference,
} from '@rpg-platform/editor';

const original = createAssetDefinition({
  identity: { projectId: 'sample-project', assetId: 'visual-idle', sourceId: '0012' }, kind: 'image',
  metadata: { label: 'Idle', 'vendor:future': { revisionHint: 7, opaque: ['retained', null] } },
  sources: [
    { role: 'image', locator: { type: 'project-relative', path: 'assets/0012.png' } },
    { role: 'atlas-metadata', locator: { type: 'project-relative', path: 'assets/0012.tpsheet' } },
  ],
  dependencies: [{ projectId: 'sample-project', assetId: 'alternate-image', expectedKind: 'image' }],
});
const catalog = createAssetCatalog({ projectId: 'sample-project', definitions: [original,
  { identity: { projectId: 'sample-project', assetId: 'alternate-image' }, kind: 'image', metadata: {} },
  { identity: { projectId: 'sample-project', assetId: 'text-data' }, kind: 'text', metadata: {} },
] });
const holderA = createAssetReference({ projectId: 'sample-project', assetId: 'visual-idle', expectedKind: 'image' });
const holderB = createAssetReference({ ...holderA });
const before = JSON.stringify({ catalog, holderA, holderB });
const moved = relocateAssetSource(catalog, 'visual-idle', 0,
  { type: 'project-relative', path: 'assets/monsters/0012.png' });
const movedDefinition = getAssetDefinition(moved, 'visual-idle')!;
console.log('Logical identity retained:', JSON.stringify(movedDefinition.identity));
console.log('Old/new locator:', original.sources[0]?.locator.path, movedDefinition.sources[0]?.locator.path);
console.log('Other source/metadata/dependencies retained:', JSON.stringify(movedDefinition.sources[1]),
  JSON.stringify(movedDefinition.metadata), JSON.stringify(movedDefinition.dependencies));
console.log('Two old refs after relocation:', diagnoseAssetReference(moved, holderA).status,
  diagnoseAssetReference(moved, holderB).status, diagnoseAssetReference(moved, holderA).fileExistence);
const selectedCandidate = rebindAssetReference(moved, holderA, 'alternate-image');
console.log('Selected candidate/original/other target:', selectedCandidate.assetId, holderA.assetId, holderB.assetId);
console.log('Rebound target:', diagnoseAssetReference(moved, selectedCandidate).status);
try { rebindAssetReference(moved, holderA, 'text-data'); }
catch (error) { console.log('Wrong-kind rebind rejected:', error instanceof TypeError, error instanceof Error ? error.message : 'unknown'); }
const missing = createAssetReference({ ...holderA, assetId: 'removed-asset' });
console.log('Explicit relink missing target:', rebindAssetReference(moved, missing, 'alternate-image').assetId, missing.assetId);
try { relocateAssetSource(moved, 'visual-idle', 0, { type: 'project-relative', path: '../outside.png' }); }
catch (error) { console.log('Invalid relocation rejected:', error instanceof TypeError); }

const bytes = JSON.stringify(movedDefinition);
const decoded: unknown = JSON.parse(bytes);
const roundTrip = readAssetDefinitionSnapshot(decoded);
console.log('Round-trip current snapshot equality:', JSON.stringify(roundTrip) === bytes);
console.log('Round-trip version/identity/roles/extensions:', roundTrip.schemaVersion, JSON.stringify(roundTrip.identity),
  roundTrip.sources.map((source) => source.role).join(','), JSON.stringify(roundTrip.metadata['vendor:future']));
console.log('Reader detached/frozen:', roundTrip !== decoded, Object.isFrozen(roundTrip), Object.isFrozen(roundTrip.metadata));
const futureVersion = { ...movedDefinition, schemaVersion: 2, futureField: { retained: true } };
const futureBytes = JSON.stringify(futureVersion);
try { readAssetDefinitionSnapshot(futureVersion); }
catch (error) { console.log('Unsupported version:', error instanceof TypeError, error instanceof Error ? error.message : 'unknown'); }
console.log('Unsupported original retained:', futureBytes === JSON.stringify(futureVersion));
try { readAssetDefinitionSnapshot({ ...movedDefinition, futureField: { retained: true } }); }
catch (error) { console.log('Unknown structural field rejected:', error instanceof TypeError, error instanceof Error ? error.message : 'unknown'); }
console.log('Original catalog and both holders unchanged:', before === JSON.stringify({ catalog, holderA, holderB }));
console.log('Physical files: NOT_VERIFIED; no copy/move/read/write, loader or persistent host commit.');
