# v0.9.1 — CM02/CM03/CM04 Camera Identity, State & Lifecycle

**READY_FOR_NEXT_CHECKPOINT** for the supplied scope. Real portable CPU camera API
and finite manual runtime observations; integrated Camera feature remains
**FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED**. Browser NOT_EXECUTED.

## Fresh baseline and owner plan

Previous checkpoint/input HEAD and fetched phase upstream:
`d7c77dfff540fd2e2fba0d45f235c856d5aa41b0` (v0.9.0).
Main/merge-base: `e4464ac8e1c84a1c872f8e7a722885942a268a28`, Phase8 merged.
Branch `feat/camera-projection-v0.9`; existing draft [PR #9](https://github.com/TjnhPro/rpg-platform/pull/9)
targets main, OPEN at the input SHA. No new phase PR or merge.
Previous exact-head push/PR CI completed SUCCESS:
[push](https://github.com/TjnhPro/rpg-platform/actions/runs/39960441919),
[PR](https://github.com/TjnhPro/rpg-platform/actions/runs/39960451869).
Current checkpoint's exact SHA and completed CI are recorded in the PR after push;
this commit cannot contain its own SHA. Do not treat prior CI as current verification.

Tracked input was clean. Preexisting unrelated untracked `.mcp.json` remains
untouched/excluded. Fresh root/project guidance, architecture, Foundation and
Harness ownership/contracts/workflow/verification/failures were read against actual
source/public APIs. Task's historical Phase7-open/Phase8-absent note is stale:
real Phase4 plane/affine/viewport, Phase6 live session/frame, Phase7 resource/lease
and Phase8 live Scene/instance/draw APIs exist. This pure checkpoint needs canonical
Phase4 capture, not new graphics acquisition, leases or a fake backend.

Requested behavior: ephemeral camera identity and immutable CPU lifecycle.
**Canonical primary owner: runtime-render**. Harness records evidence; Editor and
Client are compile-only existing consumers. Engine/Server and read-only L1/L2 are
untouched. `route -- "camera identity state lifecycle"` was only a Render hint;
ownership was chosen from source responsibilities. No unresolved owner/dep transfer.
Supplied task authorizes additive Phase9 contracts and continuous scoped execution.

Preflight contract plan: pure factory, closure-bound handle, immutable snapshot,
center-only update, terminal/idempotent dispose; no session/native references.
TypeError rejects invalid records/state; unknown host exceptions propagate; capture
before commit with liveness recheck. No-op preserves snapshot/revision. New manual
consumer proves A/B independence through package root. Expected gates: Render with
consumers, static architecture/scope, ES2022 declarations/consumers and workspace build.

## Owned file delta and API inventory

Eleven files, only Render plus minimal Harness:

- `runtime-render/src/camera.ts`: actual factory, four types and CPU lifecycle.
- `runtime-render/src/index.ts`: exports five new names via public package root.
- `runtime-render/src/plane-projection.ts`: two existing private capture functions
  become owner-local module exports with descriptive names, reused by camera.
  Validation bodies and projection formulas are unchanged; no new root helpers.
- `runtime-render/manual/camera-lifecycle.mts` and `.md`: optional observation
  consumer and reproducible ES2022 commands; no assertions or automated suite.
- `runtime-render/docs/camera-v0.9.1.md`: admission/lifecycle/binding seam and limits.
- `runtime-render/docs/tasks/camera-v0.9.1.md`: supplied task, trailing whitespace
  normalized; no early next-version task implementation.
- `runtime-render/AGENTS.md`, `harness/CONTRACTS.md`, `harness/OWNERSHIP.md`:
  checkpoint pointers and invariant guidance.
- This report.

Added root names: `createRenderCamera`, `RenderCamera`, `RenderCameraInput`,
`RenderCameraUpdate`, `RenderCameraSnapshot`. Baseline Render186 ->191;
Editor138 ->138; Client0 ->0. TypeScript checker over both exact baseline source
and current declaration emission found zero removed or changed existing root
declarations. Strict compilation also resolves actual emitted package roots.
This is declaration compatibility evidence, not proof of all runtime semantics.

No old signature, closed diagnostic union, compiler, dependency/lockfile, workflow,
persisted schema, gameplay, backend or project graph change. Exactly five projects.
Installed/locked Three0.186.1, @types/three0.186.0, TypeScript6.0.3 stay fixed.
Core2.0.0 pin `04b7239f998c3c688a0dfa3202f11811a9acd775` and Gameplay0.15.2 pin
`acea332aa80f67552192a72b30f81c0bbbfc56bd` untouched; no L1/L2 API used by this delta.

## EXPECTED and OBSERVED — manual public-root execution

The ES2022 consumer compiled and executed in Node (exit0), logging actual values.
It does not assert or emit a test verdict. Inputs use scoped plane
`camera-manual/ground`, unit `tile`, axes right/up, initial center `(2,3)`.
No numeric math/tolerance is involved: values and comparisons below are exact.

| Scenario / EXPECTED | OBSERVED |
| --- | --- |
| A/B separate ephemeral identity, initial active state | differentIds true; both center2,3 revision0, unbound/not-applied |
| Mutate caller center to999 and axis down after capture | A still2,3/right/up; handle/snapshot/center/source/axes frozen flags all true |
| A update7,8, keep B and historical A unchanged | A revision1/sameAId true; B exact same snapshot at2,3 revision0; old A still2,3 revision0 |
| Equal center is no-op | sameSnapshot true, revision1 |
| Caller identity, empty context ID, invalid axes, perspective kind | each throws TypeError |
| NaN, extra center z, context replacement and zoom field | each throws TypeError; A exact same snapshot after rejections |
| Unknown host proxy error | sameException true, A unchanged |
| Dispose A then update | update TypeError; repeat dispose sameTerminal true, terminal revision1; old A active revision0 |
| B remains independently active | B update-1,4 yields active revision1 |
| C disposes during host point capture | outer update TypeError; C stays disposed revision0, previous captured center999,3/axes down |

Exact compile/run commands are in the [manual runbook](../../runtime-render/manual/camera-lifecycle.md).
Symbols are omitted by JSON; explicit identity booleans above are the observations.
The consumer imports only the public package root; it creates no Scene, fake
session, texture, mock lease or GPU. No authored/gameplay position is involved.

## NOT_OBSERVED and intentional non-support

- One active camera/session, session A/B ownership, session termination and GPU
  application are DESIGN_ONLY here. The task permits pure portable lifecycle when
  binding is not needed. Current API has no session or bind capability, so it
  cannot occupy or mutate another session. Future opt-in binding must reserve one
  slot per canonical live session and revoke before host/backend teardown.
- Snapshot is committed CPU state only: unbound/not-applied. Do not widen those
  literal types silently later; separate binding/applied observation is the seam.
- Dimensions, zoom, viewport invalidation, camera matrices/pan/zoom formulas,
  inverse/2.5D accuracy, native resource expiry and pixels are not implemented or
  observed. Extra config rejects rather than silently promising support.
- Plane capture rejects malformed context; no authored plane registry exists in
  this API. Well-formed unknown labels are accepted explicit context, not verified
  authored existence. No resource handle is accepted, so expired-lease admission
  is inapplicable here, not a claimed negative PASS.
- Phase8 instance placement/depth and legacy localToClip/fixed Camera behavior
  remain unchanged. No runtime Scene comparison, browser, GPU or visual claim.

Rejected alternatives: premature graphics/session attachment or manager registry,
copied plane validation/math, new renderer/cache, Editor camera helper, placeholder
zoom/dimensions bag, caller-provided persistent IDs and fake session acceptance.

## Actual verification

All following commands exited0 during preparation; required static/build commands
are also repeated at the committed checkpoint HEAD before push. Exact remote CI
links for that HEAD are recorded in the PR after successful completion.

| Gate | Actual result |
| --- | --- |
| `node harness/cli.mjs check` | ARCH_CHECK_PASS, 135 JS/TS sources |
| `node harness/cli.mjs scope --projects runtime-render --allow-infra` | SCOPE_PASS |
| `node harness/cli.mjs verify --projects runtime-render --with-consumers` | genuine independent Render, Editor and Client BUILD_PASS |
| `npm run build -- --force` | genuine forced workspace TypeScript build, all five projects, exit0 |
| Strict ES2022 emitted Render/Editor/Client declarations + twelve manual consumers | exit0; no DOM or ambient type requirement, skipLibCheck false |
| New camera manual consumer compile + actual Node observations | exit0, observations above |
| Exact v0.9.0/current root declaration comparison | Render +5, Editor/Client +0; removed0/changed0 |
| Git whitespace/scope inspection | only eleven intended files; unrelated .mcp.json excluded |

Strict compile uses NodeNext/ES2022, `strict`, `noUncheckedIndexedAccess`,
`exactOptionalPropertyTypes`, `verbatimModuleSyntax`, `skipLibCheck:false`,
`lib ES2022`, empty typeRoots. It includes actual emitted three roots, the eleven
existing consumers listed in the v0.9.0 report and the new camera consumer.
Ignored audit tooling reads baseline source via Git and compares root declarations;
it is not shipped as a package or test runner. No tests/frameworks/coverage/new CI job.

No failed/unconfigured build remains. Existing Harness Windows DEP0190 warning
does not fail builds. Build/static scan are limited evidence, not functional,
gameplay, numeric, resource-lifetime or visual acceptance.

Rollback removes five new root exports, camera module/manual/docs and restores
owner-local helper names/pointers. No persisted migration/native cleanup needed.
No critical prerequisite/compatibility blocker established. Ready for the next
**supplied** v0.9.2 task with a fresh preflight; no automatic merge, phase acceptance,
release/publication or unsupplied task implementation.
