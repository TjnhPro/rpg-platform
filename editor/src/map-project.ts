import { getProjectSessionSnapshot, type ProjectSession, type ProjectSessionSnapshot } from './project-session.js';
import { resolveProjectLocator, type ProjectRootBinding } from './project-root-binding.js';
import { getProjectDocument } from './project-document-tracking.js';
import type { DocumentIdentity } from './document-envelope.js';
import type { ProjectDocumentReference } from './project-manifest.js';

/** Same trusted root handoff contract as Phase14; lexical keys do not grant IO. */
export function mapProjectSnapshot(project: ProjectSession, root: ProjectRootBinding): ProjectSessionSnapshot {
  const current = getProjectSessionSnapshot(project);
  if (current.state !== 'open') throw new TypeError('PROJECT_NOT_OPEN');
  if (root.bindingId !== current.bindingId) throw new TypeError('ROOT_BINDING_MISMATCH');
  resolveProjectLocator(root, current.projectId, { type: 'project-relative', path: current.locator });
  return current;
}
export function mapTrackedScene(current: ProjectSessionSnapshot, identity: DocumentIdentity): ProjectDocumentReference {
  const ref = getProjectDocument(current.manifest, identity);
  if (!ref || ref.documentKind !== 'scene' || ref.contentSchemaVersion !== 1 || !ref.sceneId) throw new TypeError('MAP_SCENE_NOT_TRACKED');
  if (ref.identity.documentId === ref.sceneId) throw new TypeError('MAP_DOCUMENT_AND_SCENE_IDS_DISTINCT');
  return ref;
}
