#!/usr/bin/env node
/** RPG Platform lightweight harness. Node 22+, no third-party dependencies. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const configPath = path.join(root, 'harness', 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const projects = config.projects;
const byId = new Map(projects.map(p => [p.id, p]));
const errors = [];
const warnings = [];
const info = msg => process.stdout.write(`${msg}\n`);
const fail = msg => { errors.push(msg); process.stderr.write(`ERROR ${msg}\n`); };
const warn = msg => { warnings.push(msg); process.stderr.write(`WARN  ${msg}\n`); };
const norm = s => path.resolve(root, s);
const slash = s => s.replaceAll('\\', '/');
const rel = s => slash(path.relative(root, s) || '.');
const inDir = (file, dir) => file === dir || file.startsWith(dir + path.sep);

function validateConfig() {
  if (config.schemaVersion !== 1 || projects.length !== 5 || byId.size !== 5) {
    throw new Error('Harness config must declare exactly five unique projects at schemaVersion 1.');
  }
  const required = ['runtime-engine', 'runtime-render', 'editor', 'game-client', 'game-server'];
  if (required.some(id => !byId.has(id))) throw new Error('Missing one of the five required project IDs.');
  const roots = new Set();
  for (const p of projects) {
    const full = norm(p.path);
    if (!inDir(full, root) || full === root) throw new Error(`Project path outside workspace: ${p.id}`);
    if (roots.has(full)) throw new Error(`Duplicate project root: ${p.path}`);
    roots.add(full);
    if (!Array.isArray(p.canImportProjects) || p.canImportProjects.some(id => !byId.has(id))) {
      throw new Error(`Invalid dependency permissions: ${p.id}`);
    }
    if (!Array.isArray(p.publicExports) || p.publicExports.some(x => typeof x !== 'string')) {
      throw new Error(`publicExports must be an array: ${p.id}`);
    }
    if (p.build !== null && (!Array.isArray(p.build) || !p.build.length || p.build.some(x => typeof x !== 'string' || !x.trim()))) {
      throw new Error(`Build command must be null or a nonempty argv array: ${p.id}`);
    }
  }
  if (projects.some(p => p.canImportProjects.includes(p.id))) throw new Error('Self-dependency is not allowed.');
  // Guard cycles because a cycle destroys project isolation.
  const visiting = new Set(), visited = new Set();
  function visit(id) {
    if (visiting.has(id)) throw new Error(`Project dependency cycle at ${id}`);
    if (visited.has(id)) return;
    visiting.add(id);
    for (const dep of byId.get(id).canImportProjects) visit(dep);
    visiting.delete(id);
    visited.add(id);
  }
  for (const p of projects) visit(p.id);
}

function argsAfter(command) {
  const i = process.argv.indexOf(command);
  return process.argv.slice(i + 1);
}
function opt(args, name) {
  const i = args.indexOf(name);
  if (i < 0 || !args[i + 1]) throw new Error(`Missing ${name} argument`);
  return args[i + 1];
}
function selectedProjects(args) {
  const ids = opt(args, '--projects').split(',').map(s => s.trim()).filter(Boolean);
  if (!ids.length || new Set(ids).size !== ids.length || ids.some(id => !byId.has(id))) {
    throw new Error(`Unknown/duplicate project in --projects. Use ${projects.map(p => p.id).join(',')}`);
  }
  return ids;
}

function namesFromManifests() {
  const out = new Map();
  for (const p of projects) {
    let name = p.packageName;
    const file = path.join(norm(p.path), 'package.json');
    if (fs.existsSync(file)) {
      const obj = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (name && obj.name && name !== obj.name) fail(`packageName differs from actual ${p.path}/package.json: ${name} vs ${obj.name}`);
      if (!name && typeof obj.name === 'string') name = obj.name;
    }
    if (name) {
      if (out.has(name)) fail(`Duplicate packageName: ${name}`);
      out.set(name, p.id);
    }
  }
  return out;
}

function readSources(dir, output) {
  if (!fs.existsSync(dir)) { fail(`Missing project directory: ${rel(dir)}`); return; }
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const location = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) continue; // never traverse outside root via links
    if (entry.isDirectory()) {
      if (!config.ignoredDirectories.includes(entry.name)) readSources(location, output);
    } else if (entry.isFile() && config.sourceExtensions.includes(path.extname(entry.name))) {
      output.push(location);
    }
  }
}

/** Best-effort static import matcher, not a TypeScript parser or security proof. */
function importsFrom(source) {
  const matches = [];
  // ESM static import/export-from, side-effect imports, import('literal'), require('literal').
  const patterns = [
    /\b(?:import|export)\s+(?:[\s\S]{0,600}?\s+from\s*)?["']([^"'\n]+)["']/g,
    /\bimport\s*\(\s*["']([^"'\n]+)["']\s*\)/g,
    /\brequire\s*\(\s*["']([^"'\n]+)["']\s*\)/g
  ];
  for (const pattern of patterns) for (const m of source.matchAll(pattern)) matches.push(m[1]);
  return [...new Set(matches)];
}

