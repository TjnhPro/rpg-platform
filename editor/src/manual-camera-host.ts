// Editor-only browser composition. Package root stays portable and unchanged.
import {
  createRenderVisualScene, createVisualResourceCache, createConfiguredRenderCamera,
  bindRenderCameraToVisualScene, getRenderCameraViewSnapshot, panRenderCamera,
  zoomRenderCameraAtFocus, projectRenderCameraPoint, screenToRenderCameraSelectedPlane,
  screenPointToViewport2D, getRenderCameraFrameSnapshot, getRenderVisualDiagnostic,
  addRenderVisualLayer, setRenderVisualLayerOrderingPolicy, listRenderVisualInstances,
  listRenderVisualDrawCandidates, getRenderVisualInstanceTransform, getRenderVisualInstanceResource,
  getRenderVisualSceneDiagnostics, getRenderViewportSnapshot, setRenderCameraZoom, setRenderCameraCenter,
  transitionRenderCameraWithinBounds,
  type OrthographicCameraConfigurationInput, type RenderCameraZoomLimits,
  type RenderFrameSession, type RenderViewportResizeReceipt, type ViewportMetrics2D,
  type RenderCameraSceneBinding,
  type RenderVisualLayerInput, type RenderVisualLayerOrderingPolicy, type PlaneProjectionPoint2D,
  type RenderCameraBoundsPolicy,
} from '@rpg-platform/runtime-render';
import { createSceneMembership, type SceneMembership } from './scene-membership.js';
import { createAssetCatalog, type AssetCatalog } from './asset-catalog.js';
import { createScenePreviewBridge, type ScenePreviewBridge } from './scene-preview.js';
import { mountEditorViewport } from './viewport-host.js';
import type { VisualSourceProvider } from '@rpg-platform/runtime-render';

