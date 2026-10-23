# Phase 8 public declaration delta — v0.8.14

Baseline: `ffb347140fbe6bf432bb8fe33c7057bed9a93941` (Phase7 merged). Implementation endpoint:
`ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd` (v0.8.13). Closure changes no production source/API.

TypeScript6.0.3 emitted baseline and current declarations from package roots,
with project compiler settings, strict checking and skipLibCheck:false. Root aliases
were resolved through the compiler checker; comments stripped before comparing
existing exported declaration statements. Baseline Editor imports resolve installed
current Render declarations; this is a declaration comparison, not a historical
workspace runtime reconstruction or universal semantic-compatibility proof.

| Root | Baseline | Endpoint | Added | Removed | Changed existing declarations |
| --- | --- | --- | --- | --- | --- |
| runtime-render | 126 | 186 | 60 | 0 | 0 |
| editor | 134 | 138 | 4 | 0 | 0 |
| game-client | 0 | 0 | 0 | 0 | 0 |

Existing signatures remain; renderFrame now consumes the attached live Visual Scene
through the canonical frame admission path. Metadata-only/no-scene behavior stays
separate from drawable/layout opt-in. Legacy resource demo submission may overlay
the live scene; it is not the scene renderer. New tagged diagnostics have separate
classifiers, not an expansion of old frame/error unions. These source semantics
need manual runtime compatibility review; matching declarations alone are insufficient.

Private module exports (retention dispatch, planeProjectionSteps, frame-source hooks,
backend helpers) are deliberately absent from public roots. Native Three/DOM/GPU
objects do not become new root instance/binding types. Package exports remain root
only. Snippets below are declaration excerpts, not standalone modules; referenced
types and opaque brands keep their original module context.

## runtime-render — 60 additions

### RenderVisualBindingFailure

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-scene.ts)

```ts
export interface RenderVisualBindingFailure {
    readonly code: 'FOREIGN_RESOURCE' | 'RESOURCE_NOT_USABLE' | 'CONTEXT_MISMATCH' | 'SOURCE_REVISION_MISMATCH' | Extract<AtlasFrameGeometryResult, {
        status: 'rejected';
    }>['code'];
}
```
### RenderVisualCorrelation

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-scene.ts)

```ts
export interface RenderVisualCorrelation {
    readonly projectId: string;
    readonly sceneId: string;
    readonly objectId: string;
}
```
### RenderVisualDepthFailure

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-depth.ts)

```ts
export interface RenderVisualDepthFailure {
    readonly code: 'INVALID_POLICY' | 'INVALID_DEPTH_KEY' | 'DEPTH_KEY_REQUIRED' | 'DEPTH_UNIT_MISMATCH' | 'GROUND_CONTEXT_REQUIRED' | 'GROUND_PLANE_MISMATCH';
}
```
### RenderVisualDepthKey

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-depth.ts)

```ts
export interface RenderVisualDepthKey {
    readonly value: number;
    readonly unit: string;
}
```
### RenderVisualDiagnostic

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/index.ts)

```ts
export type RenderVisualDiagnostic = {
    readonly domain: 'instance';
    readonly code: RenderVisualInstanceFailure['code'];
    readonly cleanupFailed: null;
} | {
    readonly domain: 'binding';
    readonly code: RenderVisualBindingFailure['code'];
    readonly cleanupFailed: null;
} | {
    readonly domain: 'layer';
    readonly code: RenderVisualLayerFailure['code'];
    readonly cleanupFailed: null;
} | {
    readonly domain: 'depth';
    readonly code: RenderVisualDepthFailure['code'];
    readonly cleanupFailed: null;
} | {
    readonly domain: 'presentation';
    readonly code: 'INVALID_TRANSFORM' | 'INVALID_SPRITE_LAYOUT' | 'LOCAL_UNIT_MISMATCH' | 'SCENE_IN_USE';
    readonly cleanupFailed: null;
} | {
    readonly domain: 'frame';
    readonly code: RenderFrameFailure['code'];
    readonly cleanupFailed: boolean;
} | {
    readonly domain: 'texture';
    readonly code: RenderTextureFailure['code'];
    readonly cleanupFailed: boolean;
} | {
    readonly domain: 'cache';
    readonly code: VisualResourceCacheFailure['code'];
    readonly cleanupFailed: null;
} | {
    readonly domain: 'session';
    readonly code: RenderFailure['code'];
    readonly cleanupFailed: null;
} | {
    readonly domain: 'unknown';
    readonly code: 'UNKNOWN_FAILURE';
    readonly cleanupFailed: null;
};
```
### RenderVisualDrawCandidate

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-scene.ts)

