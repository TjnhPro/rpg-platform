import '@rpg-platform/runtime-engine';
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
