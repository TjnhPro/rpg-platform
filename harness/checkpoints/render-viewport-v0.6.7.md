# v0.6.7 — Viewport Region & Suspension

RV09,RV10,RV11. IMPLEMENTED full-canvas suspension foundation.
**FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED**; no browser/GPU run or phase acceptance.

## Preflight / scope / owner

Baseline34408652037aaaab878772745e93eb9c55b400f4 on
feat/render-context-viewport-v0.6, draft [PR6](https://github.com/TjnhPro/rpg-platform/pull/6).
Main merged Phase1–5 base8aee145e7272dcccff3f20b9be4c70b63ec27b43.
Read root/Render AGENTS, architecture, Harness contracts/ownership/workflow/
verification; inspect actual root/session/resize/metrics/frame/backend/error and
existing two-target manual host. Supplied task authorizes additive API; no new
approval gate. Runtime Render is sole primary owner. Editor/Client own visibility,
layout measurement and frame policy; compile-only collaborators in this change.
Ten checkpoint paths: Render frame-session/failure/index/manual entry/HTML/guide/
AGENTS, Harness contracts/ownership/report. No Engine/Server/Editor/Client production,
dependencies, Scene/Asset/Spatial/Document schema/dirty/save or gameplay changes.
Pre-existing untracked .mcp.json remains excluded and unread. Exactly five projects.

Verified lock Three0.186.1/@types0.186.0/TypeScript6.0.3 unchanged. External L1
04b7239f998c3c688a0dfa3202f11811a9acd775 and L2
acea332aa80f67552192a72b30f81c0bbbfc56bd remain read-only; no L1/L2 API needed.
Existing native backend/loss handling, full viewport and resize implementation are
reused unchanged. Initial native canvas target must still have positive attributes;
CSS-hidden is not a context-loss signal. Phase4 screen mapping stays pure/separate.

## Region / additive public delta

Render65 ->67 root symbols: suspendRenderViewport(session):RenderViewportSnapshot
and resumeRenderViewport(session,metrics,limits):RenderViewportResizeReceipt.
No new required session member or existing snapshot/factory/receipt shape change.
Previously reserved suspended state is now reachable. Graphics failure code union
adds VIEWPORT_SUSPENDED, existing renderFrame stage; exhaustive consumer handling
must account for the new code. It describes a rejected call, not failed graphics.

scope full-canvas means native drawing-buffer region with origin(0,0), width/height
from snapshot.size and bounds[0,width)x[0,height) in drawing-buffer pixels. It is
independent of CSS size, screen position, world placement or scissor. Active and
suspended retain a positive last-configured buffer extent, never zero CSS metrics
masquerading as accepted native allocation. No new region type is needed by a
consumer; future subregion seam requires explicit origin/bounds/clipping and
resize policy. Documentation-only; no split-screen, scissor stack or render texture.

## State / operation policy

| Operation / condition | Result |
| --- | --- |
| Suspend active or suspended | Idempotently suspended; same session/backend/extent/reservation, graphics ready, no native or CSS writes |
| Frame while suspended | Throws VIEWPORT_SUSPENDED/renderFrame before backend submission; no receipt/cleanup, state unchanged |
| Host hidden or zero CSS only | No automatic Render change; host explicitly defers frames/calls suspend |
| Host observes either logical dimension0 | Call suspend instead of resize0; retain positive native buffer |
| Resize/plan/resume with zero/invalid metrics | Existing TypeError/RangeError admission; no implicit suspension or successful resize; suspended stays suspended |
| Valid resize while suspended | Updates actual extent through RV08 but stays suspended |
| Valid resume while suspended or active | RV08 resize first, then clear suspension; same symbol/backend; no implicit frame |
| Rejected resume | Preserve prior state/reservation/extent; no success receipt |
| Failed backend resize during resume | Existing terminal cleanup/quarantine, size:null; no rollback or revive |
| Dispose | Clear suspension scalar, release canonical resources/binding, terminal snapshot size:null; preserve host UI/layout |
| Suspend/resume/frame on disposed session | Existing SESSION_DISPOSED/getSnapshot; no recreation |
| Foreign/custom/binding-only handles | TypeError without invoking their methods |

One shared per-acquisition scalar controls observation and frame admission. Private
weak session associations are non-enumerable, not a global viewport/visibility
manager. Snapshot readers retain only scalar state/diagnostics, not backend/target.
Existing disposal clears lifecycle binding, backend and target references; caller
snapshots survive as frozen historical values. No new native listeners/resources.
Suspension itself does not query live context health; native loss event still
terminates through RV05. If an event has not been observed, suspension rejection
may precede loss detection. Resume validates actual context through RV08; if loss
already disposed the session, terminal guard wins. Never auto-restore/reacquire.

Hidden browser frames may be throttled/not displayed; host must control scheduling.
No visibility-driven disposal, global event bus, ResizeObserver, polling, background
loop, camera/projection update or Document/workspace-state ownership is introduced.

## Consumer / evidence limits

Expanded existing manual-viewport-identity.ts/HTML uses public root only. Two
independent targets now expose host-only hide, explicit suspend, host zero CSS +
suspend, invalid resume, fresh measured resume, manual frame and disposal controls.
Observations print previous/current states, real symbol comparison, reservation,
host measurements/visibility. A/B operations remain separate; page exit/pending
release reuse prior cleanup. No assertions, fake backend, test runner or UI tests.
Guide describes active ->suspended/zero-size ->resume ->frame and A/B review.
Compiled only: real isolation, suspension/native loss/cleanup, hidden-tab frame
submission and blue-clear visual outcomes have NOT been observed. Manual product
acceptance is Developer-owned. No next checkpoint, merge/release/publication.

## Verification

| Gate | Observed result |
| --- | --- |
| `node harness/cli.mjs check` | ARCH_CHECK_PASS,75 source files inspected |
| `scope --projects runtime-render,editor,game-client --allow-infra` | SCOPE_PASS,11 paths:10 checkpoint paths plus excluded pre-existing .mcp.json |
| `verify --projects runtime-render,editor,game-client --with-consumers` | BUILD_PASS: Render,Editor,Client; expanded manual entry compiled |
| `npm run build -- --force` | BUILD_PASS: all five projects |
| Strict ES2022-only public-root consumer compile | PASS: suspend/resume types and new error code plus prior factories/metrics/resize/snapshots; no DOM lib,noEmit,not executed |
| Emitted root symbol inventory | Render67 / Editor134 |
| `git diff --check` | PASS |

No failed/unconfigured builds. Existing Harness DEP0190 warning remains. Exact
commit SHA and push/PR CI links live in PR6 checkpoint ledger after push.
