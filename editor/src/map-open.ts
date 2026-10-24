import { loadDocument, type DocumentLoadResult, type DocumentStorageObservation } from './document-load.js';
import { deserializeDocument } from './document-codec.js';
import { readMapProfile, mapDocumentContext } from './map-profile.js';
import { mapProjectSnapshot, mapTrackedScene } from './map-project.js';
import { resolveProjectLocator, type ProjectRootBinding } from './project-root-binding.js';
import type { ProjectSession } from './project-session.js';
import type { DocumentIdentity } from './document-envelope.js';
import type { DocumentSession } from './document-session.js';
import type { AssetCatalog } from './asset-catalog.js';
import type { ProjectDocumentReference } from './project-manifest.js';

export interface OpenMapOptions {
  readonly project: ProjectSession; readonly root: ProjectRootBinding;
  readonly identity: DocumentIdentity; readonly catalog: AssetCatalog;
}
export type OpenMapResult = Exclude<DocumentLoadResult, { readonly status: 'loaded' }>
  | { readonly status: 'opened'; readonly session: DocumentSession; readonly reference: ProjectDocumentReference;
      readonly observation: DocumentStorageObservation; readonly text: string }
  | { readonly status: 'rejected'; readonly reason: string; readonly text?: string };

/** One authorized read. Original bytes/observation flow unchanged into Phase5. */
export async function openMap(options: OpenMapOptions): Promise<OpenMapResult> {
  const current = mapProjectSnapshot(options.project, options.root), reference = mapTrackedScene(current, options.identity);
  if (options.catalog.projectId !== current.projectId) throw new TypeError('CATALOG_PROJECT_MISMATCH');
  const locator = resolveProjectLocator(options.root, current.projectId, reference.locator);
  const port = options.root.readPort;
  if (!port) return Object.freeze({ status: 'rejected', reason: 'READ_UNAVAILABLE' });
  const read = await port.read(locator);
  const decoded = read.status === 'read' ? deserializeDocument(read.text) : null;
  if (read.status !== 'read' || decoded?.status !== 'decoded') {
    const failure = await loadDocument({ read: async () => read }, locator,
      { owner: 'scene', documentKind: 'scene', contentSchemaVersion: 1, catalog: options.catalog });
    if (failure.status === 'loaded') { failure.session.close('discard'); throw new TypeError('UNEXPECTED_MAP_LOAD'); }
    return failure;
  }
  const admitted = readMapProfile(decoded.document, options.catalog);
  if (admitted.status !== 'supported') return Object.freeze({ status: 'rejected', reason: `${admitted.status}:${admitted.reason}`, text: read.text });
  const source = admitted.snapshot;
  if (source.identity.projectId !== current.projectId || source.identity.sceneId !== reference.sceneId
    || source.document.identity.documentId !== reference.identity.documentId) return Object.freeze({ status: 'rejected', reason: 'MAP_TRACKED_BINDING_MISMATCH', text: read.text });
  const loaded = await loadDocument({ read: async () => read }, locator, mapDocumentContext(source.document, options.catalog));
  if (loaded.status !== 'loaded') return loaded;
  try {
    const now = mapProjectSnapshot(options.project, options.root);
    if (now.currentRevision !== current.currentRevision) throw new TypeError('STALE_PROJECT_CONTEXT');
  } catch (error) {
    loaded.session.close('discard');
    if (!(error instanceof TypeError)) throw error;
    return Object.freeze({ status: 'rejected', reason: error.message, text: read.text });
  }
  return Object.freeze({ status: 'opened', session: loaded.session, reference, observation: loaded.observation, text: read.text });
}
