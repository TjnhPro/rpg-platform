# Phase10 closure — exact API, file and commit inventory

Baseline/merge-base/current origin/main: `78dc4a9d14288df33ca46b3af4d23d09ceef9b82`. Audited implementation HEAD: `e1a67c8f55e64ac22c5191dc94b9346260193533`.
Closure is documentation only; its containing SHA and push/PR CI are recorded in PR10 after commit.

## Checkpoint and remote workflow ledger

Historical workflows below were refreshed from GitHub during SA13, matching event and exact checkpoint SHA. The final row belongs to the closure commit and is resolved in the PR ledger.

| Checkpoint | Exact implementation commit | Push / PR CI |
| --- | --- | --- |
| [v0.10.0 SA01](../../harness/checkpoints/sprite-animation-v0.10.0.md) | `35a87b27d6e3c3581fb2a867369dc6947696b46d` | [40049688679](https://github.com/TjnhPro/rpg-platform/actions/runs/40049688679) completed/success / [40049710331](https://github.com/TjnhPro/rpg-platform/actions/runs/40049710331) completed/success |
| [v0.10.1 SA02](../../harness/checkpoints/sprite-animation-v0.10.1.md) | `00b3fd31c02c498cdd86ba72996a704fe5948401` | [40050040810](https://github.com/TjnhPro/rpg-platform/actions/runs/40050040810) completed/success / [40050045332](https://github.com/TjnhPro/rpg-platform/actions/runs/40050045332) completed/success |
| [v0.10.2 SA03](../../harness/checkpoints/sprite-animation-v0.10.2.md) | `f08b117c3210b9ac442e580c6c94d19a2aff830d` | [40050474668](https://github.com/TjnhPro/rpg-platform/actions/runs/40050474668) completed/success / [40050478084](https://github.com/TjnhPro/rpg-platform/actions/runs/40050478084) completed/success |
| [v0.10.3 SA04](../../harness/checkpoints/sprite-animation-v0.10.3.md) | `72aae5c12d1e8ee29db2560823ad9440b6d82464` | [40051026001](https://github.com/TjnhPro/rpg-platform/actions/runs/40051026001) completed/success / [40051028821](https://github.com/TjnhPro/rpg-platform/actions/runs/40051028821) completed/success |
| [v0.10.4 SA05](../../harness/checkpoints/sprite-animation-v0.10.4.md) | `c70bc4c3dae7e190602738e6a87f38aa6045fce0` | [40051562683](https://github.com/TjnhPro/rpg-platform/actions/runs/40051562683) completed/success / [40051566404](https://github.com/TjnhPro/rpg-platform/actions/runs/40051566404) completed/success |
| [v0.10.5 SA06](../../harness/checkpoints/sprite-animation-v0.10.5.md) | `6961c24b405353d3bd56018eebf58379ea49a476` | [40051992839](https://github.com/TjnhPro/rpg-platform/actions/runs/40051992839) completed/success / [40051996850](https://github.com/TjnhPro/rpg-platform/actions/runs/40051996850) completed/success |
| [v0.10.6 SA07](../../harness/checkpoints/sprite-animation-v0.10.6.md) | `428554a919968157fc78ace2254aa1accf26f2be` | [40052559863](https://github.com/TjnhPro/rpg-platform/actions/runs/40052559863) completed/success / [40052564415](https://github.com/TjnhPro/rpg-platform/actions/runs/40052564415) completed/success |
| [v0.10.7 SA08](../../harness/checkpoints/sprite-animation-v0.10.7.md) | `0f099ec203ab5e806a1d0a5fd01aa7605c49fa5c` | [40053543946](https://github.com/TjnhPro/rpg-platform/actions/runs/40053543946) completed/success / [40053547128](https://github.com/TjnhPro/rpg-platform/actions/runs/40053547128) completed/success |
| [v0.10.8 SA09](../../harness/checkpoints/sprite-animation-v0.10.8.md) | `6ff97e83ef1255865d1285210008c2ea104c5892` | [40054458699](https://github.com/TjnhPro/rpg-platform/actions/runs/40054458699) completed/success / [40054464197](https://github.com/TjnhPro/rpg-platform/actions/runs/40054464197) completed/success |
| [v0.10.9 SA10](../../harness/checkpoints/sprite-animation-v0.10.9.md) | `756720ae037363ace05b3e09e5fb40b88b1e9c7c` | [40055415899](https://github.com/TjnhPro/rpg-platform/actions/runs/40055415899) completed/success / [40055419080](https://github.com/TjnhPro/rpg-platform/actions/runs/40055419080) completed/success |
| [v0.10.10 SA11](../../harness/checkpoints/sprite-animation-v0.10.10.md) | `2c11bbc60cf6fa36a39813e7f5e40188279debfd` | [40056542234](https://github.com/TjnhPro/rpg-platform/actions/runs/40056542234) completed/success / [40056544800](https://github.com/TjnhPro/rpg-platform/actions/runs/40056544800) completed/success |
| [v0.10.11 SA12](../../harness/checkpoints/sprite-animation-v0.10.11.md) | `e1a67c8f55e64ac22c5191dc94b9346260193533` | [40057655831](https://github.com/TjnhPro/rpg-platform/actions/runs/40057655831) completed/success / [40057659087](https://github.com/TjnhPro/rpg-platform/actions/runs/40057659087) completed/success |
| [v0.10.12 SA13](../../harness/checkpoints/sprite-animation-v0.10.12.md) | Containing closure commit; PR ledger | Exact closure HEAD checked after push |

## Emitted public root compatibility

TypeScript compiler emitted declaration-only programs for exact baseline sources and current sources, enumerated public-root symbols and compared each old declaration with comments removed. This includes type aliases/unions/functions, not only names or runtime values. No source rewrite or installed-package mutation was used.

| Project | Baseline names | Current names | Added | Removed | Changed old declarations |
| --- | ---: | ---: | ---: | ---: | ---: |
| runtime-render | 231 | 271 | 40 | 0 | 0 |
| editor | 138 | 138 | 0 | 0 | 0 |
| game-client | 0 | 0 | 0 | 0 | 0 |
| runtime-engine | 0 | 0 | 0 | 0 | 0 |
| game-server | 0 | 0 | 0 | 0 | 0 |

## All 40 additive Render root names, by actual owner module

Every symbol below is owned by runtime-render. SA02 through SA08 compiled Editor/Client consumers at introduction (linked checkpoint records), and SA13 rebuilds all five projects plus the strict manual and installed consumers. No old discriminated union was extended.

### runtime-render/src/sprite-frame-sequence.ts

[Current source](../src/sprite-frame-sequence.ts)

```ts
export declare function createSpriteFrameSequence(input: SpriteFrameSequence): SpriteFrameSequence;
```

```ts
export declare function createSpriteAnimationClip(input: SpriteAnimationClip): SpriteAnimationClip;
```

```ts
export interface SpriteFrameSequence {
    readonly frames: readonly VisualFrameReference[];
}
```

```ts
export interface SpriteAnimationClip {
    readonly clipId: string;
    readonly sequence: SpriteFrameSequence;
}
```

### runtime-render/src/sprite-animation-timing.ts

[Current source](../src/sprite-animation-timing.ts)

```ts
export declare function createSpriteAnimationTiming(input: SpriteAnimationTimingInput): SpriteAnimationTiming;
```

```ts
export declare function createSpriteTimedClip(input: SpriteTimedClipInput): SpriteTimedClip;
```

```ts
export declare function sampleSpriteAnimationTiming(input: SpriteAnimationTiming, frameCount: number, repeat: SpriteAnimationRepeat, elapsedMs: number): SpriteAnimationFrameSample;
```

```ts
export type SpriteAnimationTimingInput = {
    readonly fps: number;
    readonly frameIntervalMs?: never;
} | {
    readonly frameIntervalMs: number;
    readonly fps?: never;
};
```

```ts
export interface SpriteAnimationTiming {
    readonly frameIntervalMs: number;
}
```

```ts
export type SpriteAnimationRepeat = 'once' | 'repeat';
```

```ts
export interface SpriteTimedClipInput {
    readonly clip: SpriteAnimationClip;
    readonly timing: SpriteAnimationTimingInput;
    readonly repeat: SpriteAnimationRepeat;
}
```

```ts
export interface SpriteTimedClip {
    readonly clip: SpriteAnimationClip;
    readonly timing: SpriteAnimationTiming;
    readonly repeat: SpriteAnimationRepeat;
    readonly frameCount: number;
    readonly durationMs: number;
}
```

```ts
export interface SpriteAnimationFrameSample {
    readonly elapsedMs: number;
    readonly frameIndex: number;
    readonly completed: boolean;
}
```

### runtime-render/src/sprite-eight-way.ts

[Current source](../src/sprite-eight-way.ts)

```ts
export declare function createEightWaySpriteClip(input: EightWaySpriteClipInput): EightWaySpriteClip;
```

```ts
export declare function selectEightWaySpriteDirection(input: SpriteEightWayConvention, facingInput: VisualOrientation2D): SpriteDirectionIndex;
```

```ts
export declare function resolveEightWaySpriteFrame(input: EightWaySpriteClip, facing: VisualOrientation2D, elapsedMs: number, atlas: AtlasMetadata | null, expectedRevision: symbol): EightWaySpriteFrameResolution;
```

```ts
export type SpriteDirectionIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
```

```ts
export type SpriteDirectionSequences = readonly [
    SpriteFrameSequence,
    SpriteFrameSequence,
    SpriteFrameSequence,
    SpriteFrameSequence,
    SpriteFrameSequence,
    SpriteFrameSequence,
    SpriteFrameSequence,
    SpriteFrameSequence
];
```

```ts
export interface SpriteEightWayConvention {
    readonly axes: VisualOrientation2D['axes'];
    readonly directionZeroAngleRadians: number;
    readonly zeroIndex: SpriteDirectionIndex;
}
```

```ts
export interface EightWaySpriteClipInput {
    readonly clipId: string;
    readonly timing: SpriteAnimationTimingInput;
    readonly repeat: SpriteAnimationRepeat;
    readonly convention: SpriteEightWayConvention;
    readonly directions: SpriteDirectionSequences;
}
```

```ts
export interface EightWaySpriteClip {
    readonly clipId: string;
    readonly timing: SpriteAnimationTiming;
    readonly repeat: SpriteAnimationRepeat;
    readonly convention: SpriteEightWayConvention;
    readonly directions: SpriteDirectionSequences;
}
```

```ts
export interface EightWaySpriteFrameResolution {
    readonly direction: SpriteDirectionIndex;
    readonly sequence: SpriteFrameSequence;
    readonly sample: SpriteAnimationFrameSample;
    readonly resolution: AtlasFrameResolution;
}
```

### runtime-render/src/sprite-animation-playback.ts

[Current source](../src/sprite-animation-playback.ts)

```ts
export declare function createSpriteAnimationPlayback(input: SpriteAnimationPlaybackInput): SpriteAnimationPlayback;
```

```ts
export declare function getSpriteAnimationPlaybackSnapshot(handle: SpriteAnimationPlayback): SpriteAnimationPlaybackSnapshot;
```

```ts
export declare function commandSpriteAnimationPlayback(handle: SpriteAnimationPlayback, input: SpriteAnimationPlaybackCommand): SpriteAnimationPlaybackSnapshot;
```

```ts
export interface SpriteAnimationPlayback {
    readonly id: symbol;
}
```

```ts
export interface SpriteAnimationPlaybackInput {
    readonly clips: readonly EightWaySpriteClip[];
    readonly clipId: string;
    readonly directionIndex: SpriteDirectionIndex;
}
```

```ts
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
```

```ts
export type SpriteAnimationPlaybackState = 'stopped' | 'playing' | 'paused' | 'completed' | 'disposed';
```

```ts
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
```

```ts
export declare function advanceSpriteAnimationPlayback(handle: SpriteAnimationPlayback, deltaMs: number): SpriteAnimationAdvanceResult;
```

```ts
export interface SpriteAnimationAdvanceResult {
    readonly snapshot: SpriteAnimationPlaybackSnapshot;
    readonly frameChanged: boolean;
    readonly completedNow: boolean;
}
```

### runtime-render/src/sprite-frame-alignment.ts

[Current source](../src/sprite-frame-alignment.ts)

```ts
export declare function resolveSpriteFrameAlignment(input: SpriteFrameAlignmentInput): SpriteFrameAlignmentResult;
```

```ts
export interface SpriteFrameAlignmentData {
    readonly reference: VisualFrameReference;
    readonly revision: symbol;
    readonly provenance: string;
    readonly unit: 'image-pixel';
    readonly origin: 'frame-top-left';
    readonly groundAnchor: PlanarPoint2D;
    readonly pivot: PlanarPoint2D;
    readonly localOffset: PlanarPoint2D;
}
```

```ts
export interface SpriteFrameAlignmentInput {
    readonly atlas: AtlasMetadata | null;
    readonly expectedRevision: symbol;
    readonly geometry: AtlasFrameGeometry;
    readonly placement: PlaneProjectionPoint2D;
    readonly orientation: VisualOrientation2D;
    readonly planeUnitsPerPixel: PlanarPoint2D;
    readonly authored: SpriteFrameAlignmentData | null;
}
```

```ts
export type SpriteFrameAlignmentResult = {
    readonly status: 'resolved';
    readonly geometry: AtlasFrameGeometry;
    readonly provenance: string;
    readonly plane: ProjectionPlane2D;
    readonly sourcePivot: {
        readonly unit: 'normalized-frame';
        readonly origin: 'bottom-left';
        readonly x: number;
        readonly y: number;
    };
    readonly anchor: VisualAnchor2D;
    readonly alignment: VisualAlignment2D;
    readonly pixelToPlane: AffineTransform2D;
    readonly ground: PlaneProjectionPoint2D;
} | {
    readonly status: 'rejected';
    readonly code: Extract<AtlasFrameResolution, {
        status: 'unresolved';
    }>['code'] | 'INVALID_FRAME_GEOMETRY' | 'FRAME_ORIGIN_UNAVAILABLE' | 'ALIGNMENT_FRAME_MISMATCH' | 'INCOMPATIBLE_PLANE' | 'NONFINITE_CONVERSION';
};
```

### runtime-render/src/sprite-animation-visual-binding.ts

[Current source](../src/sprite-animation-visual-binding.ts)

```ts
export declare function createSpriteAnimationVisualBinding(session: RenderFrameSession, scene: RenderVisualScene, instance: RenderVisualInstance, playback: SpriteAnimationPlayback): SpriteAnimationVisualBinding;
```

```ts
export interface SpriteAnimationVisualBinding {
    readonly sync: (input: SpriteAnimationVisualFrameInput) => SpriteAnimationVisualFrameResult;
    readonly replacePlayback: (playback: SpriteAnimationPlayback) => void;
    readonly unbind: () => void;
}
```

```ts
export interface SpriteAnimationVisualFrameInput {
    readonly resource: VisualResourceLease;
    readonly expectedSourceRevision: string;
    readonly atlas: AtlasMetadata | null;
    readonly expectedRevision: symbol;
    readonly pixels: AtlasPagePixels;
    readonly planeUnitsPerPixel: PlanarPoint2D;
    readonly authored: SpriteFrameAlignmentData | null;
}
```

```ts
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
```

## Full current root-name inventory

Counts include values and type-only names. The installed Render runtime module has116 enumerable values;271 is the compiler type-plus-value root-symbol count, not116 new APIs.

### runtime-render

```text
AffineTransform2D AtlasFrameGeometry AtlasFrameGeometryResult AtlasFrameResolution AtlasMetadata
AtlasMetadataFrame AtlasMetadataLimits AtlasMetadataPage AtlasMetadataResult AtlasMetadataRevision
AtlasPagePixels AtlasSourceBinding AtlasTextureView EightWaySpriteClip EightWaySpriteClipInput
EightWaySpriteFrameResolution GridCell2D GridConversionSpace GridScenePosition2D OrthogonalGridConversion
OrthographicCameraConfiguration OrthographicCameraConfigurationInput OrthographicPlaneProjection PlanarInverseResult PlanarPoint2D
PlanarTransform2D PlaneProjectionPoint2D PngDecodeFailure PngDecodeLimits PngImageDecode
PngImageObservation PngLoadScope ProjectionPlane2D RenderCamera RenderCameraBoundsMovement
RenderCameraBoundsPolicy RenderCameraBoundsTransitionInput RenderCameraBoundsTransitionResult RenderCameraFocusZoomInput RenderCameraFrameSnapshot
RenderCameraGroundConfiguration RenderCameraGroundInverseInput RenderCameraGroundInverseResult RenderCameraGroundPoint RenderCameraGroundProjectionResult
RenderCameraInput RenderCameraPan RenderCameraProjectionResult RenderCameraSceneBinding RenderCameraSceneBindingSnapshot
RenderCameraSelectedPlaneInput RenderCameraSelectedPlaneResult RenderCameraSnapshot RenderCameraUpdate RenderCameraViewSnapshot
RenderCameraViewportSnapshot RenderCameraZoomLimits RenderFailure RenderFrameAcquisition RenderFrameFailure
RenderFrameInvalidationSnapshot RenderFrameReceipt RenderFrameSession RenderGraphicsSnapshot RenderHostBinding
RenderSessionDescriptor RenderSessionDisposal RenderSessionLifecycle RenderSessionSnapshot RenderTargetCapabilities
RenderTexture RenderTextureFailure RenderTextureOptions RenderTextureSnapshot RenderViewportMetrics
RenderViewportResizeReceipt RenderViewportSizeLimits RenderViewportSizePlan RenderViewportSnapshot RenderVisualBindingFailure
RenderVisualCorrelation RenderVisualDepthFailure RenderVisualDepthKey RenderVisualDiagnostic RenderVisualDrawCandidate
RenderVisualFrameBinding RenderVisualInstance RenderVisualInstanceFailure RenderVisualInstanceInput RenderVisualInstanceOrder
RenderVisualInstanceProperties RenderVisualInstanceSnapshot RenderVisualInstanceTransformInput RenderVisualInstanceTransformSnapshot RenderVisualInstanceVisibilitySnapshot
RenderVisualLayerFailure RenderVisualLayerInput RenderVisualLayerOrderingPolicy RenderVisualLayerSnapshot RenderVisualResourceBindingInput
RenderVisualResourceBindingSnapshot RenderVisualScene RenderVisualSceneDiagnostics RenderVisualSceneDisposal RenderVisualSceneSnapshot
RenderVisualSpriteLayout ResourceCacheLimits ScreenMapping2D SharedPngLoad SharedPngLoadSnapshot
SpriteAnimationAdvanceResult SpriteAnimationClip SpriteAnimationFrameSample SpriteAnimationPlayback SpriteAnimationPlaybackCommand
SpriteAnimationPlaybackInput SpriteAnimationPlaybackSnapshot SpriteAnimationPlaybackState SpriteAnimationRepeat SpriteAnimationTiming
SpriteAnimationTimingInput SpriteAnimationVisualBinding SpriteAnimationVisualFrameInput SpriteAnimationVisualFrameResult SpriteDirectionIndex
SpriteDirectionSequences SpriteEightWayConvention SpriteFrameAlignmentData SpriteFrameAlignmentInput SpriteFrameAlignmentResult
SpriteFrameSequence SpriteTimedClip SpriteTimedClipInput UnityAtlasSheet ViewportMapping2D
ViewportMetrics2D VisualAlignment2D VisualAnchor2D VisualFrameReference VisualOrientation2D
VisualResourceCache VisualResourceCacheFailure VisualResourceCacheSnapshot VisualResourceDescriptor VisualResourceLease
VisualResourceLeaseSnapshot VisualResourcePreparation VisualSourceAcquisition VisualSourceFailureCode VisualSourceLoad
VisualSourceLoadObservation VisualSourceProvider VisualSourceRequest VisualSourceResponse VisualSourceScope
acquireVisualSource addRenderVisualInstance addRenderVisualLayer advanceSpriteAnimationPlayback applyPlanarPoint2D
beginRenderFrameSession bindRenderCameraToVisualScene bindRenderVisualInstanceResource commandSpriteAnimationPlayback composePlanarTransforms2D
createAtlasTextureView createConfiguredRenderCamera createEightWaySpriteClip createOrthogonalGridConversion createOrthographicCameraConfiguration
createOrthographicPlaneProjection createPlanarTransform2D createPngImageDecode createPngLoadScope createRenderCamera
createRenderCameraGroundConfiguration createRenderFrameSession createRenderSession createRenderSessionLifecycle createRenderVisualScene
createSpriteAnimationClip createSpriteAnimationPlayback createSpriteAnimationTiming createSpriteAnimationVisualBinding createSpriteFrameSequence
createSpriteTimedClip createViewportMapping2D createVisualAnchor2D createVisualFrameReference createVisualOrientation2D
createVisualResourceCache createVisualSourceLoad getAtlasMetadataRevision getRenderCameraFrameSnapshot getRenderCameraViewSnapshot
getRenderCameraViewportSnapshot getRenderFailure getRenderFrameFailure getRenderFrameInvalidationSnapshot getRenderTextureFailure
getRenderTextureSnapshot getRenderViewportSnapshot getRenderVisualBindingFailure getRenderVisualDepthFailure getRenderVisualDiagnostic
getRenderVisualInstance getRenderVisualInstanceDepthKey getRenderVisualInstanceFailure getRenderVisualInstanceOrder getRenderVisualInstanceResource
getRenderVisualInstanceSnapshot getRenderVisualInstanceSpriteLayout getRenderVisualInstanceTransform getRenderVisualInstanceVisibility getRenderVisualLayer
getRenderVisualLayerFailure getRenderVisualLayerOrderingPolicy getRenderVisualSceneDiagnostics getSpriteAnimationPlaybackSnapshot getVisualResourceCacheFailure
gridCellToScenePosition inspectRenderTarget invalidateRenderFrame invalidateVisualResourceCache invertPlanarTransform2D
listRenderVisualDrawCandidates listRenderVisualInstances listRenderVisualLayers panRenderCamera parseUnityAtlasMetadata
planRenderViewportSize prepareVisualResource projectPlanePoint2D projectPointToViewport2D projectRenderCameraGroundPoint
projectRenderCameraPoint removeRenderVisualInstance removeRenderVisualLayer renderVisualResourceDemo resizeRenderViewport
resolveAtlasFrame resolveAtlasFrameGeometry resolveEightWaySpriteFrame resolveSpriteFrameAlignment resolveVisualAlignment2D
resumeRenderViewport sampleSpriteAnimationTiming scenePositionToGridCell screenPointToViewport2D screenToRenderCameraGround
screenToRenderCameraSelectedPlane selectEightWaySpriteDirection setRenderCameraCenter setRenderCameraZoom setRenderVisualInstanceDepthKey
setRenderVisualInstanceOrder setRenderVisualInstanceSpriteLayout setRenderVisualInstanceTransform setRenderVisualInstanceVisible setRenderVisualLayerOrderingPolicy
suspendRenderViewport toAffineTransform2D transitionRenderCameraWithinBounds updateRenderVisualInstance updateRenderVisualLayer
uploadPngTexture viewportPointToPlane2D viewportPointToScreen2D viewportToRenderCameraGround viewportToRenderCameraSelectedPlane
zoomRenderCameraAtFocus
```

### editor

```text
AssetCatalog AssetCatalogInput AssetDefinition AssetDefinitionDiagnosticResult AssetDefinitionInput
AssetDiagnostic AssetDiagnosticCode AssetDiagnosticTarget AssetIdentity AssetIdentityInput
AssetMetadata AssetMetadataValue AssetReference AssetReferenceDiagnosticResult AssetReferenceInput
AssetReferenceResolution AssetSourceReference AssetVisualDescription CoordinatePair2D CoordinateSpaceDefinition
CoordinateSpaceReference DocumentCleanupReceipt DocumentCleanupResult DocumentCommitEvidence DocumentCommitReceipt
DocumentCompatibilityResult DocumentContentRecord DocumentContentValue DocumentDecodeDiagnostic DocumentDecodeResult
DocumentDiagnostic DocumentDiagnosticCode DocumentEnvelope DocumentEnvelopeInput DocumentIdentity
DocumentLoadResult DocumentLoadedEvidence DocumentMigration DocumentMigrationResult DocumentPersistenceFailure
DocumentReadPort DocumentReadResult DocumentSaveOutcome DocumentSaveResult DocumentSaveTicket
DocumentSession DocumentSessionSnapshot DocumentStorageObservation DocumentValidationContext DocumentValidationResult
DocumentWritePort DocumentWritePrecondition DocumentWriteRequest EditorPreviewHost EditorPreviewHostSnapshot
OrthogonalGridDefinition ResourceLocator SceneDefinition SceneDefinitionInput SceneDiagnostic
SceneDiagnosticCode SceneDiagnosticTarget SceneIdentity SceneIdentityInput SceneMembership
SceneMembershipDiagnosticResult SceneMembershipInput SceneObjectAttachment SceneObjectDefinition SceneObjectDefinitionInput
SceneObjectMembership SceneObjectMembershipInput SceneObjectPlacement SceneObjectReference SceneObjectSpatialDescription
SceneObjectVisualDescription ScenePreviewBridge ScenePreviewOutcome ScenePreviewPresentation SpatialPoint2D
addSceneObject createAssetCatalog createAssetDefinition createAssetIdentity createAssetReference
createCoordinateSpaceDefinition createCoordinateSpaceReference createDocumentEnvelope createDocumentIdentity createDocumentSession
createEditorPreviewHost createEditorPreviewSession createOrthogonalGridDefinition createResourceLocator createSceneDefinition
createSceneIdentity createSceneMembership createSceneObjectDefinition createScenePreviewBridge createSpatialPoint2D
describeGridConversion describeOrthographicPlaneProjection describeResolvedVisualAsset describeSceneObjectAlignment describeSceneObjectSpatialPoint
describeSceneObjectVisual describeViewportMapping deserializeDocument diagnoseAssetDefinition diagnoseAssetReference
diagnoseDocument diagnoseSceneMembership disposeEditorPreviewSession getAssetDefinition getEditorPreviewFailure
getSceneObject initializeEditorPreviewSession inspectDocumentCompatibility listSceneObjects loadDocument
migrateDocument openEditorPreviewHost readAssetDefinitionSnapshot rebindAssetReference registerAssetDefinition
relocateAssetSource removeAssetDefinition removeSceneObject reorderSceneObjects replaceDocumentContent
replaceSceneDocumentObject replaceSceneObject resolveAssetReference saveDocument serializeDocument
updateAssetDefinition updateSceneObjectPlacement updateSceneObjectSpatialPlacement
```

### game-client

```text
(empty public root)
```

### runtime-engine

```text
(empty public root)
```

### game-server

```text
(empty public root)
```

## Complete Phase10 changed-file ownership inventory

Paths below come from `git diff --name-status 78dc4a9d14288df33ca46b3af4d23d09ceef9b82..HEAD` before closure. The closure-only documentation paths are listed separately in the checkpoint. No rename/deletion was observed.

| Status | Path | Owner / role |
| --- | --- | --- |
| M | `editor/AGENTS.md` | editor manual/docs/guidance |
| A | `editor/docs/tasks/sprite-animation-v0.10.9.md` | editor manual/docs/guidance |
| M | `editor/manual/README.md` | editor manual/docs/guidance |
| A | `editor/manual/animation-preview-host.mjs` | editor manual/docs/guidance |
| A | `editor/manual/animation-preview.html` | editor manual/docs/guidance |
| A | `editor/manual/animation-preview.md` | editor manual/docs/guidance |
| A | `editor/manual/animation-preview.mts` | editor manual/docs/guidance |
| A | `editor/manual/animation-preview.tsconfig.json` | editor manual/docs/guidance |
| M | `game-client/AGENTS.md` | game-client manual/docs/guidance |
| A | `game-client/docs/tasks/sprite-animation-v0.10.10.md` | game-client manual/docs/guidance |
| M | `game-client/manual/README.md` | game-client manual/docs/guidance |
| A | `game-client/manual/animation-host.mjs` | game-client manual/docs/guidance |
| A | `game-client/manual/animation.html` | game-client manual/docs/guidance |
| A | `game-client/manual/animation.md` | game-client manual/docs/guidance |
| A | `game-client/manual/animation.mts` | game-client manual/docs/guidance |
| A | `game-client/manual/animation.tsconfig.json` | game-client manual/docs/guidance |
| M | `game-client/manual/atlas-mvp.mts` | game-client manual/docs/guidance |
| A | `game-client/src/animation-presentation.ts` | game-client production |
| A | `game-client/src/manual-animation-host.ts` | game-client production |
| M | `game-client/src/viewport-host.ts` | game-client production |
| M | `harness/CONTRACTS.md` | Harness audit/evidence |
| M | `harness/OWNERSHIP.md` | Harness audit/evidence |
| A | `harness/checkpoints/evidence/sprite-animation-v0.10.11/independent.png` | Harness audit/evidence |
| A | `harness/checkpoints/evidence/sprite-animation-v0.10.11/monster.png` | Harness audit/evidence |
| A | `harness/checkpoints/evidence/sprite-animation-v0.10.11/player.png` | Harness audit/evidence |
| A | `harness/checkpoints/sprite-animation-v0.10.0.md` | Harness audit/evidence |
| A | `harness/checkpoints/sprite-animation-v0.10.1.md` | Harness audit/evidence |
| A | `harness/checkpoints/sprite-animation-v0.10.10.md` | Harness audit/evidence |
| A | `harness/checkpoints/sprite-animation-v0.10.11.md` | Harness audit/evidence |
| A | `harness/checkpoints/sprite-animation-v0.10.2.md` | Harness audit/evidence |
| A | `harness/checkpoints/sprite-animation-v0.10.3.md` | Harness audit/evidence |
| A | `harness/checkpoints/sprite-animation-v0.10.4.md` | Harness audit/evidence |
| A | `harness/checkpoints/sprite-animation-v0.10.5.md` | Harness audit/evidence |
| A | `harness/checkpoints/sprite-animation-v0.10.6.md` | Harness audit/evidence |
| A | `harness/checkpoints/sprite-animation-v0.10.7.md` | Harness audit/evidence |
| A | `harness/checkpoints/sprite-animation-v0.10.8.md` | Harness audit/evidence |
| A | `harness/checkpoints/sprite-animation-v0.10.9.md` | Harness audit/evidence |
| M | `runtime-render/AGENTS.md` | runtime-render manual/docs/guidance |
| A | `runtime-render/docs/sprite-animation-api-inventory-v0.10.0.md` | runtime-render manual/docs/guidance |
| A | `runtime-render/docs/sprite-animation-v0.10.0.md` | runtime-render manual/docs/guidance |
| A | `runtime-render/docs/sprite-animation-v0.10.1.md` | runtime-render manual/docs/guidance |
| A | `runtime-render/docs/sprite-animation-v0.10.2.md` | runtime-render manual/docs/guidance |
| A | `runtime-render/docs/sprite-animation-v0.10.3.md` | runtime-render manual/docs/guidance |
| A | `runtime-render/docs/sprite-animation-v0.10.4.md` | runtime-render manual/docs/guidance |
| A | `runtime-render/docs/sprite-animation-v0.10.5.md` | runtime-render manual/docs/guidance |
| A | `runtime-render/docs/sprite-animation-v0.10.6.md` | runtime-render manual/docs/guidance |
| A | `runtime-render/docs/sprite-animation-v0.10.7.md` | runtime-render manual/docs/guidance |
| A | `runtime-render/docs/sprite-animation-v0.10.8.md` | runtime-render manual/docs/guidance |
| A | `runtime-render/docs/tasks/sprite-animation-v0.10.0.md` | runtime-render manual/docs/guidance |
| A | `runtime-render/docs/tasks/sprite-animation-v0.10.1.md` | runtime-render manual/docs/guidance |
| A | `runtime-render/docs/tasks/sprite-animation-v0.10.11.md` | runtime-render manual/docs/guidance |
| A | `runtime-render/docs/tasks/sprite-animation-v0.10.2.md` | runtime-render manual/docs/guidance |
| A | `runtime-render/docs/tasks/sprite-animation-v0.10.3.md` | runtime-render manual/docs/guidance |
| A | `runtime-render/docs/tasks/sprite-animation-v0.10.4.md` | runtime-render manual/docs/guidance |
| A | `runtime-render/docs/tasks/sprite-animation-v0.10.5.md` | runtime-render manual/docs/guidance |
| A | `runtime-render/docs/tasks/sprite-animation-v0.10.6.md` | runtime-render manual/docs/guidance |
| A | `runtime-render/docs/tasks/sprite-animation-v0.10.7.md` | runtime-render manual/docs/guidance |
| A | `runtime-render/docs/tasks/sprite-animation-v0.10.8.md` | runtime-render manual/docs/guidance |
| M | `runtime-render/manual/README.md` | runtime-render manual/docs/guidance |
| A | `runtime-render/manual/sprite-animation-mvp-content.json` | runtime-render manual/docs/guidance |
| A | `runtime-render/manual/sprite-animation-mvp-host.mjs` | runtime-render manual/docs/guidance |
| A | `runtime-render/manual/sprite-animation-mvp.html` | runtime-render manual/docs/guidance |
| A | `runtime-render/manual/sprite-animation-mvp.md` | runtime-render manual/docs/guidance |
| A | `runtime-render/manual/sprite-animation-mvp.mts` | runtime-render manual/docs/guidance |
| A | `runtime-render/manual/sprite-animation-mvp.tsconfig.json` | runtime-render manual/docs/guidance |
| A | `runtime-render/manual/sprite-instance-isolation.md` | runtime-render manual/docs/guidance |
| A | `runtime-render/manual/sprite-instance-isolation.mts` | runtime-render manual/docs/guidance |
| M | `runtime-render/src/index.ts` | runtime-render production |
| A | `runtime-render/src/sprite-animation-playback.ts` | runtime-render production |
| A | `runtime-render/src/sprite-animation-timing.ts` | runtime-render production |
| A | `runtime-render/src/sprite-animation-visual-binding.ts` | runtime-render production |
| A | `runtime-render/src/sprite-eight-way.ts` | runtime-render production |
| A | `runtime-render/src/sprite-frame-alignment.ts` | runtime-render production |
| A | `runtime-render/src/sprite-frame-sequence.ts` | runtime-render production |
| M | `runtime-render/src/visual-scene.ts` | runtime-render production |

No Engine/Server, foundation pins, package manifests/lock or CI workflow changes against the baseline. Editor has no production src delta. Render production changes are six animation modules, root additions and the existing Phase8 visual-scene transaction/lifecycle seam. Client production changes are animation-presentation.ts, manual-animation-host.ts and its existing viewport-host optional frame hook.
