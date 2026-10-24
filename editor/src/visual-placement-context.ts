import { requireOpenProjectSession, getProjectSessionSnapshot, type ProjectSession } from './project-session.js';
import type { ProjectRootBinding } from './project-root-binding.js';
import type { DocumentSession } from './document-session.js';
import { requireAssetManagerProject, type AssetManagerProject } from './asset-manager-project.js';
import { getManagedAssetSelection, observeManagedAssetSelection } from './asset-manager-selection.js';
import { getProjectDocument } from './project-document-tracking.js';
import { validateVisualSceneDocument } from './visual-document-edit.js';
import { describeResolvedVisualAsset } from './asset-visual.js';
import { resolveAssetReference } from './asset-catalog.js';
import { createSceneObjectDefinition } from './scene-object-definition.js';
import type { AssetReference } from './asset-reference.js';

export interface VisualPlacementBinding {
  readonly project: ProjectSession; readonly root: ProjectRootBinding;
  readonly document: DocumentSession; readonly assets: AssetManagerProject;
}
/** Current canonical owners only; no alternate catalog/Scene registry or IO. */
export function readVisualPlacementScene(binding: VisualPlacementBinding) {
  if (requireOpenProjectSession(binding.project).root !== binding.root) throw new TypeError('PLACEMENT_ROOT_MISMATCH');
  const managed = requireAssetManagerProject(binding.assets);
  if (managed.project !== binding.project || managed.root !== binding.root) throw new TypeError('PLACEMENT_ASSET_CONTEXT_MISMATCH');
  const project = getProjectSessionSnapshot(binding.project), document = binding.document.getSnapshot();
  if (document.state !== 'open') throw new TypeError('PLACEMENT_DOCUMENT_NOT_OPEN');
  const map = validateVisualSceneDocument(document.envelope, managed.snapshot.catalog);
  const tracked = getProjectDocument(project.manifest, document.envelope.identity);
  if (project.projectId !== map.identity.projectId || !tracked || tracked.documentKind !== 'scene'
    || tracked.contentSchemaVersion !== 1 || tracked.sceneId !== map.identity.sceneId
    || project.manifest.activeScene?.documentId !== document.envelope.identity.documentId
    || project.manifest.activeScene.sceneId !== map.identity.sceneId) throw new TypeError('PLACEMENT_SCENE_NOT_ACTIVE_TRACKED');
  return Object.freeze({ project, document, map, catalog: managed.snapshot.catalog, catalogGeneration: managed.snapshot.generation });
}

export interface VisualPlacementIntent {
  readonly reference: AssetReference; readonly layerKey: string; readonly classification: string;
  readonly revision: number; readonly projectRevision: number; readonly catalogGeneration: number;
}
/** Issued, short-lived selection intent. Host invalidates on active binding change. */
export function createVisualPlacementContext(input: VisualPlacementBinding) {
  const binding = Object.freeze({ ...input });
  let active: VisualPlacementIntent | null = null, closed = false;
  const invalidate = () => { active = null; };
  const unsubscribe = observeManagedAssetSelection(binding.assets, invalidate);
  const read = (intent: VisualPlacementIntent) => {
    if (closed || intent !== active) throw new TypeError('STALE_PLACEMENT_INTENT');
    const current = readVisualPlacementScene(binding), selected = getManagedAssetSelection(binding.assets);
    if (intent.revision !== current.document.currentRevision || intent.projectRevision !== current.project.currentRevision
      || intent.catalogGeneration !== current.catalogGeneration || selected.status !== 'resolved'
      || JSON.stringify(selected.reference) !== JSON.stringify(intent.reference)) {
      invalidate(); throw new TypeError('STALE_PLACEMENT_INTENT');
    }
    return current;
  };
  return Object.freeze({ read, invalidate, dispose() { closed = true; invalidate(); unsubscribe(); },
    capture(layerKey: string, classification: string): VisualPlacementIntent {
      invalidate(); if (closed) throw new TypeError('PLACEMENT_CONTEXT_CLOSED');
      const current = readVisualPlacementScene(binding), selected = getManagedAssetSelection(binding.assets);
      if (selected.status !== 'resolved') throw new TypeError(`PLACEMENT_ASSET:${selected.status}`);
      const visual = describeResolvedVisualAsset(resolveAssetReference(current.catalog, selected.reference), 'image/png');
      if (visual.status !== 'described') throw new TypeError(`UNSUPPORTED_PLACEMENT_VISUAL:${visual.reason}`);
      if (current.map.profile.layers.find(layer => layer.layerKey === layerKey)?.role !== 'objects') throw new TypeError('PLACEMENT_OBJECT_LAYER_REQUIRED');
      const label = createSceneObjectDefinition({ objectId: 'label-check', classification }).classification;
      if (!label || label.startsWith('editor-map:')) throw new TypeError('PLACEMENT_CLASSIFICATION_RESERVED');
      active = Object.freeze({ reference: selected.reference, layerKey, classification: label,
        revision: current.document.currentRevision, projectRevision: current.project.currentRevision, catalogGeneration: current.catalogGeneration });
      return active;
    }
  });
}
export type VisualPlacementContext = ReturnType<typeof createVisualPlacementContext>;
