/**
 * Immutable planar presentation descriptor, independent of graphics and Editor.
 * Interpretation: scale about numeric (0,0), rotate about (0,0), then translate.
 * For a column point p, the intended mapping is T * R * S * p:
 * x' = cos(r) * sx * x - sin(r) * sy * y + tx
 * y' = sin(r) * sx * x + cos(r) * sy * y + ty
 * Positive radians rotate +x toward +y: CCW for right/up axes, clockwise for
 * right/down axes. No axes, units or coordinate-space conversion is inferred.
 * Translation uses the caller's point unit; scale is dimensionless. The caller
 * must select one coherent numeric plane/unit before interpreting this descriptor.
 * This version captures data only; it does not apply/compose/invert transforms.
 */
export interface PlanarTransform2D {
  readonly translation: { readonly x: number; readonly y: number };
  /** Finite radians retained verbatim; no degree overload or angle normalization. */
  readonly rotationRadians: number;
  /** Zero collapses a component; negative reflects that component before rotation. */
  readonly scale: { readonly x: number; readonly y: number };
}

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

function pair(input: PlanarTransform2D['translation'], field: string): PlanarTransform2D['translation'] {
  record(input, ['x', 'y'], field);
  const { x, y } = input;
  return Object.freeze({ x: finite(x, `${field}.x`), y: finite(y, `${field}.y`) });
}

/**
 * Detach/freeze explicit finite TRS data. Identity is translation (0,0), angle 0,
 * scale (1,1); no defaults are injected. Zero/negative scale and signed zero are
 * retained. Invalid fields/extra dimensions throw TypeError; host exceptions
 * propagate. No matrix, trigonometry, IO, registry, DOM or graphics acquisition.
 * Finite parameters do not guarantee future application/inversion stays finite.
 */
export function createPlanarTransform2D(input: PlanarTransform2D): PlanarTransform2D {
  record(input, ['translation', 'rotationRadians', 'scale'], 'Planar transform');
  const { translation, rotationRadians, scale } = input;
  return Object.freeze({
    translation: pair(translation, 'translation'),
    rotationRadians: finite(rotationRadians, 'rotationRadians'),
    scale: pair(scale, 'scale'),
  });
}
