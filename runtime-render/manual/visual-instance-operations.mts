import {
  createRenderFrameSession, createRenderVisualScene, addRenderVisualInstance,
  getRenderVisualInstance, listRenderVisualInstances, removeRenderVisualInstance,
  getRenderVisualInstanceSnapshot, updateRenderVisualInstance, getRenderVisualInstanceFailure,
  type RenderHostBinding, type RenderVisualInstanceProperties, type RenderVisualInstanceSnapshot,
} from '@rpg-platform/runtime-render';

/** Optional finite real-host walkthrough. No assertions, fake resources or frame requests. */
export async function observeVisualInstanceOperations(
  first: RenderHostBinding, second: RenderHostBinding,
  write: (label: string, value: unknown) => void,
): Promise<void> {
  const a = await createRenderFrameSession(first);
  try {
    const b = await createRenderFrameSession(second);
    try {
      const sceneA = createRenderVisualScene(a), sceneB = createRenderVisualScene(b);
      const handle = addRenderVisualInstance(sceneA, { visualInstanceId: 'preview-one' });
      const before: RenderVisualInstanceSnapshot = getRenderVisualInstanceSnapshot(sceneA, handle);
      const correlation = { projectId: 'manual-project', sceneId: 'authored-scene', objectId: 'first-object' };
      const properties: RenderVisualInstanceProperties = { correlation };
      write('Initial state', before);
      write('Replace correlation', updateRenderVisualInstance(sceneA, handle, properties));
      write('Equal replacement / no-op snapshot', updateRenderVisualInstance(sceneA, handle, properties));
      correlation.objectId = 'caller-edited';
      write('Current detached state', getRenderVisualInstanceSnapshot(sceneA, handle));
      write('Historical snapshot', before);
      write('Original handle retained by lookup', getRenderVisualInstance(sceneA, 'preview-one'));
      write('Insertion order', listRenderVisualInstances(sceneA));
      try { updateRenderVisualInstance(sceneA, handle, { correlation: { ...correlation, objectId: '' } }); }
      catch (error) { write('Invalid replacement admission', getRenderVisualInstanceFailure(error) ?? error); }
      write('State after rejected candidate', getRenderVisualInstanceSnapshot(sceneA, handle));
      try { addRenderVisualInstance(sceneA, { visualInstanceId: 'preview-one' }); }
      catch (error) { write('Duplicate create admission', getRenderVisualInstanceFailure(error) ?? error); }
      try { updateRenderVisualInstance(sceneB, handle, { correlation: null }); }
      catch (error) { write('Foreign-scene update admission', getRenderVisualInstanceFailure(error) ?? error); }
      write('Remove exact handle', removeRenderVisualInstance(sceneA, handle));
      write('Repeat removal', removeRenderVisualInstance(sceneA, handle));
      const replacement = addRenderVisualInstance(sceneA, { visualInstanceId: 'preview-one' });
      try { updateRenderVisualInstance(sceneA, handle, { correlation: null }); }
      catch (error) { write('Stale update admission', getRenderVisualInstanceFailure(error) ?? error); }
      write('Replacement untouched', getRenderVisualInstanceSnapshot(sceneA, replacement));
      sceneB.dispose();
      try { addRenderVisualInstance(sceneB, { visualInstanceId: 'closed' }); }
      catch (error) { write('Disposed scene admission', getRenderVisualInstanceFailure(error) ?? error); }
      a.dispose();
      try { updateRenderVisualInstance(sceneA, replacement, { correlation: null }); }
      catch (error) { write('Ended session admission', getRenderVisualInstanceFailure(error) ?? error); }
      write('Retained data after terminal', before);
    } finally { b.dispose(); }
  } finally { a.dispose(); }
}
