# v0.6.0 — Render Context Architecture & Contract Foundation

RV01. **API_DESIGN_ONLY / FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED**.
This is an architecture checkpoint, not implemented viewport behavior or Phase 6
acceptance. No production source, public API, package, dependency, build or CI delta.

## Baseline and preflight

Exact baseline: fetched `main` / `origin/main`
`8aee145e7272dcccff3f20b9be4c70b63ec27b43`, clean before branching.
Branch: `feat/render-context-viewport-v0.6`; one continuing Phase 6 PR, base main.
The supplied v0.6.0 task authorizes this new phase despite historical checkpoint
stop notes. It does not retrospectively establish functional/visual acceptance.
No v0.6.1 task has been supplied; allocations below are proposals, not permission
to invent its implementation. No merge, release, tag or npm publication.

Canonical primary owner: **runtime-render**, shared graphics/viewport responsibility.
Editor and Client are audited as future consumers only; their source/guidance is
unchanged. Harness records the decision, not a sixth project. Modified files:
this report, `harness/CONTRACTS.md`, `harness/OWNERSHIP.md`, and Render `AGENTS.md`.
Previous contracts: Render52 / Editor134 root symbols. Semantic/API delta: zero;
no consumer migration or new L1/L2 usage. Expected checks are listed below.

Read root/project guidance, architecture, ownership/contracts/workflow/build-only
policy, actual public roots and session/backend/consumer source, manifests, lock,
compiler references, static scanner and CI. Route CLI suggests Render; actual
graphics ownership, not the hint, determines the owner.

Merged input ledger (first-parent history; checkpoint records retain their own
historical limitations):

| Phase | Merge baseline / source evidence | Reused boundary |
| --- | --- | --- |
| 1 | `4cec85b5a00e2477f00eee29e2da6025a532e973`; [nine-checkpoint ledger](editor-render-v0.1.8.md) | .0 ownership/Editor Three guard; .1 binding; .2 initialize; .3 disposal; .4 failures; .5 preview host; .6 compatibility; .7 async graphics; .8 audit |
| 2 | `fea9b734b849fa1c6bc953530e1fa425d43cfca8`; [Asset closure](asset-contracts-v0.2.10.md) | Editor catalog/reference owner; Render visual metadata preparation is not loading |
| 3 | `5ce0feb4c1967c0dee14919b9c11d56991a46bd0`; [Scene closure](scene-contracts-v0.3.11.md) | Editor authored membership/placement; no rendered Scene instance |
| 4 | `e46ec24dc662b1bc1588d5ec1c05d4f62739ac3c`; [Spatial closure](spatial-contracts-v0.4.12.md) | Render pure numeric projection/viewport mapping; Editor adapters, not GPU state |
| 5 | baseline `8aee145e7272dcccff3f20b9be4c70b63ec27b43`; [Document closure](document-v0.5.13.md), head `044b49c` | Editor documents/dirty/revision/storage orchestration; no graphics serialization |

Root README/architecture Phase 4 counts describe older snapshots; current source
and emitted declarations are authoritative: Editor134, Render52. Historical
"deferred" statements about APIs subsequently implemented are not current blockers.
No missing Phase 1–5 input or competing implementation was found.

## Existing source and public contracts

Only `@rpg-platform/runtime-render` root `.` is public (built ESM/declarations).
Appendix inventories **all 52** root symbols with exact emitted declarations.
Relative imports between emitted declarations do not authorize consumer deep imports.
`FrameError`, `ThreeFrameBackend`, `createThreeFrameBackend`, Three classes,
canvas/context objects and private target reservations are not public exports.

