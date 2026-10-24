// Finite trusted-topology tooling, not a general filesystem security boundary.
import { lstat, realpath, open } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createProjectRootBinding } from '@rpg-platform/editor';
import { createAssetManagerFilesystemHost } from './asset-manager-host.mjs';

export const mapDocuments = new Set(['map.scene.json', 'ordinary.scene.json', 'future.scene.json', 'invalid.scene.json']);
export async function createMapFilesystemHost() {
  const base = await createAssetManagerFilesystemHost(), roots = new Map();
  for (const [projectId, original] of base.roots) {
    const directory = await realpath(original.directory);
    async function target(locator) {
      if (!mapDocuments.has(locator)) throw new TypeError('PATH_DENIED');
      const stat = await lstat(directory);
      if (!stat.isDirectory() || stat.isSymbolicLink() || await realpath(directory) !== directory) throw new TypeError('ROOT_DENIED');
      return path.join(directory, locator);
    }
    const readPort = { async read(locator) {
      if (!mapDocuments.has(locator)) return original.binding.readPort.read(locator);
      let handle;
      try {
        const file = await target(locator), stat = await lstat(file);
        if (!stat.isFile() || stat.isSymbolicLink()) throw new TypeError('PATH_DENIED');
        handle = await open(file, 'r');
        const maximum = 4_194_304, bytes = Buffer.alloc(maximum + 1); let length = 0;
        while (length < bytes.length) { const result = await handle.read(bytes, length, bytes.length - length, null); if (!result.bytesRead) break; length += result.bytesRead; }
        if (length > maximum) throw new RangeError('READ_LIMIT');
        const captured = bytes.subarray(0, length);
        return { status: 'read', text: new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(captured),
          observation: { identity: null, revision: createHash('sha256').update(captured).digest('hex') } };
      } catch (error) { return error.code === 'ENOENT' ? { status: 'not-found' } : { status: 'read-failed', reason: 'permission-denied' }; }
      finally { await handle?.close(); }
    } };
    const binding = createProjectRootBinding({ projectId, bindingId: original.binding.bindingId, readPort, writePort: null });
    roots.set(projectId, { directory, binding, readBytes: original.readBytes, target });
  }
  return { base: base.base, roots };
}
