# Phase9 exact commit and public declaration audit — v0.9.14

This is an inspected source/declaration inventory, not a test or visual verdict.
See [closure report](camera-v0.9.14.md) for ownership, behavior and acceptance.

## Method and compatibility result

For base and each of fourteen checkpoint SHAs below, extracted the exact tracked
Render/Editor/Client src tree using git show, resolved package-root TypeScript
exports/aliases, emitted declarations with the actual project compiler options
and compared named emitted declaration text (comments removed) for every prior
root symbol. All compile diagnostics were checked; emission was genuine, not
a hand-written contract inventory. Ignored tooling:
.artifacts/camera-v0.9.14-public-audit.mjs and its JSON outputs.
This includes all existing symbols at each step, not only new camera names.

Result: no previous exported declaration changed or disappeared at any step.
Render186 ->231 (+45); Editor138 and Client0 unchanged at every checkpoint.
Names count types and runtime values, not just callable exports. Closure source
is byte-identical to v0.9.13, so closure has zero API delta. The 186-symbol base
inventory is preserved in [Phase9 baseline](../../runtime-render/docs/camera-api-inventory-v0.9.0.md).
No Phase9 diagnostic union expansion. Accepted earlier Phase6 union migration
is documented separately in CONTRACTS/Phase6; universal semantic compatibility
is not inferred from declaration equality.

## All fifteen checkpoint ledger

| Version | Exact commit | Render root count / additions | Existing changed / removed | Task and report |
| --- | --- | --- | --- | --- |
| v0.9.0 | `d7c77dfff540fd2e2fba0d45f235c856d5aa41b0` | 186 / +0 | 0 / 0 | both present |
| v0.9.1 | `08a6117f79b6cb76c1868c0b9b9950cf3a481c18` | 191 / +5 | 0 / 0 | both present |
| v0.9.2 | `3428d70aeb90e1f38578aa6e40070f4db26b29f2` | 194 / +3 | 0 / 0 | both present |
| v0.9.3 | `8d8339c4d357202e0305d9c5360cd70e6f95dd10` | 197 / +3 | 0 / 0 | both present |
| v0.9.4 | `72168e937afd37091db0853cd1b8bf6c5f99aad1` | 204 / +7 | 0 / 0 | both present |
| v0.9.5 | `ca9e12033d65dfe0889c04ab0f2f3f511e64e8a4` | 206 / +2 | 0 / 0 | both present |
| v0.9.6 | `98ce6d2ed6a4216c17385896a4dc9f0266a9c5d0` | 208 / +2 | 0 / 0 | both present |
| v0.9.7 | `c0409df4723572053ade0eef8de8f7308aba2d8b` | 212 / +4 | 0 / 0 | both present |
| v0.9.8 | `ff73c88f8aefb9c82ccfc75567d8cd35f2081559` | 221 / +9 | 0 / 0 | both present |
| v0.9.9 | `46fb8466d844d040c3ccc6f3fd30c1f7a4d8eeeb` | 226 / +5 | 0 / 0 | both present |
| v0.9.10 | `894d03547bb6e92e3e97fefeb859a29cb923974b` | 231 / +5 | 0 / 0 | both present |
| v0.9.11 | `4dd297a838cf2ceda3a962e56a4400501a3c55ec` | 231 / +0 | 0 / 0 | both present |
| v0.9.12 | `2b15d19d8688ce839b72d463e24d31113d3ff5db` | 231 / +0 | 0 / 0 | both present |
| v0.9.13 | `cec56ddee378c292dfb72bef24918851a34e04ab` | 231 / +0 | 0 / 0 | both present |
| v0.9.14 | containing closure commit; exact self SHA in PR9 ledger |231 / +0 |0 /0 | this audit/report and supplied standalone task |

The containing SHA is resolved with `git log -1 --format=%H --
harness/checkpoints/camera-v0.9.14.md`; a commit cannot embed its own hash.
Single branch feat/camera-projection-v0.9, single Draft PR9, base main/merge-base
e4464ac8e1c84a1c872f8e7a722885942a268a28. Exact current-head CI in PR9 only.

## Per-checkpoint source changes and new public names

### v0.9.0

Total tracked paths: 7. Production/private host source paths: none.

New Render-root names: none.
Editor/Client root additions, removals and changes: zero.

### v0.9.1

Total tracked paths: 11. Production/private host source paths: `runtime-render/src/camera.ts`, `runtime-render/src/index.ts`, `runtime-render/src/plane-projection.ts`.

