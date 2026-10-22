import {
  createAssetDefinition, createResourceLocator,
  type AssetSourceReference, type ResourceLocator,
} from '@rpg-platform/editor';

// Illustrative names only. No PNG/TPSheet bytes are read or parsed.
const hostSources: AssetSourceReference[] = [
  { role: 'image', locator: { type: 'project-relative', path: 'assets/0012.png' } },
  { role: 'atlas-metadata', locator: { type: 'project-relative', path: 'assets/0012.tpsheet' } },
];
const composite = createAssetDefinition({
  identity: { projectId: 'sample-project', assetId: 'visual-idle', sourceId: '0012' },
  kind: 'image', metadata: {}, sources: hostSources,
});
hostSources.splice(0, 1);
console.log('Composite under one identity:', JSON.stringify(composite));
console.log('Frozen definition/list/reference/locator:', Object.isFrozen(composite),
  Object.isFrozen(composite.sources), Object.isFrozen(composite.sources[0]),
  Object.isFrozen(composite.sources[0]?.locator));
console.log('Detached host source count:', hostSources.length, 'authored count:', composite.sources.length);

const relocated = createAssetDefinition({
  ...composite,
  sources: [
    { role: 'image', locator: createResourceLocator({ type: 'project-relative', path: 'moved/idle.png' }) },
    { role: 'atlas-metadata', locator: { type: 'project-relative', path: 'moved/idle.tpsheet' } },
    { role: 'image', locator: { type: 'project-relative', path: 'moved/idle-page-2.png' } },
  ],
});
console.log('Moved/multipage sources keep logical identity:',
  relocated.identity.projectId === composite.identity.projectId && relocated.identity.assetId === composite.identity.assetId,
  JSON.stringify(relocated.sources));

try {
  createResourceLocator({ type: 'project-relative', path: '../outside.png' });
} catch (error) {
  console.log('Traversal rejected:', error instanceof TypeError, error instanceof Error ? error.message : error);
}
try {
  createResourceLocator({ type: 'remote', path: 'https://example.invalid/0012.png' } as unknown as ResourceLocator);
} catch (error) {
  console.log('Unsupported locator rejected:', error instanceof TypeError, error instanceof Error ? error.message : error);
}
try {
  createAssetDefinition({ ...composite, sources: [...composite.sources, ...composite.sources] });
} catch (error) {
  console.log('Duplicate pair rejected:', error instanceof TypeError, error instanceof Error ? error.message : error);
}
