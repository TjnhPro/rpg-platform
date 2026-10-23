import {
  createRenderVisualScene, addRenderVisualInstance, setRenderVisualInstanceTransform,
  getRenderVisualInstanceTransform, getRenderVisualInstanceSnapshot,
  bindRenderVisualInstanceResource, getRenderVisualInstanceResource,
  type RenderFrameSession, type RenderVisualInstanceTransformInput,
  type RenderVisualResourceBindingInput,
} from '@rpg-platform/runtime-render';

/** Optional finite real-session walkthrough. Supply actual presentation inputs and,
 * optionally, a ready Phase 7 lease belonging to this session. No automatic run,
 * assertions, fake session, frame submission or visual-success claim. */
export function observeVisualInstanceTransforms(
  session: RenderFrameSession,
  first: RenderVisualInstanceTransformInput,
  second: RenderVisualInstanceTransformInput,
  updatedFirst: RenderVisualInstanceTransformInput,
  resource: RenderVisualResourceBindingInput | null,
  write: (label: string, value: unknown) => void,
): void {
  const scene = createRenderVisualScene(session);
  try {
    const one = addRenderVisualInstance(scene, { visualInstanceId: 'one' });
    const two = addRenderVisualInstance(scene, { visualInstanceId: 'two' });
    if (resource !== null) bindRenderVisualInstanceResource(scene, one, resource);
    const history = setRenderVisualInstanceTransform(scene, one, first);
    write('Second instance', setRenderVisualInstanceTransform(scene, two, second));
    write('First update', setRenderVisualInstanceTransform(scene, one, updatedFirst));
    write('Historical first snapshot', history);
    write('Caller authored inputs', { first, second, updatedFirst });
    write('Unchanged second', getRenderVisualInstanceTransform(scene, two));
    write('First identity/correlation', getRenderVisualInstanceSnapshot(scene, one));
    write('Resource after transform', getRenderVisualInstanceResource(scene, one));
    const attempt = (label: string, input: RenderVisualInstanceTransformInput): void => {
      try { write(label, setRenderVisualInstanceTransform(scene, one, input)); }
      catch (error) { write(label, error); }
      write('Last accepted transform', getRenderVisualInstanceTransform(scene, one));
    };
    attempt('Nonfinite rejection', { ...updatedFirst,
      local: { ...updatedFirst.local, rotationRadians: Number.NaN } });
    attempt('Unit rejection', { ...updatedFirst,
      anchor: { ...updatedFirst.anchor, unit: `${updatedFirst.placement.plane.unit}:incompatible` } });
    attempt('Unsupported mapping rejection', { ...updatedFirst,
      projection: { ...updatedFirst.projection,
        destination: { ...updatedFirst.projection.destination, coordinateSpaceId: 'screen-pixels' } } });
    const unsupported3D = { ...updatedFirst,
      local: { ...updatedFirst.local, translation: { ...updatedFirst.local.translation, z: 1 } } };
    attempt('Unsupported 3D rejection', unsupported3D);
    write('Unset first transform', setRenderVisualInstanceTransform(scene, one, null));
    write('Resource after unset', getRenderVisualInstanceResource(scene, one));
  } finally { scene.dispose(); } // Borrowed session/input resource remain host-owned.
}
