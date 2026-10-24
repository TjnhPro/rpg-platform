// Optional finite public-root consumer with real Scene IO. Not an automatic test suite.
import * as E from '@rpg-platform/editor';
import { createHash } from 'node:crypto';
import { createMapFilesystemHost } from './map-filesystem-host.mjs';
import { sampleMapProfile } from './map-sample.mjs';

const host = await createMapFilesystemHost(), root = host.roots.get('game-a');
const project = E.createProject({ identity: { projectId: 'game-a', documentId: 'project-manifest' }, metadata: { name: 'Placement example' },
  root: root.binding, locator: { type: 'project-relative', path: 'project.json' } });
let assets = E.createAssetManagerProject(project, root.binding);
const source = { role: 'image', locator: { type: 'project-relative', path: 'sprites/player.png' } };
const admitted = await E.registerExistingAssetResource(assets, { operation: 'register-existing', root: root.binding,
  definition: { identity: { projectId: 'game-a', assetId: 'player' }, kind: 'image', metadata: {}, sources: [source] }, source,
  documentIdentity: { projectId: 'game-a', documentId: 'player' }, documentLocator: { type: 'project-relative', path: 'player.asset.json' } }, {
  async observe(request) {
    const bytes = await root.readBytes(request.locator.path);
    return { status: 'available', observation: { projectId: 'game-a', bindingId: root.binding.bindingId,
      locator: request.locator.path, revision: createHash('sha256').update(bytes).digest('hex'), byteLength: bytes.length } };
  }
});
if (admitted.status !== 'admitted') throw new Error('Real PNG admission failed');
E.adoptAssetManagerCatalog(assets, admitted.candidate.catalog, admitted.candidate.generation);
const catalog = E.getAssetManagerProjectSnapshot(assets).catalog;
const assetDocument = E.createDocumentSession(admitted.candidate.document, null); assetDocument.open();
const assetSave = await E.saveDocument(assetDocument, root.binding.writePort, 'player.asset.json', { kind: 'absent' },
  { owner: 'asset', documentKind: 'asset', contentSchemaVersion: 1 });
if (assetSave.status !== 'committed') throw new Error('Asset initial save failed');
assetDocument.close('discard'); E.closeAssetManagerProject(assets);
let snapshot = E.getProjectSessionSnapshot(project);
E.replaceProjectManifest(project, E.trackProjectDocument(snapshot.manifest, admitted.candidate.reference), snapshot.currentRevision);
const profile = { ...sampleMapProfile('game-a'), layers: [{ layerKey: 'objects', role: 'objects', visible: true }] };
const made = E.createMap({ project, root: root.binding, identity: { projectId: 'game-a', documentId: 'map-document' },
  scene: { projectId: 'game-a', sceneId: 'main' }, profile, trackingLocator: { type: 'project-relative', path: 'map.scene.json' } });
E.replaceProjectManifest(project, E.setProjectActiveScene(made.trackingCandidate, made.reference.identity, 'main'), made.projectRevision);
assets = E.createAssetManagerProject(project, root.binding, catalog);
E.selectManagedAsset(assets, { projectId: 'game-a', assetId: 'player', expectedKind: 'image' });
const document = made.session, initial = document.getSnapshot().envelope;
// Tooling-only unrelated rich entry, proving edits do not project away opaque metadata.
const sentinel = { definition: { objectId: 'untouched', displayName: null, classification: null, metadata: { opaque: 'definition' } },
  assetReference: null, metadata: { opaque: ['entry', 1] } };
document.replaceContent({ ...initial.content, metadata: { opaque: ['content', 1] },
  scene: { ...initial.content.scene, metadata: { ...initial.content.scene.metadata, opaque: 'scene' } }, objects: [sentinel] });
const frozenSource = document.getSnapshot().envelope;
const editor = E.createVisualPlacementEditor({ project, root: root.binding, document, assets });
const cell = (column, row) => ({ kind: 'grid-cell', cell: { column, row }, alignment: 'center' });
let selected = editor.place(editor.placement.capture('objects', 'npc'), {
  objectId: 'npc-1', displayName: 'NPC', position: cell(1, 1), visual: { schemaVersion: 1, scale: { x: 2, y: 1 }, visible: false } });
