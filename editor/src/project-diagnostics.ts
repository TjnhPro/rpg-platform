import { readProjectManifest, type ProjectManifest } from './project-manifest.js';
import { ProjectValidationError } from './project-validation.js';

export interface ProjectDiagnostic { readonly code: string; readonly path: string }
export type ProjectManifestDiagnosis =
  | { readonly status: 'valid'; readonly manifest: ProjectManifest; readonly diagnostics: readonly ProjectDiagnostic[]; readonly fileExistence: 'NOT_CHECKED' }
  | { readonly status: 'invalid'; readonly manifest: null; readonly diagnostics: readonly ProjectDiagnostic[]; readonly fileExistence: 'NOT_CHECKED' };
/** No repair/projection over unknown content, file lookup or migration. */
export function diagnoseProjectManifest(input: unknown): ProjectManifestDiagnosis {
  try {
    return Object.freeze({ status: 'valid', manifest: readProjectManifest(input),
      diagnostics: Object.freeze([]), fileExistence: 'NOT_CHECKED' });
  } catch (error) {
    if (!(error instanceof ProjectValidationError)) throw error;
    return Object.freeze({ status: 'invalid', manifest: null,
      diagnostics: Object.freeze([Object.freeze({ code: error.code, path: error.path })]), fileExistence: 'NOT_CHECKED' });
  }
}