| Source (relative to repository) | Current meaning / consumer |
| --- | --- |
| `runtime-render/src/index.ts` | Borrowed `RenderHostBinding.target: object`; symbol identity; created/bound metadata snapshots; target-free disposed observation; safe binding failure getter |
| `runtime-render/src/frame-session.ts` | Async factory, same-instance exclusive target reservation, lazy backend acquisition, explicit synchronous frame receipt; extends existing lifecycle |
| `runtime-render/src/frame-failure.ts` | Safe branded code/stage/cleanupFailed classifier; unknown remains unknown, not success |
| `runtime-render/src/three-frame.ts` | Private Three/WebGL2 acquisition, empty Scene/Camera, opaque blue clear submission, GL checks and cleanup |
| `runtime-render/src/viewport-mapping.ts` | Pure immutable selected-plane projection and explicit screen origin/scale; no live viewport/session or automatic sizing |
| `runtime-render/src/visual-resource.ts` | Metadata capture; `resourceLoading: 'NOT_PERFORMED'`; no textures/IO |
| `editor/src/index.ts`, `editor/src/preview-host.ts` | Binding adapters and one preview slot; mounted is not graphics-ready; no Three/backend access |
| `editor/src/manual-demo.ts`, `editor/manual/index.html` | Separate browser entry, explicit acquire→single submit→dispose; host canvas640×360 with responsive max-width CSS; no resize synchronization/RAF |
| `game-client/src/index.ts` | Engine/Render root side-effect imports and `export {}` only; no operational graphics host |
| `editor/src/scene-spatial-point.ts`, `editor/src/scene-spatial-placement.ts`, `editor/src/viewport-mapping.ts`, `editor/src/document-*.ts` | Authored data/adapter and document owners, not live graphics state |

### Actual create → acquire → submit → dispose

1. `createRenderSession(host)` copies/freezes the wrapper and creates a fresh symbol;
   borrowed target is neither frozen nor validated. No lifecycle/resources.
2. `createRenderSessionLifecycle(host)` owns a created descriptor. `initialize()`
   accepts an object/function target reference and becomes bound, idempotently.
   It never establishes canvas liveness/GPU readiness. Invalid target throws
   `INVALID_HOST_TARGET/initialize`. `getSnapshot()` returns detached observations.
3. `await createRenderFrameSession(host)` internally initializes that lifecycle,
   reserves target in a package-instance WeakSet and dynamically imports backend.
   Backend accepts positive-size same-realm `HTMLCanvasElement`, obtains `webgl2`
   with preserveDrawingBuffer, rejects missing/lost context and constructs Three
   renderer/empty Scene/Camera. Fulfilled Promise means acquisition returned;
   public snapshot **still says bound**, not a new graphics-ready state. No frame
   is submitted by construction. No AbortSignal/cancellation protocol exists;
   caller must release even an unwanted late fulfillment.
4. `renderFrame(): RenderFrameReceipt` first uses lifecycle getSnapshot, then backend
   render. Success returns frozen `{ sessionId, status: 'submitted' }`; backend
   checks frame count, context loss and GL error. This is submission observation,
   **not displayed pixels, visual correctness, gameplay tick or elapsed simulation**.
   Calling after dispose throws binding `SESSION_DISPOSED/getSnapshot`, not a new
   frame diagnostic. Backend frame failure terminally disposes then throws
   `FRAME_FAILED/renderFrame`, carrying cleanup failure separately.
5. `dispose(): RenderSessionDisposal` clears backend references and binding,
   clears private Scene and disposes Three resources, conditionally restores
   Three's data-engine attribute. Does not remove/resize canvas or force context
   loss; browser owns native context lifetime. Repeated disposal returns terminal
   observation, not a retry of failed cleanup. Successful cleanup releases target
   reservation; failed cleanup quarantines target in this package instance and
   throws `CLEANUP_FAILED/dispose`. Existing observations cannot be revoked.

Acquisition failures: unsupported target, target already reserved, unavailable
graphics, or construction failure have distinct safe codes. Partial constructor
failure may leave inaccessible allocations; cleanupFailed conservatively prevents
reuse. Factory cleans its binding on failure; unknown dynamic-module failures
remain exceptions. `getRenderFailure` and `getRenderFrameFailure` recognize only
their own package-instance private brands, not arbitrary messages/duck typing.
No Platform public recovery/context-restoration event protocol or reusable global
pool. Installed Three's private WebGLRenderer does register context-lost/restored
listeners and attempts internal restoration; its dispose removes those listeners.
That library detail is not a Platform readiness/recovery guarantee or host event API.

