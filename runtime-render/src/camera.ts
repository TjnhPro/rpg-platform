import { captureProjectionPlane2D, captureProjectionPoint2D, type ProjectionPlane2D } from './plane-projection.js';
import type { PlanarPoint2D } from './planar-affine.js';

/** Portable initial state. No caller-supplied identity, viewport, zoom or GPU state. */
export interface RenderCameraInput {
  readonly kind: 'orthographic';
  readonly source: ProjectionPlane2D;
  readonly center: PlanarPoint2D;
}

/** Center replacement only; the issued camera's kind/source context remain fixed. */
export interface RenderCameraUpdate {
  readonly center: PlanarPoint2D;
}

/** Committed CPU state, never applied native state or a projection result. */
export interface RenderCameraSnapshot extends RenderCameraInput {
  readonly id: symbol;
  readonly state: 'active' | 'disposed';
  /** Accepted center changes only; disposal changes state, not configuration revision. */
  readonly revision: number;
  readonly binding: 'unbound';
  readonly application: 'not-applied';
}

/** Issued per-camera capability. Methods are closure-bound, not routed by this or IDs. */
export interface RenderCamera {
  /** Historical immutable state remains readable after disposal. */
  readonly getSnapshot: () => RenderCameraSnapshot;
  readonly update: (input: RenderCameraUpdate) => RenderCameraSnapshot;
  readonly dispose: () => RenderCameraSnapshot;
}

function fields(input: unknown, keys: readonly string[]): Record<string, unknown> {
  if (typeof input !== 'object' || input === null || Array.isArray(input)
    || (Object.getPrototypeOf(input) !== Object.prototype && Object.getPrototypeOf(input) !== null)
    || Reflect.ownKeys(input).length !== keys.length) {
    throw new TypeError('Camera input must be an exact plain data record');
  }
  const result: Record<string, unknown> = Object.create(null) as Record<string, unknown>;
  for (const key of keys) {
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    if (!descriptor?.enumerable || !('value' in descriptor)) {
      throw new TypeError('Camera input must contain the declared data fields only');
    }
    result[key] = descriptor.value;
  }
  return result;
}

/**
 * Pure CPU lifecycle with ephemeral identity; no graphics/session acquisition or
 * binding. Reuses Phase4 capture. Invalid records throw TypeError; host exceptions
 * propagate unchanged. No global registry, projection/pan/zoom math or native types.
 */
export function createRenderCamera(input: RenderCameraInput): RenderCamera {
  const initial = fields(input, ['kind', 'source', 'center']);
  if (initial.kind !== 'orthographic') throw new TypeError('Only orthographic camera state is supported');
  const source = captureProjectionPlane2D(initial.source as ProjectionPlane2D);
  const center = captureProjectionPoint2D(initial.center as PlanarPoint2D);
  let snapshot: RenderCameraSnapshot = Object.freeze({ id: Symbol('render-camera'),
    kind: 'orthographic', source, center, state: 'active', revision: 0,
    binding: 'unbound', application: 'not-applied' });
  const requireActive = (): void => {
    if (snapshot.state !== 'active') throw new TypeError('Camera is disposed');
  };
  return Object.freeze({
    getSnapshot: () => snapshot,
    update: (input: RenderCameraUpdate): RenderCameraSnapshot => {
      requireActive();
      const candidate = fields(input, ['center']);
      const next = captureProjectionPoint2D(candidate.center as PlanarPoint2D);
      // Host proxy/accessor evaluation may have disposed or updated this camera.
      // Read the current state only after capture; never commit over termination.
      requireActive();
      if (next.x === snapshot.center.x && next.y === snapshot.center.y) return snapshot;
      if (snapshot.revision === Number.MAX_SAFE_INTEGER) throw new RangeError('Camera revision exhausted');
      snapshot = Object.freeze({ ...snapshot, center: next, revision: snapshot.revision + 1 });
      return snapshot;
    },
    dispose: (): RenderCameraSnapshot => {
      if (snapshot.state === 'active') snapshot = Object.freeze({ ...snapshot, state: 'disposed' });
      return snapshot;
    },
  });
}
