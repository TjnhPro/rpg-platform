import { getRenderCameraViewSnapshot, type RenderCamera, type RenderCameraViewSnapshot } from './camera.js';
import { captureCameraFields } from './camera-data.js';
import { captureCameraViewportMapping, getRenderCameraViewportSnapshot,
  type RenderCameraViewportSnapshot } from './camera-viewport.js';
import type { RenderFrameSession, RenderViewportResizeReceipt } from './frame-session.js';
import type { PlaneProjectionPoint2D } from './plane-projection.js';
import { projectPointToViewport2D, viewportPointToScreen2D,
  type ViewportMetrics2D, type ViewportMapping2D } from './viewport-mapping.js';

/** Immutable CPU projection observation. Points are not visibility/display evidence. */
export interface RenderCameraProjectionResult {
  readonly camera: RenderCameraViewSnapshot;
  readonly mapping: ViewportMapping2D;
  readonly viewportPoint: PlaneProjectionPoint2D;
  /** Null unless host supplied an explicit screen plane, origin and scale. */
  readonly screenPoint: PlaneProjectionPoint2D | null;
  /** Null means explicit logical-only math, never accepted backend configuration. */
  readonly acceptedViewport: RenderCameraViewportSnapshot | null;
}

/**
 * One camera world/scene -> viewport CSS -> optional screen path through Phase4.
 * The last argument is required: null selects logical-only CPU math; otherwise
 * the exact current session/resize receipt must pass v0.9.5 admission. No fallback
 * from a rejected accepted context. Validate exact source plane/unit/axes, finite
 * numbers and current camera both before and after host capture. Off-viewport is
 * valid, not clamped/culled. No mutation, device ratio, GPU or implied screen origin.
 */
export function projectRenderCameraPoint(camera: RenderCamera, logical: ViewportMetrics2D,
  point: PlaneProjectionPoint2D, accepted: {
    readonly session: RenderFrameSession;
    readonly receipt: RenderViewportResizeReceipt;
  } | null): RenderCameraProjectionResult {
  const context = captureRenderCameraProjectionContext(camera, logical, accepted);
  const { view, mapping, acceptedViewport } = context;
  const viewportPoint = projectPointToViewport2D(mapping, point);
  const screenPoint = mapping.metrics.screen === null ? null : viewportPointToScreen2D(mapping, viewportPoint);
  context.requireCurrent();
  return Object.freeze({ camera: view, mapping, viewportPoint, screenPoint, acceptedViewport });
}

/** Owner-local forward/inverse admission, not a new root contract or native binder. */
export function captureRenderCameraProjectionContext(camera: RenderCamera, logical: ViewportMetrics2D,
  accepted: { readonly session: RenderFrameSession; readonly receipt: RenderViewportResizeReceipt } | null) {
  const context = accepted === null ? null : captureCameraFields(accepted, ['session', 'receipt']);
  const session = context?.session as RenderFrameSession;
  const receipt = context?.receipt as RenderViewportResizeReceipt;
  const acceptedViewport = context === null ? null : getRenderCameraViewportSnapshot(camera, session, receipt, logical);
  const view = acceptedViewport?.camera ?? getRenderCameraViewSnapshot(camera);
  if (view.camera.state !== 'active') throw new TypeError('Camera is disposed');
  const mapping = acceptedViewport?.mapping ?? captureCameraViewportMapping(view, logical);
  // Point/plane proxies may change camera, resize or end a session during capture.
  // Recheck exact accepted evidence; never silently switch to pure math or return
  // the old solution as current. Re-read only already captured logical metrics.
  const requireCurrent = (): void => {
    if (context !== null) getRenderCameraViewportSnapshot(camera, session, receipt, mapping.metrics);
    if (getRenderCameraViewSnapshot(camera) !== view) {
      throw new TypeError('Camera changed while capturing projection context');
    }
  };
  return { view, mapping, acceptedViewport, requireCurrent };
}
