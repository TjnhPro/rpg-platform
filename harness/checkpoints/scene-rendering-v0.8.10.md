# v0.8.10 — SR15/SR17 Resource Lifetime & Rendering Diagnostics

Outcome: **READY_FOR_NEXT_CHECKPOINT** for scoped code/build/static prerequisites.
**FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED**. No behavioral/leak-free acceptance.

## Preflight, prerequisite and owner

Start `710354ffd415374ab08cee1a9dd45f0b81cd41e3` on
`feat/scene-rendering-v0.8`; draft PR [#8](https://github.com/TjnhPro/rpg-platform/pull/8)
OPEN with matching head. Fetched main `ffb347140fbe6bf432bb8fe33c7057bed9a93941`.
Tracked checkout clean; unrelated untracked `.mcp.json` untouched/excluded.
Previous exact-head [push](https://github.com/TjnhPro/rpg-platform/actions/runs/39945419553)
and [PR](https://github.com/TjnhPro/rpg-platform/actions/runs/39945426157) CI success.

Read applicable root/project guidance, ARCHITECTURE/FOUNDATION and Harness
CONTRACTS/OWNERSHIP/WORKFLOW/VERIFICATION/FAILURES; audited actual public roots,
declarations/configuration and Phase4/6/7/8 implementation. Route hints Render;
source establishes **runtime-render** as the only behavior owner. Supplied task
explicitly authorizes safe diagnostics and lifetime observations. Editor/Client
compatibility builds only; Harness records the decisions. No ownership ambiguity,
dependency direction or breaking contract change.

The real v0.8.9 frame draw path, Phase7 canonical retain/waiter/release and Phase6
terminal listener/backend cleanup exist at input HEAD. Phase7 populate guards
closed entries before/after upload; instances accept only usable leases and have
no async adoption callback. No missing dependency, mock resources or second cache.

Three0.186.1/types0.186.0 remain pinned. Reinspected installed ExternalTexture and
WebGLTextures external bind path; no new Three API or version change from the
v0.8.9 official API audit. Native allocation ownership remains Phase7. Core2.0.0
`04b7239f998c3c688a0dfa3202f11811a9acd775` and Gameplay0.15.2
`acea332aa80f67552192a72b30f81c0bbbfc56bd` unchanged/read-only; no new calls.

## Implementation and public delta

- `index.ts`: safe `getRenderVisualDiagnostic` and discriminated
  `RenderVisualDiagnostic`; existing branded domains composed without message,
  stack, cause, raw context or host fields. Unknown explicitly remains unknown.
- `visual-scene.ts`: `getRenderVisualSceneDiagnostics` and
  `RenderVisualSceneDiagnostics` provide logical counts after active/terminal state;
  sticky cleanup uncertainty, scene-managed release attempt count and conservative
  retained occupancy after uncertain cleanup. Preserve existing lease semantics.
- `visual-presentation-error.ts`: private branded owner-local shape/projection/
  orientation/layout/unit/occupancy failures. Transform/layout modules retain
  TypeError subclass behavior; nested Phase4/host errors are not guessed by name.
- Optional `visual-lifetime.mts/html/md` reuses the actual Phase7 PNG/frame consumer
  for two canonical sessions and shared members. Existing manual frame consumer
  exposes additive diagnostic/destructive controls, without changing old controls.
- Independent version task/contract/report, manual index, Render AGENTS and Harness
  CONTRACTS/OWNERSHIP updated. No Editor/Client production source or other project.

Exactly four additive root symbols: Render186 / Editor134 / Client0. No old
required shape/union, frame receipt, lease, persisted schema, dependency/compiler,
workflow, gameplay, Engine/Server or L1/L2 change.

## Ownership audit, failure and release decisions

Full create/bind/replace/update/remove/clear/dispose/session/late-result audit and
before/after state table are in the [contract](../../runtime-render/docs/scene-rendering-v0.8.10.md).
Each successful bind retains its own Phase7 waiter. Shared allocations remain owned
by remaining waiters; unlinked owned bindings release once, even after exceptions.
Cache/session invalidation may already terminate that waiter; subsequent idempotent
release is not a second native delete. No Three/native handles or mutable maps escape.

Replacement validates/retains/rechecks first, drops previous drawable, commits new
binding, then releases old. Failure during old cleanup does not undo commit.
Admission/candidate cleanup failure may replace the primary exception; uncertainty
is recorded and original unknown cleanup exceptions still propagate. Remove/clear
unlink first and attempt all owned cleanup; no batch rollback/atomic claim.
Dispose terminalizes first; repeated calls do not retry owned releases or reset
evidence. A failed cleanup no longer grants a new visual scope on that same session.
The canonical graphics session retains its own independent terminal/quarantine policy.

Count observations may detect real context loss and trigger canonical teardown;
they return the drained terminal counts if revision changes, rather than partial
pre-loss counts. Unknown observation errors propagate. Scope cleanupFailed=false
is not graphics/GPU health; releaseAttempts excludes internal admission-temporary
retains, host leases and cache revocation. No performance/tracing framework.

Rejected: raw error copying, duck-typed known error codes, generic TypeError-to-GPU
classification, global error bus, new cache/loader, forced cleanup retry, successful
reuse after uncertainty and absolute leak-free claims. Rollback removes four
additive names/observations/branding; quarantine fix should be retained or explicitly
reconsidered. No persisted data migration.

## Observed verification

| Command / inspection | Observed result |
| --- | --- |
| `npm run build --workspace runtime-render` | exit0; genuine Render build |
| `node harness/cli.mjs check` | exit0; ARCH_CHECK_PASS, 126 JS/TS sources |
| `node harness/cli.mjs scope --projects runtime-render,editor,game-client --allow-infra` | exit0; SCOPE_PASS |
| `node harness/cli.mjs verify --projects runtime-render,editor,game-client --with-consumers` | exit0; all three genuine builds PASS |
| `npm run build -- --force` | exit0; forced five-project workspace build PASS |
| Strict ES2022 root-only portable consumer compile, command in manual guide | exit0; lifetime consumer, reused frame consumer and eight previous scene consumers; no ambient DOM |
| TypeScript declaration checker export inspection | exit0; 186/134/0 symbols |
| Git whitespace and scope inspection | exit0; Render/Harness only, unrelated .mcp.json excluded |

No unresolved failed/unconfigured build. Existing Windows Harness DEP0190 warning
unchanged. No tests, assertions, runners, test dependencies, browser automation,
fixtures-as-tests, coverage or assets introduced/executed. Exact checkpoint commit
and observed push/PR CI URLs are recorded afterward in PR #8 ledger.

## Evidence gaps and handoff

[Manual walkthrough](../../runtime-render/manual/visual-lifetime.md) uses real
Developer-selected PNG resources, two independent sessions and shared retained
members. Remove shared A item, observe/draw surviving item, dispose A scene/session,
repeat disposal, draw B and reject released-lease binding are explicit controls.
Canonical atlas frame inputs are supported by the compiled consumer; page uses
whole PNGs, not an unverified TPSheet parser.

Browser **NOT_EXECUTED**: shared texture/atlas survival, independent session pixels,
stale/cross-session runtime rejection, actual context loss, async late-result
behavior and partial native cleanup remain unobserved. Expected manual outcomes
are not PASS evidence. TPSHEET_NOT_VERIFIED / TPSHEET_VISUAL_NOT_VERIFIED and alpha
limits inherited. Nested unbranded Phase4 exceptions intentionally UNKNOWN_FAILURE.
No absolute memory-leak-free, core MVP closure or Developer acceptance claim.

No dependency blocker for this scoped checkpoint. Next v0.8.11 requires its supplied
detailed task; no speculative implementation here. No intermediate review gate,
main edit, merge, tag, release or publish.
