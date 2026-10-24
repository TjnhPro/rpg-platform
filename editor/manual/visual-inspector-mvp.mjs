// Optional finite public-API + real-file observation. Never an automatic test gate.
import * as E from '@rpg-platform/editor';
import { createHash } from 'node:crypto';
import { createMapFilesystemHost } from './map-filesystem-host.mjs';
import { sampleMapProfile } from './map-sample.mjs';

// Client of the EXISTING Phase15 loopback transport; no copied filesystem/server.
async function connect(url) {
  const origin = new URL(url);
  if (origin.protocol !== 'http:' || origin.hostname !== '127.0.0.1' || origin.username || origin.password) throw new TypeError('Explicit loopback host required');
  const response = await fetch(new URL('/__project-host/capability', origin));
  if (!response.ok) throw new Error('Existing Map host unavailable');
  const capability = await response.json();
  async function dispatch(route, input) {
    const result = await fetch(new URL(route, origin), { method: 'POST', headers: { 'Content-Type': 'application/json',
      'X-Project-Capability': capability.token }, body: JSON.stringify(input) });
    if (!result.ok) throw new Error(`Existing host rejected request: ${result.status}`);
    return result.json();
  }
  return { base: 'existing loopback host', roots: new Map(capability.roots.map(info => {
    const scope = { projectId: info.projectId, bindingId: info.bindingId };
    const binding = E.createProjectRootBinding({ ...scope,
      readPort: { read: locator => dispatch('/__project-host/io', { ...scope, operation: 'read', locator }) },
      writePort: { conflictProtection: 'create-only', publication: 'atomic-publish',
        commit: request => dispatch('/__project-host/io', { ...scope, ...request, operation: 'commit' }) } });
    return [info.projectId, { binding, directory: info.directory, observe: request =>
      dispatch('/__asset-host/resource', { ...scope, locator: request.locator.path }) }];
  })) };
}

const host = process.argv[2] ? await connect(process.argv[2]) : await createMapFilesystemHost();
const root = host.roots.get('game-a'), other = host.roots.get('game-b');
const project = E.createProject({ identity: { projectId: 'game-a', documentId: 'project-manifest' }, metadata: { name: 'Visual Inspector example' },
  root: root.binding, locator: { type: 'project-relative', path: 'project.json' } });
const manager = E.createAssetManagerProject(project, root.binding), references = [];
const observations = { async observe(request) {
  if (request.projectId !== 'game-a' || request.bindingId !== root.binding.bindingId) return { status: 'unverified', reason: 'denied' };
  if (root.observe) return root.observe(request);
  const bytes = await root.readBytes(request.locator.path);
  return { status: 'available', observation: { projectId: request.projectId, bindingId: request.bindingId, locator: request.locator.path,
    revision: createHash('sha256').update(bytes).digest('hex'), byteLength: bytes.length } };
} };
for (const [assetId, sourcePath] of [['player', 'sprites/player.png'], ['item', 'sprites/background.png']]) {
  const source = { role: 'image', locator: { type: 'project-relative', path: sourcePath } };
  const admitted = await E.registerExistingAssetResource(manager, { operation: 'register-existing', root: root.binding,
    definition: { identity: { projectId: 'game-a', assetId }, kind: 'image', metadata: { editorDisplayName: assetId }, sources: [source] }, source,
    documentIdentity: { projectId: 'game-a', documentId: assetId }, documentLocator: { type: 'project-relative', path: `${assetId}.asset.json` } }, observations);
  console.log('REAL_PNG', assetId, admitted.status, admitted.observation);
  if (admitted.status !== 'admitted') throw new Error('Real image admission unavailable');
  E.adoptAssetManagerCatalog(manager, admitted.candidate.catalog, admitted.candidate.generation);
  const session = E.createDocumentSession(admitted.candidate.document, null); session.open();
  const saved = await E.saveDocument(session, root.binding.writePort, `${assetId}.asset.json`, { kind: 'absent' },
    { owner: 'asset', documentKind: 'asset', contentSchemaVersion: 1 });
  console.log('ASSET_SAVE', assetId, saved.status); session.close('discard');
  if (saved.status !== 'committed') throw new Error('Stop at partial Asset receipt');
  references.push(admitted.candidate.reference);
}
const catalog = E.getAssetManagerProjectSnapshot(manager).catalog;
E.closeAssetManagerProject(manager);
let manifest = E.getProjectSessionSnapshot(project).manifest;
for (const reference of references) manifest = E.trackProjectDocument(manifest, reference);
E.replaceProjectManifest(project, manifest, E.getProjectSessionSnapshot(project).currentRevision);
const profile = { ...sampleMapProfile('game-a'), layers: [
  { layerKey: 'objects', role: 'objects', visible: true }, { layerKey: 'front', role: 'objects', visible: true }] };
