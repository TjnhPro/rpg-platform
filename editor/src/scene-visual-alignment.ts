import {
  resolveVisualAlignment2D, createVisualOrientation2D,
  type VisualAnchor2D, type VisualOrientation2D, type VisualAlignment2D,
} from '@rpg-platform/runtime-render';
import { createCoordinateSpaceDefinition, type CoordinateSpaceDefinition } from './coordinate-space.js';
import { createSceneMembership, getSceneObject, type SceneMembership } from './scene-membership.js';

/**
 * Opt-in Scene placement consumer. Explicit config is caller-retained, not added
 * to Scene/Asset schema. No placement returns null; missing object or mismatched
 * project/space/axes/unit throws TypeError. Render owns all alignment math.
 * Space origin is a label, not another offset. No resource/session/IO/GPU access.
 */
export function describeSceneObjectAlignment(
  membership: SceneMembership, objectId: string, spaceInput: CoordinateSpaceDefinition,
  anchor: VisualAnchor2D, orientationInput: VisualOrientation2D,
): VisualAlignment2D | null {
  const entry = getSceneObject(membership, objectId);
  if (entry === undefined) throw new TypeError('Cannot align a missing Scene objectId');
  const captured = createSceneMembership({ scene: membership.scene, objects: [entry] });
  const placement = captured.objects[0]!.placement;
  if (placement === undefined || placement === null) return null;
  const space = createCoordinateSpaceDefinition(spaceInput);
  const orientation = createVisualOrientation2D(orientationInput);
  if (space.reference.projectId !== captured.scene.identity.projectId
    || space.reference.coordinateSpaceId !== placement.coordinateSpaceId
    || space.axes.x !== orientation.axes.x || space.axes.y !== orientation.axes.y) {
    throw new TypeError('Scene placement and visual coordinate space/axes mismatch');
  }
  return resolveVisualAlignment2D(placement.point, space.unit, anchor, orientation);
}
