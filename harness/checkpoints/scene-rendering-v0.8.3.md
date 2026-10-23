# v0.8.3 — SR05 Visual Instance Creation & Operations

Outcome: **READY_FOR_NEXT_CHECKPOINT** for scoped implementation, compilation and
static architecture prerequisites. **FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED**.
No browser execution, GPU result or Developer phase/MVP acceptance is claimed.

## Preflight / ownership / prerequisites

Starting HEAD `1254f84dec1c53dafcedf8cbe21d361dc93de022` on
`feat/scene-rendering-v0.8`, existing draft PR #8 OPEN at matching head. Fresh
fetched main/base `ffb347140fbe6bf432bb8fe33c7057bed9a93941` unchanged.
Tracked worktree clean; existing unrelated untracked `.mcp.json` remains untouched
and excluded. No changes to main or other phase PRs.

Read root/project guidance, ARCHITECTURE/FOUNDATION and relevant Harness ownership,
contracts/workflow/verification/failure rules. Rechecked current public roots,
compiler settings/manifests/declarations, SR02/SR03/SR04 implementation, actual
graphics admission/terminal teardown and Three backend, Phase 7 texture/frame
resource contracts, Phase 4 presentation data and Editor authored Scene/Asset/
Document adapters plus Client host boundary. Route supplied no reliable hint.
Canonical primary owner: **runtime-render** for current presentation state and
exact-handle operations. Editor/Client are compatibility builds only; no source
changes. Harness owns contract/evidence records. Supplied SR05 explicitly
authorizes these additive operations; dependency directions are unchanged.

