import { captureProjectionPlane2D, captureProjectionPoint2D, captureSourcePlanePoint2D,
  type ProjectionPlane2D, type PlaneProjectionPoint2D } from './plane-projection.js';
import { applyPlanarPoint2D, type PlanarPoint2D } from './planar-affine.js';

/** Delta components use the camera source plane's axes and units, never pixels. */
export interface RenderCameraPan {
  readonly plane: ProjectionPlane2D;
  readonly delta: PlanarPoint2D;
}

interface CameraOperations {
  readonly setCenter: (input: PlaneProjectionPoint2D) => RenderCameraSnapshot;
  readonly pan: (input: RenderCameraPan) => RenderCameraSnapshot;
}

// Weak capabilities of issued handles, not a current-camera/ID lookup or session registry.
const operations = new WeakMap<RenderCamera, CameraOperations>();

function cameraOperations(camera: RenderCamera): CameraOperations {
  const capability = operations.get(camera);
  if (!capability) throw new TypeError('Camera handle was not issued by this Render module');
  return capability;
}

/** Absolute source-plane center replacement on an issued active camera. */
export function setRenderCameraCenter(camera: RenderCamera, input: PlaneProjectionPoint2D): RenderCameraSnapshot {
  return cameraOperations(camera).setCenter(input);
}

/** Relative source-plane translation; rejects overflow and completely absorbed nonzero components. */
export function panRenderCamera(camera: RenderCamera, input: RenderCameraPan): RenderCameraSnapshot {
  return cameraOperations(camera).pan(input);
}

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

/** Owner-local exact data capture; not a package-root export. */
export function captureCameraFields(input: unknown, keys: readonly string[]): Record<string, unknown> {
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
 * propagate unchanged. No current-camera registry, zoom math or native types.
 */
export function createRenderCamera(input: RenderCameraInput): RenderCamera {
  const initial = captureCameraFields(input, ['kind', 'source', 'center']);
  if (initial.kind !== 'orthographic') throw new TypeError('Only orthographic camera state is supported');
  const source = captureProjectionPlane2D(initial.source as ProjectionPlane2D);
  const center = captureProjectionPoint2D(initial.center as PlanarPoint2D);
  let snapshot: RenderCameraSnapshot = Object.freeze({ id: Symbol('render-camera'),
    kind: 'orthographic', source, center, state: 'active', revision: 0,
    binding: 'unbound', application: 'not-applied' });
  const requireActive = (): void => {
    if (snapshot.state !== 'active') throw new TypeError('Camera is disposed');
  };
  // Single state commit seam: future live binding must invalidate after a changed
  // commit here. Unbound CPU cameras acquire no session and request no frame/RAF.
  const commitCenter = (next: PlanarPoint2D): RenderCameraSnapshot => {
    requireActive();
    if (next.x === snapshot.center.x && next.y === snapshot.center.y) return snapshot;
    if (snapshot.revision === Number.MAX_SAFE_INTEGER) throw new RangeError('Camera revision exhausted');
    snapshot = Object.freeze({ ...snapshot, center: next, revision: snapshot.revision + 1 });
    return snapshot;
  };
  const camera: RenderCamera = Object.freeze({
    getSnapshot: () => snapshot,
    update: (input: RenderCameraUpdate): RenderCameraSnapshot => {
      requireActive();
      const candidate = captureCameraFields(input, ['center']);
      const next = captureProjectionPoint2D(candidate.center as PlanarPoint2D);
      // Host proxy/accessor evaluation may have disposed or updated this camera.
      // Read the current state only after capture; never commit over termination.
      return commitCenter(next);
    },
    dispose: (): RenderCameraSnapshot => {
      if (snapshot.state === 'active') snapshot = Object.freeze({ ...snapshot, state: 'disposed' });
      return snapshot;
    },
  });
  operations.set(camera, {
    setCenter: (input) => {
      requireActive();
      const fields = captureCameraFields(input, ['plane', 'point']);
      const next = captureSourcePlanePoint2D(source, fields as unknown as PlaneProjectionPoint2D);
      return commitCenter(next);
    },
    pan: (input) => {
      requireActive();
      const fields = captureCameraFields(input, ['plane', 'delta']);
      const delta = captureSourcePlanePoint2D(source, {
        plane: fields.plane as ProjectionPlane2D, point: fields.delta as PlanarPoint2D });
      // Host capture may reenter. Read the latest center only after it completes.
      requireActive();
      const current = snapshot.center;
      const next = applyPlanarPoint2D({ a: 1, b: 0, c: 0, d: 1, tx: delta.x, ty: delta.y }, current);
      if ((delta.x !== 0 && next.x === current.x) || (delta.y !== 0 && next.y === current.y)) {
        throw new RangeError('Camera pan component was absorbed by binary64 rounding');
      }
      return commitCenter(next);
    },
  });
  return camera;
}