```ts
export interface RenderVisualDrawCandidate extends RenderVisualInstanceOrder {
    readonly instance: RenderVisualInstance;
    readonly layerPriority: number;
    readonly layerInsertionOrdinal: number;
    readonly insertionOrdinal: number;
}
```
### RenderVisualFrameBinding

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-scene.ts)

```ts
export interface RenderVisualFrameBinding {
    readonly reference: VisualFrameReference;
    readonly atlas: AtlasMetadata | null;
    readonly expectedRevision: symbol;
    readonly pixels: AtlasPagePixels;
}
```
### RenderVisualInstance

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-scene.ts)

```ts
export interface RenderVisualInstance {
    readonly [visualInstanceBrand]: true;
    readonly visualInstanceId: string;
    readonly sceneId: symbol;
    readonly sessionId: symbol;
    readonly insertionOrdinal: number;
    readonly correlation: RenderVisualCorrelation | null;
}
```
### RenderVisualInstanceFailure

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-scene.ts)

```ts
export interface RenderVisualInstanceFailure {
    readonly code: 'INVALID_DESCRIPTOR' | 'INVALID_ID' | 'DUPLICATE_ID' | 'FOREIGN_SCENE' | 'FOREIGN_INSTANCE' | 'MISSING_INSTANCE' | 'INSTANCE_CHANGED' | 'SCENE_DISPOSED' | 'SESSION_UNAVAILABLE';
}
```
### RenderVisualInstanceInput

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-scene.ts)

```ts
export interface RenderVisualInstanceInput {
    readonly visualInstanceId: string;
    readonly correlation?: RenderVisualCorrelation | null;
    readonly layerKey?: string;
    readonly order?: number;
}
```
### RenderVisualInstanceOrder

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-scene.ts)

```ts
export interface RenderVisualInstanceOrder {
    readonly layerKey: string;
    readonly order: number;
}
```
### RenderVisualInstanceProperties

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-scene.ts)

```ts
export interface RenderVisualInstanceProperties {
    readonly correlation: RenderVisualCorrelation | null;
}
```
### RenderVisualInstanceSnapshot

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-scene.ts)

```ts
export interface RenderVisualInstanceSnapshot extends RenderVisualInstanceProperties {
    readonly visualInstanceId: string;
    readonly sceneId: symbol;
    readonly sessionId: symbol;
    readonly insertionOrdinal: number;
}
```
### RenderVisualInstanceTransformInput

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-instance-transform.ts)

```ts
export interface RenderVisualInstanceTransformInput {
    readonly placement: PlaneProjectionPoint2D;
    readonly local: PlanarTransform2D;
    readonly anchor: VisualAnchor2D;
    readonly orientation: VisualOrientation2D;
    readonly projection: OrthographicPlaneProjection;
}
```
### RenderVisualInstanceTransformSnapshot

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-instance-transform.ts)

```ts
export interface RenderVisualInstanceTransformSnapshot extends RenderVisualInstanceTransformInput {
    readonly alignment: VisualAlignment2D;
    readonly localToScene: AffineTransform2D;
    readonly localToClip: AffineTransform2D;
    readonly attachment: PlanarPoint2D;
    readonly projectedAttachment: PlaneProjectionPoint2D;
}
```
### RenderVisualInstanceVisibilitySnapshot

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-scene.ts)

```ts
export interface RenderVisualInstanceVisibilitySnapshot {
    readonly visible: boolean;
    readonly viewportSuspended: boolean;
    readonly effectiveVisible: boolean;
}
```
### RenderVisualLayerFailure

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-scene.ts)

