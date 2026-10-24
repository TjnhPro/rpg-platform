import { createServer } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { createProjectFilesystemHost } from './project-filesystem-host.mjs';

// Manual same-origin bridge serving the already-built Phase12 application.
const host = await createProjectFilesystemHost();
const token = randomUUID();
const staticRoot = fileURLToPath(new URL('../ui/dist/', import.meta.url));
const files = new Map();
async function inventory(directory, prefix = '') {
  for (const item of await readdir(directory, { withFileTypes: true })) {
    if (item.isSymbolicLink()) continue;
    if (item.isDirectory()) await inventory(path.join(directory, item.name), prefix + item.name + '/');
    else if (item.isFile()) files.set('/' + prefix + item.name, path.join(directory, item.name));
  }
}
await inventory(staticRoot);
let origin;
const server = createServer(async (request, response) => {
  const json = (status, body) => { response.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); response.end(JSON.stringify(body)); };
  try {
    if (request.headers.host !== new URL(origin).host
      || (request.headers.origin && request.headers.origin !== origin)
      || request.headers['sec-fetch-site'] === 'cross-site') return json(403, { error: 'ORIGIN_DENIED' });
    const url = new URL(request.url, origin);
    if (request.method === 'GET' && url.pathname === '/__project-host/capability') {
      return json(200, { token, roots: [...host.roots].map(([projectId, root]) => ({ projectId, bindingId: root.binding.bindingId, directory: root.directory })) });
    }
    if (request.method === 'POST' && url.pathname === '/__project-host/io') {
      if (request.headers['x-project-capability'] !== token || !request.headers['content-type']?.startsWith('application/json')) return json(403, { error: 'CAPABILITY_DENIED' });
      const chunks = []; let length = 0;
      for await (const chunk of request) { length += chunk.length; if (length > 8_388_608) return json(413, { error: 'TOO_LARGE' }); chunks.push(chunk); }
      const input = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks)));
      const root = host.roots.get(input.projectId);
      if (!root || input.bindingId !== root.binding.bindingId || input.locator !== 'project.json') return json(403, { error: 'ROOT_DENIED' });
      if (input.operation === 'read') return json(200, await root.readPort.read(input.locator));
      if (input.operation !== 'commit' || typeof input.text !== 'string' || input.text.length > 1_048_576
        || input.expected?.kind !== 'absent') return json(400, { error: 'UNSUPPORTED_WRITE' });
      // Canonical package decoder/owner checked independently at the host boundary.
      const { diagnoseDocument, projectDocumentContext } = await import('@rpg-platform/editor');
      const validation = diagnoseDocument(input.text, projectDocumentContext);
      if (!validation.readEligibility.strict || validation.document.identity.projectId !== input.projectId) return json(400, { error: 'PROJECT_REJECTED' });
      const scoped = Object.freeze({ locator: input.locator, text: input.text, revision: input.revision, expected: { kind: 'absent' } });
      const receipt = await root.writePort.commit(scoped);
      await root.writePort.cleanup(scoped, receipt.status);
      return json(200, receipt);
    }
    const file = files.get(url.pathname === '/' ? '/index.html' : url.pathname);
    if (request.method !== 'GET' || !file) return json(404, { error: 'NOT_FOUND' });
    const type = file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : 'text/html';
    response.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' }); response.end(await readFile(file));
  } catch { if (!response.headersSent) json(500, { error: 'HOST_IO_UNAVAILABLE' }); else response.end(); }
});
server.listen(0, '127.0.0.1', () => {
  origin = `http://127.0.0.1:${server.address().port}`;
  console.log(JSON.stringify({ url: origin, roots: host.base, guarantee: 'create-only hard-link publication; existing-file updates unsupported' }));
});
