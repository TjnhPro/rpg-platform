import { createAssetCatalog, resolveAssetReference, describeResolvedVisualAsset } from '@rpg-platform/editor';
import { prepareVisualResource, type VisualResourceDescriptor } from '@rpg-platform/runtime-render';

const catalog = createAssetCatalog({ projectId: 'sample-project', definitions: [
  { identity: { projectId: 'sample-project', assetId: 'visual-idle', sourceId: '0012' }, kind: 'image', metadata: { vendor: 'retained in authoring' }, sources: [
    { role: 'image', locator: { type: 'project-relative', path: 'assets/0012.png' } },
    { role: 'atlas-metadata', locator: { type: 'project-relative', path: 'assets/0012.tpsheet' } },
  ] },
  { identity: { projectId: 'sample-project', assetId: 'notes' }, kind: 'text', metadata: {} },
  { identity: { projectId: 'sample-project', assetId: 'no-source' }, kind: 'image', metadata: {} },
] });
for (const assetId of ['visual-idle', 'notes', 'missing', 'no-source']) {
  const resolution = resolveAssetReference(catalog, { projectId: 'sample-project', assetId });
  const handoff = describeResolvedVisualAsset(resolution, 'image/png');
  console.log(assetId, handoff);
  if (handoff.status === 'described') {
    const prepared = prepareVisualResource(handoff.descriptor);
    console.log('Render consumption', JSON.stringify(prepared));
    // Transport illustrates a future independent producer; no Client integration.
    const transported = JSON.parse(JSON.stringify(handoff.descriptor)) as VisualResourceDescriptor;
    const detached = prepareVisualResource(transported);
    console.log('portable/frozen', JSON.stringify(detached) === JSON.stringify(prepared),
      detached.descriptor !== transported, Object.isFrozen(detached.descriptor.sources[0]?.locator));
    try { prepareVisualResource({ ...transported, mediaType: 'text/plain' }); }
    catch (error) { console.log('nonimage hint rejected', error instanceof TypeError, String(error)); }
    try { prepareVisualResource({ ...transported, sources: [] }); }
    catch (error) { console.log('missing image role rejected', error instanceof TypeError, String(error)); }
  }
}
console.log('authored metadata retained', catalog.definitions[0]?.metadata);
