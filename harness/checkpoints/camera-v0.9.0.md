# v0.9.0 — CM01 Camera Architecture & Contract Foundation

**API_DESIGN_ONLY / READY_FOR_NEXT_CHECKPOINT**.
**FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED**. No runtime Camera API implemented.

## Exact preflight and contract plan

Input main/upstream HEAD and branch base:
`e4464ac8e1c84a1c872f8e7a722885942a268a28`. Fetched origin/main matched local.
Phase8 [PR #8](https://github.com/TjnhPro/rpg-platform/pull/8) was MERGED at that
SHA; [post-merge CI](https://github.com/TjnhPro/rpg-platform/actions/runs/39959198950)
was completed SUCCESS at matching headSha. The Developer explicitly requested
merge and then supplied this task; previous visual evidence gaps are preserved.
Task-authorship notes about open Phase7/no Phase8 are stale, not blockers.

New phase branch: `feat/camera-projection-v0.9`, one phase PR targeting main.
Only v0.9.0 is supplied/implemented here. Exact checkpoint SHA, PR number and
matching completed push/PR CI links are recorded in the PR after commit/push;
the commit cannot contain its own SHA. No existing PR/main content rewritten.

Tracked input was clean; unrelated untracked `.mcp.json` was present before this
task and remains untouched/excluded. Root/project agent guidance, architecture,
Foundation, Harness contracts/ownership/workflow/verification/failures and prior
closure were inspected alongside current source, compiler/manifests and declarations.
`route -- "camera and projection"` suggested Render; source confirms that choice.

Requested behavior: source-backed Camera ownership/semantic map, no live camera
or public API. **Canonical primary owner: runtime-render**. Harness is evidence
tooling, not another production owner/project. Editor/Client participate only as
existing public-root consumers; no consumer source edits. Engine/Server and frozen
L1/L2 are outside scope. No ownership/dependency change or unknown owner decision.

Public signature delta **zero**, including existing closed diagnostics unions.
Keep Phase4 spatial/inverse, Phase6 lifecycle/viewport/frame, Phase7 leases and
Phase8 live instances canonical. Admission/failure/terminal/release behavior is
designed for later checkpoints, not implemented here. Rollback removes only seven
documentation changes; no data migration, resource allocation or runtime rollback.
Expected gates: architecture/scope, Render build with Editor/Client consumers,
strict public declarations/manual consumers and forced five-project build.

## Owned file delta

Exactly seven documentation files:

- [Camera design](../../runtime-render/docs/camera-v0.9.0.md): actual capability
  table, position owners/dataflow, portable description vs live binding/view/result,
  explicit coordinates/zoom/aspect/revision direction, 2.5D limits and compatibility.
- [API inventory](../../runtime-render/docs/camera-api-inventory-v0.9.0.md): all
  root symbols from emitted declarations at the exact baseline, linked to source.
- [Supplied independent task](../../runtime-render/docs/tasks/camera-v0.9.0.md):
  retained task, trailing whitespace normalized.
- `harness/CONTRACTS.md`, `harness/OWNERSHIP.md`, `runtime-render/AGENTS.md`:
  concise current-checkpoint pointers and boundary/invariant guidance.
- This independent checkpoint report.

No production source, exported type, schema, asset, manifest, lockfile, compiler,
workflow, dependency, upstream or historical report edit. Exactly five workspaces.
Root symbols remain Render186 / Editor138 / Client0. No old symbol or declaration
changed because all production source is identical to the input baseline.

## Source-backed findings and decisions

- Phase4 axis-aligned projection and selected-plane viewport/screen inverse are
  real public APIs; positive ratios, exact plane/unit/axes, determinant/reciprocal
  and destination residual limits are documented without claiming source accuracy.
- Phase6 public session/viewport/resize/invalidation are implemented. Last viewport
  snapshot has accepted buffer pixels, not logical CSS or screen origin. A resize
  receipt captures requested CSS and accepted effective ratios; future Camera must
  retain explicit logical context and avoid multiplying DPR twice.
- Phase7 source/PNG/texture/cache/atlas and usable retained lease APIs are real;
  Phase8 scene/instance/resource/transform/order and actual frame draw exist. They
  compile as prerequisites; CM01 makes no new GPU/visual acceptance claim.
- Crucial seam: Phase8 already bakes localToClip per instance and renders with a
  fixed identity Three Camera. Future opt-in session view must use localToScene
  once and preserve legacy no-camera behavior, not stack projection or guess an
  inverse of arbitrary old clip transforms. Coherent plane admission is needed.
- Pure description is GPU-independent; live binding is session-owned; view and
  results are Render-owned presentation. Pan/zoom never mutate authored placement,
  gameplay positions, Phase8 source attachment depth, identity or resource rights.
- Proposed 2.5D basis/elevation is DESIGN_ONLY. Phase4 axis-aligned mapping is not
  arbitrary oblique projection. Selected height/plane is required for inverse;
  unknown height has no unique answer. Reuse affine inversion, no copied math.
- Closed diagnostics union growth can break exhaustive consumers. Prefer a separate
  camera admission classifier; any required variant migration needs explicit
  approval, not an unqualified additive claim. No such union edit here.
- One active orthographic camera/session is the narrow later MVP target. Shared
  Render implementation, independent Editor/Client sessions and real Phase7/8 art;
  no animation/follow smoothing, extra manager, renderer/cache or gameplay feature.

Installed/locked Three0.186.1, @types/three0.186.0, TypeScript6.0.3 inspected along
with installed Camera identity matrices and official Camera/OrthographicCamera
docs linked in the design. No package upgrade. Core2.0.0 pin
`04b7239f998c3c688a0dfa3202f11811a9acd775`, Gameplay0.15.2 pin
`acea332aa80f67552192a72b30f81c0bbbfc56bd` untouched; no L1/L2 API needed here.

Rejected: speculative public camera DTO/stub before its own task, Editor/Client
projection helpers, new renderer/camera/cache project, old API reinterpretation,
host fake graphics, no-op demo or mock asset/lease acceptance.

## Observed verification

All gates below actually exited0 during documentation preparation. Required
architecture/build gates are repeated at committed checkpoint HEAD before push;
the PR records exact SHA and completed remote results. No projected PASS.

| Command / inspection | Actual result |
| --- | --- |
| `node harness/cli.mjs route -- "camera and projection"` | Render hint only; final owner selected from source |
| `node harness/cli.mjs check` | ARCH_CHECK_PASS, 133 JS/TS sources |
| `node harness/cli.mjs scope --projects runtime-render --allow-infra` | SCOPE_PASS; scope reduces to Render documentation + Harness |
| `node harness/cli.mjs verify --projects runtime-render --with-consumers` | genuine independent Render, Editor, Client BUILD_PASS |
| `npm run build -- --force` | forced build all five projects, exit0 |
| Strict ES2022 root declaration compilation/inventory | Render186, Editor138, Client0; no DOM/ambient types, skipLibCheck false |
| Strict ES2022 eleven existing public-root manual consumers | exit0; compiled only, no runtime execution |
| Baseline diff of source/manifests/locks/pins/compiler/workflows | empty; no production or upstream drift |
| Git whitespace/scope inspection | intended documentation only; unrelated .mcp.json excluded |

Inventory used TypeScript checker aliases over actual `dist/index.d.ts` roots,
`noEmit`, `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`,
`skipLibCheck:false`, NodeNext/ES2022, `lib.es2022.d.ts`, `types:[]`.
Ignored audit tooling is not shipped as a package or test.

Existing consumer command (no generated tests/assertions):

```powershell
node node_modules/typescript/bin/tsc --ignoreConfig --noEmit --strict --noUncheckedIndexedAccess --exactOptionalPropertyTypes --verbatimModuleSyntax --skipLibCheck false --module NodeNext --target ES2022 --lib ES2022 --typeRoots .artifacts/empty-types runtime-render/manual/visual-scene-lifecycle.mts runtime-render/manual/visual-instance-membership.mts runtime-render/manual/visual-instance-operations.mts runtime-render/manual/visual-instance-resource.mts runtime-render/manual/visual-instance-transform.mts runtime-render/manual/visual-instance-visibility.mts runtime-render/manual/visual-instance-ordering.mts runtime-render/manual/visual-instance-depth.mts runtime-render/manual/visual-scene-frame.mts runtime-render/manual/visual-lifetime.mts editor/manual/scene-preview.mts
```

No failed/unconfigured build remains. Existing Windows Harness DEP0190 warning
does not fail builds. Static scan and successful compilation are limited evidence,
not proof of runtime architecture, rendering behavior or numeric accuracy.

## Expected, observed, pending and handoff

EXPECTED: preserve current axis-aligned input rejection and resource/session guards;
future Camera validates positive dimensions/zoom/coherent plane and selected-height
inverse before state mutation. Authored/gameplay/depth/other session remain stable.
OBSERVED: source implementations and declaration resolution/compilation/builds only.
NOT_OBSERVED: Camera A/B independence, pan/zoom pixels, negative camera admission,
live resource expiry, authored/gameplay before/after or 2.5D inverse residuals.
There is no live camera API to exercise at CM01; no fake demo added.

Full negative/source behavior and future manual public-root scenario are in the
design evidence table. Browser NOT_EXECUTED, FEATURE_NOT_VERIFIED /
VISUAL_NOT_VERIFIED; inherited TPSHEET_NOT_VERIFIED / TPSHEET_VISUAL_NOT_VERIFIED.
No tests/frameworks/runners/coverage, GPU/DOM native exports or new CI jobs.

No critical prerequisite/ownership blocker established for v0.9.0. Ready for the
next **supplied** v0.9.1 task, subject to its own fresh preflight and additive
contract constraints. No early next-version implementation, review pause, automatic
merge, tag, release, publication or Phase9 acceptance.
