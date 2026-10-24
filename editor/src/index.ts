import '@rpg-platform/runtime-engine';
export { replaceSceneDocumentObject } from './document-scene-edit.js';
export {
  inspectDocumentCompatibility,
  migrateDocument,
  type DocumentMigration,
  type DocumentCompatibilityResult,
  type DocumentMigrationResult,
} from './document-compatibility.js';
export {
  type DocumentPersistenceFailure,
  type DocumentCleanupReceipt,
  type DocumentCleanupResult,
} from './document-persistence.js';
export {
  saveDocument,
  type DocumentWritePrecondition,
  type DocumentWriteRequest,
  type DocumentCommitReceipt,
  type DocumentWritePort,
  type DocumentSaveResult,
} from './document-save.js';
export {
  loadDocument,
  type DocumentStorageObservation,
  type DocumentReadResult,
  type DocumentReadPort,
  type DocumentLoadResult,
} from './document-load.js';
export {
  diagnoseDocument,
  type DocumentDiagnosticCode,
  type DocumentDiagnostic,
  type DocumentValidationContext,
  type DocumentValidationResult,
} from './document-diagnostics.js';
export {
  serializeDocument,
  deserializeDocument,
  type DocumentDecodeDiagnostic,
  type DocumentDecodeResult,
} from './document-codec.js';
export {
  createDocumentSession,
  type DocumentSession,
  type DocumentSessionSnapshot,
  type DocumentLoadedEvidence,
  type DocumentCommitEvidence,
  type DocumentSaveTicket,
  type DocumentSaveOutcome,
} from './document-session.js';
export {
  createDocumentIdentity,
  createDocumentEnvelope,
  replaceDocumentContent,
  type DocumentIdentity,
  type DocumentEnvelopeInput,
  type DocumentEnvelope,
  type DocumentContentValue,
  type DocumentContentRecord,
} from './document-envelope.js';
export { describeSceneObjectSpatialPoint, type SceneObjectSpatialDescription } from './scene-spatial-point.js';
export { updateSceneObjectSpatialPlacement } from './scene-spatial-placement.js';
export { describeViewportMapping } from './viewport-mapping.js';
export { describeOrthographicPlaneProjection } from './plane-projection.js';
export { describeSceneObjectAlignment } from './scene-visual-alignment.js';
export { describeGridConversion } from './grid-conversion.js';
export { createOrthogonalGridDefinition, type OrthogonalGridDefinition } from './orthogonal-grid.js';
export {
  createCoordinateSpaceReference,
  createCoordinateSpaceDefinition,
  createSpatialPoint2D,
  type CoordinateSpaceReference,
  type CoordinateSpaceDefinition,
  type CoordinatePair2D,
  type SpatialPoint2D,
} from './coordinate-space.js';
export { describeSceneObjectVisual, type SceneObjectVisualDescription } from './scene-visual.js';
export {
  diagnoseSceneMembership,
  type SceneDiagnosticCode,
  type SceneDiagnosticTarget,
  type SceneDiagnostic,
  type SceneMembershipDiagnosticResult,
} from './scene-diagnostics.js';
export {
  createSceneMembership,
  addSceneObject,
  removeSceneObject,
  replaceSceneObject,
  updateSceneObjectPlacement,
  listSceneObjects,
  getSceneObject,
  reorderSceneObjects,
  type SceneObjectReference,
  type SceneObjectAttachment,
  type SceneObjectPlacement,
  type SceneObjectMembershipInput,
  type SceneObjectMembership,
  type SceneMembershipInput,
  type SceneMembership,
} from './scene-membership.js';
export {
  createSceneObjectDefinition,
  type SceneObjectDefinitionInput,
  type SceneObjectDefinition,
} from './scene-object-definition.js';
export {
  createSceneIdentity,
  createSceneDefinition,
  type SceneIdentityInput,
  type SceneIdentity,
  type SceneDefinitionInput,
  type SceneDefinition,
} from './scene-definition.js';
export { describeResolvedVisualAsset, type AssetVisualDescription } from './asset-visual.js';
export { relocateAssetSource, rebindAssetReference } from './asset-transitions.js';
export { readAssetDefinitionSnapshot } from './asset-snapshot.js';
export {
  diagnoseAssetReference,
  diagnoseAssetDefinition,
  type AssetDiagnosticCode,
  type AssetDiagnosticTarget,
  type AssetDiagnostic,
  type AssetReferenceDiagnosticResult,
  type AssetDefinitionDiagnosticResult,
} from './asset-diagnostics.js';
export {
  createAssetCatalog,
  getAssetDefinition,
  registerAssetDefinition,
  updateAssetDefinition,
  removeAssetDefinition,
  resolveAssetReference,
  type AssetCatalogInput,
  type AssetCatalog,
  type AssetReferenceResolution,
} from './asset-catalog.js';
export {
  createAssetReference,
  type AssetReferenceInput,
  type AssetReference,
} from './asset-reference.js';
export {
  createResourceLocator,
  type ResourceLocator,
  type AssetSourceReference,
} from './asset-sources.js';
export {
  createAssetDefinition,
  type AssetDefinitionInput,
  type AssetDefinition,
  type AssetMetadata,
  type AssetMetadataValue,
} from './asset-definition.js';
export {
  createAssetIdentity,
  type AssetIdentityInput,
  type AssetIdentity,
} from './asset-identity.js';
export {
  createEditorPreviewHost,
  openEditorPreviewHost,
  type EditorPreviewHost,
  type EditorPreviewHostSnapshot,
} from './preview-host.js';
import {
  createRenderSession,
  createRenderSessionLifecycle,
  getRenderFailure,
  type RenderFailure,
  type RenderSessionDescriptor,
  type RenderSessionDisposal,
  type RenderSessionLifecycle,
} from '@rpg-platform/runtime-render';