Phase 6 session implementation and terminal listener broadcast exist and run
before backend cleanup. Phase 7 actual texture/lease/release/frame-resolution
implementations remain available, not substituted by metadata-prepared shims.
SR05 needs none of their resource rights: no image acquisition or draw is added.
Existing native-texture/Three material interop limitation remains a future seam,
not bypassed. Three0.186.1/types0.186.0 installed source/version were compared
with official [Object3D docs](https://threejs.org/docs/pages/Object3D.html);
no new native API or upgrade. No sample bytes/rights change. Core2.0.0
`04b7239f998c3c688a0dfa3202f11811a9acd775` and Gameplay0.15.2
`acea332aa80f67552192a72b30f81c0bbbfc56bd` remain frozen, with no new API use.

## Reviewable file / public contract delta

- `runtime-render/src/visual-scene.ts`: one current snapshot per membership entry,
  exact-handle read/full replacement, equality no-op, safe admission diagnostics,
  preservation of creation/removal/clear/terminal semantics.
- `runtime-render/src/index.ts`: six additive root names:
  `getRenderVisualInstanceSnapshot`, `updateRenderVisualInstance`,
  `getRenderVisualInstanceFailure`, `RenderVisualInstanceProperties`,
  `RenderVisualInstanceSnapshot`, `RenderVisualInstanceFailure`.
- `runtime-render/manual/visual-instance-operations.mts`: finite optional real-host
  public-root consumer, no tests/fakes/frames and no auto-execution.
- `runtime-render/docs/tasks/scene-rendering-v0.8.3.md`: supplied standalone task,
  LF/trailing-whitespace normalization only.
- `runtime-render/docs/scene-rendering-v0.8.3.md`: full contract/operation table,
  capture/atomicity boundaries, manual handoff, exclusions and rollback.
- `runtime-render/AGENTS.md`, `harness/OWNERSHIP.md`, `harness/CONTRACTS.md`, this
  report: current guardrails/ownership/evidence; old checkpoint reports unchanged.

Rebuilt public counts **Render143 / Editor134 / Client0**, previously 137/134/0.
No legacy signature/required member changes. Known errors remain TypeError via
subclass with new safe classifier; error strings are not stable diagnostics.
No native/DOM/Editor types in new declarations. Exactly five projects; no package,
pin, lockfile, native backend, Editor/Client/Engine/Server or asset modifications.

## Decisions / atomicity / rollback

Use existing add as canonical create; no redundant factory. Minimal replace payload
contains only existing neutral correlation, required or explicit null. No future
nullable resource/transform/visibility/order fields or generic metadata bag. Handle
remains immutable registration history; new detached snapshot reports current props.
Update preserves the exact handle, string key, runtime scope/session symbols,
ordinal and collection position. Equal props reuse the current snapshot object.

Validate/capture first, recheck exact current entry and pre-capture snapshot, then
one pointer assignment. Invalid candidates do not commit state. Proxy-driven nested
updates are outside host-side atomicity; changed snapshot rejects INSTANCE_CHANGED,
removed/replaced target rejects MISSING_INSTANCE, terminal scene/session rejects
SCENE_DISPOSED/SESSION_UNAVAILABLE. Foreign provenance and duplicate creation stay
separate. Unknown host errors propagate, not relabeled or swallowed. No upsert.
All admitted states/correlation are frozen/detached; old observations remain valid
history, not live capabilities. Remove repeats return false for same-scene stale
handles; ID reuse cannot redirect old handles. Clear/end drops entry/current state,
does not touch shared assets or native resources. Retention is source analysis,
not measured GPU/GC/leak evidence.

Rejected: changing handle on update, remove/add reorder, patch/upsert, guessed
visual-ready flags, general transaction/undo/bus/bulk system, resource releases
without ownership, additional renderer/cache/math or gameplay mutation.
Rollback removes the six exports/state operations/classifier and optional consumer,
restoring SR03/SR04 entries; no persisted-data or resource migration.

## Executed verification

| Gate | Actual result |
| --- | --- |
| `npm run build --workspace runtime-render` | exit 0 |
| `node harness/cli.mjs check` | exit 0; ARCH_CHECK_PASS, 113 JS/TS sources |
| `node harness/cli.mjs scope --projects runtime-render,editor,game-client --allow-infra` | exit 0; SCOPE_PASS, includes unrelated untracked `.mcp.json` in scanner only |
| `node harness/cli.mjs verify --projects runtime-render,editor,game-client --with-consumers` | exit 0; genuine Render, Editor, Client builds PASS |
| `npm run build -- --force` | exit 0; forced genuine five-project workspace build PASS |
| Public-root portable compiler command in runbook, new + unchanged SR02/SR03/SR04 consumers | exit 0; strict ES2022 without ambient DOM, skipLibCheck false |
| TypeScript checker export enumeration | exit 0; 143/134/0 |
| `git diff --check` / staged whitespace inspection | exit 0 |

No failed/unconfigured project build observed. Existing Harness Windows DEP0190
warning about child-process shell invocation remains; gate exit is 0. No tests,
runners, fixture assertions, fake textures/backends/receipts or extra dependencies.
Scoped staging excludes `.mcp.json`, dist, node_modules and ignored artifacts.
Exact checkpoint SHA and matching successful/pending CI workflow URLs are attached
to PR #8's ledger after push; remote results are independently observed.

## Evidence gaps / next handoff

Consumer compiles against genuine factories and package root. Its runtime create/
read/update/no-op, invalid-state preservation, stale/foreign/duplicate admission,
scene/session terminal paths are **NOT_EXECUTED** in a browser here. No observed
behavioral or visual PASS. Builds/static scans are not functional proof.
Inherited TPSHEET_METADATA_OBSERVED / TPSHEET_VISUAL_NOT_VERIFIED remains limited
to prior metadata evidence, not re-executed. No PNG decode/atlas image/draw claim.

No genuine dependency/ownership blocker for these metadata-only operations found.
No transforms, visibility, ordering, resources, native mesh, camera, animation/VFX,
bulk sync, gameplay or protocol. Next readiness is scoped architectural/build
readiness, not phase/MVP acceptance. v0.8.4 task has not been supplied; no invented
next-checkpoint work. Continue its supplied scope without intermediate review
permission. No merge/main edit, tag, release, package publication or other PR edit.
