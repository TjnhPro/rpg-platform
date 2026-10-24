# v0.10.0 SA01 — Sprite Animation architecture and contract foundation

**API_DESIGN_ONLY / READY_FOR_DEVELOPER_REVIEW / VISUAL_NOT_VERIFIED.**
This is the supplied architecture checkpoint, not animation implementation or
Developer product acceptance.

## Preflight and scope

Base main/origin/main: `78dc4a9d14288df33ca46b3af4d23d09ceef9b82`.
Branch: `feat/sprite-directional-animation-v0.10`.
Containing checkpoint SHA is recorded after commit in the single Phase10 Draft
PR ledger; resolve locally with `git log -1 --format=%H -- harness/checkpoints/sprite-animation-v0.10.0.md`.
The task's earlier Phase7/8/9 readiness note is historical; actual source and
emitted declarations at this base implement these prerequisites.

Read root/project AGENTS, ARCHITECTURE, FOUNDATION and Harness ownership,
contracts, workflow, verification and failure policies; inspected preceding
camera closure and actual Phase4/6/7/8/9 code and built declarations.
Route provides hints only. Canonical primary owner is **runtime-render**:
neutral sprite definition, direction selection, playback and presentation binding.
Editor authors and previews; Client passes intent/delta and schedules frames;
Engine owns gameplay consequences; Server has no mandatory GPU participation.
Harness owns evidence only. No L1/L2 APIs or changes are required.

Seven documentation paths only: supplied task, architecture design, actual API
inventory, this checkpoint, Render AGENTS pointer and Harness CONTRACTS/OWNERSHIP
pointers. Preexisting untracked `.mcp.json` is excluded. No production module,
parser, playback implementation, UI, test, package/lock/dependency or CI change.
No actual public-contract delta; future names are explicitly proposals.
Rollback is a documentation commit revert, no runtime/data migration.

## Delivered design

The [six-seam contract and design](../../runtime-render/docs/sprite-animation-v0.10.0.md)
specifies immutable ordered Phase7 references, normalized exclusive FPS/interval,
exactly eight authored slots, canonical Phase4 angular mapping with tie examples,
independent explicit-delta playback, transitions and normalized progress on facing
change, fixed explicit frame origin, and resource/binding disposal order.

The [actual API inventory](../../runtime-render/docs/sprite-animation-api-inventory-v0.10.0.md)
separates existing root symbols from proposals. Source and corresponding emitted
dist declarations were inspected. Per-symbol emitted declaration comparison
against the baseline found Render231, Editor138, Client0 exports unchanged;
zero additions/removals/signature changes. Proposed names do not collide with
those actual roots.

Known authority limits are explicit: sourcePivot has no declared unit convention;
trim/sourceSize are unavailable; animation may not infer them. Phase8 layout and
resource operations are separate. Fixed layout is authored before attach, never
pretended atomic with frame changes. Old resource cleanup may fail after new
binding commit; the adapter proposal reports terminal failure/uncertainty rather
than claiming rollback. Public terminal subscription and public lease retention
are not invented; host keeps borrowed input rights alive and explicitly disposes.

## Observed verification

| Command / observation | Actual result |
| --- | --- |
| node harness/cli.mjs check | exit0, ARCH_CHECK_PASS (159 source files) |
| node harness/cli.mjs scope --projects runtime-render --allow-infra | exit0, SCOPE_PASS; documentation plus excluded local .mcp.json |
| node harness/cli.mjs verify --projects runtime-render --with-consumers | exit0, BUILD_PASS runtime-render, editor, game-client; BUILD_VERIFICATION_PASS |
| TypeScript baseline/current root declaration audit | exit0; 231/138/0 unchanged, no changed/removed/added declarations |
| Strict ES2022 NodeNext root consumer compilation, no DOM lib/types | exit0 |
| git diff --check | exit0 |

No builds are unconfigured or failed. Existing Node DEP0190 harness child-process
warning was emitted; it does not change the successful observed build result.
The final PR ledger records CI only once the workflow for the exact pushed
checkpoint SHA has completed; earlier main/Phase9 results are not SA01 CI proof.

INPUT: current source, emitted declarations and supplied standalone task.
EXPECTED: coherent design preserving current ownership and public contracts.
OBSERVED: written contracts, source/declaration inventory and static/build results.
NOT_OBSERVED: animation timing/state execution, resource failure experiments,
browser interaction, GPU frame output, sprite pixels or eight-way visual MVP.
Tables/formulas are design examples, not runtime observations. No tests were
created or run under the build-only policy.

## Handoff

No dependency blocker prevents design or subsequent pure frame capture. Actual
eight-direction art is not supplied/verified and remains a visual-MVP dependency;
do not fabricate sequences or pixels. Next referenced checkpoint is v0.10.1
immutable frame capture; its standalone task has not been supplied. This commit
does not implement that next scope. No merge, tag, release or acceptance is made.
