# v0.6.12 — Game Client Viewport Integration

RV17. IMPLEMENTED private Client browser host using existing Render public root.
**FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED**. No browser run or Phase6 acceptance.

## Preflight and scope

Baseline 90ea18c370af629b32257fcbf6fce2c89aa73f76, same branch
feat/render-context-viewport-v0.6 and draft [PR6](https://github.com/TjnhPro/rpg-platform/pull/6).
Merged Phase1–5 base remains 8aee145e7272dcccff3f20b9be4c70b63ec27b43.
Read root/Client AGENTS, architecture, Harness contracts/ownership/workflow/
verification, Client index/package/references/manual consumer, Editor viewport
host and Render root/declarations/session implementation. Route hint and actual
behavior agree: **game-client** is the canonical primary owner. Supplied task
authorizes implementation without intermediate review. Pre-existing .mcp.json
remains unread, unmodified and excluded from commit.

Client owns browser layout/DPR, continuous callback policy and host teardown.
Render collaborator needs no source change: its current acquisition/resize/
resume/frame/disposal APIs suffice. No Editor dependency or consumer change.
Runtime Engine and Server untouched. No L1/L2 API needed; frozen refs unchanged:
L1 04b7239f998c3c688a0dfa3202f11811a9acd775,
L2 acea332aa80f67552192a72b30f81c0bbbfc56bd.
Live lock remains Three0.186.1, @types/three0.186.0, TypeScript6.0.3.
No dependency, build topology, export-map, authored schema or public signature delta.
Exactly five projects. Editor134/Render70/Client0 public symbols remain unchanged.

## Source findings and implementation

- Evolve the existing manual-frame-continuous.ts consumer, rather than add another
  host/renderer abstraction. It previously had ratio1 and explicit start/stop but
  no live resize/DPR integration or observer teardown. Browser entry remains
  separate from Client root, which only imports Engine/Render public packages.
  All graphics imports come from @rpg-platform/runtime-render; no Editor/Three
  imports, copied backend or private Render imports.
- Acquire now retains beginRenderFrameSession observation for pending/terminal
  graphics and cleanup diagnostics, suspends and configures measured CSS/current
  devicePixelRatio. Acquisition/configuration do not schedule or submit. Start
  explicitly applies fresh positive metrics/resumes and schedules continuously.
  Host mounted, graphics-ready, viewport configuration, submitted and displayed
  remain distinct. Acquire is not a gameplay session/authentication operation.
- ResizeObserver, window resize and re-armed resolution matchMedia forward host
  metrics through resizeRenderViewport. Each frame callback also remeasures before
  rendering to cover delayed observer delivery. Unchanged tuples skip redundant
  resize. Canvas bounds represent CSS content only for this untransformed,
  borderless, padding-free demo; not a universal canvas sizing policy. Render alone
  rounds, applies actual buffer size and enforces limits. Explicit host budget:
  4096 per axis / 4,000,000 pixels; reject, do not clamp or write canvas attributes.
- At most one pending rAF, even on repeated Start. Each callback validates current
  session/host/visibility/viewport, then submits one real clear frame and requeues.
  Continuous policy deliberately ignores clean invalidation; callback timestamps
  do not advance simulation, animation or gameplay. Counters are submission
  receipts, never FPS/display/GPU evidence. Observe performs no render operation.
- Stop cancels and suspends. Hidden/zero/disconnected target does the same and
  retains positive native size; positive layout/visible alone does not resume.
  Resize while suspended preserves suspension. Invalid/over-budget requests stop
  scheduling and suspend ready graphics; recovery requires explicit valid Start.
  Native loss cancels callbacks; Render owns terminal loss/cleanup. No retry,
  automatic restoration or alternative backend. Observe after native dispatch.
- Dispose releases held graphics but leaves the page host usable for explicit
  Acquire. Unmount/pagehide closes before cancelling callbacks, disconnecting
  ResizeObserver and removing media/window/document/canvas/pagehide listeners;
  independent cleanup steps continue after errors, classified safely. Page-owned
  controls are guarded after close; reload is required to mount again, including
  BFCache return. Canvas/CSS remain host-owned, no forced native loss.
- Stop/hidden/Dispose/Unmount invalidates pending adoption. No abort API exists;
  the original Promise handler disposes late unwanted sessions before adoption,
  configuration or frame scheduling. Acquire stays blocked until settling. Native
  allocation may finish transiently after close; no cancellation claim. Retained
  acquisition exposes terminal cleanupFailed even for unknown failures. Failed
  cleanup/quarantine is not cleared or replaced with a success message.

No gameplay loop, Player/Monster/combat, network/authority/auth, asset loading,
Scene rendering, camera, animation, VFX or UI framework. Scene placement and
Document dirty/revision/save APIs are neither imported nor mutated. Spatial and
authored content remain independent of viewport pixels/browser scheduling.

Browser constraints checked against primary [ResizeObserver](https://drafts.csswg.org/resize-observer/),
[CSSOM View](https://drafts.csswg.org/cssom-view/) and
[HTML animation frames](https://html.spec.whatwg.org/multipage/imagebitmap-and-animations.html#animation-frames)
specifications. Requires modern same-realm HTMLCanvasElement/WebGL2 and those
browser APIs; no fallback/polyfill. References are not runtime evidence.

## Manual proof handoff

[Runnable independent Client page](../../game-client/manual/frame-continuous.html)
and [guide](../../game-client/manual/README.md) cover Acquire -> Start -> CSS resize /
native DPR -> Stop / zero / hidden -> explicit Start -> Dispose / Unmount, pending
acquisition teardown with native network throttling, and native loss review.
Compiled real Render/Three backend, empty opaque clear; no mocks/assertions/tests.
No actual browser submissions/pixels, observer/DPR/visibility delivery, pending
race, cleanup or GPU-memory reclamation have been observed. Developer owns manual
acceptance; RV17/Phase6 functional/visual acceptance remains open. No architecture
blockers; no new milestone work in this checkpoint.

## Verification

| Gate | Observed result |
| --- | --- |
| `node harness/cli.mjs check` | ARCH_CHECK_PASS:78 JS/TS source files |
| `scope --projects game-client --allow-infra` | SCOPE_PASS:8 paths,7 checkpoint files plus excluded pre-existing .mcp.json |
| `verify --projects runtime-render,editor,game-client --with-consumers` | BUILD_PASS: Render,Editor,Client and referenced dependencies |
| `npm run build -- --force` | BUILD_PASS: all five projects |
| Strict noEmit ES2022-only/types-empty public consumer | PASS: Client root + existing Render acquisition/viewport/frame types compile without DOM lib |
| Node import of compiled Client package root | PASS: no browser/GPU globals needed; not a feature execution |
| Emitted root inventory | Render70/Editor134/Client0, unchanged |
| `git diff --check` | PASS |

No failed/unconfigured builds; existing Harness DEP0190 warning is non-failing.
No tests/browser automation or manual browser run. Exact-head commit and push/
pull_request CI links are maintained in PR6 checkpoint ledger after push.
No merge, release, publish or v0.6.13 implementation.
