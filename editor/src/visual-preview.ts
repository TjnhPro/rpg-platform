import { createPlanarTransform2D, createVisualAnchor2D, createVisualOrientation2D } from '@rpg-platform/runtime-render';
import { validateVisualSceneDocument } from './visual-document-edit.js';
import { readVisualPropertiesProfile } from './visual-properties-profile.js';
import { describeVisualAlignment } from './visual-anchor.js';
import type { DocumentEnvelope } from './document-envelope.js';
import type { AssetCatalog } from './asset-catalog.js';
import type { ScenePreviewPresentation } from './scene-preview.js';
import { createCoordinateSpaceDefinition } from './coordinate-space.js';

/** Explicit host policy supplies defaults/layout/projection/resource revision/order.
 * Only present authored values override. Layer/effective visibility stay Render-owned.
 * Host closes its bridge before replacing/clearing Scene/resource context.
 */
export function describeVisualPresentation(document: DocumentEnvelope, objectId: string,
  catalog: AssetCatalog, host: ScenePreviewPresentation): ScenePreviewPresentation {
  const map = validateVisualSceneDocument(document, catalog);
  const space = createCoordinateSpaceDefinition(host.space);
  if (JSON.stringify(space) !== JSON.stringify(map.profile.space)) throw new TypeError('Visual preview space mismatch');
  const read = readVisualPropertiesProfile(map.document, objectId, space);
  if (read.status === 'unsupported') throw new TypeError(read.reason);
  const profile = read.status === 'supported' ? read.profile : { schemaVersion: 1 as const };
  const orientation = createVisualOrientation2D(profile.orientation ?? host.transform.orientation);
  const anchor = createVisualAnchor2D(profile.anchor ?? host.transform.anchor);
  describeVisualAlignment(profile, map.membership, objectId, space, { anchor, orientation });
  return Object.freeze({ ...host, space, visible: profile.visible ?? host.visible,
    transform: Object.freeze({ ...host.transform, anchor, orientation,
      local: createPlanarTransform2D({ ...host.transform.local, scale: profile.scale ?? host.transform.local.scale }) }) });
}
