import type { PlanarPoint2D } from './planar-affine.js';

/** Exact scoped space and verbatim unit label; no catalog lookup or unit conversion. */
export interface GridConversionSpace {
  readonly projectId: string;
  readonly coordinateSpaceId: string;
  readonly unit: string;
}

/** Portable numeric request, not an authored grid catalog or Scene definition. */
export interface OrthogonalGridConversion {
  readonly space: GridConversionSpace;
  readonly orientation: 'orthogonal';
  readonly origin: PlanarPoint2D;
  readonly cellSize: { readonly width: number; readonly height: number };
  readonly indexing: {
    readonly columnDirection: 'positive-x' | 'negative-x';
    readonly rowDirection: 'positive-y' | 'negative-y';
    readonly negativeIndices: 'allow' | 'reject';
  };
}

/** Safe-integer row/column, meaningful only with the supplied grid context. */
export interface GridCell2D {
  readonly space: GridConversionSpace;
  readonly cell: { readonly row: number; readonly column: number };
}

/** Point in the supplied numeric scene plane; not viewport or gameplay truth. */
export interface GridScenePosition2D {
  readonly space: GridConversionSpace;
  readonly point: PlanarPoint2D;
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
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new TypeError(`${field} must be a finite number`);
  return value;
}

function point(input: PlanarPoint2D): PlanarPoint2D {
  record(input, ['x', 'y'], 'Grid scene point');
  const { x, y } = input;
  return Object.freeze({ x: finite(x, 'point.x'), y: finite(y, 'point.y') });
}

function space(input: GridConversionSpace): GridConversionSpace {
  record(input, ['projectId', 'coordinateSpaceId', 'unit'], 'Grid conversion space');
  const { projectId, coordinateSpaceId, unit } = input;
  if (typeof projectId !== 'string' || projectId.length === 0 || /\s/u.test(projectId)
    || typeof coordinateSpaceId !== 'string' || coordinateSpaceId.length === 0 || /\s/u.test(coordinateSpaceId)) {
    throw new TypeError('Grid space keys must be non-empty strings without whitespace');
  }
  if (typeof unit !== 'string' || unit.trim().length === 0) throw new TypeError('Grid unit must be a nonblank string');
  return Object.freeze({ projectId, coordinateSpaceId, unit });
}

function match(expected: GridConversionSpace, input: GridConversionSpace): void {
  const captured = space(input);
  if (captured.projectId !== expected.projectId || captured.coordinateSpaceId !== expected.coordinateSpaceId
    || captured.unit !== expected.unit) throw new TypeError('Grid coordinate space or unit mismatch');
}

/**
 * Detached deeply frozen request. Exact record keys, positive finite dimensions,
 * finite origin, explicit policies; invalid data/unsupported kind throws TypeError.
 * Host exceptions propagate. Numeric signs use caller-selected space axes/unit;
 * space origin labels are not additional offsets. No IO, Editor import or GPU.
 */
export function createOrthogonalGridConversion(input: OrthogonalGridConversion): OrthogonalGridConversion {
  record(input, ['space', 'orientation', 'origin', 'cellSize', 'indexing'], 'Grid conversion');
  const { space: inputSpace, orientation, origin, cellSize, indexing } = input;
  if (orientation !== 'orthogonal') throw new TypeError('Only orthogonal grid conversion is supported');
  const capturedSpace = space(inputSpace), capturedOrigin = point(origin);
  record(cellSize, ['width', 'height'], 'Grid cell size');
  const { width: w, height: h } = cellSize;
  const width = finite(w, 'cellSize.width'), height = finite(h, 'cellSize.height');
  if (width <= 0 || height <= 0) throw new TypeError('Grid cell dimensions must be positive');
  record(indexing, ['columnDirection', 'rowDirection', 'negativeIndices'], 'Grid indexing');
  const { columnDirection, rowDirection, negativeIndices } = indexing;
  if ((columnDirection !== 'positive-x' && columnDirection !== 'negative-x')
    || (rowDirection !== 'positive-y' && rowDirection !== 'negative-y')
    || (negativeIndices !== 'allow' && negativeIndices !== 'reject')) throw new TypeError('Invalid grid indexing policy');
  return Object.freeze({ space: capturedSpace, orientation, origin: capturedOrigin,
    cellSize: Object.freeze({ width, height }), indexing: Object.freeze({ columnDirection, rowDirection, negativeIndices }) });
}

function domain(grid: OrthogonalGridConversion, row: number, column: number): void {
  if (grid.indexing.negativeIndices === 'reject' && (row < 0 || column < 0)) {
    throw new RangeError('Grid cell is outside the nonnegative index domain');
  }
}

