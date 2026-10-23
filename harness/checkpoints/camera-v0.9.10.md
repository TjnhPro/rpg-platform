# v0.9.10 — CM16/CM17 Visual Scene & Frame Integration

**READY_FOR_NEXT_CHECKPOINT** for the supplied implemented source/build scope.
Integrated Camera remains **FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED**.
Browser/native acceptance scenarios are NOT_EXECUTED, not behavioral PASS.
Developer alone accepts product/phase completion.

## Exact preflight, scope and decision

Baseline HEAD/local/fetched upstream `46fb8466d844d040c3ccc6f3fd30c1f7a4d8eeeb`
(v0.9.9), branch `feat/camera-projection-v0.9`, main/merge-base
`e4464ac8e1c84a1c872f8e7a722885942a268a28`. Same OPEN draft
[PR9](https://github.com/TjnhPro/rpg-platform/pull/9), base main, exact matching head.
Tracked baseline clean; preexisting untracked `.mcp.json` untouched/excluded.
Previous-head exact CI SUCCESS:
[push39975658534](https://github.com/TjnhPro/rpg-platform/actions/runs/39975658534),
[PR39975670739](https://github.com/TjnhPro/rpg-platform/actions/runs/39975670739).
The containing commit is this checkpoint HEAD; delivery SHA and exact current-head
CI are recorded in PR after push. Previous CI is not current checkpoint evidence.

Read root AGENTS, ARCHITECTURE, FOUNDATION; Harness CONTRACTS/OWNERSHIP/WORKFLOW/
VERIFICATION/FAILURES; Render/Editor/Client AGENTS and previous checkpoint. Inspected
actual Phase4 plane/affine/viewport inverse; Phase6 session, viewport receipt,
redraw token/resize/frame and private Three backend; Phase7 image/texture/cache
rights; Phase8 Scene capture, localToScene/localToClip, sorting, drawable borrowing,
termination; camera commit/zoom/bounds/viewport roots; Editor scene alignment and
projection/viewport adapters; Client continuous and Scene hosts. Real Phase7/8 APIs
exist and compile at this baseline; task-authorship historical note is stale.

Canonical primary owner **runtime-render**. Editor/Client are compatibility build
consumers only. Harness records contracts/evidence; no owner or dependency transfer.
No Engine/Server/L1/L2 APIs used/changed. Route returned Render hint, source made
the decision. The supplied task pre-authorizes additive Phase9 contracts; no
breaking-signature/closed-union exception or review pause required.

Pre-implementation plan: bind one configured camera to an existing live Scene;
share its session/renderer, capture current view and accepted CSS context at
submission, private orthographic camera over original localToScene. Keep old
localToClip path without binding. Guard changed-camera and viewport edits during
frame, invalidate after atomic commit, no rAF/scheduler. Separate exact submitted
camera receipt evidence from CPU intent. Scene/session/camera termination detaches
binding, no Phase7 release in camera code. Compile old/new roots/consumers; finite
manual public consumer and honest evidence, same phase PR and one scoped commit.

Seventeen intended files:

- `runtime-render/src/camera-scene.ts`: five additive public names, admission,
  binding/configure/dispose and historical exact-receipt application readback.
- `runtime-render/src/camera-frame-link.ts`: private weak Scene/session dispatch,
  terminal subscriptions and neutral per-frame frustum data; no manager/backend.
- `runtime-render/src/camera.ts`: canonical before/after commit and disposal hook.
- `runtime-render/src/frame-session.ts`: capture/application receipt on existing
  submit, demand attach/detach and coherent resize/suspension edit guard.
- `runtime-render/src/three-frame.ts`: optional native OrthographicCamera and
  conditional localToScene node matrix in same renderer/Scene.
- `runtime-render/src/three-visual-draw.ts`: validate selected matrix; unchanged
  resource borrowing, geometry/frame/material and ordering.
- `runtime-render/src/visual-scene.ts`: canonical registration and terminal unbind
  before drain; existing resource cleanup still always attempted.
- `runtime-render/src/index.ts`: public exports only.
- `runtime-render/manual/camera-scene.mts`, `.html`, `.md`: real-PNG A/B consumer
  and runbook, no assertions or auto frame loop.
- `runtime-render/docs/camera-v0.9.10.md`, `docs/tasks/camera-v0.9.10.md`: contract
  and exact supplied task (trailing whitespace normalized).
- `runtime-render/AGENTS.md`, `harness/CONTRACTS.md`, `harness/OWNERSHIP.md`: pointers.
- This checkpoint. No prior checkpoint/evidence rewritten.

## Contract, compatibility and ownership evidence

Five new root names: bindRenderCameraToVisualScene,
getRenderCameraFrameSnapshot, RenderCameraSceneBinding,
RenderCameraSceneBindingSnapshot, RenderCameraFrameSnapshot.
Exact emitted declaration audit against baseline: Render226->231, Editor138->138,
Client0->0. Additions5, removed0/changed0. renderFrame() signature and receipt DTO
unchanged; CPU snapshots retain old unbound/not-applied meaning. The new binding
and per-frame evidence are separate observations. No public DOM/THREE/GPU types.
Declaration equality is not universal semantic compatibility proof.

Bind/configure accepts only active canonical Scene + configured active camera,
latest issued same-session resize receipt, same-project CSS logical extent and
finite canonical inverse frustum. One binding per camera/session. Logical metrics
captured/frozen. New accepted resize always requires explicit configure; stale
context rejects frame before backend mutation without destroying the session.
No silent fit, measured-DPR read, camera move or resize teleport. Suspension and
resume retain Phase6 policy/fresh-context requirement.

On changed center/pan/zoom/focus/bounds commit, the existing seam checks bound
frame admission before publishing, then invalidateRenderFrame after atomic commit.
No-op/rejection leaves demand unchanged. Bind/configure/unbind mark demand but
never submit or request a callback. Editor on-demand and Client continuous
schedulers are unchanged compatibility consumers, not migrated by this checkpoint.

Phase6 captures camera view + viewport under frame guard, then ordered usable
Phase8 items. Camera/binding/Scene edits, nested frames, resize and suspension
during submission reject via existing guard. Canonical inverse CSS corners become
native orthographic frustum; native zoom1 avoids double application of scale/zoom.
Same renderer/Three.Scene, optional private camera, no resource cache/scene/loop.
Exact drawn source plane/project/unit/axes required. Bound node uses localToScene
once; unbound uses legacy localToClip + identity Camera. No immutable instance
snapshot, placement, anchor, orientation, sorting key or authored dirty mutation.
Native float32 finite admission remains, no universal pixel/numeric guarantee.

Only successful native submission and session identity recheck associate a frozen
RenderCameraFrameSnapshot with the exact receipt. Snapshot contains view/revision,
Scene/session IDs, accepted resize and mapping; copied/foreign/no-camera receipt
returns undefined. Submitted does not imply displayed/completed/live health.
Scene/session end detaches before resource cleanup, camera.dispose detaches only
binding, binding.dispose leaves CPU camera/Scene/session alive. Shared Phase7
allocations are never released/deleted by camera binding. New native context is a
new lifetime, never recovery of this terminal binding.

Invalid context/zoom/dimensions/planes retain TypeError; numeric inverse/frustum
limits RangeError. Actual drawn plane mismatch/resource expiry/native failure is
terminal through existing Phase6 cleanup; no false receipt/fallback. No native
loss auto-recovery. CM14 arbitrary oblique/elevation-to-geometry application is
not invented: host must provide matching source/presentation-plane instances.
The old Phase7 texture-demo quad remains explicit clip-space overlay, independent
of Scene camera. No new failure union or unsupported generic perspective policy.

Rejected alternatives: rewrite all Phase8 instance snapshots on each pan (would
conflate instance/world and camera), reuse baked localToClip under camera (double
projection), add renderer/Scene/loop/cache, auto-adopt stale host metrics, reinterpret
old CPU binding fields or require new fields on old frame receipts. No gameplay,
schema, scene/asset format, depth algorithm or scheduling changes.

Exactly five projects; lock/dependencies/pins/workflow unchanged. Lock verified
Three0.186.1, @types/three0.186.0, TypeScript6.0.3. Inspected installed Three
OrthographicCamera updateProjectionMatrix and existing backend rather than guessing
new library APIs. Read-only Core2.0.0 pin
`04b7239f998c3c688a0dfa3202f11811a9acd775`, Gameplay0.15.2 pin
`acea332aa80f67552192a72b30f81c0bbbfc56bd` unchanged.

## Actual automatic gates and finite observations

| Command | Actual exit/result |
| --- | --- |
| `node harness/cli.mjs check` | 0; ARCH_CHECK_PASS154 JS/TS sources |
| `node harness/cli.mjs scope --projects runtime-render --allow-infra` | 0; final18 paths =17 intended + preexisting .mcp.json |
| `node harness/cli.mjs verify --projects runtime-render --with-consumers` | 0; genuine Render/Editor/Client BUILD_PASS |
| `npm run build -- --force` | 0; genuine five-project build |
| strict actual emitted roots +21 portable manual consumers, ES2022/no DOM | 0; skipLibCheck false |
| strict emit manual camera-scene.mts | 0 |
| declaration audit against baseline | 0;5 additions,0 removals,0 changed |
| Node public-root finite owner observation | 0; values below |
| manual HTML module syntax check | 0; parsing only, no browser execution |
| `git diff --check` | 0 |

No unconfigured/failed genuine project build remains. Initial manual consumer
compile rejected guessed pixelRatio/size-limit fields (TS2345/TS2353); corrected
to actual requestedPixelRatio/maxWidthPixels/maxHeightPixels/maxPixelCount without
production contract/config changes, then strict compile exited0. Existing Windows
Node DEP0190 Harness warning and Git line-ending notices are not behavioral PASS.
No tests, suites, assertion matrices, runners, coverage, new CI jobs or test files.
Generated declarations/driver/compiled consumers/server logs remain ignored.

**EXPECTED:** CPU source right/down, viewport320x240, scale1/zoom1, center160,120:
world160,120 projects160,120 CSS. Pan32 gives center192,120/projected128,120;
zoom2 gives96,120. No-op identity, invalid inputs reject, B and authored data stable.
Native consumer should visibly move/scale actual PNG only after host Draw; pending
demand must precede submission, frame evidence names applied revision. DPR2 should
preserve CSS projection; actual A disposal/loss must not destroy B.

**OBSERVED (public roots, Node, logical-only):** projection160,120 ->128,120
->96,120 exactly at sample absolute tolerance1e-12 (no difference observed).
Zoom2 no-op retained exact view identity. Zoom0, logical width0, unknown source
plane, foreign Scene capability and disposed camera pan rejected TypeError;
sampled exact A view identity preserved on rejection. Foreign Scene callback was
not invoked. Unknown receipt returned undefined, never invented application.
A pan/zoom/disposal retained B exact view identity and projection160,120.
Actual Editor-created Scene placement160,120 unchanged; actual in-memory Document
currentRevision1, savedRevision null, isDirty true unchanged (new unsaved doc,
not a stored baseline/persistence claim). No gameplay consumer was supplied.

**NOT_OBSERVED:** native frame/PNG/sprite pixels, pending redraw consumption and
applied revision receipt, native A/B isolation, real accepted resize/stale binding
refresh/DPR, native loss terminal cleanup, actual live instance transform/sorting
invariance and expired Phase7 lease rejection in this binding consumer. Browser
creation returned IAB unavailable; Computer Use inventory apps[]/browsers[]. Manual
HTML was never executed; no fake host/GPU substituted. Local127.0.0.1 server was
started then stopped after inventory, no lingering task process. CPU observations
are not native Scene/geometry/gameplay or persistence evidence. Static/build PASS
is neither full architecture proof nor functional/visual acceptance.

## Handoff

No source prerequisite blocker for this scoped integration. Native manual evidence
remains pending with explicit [runbook](../../runtime-render/manual/camera-scene.md)
and [contract](../../runtime-render/docs/camera-v0.9.10.md). v0.9.11 requires its
supplied task and fresh preflight; no unsupplied next-version implementation,
merge/tag/release/publish or phase/product acceptance in this delivery. Rollback
is a revert of this checkpoint; preserve previous accepted history.
