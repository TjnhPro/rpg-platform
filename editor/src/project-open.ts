import { loadDocument, type DocumentLoadResult, type DocumentStorageObservation } from './document-load.js';
import type { DocumentValidationContext, DocumentValidationResult } from './document-diagnostics.js';
import type { ResourceLocator } from './asset-sources.js';
import { requireProjectRoot, resolveProjectLocator, type ProjectRootBinding } from './project-root-binding.js';
import { createProjectSession, type ProjectSession } from './project-session.js';
import { projectKey, ProjectValidationError } from './project-validation.js';

/** Single frozen binding reused by Project Open and Save; never text fallback. */
export const projectDocumentContext: DocumentValidationContext = Object.freeze({
  owner: 'project', documentKind: 'project', contentSchemaVersion: 1 });
export interface OpenProjectOptions {
  readonly root: ProjectRootBinding;
  readonly locator: ResourceLocator;
  readonly expectedProjectId?: string;
}
export type ProjectOpenResult = Exclude<DocumentLoadResult, { readonly status: 'loaded' }>
  | { readonly status: 'opened'; readonly session: ProjectSession;
      readonly observation: DocumentStorageObservation; readonly validation: DocumentValidationResult }
  | { readonly status: 'rejected'; readonly reason: 'root-mismatch' | 'read-unavailable' | 'project-mismatch'
      | 'unsupported-project-format' | 'invalid-project-binding';
      readonly validation?: DocumentValidationResult; readonly text?: string };

/** One root-scoped read via Document owner. No existing-session mutation or writes. */
export async function openProject(options: OpenProjectOptions): Promise<ProjectOpenResult> {
  const root = requireProjectRoot(options.root, options.root.projectId);
  const expectedProjectId = options.expectedProjectId === undefined ? root.projectId
    : projectKey(options.expectedProjectId, 'expectedProjectId');
  if (expectedProjectId !== root.projectId) return Object.freeze({ status: 'rejected', reason: 'root-mismatch' });
  const locator = resolveProjectLocator(root, expectedProjectId, options.locator);
  if (root.readPort === null) return Object.freeze({ status: 'rejected', reason: 'read-unavailable' });
  const loaded = await loadDocument(root.readPort, locator, projectDocumentContext);
  if (loaded.status !== 'loaded') {
    if (loaded.status === 'validation-diagnostics') {
      const envelope = loaded.validation.document;
      const reason = envelope?.identity.projectId !== expectedProjectId
        || loaded.validation.diagnostics.some(item => item.code === 'DOCUMENT_PROJECT_MISMATCH') ? 'project-mismatch'
        : envelope.documentKind !== 'project' || envelope.contentSchemaVersion !== 1
          || loaded.validation.diagnostics.some(item => item.details.projectCode === 'UNSUPPORTED_PROJECT_SCHEMA')
          ? 'unsupported-project-format' : null;
      if (reason !== null) return Object.freeze({ status: 'rejected', reason, validation: loaded.validation, text: loaded.text });
    }
    return loaded;
  }
  if (loaded.session.getSnapshot().envelope.identity.projectId !== expectedProjectId) {
    loaded.session.close('discard');
    return Object.freeze({ status: 'rejected', reason: 'project-mismatch', validation: loaded.validation, text: loaded.text });
  }
  try {
    const session = createProjectSession(loaded.session, root, { type: 'project-relative', path: locator });
    return Object.freeze({ status: 'opened', session, observation: loaded.observation, validation: loaded.validation });
  } catch (error) {
    loaded.session.close('discard');
    if (!(error instanceof ProjectValidationError)) throw error;
    return Object.freeze({ status: 'rejected', reason: 'invalid-project-binding', validation: loaded.validation, text: loaded.text });
  }
}
