import { createServer } from 'node:http';
import { copyFile, mkdir, lstat, realpath, open, link, unlink, readFile, readdir } from 'node:fs/promises';
import { randomUUID, createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createProjectFilesystemHost } from './project-filesystem-host.mjs';
import { createProjectRootBinding, diagnoseDocument, projectDocumentContext } from '@rpg-platform/editor';

const assetContext = Object.freeze({ owner: 'asset', documentKind: 'asset', contentSchemaVersion: 1 });
const documents = new Set(['player.asset.json', 'item.asset.json']);
/** Finite trusted-topology demo, not a hostile same-account filesystem sandbox.
 * Reuses Phase13 roots/manifest ports; adds exactly two asset files and one PNG. */
export async function createAssetManagerFilesystemHost() {
  const baseHost = await createProjectFilesystemHost();
  await mkdir(path.join(baseHost.roots.get('game-a').directory, 'sprites'));
  await copyFile(fileURLToPath(new URL('../../runtime-render/manual/scene-mvp-assets/traveler.png', import.meta.url)),
    path.join(baseHost.roots.get('game-a').directory, 'sprites/player.png'));
  const roots = new Map();
  for (const [projectId, original] of baseHost.roots) {
    const canonical = await realpath(original.directory), artifacts = new WeakMap();
    async function target(locator) {
      const source = projectId === 'game-a' && locator === 'sprites/player.png';
      if (!documents.has(locator) && !source) throw new TypeError('PATH_DENIED');
      const stat = await lstat(original.directory);
      if (!stat.isDirectory() || stat.isSymbolicLink() || await realpath(original.directory) !== canonical) throw new TypeError('ROOT_DENIED');
      if (source) {
        const parent = await lstat(path.join(original.directory, 'sprites'));
        if (!parent.isDirectory() || parent.isSymbolicLink()) throw new TypeError('PATH_DENIED');
      }
      return path.join(original.directory, locator);
    }
    async function readBytes(locator, maximum = 4_194_304) {
      const file = await target(locator); let handle;
      try {
        const stat = await lstat(file);
        if (!stat.isFile() || stat.isSymbolicLink()) throw new TypeError('PATH_DENIED');
        handle = await open(file, 'r');
        if (!(await handle.stat()).isFile()) throw new TypeError('PATH_DENIED');
        const buffer = Buffer.alloc(maximum + 1); let length = 0;
        while (length < buffer.length) { const part = await handle.read(buffer, length, buffer.length - length, null); if (!part.bytesRead) break; length += part.bytesRead; }
        if (length > maximum) throw new RangeError('READ_LIMIT');
        return buffer.subarray(0, length);
      } finally { await handle?.close(); }
    }
    const readPort = { async read(locator) {
      if (locator === 'project.json') return original.readPort.read(locator);
      if (!documents.has(locator)) return { status: 'read-failed', reason: 'permission-denied' };
      try {
        const bytes = await readBytes(locator);
        return { status: 'read', text: new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes),
          observation: { identity: null, revision: createHash('sha256').update(bytes).digest('hex') } };
      } catch (error) { return error.code === 'ENOENT' ? { status: 'not-found' } : { status: 'read-failed', reason: 'permission-denied' }; }
    } };
    const writePort = { conflictProtection: 'create-only', publication: 'atomic-publish',
      async commit(request) {
        if (request.locator === 'project.json') return original.writePort.commit(request);
        if (!documents.has(request.locator) || request.expected.kind !== 'absent') return { status: 'conflicted' };
        const validation = diagnoseDocument(request.text, assetContext);
        if (!validation.readEligibility.strict || validation.document.identity.projectId !== projectId) return { status: 'failed', reason: 'permission-denied' };
        try {
          const destination = await target(request.locator);
          const temporary = path.join(original.directory, `.asset-${randomUUID()}.tmp`);
          const handle = await open(temporary, 'wx', 0o600); artifacts.set(request, temporary);
          try { await handle.writeFile(request.text, 'utf8'); await handle.sync(); } finally { await handle.close(); }
          await link(temporary, destination);
          return { status: 'committed', confirmation: 'filesystem-hard-link-created', observation: { identity: null, revision: null } };
        } catch (error) { return error.code === 'EEXIST' ? { status: 'conflicted' } : { status: 'uncertain' }; }
      },
      async cleanup(request, outcome) {
        if (request.locator === 'project.json') return original.writePort.cleanup(request, outcome);
        const temporary = artifacts.get(request);
        if (!temporary) return { status: 'cleaned' };
        if (outcome === 'uncertain') return { status: 'retained' };
        try { await unlink(temporary); artifacts.delete(request); return { status: 'cleaned' }; } catch { return { status: 'failed' }; }
      },
    };
    const binding = createProjectRootBinding({ projectId, bindingId: original.binding.bindingId, readPort, writePort });
    roots.set(projectId, { directory: original.directory, binding, readBytes });
  }
  return { base: baseHost.base, roots };
}

