import type { VisualOrientation2D } from '@rpg-platform/runtime-render';
import { createVisualPropertiesProfile, type VisualPropertiesProfile } from './visual-properties-profile.js';
import { createCoordinateSpaceDefinition, type CoordinateSpaceDefinition } from './coordinate-space.js';

/** Undefined is authored absence, never a default facing. */
export function readVisualDirection(profile: VisualPropertiesProfile, space: CoordinateSpaceDefinition): VisualOrientation2D | undefined {
  return createVisualPropertiesProfile(profile, createCoordinateSpaceDefinition(space)).orientation;
}

/** Canonical radians [0,2π); Render validates. No wrap, rotation or frame selection. */
export function setVisualDirection(profile: VisualPropertiesProfile, space: CoordinateSpaceDefinition,
  orientation: VisualOrientation2D): VisualPropertiesProfile {
  const definition = createCoordinateSpaceDefinition(space);
  const source = createVisualPropertiesProfile(profile, definition);
  return createVisualPropertiesProfile({ ...source, orientation }, definition);
}
