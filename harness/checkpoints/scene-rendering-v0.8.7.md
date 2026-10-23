# v0.8.7 — SR09/SR10 Visual Layers & Explicit Ordering

Outcome: **READY_FOR_NEXT_CHECKPOINT** for scoped code/static/build prerequisites.
**DRAW_NOT_IMPLEMENTED / FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED**.
No observable acceptance item is claimed behaviorally verified.

## Preflight and canonical owner

Start `ef90094d3741ce647c2b6a1a959e118fb0e32500` on `feat/scene-rendering-v0.8`,
draft PR #8 OPEN at matching head; fetched base/main
`ffb347140fbe6bf432bb8fe33c7057bed9a93941`. Tracked checkout initially clean,
unrelated untracked `.mcp.json` untouched/excluded. Prior checkpoint exact-head
[push CI](https://github.com/TjnhPro/rpg-platform/actions/runs/39940293448) and
[PR CI](https://github.com/TjnhPro/rpg-platform/actions/runs/39940297887) success.

Read root AGENTS/ARCHITECTURE/FOUNDATION, Harness CONTRACTS/OWNERSHIP/WORKFLOW/
VERIFICATION/FAILURES and Render/Editor/Client agent guidance. Audited source,
public roots/manifests/declarations/compiler config, current branch/base/PR and
actual Phase 4/6/7 integration, not stale task reference SHAs. Route suggests
Render; source establishes **runtime-render** as sole owner of live presentation
layers, assignment/comparator and private node ordering. Editor/Client are
compatibility builds only; Harness records ownership/contracts. The supplied task
explicitly authorizes the additive layer/order public contract. No uncertain
ownership, boundary reversal or additional project is needed.

Phase 6 canonical graphics lifecycle/viewport suspension/frame demand is real.
Phase 7 usable leases follow actual PNG decode/upload; SR06 binding retains an
independent usage through that existing cache and uses existing atlas geometry.
SR07 owns private affine nodes; SR08 owns visibility. No mock/metadata-only
prerequisite substitute, loader/cache duplication, resource API or Engine edit.
Editor scene-membership's authored layerKey stays opaque; Scene/Asset/Document/
spatial adapters and Client canonical host stay unchanged.

Three0.186.1/types0.186.0 unchanged. Official
[Object3D API](https://threejs.org/docs/pages/Object3D.html) audited for renderOrder,
visible and independent opaque/transparent lists; installed source inspected.
Core2.0.0 `04b7239f998c3c688a0dfa3202f11811a9acd775` and Gameplay0.15.2
`acea332aa80f67552192a72b30f81c0bbbfc56bd` remain pinned/read-only; no new calls.
No dependency/lockfile/compiler/workflow/asset changes or new rights/TPSheet claim.

## File and API delta

- `runtime-render/src/visual-scene.ts`: scene-local definitions/ordinals, default
  layer, strict admission, assignment/current-order observation, explicit sorting,
  filtered frozen candidates, combined layer/instance visibility and cleanup.
- `visual-transform-backend.ts`, `frame-session.ts`, `three-frame.ts`: extend the
  existing weak canonical dispatch/backend for batched visibility/rank writes;
  placement synchronizes ranks before writing the same Object3D matrix. Native
  errors use existing terminal graphics cleanup. No drawable/second backend.
- `runtime-render/src/index.ts`: nine functions, five neutral types. Names and
  complete signatures in [contract](../../runtime-render/docs/scene-rendering-v0.8.7.md).
  Optional layerKey/order in creation input; unchanged required input/handle/
  registration shapes and existing failure unions. New branded layer classifier.
- New optional real-host manual package-root consumer; independent supplied task,
  contract and this checkpoint. Render agent guidance and Harness ownership/
  contracts updated. Previous version records untouched.

Rebuilt root symbol counts **Render171 / Editor134 / Client0** (previous157/134/0).
No native/browser/GPU types escape through new public shapes. Candidates carry
existing instance capabilities and immutable scalar order metadata only.

## Decisions and failure handling

Ascending tuple: `(layer.priority, layer.insertionOrdinal, instance.order,
instance.insertionOrdinal)`. Equal-priority layers stay grouped in creation
order; equal instance orders use original registration ordinal. Creation is
explicit, independent of resource completion/update timing. Negative safe integers,
gaps/collisions accepted; unsafe/fractional/nonfinite values reject. No implicit
Map sort, authored classification, Y-depth or gameplay class policy.

Built-in default priority0/visibletrue/ordinal0 preserves old creation behavior;
default can be updated but not removed. No missing fallback or auto-create.
Occupied custom deletion rejects; empty deletion allowed; recreation gets a new
ordinal. clear retains definitions/counters, termination clears definitions.
Full layer replacement defaults omitted visible to true. Reassign/reorder retains
instance ID/handle/ordinal/correlation/transform/binding; no IO/lease changes.
Hidden layers retain everything and suppress candidates/native visibility;
effectiveVisible includes layer visibility and canonical viewport suspension.

Missing/duplicate/invalid/in-use/reserved/reentrant layer/order rejection is
package-branded and happens before native writes. Existing instance provenance/
terminal failures remain canonical. Unknown host errors stay unknown. Native
ordering writes reject FRAME_IN_PROGRESS before logical commit; native failure
terminates canonically rather than returning success. No-op layer/order edits
do not invalidate; changed native participation uses existing demand, no frame
submission/scheduler. Metadata-only creation/deleting empty layers allocates
nothing native. Placement resynchronizes ranks after metadata membership edits;
removal can retain harmless rank gaps. No resource/public lifetime changes.

Rejected alternatives: global registry, silent fallback/in-use reassignment,
texture reload on reorder/hide, sorting by update/load/Map timing, Editor/native
type coupling, early depth/transparency/compositor implementation. Rollback is
additive API/optional input fields/private rank integration removal; no persisted
schema migration. Detailed failure and manual reproduction in the contract.

## Observed verification

| Command / inspection | Observed result |
| --- | --- |
| `npm run build --workspace runtime-render` | exit0, genuine Render build |
| `node harness/cli.mjs check` | exit0, ARCH_CHECK_PASS; 119 JS/TS sources |
| `node harness/cli.mjs scope --projects runtime-render,editor,game-client --allow-infra` | exit0, SCOPE_PASS |
| `node harness/cli.mjs verify --projects runtime-render,editor,game-client --with-consumers` | exit0, Render/Editor/Client genuine builds PASS |
| `npm run build -- --force` | exit0, forced five-project workspace build PASS |
| Strict ES2022 package-root consumer compile, documented command | exit0; new ordering + unchanged earlier six scene consumers; no ambient DOM |
| TypeScript checker root/declaration inspection | exit0; 171/134/0 symbols |
| Git whitespace and scope inspection | Initial staged check flagged four trailing Markdown spaces in copied task; normalized and rerun exit0; Render/Harness only, .mcp.json excluded |

No unresolved failed/unconfigured build. Existing Windows Harness DEP0190 warning
unchanged. No tests/runners/frameworks/fixtures/coverage created or executed.
Exact new commit SHA and actual push/PR CI URLs are recorded in PR #8 ledger
after completion, not predicted or claimed here before CI runs.

## Acceptance evidence gaps and handoff

Different priorities; reorder preserving identity/resource; equal-priority/order
ties; typed missing/duplicate/invalid-order rejection: implemented and consumer-
compiled, **NOT_EXECUTED** in browser. The optional real-session walkthrough logs
these plus reassignment, hidden layer transform/show, occupied/reserved deletion,
empty deletion, history, clear and terminal admission. No behavioral checkbox PASS.

**DRAW_NOT_IMPLEMENTED**: nodes have no drawable/material; future draw must consume
the comparator/gates and apply ranks to actual renderables. Ordinary Object3D
parent ranks do not implicitly order future child meshes; opaque/transparent
separate lists and depth/alpha handling remain outside this scope. Existing Phase7
diagnostic quad is not an instance draw and cannot prove layer pixels. No native
rank/GPU lifetime/leak-free or visual observation. TPSHEET_VISUAL_NOT_VERIFIED
inherited, not rerun. No blocker to this limited code/build checkpoint.

Next intended milestone v0.8.8 requires its supplied detailed task; no speculative
next-version code in this commit. No intermediate review gate requested; no
merge/main change, tag, release, publish or Phase 8 MVP/Developer acceptance claim.