New Render-root names: `createRenderCamera`, `RenderCameraInput`, `RenderCameraUpdate`, `RenderCameraSnapshot`, `RenderCamera`.
Editor/Client root additions, removals and changes: zero.

### v0.9.2

Total tracked paths: 11. Production/private host source paths: `runtime-render/src/camera-configuration.ts`, `runtime-render/src/camera.ts`, `runtime-render/src/index.ts`.

New Render-root names: `createOrthographicCameraConfiguration`, `OrthographicCameraConfigurationInput`, `OrthographicCameraConfiguration`.
Editor/Client root additions, removals and changes: zero.

### v0.9.3

Total tracked paths: 11. Production/private host source paths: `runtime-render/src/camera.ts`, `runtime-render/src/index.ts`, `runtime-render/src/plane-projection.ts`.

New Render-root names: `setRenderCameraCenter`, `panRenderCamera`, `RenderCameraPan`.
Editor/Client root additions, removals and changes: zero.

### v0.9.4

Total tracked paths: 13. Production/private host source paths: `runtime-render/src/camera-configuration.ts`, `runtime-render/src/camera-data.ts`, `runtime-render/src/camera-zoom.ts`, `runtime-render/src/camera.ts`, `runtime-render/src/index.ts`.

New Render-root names: `createConfiguredRenderCamera`, `getRenderCameraViewSnapshot`, `setRenderCameraZoom`, `zoomRenderCameraAtFocus`, `RenderCameraViewSnapshot`, `RenderCameraZoomLimits`, `RenderCameraFocusZoomInput`.
Editor/Client root additions, removals and changes: zero.

### v0.9.5

Total tracked paths: 11. Production/private host source paths: `runtime-render/src/camera-viewport.ts`, `runtime-render/src/frame-session.ts`, `runtime-render/src/index.ts`.

New Render-root names: `getRenderCameraViewportSnapshot`, `RenderCameraViewportSnapshot`.
Editor/Client root additions, removals and changes: zero.

### v0.9.6

Total tracked paths: 11. Production/private host source paths: `runtime-render/src/camera-projection.ts`, `runtime-render/src/camera-viewport.ts`, `runtime-render/src/index.ts`.

New Render-root names: `projectRenderCameraPoint`, `RenderCameraProjectionResult`.
Editor/Client root additions, removals and changes: zero.

### v0.9.7

Total tracked paths: 11. Production/private host source paths: `runtime-render/src/camera-inverse.ts`, `runtime-render/src/camera-projection.ts`, `runtime-render/src/index.ts`.

New Render-root names: `viewportToRenderCameraSelectedPlane`, `screenToRenderCameraSelectedPlane`, `RenderCameraSelectedPlaneInput`, `RenderCameraSelectedPlaneResult`.
Editor/Client root additions, removals and changes: zero.

### v0.9.8

Total tracked paths: 10. Production/private host source paths: `runtime-render/src/camera-ground.ts`, `runtime-render/src/index.ts`.

New Render-root names: `createRenderCameraGroundConfiguration`, `projectRenderCameraGroundPoint`, `viewportToRenderCameraGround`, `screenToRenderCameraGround`, `RenderCameraGroundConfiguration`, `RenderCameraGroundPoint`, `RenderCameraGroundProjectionResult`, `RenderCameraGroundInverseInput`, `RenderCameraGroundInverseResult`.
Editor/Client root additions, removals and changes: zero.

### v0.9.9

Total tracked paths: 11. Production/private host source paths: `runtime-render/src/camera-bounds.ts`, `runtime-render/src/camera.ts`, `runtime-render/src/index.ts`.

New Render-root names: `transitionRenderCameraWithinBounds`, `RenderCameraBoundsPolicy`, `RenderCameraBoundsMovement`, `RenderCameraBoundsTransitionInput`, `RenderCameraBoundsTransitionResult`.
Editor/Client root additions, removals and changes: zero.

### v0.9.10

Total tracked paths: 17. Production/private host source paths: `runtime-render/src/camera-frame-link.ts`, `runtime-render/src/camera-scene.ts`, `runtime-render/src/camera.ts`, `runtime-render/src/frame-session.ts`, `runtime-render/src/index.ts`, `runtime-render/src/three-frame.ts`, `runtime-render/src/three-visual-draw.ts`, `runtime-render/src/visual-scene.ts`.

