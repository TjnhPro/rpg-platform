import { VisualPresentationError } from './visual-presentation-error.js';
import { createPlanarTransform2D, type PlanarTransform2D } from './planar-transform.js';
import { composePlanarTransforms2D, applyPlanarPoint2D, type AffineTransform2D,
  type PlanarPoint2D } from './planar-affine.js';
import { createVisualAnchor2D, createVisualOrientation2D, resolveVisualAlignment2D,
  type VisualAnchor2D, type VisualOrientation2D, type VisualAlignment2D } from './visual-alignment.js';
import { createOrthographicPlaneProjection, projectPlanePoint2D, planeProjectionSteps,
  type PlaneProjectionPoint2D, type OrthographicPlaneProjection } from './plane-projection.js';

export interface RenderVisualInstanceTransformInput {
  readonly placement: PlaneProjectionPoint2D;
  /** TRS in placement units/axes, applied about the explicitly supplied local pivot. */
  readonly local: PlanarTransform2D;
  readonly anchor: VisualAnchor2D;
  /** Independent neutral facing metadata; never rotates geometry or selects frames. */
  readonly orientation: VisualOrientation2D;
  /** MVP destination: same project, render-clip-2d / clip-unit / right,up. */
  readonly projection: OrthographicPlaneProjection;
}

export interface RenderVisualInstanceTransformSnapshot extends RenderVisualInstanceTransformInput {
  readonly alignment: VisualAlignment2D;
  readonly localToScene: AffineTransform2D;
  readonly localToClip: AffineTransform2D;
  readonly attachment: PlanarPoint2D;
  readonly projectedAttachment: PlaneProjectionPoint2D;
}

function data(value: unknown, keys: readonly string[]): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)
    || (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null)
    || Reflect.ownKeys(value).length !== keys.length) throw new VisualPresentationError('INVALID_TRANSFORM');
  const output: Record<string, unknown> = Object.create(null) as Record<string, unknown>;
  for (const key of keys) {
    const field = Object.getOwnPropertyDescriptor(value, key);
    if (!field?.enumerable || !('value' in field)) throw new VisualPresentationError('INVALID_TRANSFORM');
    output[key] = field.value;
  }
  return output;
}

const translation = (point: PlanarPoint2D): AffineTransform2D =>
  Object.freeze({ a: 1, b: 0, c: 0, d: 1, tx: point.x, ty: point.y });

/** Owner-local capture/composition; all arithmetic stays in Phase 4 primitives. */
export function captureVisualInstanceTransform(input: RenderVisualInstanceTransformInput): RenderVisualInstanceTransformSnapshot {
  const fields = data(input, ['placement', 'local', 'anchor', 'orientation', 'projection']);
  const source = data(fields.placement, ['plane', 'point']);
  const point = applyPlanarPoint2D(translation({ x: 0, y: 0 }), source.point as PlanarPoint2D);
  const projection = createOrthographicPlaneProjection(fields.projection as OrthographicPlaneProjection);
  // Reuse exact Phase 4 source-plane/units/axes admission before constructing state.
  projectPlanePoint2D(projection, { plane: source.plane as PlaneProjectionPoint2D['plane'], point });
  const destination = projection.destination;
  if (destination.projectId !== projection.source.projectId || destination.coordinateSpaceId !== 'render-clip-2d'
    || destination.unit !== 'clip-unit' || destination.axes.x !== 'right' || destination.axes.y !== 'up') {
    throw new VisualPresentationError('INVALID_TRANSFORM');
  }
  const local = createPlanarTransform2D(fields.local as PlanarTransform2D);
  const anchor = createVisualAnchor2D(fields.anchor as VisualAnchor2D);
  const orientation = createVisualOrientation2D(fields.orientation as VisualOrientation2D);
  if (orientation.axes.x !== projection.source.axes.x || orientation.axes.y !== projection.source.axes.y) {
    throw new VisualPresentationError('INVALID_TRANSFORM');
  }
  const placement = Object.freeze({ plane: projection.source, point });
  const alignment = resolveVisualAlignment2D(point, placement.plane.unit, anchor, orientation);
  const localToScene = composePlanarTransforms2D([
    translation({ x: -anchor.pivot.x, y: -anchor.pivot.y }), local, translation(alignment.pivot),
  ]);
  const localToClip = composePlanarTransforms2D([localToScene, ...planeProjectionSteps(projection)]);
  const attachment = applyPlanarPoint2D(localToScene, anchor.anchor);
  const projectedAttachment = projectPlanePoint2D(projection, { plane: placement.plane, point: attachment });
  return Object.freeze({ placement, local, anchor, orientation, projection, alignment,
    localToScene, localToClip, attachment, projectedAttachment });
}
