# v0.6.14 — Render Context & Viewport integration audit

RV19. **API_DESIGN_ONLY / BUILD_PASS / BLOCKED_WITH_EVIDENCE**.
**FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED**. This is the final Phase 6 review
packet, not Developer acceptance or a declaration that the runtime MVP passed.

## Preflight and exact scope

Primary owner: **runtime-render**, canonical graphics/context/viewport/submission
ownership. Editor and game-client collaborate as public-root host consumers;
Harness records the cross-project audit. This checkpoint changes only this report
and the Contracts/Ownership pointers. No public/source/API/dependency changes,
new renderer, fallback, tests or cleanup rewrite. No external L1/L2 calls needed.
The task authorizes this closure audit; no additional architecture is introduced.

Read root and Render/Editor/Client AGENTS, ARCHITECTURE, Harness CONTRACTS,
OWNERSHIP, WORKFLOW, VERIFICATION; compare actual source, declarations, imports,
manifests, lockfile, full phase diff, checkpoint reports and manual consumers.
Branch `feat/render-context-viewport-v0.6`, draft [PR #6](https://github.com/TjnhPro/rpg-platform/pull/6).
Input: `341742ea413c789efa554b433d0169e011be2876` (v0.6.13).
Fetched main and merge-base: `8aee145e7272dcccff3f20b9be4c70b63ec27b43`.
Phase 1 comparison: `ca06cdba01cba1927621efa39841161779d74f56` (v0.1.8).
Phase 1–5 are present in the main baseline; no fabricated prior-phase contract.
The final checkpoint's own full SHA and exact-head CI are recorded in the PR
ledger after commit, avoiding a self-referential SHA in this file.

Before closure, the full phase diff contains 44 tracked paths: Render source and
manuals, Editor host/manuals, Client manual host/DOM compiler lib, project AGENTS,
Harness contracts/ownership/checkpoints. Closure adds one report (45 phase paths).
All path changes were inventoried with `git diff --name-status origin/main...HEAD`.
Root/workspace and project manifests, lockfile, CI, Harness dependency config,
runtime-engine and game-server have zero phase diff. Client's DOM lib admits its
separate browser entry; its root remains headless/import-safe. Existing untracked
`.mcp.json` is excluded, unread and unmodified. Temporary compiler/audit artifacts
remain in ignored `.artifacts`; none is a production project or committed suite.

## Checkpoint inventory

Every row links its detailed report. All historical push and pull_request runs
listed below were queried live and completed **success** at that exact row SHA.
Those checks verify builds/static boundaries, never browser/runtime behavior.
R = runtime-render, E = editor, C = game-client; H = Harness audit/docs.
All graphics behavior remains NOT_VERIFIED; v0.6.13 manual evidence is blocked.

| Checkpoint / full commit | Owner | Public symbols / semantic delta | Exact-head build/static CI | Constraint |
| --- | --- | --- | --- | --- |
| [v0.6.0](render-viewport-v0.6.0.md) <br> 63744fd5e7a2ccda514b3f1dde4123f80e5bfa2f | R/H | API_DESIGN_ONLY; 52 symbols unchanged; architecture/ownership and existing backend audit. | [push PASS](https://github.com/TjnhPro/rpg-platform/actions/runs/39888505238), [pull_request PASS](https://github.com/TjnhPro/rpg-platform/actions/runs/39888543783) | Design only; no runtime proof |
| [v0.6.1](render-viewport-v0.6.1.md) <br> a43a442a7d681ba6a6fa95b8d160c4a64355ddcc | R | +inspectRenderTarget, RenderTargetCapabilities (54); same-realm canvas/ownership inspection, no graphics readiness. | [push PASS](https://github.com/TjnhPro/rpg-platform/actions/runs/39889144458), [pull_request PASS](https://github.com/TjnhPro/rpg-platform/actions/runs/39889148616) | Graphics behavior NOT_VERIFIED; full-phase review pending |
| [v0.6.2](render-viewport-v0.6.2.md) <br> ed424ba10a3a48dadc0407a21da391e6d1abc7fd | R | +beginRenderFrameSession, RenderFrameAcquisition, RenderGraphicsSnapshot (57); observable canonical acquisition. | [push PASS](https://github.com/TjnhPro/rpg-platform/actions/runs/39889875814), [pull_request PASS](https://github.com/TjnhPro/rpg-platform/actions/runs/39889881752) | Graphics behavior NOT_VERIFIED; full-phase review pending |
| [v0.6.3](render-viewport-v0.6.3.md) <br> 1ee69d53e6b51a92df087806b3a50c395c2e4665 | R | 57 unchanged; +CONTEXT_LOST diagnostic, terminal native loss, unknown failures remain unknown. | [push PASS](https://github.com/TjnhPro/rpg-platform/actions/runs/39890722800), [pull_request PASS](https://github.com/TjnhPro/rpg-platform/actions/runs/39890727659) | Graphics behavior NOT_VERIFIED; full-phase review pending |
| [v0.6.4](render-viewport-v0.6.4.md) <br> c9f58c1098975185e1229d8504f1537bfc876652 | R | +getRenderViewportSnapshot, RenderViewportSnapshot (59); session-bound full-canvas identity. | [push PASS](https://github.com/TjnhPro/rpg-platform/actions/runs/39891512184), [pull_request PASS](https://github.com/TjnhPro/rpg-platform/actions/runs/39891516309) | Graphics behavior NOT_VERIFIED; full-phase review pending |
| [v0.6.5](render-viewport-v0.6.5.md) <br> ef25f7869e66631ad5a7af4ef71e00eee4c099ec | R | +planRenderViewportSize, RenderViewportMetrics, RenderViewportSizeLimits, RenderViewportSizePlan (63); explicit CSS/ratio/budgets. | [push PASS](https://github.com/TjnhPro/rpg-platform/actions/runs/39892125848), [pull_request PASS](https://github.com/TjnhPro/rpg-platform/actions/runs/39892129954) | Graphics behavior NOT_VERIFIED; full-phase review pending |
| [v0.6.6](render-viewport-v0.6.6.md) <br> 34408652037aaaab878772745e93eb9c55b400f4 | R | +resizeRenderViewport, RenderViewportResizeReceipt (65); native accepted extents; RESIZE_FAILED/resize diagnostics. | [push PASS](https://github.com/TjnhPro/rpg-platform/actions/runs/39892860904), [pull_request PASS](https://github.com/TjnhPro/rpg-platform/actions/runs/39892865086) | Graphics behavior NOT_VERIFIED; full-phase review pending |
| [v0.6.7](render-viewport-v0.6.7.md) <br> 7c5791224ac227a8d9133cc228e7d97301566d35 | R | +suspendRenderViewport, resumeRenderViewport (67); retained ownership; VIEWPORT_SUSPENDED. | [push PASS](https://github.com/TjnhPro/rpg-platform/actions/runs/39893545724), [pull_request PASS](https://github.com/TjnhPro/rpg-platform/actions/runs/39893552290) | Graphics behavior NOT_VERIFIED; full-phase review pending |
| [v0.6.8](render-viewport-v0.6.8.md) <br> 9c9fd4682a3928db45bf6e1835d0b1a41d17db18 | R | 67 unchanged; optional RenderFrameReceipt.viewport; FRAME_IN_PROGRESS/FRAME_NOT_SUBMITTED; historical submission state. | [push PASS](https://github.com/TjnhPro/rpg-platform/actions/runs/39894411244), [pull_request PASS](https://github.com/TjnhPro/rpg-platform/actions/runs/39894415536) | Graphics behavior NOT_VERIFIED; full-phase review pending |
| [v0.6.9](render-viewport-v0.6.9.md) <br> 1e57c0cee51689d6c32e130f2d73be3b184b4aa4 | R + E/C manual | +invalidateRenderFrame, getRenderFrameInvalidationSnapshot, RenderFrameInvalidationSnapshot (70); independent on-demand/continuous policies. | [push PASS](https://github.com/TjnhPro/rpg-platform/actions/runs/39895270047), [pull_request PASS](https://github.com/TjnhPro/rpg-platform/actions/runs/39895273991) | Graphics behavior NOT_VERIFIED; full-phase review pending |
| [v0.6.10](render-viewport-v0.6.10.md) <br> 7ab587a78119d3dcd8f79b6d32f1c15413fd942b | R | 70 unchanged; optional terminal cleanupFailed observation; preserve known acquisition errors, quarantine uncertain cleanup. | [push PASS](https://github.com/TjnhPro/rpg-platform/actions/runs/39896186650), [pull_request PASS](https://github.com/TjnhPro/rpg-platform/actions/runs/39896190203) | Graphics behavior NOT_VERIFIED; full-phase review pending |
| [v0.6.11](render-viewport-v0.6.11.md) <br> 90ea18c370af629b32257fcbf6fce2c89aa73f76 | R contract; E implementation | No root delta; internal Editor viewport host, CSS/DPR/visibility/on-demand/pending-close ownership. | [push PASS](https://github.com/TjnhPro/rpg-platform/actions/runs/39897353361), [pull_request PASS](https://github.com/TjnhPro/rpg-platform/actions/runs/39897359700) | Graphics behavior NOT_VERIFIED; full-phase review pending |
| [v0.6.12](render-viewport-v0.6.12.md) <br> d80f9d15cae8d5ec7b3d4abeb1f92aaf319fb6ec | R contract; C implementation | No root delta; Client browser entry/DOM lib, continuous requests/start-stop/resize/release; root stays headless. | [push PASS](https://github.com/TjnhPro/rpg-platform/actions/runs/39898184335), [pull_request PASS](https://github.com/TjnhPro/rpg-platform/actions/runs/39898187544) | Graphics behavior NOT_VERIFIED; full-phase review pending |
| [v0.6.13](render-viewport-v0.6.13.md) <br> 341742ea413c789efa554b433d0169e011be2876 | R contract; E/C consumers | No root delta; same-realm two-host manual composition, ratio policy and retained configuration receipts; browser blocked. | [push PASS](https://github.com/TjnhPro/rpg-platform/actions/runs/39898870081), [pull_request PASS](https://github.com/TjnhPro/rpg-platform/actions/runs/39898875505) | Manual MVP NOT_OBSERVED; RV19-BROWSER |
| v0.6.14 <br> This checkpoint; full SHA in PR ledger | R primary; E/C review; H docs | API_DESIGN_ONLY; no export/source delta; compatibility and evidence audit | Local gates below; exact-head push/PR links in PR ledger | RV19-COMPAT and RV19-BROWSER OPEN |

## Public surface and compatibility

TypeScript checker enumeration of the actual Phase 1 sources gives 14 root
symbols: `RenderFailure`, `RenderFrameFailure`, `RenderFrameReceipt`,
`RenderFrameSession`, `RenderHostBinding`, `RenderSessionDescriptor`,
`RenderSessionDisposal`, `RenderSessionLifecycle`, `RenderSessionSnapshot`,
`createRenderFrameSession`, `createRenderSession`, `createRenderSessionLifecycle`,
`getRenderFailure`, `getRenderFrameFailure`. All remain exported. Phase 5 root
has 52 symbols; current Render70/Editor134/Client0. No backend class, Three or DOM
type leaks into the public graphics declarations. Package exports remain root-only.

The 18 additions since Phase 5 are fully inventoried above: target inspection(2),
acquisition observation(3), viewport snapshot(2), sizing(4), resize(2),
suspend/resume(2), invalidation(3). No removed/renamed root symbol was found.

- `createRenderSession` and `createRenderSessionLifecycle` retain reference-only
  binding semantics and signatures. Bound/mounted does not mean graphics-ready.
- `createRenderFrameSession(host): Promise<RenderFrameSession>` delegates to the
  same acquisition path as `beginRenderFrameSession`; no competing backend/session
  implementation. `renderFrame(): RenderFrameReceipt`, lifecycle methods and the
  receipt's symbol/status remain compatible. Optional `receipt.viewport` preserves
  old receipt construction; canonical submitted receipts supply a historical
  active viewport. A receipt is not display/GPU completion evidence.
- `getRenderFailure` and its original union are unchanged. Both classifiers use
  same-package-instance branding; undefined means unknown, not successful cleanup.
- **Compatibility decision RV19-COMPAT (OPEN/BLOCKER):** expanding
  `RenderFrameFailure.code` and `.stage` is not universally source-compatible for
  old exhaustive consumers. The added codes are `CONTEXT_LOST`, `RESIZE_FAILED`,
  `VIEWPORT_SUSPENDED`, `FRAME_IN_PROGRESS`, `FRAME_NOT_SUBMITTED`; stage adds
  `resize`. The original six-code union and three-stage union cannot receive the
  current values. Strict ES2022-only consumer compilation produced **TS2322** for
  each assignment. This is an actual compatibility finding, not a workspace
  build failure or evidence of an existing in-repo consumer failure. Developer
  must decide whether to accept consumer migration under the Phase 6 contract
  or authorize a separately scoped compatibility change. No shim/widening/fix
  has been smuggled into this closure.
- Error behavior also changed: recognized native loss is terminal, resize has its
  own failure stage, suspended/reentrant/no-submission frames reject; unknown
  backend exceptions can propagate unchanged rather than always normalize to
  FRAME_FAILED. Existing method signatures alone do not prove semantic backward
  compatibility. `RenderGraphicsSnapshot.cleanupFailed` is optional for structural
  compatibility; canonical terminal observations provide it.

Reproduce the compatibility finding with a strict noEmit NodeNext consumer using
only the package root (no assertions, browser or test runner):

```ts
import type { RenderFrameFailure } from '@rpg-platform/runtime-render';
declare const current: RenderFrameFailure;
const oldCode: 'UNSUPPORTED_TARGET' | 'TARGET_IN_USE' | 'GRAPHICS_UNAVAILABLE'
  | 'ACQUISITION_FAILED' | 'FRAME_FAILED' | 'CLEANUP_FAILED' = current.code;
const oldStage: 'acquire' | 'renderFrame' | 'dispose' = current.stage;
// Both assignments produce TS2322 against the current declarations.
```

## Ownership, dependencies and native limits

Exactly five npm workspaces, each with its own source/tsconfig/build:

```text
runtime-engine -> @rpg/core/kernel + @rpg/gameplay (public external artifacts)
runtime-render -> Three.js (private backend)
editor        -> runtime-engine + runtime-render (public roots)
game-client   -> runtime-engine + runtime-render (public roots)
game-server   -> runtime-engine (no mandatory Render/DOM/GPU)
```

Harness check and import audit find no Render -> Editor/Client/Engine/Server/L1/L2
edge and no consumer deep import. Only Render's private backend imports Three.
Manual page composition loads two host entry scripts; neither project imports
the other's implementation. Both use one Render root URL/instance in one realm.
Five production packages; Harness is tooling. No new shared package or gameplay
loop/authority. Engine/Server and external foundations are untouched.

Frozen pins from `harness/foundation-pins.json`: L1 @rpg/core2.0.0 at
`04b7239f998c3c688a0dfa3202f11811a9acd775`; L2 @rpg/gameplay0.15.2 at
`acea332aa80f67552192a72b30f81c0bbbfc56bd`. No upstream edits/re-audit/re-pin.
Actual locked backend is Three0.186.1/@types0.186.0, TypeScript6.0.3.

Source audit findings (not runtime observations):

- Host owns canvas/CSS/layout, measurement, visibility and callbacks. Render
  borrows a same-realm native HTMLCanvasElement and owns one WebGL2/Three backend
  and one full-canvas viewport per acquired session. No offscreen/foreign-realm
  support, graphics fallback or automatic restoration. Root import is lazy/safe.
- Reservation uses a WeakSet scoped to this package instance. Clean release
  permits explicit reacquisition; uncertain cleanup quarantines the target.
  It cannot arbitrate another library/package instance using the same canvas;
  hosts must avoid external writes/competing owners. This is an explicit limit,
  not a global renderer registry or a claimed cross-instance lock.
- Viewport WeakMaps attach state to the canonical acquisition/session identity;
  they do not select a global current session. Binding-only descriptors remain
  distinct from graphics handles. No duplicate renderer/session manager found.
- CSS size/explicit ratio planning floors once, validates finite positive values,
  signed32-safe dimension budgets and pixel count; no silent clamp. Native resize
  checks MAX_VIEWPORT_DIMS/MAX_RENDERBUFFER_SIZE, then records actual buffer extent
  and effective per-axis ratio. A valid plan is not proof of native allocation.
  Three setSize does not change host CSS. Preflight rejection retains state;
  failed backend mutation is terminal with no promised resize rollback.
- Suspension retains the backend/buffer/reservation, rejects frames and preserves
  demand. Resize does not resume. Resume admits fresh positive metrics. Native
  context loss is terminal; recreation is an explicit new acquisition, not restore.
- Render submission is synchronous, has no gameplay tick/time, rejects reentry,
  checks native loss/GL status and submission counter. Token acknowledgment keeps
  invalidation raised during a frame. Editor schedules on demand, Client owns a
  continuous browser policy; each cancels its own callbacks on stop/failure/close.
- Cleanup independently attempts owned renderer/scene/listener release; it does
  not remove the host canvas, resize it or force native context destruction.
  `cleanupFailed:false` cannot prove GPU memory reclamation. Pending acquisition
  is not abortable; a host that closes disposes an unwanted late result.
- Authored Scene membership/placement and Spatial world coordinates are not
  viewport state. Document revision/dirty/save lifecycle is untouched. No Asset
  loading, Scene rendering, Camera/Projection, Animation or VFX phase is started.

## Manual evidence and separate blocker

**RV19-BROWSER (OPEN/BLOCKER):** retain the actual
[v0.6.13 reproduction and expected/observed matrix](render-viewport-v0.6.13.md#reproduction-and-expectedobserved-matrix).
That run reported browser inventory `apps:[], browsers:[]`; opening the real page
returned `Browser is not available: iab`. This closure adds no browser observation.
The failure is tooling/environment evidence, not a native GRAPHICS_UNAVAILABLE
receipt. No browser/version/GPU/driver, visible pixel or native context-loss
sequence was observed. All two-host isolation, CSS/DPR/native resize, suspension,
release/reacquisition, unavailable/lost graphics and callback cleanup cases remain
**NOT_OBSERVED**, not PASS. Builds and source inspection cannot close this blocker.

Manual runnable entries are the existing Editor `viewport-mvp.html`, separate
Editor frame-demand/Client frame-continuous pages and Render graphics-lifecycle,
target/viewport/sizing guides. MVP A uses on-demand scheduling, B continuous,
separate canvases/configuration, explicit ratio1/2/browser-DPR and retained native
resize receipts. Follow the prior matrix and Render manual loss instructions in
a real browser; record requested/accepted metrics, receipts/counters, known and
unknown failures and cleanup observations independently from visible output.
Developer owns manual acceptance. No runtime/browser automation was introduced.

## Verified gates, 2026-10-23

| Command / inspection | Observed result |
| --- | --- |
| `node harness/cli.mjs check` | ARCH_CHECK_PASS, 78 JS/TS files |
| `node harness/cli.mjs scope --projects runtime-render,editor,game-client --allow-infra` | SCOPE_PASS:4 paths; three closure docs plus excluded pre-existing .mcp.json |
| `node harness/cli.mjs verify --projects runtime-render,editor,game-client --with-consumers` | BUILD_PASS Render, Editor, Client and referenced dependencies |
| `npm run build -- --force` | BUILD_PASS all five: Engine, Render, Editor, Client, Server |
| Strict noEmit NodeNext consumer, lib ES2022/types[] | PASS existing factories/lifecycle/session/receipt shapes and current public viewport consumers, no DOM lib |
| Strict legacy closed diagnostic unions | INCOMPATIBILITY_CONFIRMED: two TS2322 diagnostics; separate decision above |
| Node dynamic import Editor/Client roots | HEADLESS_ROOT_IMPORT_PASS; no graphics execution |
| Checker root enumeration / Phase1 and Phase5 comparison | 14 -> 52 -> 70 Render symbols; no Phase1 removal; Editor134/Client0 |
| Manifests, lockfile, protected projects, dependency config, CI diff | No phase changes |
| `git diff --check` | PASS |

No failed/unconfigured project build. Harness DEP0190 remains a non-failing
warning. Compiler comparison artifacts are local/ignored, no committed tests,
runner, assertions, coverage, CI matrix or browser automation. Historical CI
links in the inventory are actual exact-head success; final push/PR runs are
appended to the existing PR ledger at this checkpoint SHA after push.

## Full-phase Developer review checklist

- [x] Fifteen checkpoint slots, commits, public/semantic changes, owners and gates
  inventoried on one branch/PR; final SHA/CI resolved in PR ledger.
- [x] Five-project direction, public-root consumers, manifests and frozen pins
  audited; Phase1 exports preserved; no duplicate backend or hidden deep import.
- [x] Genuine builds/static gates and public consumer compilation run; compile
  incompatibility separated from project build status.
- [ ] RV19-COMPAT: Developer decision on expanded diagnostics/semantic migration.
- [ ] RV19-BROWSER: real manual MVP/native failure/resize/cleanup observations.
- [ ] Developer decides full-phase acceptance and any merge separately.

Stop after this checkpoint's commit/push/CI and PR update. Do not merge, tag,
release, publish, modify upstream or implement v0.6.15. Review packet delivered;
Phase 6 acceptance remains blocked by the two explicit items above.
