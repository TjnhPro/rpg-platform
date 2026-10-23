// Optional Client-owned browser sample. Deliberately outside the public root.
import {
  beginRenderFrameSession, createRenderVisualScene, createVisualResourceCache,
  prepareVisualResource, addRenderVisualInstance, removeRenderVisualInstance,
  bindRenderVisualInstanceResource, setRenderVisualInstanceTransform,
  setRenderVisualInstanceSpriteLayout, setRenderVisualInstanceVisible, setRenderVisualInstanceOrder,
  listRenderVisualInstances, getRenderVisualSceneDiagnostics, getRenderViewportSnapshot,
  getRenderFrameInvalidationSnapshot, getRenderVisualDiagnostic,
  type VisualSourceProvider, type VisualResourceDescriptor, type RenderVisualFrameBinding,
  type RenderFrameSession, type RenderVisualScene, type VisualResourceLease,
  type RenderVisualInstance, type RenderVisualInstanceTransformInput,
} from '@rpg-platform/runtime-render';

/** Neutral resource selection, not an authored Scene, catalog or gameplay model. */
export interface ClientSceneResource {
  readonly descriptor: VisualResourceDescriptor;
  readonly sourceIndex: number;
  readonly sourceRevision: string;
  readonly frame: RenderVisualFrameBinding | null;
}

/** One mount/open attempt on a dedicated 320x240 canvas. Client owns scheduling/UI;
 * Render alone owns live state, resource pipeline and backend. No gameplay updates. */
