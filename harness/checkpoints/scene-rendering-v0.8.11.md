# v0.8.11 — SR16/SR18 Scene Synchronization & Editor Integration

Outcome: **READY_FOR_NEXT_CHECKPOINT** for scoped code/build/static gates.
**FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED**. Developer acceptance remains open.

## Preflight and dependency gate

Input HEAD `dc2432a1e3aa505d1bd3dd7702d7bf0384438b28`, branch
`feat/scene-rendering-v0.8`; draft PR [#8](https://github.com/TjnhPro/rpg-platform/pull/8)
OPEN with matching head. Fetched base main
`ffb347140fbe6bf432bb8fe33c7057bed9a93941`. Tracked input clean; unrelated
untracked `.mcp.json` remains untouched and excluded. Previous exact-head
[push](https://github.com/TjnhPro/rpg-platform/actions/runs/39946615559) and
[PR](https://github.com/TjnhPro/rpg-platform/actions/runs/39946622737) CI success.

Applicable root/project AGENTS, ARCHITECTURE/FOUNDATION, Harness ownership,
contracts/workflow/verification/failures, current roots/manifests/compiler settings
and actual source were inspected. Route gives Render/Editor hints; canonical
primary behavior owner is **editor** for synchronization/orchestration. Render is
the required existing collaborator through public operations; no Render change
is needed. Client builds for compatibility. Supplied task explicitly authorizes
this additive bridge/consumer. No dependency-direction or ownership change.

Phase6 real graphics/frame sessions and Phase7 canonical cache/acquire/usable lease/
independent retained waiter/release exist at input HEAD. Phase8 real instance bind,
update, remove, transform, layout, visibility/order and private frame draw paths are
implemented. Phase2 asset resolution, Phase3 visual description and Phase4 spatial
point adapter/factories are reused, not rebuilt. DocumentSession revisions/dirty
and Scene Document edit/persistence remain separate; bridge never receives them.

Three0.186.1/types0.186.0 and the existing private backend remain unchanged; no new
Three API, native exposure or dependency is used by this Editor-only addition.
L1 Core2.0.0 `04b7239f998c3c688a0dfa3202f11811a9acd775`, L2 Gameplay0.15.2
`acea332aa80f67552192a72b30f81c0bbbfc56bd` unchanged/read-only; no new calls.

## Implementation, contracts and decisions

- `editor/src/scene-preview.ts`: one preview-local scoped authored-to-opaque-handle
  map, serial async batches with whole-input structural capture and per-object
  partial outcomes. Existing usable bindings retain exact handle and resource right;
  placement/visibility/order/layout updates call Render in place. Removed objects
  remove only their mapped handles. Add/resource change awaits real host Phase7
  lease, binds canonical retained usage and releases temporary lease in finally.
- Missing/unsupported asset or placement yields diagnostics; existing presentation
  can remain stale, new unsupported object gets no fabricated visual. Authored
  Membership/Catalog untouched. Host must surface partial outcomes explicitly.
- Host policy supplies all spatial/layout/order/visibility/resource choices. Existing
  factories capture policy and spatial adapter validates project/space. Frame/
  source revisions and descriptor/binding key determine rebinding; native/GPU math
  remains Render-owned. Host gives bridge exclusive membership/key scope.
- Close drains pending temporary leases and mapped instances without disposing
  borrowed scene/cache/session; guards prevent late adoption. Observed cleanup
  uncertainty inhibits later sync and remains in close summary. No rollback or
  universal cleanup guarantee; Render sticky diagnostics remain independently owned.
- `editor/manual/scene-preview.mts`: actual root-only consumer, real cache/session/
  catalog/membership; three references share one actual PNG and a fourth is missing.
  Optional move/remove/visibility/order/inspect/close controls; before/after authored
  JSON logging. No automated assertions, fixtures or test runner.
- Version contract, archived supplied task, manual guide/index, Editor AGENTS and
  Harness CONTRACTS/OWNERSHIP updated. This independent report records limitations.

Exactly four additive Editor exports: `createScenePreviewBridge`,
`ScenePreviewBridge`, `ScenePreviewPresentation`, `ScenePreviewOutcome`.
Observed declaration roots: Render186 / Editor138 / Client0. Existing roots and
required shapes unchanged. Production changes confined to Editor; no Engine,
Render backend, Client, Server, schema, dependencies, compiler, workflow or assets.
Exactly five projects and existing dependency graph preserved.

Partial policy: removals precede updates; each object performs prepare/load/add/
bind/transform/layout/visibility/order. Failure can leave partial presentation and
new binding after a committed step. Outcomes expose this; never clear/rebuild all.
Host owns document/session/frame lifecycle and must retain diagnostics. Rejected:
generic diff service, authored IDs as live keys, placeholder success, duplicate
renderer/cache/loader, forced layer/attachment interpretation and Document writes.
Rollback is removal of four additive root names/module/optional consumer and docs;
no persisted-data migration or upstream change.

## Observed verification

| Command / inspection | Result |
| --- | --- |
| `node harness/cli.mjs check` | exit0; ARCH_CHECK_PASS, 128 JS/TS sources |
| `node harness/cli.mjs scope --projects runtime-render,editor,game-client --allow-infra` | exit0; SCOPE_PASS |
| `node harness/cli.mjs verify --projects runtime-render,editor,game-client --with-consumers` | exit0; real Render, Editor and Client builds PASS |
| `npm run build -- --force` | exit0; forced five-project workspace build PASS |
| Strict ES2022 root-only consumer compilation, command in manual guide | exit0; actual Editor/Render declarations resolve; no ambient DOM |
| TypeScript declaration checker root inventory | exit0; 186/138/0 exports |
| Git whitespace/staged scope inspection | exit0; Editor/Harness only; .mcp.json excluded |

No unresolved failed/unconfigured build. Harness Windows DEP0190 warning unchanged.
No tests/suites/frameworks/coverage/browser automation created or run. Build/static
PASS is compile evidence only. Exact checkpoint SHA and observed push/PR workflow
URLs are appended to PR #8 ledger after push; not guessed in this self-report.

## Evidence gaps and handoff

[Manual guide](../../editor/manual/scene-preview.md) describes reproducible host
inputs/controls and observations for shared assets, stable IDs after movement,
scoped removal, missing-reference retention, document revision isolation and close
while pending. **Browser NOT_EXECUTED**. These expected observations are not behavioral
PASS. No actual pixel, lease reuse/survival, late-load or DocumentSession runtime
observation is claimed. General alpha/atlas limitations and TPSHEET_NOT_VERIFIED /
TPSHEET_VISUAL_NOT_VERIFIED inherited. No GPU leak-free or MVP closure claim.

No dependency blocker for scoped implementation. Await supplied detailed v0.8.12
task before its implementation; no speculative next-version code. No intermediate
approval request, main edit, merge, tag, release or package publication.
