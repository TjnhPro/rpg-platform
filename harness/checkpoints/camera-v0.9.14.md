# v0.9.14 CM20 — Camera Foundation integration and closure audit

**READY_FOR_DEVELOPER_REVIEW / FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED.**
The authorized documentation checkpoint is delivered; Phase9 product acceptance
remains OPEN. No global MVP_PASS or phase acceptance is claimed.

## Fresh preflight and one-page contract plan

Input v0.9.13: `cec56ddee378c292dfb72bef24918851a34e04ab`.
Branch/upstream: `feat/camera-projection-v0.9`, exact same input SHA after fetch.
Base main and merge-base: `e4464ac8e1c84a1c872f8e7a722885942a268a28`.
One OPEN Draft [PR9](https://github.com/TjnhPro/rpg-platform/pull/9).
Tracked tree/index initially clean; preexisting untracked `.mcp.json` excluded.
The closure SHA is the containing commit, resolvable with
`git log -1 --format=%H -- harness/checkpoints/camera-v0.9.14.md`.
The PR ledger records that self commit and completed exact-head CI after push;
no prior-head CI substitutes for closure CI.

Read root AGENTS, ARCHITECTURE, FOUNDATION, Harness CONTRACTS/OWNERSHIP/WORKFLOW/
VERIFICATION/FAILURES, Render/Editor/Client AGENTS and preceding checkpoint.
Inspected current package roots, camera*, Phase4 plane/affine/viewport math,
Phase6 frame-session/viewport-size/three-frame, Phase7 source/cache/texture/atlas,
Phase8 visual-scene/three-visual-draw and Editor projection/viewport/preview/hosts.
Route suggests Render only; the canonical primary behavior owner remains
**runtime-render**, selected from source. This checkpoint changes no behavior.

Five documentation files only: this report, companion exact API/commit inventory,
Harness CONTRACTS and OWNERSHIP pointers, and the supplied standalone task at
`runtime-render/docs/tasks/camera-v0.9.14.md` (trailing whitespace normalized).
Harness owns evidence, not a sixth production project. Editor/Client are existing
public-root consumers built for compatibility; no consumer source change.
L1/L2 APIs required: none. No Engine/Server/foundation/package/lock/CI delta.
Public signatures, unions, dependencies and owner graph: **zero closure delta**.
No new capability, test, runner, native shim, fallback resource or projection helper.
Rollback is a revert of this docs-only commit, no data/runtime migration.

Gates: architecture check, scope runtime-render with infra (task documentation),
Render/Editor/Client builds with consumers, forced five-project build, strict
ES2022 public-root declaration/legacy consumer compile, DOM manual host compile,
pure Node import and finite existing public-root manual CPU observations.
Failure/release policy remains existing owner policy: no silent retry/recovery,
no receipt on failed frame; preserve unknown failures and cleanup uncertainty.
Manual scenario is the existing two-host real PNG/atlas MVP, never mock graphics.

## Dependency and owner audit

Historical task note about absent Phase8 is stale. Both Phase7 source/PNG/texture/
lease/cache/atlas APIs and Phase8 live Scene/instance/draw APIs are implemented
and consumable at the exact base/input. Phase8 PR8 merged in base `e4464ac`.
Lockfile and installed packages: Three0.186.1, @types/three0.186.0, TypeScript6.0.3.
Core2.0.0 pin `04b7239f998c3c688a0dfa3202f11811a9acd775` and Gameplay0.15.2 pin
`acea332aa80f67552192a72b30f81c0bbbfc56bd` unchanged throughout Phase9.
Native runtime acceptance of prerequisites remains distinct from source readiness.

| Responsibility | Canonical source / audit conclusion |
| --- | --- |
| Identity/state/config/pan/zoom | Render camera.ts/configuration/zoom, issued WeakMap capabilities; ephemeral symbol separate from session/authored/gameplay IDs; atomic center/view commits, terminal disposal |
| Projection/inverse | camera-viewport/projection/inverse compose Phase4 viewport-mapping/plane-projection/planar-affine; no Editor/Client formulas |
| Ground + fixed elevation | camera-ground composes canonical affine/inverse; supplied finite matching elevation required; CPU-only, no arbitrary 3D recovery |
| Bounds | camera-bounds, explicit per-request source-plane rectangle/reject/clamp; visible extent uses canonical inverse; no persistent constraint implied |
| Accepted viewport/frame | Phase6 frame-session owns issued current receipt, resize/suspend/invalidate/submit and terminal cleanup; CSS/device/client spaces remain distinct |
| Native view | camera-scene captures inverse frustum; private three-frame uses one optional OrthographicCamera in existing renderer/session; three-visual-draw uses localToScene once when bound, legacy localToClip otherwise |
| Loaded resources | Phase7 provider/load/decode/texture/cache/lease, Phase8 retained rights; camera never uploads/revives/manages a second cache |
| Live instances/order | Phase8 visual-scene retains transforms, layer/depth and resource rights; camera view does not rewrite source attachment depth/order |
| Editor | authored Scene/Document plus private UI host; scene-preview bridge maps authored placements through public Render; no camera dirty/save effects |
| Client | neutral visual inputs, canvas/input/rAF lifecycle; reusable existing viewport host, public Render only, no Editor dependency |
| Engine/Server | no Phase9 edits; gameplay positions remain Engine-owned, Server correctness does not require a frame |

Review found no introduced second renderer/session/cache, host camera backend,
projection formula copy, gameplay position authority or authored mutation in camera
operations. Editor and Client each deliberately have their own session/cache;
sharing implementation does not mean sharing native resources across contexts.
Static/source review is limited evidence, not exhaustive runtime proof.

## Checkpoints and compatibility

[Companion inventory](camera-v0.9.14-api.md) records full SHAs, per-commit source
paths, task/report presence, CM milestones and exact emitted declaration additions.
Fourteen previous independently committed tasks/reports are present; this closure
is the fifteenth independent task/report/commit, recorded at exact SHA in PR9.
No historical checkpoint is edited. Render grows186 ->231 across Phase9 (+45),
Editor stays138, Client stays0. Every previous exported declaration is compared
at each checkpoint; exact changes/removals and closure equality are recorded there.

Phase4 source extraction makes canonical point/plane/source capture reusable inside
Render; no new package-root helper, changed ratio/axis semantics or inverse policy.
Phase6 no-camera frame still uses legacy identity Camera/localToClip. The opt-in
binding requires latest exact resize receipt and refresh after each resize;
stale/copied/foreign evidence rejects rather than silently falling back to CPU math.
Historical camera snapshots remain unbound/not-applied; accepted-viewport snapshot
remains configured-not-applied; only exact submitted receipt yields camera frame
application evidence. These statuses are deliberately not reinterpreted.

Accepted earlier Phase6 graphics diagnostic union migrations (e.g. CONTEXT_LOST,
RESIZE_FAILED/stage) are not universal compatibility claims. Phase9 does not add
cases to existing exhaustive unions; the existing Phase6 exhaustive consumer
compiles unchanged. Camera TypeError/RangeError stays unbranded; caught visual
classifier is unknown/UNKNOWN_FAILURE with cleanupFailed null, not invented codes.
Private host composition seams in v0.9.12/13 are outside package roots; old manual
two-host/single-visual consumers still compile. No DOM/THREE types leak through
neutral roots: strict ES2022-only/no ambient types compile, skipLibCheck false.
Node root imports Render/Editor/Client with window/document undefined; resolution
hook observed296 calls and zero three/three-subpath resolutions.

## Evidence classes and milestone disposition

| Milestone | Implemented source | Evidence / remaining status |
| --- | --- | --- |
| CM01 architecture | design delivered v0.9.0 | API_DESIGN_ONLY, reviewed against source |
| CM02–04 identity/state/lifecycle | v0.9.1 | NUMERIC_MANUAL_OBSERVED CPU identity/disposal; native separate |
| CM05 config | v0.9.2 | explicit orthographic/preserve-scale, compiled |
| CM06 pan/center | v0.9.3 | CPU projection change observed; visual pending |
| CM07–08 zoom/focus | v0.9.4 | CPU focus residual0; native pointer/pixels pending |
| CM09–10 viewport/DPR | v0.9.5 | pure DPR plans observed; native accepted resize/suspend pending |
| CM11–12 forward viewport/screen | v0.9.6 | numeric worked table observed; pixels pending |
| CM13 selected-plane inverse | v0.9.7 | numeric residual0; native accepted context pending |
| CM14 2.5D fixed-height | v0.9.8 | affine-ground CPU sample observed; native oblique application not claimed |
| CM15 bounds | v0.9.9 | structured reject/clamp observed; native bounds presentation pending |
| CM16–17 Scene/frame | v0.9.10 | real private Three integration built/source audited; FRAME_SUBMITTED NOT_OBSERVED here |
| CM18 diagnostics/cleanup | v0.9.11 | CPU rejection/legacy diagnostic observed; native teardown/context loss pending |
| CM19 Editor+Client | v0.9.12 | hosts/old consumer compiled; CPU authored invariants observed; native isolation pending |
| CM20 MVP | v0.9.13 | real source acquisition/parser previously observed; full manual composition compiled, VISUAL_NOT_VERIFIED |
| CM20 closure | v0.9.14 | audit/report only, READY_FOR_DEVELOPER_REVIEW; FEATURE_NOT_VERIFIED |

ARCH_CHECK_PASS means only the static architecture scan. BUILD_PASS means a genuine
build exited0. NUMERIC_MANUAL_OBSERVED means finite CPU output was inspected, not
an automatic test. FRAME_SUBMITTED would mean exact native submission evidence,
not display; none obtained in this run. VISUAL_OBSERVED requires actual pixels;
none observed. Current native feature status is VISUAL_NOT_VERIFIED.

## EXPECTED / OBSERVED / NOT_OBSERVED

Fresh invocation of existing coordinate, diagnostics and Editor workspace consumers
uses package roots only. No assertion suite/new script is shipped.

| Scenario / EXPECTED | OBSERVED this closure | NOT_OBSERVED |
| --- | --- | --- |
| center100,50 scale2 CSS800x450 ->400,225 |400,225; +X10 ->420,225; +Y10 ->400,245 | native pixels |
| pan center105,50 ->390,225; zoom2 +X10 ->440,225 | exact values; resized640x450 ->340,225 | live instance/order invariants |
| screen origin40,80 and inverse recover inputs | sampled residual0, tolerance1e-9 source units | native accepted viewport |
| focus client540,280 preserves150,37.5 | before/after150,37.5 residual0 | browser wheel/pointer |
| DPR1/2 preserve CSS; buffer800x450/1600x900 | validated-not-applied plans, CSS420,225 | actual accepted buffers |
| ground4,2 at h3 ->presentation2,-3 ->CSS402,222 | inverse4,2 residual0, tolerance1e-9 | native 2.5D Scene |
| bounds oversized/outside reject; clamp220,183.75 | VIEW_EXCEEDS_BOUNDS / CENTER_OUTSIDE_BOUNDS / exact clamp | native visual containment |
| invalid width/height/zoom/plane retain view | zero width, NaN height, zoom0/NaN, unknown plane TypeError, exact prior view retained | accepted stale/copied/foreign native receipt |
| unsupported perspective/inverted bounds/missing height/disposed zoom reject | TypeError; ill-conditioned inverse RangeError; unknown classifier, cleanupFailed null | native failure classifier path |
| old projection104,209; old session disposed diagnostic | exact104,209; SESSION_DISPOSED/getSnapshot | universal behavior compatibility |
| A disposal/recreation independent from B | fresh A ID, B exact view retained, center400,225; diagnostic B160,120 | native A/B sessions/resources |
| authored Scene/Document retain truth | exact CPU snapshots unchanged; workspace revision1/savedRevision null/isDirty true retained | live instance transforms/order and gameplay positions (not supplied) |
| released real lease binding rejects RESOURCE_NOT_USABLE preserving old binding | source guard and manual action present; NOT_OBSERVED | actual GPU lease admission and old allocation preservation |
| loss/dispose/pending unmount drain owners, sticky uncertainty | source audit only; CPU repeated disposal identity retained | native context loss/listeners/late IO/GPU cleanup/recreation |

Existing v0.9.13 source-only HTTP observation is **historical evidence** from the
unchanged provider/parser/assets: metadata178 bytes, PNG1701/236/424 bytes with
manifest SHA256 checks; atlas red/green/violet32x48 at x0/32/64,y0. It is not
reclassified as fresh decode/upload/render. Reproducible commands and provenance
are in [MVP runbook](../manual/camera-mvp.md). Hand-authored40300 rectangular atlas
profile only: TPSHEET_NOT_VERIFIED / TPSHEET_VISUAL_NOT_VERIFIED remain.
Fresh Computer Use inventory returned apps[]/browsers[]; browser NOT_EXECUTED.
No Developer visual observation was supplied in this task or checkpoint history;
all nine native runbook steps remain NOT_OBSERVED. No synthetic frame/receipt or
screenshots substitute for resource and ownership proof.

## Actual commands and reproducibility

All commands below exited0; repeated at committed HEAD where noted in PR ledger.
Existing Windows Harness DEP0190 warning remains; no failed/unconfigured build.

| Command | Actual evidence |
| --- | --- |
| `git fetch origin` / status/branch/merge-base/PR inspection | exact baseline above; no upstream drift |
| `node harness/cli.mjs route -- "camera and projection"` | Render hint only |
| `node harness/cli.mjs check` | ARCH_CHECK_PASS159 JS/TS |
| `node harness/cli.mjs scope --projects runtime-render --allow-infra` | docs/task + Harness only; preexisting .mcp.json excluded from commit |
| `node harness/cli.mjs verify --projects runtime-render,editor,game-client --with-consumers` | genuine BUILD_PASS all three |
| `npm run build -- --force` | genuine five-project BUILD_PASS |
| Strict root ES2022 declaration consumer | exit0, no DOM/ambient browser types |
| Strict eleven existing Phase8 root manual consumers | exit0, compile only |
| Strict DOM camera-hosts/MVP + ES2022-only coordinates | exit0; commands in runbook |
| Strict existing diagnostics/workspace consumers; invoke finite observation functions | exit0; EXPECTED/OBSERVED table above |
| Exact emitted declaration audit each previous checkpoint | exit0; companion includes method and results |
| Pure Node root imports with resolution observation | exit0; no Three resolution/window/document |
| `git diff --check` and staged scope review | exit0; exactly five documentation files |

Root consumer command: `node node_modules/typescript/bin/tsc -p
.artifacts/closure-portable-tsconfig.json` (ignored existing artifact imports roots,
ES2022, types[], strict, skipLibCheck false). Existing Phase8 eleven-consumer command
is preserved in [v0.9.0](camera-v0.9.0.md). Diagnostics commands are preserved in
[runbook](../../runtime-render/manual/camera-diagnostics.md). For Editor workspace
compile with the same strict NodeNext/ES2022 flags and invoke exported
`observeCameraWorkspace`; no browser/global/graphics acquisition required.
Ignored audit artifacts are tooling, not production exports, CI jobs or tests.

## Open constraints and Developer acceptance

OPEN/unsupported: perspective, split-screen/multiple cameras within one session,
arbitrary 3D inverse/picking/unknown elevation, general clip-transform inversion,
camera smoothing/follow/cinematics/animation/VFX, extreme precision guarantees,
general exporter atlas support, native oblique Scene proof and every unobserved
native lifecycle/visual requirement above. Do not silently expand Phase9 scope.
Phase4 retains normalized inverse ratio cutoff1e-12 and destination residual
1e-9*max(1,abs(component)); these are not universal source accuracy guarantees.
Native float32 admission and finite binary64 math do not prove extreme precision.

No blocking missing source/API prerequisite or critical scoped defect was found.
Runtime proof remains an **acceptance gap**, not a missing code workaround.
Rejected: new camera modes, duplicate math/backend/cache, fake GPU proof, tests,
production fixes hidden in docs, historical report edits and auto-acceptance.

**Developer review decision:** accept the source/build audit while keeping native
MVP acceptance open, or require the runbook's real-browser proof before merge?
If merging without that proof, explicitly accept the unverified pan/zoom pixels,
DPR/resize, A/B native isolation, expired rights and loss/cleanup risk. This report
does not grant merge permission or claim that risk is accepted.
No v0.9.15 or next phase is authorized. No merge/tag/release/publication performed.