/**
 * Host adapter seam only: the caller supplies its own target and retains the
 * descriptor. No preview UI, target validation or renderer initialization occurs.
 */
export function createEditorPreviewSession(target: object): RenderSessionDescriptor {
  return createRenderSession({ target });
}

/** Accept the host binding explicitly; this does not initialize graphics or UI. */
export function initializeEditorPreviewSession(target: object): RenderSessionLifecycle {
  const session = createRenderSessionLifecycle({ target });
  try {
    session.initialize();
  } catch (error) {
    session.dispose();
    throw error;
  }
  return session;
}

/** Host calls before removing its target, then drops its own handles/snapshots. */
export function disposeEditorPreviewSession(session: RenderSessionLifecycle): RenderSessionDisposal {
  return session.dispose();
}

/** Safe diagnostic forwarding only; the host decides how to present unknown errors. */
export function getEditorPreviewFailure(error: unknown): RenderFailure | undefined {
  return getRenderFailure(error);
}
export { createScenePreviewBridge, type ScenePreviewBridge, type ScenePreviewPresentation,
  type ScenePreviewOutcome } from './scene-preview.js';
export { createProjectManifest, readProjectManifest } from './project-manifest.js';
export type { ProjectManifest, ProjectManifestInput, ProjectMetadata, ProjectResourceRoot,
  ProjectDocumentReference, ProjectActiveScene } from './project-manifest.js';
export { diagnoseProjectManifest } from './project-diagnostics.js';
export type { ProjectDiagnostic, ProjectManifestDiagnosis } from './project-diagnostics.js';
export { ProjectValidationError } from './project-validation.js';
export { setProjectResourceRoots } from './project-resource-roots.js';
export { createProjectRootBinding, resolveProjectLocator } from './project-root-binding.js';
export type { ProjectRootBinding } from './project-root-binding.js';
export { trackProjectDocument, listProjectDocuments, getProjectDocument, updateProjectDocument,
  removeProjectDocument, diagnoseProjectDocuments } from './project-document-tracking.js';
export { setProjectActiveScene, clearProjectActiveScene, getProjectActiveScene } from './project-active-scene.js';
export { createProjectSession, getProjectSessionSnapshot, openProjectSession,
  replaceProjectManifest, closeProjectSession } from './project-session.js';
