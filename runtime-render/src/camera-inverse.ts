import { type RenderCamera, type RenderCameraViewSnapshot } from './camera.js';
import { captureCameraFields } from './camera-data.js';
import { captureRenderCameraProjectionContext } from './camera-projection.js';
import type { RenderCameraViewportSnapshot } from './camera-viewport.js';
import type { RenderFrameSession, RenderViewportResizeReceipt } from './frame-session.js';
import { captureSourcePlanePoint2D, type PlaneProjectionPoint2D, type ProjectionPlane2D } from './plane-projection.js';
import { screenPointToViewport2D, viewportPointToPlane2D,
  type ViewportMapping2D, type ViewportMetrics2D } from './viewport-mapping.js';

/** Explicit source selection and exact current issued camera view (not a copied revision). */
export interface RenderCameraSelectedPlaneInput {
  readonly cameraView: RenderCameraViewSnapshot;
  readonly selectedPlane: ProjectionPlane2D;
  readonly point: PlaneProjectionPoint2D;
}

/** Constrained 2D observation, never arbitrary 3D height, picking or visibility. */
export interface RenderCameraSelectedPlaneResult {
  readonly camera: RenderCameraViewSnapshot;
  readonly mapping: ViewportMapping2D;
  readonly selectedPlanePoint: PlaneProjectionPoint2D;
  readonly acceptedViewport: RenderCameraViewportSnapshot | null;
}

function toSelectedPlane(camera: RenderCamera, logical: ViewportMetrics2D,
  input: RenderCameraSelectedPlaneInput,
  accepted: { readonly session: RenderFrameSession; readonly receipt: RenderViewportResizeReceipt } | null,
  screen: boolean): RenderCameraSelectedPlaneResult {
  const fields = captureCameraFields(input, ['cameraView', 'selectedPlane', 'point']);
  const context = captureRenderCameraProjectionContext(camera, logical, accepted);
  if (fields.cameraView !== context.view) throw new TypeError('Selected-plane inverse requires the current issued camera view');
  // Reuse scoped source admission; the known center only witnesses plane identity,
  // never guesses an elevation or substitutes for the requested inverse point.
  captureSourcePlanePoint2D(context.view.configuration.source, {
    plane: fields.selectedPlane as ProjectionPlane2D, point: context.view.configuration.center });
  const point = fields.point as PlaneProjectionPoint2D;
  const viewportPoint = screen ? screenPointToViewport2D(context.mapping, point) : point;
  const selectedPlanePoint = viewportPointToPlane2D(context.mapping, viewportPoint);
  context.requireCurrent();
  return Object.freeze({ camera: context.view, mapping: context.mapping,
    selectedPlanePoint, acceptedViewport: context.acceptedViewport });
}

/**
 * Viewport-local CSS -> exact selected source plane through Phase4 inverse.
 * Required null context explicitly means logical-only CPU math; otherwise the
 * current real Phase6 session/receipt must pass v0.9.5. Never silent fallback.
 * Same ratio cutoff/residual/binary64 policy as viewportPointToPlane2D; no clamp.
 * TypeError for invalid/stale/mismatched context; RangeError for numeric limits.
 */
export function viewportToRenderCameraSelectedPlane(camera: RenderCamera, logical: ViewportMetrics2D,
  input: RenderCameraSelectedPlaneInput,
  accepted: { readonly session: RenderFrameSession; readonly receipt: RenderViewportResizeReceipt } | null,
): RenderCameraSelectedPlaneResult {
  return toSelectedPlane(camera, logical, input, accepted, false);
}

/** Explicit screen origin/scale required. Selected plane only, no 3D/elevation inference. */
export function screenToRenderCameraSelectedPlane(camera: RenderCamera, logical: ViewportMetrics2D,
  input: RenderCameraSelectedPlaneInput,
  accepted: { readonly session: RenderFrameSession; readonly receipt: RenderViewportResizeReceipt } | null,
): RenderCameraSelectedPlaneResult {
  return toSelectedPlane(camera, logical, input, accepted, true);
}
