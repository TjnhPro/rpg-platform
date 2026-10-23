import { createConfiguredRenderCamera, getRenderCameraViewSnapshot, setRenderCameraZoom,
  setRenderCameraCenter, projectRenderCameraPoint, viewportToRenderCameraSelectedPlane,
  createRenderCameraGroundConfiguration, viewportToRenderCameraGround,
  transitionRenderCameraWithinBounds, createOrthographicPlaneProjection, projectPlanePoint2D,
  createRenderSessionLifecycle, getRenderFailure, getRenderFrameFailure, getRenderVisualDiagnostic,
  type RenderFrameFailure, type RenderCameraGroundInverseInput,
  type OrthographicCameraConfigurationInput, type ViewportMetrics2D } from '@rpg-platform/runtime-render';

/** Finite public-root manual observations, no assertions or simulated backend. */
export function observeCameraDiagnostics(log: (label: string, value: unknown) => void): void {
  const source = { projectId: 'camera-diagnostics', coordinateSpaceId: 'ground', unit: 'scene-unit',
    axes: { x: 'right', y: 'down' } } as const;
  const config = { kind: 'orthographic', source, center: { x: 160, y: 120 },
    scale: { unit: 'css-px-per-source-unit', x: 1, y: 1 }, zoom: 1, viewportPolicy: 'preserve-scale' } as const;
  const limits = { min: 0.1, max: 10 };
  const a = createConfiguredRenderCamera(config, limits), b = createConfiguredRenderCamera(config, limits);
  const bBefore = getRenderCameraViewSnapshot(b);
  const logical: ViewportMetrics2D = { plane: { ...source, coordinateSpaceId: 'css', unit: 'css-px' },
    width: 320, height: 240, screen: null };
  const point = { plane: source, point: { x: 160, y: 120 } };
  const attempt = (label: string, action: () => unknown): void => {
    const before = getRenderCameraViewSnapshot(a);
    try { log(label, { returned: action(), sameView: before === getRenderCameraViewSnapshot(a) }); }
    catch (error) { log(label, { type: error instanceof Error ? error.name : typeof error,
      message: error instanceof Error ? error.message : null,
      frame: getRenderFrameFailure(error) ?? null, session: getRenderFailure(error) ?? null,
      safe: getRenderVisualDiagnostic(error), sameView: before === getRenderCameraViewSnapshot(a),
      revisionBefore: before.revision, revisionAfter: getRenderCameraViewSnapshot(a).revision }); }
  };
  try {
    attempt('Unsupported perspective', () => createConfiguredRenderCamera({ ...config,
      kind: 'perspective' } as unknown as OrthographicCameraConfigurationInput, limits));
    attempt('Invalid center', () => setRenderCameraCenter(a, { plane: source, point: { x: Infinity, y: 0 } }));
    attempt('Invalid zoom', () => setRenderCameraZoom(a, 0));
    attempt('Unknown plane', () => projectRenderCameraPoint(a, logical,
      { ...point, plane: { ...source, coordinateSpaceId: 'unknown' } }, null));
    attempt('Invalid dimensions', () => projectRenderCameraPoint(a, { ...logical, width: 0 }, point, null));
    const bounds = { kind: 'rectangle', plane: source, min: { x: 0, y: 0 }, max: { x: 1000, y: 1000 },
      movement: 'reject', oversized: 'reject' } as const;
    const request = { cameraView: getRenderCameraViewSnapshot(a), zoom: 2,
      movement: { kind: 'center', target: { plane: source, point: { x: 2000, y: 2000 } } }, bounds } as const;
    attempt('Invalid inverted bounds', () => transitionRenderCameraWithinBounds(a, logical,
      { ...request, bounds: { ...bounds, min: { x: 2000, y: 0 } } }, null));
    attempt('Outside bounds structured rejection', () => {
      const r = transitionRenderCameraWithinBounds(a, logical, request, null);
      return { status: r.status, reason: r.reason, containment: r.containment };
    });
    const ill = createConfiguredRenderCamera({ ...config, scale: { ...config.scale, x: 1e-13 } }, limits);
    try { attempt('Inverse ratio degeneracy', () => viewportToRenderCameraSelectedPlane(ill, logical,
      { cameraView: getRenderCameraViewSnapshot(ill), selectedPlane: source,
        point: { plane: logical.plane, point: { x: 160, y: 120 } } }, null)); }
    finally { ill.dispose(); }
    const ground = createRenderCameraGroundConfiguration({ kind: 'affine-ground-elevation',
      groundPlane: source, presentationPlane: source, groundOrigin: { x: 0, y: 0 }, presentationOrigin: { x: 0, y: 0 },
      basis: { x: { x: 1, y: 0 }, y: { x: 0, y: 1 } }, elevation: { unit: 'height', displacement: { x: 0, y: -1 } } });
    attempt('Underdetermined inverse missing height', () => viewportToRenderCameraGround(a, logical, ground,
      { cameraView: getRenderCameraViewSnapshot(a), point: { plane: logical.plane, point: { x: 160, y: 120 } } } as RenderCameraGroundInverseInput, null));
    // Original Phase4 consumer, independent of camera or GPU acquisition.
    const projection = createOrthographicPlaneProjection({ kind: 'orthographic-plane', source,
      destination: logical.plane, sourceOrigin: { x: 10, y: 20 }, destinationOrigin: { x: 100, y: 200 },
      destinationUnitsPerSourceUnit: { x: 2, y: 3 } });
    log('Phase4 legacy expected104,209', projectPlanePoint2D(projection, { plane: source, point: { x: 12, y: 23 } }));
    // Real binding-only lifecycle, no native target or fake graphics session.
    const lifecycle = createRenderSessionLifecycle({ target: {} });
    lifecycle.initialize(); lifecycle.dispose();
    attempt('Phase6 legacy session diagnostic', () => lifecycle.getSnapshot());
    log('Unknown host failure remains unknown', getRenderVisualDiagnostic(new Error('private host detail')));
    a.dispose();
    attempt('After-dispose zoom', () => setRenderCameraZoom(a, 2));
    log('Repeated disposal identity', { same: a.dispose() === a.getSnapshot() });
    log('Independent B after A failures/disposal', { sameView: bBefore === getRenderCameraViewSnapshot(b),
      point: projectRenderCameraPoint(b, logical, point, null).viewportPoint.point });
  } finally { a.dispose(); b.dispose(); }
}

/** Original Phase6 exhaustive consumer compiles unchanged; no fabricated error. */
export function describeLegacyFrameFailure(failure: RenderFrameFailure): string {
  switch (failure.code) {
    case 'UNSUPPORTED_TARGET': case 'TARGET_IN_USE': case 'GRAPHICS_UNAVAILABLE':
    case 'ACQUISITION_FAILED': case 'CONTEXT_LOST': case 'FRAME_FAILED': case 'CLEANUP_FAILED':
    case 'RESIZE_FAILED': case 'VIEWPORT_SUSPENDED': case 'FRAME_IN_PROGRESS': case 'FRAME_NOT_SUBMITTED':
      return `${failure.code}:${failure.stage}:${failure.cleanupFailed}`;
    default: { const unsupported: never = failure.code; return unsupported; }
  }
}
