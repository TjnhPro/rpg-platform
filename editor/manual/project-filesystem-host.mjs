import { mkdtemp, mkdir, realpath, lstat, open, link, unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { createProjectRootBinding } from '@rpg-platform/editor';

/** Deliberately narrow manual host: fresh host-owned roots, one flat manifest each.
 * No user paths, nested dispatch, overwrite or claimed replacement CAS.
 * Trust boundary: this user's OS account/root ancestry is trusted not to replace
 * directory topology concurrently. This is not a hostile-local-user sandbox.
 */
export async function createProjectFilesystemHost() {
  const base = await mkdtemp(path.join(tmpdir(), 'rpg-project-manager-'));
  const roots = new Map();
  for (const projectId of ['game-a', 'game-b']) {
    const directory = path.join(base, projectId);
    await mkdir(directory);
    const canonical = await realpath(directory);
    const artifacts = new WeakMap();
    async function target(locator) {
      if (locator !== 'project.json') throw new TypeError('Host authorizes project.json only');
      const stat = await lstat(directory);
      if (!stat.isDirectory() || stat.isSymbolicLink() || await realpath(directory) !== canonical)
        throw new TypeError('Root authorization no longer valid');
      return path.join(directory, 'project.json');
    }
    const readPort = Object.freeze({ async read(locator) {
      let handle;
      try {
        const file = await target(locator);
        const stat = await lstat(file);
        if (!stat.isFile() || stat.isSymbolicLink()) return { status: 'read-failed', reason: 'permission-denied' };
        handle = await open(file, 'r');
        const opened = await handle.stat();
        if (!opened.isFile() || opened.size > 4_194_304) return { status: 'read-failed', reason: 'io-error' };
        const buffer = Buffer.alloc(4_194_305);
        let length = 0;
        while (length < buffer.length) {
          const part = await handle.read(buffer, length, buffer.length - length, null);
          if (part.bytesRead === 0) break;
          length += part.bytesRead;
        }
        if (length > 4_194_304) return { status: 'read-failed', reason: 'io-error' };
        const bytes = buffer.subarray(0, length);
        // No BOM removal or replacement-decoding; codec owns exact resulting text.
        const text = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes);
        return { status: 'read', text, observation: { identity: null, revision: null } };
      } catch (error) {
        if (error.code === 'ENOENT') return { status: 'not-found' };
        return { status: 'read-failed', reason: ['EACCES', 'EPERM'].includes(error.code) ? 'permission-denied' : 'io-error' };
      } finally { await handle?.close(); }
    } });
    const writePort = Object.freeze({ conflictProtection: 'create-only', publication: 'atomic-publish',
      async commit(request) {
        if (request.expected.kind !== 'absent') return { status: 'conflicted' };
        let temporary;
        try {
          const file = await target(request.locator);
          temporary = path.join(directory, `.project-${randomUUID()}.tmp`);
          const handle = await open(temporary, 'wx', 0o600);
          artifacts.set(request, temporary);
          try { await handle.writeFile(request.text, 'utf8'); await handle.sync(); }
          finally { await handle.close(); }
          // Atomic hard-link creation: target must be absent at the publication
          // itself, including races with other writers. Full closed payload only.
          await link(temporary, file);
          return { status: 'committed', confirmation: 'filesystem-hard-link-created',
            observation: { identity: null, revision: null } };
        } catch (error) {
          if (error.code === 'EEXIST') return { status: 'conflicted' };
          if (['EACCES', 'EPERM'].includes(error.code)) return { status: 'failed', reason: 'permission-denied' };
          // Unknown publication outcome is conservatively quarantined by saveDocument.
          return { status: 'uncertain' };
        }
      },
      async cleanup(request, outcome) {
        const temporary = artifacts.get(request);
        if (temporary === undefined) return { status: 'cleaned' };
        if (outcome === 'uncertain') return { status: 'retained' };
        try { await unlink(temporary); artifacts.delete(request); return { status: 'cleaned' }; }
        catch { return { status: 'failed' }; }
      },
    });
    roots.set(projectId, Object.freeze({ directory, readPort, writePort,
      binding: createProjectRootBinding({ projectId, bindingId: randomUUID(), readPort, writePort }) }));
  }
  return Object.freeze({ base, roots });
}
