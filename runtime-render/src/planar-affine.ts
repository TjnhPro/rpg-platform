import { createPlanarTransform2D, type PlanarTransform2D } from './planar-transform.js';

/** Finite numeric point in a caller-selected coherent plane/unit, not a direction. */
export interface PlanarPoint2D {
  readonly x: number;
  readonly y: number;
}

/**
 * Immutable affine coefficients: x' = a*x + c*y + tx, y' = b*x + d*y + ty.
 * Column matrix rows [a,c,tx], [b,d,ty], [0,0,1]. Includes shear/reflection;
 * no TRS decomposition, coordinate-space lookup or native backend matrix.
 */
export interface AffineTransform2D {
  readonly a: number;
  readonly b: number;
  readonly c: number;
  readonly d: number;
  readonly tx: number;
  readonly ty: number;
}

/** No identity fallback. Non-invertible includes the documented numerical policy. */
export type PlanarInverseResult =
  | { readonly status: 'inverted'; readonly transform: AffineTransform2D }
  | { readonly status: 'non-invertible'; readonly reason: 'SINGULAR_OR_ILL_CONDITIONED' };

function record(value: unknown, keys: readonly string[], field: string): void {
  if (typeof value !== 'object' || value === null || Array.isArray(value)
    || (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null)
    || Reflect.ownKeys(value).length !== keys.length
    || !keys.every(key => Object.prototype.hasOwnProperty.call(value, key))) {
    throw new TypeError(`${field} must be a plain record with exactly ${keys.join(', ')}`);
  }
}

function finite(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`${field} must be a finite number`);
  }
  return value;
}

function affineResult(a: number, b: number, c: number, d: number, tx: number, ty: number): AffineTransform2D {
  if (![a, b, c, d, tx, ty].every(Number.isFinite)) {
    throw new RangeError('Planar affine arithmetic produced a non-finite result');
  }
  return Object.freeze({ a, b, c, d, tx, ty });
}

/**
 * Snapshot an affine input or convert approved TRS using T*R*S. Invalid input
 * throws TypeError; non-finite arithmetic throws RangeError. Exact record keys,
 * no coercion/angle snapping/unit conversion. Host exceptions propagate.
 */
export function toAffineTransform2D(input: PlanarTransform2D | AffineTransform2D): AffineTransform2D {
  if (typeof input === 'object' && input !== null && Object.hasOwn(input, 'rotationRadians')) {
    const { translation, rotationRadians, scale } = createPlanarTransform2D(input as PlanarTransform2D);
    const cos = Math.cos(rotationRadians), sin = Math.sin(rotationRadians);
    return affineResult(cos * scale.x, sin * scale.x, -sin * scale.y, cos * scale.y,
      translation.x, translation.y);
  }
  record(input, ['a', 'b', 'c', 'd', 'tx', 'ty'], 'Affine transform');
  const { a, b, c, d, tx, ty } = input as AffineTransform2D;
  return Object.freeze({ a: finite(a, 'a'), b: finite(b, 'b'), c: finite(c, 'c'),
    d: finite(d, 'd'), tx: finite(tx, 'tx'), ty: finite(ty, 'ty') });
}

/**
 * Apply to a POINT, including translation. Never pass a direction/facing vector.
 * Captures finite exact x/y and returns a new frozen point. Uses JS binary64
 * arithmetic without rounding/snapping; non-finite output throws RangeError.
 * Caller supplies coherent axes/units; this is not world-to-screen conversion.
 */
export function applyPlanarPoint2D(
  transform: PlanarTransform2D | AffineTransform2D, point: PlanarPoint2D,
): PlanarPoint2D {
  const m = toAffineTransform2D(transform);
  record(point, ['x', 'y'], 'Planar point');
  const { x: inputX, y: inputY } = point;
  const x = finite(inputX, 'point.x'), y = finite(inputY, 'point.y');
  const resultX = m.a * x + m.c * y + m.tx;
  const resultY = m.b * x + m.d * y + m.ty;
  if (!Number.isFinite(resultX) || !Number.isFinite(resultY)) {
    throw new RangeError('Planar point arithmetic produced a non-finite result');
  }
  return Object.freeze({ x: resultX, y: resultY });
}

/**
 * Explicit application order: [A,B] applies A then B, returning B*A. Empty list
 * yields identity. Always affine to retain shear; no hierarchy, TRS decomposition
 * or input mutation. Every intermediate affine must be finite or RangeError.
 */
export function composePlanarTransforms2D(
  transforms: readonly (PlanarTransform2D | AffineTransform2D)[],
): AffineTransform2D {
  if (!Array.isArray(transforms)) throw new TypeError('Planar composition requires an ordered array');
  let result = affineResult(1, 0, 0, 1, 0, 0);
  for (const transform of transforms) {
    const m = toAffineTransform2D(transform), r = result;
    result = affineResult(
      m.a * r.a + m.c * r.b, m.b * r.a + m.d * r.b,
      m.a * r.c + m.c * r.d, m.b * r.c + m.d * r.d,
      m.a * r.tx + m.c * r.ty + m.tx, m.b * r.tx + m.d * r.ty + m.ty,
    );
  }
  return result;
}

/**
 * Conditional inverse. Let s=max(|a|,|b|,|c|,|d|), normalize the linear block by
 * s, then reject s=0 or |normalized determinant| <= 1e-12. This relative policy
 * deliberately rejects some mathematically invertible ill-conditioned inputs.
 * Normalization avoids raw determinant overflow/underflow for uniform extremes.
 * Successful coefficients/translation must remain finite or RangeError is thrown.
 * Binary64 rounding/underflow remain possible; success is not an accuracy bound.
 */
export function invertPlanarTransform2D(input: PlanarTransform2D | AffineTransform2D): PlanarInverseResult {
  const m = toAffineTransform2D(input);
  const s = Math.max(Math.abs(m.a), Math.abs(m.b), Math.abs(m.c), Math.abs(m.d));
  if (s === 0) return Object.freeze({ status: 'non-invertible', reason: 'SINGULAR_OR_ILL_CONDITIONED' });
  const a = m.a / s, b = m.b / s, c = m.c / s, d = m.d / s;
  const determinant = a * d - b * c;
  if (Math.abs(determinant) <= 1e-12) {
    return Object.freeze({ status: 'non-invertible', reason: 'SINGULAR_OR_ILL_CONDITIONED' });
  }
  const ia = (d / determinant) / s, ib = (-b / determinant) / s;
  const ic = (-c / determinant) / s, id = (a / determinant) / s;
  const transform = affineResult(ia, ib, ic, id,
    -(ia * m.tx + ic * m.ty), -(ib * m.tx + id * m.ty));
  return Object.freeze({ status: 'inverted', transform });
}
