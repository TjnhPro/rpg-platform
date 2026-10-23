import { captureCameraFields } from './camera-data.js';
import type { RenderCamera, RenderCameraViewSnapshot } from './camera.js';
import { captureRenderCameraProjectionContext } from './camera-projection.js';
import type { RenderCameraProjectionResult } from './camera-projection.js';
import type { RenderFrameSession, RenderViewportResizeReceipt } from './frame-session.js';
import { applyPlanarPoint2D, composePlanarTransforms2D, invertPlanarTransform2D,
  toAffineTransform2D, type AffineTransform2D, type PlanarPoint2D } from './planar-affine.js';
import { captureProjectionPlane2D, captureProjectionPoint2D, captureSourcePlanePoint2D,
  type ProjectionPlane2D, type PlaneProjectionPoint2D } from './plane-projection.js';
import { projectPointToViewport2D, viewportPointToPlane2D, screenPointToViewport2D,
  viewportPointToScreen2D, type ViewportMetrics2D } from './viewport-mapping.js';

/** Oblique ground -> presentation plane, BEFORE the existing orthographic camera.
 * Basis columns are presentation units per ground unit; displacement is presentation
 * units per elevation unit. Camera scale/axis signs/zoom apply to BOTH once.
 * This is not an OrthographicPlaneProjection and does not change its semantics. */
export interface RenderCameraGroundConfiguration {
  readonly kind: 'affine-ground-elevation';
  readonly groundPlane: ProjectionPlane2D;
  readonly presentationPlane: ProjectionPlane2D;
  readonly groundOrigin: PlanarPoint2D;
  readonly presentationOrigin: PlanarPoint2D;
  readonly basis: { readonly x: PlanarPoint2D; readonly y: PlanarPoint2D };
  readonly elevation: { readonly unit: string; readonly displacement: PlanarPoint2D };
}

/** Height is mandatory even at ground zero; no implicit height or unit conversion. */
export interface RenderCameraGroundPoint {
  readonly ground: PlaneProjectionPoint2D;
  readonly elevation: { readonly unit: string; readonly value: number };
}

export interface RenderCameraGroundProjectionResult extends RenderCameraProjectionResult {
  readonly configuration: RenderCameraGroundConfiguration;
  readonly source: RenderCameraGroundPoint;
  readonly presentationPoint: PlaneProjectionPoint2D;
}

/** Exact current issued view, pixel point, and explicitly selected elevation. */
export interface RenderCameraGroundInverseInput {
  readonly cameraView: RenderCameraViewSnapshot;
  readonly point: PlaneProjectionPoint2D;
  readonly elevation: { readonly unit: string; readonly value: number };
}

export interface RenderCameraGroundInverseResult {
  readonly projection: RenderCameraGroundProjectionResult;
  readonly ground: RenderCameraGroundPoint;
}

const translation = (point: PlanarPoint2D): AffineTransform2D =>
  toAffineTransform2D({ a: 1, b: 0, c: 0, d: 1, tx: point.x, ty: point.y });

function capture(input: RenderCameraGroundConfiguration) {
  const raw = captureCameraFields(input,
    ['kind', 'groundPlane', 'presentationPlane', 'groundOrigin', 'presentationOrigin', 'basis', 'elevation']);
  if (raw.kind !== 'affine-ground-elevation') throw new TypeError('Unsupported ground projection kind');
  const groundPlane = captureProjectionPlane2D(raw.groundPlane as ProjectionPlane2D);
  const presentationPlane = captureProjectionPlane2D(raw.presentationPlane as ProjectionPlane2D);
  if (groundPlane.projectId !== presentationPlane.projectId) throw new TypeError('Ground project mismatch');
  const groundOrigin = captureProjectionPoint2D(raw.groundOrigin as PlanarPoint2D);
  const presentationOrigin = captureProjectionPoint2D(raw.presentationOrigin as PlanarPoint2D);
  const basisFields = captureCameraFields(raw.basis, ['x', 'y']);
  const x = captureProjectionPoint2D(basisFields.x as PlanarPoint2D);
  const y = captureProjectionPoint2D(basisFields.y as PlanarPoint2D);
  const elevation = captureCameraFields(raw.elevation, ['unit', 'displacement']);
  if (typeof elevation.unit !== 'string' || elevation.unit.trim().length === 0) {
    throw new TypeError('Elevation unit required');
  }
  const displacement = captureProjectionPoint2D(elevation.displacement as PlanarPoint2D);
  const affine = composePlanarTransforms2D([
    translation({ x: -groundOrigin.x, y: -groundOrigin.y }),
    toAffineTransform2D({ a: x.x, b: x.y, c: y.x, d: y.y, tx: 0, ty: 0 }),
    translation(presentationOrigin),
  ]);
  const inverse = invertPlanarTransform2D(affine);
  if (inverse.status !== 'inverted') throw new RangeError('Ground basis is singular or ill-conditioned');
  const configuration: RenderCameraGroundConfiguration = Object.freeze({ kind: 'affine-ground-elevation',
    groundPlane, presentationPlane, groundOrigin, presentationOrigin, basis: Object.freeze({ x, y }),
    elevation: Object.freeze({ unit: elevation.unit, displacement }) });
  return { configuration, affine, inverse: inverse.transform };
}

/** Detached immutable config; reject singular basis at admission, even for forward use. */
export function createRenderCameraGroundConfiguration(input: RenderCameraGroundConfiguration): RenderCameraGroundConfiguration {
  return capture(input).configuration;
}

