import { isCanonicalAtlasGeometry, type AtlasFrameGeometry } from './atlas-geometry.js';
import { createVisualFrameReference, resolveAtlasFrame, type VisualFrameReference, type AtlasFrameResolution } from './atlas-frame.js';
import type { AtlasMetadata } from './atlas-metadata.js';
import { applyPlanarPoint2D, type AffineTransform2D, type PlanarPoint2D } from './planar-affine.js';
import { captureProjectionPlane2D, captureProjectionPoint2D, type PlaneProjectionPoint2D, type ProjectionPlane2D } from './plane-projection.js';
import { createVisualAnchor2D, createVisualOrientation2D, resolveVisualAlignment2D,
  type VisualAnchor2D, type VisualAlignment2D, type VisualOrientation2D } from './visual-alignment.js';

/** Host-verified per-frame data, NOT inferred original/untrimmed layout.
 * All three points use frame-local image-pixel edges, x right/y down.
 * localOffset translates ground contact relative to placement in the same pixel axes.
 * Negative/outside-rectangle coordinates are legitimate. Provenance names the
 * caller's verification evidence; Render validates binding, not the evidence's truth.
 */
export interface SpriteFrameAlignmentData {
  readonly reference: VisualFrameReference;
  readonly revision: symbol;
  readonly provenance: string;
  readonly unit: 'image-pixel';
  readonly origin: 'frame-top-left';
  readonly groundAnchor: PlanarPoint2D;
  readonly pivot: PlanarPoint2D;
  readonly localOffset: PlanarPoint2D;
}

/** Explicit per-axis positive conversion into the placement plane's units.
 * Orientation must use that plane's axes; as in Phase4 it does not rotate offsets.
 * No atlas source pivot is implicitly selected as an authored ground anchor/pivot.
 */
export interface SpriteFrameAlignmentInput {
  readonly atlas: AtlasMetadata | null;
  readonly expectedRevision: symbol;
  readonly geometry: AtlasFrameGeometry;
  readonly placement: PlaneProjectionPoint2D;
  readonly orientation: VisualOrientation2D;
  readonly planeUnitsPerPixel: PlanarPoint2D;
  readonly authored: SpriteFrameAlignmentData | null;
}

export type SpriteFrameAlignmentResult =
  | { readonly status: 'resolved'; readonly geometry: AtlasFrameGeometry;
    readonly provenance: string; readonly plane: ProjectionPlane2D;
    /** Original Phase7 numbers, unchanged; normalized to the exported frame, bottom-left. */
    readonly sourcePivot: { readonly unit: 'normalized-frame'; readonly origin: 'bottom-left'; readonly x: number; readonly y: number };
    readonly anchor: VisualAnchor2D; readonly alignment: VisualAlignment2D;
    /** Maps frame-local right/down image-pixel points into the placement plane. */
    readonly pixelToPlane: AffineTransform2D; readonly ground: PlaneProjectionPoint2D }
  | { readonly status: 'rejected'; readonly code:
    Extract<AtlasFrameResolution, { status: 'unresolved' }>['code']
    | 'INVALID_FRAME_GEOMETRY' | 'FRAME_ORIGIN_UNAVAILABLE' | 'ALIGNMENT_FRAME_MISMATCH'
    | 'INCOMPATIBLE_PLANE' | 'NONFINITE_CONVERSION' };

function record(input: unknown, keys: readonly string[]): void {
  if (typeof input !== 'object' || input === null || Array.isArray(input)
    || (Object.getPrototypeOf(input) !== Object.prototype && Object.getPrototypeOf(input) !== null)
    || Reflect.ownKeys(input).length !== keys.length
    || !keys.every(key => {
      const field = Object.getOwnPropertyDescriptor(input, key);
      return field?.enumerable && 'value' in field;
    })) throw new TypeError('Frame alignment requires closed plain data records');
}

/** Pure, detached display alignment. No IO, state, lease, texture or placement writes.
 * Missing original layout requires explicit verified authored data. Malformed
 * records/nonfinite input/bad pivot/conversion ratio throw TypeError; unavailable
 * provenance, incompatible binding/plane and overflowing arithmetic return codes.
 * Binary64 rounding, cancellation and underflow apply; no pixel snapping, epsilon
 * repair, precision/ground equality guarantee at extreme finite scales.
 */