## Decision RV01 — ownership and extension seam

| Responsibility | Canonical owner | Collaborator / invariant |
| --- | --- | --- |
| Canvas creation/mount/removal, CSS layout, visibility observation, host listeners | Editor or Client for its UI | Pass explicit target/measurements; release acquired session before replacement/removal |
| Measurement policy: logical size and requested pixel ratio | Host consumer | No DOM/layout polling or implicit window DPR in portable Render contracts |
| Validate/capture metrics, effective drawing-buffer sizing, viewport state | Runtime Render | Session-local presentation state; must distinguish requested versus effective dimensions |
| Graphics acquisition/backend, submission and owned native-resource cleanup | Runtime Render | Extend existing RenderFrameSession path; private Three implementation only |
| When to request a frame / pause requests / retry UX | Editor or Client | No duplicate renderer, no Engine simulation driven by frame timing |
| Safe graphics observations/failures and suspend admission | Runtime Render | Host chooses UX/retry policy; no fabricated successful frame on unavailable context |
| Authored world placement, Scene identity and Document revision/save | Existing Editor owners | Viewport/layout changes must not mutate authored content or mark documents dirty |
| Game-specific simulation/time/authority | Runtime Engine through frozen L1/L2 | No Render dependency or numerical behavior based on FPS |
| Game-specific server work | Game Server | No required DOM/WebGL/GPU; no changes here |

**Host Canvas ≠ Graphics Context ≠ Viewport State.** A borrowed object reference
does not imply a usable backend; viewport metrics are not a native context handle.
**bound ≠ graphics-ready ≠ submitted ≠ displayed**. Graphics-ready is explanatory
language here, not a shipped discriminant. **CSS pixel ≠ drawing-buffer pixel**.
Existing Phase4 css-px/device-px mapping descriptors are pure math inputs, not an
automatically synchronized graphics viewport. No Scene/Document serialization of
session symbol, canvas, native handles, viewport size, pixel ratio or suspension.

### Minimum future contract questions (unresolved signatures)

| Area | Required semantics before implementation | Signature/policy still OPEN |
| --- | --- | --- |
| Host metrics | Explicit logical width/height + requested positive finite ratio; detached immutable observation; CSS/buffer units distinct | Names, input factory/update operation, fractional size, zero/hidden policy, ratio bounds, rounding and buffer limits; not a new ViewportMetrics2D meaning |
| Graphics context | Existing async acquisition and target exclusivity; safe availability/failure observations | Additive readiness/capability observation, loss/restoration handling and reservation behavior; never expose Three/WebGL handle |
| Viewport update | Render applies effective size; CSS remains host-owned; no mutation of authored positions | Update timing, atomic failure behavior, effective-size reporting and relation to existing pure mapping; no implicit fit/camera |
| Frame | Keep zero-argument synchronous renderFrame and submitted receipt behavior | Any optional future arguments/observations require supplied task and backward-compatibility audit; no loop/tick/scheduler |
| Suspend | Distinguish host request suppression from Render-owned suspension/resource state; never claim submission while suspended | Operation names, observation shape, resume preconditions and failure channel; no current suspend API |
| Cleanup | Keep terminal idempotent disposal, safe failure reporting and borrowed target lifetime | Added listener/resource teardown, pending acquisition/late result ownership, loss versus disposal; no automatic canvas destruction |
| Compatibility | Preserve metadata factories, snapshot states, receipt fields, same-instance classifiers and lazy backend | Prefer additive root symbols/optional seams; required members/union expansion may break implementers/exhaustive consumers and require explicit audit |

## Proposed RV02–RV19 allocation and version gates

Only RV01/v0.6.0 is supplied. The IDs below are **proposed responsibility slots**,
not a claim to know an absent roadmap's canonical names. Subsequent task text wins;
record any remapping then. No future signatures or runtime API are approved by
this table. Proposed version slots permit contract work only under the matching
supplied checkpoint after preflight; do not pre-implement the full phase.

