import { resolveVisualAlignment2D, type VisualAnchor2D, type VisualOrientation2D, type VisualAlignment2D } from '@rpg-platform/runtime-render';
import { createVisualPropertiesProfile, type VisualPropertiesProfile } from './visual-properties-profile.js';
import { describeSceneObjectSpatialPoint } from './scene-spatial-point.js';
import { createCoordinateSpaceDefinition, type CoordinateSpaceDefinition } from './coordinate-space.js';
import type { SceneMembership } from './scene-membership.js';

export function readVisualAnchor(profile: VisualPropertiesProfile, space: CoordinateSpaceDefinition): VisualAnchor2D | undefined {
  return createVisualPropertiesProfile(profile, createCoordinateSpaceDefinition(space)).anchor;
}

/** No missing-placement fallback. Numeric coordinates are local plane units. */
export function setVisualAnchor(profile: VisualPropertiesProfile, membership: SceneMembership, objectId: string,
  space: CoordinateSpaceDefinition, anchor: VisualAnchor2D): VisualPropertiesProfile {
  const definition = createCoordinateSpaceDefinition(space);
  const placement = describeSceneObjectSpatialPoint(membership, objectId, definition);
  if (placement.status !== 'described') throw new TypeError('Anchor requires Scene placement');
  return createVisualPropertiesProfile({ ...createVisualPropertiesProfile(profile, definition), anchor }, definition);
}

/** Optional diagnostic alignment. Defaults must be explicit host presentation policy. */
export function describeVisualAlignment(profile: VisualPropertiesProfile, membership: SceneMembership, objectId: string,
  space: CoordinateSpaceDefinition, defaults: Readonly<{ anchor: VisualAnchor2D; orientation: VisualOrientation2D }>): VisualAlignment2D {
  const definition = createCoordinateSpaceDefinition(space);
  const placement = describeSceneObjectSpatialPoint(membership, objectId, definition);
  if (placement.status !== 'described') throw new TypeError('Alignment requires Scene placement');
  const source = createVisualPropertiesProfile(profile, definition);
  // Validate even fallback axes/unit; never infer conventions from the viewport.
  const effective = createVisualPropertiesProfile({ schemaVersion: 1,
    anchor: source.anchor ?? defaults.anchor, orientation: source.orientation ?? defaults.orientation }, definition);
  return resolveVisualAlignment2D(placement.request.point, definition.unit, effective.anchor!, effective.orientation!);
}