New Render-root names: `bindRenderCameraToVisualScene`, `getRenderCameraFrameSnapshot`, `RenderCameraSceneBinding`, `RenderCameraSceneBindingSnapshot`, `RenderCameraFrameSnapshot`.
Editor/Client root additions, removals and changes: zero.

### v0.9.11

Total tracked paths: 7. Production/private host source paths: `runtime-render/src/camera-frame-link.ts`, `runtime-render/src/frame-session.ts`.

New Render-root names: none.
Editor/Client root additions, removals and changes: zero.

### v0.9.12

Total tracked paths: 13. Production/private host source paths: `editor/src/manual-camera-host.ts`, `editor/src/viewport-host.ts`, `game-client/src/manual-camera-host.ts`, `game-client/src/manual-frame-continuous.ts`, `game-client/src/viewport-host.ts`.

New Render-root names: none.
Editor/Client root additions, removals and changes: zero.

### v0.9.13

Total tracked paths: 8. Production/private host source paths: `editor/src/manual-camera-host.ts`, `game-client/src/manual-camera-host.ts`.

New Render-root names: none.
Editor/Client root additions, removals and changes: zero.

## Exact final emitted declarations for all 45 Phase9 additions

Declarations below are emitted from public-root reachable source, not invented
future signatures. Owner-local helpers absent from the root are excluded.
Private Editor/Client browser hosts are not public package exports.

### createRenderCamera

Source: `runtime-render/src/camera.ts`.

```typescript
export declare function createRenderCamera(input: RenderCameraInput): RenderCamera;
```

### RenderCameraInput

Source: `runtime-render/src/camera.ts`.

```typescript
export interface RenderCameraInput {
    readonly kind: 'orthographic';
    readonly source: ProjectionPlane2D;
    readonly center: PlanarPoint2D;
}
```

### RenderCameraUpdate

Source: `runtime-render/src/camera.ts`.

```typescript
export interface RenderCameraUpdate {
    readonly center: PlanarPoint2D;
}
```

### RenderCameraSnapshot

Source: `runtime-render/src/camera.ts`.

```typescript
export interface RenderCameraSnapshot extends RenderCameraInput {
    readonly id: symbol;
    readonly state: 'active' | 'disposed';
    readonly revision: number;
    readonly binding: 'unbound';
    readonly application: 'not-applied';
}
```

### RenderCamera

Source: `runtime-render/src/camera.ts`.

```typescript
export interface RenderCamera {
    readonly getSnapshot: () => RenderCameraSnapshot;
    readonly update: (input: RenderCameraUpdate) => RenderCameraSnapshot;
    readonly dispose: () => RenderCameraSnapshot;
}
```

### createOrthographicCameraConfiguration

Source: `runtime-render/src/camera-configuration.ts`.

```typescript
export declare function createOrthographicCameraConfiguration(input: OrthographicCameraConfigurationInput): OrthographicCameraConfiguration;
```

### OrthographicCameraConfigurationInput

Source: `runtime-render/src/camera-configuration.ts`.

```typescript
export interface OrthographicCameraConfigurationInput {
    readonly kind: 'orthographic';
    readonly source: ProjectionPlane2D;
    readonly center: PlanarPoint2D;
    readonly scale: {
        readonly unit: 'css-px-per-source-unit';
        readonly x: number;
        readonly y: number;
    };
    readonly zoom: number;
    readonly viewportPolicy: 'preserve-scale';
}
```

### OrthographicCameraConfiguration

Source: `runtime-render/src/camera-configuration.ts`.

```typescript
export interface OrthographicCameraConfiguration extends OrthographicCameraConfigurationInput {
    readonly effectiveCssPixelsPerSourceUnit: PlanarPoint2D;
}
```

### setRenderCameraCenter

Source: `runtime-render/src/camera.ts`.

```typescript
export declare function setRenderCameraCenter(camera: RenderCamera, input: PlaneProjectionPoint2D): RenderCameraSnapshot;
```

### panRenderCamera

Source: `runtime-render/src/camera.ts`.

```typescript
export declare function panRenderCamera(camera: RenderCamera, input: RenderCameraPan): RenderCameraSnapshot;
```

### RenderCameraPan

Source: `runtime-render/src/camera.ts`.

```typescript
export interface RenderCameraPan {
    readonly plane: ProjectionPlane2D;
    readonly delta: PlanarPoint2D;
}
```

### createConfiguredRenderCamera

Source: `runtime-render/src/camera.ts`.

