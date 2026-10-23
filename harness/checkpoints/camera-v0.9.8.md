# v0.9.8 — CM14 2.5D Ground & Elevation Projection

**READY_FOR_NEXT_CHECKPOINT** for this supplied additive CPU composition scope.
Integrated rendering remains **FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED**;
browser NOT_EXECUTED. Developer owns product acceptance. No v0.9.9 implementation.

## Fresh preflight and minimum scope

Exact previous HEAD/local/fetched upstream:
`c0409df4723572053ade0eef8de8f7308aba2d8b` (v0.9.7).
Main/merge-base `e4464ac8e1c84a1c872f8e7a722885942a268a28`.
Branch `feat/camera-projection-v0.9`; same OPEN draft
[PR #9](https://github.com/TjnhPro/rpg-platform/pull/9), base main, matching head.
Tracked baseline clean; preexisting untracked `.mcp.json` untouched/excluded.
Previous exact-head CI SUCCESS:
[push39972129170](https://github.com/TjnhPro/rpg-platform/actions/runs/39972129170),
[PR39972142506](https://github.com/TjnhPro/rpg-platform/actions/runs/39972142506).
This report belongs to its containing checkpoint commit. Exact delivery SHA and
completed current-head CI links are recorded in PR after push, not confused with
previous CI. No merge/tag/release/publish authorized by this checkpoint.

Read root AGENTS/ARCHITECTURE/FOUNDATION; Harness CONTRACTS/OWNERSHIP/WORKFLOW/
VERIFICATION/FAILURES; Render and relevant Editor/Client instructions; prior report.
Inspected actual Phase4 affine/projection/viewport, camera configuration/forward/
selected-plane inverse/receipt adapter, Phase8 transform/depth/private draw plane,
Editor scene alignment/projection/mapping and actual public-root declarations.
Current Phase7 loading/cache/texture and Phase8 live Scene capabilities exist;
task-authorship absence note is historical. No missing prerequisite for CPU math.
No resource/live instance/native backend is consumed by this version.

Canonical primary owner **runtime-render**. Required collaborator Harness records
evidence; Editor/Client are build compatibility consumers only. Engine/Server/L1/L2
untouched. Route ground/elevation/projection gave Render hint, not owner authority.
Task explicitly authorizes this additive Phase9 public contract without review pause.

Plan: one ground affine with explicit plane/origin/basis and signed height vector,
then existing camera mapping; explicit-height viewport/screen inverse, current
camera/receipt guards, Phase4 arithmetic and numeric policy. Separate oblique config
discriminator, no widening old orthographic union or redefining old projection.
Public-root finite observations, strict root/consumer compilation, Harness/static/
scope/build gates, one independent commit/push on existing phase PR.

Ten intended files (scope also sees unrelated preexisting `.mcp.json`):

- `runtime-render/src/camera-ground.ts`: canonical composition/admission/inverse.
- `runtime-render/src/index.ts`: nine additive root names.
- `runtime-render/manual/camera-ground.mts` and `.md`: finite logs/runbook.
- `runtime-render/docs/camera-v0.9.8.md`, `docs/tasks/camera-v0.9.8.md`: contract
  and supplied task, trailing whitespace normalized.
- `runtime-render/AGENTS.md`: minimal owner contract pointer.
- `harness/CONTRACTS.md`, `harness/OWNERSHIP.md`: checkpoint contract pointers.
- This report. No dependency/package/lock/config/CI/Editor/Client production delta.

## Contract and audited compatibility

New functions: `createRenderCameraGroundConfiguration`,
`projectRenderCameraGroundPoint`, `viewportToRenderCameraGround`,
`screenToRenderCameraGround`.
New interfaces: `RenderCameraGroundConfiguration`, `RenderCameraGroundPoint`,
`RenderCameraGroundProjectionResult`, `RenderCameraGroundInverseInput`,
`RenderCameraGroundInverseResult`.

`affine-ground-elevation` captures ground/presentation planes with exact project,
space, unit, axes, explicit origins, basis columns and displacement per height unit.
P = presentationOrigin + B*(ground-groundOrigin) + h*d. Camera source must match
presentation plane exactly. Camera center is presentation-space intent; scale,
axis signs and zoom apply to whole ground+height once, then optional host screen
mapping. At css-px presentation/scale1/zoom1, d=(0,-2) is CSS px/height-unit;
otherwise declared camera ratios transform the vector. No DPR multiplication.

Forward result retains config/source/presentation point plus existing projection
fields. Its `mapping` is presentation->viewport ONLY, not the entire ground path.
Inverse takes exact current issued cameraView and REQUIRED `{unit,value}` height.
Explicit height0 selects ground zero; absent/null/unknown height never defaults.
Return `{projection,ground}`. Wrong but declared finite height may legitimately
select another point; no terrain/physics/height registry or arbitrary3D solver.

Phase4 compose/apply/invert owns all affine arithmetic. Ground basis rejects
normalized determinant magnitude <=1e-12, including collinear/ill-conditioned,
even on forward admission. Computed overflow/nonfinite inverse throws RangeError;
invalid inputs/units/planes/contexts TypeError; unknown host exceptions propagate.
Inverse removes height and applies canonical inverse, then checks forward
presentation residual <=1e-9*max(1,abs(input component)); existing camera inverse
retains its own cutoff/residual checks. Binary64 cancellation/underflow still
possible; no universal source recovery guarantee. No clamp/identity fallback.

Required null accepted context explicitly selects logical-only CPU observation.
Non-null uses real current same-session Phase6 receipt admission with no fallback.
Current view identity and receipt rechecked after host capture; no camera writes.
Host screen geometry needs explicit origin/ratio/plane. Exact labels declare
context, not external registry membership or freshness attestation for CPU metrics.

Audited old Phase8 placement/local TRS/anchor -> axis-aligned render-clip-2d path;
private Three sprites disable depthTest/depthWrite and retain explicit renderOrder.
Existing explicit-order/depth-key/ground-y sorting remains ground/world policy.
No sheared orthographic alias, anchor/frame/placement/depth-key rewrite or screen-Y
resort. Native oblique geometry application is not delivered by this checkpoint.
This is an optional camera math adapter, not a second renderer/matrix framework.

Exact source-to-emitted declaration audit against previous SHA: Render212->221,
Editor138->138, Client0->0; additions9, removed0/changed0 existing root names.
Strict emitted roots + nineteen portable finite consumers compile ES2022/no DOM.
Existing browser resource manual compiles separately with ES2022,DOM. Declaration
equality and finite consumer compilation do not prove universal runtime compatibility.

Exactly five projects and dependency graph unchanged. Lockfile baseline verified
Three0.186.1 / @types/three0.186.0 / TypeScript6.0.3. Read-only pins unchanged:
Core2.0.0 `04b7239f998c3c688a0dfa3202f11811a9acd775`, Gameplay0.15.2
`acea332aa80f67552192a72b30f81c0bbbfc56bd`. No external capability reimplementation.

## Verification and observable evidence

Actual commands/exit codes:

| Command | Observed |
| --- | --- |
| `node harness/cli.mjs check` | 0; ARCH_CHECK_PASS,149 JS/TS files |
| `node harness/cli.mjs scope --projects runtime-render --allow-infra` | 0;11 paths including unrelated .mcp.json |
| `node harness/cli.mjs verify --projects runtime-render --with-consumers` | 0; Render,Editor,Client real BUILD_PASS |
| `npm run build -- --force` | 0; all five project builds |
| strict `tsc` emitted roots +19 portable consumers, ES2022,no DOM | 0 |
| strict `tsc` existing visual-resource-mvp consumer, ES2022,DOM | 0 |
| strict compile camera-ground.mts then Node public-root owner observer | 0 |
| local declaration inventory `.artifacts/camera-v0.9.8-public-audit.mjs` | 0; nine additions, no changed/removed |
| `git diff --check` | 0; no whitespace errors |

Initial broad portable consumer glob also selected the preexisting browser-only
`visual-resource-mvp.mts`: strict ES2022-only compile exited1 (File/
HTMLCanvasElement missing). Corrected environment-specific consumer selection:
nineteen portable consumers passed no DOM; that browser consumer passed DOM compile.
No source workaround/config change or browser execution. Harness emits existing
Node DEP0190 shell deprecation warning; build exits0. No test suite/assertions added.

**EXPECTED:** basis columns(1,.5),(-1,.5), zero origins, presentation css-px/
right/down and d(0,-2); ground4,2 h3 ->2,-3; h0 ->2,3. Viewport800x450, center0,
scale1,zoom1 ->402,222. Supplied h3 inverse ->4,2 within absolute1e-12. Unknown h,
singular/collinear basis, bad elevation units reject. Pan leaves ground/h unchanged.

**OBSERVED:** public-root Node logs exactly matched2,-3 /2,3 /402,222;
inverse4,2, absolute error0/0. Explicit ground-zero inverse4,2. Explicit screen
origin20,30/scale2 ->824,474 and inverse4,2. Ground origin1,1/presentation origin
10,20 ->12,16 and inverse4,2. Two-component displacement(1,-2) ->5,-3 and inverse4,2.
Pan center1,1/zoom2 ->402,217, source4,2/h3 and inverse unchanged. After A disposal,
B exact view identity unchanged and projection402,222. Result/ground/point/height
frozen in sampled inverse observation.

Missing height, bad units, unknown ground/presentation/pixel plane, wrong axes,
cross-project config, nonfinite basis/height, unsupported kind, absent screen
geometry, invalid width0/-1/Infinity, zoom0, foreign accepted context, stale view,
disposed camera: TypeError, camera identity unchanged. Collinear/ill-conditioned
basis and finite elevation overflow: RangeError, camera identity unchanged.

Real Editor public-root Scene/Document local observation: authored placement4,2,
currentRevision1/savedRevision null/isDirty true before AND after (new unsaved
in-memory document). No storage or gameplay state invented. Runbook records exact
setup; core manual is committed, local owner/declaration drivers ignored.

**NOT_OBSERVED:** actual browser/GPU pixels, ready native accepted receipt/session,
native session A/B isolation/resize/loss recovery, live Scene/texture/frame use,
gameplay positions, saved document roundtrip. Expired resource is inapplicable:
operation accepts no resource handle/lease. No fake backend/receipt/geometry;
foreign-context rejection is not native integration proof. Source inspection
supports unchanged depth/anchor path, not visual acceptance. BUILD_PASS and
ARCH_CHECK_PASS do not establish gameplay/full architecture/functional PASS.

## Open limits / handoff

See [contract](../../runtime-render/docs/camera-v0.9.8.md) and
[manual](../../runtime-render/manual/camera-ground.md). No blocking source dependency
for supplied scope. Browser/native Scene application remains pending; no general
3D/perspective/picking/terrain height solution, animation, camera-follow gameplay
or screen-space sorting. Rollback by reverting this checkpoint, not rewriting
prior accepted reports. Next v0.9.9 may proceed only when its task is supplied,
with fresh source preflight and unchanged Phase4/6/8 compatibility boundaries.