```ts
export interface RenderVisualLayerFailure {
    readonly code: 'INVALID_LAYER' | 'INVALID_PRIORITY' | 'INVALID_ORDER' | 'DUPLICATE_LAYER' | 'MISSING_LAYER' | 'LAYER_IN_USE' | 'RESERVED_LAYER' | 'ORDERING_CHANGED';
}
```
### RenderVisualLayerInput

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-scene.ts)

```ts
export interface RenderVisualLayerInput {
    readonly layerKey: string;
    readonly priority: number;
    readonly visible?: boolean;
}
```
### RenderVisualLayerOrderingPolicy

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-depth.ts)

```ts
export type RenderVisualLayerOrderingPolicy = {
    readonly kind: 'explicit-order';
} | {
    readonly kind: 'depth-key';
    readonly unit: string;
    readonly front: 'higher' | 'lower';
} | {
    readonly kind: 'ground-y';
    readonly plane: ProjectionPlane2D;
    readonly front: 'up' | 'down';
};
```
### RenderVisualLayerSnapshot

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-scene.ts)

```ts
export interface RenderVisualLayerSnapshot {
    readonly layerKey: string;
    readonly priority: number;
    readonly visible: boolean;
    readonly insertionOrdinal: number;
}
```
### RenderVisualResourceBindingInput

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-scene.ts)

```ts
export interface RenderVisualResourceBindingInput {
    readonly resource: VisualResourceLease;
    readonly expectedSourceRevision: string;
    readonly frame: RenderVisualFrameBinding | null;
}
```
### RenderVisualResourceBindingSnapshot

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-scene.ts)

```ts
export interface RenderVisualResourceBindingSnapshot {
    readonly state: 'usable' | 'unavailable';
    readonly resourceId: symbol;
    readonly sessionId: symbol;
    readonly sourceRevision: string;
    readonly frame: AtlasFrameGeometry | null;
    readonly cleanupFailed: boolean;
}
```
### RenderVisualScene

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-scene.ts)

```ts
export interface RenderVisualScene {
    readonly getSnapshot: () => RenderVisualSceneSnapshot;
    readonly clear: () => RenderVisualSceneSnapshot;
    readonly dispose: () => RenderVisualSceneDisposal;
}
```
### RenderVisualSceneDiagnostics

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-scene.ts)

```ts
export interface RenderVisualSceneDiagnostics {
    readonly state: 'active' | 'disposed';
    readonly instances: number;
    readonly boundUsages: number;
    readonly usableUsages: number;
    readonly unavailableUsages: number;
    readonly cleanupFailed: boolean;
    readonly releaseAttempts: number;
}
```
### RenderVisualSceneDisposal

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-scene.ts)

```ts
export interface RenderVisualSceneDisposal {
    readonly id: symbol;
    readonly sessionId: symbol;
    readonly state: 'disposed';
    readonly reason: 'scene-disposed' | 'session-ended';
}
```
### RenderVisualSceneSnapshot

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-scene.ts)

```ts
export type RenderVisualSceneSnapshot = {
    readonly id: symbol;
    readonly sessionId: symbol;
    readonly state: 'active';
} | RenderVisualSceneDisposal;
```
### RenderVisualSpriteLayout

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-sprite-layout.ts)

```ts
export interface RenderVisualSpriteLayout {
    readonly unit: string;
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
}
```
### addRenderVisualInstance

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-scene.ts)

```ts
export declare function addRenderVisualInstance(scene: RenderVisualScene, input: RenderVisualInstanceInput): RenderVisualInstance;
```
### addRenderVisualLayer

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-scene.ts)

```ts
export declare function addRenderVisualLayer(scene: RenderVisualScene, input: RenderVisualLayerInput): RenderVisualLayerSnapshot;
```
### bindRenderVisualInstanceResource

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-scene.ts)

```ts
export declare function bindRenderVisualInstanceResource(scene: RenderVisualScene, instance: RenderVisualInstance, input: RenderVisualResourceBindingInput | null): RenderVisualResourceBindingSnapshot | null;
```
### createRenderVisualScene

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-scene.ts)

```ts
export declare function createRenderVisualScene(session: RenderFrameSession): RenderVisualScene;
```
### getRenderVisualBindingFailure

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-scene.ts)

