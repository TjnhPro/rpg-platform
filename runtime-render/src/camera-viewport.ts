import { getRenderCameraViewSnapshot, type RenderCamera, type RenderCameraViewSnapshot } from './camera.js';
import { captureCameraFields } from './camera-data.js';
import { requireCurrentViewportResize, type RenderFrameSession,
  type RenderViewportSnapshot, type RenderViewportResizeReceipt } from './frame-session.js';
import { createViewportMapping2D, type ViewportMapping2D, type ViewportMetrics2D } from './viewport-mapping.js';

/** Historical logical projection/configuration; never applied native camera state. */
export interface RenderCameraViewportSnapshot {
  readonly status: 'configured-not-applied';
  readonly camera: RenderCameraViewSnapshot;
  readonly viewport: RenderViewportSnapshot & { readonly state: 'active' };
  /** Issued Phase6 evidence separates requested CSS, accepted buffer and effective ratio. */
  readonly resize: RenderViewportResizeReceipt;
  /** Viewport-local CSS pixels only. No implicit DPR or host screen measurement. */
  readonly mapping: ViewportMapping2D;
}

/**
 * Pull adapter: recompute from current camera and latest accepted resize on the
 * same existing session. Preserve-scale changes visible spans, never zoom/center.
 * Host logical metrics must exactly match accepted receipt CSS extents. Reject
 * missing/stale/copied/foreign receipts, zero/invalid metrics, suspended/terminal
 * sessions and disposed/unconfigured cameras with TypeError. Canonical spatial
 * numeric failures retain RangeError. No resize, native camera, frame or mutation.
 */
export function getRenderCameraViewportSnapshot(camera: RenderCamera, session: RenderFrameSession,
  receipt: RenderViewportResizeReceipt, logical: ViewportMetrics2D): RenderCameraViewportSnapshot {
  requireCurrentViewportResize(session, receipt);
  const view = getRenderCameraViewSnapshot(camera);
  if (view.camera.state !== 'active') throw new TypeError('Camera is disposed');
  const fields = captureCameraFields(logical, ['plane', 'width', 'height', 'screen']);
  if (typeof fields.width !== 'number' || typeof fields.height !== 'number') {
    throw new TypeError('Camera logical extent must use numeric CSS dimensions');
  }
  const config = view.configuration;
  const mapping = createViewportMapping2D({ projection: { kind: 'orthographic-plane',
    source: config.source, destination: fields.plane as ViewportMetrics2D['plane'],
    sourceOrigin: config.center,
    destinationOrigin: { x: fields.width / 2, y: fields.height / 2 },
    destinationUnitsPerSourceUnit: config.effectiveCssPixelsPerSourceUnit },
  metrics: fields as unknown as ViewportMetrics2D });
  const { plane, width, height } = mapping.metrics;
  if (plane.unit !== 'css-px' || plane.projectId !== config.source.projectId
    || width !== receipt.requested.logicalWidthCssPx || height !== receipt.requested.logicalHeightCssPx) {
    throw new TypeError('Camera logical CSS context must match accepted resize metrics and project');
  }
  const ratio = receipt.effectivePixelRatio;
  if (!Number.isFinite(ratio.x) || !Number.isFinite(ratio.y) || ratio.x <= 0 || ratio.y <= 0) {
    throw new RangeError('Accepted camera buffer ratio must be finite and positive');
  }
  // Canonical capture can invoke host proxies. Recheck after every host read,
  // before returning any result; never associate an old solution with new state.
  const viewport = requireCurrentViewportResize(session, receipt);
  if (getRenderCameraViewSnapshot(camera) !== view) {
    throw new TypeError('Camera changed while capturing viewport context');
  }
  return Object.freeze({ status: 'configured-not-applied', camera: view, viewport, resize: receipt, mapping });
}
