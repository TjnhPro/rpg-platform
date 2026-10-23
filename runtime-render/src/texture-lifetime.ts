import { registerRenderTexture, type RenderTexture, type RenderTextureOptions,
  type RenderTextureSnapshot } from './render-texture.js';

/** Internal single-resource lifetime. Terminal handles drop backend callbacks. */
export function createTextureLifetime(
  sessionId: symbol, width: number, height: number, options: RenderTextureOptions,
  destroy: (() => void) | undefined, probe: (() => void) | undefined,
): { readonly handle: RenderTexture; readonly invalidate: () => void } {
  let snapshot: RenderTextureSnapshot = Object.freeze({ id: Symbol(), sessionId, stage: 'gpu-texture',
    state: 'usable', width, height, options, cleanup: 'owned' });
  const finish = (state: 'released' | 'invalidated'): RenderTextureSnapshot => {
    if (snapshot.state !== 'usable') return snapshot;
    const dispose = destroy;
    destroy = undefined;
    probe = undefined;
    snapshot = Object.freeze({ ...snapshot, state });
    try {
      dispose?.();
      snapshot = Object.freeze({ ...snapshot, cleanup: 'deleted' });
    } catch (error) {
      snapshot = Object.freeze({ ...snapshot, cleanup: 'delete-failed' });
      throw error;
    }
    return snapshot;
  };
  const read = (): RenderTextureSnapshot => { probe?.(); return snapshot; };
  const handle: RenderTexture = Object.freeze({ getSnapshot: read, release: () => {
    probe?.();
    return finish('released');
  } });
  registerRenderTexture(handle, sessionId, read);
  return Object.freeze({ handle, invalidate: () => { finish('invalidated'); } });
}