/** Authored input and workspace intent are deliberately separate inputs. */
export function mountEditorCamera(target: HTMLCanvasElement, input: {
  readonly authored: SceneMembership; readonly catalog: AssetCatalog;
  readonly provider: VisualSourceProvider; readonly presentation: Parameters<ScenePreviewBridge['sync']>[2];
  readonly layers?: readonly { readonly definition: RenderVisualLayerInput; readonly ordering: RenderVisualLayerOrderingPolicy }[];
  readonly camera: OrthographicCameraConfigurationInput; readonly zoomLimits: RenderCameraZoomLimits;
}, report: (event: string, detail?: unknown) => void,
  pixelRatio: () => number = () => window.devicePixelRatio) {
  const authored = createSceneMembership(input.authored), catalog = createAssetCatalog(input.catalog);
  const log = (event: string, detail?: unknown) => { try { report(event, detail); } catch {} };
  let closed = false;
  let cleanupFailure: { error: unknown } | undefined;
  let camera: ReturnType<typeof createConfiguredRenderCamera> | undefined;
  let scene: ReturnType<typeof createRenderVisualScene> | undefined;
  let cache: ReturnType<typeof createVisualResourceCache> | undefined;
  let bridge: ReturnType<typeof createScenePreviewBridge> | undefined;
  let binding: RenderCameraSceneBinding | undefined;
  let context: { session: RenderFrameSession; receipt: RenderViewportResizeReceipt; logical: ViewportMetrics2D } | undefined;
  let generation = 0, loadState = 'not-started';
  let drag: { id: number; x: number; y: number } | undefined;
  const endDrag = () => {
    const previous = drag; drag = undefined;
    if (previous && target.hasPointerCapture(previous.id)) target.releasePointerCapture(previous.id);
  };
  const release = () => {
    generation++; context = undefined;
    const actions = [endDrag, () => binding?.dispose(), () => camera?.dispose(),
      () => { const outcomes = bridge?.close(); log('Editor bridge cleanup', outcomes);
        if (outcomes?.some(outcome => outcome.cleanupFailed)) throw new TypeError('Editor bridge cleanup uncertain'); }, () => scene?.dispose(), () => { cache?.dispose();
        if (cache?.getSnapshot().cleanupFailed) throw new TypeError('Resource cache cleanup uncertain'); }];
    let failed = false, first: unknown;
    for (const action of actions) {
      try { action(); } catch (error) {
        if (!failed) { failed = true; first = error; }
        log('Editor cleanup uncertain', getRenderVisualDiagnostic(error));
      }
    }
    binding = undefined; bridge = undefined; scene = undefined; cache = undefined;
    if (failed) cleanupFailure ??= { error: first };
    if (cleanupFailure) throw cleanupFailure.error;
  };
  const host = mountEditorViewport(target, (event, detail) => {
    if (event === 'submitted') {
      const frame = (detail as { receipt: Parameters<typeof getRenderCameraFrameSnapshot>[0] }).receipt;
      log('Editor camera submitted; pixels unverified', getRenderCameraFrameSnapshot(frame));
    } else log(event, detail);
  }, pixelRatio, {
    acquired(session) {
      const ticket = ++generation;
      camera = createConfiguredRenderCamera(input.camera, input.zoomLimits);
      scene = createRenderVisualScene(session);
      for (const layer of input.layers ?? []) {
        addRenderVisualLayer(scene, layer.definition);
        setRenderVisualLayerOrderingPolicy(scene, layer.definition.layerKey, layer.ordering);
      }
      const capacity = Math.max(1, catalog.definitions.length);
      const ownedCache = cache = createVisualResourceCache(input.provider, { maxCpuEntries: capacity, maxGpuEntries: capacity });
      const ownedBridge = bridge = createScenePreviewBridge(scene, authored.scene.identity,
        (descriptor, plan) => ownedCache.acquire(session, descriptor, 0, plan.sourceRevision,
          { maxBytes: 1048576, maxDimension: 2048, maxPixels: 4194304 }, { sampling: 'nearest', colorSpace: 'srgb' }));
      loadState = 'loading';
      void ownedBridge.sync(authored, catalog, input.presentation).then(outcomes => {
        if (closed || generation !== ticket) return;
        loadState = outcomes.every(outcome => outcome.status === 'applied') ? 'applied' : 'diagnosed';
        log('Editor authored preview outcomes', outcomes);
        host.requestFrame();
      }).catch(error => {
        if (closed || generation !== ticket) return;
        loadState = 'failed'; log('Editor preview failed', getRenderVisualDiagnostic(error)); host.suspend();
      });
    },
    configured(session, receipt, metrics) {
      if (!camera || !scene) throw new TypeError('Editor camera content unavailable');
      const logical: ViewportMetrics2D = { plane: { projectId: input.camera.source.projectId,
        coordinateSpaceId: 'editor-camera-css', unit: 'css-px', axes: { x: 'right', y: 'down' } },
        width: metrics.logicalWidthCssPx, height: metrics.logicalHeightCssPx, screen: null };
      if (binding) binding.configure(receipt, logical);
      else binding = bindRenderCameraToVisualScene(camera, scene, receipt, logical);
      context = { session, receipt, logical }; endDrag();
    }, release,
  });
  const ready = () => {
    if (closed || !camera || !context || host.getSnapshot().paused) throw new TypeError('Editor camera unavailable');
    // Re-measure/accept viewport before input, using the existing Phase6 host.
    host.sync();
    if (host.getSnapshot().paused) throw new TypeError('Editor viewport suspended');
    return { camera, ...context };
  };
  const pointer = (x: number, y: number) => {
    const live = ready(), bounds = target.getBoundingClientRect();
    const screen = { plane: { projectId: input.camera.source.projectId, coordinateSpaceId: 'client-css',
      unit: 'css-px', axes: { x: 'right', y: 'down' } } as const,
      origin: { x: bounds.left, y: bounds.top }, screenUnitsPerViewportUnit: { x: 1, y: 1 } };
    return { ...live, logical: { ...live.logical, screen }, point: { plane: screen.plane, point: { x, y } } };
  };
  const act = (action: () => void) => { try { action(); } catch (error) { log('Editor input rejected', getRenderVisualDiagnostic(error)); endDrag(); } };
  const down = (event: PointerEvent) => act(() => {
    if (event.button !== 0 || drag) return;
    ready(); target.setPointerCapture(event.pointerId);
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
  });
  const move = (event: PointerEvent) => act(() => {
    if (!drag || drag.id !== event.pointerId) return;
    const previous = drag, live = pointer(event.clientX, event.clientY);
    if (!drag) return;
    const view = getRenderCameraViewSnapshot(live.camera);
    const selectedPlane = view.configuration.source;
    const before = screenToRenderCameraSelectedPlane(live.camera, live.logical, { cameraView: view,
      selectedPlane, point: { ...live.point, point: { x: previous.x, y: previous.y } } }, { session: live.session, receipt: live.receipt }).selectedPlanePoint.point;
    const after = screenToRenderCameraSelectedPlane(live.camera, live.logical,
      { cameraView: view, selectedPlane, point: live.point }, { session: live.session, receipt: live.receipt }).selectedPlanePoint.point;
    panRenderCamera(live.camera, { plane: selectedPlane, delta: { x: before.x - after.x, y: before.y - after.y } });
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY }; host.requestFrame();
  });
  const up = (event: PointerEvent) => { if (drag?.id === event.pointerId) endDrag(); };
  const wheel = (event: WheelEvent) => {
    event.preventDefault(); act(() => {
      const live = pointer(event.clientX, event.clientY), view = getRenderCameraViewSnapshot(live.camera);
      const mapping = projectRenderCameraPoint(live.camera, live.logical,
        { plane: view.configuration.source, point: view.configuration.center }, { session: live.session, receipt: live.receipt }).mapping;
      // Host chooses zoom step; Render owns focus preservation and zoom admission.
      zoomRenderCameraAtFocus(live.camera, { zoom: view.configuration.zoom * (event.deltaY < 0 ? 1.1 : 1 / 1.1),
        mapping, focus: screenPointToViewport2D(mapping, live.point) });
      host.requestFrame();
    });
  };
  const close = () => {
    if (closed) return;
    closed = true;
    for (const action of [endDrag, () => target.removeEventListener('pointerdown', down),
      () => target.removeEventListener('pointermove', move), () => target.removeEventListener('pointerup', up),
      () => target.removeEventListener('pointercancel', up), () => target.removeEventListener('lostpointercapture', up),
      () => target.removeEventListener('wheel', wheel), () => window.removeEventListener('pagehide', close), host.unmount]) {
      try { action(); } catch (error) { log('Editor unmount uncertain', getRenderVisualDiagnostic(error)); }
    }
  };
  try {
    target.addEventListener('pointerdown', down); target.addEventListener('pointermove', move);
    target.addEventListener('pointerup', up); target.addEventListener('pointercancel', up);
    target.addEventListener('lostpointercapture', up); target.addEventListener('wheel', wheel, { passive: false });
    window.addEventListener('pagehide', close);
  } catch (error) { close(); throw error; }
  return Object.freeze({ acquire: host.start, suspend: host.suspend, resume: host.resume, sync: host.sync, close,
    center(point: PlaneProjectionPoint2D) { const live = ready(); setRenderCameraCenter(live.camera, point); host.requestFrame(); },
    zoom(value: number) { const live = ready(); setRenderCameraZoom(live.camera, value); host.requestFrame(); },
    project(point: PlaneProjectionPoint2D, width?: number) {
      const live = pointer(target.getBoundingClientRect().left, target.getBoundingClientRect().top);
      const logical = width === undefined ? live.logical : { ...live.logical, width };
      const projected = projectRenderCameraPoint(live.camera, logical, point, { session: live.session, receipt: live.receipt });
      const inverse = screenToRenderCameraSelectedPlane(live.camera, logical,
        { cameraView: projected.camera, selectedPlane: point.plane, point: projected.screenPoint! },
        { session: live.session, receipt: live.receipt });
      const observation = { projected, inverse, residual: {
        x: inverse.selectedPlanePoint.point.x - point.point.x, y: inverse.selectedPlanePoint.point.y - point.point.y } };
      log('Editor world/viewport/screen inverse', observation); return observation;
    },
    bounds(targetPoint: PlaneProjectionPoint2D, bounds: RenderCameraBoundsPolicy) {
      const live = ready();
      const result = transitionRenderCameraWithinBounds(live.camera, live.logical,
        { cameraView: getRenderCameraViewSnapshot(live.camera), zoom: getRenderCameraViewSnapshot(live.camera).configuration.zoom,
          movement: { kind: 'center', target: targetPoint }, bounds }, { session: live.session, receipt: live.receipt });
      log('Editor bounds result', result); host.requestFrame(); return result;
    },
    pan(delta: { x: number; y: number }) {
      const live = ready(); panRenderCamera(live.camera, { plane: input.camera.source, delta }); host.requestFrame();
    },
    inspect: () => ({ host: host.getSnapshot(), loadState, camera: camera && getRenderCameraViewSnapshot(camera),
      binding: binding?.getSnapshot(), authored, authoredInput: input.authored,
      viewport: context && getRenderViewportSnapshot(context.session), cache: cache?.getSnapshot(),
      scene: scene && getRenderVisualSceneDiagnostics(scene),
      visuals: scene?.getSnapshot().state === 'active' ? listRenderVisualInstances(scene).map(instance => ({
        instance, transform: getRenderVisualInstanceTransform(scene!, instance), resource: getRenderVisualInstanceResource(scene!, instance) })) : [],
      candidates: scene?.getSnapshot().state === 'active' ? listRenderVisualDrawCandidates(scene) : [] }),
  });
}
