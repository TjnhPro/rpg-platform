import { captureCameraFields } from './camera-data.js';
import { cameraPanCenter, captureCameraPanDelta, commitCameraTransition,
  type RenderCamera, type RenderCameraPan, type RenderCameraViewSnapshot } from './camera.js';
import { captureRenderCameraProjectionContext } from './camera-projection.js';
import { captureCameraViewportMapping, type RenderCameraViewportSnapshot } from './camera-viewport.js';
import { cameraZoomCandidate } from './camera-zoom.js';
import { createOrthographicCameraConfiguration } from './camera-configuration.js';
import { captureSourcePlanePoint2D, type PlaneProjectionPoint2D, type ProjectionPlane2D } from './plane-projection.js';
import type { PlanarPoint2D } from './planar-affine.js';
import { viewportPointToPlane2D, type ViewportMapping2D, type ViewportMetrics2D } from './viewport-mapping.js';
import type { RenderFrameSession, RenderViewportResizeReceipt } from './frame-session.js';

/** Per-request policy, NOT stored on the camera or inferred from authored map files. */
export type RenderCameraBoundsPolicy =
  | { readonly kind: 'disabled' }
  | { readonly kind: 'rectangle'; readonly plane: ProjectionPlane2D;
      readonly min: PlanarPoint2D; readonly max: PlanarPoint2D;
      readonly movement: 'clamp' | 'reject'; readonly oversized: 'reject' | 'center' };

export type RenderCameraBoundsMovement =
  | { readonly kind: 'center'; readonly target: PlaneProjectionPoint2D }
  | { readonly kind: 'pan'; readonly request: RenderCameraPan };

/** Absolute target zoom, exact current view and explicit movement/bounds every time. */
export interface RenderCameraBoundsTransitionInput {
  readonly cameraView: RenderCameraViewSnapshot;
  readonly movement: RenderCameraBoundsMovement;
  readonly zoom: number;
  readonly bounds: RenderCameraBoundsPolicy;
}

/** CPU state only. admittedViewport describes PRE-transition admission, never GPU application. */
export type RenderCameraBoundsTransitionResult = {
  readonly before: RenderCameraViewSnapshot;
  readonly view: RenderCameraViewSnapshot;
  readonly requestedCenter: PlanarPoint2D;
  readonly visibleSpan: PlanarPoint2D;
  readonly metrics: ViewportMetrics2D;
  readonly bounds: RenderCameraBoundsPolicy;
  readonly admittedViewport: RenderCameraViewportSnapshot | null;
} & (
  | { readonly status: 'rejected'; readonly reason: 'VIEW_EXCEEDS_BOUNDS' | 'CENTER_OUTSIDE_BOUNDS';
      readonly containment: 'not-applied' }
  | { readonly status: 'updated' | 'unchanged'; readonly reason: null;
      readonly containment: 'contained' | 'oversized-centered' | 'unrestricted' }
);

function kind(input: unknown): unknown {
  if (typeof input !== 'object' || input === null) throw new TypeError('Camera policy requires data');
  const field = Object.getOwnPropertyDescriptor(input, 'kind');
  if (!field || !('value' in field)) throw new TypeError('Camera policy requires data kind');
  return field.value;
}

function captureBounds(source: ProjectionPlane2D, input: unknown): RenderCameraBoundsPolicy {
  if (kind(input) === 'disabled') {
    if (captureCameraFields(input, ['kind']).kind !== 'disabled') throw new TypeError('Bounds kind changed during capture');
    return Object.freeze({ kind: 'disabled' });
  }
  const fields = captureCameraFields(input, ['kind', 'plane', 'min', 'max', 'movement', 'oversized']);
  if (fields.kind !== 'rectangle' || (fields.movement !== 'clamp' && fields.movement !== 'reject')
    || (fields.oversized !== 'reject' && fields.oversized !== 'center')) throw new TypeError('Explicit bounds policy required');
  const min = captureSourcePlanePoint2D(source, { plane: fields.plane as ProjectionPlane2D, point: fields.min as PlanarPoint2D });
  const max = captureSourcePlanePoint2D(source, { plane: fields.plane as ProjectionPlane2D, point: fields.max as PlanarPoint2D });
  if (min.x >= max.x || min.y >= max.y) throw new TypeError('Bounds require finite min < max on both axes');
  return Object.freeze({ kind: 'rectangle', plane: source, min, max,
    movement: fields.movement, oversized: fields.oversized });
}

function extent(mapping: ViewportMapping2D) {
  const { plane, width, height } = mapping.metrics;
  const first = viewportPointToPlane2D(mapping, { plane, point: { x: 0, y: 0 } }).point;
  const last = viewportPointToPlane2D(mapping, { plane, point: { x: width, y: height } }).point;
  return { min: { x: Math.min(first.x, last.x), y: Math.min(first.y, last.y) },
    max: { x: Math.max(first.x, last.x), y: Math.max(first.y, last.y) } };
}

/**
 * Explicit opt-in transition; old camera operations remain unrestricted. Derive
 * visible source extents through Phase4 at TARGET zoom and CURRENT logical size.
 * Reject impossible strict containment before publishing either center or zoom.
 * Oversized center is explicit overscroll, never reported fully contained.
 * Invalid/stale inputs throw TypeError, numeric limits RangeError; policy rejection
 * returns rejected without mutation. No automatic subscription, resize or teleport.
 */
