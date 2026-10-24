// Optional loopback server. Media comes only from explicit original File grants.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../../', import.meta.url));
const port = Number(process.argv[2] ?? 8782);
http.createServer((request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1');
  let file;
  if (url.pathname === '/') file = path.join(root, 'game-client/manual/vfx.html');
  else if (/^\/manual\/(vfx|atlas-mvp)\.mjs$/.test(url.pathname)) file = path.join(root, '.artifacts/ve11-manual', path.basename(url.pathname));
  else {
    const match = /^\/(dist|render)\/([\w-]+\.js)$/.exec(url.pathname);
    if (match) file = path.join(root, match[1] === 'dist' ? 'game-client' : 'runtime-render', 'dist', match[2]);
    else if (/^\/three\/three\.(module|core)\.js$/.test(url.pathname)) file = path.join(root, 'node_modules/three/build', path.basename(url.pathname));
  }
  if (!file || !fs.existsSync(file)) { response.writeHead(404); response.end('Manual build unavailable'); return; }
  response.setHeader('Content-Type', file.endsWith('.html') ? 'text/html; charset=utf-8' : 'text/javascript');
  response.setHeader('Cache-Control', 'no-store');
  const stream = fs.createReadStream(file); stream.on('error', () => response.destroy()); stream.pipe(response);
}).listen(port, '127.0.0.1', () => console.log(`VE11 manual http://127.0.0.1:${port}`));
