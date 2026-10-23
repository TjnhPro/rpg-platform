import {
  createRenderVisualScene, addRenderVisualInstance, removeRenderVisualInstance,
  getRenderVisualInstanceSnapshot, setRenderVisualInstanceTransform,
  getRenderVisualInstanceTransform, bindRenderVisualInstanceResource,
  getRenderVisualInstanceResource, setRenderVisualInstanceVisible,
  getRenderVisualInstanceVisibility, getRenderVisualInstanceFailure,
  getRenderFrameInvalidationSnapshot, suspendRenderViewport, resumeRenderViewport,
  type RenderFrameSession, type RenderVisualInstanceTransformInput,
  type RenderVisualResourceBindingInput, type RenderVisualInstance,
  type RenderViewportMetrics, type RenderViewportSizeLimits,
} from '@rpg-platform/runtime-render';

/** Optional real-session walkthrough, never automatically executed or asserted.
 * Caller supplies an unoccupied active session, actual Phase 4 inputs, fresh host
 * metrics and optionally its usable Phase 7 binding / a real foreign-scope handle.
 * This helper explicitly exercises viewport suspension/resume on the borrowed
 * session; it does not submit frames or restore old metrics. */
export function observeVisualInstanceVisibility(
  session: RenderFrameSession,
  placement: RenderVisualInstanceTransformInput,
  hiddenUpdate: RenderVisualInstanceTransformInput,
  resource: RenderVisualResourceBindingInput | null,
  foreign: RenderVisualInstance | null,
  metrics: RenderViewportMetrics, limits: RenderViewportSizeLimits,
  write: (label: string, value: unknown) => void,
): void {
  const scene = createRenderVisualScene(session);
  try {
    const one = addRenderVisualInstance(scene, { visualInstanceId: 'one' });
    const two = addRenderVisualInstance(scene, { visualInstanceId: 'two' });
    if (resource !== null) bindRenderVisualInstanceResource(scene, one, resource);
    const historical = getRenderVisualInstanceVisibility(scene, one);
    write('Initial visibility', historical);
    write('Hide before first transform', setRenderVisualInstanceVisible(scene, one, false));
    write('First placement remains hidden', setRenderVisualInstanceTransform(scene, one, placement));
    write('Hidden update', setRenderVisualInstanceTransform(scene, one, hiddenUpdate));
    write('Repeated hide', setRenderVisualInstanceVisible(scene, one, false));
    write('Demand after repeated hide', getRenderFrameInvalidationSnapshot(session));
    write('Second unchanged', getRenderVisualInstanceVisibility(scene, two));
    write('Show uses latest node', setRenderVisualInstanceVisible(scene, one, true));
    write('Latest transform', getRenderVisualInstanceTransform(scene, one));
    write('Current resource', getRenderVisualInstanceResource(scene, one));
    write('Same registration', getRenderVisualInstanceSnapshot(scene, one));
    write('Historical visibility snapshot', historical);
    suspendRenderViewport(session);
    try {
      write('Suspended, explicit flag unchanged', getRenderVisualInstanceVisibility(scene, one));
      write('Hide while suspended', setRenderVisualInstanceVisible(scene, one, false));
      write('Show while suspended', setRenderVisualInstanceVisible(scene, one, true));
    } finally { resumeRenderViewport(session, metrics, limits); }
    write('Resumed effective visibility', getRenderVisualInstanceVisibility(scene, one));
    const attempt = (label: string, operation: () => unknown): void => {
      try { write(label, operation()); }
      catch (error) { write(label, getRenderVisualInstanceFailure(error) ?? error); }
    };
    if (foreign !== null) attempt('Foreign scope/session rejection',
      () => setRenderVisualInstanceVisible(scene, foreign, false));
    removeRenderVisualInstance(scene, one);
    attempt('Missing instance rejection', () => setRenderVisualInstanceVisible(scene, one, true));
    scene.dispose();
    attempt('Terminal scene rejection', () => getRenderVisualInstanceVisibility(scene, two));
    write('DRAW_NOT_IMPLEMENTED', 'No frame/pixel or resource reload evidence from this walkthrough');
  } finally { scene.dispose(); } // Own scene only; host keeps session/input resource.
}
