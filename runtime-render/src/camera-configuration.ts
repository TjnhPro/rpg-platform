import { captureCameraFields } from './camera.js';
import { captureProjectionPlane2D, captureProjectionPoint2D, type ProjectionPlane2D } from './plane-projection.js';
import type { PlanarPoint2D } from './planar-affine.js';

/** Pure view intent; source center anchors the logical viewport midpoint. */
export interface OrthographicCameraConfigurationInput {
  readonly kind: 'orthographic';
  readonly source: ProjectionPlane2D;
  readonly center: PlanarPoint2D;
  /** Positive per-axis CSS pixels per declared source unit at zoom1. */
  readonly scale: {
    readonly unit: 'css-px-per-source-unit';
    readonly x: number;
    readonly y: number;
  };
  /** Positive dimensionless multiplier: larger zoom makes presentation larger. */
  readonly zoom: number;
  /** Preserve each axis ratio on resize; visible spans change, no automatic fit. */
  readonly viewportPolicy: 'preserve-scale';
}

/** Detached deeply immutable configuration, not a camera handle or applied view. */
export interface OrthographicCameraConfiguration extends OrthographicCameraConfigurationInput {
  /** scale * zoom, once; no DPR, viewport dimensions or axis sign baked in. */
  readonly effectiveCssPixelsPerSourceUnit: PlanarPoint2D;
}

/**
 * Explicit portable configuration with no defaults, session or projection matrix.
 * Invalid/unsupported inputs throw TypeError; effective ratio overflow/zero
 * underflow throws RangeError. Unknown host exceptions propagate unchanged.
 */
export function createOrthographicCameraConfiguration(
  input: OrthographicCameraConfigurationInput,
): OrthographicCameraConfiguration {
  const raw = captureCameraFields(input, ['kind', 'source', 'center', 'scale', 'zoom', 'viewportPolicy']);
  if (raw.kind !== 'orthographic') throw new TypeError('Only orthographic camera configuration is supported');
  if (raw.viewportPolicy !== 'preserve-scale') throw new TypeError('Camera viewport policy must preserve scale');
  const source = captureProjectionPlane2D(raw.source as ProjectionPlane2D);
  const center = captureProjectionPoint2D(raw.center as PlanarPoint2D);
  const scale = captureCameraFields(raw.scale, ['unit', 'x', 'y']);
  if (scale.unit !== 'css-px-per-source-unit') throw new TypeError('Camera scale requires css-px-per-source-unit');
  const ratios = captureProjectionPoint2D({ x: scale.x as number, y: scale.y as number });
  const zoom = raw.zoom;
  if (ratios.x <= 0 || ratios.y <= 0 || typeof zoom !== 'number' || !Number.isFinite(zoom) || zoom <= 0) {
    throw new TypeError('Camera scale and zoom must be finite positive numbers');
  }
  const x = ratios.x * zoom, y = ratios.y * zoom;
  if (!Number.isFinite(x) || !Number.isFinite(y) || x <= 0 || y <= 0) {
    throw new RangeError('Effective camera scale is outside finite positive range');
  }
  return Object.freeze({ kind: 'orthographic', source, center,
    scale: Object.freeze({ unit: 'css-px-per-source-unit', x: ratios.x, y: ratios.y }),
    zoom, viewportPolicy: 'preserve-scale',
    effectiveCssPixelsPerSourceUnit: Object.freeze({ x, y }) });
}
