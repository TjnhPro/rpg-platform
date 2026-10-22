import {
  createAssetCatalog, createAssetReference, diagnoseAssetReference, diagnoseAssetDefinition,
} from '@rpg-platform/editor';

const descriptor = { identity: { projectId: 'sample-project', assetId: 'visual-idle' },
  kind: 'image', metadata: { label: 'Unchanged' },
  sources: [{ role: 'image', locator: { type: 'project-relative' as const, path: 'assets/0012.png' } }] };
const catalog = createAssetCatalog({ projectId: 'sample-project', definitions: [descriptor] });
const reference = createAssetReference({ projectId: 'sample-project', assetId: 'visual-idle', expectedKind: 'image' });
const before = JSON.stringify({ catalog, reference, descriptor });
const valid = diagnoseAssetReference(catalog, reference);
console.log('Valid target / physical files:', valid.status, valid.fileExistence, valid.diagnostic);
console.log('Unknown target:', JSON.stringify(diagnoseAssetReference(catalog, { ...reference, assetId: 'deleted-asset' })));
console.log('Kind mismatch:', JSON.stringify(diagnoseAssetReference(catalog, { ...reference, expectedKind: 'text' })));
console.log('Missing Asset ID:', JSON.stringify(diagnoseAssetReference(catalog, { projectId: 'sample-project' })));
console.log('Invalid reference structure:', JSON.stringify(diagnoseAssetReference(catalog, null)));
console.log('Project mismatch:', JSON.stringify(diagnoseAssetReference(catalog, { ...reference, projectId: 'another-project' })));
console.log('Subresource unverified, never missing:', JSON.stringify(diagnoseAssetReference(catalog, { ...reference, subresourceId: 'opaque-key' })));
console.log('Valid descriptor / physical files:', JSON.stringify(diagnoseAssetDefinition(descriptor)));
console.log('Invalid target structure:', JSON.stringify(diagnoseAssetDefinition(null)));
const invalidLocator = { ...descriptor, identity: { ...descriptor.identity },
  sources: [{ role: 'image', locator: { type: 'project-relative', path: '../outside.png' } }] };
const locatorReport = diagnoseAssetDefinition(invalidLocator);
console.log('Invalid locator:', JSON.stringify(locatorReport));
console.log('Diagnostic result/record/target/details frozen:', Object.isFrozen(locatorReport),
  Object.isFrozen(locatorReport.diagnostic), Object.isFrozen(locatorReport.diagnostic?.target),
  Object.isFrozen(locatorReport.diagnostic?.details));
invalidLocator.identity.assetId = 'host-later-change';
console.log('Captured diagnostic target after host edit:', JSON.stringify(locatorReport.diagnostic?.target));
console.log('Catalog/reference/descriptor unchanged by diagnostics:', before === JSON.stringify({ catalog, reference, descriptor }));
console.log('Physical files: NOT_VERIFIED; no mount, probe or resource loader was used.');
