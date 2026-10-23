import { createOrthographicPlaneProjection, type ProjectionPlane2D } from './plane-projection.js';
import type { RenderVisualInstanceTransformSnapshot } from './visual-instance-transform.js';

/** Front means drawn later. No screen/camera inference or automatic unit conversion. */
export type RenderVisualLayerOrderingPolicy =
  | { readonly kind: 'explicit-order' }
  | { readonly kind: 'depth-key'; readonly unit: string; readonly front: 'higher' | 'lower' }
  | { readonly kind: 'ground-y'; readonly plane: ProjectionPlane2D; readonly front: 'up' | 'down' };

export interface RenderVisualDepthKey {
  readonly value: number;
  readonly unit: string;
}

export interface RenderVisualDepthFailure {
  readonly code: 'INVALID_POLICY' | 'INVALID_DEPTH_KEY' | 'DEPTH_KEY_REQUIRED'
    | 'DEPTH_UNIT_MISMATCH' | 'GROUND_CONTEXT_REQUIRED' | 'GROUND_PLANE_MISMATCH';
}

export class DepthError extends TypeError {
  readonly #failure: RenderVisualDepthFailure;
  constructor(code: RenderVisualDepthFailure['code']) {
    super(`Visual depth operation rejected: ${code}`);
    this.#failure = Object.freeze({ code });
  }
  static classify(error: unknown): RenderVisualDepthFailure | undefined {
    return typeof error === 'object' && error !== null && #failure in error ? error.#failure : undefined;
  }
}

export function getRenderVisualDepthFailure(error: unknown): RenderVisualDepthFailure | undefined {
  return DepthError.classify(error);
}

export const explicitOrdering: RenderVisualLayerOrderingPolicy = Object.freeze({ kind: 'explicit-order' });

function data(input: unknown, keys: readonly string[], code: 'INVALID_POLICY' | 'INVALID_DEPTH_KEY'): Record<string, unknown> {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) throw new DepthError(code);
  const prototype = Object.getPrototypeOf(input);
  if (prototype !== Object.prototype && prototype !== null) throw new DepthError(code);
  const own = Reflect.ownKeys(input);
  if (own.length !== keys.length || keys.some(key => !own.includes(key))) throw new DepthError(code);
  const result: Record<string, unknown> = Object.create(null) as Record<string, unknown>;
  for (const key of keys) {
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    if (!descriptor?.enumerable || !('value' in descriptor)) throw new DepthError(code);
    result[key] = descriptor.value;
  }
  return result;
}

export function captureDepthKey(input: RenderVisualDepthKey | null): RenderVisualDepthKey | null {
  if (input === null) return null;
  const fields = data(input, ['value', 'unit'], 'INVALID_DEPTH_KEY');
  if (typeof fields.value !== 'number' || !Number.isFinite(fields.value)
    || typeof fields.unit !== 'string' || fields.unit.trim().length === 0) throw new DepthError('INVALID_DEPTH_KEY');
  return Object.freeze({ value: fields.value === 0 ? 0 : fields.value, unit: fields.unit });
}

export function captureOrderingPolicy(input: RenderVisualLayerOrderingPolicy): RenderVisualLayerOrderingPolicy {
  // Inspect the kind as a data descriptor, never execute a host getter.
  if (typeof input !== 'object' || input === null) throw new DepthError('INVALID_POLICY');
  const kind = Object.getOwnPropertyDescriptor(input, 'kind');
  if (!kind || !('value' in kind)) throw new DepthError('INVALID_POLICY');
  if (kind.value === 'explicit-order') {
    if (data(input, ['kind'], 'INVALID_POLICY').kind !== 'explicit-order') throw new DepthError('INVALID_POLICY');
    return explicitOrdering;
  }
  if (kind.value === 'depth-key') {
    const fields = data(input, ['kind', 'unit', 'front'], 'INVALID_POLICY');
    if (fields.kind !== 'depth-key' || typeof fields.unit !== 'string' || fields.unit.trim().length === 0
      || (fields.front !== 'higher' && fields.front !== 'lower')) throw new DepthError('INVALID_POLICY');
    return Object.freeze({ kind: 'depth-key', unit: fields.unit, front: fields.front });
  }
  if (kind.value !== 'ground-y') throw new DepthError('INVALID_POLICY');
  const fields = data(input, ['kind', 'plane', 'front'], 'INVALID_POLICY');
  if (fields.kind !== 'ground-y' || (fields.front !== 'up' && fields.front !== 'down')) throw new DepthError('INVALID_POLICY');
  const plane = data(fields.plane, ['projectId', 'coordinateSpaceId', 'unit', 'axes'], 'INVALID_POLICY');
  const axes = data(plane.axes, ['x', 'y'], 'INVALID_POLICY');
  // Phase 4 owns valid plane conventions. Capture host data before invoking it.
  const candidate = { ...plane, axes } as unknown as ProjectionPlane2D;
  let captured: ProjectionPlane2D;
  try {
    captured = createOrthographicPlaneProjection({ kind: 'orthographic-plane', source: candidate, destination: candidate,
      sourceOrigin: { x: 0, y: 0 }, destinationOrigin: { x: 0, y: 0 },
      destinationUnitsPerSourceUnit: { x: 1, y: 1 } }).source;
  } catch (error) {
    if (error instanceof TypeError) throw new DepthError('INVALID_POLICY');
    throw error;
  }
  return Object.freeze({ kind: 'ground-y', plane: captured, front: fields.front });
}

export function sameOrderingPolicy(a: RenderVisualLayerOrderingPolicy, b: RenderVisualLayerOrderingPolicy): boolean {
  if (a.kind === 'explicit-order') return b.kind === a.kind;
  if (a.kind === 'depth-key') return b.kind === a.kind && a.front === b.front && a.unit === b.unit;
  return b.kind === a.kind && a.front === b.front && samePlane(a.plane, b.plane);
}

function samePlane(a: ProjectionPlane2D, b: ProjectionPlane2D): boolean {
  return a.projectId === b.projectId && a.coordinateSpaceId === b.coordinateSpaceId && a.unit === b.unit
    && a.axes.x === b.axes.x && a.axes.y === b.axes.y;
}

/** Finite normalized painter key; greater means later/front. No image bounds or projected Y. */
export function visualDepth(policy: RenderVisualLayerOrderingPolicy,
  transform: RenderVisualInstanceTransformSnapshot | null, key: RenderVisualDepthKey | null): number {
  if (policy.kind === 'explicit-order') return 0;
  if (policy.kind === 'depth-key') {
    if (key === null) throw new DepthError('DEPTH_KEY_REQUIRED');
    if (key.unit !== policy.unit) throw new DepthError('DEPTH_UNIT_MISMATCH');
    return policy.front === 'higher' ? key.value : -key.value;
  }
  if (transform === null) throw new DepthError('GROUND_CONTEXT_REQUIRED');
  if (!samePlane(policy.plane, transform.placement.plane)) throw new DepthError('GROUND_PLANE_MISMATCH');
  // attachment = Phase 4 localToScene(anchor), including local translation,
  // offset, pivot rotation and scale; source plane is explicitly host-selected ground.
  const y = transform.attachment.y;
  if (!Number.isFinite(y)) throw new DepthError('INVALID_DEPTH_KEY');
  return policy.front === policy.plane.axes.y ? y : -y;
}