| Proposed ID | Responsibility / owner | Earliest proposed checkpoint |
| --- | --- | --- |
| RV02 | Explicit host logical metrics / Render DTO, host supplies measurement | v0.6.1 |
| RV03 | Requested pixel ratio and buffer unit/rounding policy / Render | v0.6.1 |
| RV04 | Session-local effective viewport observation / Render | v0.6.2 |
| RV05 | Additive graphics readiness/context observation / Render | v0.6.2 |
| RV06 | Explicit viewport resize application / Render | v0.6.3 |
| RV07 | Metrics validation and invalid/zero/limit disposition / Render | v0.6.3 |
| RV08 | Existing explicit frame admission/submission compatibility / Render | v0.6.4 |
| RV09 | Safe additional diagnostics / Render | v0.6.4 |
| RV10 | Suspend presentation requests/state / Render, host intent | v0.6.5 |
| RV11 | Resume admission / Render, host request | v0.6.5 |
| RV12 | Context loss observation / private backend→safe Render surface | v0.6.6 |
| RV13 | Explicit recovery/reacquisition policy / Render; host UX | v0.6.7 |
| RV14 | Resource/listener disposal and partial-acquisition ownership / Render | v0.6.8 |
| RV15 | Independent-session and target-exclusive compatibility / Render | v0.6.9 |
| RV16 | Public root/private backend boundary audit / Render + Harness record | v0.6.10 |
| RV17 | Editor host metrics/visibility/on-demand integration / Editor | v0.6.11 |
| RV18 | Client host integration through same Render surface / Client | v0.6.12 |
| RV19 | Finite manual MVP and whole-phase integration audit / Render primary, consumer evidence | v0.6.13 MVP; v0.6.14 closure |

Public contracts belong at Render root only when a real supplied checkpoint needs
them; Three resizing/context/listener mechanics remain private backend details.
No ViewportManager, singleton renderer, engine abstraction, scheduler, extra package,
Scene/Camera/Texture API, resource loading, animation or VFX contract is introduced.

## Future-consumer impact matrix

| Consumer | Current use | Future need / compatibility action |
| --- | --- | --- |
| Editor binding adapters / PreviewHost | Existing binding-only root API; mounted has no graphics | Preserve this text/headless path; never silently acquire GPU or reinterpret mounted |
| Editor browser manual demo | Actual async acquire, explicit one-frame call, pagehide disposal, pageshow restart; late result cleanup | Explicit host measurement/ratio forwarding, visibility policy and safe new observations when tasked; CSS max-width currently does not synchronize buffer |
| Editor Spatial adapters | Explicit portable mapping/projection, no session | Reuse canonical math with chosen measured context; do not auto-change authored positions or serialize live viewport |
| Editor Document operations | Content/revision/storage; no graphics | Viewport changes stay workspace/presentation-only; zero dirty/save semantic delta |
| Client root | Compile-only dependency/import, no graphics usage | Future independent target/layout/frame-request host through Render root, no Editor dependency or copied backend |
| Engine / Server | Engine imports L1/L2; Server imports Engine only | No change; no browser libs, GPU requirement, frame-time simulation or mandatory network topology |

## Dependency, backend and guard audit

Actual manifest/import direction (arrows mean depends on, not authority):

```text
runtime-engine -> @rpg/core/kernel + @rpg/gameplay
runtime-render -> three (no workspace dependencies)
editor         -> runtime-engine + runtime-render
game-client    -> runtime-engine + runtime-render
game-server    -> runtime-engine (Render permission unused)
```

Exactly five workspaces and five genuine independent tsc builds; root references
all five. Server retains ES2022-only base without DOM libraries. Three is lazy on
explicit graphics acquisition, not imported at Render root evaluation; this is
source reasoning, not a browser/headless execution guarantee.

Manifest, lockfile and installed versions agree: Three **0.186.1**,
@types/three **0.186.0**, TypeScript **6.0.3**. Browser backend requires same-realm
HTMLCanvasElement and available WebGL2. OffscreenCanvas, foreign-realm canvas,
WebGPU, WebGL1 fallback and guaranteed context restoration are not supported by
this source. No dependency upgrade is needed for this architecture checkpoint.

