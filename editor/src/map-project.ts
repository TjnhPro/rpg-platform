import { getProjectSessionSnapshot, type ProjectSession, type ProjectSessionSnapshot } from './project-session.js';
import { resolveProjectLocator, type ProjectRootBinding } from './project-root-binding.js';

/** Same trusted root handoff contract as Phase14; lexical keys do not grant IO. */
export function mapProjectSnapshot(project: ProjectSession, root: ProjectRootBinding): ProjectSessionSnapshot {
  const current = getProjectSessionSnapshot(project);
  if (current.state !== 'open') throw new TypeError('PROJECT_NOT_OPEN');
  if (root.bindingId !== current.bindingId) throw new TypeError('ROOT_BINDING_MISMATCH');
  resolveProjectLocator(root, current.projectId, { type: 'project-relative', path: current.locator });
  return current;
}
