# v0.1.7 — Minimal working Editor–Render MVP (ER14)

Status: **READY_FOR_DEVELOPER_REVIEW — v0.1.7**, with verification below.
**FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED**. A real Three.js implementation
and compiled manual consumer are provided, not a claim of observed GPU execution.
No FRAME_PASS, frame-displayed or visual acceptance is asserted. Previous
checkpoints are not marked ACCEPTED. Stop before v0.1.8; no Phase closure,
merge/tag/release/publication.

## Preflight / ownership / evidence

Clean continuing branch `feat/editor-render-foundation-v0.1` at
`fb34a2fe0ef803bfa43709fa5ecd009f96e63c55`; remote and open Draft PR #1 agree.
Read root/project AGENTS, ARCHITECTURE, FOUNDATION, Harness ownership/contracts/
verification and v0.1.6; audited actual Render/Editor sources/public exports,
manifests/references and Harness config. No source drift. PR preflight precedes
implementation. The v0.1.7 task explicitly authorizes real Three.js integration
and minimal compatible additions; no existing public signature is broken.

Canonical primary owner: **runtime-render**, graphics acquisition, rendering and
resource/error semantics. Collaborator **editor** owns target markup, user actions
and manual consumer lifetime. No external L1/L2 operation or Engine source is needed.
Editor draws nothing itself. No Client/Server implementation changes.

Evidence for an additive path: v0.1.6's initialize/bound and Editor mounted accept
opaque references only. Requiring canvas/WebGL or async acquisition in those
operations would change behavior. The new factory explicitly opts into graphics,
leaving all nine old Render and eight Editor root symbols unchanged. Existing
Editor preview-host remains binding-only; the manual entrypoint is its distinct
graphics consumer, not a silent upgrade or a generic manager.

