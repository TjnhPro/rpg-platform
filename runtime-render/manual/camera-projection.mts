import { createConfiguredRenderCamera, getRenderCameraViewSnapshot, projectRenderCameraPoint,
  setRenderCameraCenter, setRenderCameraZoom, getRenderCameraViewportSnapshot,
  type OrthographicCameraConfigurationInput, type PlaneProjectionPoint2D,
  type RenderCamera, type RenderFrameSession, type RenderViewportResizeReceipt,
  type ViewportMetrics2D } from '@rpg-platform/runtime-render';

/** Finite public-root manual observations; no assertions, runner or graphics substitute. */
export function observeCameraProjection(log: (label: string, value: unknown) => void,
  readOwnedState: () => unknown = () => 'No authored/live/gameplay owner supplied'): void {
  const source = { projectId: 'camera-manual', coordinateSpaceId: 'ground', unit: 'world-unit',
    axes: { x: 'right', y: 'down' } } as const;
  const config = { kind: 'orthographic', source, center: { x: 100, y: 50 },
    scale: { unit: 'css-px-per-source-unit', x: 2, y: 2 }, zoom: 1,
    viewportPolicy: 'preserve-scale' } as const;
  const limits = { min: 0.25, max: 8 };
  const a = createConfiguredRenderCamera(config, limits), b = createConfiguredRenderCamera(config, limits);
  const up = createConfiguredRenderCamera({ ...config, source: { ...source, axes: { x: 'right', y: 'up' } } }, limits);
  const logical: ViewportMetrics2D = { plane: { ...source, coordinateSpaceId: 'viewport', unit: 'css-px' },
    width: 800, height: 450, screen: null };
  const world = (x: number, y: number): PlaneProjectionPoint2D => ({ plane: source, point: { x, y } });
  const observe = (label: string, camera: RenderCamera, point: PlaneProjectionPoint2D,
    expected: { x: number; y: number }, metrics = logical): void => {
    const result = projectRenderCameraPoint(camera, metrics, point, null);
    log(label, { expected, observed: result.viewportPoint, screen: result.screenPoint,
      absoluteError: { x: Math.abs(result.viewportPoint.point.x - expected.x),
        y: Math.abs(result.viewportPoint.point.y - expected.y) }, sampleTolerance: 1e-12,
      acceptedViewport: result.acceptedViewport,
      frozen: [result, result.mapping, result.mapping.metrics, result.viewportPoint, result.viewportPoint.point].map(Object.isFrozen) });
  };
  const attempt = (label: string, action: () => unknown): void => {
    const before = getRenderCameraViewSnapshot(a);
    try { log(label, { returned: action() }); }
    catch (error) { log(label, { thrown: error instanceof Error ? error.name : typeof error,
      message: error instanceof Error ? error.message : null,
      cameraUnchanged: getRenderCameraViewSnapshot(a) === before }); }
  };
  try {
    log('Owner before', readOwnedState());
    const history = projectRenderCameraPoint(a, logical, world(100, 50), null);
    const bBefore = getRenderCameraViewSnapshot(b);
    observe('Center', a, world(100, 50), { x: 400, y: 225 });
    observe('Right', a, world(110, 50), { x: 420, y: 225 });
    observe('Down', a, world(100, 60), { x: 400, y: 245 });
    observe('Up source', up, { plane: { ...source, axes: { x: 'right', y: 'up' } }, point: { x: 100, y: 60 } }, { x: 400, y: 205 });
    observe('Outside remains projectable', a, world(1000, 50), { x: 2200, y: 225 });
    setRenderCameraCenter(a, world(105, 50));
    const screen: ViewportMetrics2D = { ...logical, screen: {
      plane: { ...logical.plane, coordinateSpaceId: 'client' }, origin: { x: 20, y: 30 },
      screenUnitsPerViewportUnit: { x: 1, y: 1 } } };
    observe('Moved center / explicit screen410,255', a, world(100, 50), { x: 390, y: 225 }, screen);
    log('B independent after A center', { sameView: getRenderCameraViewSnapshot(b) === bBefore,
      point: projectRenderCameraPoint(b, logical, world(100, 50), null).viewportPoint });
    setRenderCameraZoom(a, 2);
    observe('Zoom after center', a, world(110, 50), { x: 420, y: 225 });
    log('History retained', { point: history.viewportPoint, center: history.camera.configuration.center });
    for (const width of [0, -1, Infinity, NaN]) attempt(`Invalid width ${width}`, () =>
      projectRenderCameraPoint(a, { ...logical, width }, world(100, 50), null));
    for (const zoom of [0, -1, Infinity, NaN]) attempt(`Invalid zoom ${zoom}`, () => setRenderCameraZoom(a, zoom));
    for (const plane of [{ ...source, coordinateSpaceId: 'unknown' }, { ...source, projectId: 'other' },
      { ...source, unit: 'css-px' }, { ...source, axes: { x: 'right', y: 'up' } }]) {
      attempt(`Source mismatch ${JSON.stringify(plane)}`, () => projectRenderCameraPoint(a, logical,
        { plane, point: { x: 100, y: 50 } } as PlaneProjectionPoint2D, null));
    }
    attempt('Device pixel viewport', () => projectRenderCameraPoint(a,
      { ...logical, plane: { ...logical.plane, unit: 'device-px' } }, world(100, 50), null));
    attempt('Finite overflow', () => projectRenderCameraPoint(a, logical, world(Number.MAX_VALUE, 50), null));
    attempt('Unsupported perspective', () => createConfiguredRenderCamera(
      { ...config, kind: 'perspective' } as unknown as OrthographicCameraConfigurationInput, limits));
    attempt('Foreign accepted session never falls back', () => projectRenderCameraPoint(a, logical, world(100, 50),
      { session: {} as RenderFrameSession, receipt: undefined as unknown as RenderViewportResizeReceipt }));
    log('Owner after', readOwnedState());
    a.dispose();
    attempt('Disposed camera', () => projectRenderCameraPoint(a, logical, world(100, 50), null));
  } finally { a.dispose(); b.dispose(); up.dispose(); }
}

/** Optional native observation: caller owns two real sessions with current issued receipts. */
export function observeAcceptedCameraProjection(cameraA: RenderCamera, sessionA: RenderFrameSession,
  receiptA: RenderViewportResizeReceipt, cameraB: RenderCamera, sessionB: RenderFrameSession,
  receiptB: RenderViewportResizeReceipt, logical: ViewportMetrics2D, point: PlaneProjectionPoint2D,
  log: (label: string, value: unknown) => void): void {
  const bBefore = getRenderCameraViewportSnapshot(cameraB, sessionB, receiptB, logical);
  log('Accepted A', projectRenderCameraPoint(cameraA, logical, point, { session: sessionA, receipt: receiptA }));
  log('Accepted B', { result: projectRenderCameraPoint(cameraB, logical, point, { session: sessionB, receipt: receiptB }),
    unchangedCamera: getRenderCameraViewSnapshot(cameraB) === bBefore.camera,
    sameReceipt: getRenderCameraViewportSnapshot(cameraB, sessionB, receiptB, logical).resize === bBefore.resize });
}
