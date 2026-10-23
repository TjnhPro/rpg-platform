# v0.9.2 — CM05 Orthographic Camera Configuration

**READY_FOR_NEXT_CHECKPOINT** for the supplied pure configuration scope.
Real configuration and Phase4 correspondence observations; integrated Camera
remains **FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED**. Browser NOT_EXECUTED.

## Exact baseline and preflight plan

Input HEAD/fetched phase upstream/previous v0.9.1 checkpoint:
`08a6117f79b6cb76c1868c0b9b9950cf3a481c18`. Main and merge-base:
`e4464ac8e1c84a1c872f8e7a722885942a268a28`, Phase8 merged.
Branch `feat/camera-projection-v0.9`; draft [PR #9](https://github.com/TjnhPro/rpg-platform/pull/9)
OPEN against main with matching input headSha. Previous exact-head CI completed
SUCCESS: [push](https://github.com/TjnhPro/rpg-platform/actions/runs/39961952269),
[PR](https://github.com/TjnhPro/rpg-platform/actions/runs/39961959323).
Current checkpoint commit SHA and completed matching CI links are recorded in the
PR after push; the commit cannot contain its own SHA. Earlier CI is not current CI.

Tracked input was clean; only preexisting unrelated `.mcp.json` was untracked and
remains untouched/excluded. Fresh root/Render and relevant Editor/Client guidance,
architecture, Foundation, Harness contracts/ownership/workflow/verification/failures,
previous checkpoint, source and emitted declarations were inspected. Historical
task-authorship Phase7/8 absence is stale: installed real spatial, session/viewport,
resource leases and live Scene/instance/frame integration exist. This checkpoint
needs Phase4 pure capture/projection compatibility, not new graphics/resources.

Requested behavior: explicit portable orthographic scale/unit, zoom and viewport
extent policy. **Canonical primary owner: runtime-render**. Harness is evidence;
Editor/Client are existing compile-only consumers. No Engine/Server/L1/L2 API needed.
Route command `orthographic camera configuration` gave a Render hint; source roles
established the decision. No owner/dependency transfer or breaking change required.
The supplied task pre-approves additive Phase9 contracts without a review pause.

Plan before implementation: standalone constructor + readonly input/output, six
required input fields; per-axis CSS-px/source-unit scale at zoom1, positive zoom
multiplies both ratios once, preserve-scale policy anchors source center at logical
midpoint and changes visible spans with viewport extent. Reuse canonical Phase4
plane/point capture and existing exact data admission, keep old lifecycle unchanged.
Reject malformed/unsupported input with TypeError, invalid derived range with
RangeError; unknown host exceptions propagate. No session/resource to release.
Manual package-root consumer compares output ratios via existing Phase4 APIs.
Expected gates: check/scope, Render with consumers, strict ES2022 roots/consumers,
real workspace build, one checkpoint commit/push and exact-head existing CI.

## Owned delta and compatibility

Eleven files, Render plus minimal Harness:

- `runtime-render/src/camera-configuration.ts`: constructor and two readonly types.
- `runtime-render/src/index.ts`: three additive root exports.
- `runtime-render/src/camera.ts`: rename/export the unchanged exact data capture
  helper for owner-local reuse; no new root helper or lifecycle semantics change.
- `runtime-render/manual/camera-configuration.mts` and `.md`: public-root observation
  consumer and commands; no assertions/runner/test framework.
- `runtime-render/docs/camera-v0.9.2.md`: explicit scale/extent/failure/binding contract.
- `runtime-render/docs/tasks/camera-v0.9.2.md`: supplied task, trailing whitespace normalized.
- `runtime-render/AGENTS.md`, `harness/CONTRACTS.md`, `harness/OWNERSHIP.md`: pointers/invariants.
- This checkpoint report.

Root additions: `createOrthographicCameraConfiguration`,
`OrthographicCameraConfigurationInput`, `OrthographicCameraConfiguration`.
Exact v0.9.1/current TypeScript declaration audit: Render191 ->194, Editor138 ->138,
Client0 ->0; zero removed/changed existing root declarations. Strict actual emitted
root compilation also passed. These checks do not prove all runtime compatibility.

No change to Phase4 projection/affine/viewport meanings, v0.9.1 camera snapshots,
closed diagnostics unions, authored schemas, Phase6 invalidation/lifecycle/resize,
Phase7 rights or Phase8 instance/source depth/legacy projection. Config is a pure
value, not applied to a camera handle. No automatic camera-to-viewport binder or
second projection calculator. Future composition must use one canonical Render path.
No dependency/lock/compiler/workflow/backend/other-project change; exactly five projects.

Installed and locked Three0.186.1 / @types/three0.186.0 / TypeScript6.0.3 inspected.
Core2.0.0 pin `04b7239f998c3c688a0dfa3202f11811a9acd775` and Gameplay0.15.2 pin
`acea332aa80f67552192a72b30f81c0bbbfc56bd` unchanged. No upstream edits/imports here.

## EXPECTED / OBSERVED — actual manual Node execution

[Runbook](../../runtime-render/manual/camera-configuration.md) records exact compile
and execution commands. Both exited0. Consumer imports only public package root,
logs values without assertions. Source is camera-manual/ground/world-unit,
right/down; center100,50, scale2,2, zoom1, preserve-scale. Arithmetic comparisons
in this finite example are exact; no general tolerance or inverse claim.

| EXPECTED scenario | OBSERVED values |
| --- | --- |
| Detached immutable capture after caller changes center/scale/axis | center100,50, scale2,2, right/down remain; all six frozen flags true |
| Effective ratios copied to canonical Phase4 descriptor | config2,2 and descriptor2,2 |
| Explicit descriptor correspondence with logical800x450, midpoint400,225 | canonical center projection400,225; source101,51 maps402,227 |
| zoom2 enlarges ratio without changing former config | new4,4; original2,2, same declared center100,50 |
| Explicit unequal scale is caller policy | effective2,3, no implicit aspect correction |
| zoom0/-1/NaN/Infinity or scale0/-1 | TypeError: Camera scale and zoom must be finite positive numbers |
| scaleNaN/Infinity or centerInfinity | TypeError: Projection components must be finite numbers |
| physical scale unit | TypeError: Camera scale requires css-px-per-source-unit |
| invalid source axis | TypeError: Projection axes require x right/left and y up/down |
| empty space key / blank source unit | TypeError: Projection plane requires exact scoped keys and a nonblank unit |
| perspective / fit-vertical policy | TypeError: Only orthographic camera configuration is supported / Camera viewport policy must preserve scale |
| extra width/height | TypeError: Camera input must be an exact plain data record |
| individually valid operands overflow or zero-underflow when multiplied | RangeError: Effective camera scale is outside finite positive range |
| Phase4 point source unit mismatch | TypeError: Projection source plane, unit or axes mismatch |
| Phase4 viewport width0 | TypeError: Viewport width and height must be positive finite numbers |
| Unknown source proxy failure | sameException true; former config still center100,50, ratios2,2, zoom1 |

The manual example supplies literal midpoint400,225, then uses canonical Phase4
mapping operations. It proves declared ratio/correspondence compatibility, not an
automatic conversion or live frame. No fake scene, renderer, session or lease used.

## NOT_OBSERVED and unsupported behavior

Viewport independence is deliberate: no width/height/DPR/native input to the
constructor. EXPECTED real-arithmetic spans at800x450 are400x225 at zoom1 and
200x112.5 at zoom2; resizing to1000x450 at zoom1 would yield midpoint500,225 and
span500x225. Those resize/span derivations are documented expectations, not runtime
resize/camera application observations. No fixed-span or fit-horizontal/vertical
conversion, hidden fallback, clamping or canvas inference is supplied.

Session occupancy/A-B binding, frame invalidation/submission, native matrices,
GPU/pixels, perspective, screen picking, oblique/elevation/unknown-depth inverse
and expired resource checks remain NOT_OBSERVED/inapplicable here. No session ID,
resource or live Scene is consumed; authored placement/gameplay comparisons do not
apply. Arbitrary well-formed plane labels declare context, not registry existence.
Malformed/blank plane and wrong matched point unit reject, with no fabricated lookup.
Planar ground configuration alone is not proof of a rendered 2.5D camera.

Rejected: changing Phase4 DTO meaning, widening v0.9.1 literals, early session/GPU
binder, new Three camera/manager, duplicated consumer math, hidden DPR/fit defaults,
generic future config bag and gameplay/depth changes. Exact output has a derived
field; callers select the six input fields for a new candidate rather than spread
output and bypass strict admission. Positive subnormal ratios are allowed but do
not promise that future inverse/dimension composition is numerically admissible.

## Actual gates and handoff

All commands below exited0 during preparation. Required static/build gates are
repeated at committed HEAD before push. Existing remote CI for current SHA is
reported in PR only after completion.

| Command / inspection | Result |
| --- | --- |
| `node harness/cli.mjs check` | ARCH_CHECK_PASS, 137 JS/TS sources |
| `node harness/cli.mjs scope --projects runtime-render --allow-infra` | SCOPE_PASS; intended Render + Harness delta |
| `node harness/cli.mjs verify --projects runtime-render --with-consumers` | genuine independent Render, Editor, Client BUILD_PASS |
| `npm run build -- --force` | genuine forced five-project workspace build, exit0 |
| ES2022 actual three emitted roots + thirteen manual consumers | strict compile exit0, no DOM/ambient types, skipLibCheck false |
| New configuration manual compile + Node execution | exit0, finite observations above |
| Exact previous/current declaration audit | Render+3, Editor/Client+0, removed0/changed0 |
| Git whitespace/protected-scope inspection | intended eleven files only; .mcp.json excluded |

Strict compile uses NodeNext/ES2022, strict/noUncheckedIndexedAccess/
exactOptionalPropertyTypes/verbatimModuleSyntax, skipLibCheck false, lib ES2022
and empty typeRoots. It includes prior twelve manual consumers plus new config
consumer and actual Render/Editor/Client emitted roots. Audit script reads the
exact baseline source through Git and compares emitted public declarations; ignored
tooling is not a sixth package/test suite. No automated tests/assertions/new CI job.
No failed/unconfigured build remains; existing Windows Harness DEP0190 is a warning.

Rollback removes three new root names, config/manual/docs and restores the local
capture helper name/pointers; no persistent migration or native cleanup required.
No prerequisite/ownership/breaking-contract blocker established. Ready for next
**supplied** v0.9.3 task after fresh preflight; no unsupplied implementation, phase
acceptance, merge, tag, release or publication.
