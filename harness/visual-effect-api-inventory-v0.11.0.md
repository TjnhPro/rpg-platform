# VE01 — current public-root inventory

Audited source and freshly emitted declarations at baseline `aceea67f95cb309bdd06f1d6193767bfa06f42ce`. All workspace package versions remain `0.0.0`; this checkpoint adds no root names. Source/emitted name equality is an inventory result, not behavioral proof.

| Project | Source names | Emitted names | Match |
| --- | ---: | ---: | --- |
| runtime-render | 271 | 271 | True |
| editor | 138 | 138 | True |
| game-client | 0 | 0 | True |
| runtime-engine | 0 | 0 | True |
| game-server | 0 | 0 | True |

## Complete emitted names

### runtime-render

```text
AffineTransform2D AtlasFrameGeometry AtlasFrameGeometryResult AtlasFrameResolution
AtlasMetadata AtlasMetadataFrame AtlasMetadataLimits AtlasMetadataPage
AtlasMetadataResult AtlasMetadataRevision AtlasPagePixels AtlasSourceBinding
AtlasTextureView EightWaySpriteClip EightWaySpriteClipInput EightWaySpriteFrameResolution
GridCell2D GridConversionSpace GridScenePosition2D OrthogonalGridConversion
OrthographicCameraConfiguration OrthographicCameraConfigurationInput OrthographicPlaneProjection PlanarInverseResult
PlanarPoint2D PlanarTransform2D PlaneProjectionPoint2D PngDecodeFailure
PngDecodeLimits PngImageDecode PngImageObservation PngLoadScope
ProjectionPlane2D RenderCamera RenderCameraBoundsMovement RenderCameraBoundsPolicy
RenderCameraBoundsTransitionInput RenderCameraBoundsTransitionResult RenderCameraFocusZoomInput RenderCameraFrameSnapshot
RenderCameraGroundConfiguration RenderCameraGroundInverseInput RenderCameraGroundInverseResult RenderCameraGroundPoint
RenderCameraGroundProjectionResult RenderCameraInput RenderCameraPan RenderCameraProjectionResult
RenderCameraSceneBinding RenderCameraSceneBindingSnapshot RenderCameraSelectedPlaneInput RenderCameraSelectedPlaneResult
RenderCameraSnapshot RenderCameraUpdate RenderCameraViewSnapshot RenderCameraViewportSnapshot
RenderCameraZoomLimits RenderFailure RenderFrameAcquisition RenderFrameFailure
RenderFrameInvalidationSnapshot RenderFrameReceipt RenderFrameSession RenderGraphicsSnapshot
RenderHostBinding RenderSessionDescriptor RenderSessionDisposal RenderSessionLifecycle
RenderSessionSnapshot RenderTargetCapabilities RenderTexture RenderTextureFailure
RenderTextureOptions RenderTextureSnapshot RenderViewportMetrics RenderViewportResizeReceipt
RenderViewportSizeLimits RenderViewportSizePlan RenderViewportSnapshot RenderVisualBindingFailure
RenderVisualCorrelation RenderVisualDepthFailure RenderVisualDepthKey RenderVisualDiagnostic
RenderVisualDrawCandidate RenderVisualFrameBinding RenderVisualInstance RenderVisualInstanceFailure
RenderVisualInstanceInput RenderVisualInstanceOrder RenderVisualInstanceProperties RenderVisualInstanceSnapshot
RenderVisualInstanceTransformInput RenderVisualInstanceTransformSnapshot RenderVisualInstanceVisibilitySnapshot RenderVisualLayerFailure
RenderVisualLayerInput RenderVisualLayerOrderingPolicy RenderVisualLayerSnapshot RenderVisualResourceBindingInput
RenderVisualResourceBindingSnapshot RenderVisualScene RenderVisualSceneDiagnostics RenderVisualSceneDisposal
RenderVisualSceneSnapshot RenderVisualSpriteLayout ResourceCacheLimits ScreenMapping2D
SharedPngLoad SharedPngLoadSnapshot SpriteAnimationAdvanceResult SpriteAnimationClip
SpriteAnimationFrameSample SpriteAnimationPlayback SpriteAnimationPlaybackCommand SpriteAnimationPlaybackInput
SpriteAnimationPlaybackSnapshot SpriteAnimationPlaybackState SpriteAnimationRepeat SpriteAnimationTiming
SpriteAnimationTimingInput SpriteAnimationVisualBinding SpriteAnimationVisualFrameInput SpriteAnimationVisualFrameResult
SpriteDirectionIndex SpriteDirectionSequences SpriteEightWayConvention SpriteFrameAlignmentData
SpriteFrameAlignmentInput SpriteFrameAlignmentResult SpriteFrameSequence SpriteTimedClip
SpriteTimedClipInput UnityAtlasSheet ViewportMapping2D ViewportMetrics2D
VisualAlignment2D VisualAnchor2D VisualFrameReference VisualOrientation2D
VisualResourceCache VisualResourceCacheFailure VisualResourceCacheSnapshot VisualResourceDescriptor
VisualResourceLease VisualResourceLeaseSnapshot VisualResourcePreparation VisualSourceAcquisition
VisualSourceFailureCode VisualSourceLoad VisualSourceLoadObservation VisualSourceProvider
VisualSourceRequest VisualSourceResponse VisualSourceScope acquireVisualSource
addRenderVisualInstance addRenderVisualLayer advanceSpriteAnimationPlayback applyPlanarPoint2D
beginRenderFrameSession bindRenderCameraToVisualScene bindRenderVisualInstanceResource commandSpriteAnimationPlayback
composePlanarTransforms2D createAtlasTextureView createConfiguredRenderCamera createEightWaySpriteClip
createOrthogonalGridConversion createOrthographicCameraConfiguration createOrthographicPlaneProjection createPlanarTransform2D
createPngImageDecode createPngLoadScope createRenderCamera createRenderCameraGroundConfiguration
createRenderFrameSession createRenderSession createRenderSessionLifecycle createRenderVisualScene
createSpriteAnimationClip createSpriteAnimationPlayback createSpriteAnimationTiming createSpriteAnimationVisualBinding
createSpriteFrameSequence createSpriteTimedClip createViewportMapping2D createVisualAnchor2D
createVisualFrameReference createVisualOrientation2D createVisualResourceCache createVisualSourceLoad
getAtlasMetadataRevision getRenderCameraFrameSnapshot getRenderCameraViewSnapshot getRenderCameraViewportSnapshot
getRenderFailure getRenderFrameFailure getRenderFrameInvalidationSnapshot getRenderTextureFailure
getRenderTextureSnapshot getRenderViewportSnapshot getRenderVisualBindingFailure getRenderVisualDepthFailure
getRenderVisualDiagnostic getRenderVisualInstance getRenderVisualInstanceDepthKey getRenderVisualInstanceFailure
getRenderVisualInstanceOrder getRenderVisualInstanceResource getRenderVisualInstanceSnapshot getRenderVisualInstanceSpriteLayout
getRenderVisualInstanceTransform getRenderVisualInstanceVisibility getRenderVisualLayer getRenderVisualLayerFailure
getRenderVisualLayerOrderingPolicy getRenderVisualSceneDiagnostics getSpriteAnimationPlaybackSnapshot getVisualResourceCacheFailure
gridCellToScenePosition inspectRenderTarget invalidateRenderFrame invalidateVisualResourceCache
invertPlanarTransform2D listRenderVisualDrawCandidates listRenderVisualInstances listRenderVisualLayers
panRenderCamera parseUnityAtlasMetadata planRenderViewportSize prepareVisualResource
projectPlanePoint2D projectPointToViewport2D projectRenderCameraGroundPoint projectRenderCameraPoint
removeRenderVisualInstance removeRenderVisualLayer renderVisualResourceDemo resizeRenderViewport
resolveAtlasFrame resolveAtlasFrameGeometry resolveEightWaySpriteFrame resolveSpriteFrameAlignment
resolveVisualAlignment2D resumeRenderViewport sampleSpriteAnimationTiming scenePositionToGridCell
screenPointToViewport2D screenToRenderCameraGround screenToRenderCameraSelectedPlane selectEightWaySpriteDirection
setRenderCameraCenter setRenderCameraZoom setRenderVisualInstanceDepthKey setRenderVisualInstanceOrder
setRenderVisualInstanceSpriteLayout setRenderVisualInstanceTransform setRenderVisualInstanceVisible setRenderVisualLayerOrderingPolicy
suspendRenderViewport toAffineTransform2D transitionRenderCameraWithinBounds updateRenderVisualInstance
updateRenderVisualLayer uploadPngTexture viewportPointToPlane2D viewportPointToScreen2D
viewportToRenderCameraGround viewportToRenderCameraSelectedPlane zoomRenderCameraAtFocus
```