L1 pin remains Core2.0.0 `04b7239f998c3c688a0dfa3202f11811a9acd775`;
L2 Gameplay0.15.2 `acea332aa80f67552192a72b30f81c0bbbfc56bd`.
Neither source/artifact nor Engine import/call is edited. No upstream checkout
mutation, copied implementation or Legacy Gameplay use.

Existing Harness checks direct cross-project deep imports, dependency direction,
foundation consumer restrictions and Editor direct Three dependency/imports.
The special Three guard is Editor-specific; Client source/manifests are manually
audited (no Three usage), not claimed covered by that special rule. Current task
authorizes documenting boundaries, not adding speculative guards. No concrete
source violation/repeated failure justifies modifying the scanner. Regex checks
cannot prove absence of computed imports, runtime misuse or third-party defects.

## Verification and handoff

Run the following real gates after documentation edits. Results are recorded
below, with exact-head CI recorded in the continuing PR after commit/push (a
commit cannot embed its own hash). Resolve checkpoint SHA using
`git log --diff-filter=A --format=%H -- harness/checkpoints/render-viewport-v0.6.0.md`.

```sh
node harness/cli.mjs check
node harness/cli.mjs scope --projects runtime-render,editor,game-client --allow-infra
node harness/cli.mjs verify --projects runtime-render,editor,game-client --with-consumers
npm run build -- --force
```

No tests, assertions, runner, browser automation, runtime probe or visual review
is added/run. This checkpoint delivers architecture/inventory only. No new frame
submitted or viewed; historical manual evidence is not rerun evidence. Build PASS
does not establish viewport behavior, GPU availability, recovery or correct display.

Observed locally on Node24.18.0 / npm12.2.0:

| Gate | Observed result |
| --- | --- |
| Architecture/import scan | ARCH_CHECK_PASS; 69 JS/TS source files |
| Scope | SCOPE_PASS; exactly four documentation paths |
| Independent Render build | BUILD_PASS |
| Independent Editor consumer build | BUILD_PASS |
| Independent Client consumer build | BUILD_PASS; root import only, no operational host claim |
| Forced workspace build | BUILD_PASS; all five projects, including Engine/Server |
| Fresh declaration inventory | Render52 / Editor134, zero delta |
| Git whitespace check | PASS |

No failed/unconfigured build. Existing Windows Harness DEP0190 child-process shell
warning remains unchanged; it is not a build failure or a new warning introduced
by this documentation checkpoint. Remote push/PR checks are recorded separately
at the exact checkpoint SHA in the PR ledger after publication.

## Appendix — exact existing Render root declaration inventory

Extracted from freshly built declarations with TypeScript module export resolution;
aliases resolved to declarations, comments omitted for readability. These are
existing signatures, not proposed APIs. Module headings are provenance, not public
subpaths. No implementation/private symbol is added to this inventory.

### index.d.ts (9 symbols)

```ts
export declare function createRenderSession(host: RenderHostBinding): RenderSessionDescriptor;

export declare function getRenderFailure(error: unknown): RenderFailure | undefined;

export declare function createRenderSessionLifecycle(host: RenderHostBinding): RenderSessionLifecycle;

export interface RenderHostBinding {
    readonly target: object;
}

export interface RenderSessionDescriptor {
    readonly id: symbol;
    readonly host: RenderHostBinding;
}

export interface RenderSessionSnapshot {
    readonly descriptor: RenderSessionDescriptor;
    readonly state: 'created' | 'bound';
}

export interface RenderSessionDisposal {
    readonly id: symbol;
    readonly state: 'disposed';
}

export type RenderFailure = {
    readonly code: 'INVALID_HOST_TARGET';
    readonly stage: 'initialize';
} | {
    readonly code: 'SESSION_DISPOSED';
    readonly stage: 'initialize' | 'getSnapshot';
};

export interface RenderSessionLifecycle {
    readonly getSnapshot: () => RenderSessionSnapshot;
    readonly initialize: () => RenderSessionSnapshot;
    readonly dispose: () => RenderSessionDisposal;
}
```

