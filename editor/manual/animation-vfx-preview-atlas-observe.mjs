// Finite real-source inspection; optional CLI consumer, never an automatic test gate.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import * as E from '../dist/index.js';
import { createAnimationPreviewContext } from '../dist/animation-vfx-preview-context.js';
import { inspectAnimationPreviewAtlas } from '../dist/animation-vfx-preview-atlas.js';

export async function observeAtlas(directory = path.resolve('../jx1-manager-editor/data/asset-sources/monster/ani063'), name = 'NormalStand1_0') {
  const projectId = 'preview-observation';
  const root = E.createProjectRootBinding({ projectId, bindingId: 'finite-atlas-root', readPort: null, writePort: null });
  const project = E.createProject({ identity: { projectId, documentId: 'p' }, metadata: { name: 'Finite preview' }, root,
    locator: { type: 'project-relative', path: 'project.json' } });
  const definition = E.createAssetDefinition({ identity: { projectId, assetId: name }, kind: 'image', metadata: {}, sources: [
    { role: 'image', locator: { type: 'project-relative', path: `${name}.png` } },
    { role: 'atlas-metadata', locator: { type: 'project-relative', path: `${name}.tpsheet` } }] });
  const assets = E.createAssetManagerProject(project, root, E.createAssetCatalog({ projectId, definitions: [definition] }));
  E.selectManagedAsset(assets, { projectId, assetId: name, expectedKind: 'image' });
  const scope = { projectId, providerId: Symbol('finite-allowlist'), authorizationGeneration: '1' };
  const provider = { scope, async read(request) {
    const expected = definition.sources[request.sourceIndex];
    if (request.scope.providerId !== scope.providerId || request.scope.authorizationGeneration !== '1'
      || request.identity.projectId !== projectId || request.identity.resourceId !== name
      || expected?.role !== request.source.role || expected.locator.path !== request.source.locator.path)
      return { status: 'failed', code: 'SOURCE_DENIED' };
    const bytes = new Uint8Array(await fs.readFile(path.join(directory, expected.locator.path)));
    if (bytes.length > request.maxBytes) return { status: 'failed', code: 'CONTENT_TOO_LARGE' };
    return { status: 'provided', bytes, contentLength: bytes.length,
      mediaType: expected.role === 'image' ? 'image/png' : 'text/plain', revision: createHash('sha256').update(bytes).digest('hex') };
  } };
  const context = createAnimationPreviewContext({ project, root, assets, grant: { root, provider } }), ticket = context.begin();
  const inventory = await inspectAnimationPreviewAtlas(context, ticket, [{ sourceId: 'image', sourceIndex: 0 }, { sourceId: 'metadata', sourceIndex: 1 }],
    [{ pageId: 'page', imageSourceId: 'image', metadataSourceId: 'metadata', textureReference: `${name}.png` }]);
  return { context, ticket, inventory, project, root, assets, provider };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const observed = await observeAtlas(process.argv[2], process.argv[3]);
  console.log('FRAME_INVENTORY_OBSERVED', observed.inventory.atlas.pages, observed.inventory.atlas.frames.map(frame => frame.key));
  console.log('SOURCE_LOADED', observed.inventory.observations.map(item => ({ role: item.request.source.role, revision: item.revision,
    mediaType: item.mediaType, bytes: item.contentLength })));
  console.log(observed.context.dispose(), 'PIXELS_NOT_VERIFIED');
}
