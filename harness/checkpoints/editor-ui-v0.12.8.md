# v0.12.8 — Viewport & Canvas Layout Integration

Status: IMPLEMENTED. Finite browser/backend observations below do not establish
full feature, visual or Phase 12 acceptance; those remain Developer-owned.

## Preflight and ownership

- Baseline `b67fa62` (v0.12.7), branch `feat/editor-ui-foundation-v0.12`.
  No associated/open PR at inspection. Pre-existing untracked `.mcp.json` remains
  unchanged and excluded from this checkpoint commit.
- Read root/project AGENTS, ARCHITECTURE, harness OWNERSHIP/WORKFLOW/VERIFICATION,
  Editor manifests/tsconfigs/public root, current shell/Panel/app/theme, UI
  foundation and styling contracts, the complete current viewport-host lifetime,
  and relevant Render root/snapshot/backend cleanup source. React effect cleanup
  guidance was checked against official React documentation through Context7.
- Feature: mount one host-owned canvas in the React workspace, forward safe
  commands and expose actual host observations without duplicating its lifecycle.
- Canonical primary production owner: **editor**. No production collaborator
  requires changes. Harness owns this checkpoint record only.
- Same-project seam: `mountEditorViewport(target, notify)` from
  `editor/src/viewport-host.ts`. Its current optional pixelRatio/content arguments
  are intentionally omitted: keep the canonical DPR supplier and attach no
  Scene/Camera/Animation/VFX content.
- Internal return surface consumed: `getSnapshot`, `start`, `requestFrame`,
  `suspend`, `resume`, `unmount`. `sync` remains available but the UI does not need
  it; the host's existing observers/listeners schedule layout synchronization.
- The unchanged host consumes Render **public root** acquisition, frame demand,
  viewport resize/suspension and failure classifiers. Render retains native
  buffers, GPU resources and submissions. External L1/L2 APIs consumed: none.
  Portable Editor/Render exports, business contracts and schemas: **no delta**.
- Allowed scope: viewport adapter, App integration, structural viewport Module
  and this checkpoint. No shell modification proved necessary. Expected gates:
  architecture check, editor-only scope with checkpoint infra, genuine Editor
  verify including UI checker, portable tsc, UI typecheck and Vite build.

## Changed files and lifecycle

- `editor/ui/src/viewport/Viewport.tsx`: one React canvas ref and effect; one
  fresh host per effect setup, with the current host in a ref. No acquisition
  during render/effect setup; Acquire forwards explicit user intent to start.
  Frame/Suspend/Resume forward to the same host. Acquire is admitted once per
  target mount; a new attempt requires Unmount/Mount and a fresh canvas.
- Cleanup stops UI notification acceptance, cancels the one deferred loss
  observation and closes the host. Explicit Unmount closes synchronously before
  React removes the target; effect cleanup avoids a duplicate unmount. Retired
  effects cannot publish late observations into a newer mount. The unchanged
  host owns late acquisition disposal, observer/listener cleanup and callback
  cancellation; React neither races it with a second acquisition nor reimplements
  its pending/session state machine. StrictMode remains enabled.
- UI uses host snapshots for mounted/unmounted, pending, paused, graphics and
  viewport states, accepted CSS/DPR/buffer metrics and submission counts. Labels
  explicitly describe the **last observation**, including after closing while
  pending; they do not promise a live cleanup result after notifications stop.
  Mount is never labeled graphics-ready; submitted never means displayed.
- Native context-loss dispatch needs one deferred UI snapshot read. A microtask
  was observed too early between native listeners, still showing graphics ready.
  A cancellable one-shot `setTimeout(..., 0)` reads after dispatch and displays
  Render's terminal classifier. It is not frame scheduling, polling, a render
  timer or a replacement lifecycle listener.
- Safe Mantine Alert feedback exposes classified codes or UNRECOGNIZED, never
  raw exceptions/stacks. Cleanup failure, if present, is distinct. Mount-setup
  exceptions have generic safe feedback. No automatic retry/fallback or Render
  notification bus. Buttons and statuses remain scoped to this viewport.
- `editor/ui/src/app/App.tsx`: replaces the center placeholder with Viewport and
  labels the header integration example. Existing Panel demonstrations remain
  explicitly illustrative; no domain workflow is added.
- `editor/ui/src/styles/viewport/viewport.module.css`: structural canvas geometry
  only, within the already locked `styles/viewport/**/*.module.css` category
  rather than the task's optional flat filename. `.viewport` flex/shrink,
  `.surface` relative flex/shrink/overflow, `.canvas` block/absolute/inset-zero/
  full-parent display geometry. Absolute fill prevents the native canvas's
  intrinsic bitmap size from feeding back into flex layout. Raw canvas has no
  Mantine styling props, so this Module is necessary; decoration belongs to the
  Mantine wrapper using the existing viewportBackground token.
- This checkpoint. No `canvas.width/height` props or assignments, CSS bitmap
  scaling substitute, canvas padding/border/transform, GPU/Three calls, UI DPR
  sampling, ResizeObserver, rAF loop or second scheduler. No policy/checker,
  dependency, manifest, lockfile, theme, root configuration, CI, Harness code,
  portable Editor source or cross-project production change.

## Actual final gates

