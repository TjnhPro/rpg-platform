import { createDocumentEnvelope, createDocumentIdentity, type DocumentIdentity } from './document-envelope.js';
import { createDocumentSession, type DocumentSession } from './document-session.js';
import { createSceneIdentity, createSceneDefinition, type SceneIdentity } from './scene-definition.js';
import { createSceneMembership } from './scene-membership.js';
import { createMapProfile, requireMapProfile } from './map-profile.js';
import { mapProjectSnapshot } from './map-project.js';
import { trackProjectDocument } from './project-document-tracking.js';
import type { ProjectSession } from './project-session.js';
import type { ProjectRootBinding } from './project-root-binding.js';
import type { ProjectDocumentReference, ProjectManifest } from './project-manifest.js';
import type { ResourceLocator } from './asset-sources.js';

export interface CreateMapOptions {
  readonly project: ProjectSession; readonly root: ProjectRootBinding;
  readonly identity: DocumentIdentity; readonly scene: SceneIdentity; readonly profile: unknown;
  /** Required by canonical tracking, declaration only; Save separately authorizes dispatch. */
  readonly trackingLocator: ResourceLocator;
}
export interface CreateMapResult {
  readonly session: DocumentSession; readonly reference: ProjectDocumentReference;
  readonly trackingCandidate: ProjectManifest; readonly projectRevision: number;
}
/** No tracking/active-scene adoption, disk write or saved evidence. */
export function createMap(options: CreateMapOptions): CreateMapResult {
  const current = mapProjectSnapshot(options.project, options.root);
  const identity = createDocumentIdentity(options.identity), scene = createSceneIdentity(options.scene);
  if (identity.projectId !== current.projectId || scene.projectId !== current.projectId) throw new TypeError('MAP_PROJECT_MISMATCH');
  if (identity.documentId === scene.sceneId) throw new TypeError('MAP_DOCUMENT_AND_SCENE_IDS_DISTINCT');
  if (identity.documentId === current.documentId || current.manifest.documents.some(ref => ref.identity.documentId === identity.documentId)) throw new TypeError('DUPLICATE_DOCUMENT_ID');
  if (current.manifest.documents.some(ref => ref.sceneId === scene.sceneId)) throw new TypeError('DUPLICATE_SCENE_ID');
  if (options.trackingLocator.path === current.locator) throw new TypeError('MANIFEST_SELF_REFERENCE');
  const profile = createMapProfile(options.profile, scene);
  const membership = createSceneMembership({ scene: createSceneDefinition({ identity: scene }), objects: [] });
  const document = requireMapProfile(createDocumentEnvelope({ schemaVersion: 1, identity, documentKind: 'scene', contentSchemaVersion: 1,
    content: { ...membership, scene: { ...membership.scene, metadata: { editorMap: profile } } } })).document;
  const reference: ProjectDocumentReference = Object.freeze({ identity, sceneId: scene.sceneId, documentKind: 'scene', contentSchemaVersion: 1, locator: options.trackingLocator });
  const trackingCandidate = trackProjectDocument(current.manifest, reference);
  const capturedReference = trackingCandidate.documents.find(ref => ref.identity.documentId === identity.documentId)!;
  const session = createDocumentSession(document, null); session.open();
  return Object.freeze({ session, reference: capturedReference, trackingCandidate, projectRevision: current.currentRevision });
}
