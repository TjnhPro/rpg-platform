// Finite optional manual reproduction, not a test runner/suite or automatic gate.
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createProject, saveProject, openProject, closeProjectSession,
  getProjectSessionSnapshot, replaceProjectManifest, trackProjectDocument,
  setProjectActiveScene, createProjectManifest } from '@rpg-platform/editor';
import { createProjectFilesystemHost } from './project-filesystem-host.mjs';

const host = await createProjectFilesystemHost();
const locator = { type: 'project-relative', path: 'project.json' };
console.log('REAL_ROOTS', host.base);
const sessions = new Map();
for (const projectId of ['game-a', 'game-b']) {
  const root = host.roots.get(projectId);
  const session = createProject({ identity: { projectId, documentId: 'project-manifest' },
    metadata: { name: projectId === 'game-a' ? 'Game A' : 'Game B', description: `Portable ${projectId}` },
    resourceRoots: [{ rootId: 'assets', locator: { type: 'project-relative', path: 'Assets' } }], root: root.binding, locator });
  if (projectId === 'game-a') {
    const snapshot = getProjectSessionSnapshot(session);
    const identity = { projectId, documentId: 'scene-main' };
    const manifest = setProjectActiveScene(trackProjectDocument(snapshot.manifest, {
      identity, documentKind: 'scene', contentSchemaVersion: 1,
      locator: { type: 'project-relative', path: 'Scenes/main.json' }, sceneId: 'start' }), identity, 'start');
    replaceProjectManifest(session, manifest, snapshot.currentRevision);
  }
  const saved = await saveProject(session, { kind: 'absent' });
  console.log('SAVE', projectId, saved.status, saved.cleanup, getProjectSessionSnapshot(session).isDirty);
  console.log('FILE', path.join(root.directory, 'project.json'), await readFile(path.join(root.directory, 'project.json'), 'utf8'));
  console.log('REPEAT_ABSENT', projectId, (await saveProject(session, { kind: 'absent' })).status);
  console.log('REPLACEMENT', projectId, await saveProject(session, { kind: 'revision', identity: null, revision: 'unsupported-host-token' }));
  closeProjectSession(session, 'discard');
  const opened = await openProject({ root: root.binding, locator, expectedProjectId: projectId });
  console.log('OPEN', projectId, opened.status, opened.status === 'opened' ? getProjectSessionSnapshot(opened.session) : opened);
  if (opened.status === 'opened') sessions.set(projectId, opened.session);
}
const a = sessions.get('game-a');
const b = sessions.get('game-b');
const beforeA = JSON.stringify(getProjectSessionSnapshot(a));
const beforeB = JSON.stringify(getProjectSessionSnapshot(b));
try {
  const snapshot = getProjectSessionSnapshot(a);
  const foreign = trackProjectDocument(snapshot.manifest, { identity: { projectId: 'game-b', documentId: 'foreign' },
    documentKind: 'text', contentSchemaVersion: 1, locator: { type: 'project-relative', path: 'foreign.json' }, sceneId: null });
  replaceProjectManifest(a, foreign, snapshot.currentRevision);
} catch (error) { console.log('NEGATIVE_FOREIGN_REFERENCE', error.code); }
const mismatch = await openProject({ root: host.roots.get('game-a').binding, locator, expectedProjectId: 'game-b' });
console.log('NEGATIVE_OPEN_ROOT', mismatch);
console.log('UNCHANGED_A_B', beforeA === JSON.stringify(getProjectSessionSnapshot(a)), beforeB === JSON.stringify(getProjectSessionSnapshot(b)));
const old = getProjectSessionSnapshot(a);
replaceProjectManifest(a, createProjectManifest({ ...old.manifest, metadata: { name: 'Edited A after reopen' } }), old.currentRevision);
console.log('A_EDIT_B_UNCHANGED', getProjectSessionSnapshot(a).isDirty, getProjectSessionSnapshot(b).manifest.metadata.name);
closeProjectSession(a, 'discard'); closeProjectSession(b, 'discard');
console.log('CORE_IO_OBSERVED; Scene file existence NOT_CHECKED; UI_NOT_VERIFIED by this CLI');
