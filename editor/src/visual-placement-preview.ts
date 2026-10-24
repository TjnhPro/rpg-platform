import { validateVisualSceneDocument } from './visual-document-edit.js';
import { describeVisualPresentation } from './visual-preview.js';
import type { ScenePreviewBridge, ScenePreviewPresentation } from './scene-preview.js';
import type { SceneObjectVisualDescription } from './scene-visual.js';
import type { DocumentEnvelope } from './document-envelope.js';
import type { AssetCatalog } from './asset-catalog.js';

/** Borrow an existing bridge. Host owns acquisition, source observations, serial sync and close. */
export async function syncVisualPlacementPreview(document: DocumentEnvelope, catalog: AssetCatalog,
  bridge: ScenePreviewBridge | null,
  policy: (description: Extract<SceneObjectVisualDescription, { status: 'described' }>) => ScenePreviewPresentation) {
  const map = validateVisualSceneDocument(document, catalog);
  if (bridge === null) return Object.freeze({ status: 'unavailable' as const, reason: 'RENDER_SESSION_NOT_ACQUIRED' as const });
  const outcomes = await bridge.sync(map.membership, catalog,
    description => describeVisualPresentation(map.document, description.correlation.objectId, catalog, policy(description)));
  return Object.freeze({ status: 'synced' as const, outcomes });
}
