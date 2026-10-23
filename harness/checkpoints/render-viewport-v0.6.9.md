# v0.6.9 — Frame Scheduling & Invalidation

RV13/RV14. IMPLEMENTED redraw demand and two optional manual browser hosts.
**FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED**. No browser execution or phase acceptance.

## Preflight / scope

Baseline 9c9fd4682a3928db45bf6e1835d0b1a41d17db18 on
feat/render-context-viewport-v0.6, same draft [PR6](https://github.com/TjnhPro/rpg-platform/pull/6).
Merged Phase1–5 main base remains 8aee145e7272dcccff3f20b9be4c70b63ec27b43.
Read root/project AGENTS, architecture, Harness contracts/ownership/workflow/
verification; audit actual frame/viewport/resize/lifecycle/root source, Editor
one-frame demo, Client root/build constraints and authored Document/Spatial separation.
Supplied task authorizes the additive contract delta without intermediate review.

Canonical primary owner: Runtime Render, for session-local invalidation bookkeeping.
Editor and Client collaborate as browser hosts: canvas/layout, callback scheduling,
visibility, cancellation and manual pattern consumers. No reverse imports, extra
project, duplicate backend or authored Scene/Document dirty/save mutation.
Sixteen checkpoint files: Render session/root/AGENTS/guide; Editor manual entry/
HTML/guide/AGENTS; Client manual entry/HTML/guide/AGENTS/tsconfig; Harness contracts/
ownership/report. Pre-existing untracked .mcp.json remains unread and excluded.

Lock remains Three0.186.1/@types0.186.0/TypeScript6.0.3. Backend unchanged: same-realm
HTMLCanvasElement + WebGL2, actual opaque-clear frame path. No dependencies or
package export-map changes. External L1 04b7239f998c3c688a0dfa3202f11811a9acd775 and
L2 acea332aa80f67552192a72b30f81c0bbbfc56bd stay read-only; no external API needed.
Engine/Server untouched. Client now compiles its private browser entry with DOM lib
like Editor; its root still neither imports that entry nor exposes browser types.

## Public contract / semantics

Render67 ->70 symbols: invalidateRenderFrame(session),
getRenderFrameInvalidationSnapshot(session), RenderFrameInvalidationSnapshot.
Editor134 and Client0 root symbols unchanged. Existing session/factory/receipt and
failure signatures are unchanged. No new timing parameter is necessary: neither
manual host advances animation/gameplay; browser callback timestamp is unused.

| Concept | Meaning |
| --- | --- |
| Invalidate | Mark demand for a future redraw; no scheduling, request, submission or scene update |
| Host request | Host chooses whether/when to invoke the existing synchronous renderFrame |
| Submit | Canonical backend returns through existing frame/counter/GL checks and emits receipt; not display/GPU-completion proof |
| State update | Accepted viewport configuration updates its snapshot and invalidates; authored/gameplay state is independent |

Snapshot is frozen {sessionId,invalidated}. Initial acquisition starts invalidated.
Repeated explicit invalidations coalesce into one pending boolean demand. Successful
resize, including unchanged native extent, conservatively invalidates; resume uses
that resize path. Invalid/rejected admission leaves demand unchanged. Suspend and
termination retain the historical demand flag; the reader stays available after
dispose/failure. Explicit invalidation on terminal sessions uses SESSION_DISPOSED;
foreign/custom handles throw TypeError without invoking their methods.

Successful renderFrame acknowledges only the opaque token captured before backend
work. A later invalidation stays pending. Rejected/suspended/no-op/failed submission
does not acknowledge demand. Clean is allowed to render again: continuous policy
does not require dirty. Demand is never readiness/visibility/queue/display evidence;
hosts must separately inspect the existing viewport/graphics state. No listeners,
clock, global event bus, queue, reason registry, FPS throttle or loop in Render.
Future real visual operations must mark their changes explicitly; no resource,
Scene, animation, VFX or camera implementation is fabricated to demonstrate it.

## Manual consumers / scheduling ownership

- [Editor on-demand](../../editor/manual/frame-demand.html): acquisition schedules
  the initial dirty frame. Three invalidations in one host turn share one pending
  callback. Resize/resume first update/invalidate, then host schedules. No idle
  polling or automatic repeat; explicit host event requests the next dirty redraw.
- [Client continuous](../../game-client/manual/frame-continuous.html): acquisition
  alone does nothing; Start resumes with measured positive metrics and schedules
  one callback at a time, requesting frames even when demand is clean. Stop cancels
  and suspends; repeated Start does not add a second pending callback.

Both hosts cancel on hidden/stop/dispose/page exit/native-loss event and errors.
Returning visible requires explicit Resume/Start; terminal sessions require explicit
new acquisition, never automatic recovery. Stop/hidden/dispose during acquisition
marks its late result unwanted and releases it. Callback checks prevent obsolete
session work. Native loss remains Render-owned; host listener ordering may log
before Render handles the event, so guides request Observe after dispatch.
No full UI shell, game tick, fixed timestep, worker, metrics/performance claim or
test hooks. Logging replaces bounded UI output rather than accumulating every frame.

Browser request/cancel semantics checked against the primary
[HTML animation-frame specification](https://html.spec.whatwg.org/multipage/imagebitmap-and-animations.html#animation-frames).
Only optional browser entries access these globals. Public roots do not evaluate
them or read clocks at import. Existing one-frame demos are preserved.

Both real public-root consumers compile in project builds, with no assertions,
runner, mocks/stubs or runtime CI suite. **They were not browser-executed.** Actual
on-demand coalescing, continuous start/stop, hidden-tab cancellation, native loss,
cleanup, frame submission and displayed pixels remain unverified. No measured FPS
target or performance result. Developer owns manual acceptance of Phase6.

## Verification

| Gate | Observed result |
| --- | --- |
| `node harness/cli.mjs check` | ARCH_CHECK_PASS,77 JS/TS source files |
| `scope --projects runtime-render,editor,game-client --allow-infra` | SCOPE_PASS,17 paths:16 checkpoint paths + excluded pre-existing .mcp.json |
| `verify --projects runtime-render,editor,game-client --with-consumers` | BUILD_PASS: Render,Editor,Client; both manual browser entries compiled |
| `npm run build -- --force` | BUILD_PASS: all five projects |
| Strict ES2022/no-DOM public consumer compile | PASS: invalidate/read/demand-gated existing renderFrame, prior API consumers and Client root; noEmit,not executed |
| Emitted root inventory | Render70 / Editor134 / Client0; private browser entries emit export{} only |
| `git diff --check` | PASS after removing trailing blank line in manual guide |

No failed/unconfigured builds. Existing Harness DEP0190 warning remains. Commit
SHA and exact-head push/PR CI links are in PR6 checkpoint ledger after push.
No blockers/owner-direction changes; no merge/release/publication or inferred
v0.6.10 work. This checkpoint does not close Phase6.
