# v0.8.2 — SR03/SR04 Visual Instance Identity & Membership

Outcome: **READY_FOR_NEXT_CHECKPOINT** for the scoped implementation/build/static
architecture gates. **FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED**; no browser
execution or Developer phase/MVP acceptance is claimed.

## Preflight and authorized scope

Starting HEAD `5ac8be9b7e4a4d5fbb7098e82040eb996836c5df`, branch
`feat/scene-rendering-v0.8`, existing draft PR #8 OPEN with matching head.
Fresh fetched main/base `ffb347140fbe6bf432bb8fe33c7057bed9a93941` unchanged.
Tracked worktree clean at start. Existing unrelated untracked `.mcp.json` remains
untouched/excluded; ignored build artifacts stay uncommitted.

Read root AGENTS/ARCHITECTURE/FOUNDATION, Harness OWNERSHIP/CONTRACTS/WORKFLOW/
VERIFICATION/FAILURES, Render/Editor/Client AGENTS and actual public roots,
manifests, declarations/compiler settings. Audited SR02 scope, canonical graphics
terminal admission, actual native frame/texture backend, Phase 7 resource/atlas
contracts, Phase 4 spatial captures and authored Scene/Asset/Document adapters and
Client host responsibilities. Route provided no reliable keyword hint; source
ownership determines **runtime-render** as the sole canonical behavior owner.

Supplied task authorizes minimal identity/membership public additions. Render owns
registration and cleanup; Editor/Client require compatibility builds only, with no
production source edits. Harness records contracts/evidence. No Engine/Server,
upstream L1/L2 API usage, dependency direction or boundary change.
Phase 6/7 prerequisites are actual implementations, not planned metadata APIs:
canonical `createRenderFrameSession`, terminal subscription before backend cleanup,
texture rights/release and atlas view/frame resolution. SR03/SR04 requires none
of their resources, IO or drawing. Native texture/Three material interop remains
the future limitation documented in SR01; this checkpoint does not bypass it.

Three0.186.1/types0.186.0 in installed packages/lockfile stay unchanged. Compared
installed Object3D identity/order source with the official
[Object3D documentation](https://threejs.org/docs/pages/Object3D.html).
No native ID/ordering API is reused or newly invoked, no dependency upgrade.
Core2.0.0 `04b7239f998c3c688a0dfa3202f11811a9acd775` and Gameplay0.15.2
`acea332aa80f67552192a72b30f81c0bbbfc56bd` remain frozen and untouched.

## File and public API delta

| File | Owned purpose |
| --- | --- |
| `runtime-render/src/visual-scene.ts` | Immutable validated records, canonical per-scene membership, exact-handle remove, deterministic ordinals, clear/end integration |
| `runtime-render/src/index.ts` | Seven additive root exports |
| `runtime-render/manual/visual-instance-membership.mts` | Optional finite real-host package-root consumer; compile only |
| `runtime-render/docs/tasks/scene-rendering-v0.8.2.md` | Supplied independent task, LF/trailing whitespace normalized |
| `runtime-render/docs/scene-rendering-v0.8.2.md` | Contract decisions, operation table, manual handoff, exclusions and rollback |
| `runtime-render/AGENTS.md` | Current membership guardrails, earlier checkpoint history preserved |
| `harness/OWNERSHIP.md`, `harness/CONTRACTS.md`, this report | Ownership, public boundary and evidence |

Exports: `addRenderVisualInstance`, `getRenderVisualInstance`,
`listRenderVisualInstances`, `removeRenderVisualInstance`, `RenderVisualInstance`,
`RenderVisualInstanceInput`, `RenderVisualCorrelation`. Root counts after rebuild:
**Render137 / Editor134 / Client0**, previously 130/134/0. Existing required
scene/session members and signatures unchanged; empty SR02 clear semantics remain
valid. Nonempty clear now removes owned registrations. No native/DOM types in new
declarations. Exactly five projects and unchanged package manifests/pins/lockfile.

Caller string keys are scoped to current scene membership; correlation strings
are optional, detached, nonunique and never authoritative. Registration object
identity plus scene provenance prevents stale/cross-scene mutation. Removed IDs
can be reused with a new handle and increasing ordinal; ordinal never resets at
clear and rejects safe-integer exhaustion. Missing valid get is undefined;
duplicate ID/foreign handle/invalid input/terminal operation is TypeError; stale
same-scene remove is false. Lists are new frozen arrays of frozen metadata-only
handles. Terminal clears strong membership before native cleanup. Add rechecks
terminal and duplicates after input reflection to preserve admission on reentry.

Rejected: ID-only destructive remove, inferred resource/role IDs, silent upsert,
global catalog, mutable arrays, recycled ordinals, Editor schema coupling, ECS,
native instances, texture loading and premature sorting. Private WeakMap is
canonical capability dispatch, not an enumerable scene registry. Per-scene issued
WeakSet retains no strong historical handles. Retention conclusions are source
analysis only, not measured GC/native cleanup proof. Rollback removes membership
implementation/seven exports and consumer/docs without persisted-data migration.

## Executed gates and evidence

| Command / observation | Result |
| --- | --- |
| `npm run build --workspace runtime-render` | exit 0 |
| `node harness/cli.mjs check` | exit 0; ARCH_CHECK_PASS, 112 JS/TS sources |
| `node harness/cli.mjs scope --projects runtime-render,editor,game-client --allow-infra` | exit 0; SCOPE_PASS; unrelated `.mcp.json` appears in scanner only |
| `node harness/cli.mjs verify --projects runtime-render,editor,game-client --with-consumers` | exit 0; genuine Render, Editor, Client builds PASS |
| `npm run build -- --force` | exit 0; genuine five-project workspace build PASS |
| Strict portable public-root consumer compile, documented command | exit 0; ES2022, no ambient DOM, skipLibCheck false |
| Same portable compile including unchanged SR02 manual consumer | exit 0; existing public shapes still compile |
| TypeScript checker export enumeration | exit 0; 137/134/0 |
| `git diff --check` and scoped staged whitespace inspection | exit 0 |

The initial new manual consumer compile reported TS1434 because `satisfies` was
placed after a line break ending the initializer; corrected syntax and genuine
recompile succeeded. No failed/unconfigured project build remains. Existing
Harness Windows child-process warning DEP0190 does not change the successful gate.
No tests/runners/fixtures/fake sessions/extra dependencies introduced or executed.

The single checkpoint commit and its exact-head push/PR workflow URLs/results
are entered in PR #8's ledger after push, avoiding self-referential commit SHA.
Remote CI is independently observed, not inferred from local builds.

## Limits / handoff

The manual consumer uses actual graphics factories and root APIs, but has only
been compiled: two-session identity, duplicate/foreign rejection, input mutation,
stale handle/reuse, clear/history and terminal isolation are **NOT_EXECUTED** in
a browser here. No observed behavioral PASS, pixels, frames or leak-free claim.
Inherited TPSHEET_METADATA_OBSERVED / TPSHEET_VISUAL_NOT_VERIFIED remains limited
to prior Unity40300 metadata evidence, not re-executed; no assets added/copied.

No mesh/texture/resource binding, transforms, visibility/update policy, sorting,
scene graph, camera, animation/VFX, gameplay or protocol changes. No genuine
dependency/ownership blocker for registration-only membership was found.
Next readiness is scoped architectural/build readiness, not phase acceptance.
v0.8.3 task is not supplied; do not invent it. Continue the next supplied checkpoint
on this branch/PR without intermediate review permission. No merge/main edit,
tag, release, publication or other PR modification.
