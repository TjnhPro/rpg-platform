import { createDocumentIdentity, type DocumentIdentity } from './document-envelope.js';
import { createProjectManifest, readProjectManifest, type ProjectDocumentReference, type ProjectManifest } from './project-manifest.js';
import { captureProjectLocator } from './project-resource-roots.js';
import { projectData, projectFail, projectKey, projectRecord } from './project-validation.js';
import { diagnoseProjectManifest, type ProjectManifestDiagnosis } from './project-diagnostics.js';

export function captureProjectDocuments(input: unknown, projectId: string): readonly ProjectDocumentReference[] {
  if (!Array.isArray(input)) return projectFail('INVALID_DOCUMENTS', 'project.documents');
  const ids = new Set<string>();
  const paths = new Set<string>();
  return Object.freeze(input.map((item: unknown, index: number) => {
    const path = `project.documents[${index}]`;
    const value = projectRecord(item, ['identity', 'documentKind', 'contentSchemaVersion', 'locator', 'sceneId'], [], path);
    const identityInput = projectRecord(value.identity, ['projectId', 'documentId'], [], path + '.identity');
    const identity = createDocumentIdentity({
      projectId: projectKey(identityInput.projectId, path + '.identity.projectId'),
      documentId: projectKey(identityInput.documentId, path + '.identity.documentId') });
    if (identity.projectId !== projectId) return projectFail('DOCUMENT_PROJECT_MISMATCH', path + '.identity.projectId');
    if (ids.has(identity.documentId)) return projectFail('DUPLICATE_DOCUMENT_ID', path + '.identity.documentId');
    ids.add(identity.documentId);
    const documentKind = projectKey(value.documentKind, path + '.documentKind');
    const version = value.contentSchemaVersion;
    if (version !== null && (typeof version !== 'number' || !Number.isSafeInteger(version) || version < 1))
      return projectFail('INVALID_CONTENT_VERSION', path + '.contentSchemaVersion');
    const sceneId = documentKind === 'scene' ? projectKey(value.sceneId, path + '.sceneId') : null;
    if (documentKind !== 'scene' && value.sceneId !== null) return projectFail('INVALID_SCENE_BINDING', path + '.sceneId');
    const locator = captureProjectLocator(value.locator, path + '.locator');
    if (paths.has(locator.path)) return projectFail('DUPLICATE_DOCUMENT_LOCATOR', path + '.locator');
    paths.add(locator.path);
    return Object.freeze({ identity, documentKind, contentSchemaVersion: version as number | null, locator, sceneId });
  }));
}
function scoped(manifest: ProjectManifest, identity: DocumentIdentity): string {
  const value = projectRecord(projectData(identity), ['projectId', 'documentId'], [], 'identity');
  const projectId = projectKey(value.projectId, 'identity.projectId');
  const documentId = projectKey(value.documentId, 'identity.documentId');
  if (projectId !== manifest.projectId) return projectFail('DOCUMENT_PROJECT_MISMATCH', 'identity.projectId');
  return documentId;
}
export function listProjectDocuments(manifest: ProjectManifest): readonly ProjectDocumentReference[] {
  return readProjectManifest(manifest).documents;
}
export function getProjectDocument(manifest: ProjectManifest, identity: DocumentIdentity): ProjectDocumentReference | undefined {
  const current = readProjectManifest(manifest);
  const id = scoped(current, identity);
  return current.documents.find(item => item.identity.documentId === id);
}
/** Duplicate registration always rejects, including an identical record. */
export function trackProjectDocument(manifest: ProjectManifest, reference: ProjectDocumentReference): ProjectManifest {
  const current = readProjectManifest(manifest);
  return createProjectManifest({ ...current, documents: [...current.documents, reference] });
}
/** Replace in place without renaming; old reference/manifest remain unchanged. */
export function updateProjectDocument(manifest: ProjectManifest, identity: DocumentIdentity, reference: ProjectDocumentReference): ProjectManifest {
  const current = readProjectManifest(manifest);
  const id = scoped(current, identity);
  const replacement = captureProjectDocuments(projectData([reference]), current.projectId)[0]!;
  if (replacement.identity.documentId !== id) return projectFail('DOCUMENT_RENAME_FORBIDDEN', 'identity');
  if (!current.documents.some(item => item.identity.documentId === id)) return projectFail('DOCUMENT_NOT_TRACKED', 'identity');
  return createProjectManifest({ ...current, documents: current.documents.map(item => item.identity.documentId === id ? replacement : item) });
}
/** Unknown/active removal rejects; caller must explicitly clear selection first. */
export function removeProjectDocument(manifest: ProjectManifest, identity: DocumentIdentity): ProjectManifest {
  const current = readProjectManifest(manifest);
  const id = scoped(current, identity);
  if (!current.documents.some(item => item.identity.documentId === id)) return projectFail('DOCUMENT_NOT_TRACKED', 'identity');
  if (current.activeScene?.documentId === id) return projectFail('ACTIVE_DOCUMENT_REMOVAL', 'identity');
  return createProjectManifest({ ...current, documents: current.documents.filter(item => item.identity.documentId !== id) });
}
/** Declaration validity only, never physical file existence or target content. */
export function diagnoseProjectDocuments(manifest: unknown): ProjectManifestDiagnosis {
  return diagnoseProjectManifest(manifest);
}
