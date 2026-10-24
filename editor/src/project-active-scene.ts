import type { DocumentIdentity } from './document-envelope.js';
import { createProjectManifest, readProjectManifest, type ProjectManifest, type ProjectActiveScene, type ProjectDocumentReference } from './project-manifest.js';
import { getProjectDocument } from './project-document-tracking.js';
import { projectFail, projectKey, projectRecord } from './project-validation.js';

/** Internal cross-reference validation only; never opens the Scene content. */
export function captureProjectActiveScene(input: unknown, documents: readonly ProjectDocumentReference[]): ProjectActiveScene | null {
  if (input === null) return null;
  const value = projectRecord(input, ['documentId', 'sceneId'], [], 'project.activeScene');
  const documentId = projectKey(value.documentId, 'project.activeScene.documentId');
  const sceneId = projectKey(value.sceneId, 'project.activeScene.sceneId');
  const reference = documents.find(item => item.identity.documentId === documentId);
  if (reference === undefined) return projectFail('ACTIVE_SCENE_NOT_TRACKED', 'project.activeScene.documentId');
  if (reference.documentKind !== 'scene' || reference.contentSchemaVersion !== 1)
    return projectFail('ACTIVE_SCENE_KIND_MISMATCH', 'project.activeScene.documentId');
  if (reference.sceneId !== sceneId) return projectFail('ACTIVE_SCENE_ID_MISMATCH', 'project.activeScene.sceneId');
  return Object.freeze({ documentId, sceneId });
}
export function setProjectActiveScene(manifest: ProjectManifest, identity: DocumentIdentity, sceneId: string): ProjectManifest {
  const current = readProjectManifest(manifest);
  const reference = getProjectDocument(current, identity); // explicit project scope required
  if (reference === undefined) return projectFail('ACTIVE_SCENE_NOT_TRACKED', 'identity');
  return createProjectManifest({ ...current, activeScene: { documentId: reference.identity.documentId, sceneId } });
}
export function clearProjectActiveScene(manifest: ProjectManifest): ProjectManifest {
  const current = readProjectManifest(manifest);
  return current.activeScene === null ? current : createProjectManifest({ ...current, activeScene: null });
}
export function getProjectActiveScene(manifest: ProjectManifest): ProjectActiveScene | null {
  return readProjectManifest(manifest).activeScene;
}
