# v0.9.7 — CM13 Camera Screen-to-Selected-Plane Inverse

**READY_FOR_NEXT_CHECKPOINT** for this supplied additive inverse scope.
Integrated Camera: **FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED**. Browser
NOT_EXECUTED. Numeric CPU observations below do not establish native/visual
acceptance; Developer owns product acceptance. Only supplied v0.9.7 implemented.

## Preflight / plan / scope

Exact v0.9.6 baseline HEAD/local/fetched phase upstream:
`98ce6d2ed6a4216c17385896a4dc9f0266a9c5d0`.
Main/merge-base `e4464ac8e1c84a1c872f8e7a722885942a268a28`.
Branch `feat/camera-projection-v0.9`; same OPEN draft
[PR #9](https://github.com/TjnhPro/rpg-platform/pull/9), base main, matching headSha.
No base drift; tracked baseline clean. Preexisting untracked `.mcp.json` remains
untouched/excluded. Prior exact-head CI verified SUCCESS:
[push39970827781](https://github.com/TjnhPro/rpg-platform/actions/runs/39970827781),
[PR39970835170](https://github.com/TjnhPro/rpg-platform/actions/runs/39970835170).
The commit containing this report is this checkpoint HEAD; exact SHA and completed
matching current CI are recorded in PR after push. Prior CI is not current evidence.

Read root AGENTS/ARCHITECTURE/FOUNDATION, Harness contracts/ownership/workflow/
verification/failures, Render/relevant Editor/Client instructions and v0.9.6 report.
Inspected current camera/view/config/forward/viewport, Phase4 projection/affine/
inverse implementation, Phase6 frame/receipt/size/private backend and Phase7/8
public source seams, Editor adapters and Client host. Real Phase7 loading/cache/
texture and Phase8 live Scene APIs exist; task's historical absence note is stale.
This CPU operation consumes no lease/live instance, so no missing upstream capability
or expiry path is needed for this version. No fake backend/context introduced.

Canonical owner: **runtime-render**. Required collaborators: Harness evidence only;
Editor/Client compile compatibility, zero production edits. Route `camera screen
to selected plane inverse` gave Render hint only. No Engine/Server/L1/L2 API use.
Task authorizes additive Phase9 contracts without per-version approval pause.

Pre-implementation plan: two explicit selected-plane routes plus input/result
types; share forward context admission, require current issued camera view and
selected source plane, delegate all inverse math to Phase4. Preserve Phase6 receipt
freshness in accepted context, explicit CPU null otherwise, no fallback. Preserve
cutoff/residual limits and immutable observations; no height/picking/state writes.
Finite public-root manual numeric/negative/ownership evidence, strict emitted root
and old/new consumer compilation, static/scope/build gates, one commit/push and CI.

Eleven intended Render/Harness files:

- `runtime-render/src/camera-inverse.ts`: two inverse routes and two interfaces.
- `runtime-render/src/camera-projection.ts`: owner-local shared context admission
  and final freshness guard; existing forward public behavior/signature unchanged.
- `runtime-render/src/index.ts`: four additive names.
- `runtime-render/manual/camera-inverse.mts` and `.md`: finite logs/native runbook.
- `runtime-render/docs/camera-v0.9.7.md` and `docs/tasks/camera-v0.9.7.md`:
  contract and supplied task (trailing whitespace normalized).
- `runtime-render/AGENTS.md`, `harness/CONTRACTS.md`, `harness/OWNERSHIP.md`:
  minimal owner/contract pointers.
- This checkpoint report.

## Public compatibility / numeric and freshness policy

New names: `viewportToRenderCameraSelectedPlane`,
`screenToRenderCameraSelectedPlane`, `RenderCameraSelectedPlaneInput`,
`RenderCameraSelectedPlaneResult`. Functions take issued camera, current logical
ViewportMetrics2D, `{cameraView, selectedPlane, point}`, and required
`{session, receipt} | null`. Result: `{camera, mapping, selectedPlanePoint,
acceptedViewport}`. Exact emitted declaration audit: Render208 ->212,
Editor138 ->138, Client0 ->0; four additions, removed0/changed0 existing roots.
Strict actual emitted roots plus eighteen finite consumers compile ES2022/no DOM.
Declaration equality does not establish universal semantic/runtime compatibility.

Camera view must be the exact current issued observation, rejecting copy, other
camera and old zoom-only/center revisions. Source selection exactly matches camera
project/space/unit/axes through canonical source admission. Viewport/screen point
must match its corresponding declared pixel plane; no identity fallback. Matching
labels declare context, not registry membership. Logical-only null validates current
host-declared metrics but cannot attest measurement time or detect host-stale geometry.
Accepted context requires actual active/ready same session/current issued resize
receipt and exact requested CSS dimensions under v0.9.5; receipt identity is its
viewport freshness token, including equal-buffer resizes. No new revision counter.
Recheck camera/receipt after host capture; no invalid accepted-to-CPU fallback.

Viewport route calls viewportPointToPlane2D; screen route first calls
screenPointToViewport2D, then the same inverse. No duplicated formula/math DTO.
Screen needs explicit origin/scale/plane; absent screen does not disable viewport
route. No DPR multiplication, clamping, visibility, native camera/frame application.
Phase4 remains untouched: positive finite ratios; normalized min/max ratio <=1e-12
or nonfinite/zero reciprocal rejects RangeError; zero scale rejects TypeError at
configuration admission. Each inverse stage checks forward destination residual
<=1e-9*max(1,abs(input component)); no overall source recovery guarantee. Binary64
cancellation/underflow remain possible even for accepted residual. Sample tolerance
1e-12 is evidence for logged points only. Finite arithmetic/residual limits retain
RangeError; invalid context/data TypeError; unknown host exceptions propagate.

Selected 2D plane is explicit; viewport location can later describe a 3D ray/family
of elevated points. No arbitrary world height, z, terrain intersection, physics,
picking/raycast or inference from screen Y. No authored/gameplay/visual transform/
depth/resource/Document mutation; host proxy side effects are outside that guarantee.

Exactly five projects; no dependency/owner/schema/compiler/package/lock/workflow
change. Lockfile verified Three0.186.1, @types/three0.186.0, TypeScript6.0.3. External
pins unchanged: Core2.0.0 `04b7239f998c3c688a0dfa3202f11811a9acd775`,
Gameplay0.15.2 `acea332aa80f67552192a72b30f81c0bbbfc56bd`, read-only.

## EXPECTED / OBSERVED / NOT_OBSERVED

[Exact manual compile/procedure](../../runtime-render/manual/camera-inverse.md).
Strict new consumer compile exit0, then `node .artifacts/camera-inverse-owner.mjs`
exit0. Ignored temporary driver imports compiled consumer plus actual Editor root
for a real new unsaved in-memory Scene Document; no storage/live/gameplay attestation.

| Scenario | EXPECTED | OBSERVED |
| --- | --- | --- |
|110,60 -> viewport -> selected source;800x450/center100,50/scale2/zoom1|420,245 ->110,60|exact expected points|
|screen origin20,30/scale2|860,520 ->110,60|exact expected points|
|screen absent|viewport available, screen TypeError|viewport roundtrip succeeds; explicit screen geometry error|
|offviewport1000,-500|2200,-875 ->1000,-500 unclamped|exact expected points|
|right/up source110,60|420,205 ->110,60|exact expected points|
|center105,50/zoom2;110,60|420,265 ->110,60|exact expected points|
|all roundtrip samples|absolute error <=1e-12|x/y error0; frozen result/mapping/point true|
|unknown source space/other project/unit/axes, wrong input viewport plane|TypeError|plane/unit/axes mismatch; A unchanged true|
|other-camera/copied/stale view after zoom-only update|TypeError|current issued view error; A unchanged true|
|B after A zoom|same B view and inverse|sameView true;110,60|
|width0,-1,Infinity; nonfinite point; zoom0|TypeError|TypeError; A unchanged true|
|zero ratio configuration|TypeError|finite positive scale error; A unchanged true|
|ratio x2e-12/y2 exactly cutoff1e-12|RangeError|numerically non-invertible; A unchanged true|
|centerX1e20 with viewport420,245|destination residual RangeError|inverse exceeds destination roundtrip tolerance; A unchanged true|
|foreign accepted `{}` session|TypeError, no CPU fallback|expected graphics handle error; A unchanged true|
|disposed camera|TypeError|Camera is disposed; terminal observation unchanged true|
|authored Scene/Document before-after|placement/revision/dirty unchanged|ground100,50; currentRevision1, savedRevision null, dirty true both times|

Actual native accepted-context inverse/resize freshness, copied/stale/foreign
issued receipts, hidden/suspended/ended native sessions and A/B native session
isolation: **NOT_OBSERVED**. Optional public-root native procedure compiles but was
not executed. Native DPR/buffer, Browser/WebGL/frame/pixel/GPU camera behavior:
**NOT_OBSERVED / NOT_EXECUTED**. No live Scene/gameplay consumer involved; instance
transforms/depth and gameplay position before-after NOT_OBSERVED/inapplicable.
Resource expiry inapplicable because no resource lease is consumed.

## Gates / handoff

All listed preparation commands completed exit0; required static/build gates repeat
at committed HEAD before push. Current completed exact-SHA CI links recorded in PR.

| Command / gate | Actual result |
| --- | --- |
|`node harness/cli.mjs check`|ARCH_CHECK_PASS;147 JS/TS sources|
|`node harness/cli.mjs scope --projects runtime-render --allow-infra`|SCOPE_PASS; eleven intended files, unrelated .mcp.json excluded|
|`node harness/cli.mjs verify --projects runtime-render --with-consumers`|genuine Render/Editor/Client BUILD_PASS|
|`npm run build -- --force`|forced five-project workspace BUILD_PASS|
|strict emitted roots + eighteen finite manual consumers|exit0; NodeNext ES2022-only, empty typeRoots, strict/noUncheckedIndexedAccess/exactOptionalPropertyTypes/verbatimModuleSyntax/skipLibCheck false|
|new manual compile / public-root Node observations|exit0; observations above|
|exact emitted declaration audit against v0.9.6|four additions; zero existing removed/changed|
|`git diff --check` / intended scope inspection|exit0; Render/Harness only|

No failed/unconfigured build; existing Windows Harness DEP0190 warning remains.
No tests, suites, assertion matrices, runners, coverage, new CI jobs or historic
exhaustive suite execution. Build/static success does not establish feature/visual
acceptance. Rejected alternatives: copied inverse math, blind numeric revision
equality, implicit screen origin, fake accepted receipts, stale native-to-CPU
fallback, source-accuracy guarantees, height/picking or gameplay mutation.
Rollback removes four roots/new inverse/manual/docs/pointers and inlines unchanged
forward context admission; no migration/resource cleanup needed. No scoped blocker.
Next **supplied v0.9.8** requires fresh preflight; no unsupplied task, merge, phase
acceptance, tag, release or publication performed.
