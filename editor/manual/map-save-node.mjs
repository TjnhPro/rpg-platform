// Optional finite real-IO observation. No runner, assertions or automatic gate.
import * as E from '@rpg-platform/editor';
import { readFile } from 'node:fs/promises';
import { createMapFilesystemHost } from './map-filesystem-host.mjs';
import { createSampleMap } from './map-sample.mjs';

const host = await createMapFilesystemHost(), root = host.roots.get('game-a');
const sample = createSampleMap(root.binding);
const options = { ...sample, root: root.binding, expected: { kind: 'absent' } };
console.log('ROOT', root.directory);
console.log('SAVE', await E.saveMap(options));
console.log('PROJECT_STILL_DIRTY', E.getProjectSessionSnapshot(sample.project).isDirty);
const opened = await E.openMap(options);
console.log('REOPEN', opened.status, opened.status === 'opened' && opened.session.getSnapshot().isDirty);
sample.session.replaceContent(E.resizeMapExtent(sample.session.getSnapshot().envelope, { width: 9, height: 6 }).content);
console.log('REPEAT', (await E.saveMap(options)).status, 'dirty', sample.session.getSnapshot().isDirty);
const observed = opened.status === 'opened' ? opened.observation : null;
console.log('CAS', await E.saveMap({ ...options, expected: { kind: 'revision', ...observed } }));
const invalid = structuredClone(sample.session.getSnapshot().envelope.content); invalid.scene.metadata.editorMap.schemaVersion = 2;
sample.session.replaceContent(invalid);
console.log('INVALID', await E.saveMap(options), 'dirty', sample.session.getSnapshot().isDirty);
console.log('ORIGINAL_FILE_WIDTH', JSON.parse(await readFile(root.directory + '/map.scene.json', 'utf8')).content.scene.metadata.editorMap.extentCells.width);

// Delay a genuine host acknowledgement; edit while the old ticket is pending.
const lateHost = await createMapFilesystemHost(), original = lateHost.roots.get('game-a').binding;
let release, dispatched;
const gate = new Promise(resolve => { release = resolve; }), started = new Promise(resolve => { dispatched = resolve; });
const delayed = { ...original.writePort, async commit(request) {
  const receipt = await original.writePort.commit(request); dispatched(); await gate; return receipt;
} };
const lateRoot = E.createProjectRootBinding({ ...original, writePort: delayed }), late = createSampleMap(lateRoot);
const pending = E.saveMap({ ...late, root: lateRoot, expected: { kind: 'absent' } });
await started;
late.session.replaceContent(E.resizeMapExtent(late.session.getSnapshot().envelope, { width: 9, height: 6 }).content);
release();
console.log('LATE', (await pending).status, late.session.getSnapshot().currentRevision, late.session.getSnapshot().savedRevision, late.session.getSnapshot().isDirty);

// Actual commit followed by lost transport acknowledgement -> uncertainty/quarantine.
const lostHost = await createMapFilesystemHost(), lostOriginal = lostHost.roots.get('game-a').binding;
const lostRoot = E.createProjectRootBinding({ ...lostOriginal, writePort: { ...lostOriginal.writePort,
  async commit(request) { await lostOriginal.writePort.commit(request); throw new Error('finite lost acknowledgement'); } } });
const lost = createSampleMap(lostRoot), lostOptions = { ...lost, root: lostRoot, expected: { kind: 'absent' } };
console.log('LOST', (await E.saveMap(lostOptions)).status, lost.session.getSnapshot().isDirty);
console.log('QUARANTINE', await E.saveMap(lostOptions));
console.log('REAL_STORAGE_OBSERVED; UI/VISUAL_NOT_VERIFIED; no existing-file CAS support');
