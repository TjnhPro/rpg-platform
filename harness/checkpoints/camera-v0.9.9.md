# v0.9.9 — CM15 Camera Bounds & Safe Transitions

**READY_FOR_NEXT_CHECKPOINT** for supplied CPU bounds/transition scope.
Integrated Camera remains **FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED**;
browser NOT_EXECUTED. Developer alone accepts the product/phase.

## Fresh preflight / ownership / plan

Previous HEAD/local/fetched upstream all
`ff73c88f8aefb9c82ccfc75567d8cd35f2081559` (v0.9.8).
Branch `feat/camera-projection-v0.9`; main/merge-base
`e4464ac8e1c84a1c872f8e7a722885942a268a28`; same OPEN draft
[PR #9](https://github.com/TjnhPro/rpg-platform/pull/9), base main, matching head.
Tracked baseline clean, no drift. Preexisting untracked `.mcp.json` untouched,
excluded from commit. Previous-head CI verified completed SUCCESS:
[push39974063581](https://github.com/TjnhPro/rpg-platform/actions/runs/39974063581),
[PR39974072822](https://github.com/TjnhPro/rpg-platform/actions/runs/39974072822).
The containing commit is this checkpoint HEAD; exact delivery SHA/current-head CI
are recorded on PR after push. Previous CI is not current checkpoint evidence.

Read root AGENTS/ARCHITECTURE/FOUNDATION, Harness CONTRACTS/OWNERSHIP/WORKFLOW/
VERIFICATION/FAILURES, Render and relevant Editor/Client AGENTS, previous checkpoint.
Inspected current camera/config/zoom/pan/atomic commit, projection context and
viewport adapter, Phase4 affine/plane/inverse, Phase6 frame/size/private backend
seams, existing Phase7/8 root capabilities, Editor alignment/projection/viewport
adapters and actual Client continuous/scene hosts. Phase7 resources/cache and
Phase8 Scene APIs exist, contrary to the task's historical authorship note; this
CPU transition consumes neither, so no missing upstream prerequisite/bypass.

Canonical owner **runtime-render**. Harness records evidence; Editor/Client are
compatibility build consumers only. No Engine/Server/L1/L2 usage/edit. Route
camera bounds/safe transitions yielded Render hint only. Additive contracts are
pre-authorized by this supplied Phase9 task; no breaking/owner transfer approval
needed. No new project, map schema or dependency.

Pre-implementation plan: optional PER REQUEST bounds policy, center or pan intent
and target zoom, whole-view extent at current logical viewport via canonical
inverse; clamp/reject and oversized reject/center explicit. Atomic center+zoom
compare-and-commit on current issued view with Phase6 receipt recheck. Preserve
legacy unrestricted methods and no-op/revision behavior; no resize subscription,
silent teleport or background oscillation. Finite public-root proof, declaration
audit, actual affected/consumer/workspace builds, static/scope, one commit/push/CI.

Eleven intended files:

- `runtime-render/src/camera-bounds.ts`: canonical policy/admission/full extent.
- `runtime-render/src/camera.ts`: owner-local compare-and-commit on existing state
  seam; share legacy pan capture/translation, preserving behavior.
- `runtime-render/src/index.ts`: five additive names.
- `runtime-render/manual/camera-bounds.mts` and `.md`: finite logs/runbook.
- `runtime-render/docs/camera-v0.9.9.md`, `docs/tasks/camera-v0.9.9.md`: contract
  and supplied task (trailing whitespace normalized).
- `runtime-render/AGENTS.md`, `harness/CONTRACTS.md`, `harness/OWNERSHIP.md`:
  minimal contract/ownership pointers.
- This report. No old checkpoint rewrite.

## Contract / compatibility / failure and resize policy

Five new root names: `transitionRenderCameraWithinBounds`,
`RenderCameraBoundsPolicy`, `RenderCameraBoundsMovement`,
`RenderCameraBoundsTransitionInput`, `RenderCameraBoundsTransitionResult`.
Existing old root signatures/required DTOs/closed unions unchanged.
Exact emitted declaration audit vs previous SHA: Render221->226, Editor138->138,
Client0->0; additions5, removed0/changed0. Strict actual emitted roots and twenty
portable old/new consumers compile ES2022-only/no DOM, skipLibCheck false.
Declaration equality does not prove universal runtime/semantic compatibility.

Input requires current issued cameraView, movement center(scoped target) or
pan(scoped delta), absolute target zoom and explicit bounds. Bounds disabled is
valid; rectangle declares exact source plane/project/unit/axes and finite min<max.
This is camera presentation intent, not authored map dimensions/collider/pathfinding.
For CM14 the camera source may be presentation-space: rectangular containment
does not prove arbitrary oblique ground polygon/elevated sprite containment.

Zero-centered mapping at TARGET zoom/current viewport CSS dimensions -> canonical
viewportPointToPlane2D opposite corners -> visible offsets and span -> feasible
center intervals. Axis-aligned mapping means two opposite corners define full
extent, including independent scales/axis directions/aspect. Final candidate
mapping is inversely inspected before commit; every nonoversized axis must contain
the whole view, not only its center. No implicit DPR or alternate projection engine.

Movement clamp projects center into feasible intervals; reject returns typed
`CENTER_OUTSIDE_BOUNDS`. Any oversized axis with oversized reject returns
`VIEW_EXCEEDS_BOUNDS`, precedence over center rejection. Oversized center uses
map midpoint only on oversized axes, reports `oversized-centered`, permits
overscroll; other axes retain selected movement policy. Never claims impossible
strict containment. Output updated/unchanged/rejected, reason, containment,
before/view, requestedCenter, target visibleSpan, captured metrics/policy and
nullable PRE-transition admittedViewport. That evidence never means new GPU state.

Policy is not stored on camera: existing update/pan/center/zoom/focus remain
unrestricted, may leave prior bounds. All bounded intentions must use adapter.
Resize alone never mutates camera. Fresh request after resize/zoom recomputes
extent; rejection retains prior center AND zoom even when old view no longer fits.
Explicit clamping/centering only on request. Repeat same clamped/centered intent
preserves identity/revision; changed center+zoom publish together, one view revision.

Null accepted context means logical-only validated CPU measurements. Non-null
requires actual current ready Phase6 session/latest issued resize receipt and exact
CSS dimensions; invalid native context never falls back. View identity (including
zoom-only changes), context and receipt rechecked after host capture before policy
rejection/atomic commit. Stale/copied/foreign requests reject. Raw rectangle has
no authored revision registry; host owns fresh bounds/measurements and matching
labels are declarations, not map freshness attestation. Host proxy side effects
are not rolled back, but this operation never commits over newer/terminal state.

Invalid data/state/unit/plane/policy TypeError; zoom-limit/numeric/span/interval/
canonical inverse/final containment limits RangeError. Domain policy rejection is
typed result, no partial state. No clamp fallback for arithmetic failure. Existing
Phase4 inverse cutoff/residual policy remains; binary64 limits may conservatively
reject mathematically feasible extremes. No universal exactness guarantee.

Exactly five projects/unchanged ownership and dependency graph; no renderer,
camera manager, map manager, game schema, streaming, fog, smoothing, selection,
follow or animation. No Scene/Document/instance/anchor/depth/resource/gameplay writes.
Lock verified Three0.186.1, @types/three0.186.0, TypeScript6.0.3. External read-only
Core2.0.0 `04b7239f998c3c688a0dfa3202f11811a9acd775`, Gameplay0.15.2
`acea332aa80f67552192a72b30f81c0bbbfc56bd` unchanged.

## Actual commands and observations

| Command | Observed exit/result |
| --- | --- |
| `node harness/cli.mjs check` | 0; ARCH_CHECK_PASS151 JS/TS sources |
| `node harness/cli.mjs scope --projects runtime-render --allow-infra` | 0; SCOPE_PASS12 paths, including unrelated .mcp.json |
| `node harness/cli.mjs verify --projects runtime-render --with-consumers` | 0; genuine Render/Editor/Client BUILD_PASS |
| `npm run build -- --force` | 0; all five projects |
| strict actual emitted roots +20 portable consumers, ES2022/no DOM | 0 |
| strict emit manual camera-bounds.mts, then Node public-root owner observer | 0 |
| local emitted declaration inventory against previous SHA | 0;5 added/0 removed/0 changed |
| `git diff --check` | 0; whitespace clean |

No unconfigured/failed build. Existing Windows Harness Node DEP0190 warning does
not change exit0. No tests/assertions/runners/coverage/new CI jobs/browser run.
Local observer/declaration drivers/build outputs remain ignored, no artifacts
or local `.mcp.json` committed.

**EXPECTED:** bounds0,0..1000,600, viewport200x100/scale2/zoom1 ->span100x50.
Pan1000,-1000 from500,300 clamps950,25, actual view900,0..1000,50. Reject outside
preserves center/zoom; target zoom2 clamp975,300/span50,25, one revision.
Oversized strict rejects; explicit midpoint centering deterministic and repeat no-op.
Unbounded camera still pans outside map; stale/mismatched requests reject.

**OBSERVED:** actual public-root Node logs matched those numbers exactly (sample
absolute tolerance1e-12; no difference observed). Canonical selected-plane inverse
confirmed actual viewport corners900,0 and1000,50. Outside reject preserved
950,25/zoom1 despite requested zoom2. Clamp changed center+zoom once; repeat same
edge unchanged. Target zoom0.05 span2000x1000 rejected preserving zoom2. Tiny80x30
center policy40,15, repeat unchanged; oversized-x-only40,25. Logical width4000
strict rejected without teleport; explicit midpoint500,300/span2000x50 reported
oversized-centered. Disabled moved2000,-2000; legacy pan then2500,-2500. Left/up
axes with scale2x4 produced950,12.5/span100x25. B view identity stayed unchanged.
Sample result/view/metrics/policy/span frozen.

Stale zoom request, copied/other-camera view, mismatched bounds plane/project/unit/
axes, inverted/nonfinite bounds, invalid zoom0 and width0/-1/Infinity, foreign
accepted session, disposed camera: TypeError, sampled A exact view unchanged.
Real Editor public-root authored placement4,2 and local Document currentRevision1,
savedRevision null/isDirty true before/after unchanged (new unsaved document).
No fake storage/gameplay observation. Full setup in manual runbook.

**NOT_OBSERVED:** browser/WebGL/GPU pixels, native ready session/current receipt
and stale native resize paths, native A/B isolation, actual DPR/resize/recovery,
live Scene/texture/frame application, gameplay positions or saved persistence.
Expired resource is inapplicable because this operation consumes no lease/texture.
Foreign-context rejection is not native integration proof. Builds/static scan
do not constitute full architecture or functional/visual acceptance.

## Handoff / open limits

No source blocker for supplied scope. [Contract](../../runtime-render/docs/camera-v0.9.9.md),
[manual](../../runtime-render/manual/camera-bounds.md). Rollback by reverting this
checkpoint, never rewriting prior accepted evidence. v0.9.10 may proceed only when
its task is supplied with fresh preflight. No next checkpoint implementation,
merge/tag/release/publish/phase acceptance in this delivery.