function referenceTarget(specifier, fromFile, names) {
  const spec = specifier.replace(/[?#].*$/, '');
  if (spec.startsWith('.') || spec.startsWith('/')) {
    const target = path.resolve(path.dirname(fromFile), spec);
    for (const p of projects) if (inDir(target, norm(p.path))) return { id: p.id, kind: 'relative', spec };
    return null;
  }
  for (const [name, id] of names) {
    if (spec === name || spec.startsWith(`${name}/`)) return { id, kind: 'package', spec, publicName: name };
  }
  return null;
}

function checkImport(owner, file, specifier, names, isManifestDependency = false) {
  const spec = specifier.replace(/[?#].*$/, '');
  // Frozen foundation import checking: entrypoints are explicit.
  for (const foundation of config.foundationPackages) {
    if (spec === foundation.prefix || spec.startsWith(foundation.prefix + '/')) {
      if (!foundation.consumerProjects.includes(owner.id)) fail(`${rel(file)}: ${owner.id} cannot import frozen foundation ${spec}`);
      else if (!isManifestDependency && !foundation.allowedImports.includes(spec)) fail(`${rel(file)}: only approved public foundation entrypoint(s): ${foundation.allowedImports.join(', ')}, got ${spec}`);
      return;
    }
  }
  const target = referenceTarget(spec, file, names);
  if (!target || target.id === owner.id) return;
  if (!owner.canImportProjects.includes(target.id)) {
    fail(`${rel(file)}: forbidden ${owner.id} -> ${target.id} import: ${specifier}`);
  } else if (target.kind === 'relative') {
    fail(`${rel(file)}: cross-project relative/deep source import forbidden (${target.id}); use an approved public package entrypoint`);
  } else if (target.spec !== target.publicName && !byId.get(target.id).publicExports.includes(target.spec)) {
    fail(`${rel(file)}: private/deep package import forbidden (${target.spec}); declare an approved public export contract before allowing it`);
  }
}

function check() {
  const names = namesFromManifests();
  let filesChecked = 0;
  for (const p of projects) {
    const files = [];
    readSources(norm(p.path), files);
    filesChecked += files.length;
    for (const file of files) {
      const data = fs.readFileSync(file, 'utf8');
      for (const imp of importsFrom(data)) checkImport(p, file, imp, names);
    }
    const manifest = path.join(norm(p.path), 'package.json');
    if (fs.existsSync(manifest)) {
      const pkg = JSON.parse(fs.readFileSync(manifest, 'utf8'));
      for (const group of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
        for (const dependency of Object.keys(pkg[group] || {})) checkImport(p, manifest, dependency, names, true);
      }
    }
  }
  if (!errors.length) {
    info(`ARCH_CHECK_PASS: inspected ${filesChecked} JS/TS source files; project/public import constraints satisfied at static-scan level.`);
    if (!filesChecked) info('NOTE: No project JS/TS source exists yet; no build or runtime behavior was checked.');
  }
  return !errors.length;
}

function doctor() {
  info('RPG PLATFORM HARNESS — five-project workspace');
  const names = namesFromManifests();
  for (const p of projects) {
    const dir = norm(p.path);
    const pkg = [...names].find(([, id]) => id === p.id)?.[0] ?? '(not declared)';
    const build = p.build === null ? 'BUILD_UNCONFIGURED' : p.build.join(' ');
    info(`- ${p.id}: ${fs.existsSync(dir) ? 'directory OK' : 'MISSING'}; package ${pkg}; ${build}`);
  }
  info('Guard: five owners; read-only L1/L2; build-only automatic verification; no UI tests or testcase generator.');
  info('Static scanner covers JS/TS literal import specifiers only; it cannot prove semantic ownership.');
}

function route(args) {
  const textInput = args.filter(x => x !== '--').join(' ').trim();
  if (!textInput) throw new Error('Usage: route -- "<task text>"');
  const registry = JSON.parse(fs.readFileSync(path.join(root, 'harness', 'ownership.json'), 'utf8'));
  const normalize = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replaceAll('đ', 'd');
  const task = normalize(textInput);
  const hits = registry.domains.map(domain => ({ ...domain, matched: domain.signals.filter(s => task.includes(normalize(s))) })).filter(x => x.matched.length);
  info(`TASK: ${textInput}`);
  info('ROUTE_HINT_ONLY — these are potential owners, not approval or automatic code destinations:');
  if (!hits.length) info('- No reliable keyword hint. Read code/contract and decide with Developer.');
  for (const x of hits) info(`- ${x.owner}: ${x.why}; signals: ${x.matched.join(', ')}`);
  info('Agent MUST inspect source, select one canonical behavior owner, list collaborators and confirm boundary before editing.');
}

function actualDependencies() {
  // Only *observed* source/package imports count: canImportProjects is permission,
  // not proof a consumer currently depends on a project.
  const names = namesFromManifests();
  const graph = new Map(projects.map(p => [p.id, new Set()]));
  for (const p of projects) {
    const manifestPath = path.join(norm(p.path), 'package.json');
    if (fs.existsSync(manifestPath)) {
      const pkg = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      for (const group of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
        for (const name of Object.keys(pkg[group] || {})) if (names.has(name) && names.get(name) !== p.id) {
          graph.get(p.id).add(names.get(name));
        }
      }
    }
    const files = [];
    readSources(norm(p.path), files);
    for (const file of files) {
      for (const imp of importsFrom(fs.readFileSync(file, 'utf8'))) {
        const target = referenceTarget(imp, file, names);
        if (target && target.id !== p.id) graph.get(p.id).add(target.id);
      }
    }
  }
  return graph;
}

function consumersOf(ids) {
  const graph = actualDependencies();
  const set = new Set(ids);
  let changed = true;
  while (changed) {
    changed = false;
    for (const p of projects) if (!set.has(p.id) && [...graph.get(p.id)].some(dep => set.has(dep))) {
      set.add(p.id);
      changed = true;
    }
  }
  return [...set];
}

function buildOrder(ids) {
  const needed = new Set(ids);
  const out = [], seen = new Set();
  function visit(id) {
    if (seen.has(id)) return;
    seen.add(id);
    for (const dep of byId.get(id).canImportProjects) if (needed.has(dep)) visit(dep);
    out.push(id);
  }
  for (const id of ids) visit(id);
  return out;
}

function verify(args) {
  const selected = selectedProjects(args);
  if (!check()) { info('ARCH_CHECK_FAIL: skipping builds.'); return false; }
  const impacted = args.includes('--with-consumers') ? consumersOf(selected) : selected;
  const ordered = buildOrder(impacted);
  info(`BUILD_SCOPE: ${ordered.join(', ')}${args.includes('--with-consumers') ? ' (including consumers)' : ''}`);
  let ok = true;
  for (const id of ordered) {
    const p = byId.get(id);
    if (!p.build) { fail(`BUILD_UNCONFIGURED [${id}] — set actual argv in harness/config.json; cannot claim PASS.`); ok = false; continue; }
    info(`BUILD_START [${id}] ${p.build.join(' ')}`);
    const result = spawnSync(p.build[0], p.build.slice(1), { cwd: norm(p.path), stdio: 'inherit', shell: process.platform === 'win32' });
    if (result.error || result.status !== 0) { fail(`BUILD_FAIL [${id}] exit=${result.status ?? 'unknown'} ${result.error?.message ?? ''}`); ok = false; }
    else info(`BUILD_PASS [${id}]`);
  }
  if (ok) info('BUILD_VERIFICATION_PASS — not a gameplay, UI or security verification.');
  return ok;
}

function scope(args) {
  const selected = new Set(selectedProjects(args));
  const allowInfrastructure = args.includes('--allow-infra');
  const result = spawnSync('git', ['status', '--porcelain=v1', '-z', '--untracked-files=all'], {cwd: root, encoding: 'utf8'});
  if (result.error || result.status !== 0) {
    fail('SCOPE_UNAVAILABLE: root is not an initialized Git workspace or git is not accessible. Scope is NOT verified.');
    return false;
  }
  const records = result.stdout.split('\0').filter(Boolean);
  let count = 0;
  for (let i = 0; i < records.length; i++) {
    const entry = records[i];
    if (entry.length < 4) continue;
    const code = entry.slice(0, 2);
    const file = entry.slice(3);
    const items = [file];
    if (code.includes('R') || code.includes('C')) { if (records[i + 1]) items.push(records[++i]); }
    for (const item of items) {
      count++;
      const full = norm(item);
      if (!inDir(full, root)) { fail(`SCOPE_FAIL: path outside workspace ${item}`); continue; }
      if (config.readOnlyDirectories.some(dir => inDir(full, norm(dir)))) {
        fail(`SCOPE_FAIL: frozen foundation modified: ${item}`); continue;
      }
      const owner = projects.find(p => inDir(full, norm(p.path)));
      if (owner && !selected.has(owner.id)) fail(`SCOPE_FAIL: ${item} belongs to ${owner.id}, outside allowed ${[...selected].join(',')}`);
      else if (!owner && !allowInfrastructure) fail(`SCOPE_FAIL: infrastructure/root change ${item} requires explicit --allow-infra`);
    }
  }
  if (!errors.length) info(`SCOPE_PASS: ${count} modified/untracked paths within declared ${[...selected].join(',')}${allowInfrastructure ? ' + infrastructure' : ''}.`);
  return !errors.length;
}

function usage() {
  info('Usage:\n  node harness/cli.mjs doctor\n  node harness/cli.mjs route -- "task"\n  node harness/cli.mjs check\n  node harness/cli.mjs scope --projects editor,runtime-render [--allow-infra]\n  node harness/cli.mjs verify --projects editor,runtime-render [--with-consumers]');
}

try {
  validateConfig();
  const cmd = process.argv[2];
  const args = argsAfter(cmd);
  let success = true;
  if (cmd === 'doctor') doctor();
  else if (cmd === 'route') route(args);
  else if (cmd === 'check') success = check();
  else if (cmd === 'verify') success = verify(args);
  else if (cmd === 'scope') success = scope(args);
  else if (cmd === undefined || ['help', '-h', '--help'].includes(cmd)) usage();
  else throw new Error(`Unknown command '${cmd}'`);
  if (!success || errors.length) process.exitCode = 1;
} catch (error) {
  process.stderr.write(`HARNESS_ERROR: ${error.message}\n`);
  usage();
  process.exitCode = 2;
}
