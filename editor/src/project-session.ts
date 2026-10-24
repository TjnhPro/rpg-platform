import type { DocumentSession, DocumentSessionSnapshot } from './document-session.js';
import { replaceDocumentContent } from './document-envelope.js';
import type { ResourceLocator } from './asset-sources.js';
import { readProjectManifest, type ProjectManifest } from './project-manifest.js';
import { requireProjectRoot, resolveProjectLocator, type ProjectRootBinding } from './project-root-binding.js';
import { projectFail } from './project-validation.js';

/** Session identity is an in-memory capability, never a manifest field. */
export interface ProjectSession { readonly sessionId: symbol }
export interface ProjectSessionSnapshot {
  readonly sessionId: symbol;
  readonly projectId: string;
  readonly documentId: string;
  readonly bindingId: string;
  readonly locator: string;
  readonly state: DocumentSessionSnapshot['state'];
  readonly manifest: ProjectManifest;
  readonly currentRevision: number;
  readonly savedRevision: number | null;
  readonly isDirty: boolean;
}
interface SessionRecord {
  document: DocumentSession | null;
  root: ProjectRootBinding | null;
  readonly projectId: string;
  readonly documentId: string;
  readonly bindingId: string;
  readonly locator: string;
  closed: DocumentSessionSnapshot | null;
}
const records = new WeakMap<ProjectSession, SessionRecord>();
const adopted = new WeakSet<DocumentSession>();

function validate(record: SessionRecord, snapshot: DocumentSessionSnapshot): ProjectManifest {
  const envelope = snapshot.envelope;
  if (envelope.identity.projectId !== record.projectId || envelope.identity.documentId !== record.documentId
    || envelope.documentKind !== 'project' || envelope.schemaVersion !== 1 || envelope.contentSchemaVersion !== 1)
    return projectFail('PROJECT_DOCUMENT_MISMATCH', 'session.document');
  const manifest = readProjectManifest(envelope.content);
  if (manifest.projectId !== record.projectId) return projectFail('PROJECT_DOCUMENT_MISMATCH', 'project.projectId');
  if (manifest.documents.some(item => item.identity.documentId === record.documentId || item.locator.path === record.locator))
    return projectFail('MANIFEST_SELF_REFERENCE', 'project.documents');
  return manifest;
}
function recordFor(session: ProjectSession): SessionRecord {
  const record = records.get(session);
  if (record === undefined) return projectFail('FOREIGN_PROJECT_SESSION', 'session');
  return record;
}
/** Internal save/open collaboration; not exported from package root. */
export function requireOpenProjectSession(session: ProjectSession): { document: DocumentSession; root: ProjectRootBinding; locator: string } {
  const record = recordFor(session);
  if (record.document === null || record.root === null) return projectFail('PROJECT_SESSION_CLOSED', 'session');
  const snapshot = record.document.getSnapshot();
  validate(record, snapshot);
  if (snapshot.state !== 'open') return projectFail('PROJECT_SESSION_NOT_OPEN', 'session');
  requireProjectRoot(record.root, record.projectId);
  return { document: record.document, root: record.root, locator: record.locator };
}
/** Adopt exactly one canonical document, once. No load, evidence creation or IO. */
export function createProjectSession(document: DocumentSession, root: ProjectRootBinding, locator: ResourceLocator): ProjectSession {
  const snapshot = document.getSnapshot();
  if (snapshot.state === 'closed') return projectFail('PROJECT_SESSION_CLOSED', 'document');
  if (adopted.has(document)) return projectFail('DOCUMENT_ALREADY_BOUND', 'document');
  const projectId = snapshot.envelope.identity.projectId;
  const binding = requireProjectRoot(root, projectId);
  const key = resolveProjectLocator(binding, projectId, locator);
  const record: SessionRecord = { document, root: binding, projectId,
    documentId: snapshot.envelope.identity.documentId, bindingId: binding.bindingId, locator: key, closed: null };
  validate(record, snapshot);
  const session = Object.freeze({ sessionId: Symbol('ProjectSession') });
  records.set(session, record);
  adopted.add(document);
  return session;
}
export function getProjectSessionSnapshot(session: ProjectSession): ProjectSessionSnapshot {
  const record = recordFor(session);
  const snapshot = record.closed ?? record.document!.getSnapshot();
  const manifest = validate(record, snapshot);
  return Object.freeze({ sessionId: session.sessionId, projectId: record.projectId,
    documentId: record.documentId, bindingId: record.bindingId, locator: record.locator,
    state: snapshot.state, manifest, currentRevision: snapshot.currentRevision,
    savedRevision: snapshot.savedRevision, isDirty: snapshot.isDirty });
}
export function openProjectSession(session: ProjectSession): ProjectSessionSnapshot {
  const record = recordFor(session);
  if (record.document === null) return projectFail('PROJECT_SESSION_CLOSED', 'session');
  validate(record, record.document.getSnapshot());
  record.document.open();
  return getProjectSessionSnapshot(session);
}
/** Explicit optimistic generation guard for caller-held candidates. No history engine. */
export function replaceProjectManifest(session: ProjectSession, manifest: ProjectManifest, expectedRevision: number): ProjectSessionSnapshot {
  const { document } = requireOpenProjectSession(session);
  const record = recordFor(session);
  if (document.getSnapshot().currentRevision !== expectedRevision) return projectFail('STALE_PROJECT_REVISION', 'revision');
  const candidate = readProjectManifest(manifest);
  const snapshot = document.getSnapshot();
  validate(record, { ...snapshot, envelope: replaceDocumentContent(snapshot.envelope, candidate) });
  document.replaceContent(candidate);
  return getProjectSessionSnapshot(session);
}
/** Explicit discard only. Borrowed ports and unrelated documents/resources stay owned by host. */
export function closeProjectSession(session: ProjectSession, disposition: 'discard'): ProjectSessionSnapshot {
  const { document } = requireOpenProjectSession(session);
  const record = recordFor(session);
  record.closed = document.close(disposition);
  record.document = null;
  record.root = null;
  return getProjectSessionSnapshot(session);
}
