import {
  createRenderVisualScene, addRenderVisualInstance, getRenderVisualInstance,
  addRenderVisualLayer, updateRenderVisualLayer, removeRenderVisualLayer,
  getRenderVisualLayer, listRenderVisualLayers, setRenderVisualInstanceOrder,
  getRenderVisualInstanceOrder, listRenderVisualDrawCandidates, getRenderVisualLayerFailure,
  getRenderVisualInstanceFailure, bindRenderVisualInstanceResource, getRenderVisualInstanceResource,
  getRenderVisualInstanceVisibility, setRenderVisualInstanceVisible, setRenderVisualInstanceTransform,
  type RenderFrameSession, type RenderVisualResourceBindingInput,
  type RenderVisualInstanceTransformInput, type RenderVisualInstanceOrder,
  type RenderVisualDrawCandidate, type RenderVisualLayerSnapshot,
} from '@rpg-platform/runtime-render';

/** Optional finite real-host walkthrough. No mocks, assertions, automatic run or frame submission.
 * Supply an unoccupied canonical live graphics session and real Phase 4 placement;
 * optional resource is a genuine usable Phase 7 lease. Caller observes the log. */
export function observeVisualOrdering(session: RenderFrameSession,
  placement: RenderVisualInstanceTransformInput, resource: RenderVisualResourceBindingInput | null,
  write: (label: string, value: unknown) => void): void {
  const scene = createRenderVisualScene(session);
  try {
    const background: RenderVisualLayerSnapshot = addRenderVisualLayer(scene, { layerKey: 'back', priority: -10 });
    addRenderVisualLayer(scene, { layerKey: 'front', priority: 40 });
    addRenderVisualLayer(scene, { layerKey: 'equal-priority', priority: 40 });
    const first = addRenderVisualInstance(scene, { visualInstanceId: 'first', layerKey: 'front', order: 5 });
    const second = addRenderVisualInstance(scene, { visualInstanceId: 'second', layerKey: 'front', order: 5 });
    addRenderVisualInstance(scene, { visualInstanceId: 'backdrop', layerKey: 'back', order: 100 });
    addRenderVisualInstance(scene, { visualInstanceId: 'equal', layerKey: 'equal-priority', order: -100 });
    if (resource !== null) bindRenderVisualInstanceResource(scene, first, resource);
    setRenderVisualInstanceTransform(scene, first, placement);
    const before = getRenderVisualInstanceResource(scene, first);
    const initial: readonly RenderVisualDrawCandidate[] = listRenderVisualDrawCandidates(scene);
    write('Initial: backdrop, first, second, equal (layer tie precedes instance order)', initial);
    const reordered: RenderVisualInstanceOrder = setRenderVisualInstanceOrder(scene, second, { layerKey: 'front', order: -5 });
    write('Reordered second retains handle', reordered);
    write('Reordered: backdrop, second, first, equal', listRenderVisualDrawCandidates(scene));
    setRenderVisualInstanceOrder(scene, first, { layerKey: 'back', order: -20 });
    write('Reassigned: first, backdrop, second, equal', listRenderVisualDrawCandidates(scene));
    write('Identity before/after', { first, current: getRenderVisualInstance(scene, 'first') });
    write('Resource before/after', { before, after: getRenderVisualInstanceResource(scene, first) });
    updateRenderVisualLayer(scene, { layerKey: 'back', priority: -10, visible: false });
    setRenderVisualInstanceVisible(scene, first, true); // Does not override hidden layer.
    setRenderVisualInstanceTransform(scene, first, placement); // Must retain layer gate.
    write('Hidden layer removes candidates only', listRenderVisualDrawCandidates(scene));
    write('Hidden effective visibility', getRenderVisualInstanceVisibility(scene, first));
    write('Historical layer observation', background);
    write('Current hidden layer', getRenderVisualLayer(scene, 'back'));
    write('Resource retained while hidden', getRenderVisualInstanceResource(scene, first));
    updateRenderVisualLayer(scene, { layerKey: 'back', priority: -10, visible: true });
    write('Show retains explicit order', listRenderVisualDrawCandidates(scene));
    const attempt = (label: string, operation: () => unknown): void => {
      try { write(label, operation()); }
      catch (error) { write(label, getRenderVisualLayerFailure(error) ?? getRenderVisualInstanceFailure(error) ?? error); }
    };
    attempt('Duplicate layer', () => addRenderVisualLayer(scene, { layerKey: 'back', priority: 0 }));
    attempt('Missing layer', () => setRenderVisualInstanceOrder(scene, first, { layerKey: 'absent', order: 0 }));
    attempt('Invalid order', () => setRenderVisualInstanceOrder(scene, first, { layerKey: 'back', order: NaN }));
    attempt('Invalid priority', () => updateRenderVisualLayer(scene, { layerKey: 'back', priority: 0.5 }));
    attempt('Occupied layer', () => removeRenderVisualLayer(scene, 'back'));
    attempt('Reserved layer', () => removeRenderVisualLayer(scene, 'default'));
    write('Last accepted assignment', getRenderVisualInstanceOrder(scene, first));
    addRenderVisualLayer(scene, { layerKey: 'unused', priority: -100 });
    removeRenderVisualLayer(scene, 'unused');
    write('Empty layer deletion', listRenderVisualLayers(scene));
    scene.clear(); // Definitions and creation ordinals survive membership clear.
    write('Clear retains definitions', listRenderVisualLayers(scene));
    write('Clear removes all candidates', listRenderVisualDrawCandidates(scene));
    scene.dispose();
    attempt('Terminal admission', () => listRenderVisualLayers(scene));
    write('DRAW_NOT_IMPLEMENTED', 'Logical candidate observations only; no drawable/pixel acceptance');
  } finally { scene.dispose(); }
}
