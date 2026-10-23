import { createConfiguredRenderCamera, getRenderCameraViewSnapshot, projectRenderCameraPoint,
  viewportToRenderCameraSelectedPlane, screenToRenderCameraSelectedPlane,
  setRenderCameraCenter, setRenderCameraZoom,
  type OrthographicCameraConfigurationInput, type PlaneProjectionPoint2D, type ProjectionPlane2D,
  type RenderCamera, type RenderFrameSession, type RenderViewportResizeReceipt,
  type ViewportMetrics2D } from '@rpg-platform/runtime-render';

/** Finite manual public-root logs, no assertions, runner or backend substitute. */
export function observeCameraInverse(log: (label: string, value: unknown) => void,
  readOwnedState: () => unknown = () => 'No authored/live/gameplay owner supplied'): void {
  const source = { projectId: 'camera-manual', coordinateSpaceId: 'ground', unit: 'world-unit',
    axes: { x: 'right', y: 'down' } } as const;
  const config = { kind: 'orthographic', source, center: { x: 100, y: 50 },
    scale: { unit: 'css-px-per-source-unit', x: 2, y: 2 }, zoom: 1,
    viewportPolicy: 'preserve-scale' } as const;
  const limits = { min: 0.25, max: 8 };
  const a = createConfiguredRenderCamera(config, limits), b = createConfiguredRenderCamera(config, limits);
  const logical: ViewportMetrics2D = { plane: { ...source, coordinateSpaceId: 'viewport', unit: 'css-px' },
    width: 800, height: 450, screen: null };
  const pixel = { plane: logical.plane, point: { x: 420, y: 245 } };
  const request = () => ({ cameraView: getRenderCameraViewSnapshot(a), selectedPlane: source, point: pixel });
  const attempt = (label: string, action: () => unknown): void => {
    const before = getRenderCameraViewSnapshot(a);
    try { log(label, { returned: action() }); }
    catch (error) { log(label, { thrown: error instanceof Error ? error.name : typeof error,
      message: error instanceof Error ? error.message : null,
      cameraUnchanged: getRenderCameraViewSnapshot(a) === before }); }
  };
  const roundtrip = (label: string, camera: RenderCamera, metrics: ViewportMetrics2D,
    world: PlaneProjectionPoint2D, screen: boolean): void => {
    const projected = projectRenderCameraPoint(camera, metrics, world, null);
    const point = screen ? projected.screenPoint : projected.viewportPoint;
    if (point === null) throw new TypeError('Manual screen route requires explicit mapping');
    const input = { cameraView: projected.camera, selectedPlane: world.plane, point };
    const recovered = screen ? screenToRenderCameraSelectedPlane(camera, metrics, input, null)
      : viewportToRenderCameraSelectedPlane(camera, metrics, input, null);
    log(label, { expected: world, viewport: projected.viewportPoint, screen: projected.screenPoint,
      observed: recovered.selectedPlanePoint,
      absoluteError: { x: Math.abs(recovered.selectedPlanePoint.point.x - world.point.x),
        y: Math.abs(recovered.selectedPlanePoint.point.y - world.point.y) }, sampleTolerance: 1e-12,
      frozen: [recovered, recovered.mapping, recovered.selectedPlanePoint, recovered.selectedPlanePoint.point].map(Object.isFrozen),
      acceptedViewport: recovered.acceptedViewport });
  };
  try {
    log('Owner before', readOwnedState());
    roundtrip('Viewport roundtrip', a, logical, { plane: source, point: { x: 110, y: 60 } }, false);
    attempt('Missing screen geometry', () => screenToRenderCameraSelectedPlane(a, logical, request(), null));
    const screen: ViewportMetrics2D = { ...logical, screen: {
      plane: { ...logical.plane, coordinateSpaceId: 'client' }, origin: { x: 20, y: 30 },
      screenUnitsPerViewportUnit: { x: 2, y: 2 } } };
    roundtrip('Screen roundtrip explicit origin20,30 scale2', a, screen, { plane: source, point: { x: 110, y: 60 } }, true);
    roundtrip('Offviewport roundtrip', a, logical, { plane: source, point: { x: 1000, y: -500 } }, false);
    const up = createConfiguredRenderCamera({ ...config, source: { ...source, axes: { x: 'right', y: 'up' } } }, limits);
    try { roundtrip('Up-axis roundtrip', up, logical,
      { plane: { ...source, axes: { x: 'right', y: 'up' } }, point: { x: 110, y: 60 } }, false); }
    finally { up.dispose(); }
    for (const selectedPlane of [{ ...source, coordinateSpaceId: 'unknown' }, { ...source, projectId: 'other' },
      { ...source, unit: 'css-px' }, { ...source, axes: { x: 'right', y: 'up' } }]) {
      attempt(`Selected plane mismatch ${JSON.stringify(selectedPlane)}`, () => viewportToRenderCameraSelectedPlane(a,
        logical, { ...request(), selectedPlane: selectedPlane as ProjectionPlane2D }, null));
    }
    attempt('Wrong input viewport plane', () => viewportToRenderCameraSelectedPlane(a, logical,
      { ...request(), point: { ...pixel, plane: { ...logical.plane, coordinateSpaceId: 'other' } } }, null));
    attempt('Other camera view', () => viewportToRenderCameraSelectedPlane(a, logical,
      { ...request(), cameraView: getRenderCameraViewSnapshot(b) }, null));
    attempt('Copied camera view', () => viewportToRenderCameraSelectedPlane(a, logical,
      { ...request(), cameraView: { ...getRenderCameraViewSnapshot(a) } }, null));
    const old = request(), bBefore = getRenderCameraViewSnapshot(b);
    setRenderCameraZoom(a, 2);
    attempt('Stale view after zoom only', () => viewportToRenderCameraSelectedPlane(a, logical, old, null));
    log('B independent', { sameView: bBefore === getRenderCameraViewSnapshot(b),
      result: viewportToRenderCameraSelectedPlane(b, logical,
        { ...old, cameraView: bBefore }, null).selectedPlanePoint });
    setRenderCameraCenter(a, { plane: source, point: { x: 105, y: 50 } });
    roundtrip('Current pan zoom roundtrip', a, logical, { plane: source, point: { x: 110, y: 60 } }, false);
    for (const width of [0, -1, Infinity]) attempt(`Invalid width ${width}`, () =>
      viewportToRenderCameraSelectedPlane(a, { ...logical, width }, request(), null));
    attempt('Nonfinite point', () => viewportToRenderCameraSelectedPlane(a, logical,
      { ...request(), point: { ...pixel, point: { x: Infinity, y: 245 } } }, null));
    attempt('Invalid zoom', () => setRenderCameraZoom(a, 0));
    attempt('Zero projection ratio', () => createConfiguredRenderCamera({ ...config,
      scale: { ...config.scale, x: 0 } } as OrthographicCameraConfigurationInput, limits));
    const ill = createConfiguredRenderCamera({ ...config, scale: { ...config.scale, x: 2e-12 } }, limits);
    try { attempt('Ratio cutoff equality1e-12', () => viewportToRenderCameraSelectedPlane(ill, logical,
      { ...request(), cameraView: getRenderCameraViewSnapshot(ill) }, null)); }
    finally { ill.dispose(); }
    const cancellation = createConfiguredRenderCamera({ ...config, center: { x: 1e20, y: 50 } }, limits);
    try { attempt('Destination residual cancellation', () => viewportToRenderCameraSelectedPlane(cancellation, logical,
      { ...request(), cameraView: getRenderCameraViewSnapshot(cancellation) }, null)); }
    finally { cancellation.dispose(); }
    attempt('Foreign accepted session', () => viewportToRenderCameraSelectedPlane(a, logical, request(),
      { session: {} as RenderFrameSession, receipt: undefined as unknown as RenderViewportResizeReceipt }));
    log('Owner after', readOwnedState());
    const terminalRequest = request(); a.dispose();
    attempt('Disposed camera', () => viewportToRenderCameraSelectedPlane(a, logical, terminalRequest, null));
  } finally { a.dispose(); b.dispose(); }
}

/** Optional caller-owned real accepted context; no acquisition or fake receipt here. */
export function observeAcceptedCameraInverse(camera: RenderCamera, session: RenderFrameSession,
  receipt: RenderViewportResizeReceipt, logical: ViewportMetrics2D, point: PlaneProjectionPoint2D,
  log: (label: string, value: unknown) => void): void {
  const view = getRenderCameraViewSnapshot(camera);
  log('Native selected plane inverse', viewportToRenderCameraSelectedPlane(camera, logical,
    { cameraView: view, selectedPlane: view.configuration.source, point }, { session, receipt }));
}
