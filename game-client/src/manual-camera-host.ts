// Client-only neutral presentation. No authored Scene or gameplay entity fabrication.
import {
  createRenderVisualScene, createVisualResourceCache, createConfiguredRenderCamera,
  bindRenderCameraToVisualScene, getRenderCameraViewSnapshot, setRenderCameraCenter, setRenderCameraZoom,
  addRenderVisualInstance, bindRenderVisualInstanceResource, setRenderVisualInstanceTransform,
  setRenderVisualInstanceSpriteLayout, getRenderCameraFrameSnapshot, getRenderVisualDiagnostic,
  addRenderVisualLayer, setRenderVisualLayerOrderingPolicy, setRenderVisualInstanceOrder,
  listRenderVisualInstances, listRenderVisualDrawCandidates, getRenderVisualInstanceTransform,
  getRenderVisualInstanceResource, getRenderVisualSceneDiagnostics, getRenderVisualBindingFailure,
  type OrthographicCameraConfigurationInput, type RenderCameraZoomLimits, type ViewportMetrics2D,
  type RenderCameraSceneBinding, type PlaneProjectionPoint2D, type RenderVisualInstanceTransformInput,
  type RenderVisualSpriteLayout, type VisualSourceProvider, type VisualResourceLease,
  type RenderVisualLayerInput, type RenderVisualLayerOrderingPolicy, type RenderVisualInstanceOrder,
} from '@rpg-platform/runtime-render';
import type { ClientSceneResource } from './manual-scene-host.js';
import { mountClientViewport } from './viewport-host.js';

interface CameraVisual {
  readonly id: string; readonly resource: ClientSceneResource;
  readonly transform: RenderVisualInstanceTransformInput; readonly layout: RenderVisualSpriteLayout;
  readonly order: RenderVisualInstanceOrder;
}

