import { saveDocument, type DocumentSaveResult, type DocumentWritePrecondition } from './document-save.js';
import { readMapProfile, mapDocumentContext } from './map-profile.js';
import { mapProjectSnapshot, mapTrackedScene } from './map-project.js';
import { resolveProjectLocator, type ProjectRootBinding } from './project-root-binding.js';
import type { ProjectSession } from './project-session.js';
import type { DocumentSession } from './document-session.js';
import type { AssetCatalog } from './asset-catalog.js';

export interface SaveMapOptions {
  readonly project: ProjectSession; readonly root: ProjectRootBinding;
  readonly session: DocumentSession; readonly catalog: AssetCatalog; readonly expected: DocumentWritePrecondition;
}
export type SaveMapResult = DocumentSaveResult | { readonly status: 'blocked'; readonly reason:
  'MAP_PROFILE_INVALID' | 'MAP_NOT_ACTIVE' | 'WRITE_UNAVAILABLE'; readonly diagnostic?: string };
/** Validation is synchronous before Phase5 captures the ticket/dispatches the host. */
export async function saveMap(options: SaveMapOptions): Promise<SaveMapResult> {
  const current = mapProjectSnapshot(options.project, options.root), snapshot = options.session.getSnapshot();
  if (snapshot.state !== 'open') return Object.freeze({ status: 'blocked', reason: 'session-not-open' });
  if (options.catalog.projectId !== current.projectId) throw new TypeError('CATALOG_PROJECT_MISMATCH');
  const reference = mapTrackedScene(current, snapshot.envelope.identity);
  const map = readMapProfile(snapshot.envelope, options.catalog);
  if (map.status !== 'supported') return Object.freeze({ status: 'blocked', reason: 'MAP_PROFILE_INVALID', diagnostic: map.reason });
  if (map.snapshot.identity.sceneId !== reference.sceneId || current.manifest.activeScene?.documentId !== reference.identity.documentId
    || current.manifest.activeScene.sceneId !== reference.sceneId) return Object.freeze({ status: 'blocked', reason: 'MAP_NOT_ACTIVE' });
  const locator = resolveProjectLocator(options.root, current.projectId, reference.locator);
  if (!options.root.writePort) return Object.freeze({ status: 'blocked', reason: 'WRITE_UNAVAILABLE' });
  return saveDocument(options.session, options.root.writePort, locator, options.expected, mapDocumentContext(snapshot.envelope, options.catalog));
}
