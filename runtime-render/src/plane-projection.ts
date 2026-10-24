import { applyPlanarPoint2D, type PlanarPoint2D, type AffineTransform2D } from './planar-affine.js';

/** Explicit numeric plane context; labels do not perform lookup or unit conversion. */
export interface ProjectionPlane2D {
  readonly projectId: string;
  readonly coordinateSpaceId: string;
  readonly unit: string;
  readonly axes: { readonly x: 'right' | 'left'; readonly y: 'up' | 'down' };
}

/** A point in one declared plane, never an inferred screen or gameplay position. */
export interface PlaneProjectionPoint2D {
  readonly plane: ProjectionPlane2D;
  readonly point: PlanarPoint2D;
}

/**
 * Axis-aligned, depth-free 2D presentation mapping. Maps sourceOrigin exactly to
 * destinationOrigin in real arithmetic. Positive per-axis unit ratios are explicit;
 * axis differences introduce signs. No rotation, shear, height, clipping or NDC.
 * Origins are correspondence points, not offsets added from an authored registry.
 */
export interface OrthographicPlaneProjection {
  readonly kind: 'orthographic-plane';
  readonly source: ProjectionPlane2D;
  readonly destination: ProjectionPlane2D;
  readonly sourceOrigin: PlanarPoint2D;
  readonly destinationOrigin: PlanarPoint2D;
  readonly destinationUnitsPerSourceUnit: PlanarPoint2D;
}

function record(value: unknown, keys: readonly string[], field: string): void {
  if (typeof value !== 'object' || value === null || Array.isArray(value)
    || (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null)
    || Reflect.ownKeys(value).length !== keys.length
    || !keys.every(key => Object.prototype.hasOwnProperty.call(value, key))) {
    throw new TypeError(`${field} must be a plain record with exactly ${keys.join(', ')}`);
  }
}

/** Owner-local canonical numeric capture, not a package-root export. */
export function captureProjectionPoint2D(input: PlanarPoint2D): PlanarPoint2D {
  record(input, ['x', 'y'], 'Projection point');
  const { x, y } = input;
  if (typeof x !== 'number' || !Number.isFinite(x) || typeof y !== 'number' || !Number.isFinite(y)) {
    throw new TypeError('Projection components must be finite numbers');
  }
  return Object.freeze({ x, y });
}

/** Owner-local canonical plane capture, not a package-root export. */
export function captureProjectionPlane2D(input: ProjectionPlane2D): ProjectionPlane2D {
  record(input, ['projectId', 'coordinateSpaceId', 'unit', 'axes'], 'Projection plane');
  const { projectId, coordinateSpaceId, unit, axes } = input;
  if (typeof projectId !== 'string' || projectId.length === 0 || /\s/u.test(projectId)
    || typeof coordinateSpaceId !== 'string' || coordinateSpaceId.length === 0 || /\s/u.test(coordinateSpaceId)
    || typeof unit !== 'string' || unit.trim().length === 0) {
    throw new TypeError('Projection plane requires exact scoped keys and a nonblank unit');
  }
  record(axes, ['x', 'y'], 'Projection axes');
  const { x, y } = axes;
  if ((x !== 'right' && x !== 'left') || (y !== 'up' && y !== 'down')) {
    throw new TypeError('Projection axes require x right/left and y up/down');
  }
  return Object.freeze({ projectId, coordinateSpaceId, unit, axes: Object.freeze({ x, y }) });
}

/**
 * Detached deeply frozen descriptor; exact finite records, positive unit ratios.
 * Invalid input/unsupported kind throws TypeError; unknown host errors propagate.
 * No camera, viewport, DOM, GPU, registry or automatic projection detection.
 */
export function createOrthographicPlaneProjection(input: OrthographicPlaneProjection): OrthographicPlaneProjection {
  record(input, ['kind', 'source', 'destination', 'sourceOrigin', 'destinationOrigin', 'destinationUnitsPerSourceUnit'], 'Plane projection');
  const { kind, source, destination, sourceOrigin, destinationOrigin, destinationUnitsPerSourceUnit } = input;
  if (kind !== 'orthographic-plane') throw new TypeError('Only orthographic-plane projection is supported');
  const capturedSource = captureProjectionPlane2D(source), capturedDestination = captureProjectionPlane2D(destination);
  const capturedSourceOrigin = captureProjectionPoint2D(sourceOrigin), capturedDestinationOrigin = captureProjectionPoint2D(destinationOrigin);
  const ratios = captureProjectionPoint2D(destinationUnitsPerSourceUnit);
  if (ratios.x <= 0 || ratios.y <= 0) throw new TypeError('Projection unit ratios must be positive');
  return Object.freeze({ kind, source: capturedSource, destination: capturedDestination,
    sourceOrigin: capturedSourceOrigin, destinationOrigin: capturedDestinationOrigin,
    destinationUnitsPerSourceUnit: ratios });
}

/** Owner-local ordered mapping steps shared by point and instance presentation.
 * Caller has already captured the projection through the canonical factory. */
export function planeProjectionSteps(projection: OrthographicPlaneProjection): readonly AffineTransform2D[] {
  const expected = projection.source, destination = projection.destination;
  const xSign = expected.axes.x === destination.axes.x ? 1 : -1;
  const ySign = expected.axes.y === destination.axes.y ? 1 : -1;
  return Object.freeze([
    Object.freeze({ a: 1, b: 0, c: 0, d: 1, tx: -projection.sourceOrigin.x, ty: -projection.sourceOrigin.y }),
    Object.freeze({ a: xSign * projection.destinationUnitsPerSourceUnit.x, b: 0, c: 0,
      d: ySign * projection.destinationUnitsPerSourceUnit.y,
      tx: projection.destinationOrigin.x, ty: projection.destinationOrigin.y }),
  ]);
}

/**
 * q = destinationOrigin + axisSign * ratio * (p - sourceOrigin), per component.
 * axisSign is +1 when corresponding axes agree, -1 otherwise. Uses existing
 * affine point operations (subtract source origin, then scale/translate).
 * Exact source plane key/unit/axes mismatch throws TypeError, never identity fallback.
 * Nonfinite intermediate/output arithmetic throws RangeError. Binary64 rounding
 * and underflow remain possible; no universal accuracy or roundtrip guarantee.
 * Forward only on an explicitly selected 2D plane; no depth recovery/inverse.
 * Returns a detached frozen destination point; never mutates placement/anchor/facing.
 */
export function projectPlanePoint2D(
  projectionInput: OrthographicPlaneProjection, input: PlaneProjectionPoint2D,
): PlaneProjectionPoint2D {
  const projection = createOrthographicPlaneProjection(projectionInput);
  const p = captureSourcePlanePoint2D(projection.source, input);
  let result = p;
  for (const step of planeProjectionSteps(projection)) result = applyPlanarPoint2D(step, result);
  return Object.freeze({ plane: projection.destination, point: result });
}

/** Owner-local shared admission; source is already canonically captured. */
export function captureSourcePlanePoint2D(expected: ProjectionPlane2D, input: PlaneProjectionPoint2D): PlanarPoint2D {
  record(input, ['plane', 'point'], 'Projection input');
  const { plane: inputPlane, point: inputPoint } = input;
  const actual = captureProjectionPlane2D(inputPlane), p = captureProjectionPoint2D(inputPoint);
  if (actual.projectId !== expected.projectId || actual.coordinateSpaceId !== expected.coordinateSpaceId
    || actual.unit !== expected.unit || actual.axes.x !== expected.axes.x || actual.axes.y !== expected.axes.y) {
    throw new TypeError('Projection source plane, unit or axes mismatch');
  }
  return p;
}
