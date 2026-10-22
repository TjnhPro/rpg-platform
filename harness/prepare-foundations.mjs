// Tooling only: reconstruct supported external packages without vendoring source.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';

const root = fileURLToPath(new URL('../', import.meta.url));
const pins = JSON.parse(fs.readFileSync(new URL('./foundation-pins.json', import.meta.url), 'utf8'));
const npmCli = process.env.npm_execpath;
assert.ok(npmCli && fs.existsSync(npmCli), 'Run npm run foundations:prepare (npm CLI required)');
const artifacts = path.join(root, '.artifacts');
assert.ok(!fs.existsSync(artifacts) || !fs.lstatSync(artifacts).isSymbolicLink(), 'Linked artifact directory forbidden');
fs.mkdirSync(artifacts, {recursive: true});

function run(command, args, cwd, capture = false) {
  const result = spawnSync(command, args, {cwd, encoding: 'utf8', stdio: capture ? 'pipe' : 'inherit'});
  if (result.error || result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed: ${result.error?.message ?? result.stderr ?? result.status}`);
  }
  return result.stdout;
}
const npm = (args, cwd, capture = false) => run(process.execPath, [npmCli, ...args], cwd, capture);
const integrity = file => 'sha512-' + createHash('sha512').update(fs.readFileSync(file)).digest('base64');

if (Object.values(pins).every(pin => {
  const file = path.join(artifacts, pin.artifact);
  return fs.existsSync(file) && integrity(file) === pin.integrity;
})) {
  console.log('FOUNDATIONS_READY: cached artifact bytes match both exact pins');
} else {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'rpg-platform-foundations-'));
  const checkout = path.join(temp, 'gameplay');
  try {
    const pin = pins.gameplay;
    assert.match(pin.revision, /^[0-9a-f]{40}$/);
    run('git', ['-c', 'core.autocrlf=false', 'clone', '--no-checkout', pin.repository, checkout], temp);
    run('git', ['-c', 'core.autocrlf=false', 'checkout', '--detach', pin.revision], checkout);
    assert.equal(run('git', ['rev-parse', 'HEAD'], checkout, true).trim(), pin.revision);
    const pkg = JSON.parse(fs.readFileSync(path.join(checkout, 'package.json'), 'utf8'));
    assert.equal(pkg.name, pin.name);
    assert.equal(pkg.version, pin.version);
    assert.ok(pkg.exports['.']);
    assert.equal(pkg.peerDependencies[pins.core.name], pins.core.version);
    const corePin = JSON.parse(fs.readFileSync(path.join(checkout, 'harness/core-pin.json'), 'utf8'));
    for (const key of ['repository', 'revision', 'name', 'version', 'artifact']) assert.equal(corePin[key], pins.core[key]);
    // Upstream bootstrap checks Core's exact revision and locked SHA-512.
    npm(['run', 'core:prepare'], checkout);
    npm(['ci', '--ignore-scripts', '--no-audit', '--no-fund'], checkout);
    npm(['run', 'build'], checkout);
    const result = JSON.parse(npm(['pack', '--ignore-scripts', '--json', '--pack-destination', temp], checkout, true));
    const packed = Array.isArray(result) ? result[0] : result[pin.name];
    assert.equal(packed.filename, pin.artifact);
    const sources = {
      core: path.join(checkout, '.artifacts', pins.core.artifact),
      gameplay: path.join(temp, pin.artifact),
    };
    for (const [key, source] of Object.entries(sources)) {
      const actual = integrity(source);
      console.log(`${pins[key].name}@${pins[key].version} ${actual}`);
      assert.equal(actual, pins[key].integrity, 'Reconstructed artifact differs from approved pin');
    }
    for (const [key, source] of Object.entries(sources)) fs.copyFileSync(source, path.join(artifacts, pins[key].artifact));
    console.log('FOUNDATIONS_READY: exact-revision packages built and integrity verified');
  } finally {
    // Only remove this process's fresh temporary checkout.
    const resolved = fs.realpathSync(temp);
    assert.equal(path.dirname(resolved), fs.realpathSync(os.tmpdir()));
    assert.ok(path.basename(resolved).startsWith('rpg-platform-foundations-'));
    fs.rmSync(resolved, {recursive: true, force: true});
  }
}
