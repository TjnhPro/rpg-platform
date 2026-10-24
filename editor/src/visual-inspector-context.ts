import { requireOpenProjectSession, getProjectSessionSnapshot, type ProjectSession } from './project-session.js';
import type { ProjectRootBinding } from './project-root-binding.js';
import type { DocumentSession, DocumentSessionSnapshot } from './document-session.js';
import { getProjectDocument } from './project-document-tracking.js';
import { readMapProfile, type MapProfileSnapshot } from './map-profile.js';
import { getSceneObject, type SceneObjectMembership } from './scene-membership.js';
import type { AssetCatalog } from './asset-catalog.js';
import { readVisualPropertiesProfile, type VisualProfileRead } from './visual-properties-profile.js';

export interface VisualInspectorBinding {
  readonly project: ProjectSession; readonly root: ProjectRootBinding;
  readonly document: DocumentSession; readonly catalog: AssetCatalog;
}
/** Issued transient token. Identity/revision are diagnostic, never write authority. */
export interface VisualInspectorSelection {
  readonly projectId: string; readonly sceneId: string; readonly documentId: string;
  readonly objectId: string; readonly revision: number; readonly generation: number;
}
export type VisualInspectorSnapshot =
  | Readonly<{ status: 'none' | 'stale' | 'missing' | 'unsupported' | 'read-only' | 'error'; reason: string }>
  | Readonly<{ status: 'selected'; selection: VisualInspectorSelection; document: DocumentSessionSnapshot;
      map: MapProfileSnapshot; object: SceneObjectMembership; visual: Exclude<VisualProfileRead, { status: 'unsupported' }> }>;
export interface VisualInspectorContext {
  readonly select: (objectId: string) => VisualInspectorSnapshot;
  readonly clear: () => void;
  /** Host MUST invoke on active-project/scene replacement and failed IO. */
  readonly invalidate: () => void;
  readonly read: (selection?: VisualInspectorSelection) => VisualInspectorSnapshot;
}

/** Explicit tracked Map Scene context; no global selection or serialized UI state. */
export function createVisualInspectorContext(binding: VisualInspectorBinding): VisualInspectorContext {
  const { project, root, document, catalog } = binding;
  let generation = 0;
  let active: VisualInspectorSelection | null = null;
  const clear = (): void => { active = null; generation++; };
  const capture = () => {
    if (requireOpenProjectSession(project).root !== root) throw new TypeError('ROOT_CAPABILITY_MISMATCH');
    const current = getProjectSessionSnapshot(project), snapshot = document.getSnapshot();
    if (snapshot.state !== 'open') throw new TypeError('SCENE_NOT_OPEN');
    if (catalog.projectId !== current.projectId || snapshot.envelope.identity.projectId !== current.projectId) throw new TypeError('PROJECT_MISMATCH');
    const tracked = getProjectDocument(current.manifest, snapshot.envelope.identity);
    const read = readMapProfile(snapshot.envelope, catalog);
    if (read.status !== 'supported') throw new TypeError(`UNSUPPORTED_SCENE:${read.reason}`);
    if (!tracked || tracked.documentKind !== 'scene' || tracked.contentSchemaVersion !== 1
      || tracked.sceneId !== read.snapshot.identity.sceneId) throw new TypeError('SCENE_NOT_TRACKED');
    return { snapshot, map: read.snapshot };
  };
  const read = (selection = active ?? undefined): VisualInspectorSnapshot => {
    if (!selection) return Object.freeze({ status: 'none', reason: 'No selection' });
    if (selection !== active || selection.generation !== generation) return Object.freeze({ status: 'stale', reason: 'Selection replaced or invalidated' });
    try {
      const { snapshot, map } = capture();
      if (selection.revision !== snapshot.currentRevision || selection.sceneId !== map.identity.sceneId
        || selection.documentId !== snapshot.envelope.identity.documentId) {
        clear(); return Object.freeze({ status: 'stale', reason: 'Scene generation changed' });
      }
      const object = getSceneObject(map.membership, selection.objectId);
      if (!object) { clear(); return Object.freeze({ status: 'missing', reason: 'Object missing' }); }
      const visual = readVisualPropertiesProfile(snapshot.envelope, object.definition.objectId, map.profile.space);
      if (visual.status === 'unsupported') return Object.freeze({ status: 'unsupported', reason: visual.reason });
      return Object.freeze({ status: 'selected', selection, document: snapshot, map, object, visual });
    } catch (error) {
      clear();
      if (!(error instanceof TypeError)) throw error;
      return Object.freeze({ status: 'read-only', reason: error.message });
    }
  };
  return Object.freeze({ read, clear, invalidate: clear,
    select: (objectId: string): VisualInspectorSnapshot => {
      clear();
      try {
        const { snapshot, map } = capture();
        if (!getSceneObject(map.membership, objectId)) return Object.freeze({ status: 'missing', reason: 'Object missing' });
        active = Object.freeze({ ...map.identity, documentId: snapshot.envelope.identity.documentId,
          objectId, revision: snapshot.currentRevision, generation });
        return read(active);
      } catch (error) {
        if (!(error instanceof TypeError)) throw error;
        return Object.freeze({ status: 'error', reason: error.message });
      }
    } });
}
