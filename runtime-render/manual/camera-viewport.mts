import { beginRenderFrameSession, createConfiguredRenderCamera, getRenderCameraViewSnapshot,
  getRenderCameraViewportSnapshot, projectPointToViewport2D, resizeRenderViewport,
  suspendRenderViewport, resumeRenderViewport, getRenderViewportSnapshot,
  type RenderHostBinding, type RenderFrameSession, type RenderViewportResizeReceipt,
  type ViewportMetrics2D } from '@rpg-platform/runtime-render';

/** Finite optional manual browser consumer; real canonical sessions, no assertions/runner. */
export async function observeCameraViewport(hostA: RenderHostBinding, hostB: RenderHostBinding,
  log: (label: string, value: unknown) => void,
  readOwnedState: () => unknown = () => 'No authored/live owner supplied'): Promise<void> {
  const source = { projectId: 'camera-manual', coordinateSpaceId: 'ground', unit: 'world-unit',
    axes: { x: 'right', y: 'down' } } as const;
  const config = { kind: 'orthographic', source, center: { x: 100, y: 50 },
    scale: { unit: 'css-px-per-source-unit', x: 2, y: 2 }, zoom: 1,
    viewportPolicy: 'preserve-scale' } as const;
  const a = createConfiguredRenderCamera(config, { min: 0.25, max: 8 });
  const b = createConfiguredRenderCamera(config, { min: 0.25, max: 8 });
  const before = getRenderCameraViewSnapshot(a), bBefore = getRenderCameraViewSnapshot(b);
  const plane = { projectId: source.projectId, coordinateSpaceId: 'viewport', unit: 'css-px',
    axes: { x: 'right', y: 'down' } } as const;
  const logical = (width: number, height: number): ViewportMetrics2D => ({ plane, width, height, screen: null });
  const limits = { maxWidthPixels: 4096, maxHeightPixels: 4096, maxPixelCount: 4_000_000 };
  let sessionA: RenderFrameSession | undefined, sessionB: RenderFrameSession | undefined;
  const attempt = (label: string, action: () => unknown): void => {
    try { log(label, { returned: action() }); }
    catch (error) { log(label, { thrown: error instanceof Error ? error.name : typeof error,
      message: error instanceof Error ? error.message : null,
      cameraUnchanged: getRenderCameraViewSnapshot(a) === before }); }
  };
  try {
    log('Owner before', readOwnedState());
    sessionA = await beginRenderFrameSession(hostA).result;
    sessionB = await beginRenderFrameSession(hostB).result;
    const sa = sessionA, sb = sessionB;
    const metrics1 = { logicalWidthCssPx: 800, logicalHeightCssPx: 450, requestedPixelRatio: 1 };
    const rb = resizeRenderViewport(sb, metrics1, limits);
    const vb = getRenderCameraViewportSnapshot(b, sb, rb, logical(800, 450));
    const r1 = resizeRenderViewport(sa, metrics1, limits);
    const v1 = getRenderCameraViewportSnapshot(a, sa, r1, logical(800, 450));
    const r2 = resizeRenderViewport(sa, { ...metrics1, requestedPixelRatio: 2 }, limits);
    const v2 = getRenderCameraViewportSnapshot(a, sa, r2, logical(800, 450));
    const center = { plane: source, point: config.center };
    log('DPR1 vs2', { css1: projectPointToViewport2D(v1.mapping, center),
      css2: projectPointToViewport2D(v2.mapping, center), accepted1: r1.size, accepted2: r2.size,
      ratio1: r1.effectivePixelRatio, ratio2: r2.effectivePixelRatio,
      sameSession: r1.sessionId === r2.sessionId, sameCamera: v1.camera.camera.id === v2.camera.camera.id });
    attempt('Stale previous receipt', () => getRenderCameraViewportSnapshot(a, sa, r1, logical(800, 450)));
    attempt('Other session receipt', () => getRenderCameraViewportSnapshot(a, sa, rb, logical(800, 450)));
    attempt('Copied receipt', () => getRenderCameraViewportSnapshot(a, sa, { ...r2 }, logical(800, 450)));
    attempt('Missing receipt', () => getRenderCameraViewportSnapshot(a, sa, undefined as unknown as RenderViewportResizeReceipt, logical(800, 450)));
    attempt('Zero logical extent', () => getRenderCameraViewportSnapshot(a, sa, r2, logical(0, 450)));
    attempt('Negative logical extent', () => getRenderCameraViewportSnapshot(a, sa, r2, logical(-1, 450)));
    attempt('Nonfinite logical extent', () => getRenderCameraViewportSnapshot(a, sa, r2, logical(Infinity, 450)));
    attempt('Mismatched logical extent', () => getRenderCameraViewportSnapshot(a, sa, r2, logical(600, 400)));
    attempt('Device plane confusion', () => getRenderCameraViewportSnapshot(a, sa, r2,
      { ...logical(800, 450), plane: { ...plane, unit: 'device-px' } }));
    attempt('Other project', () => getRenderCameraViewportSnapshot(a, sa, r2,
      { ...logical(800, 450), plane: { ...plane, projectId: 'other' } }));
    const r3 = resizeRenderViewport(sa, { ...metrics1, logicalWidthCssPx: 600, logicalHeightCssPx: 400,
      requestedPixelRatio: 2 }, limits);
    const v3 = getRenderCameraViewportSnapshot(a, sa, r3, logical(600, 400));
    log('Resize600x400', { center: projectPointToViewport2D(v3.mapping, center), accepted: r3.size,
      scale: v3.mapping.projection.destinationUnitsPerSourceUnit, cameraUnchanged: v3.camera === before });
    const r4 = resizeRenderViewport(sa, r3.requested, limits);
    log('Unchanged resize still new token', r4.status);
    attempt('Stale equal-size receipt', () => getRenderCameraViewportSnapshot(a, sa, r3, logical(600, 400)));
    suspendRenderViewport(sa);
    attempt('Hidden/suspended', () => getRenderCameraViewportSnapshot(a, sa, r4, logical(600, 400)));
    const resumed = resumeRenderViewport(sa, r4.requested, limits);
    log('Resumed same session', getRenderCameraViewportSnapshot(a, sa, resumed, logical(600, 400)));
    log('Independent B', { viewport: getRenderViewportSnapshot(sb), receiptStillCurrent:
      getRenderCameraViewportSnapshot(b, sb, rb, logical(800, 450)).resize === vb.resize,
      cameraUnchanged: getRenderCameraViewSnapshot(b) === bBefore });
    log('Owner after', readOwnedState());
    a.dispose();
    attempt('Disposed camera', () => getRenderCameraViewportSnapshot(a, sa, resumed, logical(600, 400)));
    sa.dispose();
    attempt('Disposed session', () => getRenderCameraViewportSnapshot(b, sa, resumed, logical(600, 400)));
    log('Historical observation', { status: v1.status, mapping: v1.mapping,
      frozen: [v1, v1.mapping, v1.mapping.metrics, v1.resize, v1.resize.requested].map(Object.isFrozen) });
  } finally {
    try { sessionA?.dispose(); } finally { try { sessionB?.dispose(); } finally { a.dispose(); b.dispose(); } }
  }
}

/** Actual Node-compatible negative observation; never fabricates native acceptance. */
export function observeForeignCameraViewport(log: (label: string, value: unknown) => void): void {
  const camera = createConfiguredRenderCamera({ kind: 'orthographic',
    source: { projectId: 'headless', coordinateSpaceId: 'ground', unit: 'unit', axes: { x: 'right', y: 'down' } },
    center: { x: 100, y: 50 }, scale: { unit: 'css-px-per-source-unit', x: 2, y: 2 },
    zoom: 1, viewportPolicy: 'preserve-scale' }, { min: 0.25, max: 8 });
  const before = getRenderCameraViewSnapshot(camera);
  try {
    getRenderCameraViewportSnapshot(camera, {} as RenderFrameSession,
      undefined as unknown as RenderViewportResizeReceipt, undefined as unknown as ViewportMetrics2D);
  } catch (error) {
    log('Foreign session rejected before receipt/metrics', { thrown: error instanceof Error ? error.name : typeof error,
      message: error instanceof Error ? error.message : null, cameraUnchanged: before === getRenderCameraViewSnapshot(camera) });
  } finally { camera.dispose(); }
}
