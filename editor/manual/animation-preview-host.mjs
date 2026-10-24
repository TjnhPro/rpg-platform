// Optional local read-only manual server. No source copies or dependency changes.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../../', import.meta.url));
const assetRoot = path.resolve(process.argv[2] ?? path.join(root, '../jx1-manager-editor/data/asset-sources/monster/ani063'));
const port = Number(process.argv[3] ?? 8770);
const server = http.createServer((request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1');
  let file;
  if (url.pathname === '/') file = path.join(root, 'editor/manual/animation-preview.html');
  else if (url.pathname === '/preview.mjs') file = path.join(root, '.artifacts/sa10-manual/animation-preview.mjs');
  else if (/^\/asset\/(NormalStand1|NormalWalk)_[0-7]\.(png|tpsheet)$/.test(url.pathname)) file = path.join(assetRoot, path.basename(url.pathname));
  else if (/^\/foundation\/(core|gameplay)\/[\w/-]+\.js$/.test(url.pathname)) {
    const parts = url.pathname.split('/');
    file = path.join(root, 'node_modules/@rpg', parts[2], 'dist', ...parts.slice(3));
  }
  else {
    const match = /^\/(editor|render|engine)\/([\w-]+\.js)$/.exec(url.pathname);
    if (match) file = path.join(root, { editor: 'editor', render: 'runtime-render', engine: 'runtime-engine' }[match[1]], 'dist', match[2]);
    else if (/^\/three\/three\.(module|core)\.js$/.test(url.pathname)) file = path.join(root, 'node_modules/three/build', path.basename(url.pathname));
  }
  if (!file || !fs.existsSync(file)) { response.writeHead(404); response.end('ASSET_NOT_AVAILABLE or manual build missing'); return; }
  response.setHeader('Content-Type', file.endsWith('.html') ? 'text/html' : /\.m?js$/.test(file) ? 'text/javascript' : file.endsWith('.png') ? 'image/png' : 'text/plain');
  response.setHeader('Cache-Control', 'no-store');
  const stream = fs.createReadStream(file);
  stream.on('error', () => response.destroy()); stream.pipe(response);
});
server.listen(port, '127.0.0.1', () => console.log(`SA10 manual http://127.0.0.1:${port}; authorized asset root ${assetRoot}`));
