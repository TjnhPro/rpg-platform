import { captureCameraFields } from './camera-data.js';
import { createOrthographicCameraConfiguration, type OrthographicCameraConfiguration } from './camera-configuration.js';
import { captureSourcePlanePoint2D, type PlaneProjectionPoint2D } from './plane-projection.js';
import { applyPlanarPoint2D } from './planar-affine.js';
import { createViewportMapping2D, viewportPointToPlane2D, projectPointToViewport2D,
  type ViewportMapping2D } from './viewport-mapping.js';

/** Host-selected inclusive admission policy, captured once per configured camera. */
export interface RenderCameraZoomLimits {
  readonly min: number;
  readonly max: number;
}

/** Absolute zoom at an explicit local logical CSS-pixel focus and current mapping. */
export interface RenderCameraFocusZoomInput {
  readonly zoom: number;
  readonly mapping: ViewportMapping2D;
  readonly focus: PlaneProjectionPoint2D;
}

/** Owner-local admission, no defaults/clamping. */
export function captureCameraZoomLimits(input: RenderCameraZoomLimits): RenderCameraZoomLimits {
  const { min, max } = captureCameraFields(input, ['min', 'max']);
  if (typeof min !== 'number' || !Number.isFinite(min) || min <= 0
    || typeof max !== 'number' || !Number.isFinite(max) || max < min) {
    throw new TypeError('Camera zoom limits require finite 0 < min <= max');
  }
  return Object.freeze({ min, max });
}

/** Owner-local candidate; constructor owns effective-scale numeric admission. */
export function cameraZoomCandidate(current: OrthographicCameraConfiguration,
  zoom: number, limits: RenderCameraZoomLimits): OrthographicCameraConfiguration {
  if (typeof zoom !== 'number' || !Number.isFinite(zoom) || zoom <= 0) {
    throw new TypeError('Camera zoom must be finite and positive');
  }
  if (zoom < limits.min || zoom > limits.max) throw new RangeError('Camera zoom is outside declared limits');
  if (zoom === current.zoom) return current;
  return createOrthographicCameraConfiguration({ kind: current.kind, source: current.source,
    center: current.center, scale: current.scale, zoom, viewportPolicy: current.viewportPolicy });
}

/** Owner-local canonical inverse composition, no native camera/session access. */
export function cameraFocusZoomCandidate(current: OrthographicCameraConfiguration,
  input: RenderCameraFocusZoomInput, limits: RenderCameraZoomLimits): OrthographicCameraConfiguration {
  const fields = captureCameraFields(input, ['zoom', 'mapping', 'focus']);
  const next = cameraZoomCandidate(current, fields.zoom as number, limits);
  const mapping = createViewportMapping2D(fields.mapping as ViewportMapping2D);
  const { projection, metrics } = mapping;
  // Reuse canonical same-source admission; an unknown/different plane never falls back.
  captureSourcePlanePoint2D(current.source, { plane: projection.source, point: projection.sourceOrigin });
  if (metrics.plane.projectId !== current.source.projectId || metrics.plane.unit !== 'css-px'
    || projection.sourceOrigin.x !== current.center.x || projection.sourceOrigin.y !== current.center.y
    || projection.destinationOrigin.x !== metrics.width / 2 || projection.destinationOrigin.y !== metrics.height / 2
    || projection.destinationUnitsPerSourceUnit.x !== current.effectiveCssPixelsPerSourceUnit.x
    || projection.destinationUnitsPerSourceUnit.y !== current.effectiveCssPixelsPerSourceUnit.y) {
    throw new TypeError('Focus mapping must match current camera center, scale and logical viewport midpoint');
  }
  // Capture focus against the destination plane using existing exact source admission.
  const focusFields = captureCameraFields(fields.focus, ['plane', 'point']);
  const focusPoint = captureSourcePlanePoint2D(metrics.plane, focusFields as unknown as PlaneProjectionPoint2D);
  const focus = { plane: metrics.plane, point: focusPoint };
  const world = viewportPointToPlane2D(mapping, focus);
  if (next === current) return current; // Context/inverse still validated on a no-op.
  // New-scale source offset relative to zero, obtained through the SAME inverse.
  const offsetMapping = createViewportMapping2D({ metrics, projection: { ...projection,
    sourceOrigin: { x: 0, y: 0 }, destinationUnitsPerSourceUnit: next.effectiveCssPixelsPerSourceUnit } });
  const offset = viewportPointToPlane2D(offsetMapping, focus);
  const center = applyPlanarPoint2D({ a: 1, b: 0, c: 0, d: 1,
    tx: -offset.point.x, ty: -offset.point.y }, world.point);
  const candidate = createOrthographicCameraConfiguration({ kind: next.kind, source: next.source,
    center, scale: next.scale, zoom: next.zoom, viewportPolicy: next.viewportPolicy });
  const finalMapping = createViewportMapping2D({ metrics, projection: { ...offsetMapping.projection, sourceOrigin: center } });
  const projected = projectPointToViewport2D(finalMapping, world);
  const recovered = viewportPointToPlane2D(finalMapping, focus);
  for (const axis of ['x', 'y'] as const) {
    // Retain Phase4's component-relative destination tolerance; additionally
    // reject a changed selected-plane world point beyond the same relative bound.
    if (Math.abs(projected.point[axis] - focusPoint[axis]) > 1e-9 * Math.max(1, Math.abs(focusPoint[axis]))
      || Math.abs(recovered.point[axis] - world.point[axis]) > 1e-9 * Math.max(1, Math.abs(world.point[axis]))) {
      throw new RangeError('Camera focus preservation exceeds numeric tolerance');
    }
  }
  return candidate;
}
