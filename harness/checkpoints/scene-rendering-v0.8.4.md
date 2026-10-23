# v0.8.4 — SR06 Visual Resource & Frame Binding

Outcome: **READY_FOR_NEXT_CHECKPOINT** for scoped code/build/static prerequisites.
**FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED**. No observed behavioral/GPU PASS,
phase acceptance or automatic next-version authorization.

## Preflight and canonical owner

Starting HEAD `0e8ea7720ba26b5901efd30cab66fe8b13ba49a2`, branch
`feat/scene-rendering-v0.8`, draft PR #8 OPEN at matching head. Fetched main/base
`ffb347140fbe6bf432bb8fe33c7057bed9a93941`. Tracked checkout clean; existing
unrelated untracked `.mcp.json` untouched/excluded. No main or other PR edits.

Read root/project guidance, architecture/foundation and Harness contracts,
ownership, workflow, verification and failures; audited actual public roots,
manifests/compiler settings, graphics session/teardown, private Three backend,
Phase 7 cache/texture/frame/geometry and current visual instance operations.
Rechecked Editor Scene/Asset/spatial/Document boundaries and Client host/root.
Route gives no reliable keyword owner hint. Canonical primary owner is
**runtime-render** for live instance resource usage. Editor/Client require only
public-contract compatibility builds. Harness records ownership/evidence.
Supplied SR06 authorizes additive binding operations; no dependency reversal.

## Actual Phase 7 dependency gate — satisfied

At preflight HEAD, `VisualResourceCache.acquire(session, descriptor, sourceIndex,
expectedRevision, limits, options): VisualResourceLease` is implemented, not
roadmap-only. `lease.result/getSnapshot()` produces usable `{texture:RenderTexture,
resourceId:symbol, sourceRevision:string, sessionId,...}` after real session upload.
`RenderTexture` exposes only getSnapshot/release; native GL stays private.

Call path: cache.acquire -> canonical group/CPU entry -> Phase 7 shared PNG load
-> canonical `uploadPngTexture` -> private backend upload/lifetime -> existing
`waiter.deliver` alias capability. Each waiter has independent terminal ownership;
last waiter `retire` releases allocation and CPU usage. Session terminal broadcast
invalidates groups before backend teardown; cache.dispose explicitly revokes all.
Existing atlas frame resolver has exact identity/address/revision diagnostics;
geometry/view admission is actual implementation with explicit page attestation.

The task needs a small owner-local retain seam in the same existing cache: weak
canonical dispatch -> existing ready entry -> same waiter/deliver. No public cache
signature changes, second cache, reload/upload, source job or native handle escape.
Input is the existing **public GPU-ready lease**; instance retains its own alias.
Absence of a public cloning method is not absence of the required GPU capability.
This seam implements authorized independent instance usage inside its canonical
owner, without importing another project's internals or bypassing Phase 7 lifetime.