function captureHeight(input: unknown, configuration: RenderCameraGroundConfiguration) {
  const fields = captureCameraFields(input, ['unit', 'value']);
  if (fields.unit !== configuration.elevation.unit || typeof fields.value !== 'number'
    || !Number.isFinite(fields.value)) throw new TypeError('Explicit finite matching elevation required');
  return Object.freeze({ unit: configuration.elevation.unit, value: fields.value });
}

function offset(configuration: RenderCameraGroundConfiguration, height: number): PlanarPoint2D {
  // Treat height as a vector input to Phase4, not another projection engine.
  const d = configuration.elevation.displacement;
  return applyPlanarPoint2D({ a: d.x, b: d.y, c: 0, d: 0, tx: 0, ty: 0 }, { x: height, y: 0 });
}

type Accepted = { readonly session: RenderFrameSession; readonly receipt: RenderViewportResizeReceipt } | null;

/** CPU-only ground affine + height displacement + existing camera viewport/screen.
 * Required null is logical-only; accepted context retains existing receipt admission.
 * No Scene/resource/GPU writes; does not apply this projection to Phase8 geometry. */
export function projectRenderCameraGroundPoint(camera: RenderCamera, logical: ViewportMetrics2D,
  configuration: RenderCameraGroundConfiguration, input: RenderCameraGroundPoint,
  accepted: Accepted): RenderCameraGroundProjectionResult {
  const context = captureRenderCameraProjectionContext(camera, logical, accepted);
  const captured = capture(configuration), config = captured.configuration;
  const fields = captureCameraFields(input, ['ground', 'elevation']);
  const ground = Object.freeze({ plane: config.groundPlane,
    point: captureSourcePlanePoint2D(config.groundPlane, fields.ground as PlaneProjectionPoint2D) });
  const elevation = captureHeight(fields.elevation, config);
  const transform = composePlanarTransforms2D([captured.affine, translation(offset(config, elevation.value))]);
  const presentationPoint = Object.freeze({ plane: config.presentationPlane, point: applyPlanarPoint2D(transform, ground.point) });
  const viewportPoint = projectPointToViewport2D(context.mapping, presentationPoint);
  const screenPoint = context.mapping.metrics.screen === null ? null : viewportPointToScreen2D(context.mapping, viewportPoint);
  context.requireCurrent();
  return Object.freeze({ camera: context.view, mapping: context.mapping, acceptedViewport: context.acceptedViewport,
    configuration: config, source: Object.freeze({ ground, elevation }), presentationPoint, viewportPoint, screenPoint });
}

function inverseGround(camera: RenderCamera, logical: ViewportMetrics2D,
  configuration: RenderCameraGroundConfiguration, input: RenderCameraGroundInverseInput,
  accepted: Accepted, screen: boolean): RenderCameraGroundInverseResult {
  const context = captureRenderCameraProjectionContext(camera, logical, accepted);
  const captured = capture(configuration), config = captured.configuration;
  const fields = captureCameraFields(input, ['cameraView', 'point', 'elevation']);
  if (fields.cameraView !== context.view) throw new TypeError('Ground inverse requires current issued camera view');
  const elevation = captureHeight(fields.elevation, config);
  captureSourcePlanePoint2D(context.view.configuration.source,
    { plane: config.presentationPlane, point: config.presentationOrigin });
  const viewport = screen ? screenPointToViewport2D(context.mapping, fields.point as PlaneProjectionPoint2D)
    : fields.point as PlaneProjectionPoint2D;
  const presentation = viewportPointToPlane2D(context.mapping, viewport);
  const displacement = offset(config, elevation.value);
  const undo = composePlanarTransforms2D([
    translation({ x: -displacement.x, y: -displacement.y }), captured.inverse,
  ]);
  const ground = Object.freeze({ ground: Object.freeze({ plane: config.groundPlane,
    point: applyPlanarPoint2D(undo, presentation.point) }), elevation });
  const projection = projectRenderCameraGroundPoint(camera, context.mapping.metrics, config, ground, accepted);
  // Forward destination residual, not a source accuracy guarantee (binary64).
  const recovered = projection.presentationPoint.point;
  if (Math.abs(recovered.x - presentation.point.x) > 1e-9 * Math.max(1, Math.abs(presentation.point.x))
    || Math.abs(recovered.y - presentation.point.y) > 1e-9 * Math.max(1, Math.abs(presentation.point.y))) {
    throw new RangeError('Ground inverse exceeds presentation residual tolerance');
  }
  context.requireCurrent();
  return Object.freeze({ projection, ground });
}

/** Fixed supplied height only; missing height is underdetermined and rejected. */
export function viewportToRenderCameraGround(camera: RenderCamera, logical: ViewportMetrics2D,
  configuration: RenderCameraGroundConfiguration, input: RenderCameraGroundInverseInput,
  accepted: Accepted): RenderCameraGroundInverseResult {
  return inverseGround(camera, logical, configuration, input, accepted, false);
}

/** Explicit screen geometry + supplied height; never terrain/3D/picking inference. */
export function screenToRenderCameraGround(camera: RenderCamera, logical: ViewportMetrics2D,
  configuration: RenderCameraGroundConfiguration, input: RenderCameraGroundInverseInput,
  accepted: Accepted): RenderCameraGroundInverseResult {
  return inverseGround(camera, logical, configuration, input, accepted, true);
}