### viewport-mapping.d.ts (8 symbols)

```ts
export declare function createViewportMapping2D(input: ViewportMapping2D): ViewportMapping2D;

export declare function projectPointToViewport2D(input: ViewportMapping2D, point: PlaneProjectionPoint2D): PlaneProjectionPoint2D;

export declare function viewportPointToPlane2D(input: ViewportMapping2D, point: PlaneProjectionPoint2D): PlaneProjectionPoint2D;

export declare function viewportPointToScreen2D(input: ViewportMapping2D, point: PlaneProjectionPoint2D): PlaneProjectionPoint2D;

export declare function screenPointToViewport2D(input: ViewportMapping2D, point: PlaneProjectionPoint2D): PlaneProjectionPoint2D;

export interface ScreenMapping2D {
    readonly plane: ProjectionPlane2D;
    readonly origin: PlanarPoint2D;
    readonly screenUnitsPerViewportUnit: PlanarPoint2D;
}

export interface ViewportMetrics2D {
    readonly plane: ProjectionPlane2D;
    readonly width: number;
    readonly height: number;
    readonly screen: ScreenMapping2D | null;
}

export interface ViewportMapping2D {
    readonly projection: OrthographicPlaneProjection;
    readonly metrics: ViewportMetrics2D;
}
```

### plane-projection.d.ts (5 symbols)

```ts
export declare function createOrthographicPlaneProjection(input: OrthographicPlaneProjection): OrthographicPlaneProjection;

export declare function projectPlanePoint2D(projectionInput: OrthographicPlaneProjection, input: PlaneProjectionPoint2D): PlaneProjectionPoint2D;

export interface ProjectionPlane2D {
    readonly projectId: string;
    readonly coordinateSpaceId: string;
    readonly unit: string;
    readonly axes: {
        readonly x: 'right' | 'left';
        readonly y: 'up' | 'down';
    };
}

export interface PlaneProjectionPoint2D {
    readonly plane: ProjectionPlane2D;
    readonly point: PlanarPoint2D;
}

export interface OrthographicPlaneProjection {
    readonly kind: 'orthographic-plane';
    readonly source: ProjectionPlane2D;
    readonly destination: ProjectionPlane2D;
    readonly sourceOrigin: PlanarPoint2D;
    readonly destinationOrigin: PlanarPoint2D;
    readonly destinationUnitsPerSourceUnit: PlanarPoint2D;
}
```

### visual-alignment.d.ts (6 symbols)

```ts
export declare function createVisualAnchor2D(input: VisualAnchor2D): VisualAnchor2D;

export declare function createVisualOrientation2D(input: VisualOrientation2D): VisualOrientation2D;

export declare function resolveVisualAlignment2D(positionInput: PlanarPoint2D, unitInput: string, anchorInput: VisualAnchor2D, orientationInput: VisualOrientation2D): VisualAlignment2D;

export interface VisualAnchor2D {
    readonly unit: string;
    readonly anchor: PlanarPoint2D;
    readonly pivot: PlanarPoint2D;
    readonly localOffset: PlanarPoint2D;
}

export interface VisualOrientation2D {
    readonly axes: {
        readonly x: 'right' | 'left';
        readonly y: 'up' | 'down';
    };
    readonly zeroAxis: 'positive-x';
    readonly positiveRotation: 'toward-positive-y';
    readonly angleRadians: number;
}

export interface VisualAlignment2D {
    readonly unit: string;
    readonly origin: PlanarPoint2D;
    readonly pivot: PlanarPoint2D;
    readonly orientation: VisualOrientation2D;
}
```

### grid-conversion.d.ts (7 symbols)

