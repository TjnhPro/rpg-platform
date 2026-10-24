import { getSceneObject, type SceneMembership, type SceneObjectPlacement } from './scene-membership.js';
import { updateSceneObjectSpatialPlacement } from './scene-spatial-placement.js';
import { createSpatialPoint2D, type CoordinateSpaceDefinition, type SpatialPoint2D } from './coordinate-space.js';

export type VisualPositionRead = Readonly<{ status: 'absent' | 'null' }>
  | Readonly<{ status: 'placed'; placement: SceneObjectPlacement }>;

/** Preserves omitted versus explicit null. No preview defaults or unit inference. */
export function readVisualPosition(membership: SceneMembership, objectId: string): VisualPositionRead {
  const object = getSceneObject(membership, objectId);
  if (!object) throw new TypeError('Visual position object missing');
  if (!Object.hasOwn(object, 'placement')) return Object.freeze({ status: 'absent' });
  if (object.placement == null) return Object.freeze({ status: 'null' });
  return Object.freeze({ status: 'placed', placement: object.placement });
}

/** Canonical candidate only. Document metadata is merged by the focused edit seam. */
export function setVisualPosition(membership: SceneMembership, objectId: string,
  space: CoordinateSpaceDefinition, point: SpatialPoint2D): SceneMembership {
  return updateSceneObjectSpatialPlacement(membership, objectId, space, createSpatialPoint2D(point));
}
