import {
  createRenderFrameSession, createRenderVisualScene,
  addRenderVisualInstance, getRenderVisualInstance,
  listRenderVisualInstances, removeRenderVisualInstance,
  type RenderHostBinding, type RenderVisualCorrelation,
  type RenderVisualInstance, type RenderVisualInstanceInput,
} from '@rpg-platform/runtime-render';

/** Optional finite public-root consumer: two real hosts, no draws/assertions/fakes. */
export async function observeVisualInstanceMembership(
  first: RenderHostBinding, second: RenderHostBinding,
  write: (label: string, value: unknown) => void,
): Promise<void> {
  const a = await createRenderFrameSession(first);
  try {
    const b = await createRenderFrameSession(second);
    try {
      const sceneA = createRenderVisualScene(a), sceneB = createRenderVisualScene(b);
      const correlation = {
        projectId: 'manual-project', sceneId: 'authored-scene', objectId: 'authored-object',
      } satisfies RenderVisualCorrelation;
      const input: RenderVisualInstanceInput = { visualInstanceId: 'preview-one', correlation };
      const firstA = addRenderVisualInstance(sceneA, input);
      const secondA = addRenderVisualInstance(sceneA, { visualInstanceId: 'preview-two', correlation });
      const firstB = addRenderVisualInstance(sceneB, input);
      const history: readonly RenderVisualInstance[] = listRenderVisualInstances(sceneA);
      write('A two independent registrations', history);
      write('B same local ID / correlation, separate scene', firstB);
      correlation.objectId = 'caller-edited-object';
      write('Captured correlation after caller edit', firstA.correlation);
      write('A current lookup', getRenderVisualInstance(sceneA, firstA.visualInstanceId));
      write('A missing ID', getRenderVisualInstance(sceneA, 'missing'));
      try { addRenderVisualInstance(sceneA, input); }
      catch (error) { write('Duplicate live ID rejected', error); }
      try { removeRenderVisualInstance(sceneB, firstA); }
      catch (error) { write('Foreign-scene handle rejected', error); }
      write('Remove exact A registration', removeRenderVisualInstance(sceneA, firstA));
      const replacement = addRenderVisualInstance(sceneA, input);
      write('Replacement with reused ID / fresh handle and ordinal', replacement);
      write('Stale A removal', removeRenderVisualInstance(sceneA, firstA));
      write('Historical list remains detached', history);
      write('A current insertion order', listRenderVisualInstances(sceneA));
      sceneA.clear();
      write('A cleared membership', listRenderVisualInstances(sceneA));
      write('A cleared handle removal', removeRenderVisualInstance(sceneA, secondA));
      write('A re-add after clear / ordinal continues', addRenderVisualInstance(sceneA, input));
      a.dispose();
      write('A scene terminal snapshot', sceneA.getSnapshot());
      write('A retained historical handle metadata', replacement);
      try { listRenderVisualInstances(sceneA); }
      catch (error) { write('A terminal membership rejected', error); }
      write('B survives A terminal', listRenderVisualInstances(sceneB));
      sceneB.dispose();
      write('B explicit scene disposal', sceneB.getSnapshot());
    } finally { b.dispose(); }
  } finally { a.dispose(); }
}
