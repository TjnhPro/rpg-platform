import type { DocumentIdentity } from './document-envelope.js';
import type { ResourceLocator } from './asset-sources.js';
import { projectData, projectFail, projectKey, projectRecord } from './project-validation.js';

export interface ProjectMetadata {
  readonly name: string;
  readonly description?: string;
}
export interface ProjectResourceRoot {
  readonly rootId: string;
  readonly locator: ResourceLocator;
}
export interface ProjectDocumentReference {
  readonly identity: DocumentIdentity;
  readonly documentKind: string;
  readonly contentSchemaVersion: number | null;
  readonly locator: ResourceLocator;
  readonly sceneId: string | null;
}
export interface ProjectActiveScene {
  readonly documentId: string;
  readonly sceneId: string;
}
export interface ProjectManifest {
  readonly schemaVersion: 1;
  readonly projectId: string;
  readonly metadata: ProjectMetadata;
  readonly resourceRoots: readonly ProjectResourceRoot[];
  readonly documents: readonly ProjectDocumentReference[];
  readonly activeScene: ProjectActiveScene | null;
}
export interface ProjectManifestInput {
  readonly schemaVersion: 1;
  readonly projectId: string;
  readonly metadata: ProjectMetadata;
  readonly resourceRoots?: readonly ProjectResourceRoot[];
  readonly documents?: readonly ProjectDocumentReference[];
  readonly activeScene?: ProjectActiveScene | null;
}

/** Pure authoring capture. Defaults only omitted collections/selection; no IO. */
export function createProjectManifest(input: ProjectManifestInput): ProjectManifest {
  const value = projectRecord(projectData(input), ['schemaVersion', 'projectId', 'metadata'],
    ['resourceRoots', 'documents', 'activeScene'], 'project');
  if (value.schemaVersion !== 1) return projectFail('UNSUPPORTED_PROJECT_SCHEMA', 'project.schemaVersion');
  const projectId = projectKey(value.projectId, 'project.projectId');
  const metadata = projectRecord(value.metadata, ['name'], ['description'], 'project.metadata');
  if (typeof metadata.name !== 'string' || metadata.name.trim().length === 0 || metadata.name.trim() !== metadata.name)
    return projectFail('INVALID_NAME', 'project.metadata.name');
  if (Object.hasOwn(metadata, 'description') && typeof metadata.description !== 'string')
    return projectFail('INVALID_DESCRIPTION', 'project.metadata.description');
  const roots = value.resourceRoots ?? [];
  const documents = value.documents ?? [];
  const activeScene = value.activeScene ?? null;
  if (!Array.isArray(roots) || roots.length !== 0) return projectFail('UNSUPPORTED_RESOURCE_ROOTS', 'project.resourceRoots');
  if (!Array.isArray(documents) || documents.length !== 0) return projectFail('UNSUPPORTED_DOCUMENTS', 'project.documents');
  if (activeScene !== null) return projectFail('UNSUPPORTED_ACTIVE_SCENE', 'project.activeScene');
  // Explicit null is not an omitted array.
  if (value.resourceRoots === null || value.documents === null) return projectFail('INVALID_COLLECTION', 'project');
  return Object.freeze({ schemaVersion: 1, projectId,
    metadata: Object.freeze({ name: metadata.name,
      ...(Object.hasOwn(metadata, 'description') ? { description: metadata.description as string } : {}) }),
    resourceRoots: Object.freeze([]), documents: Object.freeze([]), activeScene: null });
}

/** Strict stored-content reader: unlike authoring input, all fields are required. */
export function readProjectManifest(input: unknown): ProjectManifest {
  const value = projectRecord(projectData(input), ['schemaVersion', 'projectId', 'metadata',
    'resourceRoots', 'documents', 'activeScene'], [], 'project');
  return createProjectManifest(value as unknown as ProjectManifestInput);
}
