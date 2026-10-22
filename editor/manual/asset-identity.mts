// Manual public consumer, not a test runner. Build the workspace packages first.
import { createAssetIdentity, type AssetIdentityInput } from '@rpg-platform/editor';

// Host-only source fields are not an Asset metadata schema or factory inputs.
const source = {
  projectId: 'sample-project',
  assetId: 'visual-idle',
  sourceId: '0012',
  displayName: '0012.png',
  sourcePath: 'incoming/0012.png',
};
const identity = createAssetIdentity(source);
source.displayName = 'monster-idle.png';
source.sourcePath = 'art/monster-idle.png';
source.assetId = 'changed-host-input';
source.sourceId = '12';
console.log('Frozen detached identity:', identity, Object.isFrozen(identity));
console.log('Edited host source:', source);

const otherProject = createAssetIdentity({ projectId: 'other-project', assetId: identity.assetId });
const textIdentity = createAssetIdentity({ projectId: 'text-project', assetId: 'intro-text', sourceId: null });
console.log('Same local ID, separate project:', otherProject);
console.log('Text identity, no image/path required:', textIdentity);
console.log('Case remains distinct:', createAssetIdentity({ projectId: identity.projectId, assetId: 'Visual-idle' }));

// Example of boundary handling for data arriving without TypeScript guarantees.
// No assertions, suite, matrix or success counters: inspect the printed outcome.
try {
  createAssetIdentity({ projectId: 'sample-project', assetId: '   ' });
} catch (error) {
  console.log('Blank ID rejected:', error instanceof TypeError, error instanceof Error ? error.message : 'unknown');
}
try {
  const untypedData: unknown = { projectId: 'sample-project', sourcePath: '0012.png', sourceId: '0012' };
  createAssetIdentity(untypedData as AssetIdentityInput);
} catch (error) {
  console.log('Path without explicit assetId rejected:', error instanceof TypeError);
}
try {
  const untypedData: unknown = { projectId: 'sample-project', assetId: 12 };
  createAssetIdentity(untypedData as AssetIdentityInput);
} catch (error) {
  console.log('Numeric ID rejected:', error instanceof TypeError);
}