```ts
export declare function getRenderVisualBindingFailure(error: unknown): RenderVisualBindingFailure | undefined;
```
### getRenderVisualDepthFailure

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-depth.ts)

```ts
export declare function getRenderVisualDepthFailure(error: unknown): RenderVisualDepthFailure | undefined;
```
### getRenderVisualDiagnostic

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/index.ts)

```ts
export declare function getRenderVisualDiagnostic(error: unknown): RenderVisualDiagnostic;
```
### getRenderVisualInstance

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-scene.ts)

```ts
export declare function getRenderVisualInstance(scene: RenderVisualScene, visualInstanceId: string): RenderVisualInstance | undefined;
```
### getRenderVisualInstanceDepthKey

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-scene.ts)

```ts
export declare function getRenderVisualInstanceDepthKey(scene: RenderVisualScene, instance: RenderVisualInstance): RenderVisualDepthKey | null;
```
### getRenderVisualInstanceFailure

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-scene.ts)

```ts
export declare function getRenderVisualInstanceFailure(error: unknown): RenderVisualInstanceFailure | undefined;
```
### getRenderVisualInstanceOrder

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-scene.ts)

```ts
export declare function getRenderVisualInstanceOrder(scene: RenderVisualScene, instance: RenderVisualInstance): RenderVisualInstanceOrder;
```
### getRenderVisualInstanceResource

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-scene.ts)

```ts
export declare function getRenderVisualInstanceResource(scene: RenderVisualScene, instance: RenderVisualInstance): RenderVisualResourceBindingSnapshot | null;
```
### getRenderVisualInstanceSnapshot

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-scene.ts)

```ts
export declare function getRenderVisualInstanceSnapshot(scene: RenderVisualScene, instance: RenderVisualInstance): RenderVisualInstanceSnapshot;
```
### getRenderVisualInstanceSpriteLayout

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-scene.ts)

```ts
export declare function getRenderVisualInstanceSpriteLayout(scene: RenderVisualScene, instance: RenderVisualInstance): RenderVisualSpriteLayout | null;
```
### getRenderVisualInstanceTransform

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-scene.ts)

```ts
export declare function getRenderVisualInstanceTransform(scene: RenderVisualScene, instance: RenderVisualInstance): RenderVisualInstanceTransformSnapshot | null;
```
### getRenderVisualInstanceVisibility

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-scene.ts)

```ts
export declare function getRenderVisualInstanceVisibility(scene: RenderVisualScene, instance: RenderVisualInstance): RenderVisualInstanceVisibilitySnapshot;
```
### getRenderVisualLayer

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-scene.ts)

```ts
export declare function getRenderVisualLayer(scene: RenderVisualScene, key: string): RenderVisualLayerSnapshot | undefined;
```
### getRenderVisualLayerFailure

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-scene.ts)

```ts
export declare function getRenderVisualLayerFailure(error: unknown): RenderVisualLayerFailure | undefined;
```
### getRenderVisualLayerOrderingPolicy

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-scene.ts)

```ts
export declare function getRenderVisualLayerOrderingPolicy(scene: RenderVisualScene, key: string): RenderVisualLayerOrderingPolicy;
```
### getRenderVisualSceneDiagnostics

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-scene.ts)

```ts
export declare function getRenderVisualSceneDiagnostics(scene: RenderVisualScene): RenderVisualSceneDiagnostics;
```
### listRenderVisualDrawCandidates

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-scene.ts)

```ts
export declare function listRenderVisualDrawCandidates(scene: RenderVisualScene): readonly RenderVisualDrawCandidate[];
```
### listRenderVisualInstances

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-scene.ts)

```ts
export declare function listRenderVisualInstances(scene: RenderVisualScene): readonly RenderVisualInstance[];
```
### listRenderVisualLayers

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-scene.ts)

```ts
export declare function listRenderVisualLayers(scene: RenderVisualScene): readonly RenderVisualLayerSnapshot[];
```
### removeRenderVisualInstance

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-scene.ts)

```ts
export declare function removeRenderVisualInstance(scene: RenderVisualScene, instance: RenderVisualInstance): boolean;
```
### removeRenderVisualLayer

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-scene.ts)

