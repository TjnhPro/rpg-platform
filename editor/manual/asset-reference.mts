import { createAssetReference, createAssetDefinition, type AssetReferenceInput } from '@rpg-platform/editor';

// Two caller-local holders, not Scene/Object/Entity APIs or stored target objects.
const hostTarget = { projectId: 'sample-project', assetId: 'visual-idle', expectedKind: 'image' };
const holderA = { label: 'first placement', asset: createAssetReference(hostTarget) };
const holderB = { label: 'second placement', asset: createAssetReference({ projectId: 'sample-project', assetId: 'visual-idle' }) };
hostTarget.assetId = 'host-only-change';
console.log('Independent holder references:', JSON.stringify([holderA, holderB]));
console.log('Frozen/distinct/same target:', Object.isFrozen(holderA.asset), Object.isFrozen(holderB.asset),
  holderA.asset !== holderB.asset,
  holderA.asset.projectId === holderB.asset.projectId && holderA.asset.assetId === holderB.asset.assetId);

const definition = createAssetDefinition({
  identity: { projectId: 'sample-project', assetId: 'visual-idle', sourceId: '0012' },
  kind: 'image', metadata: {},
  sources: [{ role: 'image', locator: { type: 'project-relative', path: 'assets/0012.png' } }],
});
const relocated = createAssetDefinition({ ...definition,
  sources: [{ role: 'image', locator: { type: 'project-relative', path: 'moved/idle.png' } }],
});
console.log('Relocation keeps reference target:', holderA.asset.assetId === relocated.identity.assetId
  && holderA.asset.projectId === relocated.identity.projectId, JSON.stringify(holderA.asset));

// Task-requested opaque address: illustrative text only, no atlas discovery/parser.
const forward = createAssetReference({ projectId: 'sample-project', assetId: 'not-imported',
  expectedKind: 'vendor:visual-data', subresourceId: 'producer supplied address' });
const edges: AssetReferenceInput[] = [forward, holderA.asset];
const dependent = createAssetDefinition({ identity: { projectId: 'sample-project', assetId: 'dependent-visual' },
  kind: 'vendor:visual-data', metadata: {}, dependencies: edges });
edges.pop();
console.log('Forward dependency data without a catalog:', JSON.stringify(dependent.dependencies));
console.log('Frozen detached direct edges:', Object.isFrozen(dependent.dependencies),
  Object.isFrozen(dependent.dependencies[0]), dependent.dependencies.length, edges.length);

try {
  createAssetReference({ projectId: 'sample-project' } as AssetReferenceInput);
} catch (error) {
  console.log('Missing target key rejected:', error instanceof TypeError, error instanceof Error ? error.message : error);
}
try {
  createAssetDefinition({ ...dependent, dependencies: [holderA.asset, holderB.asset] });
} catch (error) {
  console.log('Duplicate direct target rejected:', error instanceof TypeError, error instanceof Error ? error.message : error);
}
try {
  createAssetDefinition({ ...dependent, dependencies: [{ projectId: 'other-project', assetId: 'visual-idle' }] });
} catch (error) {
  console.log('Cross-project edge rejected:', error instanceof TypeError, error instanceof Error ? error.message : error);
}
