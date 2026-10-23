# v0.6.8 — Frame Request & Update Contracts

RV12. IMPLEMENTED synchronous frame admission/receipt extension.
**FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED**; no browser/GPU execution or phase acceptance.

## Preflight / scope

Baseline 7c5791224ac227a8d9133cc228e7d97301566d35 on
feat/render-context-viewport-v0.6, same draft [PR6](https://github.com/TjnhPro/rpg-platform/pull/6).
Phase1–5 merged main base 8aee145e7272dcccff3f20b9be4c70b63ec27b43.
Read root/Render/consumer AGENTS, architecture, Harness contracts/ownership/workflow/
verification; inspect current session/lifecycle/viewport/failure/backend/root APIs,
existing Editor consumer, manual entry and installed Three source. Supplied task
authorizes this additive contract change without checkpoint review wait.

Runtime Render is sole primary owner. Editor/Client own explicit frame request
policy and compile against the public root; no production change to either.
Nine checkpoint paths: Render frame-session/failure/backend/manual entry/guide/
AGENTS; Harness contracts/ownership/report. Pre-existing untracked .mcp.json stays
unread and excluded. No dependency/package/export-map changes; exactly five projects.
No Engine/Server/L1/L2 or Scene/Asset/Spatial/Document state/schema/save changes.
No gameplay/scene/animation update, scheduler, camera export, loop or GPU readback.

Lock and installed source: Three0.186.1, @types/three0.186.0, TypeScript6.0.3.
External L1 04b7239f998c3c688a0dfa3202f11811a9acd775 and L2
acea332aa80f67552192a72b30f81c0bbbfc56bd remain frozen; no external API is needed.

## Audit / additive contract decision

Existing renderFrame():RenderFrameReceipt remains synchronous, submitted-only and
on demand. No new renderer, receipt union, session member or root symbol. Render67 /
Editor134 unchanged. Receipt adds optional readonly viewport, narrowed to active
RenderViewportSnapshot. Canonical sessions always supply it; optional preserves
old structural receipt producers and existing readers. It carries the same session
symbol, full-canvas scope and frozen configured drawing-buffer extent. Historical
receipts do not follow later resize/suspend/dispose and retain no target/backend.

RenderFrameFailure.code adds FRAME_IN_PROGRESS and FRAME_NOT_SUBMITTED at existing
renderFrame stage. Consumers with exhaustive diagnostic handling must include the
new codes. No changes to RenderFailure or binding-only lifecycle semantics.

Installed node_modules/three/src/renderers/WebGLRenderer.js render() returns early
for invalid camera or internal lost-context state before info.render.frame++.
That counter increments before WebGLBackground.render() calls renderer.clear().
With our private ordinary Camera/empty Scene, default autoClear and no effects/XR/
user render callbacks, normal return + exactly one increment + no detected GL/loss
error supports the existing submission receipt. Counter alone does not prove GPU
execution, completion or compositor display. No fence/readback/finish is added.

Keep existing native pre/post-loss checks, opaque-clear path and original unknown
exception propagation. Explicitly reject native drawing-buffer dimensions that no
longer match the last configured viewport (host must use RV08 resize). No fake
receipt is returned for a zero/mismatched buffer, backend early return or exception.

## Request policy

| Condition | Result |
| --- | --- |
| Ready + active + matching positive configured buffer | One synchronous backend call; submitted receipt only after checks |
| Sequential calls | One request each; no implicit coalescing, queue, retry or frame pacing |
| Nested frame request | FRAME_IN_PROGRESS before nested backend work; no nested cleanup/state transition |
| Suspended | Existing nonterminal VIEWPORT_SUSPENDED; no submission/receipt/cleanup |
| Three unchanged frame counter without GL/loss error | FRAME_NOT_SUBMITTED; existing terminal cleanup/quarantine, no receipt |
| GL error/unexpected counter/native extent mismatch | FRAME_FAILED; terminal cleanup, no receipt |
| Native loss detected by event or frame | Existing CONTEXT_LOST and terminal cleanup; never auto-recover |
| Already disposed/previously lost session | Existing SESSION_DISPOSED/getSnapshot guard; read terminal observation separately |
| Unknown backend throw | Original exception propagates; terminal safe observation has failure:null |

One private boolean rejects nested requests and resets in finally, including error
paths. No public callback currently permits nested submission; no test hook is
introduced. If an outer backend propagates an exception it still follows normal
terminal failure handling. Cross-agent/worker parallel use of a session is not a
supported transport; host tasks execute sequentially in its JS realm. Acquisition,
resize, resume and observations submit no frames. No Engine tick/time/delta coupling.

## Consumer evidence / limits

Existing manual-viewport-identity consumer uses only the public root. Frame button
requests exactly one actual frame and logs receipt plus session symbol, active/
ready and configured extent comparisons before/after. No assertions, test suite,
fake backend or success stub. Suspended/lost/disposed/manual loss review procedure
is documented honestly. This consumer is compiled, **not browser-executed** here.
Real GPU submission, loss, nested request behavior, cleanup, isolation and blue
pixels have not been independently observed; manual acceptance is Developer-owned.

## Verification

| Gate | Observed result |
| --- | --- |
| `node harness/cli.mjs check` | ARCH_CHECK_PASS,75 JS/TS source files |
| `scope --projects runtime-render,editor,game-client --allow-infra` | SCOPE_PASS,10 paths:9 checkpoint paths plus excluded pre-existing .mcp.json |
| `verify --projects runtime-render,editor,game-client --with-consumers` | BUILD_PASS: Render,Editor,Client; typed manual consumer included |
| `npm run build -- --force` | BUILD_PASS: all five projects |
| Strict ES2022-only public-root consumer compile | PASS: legacy structural receipt, optional active viewport, existing frame signature/new codes; no DOM,noEmit,not executed |
| Emitted root symbol inventory | Render67 / Editor134 |
| `git diff --check` | PASS |

Initial build found TS2322: checking the active field did not narrow the entire
active-or-suspended record for an intersection type. Fixed by freezing an explicit
active snapshot after the guard; subsequent builds pass. No remaining failed or
unconfigured build. Existing Harness DEP0190 warning remains. Commit SHA and exact
push/PR CI links are recorded in PR6 checkpoint ledger after push. No merge,
release/publication or inferred v0.6.9 implementation; Phase6 is not complete.
