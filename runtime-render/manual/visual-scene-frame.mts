import {
  createRenderFrameSession, createRenderVisualScene, createVisualResourceCache,
  removeRenderVisualInstance, getRenderVisualSceneDiagnostics, getRenderVisualDiagnostic,
  addRenderVisualInstance, bindRenderVisualInstanceResource, setRenderVisualInstanceTransform,
  setRenderVisualInstanceSpriteLayout, setRenderVisualInstanceVisible, setRenderVisualInstanceOrder,
  setRenderVisualLayerOrderingPolicy, listRenderVisualDrawCandidates, getRenderFrameInvalidationSnapshot,
  type RenderHostBinding, type RenderVisualFrameBinding, type VisualSourceProvider,
  type VisualResourceDescriptor, type VisualResourceLease, type RenderVisualInstanceTransformInput,
} from '@rpg-platform/runtime-render';

export interface ManualVisualInput {
  readonly descriptor: VisualResourceDescriptor;
  readonly sourceIndex: number;
  readonly sourceRevision: string;
  readonly frame: RenderVisualFrameBinding | null;
}

/** Optional button-driven real browser consumer. No auto-run, assertions or simulated leases.
 * The host supplies authorized PNGs; a supplied canonical frame uses the same path. */
export async function openVisualSceneFrames(host: RenderHostBinding, provider: VisualSourceProvider,
  inputs: readonly [ManualVisualInput, ManualVisualInput], report: (label: string, value: unknown) => void) {
  const log = (label: string, value: unknown): void => { try { report(label, value); } catch {} };
  const cache = createVisualResourceCache(provider, { maxCpuEntries: 2, maxGpuEntries: 2 });
  const session = await createRenderFrameSession(host).catch(error => { cache.dispose(); throw error; });
  const scene = (() => {
    try { return createRenderVisualScene(session); }
    catch (error) { try { cache.dispose(); } finally { session.dispose(); } throw error; }
  })();
  const leases: VisualResourceLease[] = [];
  let closed = false;
  const close = (): void => {
    if (closed) return;
    closed = true;
    let failed = false;
    for (const [label, action] of [
      ['scene', () => scene.dispose()], ...leases.map(lease => ['lease', () => lease.release()] as const),
      ['cache', () => cache.dispose()], ['session', () => session.dispose()],
    ] as const) {
      try { action(); } catch (error) { failed = true; log(`Cleanup uncertain: ${label}`, error); }
    }
    log('Closed; no leak-free claim', { failed });
  };
  const requireOpen = (): void => { if (closed) throw new TypeError('Manual consumer closed'); };
  const placement = (x: number, y: number): RenderVisualInstanceTransformInput => {
    const plane = { projectId: provider.scope.projectId, coordinateSpaceId: 'manual-ground',
      unit: 'scene-unit', axes: { x: 'right', y: 'down' } } as const;
    return { placement: { plane, point: { x, y } },
      local: { translation: { x: 0, y: 0 }, rotationRadians: 0, scale: { x: 1, y: 1 } },
      anchor: { unit: plane.unit, anchor: { x: 48, y: 96 }, pivot: { x: 48, y: 96 }, localOffset: { x: 0, y: 0 } },
      orientation: { axes: plane.axes, zeroAxis: 'positive-x', positiveRotation: 'toward-positive-y', angleRadians: 0 },
      projection: { kind: 'orthographic-plane', source: plane,
        destination: { projectId: plane.projectId, coordinateSpaceId: 'render-clip-2d', unit: 'clip-unit', axes: { x: 'right', y: 'up' } },
        sourceOrigin: { x: 0, y: 0 }, destinationOrigin: { x: -1, y: 1 },
        destinationUnitsPerSourceUnit: { x: 2 / 320, y: 2 / 240 } } };
  };
  try {
    log('Legacy empty clear receipt; NOT display proof', session.renderFrame());
    for (const input of inputs) leases.push(cache.acquire(session, input.descriptor, input.sourceIndex,
      input.sourceRevision, { maxBytes: 1048576, maxDimension: 2048, maxPixels: 4194304 },
      { sampling: 'nearest', colorSpace: 'srgb' }));
    for (const lease of leases) {
      const result = await lease.result;
      log('Actual Phase7 load/decode/upload', result);
      if (result.state !== 'usable') throw new TypeError('Manual draw requires usable real PNG resources');
    }
    const first = addRenderVisualInstance(scene, { visualInstanceId: 'first' });
    const second = addRenderVisualInstance(scene, { visualInstanceId: 'second' });
    for (const [index, instance] of [first, second].entries()) {
      const input = inputs[index]!, lease = leases[index]!;
      bindRenderVisualInstanceResource(scene, instance, { resource: lease,
        expectedSourceRevision: input.sourceRevision, frame: input.frame });
      setRenderVisualInstanceTransform(scene, instance, placement(index === 0 ? 136 : 184, 176));
      setRenderVisualInstanceSpriteLayout(scene, instance, { unit: 'scene-unit', x: 0, y: 0, width: 96, height: 96 });
    }
    for (const lease of leases) lease.release(); // Independent instance usage must support subsequent draws.
    const draw = () => {
      requireOpen();
      log('Demand and candidates', { demand: getRenderFrameInvalidationSnapshot(session),
        order: listRenderVisualDrawCandidates(scene).map(item => item.instance.visualInstanceId) });
      const receipt = session.renderFrame(); log('Frame submitted; NOT display proof', receipt); return receipt;
    };
    draw();
    return Object.freeze({ draw, close,
      inspect() { return getRenderVisualSceneDiagnostics(scene); },
      removeFirst() { requireOpen(); return removeRenderVisualInstance(scene, first); },
      disposeScene() { return scene.dispose(); },
      disposeSession() { return session.dispose(); },
      bindReleased() {
        requireOpen();
        try { bindRenderVisualInstanceResource(scene, second, { resource: leases[0]!,
          expectedSourceRevision: inputs[0].sourceRevision, frame: inputs[0].frame }); }
        catch (error) { return getRenderVisualDiagnostic(error); }
        return null; // An unexpected successful admission remains visible to the observer.
      },
      hideFirst(visible: boolean) { requireOpen(); setRenderVisualInstanceVisible(scene, first, visible); },
      moveFirst(y: number) { requireOpen(); setRenderVisualInstanceTransform(scene, first, placement(136, y)); },
      orderFirst(order: number) { requireOpen(); setRenderVisualInstanceOrder(scene, first, { layerKey: 'default', order }); },
      groundSort() { requireOpen(); setRenderVisualLayerOrderingPolicy(scene, 'default',
        { kind: 'ground-y', plane: placement(0, 0).placement.plane, front: 'down' }); },
      clear() { requireOpen(); scene.clear(); },
    });
  } catch (error) { close(); throw error; }
}