```ts
export declare function createOrthogonalGridConversion(input: OrthogonalGridConversion): OrthogonalGridConversion;

export declare function gridCellToScenePosition(input: OrthogonalGridConversion, cell: GridCell2D, alignment: 'start-corner' | 'center'): GridScenePosition2D;

export declare function scenePositionToGridCell(input: OrthogonalGridConversion, position: GridScenePosition2D, policy: 'floor'): GridCell2D;

export interface GridConversionSpace {
    readonly projectId: string;
    readonly coordinateSpaceId: string;
    readonly unit: string;
}

export interface OrthogonalGridConversion {
    readonly space: GridConversionSpace;
    readonly orientation: 'orthogonal';
    readonly origin: PlanarPoint2D;
    readonly cellSize: {
        readonly width: number;
        readonly height: number;
    };
    readonly indexing: {
        readonly columnDirection: 'positive-x' | 'negative-x';
        readonly rowDirection: 'positive-y' | 'negative-y';
        readonly negativeIndices: 'allow' | 'reject';
    };
}

export interface GridCell2D {
    readonly space: GridConversionSpace;
    readonly cell: {
        readonly row: number;
        readonly column: number;
    };
}

export interface GridScenePosition2D {
    readonly space: GridConversionSpace;
    readonly point: PlanarPoint2D;
}
```

### planar-affine.d.ts (7 symbols)

```ts
export declare function toAffineTransform2D(input: PlanarTransform2D | AffineTransform2D): AffineTransform2D;

export declare function applyPlanarPoint2D(transform: PlanarTransform2D | AffineTransform2D, point: PlanarPoint2D): PlanarPoint2D;

export declare function composePlanarTransforms2D(transforms: readonly (PlanarTransform2D | AffineTransform2D)[]): AffineTransform2D;

export declare function invertPlanarTransform2D(input: PlanarTransform2D | AffineTransform2D): PlanarInverseResult;

export interface PlanarPoint2D {
    readonly x: number;
    readonly y: number;
}

export interface AffineTransform2D {
    readonly a: number;
    readonly b: number;
    readonly c: number;
    readonly d: number;
    readonly tx: number;
    readonly ty: number;
}

export type PlanarInverseResult = {
    readonly status: 'inverted';
    readonly transform: AffineTransform2D;
} | {
    readonly status: 'non-invertible';
    readonly reason: 'SINGULAR_OR_ILL_CONDITIONED';
};
```

### planar-transform.d.ts (2 symbols)

```ts
export declare function createPlanarTransform2D(input: PlanarTransform2D): PlanarTransform2D;

export interface PlanarTransform2D {
    readonly translation: {
        readonly x: number;
        readonly y: number;
    };
    readonly rotationRadians: number;
    readonly scale: {
        readonly x: number;
        readonly y: number;
    };
}
```

### visual-resource.d.ts (3 symbols)

```ts
export declare function prepareVisualResource(input: VisualResourceDescriptor): VisualResourcePreparation;

export interface VisualResourceDescriptor {
    readonly identity: {
        readonly projectId: string;
        readonly resourceId: string;
    };
    readonly mediaType: string | null;
    readonly sources: readonly {
        readonly role: string;
        readonly locator: {
            readonly type: 'project-relative';
            readonly path: string;
        };
    }[];
}

export interface VisualResourcePreparation {
    readonly status: 'metadata-prepared';
    readonly descriptor: VisualResourceDescriptor;
    readonly resourceLoading: 'NOT_PERFORMED';
}
```

### frame-session.d.ts (3 symbols)

```ts
export declare function createRenderFrameSession(host: RenderHostBinding): Promise<RenderFrameSession>;

export interface RenderFrameSession extends RenderSessionLifecycle {
    readonly renderFrame: () => RenderFrameReceipt;
}

export interface RenderFrameReceipt {
    readonly sessionId: symbol;
    readonly status: 'submitted';
}
```

### frame-failure.d.ts (2 symbols)

```ts
export declare function getRenderFrameFailure(error: unknown): RenderFrameFailure | undefined;

export interface RenderFrameFailure {
    readonly code: 'UNSUPPORTED_TARGET' | 'TARGET_IN_USE' | 'GRAPHICS_UNAVAILABLE' | 'ACQUISITION_FAILED' | 'FRAME_FAILED' | 'CLEANUP_FAILED';
    readonly stage: 'acquire' | 'renderFrame' | 'dispose';
    readonly cleanupFailed: boolean;
}
```