export function resolveSpriteFrameAlignment(input: SpriteFrameAlignmentInput): SpriteFrameAlignmentResult {
  record(input, ['atlas', 'expectedRevision', 'geometry', 'placement', 'orientation', 'planeUnitsPerPixel', 'authored']);
  const { atlas, expectedRevision, geometry, placement, orientation: orientationInput, planeUnitsPerPixel, authored } = input;
  const fail = (code: Extract<SpriteFrameAlignmentResult, { status: 'rejected' }>['code']): SpriteFrameAlignmentResult =>
    Object.freeze({ status: 'rejected', code });
  if (typeof expectedRevision !== 'symbol') throw new TypeError('Explicit atlas revision required');
  if (!isCanonicalAtlasGeometry(geometry)) return fail('INVALID_FRAME_GEOMETRY');
  if (geometry.revision !== expectedRevision) return fail('ATLAS_REVISION_MISMATCH');
  const resolved = resolveAtlasFrame(geometry.reference, atlas, expectedRevision);
  if (resolved.status !== 'resolved') return fail(resolved.code);
  record(placement, ['plane', 'point']);
  const plane = captureProjectionPlane2D(placement.plane), position = captureProjectionPoint2D(placement.point);
  const orientation = createVisualOrientation2D(orientationInput);
  if (plane.projectId !== geometry.reference.projectId
    || orientation.axes.x !== plane.axes.x || orientation.axes.y !== plane.axes.y) return fail('INCOMPATIBLE_PLANE');
  const ratios = captureProjectionPoint2D(planeUnitsPerPixel);
  if (ratios.x <= 0 || ratios.y <= 0) throw new TypeError('Positive plane units per image pixel required');
  if (authored === null) return fail('FRAME_ORIGIN_UNAVAILABLE');
  record(authored, ['reference', 'revision', 'provenance', 'unit', 'origin', 'groundAnchor', 'pivot', 'localOffset']);
  const reference = createVisualFrameReference(authored.reference);
  const { revision, provenance, unit, origin } = authored;
  if (typeof provenance !== 'string' || provenance.trim().length === 0) return fail('FRAME_ORIGIN_UNAVAILABLE');
  if (unit !== 'image-pixel' || origin !== 'frame-top-left') throw new TypeError('Explicit frame-local image-pixel convention required');
  if (revision !== expectedRevision || reference.projectId !== geometry.reference.projectId
    || reference.resourceId !== geometry.reference.resourceId || reference.subresourceId !== geometry.reference.subresourceId) {
    return fail('ALIGNMENT_FRAME_MISMATCH');
  }
  const groundAnchor = captureProjectionPoint2D(authored.groundAnchor);
  const pivot = captureProjectionPoint2D(authored.pivot), localOffset = captureProjectionPoint2D(authored.localOffset);
  const a = (plane.axes.x === 'right' ? 1 : -1) * ratios.x;
  const d = (plane.axes.y === 'down' ? 1 : -1) * ratios.y;
  const conversion = Object.freeze({ a, b: 0, c: 0, d, tx: 0, ty: 0 });
  // Only canonical arithmetic below may throw RangeError. Host capture/errors above propagate.
  try {
    const convert = (p: PlanarPoint2D): PlanarPoint2D => applyPlanarPoint2D(conversion, p);
    const anchor = createVisualAnchor2D({ unit: plane.unit, anchor: convert(groundAnchor),
      pivot: convert(pivot), localOffset: convert(localOffset) });
    const alignment = resolveVisualAlignment2D(position, plane.unit, anchor, orientation);
    const pixelToPlane = Object.freeze({ ...conversion, tx: alignment.origin.x, ty: alignment.origin.y });
    // Validate the actual mapped ground as well as origin/pivot, before publishing.
    const ground = Object.freeze({ plane, point: applyPlanarPoint2D(pixelToPlane, groundAnchor) });
    return Object.freeze({ status: 'resolved', geometry, provenance, plane,
      sourcePivot: Object.freeze({ unit: 'normalized-frame', origin: 'bottom-left', ...resolved.frame.sourcePivot }),
      anchor, alignment, pixelToPlane, ground });
  } catch (error) {
    if (error instanceof RangeError) return fail('NONFINITE_CONVERSION');
    throw error;
  }
}