```typescript
export declare function createConfiguredRenderCamera(input: OrthographicCameraConfigurationInput, limits: RenderCameraZoomLimits): RenderCamera;
```

### getRenderCameraViewSnapshot

Source: `runtime-render/src/camera.ts`.

```typescript
export declare function getRenderCameraViewSnapshot(camera: RenderCamera): RenderCameraViewSnapshot;
```

### setRenderCameraZoom

Source: `runtime-render/src/camera.ts`.

```typescript
export declare function setRenderCameraZoom(camera: RenderCamera, zoom: number): RenderCameraViewSnapshot;
```

### zoomRenderCameraAtFocus

Source: `runtime-render/src/camera.ts`.

```typescript
export declare function zoomRenderCameraAtFocus(camera: RenderCamera, input: RenderCameraFocusZoomInput): RenderCameraViewSnapshot;
```

### RenderCameraViewSnapshot

Source: `runtime-render/src/camera.ts`.

```typescript
export interface RenderCameraViewSnapshot {
    readonly camera: RenderCameraSnapshot;
    readonly configuration: OrthographicCameraConfiguration;
    readonly zoomLimits: RenderCameraZoomLimits;
    readonly revision: number;
}
```

### RenderCameraZoomLimits

Source: `runtime-render/src/camera-zoom.ts`.

```typescript
export interface RenderCameraZoomLimits {
    readonly min: number;
    readonly max: number;
}
```

### RenderCameraFocusZoomInput

Source: `runtime-render/src/camera-zoom.ts`.

```typescript
export interface RenderCameraFocusZoomInput {
    readonly zoom: number;
    readonly mapping: ViewportMapping2D;
    readonly focus: PlaneProjectionPoint2D;
}
```

### getRenderCameraViewportSnapshot

Source: `runtime-render/src/camera-viewport.ts`.

```typescript
export declare function getRenderCameraViewportSnapshot(camera: RenderCamera, session: RenderFrameSession, receipt: RenderViewportResizeReceipt, logical: ViewportMetrics2D): RenderCameraViewportSnapshot;
```

### RenderCameraViewportSnapshot

Source: `runtime-render/src/camera-viewport.ts`.

```typescript
export interface RenderCameraViewportSnapshot {
    readonly status: 'configured-not-applied';
    readonly camera: RenderCameraViewSnapshot;
    readonly viewport: RenderViewportSnapshot & {
        readonly state: 'active';
    };
    readonly resize: RenderViewportResizeReceipt;
    readonly mapping: ViewportMapping2D;
}
```

### projectRenderCameraPoint

Source: `runtime-render/src/camera-projection.ts`.

```typescript
export declare function projectRenderCameraPoint(camera: RenderCamera, logical: ViewportMetrics2D, point: PlaneProjectionPoint2D, accepted: {
    readonly session: RenderFrameSession;
    readonly receipt: RenderViewportResizeReceipt;
} | null): RenderCameraProjectionResult;
```

### RenderCameraProjectionResult

Source: `runtime-render/src/camera-projection.ts`.

```typescript
export interface RenderCameraProjectionResult {
    readonly camera: RenderCameraViewSnapshot;
    readonly mapping: ViewportMapping2D;
    readonly viewportPoint: PlaneProjectionPoint2D;
    readonly screenPoint: PlaneProjectionPoint2D | null;
    readonly acceptedViewport: RenderCameraViewportSnapshot | null;
}
```

### viewportToRenderCameraSelectedPlane

Source: `runtime-render/src/camera-inverse.ts`.

```typescript
export declare function viewportToRenderCameraSelectedPlane(camera: RenderCamera, logical: ViewportMetrics2D, input: RenderCameraSelectedPlaneInput, accepted: {
    readonly session: RenderFrameSession;
    readonly receipt: RenderViewportResizeReceipt;
} | null): RenderCameraSelectedPlaneResult;
```

### screenToRenderCameraSelectedPlane

Source: `runtime-render/src/camera-inverse.ts`.

```typescript
export declare function screenToRenderCameraSelectedPlane(camera: RenderCamera, logical: ViewportMetrics2D, input: RenderCameraSelectedPlaneInput, accepted: {
    readonly session: RenderFrameSession;
    readonly receipt: RenderViewportResizeReceipt;
} | null): RenderCameraSelectedPlaneResult;
```

### RenderCameraSelectedPlaneInput

Source: `runtime-render/src/camera-inverse.ts`.

