// Loopback-only finite transport for existing Project/Document/resource ports.
import { createServer } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { randomUUID, createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createMapFilesystemHost, mapDocuments } from './map-filesystem-host.mjs';
import { prepareMapMvp } from './map-mvp.mjs';

const host = process.argv.includes('--empty') ? await createMapFilesystemHost() : await prepareMapMvp();
const token = randomUUID(), files = new Map();
async function inventory(directory, prefix = '') {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) await inventory(path.join(directory, entry.name), `${prefix}${entry.name}/`);
    else if (entry.isFile()) files.set(`/${prefix}${entry.name}`, path.join(directory, entry.name));
  }
}
await inventory(fileURLToPath(new URL('../ui/dist/', import.meta.url)));
const documents = new Set(['project.json', 'player.asset.json', 'item.asset.json', ...mapDocuments]);
const sources = new Set(['sprites/background.png', 'sprites/player.png']);
let origin;
const server = createServer(async (request, response) => {
  const json = (status, body) => { response.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); response.end(JSON.stringify(body)); };
  try {
    if (request.headers.host !== new URL(origin).host || request.headers.origin && request.headers.origin !== origin
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
      if (!root || input.bindingId !== root.binding.bindingId) return json(403, { error: 'ROOT_DENIED' });
      if (url.pathname === '/__asset-host/resource') {
        if (input.projectId !== 'game-a' || !sources.has(input.locator)) return json(200, { status: 'unverified', reason: 'denied' });
        try { const bytes = await root.readBytes(input.locator);
          return json(200, { status: 'available', observation: { projectId: input.projectId, bindingId: input.bindingId,
            locator: input.locator, revision: createHash('sha256').update(bytes).digest('hex'), byteLength: bytes.length }, bytes: [...bytes] });
        } catch { return json(200, { status: 'unverified', reason: 'unavailable' }); }
      }
      if (!documents.has(input.locator)) return json(403, { error: 'PATH_DENIED' });
      if (input.operation === 'read') return json(200, await root.binding.readPort.read(input.locator));
      if (input.operation !== 'commit' || typeof input.text !== 'string' || input.text.length > 1_048_576 || input.expected?.kind !== 'absent')
        return json(400, { error: 'UNSUPPORTED_WRITE' });
      const scoped = Object.freeze({ locator: input.locator, text: input.text, revision: input.revision, expected: { kind: 'absent' } });
      const receipt = await root.binding.writePort.commit(scoped), cleanup = await root.binding.writePort.cleanup(scoped, receipt.status);
      return json(200, { ...receipt, hostCleanup: cleanup });
    }
    const file = files.get(url.pathname === '/' ? '/index.html' : url.pathname);
    if (request.method !== 'GET' || !file) return json(404, { error: 'NOT_FOUND' });
    response.writeHead(200, { 'Content-Type': file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : 'text/html', 'Cache-Control': 'no-store' });
    response.end(await readFile(file));
  } catch { if (!response.headersSent) json(500, { error: 'HOST_UNAVAILABLE' }); else response.end(); }
});
server.listen(0, '127.0.0.1', () => { origin = `http://127.0.0.1:${server.address().port}`;
  console.log('MAP_UI', JSON.stringify({ url: origin, roots: host.base, mode: process.argv.includes('--empty') ? 'empty' : 'saved-example',
    guarantee: 'create-only; existing-file updates unsupported; trusted finite topology' })); });