function normalized(value: number, origin: number, size: number, sign: number): number {
  const delta = value - origin, quotient = (delta / size) * sign;
  if (!Number.isFinite(delta) || !Number.isFinite(quotient) || (delta !== 0 && quotient === 0)) {
    throw new RangeError('Grid normalization is not representable');
  }
  return quotient;
}

function locate(grid: OrthogonalGridConversion, p: PlanarPoint2D): GridCell2D['cell'] {
  const column = Math.floor(normalized(p.x, grid.origin.x, grid.cellSize.width,
    grid.indexing.columnDirection === 'positive-x' ? 1 : -1));
  const row = Math.floor(normalized(p.y, grid.origin.y, grid.cellSize.height,
    grid.indexing.rowDirection === 'positive-y' ? 1 : -1));
  if (!Number.isSafeInteger(row) || !Number.isSafeInteger(column)) throw new RangeError('Grid result exceeds safe-integer indices');
  domain(grid, row, column);
  return Object.freeze({ row: row === 0 ? 0 : row, column: column === 0 ? 0 : column });
}

/**
 * x=origin.x+signX*(column+offset)*width; y likewise with row/height/signY.
 * Required alignment: start-corner offset=0, center offset=0.5. Safe integers only.
 * Invalid input/mismatch => TypeError; outside domain, nonfinite arithmetic, lost
 * center offset or failure to floor-roundtrip the resulting point => RangeError.
 * Binary64 only: no epsilon/snap or universal position-accuracy guarantee.
 */
export function gridCellToScenePosition(
  input: OrthogonalGridConversion, cell: GridCell2D, alignment: 'start-corner' | 'center',
): GridScenePosition2D {
  const grid = createOrthogonalGridConversion(input);
  record(cell, ['space', 'cell'], 'Grid cell');
  const { space: inputSpace, cell: indices } = cell;
  match(grid.space, inputSpace);
  record(indices, ['row', 'column'], 'Grid indices');
  const { row, column } = indices;
  if (!Number.isSafeInteger(row) || !Number.isSafeInteger(column)) throw new TypeError('Grid row/column must be safe integers');
  domain(grid, row, column);
  if (alignment !== 'start-corner' && alignment !== 'center') throw new TypeError('Grid alignment must be start-corner or center');
  const offset = alignment === 'center' ? 0.5 : 0;
  const u = column + offset, v = row + offset;
  if (u - column !== offset || v - row !== offset) throw new RangeError('Grid center offset is not representable');
  const x = grid.origin.x + (grid.indexing.columnDirection === 'positive-x' ? 1 : -1) * u * grid.cellSize.width;
  const y = grid.origin.y + (grid.indexing.rowDirection === 'positive-y' ? 1 : -1) * v * grid.cellSize.height;
  if (!Number.isFinite(x) || !Number.isFinite(y)) throw new RangeError('Grid position arithmetic produced a non-finite result');
  const capturedPoint = Object.freeze({ x, y }), recovered = locate(grid, capturedPoint);
  if (recovered.row !== row || recovered.column !== column) throw new RangeError('Grid position cannot roundtrip at binary64 precision');
  if (alignment === 'center' && (
    normalized(x, grid.origin.x, grid.cellSize.width, grid.indexing.columnDirection === 'positive-x' ? 1 : -1) === column
    || normalized(y, grid.origin.y, grid.cellSize.height, grid.indexing.rowDirection === 'positive-y' ? 1 : -1) === row
  )) throw new RangeError('Grid center collapsed onto a boundary at binary64 precision');
  return Object.freeze({ space: grid.space, point: capturedPoint });
}

/**
 * Required floor policy: normalize by signed cell extents, then Math.floor.
 * Directed cell intervals are [i,i+1): exact boundary belongs to the next index,
 * including negative-axis grids. No epsilon, nearest, clamp or map upper bounds.
 * Finite binary64 point classification only; no recovery of pre-rounded intent.
 * Invalid input/mismatch/policy => TypeError; domain/numerical limits => RangeError.
 */
export function scenePositionToGridCell(
  input: OrthogonalGridConversion, position: GridScenePosition2D, policy: 'floor',
): GridCell2D {
  const grid = createOrthogonalGridConversion(input);
  record(position, ['space', 'point'], 'Grid scene position');
  const { space: inputSpace, point: inputPoint } = position;
  match(grid.space, inputSpace);
  if (policy !== 'floor') throw new TypeError('Only floor grid-cell classification is supported');
  return Object.freeze({ space: grid.space, cell: locate(grid, point(inputPoint)) });
}
