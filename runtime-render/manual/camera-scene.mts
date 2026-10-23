import {
  createRenderFrameSession, createRenderVisualScene, createVisualResourceCache,
  addRenderVisualInstance, bindRenderVisualInstanceResource, setRenderVisualInstanceTransform,
  setRenderVisualInstanceSpriteLayout, getRenderVisualInstanceTransform, listRenderVisualDrawCandidates,
  getRenderVisualSceneDiagnostics, createConfiguredRenderCamera, panRenderCamera, setRenderCameraZoom,
  getRenderCameraViewSnapshot, bindRenderCameraToVisualScene, getRenderCameraFrameSnapshot,
  getRenderFrameInvalidationSnapshot, getRenderViewportSnapshot, resizeRenderViewport,
  type RenderHostBinding, type VisualSourceProvider, type RenderVisualInstanceTransformInput,
} from '@rpg-platform/runtime-render';

/** Finite, button-driven public-root browser consumer. No assertions or frame loop. */
export async function openCameraScene(host: RenderHostBinding, provider: VisualSourceProvider,
  report: (label: string, value: unknown) => void) {
  const log = (label: string, value: unknown) => { try { report(label, value); } catch {} };
  const session = await createRenderFrameSession(host);
  const cleanup: (readonly [string, () => unknown])[] = [['session', () => session.dispose()]];
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    for (const label of ['binding', 'camera', 'scene', 'lease', 'cache', 'session']) {
      try { cleanup.find(entry => entry[0] === label)?.[1](); }
      catch (error) { log(`Cleanup ${label}`, error); }
    }
    cleanup.length = 0;
  };
  try {
    const scene = createRenderVisualScene(session);
    cleanup.push(['scene', () => scene.dispose()]);
    const cache = createVisualResourceCache(provider, { maxCpuEntries: 1, maxGpuEntries: 1 });
    cleanup.push(['cache', () => cache.dispose()]);
    const source = { projectId: provider.scope.projectId, coordinateSpaceId: 'camera-ground',
      unit: 'scene-unit', axes: { x: 'right', y: 'down' } } as const;
    const camera = createConfiguredRenderCamera({ kind: 'orthographic', source, center: { x: 160, y: 120 },
      scale: { unit: 'css-px-per-source-unit', x: 1, y: 1 }, zoom: 1, viewportPolicy: 'preserve-scale' },
    { min: 0.1, max: 10 });
    cleanup.push(['camera', () => camera.dispose()]);
    const logical = { plane: { projectId: source.projectId, coordinateSpaceId: 'camera-css',
      unit: 'css-px', axes: { x: 'right', y: 'down' } }, width: 320, height: 240, screen: null } as const;
    const metrics = { logicalWidthCssPx: 320, logicalHeightCssPx: 240, requestedPixelRatio: 1 };
    const limits = { maxWidthPixels: 4096, maxHeightPixels: 4096, maxPixelCount: 16777216 };
    let receipt = resizeRenderViewport(session, metrics, limits);
    const binding = bindRenderCameraToVisualScene(camera, scene, receipt, logical);
    cleanup.push(['binding', () => binding.dispose()]);
    const descriptor = { identity: { projectId: source.projectId, resourceId: 'traveler' }, mediaType: 'image/png',
      sources: [{ role: 'image', locator: { type: 'project-relative', path: 'samples/traveler.png' } }] } as const;
    const lease = cache.acquire(session, descriptor, 0, 'original-traveler-v1',
      { maxBytes: 1048576, maxDimension: 2048, maxPixels: 4194304 }, { sampling: 'nearest', colorSpace: 'srgb' });
    cleanup.push(['lease', () => lease.release()]);
    const loaded = await lease.result;
    log('Real Phase7 PNG acquisition', loaded);
    if (loaded.state !== 'usable') throw new TypeError('A real usable texture is required');
    const instance = addRenderVisualInstance(scene, { visualInstanceId: 'traveler' });
    bindRenderVisualInstanceResource(scene, instance, { resource: lease, expectedSourceRevision: 'original-traveler-v1', frame: null });
    const input: RenderVisualInstanceTransformInput = {
      placement: { plane: source, point: { x: 160, y: 120 } },
      local: { translation: { x: 0, y: 0 }, rotationRadians: 0, scale: { x: 1, y: 1 } },
      anchor: { unit: 'scene-unit', anchor: { x: 16, y: 24 }, pivot: { x: 16, y: 24 }, localOffset: { x: 0, y: 0 } },
      orientation: { axes: source.axes, zeroAxis: 'positive-x', positiveRotation: 'toward-positive-y', angleRadians: 0 },
      projection: { kind: 'orthographic-plane', source,
        destination: { projectId: source.projectId, coordinateSpaceId: 'render-clip-2d', unit: 'clip-unit', axes: { x: 'right', y: 'up' } },
        sourceOrigin: { x: 0, y: 0 }, destinationOrigin: { x: -1, y: 1 },
        destinationUnitsPerSourceUnit: { x: 2 / 320, y: 2 / 240 } },
    };
    setRenderVisualInstanceTransform(scene, instance, input);
    setRenderVisualInstanceSpriteLayout(scene, instance, { unit: 'scene-unit', x: 0, y: 0, width: 32, height: 48 });
    lease.release(); // Scene owns its independently retained usage.
    const originalTransform = getRenderVisualInstanceTransform(scene, instance);
    const inspect = () => {
      const active = scene.getSnapshot().state === 'active';
      const transform = active ? getRenderVisualInstanceTransform(scene, instance) : null;
      const value = { camera: getRenderCameraViewSnapshot(camera), binding: binding.getSnapshot(),
        viewport: getRenderViewportSnapshot(session), demand: getRenderFrameInvalidationSnapshot(session),
        transform, originalTransformIdentity: transform === originalTransform,
        candidates: active ? listRenderVisualDrawCandidates(scene).map(item => ({ id: item.instance.visualInstanceId, order: item.order })) : [],
        scene: getRenderVisualSceneDiagnostics(scene) };
      log('Inspect', value); return value;
    };
    const draw = () => {
      const frame = session.renderFrame();
      log('Submitted (not pixel evidence)', { frame, camera: getRenderCameraFrameSnapshot(frame) });
      inspect(); return frame;
    };
    return Object.freeze({ draw, inspect, close,
      pan() { panRenderCamera(camera, { plane: source, delta: { x: 32, y: 0 } }); inspect(); },
      zoom() { setRenderCameraZoom(camera, 2); inspect(); },
      noOp() { setRenderCameraZoom(camera, getRenderCameraViewSnapshot(camera).configuration.zoom); inspect(); },
      resizeStale() { receipt = resizeRenderViewport(session, { ...metrics, requestedPixelRatio: 2 }, limits); inspect(); },
      refresh() { binding.configure(receipt, logical); inspect(); },
      unbind() { binding.dispose(); inspect(); },
      disposeCamera() { camera.dispose(); inspect(); },
      disposeScene() { scene.dispose(); inspect(); },
      invalidZoom() { setRenderCameraZoom(camera, 0); },
      invalidWidth() { binding.configure(receipt, { ...logical, width: 0 }); },
      wrongPlane() { binding.configure(receipt, { ...logical, plane: { ...logical.plane, projectId: 'foreign' } }); },
      bindReleased() { bindRenderVisualInstanceResource(scene, instance,
        { resource: lease, expectedSourceRevision: 'original-traveler-v1', frame: null }); },
    });
  } catch (error) { close(); throw error; }
}
