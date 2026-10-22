import { applyPlanarPoint2D, type PlanarPoint2D } from './planar-affine.js';

/**
 * Local numeric coordinates, NOT normalized fractions or decoded image pixels.
 * All points/offsets use unit and the placement plane's axes at scale 1.
 * Anchor is the local attachment point; pivot is an independent local point for
 * a future explicit rotation operation. Neither is inferred from image bounds.
 */
export interface VisualAnchor2D {
  readonly unit: string;
  readonly anchor: PlanarPoint2D;
  readonly pivot: PlanarPoint2D;
  /** Translation of the attachment relative to authored placement, in plane axes. */
  readonly localOffset: PlanarPoint2D;
}

/**
 * Presentation facing only, never gameplay aim or an animation/frame selector.
 * Zero is numeric +x. Positive angles go from +x toward +y: clockwise for
 * right/down or left/up, counterclockwise for right/up or left/down axes.
 * Canonical half-open interval [0,2*PI); no wrap, quantization or discrete index.
 */
export interface VisualOrientation2D {
  readonly axes: { readonly x: 'right' | 'left'; readonly y: 'up' | 'down' };
  readonly zeroAxis: 'positive-x';
  readonly positiveRotation: 'toward-positive-y';
  readonly angleRadians: number;
}

/** Unrotated alignment in the caller-selected plane; no live visual instance. */
export interface VisualAlignment2D {
  readonly unit: string;
  readonly origin: PlanarPoint2D;
  readonly pivot: PlanarPoint2D;
  readonly orientation: VisualOrientation2D;
}

function record(value: unknown, keys: readonly string[], field: string): void {
  if (typeof value !== 'object' || value === null || Array.isArray(value)
    || (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null)
    || Reflect.ownKeys(value).length !== keys.length
    || !keys.every(key => Object.prototype.hasOwnProperty.call(value, key))) {
    throw new TypeError(`${field} must be a plain record with exactly ${keys.join(', ')}`);
  }
}

function unitLabel(value: unknown): string {
  if (typeof value !== 'string' || value.trim().length === 0) throw new TypeError('Visual unit must be nonblank');
  return value;
}

function point(input: PlanarPoint2D): PlanarPoint2D {
  record(input, ['x', 'y'], 'Visual point');
  const { x, y } = input;
  if (typeof x !== 'number' || !Number.isFinite(x) || typeof y !== 'number' || !Number.isFinite(y)) {
    throw new TypeError('Visual point components must be finite numbers');
  }
  return Object.freeze({ x, y });
}

/** Exact finite records; detach/freeze every nested value. Unknown host errors propagate. */
export function createVisualAnchor2D(input: VisualAnchor2D): VisualAnchor2D {
  record(input, ['unit', 'anchor', 'pivot', 'localOffset'], 'Visual anchor');
  const { unit, anchor, pivot, localOffset } = input;
  return Object.freeze({ unit: unitLabel(unit), anchor: point(anchor), pivot: point(pivot), localOffset: point(localOffset) });
}

/** Reject unknown conventions/noncanonical angles with TypeError; no silent defaults. */
export function createVisualOrientation2D(input: VisualOrientation2D): VisualOrientation2D {
  record(input, ['axes', 'zeroAxis', 'positiveRotation', 'angleRadians'], 'Visual orientation');
  const { axes, zeroAxis, positiveRotation, angleRadians } = input;
  record(axes, ['x', 'y'], 'Visual axes');
  const { x, y } = axes;
  if ((x !== 'right' && x !== 'left') || (y !== 'up' && y !== 'down')
    || zeroAxis !== 'positive-x' || positiveRotation !== 'toward-positive-y') {
    throw new TypeError('Unsupported visual orientation convention');
  }
  if (typeof angleRadians !== 'number' || !Number.isFinite(angleRadians)
    || angleRadians < 0 || angleRadians >= 2 * Math.PI) {
    throw new TypeError('Visual angleRadians must be in [0, 2*PI)');
  }
  return Object.freeze({ axes: Object.freeze({ x, y }), zeroAxis, positiveRotation,
    angleRadians: angleRadians === 0 ? 0 : angleRadians });
}

/**
 * origin = position + localOffset - anchor; plane pivot = origin + local pivot.
 * Reuses planar point translation; no rotation/scale/projection is applied.
 * Facing is captured independently: changing facing never rotates an image or
 * offsets, selects a frame, or moves the authored position. Anchor may be a
 * ground contact; image center/pivot must be supplied, never decoded or guessed.
 * Caller supplies one coherent plane and exact unit label. Unit mismatch/invalid
 * data throws TypeError; nonfinite intermediate/output arithmetic RangeError.
 * Binary64 rounding remains possible; no precision/roundtrip guarantee or IO/GPU.
 */
export function resolveVisualAlignment2D(
  positionInput: PlanarPoint2D, unitInput: string, anchorInput: VisualAnchor2D,
  orientationInput: VisualOrientation2D,
): VisualAlignment2D {
  const position = point(positionInput), unit = unitLabel(unitInput);
  const anchor = createVisualAnchor2D(anchorInput), orientation = createVisualOrientation2D(orientationInput);
  if (unit !== anchor.unit) throw new TypeError('Visual anchor and placement unit mismatch');
  const translate = (p: PlanarPoint2D, offset: PlanarPoint2D): PlanarPoint2D =>
    applyPlanarPoint2D({ a: 1, b: 0, c: 0, d: 1, tx: offset.x, ty: offset.y }, p);
  const attachment = translate(position, anchor.localOffset);
  const origin = translate(attachment, { x: -anchor.anchor.x, y: -anchor.anchor.y });
  const pivot = translate(origin, anchor.pivot);
  return Object.freeze({ unit, origin, pivot, orientation });
}