export function transitionRenderCameraWithinBounds(camera: RenderCamera, logical: ViewportMetrics2D,
  input: RenderCameraBoundsTransitionInput,
  accepted: { readonly session: RenderFrameSession; readonly receipt: RenderViewportResizeReceipt } | null,
): RenderCameraBoundsTransitionResult {
  const context = captureRenderCameraProjectionContext(camera, logical, accepted);
  const before = context.view;
  const fields = captureCameraFields(input, ['cameraView', 'movement', 'zoom', 'bounds']);
  if (fields.cameraView !== before) throw new TypeError('Bounds transition requires current issued camera view');
  let requestedCenter: PlanarPoint2D;
  if (kind(fields.movement) === 'center') {
    const movement = captureCameraFields(fields.movement, ['kind', 'target']);
    if (movement.kind !== 'center') throw new TypeError('Movement kind changed during capture');
    requestedCenter = captureSourcePlanePoint2D(before.configuration.source, movement.target as PlaneProjectionPoint2D);
  } else {
    const movement = captureCameraFields(fields.movement, ['kind', 'request']);
    if (movement.kind !== 'pan') throw new TypeError('Unsupported bounds movement');
    requestedCenter = cameraPanCenter(before.configuration.center,
      captureCameraPanDelta(before.configuration.source, movement.request as RenderCameraPan));
  }
  const bounds = captureBounds(before.configuration.source, fields.bounds);
  const zoomed = cameraZoomCandidate(before.configuration, fields.zoom as number, before.zoomLimits);
  const configuration = createOrthographicCameraConfiguration({ kind: zoomed.kind, source: zoomed.source,
    center: { x: 0, y: 0 }, scale: zoomed.scale, zoom: zoomed.zoom, viewportPolicy: zoomed.viewportPolicy });
  const metrics = context.mapping.metrics;
  const offsets = extent(captureCameraViewportMapping({ ...before, configuration }, metrics));
  const visibleSpan = Object.freeze({ x: offsets.max.x - offsets.min.x, y: offsets.max.y - offsets.min.y });
  if (!Number.isFinite(visibleSpan.x) || !Number.isFinite(visibleSpan.y) || visibleSpan.x <= 0 || visibleSpan.y <= 0) {
    throw new RangeError('Visible camera span is not finite positive');
  }
  const common = { before, requestedCenter, visibleSpan, metrics, bounds, admittedViewport: context.acceptedViewport };
  const reject = (reason: 'VIEW_EXCEEDS_BOUNDS' | 'CENTER_OUTSIDE_BOUNDS'): RenderCameraBoundsTransitionResult => {
    context.requireCurrent();
    return Object.freeze({ ...common, view: before, status: 'rejected', reason, containment: 'not-applied' });
  };
  const center = { ...requestedCenter }, oversized = { x: false, y: false };
  let containment: 'contained' | 'oversized-centered' | 'unrestricted' = 'unrestricted';
  if (bounds.kind === 'rectangle') {
    containment = 'contained';
    // Detect every oversized axis before center rejection, independent of axis order.
    for (const axis of ['x', 'y'] as const) {
      const span = bounds.max[axis] - bounds.min[axis];
      if (!Number.isFinite(span)) throw new RangeError('Bounds span overflow');
      oversized[axis] = visibleSpan[axis] > span;
    }
    if ((oversized.x || oversized.y) && bounds.oversized === 'reject') return reject('VIEW_EXCEEDS_BOUNDS');
    for (const axis of ['x', 'y'] as const) {
      if (oversized[axis]) {
        center[axis] = bounds.min[axis] / 2 + bounds.max[axis] / 2;
        containment = 'oversized-centered';
      } else {
        const low = bounds.min[axis] - offsets.min[axis], high = bounds.max[axis] - offsets.max[axis];
        if (!Number.isFinite(low) || !Number.isFinite(high) || low > high) throw new RangeError('Bounds center interval is not representable');
        if (center[axis] < low || center[axis] > high) {
          if (bounds.movement === 'reject') return reject('CENTER_OUTSIDE_BOUNDS');
          center[axis] = Math.max(low, Math.min(high, center[axis]));
        }
      }
    }
  }
  // Canonical final inverse guards numeric containment; never claim containment
  // merely because a center interval looked valid in intermediate arithmetic.
  const finalConfiguration = createOrthographicCameraConfiguration({ kind: zoomed.kind, source: zoomed.source,
    center, scale: zoomed.scale, zoom: zoomed.zoom, viewportPolicy: zoomed.viewportPolicy });
  const finalExtent = extent(captureCameraViewportMapping({ ...before, configuration: finalConfiguration }, metrics));
  if (bounds.kind === 'rectangle') for (const axis of ['x', 'y'] as const) {
    if (!oversized[axis] && (finalExtent.min[axis] < bounds.min[axis] || finalExtent.max[axis] > bounds.max[axis])) {
      throw new RangeError('Final visible extent cannot certify bounds containment');
    }
  }
  context.requireCurrent();
  const view = commitCameraTransition(camera, before, center, zoomed.zoom);
  return Object.freeze({ ...common, view, status: view === before ? 'unchanged' : 'updated', reason: null, containment });
}
