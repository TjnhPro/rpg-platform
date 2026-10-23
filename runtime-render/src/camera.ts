import { captureProjectionPlane2D, captureProjectionPoint2D, captureSourcePlanePoint2D,
  type ProjectionPlane2D, type PlaneProjectionPoint2D } from './plane-projection.js';
import { applyPlanarPoint2D, type PlanarPoint2D } from './planar-affine.js';
import { captureCameraFields } from './camera-data.js';
import { createOrthographicCameraConfiguration, type OrthographicCameraConfiguration,
  type OrthographicCameraConfigurationInput } from './camera-configuration.js';
import { captureCameraZoomLimits, cameraZoomCandidate, cameraFocusZoomCandidate,
  type RenderCameraZoomLimits, type RenderCameraFocusZoomInput } from './camera-zoom.js';

export { captureCameraFields } from './camera-data.js'; // Owner-local compatibility, not root API.

/** Opt-in CPU view observation. Old camera revision still counts center changes only. */
export interface RenderCameraViewSnapshot {
  readonly camera: RenderCameraSnapshot;
  readonly configuration: OrthographicCameraConfiguration;
  readonly zoomLimits: RenderCameraZoomLimits;
  /** Accepted center or zoom changes, once per atomic commit. Disposal does not increment. */
  readonly revision: number;
}

/** Delta components use the camera source plane's axes and units, never pixels. */
export interface RenderCameraPan {
  readonly plane: ProjectionPlane2D;
  readonly delta: PlanarPoint2D;
}

