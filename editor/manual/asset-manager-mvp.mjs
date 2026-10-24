// Optional finite user-operated real-file recipe. No runner/assertion/test suite.
import * as E from '@rpg-platform/editor';
import { readdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { createAssetManagerFilesystemHost } from './asset-manager-host.mjs';
const host = await createAssetManagerFilesystemHost();
const root = host.roots.get('game-a'), other = host.roots.get('game-b');
const locator = { type: 'project-relative', path: 'project.json' };
const project = E.createProject({ identity: { projectId: 'game-a', documentId: 'project-manifest' }, metadata: { name: 'Game A' }, root: root.binding, locator });
const manager = E.createAssetManagerProject(project, root.binding);
const source = { role: 'image', locator: { type: 'project-relative', path: 'sprites/player.png' } };
const observationPort = { async observe(request) {
  if (request.projectId !== 'game-a' || request.bindingId !== root.binding.bindingId || request.locator.path !== source.locator.path)
    return { status: 'unverified', reason: 'denied' };
  const bytes = await root.readBytes(request.locator.path);
  return { status: 'available', observation: { projectId: 'game-a', bindingId: request.bindingId,
    locator: request.locator.path, revision: createHash('sha256').update(bytes).digest('hex'), byteLength: bytes.length } };
} };
const player = await E.registerExistingAssetResource(manager, { operation: 'register-existing', root: root.binding,
  definition: { identity: { projectId: 'game-a', assetId: 'player', sourceId: '0001' }, kind: 'image',
    metadata: { editorBrowserCategory: 'player', editorDisplayName: 'Traveler', vendor: { retained: ['original', 1] } }, sources: [source] },
  source, documentIdentity: { projectId: 'game-a', documentId: 'player' },
  documentLocator: { type: 'project-relative', path: 'player.asset.json' } }, observationPort);
console.log('ROOTS', host.base, 'PNG', player.status, player.status === 'admitted' ? player.observation : null);
if (player.status !== 'admitted') throw new Error('Cannot continue without real authorized PNG');
E.adoptAssetManagerCatalog(manager, player.candidate.catalog, player.candidate.generation);
const item = E.registerManagedAsset(manager, { identity: { projectId: 'game-a', assetId: 'item' }, kind: 'text',
  metadata: { editorBrowserCategory: 'item', editorDisplayName: 'Metadata Item', custom: { rarityLabel: 'opaque' } } },
  { projectId: 'game-a', documentId: 'item' }, { type: 'project-relative', path: 'item.asset.json' });
E.adoptAssetManagerCatalog(manager, item.catalog, item.generation);
const candidates = [player.candidate, item];
let manifest = E.getProjectSessionSnapshot(project).manifest;
for (const candidate of candidates) {
  const document = E.createDocumentSession(candidate.document, null); document.open();
  const result = await E.saveDocument(document, root.binding.writePort, candidate.reference.locator.path, { kind: 'absent' },
    { owner: 'asset', documentKind: 'asset', contentSchemaVersion: 1 });
  console.log('ASSET_SAVE', candidate.reference.locator.path, result.status, result.cleanup);
  document.close('discard');
  if (result.status !== 'committed') throw new Error('Stop; inspect partial per-file receipts');
  manifest = E.trackProjectDocument(manifest, candidate.reference);
}
E.closeAssetManagerProject(manager);
E.replaceProjectManifest(project, manifest, E.getProjectSessionSnapshot(project).currentRevision);
console.log('MANIFEST_BEFORE_SAVE', E.getProjectSessionSnapshot(project).savedRevision);
console.log('MANIFEST_SAVE', await E.saveProject(project, { kind: 'absent' }));
E.closeProjectSession(project, 'discard');
const opened = await E.openProject({ root: root.binding, locator, expectedProjectId: 'game-a' });
if (opened.status !== 'opened') throw new Error('Cannot continue without real manifest readback');
const rebuilt = E.createAssetManagerProject(opened.session, root.binding), envelopes = [];
for (const reference of E.getProjectSessionSnapshot(opened.session).manifest.documents) {
  const loaded = await E.loadDocument(root.binding.readPort, reference.locator.path,
    { owner: 'asset', documentKind: 'asset', contentSchemaVersion: 1 });
  console.log('ASSET_REOPEN', reference.identity.documentId, loaded.status);
  if (loaded.status !== 'loaded') throw new Error('Known Document unavailable; no partial rebuild');
  envelopes.push(loaded.session.getSnapshot().envelope); loaded.session.close('discard');
}
E.rebuildAssetManagerCatalog(rebuilt, envelopes, 1);
console.log('REBUILT', E.searchManagedAssets(rebuilt, { projectId: 'game-a', query: '' }).definitions);
console.log('SEARCH', E.searchManagedAssets(rebuilt, { projectId: 'game-a', query: 'TRAVELER', kind: 'image' }).count,
  'ITEM_FILTER', E.searchManagedAssets(rebuilt, { projectId: 'game-a', query: '', category: 'item' }).count);
const reference = E.selectManagedAsset(rebuilt, { projectId: 'game-a', assetId: 'player', expectedKind: 'image' }).reference;
console.log('INSPECT', E.inspectManagedAsset(rebuilt, reference));
const b = E.createProject({ identity: { projectId: 'game-b', documentId: 'project-manifest' }, metadata: { name: 'Game B' }, root: other.binding, locator });
const bm = E.createAssetManagerProject(b, other.binding);
console.log('B', E.searchManagedAssets(bm, { projectId: 'game-b', query: '' }).count, E.getManagedAssetSelection(bm),
  E.resolveAssetReference(E.getAssetManagerProjectSnapshot(bm).catalog, reference));
console.log('B_FOREIGN_PATH', await other.binding.readPort.read('../game-a/player.asset.json'));
const before = await readFile(path.join(root.directory, 'player.asset.json'));
const duplicate = E.createDocumentSession(player.candidate.document, null); duplicate.open();
console.log('EXISTING_ASSET_SAVE', (await E.saveDocument(duplicate, root.binding.writePort, 'player.asset.json', { kind: 'absent' },
  { owner: 'asset', documentKind: 'asset', contentSchemaVersion: 1 })).status);
console.log('EXISTING_BYTES_UNCHANGED', before.equals(await readFile(path.join(root.directory, 'player.asset.json'))));
duplicate.close('discard');
console.log('EXISTING_MANIFEST_UPDATE', await E.saveProject(opened.session, { kind: 'unknown' }));
E.closeAssetManagerProject(rebuilt); E.closeAssetManagerProject(bm);
E.closeProjectSession(opened.session, 'discard'); E.closeProjectSession(b, 'discard');
console.log('FILES_A', await readdir(root.directory), 'FILES_B', await readdir(other.directory));
console.log('REAL_IO_OBSERVED; browser/product controls/pixels NOT_VERIFIED by this CLI');
