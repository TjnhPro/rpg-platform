import type { DocumentReadPort } from './document-load.js';
import type { DocumentWritePort } from './document-save.js';
import type { ResourceLocator } from './asset-sources.js';
import { captureProjectLocator } from './project-resource-roots.js';
import { projectData, projectFail, projectKey } from './project-validation.js';

/** Trusted host capability. Ports accept only canonical project-relative strings.
 * Host attests physical authorization, containment and permissions per dispatch;
 * lexical capture alone establishes none of these. Borrowed ports are never closed.
 */
export interface ProjectRootBinding {
  readonly projectId: string;
  readonly bindingId: string;
  readonly readPort: DocumentReadPort | null;
  readonly writePort: DocumentWritePort | null;
}
const issued = new WeakSet<ProjectRootBinding>();
export function createProjectRootBinding(input: ProjectRootBinding): ProjectRootBinding {
  const projectId = projectKey(input.projectId, 'binding.projectId');
  const bindingId = projectKey(input.bindingId, 'binding.bindingId');
  if (input.readPort !== null && (typeof input.readPort !== 'object' || typeof input.readPort?.read !== 'function'))
    return projectFail('INVALID_READ_PORT', 'binding.readPort');
  if (input.writePort !== null && (typeof input.writePort !== 'object' || typeof input.writePort?.commit !== 'function'))
    return projectFail('INVALID_WRITE_PORT', 'binding.writePort');
  const binding = Object.freeze({ projectId, bindingId, readPort: input.readPort, writePort: input.writePort });
  issued.add(binding);
  return binding;
}
/** Check original capability identity, not a copied object/bindingId equality. */
export function requireProjectRoot(binding: ProjectRootBinding | null, projectId: string): ProjectRootBinding {
  projectKey(projectId, 'projectId');
  if (binding === null || !issued.has(binding)) return projectFail('ROOT_UNAVAILABLE', 'binding');
  if (binding.projectId !== projectId) return projectFail('PROJECT_ROOT_MISMATCH', 'binding.projectId');
  return binding;
}
/** Resolve lexical dispatch key only, NOT an absolute filesystem path or access grant. */
export function resolveProjectLocator(binding: ProjectRootBinding | null, projectId: string, locator: ResourceLocator): string {
  requireProjectRoot(binding, projectId);
  return captureProjectLocator(projectData(locator), 'locator').path;
}
