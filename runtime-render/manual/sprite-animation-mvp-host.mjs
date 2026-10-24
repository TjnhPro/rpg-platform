// Optional read-only source grant server. Exact48 original files, no art copying.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../../', import.meta.url));
const assetRoot = path.resolve(process.argv[2] ?? path.join(root, '../jx1-manager-editor/data/asset-sources'));
const port = Number(process.argv[3] ?? 8774);
const contentFile = path.join(root, 'runtime-render/manual/sprite-animation-mvp-content.json');
const content = JSON.parse(fs.readFileSync(contentFile, 'utf8'));
const grants = new Set(content.resources.flatMap(resource => resource.pages.flatMap(page => page.files.map(file => file.path))));
http.createServer((request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1');
  let file;
  if (url.pathname === '/') file = path.join(root, 'runtime-render/manual/sprite-animation-mvp.html');
  else if (url.pathname === '/content.json') file = contentFile;
  else if (url.pathname === '/mvp.mjs') file = path.join(root, '.artifacts/sa12-manual/sprite-animation-mvp.mjs');
  else if (url.pathname.startsWith('/asset/') && grants.has(url.pathname.slice(7))) file = path.join(assetRoot, url.pathname.slice(7));
  else if (/^\/render\/[\w-]+\.js$/.test(url.pathname)) file = path.join(root, 'runtime-render/dist', path.basename(url.pathname));
  else if (/^\/three\/three\.(module|core)\.js$/.test(url.pathname)) file = path.join(root, 'node_modules/three/build', path.basename(url.pathname));
  if (!file || !fs.existsSync(file)) { response.writeHead(404); response.end('SOURCE_NOT_FOUND or manual build missing'); return; }
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('Content-Type', file.endsWith('.html') ? 'text/html; charset=utf-8' : /\.m?js$/.test(file) ? 'text/javascript' : file.endsWith('.png') ? 'image/png' : file.endsWith('.json') ? 'application/json' : 'text/plain');
  const stream = fs.createReadStream(file); stream.on('error', () => response.destroy()); stream.pipe(response);
}).listen(port, '127.0.0.1', () => console.log(`SA12 manual http://127.0.0.1:${port}; read-only source grant ${assetRoot}`));