### editor

```text
AssetCatalog AssetCatalogInput AssetDefinition AssetDefinitionDiagnosticResult
AssetDefinitionInput AssetDiagnostic AssetDiagnosticCode AssetDiagnosticTarget
AssetIdentity AssetIdentityInput AssetMetadata AssetMetadataValue
AssetReference AssetReferenceDiagnosticResult AssetReferenceInput AssetReferenceResolution
AssetSourceReference AssetVisualDescription CoordinatePair2D CoordinateSpaceDefinition
CoordinateSpaceReference DocumentCleanupReceipt DocumentCleanupResult DocumentCommitEvidence
DocumentCommitReceipt DocumentCompatibilityResult DocumentContentRecord DocumentContentValue
DocumentDecodeDiagnostic DocumentDecodeResult DocumentDiagnostic DocumentDiagnosticCode
DocumentEnvelope DocumentEnvelopeInput DocumentIdentity DocumentLoadResult
DocumentLoadedEvidence DocumentMigration DocumentMigrationResult DocumentPersistenceFailure
DocumentReadPort DocumentReadResult DocumentSaveOutcome DocumentSaveResult
DocumentSaveTicket DocumentSession DocumentSessionSnapshot DocumentStorageObservation
DocumentValidationContext DocumentValidationResult DocumentWritePort DocumentWritePrecondition
DocumentWriteRequest EditorPreviewHost EditorPreviewHostSnapshot OrthogonalGridDefinition
ResourceLocator SceneDefinition SceneDefinitionInput SceneDiagnostic
SceneDiagnosticCode SceneDiagnosticTarget SceneIdentity SceneIdentityInput
SceneMembership SceneMembershipDiagnosticResult SceneMembershipInput SceneObjectAttachment
SceneObjectDefinition SceneObjectDefinitionInput SceneObjectMembership SceneObjectMembershipInput
SceneObjectPlacement SceneObjectReference SceneObjectSpatialDescription SceneObjectVisualDescription
ScenePreviewBridge ScenePreviewOutcome ScenePreviewPresentation SpatialPoint2D
addSceneObject createAssetCatalog createAssetDefinition createAssetIdentity
createAssetReference createCoordinateSpaceDefinition createCoordinateSpaceReference createDocumentEnvelope
createDocumentIdentity createDocumentSession createEditorPreviewHost createEditorPreviewSession
createOrthogonalGridDefinition createResourceLocator createSceneDefinition createSceneIdentity
createSceneMembership createSceneObjectDefinition createScenePreviewBridge createSpatialPoint2D
describeGridConversion describeOrthographicPlaneProjection describeResolvedVisualAsset describeSceneObjectAlignment
describeSceneObjectSpatialPoint describeSceneObjectVisual describeViewportMapping deserializeDocument
diagnoseAssetDefinition diagnoseAssetReference diagnoseDocument diagnoseSceneMembership
disposeEditorPreviewSession getAssetDefinition getEditorPreviewFailure getSceneObject
initializeEditorPreviewSession inspectDocumentCompatibility listSceneObjects loadDocument
migrateDocument openEditorPreviewHost readAssetDefinitionSnapshot rebindAssetReference
registerAssetDefinition relocateAssetSource removeAssetDefinition removeSceneObject
reorderSceneObjects replaceDocumentContent replaceSceneDocumentObject replaceSceneObject
resolveAssetReference saveDocument serializeDocument updateAssetDefinition
updateSceneObjectPlacement updateSceneObjectSpatialPlacement
```

