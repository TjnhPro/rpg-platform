import {
  createCoordinateSpaceDefinition, createSpatialPoint2D,
  type CoordinateSpaceDefinition, type SpatialPoint2D,
} from './coordinate-space.js';
import { updateSceneObjectPlacement, type SceneMembership } from './scene-membership.js';

/**
 * Attach/replace one existing object's authored placement in an explicitly supplied
 * space. The definition, scoped point and Scene must agree on exact project/space
 * keys. Units/axes/origin belong to that definition; values are already expressed
 * in it, so no origin offset, unit conversion or screen inference is performed.
 *
 * Reuses the canonical focused Scene operation: fresh validated frozen candidate,
 * existing IDs/bindings/relationships/order and other supported fields preserved.
 * Old factory snapshots survive; this is not a lossless unknown-document editor.
 * Missing target/invalid point/definition/mismatch throws TypeError. Unknown host
 * errors propagate. No registry, Render instance, UI or gameplay position update.
 * Clearing placement remains the existing updateSceneObjectPlacement(..., null).
 */
export function updateSceneObjectSpatialPlacement(
  membership: SceneMembership, objectId: string,
  spaceInput: CoordinateSpaceDefinition, pointInput: SpatialPoint2D,
): SceneMembership {
  const space = createCoordinateSpaceDefinition(spaceInput);
  const point = createSpatialPoint2D(pointInput);
  if (space.reference.projectId !== membership.scene.identity.projectId
    || point.space.projectId !== space.reference.projectId
    || point.space.coordinateSpaceId !== space.reference.coordinateSpaceId) {
    throw new TypeError('Scene, coordinate definition and spatial point project/space mismatch');
  }
  return updateSceneObjectPlacement(membership, objectId, {
    coordinateSpaceId: point.space.coordinateSpaceId, point: point.point,
  });
}
