/** Exact, case-sensitive project-local space key, distinct from Scene/Asset IDs. */
export interface CoordinateSpaceReference {
  readonly projectId: string;
  readonly coordinateSpaceId: string;
}

/** Exactly two finite components; no implied space, unit, depth or pixel meaning. */
export interface CoordinatePair2D {
  readonly x: number;
  readonly y: number;
}

/** Authored conventions only; no parent transform, conversion or unit scale. */
export interface CoordinateSpaceDefinition {
  readonly reference: CoordinateSpaceReference;
  readonly componentCount: 2;
  /** Direction of increasing components in the authored plane. */
  readonly axes: { readonly x: 'right' | 'left'; readonly y: 'up' | 'down' };
  /** Coordinates assigned to the caller's reference origin, in this space's unit. */
  readonly origin: CoordinatePair2D;
  /** Nonblank caller label, preserved verbatim; never interpreted as a conversion. */
  readonly unit: string;
}

/** Reference plus coordinates, not a gameplay position or resolved definition. */
export interface SpatialPoint2D {
  readonly space: CoordinateSpaceReference;
  readonly point: CoordinatePair2D;
}

function record(value: unknown, keys: readonly string[], field: string): void {
  if (typeof value !== 'object' || value === null || Array.isArray(value)
    || (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null)
    || Reflect.ownKeys(value).length !== keys.length
    || !keys.every(key => Object.prototype.hasOwnProperty.call(value, key))) {
    throw new TypeError(`${field} must be a plain record with exactly ${keys.join(', ')}`);
  }
}

function key(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.length === 0 || /\s/u.test(value)) {
    throw new TypeError(`${field} must be a non-empty string without whitespace`);
  }
  return value;
}

function pair(input: CoordinatePair2D, field: string): CoordinatePair2D {
  record(input, ['x', 'y'], field);
  const { x, y } = input;
  if (typeof x !== 'number' || !Number.isFinite(x)
    || typeof y !== 'number' || !Number.isFinite(y)) {
    throw new TypeError(`${field} x/y must be finite numbers`);
  }
  return Object.freeze({ x, y });
}

/** Detached frozen reference; no generation, normalization, lookup or uniqueness store. */
export function createCoordinateSpaceReference(input: CoordinateSpaceReference): CoordinateSpaceReference {
  record(input, ['projectId', 'coordinateSpaceId'], 'Coordinate space reference');
  const { projectId, coordinateSpaceId } = input;
  return Object.freeze({ projectId: key(projectId, 'projectId'),
    coordinateSpaceId: key(coordinateSpaceId, 'coordinateSpaceId') });
}

/**
 * Capture a detached deeply frozen 2D declaration. Every convention is explicit.
 * Origin labels a reference location in this space, never an offset in a parent
 * space or a conversion instruction. No registry, Scene schema change or IO.
 * Invalid data throws TypeError; unknown host accessor exceptions propagate.
 */
export function createCoordinateSpaceDefinition(input: CoordinateSpaceDefinition): CoordinateSpaceDefinition {
  record(input, ['reference', 'componentCount', 'axes', 'origin', 'unit'], 'Coordinate space definition');
  const { reference, componentCount, axes, origin, unit } = input;
  const capturedReference = createCoordinateSpaceReference(reference);
  if (componentCount !== 2) throw new TypeError('Only componentCount 2 is supported');
  record(axes, ['x', 'y'], 'Coordinate axes');
  const { x, y } = axes;
  if ((x !== 'right' && x !== 'left') || (y !== 'up' && y !== 'down')) {
    throw new TypeError('Coordinate axes require x right/left and y up/down');
  }
  const capturedOrigin = pair(origin, 'Coordinate origin');
  if (typeof unit !== 'string' || unit.trim().length === 0) {
    throw new TypeError('Coordinate unit must be a nonblank string');
  }
  return Object.freeze({ reference: capturedReference, componentCount,
    axes: Object.freeze({ x, y }), origin: capturedOrigin, unit });
}

/**
 * Capture without resolving a definition or comparing/combining spaces. Zero and
 * negative coordinates are valid. Arrays, extra dimensions/keys, nonnumbers and
 * nonfinite values reject. No implicit origin, unit conversion or graphics work.
 */
export function createSpatialPoint2D(input: SpatialPoint2D): SpatialPoint2D {
  record(input, ['space', 'point'], 'Spatial point');
  const { space, point } = input;
  return Object.freeze({ space: createCoordinateSpaceReference(space), point: pair(point, 'Spatial point components') });
}
