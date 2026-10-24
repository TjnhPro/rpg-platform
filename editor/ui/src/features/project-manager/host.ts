import { createProjectRootBinding, type ProjectRootBinding, type DocumentReadResult,
  type DocumentCommitReceipt, type DocumentWriteRequest } from '@rpg-platform/editor';

export interface ProjectHostRoot { readonly projectId: string; readonly directory: string; readonly binding: ProjectRootBinding }
/** Only the explicit same-origin manual host can grant these capabilities.
 * Ordinary Vite/dev/static hosting reports unavailable; no memory-save fallback.
 */
export async function connectProjectHost(signal: AbortSignal): Promise<readonly ProjectHostRoot[]> {
  const response = await fetch('/__project-host/capability', { signal });
  if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) throw new Error('HOST_UNAVAILABLE');
  const data = await response.json() as { token: string; roots: { projectId: string; bindingId: string; directory: string }[] };
  if (typeof data.token !== 'string' || !Array.isArray(data.roots) || data.roots.length !== 2) throw new Error('HOST_UNAVAILABLE');
  return Object.freeze(data.roots.map((root) => {
    if (!['game-a', 'game-b'].includes(root.projectId) || typeof root.directory !== 'string') throw new Error('HOST_UNAVAILABLE');
    async function dispatch(operation: string, locator: string, request?: DocumentWriteRequest) {
      const result = await fetch('/__project-host/io', { method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Project-Capability': data.token },
        body: JSON.stringify({ ...request, operation, locator, projectId: root.projectId, bindingId: root.bindingId }) });
      if (!result.ok) throw new Error('HOST_IO_UNAVAILABLE');
      return result.json() as Promise<unknown>;
    }
    const binding = createProjectRootBinding({ projectId: root.projectId, bindingId: root.bindingId,
      readPort: { read: async (locator) => await dispatch('read', locator) as DocumentReadResult },
      writePort: { conflictProtection: 'create-only', publication: 'atomic-publish',
        commit: async (request) => await dispatch('commit', request.locator, request) as DocumentCommitReceipt } });
    return Object.freeze({ projectId: root.projectId, directory: root.directory, binding });
  }));
}