Three0.186.1/types0.186.0 verified installed and pinned; official
[Texture documentation](https://threejs.org/docs/pages/Texture.html) consulted.
No native Texture call/version upgrade or material interop workaround here.
Core2.0.0 `04b7239f998c3c688a0dfa3202f11811a9acd775` and Gameplay0.15.2
`acea332aa80f67552192a72b30f81c0bbbfc56bd` remain frozen; no new L1/L2 API use.
No sample assets or rights change; no claimed new TPSheet visual evidence.

## File and public contract delta

- `runtime-render/src/visual-resource-cache.ts`: private canonical retain dispatch,
  ready/context/source-revision guards and reuse of existing waiter bookkeeping.
- `runtime-render/src/visual-scene.ts`: bind/replace/null unbind, current usage read,
  safe binding classifier, Phase 7 frame/view admission and per-entry owned cleanup.
  Clear/remove/scene or session terminal unlink and release only owned usages.
- `runtime-render/src/index.ts`: seven additive root names: bind/read/classifier
  functions and resource input/snapshot/frame/failure types.
- `runtime-render/manual/visual-instance-resource.mts`: optional real-host/provider
  finite public consumer. No fixture/assertion/framework/automatic execution.
- `runtime-render/docs/scene-rendering-v0.8.4.md`: contracts, admission matrix,
  revision/attestation/cleanup limits, manual compile/run handoff and rollback.
- `runtime-render/docs/tasks/scene-rendering-v0.8.4.md`: standalone supplied task,
  LF/trailing-whitespace normalization only.
- Render guidance, Harness OWNERSHIP/CONTRACTS and this report: scoped records;
  historical checkpoint reports unchanged.

Rebuilt exports: **Render150 / Editor134 / Client0** (previously143/134/0).
Existing required signatures, instance snapshots and failure unions unchanged.
New observations expose neutral scalar/frame data, never the owned texture/lease.
No Editor/Client/Engine/Server production edits, packages, dependency pins/lockfile,
build configurations, sixth project, native backend changes or test infrastructure.

## Decisions, failure ownership and rollback

Bind is synchronous admission of an already usable lease. A pending lease has
no completion callback into a visual instance. The caller retains its input right;
two instances retain independent waiters even from the same input. Input release
cannot revoke them; shared cache/session revocation can. Snapshots are historical;
current read probes Phase 7 state and never turns invalidation into success.

Acquire candidate right, resolve frame through Phase 7, recheck exact live instance
and unchanged binding/current props, then commit new usage before old release.
Invalid candidates release only their temporary usage and preserve old binding.
Unexpected exceptions propagate. Old-release failure after commit leaves the new
binding/unbound/removal/terminal state committed; no rollback to released rights.
Drain unlinks first and attempts all releases, propagates first cleanup exception,
and detaches terminal subscriptions in finally. Idempotent subsequent disposal is
not cleanup-success proof. No retry of an already relinquished usage.

Explicit expected source revision rejects mismatching loaded bytes; atlas token
uses existing frame semantics. Phase 7 existing pinned rights remain pinned after
invalidation. Host must supply current expectations/request generation; matching
old data with its old token describes history and cannot establish external freshness.
Late results for removed/reused/terminal handles reject; no automatic cancellation
of host requests for a still-live instance. Page identity/layout remain explicit
host attestation, not content verification inferred from equal dimensions.

Rejected alternatives: transfer/borrow host right (unsafe host release), resource
duplication, native Three exposure, second cache/parser/UV math, IO from binding,
automatic animation/retry/generation policy. Rollback is removal of additive binding
surface/state/private retain seam; no saved data/cache-public migration.

## Verification evidence

| Gate | Observed result |
| --- | --- |
| `npm run build --workspace runtime-render` | exit0, genuine build |
| `node harness/cli.mjs check` | exit0, ARCH_CHECK_PASS, 114 JS/TS sources |
| `node harness/cli.mjs scope --projects runtime-render,editor,game-client --allow-infra` | exit0, SCOPE_PASS; scanner includes unrelated .mcp.json, staging excludes it |
| `node harness/cli.mjs verify --projects runtime-render,editor,game-client --with-consumers` | exit0, genuine Render/Editor/Client builds PASS |
| `npm run build -- --force` | exit0, five-project forced workspace build PASS |
| Strict ES2022 public-root manual compilation, new + unchanged SR02/SR03/SR04/SR05 consumers | exit0, no ambient DOM, skipLibCheck false |
| TypeScript checker root enumeration / installed pins | exit0; 150/134/0; Three/Core/Gameplay unchanged |
| Git whitespace/scope inspection | exit0; only declared Render/Harness files staged |

All five projects are also individually built by both existing GitHub workflows.
Exact final SHA and actual push/PR CI URLs are recorded in PR #8 ledger after
push; report does not predict remote success. Existing Windows Harness DEP0190
warning remains; no failed/unconfigured build observed. No tests generated/run.

## Acceptance evidence limits and next handoff

Two-instance shared usage, A removal/B survival, host release, pending/released/
foreign-context rejection, missing-frame/revision rejection and late completion
are **implemented and consumer-compiled; NOT_EXECUTED in a browser**. None of the
observable acceptance boxes is marked behaviorally verified by build evidence.
No native rendering, GPU leak/memory/performance or visual correctness proof.
Inherited TPSHEET_METADATA_OBSERVED / TPSHEET_VISUAL_NOT_VERIFIED is not rerun here.
No new real-source sample walkthrough was executed.

No dependency blocker found for this binding-only checkpoint. Existing native
material/draw integration remains a later seam; renderFrame is unchanged.
No transforms/order/camera/animation/VFX or gameplay/protocol. v0.8.5 task contents
are not supplied; no speculative next milestone. Continue the next supplied scope
without intermediate review permission. No merge/main edit, tag, release or publish.