const stale = selected.selection;
function edit(command) {
  if (selected.status !== 'selected') throw new Error('Selection unavailable');
  const before = document.getSnapshot().currentRevision;
  selected = editor.edit(selected.selection, before, command);
  if (document.getSnapshot().currentRevision !== before + 1) throw new Error('Expected one canonical adoption');
  console.log('AUTHORED', command.kind, before, '->', document.getSnapshot().currentRevision);
}
edit({ kind: 'move', position: cell(2, 1) });
edit({ kind: 'duplicate', newObjectId: 'npc-2', position: cell(3, 1) });
const beforeReject = document.getSnapshot();
for (const [label, token, revision, command] of [
  ['stale token', stale, beforeReject.currentRevision, { kind: 'delete' }],
  ['stale revision', selected.selection, 1, { kind: 'delete' }],
  ['outside bounds', selected.selection, beforeReject.currentRevision, { kind: 'move', position: cell(-1, 0) }],
  ['duplicate ID', selected.selection, beforeReject.currentRevision, { kind: 'duplicate', newObjectId: 'npc-1', position: cell(0, 0) }],
]) {
  try { editor.edit(token, revision, command); throw new Error('Unexpected invalid acceptance'); }
  catch (error) {
    if (!(error instanceof TypeError)) throw error;
    if (document.getSnapshot().envelope !== beforeReject.envelope || document.getSnapshot().currentRevision !== beforeReject.currentRevision) throw new Error('Rejected edit mutated source');
    console.log('REJECTED_WITHOUT_ADOPTION', label, error.message);
  }
}
edit({ kind: 'delete' });
if (editor.inspector.read().status !== 'none') throw new Error('Delete did not clear selection');
const current = document.getSnapshot(), text = E.serializeDocument(current.envelope);
const entries = current.envelope.content.objects;
if (JSON.stringify(entries[0]) !== JSON.stringify(sentinel) || entries.length !== 2
  || JSON.stringify(current.envelope.content.scene) !== JSON.stringify(frozenSource.content.scene)
  || JSON.stringify(current.envelope.content.metadata) !== JSON.stringify(frozenSource.content.metadata)) throw new Error('Metadata changed');
E.validateVisualSceneDocument(current.envelope, catalog);
console.log('SCENE_AUTHORING_OBSERVED', entries, 'dirty', current.isDirty, 'savedRevision', current.savedRevision);
const saved = await E.saveMap({ project, root: root.binding, session: document, catalog, expected: { kind: 'absent' } });
if (saved.status !== 'committed') throw new Error(`Initial Scene save failed:${saved.status}`);
console.log('SCENE_INITIAL_SAVE', saved, 'snapshot', { currentRevision: document.getSnapshot().currentRevision,
  savedRevision: document.getSnapshot().savedRevision, dirty: document.getSnapshot().isDirty });
console.log('SAVE_SCENE_IS_SEPARATE', 'projectDirty', E.getProjectSessionSnapshot(project).isDirty);
const projectSaved = await E.saveProject(project, { kind: 'absent' });
if (projectSaved.status !== 'committed') throw new Error('Project initial save failed');
console.log('UNSUPPORTED_CAS', await E.saveMap({ project, root: root.binding, session: document, catalog,
  expected: { kind: 'revision', identity: null, revision: 'not-a-CAS-permit' } }));
editor.dispose(); document.close('discard'); E.closeAssetManagerProject(assets); E.closeProjectSession(project, 'discard');
const reopened = await E.openProject({ root: root.binding, expectedProjectId: 'game-a', locator: { type: 'project-relative', path: 'project.json' } });
if (reopened.status !== 'opened') throw new Error('Project reopen failed');
const loadedAsset = await E.loadDocument(root.binding.readPort, 'player.asset.json', { owner: 'asset', documentKind: 'asset', contentSchemaVersion: 1 });
if (loadedAsset.status !== 'loaded') throw new Error('Asset reopen failed');
const rebuilt = E.createAssetManagerProject(reopened.session, root.binding);
E.rebuildAssetManagerCatalog(rebuilt, [loadedAsset.session.getSnapshot().envelope], 1); loadedAsset.session.close('discard');
const reopenedCatalog = E.getAssetManagerProjectSnapshot(rebuilt).catalog;
const opened = await E.openMap({ project: reopened.session, root: root.binding, identity: made.reference.identity, catalog: reopenedCatalog });
if (opened.status !== 'opened') throw new Error('Scene reopen failed');
if (E.serializeDocument(opened.session.getSnapshot().envelope) !== text || opened.session.getSnapshot().isDirty) throw new Error('Storage readback differs');
console.log('SCENE_IO_OBSERVED', 'exact bytes/readback, clean reopened Scene', root.directory);
opened.session.close('discard'); E.closeAssetManagerProject(rebuilt); E.closeProjectSession(reopened.session, 'discard');
console.log('UI_INTERACTION_NOT_VERIFIED', 'VISUAL_NOT_VERIFIED', 'GPU_NOT_OBSERVED');
