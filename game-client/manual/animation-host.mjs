// Optional local read-only manual server. No source copies or dependency changes.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../../', import.meta.url));
const port = Number(process.argv[2] ?? 8772);
const server = http.createServer((request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1');
  let file;
  if (url.pathname === '/') file = path.join(root, 'game-client/manual/animation.html');
  else if (/^\/manual\/[\w-]+\.mjs$/.test(url.pathname)) file = path.join(root, '.artifacts/sa11-manual', path.basename(url.pathname));
  else {
    const match = /^\/(dist|render)\/([\w-]+\.js)$/.exec(url.pathname);
    if (match) file = path.join(root, { dist: 'game-client', render: 'runtime-render' }[match[1]], 'dist', match[2]);
    else if (/^\/three\/three\.(module|core)\.js$/.test(url.pathname)) file = path.join(root, 'node_modules/three/build', path.basename(url.pathname));
  }
  if (!file || !fs.existsSync(file)) { response.writeHead(404); response.end('ASSET_NOT_AVAILABLE or manual build missing'); return; }
  response.setHeader('Content-Type', file.endsWith('.html') ? 'text/html; charset=utf-8' : /\.m?js$/.test(file) ? 'text/javascript' : file.endsWith('.png') ? 'image/png' : 'text/plain');
  response.setHeader('Cache-Control', 'no-store');
  const stream = fs.createReadStream(file);
  stream.on('error', () => response.destroy()); stream.pipe(response);
});
server.listen(port, '127.0.0.1', () => console.log(`SA11 manual http://127.0.0.1:${port}`));
