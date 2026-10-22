import type { PlaneProjectionPoint2D } from '@rpg-platform/runtime-render';
import { createCoordinateSpaceDefinition, type CoordinateSpaceDefinition } from './coordinate-space.js';
import { createSceneMembership, getSceneObject, type SceneMembership } from './scene-membership.js';

/** Caller-held authored correlation; never a Render session or visual-instance ID. */
export type SceneObjectSpatialDescription = {
  readonly correlation: { readonly projectId: string; readonly sceneId: string; readonly objectId: string };
} & (
  | { readonly status: 'described'; readonly request: PlaneProjectionPoint2D }
  | { readonly status: 'unavailable'; readonly reason: 'NO_PLACEMENT' }
);

/**
 * Adapt one authored placement to Render's existing portable point request.
 * Pass only request to Render root projectPointToViewport2D/projectPlanePoint2D;
 * retain correlation at the caller. No Asset lookup or graphics session needed.
 * Missing optional placement returns unavailable without inspecting spaceInput.
 * Invalid/mismatched placed data or missing object throws TypeError. Render owns
 * projection-kind/numerical failures; never fall back to identity conversion.
 * Space origin labels are not offsets. No attachment traversal or implicit grid,
 * anchor, transform, screen or unit conversion. Input snapshots remain untouched.
 */
export function describeSceneObjectSpatialPoint(
  membership: SceneMembership, objectId: string, spaceInput: CoordinateSpaceDefinition,
): SceneObjectSpatialDescription {
  const entry = getSceneObject(membership, objectId);
  if (entry === undefined) throw new TypeError('Cannot describe a missing Scene objectId');
  const captured = createSceneMembership({ scene: membership.scene, objects: [entry] });
  const object = captured.objects[0]!;
  const correlation = Object.freeze({ ...captured.scene.identity, objectId: object.definition.objectId });
  const placement = object.placement;
  if (placement === undefined || placement === null) {
    return Object.freeze({ correlation, status: 'unavailable', reason: 'NO_PLACEMENT' });
  }
  const space = createCoordinateSpaceDefinition(spaceInput);
  if (space.reference.projectId !== correlation.projectId
    || space.reference.coordinateSpaceId !== placement.coordinateSpaceId) {
    throw new TypeError('Scene placement and coordinate definition project/space mismatch');
  }
  const request: PlaneProjectionPoint2D = Object.freeze({
    plane: Object.freeze({ ...space.reference, unit: space.unit, axes: space.axes }),
    point: placement.point,
  });
  return Object.freeze({ correlation, status: 'described', request });
}