const made = E.createMap({ project, root: root.binding, identity: { projectId: 'game-a', documentId: 'map-document' },
  scene: { projectId: 'game-a', sceneId: 'main' }, profile, trackingLocator: { type: 'project-relative', path: 'map.scene.json' } });
E.replaceProjectManifest(project, E.setProjectActiveScene(made.trackingCandidate, made.reference.identity, 'main'), made.projectRevision);
const session = made.session, initial = session.getSnapshot().envelope;
let membership = E.createSceneMembership(initial.content);
membership = E.addSceneObject(membership, { definition: { objectId: 'player-001', displayName: 'Player' },
  assetReference: E.createAssetReference({ projectId: 'game-a', assetId: 'player', expectedKind: 'image' }), layerKey: 'objects',
  placement: { coordinateSpaceId: profile.space.reference.coordinateSpaceId, point: { x: 32, y: 32 } } });
membership = E.addSceneObject(membership, { definition: { objectId: 'untouched' }, assetReference: null });
// Tooling seeds a supported ordinary object; no product placement engine is added.
const seed = E.createDocumentEnvelope({ ...initial, content: { ...initial.content, metadata: { vendor: ['membership', 1] },
  scene: { ...initial.content.scene, metadata: { ...initial.content.scene.metadata, vendor: 'scene' } },
  objects: membership.objects.map(entry => ({ ...entry, metadata: { vendor: ['entry', entry.definition.objectId] },
    definition: { ...entry.definition, metadata: { vendor: 'definition' } } })) } });
E.validateVisualSceneDocument(seed, catalog); session.replaceContent(seed.content);
const untouched = E.serializeDocument({ ...seed, content: seed.content.objects[1] });
const editor = E.createVisualDocumentEditor({ project, root: root.binding, document: session, catalog });
let selected = editor.select('player-001');
const first = selected.selection;
function apply(edit) {
  if (selected.status !== 'selected') throw new Error('Selection unavailable');
  const revision = session.getSnapshot().currentRevision;
  selected = editor.apply(selected.selection, edit);
  console.log('AUTHORED', edit.kind, 'revision', revision, '->', session.getSnapshot().currentRevision, 'dirty', session.getSnapshot().isDirty);
}
apply({ kind: 'position', point: { space: profile.space.reference, point: { x: 100, y: 200 } } });
apply({ kind: 'direction', orientation: { axes: profile.space.axes, zeroAxis: 'positive-x', positiveRotation: 'toward-positive-y', angleRadians: 1.25 } });
apply({ kind: 'layer', layerKey: 'front' });
apply({ kind: 'scale', scale: { x: 1.5, y: 0.8 } });
apply({ kind: 'anchor', anchor: { unit: profile.space.unit, anchor: { x: 4, y: 8 }, pivot: { x: 3, y: 5 }, localOffset: { x: 2, y: -1 } } });
apply({ kind: 'visibility', visible: false });
console.log('HIDDEN_SELECT', editor.select('player-001').status, 'objectCount', session.getSnapshot().envelope.content.objects.length);
selected = editor.read();
apply({ kind: 'binding', reference: null });
console.log('CLEAR_RETAINS_OBJECT', selected.object.definition.objectId, selected.object.assetReference);
apply({ kind: 'binding', reference: E.createAssetReference({ projectId: 'game-a', assetId: 'item', expectedKind: 'image' }) });
const before = session.getSnapshot();
for (const [label, token, edit] of [
  ['stale-token', first, { kind: 'visibility', visible: true }],
  ['nonfinite', selected.selection, { kind: 'scale', scale: { x: Infinity, y: 1 } }],
  ['foreign-reference', selected.selection, { kind: 'binding', reference: { projectId: 'game-b', assetId: 'player', expectedKind: 'image' } }],
  ['unknown-layer', selected.selection, { kind: 'layer', layerKey: 'unknown' }],
]) {
  try { editor.apply(token, edit); throw new Error('Unexpected accepted invalid operation'); }
  catch (error) { if (!(error instanceof TypeError)) throw error;
    console.log('REJECTED', label, error.message, 'revisionUnchanged', session.getSnapshot().currentRevision === before.currentRevision); }
}
console.log('SCALE_ZERO_REFLECTION', E.setVisualScale({ schemaVersion: 1 }, { x: 0, y: -1 }));
const candidate = structuredClone(before.envelope); candidate.content.objects[0].metadata.editorVisual.schemaVersion = 2;
try { E.validateVisualSceneDocument(candidate, catalog); throw new Error('Unexpected future admission'); }
catch (error) { if (!(error instanceof TypeError)) throw error; console.log('FUTURE_INSPECT_ONLY', error.message); }
const mapped = E.describeVisualAlignment(selected.visual.profile, selected.map.membership, 'player-001', profile.space,
  { anchor: selected.visual.profile.anchor, orientation: selected.visual.profile.orientation });
