# v0.9.6 — CM11/CM12 Camera World-to-Screen Projection

**READY_FOR_NEXT_CHECKPOINT** for this supplied additive projection scope.
Integrated camera remains **FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED**.
Browser NOT_EXECUTED. CPU public-root observations below are real numeric evidence,
not native camera/viewport/pixel acceptance. Developer owns product acceptance.

## Exact preflight / declared plan

Previous checkpoint HEAD/local/fetched phase upstream v0.9.5:
`ca9e12033d65dfe0889c04ab0f2f3f511e64e8a4`.
Main and merge-base `e4464ac8e1c84a1c872f8e7a722885942a268a28`.
Branch `feat/camera-projection-v0.9`; same OPEN draft
[PR #9](https://github.com/TjnhPro/rpg-platform/pull/9), base main, matching head.
No base drift. Prior exact-head CI verified SUCCESS:
[push39969215880](https://github.com/TjnhPro/rpg-platform/actions/runs/39969215880),
[PR39969222125](https://github.com/TjnhPro/rpg-platform/actions/runs/39969222125).
The commit containing this report is the current checkpoint HEAD; its exact SHA
and completed matching current CI are recorded in PR after push. Prior CI is not
current evidence. Tracked baseline clean; preexisting untracked `.mcp.json` stays
untouched/excluded from this checkpoint.

Read root AGENTS/ARCHITECTURE/FOUNDATION, Harness contracts/ownership/workflow/
verification/failures, Render/relevant Editor/Client instructions and v0.9.5 report.
Inspected actual camera/config/zoom, Phase4 projection/affine/viewport, Phase6
resize/frame/backend, Phase7 PNG/cache/texture and Phase8 visual-scene implementation
and public roots, Editor adapters and Client host. Task's historical Phase7/8
absence note is stale: real source exists. This read-only CPU projection consumes
no resource lease or live Scene; no missing prerequisite for this scoped behavior.

Behavior owner: **runtime-render**, canonical camera projection through Phase4.
Collaborators: Harness records evidence; Editor/Client unchanged compatibility
consumers. Route `camera world to screen projection` gave Render hint only. No
Engine/Server/L1/L2 API use or edit. Task explicitly pre-approves additive Phase9
contracts and current scoped implementation without per-version review pause.

Pre-implementation plan: one public projection operation and immutable result;
reuse shared owner-local camera mapping composition, never duplicate projection
formulas. Explicit logical-only CPU context or current accepted Phase6 context,
never fallback from a rejected native receipt. Exact source scope; optional explicit
screen context. Canonical invalid-input/overflow behavior, history/reentry guards,
no authored/gameplay/depth mutation or native camera binding. Public-root finite
numeric/manual ownership evidence, consumer compilation, static/scope/build gates,
one commit/push and exact-head CI. No unsupplied next checkpoint.

## Files / API / compatibility

Eleven intended files:

- `runtime-render/src/camera-projection.ts`: new operation and readonly result.
- `runtime-render/src/camera-viewport.ts`: extract existing mapping composition to
  owner-local helper shared with the new operation; old public signature retained.
- `runtime-render/src/index.ts`: two additive root names.
- `runtime-render/manual/camera-projection.mts` and `.md`: finite public-root
  consumer and CPU/native runbook; no runner/assertions/tests.
- `runtime-render/docs/camera-v0.9.6.md` and `docs/tasks/camera-v0.9.6.md`:
  contract and supplied task, trailing whitespace normalized.
- `runtime-render/AGENTS.md`, `harness/CONTRACTS.md`, `harness/OWNERSHIP.md`:
  minimal contract/owner pointers.
- This checkpoint report.

New roots: `projectRenderCameraPoint` and `RenderCameraProjectionResult`.
Operation accepts issued configured active camera, existing ViewportMetrics2D,
PlaneProjectionPoint2D and required `{session, receipt} | null` context. Result
contains camera view, canonical mapping, viewportPoint, nullable screenPoint and
nullable acceptedViewport. No new duplicate math DTO or persistent binder.

Exact emitted declaration audit against v0.9.5: Render206 ->208; Editor138 ->138;
Client0 ->0. Two additions, removed0/changed0 across existing roots. Strict actual
emitted roots and seventeen finite manual consumers compile ES2022-only without
DOM. Declaration equality is not a universal runtime compatibility proof. Existing
v0.9.5 invalid-project/unit admission still rejects with TypeError, but its error
message can now come from the extracted helper; no diagnostic string guarantee.

Null explicitly selects validated host-declared logical CPU context; this never
claims accepted backend size/session/native liveness. Non-null requires exact
current issued resize receipt and active/ready same canonical session under
v0.9.5, with logical dimensions matching accepted requested CSS. No fake receipt,
structural session or silent downgrade. Revalidate receipt and camera after point
capture to reject reentrant mutation; immutable history is not a live health check.

Both modes call shared composition -> createViewportMapping2D ->
projectPointToViewport2D -> optional viewportPointToScreen2D. Exact camera source
project/space/unit/axes must match input point; unknown mismatching labels reject.
Matching declarations are not a registry existence lookup. Viewport is same-project
right/down CSS px. No DPR is applied to CSS math. Optional screen plane/origin/scale
must be explicit; no canvas position/global measurement inference. Offviewport
points remain projectable, no clamp/visibility/culling/picking. No general Vector3,
perspective or arbitrary-depth inverse. Unsupported camera kind rejects at existing
camera configuration admission. TypeError for invalid data/state; finite arithmetic
overflow retains RangeError; unknown host exceptions propagate.

Reads do not change camera/session/authoring/gameplay/depth/resource state; host
proxy side effects are outside that guarantee. No acquisition, lease expiry,
invalidation/scheduling, buffer resize or native-camera application. No required
DTO member/union change, compiler/package/lock/workflow change, new project,
dependency direction or ownership transfer. Exactly five projects. Installed pins
confirmed Three0.186.1, @types/three0.186.0, TypeScript6.0.3. L1 Core2.0.0 revision
`04b7239f998c3c688a0dfa3202f11811a9acd775`, L2 Gameplay0.15.2 revision
`acea332aa80f67552192a72b30f81c0bbbfc56bd` unchanged/read-only.

## EXPECTED / OBSERVED / NOT_OBSERVED

[Exact manual compile and procedure](../../runtime-render/manual/camera-projection.md).
Executed strict manual compile (exit0), then `node .artifacts/camera-projection-owner.mjs`
(exit0). Temporary ignored driver imports the compiled consumer and actual Editor
public root only. It opens a real new unsaved in-memory Scene Document, reads owner
state before/after and discards afterward; no storage/native acceptance claimed.

| Scenario | EXPECTED | OBSERVED |
| --- | --- | --- |
| center100,50; CSS800x450; scale2; zoom1 |400,225|400,225|
| world110,50 |420,225|420,225|
| world100,60; right/down source |400,245|400,245|
| world100,60; right/up source |400,205|400,205|
| world1000,50 outside viewport |2200,225; no clamp|2200,225|
| center moved105,50; world100,50 |390,225|390,225|
| explicit screen origin20,30; scale1 |410,255|410,255|
| no screen mapping |null|null|
| zoom2 after center105,50; world110,50 |420,225|420,225|
| numeric samples above |absolute tolerance1e-12|absolute x/y error0|
| B after A center changes |unchanged B view/center projection|same view true;400,225|
| historical result after A center/zoom |old center/point retained|100,50 /400,225; frozen result/mapping/metrics/point true|
| width0,-1,Infinity,NaN |TypeError|TypeError; camera view unchanged true|
| zoom0,-1,Infinity,NaN |TypeError|TypeError; camera view unchanged true|
| unknown point space, other project, wrong unit, up-vs-down axes |TypeError|source plane/unit/axes mismatch; camera unchanged true|
| device-pixel logical viewport |TypeError|same-project CSS context error; camera unchanged true|
| finite Number.MAX_VALUE world X at effective scale4 |RangeError|nonfinite planar arithmetic; camera unchanged true|
| perspective configuration |TypeError|only orthographic supported; A unchanged true|
| foreign `{}` accepted session |TypeError; never fallback|expected graphics handle error; camera unchanged true|
| disposed camera |TypeError|Camera is disposed; terminal snapshot unchanged true|
| real authored placement / Document before-after |unchanged through camera changes|ground100,50; currentRevision1; savedRevision null; dirty true both times|

Native current accepted-session projection, real A/B session isolation after
resize/end, copied/stale receipts, hidden/suspended native viewport, DPR/buffer
acceptance: **NOT_OBSERVED** here. Optional public-root native walkthrough compiles
and reuses v0.9.5 acquisition/receipt runbook; no fake context substituted.
Browser/WebGL/frame/pixels/GPU camera application: **NOT_OBSERVED / NOT_EXECUTED**.
No live Scene/gameplay consumer is involved, so visual instance/gameplay positions
and depth before-after are NOT_OBSERVED; authored evidence is in-memory only.
Resource expiry is inapplicable: this operation accepts no resource/lease. Future
integration must still honor Phase7 resource and Phase8 Scene owners.

## Actual gates / handoff

All commands below completed exit0. Static/build gates repeat at committed HEAD
before push; completed current-SHA CI links are recorded in PR after completion.

| Gate | Actual result |
| --- | --- |
| `node harness/cli.mjs check` |ARCH_CHECK_PASS;145 JS/TS sources|
| `node harness/cli.mjs scope --projects runtime-render --allow-infra` |SCOPE_PASS; eleven intended files; unrelated .mcp.json excluded|
| `node harness/cli.mjs verify --projects runtime-render --with-consumers` |genuine Render/Editor/Client BUILD_PASS|
| `npm run build -- --force` |forced five-project workspace BUILD_PASS|
| Strict emitted Render/Editor/Client roots + seventeen manual consumers |exit0; NodeNext, ES2022-only, empty typeRoots, strict/noUncheckedIndexedAccess/exactOptionalPropertyTypes/verbatimModuleSyntax/skipLibCheck false|
| New manual compile + Node public-root numeric/owner observations |exit0; actual observations above|
| Exact baseline/current declaration audit |two Render additions; zero existing removals/changes|
| `git diff --check` / protected scope inspection |exit0; Render/Harness only|

No failed/unconfigured build. Existing Windows Harness DEP0190 is a warning. No
tests/suites/runners/assertion matrices/coverage/new CI jobs or historic exhaustive
suite execution. Static/build success is not functional/visual acceptance.

Rejected alternatives: duplicated projection in Editor/Client, test/mock renderer,
implicit screen offset, structural native receipts, silently treating invalid
accepted context as logical-only, DPR multiplication into CSS, new math DTO,
authored/visual/gameplay movement, culling/picking/perspective in this checkpoint.
Rollback removes the two new roots/operation/manual/docs/pointers and inlines the
shared owner-local mapping composition; no migration or native cleanup needed.
No blocking dependency for the authorized delta. Ready for the next **supplied
v0.9.7** after fresh preflight; native/visual integration remains open. No unsupplied
task, merge, tag, release, publication or phase acceptance performed.
