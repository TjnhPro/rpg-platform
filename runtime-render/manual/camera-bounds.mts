import { createConfiguredRenderCamera, getRenderCameraViewSnapshot,
  transitionRenderCameraWithinBounds, panRenderCamera, setRenderCameraZoom, viewportToRenderCameraSelectedPlane,
  type RenderCameraBoundsPolicy, type RenderCameraBoundsMovement,
  type RenderCameraBoundsTransitionInput, type RenderCamera,
  type RenderFrameSession, type RenderViewportResizeReceipt, type ViewportMetrics2D,
} from '@rpg-platform/runtime-render';

/** Finite manual logs through public root, no assertions/suite/backend substitutes. */
export function observeCameraBounds(log: (label: string, value: unknown) => void,
  readOwnedState: () => unknown = () => 'No live authored/gameplay consumer supplied'): void {
  const plane = { projectId: 'camera-manual', coordinateSpaceId: 'ground', unit: 'world-unit',
    axes: { x: 'right', y: 'down' } } as const;
  const config = { kind: 'orthographic', source: plane, center: { x: 500, y: 300 },
    scale: { unit: 'css-px-per-source-unit', x: 2, y: 2 }, zoom: 1, viewportPolicy: 'preserve-scale' } as const;
  const limits = { min: 0.01, max: 8 };
  const a = createConfiguredRenderCamera(config, limits), b = createConfiguredRenderCamera(config, limits);
  const logical: ViewportMetrics2D = { plane: { ...plane, coordinateSpaceId: 'viewport', unit: 'css-px' },
    width: 200, height: 100, screen: null };
  const bounds = { kind: 'rectangle', plane, min: { x: 0, y: 0 }, max: { x: 1000, y: 600 },
    movement: 'clamp', oversized: 'reject' } as const;
  const center = (x: number, y: number): RenderCameraBoundsMovement => ({ kind: 'center', target: { plane, point: { x, y } } });
  const request = (movement: RenderCameraBoundsMovement, policy: RenderCameraBoundsPolicy = bounds,
    zoom = getRenderCameraViewSnapshot(a).configuration.zoom): RenderCameraBoundsTransitionInput =>
    ({ cameraView: getRenderCameraViewSnapshot(a), movement, bounds: policy, zoom });
  const observe = (label: string, action: () => unknown): void => {
    const before = getRenderCameraViewSnapshot(a);
    try {
      const result = action();
      log(label, { result, sameView: getRenderCameraViewSnapshot(a) === before });
    } catch (error) { log(label, { thrown: error instanceof Error ? error.name : typeof error,
      message: error instanceof Error ? error.message : null, sameView: getRenderCameraViewSnapshot(a) === before }); }
  };
  const move = (label: string, input: RenderCameraBoundsTransitionInput, metrics = logical, camera: RenderCamera = a): void => {
    observe(label, () => {
      const r = transitionRenderCameraWithinBounds(camera, metrics, input, null);
      return { status: r.status, reason: r.reason, containment: r.containment, span: r.visibleSpan,
        center: r.view.configuration.center, zoom: r.view.configuration.zoom,
        cameraRevisionDelta: r.view.camera.revision - r.before.camera.revision,
        viewRevisionDelta: r.view.revision - r.before.revision,
        frozen: [r, r.view, r.bounds, r.metrics, r.visibleSpan].map(Object.isFrozen) };
    });
  };
  try {
    log('Owner before', readOwnedState());
    const bBefore = getRenderCameraViewSnapshot(b);
    move('Pan beyond edges expected center950,25 span100,50', request({ kind: 'pan', request: { plane, delta: { x: 1000, y: -1000 } } }));
    log('Contained viewport corners expected900,0 and1000,50', [{ x: 0, y: 0 }, { x: 200, y: 100 }].map(point =>
      viewportToRenderCameraSelectedPlane(a, logical, { cameraView: getRenderCameraViewSnapshot(a),
        selectedPlane: plane, point: { plane: logical.plane, point } }, null).selectedPlanePoint));
    move('Reject beyond edge preserves center and zoom', request(center(2000, 300), { ...bounds, movement: 'reject' }, 2));
    move('Clamp target zoom2 expected975,300 span50,25 one atomic revision', request(center(2000, 300), bounds, 2));
    move('Noop at clamped edge expected unchanged', request(center(2000, 300), bounds, 2));
    move('Zoom out impossible strict expected rejected same zoom2', request(center(500, 300), bounds, 0.05));
    const tiny = { ...bounds, max: { x: 80, y: 30 }, oversized: 'center' } as const;
    move('Oversized both axes expected40,15 span100,50 oversize', request(center(999, -999), tiny, 1));
    move('Repeat oversized expected unchanged', request(center(999, -999), tiny, 1));
    move('Oversized x only expected40,25', request(center(999, -999), { ...bounds, max: { x: 80, y: 600 }, oversized: 'center' }, 1));
    move('Viewport grows strict reject no teleport', request(center(500, 300)), { ...logical, width: 4000 });
    move('Viewport grows explicit center expected500,300 span2000,50', request(center(500, 300), { ...bounds, oversized: 'center' }),
      { ...logical, width: 4000 });
    move('Explicit disabled bounds expected unrestricted2000,-2000', request(center(2000, -2000), { kind: 'disabled' }));
    panRenderCamera(a, { plane, delta: { x: 500, y: -500 } });
    log('Old unbounded pan remains outside map expected2500,-2500', getRenderCameraViewSnapshot(a).configuration.center);
    const stale = request(center(500, 300));
    setRenderCameraZoom(a, 2);
    move('Stale bounds request after zoom rejects', stale);
    move('Copied view rejects', { ...request(center(500, 300)), cameraView: { ...getRenderCameraViewSnapshot(a) } });
    move('Other camera view rejects', { ...request(center(500, 300)), cameraView: getRenderCameraViewSnapshot(b) });
    move('Bounds wrong plane', request(center(500, 300), { ...bounds, plane: { ...plane, coordinateSpaceId: 'other' } }));
    move('Bounds wrong unit', request(center(500, 300), { ...bounds, plane: { ...plane, unit: 'css-px' } }));
    move('Bounds wrong axes', request(center(500, 300), { ...bounds, plane: { ...plane, axes: { x: 'right', y: 'up' } } }));
    move('Bounds wrong project', request(center(500, 300), { ...bounds, plane: { ...plane, projectId: 'other' } }));
    move('Bounds inverted', request(center(500, 300), { ...bounds, min: { x: 1000, y: 0 } }));
    move('Nonfinite bounds', request(center(500, 300), { ...bounds, max: { x: Infinity, y: 600 } }));
    move('Invalid zoom0', request(center(500, 300), bounds, 0));
    for (const width of [0, -1, Infinity]) move(`Invalid viewport width${width}`, request(center(500, 300)), { ...logical, width });
    observe('Foreign accepted context rejects', () => transitionRenderCameraWithinBounds(a, logical, request(center(500, 300)),
      { session: {} as RenderFrameSession, receipt: undefined as unknown as RenderViewportResizeReceipt }));
    const up = createConfiguredRenderCamera({ ...config, source: { ...plane, axes: { x: 'left', y: 'up' } },
      scale: { unit: 'css-px-per-source-unit', x: 2, y: 4 } }, limits);
    try { move('Left up asymmetric scale expected950,12.5 span100,25', {
      cameraView: getRenderCameraViewSnapshot(up), zoom: 1,
      movement: { kind: 'center', target: { plane: up.getSnapshot().source, point: { x: 9999, y: -9999 } } },
      bounds: { ...bounds, plane: up.getSnapshot().source } }, logical, up); }
    finally { up.dispose(); }
    log('B unchanged after all A transitions', { sameView: bBefore === getRenderCameraViewSnapshot(b), center: bBefore.configuration.center });
    log('Owner after', readOwnedState());
    a.dispose();
    move('Disposed rejects', request(center(500, 300)));
  } finally { a.dispose(); b.dispose(); }
}
