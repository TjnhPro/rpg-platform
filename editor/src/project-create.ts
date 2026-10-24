import { createDocumentEnvelope, createDocumentIdentity, type DocumentIdentity } from './document-envelope.js';
import { createDocumentSession } from './document-session.js';
import type { ResourceLocator } from './asset-sources.js';
import { createProjectManifest, type ProjectMetadata, type ProjectResourceRoot } from './project-manifest.js';
import { requireProjectRoot, resolveProjectLocator, type ProjectRootBinding } from './project-root-binding.js';
import { createProjectSession, openProjectSession, type ProjectSession } from './project-session.js';

export interface CreateProjectOptions {
  readonly identity: DocumentIdentity;
  readonly metadata: ProjectMetadata;
  readonly resourceRoots?: readonly ProjectResourceRoot[];
  readonly root: ProjectRootBinding;
  readonly locator: ResourceLocator;
}
/** Memory only. Caller selects logical IDs, physical root and manifest locator.
 * No storage observation/evidence, directory creation or implicit initial Scene.
 */
export function createProject(options: CreateProjectOptions): ProjectSession {
  const identity = createDocumentIdentity(options.identity);
  requireProjectRoot(options.root, identity.projectId);
  resolveProjectLocator(options.root, identity.projectId, options.locator);
  const manifest = createProjectManifest({ schemaVersion: 1, projectId: identity.projectId,
    metadata: options.metadata, ...(options.resourceRoots === undefined ? {} : { resourceRoots: options.resourceRoots }) });
  const envelope = createDocumentEnvelope({ schemaVersion: 1, identity,
    documentKind: 'project', contentSchemaVersion: 1, content: manifest });
  const document = createDocumentSession(envelope, null);
  const session = createProjectSession(document, options.root, options.locator);
  openProjectSession(session);
  return session;
}