console.log('RENDER_ALIGNMENT', mapped);
const serialized = E.serializeDocument(before.envelope);
console.log('UNTOUCHED_ENTRY_IDENTICAL', untouched === E.serializeDocument({ ...before.envelope, content: before.envelope.content.objects[1] }));
const tokenBeforeSwitch = selected.selection;
let projectSnapshot = E.getProjectSessionSnapshot(project);
E.replaceProjectManifest(project, E.clearProjectActiveScene(projectSnapshot.manifest), projectSnapshot.currentRevision);
projectSnapshot = E.getProjectSessionSnapshot(project);
E.replaceProjectManifest(project, E.setProjectActiveScene(projectSnapshot.manifest, made.reference.identity, 'main'), projectSnapshot.currentRevision);
console.log('SCENE_AWAY_BACK_TOKEN', editor.read(tokenBeforeSwitch).status, 'sceneRevisionUnchanged', before.currentRevision === session.getSnapshot().currentRevision);
const saved = await E.saveMap({ project, root: root.binding, session, catalog, expected: { kind: 'absent' } });
console.log('SCENE_INITIAL_SAVE', saved.status, saved.cleanup); if (saved.status !== 'committed') throw new Error('Initial Scene save unavailable');
console.log('PROJECT_SEPARATE', E.getProjectSessionSnapshot(project).isDirty);
const savedProject = await E.saveProject(project, { kind: 'absent' });
console.log('PROJECT_SAVE', savedProject.status); if (savedProject.status !== 'committed') throw new Error('Project save unavailable');
console.log('EXISTING_UPDATE', await E.saveMap({ project, root: root.binding, session, catalog, expected: { kind: 'revision', identity: null, revision: 'not-a-CAS-permit' } }));
editor.invalidate(); session.close('discard'); E.closeProjectSession(project, 'discard');
const reopened = await E.openProject({ root: root.binding, expectedProjectId: 'game-a', locator: { type: 'project-relative', path: 'project.json' } });
if (reopened.status !== 'opened') throw new Error('Project readback unavailable');
const rebuilt = E.createAssetManagerProject(reopened.session, root.binding), documents = [];
for (const reference of E.getProjectSessionSnapshot(reopened.session).manifest.documents.filter(item => item.documentKind === 'asset')) {
  const loaded = await E.loadDocument(root.binding.readPort, reference.locator.path, { owner: 'asset', documentKind: 'asset', contentSchemaVersion: 1 });
  if (loaded.status !== 'loaded') throw new Error('Asset readback unavailable');
  documents.push(loaded.session.getSnapshot().envelope); loaded.session.close('discard');
}
E.rebuildAssetManagerCatalog(rebuilt, documents, 1);
const reopenedCatalog = E.getAssetManagerProjectSnapshot(rebuilt).catalog;
const opened = await E.openMap({ project: reopened.session, root: root.binding, identity: made.reference.identity, catalog: reopenedCatalog });
if (opened.status !== 'opened') throw new Error('Scene readback unavailable');
const after = E.validateVisualSceneDocument(opened.session.getSnapshot().envelope, reopenedCatalog);
console.log('REAL_STORAGE_READBACK', JSON.stringify({ clean: !opened.session.getSnapshot().isDirty,
  exactDocument: serialized === E.serializeDocument(after.document), objects: after.document.content.objects }));
if (serialized !== E.serializeDocument(after.document)) throw new Error('Readback differs');
console.log('ROOT', root.directory, 'UI_NOT_VERIFIED', 'FRAME_CHANGE_NOT_VERIFIED', 'GPU_LIFECYCLE_NOT_OBSERVED');
opened.session.close('discard'); E.closeAssetManagerProject(rebuilt); E.closeProjectSession(reopened.session, 'discard');
// The second issued root remains independent; no Project B data is authored.
console.log('PROJECT_B_ROOT', other.binding.projectId);
