import {
  createOrthographicPlaneProjection, projectPlanePoint2D,
  type OrthographicPlaneProjection, type PlaneProjectionPoint2D, type ProjectionPlane2D,
} from './plane-projection.js';
import { applyPlanarPoint2D, type PlanarPoint2D } from './planar-affine.js';

/** Caller-measured axis-aligned screen context; never inferred from a DOM target. */
export interface ScreenMapping2D {
  readonly plane: ProjectionPlane2D;
  /** Screen coordinates of viewport-local (0,0), in screen plane units. */
  readonly origin: PlanarPoint2D;
  /** Explicit positive per-axis scale, including any chosen CSS/device conversion. */
  readonly screenUnitsPerViewportUnit: PlanarPoint2D;
}

/** Local top-left is (0,0), +x right, +y down, unit css-px or device-px. */
export interface ViewportMetrics2D {
  readonly plane: ProjectionPlane2D;
  readonly width: number;
  readonly height: number;
  /** Null means screen conversion unavailable, never an implicit zero offset. */
  readonly screen: ScreenMapping2D | null;
}

/** Explicit selected plane -> local viewport; no camera, depth or session binding. */
export interface ViewportMapping2D {
  readonly projection: OrthographicPlaneProjection;
  readonly metrics: ViewportMetrics2D;
}

function record(value: unknown, keys: readonly string[], field: string): void {
  if (typeof value !== 'object' || value === null || Array.isArray(value)
    || (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null)
    || Reflect.ownKeys(value).length !== keys.length
    || !keys.every(key => Object.prototype.hasOwnProperty.call(value, key))) {
    throw new TypeError(`${field} must be a plain record with exactly ${keys.join(', ')}`);
  }
}

function pixelPlane(plane: ProjectionPlane2D): void {
  if ((plane.unit !== 'css-px' && plane.unit !== 'device-px')
    || plane.axes.x !== 'right' || plane.axes.y !== 'down') {
    throw new TypeError('Viewport/screen requires css-px or device-px with right/down axes');
  }
}

function samePlane(a: ProjectionPlane2D, b: ProjectionPlane2D): boolean {
  return a.projectId === b.projectId && a.coordinateSpaceId === b.coordinateSpaceId
    && a.unit === b.unit && a.axes.x === b.axes.x && a.axes.y === b.axes.y;
}

function screenProjection(metrics: ViewportMetrics2D): OrthographicPlaneProjection {
  const screen = metrics.screen;
  if (screen === null) throw new TypeError('Screen mapping requires explicit origin, plane and scale');
  return createOrthographicPlaneProjection({ kind: 'orthographic-plane', source: metrics.plane,
    destination: screen.plane, sourceOrigin: { x: 0, y: 0 }, destinationOrigin: screen.origin,
    destinationUnitsPerSourceUnit: screen.screenUnitsPerViewportUnit });
}

function reversed(projection: OrthographicPlaneProjection): OrthographicPlaneProjection {
  const { x, y } = projection.destinationUnitsPerSourceUnit;
  const rx = 1 / x, ry = 1 / y;
  // Same normalized diagonal determinant cutoff as the existing affine inverse.
  if (Math.min(x, y) / Math.max(x, y) <= 1e-12
    || !Number.isFinite(rx) || !Number.isFinite(ry) || rx === 0 || ry === 0) {
    throw new RangeError('Viewport mapping is numerically non-invertible');
  }
  return createOrthographicPlaneProjection({ kind: 'orthographic-plane', source: projection.destination,
    destination: projection.source, sourceOrigin: projection.destinationOrigin,
    destinationOrigin: projection.sourceOrigin, destinationUnitsPerSourceUnit: { x: rx, y: ry } });
}

/**
 * Capture exact finite records deeply detached/frozen. Dimensions positive finite;
 * projection destination must exactly match viewport plane/unit/axes. Requires a
 * numerically invertible axis-aligned orthographic mapping; no perspective/depth.
 * Both pixel spaces use right/down axes. Scale is explicit even for equal units;
 * DPR is never read or multiplied implicitly. Screen context may be null.
 * Invalid/mismatched/underspecified data: TypeError. Numerical limits: RangeError.
 * Unknown host accessor exceptions propagate, as in existing pure spatial APIs.
 */
