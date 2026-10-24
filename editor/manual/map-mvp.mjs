// Optional finite real-file demonstration; no test runner or automatic gate.
import * as E from '@rpg-platform/editor';
import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createMapFilesystemHost } from './map-filesystem-host.mjs';
import { createSampleMap } from './map-sample.mjs';

export async function prepareMapMvp() {
  const host = await createMapFilesystemHost(), root = host.roots.get('game-a'), other = host.roots.get('game-b');
  const sample = createSampleMap(root.binding), manager = E.createAssetManagerProject(sample.project, root.binding);
  const observations = { async observe(request) {
    if (request.projectId !== 'game-a' || request.bindingId !== root.binding.bindingId)
      return { status: 'unverified', reason: 'denied' };
    try { const bytes = await root.readBytes(request.locator.path);
      return { status: 'available', observation: { projectId: 'game-a', bindingId: request.bindingId, locator: request.locator.path,
        revision: createHash('sha256').update(bytes).digest('hex'), byteLength: bytes.length } };
    } catch { return { status: 'unverified', reason: 'denied' }; }
  } };
  const assetReferences = [];
  for (const [assetId, sourcePath, category] of [['item', 'sprites/background.png', 'background'], ['player', 'sprites/player.png', 'tile']]) {
    const source = { role: 'image', locator: { type: 'project-relative', path: sourcePath } };
    const registered = await E.registerExistingAssetResource(manager, { operation: 'register-existing', root: root.binding,
      definition: { identity: { projectId: 'game-a', assetId }, kind: 'image', metadata: { editorDisplayName: category }, sources: [source] },
      source, documentIdentity: { projectId: 'game-a', documentId: assetId },
      documentLocator: { type: 'project-relative', path: `${assetId}.asset.json` } }, observations);
    console.log('PNG_REGISTER', assetId, registered.status, registered.observation);
    if (registered.status !== 'admitted') throw new Error('Real PNG registration unavailable');
    const candidate = registered.candidate;
    E.adoptAssetManagerCatalog(manager, candidate.catalog, candidate.generation);
    const document = E.createDocumentSession(candidate.document, null); document.open();
    const saved = await E.saveDocument(document, root.binding.writePort, candidate.reference.locator.path, { kind: 'absent' },
      { owner: 'asset', documentKind: 'asset', contentSchemaVersion: 1 });
    console.log('ASSET_SAVE', assetId, saved.status); document.close('discard');
    if (saved.status !== 'committed') throw new Error('Stop at partial per-file receipt');
    assetReferences.push(candidate.reference);
  }
  const catalog = E.getAssetManagerProjectSnapshot(manager).catalog;
  const background = E.selectManagedAsset(manager, { projectId: 'game-a', assetId: 'item', expectedKind: 'image' }).reference;
  const tile = E.selectManagedAsset(manager, { projectId: 'game-a', assetId: 'player', expectedKind: 'image' }).reference;
  let document = E.setMapBackground(sample.session.getSnapshot().envelope, { objectId: 'map-background', layerKey: 'background', reference: background }, catalog);
  document = E.setMapTile(document, { scene: { projectId: 'game-a', sceneId: 'map-01' }, layerKey: 'tiles',
    cell: { column: 3, row: 2 }, newObjectId: 'tile-3-2', reference: tile }, catalog);
  const content = structuredClone(document.content);
  content.metadata = { vendor: { membership: 'retained' } };
  content.scene.metadata.vendor = { scene: 'retained' };
  for (const entry of content.objects) { entry.metadata = { vendor: 'entry' }; entry.definition.metadata = { vendor: ['definition', 1] }; }
  sample.session.replaceContent(content);
  document = E.setMapTile(sample.session.getSnapshot().envelope, { scene: { projectId: 'game-a', sceneId: 'map-01' }, layerKey: 'tiles',
    cell: { column: 3, row: 2 }, newObjectId: 'ignored-replacement-id', reference: tile }, catalog);
  sample.session.replaceContent(document.content);
  const before = sample.session.getSnapshot();
  try { const candidate = E.setMapTile(before.envelope, { scene: { projectId: 'game-a', sceneId: 'map-01' }, layerKey: 'tiles',
    cell: { column: 8, row: 2 }, newObjectId: 'outside', reference: tile }, catalog); sample.session.replaceContent(candidate.content); }
  catch (error) { console.log('OOB_REJECTED', error.message, 'revisionUnchanged', before.currentRevision === sample.session.getSnapshot().currentRevision); }

  const b = E.createProject({ identity: { projectId: 'game-b', documentId: 'project-manifest' }, metadata: { name: 'Game B' },
    root: other.binding, locator: { type: 'project-relative', path: 'project.json' } });
  const bm = E.createAssetManagerProject(b, other.binding);
  // An authored B image reference; existence is deliberately not claimed.
  const foreign = E.registerManagedAsset(bm, { identity: { projectId: 'game-b', assetId: 'foreign' }, kind: 'image', metadata: {}, sources: [] },
    { projectId: 'game-b', documentId: 'foreign-image' }, { type: 'project-relative', path: 'foreign.asset.json' });
  E.adoptAssetManagerCatalog(bm, foreign.catalog, foreign.generation);
  const foreignRef = E.selectManagedAsset(bm, { projectId: 'game-b', assetId: 'foreign', expectedKind: 'image' }).reference;
  try { const candidate = E.setMapBackground(before.envelope, { objectId: 'map-background', layerKey: 'background', reference: foreignRef }, catalog);
    sample.session.replaceContent(candidate.content); }
  catch (error) { console.log('FOREIGN_REJECTED', error.message, 'revisionUnchanged', before.currentRevision === sample.session.getSnapshot().currentRevision); }

  // Inspection-only malformed/unsupported examples, explicitly seeded by tooling.
  let manifest = E.getProjectSessionSnapshot(sample.project).manifest;
  for (const reference of assetReferences) manifest = E.trackProjectDocument(manifest, reference);
  for (const [name, version] of [['ordinary', null], ['future', 2]]) {
    const raw = structuredClone(before.envelope); raw.identity.documentId = `${name}-document`; raw.content.scene.identity.sceneId = `${name}-scene`;
    if (version === null) delete raw.content.scene.metadata.editorMap; else raw.content.scene.metadata.editorMap.schemaVersion = version;
    await writeFile(path.join(root.directory, `${name}.scene.json`), JSON.stringify(raw), { flag: 'wx' });
    manifest = E.trackProjectDocument(manifest, { identity: raw.identity, sceneId: raw.content.scene.identity.sceneId,
      documentKind: 'scene', contentSchemaVersion: 1, locator: { type: 'project-relative', path: `${name}.scene.json` } });
  }
  E.replaceProjectManifest(sample.project, manifest, E.getProjectSessionSnapshot(sample.project).currentRevision);
  console.log('MAP_SAVE', await E.saveMap({ ...sample, root: root.binding, catalog, expected: { kind: 'absent' } }));
  console.log('PROJECT_STILL_DIRTY', E.getProjectSessionSnapshot(sample.project).isDirty);
  console.log('PROJECT_SAVE', (await E.saveProject(sample.project, { kind: 'absent' })).status);
  sample.session.close('discard'); E.closeAssetManagerProject(manager); E.closeProjectSession(sample.project, 'discard');
  E.closeAssetManagerProject(bm); E.closeProjectSession(b, 'discard');

  const reopened = await E.openProject({ root: root.binding, expectedProjectId: 'game-a', locator: { type: 'project-relative', path: 'project.json' } });
  if (reopened.status !== 'opened') throw new Error('Real Project readback unavailable');
  const rebuilt = E.createAssetManagerProject(reopened.session, root.binding), documents = [];
  for (const ref of E.getProjectSessionSnapshot(reopened.session).manifest.documents.filter(ref => ref.documentKind === 'asset')) {
    const loaded = await E.loadDocument(root.binding.readPort, ref.locator.path, { owner: 'asset', documentKind: 'asset', contentSchemaVersion: 1 });
    if (loaded.status !== 'loaded') throw new Error('Real Asset readback unavailable');
    documents.push(loaded.session.getSnapshot().envelope); loaded.session.close('discard');
  }
  E.rebuildAssetManagerCatalog(rebuilt, documents, 1);
  const reloadedCatalog = E.getAssetManagerProjectSnapshot(rebuilt).catalog;
  const options = { project: reopened.session, root: root.binding, catalog: reloadedCatalog };
  const opened = await E.openMap({ ...options, identity: { projectId: 'game-a', documentId: 'map-document' } });
  if (opened.status !== 'opened') throw new Error('Real Map readback unavailable');
  const after = opened.session.getSnapshot();
  console.log('STORAGE_REOPEN', JSON.stringify({ clean: !after.isDirty, identical: E.serializeDocument(before.envelope) === E.serializeDocument(after.envelope),
    identity: after.envelope.identity, scene: after.envelope.content.scene, objects: after.envelope.content.objects }));
  opened.session.close('discard');
  const revision = E.getProjectSessionSnapshot(reopened.session).currentRevision;
  for (const name of ['ordinary', 'future']) {
    const rejected = await E.openMap({ ...options, identity: { projectId: 'game-a', documentId: `${name}-document` } });
    console.log('UNSUPPORTED_OPEN', name, rejected.status, rejected.reason, 'projectUnchanged', revision === E.getProjectSessionSnapshot(reopened.session).currentRevision);
  }
  console.log('ROOTS', host.base, 'FILES', await readdir(root.directory));
  console.log('MAP_FILE_BYTES', (await readFile(path.join(root.directory, 'map.scene.json'))).length);
  E.closeAssetManagerProject(rebuilt); E.closeProjectSession(reopened.session, 'discard');
  return host;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await prepareMapMvp();