interface CameraOperations {
  readonly setCenter: (input: PlaneProjectionPoint2D) => RenderCameraSnapshot;
  readonly pan: (input: RenderCameraPan) => RenderCameraSnapshot;
  readonly view: () => RenderCameraViewSnapshot;
  readonly setZoom: (zoom: number) => RenderCameraViewSnapshot;
  readonly zoomAtFocus: (input: RenderCameraFocusZoomInput) => RenderCameraViewSnapshot;
  readonly transition: (expected: RenderCameraViewSnapshot, center: PlanarPoint2D, zoom: number) => RenderCameraViewSnapshot;
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

/** Owner-local shared pan candidate. Capture before reading the current center. */
export function captureCameraPanDelta(source: ProjectionPlane2D, input: RenderCameraPan): PlanarPoint2D {
  const fields = captureCameraFields(input, ['plane', 'delta']);
  return captureSourcePlanePoint2D(source, {
    plane: fields.plane as ProjectionPlane2D, point: fields.delta as PlanarPoint2D });
}

/** Owner-local shared finite translation, preserving existing absorbed-component rejection. */
export function cameraPanCenter(current: PlanarPoint2D, delta: PlanarPoint2D): PlanarPoint2D {
  const next = applyPlanarPoint2D({ a: 1, b: 0, c: 0, d: 1, tx: delta.x, ty: delta.y }, current);
  if ((delta.x !== 0 && next.x === current.x) || (delta.y !== 0 && next.y === current.y)) {
    throw new RangeError('Camera pan component was absorbed by binary64 rounding');
  }
  return next;
}

/** Owner-local compare-and-commit seam; not a package-root contract. */
export function commitCameraTransition(camera: RenderCamera, expected: RenderCameraViewSnapshot,
  center: PlanarPoint2D, zoom: number): RenderCameraViewSnapshot {
  return cameraOperations(camera).transition(expected, center, zoom);
}

/** Create the same canonical camera capability with explicit zoom configuration/policy. */
export function createConfiguredRenderCamera(input: OrthographicCameraConfigurationInput,
  limits: RenderCameraZoomLimits): RenderCamera {
  const configuration = createOrthographicCameraConfiguration(input);
  const zoomLimits = captureCameraZoomLimits(limits);
  cameraZoomCandidate(configuration, configuration.zoom, zoomLimits);
  return createCamera({ kind: configuration.kind, source: configuration.source,
    center: configuration.center }, { configuration, zoomLimits });
}

/** Readable after disposal; rejects a camera created without explicit view configuration. */
export function getRenderCameraViewSnapshot(camera: RenderCamera): RenderCameraViewSnapshot {
  return cameraOperations(camera).view();
}

/** Absolute zoom about current center. No implicit viewport context or clamp. */
export function setRenderCameraZoom(camera: RenderCamera, zoom: number): RenderCameraViewSnapshot {
  return cameraOperations(camera).setZoom(zoom);
}

/** Atomically commit zoom and compensating center using the supplied current CSS mapping. */
export function zoomRenderCameraAtFocus(camera: RenderCamera, input: RenderCameraFocusZoomInput): RenderCameraViewSnapshot {
  return cameraOperations(camera).zoomAtFocus(input);
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

/**
 * Pure CPU lifecycle with ephemeral identity; no graphics/session acquisition or
 * binding. Reuses Phase4 capture. Invalid records throw TypeError; host exceptions
 * propagate unchanged. No current-camera registry, zoom math or native types.
 */
export function createRenderCamera(input: RenderCameraInput): RenderCamera {
  return createCamera(input, null);
}

function createCamera(input: RenderCameraInput, configured: {
  readonly configuration: OrthographicCameraConfiguration;
  readonly zoomLimits: RenderCameraZoomLimits;
} | null): RenderCamera {
  const initial = captureCameraFields(input, ['kind', 'source', 'center']);
  if (initial.kind !== 'orthographic') throw new TypeError('Only orthographic camera state is supported');
  const source = captureProjectionPlane2D(initial.source as ProjectionPlane2D);
  const center = captureProjectionPoint2D(initial.center as PlanarPoint2D);
  let snapshot: RenderCameraSnapshot = Object.freeze({ id: Symbol('render-camera'),
    kind: 'orthographic', source, center, state: 'active', revision: 0,
    binding: 'unbound', application: 'not-applied' });
  let view: RenderCameraViewSnapshot | null = configured === null ? null : Object.freeze({
    camera: snapshot, configuration: configured.configuration, zoomLimits: configured.zoomLimits, revision: 0 });
  const requireView = (): RenderCameraViewSnapshot => {
    if (view === null) throw new TypeError('Camera has no explicit zoom configuration');
    return view;
  };
  const requireActive = (): void => {
    if (snapshot.state !== 'active') throw new TypeError('Camera is disposed');
  };
  // Single state commit seam: future live binding must invalidate after a changed
  // commit here. Unbound CPU cameras acquire no session and request no frame/RAF.
  const commitCenter = (next: PlanarPoint2D, configuration?: OrthographicCameraConfiguration): RenderCameraSnapshot => {
    requireActive();
    const centerChanged = next.x !== snapshot.center.x || next.y !== snapshot.center.y;
    const zoomChanged = configuration !== undefined && configuration.zoom !== view?.configuration.zoom;
    if (!centerChanged && !zoomChanged) return snapshot;
    if ((centerChanged && snapshot.revision === Number.MAX_SAFE_INTEGER) || view?.revision === Number.MAX_SAFE_INTEGER) {
      throw new RangeError('Camera revision exhausted');
    }
    const nextSnapshot = centerChanged
      ? Object.freeze({ ...snapshot, center: next, revision: snapshot.revision + 1 }) : snapshot;
    const nextView = view === null ? null : Object.freeze({ camera: nextSnapshot,
      configuration: configuration ?? createOrthographicCameraConfiguration({
        kind: view.configuration.kind, source, center: next, scale: view.configuration.scale,
        zoom: view.configuration.zoom, viewportPolicy: view.configuration.viewportPolicy }),
      zoomLimits: view.zoomLimits, revision: view.revision + 1 });
    // Prepare both immutable observations before publishing either. Future live
    // invalidation belongs after this commit, never between center and zoom.
    snapshot = nextSnapshot;
    view = nextView;
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
      if (snapshot.state === 'active') {
        snapshot = Object.freeze({ ...snapshot, state: 'disposed' });
        if (view !== null) view = Object.freeze({ ...view, camera: snapshot });
      }
      return snapshot;
    },
  });
  operations.set(camera, {
    view: requireView,
    transition: (expected, center, zoom) => {
      requireActive();
      const before = requireView();
      if (expected !== before) throw new TypeError('Camera transition requires current issued view');
      const next = captureProjectionPoint2D(center);
      const zoomed = cameraZoomCandidate(before.configuration, zoom, before.zoomLimits);
      const candidate = createOrthographicCameraConfiguration({ kind: zoomed.kind, source,
        center: next, scale: zoomed.scale, zoom: zoomed.zoom, viewportPolicy: zoomed.viewportPolicy });
      requireActive();
      if (view !== before) throw new TypeError('Camera changed during transition capture');
      commitCenter(next, candidate);
      return requireView();
    },
    setZoom: (zoom) => {
      requireActive();
      const before = requireView();
      const candidate = cameraZoomCandidate(before.configuration, zoom, before.zoomLimits);
      commitCenter(candidate.center, candidate);
      return requireView();
    },
    zoomAtFocus: (input) => {
      requireActive();
      const before = requireView();
      const candidate = cameraFocusZoomCandidate(before.configuration, input, before.zoomLimits);
      requireActive();
      // Host proxies may have reentered while capturing mapping/focus. Never
      // publish an old focus solution over a newer center/zoom observation.
      if (view !== before) throw new TypeError('Camera view changed during focus capture');
      commitCenter(candidate.center, candidate);
      return requireView();
    },
    setCenter: (input) => {
      requireActive();
      const fields = captureCameraFields(input, ['plane', 'point']);
      const next = captureSourcePlanePoint2D(source, fields as unknown as PlaneProjectionPoint2D);
      return commitCenter(next);
    },
    pan: (input) => {
      requireActive();
      const delta = captureCameraPanDelta(source, input);
      // Host capture may reenter. Read the latest center only after it completes.
      requireActive();
      const current = snapshot.center;
      const next = cameraPanCenter(current, delta);
      return commitCenter(next);
    },
  });
  return camera;
}
