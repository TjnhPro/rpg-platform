# v0.6.4 — Viewport Identity & State Foundation

RV06. IMPLEMENTED foundation; **FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED**.
Suspended is **API_DESIGN_ONLY**, with no producer/operation in this checkpoint.
No browser run, phase acceptance, merge, release or publication.

## Preflight / ownership / scope

Baseline HEAD and draft PR6 head: `1ee69d53e6b51a92df087806b3a50c395c2e4665`.
Continue `feat/render-context-viewport-v0.6` and [PR6](https://github.com/TjnhPro/rpg-platform/pull/6),
main base `8aee145e7272dcccff3f20b9be4c70b63ec27b43`, merged Phase1–5.
Read root/Render AGENTS, architecture, Harness contracts/ownership/workflow/
verification, actual session symbol/lifecycle/factory/backend, graphics observation,
loss/cleanup code, declarations, installed Three source, Phase4 mapping, Editor
adapter/preview/manual host, Client root, manifest and lock. `.mcp.json` was already
untracked and is preserved outside the commit without reading its contents.

Primary owner **runtime-render**. Ten checkpoint paths: frame-session, three-frame,
public index, new manual TypeScript and HTML, manual guide, Render AGENTS, Harness
contracts/ownership and this report. Editor/Client are compile-only collaborators;
no production changes. No Engine/Server, L1/L2, Scene/Asset/Spatial/Document schema,
dirty/save behavior, package/dependency/compiler/scanner/CI or backend topology change.
Exactly five projects. Three0.186.1 / @types/three0.186.0 / TypeScript6.0.3 unchanged.
Read-only refs remain L1 `04b7239f998c3c688a0dfa3202f11811a9acd775` and
L2 `acea332aa80f67552192a72b30f81c0bbbfc56bd`.

## Additive public surface / canonical ownership

Render57 → **59 root symbols**, Editor134 unchanged. Additions:

```ts
export declare function getRenderViewportSnapshot(
  handle: RenderFrameAcquisition | RenderFrameSession,
): RenderViewportSnapshot;
```

RenderViewportSnapshot is a readonly discriminated union: scope:'full-canvas',
sessionId, graphics (existing frozen RenderGraphicsSnapshot), state and size.
Active/suspended size has frozen width/height/unit:'drawing-buffer-px' and a nonnull
session symbol; other states have size:null and a nullable symbol. Symbol is null
only if binding descriptor construction itself failed. This is session-local
identity, not a persisted viewport ID, coordinate-space/Scene/Asset/Document ID.

No old factory signature, required acquisition/session member, error code/stage,
binding state or receipt changes. Both factories still use one canonical backend;
new getter works on sessions from createRenderFrameSession as well as begin's
acquisition and result. No host callbacks or native properties are invoked by the
getter. Binding-only/custom/foreign-package handles throw TypeError. Existing
custom implementations remain assignable; they are not falsely treated as native
viewport owners. Calling getter never creates a session, context or observation
controller capable of lifecycle transitions.

A private WeakMap maps real acquisition and result handles to the same scalar
reader. It cannot enumerate/select a viewport, retains no target/native backend in
its reader, and is not a global active viewport, pool, multi-viewport manager or
second graphics lifecycle. Each begin invocation has independent scalar capture;
terminal updates clear current extent. Every returned outer record, size record
and graphics diagnostic is frozen; prior snapshots remain historical records.
State is derived from existing graphics observations plus whether that acquisition
ever reached ready, not independently settable by a host.

## State equivalence / controlled transitions

| Viewport state | Canonical evidence / transition |
| --- | --- |
| uninitialized | Graphics pending; descriptor symbol captured, no backend extent yet |
| unavailable | Acquisition failed before ever reaching ready; no usable viewport/session, original safe failure or null unknown preserved |
| active | Graphics ready and backend full-buffer extent captured; configured, not submitted/displayed/live-health or visibility evidence |
| suspended | Distinct contract slot only; no producer or suspend/resume operation implemented; not conflated with hidden CSS, failed acquire or terminal release |
| terminal | Previously ready graphics failed/disposed; extent cleared, existing symbol and safe diagnostic survive |

Only existing explicit acquisition, frame failure/context-loss handling and disposal
can change current reachable states. Hiding a canvas/stopping host frame requests
does not mutate Render state. Suspension behavior, admission and transitions need
their supplied checkpoint; reserving the discriminant is not shipping suspension.
Repeated disposal retains terminal loss/cleanup diagnostics under RV05. Recreation
requires explicit acquisition and gets a fresh symbol, not revival of this viewport.

The private backend explicitly sets a single (0,0,width,height) viewport covering
the native drawing buffer, using Three's default pixel ratio 1. Dimensions are
captured from native drawingBufferWidth/Height during acquisition, not guessed from
CSS, window DPR or authored pixels. Nonpositive/lost allocation during setup takes
the existing ACQUISITION_FAILED + cleanup/quarantine path; no active extent is
fabricated. Snapshot describes **last configured extent**, not live DOM/GPU queries.
No resize/DPR/zero-size policy, layout polling, subviewport/scissor/render target,
split screen, camera or frame loop. Hosts must not externally resize the buffer and
expect synchronization in this checkpoint. Native loss races still use RV05 checks.

Phase4 ViewportMetrics2D and projection planes remain explicit pure math contracts,
not this session-bound state. Drawing-buffer-px is not automatically mapped to
css-px/device-px planes. Scene placements and coordinate-space references remain
authored data; viewport size/visibility never enters documents or dirty/revision.

## Typed consumer / evidence limits

[Manual TypeScript](../../runtime-render/src/manual-viewport-identity.ts) imports the
public root and creates A/B independently on two actual host-owned canvases via
user actions. [HTML](../../runtime-render/manual/viewport-identity.html) loads the
genuinely built entry. It observes acquisition/result identity, previous snapshots,
two symbol inequality, and separate disposal/reacquisition. [Guide](../../runtime-render/manual/README.md)
describes A terminal while B stays active. User-driven disposal is the A state
change; no resize or suspension is invented to demonstrate isolation. Page exit
releases held and late results. No mock/assertion/test runner/debug backdoor.

**Compiled, NOT run in browser**. Two successful graphics acquisitions, isolation
at runtime, freezing/cleanup and visual results are not established by builds.
The state table and isolation claim are source/contract reasoning, not recorded
GPU observations. No automatic tests, probes or UI/browser automation run/added.

## Verification

| Gate | Observed result |
| --- | --- |
| `node harness/cli.mjs check` | ARCH_CHECK_PASS; 72 JS/TS source files |
| `scope --projects runtime-render,editor,game-client --allow-infra` | SCOPE_PASS; 11 paths including ten checkpoint paths and unrelated untracked .mcp.json, excluded from commit |
| `verify --projects runtime-render,editor,game-client --with-consumers` | BUILD_PASS: Render, Editor, Client; includes the new typed manual entry |
| `npm run build -- --force` | BUILD_PASS: all five projects |
| Strict ES2022-only public-root consumers | PASS; ignored .artifacts/rv03-compile noEmit compilation of two acquisitions, observations, disposal, legacy factory and prior code union; no DOM lib, not executed |
| Emitted public declaration inventory | Render59 / Editor134; no Three, DOM or native backend types in the new snapshot/getter declarations |
| `git diff --check` | PASS |

No failed/unconfigured builds. Existing Windows Harness DEP0190 warning remains.
Exact commit SHA and push/pull_request CI links/results are recorded in PR6 after
commit/push. No v0.6.5 task supplied/implemented; Developer owns phase acceptance.