```ts
export declare function removeRenderVisualLayer(scene: RenderVisualScene, key: string): void;
```
### setRenderVisualInstanceDepthKey

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-scene.ts)

```ts
export declare function setRenderVisualInstanceDepthKey(scene: RenderVisualScene, instance: RenderVisualInstance, input: RenderVisualDepthKey | null): RenderVisualDepthKey | null;
```
### setRenderVisualInstanceOrder

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-scene.ts)

```ts
export declare function setRenderVisualInstanceOrder(scene: RenderVisualScene, instance: RenderVisualInstance, input: RenderVisualInstanceOrder): RenderVisualInstanceOrder;
```
### setRenderVisualInstanceSpriteLayout

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-scene.ts)

```ts
export declare function setRenderVisualInstanceSpriteLayout(scene: RenderVisualScene, instance: RenderVisualInstance, layout: RenderVisualSpriteLayout | null): RenderVisualSpriteLayout | null;
```
### setRenderVisualInstanceTransform

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-scene.ts)

```ts
export declare function setRenderVisualInstanceTransform(scene: RenderVisualScene, instance: RenderVisualInstance, input: RenderVisualInstanceTransformInput | null): RenderVisualInstanceTransformSnapshot | null;
```
### setRenderVisualInstanceVisible

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-scene.ts)

```ts
export declare function setRenderVisualInstanceVisible(scene: RenderVisualScene, instance: RenderVisualInstance, visible: boolean): RenderVisualInstanceVisibilitySnapshot;
```
### setRenderVisualLayerOrderingPolicy

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-scene.ts)

```ts
export declare function setRenderVisualLayerOrderingPolicy(scene: RenderVisualScene, key: string, policy: RenderVisualLayerOrderingPolicy): RenderVisualLayerOrderingPolicy;
```
### updateRenderVisualInstance

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-scene.ts)

```ts
export declare function updateRenderVisualInstance(scene: RenderVisualScene, instance: RenderVisualInstance, properties: RenderVisualInstanceProperties): RenderVisualInstanceSnapshot;
```
### updateRenderVisualLayer

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/runtime-render/src/visual-scene.ts)

```ts
export declare function updateRenderVisualLayer(scene: RenderVisualScene, input: RenderVisualLayerInput): RenderVisualLayerSnapshot;
```

## editor — 4 additions

### ScenePreviewBridge

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/editor/src/scene-preview.ts)

```ts
export interface ScenePreviewBridge {
    readonly sync: (membership: SceneMembership, catalog: AssetCatalog, policy: (description: Extract<SceneObjectVisualDescription, {
        status: 'described';
    }>) => ScenePreviewPresentation) => Promise<readonly ScenePreviewOutcome[]>;
    readonly close: () => readonly ScenePreviewOutcome[];
}
```
### ScenePreviewOutcome

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/editor/src/scene-preview.ts)

```ts
export interface ScenePreviewOutcome {
    readonly objectId: string;
    readonly status: 'applied' | 'removed' | 'diagnosed';
    readonly reason: string | null;
    readonly instance: RenderVisualInstance | null;
    readonly failure: RenderVisualDiagnostic | null;
    readonly cleanupFailed: boolean;
}
```
### ScenePreviewPresentation

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/editor/src/scene-preview.ts)

```ts
export interface ScenePreviewPresentation {
    readonly space: CoordinateSpaceDefinition;
    readonly transform: Omit<RenderVisualInstanceTransformInput, 'placement'>;
    readonly layout: RenderVisualSpriteLayout;
    readonly visible: boolean;
    readonly order: RenderVisualInstanceOrder;
    readonly bindingKey: string;
    readonly sourceRevision: string;
    readonly frame: RenderVisualFrameBinding | null;
}
```
### createScenePreviewBridge

[Implementation](https://github.com/TjnhPro/rpg-platform/blob/ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd/editor/src/scene-preview.ts)

```ts
export declare function createScenePreviewBridge(scene: RenderVisualScene, identityInput: SceneIdentity, acquire: (descriptor: VisualResourceDescriptor, presentation: ScenePreviewPresentation) => VisualResourceLease): ScenePreviewBridge;
```

## game-client — 0 additions

No public additions. Optional Client browser host is outside its root.
