// Client-only neutral presentation. No authored Scene or gameplay entity fabrication.
import {
  createRenderVisualScene, createVisualResourceCache, createConfiguredRenderCamera,
  bindRenderCameraToVisualScene, getRenderCameraViewSnapshot, setRenderCameraCenter, setRenderCameraZoom,
  addRenderVisualInstance, bindRenderVisualInstanceResource, setRenderVisualInstanceTransform,
  setRenderVisualInstanceSpriteLayout, getRenderCameraFrameSnapshot, getRenderVisualDiagnostic,
  type OrthographicCameraConfigurationInput, type RenderCameraZoomLimits, type ViewportMetrics2D,
  type RenderCameraSceneBinding, type PlaneProjectionPoint2D, type RenderVisualInstanceTransformInput,
  type RenderVisualSpriteLayout, type VisualSourceProvider, type VisualResourceLease,
} from '@rpg-platform/runtime-render';
import type { ClientSceneResource } from './manual-scene-host.js';
import { mountClientViewport } from './viewport-host.js';

/** Manual neutral point and sprite layout, not a simulated Player/follow controller. */
export function mountClientCamera(target: HTMLCanvasElement, input: {
  readonly provider: VisualSourceProvider; readonly resource: ClientSceneResource;
  readonly transform: RenderVisualInstanceTransformInput; readonly layout: RenderVisualSpriteLayout;
  readonly camera: OrthographicCameraConfigurationInput; readonly zoomLimits: RenderCameraZoomLimits;
}, report: (event: string, detail?: unknown) => void,
  pixelRatio: () => number = () => window.devicePixelRatio) {
  const log = (event: string, detail?: unknown) => { try { report(event, detail); } catch {} };
  let cleanupFailure: { error: unknown } | undefined;
  let closed = false, generation = 0, loadState = 'not-started';
  let camera: ReturnType<typeof createConfiguredRenderCamera> | undefined;
  let scene: ReturnType<typeof createRenderVisualScene> | undefined;
  let cache: ReturnType<typeof createVisualResourceCache> | undefined;
  let binding: RenderCameraSceneBinding | undefined;
  let lease: VisualResourceLease | undefined;
  const release = () => {
    generation++;
    let failed = false, first: unknown;
    for (const action of [() => binding?.dispose(), () => camera?.dispose(), () => scene?.dispose(),
      () => lease?.release(), () => { cache?.dispose();
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
    binding = undefined; scene = undefined; lease = undefined; cache = undefined;
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
      cache = createVisualResourceCache(input.provider, { maxCpuEntries: 1, maxGpuEntries: 1 });
      const ownedLease = lease = cache.acquire(session, input.resource.descriptor, input.resource.sourceIndex,
        input.resource.sourceRevision, { maxBytes: 1048576, maxDimension: 2048, maxPixels: 4194304 },
        { sampling: 'nearest', colorSpace: 'srgb' });
      loadState = 'loading';
      void (async () => {
        try {
          const loaded = await ownedLease.result;
          if (closed || ticket !== generation) return;
          if (loaded.state !== 'usable') throw new TypeError('Actual Client PNG unavailable');
          const instance = addRenderVisualInstance(ownedScene, { visualInstanceId: 'neutral-sample' });
          bindRenderVisualInstanceResource(ownedScene, instance, { resource: ownedLease,
            expectedSourceRevision: input.resource.sourceRevision, frame: input.resource.frame });
          setRenderVisualInstanceTransform(ownedScene, instance, input.transform);
          setRenderVisualInstanceSpriteLayout(ownedScene, instance, input.layout);
          loadState = 'applied'; log('Client neutral visual ready', loaded);
        } catch (error) {
          if (closed || ticket !== generation) return;
          loadState = 'failed'; log('Client source rejected', getRenderVisualDiagnostic(error)); host.stop();
        } finally { log('Client host lease released', ownedLease.release()); }
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
    inspect: () => ({ host: host.getSnapshot(), loadState, camera: camera && getRenderCameraViewSnapshot(camera),
      binding: binding?.getSnapshot(), neutralPlacement: input.transform.placement }),
  });
}