export function createViewportMapping2D(input: ViewportMapping2D): ViewportMapping2D {
  record(input, ['projection', 'metrics'], 'Viewport mapping');
  const { projection: rawProjection, metrics } = input;
  const projection = createOrthographicPlaneProjection(rawProjection);
  record(metrics, ['plane', 'width', 'height', 'screen'], 'Viewport metrics');
  const { plane, width, height, screen } = metrics;
  // Reuse canonical plane validation/capture without a second plane schema.
  const capturedPlane = createOrthographicPlaneProjection({ ...projection, destination: plane }).destination;
  pixelPlane(capturedPlane);
  if (!samePlane(projection.destination, capturedPlane)) {
    throw new TypeError('Projection destination and viewport plane/unit/axes mismatch');
  }
  if (typeof width !== 'number' || !Number.isFinite(width) || width <= 0
    || typeof height !== 'number' || !Number.isFinite(height) || height <= 0) {
    throw new TypeError('Viewport width and height must be positive finite numbers');
  }
  reversed(projection);
  let capturedScreen: ScreenMapping2D | null = null;
  if (screen !== null) {
    record(screen, ['plane', 'origin', 'screenUnitsPerViewportUnit'], 'Screen mapping');
    const screenMap = screenProjection({ plane: capturedPlane, width, height, screen });
    pixelPlane(screenMap.destination);
    reversed(screenMap);
    capturedScreen = Object.freeze({ plane: screenMap.destination, origin: screenMap.destinationOrigin,
      screenUnitsPerViewportUnit: screenMap.destinationUnitsPerSourceUnit });
  }
  return Object.freeze({ projection, metrics: Object.freeze({ plane: capturedPlane, width, height, screen: capturedScreen }) });
}

function inversePoint(
  projection: OrthographicPlaneProjection, input: PlaneProjectionPoint2D,
): PlaneProjectionPoint2D {
  record(input, ['plane', 'point'], 'Viewport inverse input');
  const { plane, point } = input;
  const capturedPoint = applyPlanarPoint2D({ a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 }, point);
  const result = projectPlanePoint2D(reversed(projection), { plane, point: capturedPoint });
  const roundtrip = projectPlanePoint2D(projection, result);
  // Destination residual only; cannot certify recovery of a previously lost bit.
  for (const axis of ['x', 'y'] as const) {
    const original = capturedPoint[axis];
    if (Math.abs(roundtrip.point[axis] - original) > 1e-9 * Math.max(1, Math.abs(original))) {
      throw new RangeError('Viewport inverse exceeds destination roundtrip tolerance');
    }
  }
  return result;
}

/**
 * Selected scene/presentation plane -> local viewport. Reuses canonical projection.
 * Width/height describe extent, not automatic fit/aspect/scale. Off-viewport points
 * remain valid: no clipping, clamping, rounding or hit testing. Finite binary64 math.
 */
export function projectPointToViewport2D(input: ViewportMapping2D, point: PlaneProjectionPoint2D): PlaneProjectionPoint2D {
  const mapping = createViewportMapping2D(input);
  return projectPlanePoint2D(mapping.projection, point);
}

/**
 * Local viewport -> the descriptor's selected source plane, not an arbitrary 3D
 * world point. No depth inference. Exact plane/unit/axes required. Inverse checks
 * forward residual <= 1e-9*max(1,abs(input component)); otherwise RangeError.
 * Binary64 cancellation/underflow remain possible; no source accuracy guarantee.
 */
export function viewportPointToPlane2D(input: ViewportMapping2D, point: PlaneProjectionPoint2D): PlaneProjectionPoint2D {
  const mapping = createViewportMapping2D(input);
  return inversePoint(mapping.projection, point);
}

/** screen = explicit origin + explicit scale * viewport, component-wise. */
export function viewportPointToScreen2D(input: ViewportMapping2D, point: PlaneProjectionPoint2D): PlaneProjectionPoint2D {
  const mapping = createViewportMapping2D(input);
  return projectPlanePoint2D(screenProjection(mapping.metrics), point);
}

/** Explicit screen -> local viewport with the same constrained inverse policy. */
export function screenPointToViewport2D(input: ViewportMapping2D, point: PlaneProjectionPoint2D): PlaneProjectionPoint2D {
  const mapping = createViewportMapping2D(input);
  return inversePoint(screenProjection(mapping.metrics), point);
}