async function serve() {
  const host = await createAssetManagerFilesystemHost(), token = randomUUID();
  const staticRoot = fileURLToPath(new URL('../ui/dist/', import.meta.url));
  const files = new Map();
  async function inventory(directory, prefix = '') {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) await inventory(path.join(directory, entry.name), `${prefix}${entry.name}/`);
      else if (entry.isFile()) files.set(`/${prefix}${entry.name}`, path.join(directory, entry.name));
    }
  }
  await inventory(staticRoot); let origin;
  const server = createServer(async (request, response) => {
    const json = (status, body) => { response.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); response.end(JSON.stringify(body)); };
    try {
      if (request.headers.host !== new URL(origin).host || (request.headers.origin && request.headers.origin !== origin)
        || request.headers['sec-fetch-site'] === 'cross-site') return json(403, { error: 'ORIGIN_DENIED' });
      const url = new URL(request.url, origin);
      if (request.method === 'GET' && url.pathname === '/__project-host/capability')
        return json(200, { token, roots: [...host.roots].map(([projectId, root]) => ({ projectId, bindingId: root.binding.bindingId, directory: root.directory })) });
      if (request.method === 'POST' && ['/__project-host/io', '/__asset-host/resource'].includes(url.pathname)) {
        if (request.headers['x-project-capability'] !== token || !request.headers['content-type']?.startsWith('application/json')) return json(403, { error: 'CAPABILITY_DENIED' });
        const chunks = []; let length = 0;
        for await (const chunk of request) { length += chunk.length; if (length > 8_388_608) return json(413, { error: 'READ_LIMIT' }); chunks.push(chunk); }
        const input = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks)));
        const root = host.roots.get(input.projectId);
        if (!root || root.binding.bindingId !== input.bindingId) return json(403, { error: 'ROOT_DENIED' });
        if (url.pathname === '/__asset-host/resource') {
          if (input.projectId !== 'game-a' || input.locator !== 'sprites/player.png') return json(200, { status: 'unverified', reason: 'denied' });
          try {
            const bytes = await root.readBytes(input.locator);
            return json(200, { status: 'available', observation: { projectId: input.projectId, bindingId: input.bindingId,
              locator: input.locator, revision: createHash('sha256').update(bytes).digest('hex'), byteLength: bytes.length }, bytes: [...bytes] });
          } catch (error) { return json(200, { status: 'unverified', reason: error.code === 'ENOENT' ? 'not-found' : 'unavailable' }); }
        }
        if (input.locator !== 'project.json' && !documents.has(input.locator)) return json(403, { error: 'PATH_DENIED' });
        if (input.operation === 'read') return json(200, await root.binding.readPort.read(input.locator));
        if (input.operation !== 'commit' || typeof input.text !== 'string' || input.text.length > 1_048_576 || input.expected?.kind !== 'absent') return json(400, { error: 'UNSUPPORTED_WRITE' });
        const validation = diagnoseDocument(input.text, input.locator === 'project.json' ? projectDocumentContext : assetContext);
        if (!validation.readEligibility.strict || validation.document.identity.projectId !== input.projectId) return json(400, { error: 'DOCUMENT_REJECTED' });
        const scoped = Object.freeze({ locator: input.locator, text: input.text, revision: input.revision, expected: { kind: 'absent' } });
        const receipt = await root.binding.writePort.commit(scoped);
        const cleanup = await root.binding.writePort.cleanup(scoped, receipt.status);
        return json(200, { ...receipt, hostCleanup: cleanup });
      }
      const file = files.get(url.pathname === '/' ? '/index.html' : url.pathname);
      if (request.method !== 'GET' || !file) return json(404, { error: 'NOT_FOUND' });
      response.writeHead(200, { 'Content-Type': file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : 'text/html', 'Cache-Control': 'no-store' }); response.end(await readFile(file));
    } catch { if (!response.headersSent) json(500, { error: 'HOST_UNAVAILABLE' }); else response.end(); }
  });
  server.listen(0, '127.0.0.1', () => { origin = `http://127.0.0.1:${server.address().port}`; console.log(JSON.stringify({ url: origin, roots: host.base, guarantee: 'create-only; existing-file updates unsupported' })); });
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await serve();
