# v0.6.5 — Viewport Size & Pixel Units

RV07. IMPLEMENTED **validation contract only**, not resize.
FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED for backend/host integration.

## Preflight and scope

Baseline c9f58c1098975185e1229d8504f1537bfc876652 on
feat/render-context-viewport-v0.6, draft [PR6](https://github.com/TjnhPro/rpg-platform/pull/6).
Merged Phase1–5 main baseline 8aee145e7272dcccff3f20b9be4c70b63ec27b43.
Read root/Render AGENTS, architecture, Harness contracts/ownership/workflow/
verification, actual public/session/backend sources, Phase4 viewport mapping and
prior checkpoint. Runtime Render is sole primary owner; Editor/Client provide
CSS layout/metrics and compile against additive root API. No other production
project changes. Harness/manual documentation only outside Render source.
The supplied RV07 task authorizes this additive public contract and explicitly
allows validation-only delivery. Existing untracked .mcp.json stays excluded.

Three0.186.1, @types/three0.186.0, TypeScript6.0.3 remain locked. Exactly five
projects; no dependency changes. Read-only foundations remain L1
04b7239f998c3c688a0dfa3202f11811a9acd775 and L2
acea332aa80f67552192a72b30f81c0bbbfc56bd. Neither API is used/modified by sizing.

## Source audit / delta

Existing native canvas width/height inspect attributes, not CSS layout. Private
backend reads actual context.drawingBufferWidth/Height, sets one full viewport at
Three default ratio 1, and has no setSize/setPixelRatio or resize operation. No
MAX_VIEWPORT_DIMS/MAX_RENDERBUFFER_SIZE query exists; Three's maxTextureSize is
not a default-framebuffer allocation guarantee. Installed Three setPixelRatio
calls setSize; setSize floors logical*ratio and defaults updateStyle=true. Future
Render resize must prevent CSS writes and double scaling; no such call is added.
[Three docs](https://threejs.org/docs/pages/WebGLRenderer) describe these methods.
[WebGL spec](https://registry.khronos.org/webgl/specs/latest/1.0/) distinguishes
actual drawing-buffer dimensions from requested canvas dimensions. Actual backend
limits/allocation behavior have not been observed on a GPU in this checkpoint.

Four additive root symbols: RenderViewportMetrics, RenderViewportSizeLimits,
RenderViewportSizePlan and planRenderViewportSize. Existing59 ->63; Editor134
unchanged. No required session member, union, factory, receipt or snapshot change.
ES2022-only portable data, no native/THREE/DOM public types or import effects.

Explicit finite positive CSS extents and requested ratio are multiplied once and
floored per axis. Fractional CSS/ratios allowed; physical dimensions and budgets
are positive integers. All limits positive safe integers, dimension limits at most
2^31-1. Reject rounded-zero, unsafe product, arithmetic overflow and over-budget
width/height/pixel count with RangeError; malformed metric/limit values TypeError.
No coercion, default ratio, clamp or auto resolution policy. Zero-size suspension
is not implemented; no session state changes on validation failure.

Frozen detached result has status validated-not-applied, captured request/limits,
candidate drawing-buffer-px extent/pixel count and plannedEffectivePixelRatio x/y.
Rounding can make per-axis ratios differ. These are **planned**, never actual
backend effective ratios. Pixel count is a memory-pressure admission bound, not
measured bytes, GPU availability or total allocation guarantee. No depth/stencil,
MSAA/driver overhead estimate or memory reservation is fabricated.

Session snapshot still reads the last configured native extent from canonical
acquisition. It does not accept plans or invent a logical CSS size/effective ratio
for an existing host. Future Render application must enforce real backend limits,
apply without CSS mutation, and capture actual accepted dimensions. No canvas
resize, adaptive governor, camera/frustum update, suspension or window DPR read.
Phase4 css-px/device-px mapping remains explicit pure math; plan is no coordinate
conversion. Authored Scene, Asset, Document/revision/dirty and gameplay untouched.

## Evidence

Manual public-root consumer: runtime-render/manual/viewport-size.mjs; guide in
manual/README.md. Prints 800x450 ratio2 -> candidate1600x900 plus fractional CSS
and rejected invalid values. No test runner/assertions/mock or graphics simulation.
Observed manual output: candidate1600x900 / 1,440,000 pixels / planned ratio2;
fractional example1200x675 / x1.499531396438613 / y1.5. Zero/negative/NaN/Infinity
metrics and fractional pixel budget printed TypeError; rounded-zero, over-budget
and arithmetic overflow printed RangeError. This is finite pure-API evidence,
not comprehensive runtime verification or backend allocation evidence.

| Gate | Observed result |
| --- | --- |
| `node harness/cli.mjs check` | ARCH_CHECK_PASS; 74 source files inspected |
| `scope --projects runtime-render,editor,game-client --allow-infra` | SCOPE_PASS; 9 paths including unrelated untracked .mcp.json, excluded |
| `verify --projects runtime-render,editor,game-client --with-consumers` | BUILD_PASS: Render, Editor, Client |
| `npm run build -- --force` | BUILD_PASS: all five projects |
| Strict ES2022-only public-root consumer compilation | PASS, new size types/function plus prior factories/snapshots; no DOM lib; noEmit |
| Emitted public root declarations | Render63 / Editor134 |
| `git diff --check` | PASS after removing trailing blank line in guide |

No failed/unconfigured builds. Existing Harness DEP0190 warning remains.
No browser/GPU resize or visual behavior is verified. No phase acceptance,
merge/release/publication or v0.6.6 implementation. Exact SHA and CI links live in
PR6 checkpoint ledger after commit/push.
