import { createVisualPropertiesProfile, type VisualPropertiesProfile } from './visual-properties-profile.js';

/** Authored intent only. Undefined is distinct from true and false. */
export function readVisualVisibility(profile: VisualPropertiesProfile): boolean | undefined {
  return createVisualPropertiesProfile(profile).visible;
}

/** No membership, Asset reference, layer visibility or Render resource lifecycle change. */
export function setVisualVisibility(profile: VisualPropertiesProfile, visible: boolean): VisualPropertiesProfile {
  return createVisualPropertiesProfile({ ...createVisualPropertiesProfile(profile), visible });
}
