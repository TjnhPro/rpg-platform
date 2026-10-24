import { createAssetCatalog, type AssetCatalog } from './asset-catalog.js';
import { readAssetDefinitionSnapshot } from './asset-snapshot.js';
import { createDocumentEnvelope, type DocumentEnvelope, type DocumentIdentity } from './document-envelope.js';
import { diagnoseDocument } from './document-diagnostics.js';
import { serializeDocument } from './document-codec.js';
import { getProjectSessionSnapshot, type ProjectSession } from './project-session.js';
import { resolveProjectLocator, type ProjectRootBinding } from './project-root-binding.js';

export interface AssetManagerProject { readonly id: symbol }
export interface AssetManagerProjectSnapshot {
  readonly id: symbol;
  readonly projectId: string;
  readonly state: 'active' | 'closed';
  readonly generation: number;
  readonly catalog: AssetCatalog;
}
interface RecordState {
  project: ProjectSession | null;
  root: ProjectRootBinding | null;
  readonly revision: number;
  snapshot: AssetManagerProjectSnapshot;
}
const contexts = new WeakMap<AssetManagerProject, RecordState>();
function recordFor(context: AssetManagerProject): RecordState {
  const record = contexts.get(context);
  if (!record) throw new TypeError('FOREIGN_ASSET_MANAGER');
  return record;
}
/** Internal collaboration only. Never exported from package root. */
export function requireAssetManagerProject(context: AssetManagerProject): {
  project: ProjectSession; root: ProjectRootBinding; snapshot: AssetManagerProjectSnapshot;
} {
  const record = recordFor(context);
  if (!record.project || !record.root) throw new TypeError('ASSET_MANAGER_CLOSED');
  const current = getProjectSessionSnapshot(record.project);
  if (current.state !== 'open') throw new TypeError('PROJECT_NOT_OPEN');
  if (current.currentRevision !== record.revision) throw new TypeError('STALE_PROJECT_CONTEXT');
  if (record.root.bindingId !== current.bindingId) throw new TypeError('ROOT_BINDING_MISMATCH');
  resolveProjectLocator(record.root, current.projectId, { type: 'project-relative', path: current.locator });
  return { project: record.project, root: record.root, snapshot: record.snapshot };
}
/** Empty or explicitly admitted canonical catalog; no load or saved evidence. */
export function createAssetManagerProject(project: ProjectSession, root: ProjectRootBinding,
  catalog?: AssetCatalog): AssetManagerProject {
  const current = getProjectSessionSnapshot(project);
  if (current.state !== 'open') throw new TypeError('PROJECT_NOT_OPEN');
  if (root.bindingId !== current.bindingId) throw new TypeError('ROOT_BINDING_MISMATCH');
  resolveProjectLocator(root, current.projectId, { type: 'project-relative', path: current.locator });
  if (catalog && catalog.projectId !== current.projectId) throw new TypeError('CATALOG_PROJECT_MISMATCH');
  const admitted = createAssetCatalog({ projectId: current.projectId, definitions: catalog?.definitions ?? [] });
  const context = Object.freeze({ id: Symbol('AssetManagerProject') });
  contexts.set(context, { project, root, revision: current.currentRevision,
    snapshot: Object.freeze({ id: context.id, projectId: current.projectId, state: 'active', generation: 1, catalog: admitted }) });
  return context;
}
export function getAssetManagerProjectSnapshot(context: AssetManagerProject): AssetManagerProjectSnapshot {
  const record = recordFor(context);
  if (record.project) requireAssetManagerProject(context);
  return record.snapshot;
}
/** Explicit candidate adoption, never a file write or Document acknowledgement. */
export function adoptAssetManagerCatalog(context: AssetManagerProject, catalog: AssetCatalog,
  expectedGeneration: number): AssetManagerProjectSnapshot {
  const { snapshot } = requireAssetManagerProject(context);
  if (snapshot.generation !== expectedGeneration) throw new TypeError('STALE_CATALOG_GENERATION');
  if (catalog.projectId !== snapshot.projectId) throw new TypeError('CATALOG_PROJECT_MISMATCH');
  if (snapshot.generation === Number.MAX_SAFE_INTEGER) throw new RangeError('CATALOG_GENERATION_EXHAUSTED');
  const admitted = createAssetCatalog({ projectId: snapshot.projectId, definitions: catalog.definitions });
  const next = Object.freeze({ ...snapshot, generation: snapshot.generation + 1, catalog: admitted });
  recordFor(context).snapshot = next;
  return next;
}
export function closeAssetManagerProject(context: AssetManagerProject): AssetManagerProjectSnapshot {
  const record = recordFor(context);
  if (!record.project) throw new TypeError('ASSET_MANAGER_CLOSED');
  record.project = null; record.root = null;
  record.snapshot = Object.freeze({ ...record.snapshot, state: 'closed' });
  return record.snapshot;
}
/** Project-local lookup key admission; unknown keys are handled by Phase2. */
export function admitAssetManagerIdentity(context: AssetManagerProject, identity: DocumentIdentity): void {
  const { snapshot } = requireAssetManagerProject(context);
  if (identity.projectId !== snapshot.projectId) throw new TypeError('DOCUMENT_PROJECT_MISMATCH');
  createDocumentEnvelope({ schemaVersion: 1, identity, documentKind: 'asset', contentSchemaVersion: 1, content: null });
}
/** Complete known-document reconstruction. No filesystem scan or loaded/saved claim. */
export function rebuildAssetManagerCatalog(context: AssetManagerProject, documents: readonly DocumentEnvelope[],
  expectedGeneration: number): AssetManagerProjectSnapshot {
  const { project, snapshot } = requireAssetManagerProject(context);
  const refs = getProjectSessionSnapshot(project).manifest.documents.filter(ref => ref.documentKind === 'asset');
  const captured = documents.map(document => createDocumentEnvelope(document));
  if (captured.length !== refs.length) throw new TypeError('ASSET_DOCUMENT_SET_MISMATCH');
  const seen = new Set<string>();
  for (const envelope of captured) {
    admitAssetManagerIdentity(context, envelope.identity);
    if (seen.has(envelope.identity.documentId)) throw new TypeError('DUPLICATE_ASSET_DOCUMENT');
    seen.add(envelope.identity.documentId);
    if (envelope.documentKind !== 'asset' || envelope.contentSchemaVersion !== 1
      || !refs.some(ref => ref.identity.documentId === envelope.identity.documentId && ref.contentSchemaVersion === 1))
      throw new TypeError('ASSET_DOCUMENT_BINDING_MISMATCH');
  }
  const ordered = refs.map(ref => captured.find(envelope => envelope.identity.documentId === ref.identity.documentId)!);
  const catalog = createAssetCatalog({ projectId: snapshot.projectId,
    definitions: ordered.map(envelope => readAssetDefinitionSnapshot(envelope.content)) });
  for (const envelope of ordered) {
    const validation = diagnoseDocument(serializeDocument(envelope), { owner: 'asset', documentKind: 'asset', contentSchemaVersion: 1, catalog });
    if (!validation.readEligibility.strict) throw new TypeError('ASSET_DOCUMENT_NOT_STRICT');
  }
  return adoptAssetManagerCatalog(context, catalog, expectedGeneration);
}
