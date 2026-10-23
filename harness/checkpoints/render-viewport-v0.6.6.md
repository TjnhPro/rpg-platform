# v0.6.6 — Viewport Resize & DPR Handling

RV08. IMPLEMENTED; **FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED**.
No browser/GPU run, phase acceptance, merge, release or publication.

## Preflight / owner

Baseline ef25f7869e66631ad5a7af4ef71e00eee4c099ec on
feat/render-context-viewport-v0.6 and draft [PR6](https://github.com/TjnhPro/rpg-platform/pull/6).
Main merged Phase1–5 base8aee145e7272dcccff3f20b9be4c70b63ec27b43.
Read root/Render AGENTS, architecture, Harness contracts/ownership/workflow/
verification and actual metadata/graphics/session/error/viewport/size/backend
sources. Audited Phase4 viewport mapping, existing manual host and public root.
Supplied task authorizes the additive public delta. Runtime Render is canonical
primary owner; Editor/Client are compile-only collaborators owning host CSS/layout
measurements. Scope: Render source/manual/demo and directly relevant Harness docs.
No Engine/Server/Editor/Client production changes or sixth project. Pre-existing
untracked .mcp.json is preserved outside commit without reading contents.

Lock remains Three0.186.1, @types/three0.186.0, TypeScript6.0.3. L1
04b7239f998c3c688a0dfa3202f11811a9acd775 and L2
acea332aa80f67552192a72b30f81c0bbbfc56bd remain external/read-only/unmodified;
no L1/L2 API needed for this behavior. No package/dependency/CI policy change.

## Source audit and additive contract

Installed Three setPixelRatio calls setSize and can trigger another allocation;
setSize floors logical*ratio and defaults CSS mutation unless passed false.
getDrawingBufferSize computes internal requested width*ratio, not an independent
native allocation read. Use RV07's already-rounded pixel candidate at private
Three default ratio1 and setSize(width,height,false); never setPixelRatio or scale
twice. Then set viewport from context.drawingBufferWidth/Height. This follows
[r186 sizing guidance](https://github.com/mrdoob/three.js/blob/r186/manual/pages/responsive.html)
while replacing automatic browser measurements with explicit host metrics.
[WebGL draft](https://registry.khronos.org/webgl/specs/latest/1.0/) specifies native
dimensions and query types (MAX_VIEWPORT_DIMS Int32Array; renderbuffer limit GLint).
Context limits are admission constraints, not a memory/total allocation guarantee.

Render63 ->65 root symbols: resizeRenderViewport(session,metrics,limits) and
RenderViewportResizeReceipt. The free operation accepts only canonical acquired
sessions; no required member added to RenderFrameSession and existing factory,
binding metadata/lifecycle, receipt and viewport snapshot shapes remain intact.
Foreign/custom/acquisition handles reject TypeError without invoking their methods.
Graphics failure union adds RESIZE_FAILED and stage resize; existing cases intact.
Consumers using exhaustive diagnostic switches must handle these additive cases.

Receipt is frozen/detached: same sessionId, resized|unchanged, captured requested
CSS metrics/ratio, actual size in drawing-buffer-px and effective ratio x/y from
native size / supplied logical extent. It is accepted synchronous configuration,
not a frame, GPU-idle fence or displayed pixels. Smaller native extent is accepted
and reported honestly; zero/noninteger/oversized actual results fail terminally.
No success metrics inferred from Three bookkeeping or RV07 plan.

## Semantics and failure ownership

- Initial acquisition retains native dimensions from the existing host canvas,
  without guessing logical CSS dimensions/ratio. Explicit first resize establishes
  requested/effective metrics only in its receipt; snapshot always holds actual
  last-configured extent. Prior receipts/snapshots remain historical immutable data.
- Existing disposed guard runs before validation; a second guard after host metric
  capture prevents a reentrant host getter from resizing a disposed session.
- Reuse the pure RV07 validation, rounding, positive/finiteness/safe pixel budgets.
  Zero rejects, not suspend. Invalid request TypeError; oversized/overflow/rounded
  empty RangeError. No clamp/adaptive policy. Before native mutation query context
  dimension limits; over-limit RangeError preserves state/reservation.
- Same backing width/height skips setSize/attribute writes. Native dimensions and
  GL/context health are rechecked, viewport configured, fresh receipt returned
  unchanged. Logical/ratio changes producing the same pixel extent use the new
  request in the receipt without reallocation. No renderer/context/session recreate.
- Only after native mutation/configuration and no detected loss/GL error does
  snapshot extent update. Unknown pre-mutation exceptions propagate without success;
  recognized backend failures are terminal. Mutation exceptions always terminate
  through existing failGraphics, clear extent and attempt cleanup. No rollback or
  previous-buffer preservation promise after native mutation begins.
- Known loss -> CONTEXT_LOST/resize; invalid native result or GL error ->
  RESIZE_FAILED/resize. Unknown mutation exceptions remain original with null safe
  failure. Cleanup flags/quarantine reuse RV05; successful cleanup releases target,
  failed cleanup retains reservation. Rejected requests keep the same reservation.
  After native loss event already disposed the session, existing disposed guard wins.

No CSS writes/layout measurement, auto DPR/ResizeObserver/polling, automatic frame,
camera/frustum, texture reload, recovery, global active viewport or graphics loop.
Private weak session-to-operation association is non-enumerable and adds no second
backend/lifecycle. Disposal clears backend/target through existing ownership.
Phase4 css-px/device-px screen mapping remains separate pure math. Scene/Asset/
Document data, placement and dirty/save lifecycle remain untouched.

## Manual consumer / evidence limits

New compiled public-root browser entry manual-viewport-resize.ts and
manual/viewport-resize.html expose acquire,800x450 ->600x400, explicit ratio,
repeat, invalid/excessive, frame, observation and disposed resize. Same-symbol
comparison, actual extent, reservation and unchanged inline CSS are printed.
Page exit/pending disposal releases late result. Reload for a new demo session.
Guide documents actual browser sequence plus loss/failure semantics. No assertions,
mock, automated browser/test suite or automatic frame. **Compiled only, not browser
executed**: native resize, allocation/clamp/limits, repeated-resize usability,
loss/cleanup behavior, CSS rendering and visual blue clear remain unverified.
Developer owns functional/visual acceptance. No v0.6.7 implementation.

## Verification

| Gate | Observed result |
| --- | --- |
| `node harness/cli.mjs check` | ARCH_CHECK_PASS,75 JS/TS source files |
| `scope --projects runtime-render,editor,game-client --allow-infra` | SCOPE_PASS,12 paths:11 checkpoint paths plus excluded pre-existing .mcp.json |
| `verify --projects runtime-render,editor,game-client --with-consumers` | BUILD_PASS: Render,Editor,Client,including compiled manual entry |
| `npm run build -- --force` | BUILD_PASS: all five projects |
| Strict ES2022-only root consumer compile | PASS: new receipt/operation/diagnostics and prior factories/size/snapshots; no DOM lib,noEmit,not executed |
| Emitted root symbol inventory | Render65 / Editor134 |
| `git diff --check` | PASS |

No failed/unconfigured builds. Existing Harness DEP0190 warning remains. Exact
commit SHA and push/PR CI links are recorded in PR6 ledger after commit/push.
