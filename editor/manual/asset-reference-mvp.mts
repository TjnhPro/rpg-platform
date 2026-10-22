import {
  createAssetCatalog, createAssetDefinition, registerAssetDefinition, createAssetReference,
  resolveAssetReference, relocateAssetSource, rebindAssetReference, diagnoseAssetReference,
  describeResolvedVisualAsset, type AssetReferenceDiagnosticResult,
} from '@rpg-platform/editor';
import { prepareVisualResource } from '@rpg-platform/runtime-render';

// Optional data-flow demonstration. Every locator is illustrative; no asset IO.
const image = createAssetDefinition({
  identity: { projectId: 'sample-project', assetId: 'monster-0012', sourceId: '0012' },
  kind: 'image', metadata: { label: 'Illustrative visual' },
  sources: [
    { role: 'image', locator: { type: 'project-relative', path: 'assets/0012.png' } },
    { role: 'atlas-metadata', locator: { type: 'project-relative', path: 'assets/0012.tpsheet' } },
  ],
});
const empty = createAssetCatalog({ projectId: image.identity.projectId });
const catalog = registerAssetDefinition(empty, image);
console.log('register', JSON.stringify({ emptyCount: empty.definitions.length, definitions: catalog.definitions }));

// Caller-local holders only; these are not Scene/Map objects or game entities.
const holderA = Object.freeze({ id: 'holder-a', reference: createAssetReference({
  projectId: image.identity.projectId, assetId: image.identity.assetId, expectedKind: 'image',
}) });
const holderB = Object.freeze({ id: 'holder-b', reference: createAssetReference({ ...holderA.reference }) });
const original = JSON.stringify({ catalog, holderA, holderB });
const first = resolveAssetReference(catalog, holderA.reference);
const second = resolveAssetReference(catalog, holderB.reference);
console.log('two holders', JSON.stringify({ holderA, holderB,
  independentReferences: holderA.reference !== holderB.reference,
  statuses: [first.status, second.status],
  sameDefinition: first.status === 'resolved' && second.status === 'resolved' && first.definition === second.definition,
}));

const moved = relocateAssetSource(catalog, image.identity.assetId, 0,
  { type: 'project-relative', path: 'assets/relocated/0012.png' });
const afterA = resolveAssetReference(moved, holderA.reference);
const afterB = resolveAssetReference(moved, holderB.reference);
console.log('relocate', JSON.stringify({ identity: moved.definitions[0]?.identity,
  sources: moved.definitions[0]?.sources, holderA, holderB,
  statuses: [afterA.status, afterB.status],
  sameDefinition: afterA.status === 'resolved' && afterB.status === 'resolved' && afterA.definition === afterB.definition,
  oldPng: catalog.definitions[0]?.sources[0]?.locator.path,
}));

const unknown = createAssetReference({ ...holderA.reference, assetId: 'unknown-asset' });
const wrongKind = createAssetReference({ ...holderA.reference, expectedKind: 'text' });
const missingDiagnostic: AssetReferenceDiagnosticResult = diagnoseAssetReference(moved, unknown);
const kindDiagnostic: AssetReferenceDiagnosticResult = diagnoseAssetReference(moved, wrongKind);
console.log('missing diagnostic', JSON.stringify({ input: unknown, result: missingDiagnostic }));
console.log('kind diagnostic', JSON.stringify({ input: wrongKind, result: kindDiagnostic }));

// Declare the alternate target explicitly; no missing-reference repair/auto-create.
const withAlternate = registerAssetDefinition(moved, {
  identity: { projectId: image.identity.projectId, assetId: 'alternate-visual', sourceId: '0013' },
  kind: 'image', metadata: {},
  sources: [{ role: 'image', locator: { type: 'project-relative', path: 'assets/0013.png' } }],
});
const reboundHolderA = Object.freeze({ ...holderA,
  reference: rebindAssetReference(withAlternate, holderA.reference, 'alternate-visual'),
});
console.log('explicit rebind', JSON.stringify({ reboundHolderA, originalHolderA: holderA, holderB,
  statuses: [resolveAssetReference(withAlternate, reboundHolderA.reference).status,
    resolveAssetReference(withAlternate, holderB.reference).status],
}));

const description = describeResolvedVisualAsset(afterB, 'image/png');
console.log('Editor description', JSON.stringify(description));
if (description.status === 'described') {
  console.log('Render handoff', JSON.stringify(prepareVisualResource(description.descriptor)));
}
console.log('retained observations', JSON.stringify({
  originalCatalogAndHoldersUnchanged: original === JSON.stringify({ catalog, holderA, holderB }),
  unknown, wrongKind, movedCatalogIds: moved.definitions.map(definition => definition.identity.assetId),
}));
console.log('ASSET_CONTENT_NOT_LOADED; fileExistence: NOT_CHECKED; VISUAL_NOT_VERIFIED');
