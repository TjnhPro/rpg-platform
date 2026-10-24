import type { PlanarTransform2D } from '@rpg-platform/runtime-render';
import { createVisualPropertiesProfile, type VisualPropertiesProfile } from './visual-properties-profile.js';

/** Dimensionless scale; absence stays absent, including on read. */
export function readVisualScale(profile: VisualPropertiesProfile): PlanarTransform2D['scale'] | undefined {
  return createVisualPropertiesProfile(profile).scale;
}

/** Render accepts zero and reflection; portability additionally rejects negative zero. */
export function setVisualScale(profile: VisualPropertiesProfile, scale: PlanarTransform2D['scale']): VisualPropertiesProfile {
  return createVisualPropertiesProfile({ ...createVisualPropertiesProfile(profile), scale });
}