export type { ProjectSession, ProjectSessionSnapshot } from './project-session.js';
export { createProject } from './project-create.js';
export type { CreateProjectOptions } from './project-create.js';
export { openProject, projectDocumentContext } from './project-open.js';
export type { OpenProjectOptions, ProjectOpenResult } from './project-open.js';
export { saveProject } from './project-save.js';
export type { ProjectSaveResult } from './project-save.js';
export { createAssetManagerProject, getAssetManagerProjectSnapshot, adoptAssetManagerCatalog,
  closeAssetManagerProject, admitAssetManagerIdentity, rebuildAssetManagerCatalog } from './asset-manager-project.js';
export type { AssetManagerProject, AssetManagerProjectSnapshot } from './asset-manager-project.js';
export { assetBrowserCategories, describeAssetBrowserCategory } from './asset-manager-category.js';
export type { AssetBrowserCategoryResult } from './asset-manager-category.js';
export { registerManagedAsset, updateManagedAssetMetadata, unregisterManagedAsset } from './asset-manager-registration.js';
export type { AssetRegistrationCandidate } from './asset-manager-registration.js';
export { registerExistingAssetResource } from './asset-manager-import.js';
export type { ExistingResourceRequest, ExistingResourceObservation, ExistingResourcePort, ExistingResourceResult } from './asset-manager-import.js';
export { searchManagedAssets } from './asset-manager-search.js';
export type { AssetSearchRequest, AssetSearchResult } from './asset-manager-search.js';
export { inspectManagedAsset } from './asset-manager-inspector.js';
export type { AssetInspectorResult } from './asset-manager-inspector.js';
export { selectManagedAsset, getManagedAssetSelection } from './asset-manager-selection.js';
export type { AssetSelectionResult } from './asset-manager-selection.js';
export { createAssetPreviewController } from './asset-manager-preview.js';
export type { AssetPreviewRequest, AssetPreviewAcquisition, AssetPreviewSnapshot, AssetPreviewController } from './asset-manager-preview.js';
export { createMapProfile, readMapProfile, mapDocumentContext, replaceMapProfile } from './map-profile.js';
export type { MapProfile, MapLayerDefinition, MapProfileSnapshot, MapProfileReadResult } from './map-profile.js';
export { mapExtentLimits, createMapExtent, diagnoseMapCell, containsMapCell, resizeMapExtent } from './map-bounds.js';
export type { MapExtentCells, MapCell } from './map-bounds.js';
export { mapCellToPlacement, mapPlacementToCell, replaceMapGrid } from './map-grid.js';
export { addMapLayer, updateMapLayer, reorderMapLayers, removeMapLayer, describeMapLayers } from './map-layers.js';
export { setMapBackground, clearMapBackground, describeMapBackgroundLayout } from './map-background.js';
export { setMapTile, removeMapTile } from './map-tiles.js';
export { createMap, type CreateMapOptions, type CreateMapResult } from './map-create.js';
export { openMap, type OpenMapOptions, type OpenMapResult } from './map-open.js';
export { saveMap, type SaveMapOptions, type SaveMapResult } from './map-save.js';
export { createVisualPropertiesProfile, readVisualPropertiesProfile } from './visual-properties-profile.js';
export type { VisualPropertiesProfile, VisualProfileRead } from './visual-properties-profile.js';
export { createVisualInspectorContext } from './visual-inspector-context.js';
export type { VisualInspectorBinding, VisualInspectorSelection, VisualInspectorSnapshot, VisualInspectorContext } from './visual-inspector-context.js';
export { readVisualPosition, setVisualPosition } from './visual-position.js';
export type { VisualPositionRead } from './visual-position.js';
export { readVisualDirection, setVisualDirection } from './visual-direction.js';
export { readVisualLayer, setVisualLayer } from './visual-layer.js';
export type { VisualLayerRead } from './visual-layer.js';
export { readVisualScale, setVisualScale } from './visual-scale.js';
export { readVisualAnchor, setVisualAnchor, describeVisualAlignment } from './visual-anchor.js';
export { readVisualVisibility, setVisualVisibility } from './visual-visibility.js';