### game-client

```text
(no public-root names)
```

### runtime-engine

```text
(no public-root names)
```

### game-server

```text
(no public-root names)
```

## Exact single-sequence versus live-playback seam

These are actual freshly emitted owner declarations (comments omitted below). They are not proposed VFX exports. Full signatures remain in the built package root and its emitted dependencies.

### sprite-animation-timing

```ts
import { type SpriteAnimationClip } from './sprite-frame-sequence.js';

export type SpriteAnimationTimingInput = {
    readonly fps: number;
    readonly frameIntervalMs?: never;
} | {
    readonly frameIntervalMs: number;
    readonly fps?: never;
};
export interface SpriteAnimationTiming {
    readonly frameIntervalMs: number;
}
export type SpriteAnimationRepeat = 'once' | 'repeat';
export interface SpriteTimedClipInput {
    readonly clip: SpriteAnimationClip;
    readonly timing: SpriteAnimationTimingInput;
    readonly repeat: SpriteAnimationRepeat;
}

export interface SpriteTimedClip {
    readonly clip: SpriteAnimationClip;
    readonly timing: SpriteAnimationTiming;
    readonly repeat: SpriteAnimationRepeat;
    readonly frameCount: number;
    readonly durationMs: number;
}
export interface SpriteAnimationFrameSample {

    readonly elapsedMs: number;
    readonly frameIndex: number;
    readonly completed: boolean;
}

export declare function createSpriteAnimationTiming(input: SpriteAnimationTimingInput): SpriteAnimationTiming;

export declare function createSpriteTimedClip(input: SpriteTimedClipInput): SpriteTimedClip;

export declare function sampleSpriteAnimationTiming(input: SpriteAnimationTiming, frameCount: number, repeat: SpriteAnimationRepeat, elapsedMs: number): SpriteAnimationFrameSample;
```

### sprite-animation-playback

