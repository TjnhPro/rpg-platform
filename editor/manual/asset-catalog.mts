import {
  createAssetCatalog, createAssetDefinition, createAssetReference, getAssetDefinition,
  registerAssetDefinition, updateAssetDefinition, removeAssetDefinition, resolveAssetReference,
} from '@rpg-platform/editor';

const host = { identity: { projectId: 'sample-project', assetId: 'visual-idle', sourceId: '0012' },
  kind: 'image', metadata: { label: 'Original', 'external:producer': { tag: 'retained' } },
  sources: [{ role: 'image', locator: { type: 'project-relative' as const, path: 'assets/0012.png' } }] };
const definition = createAssetDefinition(host);
const empty = createAssetCatalog({ projectId: 'sample-project' });
const registered = registerAssetDefinition(empty, definition);
host.metadata.label = 'Host change';
console.log('Empty/registered snapshot counts:', empty.definitions.length, registered.definitions.length);
console.log('Ordered list:', JSON.stringify(registered.definitions));
const found = getAssetDefinition(registered, 'visual-idle');
console.log('Lookup and frozen catalog/list/definition/metadata:', found?.identity.assetId,
  Object.isFrozen(registered), Object.isFrozen(registered.definitions), Object.isFrozen(found), Object.isFrozen(found?.metadata));

const holderA = createAssetReference({ projectId: 'sample-project', assetId: 'visual-idle', expectedKind: 'image' });
const holderB = createAssetReference({ projectId: 'sample-project', assetId: 'visual-idle' });
const first = resolveAssetReference(registered, holderA);
const second = resolveAssetReference(registered, holderB);
console.log('Two references resolve exact snapshot definition:', first.status, second.status,
  first.status === 'resolved' && second.status === 'resolved' && first.definition === found && second.definition === found);

const candidate = updateAssetDefinition(registered, { ...definition, metadata: { ...definition.metadata, label: 'Candidate' } });
console.log('Old/new labels:', getAssetDefinition(registered, 'visual-idle')?.metadata['label'],
  getAssetDefinition(candidate, 'visual-idle')?.metadata['label']);
console.log('Captured result/holder unchanged:', first.status === 'resolved' ? first.definition.metadata['label'] : first.reason,
  JSON.stringify(holderA));
try {
  registerAssetDefinition(registered, definition);
} catch (error) {
  console.log('Duplicate rejected; original count/label:', error instanceof TypeError,
    registered.definitions.length, getAssetDefinition(registered, 'visual-idle')?.metadata['label']);
}

const unknown = createAssetReference({ projectId: 'sample-project', assetId: 'not-imported' });
console.log('Unknown reference retained:', JSON.stringify(resolveAssetReference(registered, unknown)), JSON.stringify(unknown));
console.log('Other project:', JSON.stringify(resolveAssetReference(registered, { ...holderA, projectId: 'another-project' })));
console.log('Kind expectation mismatch:', JSON.stringify(resolveAssetReference(registered, { ...holderA, expectedKind: 'text' })));
console.log('Opaque subresource remains unresolved:', JSON.stringify(resolveAssetReference(registered, { ...holderA, subresourceId: 'producer supplied address' })));
const removed = removeAssetDefinition(candidate, 'visual-idle');
console.log('Removal leaves prior snapshot:', removed.definitions.length, candidate.definitions.length,
  resolveAssetReference(removed, holderA).status);