export function mountClientSceneDemo(target: HTMLCanvasElement,
  report: (event: string, data: unknown) => void) {
  const log = (event: string, data: unknown): void => { try { report(event, data); } catch {} };
  let closed = false, started = false, ordinal = 0;
  let callback: number | undefined;
  let session: RenderFrameSession | undefined, scene: RenderVisualScene | undefined;
  let cache: ReturnType<typeof createVisualResourceCache> | undefined;
  let lease: VisualResourceLease | undefined, resource: ClientSceneResource | undefined;
  const instances = new Map<string, RenderVisualInstance>();
  const inspect = () => ({ closed,
    sessionId: session ? getRenderFrameInvalidationSnapshot(session).sessionId : null,
    viewport: session ? getRenderViewportSnapshot(session) : null,
    scene: scene ? getRenderVisualSceneDiagnostics(scene) : null,
    instances: scene?.getSnapshot().state === 'active' ? listRenderVisualInstances(scene) : [],
    cache: cache?.getSnapshot() ?? null });
  const requireReady = () => {
    if (closed || !scene || !session || !resource || lease?.getSnapshot().state !== 'usable') {
      throw new TypeError('Client scene unavailable');
    }
    if (getRenderVisualSceneDiagnostics(scene).cleanupFailed || cache?.getSnapshot().cleanupFailed) {
      throw new TypeError('Client cleanup uncertain; close this mount');
    }
    return { scene, session, resource, lease };
  };
  const draw = () => {
    const live = requireReady();
    log('Client submitted; NOT display proof', live.session.renderFrame());
  };
  const requestFrame = () => {
    if (closed || callback !== undefined) return;
    callback = requestAnimationFrame(() => {
      callback = undefined;
      if (closed) return;
      try {
        const live = requireReady();
        if (getRenderFrameInvalidationSnapshot(live.session).invalidated) draw();
      } catch (error) { log('Client frame failure', getRenderVisualDiagnostic(error)); }
    });
  };
  const transform = (x: number, y: number): RenderVisualInstanceTransformInput => {
    const projectId = requireReady().resource.descriptor.identity.projectId;
    const plane = { projectId, coordinateSpaceId: 'client-presentation', unit: 'scene-unit',
      axes: { x: 'right', y: 'down' } } as const;
    return { placement: { plane, point: { x, y } },
      local: { translation: { x: 0, y: 0 }, rotationRadians: 0, scale: { x: 1, y: 1 } },
      anchor: { unit: plane.unit, anchor: { x: 32, y: 64 }, pivot: { x: 32, y: 64 }, localOffset: { x: 0, y: 0 } },
      orientation: { axes: plane.axes, zeroAxis: 'positive-x', positiveRotation: 'toward-positive-y', angleRadians: 0 },
      projection: { kind: 'orthographic-plane', source: plane,
        destination: { projectId, coordinateSpaceId: 'render-clip-2d', unit: 'clip-unit', axes: { x: 'right', y: 'up' } },
        sourceOrigin: { x: 0, y: 0 }, destinationOrigin: { x: -1, y: 1 },
        destinationUnitsPerSourceUnit: { x: 2 / 320, y: 2 / 240 } } };
  };
  const add = () => {
    const live = requireReady();
    const id = `client-visual-${++ordinal}`;
    const instance = addRenderVisualInstance(live.scene, { visualInstanceId: id });
    // Record immediately: later admission may fail after membership has committed.
    instances.set(id, instance);
    bindRenderVisualInstanceResource(live.scene, instance, { resource: live.lease,
      expectedSourceRevision: live.resource.sourceRevision, frame: live.resource.frame });
    setRenderVisualInstanceTransform(live.scene, instance, transform(80 + (ordinal % 3) * 48, 160));
    setRenderVisualInstanceSpriteLayout(live.scene, instance, { unit: 'scene-unit', x: 0, y: 0, width: 64, height: 64 });
    requestFrame(); return instance;
  };
  const selected = (id: string) => {
    const instance = instances.get(id);
    if (!instance) throw new TypeError('Unknown Client visual key');
    return instance;
  };
  const close = () => {
    if (closed) return;
    closed = true;
    if (callback !== undefined) cancelAnimationFrame(callback);
    callback = undefined;
    for (const [stage, action] of [ ['scene', () => scene?.dispose()],
      ['lease', () => lease?.release()], ['cache', () => cache?.dispose()],
      ['session', () => session?.dispose()] ] as const) {
      try { log(`Client cleanup ${stage}`, action()); }
      catch (error) { log(`Client cleanup uncertain ${stage}`, getRenderVisualDiagnostic(error)); }
    }
    instances.clear();
    log('Client terminal observations; no leak-free claim', inspect());
  };
  return Object.freeze({ inspect, draw, add, close,
    async open(provider: VisualSourceProvider, input: ClientSceneResource) {
      if (closed || started) throw new TypeError('Client demo requires a fresh mount');
      started = true;
      resource = Object.freeze({ ...input, descriptor: prepareVisualResource(input.descriptor).descriptor });
      const operation = beginRenderFrameSession({ target });
      try {
        const acquired = await operation.result;
        if (closed) { acquired.dispose(); log('Client late graphics released', operation.getSnapshot()); return; }
        session = acquired;
        scene = createRenderVisualScene(acquired);
        cache = createVisualResourceCache(provider, { maxCpuEntries: 2, maxGpuEntries: 2 });
        lease = cache.acquire(acquired, resource.descriptor, resource.sourceIndex, resource.sourceRevision,
          { maxBytes: 1048576, maxDimension: 2048, maxPixels: 4194304 }, { sampling: 'nearest', colorSpace: 'srgb' });
        const loaded = await lease.result;
        if (closed) return;
        log('Client actual Phase7 load', loaded);
        if (loaded.state !== 'usable') throw new TypeError('Client PNG resource unavailable');
        add(); add();
        log('Client scene ready; pixels NOT_VERIFIED', inspect());
      } catch (error) {
        log('Client open failed', { failure: getRenderVisualDiagnostic(error), graphics: operation.getSnapshot() });
        close(); throw error;
      }
    },
    move(id: string, x: number, y: number) {
      setRenderVisualInstanceTransform(requireReady().scene, selected(id), transform(x, y)); requestFrame();
    },
    visible(id: string, value: boolean) {
      setRenderVisualInstanceVisible(requireReady().scene, selected(id), value); requestFrame();
    },
    order(id: string, value: number) {
      setRenderVisualInstanceOrder(requireReady().scene, selected(id), { layerKey: 'default', order: value }); requestFrame();
    },
    remove(id: string) {
      const removed = removeRenderVisualInstance(requireReady().scene, selected(id));
      instances.delete(id); requestFrame(); return removed;
    },
  });
}
