import { mkdtemp, mkdir, copyFile, realpath, lstat, open } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import { createProjectRootBinding, createProject, createAssetManagerProject, registerExistingAssetResource } from '@rpg-platform/editor';

// Fixture setup, not an import/copy API: seed an existing real traveler PNG.
// Trusted OS account/ancestry must not replace topology concurrently; not a hostile
// same-account sandbox. Observation attests exactly the bounded bytes read now.
const directory = await mkdtemp(path.join(tmpdir(), 'rpg-asset-import-'));
await mkdir(path.join(directory, 'Assets'));
await copyFile(new URL('../../runtime-render/manual/scene-mvp-assets/traveler.png', import.meta.url), path.join(directory, 'Assets/player.png'));
const canonical = await realpath(directory);
const root = createProjectRootBinding({ projectId: 'game-a', bindingId: randomUUID(), readPort: null, writePort: null });
const project = createProject({ identity: { projectId: 'game-a', documentId: 'manifest' }, metadata: { name: 'Import observation' }, root,
  locator: { type: 'project-relative', path: 'project.json' } });
const context = createAssetManagerProject(project, root);
const port = { async observe(request) {
  if (request.projectId !== root.projectId || request.bindingId !== root.bindingId
    || !['Assets/player.png', 'Assets/missing.png'].includes(request.locator.path)) return { status: 'unverified', reason: 'denied' };
  let handle;
  try {
    if (await realpath(directory) !== canonical || (await lstat(directory)).isSymbolicLink()
      || (await lstat(path.join(directory, 'Assets'))).isSymbolicLink()) return { status: 'unverified', reason: 'denied' };
    const file = path.join(directory, request.locator.path);
    const stat = await lstat(file);
    if (stat.isSymbolicLink() || !stat.isFile()) return { status: 'unverified', reason: 'denied' };
    handle = await open(file, 'r');
    const bytes = Buffer.alloc(4_194_305); let length = 0;
    while (length < bytes.length) { const read = await handle.read(bytes, length, bytes.length - length, null); if (!read.bytesRead) break; length += read.bytesRead; }
    if (length > 4_194_304) return { status: 'unverified', reason: 'unavailable' };
    return { status: 'available', observation: { projectId: root.projectId, bindingId: root.bindingId, locator: request.locator.path,
      revision: createHash('sha256').update(bytes.subarray(0, length)).digest('hex'), byteLength: length } };
  } catch (error) { return { status: 'unverified', reason: error.code === 'ENOENT' ? 'not-found' : 'unavailable' }; }
  finally { await handle?.close(); }
} };
const make = resource => ({ operation: 'register-existing', root,
  definition: { identity: { projectId: 'game-a', assetId: 'player' }, kind: 'image', metadata: { editorBrowserCategory: 'player' },
    sources: [{ role: 'image', locator: { type: 'project-relative', path: resource } }] },
  source: { role: 'image', locator: { type: 'project-relative', path: resource } },
  documentIdentity: { projectId: 'game-a', documentId: 'player-document' }, documentLocator: { type: 'project-relative', path: 'player.asset.json' } });
console.log('REAL_ROOT', directory);
for (const resource of ['Assets/player.png', 'Assets/missing.png', 'Assets/denied.png']) {
  const result = await registerExistingAssetResource(context, make(resource), port);
  console.log(resource, result.status, result.status === 'admitted' ? { observation: result.observation, persistence: result.candidate.persistence } : result.reason);
}
console.log('NO_HOST', await registerExistingAssetResource(context, make('Assets/player.png'), null));
console.log('PNG file access observed; PNG decoding/pixels NOT_VERIFIED; no asset/manifest write');