/** Manual neutral point and sprite layout, not a simulated Player/follow controller. */
export function mountClientCamera(target: HTMLCanvasElement, input: {
  readonly provider: VisualSourceProvider;
  readonly layers?: readonly { readonly definition: RenderVisualLayerInput; readonly ordering: RenderVisualLayerOrderingPolicy }[];
  readonly camera: OrthographicCameraConfigurationInput; readonly zoomLimits: RenderCameraZoomLimits;
} & ({ readonly visuals: readonly CameraVisual[] } | {
  readonly resource: ClientSceneResource; readonly transform: RenderVisualInstanceTransformInput;
  readonly layout: RenderVisualSpriteLayout;
}), report: (event: string, detail?: unknown) => void,
  pixelRatio: () => number = () => window.devicePixelRatio) {
  const log = (event: string, detail?: unknown) => { try { report(event, detail); } catch {} };
  let cleanupFailure: { error: unknown } | undefined;
  let closed = false, generation = 0, loadState = 'not-started';
  let camera: ReturnType<typeof createConfiguredRenderCamera> | undefined;
  let scene: ReturnType<typeof createRenderVisualScene> | undefined;
  let cache: ReturnType<typeof createVisualResourceCache> | undefined;
  let binding: RenderCameraSceneBinding | undefined;
  const visuals: readonly CameraVisual[] = 'visuals' in input ? input.visuals : [
    { id: 'neutral-sample', resource: input.resource, transform: input.transform, layout: input.layout,
      order: { layerKey: 'default', order: 0 } }];
  const leases = new Set<VisualResourceLease>();
  let expiredLease: { lease: VisualResourceLease; visual: CameraVisual } | undefined;
  const release = () => {
    generation++;
    let failed = false, first: unknown;
    for (const action of [() => binding?.dispose(), () => camera?.dispose(), () => scene?.dispose(),
      ...Array.from(leases, lease => () => lease.release()), () => { cache?.dispose();
        if (cache?.getSnapshot().cleanupFailed) throw new TypeError('Resource cache cleanup uncertain'); }]) {
      try {
        const result: unknown = action(); log('Client cleanup', result);
        if (typeof result === 'object' && result !== null && 'cleanupFailed' in result
          && result.cleanupFailed === true) throw new TypeError('Client cleanup uncertain');
      } catch (error) {
        if (!failed) { failed = true; first = error; }
        log('Client cleanup uncertain', getRenderVisualDiagnostic(error));
      }
    }
    binding = undefined; scene = undefined; leases.clear(); cache = undefined;
    if (failed) cleanupFailure ??= { error: first };
    if (cleanupFailure) throw cleanupFailure.error;
  };
  const host = mountClientViewport(target, (event, detail) => {
    // Keep frame logs finite; counts remain available through inspect.
    if (event === 'submitted') {
      const frame = (detail as { receipt: Parameters<typeof getRenderCameraFrameSnapshot>[0] }).receipt;
      if (host.getSnapshot().submissions === 1) log('Client first camera submission; pixels unverified', getRenderCameraFrameSnapshot(frame));
    } else log(event, detail);
  }, pixelRatio, {
    acquired(session) {
      const ticket = ++generation;
      camera = createConfiguredRenderCamera(input.camera, input.zoomLimits);
      const ownedScene = scene = createRenderVisualScene(session);
      for (const layer of input.layers ?? []) {
        addRenderVisualLayer(ownedScene, layer.definition);
        setRenderVisualLayerOrderingPolicy(ownedScene, layer.definition.layerKey, layer.ordering);
      }
      const capacity = Math.max(1, visuals.length);
      const ownedCache = cache = createVisualResourceCache(input.provider, { maxCpuEntries: capacity, maxGpuEntries: capacity });
      loadState = 'loading';
      void (async () => {
        try {
          for (const visual of visuals) {
            if (closed || ticket !== generation) return;
            const ownedLease = ownedCache.acquire(session, visual.resource.descriptor, visual.resource.sourceIndex,
              visual.resource.sourceRevision, { maxBytes: 1048576, maxDimension: 2048, maxPixels: 4194304 },
              { sampling: 'nearest', colorSpace: 'srgb' });
            leases.add(ownedLease);
            try {
              const loaded = await ownedLease.result;
              if (closed || ticket !== generation) return;
              if (loaded.state !== 'usable') throw new TypeError('Actual Client PNG unavailable');
              const instance = addRenderVisualInstance(ownedScene, { visualInstanceId: visual.id });
              bindRenderVisualInstanceResource(ownedScene, instance, { resource: ownedLease,
                expectedSourceRevision: visual.resource.sourceRevision, frame: visual.resource.frame });
              setRenderVisualInstanceTransform(ownedScene, instance, visual.transform);
              setRenderVisualInstanceSpriteLayout(ownedScene, instance, visual.layout);
              setRenderVisualInstanceOrder(ownedScene, instance, visual.order);
              log('Client neutral visual ready', { id: visual.id, loaded });
            } finally {
              leases.delete(ownedLease);
              const released = ownedLease.release(); log('Client host lease released', released);
              if (released.cleanupFailed) {
                cleanupFailure ??= { error: new TypeError('Client lease cleanup uncertain') };
                throw cleanupFailure.error;
              }
              if (!closed && ticket === generation) expiredLease = { lease: ownedLease, visual };
            }
          }
          loadState = 'applied';
        } catch (error) {
          if (closed || ticket !== generation) return;
          loadState = 'failed'; log('Client source rejected', getRenderVisualDiagnostic(error)); host.stop();
        }
      })().catch(error => log('Client async cleanup uncertain', getRenderVisualDiagnostic(error)));
    },
    configured(_session, receipt, metrics) {
      if (!camera || !scene) throw new TypeError('Client camera content unavailable');
      const logical: ViewportMetrics2D = { plane: { projectId: input.camera.source.projectId,
        coordinateSpaceId: 'client-camera-css', unit: 'css-px', axes: { x: 'right', y: 'down' } },
        width: metrics.logicalWidthCssPx, height: metrics.logicalHeightCssPx, screen: null };
      if (binding) binding.configure(receipt, logical);
      else binding = bindRenderCameraToVisualScene(camera, scene, receipt, logical);
    }, release,
  });
  const requireCamera = () => {
    if (closed || !camera || camera.getSnapshot().state !== 'active') throw new TypeError('Client camera unavailable');
    return camera;
  };
  const close = () => {
    if (closed) return;
    closed = true; window.removeEventListener('pagehide', close); host.unmount();
  };
  window.addEventListener('pagehide', close);
  return Object.freeze({ acquire: host.acquire, start: host.start, stop: host.stop, sync: host.sync, close,
    // A future Engine presentation adapter can supply these same explicit inputs.
    center(point: PlaneProjectionPoint2D) { setRenderCameraCenter(requireCamera(), point); },
    zoom(value: number) { setRenderCameraZoom(requireCamera(), value); },
    bindExpiredResource() {
      requireCamera();
      if (!scene || !expiredLease || loadState !== 'applied') throw new TypeError('Load real resources first');
      const instance = listRenderVisualInstances(scene).find(value => value.visualInstanceId === expiredLease!.visual.id);
      if (!instance) throw new TypeError('Original instance unavailable');
      const before = getRenderVisualInstanceResource(scene, instance);
      try {
        bindRenderVisualInstanceResource(scene, instance, { resource: expiredLease.lease,
          expectedSourceRevision: expiredLease.visual.resource.sourceRevision, frame: expiredLease.visual.resource.frame });
        log('Released lease unexpectedly admitted', getRenderVisualInstanceResource(scene, instance));
      } catch (error) {
        const after = getRenderVisualInstanceResource(scene, instance);
        log('Released lease rejection observation', { failure: getRenderVisualBindingFailure(error),
          diagnostic: getRenderVisualDiagnostic(error), before, after,
          sameAllocation: before?.resourceId === after?.resourceId });
        throw error;
      }
    },
    inspect: () => ({ host: host.getSnapshot(), loadState, camera: camera && getRenderCameraViewSnapshot(camera),
      binding: binding?.getSnapshot(), neutralPlacement: 'transform' in input ? input.transform.placement : null,
      neutralPlacements: visuals.map(visual => visual.transform.placement), cache: cache?.getSnapshot(),
      scene: scene && getRenderVisualSceneDiagnostics(scene),
      visuals: scene?.getSnapshot().state === 'active' ? listRenderVisualInstances(scene).map(instance => ({
        instance, transform: getRenderVisualInstanceTransform(scene!, instance), resource: getRenderVisualInstanceResource(scene!, instance) })) : [],
      candidates: scene?.getSnapshot().state === 'active' ? listRenderVisualDrawCandidates(scene) : [] }),
  });
}
