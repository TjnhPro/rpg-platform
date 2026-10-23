import {
  createRenderVisualScene, addRenderVisualInstance, addRenderVisualLayer,
  setRenderVisualInstanceTransform, getRenderVisualInstanceTransform,
  setRenderVisualInstanceOrder, setRenderVisualLayerOrderingPolicy, getRenderVisualLayerOrderingPolicy,
  setRenderVisualInstanceDepthKey, getRenderVisualInstanceDepthKey, listRenderVisualDrawCandidates,
  getRenderVisualDepthFailure, getRenderVisualLayerFailure, getRenderVisualInstanceFailure,
  getRenderVisualInstance, bindRenderVisualInstanceResource, getRenderVisualInstanceResource,
  type RenderFrameSession, type RenderVisualResourceBindingInput, type ProjectionPlane2D,
  type RenderVisualInstanceTransformInput, type RenderVisualLayerOrderingPolicy,
} from '@rpg-platform/runtime-render';

/** Optional real graphics-session walkthrough; compiled only, never auto-invoked.
 * No assertions, simulated sessions/resources, frame submission or pixel claim. */
export function observeVisualDepth(session: RenderFrameSession, resource: RenderVisualResourceBindingInput | null,
  write: (label: string, value: unknown) => void): void {
  const scene = createRenderVisualScene(session);
  const down: ProjectionPlane2D = { projectId: 'depth-example', coordinateSpaceId: 'ground',
    unit: 'scene-unit', axes: { x: 'right', y: 'down' } };
  const placement = (plane: ProjectionPlane2D, y: number): RenderVisualInstanceTransformInput => ({
    placement: { plane, point: { x: 0, y } },
    local: { translation: { x: 0, y: 0 }, rotationRadians: 0, scale: { x: 1, y: 1 } },
    anchor: { unit: plane.unit, anchor: { x: 0, y: 0 }, pivot: { x: 0, y: 0 }, localOffset: { x: 0, y: 0 } },
    orientation: { axes: plane.axes, zeroAxis: 'positive-x', positiveRotation: 'toward-positive-y', angleRadians: 0 },
    projection: { kind: 'orthographic-plane', source: plane,
      destination: { projectId: plane.projectId, coordinateSpaceId: 'render-clip-2d', unit: 'clip-unit', axes: { x: 'right', y: 'up' } },
      sourceOrigin: { x: 0, y: 0 }, destinationOrigin: { x: 0, y: 0 }, destinationUnitsPerSourceUnit: { x: 0.01, y: 0.01 } },
  });
  const attempt = (label: string, operation: () => unknown): void => {
    try { write(label, operation()); }
    catch (error) { write(label, getRenderVisualDepthFailure(error) ?? getRenderVisualLayerFailure(error)
      ?? getRenderVisualInstanceFailure(error) ?? error); }
  };
  try {
    addRenderVisualLayer(scene, { layerKey: 'actors', priority: 10 });
    addRenderVisualLayer(scene, { layerKey: 'overlay', priority: 100 });
    const a = addRenderVisualInstance(scene, { visualInstanceId: 'a' });
    const b = addRenderVisualInstance(scene, { visualInstanceId: 'b' });
    const c = addRenderVisualInstance(scene, { visualInstanceId: 'c' });
    for (const [index, instance] of [a, b, c].entries()) {
      setRenderVisualInstanceTransform(scene, instance, placement(down, (index + 1) * 10));
      setRenderVisualInstanceOrder(scene, instance, { layerKey: 'actors', order: 0 });
    }
    if (resource !== null) bindRenderVisualInstanceResource(scene, a, resource);
    const beforeResource = getRenderVisualInstanceResource(scene, a);
    const ground: RenderVisualLayerOrderingPolicy = { kind: 'ground-y', plane: down, front: 'down' };
    setRenderVisualLayerOrderingPolicy(scene, 'actors', ground);
    const candidates = (label: string): void => write(label, listRenderVisualDrawCandidates(scene).map(value => value.instance.visualInstanceId));
    candidates('Down-axis: a,b,c');
    setRenderVisualInstanceTransform(scene, a, placement(down, 40));
    candidates('Move a to Y40: b,c,a');
    setRenderVisualInstanceTransform(scene, b, placement(down, 40));
    setRenderVisualInstanceTransform(scene, c, placement(down, 40));
    candidates('Equal Y: a,b,c by creation ordinal');
    candidates('Repeated observation: same order');
    setRenderVisualInstanceOrder(scene, c, { layerKey: 'actors', order: -5 });
    candidates('Equal Y: c,a,b by explicit order then ordinal');
    const overlay = addRenderVisualInstance(scene, { visualInstanceId: 'overlay', layerKey: 'overlay' });
    setRenderVisualInstanceDepthKey(scene, overlay, { value: -1e6, unit: 'depth-unit' });
    setRenderVisualLayerOrderingPolicy(scene, 'overlay', { kind: 'depth-key', unit: 'depth-unit', front: 'higher' });
    candidates('Overlay remains last regardless of depth');
    attempt('Ground unset rejects', () => setRenderVisualInstanceTransform(scene, a, null));
    const up: ProjectionPlane2D = { ...down, axes: { x: 'right', y: 'up' } };
    attempt('Plane mismatch rejects', () => setRenderVisualInstanceTransform(scene, a, placement(up, 10)));
    attempt('Direct creation without ground rejects', () => addRenderVisualInstance(scene, { visualInstanceId: 'unready', layerKey: 'actors' }));
    setRenderVisualLayerOrderingPolicy(scene, 'actors', { kind: 'explicit-order' });
    for (const [index, instance] of [a, b, c].entries()) setRenderVisualInstanceTransform(scene, instance, placement(up, -(index + 1) * 10));
    setRenderVisualLayerOrderingPolicy(scene, 'actors', { kind: 'ground-y', plane: up, front: 'down' });
    candidates('Up-axis/down-front: a,b,c,overlay; more negative is front');
    for (const instance of [a, b, c]) setRenderVisualInstanceDepthKey(scene, instance, { value: 5, unit: 'depth-unit' });
    setRenderVisualLayerOrderingPolicy(scene, 'actors', { kind: 'depth-key', unit: 'depth-unit', front: 'higher' });
    candidates('Equal explicit keys: c,a,b,overlay');
    attempt('Nonfinite key rejects', () => setRenderVisualInstanceDepthKey(scene, a, { value: NaN, unit: 'depth-unit' }));
    attempt('Unit mismatch rejects', () => setRenderVisualInstanceDepthKey(scene, a, { value: 1, unit: 'other' }));
    attempt('Required key clear rejects', () => setRenderVisualInstanceDepthKey(scene, a, null));
    write('Last accepted key', getRenderVisualInstanceDepthKey(scene, a));
    write('Policy', getRenderVisualLayerOrderingPolicy(scene, 'actors'));
    write('Identity retained', { original: a, current: getRenderVisualInstance(scene, 'a') });
    write('Resources retained', { before: beforeResource, after: getRenderVisualInstanceResource(scene, a) });
    write('Ground snapshot', getRenderVisualInstanceTransform(scene, a)?.attachment);
    write('DRAW_NOT_IMPLEMENTED', 'No drawable alpha or pixel evidence; manual browser execution required');
  } finally { scene.dispose(); }
}
