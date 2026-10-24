import { saveDocument, type DocumentSaveResult, type DocumentWritePrecondition } from './document-save.js';
import { projectDocumentContext } from './project-open.js';
import { requireOpenProjectSession, type ProjectSession } from './project-session.js';
import { ProjectValidationError } from './project-validation.js';

export type ProjectSaveResult = DocumentSaveResult
  | { readonly status: 'project-blocked'; readonly reason: string };
/** Save only this manifest through its originally bound root and DocumentSession.
 * Caller supplies a genuine storage precondition, never a session revision/hash.
 * Host unsupported guarantees remain Document blocked results; no overwrite fallback.
 */
export async function saveProject(session: ProjectSession, expected: DocumentWritePrecondition): Promise<ProjectSaveResult> {
  let scoped;
  try { scoped = requireOpenProjectSession(session); }
  catch (error) {
    if (!(error instanceof ProjectValidationError)) throw error;
    return Object.freeze({ status: 'project-blocked', reason: error.code });
  }
  if (scoped.root.writePort === null) return Object.freeze({ status: 'project-blocked', reason: 'WRITE_UNAVAILABLE' });
  return saveDocument(scoped.document, scoped.root.writePort, scoped.locator, expected, projectDocumentContext);
}
