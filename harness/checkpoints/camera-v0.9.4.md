# v0.9.4 — CM07/CM08 Camera Zoom & Focus Preservation

**READY_FOR_NEXT_CHECKPOINT** for supplied CPU zoom/focus scope. Real public-root
numeric observations below; integrated camera remains **FEATURE_NOT_VERIFIED /
VISUAL_NOT_VERIFIED**. Browser NOT_EXECUTED. Developer owns product acceptance.

## Exact baseline / fresh preflight plan

Previous v0.9.3 HEAD/fetched phase upstream:
`8d8339c4d357202e0305d9c5360cd70e6f95dd10`. Main and merge-base:
`e4464ac8e1c84a1c872f8e7a722885942a268a28` (Phase8 merged).
Branch `feat/camera-projection-v0.9`; single OPEN draft [PR #9](https://github.com/TjnhPro/rpg-platform/pull/9)
against main, input headSha matches local/upstream. Prior exact-head CI SUCCESS:
[push](https://github.com/TjnhPro/rpg-platform/actions/runs/39964997984),
[PR](https://github.com/TjnhPro/rpg-platform/actions/runs/39965004189).
The commit containing this report is the checkpoint HEAD; exact SHA and completed
matching remote CI are recorded in PR after push. Prior CI is not current CI.

Tracked baseline clean; unrelated untracked `.mcp.json` untouched/excluded. Inspected
root/Render/relevant Editor/Client guidance, Architecture/Foundation, Harness
contracts/ownership/workflow/verification/failures, previous checkpoint and real
source/public APIs. Real Phase4 projection/viewport inverse/affine, Phase6 graphics/
resize/frame, Phase7 PNG/atlas/load/texture/cache/lease and Phase8 Scene/instance
path exist at source baseline. Task-authorship absent-Phase7/8 note is stale.
This delta needs pure mapping/state, not graphics or native resource acquisition.

Requested behavior: absolute center zoom and viewport-focus-preserving zoom.
Canonical primary owner **runtime-render**, confirmed by source; route `camera zoom
focus preservation` gave Render hint only. Harness records evidence; Editor/Client
compile compatibility. No Engine/Server/L1/L2 APIs or owner/dep transfer required.
Supplied task explicitly pre-approves additive contracts, without a review pause.

Plan before implementation: opt-in configured camera factory returns existing
capability, additive view observation tracks zoom+center atomically while old
snapshot/revision semantics stay intact. Fixed inclusive host-selected limits;
reject invalid candidates, no clamp. Focus requires exact current CSS metrics and
projection; canonical Phase4 inverse/affine composition and final forward/inverse
residual admission. No duplicated math, session binder, native state, RAF or callback.
Shared state commit seam remains the future invalidation point. Manual proof uses
real public roots and authored owner readback. Gates: check/scope, Render with
consumers, strict ES2022 roots/manuals, workspace build, one commit/push and exact CI.

## Owned delta / compatibility

Thirteen intended Render/Harness files:

- `runtime-render/src/camera.ts`: configured factory, view observation, absolute
  center/focus zoom, same issued handle and atomic immutable state commit.
- `runtime-render/src/camera-zoom.ts`: readonly policy/request, candidate admission
  and canonical Phase4 composition; no native/consumer math.
- `runtime-render/src/camera-data.ts`: unchanged exact camera data capture extracted
  to avoid a configuration/lifecycle module cycle; not root API.
- `runtime-render/src/camera-configuration.ts`: import extracted capture helper only.
- `runtime-render/src/index.ts`: seven additive names.
- `runtime-render/manual/camera-zoom.mts` and `.md`: finite root observation/runbook.
- `runtime-render/docs/camera-v0.9.4.md` and `docs/tasks/camera-v0.9.4.md`: contract
  and supplied task (trailing whitespace normalized).
- `runtime-render/AGENTS.md`, `harness/CONTRACTS.md`, `harness/OWNERSHIP.md`: pointers.
- This checkpoint.

New root names: `createConfiguredRenderCamera`, `getRenderCameraViewSnapshot`,
`setRenderCameraZoom`, `zoomRenderCameraAtFocus`, `RenderCameraViewSnapshot`,
`RenderCameraZoomLimits`, `RenderCameraFocusZoomInput`. Exact previous/current
emitted declaration audit: Render197 ->204, Editor138 ->138, Client0 ->0;
**zero removed/changed existing root declarations**. Strict emitted-root compilation
also passed; this is not universal behavioral compatibility proof.

Same factory implementation, one ephemeral identity/lifecycle. Old camera snapshot
revision remains center-only; new view revision increments once for center or zoom.
Center zoom preserves old center snapshot reference; focus commits both together.
Old center/update/pan keep configured view center synchronized. Plain cameras have
no inferred zoom; zoom rejects rather than install defaults. No required method,
old field, closed union, authored schema, dependency/lock/compiler/workflow/backend
or other-project source change. Existing Phase4 numeric policy, Phase6 lifecycle,
Phase7 leases, Phase8 instance/layer/depth and legacy projection remain intact.
Exactly five projects, no sixth package/manager. Three0.186.1, @types/three0.186.0,
TypeScript6.0.3 confirmed against installed packages/lock. Core2.0.0 pin
`04b7239f998c3c688a0dfa3202f11811a9acd775` and Gameplay0.15.2 pin
`acea332aa80f67552192a72b30f81c0bbbfc56bd` remain read-only/unchanged.

Host supplies finite `0 < min <= max`, inclusive/fixed per capability, checked at
creation and each update. Configuration owns numeric scale admission. No silent
clamp. Relative multiplier API omitted; absolute candidate zoom is explicit.
Focus context matches exact source/project/unit/axes, current center/ratios,
CSS-px right/down destination in the same project and logical midpoint. Equivalent
values need no identity token. Canonical inverse finds world focus and new-scale
source offset; affine translation computes center. Final forward pixel and inverse
world residuals must satisfy1e-9*max(1,abs(component)), in addition to unchanged
Phase4 inverse admission. No guaranteed exactness/cumulative drift bound for all data.

## EXPECTED / OBSERVED — actual manual Node execution

[Runbook](../../runtime-render/manual/camera-zoom.md) gives exact strict compile and
execution commands, both exit0. Manual imports Render root; external readback script
uses actual Editor Scene/Document factories. Explicit viewport800x450 CSS-px,
midpoint400,225, source right/down/world-unit, center100,50, scale2 at zoom1.
Absolute sample tolerance1e-12; observed errors0. No behavioral assertions/runner.

| EXPECTED | OBSERVED |
| --- | --- |
| Focus500,275 before zoom | canonical inverse world150,75 |
| Zoom2 / effective4,4 at same focus | center125,62.5, camera/view revision1, same identity |
| Preserve selected world focus | inverse150,75; original world projects500,275; absolute world error x0/y0 |
| Reverse focus to zoom1 | center100,50; effective2,2 |
| Center zoom | center100,50 remains at400,225; old center snapshot unchanged; view revision1 |
| Factor1 absolute candidate, center/focus | both same view reference; no extra revision |
| Capture remains immutable after caller edits config/limits | history center100,50/zoom1, scale2,2, limits0.25..8; six frozen flags true |
| Inclusive limit endpoints | admitted0.25 and8 |
| Zero/-1/NaN/Infinity zoom | TypeError: Camera zoom must be finite and positive |
| Zoom16 outside captured max8 | RangeError: Camera zoom is outside declared limits |
| Missing focus context | TypeError: Camera input must be an exact plain data record |
| Stale original mapping after changed view | TypeError: Focus mapping must match current camera center, scale and logical viewport midpoint |
| Width0 | TypeError: Viewport width and height must be positive finite numbers |
| Unknown source space / device-px focus | TypeError: Projection source plane, unit or axes mismatch |
| New scale too tiny to invert | RangeError: Viewport mapping is numerically non-invertible |
| Effective overflow / zero-underflow | RangeError: Effective camera scale is outside finite positive range |
| Reject candidates atomically | viewPreserved and cameraPreserved true for every logged rejection |
| Old pan on configured camera | camera and configuration center both105,50 |
| Camera B | same combined snapshot, center100,50 throughout |
| Actual authored owner | placement ground7,11; document revision1/savedRevision null/isDirty true, content unchanged before/after |
| Set/focus after camera disposal | TypeError: Camera is disposed; both observations preserved |
| Plain camera zoom | TypeError; no inferred configuration |

## NOT_OBSERVED / exclusions / decisions

No live VisualInstance/graphics-session comparison, native matrix, frame, pixels,
browser, DPR/resize application or gameplay state. Authored proof is an actual new
unsaved in-memory Document, not persistence/storage evidence. No fake engine, GPU,
scene geometry, lease or session. Disposed **camera** rejection is observed; graphics
session disposal interaction remains NOT_OBSERVED because camera has no session
binding at this baseline. A RenderFrameSession is not a RenderCamera capability;
no disposed-session support is fabricated. Integrated session/GPU acceptance remains
pending, not a blocker to independent CPU zoom. Resource expiry is inapplicable:
no lease is consumed. Unknown matching source labels declare context, not registry
existence; mismatched labels reject. No automatic device-to-CSS conversion or DPR.

Rejected: changing old snapshot literals/revision semantics, silently configuring
legacy handles, second camera manager/renderer, copy of projection/inverse formulas,
consumer-side focus math, hidden viewport defaults, clamp, early GPU/session binding,
wheel/control/smoothing/animation, 3D inverse and authored/gameplay/instance mutation.
Unknown host errors propagate. Captured host proxies may perform their own edits;
focus rejects if the view changed or was disposed, never overwriting that newer state.
Positive finite effective scale alone need not support inverse; center zoom may
admit it while focus correctly rejects. Historical snapshots remain readable.

## Actual gates / handoff

Preparation commands below all exit0. Required static/build gates repeat at committed
HEAD before push. Current remote CI is recorded in PR only after exact-head completion.

| Command / inspection | Actual result |
| --- | --- |
| `node harness/cli.mjs check` | ARCH_CHECK_PASS,141 JS/TS sources |
| `node harness/cli.mjs scope --projects runtime-render --allow-infra` | SCOPE_PASS; intended thirteen files, .mcp.json untouched/excluded |
| `node harness/cli.mjs verify --projects runtime-render --with-consumers` | genuine independent Render/Editor/Client BUILD_PASS |
| `npm run build -- --force` | forced five-project workspace BUILD_PASS |
| Strict actual emitted Render/Editor/Client roots and fifteen manual consumers | exit0, portable ES2022/no DOM, skipLibCheck false |
| New manual strict compile + Node owner readback | exit0, finite observations above |
| Exact previous/current declarations | seven additions only; removed0/changed0 |
| Git whitespace and protected-scope inspection | exit0, intended thirteen files only |

Strict flags: NodeNext/ES2022, strict/noUncheckedIndexedAccess/exactOptionalPropertyTypes/
verbatimModuleSyntax, lib ES2022, empty typeRoots, skipLibCheck false. Existing fourteen
manual consumers plus new zoom consumer compile; no automated tests/assertion
matrices/framework/runners/coverage/new CI jobs. No failed or unconfigured build
remains; existing Windows Harness DEP0190 is a warning.

Rollback removes seven additions, new zoom/data helpers and restores original
capture imports/center commit and pointers. No persistence migration/native cleanup.
No breaking-contract/owner/prerequisite blocker established for CPU scope. Ready for
next **supplied v0.9.5** after fresh preflight. No unsupplied checkpoint, phase
acceptance, merge, tag, release or publication performed.
