import {
  createRenderFrameSession, createRenderVisualScene, getRenderTextureFailure,
  type RenderHostBinding, type RenderVisualSceneSnapshot,
} from '@rpg-platform/runtime-render';

/**
 * Optional finite manual consumer. Supply two real browser canvas bindings and
 * an inspection sink. Owns acquired sessions, borrows host targets, draws/loads
 * nothing. Not run on import, not an assertion suite or a fake graphics backend.
 */
export async function observeVisualSceneLifecycle(
  first: RenderHostBinding, second: RenderHostBinding,
  write: (label: string, value: RenderVisualSceneSnapshot | object) => void,
): Promise<void> {
  const a = await createRenderFrameSession(first);
  try {
    const b = await createRenderFrameSession(second);
    try {
      const sceneA = createRenderVisualScene(a), sceneB = createRenderVisualScene(b);
      const initialA = sceneA.getSnapshot();
      write('A initial', initialA);
      write('B initial', sceneB.getSnapshot());
      write('A clear (empty)', sceneA.clear());
      try { createRenderVisualScene(a); }
      catch (error) { write('A second active admission', { error }); }
      write('A dispose', sceneA.dispose());
      write('A repeat dispose', sceneA.dispose());
      write('A historical snapshot', initialA);
      try { sceneA.clear(); }
      catch (error) { write('A terminal clear admission', { error }); }
      const replacement = createRenderVisualScene(a);
      write('A fresh identity on same live session', replacement.getSnapshot());
      a.dispose();
      write('A cascade terminal', replacement.getSnapshot());
      write('A repeated scene dispose preserves cause', replacement.dispose());
      try { createRenderVisualScene(a); }
      catch (error) { write('A ended-session admission', { failure: getRenderTextureFailure(error) ?? null }); }
      write('B independent clear after A session ended', sceneB.clear());
      b.dispose();
      write('B cascade terminal', sceneB.getSnapshot());
    } finally { b.dispose(); }
  } finally { a.dispose(); }
}