Registry audited Three **0.186.1** / @types/three **0.186.0**, exact manifest/lock
versions. [r186 renderer docs](https://github.com/mrdoob/three.js/blob/r186/docs/pages/WebGLRenderer.html.md)
and [renderer source](https://github.com/mrdoob/three.js/blob/r186/src/renderers/WebGLRenderer.js)
were consulted, then installed 0.186.1 source inspected for context initialization,
listener removal and dispose. Three requires WebGL2; no WebGL1/software fallback.
No upstream modification or copied renderer code.

## Additive public graphics contract

Only `@rpg-platform/runtime-render` root is public. Five additional symbols:

| Symbol | Semantics / consumer |
| --- | --- |
| `createRenderFrameSession(host: RenderHostBinding): Promise<RenderFrameSession>` | Existing create/init binding, target reservation, dynamic import of internal browser backend, explicit Three acquisition; resolves only with resources acquired, submits no frame. Editor manual entrypoint awaits it |
| `RenderFrameSession extends RenderSessionLifecycle` | Existing getSnapshot/initialize/dispose signatures, plus synchronous renderFrame. No Three/DOM type exposed |
| `RenderFrameReceipt` | Frozen readonly sessionId + status `submitted`; obtained only after real renderer.render returns without detected context/GL error; not compositor/display evidence |
| `RenderFrameFailure` | Frozen readonly code/stage/cleanupFailed diagnostics, separate from the existing RenderFailure union |
| `getRenderFrameFailure(error: unknown)` | Same-instance private-brand classification or undefined; no raw target/context/cause; unknown never means success |

`renderFrame(): RenderFrameReceipt` explicitly submits one opaque blue (#147da8)
clear frame using a real Three WebGLRenderer with empty Scene and Camera. There
is no mesh/asset, shader authoring, scene graph API, scheduler or permanent loop.
The pinned renderer's public info.render.frame must advance by one, rejecting its
early-return/no-op paths; context-loss and GL error checks must also pass.
The clear frame is intentionally visible and nontransparent, not an offscreen
placeholder. preserveDrawingBuffer is requested for manual observation; existing
canvas contexts may retain their browser-selected creation attributes. No GPU
finish/readback or display-success claim is made.

The same object/symbol/unknown public boundary remains. Old `RenderFailure` codes,
state unions, symbol identity, idempotency, readonly observations and sync signatures
are unchanged. Old callers need no migration. New factory errors are Promise
rejections; hosts must await and dispose even a late/unwanted acquisition result.
There is no cancellation API or pending public handle. No disposed handle is reused.

## Resource ownership / errors / disposal

Supported graphics target: positive-size HTMLCanvasElement in the current realm.
Cross-realm canvas, OffscreenCanvas, arbitrary object, worker/headless graphics are
not supported by this milestone. This restriction is new-factory-only. Missing
WebGL2/null/lost context rejects; importing the Render root never initializes it.

One pending/active graphics session may reserve a target per package instance,
via a private WeakSet. Different canvases remain independent. No resource cache,
global renderer or multi-target manager. Hosts must not concurrently use the same
canvas with another renderer/package copy or change its size/context during a
session; cross-package ownership is not enforced by this local guard.

| Failure | Channel / semantics |
| --- | --- |
| Invalid reference | Existing INVALID_HOST_TARGET from binding initialize; unchanged classifier |
| Unsupported target | UNSUPPORTED_TARGET / acquire |
| Target reserved | TARGET_IN_USE / acquire; never releases someone else's reservation |
| WebGL2 missing/throwing/lost at acquisition | GRAPHICS_UNAVAILABLE / acquire; no fallback success |
| Backend constructor/setup failure | ACQUISITION_FAILED / acquire, cleanup attempted; cleanupFailed reports uncertainty/failure |
| Frame throw, detected GL error or context loss | FRAME_FAILED / renderFrame; attempts cleanup, terminates session, preserves primary classification with cleanupFailed flag |
| Explicit cleanup failure | CLEANUP_FAILED / dispose; lifecycle still terminal, no successful cleanup claim |
| Observation/init/frame after dispose | Existing SESSION_DISPOSED diagnostics; frame uses getSnapshot before touching backend |
| Module loading or unrecognized exception | Remains an exception/unknown; not guessed to be missing graphics or success |

Render owns Three renderer, scene/camera references and Three allocations/listeners.
Dispose clears its slot, attempts scene clear and renderer.dispose independently,
then terminally disposes the underlying binding and drops target references.
It restores Three's data-engine attribute only if the host has not changed it.
No canvas removal, dimension/style rewrite or forced context loss. Browser/host
retains canvas and browser context lifetime; no contexts are cached by Platform.
There is no texture, geometry or material created by this empty-scene proof.

Normal cleanup releases the reservation for a fresh later session on the same
canvas. Repeated dispose is terminal/idempotent, does not retry backend cleanup.
If cleanup fails, the weak reservation quarantines that target; use a fresh
host-owned canvas rather than pretending the renderer can be reused. If Three's
constructor throws before returning an instance, inaccessible partial allocations
cannot be certified disposed: cleanupFailed=true and target remains quarantined.
This limitation is explicit, not a complete GPU reclamation guarantee. No raw
resource details enter public diagnostics. Old snapshots can still retain target
references; caller must drop them as before.

## Module/build portability and Editor usage

Render root re-exports graphics types/factory but loads only reference/lifecycle
code. Three import is in an internal browser module loaded by explicit async
acquisition. The static index/frame-session cycle uses no top-level calls into
uninitialized bindings. No module-level DOM/GPU acquisition. Headless consumers
can keep importing root/using metadata without calling the graphics factory.

DOM compiler libs are scoped to Render (backend/Three typings) and Editor (explicit
manual browser entrypoint), not tsconfig.base, Engine, Client or Server. Public
Render declarations do not mention DOM or Three; Client/Server ES2022-only builds
remain usable. Three and @types/three are declared **only in Render**, though npm
hoists files. @types/three brings existing upstream dev-only helper dependencies
(including rapier/tween types); no physics/tween API is imported, bundled or used.
Exact resolutions/integrities are locked. No new project/tool/bundler/framework.

Editor `src/manual-demo.ts` imports the Render package root and is not imported or
exported by the Editor root. Host HTML owns the fixed 640x360 canvas and buttons.
Start awaits acquisition, submits one frame, then retains the disposable handle;
Dispose releases it; next Start creates a fresh session. No Editor drawing calls.
Pending state prevents overlapping starts. pagehide disposes active work and a
late resolved result is immediately disposed if the page is leaving; no promise
of cleanup after process termination. No resize observer or frame scheduling.

See [manual instructions](../../editor/manual/README.md): after normal setup and
forced build, run from root:

```sh
python -m http.server 4173 --bind 127.0.0.1 --directory .
```

Open http://127.0.0.1:4173/editor/manual/, Start, inspect blue canvas, Dispose,
optionally Start again. HTML import map resolves the Render root to the built
artifact declared in its manifest, not a private API; Three uses its installed ESM
artifact. No CDN or deep source import in Editor TS. HTTP is required, not file://.
Manual observation is Developer-owned; no browser execution or visual acceptance
has been performed by this checkpoint's build gates. **VISUAL_NOT_VERIFIED**.
An interactive observation was attempted using a temporary localhost server, but
the session's IAB returned `Browser is not available: iab` and browser inventory
was empty. No browser page/frame could be observed. This is an unavailable browser
surface, not evidence of a renderer/WebGL failure. The temporary server was stopped.

## Future stress assessment (source/design only)

| Scenario | Assessment |
| --- | --- |
| One frame -> dispose -> new session same page | Source supports fresh factory after successful dispose, preserving canvas/context and releasing reservation. Old handles remain disposed; no runtime PASS claimed |
| Browser lacks WebGL2 / headless import | Explicit acquire rejects appropriately; root import defers backend. Server still imports Engine only; compilation, not headless execution evidence |
| Equivalent Client consumer | Can call the same Render root factory/receipt/dispose without Editor; no Client feature implemented |
| Later map/sprite/animation/VFX | Render retains resource/backend owner and explicit frame seam; actual inputs/projection/playback/content format are deferred, not inferred from this empty scene |

## Inventory and build-only verification

15 changed/new files: Render src index/frame-session/frame-failure/three-frame,
Render package/tsconfig, Editor src manual-demo/tsconfig/manual HTML/manual README,
both AGENTS, Harness CONTRACTS/this report, root package-lock. Infra allowance is
only lockfile and related Harness docs. No Engine/Client/Server source, base compiler
config, historical report, Harness checker/config, CI or version changes. Five
private 0.0.0 projects. Core 2.0.0 pin `04b7239f998c3c688a0dfa3202f11811a9acd775`
and Gameplay 0.15.2 pin `acea332aa80f67552192a72b30f81c0bbbfc56bd` unchanged;
their artifacts/exports/source are read-only.

```sh
node harness/cli.mjs check
node harness/cli.mjs scope --projects runtime-render,editor --allow-infra
node harness/cli.mjs verify --projects runtime-render,editor --with-consumers
npm run build -- --force
```

Observed results are recorded after final execution below. Exact checkpoint SHA
and push/PR CI links belong to continuing Draft PR #1. No unit/integration/UI/
browser/E2E/snapshot tests, runners, runtime probes, framebuffer readbacks or
automated visual assertions. Build is public API compilation only, not execution,
graphics compatibility, cleanup correctness or visual acceptance. No FRAME_PASS.

Observed locally on Node 24.18.0 / npm 12.2.0:

| Gate | Result |
| --- | --- |
| Static architecture/import scan | ARCH_CHECK_PASS; 10 JS/TS source files |
| Declared scope + related lock/Harness docs | SCOPE_PASS; 15 paths |
| Render independent build | BUILD_PASS |
| Editor independent build / real named graphics API compilation | BUILD_PASS |
| Discovered Game Client consumer build | BUILD_PASS; unchanged source, ES2022-only |
| Forced workspace build | BUILD_PASS; all five projects, including ES2022-only Server |
| Declarations/emitted module review | New public surface has no DOM/Three types; backend import is dynamic; old root APIs retained |
| Dependency/lock review | Only Render adds exact Three/types; upstream Core/Gameplay/TypeScript entries unchanged |
| Git whitespace check | PASS |

No failed/unconfigured build remains. Existing Windows Harness DEP0190 shell warning
unchanged. Interactive visual observation was blocked by the session's unavailable
browser surface; it is not included as a passing gate. Manual GPU/visual behavior,
same-canvas remount, context-loss handling and actual resource reclamation remain
unverified. Developer must review these before accepting the MVP; build alone
does not satisfy visual acceptance. Keep Draft PR #1; stop at v0.1.7.
