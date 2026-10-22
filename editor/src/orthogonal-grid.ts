import { createSpatialPoint2D, type CoordinatePair2D, type CoordinateSpaceReference } from './coordinate-space.js';

/**
 * Optional authored rectangular grid, independent of Scene/Object/Asset identity.
 * Space axes/unit come from the caller's matching CoordinateSpaceDefinition;
 * this reference does not resolve, copy or redefine that declaration.
 */
export interface OrthogonalGridDefinition {
  readonly space: CoordinateSpaceReference;
  readonly orientation: 'orthogonal';
  /** Cell (row=0,column=0) start corner in the referenced space, not its center. */
  readonly origin: CoordinatePair2D;
  /** Positive finite extents in the referenced space's unit, not tile pixels/counts. */
  readonly cellSize: { readonly width: number; readonly height: number };
  /**
   * Columns follow numeric x; rows follow numeric y. Direction is numeric sign,
   * not physical right/down: interpret through the referenced space's axes.
   * A cell extends from its start corner along these two directions.
   * Indices mean safe integers, zero-based; allow permits negative row/column,
   * reject declares both nonnegative. No indices are accepted/validated here.
   */
  readonly indexing: {
    readonly columnDirection: 'positive-x' | 'negative-x';
    readonly rowDirection: 'positive-y' | 'negative-y';
    readonly negativeIndices: 'allow' | 'reject';
  };
}

function record(value: unknown, keys: readonly string[], field: string): void {
  if (typeof value !== 'object' || value === null || Array.isArray(value)
    || (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null)
    || Reflect.ownKeys(value).length !== keys.length
    || !keys.every(key => Object.prototype.hasOwnProperty.call(value, key))) {
    throw new TypeError(`${field} must be a plain record with exactly ${keys.join(', ')}`);
  }
}

function size(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    throw new TypeError(`${field} must be a positive finite number`);
  }
  return value;
}

/**
 * Capture a detached deeply frozen descriptor, without mutating caller data.
 * Every field/policy is required; exact own-key plain/null-prototype records only.
 * Unsupported orientations/invalid data throw TypeError; host exceptions propagate.
 * Reuses coordinate-space/point capture without lookup, implicit origin/unit scale
 * or Scene schema changes. Grid origin is independent of the space's origin label.
 *
 * Cell indices identify a cell only with the caller's specific grid context;
 * they are not Scene object positions, tile IDs or bounded map dimensions.
 * No grid ID/catalog, index capture, conversion, rounding/clamping, occupancy,
 * collision, rendering or graphics acquisition is performed.
 */
export function createOrthogonalGridDefinition(input: OrthogonalGridDefinition): OrthogonalGridDefinition {
  record(input, ['space', 'orientation', 'origin', 'cellSize', 'indexing'], 'Orthogonal grid');
  const { space, orientation, origin, cellSize, indexing } = input;
  if (orientation !== 'orthogonal') throw new TypeError('Only orthogonal grid orientation is supported');
  const capturedOrigin = createSpatialPoint2D({ space, point: origin });
  record(cellSize, ['width', 'height'], 'Grid cell size');
  const { width, height } = cellSize;
  const capturedSize = Object.freeze({ width: size(width, 'cellSize.width'), height: size(height, 'cellSize.height') });
  record(indexing, ['columnDirection', 'rowDirection', 'negativeIndices'], 'Grid indexing');
  const { columnDirection, rowDirection, negativeIndices } = indexing;
  if (columnDirection !== 'positive-x' && columnDirection !== 'negative-x') {
    throw new TypeError('Grid columnDirection must be positive-x or negative-x');
  }
  if (rowDirection !== 'positive-y' && rowDirection !== 'negative-y') {
    throw new TypeError('Grid rowDirection must be positive-y or negative-y');
  }
  if (negativeIndices !== 'allow' && negativeIndices !== 'reject') {
    throw new TypeError('Grid negativeIndices must be allow or reject');
  }
  return Object.freeze({ space: capturedOrigin.space, orientation, origin: capturedOrigin.point,
    cellSize: capturedSize, indexing: Object.freeze({ columnDirection, rowDirection, negativeIndices }) });
}