```typescript
export interface RenderCameraSelectedPlaneInput {
    readonly cameraView: RenderCameraViewSnapshot;
    readonly selectedPlane: ProjectionPlane2D;
    readonly point: PlaneProjectionPoint2D;
}
```

### RenderCameraSelectedPlaneResult

Source: `runtime-render/src/camera-inverse.ts`.

```typescript
export interface RenderCameraSelectedPlaneResult {
    readonly camera: RenderCameraViewSnapshot;
    readonly mapping: ViewportMapping2D;
    readonly selectedPlanePoint: PlaneProjectionPoint2D;
    readonly acceptedViewport: RenderCameraViewportSnapshot | null;
}
```

### createRenderCameraGroundConfiguration

Source: `runtime-render/src/camera-ground.ts`.

```typescript
export declare function createRenderCameraGroundConfiguration(input: RenderCameraGroundConfiguration): RenderCameraGroundConfiguration;
```

### projectRenderCameraGroundPoint

Source: `runtime-render/src/camera-ground.ts`.

```typescript
export declare function projectRenderCameraGroundPoint(camera: RenderCamera, logical: ViewportMetrics2D, configuration: RenderCameraGroundConfiguration, input: RenderCameraGroundPoint, accepted: Accepted): RenderCameraGroundProjectionResult;
```

### viewportToRenderCameraGround

Source: `runtime-render/src/camera-ground.ts`.

```typescript
export declare function viewportToRenderCameraGround(camera: RenderCamera, logical: ViewportMetrics2D, configuration: RenderCameraGroundConfiguration, input: RenderCameraGroundInverseInput, accepted: Accepted): RenderCameraGroundInverseResult;
```

### screenToRenderCameraGround

Source: `runtime-render/src/camera-ground.ts`.

```typescript
export declare function screenToRenderCameraGround(camera: RenderCamera, logical: ViewportMetrics2D, configuration: RenderCameraGroundConfiguration, input: RenderCameraGroundInverseInput, accepted: Accepted): RenderCameraGroundInverseResult;
```

### RenderCameraGroundConfiguration

Source: `runtime-render/src/camera-ground.ts`.

```typescript
export interface RenderCameraGroundConfiguration {
    readonly kind: 'affine-ground-elevation';
    readonly groundPlane: ProjectionPlane2D;
    readonly presentationPlane: ProjectionPlane2D;
    readonly groundOrigin: PlanarPoint2D;
    readonly presentationOrigin: PlanarPoint2D;
    readonly basis: {
        readonly x: PlanarPoint2D;
        readonly y: PlanarPoint2D;
    };
    readonly elevation: {
        readonly unit: string;
        readonly displacement: PlanarPoint2D;
    };
}
```

### RenderCameraGroundPoint

Source: `runtime-render/src/camera-ground.ts`.

```typescript
export interface RenderCameraGroundPoint {
    readonly ground: PlaneProjectionPoint2D;
    readonly elevation: {
        readonly unit: string;
        readonly value: number;
    };
}
```

### RenderCameraGroundProjectionResult

Source: `runtime-render/src/camera-ground.ts`.

```typescript
export interface RenderCameraGroundProjectionResult extends RenderCameraProjectionResult {
    readonly configuration: RenderCameraGroundConfiguration;
    readonly source: RenderCameraGroundPoint;
    readonly presentationPoint: PlaneProjectionPoint2D;
}
```

### RenderCameraGroundInverseInput

Source: `runtime-render/src/camera-ground.ts`.

```typescript
export interface RenderCameraGroundInverseInput {
    readonly cameraView: RenderCameraViewSnapshot;
    readonly point: PlaneProjectionPoint2D;
    readonly elevation: {
        readonly unit: string;
        readonly value: number;
    };
}
```

### RenderCameraGroundInverseResult

Source: `runtime-render/src/camera-ground.ts`.

```typescript
export interface RenderCameraGroundInverseResult {
    readonly projection: RenderCameraGroundProjectionResult;
    readonly ground: RenderCameraGroundPoint;
}
```

### transitionRenderCameraWithinBounds

Source: `runtime-render/src/camera-bounds.ts`.

```typescript
export declare function transitionRenderCameraWithinBounds(camera: RenderCamera, logical: ViewportMetrics2D, input: RenderCameraBoundsTransitionInput, accepted: {
    readonly session: RenderFrameSession;
    readonly receipt: RenderViewportResizeReceipt;
} | null): RenderCameraBoundsTransitionResult;
```

### RenderCameraBoundsPolicy

