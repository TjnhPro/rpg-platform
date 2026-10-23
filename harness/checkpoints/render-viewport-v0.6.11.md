# v0.6.11 — Editor Viewport Host Integration

RV16. IMPLEMENTED Editor browser host integration through existing Render root.
**FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED**; no browser run or Phase6 acceptance.

## Preflight / scope

Baseline 7ab587a78119d3dcd8f79b6d32f1c15413fd942b, same
feat/render-context-viewport-v0.6 branch and draft [PR6](https://github.com/TjnhPro/rpg-platform/pull/6).
Merged Phase1–5 base remains 8aee145e7272dcccff3f20b9be4c70b63ec27b43. Read root/
Editor AGENTS, architecture, Harness contracts/ownership/workflow/verification;
audit preview-host.ts, manual-demo.ts/index.html, existing frame-demand consumer,
Render root/session/viewport/demand/failure contracts and Document isolation.
Route hint points to Editor; actual behavior ownership agrees. Supplied task
authorizes integration without intermediate review or changing public contracts.

Canonical primary owner **Editor**: browser canvas/layout/DPR, mount/unmount intent,
callback/observer/listener lifetimes. Runtime Render collaborator requires no source
change: existing public APIs already acquire/configure/suspend/request/release real
graphics and expose safe diagnostics. Harness changes only compact records/report.
Engine, Server and Client untouched. No external L1/L2 API required; frozen refs
L1 04b7239f998c3c688a0dfa3202f11811a9acd775 / L2 acea332aa80f67552192a72b30f81c0bbbfc56bd
stay read-only. Live lock: Three0.186.1/@types0.186.0/TypeScript6.0.3, unchanged.
No dependency/build/export-map/architecture direction change or sixth project.
Pre-existing .mcp.json stays unread and excluded.

## Source findings / implementation

- createEditorPreviewHost/openEditorPreviewHost and their mounted observations are
  binding-only; retained without edits. They neither acquire graphics nor promise
  readiness. Historical manual-demo.ts already acquires and submits one clear
  frame; it is not the integrated viewport/layout host. Its HTML links to the
  updated host. No competing backend or reinterpretation of mounted is needed.
- v0.6.9 on-demand demo used ratio1, did not configure measured UI size immediately
  after acquisition, and kept its listeners for page lifetime. Extract its actual
  host behavior into internal browser-only viewport-host.ts, consumed by the same
  frame-demand entry/HTML. This is an Editor-local implementation seam, not a new
  package-root API. Editor134/Render70/Client0 symbols and all signatures remain.
- Mount installs observation/lifecycle callbacks only. Start acquires using
  beginRenderFrameSession; binding/UI mount, pending, graphics-ready, viewport
  configuration and submitted receipt stay separate observations. Apply measured
  CSS/DPR through resizeRenderViewport before initial or changed-layout requests.
- ResizeObserver, window resize and a re-armed resolution matchMedia detect host
  changes. Unchanged measured tuples skip redundant resize/dirtying. Host owns
  CSS/layout; Render alone rounds/adopts native size and enforces real limits.
  No direct live canvas buffer write or CSS/gameplay math in Render. Fixed demo
  limits4096 per axis/4,000,000 pixels reject rather than clamp. CSS bounds assume
  this demo's untransformed, borderless, padding-free canvas; not universal sizing.
- One pending rAF at a time; redraw invalidation coalesces. Callback rechecks mount,
  session identity, pause state, positive fresh metrics and actual demand before
  one synchronous renderFrame. No idle repeat, gameplay tick, playback or clock
  semantics. Observe only reads. Requests/submissions are finite UI counters,
  not FPS/performance/GPU/display evidence. Frame request and resize/resume remain
  separate operations even when this host schedules a frame after configuration.
- Hidden/zero/disconnected target cancels and suspends an active session, preserving
  positive native extent and demand. Positive layout/visibility alone never
  resumes; explicit Resume reconfigures fresh metrics. Invalid sizing cancels and
  suspends host until valid explicit recovery. Native loss cancels host work;
  Render owns detection/terminal cleanup. Observe after event dispatch. No retry,
  implicit context restoration, fake frame or backend substitution.
- Unmount closes before cleanup, invalidates pending intent, cancels callback,
  disconnects ResizeObserver and removes its media/window/document/canvas/pagehide
  listeners. Independent teardown steps continue after an error and expose safe
  classifier diagnostics; no catch-and-success label. Held graphics dispose via
  Render. Repeated unmount is inert; UI controls remain page-owned for remount.
  Canvas/CSS stay host-owned and connected; no force context loss. Acquisition
  observation is retained for terminal failure/cleanupFailed, including unknown
  exceptions; raw host errors/native resources are not exposed in diagnostic UI.
- Acquisition has no abort API. Stop/hidden/unmount while pending makes the result
  unwanted. Its original handler disposes any late session immediately, without
  assigning it to host state/configuring/scheduling. Backend allocation may finish
  transiently after close; no cancellation claim. Demo refuses remount until the
  old request settles, avoiding overlapping acquisition of the same target. Page
  exit uses unmount; BFCache return requires a new explicit Mount/Start. Failed
  cleanup still respects Render quarantine; no reset/unlock path is invented.

No authored Document/session/dirty/revision/save or Scene mutation API is imported
by this integration. Viewport/UI state is not serialized into authored content;
Phase4 coordinates/world positions remain independent. No Map Editor, Scene Tree,
Inspector, UI framework, resource loading, animation, VFX or camera implementation.

Browser usage checked against primary specifications: [ResizeObserver](https://drafts.csswg.org/resize-observer/)
for element size notifications/disconnect, [CSSOM View](https://drafts.csswg.org/cssom-view/)
for browser DPR and media-query observations, and [HTML animation frames](https://html.spec.whatwg.org/multipage/imagebitmap-and-animations.html#animation-frames)
for host request/cancel. These are API references, not observed browser behavior.

## Manual proof handoff

The [Editor guide](../../editor/manual/README.md#editor-viewport-host--v0611)
and [real browser consumer](../../editor/manual/frame-demand.html) provide steps:
Mount -> Start -> single redraw / redraw x3 -> CSS resize / native DPR change ->
Suspend / zero size / hidden -> explicit Resume -> Unmount -> explicit remount.
Cold-cache network throttling permits manual pending-close review without injected
timers/hooks. Also inspect post-dispatch native loss/terminal cleanup via the
existing Render procedure. Genuine imported backend is Three/WebGL2, empty scene
opaque clear; no mock/stub/assertions or tests. Consumers are compiled, not executed.

No browser submission, pixel, observer/visibility/DPR delivery, race, cleanup or
GPU-memory reclamation result is claimed. Developer records actual browser/version,
steps and outcomes at manual review. Build PASS alone does not establish RV16
functional/visual acceptance or close Phase6. No blockers requiring architecture
changes; supported browser capabilities and manual acceptance remain constraints.

## Verification

| Gate | Observed result |
| --- | --- |
| `node harness/cli.mjs check` | ARCH_CHECK_PASS:78 JS/TS files |
| `scope --projects editor --allow-infra` | SCOPE_PASS:10 paths,9 checkpoint files plus excluded pre-existing .mcp.json |
| `verify --projects editor --with-consumers` | BUILD_PASS: Editor and referenced dependencies compiled |
| `verify --projects runtime-render,editor,game-client --with-consumers` | BUILD_PASS: Render,Editor,Client, including internal host and real manual entry |
| `npm run build -- --force` | BUILD_PASS: all five projects |
| Strict ES2022-only/no-DOM public consumer compile | PASS: unchanged create/open EditorPreviewHost and Render viewport observation; noEmit, not executed |
| Emitted root inventory | Editor134/Render70/Client0, unchanged; internal browser module not re-exported by root |
| `git diff --check` | PASS |

No failed/unconfigured builds. Existing Harness DEP0190 warning remains non-failing.
No test suites or browser execution. Exact-head SHA and both push/pull_request CI
links are maintained in PR6 checkpoint ledger after push.
No merge, release, publication or v0.6.12 work.