- `node harness/cli.mjs check`: ARCH_CHECK_PASS; 193 JS/TS source files inspected.
- `node harness/cli.mjs scope --projects editor --allow-infra`: SCOPE_PASS.
- `node harness/cli.mjs verify --projects editor`: BUILD_PASS and verification
  pass, including UI_CONTRACT_PASS (9 source files, 3 authored stylesheets,
  0 errors, 0 manual-review warnings), unchanged portable-root compilation,
  UI typecheck and Vite production bundle (924 modules).
- UI build is included in verify. A development standalone UI build also passed;
  final verify above is the evidence after the last adapter change.
- `git diff --check`: clean. No failed or unconfigured final build.
- Nonblocking diagnostics: Vite >500 kB chunk advisory (UI 536.08 kB / 164.98 kB
  gzip; existing dynamically acquired Three backend 536.85 kB / 134.44 kB gzip)
  and Harness process-launch Node DEP0190 warning. No unrelated changes to
  suppress them. No test files/runners/suites introduced or run.

## Finite browser observations — 2026-10-24

Observed directly in local Vite development with StrictMode enabled using browser
navigation, UI commands, bounded DOM/native inspection and screenshots. Temporary
instrumentation existed only in the browser; no test/script fixture is retained
in the repository. Browser/dev server stopped after observation. Artifacts are at
`C:\Users\admin\AppData\Local\Temp\rpg-editor-viewport-v0.12.8-browser-evidence`.

- Before Acquire: one canvas, graphics not acquired, submissions zero; native
  default bitmap 300×150, with CSS display geometry already parent-sized.
- Acquire reached actual graphics ready / viewport active. The unchanged host
  submitted initial resize demand; explicit Frame increased submissions by one.
  In a later fresh mount the observed counts were 1 after Acquire, 2 after Frame.
  No duplicate acquisition/submission observed in these bounded mount cycles.
- Final 1440×900: CSS canvas 904×474.42; accepted/native buffer 904×474 at DPR 1.
  Document extent 1440×900. Screenshot showed the existing backend's solid blue
  clear surface, with controls and both sidebars visible; no authored scene.
- 1024×768: CSS width 744; resize produced a 744×342 buffer during observation
  (before a later guidance-text adjustment). Final 390×844: CSS 366×127.16,
  native buffer 366×127. Controls wrap; screenshot inspected, no page overflow.
- Browser CDP emulation with DPR 2 **and layout resize** to width 1441: CSS
  905×474.42, host requested DPR 2, native buffer 1810×948. DPR was applied once
  by existing Render sizing. A DPR-only CDP override without a layout event did
  not refresh the host observation in this browser; real monitor/zoom resolution
  event delivery is not verified. Emulation was cleared afterward.
- At 390×320 the canvas CSS height reached zero. Host emitted
  hidden-or-zero-explicit-resume-required, viewport suspended, paused true, Frame
  unavailable. Enlarging the window did not resume automatically; Resume restored
  active state. At such short heights controls/status consume the workspace and
  existing workspace-local scrolling is needed; no usable canvas-height claim.
- Suspend exposed ready graphics / suspended viewport; Resume returned active.
  Native context loss was deliberately requested through the browser extension
  on the existing context (diagnostic tooling only). The deferred host snapshot
  showed graphics failed / viewport terminal and an accessible CONTEXT_LOST
  Alert; Frame/Resume/Acquire were unavailable. No automatic recovery occurred.
- Acquire then Unmount synchronously in one browser interaction: final retained
  observation was unmounted, pending, uninitialized, event
  unmounted-awaiting-late-release. After acquisition settled the old canvas stayed
  disconnected with its original 300×150 bitmap, zero canvas elements in the UI,
  and zero remaining tracked WebGL loss/restore/creation-error listeners on it.
  Temporary per-target add/remove instrumentation observed late listener creation
  followed by removal. This supports the canonical late-release path; it is not
  GPU-memory-reclamation or exhaustive leak proof. No late session resurrected UI.
- A fresh target mounted/acquired afterward. Expanding Navigator's long sample
  and End-scrolling its body to 1727 retained the **same** center canvas, one
  canvas total, 904-wide CSS geometry and document extent 1440×900.
- Final explicit Unmount showed host unmounted, graphics disposed, viewport
  terminal; target removed. Historical accepted metrics/counters remain labeled
  observations, not a new host or cleanup-success guarantee.
- Console: existing favicon.ico 404; no observed application exception. Native
  context-loss diagnostic was intentional. UI preserves backend absence/error
  distinctions, but GRAPHICS_UNAVAILABLE and cleanup failure were not induced.

## Handoff and limits

IMPLEMENTED; public contract delta **none**; no missing owner API or blocker.
FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED apply to full Developer acceptance:
finite blue-clear/backend observations are not all-device visual approval, GPU
cleanup proof, real-monitor DPR/hidden-tab verification or production deployment.
No Scene/Camera/Animation/VFX, authored content, gameplay, persistence, resource
workflow or pixel-quality acceptance is implied. The portable viewport-host and
Render remain unchanged; future consumers must retain their ownership and
explicit hidden/zero-size resume policy. No next-task capability, push, PR,
merge, publication or final phase acceptance is included.