Source: `runtime-render/src/camera-bounds.ts`.

```typescript
export type RenderCameraBoundsPolicy = {
    readonly kind: 'disabled';
} | {
    readonly kind: 'rectangle';
    readonly plane: ProjectionPlane2D;
    readonly min: PlanarPoint2D;
    readonly max: PlanarPoint2D;
    readonly movement: 'clamp' | 'reject';
    readonly oversized: 'reject' | 'center';
};
```

### RenderCameraBoundsMovement

Source: `runtime-render/src/camera-bounds.ts`.

```typescript
export type RenderCameraBoundsMovement = {
    readonly kind: 'center';
    readonly target: PlaneProjectionPoint2D;
} | {
    readonly kind: 'pan';
    readonly request: RenderCameraPan;
};
```

### RenderCameraBoundsTransitionInput

Source: `runtime-render/src/camera-bounds.ts`.

```typescript
export interface RenderCameraBoundsTransitionInput {
    readonly cameraView: RenderCameraViewSnapshot;
    readonly movement: RenderCameraBoundsMovement;
    readonly zoom: number;
    readonly bounds: RenderCameraBoundsPolicy;
}
```

### RenderCameraBoundsTransitionResult

Source: `runtime-render/src/camera-bounds.ts`.

```typescript
export type RenderCameraBoundsTransitionResult = {
    readonly before: RenderCameraViewSnapshot;
    readonly view: RenderCameraViewSnapshot;
    readonly requestedCenter: PlanarPoint2D;
    readonly visibleSpan: PlanarPoint2D;
    readonly metrics: ViewportMetrics2D;
    readonly bounds: RenderCameraBoundsPolicy;
    readonly admittedViewport: RenderCameraViewportSnapshot | null;
} & ({
    readonly status: 'rejected';
    readonly reason: 'VIEW_EXCEEDS_BOUNDS' | 'CENTER_OUTSIDE_BOUNDS';
    readonly containment: 'not-applied';
} | {
    readonly status: 'updated' | 'unchanged';
    readonly reason: null;
    readonly containment: 'contained' | 'oversized-centered' | 'unrestricted';
});
```

### bindRenderCameraToVisualScene

Source: `runtime-render/src/camera-scene.ts`.

```typescript
export declare function bindRenderCameraToVisualScene(camera: RenderCamera, scene: RenderVisualScene, resize: RenderViewportResizeReceipt, logical: ViewportMetrics2D): RenderCameraSceneBinding;
```

### getRenderCameraFrameSnapshot

Source: `runtime-render/src/camera-scene.ts`.

```typescript
export declare function getRenderCameraFrameSnapshot(receipt: RenderFrameReceipt): RenderCameraFrameSnapshot | undefined;
```

### RenderCameraSceneBinding

Source: `runtime-render/src/camera-scene.ts`.

```typescript
export interface RenderCameraSceneBinding {
    readonly getSnapshot: () => RenderCameraSceneBindingSnapshot;
    readonly configure: (resize: RenderViewportResizeReceipt, logical: ViewportMetrics2D) => RenderCameraSceneBindingSnapshot;
    readonly dispose: () => RenderCameraSceneBindingSnapshot;
}
```

### RenderCameraSceneBindingSnapshot

Source: `runtime-render/src/camera-scene.ts`.

```typescript
export interface RenderCameraSceneBindingSnapshot {
    readonly cameraId: symbol;
    readonly sceneId: symbol;
    readonly sessionId: symbol;
    readonly state: 'active' | 'disposed';
    readonly reason: null | 'binding-disposed' | 'camera-disposed' | 'scene-ended';
}
```

### RenderCameraFrameSnapshot

Source: `runtime-render/src/camera-scene.ts`.

```typescript
export interface RenderCameraFrameSnapshot {
    readonly application: 'submitted';
    readonly camera: RenderCameraViewSnapshot;
    readonly sceneId: symbol;
    readonly sessionId: symbol;
    readonly resize: RenderViewportResizeReceipt;
    readonly mapping: ViewportMapping2D;
}
```

## Closure protected-scope audit

No Phase9 changes to runtime-engine, game-server, package manifests, lockfile,
workspace/dependency permissions or foundation pins. No closure production source
change; only five documentation paths. No test runner/workflow/dependency added.
Public roots import under Node without Three resolution or DOM instantiation;
strict ES2022-only root/legacy consumers compile with skipLibCheck false.
These observations do not certify native behavior, GPU cleanup or displayed pixels.