```ts
import { type EightWaySpriteClip, type SpriteDirectionIndex } from './sprite-eight-way.js';
import type { VisualFrameReference } from './atlas-frame.js';
export type SpriteAnimationPlaybackState = 'stopped' | 'playing' | 'paused' | 'completed' | 'disposed';

export interface SpriteAnimationPlayback {
    readonly id: symbol;
}
export interface SpriteAnimationPlaybackInput {
    readonly clips: readonly EightWaySpriteClip[];
    readonly clipId: string;
    readonly directionIndex: SpriteDirectionIndex;
}
export interface SpriteAnimationPlaybackSnapshot {
    readonly id: symbol;
    readonly projectId: string;
    readonly clipId: string;
    readonly directionIndex: SpriteDirectionIndex;
    readonly state: SpriteAnimationPlaybackState;

    readonly elapsedMs: number;
    readonly sampledElapsedMs: number;
    readonly frameIndex: number;

    readonly frame: VisualFrameReference;
    readonly completed: boolean;
}
export type SpriteAnimationPlaybackCommand = {
    readonly type: 'play';
    readonly clipId: string;
} | {
    readonly type: 'selectClip';
    readonly clipId: string;
} | {
    readonly type: 'setDirection';
    readonly directionIndex: SpriteDirectionIndex;
} | {
    readonly type: 'pause' | 'resume' | 'stop' | 'dispose';
};

export interface SpriteAnimationAdvanceResult {
    readonly snapshot: SpriteAnimationPlaybackSnapshot;

    readonly frameChanged: boolean;

    readonly completedNow: boolean;
}

export declare function createSpriteAnimationPlayback(input: SpriteAnimationPlaybackInput): SpriteAnimationPlayback;

export declare function getSpriteAnimationPlaybackSnapshot(handle: SpriteAnimationPlayback): SpriteAnimationPlaybackSnapshot;

export declare function commandSpriteAnimationPlayback(handle: SpriteAnimationPlayback, input: SpriteAnimationPlaybackCommand): SpriteAnimationPlaybackSnapshot;

export declare function advanceSpriteAnimationPlayback(handle: SpriteAnimationPlayback, deltaMs: number): SpriteAnimationAdvanceResult;
```

### sprite-animation-visual-binding

```ts
import type { RenderFrameSession } from './frame-session.js';
import { type AtlasPagePixels, type AtlasFrameGeometryResult } from './atlas-geometry.js';
import type { AtlasMetadata } from './atlas-metadata.js';
import type { VisualResourceLease } from './visual-resource-cache.js';
import { type SpriteFrameAlignmentData, type SpriteFrameAlignmentResult } from './sprite-frame-alignment.js';
import { type SpriteAnimationPlayback, type SpriteAnimationPlaybackSnapshot } from './sprite-animation-playback.js';
import { type RenderVisualScene, type RenderVisualInstance, type RenderVisualResourceBindingSnapshot } from './visual-scene.js';
import type { PlanarPoint2D } from './planar-affine.js';

export interface SpriteAnimationVisualFrameInput {
    readonly resource: VisualResourceLease;
    readonly expectedSourceRevision: string;
    readonly atlas: AtlasMetadata | null;
    readonly expectedRevision: symbol;
    readonly pixels: AtlasPagePixels;
    readonly planeUnitsPerPixel: PlanarPoint2D;
    readonly authored: SpriteFrameAlignmentData | null;
}
export type SpriteAnimationVisualFrameResult = {
    readonly status: 'bound';
    readonly playback: SpriteAnimationPlaybackSnapshot;
    readonly resource: RenderVisualResourceBindingSnapshot;
    readonly alignment: Extract<SpriteFrameAlignmentResult, {
        status: 'resolved';
    }>;
} | {
    readonly status: 'rejected';
    readonly code: Extract<AtlasFrameGeometryResult, {
        status: 'rejected';
    }>['code'] | Extract<SpriteFrameAlignmentResult, {
        status: 'rejected';
    }>['code'] | 'FRAME_NOT_READY' | 'PLAYBACK_DISPOSED' | 'BINDING_DISPOSED' | 'INCOMPATIBLE_TRANSFORM' | 'GROUND_ANCHOR_MISMATCH';
};

export interface SpriteAnimationVisualBinding {
    readonly sync: (input: SpriteAnimationVisualFrameInput) => SpriteAnimationVisualFrameResult;

    readonly replacePlayback: (playback: SpriteAnimationPlayback) => void;

    readonly unbind: () => void;
}

export declare function createSpriteAnimationVisualBinding(session: RenderFrameSession, scene: RenderVisualScene, instance: RenderVisualInstance, playback: SpriteAnimationPlayback): SpriteAnimationVisualBinding;
```

No VFX definition/instance/attachment or single-sequence live-playback root exists at this baseline. The neutral timed-clip sampler exists; the issued live playback requires EightWaySpriteClip, and the binding requires that playback. See [U1 and lifecycle ledger](visual-effect-v0.11.0.md).
