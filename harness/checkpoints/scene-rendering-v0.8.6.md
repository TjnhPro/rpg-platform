# v0.8.6 — SR08 Visibility & Active State

Outcome: **READY_FOR_NEXT_CHECKPOINT** for scoped implementation/static/build
prerequisites. **DRAW_NOT_IMPLEMENTED / FEATURE_NOT_VERIFIED /
VISUAL_NOT_VERIFIED**. No behavioral acceptance or pixel proof is claimed.

## Preflight, scope and prerequisites

Starting HEAD `a7cacd98c3446e871b264ab4a1030356406ebfd1`, branch
`feat/scene-rendering-v0.8`, draft PR #8 OPEN at matching head. Fetched main/base
`ffb347140fbe6bf432bb8fe33c7057bed9a93941`. Tracked checkout clean; unrelated
untracked `.mcp.json` remains untouched/excluded. SR07 exact-head push CI
[39939412291](https://github.com/TjnhPro/rpg-platform/actions/runs/39939412291)
and PR CI [39939418425](https://github.com/TjnhPro/rpg-platform/actions/runs/39939418425)
both completed success before this checkpoint, recorded in existing PR ledger.

Read root AGENTS/ARCHITECTURE/FOUNDATION, Harness CONTRACTS/OWNERSHIP/WORKFLOW/
VERIFICATION/FAILURES and Render/Editor/Client agent guidance. Rechecked public
roots/declarations/manifests/compiler config, actual instance/transform/resource
state, canonical frame/lifecycle/viewport suspension/invalidation, private Three
nodes and Phase 7 lease/cache/upload/frame ownership. Revisited Editor authored
Scene/Asset/spatial/Document adapters and Client host suspension/resume boundaries.
Route correctly suggests Render; source establishes **runtime-render** as the
single primary owner for transient visibility and native participation. Editor/
Client are compatibility builds only, Harness records decisions/evidence. The
supplied SR08 authorizes three additive public names; no boundary reversal.

Phase 6 has actual suspendRenderViewport/resumeRenderViewport and canonical
frame rejection/demand, not a proposed API. Phase 7 usable leases follow genuine
PNG decode/native upload, with existing waiter retain/release and terminal
invalidation; SR06 instance binding already holds independent usage. SR07 owns
real private Object3D matrices but no drawable. No missing prerequisite for this
visibility-only checkpoint; no mock session, cache or renderer was introduced.

Three0.186.1/types0.186.0 installed/pinned, unchanged. Official
[Object3D docs](https://threejs.org/docs/pages/Object3D.html) checked for visible
and visible traversal; installed WebGLRenderer.projectObject returns immediately
for visible===false before draw-list construction. Source evidence only.
Core2.0.0 `04b7239f998c3c688a0dfa3202f11811a9acd775` and Gameplay0.15.2
`acea332aa80f67552192a72b30f81c0bbbfc56bd` unchanged, no new L1/L2 calls.
No new assets/rights or assumed TPSheet support.

## File and contract delta

- `runtime-render/src/visual-scene.ts`: live visible=true default; exact-handle
  boolean set/get and immutable scalar visibility snapshot; Phase 6 suspension
  observation; retain visible on hidden transform writes and teardown.
- `runtime-render/src/visual-transform-backend.ts`: extend existing private weak
  canonical dispatch with visibility write/suspension read. No public manager.
- `runtime-render/src/frame-session.ts`: same lifecycle/backend write and demand;
  admission rejects in-progress writes, native failure terminates canonically.
- `runtime-render/src/three-frame.ts`: update existing Object3D.visible without
  recreation; first/subsequent transform writes carry current visibility.
- `runtime-render/src/index.ts`: setRenderVisualInstanceVisible,
  getRenderVisualInstanceVisibility, RenderVisualInstanceVisibilitySnapshot.
- `runtime-render/manual/visual-instance-visibility.mts`: optional finite real-host
  consumer, no mocks/assertions/automatic execution/frame submission.
- Independent task/contract docs, Render agent guidance, Harness contracts/
  ownership and this report. Historical checkpoint files are unchanged.

Rebuilt roots **Render157 / Editor134 / Client0**, previously154/134/0. Snapshot
contains only visible/viewportSuspended/effectiveVisible booleans; no Three/native
or resource ownership capability escapes. Existing required input/session/instance
shapes and failure unions unchanged. No Editor/Client/Engine/Server production
edit, dependency/lockfile/build-config/workflow/asset change or sixth project.

## Semantics, failures and rejected alternatives

effectiveVisible is `visible && !viewportSuspended` for an admitted live instance.
It is a participation gate, not resource/drawable/readiness/visibility proof.
Viewport suspend does not mutate intent; resume reveals the retained intent.
No separate scene inactive/suspension lifecycle duplicates Phase 6. There is no
authored Scene/Editor dirty-state or gameplay active/stealth/life-state write.

Changed flags update the same native node then commit state and invalidate
existing demand. Repeated values return fresh suspension observations with no
native write/new invalidation. No automatic frame or scheduling. Hiding before
placement allocates no node; first/later transforms copy current flag. Transform
unset preserves intent. Show retains latest transform and existing valid resource
usage; it performs no IO/upload/reload or resurrection of an invalid lease.
Instances retain exact identity/ordinal/correlation; other instances are untouched.
No order API is added; future ordering must preserve hidden state.

Missing/foreign-scene/foreign-session/removed/reused/terminal handles follow
existing safe admission diagnostics. Primitive boolean only, otherwise
INVALID_DESCRIPTOR; terminal admission precedes no-op. FRAME_IN_PROGRESS rejects
before native write/state commit. Native failure/context loss terminates through
existing cleanup; no success returned for dead graphics. Hidden does not release
or dispose anything; explicit remove/clear/dispose still owns cleanup, with prior
postcommit failure/cleanup uncertainty unchanged. No GPU leak-free claim.

Rejected alternatives: destroy/recreate/reload when hidden, copy visibility into
authored content, treat suspension as persisted false, add parallel scene-active
state machine, build culling/fog/stealth/animation/draw pipelines. Rollback removes
three additive public names/live flag/private visibility integration; no stored
data or resource-public API migration. Detailed matrix and manual instructions:
[contract](../../runtime-render/docs/scene-rendering-v0.8.6.md).

## Observed verification

| Gate | Result |
| --- | --- |
| `npm run build --workspace runtime-render` | exit0, genuine Render build |
| `node harness/cli.mjs check` | exit0, ARCH_CHECK_PASS, 118 JS/TS sources |
| `node harness/cli.mjs scope --projects runtime-render,editor,game-client --allow-infra` | exit0, SCOPE_PASS; .mcp.json excluded from staging |
| `node harness/cli.mjs verify --projects runtime-render,editor,game-client --with-consumers` | exit0, genuine Render/Editor/Client builds PASS |
| `npm run build -- --force` | exit0, forced five-project workspace build PASS |
| Strict portable ES2022 package-root manual compile, new SR08 + unchanged previous scene entries | initial exit1 for misnamed demand getter; corrected to existing getRenderFrameInvalidationSnapshot; rerun exit0 |
| TypeScript checker root enumeration/declaration inspection | exit0, 157/134/0; neutral boolean snapshot |
| Git whitespace and staged scope inspection | exit0, only declared Render/Harness paths |

No unresolved failed/unconfigured build. Existing Windows Harness DEP0190 warning
unchanged. No tests created/run; no framework/fixtures/coverage. Existing CI builds
all five projects individually and whole workspace; final exact SHA and actual
push/PR URLs are added to PR #8 ledger after remote completion, not predicted here.

## Acceptance limits and handoff

Hide/show without recreation/release, hidden transform update and later show,
other-instance independence, suspension/intent separation and foreign/missing/
terminal rejection are implemented and consumer-compiled, **NOT_EXECUTED** in a
browser. No acceptance checkbox is behaviorally PASS. No independent observation
of native flags, pixels, resource counts or leak-free lifetime.

**DRAW_NOT_IMPLEMENTED**: SR07 nodes remain non-drawable; future instance draw
must honor the existing visibility gate. Existing standalone Phase 7 diagnostic
is not an instance draw, and its pixels are not hidden by an instance flag.
No pixel proof of hide/show is possible from this checkpoint. TPSheet inherited
metadata observation is not rerun; TPSHEET_VISUAL_NOT_VERIFIED remains.

No dependency blocker for this limited checkpoint. v0.8.7 task contents are not
supplied; no speculative implementation. Continue the next supplied scope without
intermediate review approval. No merge/main edit, tag/release/publish or Phase 8
MVP closure/Developer acceptance claim.
