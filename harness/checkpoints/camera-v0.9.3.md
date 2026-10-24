# v0.9.3 — CM06 Camera Pan & Center Operations

**READY_FOR_NEXT_CHECKPOINT** for the supplied CPU state scope. Actual public-root
CPU observations below; integrated camera remains **FEATURE_NOT_VERIFIED /
VISUAL_NOT_VERIFIED**. Browser NOT_EXECUTED. Developer acceptance remains pending.

## Exact preflight and contract plan

Previous v0.9.2 HEAD/fetched upstream: `3428d70aeb90e1f38578aa6e40070f4db26b29f2`.
Main/merge-base: `e4464ac8e1c84a1c872f8e7a722885942a268a28` (Phase8 merged).
Branch `feat/camera-projection-v0.9`; one OPEN draft [PR #9](https://github.com/TjnhPro/rpg-platform/pull/9)
against main, with input headSha matching local/upstream. Prior exact-head CI SUCCESS:
[push](https://github.com/TjnhPro/rpg-platform/actions/runs/39963311957),
[PR](https://github.com/TjnhPro/rpg-platform/actions/runs/39963320375).
The commit containing this report identifies this checkpoint's HEAD; its exact SHA
and completed matching CI links are recorded in PR after push. No self-referential
commit hash or claim that previous CI verifies new code.

Tracked baseline clean. Preexisting unrelated untracked `.mcp.json` untouched and
excluded. Read root/Render/relevant Editor/Client guidance, Architecture/Foundation,
Harness contracts/ownership/workflow/verification/failures, prior checkpoint, actual
source/public declarations. Confirmed real Phase4 math, Phase6 viewport/frame,
Phase7 provider/load/PNG/atlas/texture/cache and Phase8 Scene/instance/frame APIs.
Task-authorship note about absent Phase7/8 is stale. New work needs CPU math/state;
it does not require acquiring a graphics session or resource.

Requested behavior: absolute source-plane set-center and relative planar pan.
Canonical primary owner **runtime-render**; route `camera pan and center` gave
Render hint, confirmed by source roles. Harness records evidence; Editor/Client
remain compatibility consumers only. No Engine/Server/L1/L2 API needed.
Additive contracts are explicitly pre-approved by this supplied task. No breaking
signature, exhaustive union, dependency/owner transfer or architecture ambiguity.

Pre-edit plan: standalone operations + readonly pan request, issued-handle private
capability, shared immutable commit seam. Reuse Phase4 exact plane admission and
affine translation. Preserve original structural RenderCamera interface rather
than add required methods. Source mismatch/nonfinite/disposed input => TypeError;
overflow/absorbed delta/revision exhaustion => RangeError; host exceptions propagate.
No clamp, session acquisition/release, callback, GPU binding, frame request or RAF.
Manual root proof includes independent A/B and real authored document readback.
Expected gates: static check/scope, Render with consumers, strict ES2022 public
roots/manual consumers, workspace build, scoped commit/push and existing exact-head CI.

## Owned delta and compatibility

Eleven intended files, Render plus minimal Harness:

- `runtime-render/src/camera.ts`: issued-handle set-center/pan and central commit seam.
- `runtime-render/src/plane-projection.ts`: extract existing source-plane admission
  for owner-local reuse, preserving projection operation order/meaning.
- `runtime-render/src/index.ts`: three new root names.
- `runtime-render/manual/camera-pan.mts` and `.md`: finite logging consumer/runbook.
- `runtime-render/docs/camera-v0.9.3.md` and `docs/tasks/camera-v0.9.3.md`: contract
  and supplied task (trailing whitespace normalized).
- `runtime-render/AGENTS.md`, `harness/CONTRACTS.md`, `harness/OWNERSHIP.md`: invariants/pointers.
- This checkpoint report.

New names: `setRenderCameraCenter`, `panRenderCamera`, `RenderCameraPan`.
Set uses existing `PlaneProjectionPoint2D`; pan requires `{plane, delta}`. Same exact
project/space/unit/axes as camera source. Delta is scene axes/units, never DOM pixels
or zoom-scaled. Phase4 affine operation performs the translation. Private WeakMap
admits exact issued handles; no global active camera or textual-ID lookup.

Exact previous/current TypeScript declaration audit: Render194 ->197, Editor138
->138, Client0 ->0; **zero removed/changed existing root declarations**. Existing
camera handle/lifecycle/update/snapshot, configuration, Phase4/6/7/8 public signatures
and closed unions remain unchanged. Owner-local extracted helper is not root API.
No Editor/Client source or alternate math; no dependency, lockfile, compiler,
workflow, backend, native type, authored schema, gameplay or Server change.
Exactly five projects. Three0.186.1 / @types/three0.186.0 / TypeScript6.0.3 unchanged.
Core2.0.0 pin `04b7239f998c3c688a0dfa3202f11811a9acd775` and Gameplay0.15.2 pin
`acea332aa80f67552192a72b30f81c0bbbfc56bd` unchanged/read-only.

All center mutations share private `commitCenter`; future live binding integrates
canonical invalidation after a changed commit there. No fake invalidation callback
or no-op session introduced. Still `unbound` / `not-applied`. Config scale/zoom is a
separate pure value; no early binding or projection/zoom/drag/follow implementation.

## EXPECTED / OBSERVED — finite public-root manual execution

[Runbook](../../runtime-render/manual/camera-pan.md) gives exact strict compilation
and Node execution commands. Both exited0. Its owner callback imports actual Editor
root factories to create Scene membership and a new unsaved in-memory Document;
Render manual imports only Render root. No fabricated storage evidence or GPU.
No assertions, automated test suite, assertion matrix, runner or new CI job.

Source camera-manual/ground/world-unit, right/down. Absolute tolerance1e-12 for
this finite reverse example only; no universal roundtrip accuracy claim.

| EXPECTED | OBSERVED |
| --- | --- |
| A100,50 +5,0 | center105,50 / revision1 |
| Reverse -5,0 | center100,50 / revision2; absolute errors x0/y0 within1e-12 |
| Immutable history / stable identity | history100,50/revision0; sameIdentity true; four frozen flags true |
| Absolute set20,30 | center20,30 / revision3 |
| Identical set / zero pan | both same snapshot reference, no revision increment |
| Wrong project, unknown/different space, unit, axes | TypeError: Projection source plane, unit or axes mismatch; statePreserved true |
| Infinity delta or absolute center | TypeError: Projection components must be finite numbers; statePreserved true |
| Nonzero x delta MIN_VALUE at x20, with y delta1 | RangeError: Camera pan component was absorbed by binary64 rounding; neither component committed |
| Extra zoom0/width0 fields on pan | TypeError: Camera input must be an exact plain data record; statePreserved true |
| MAX_VALUE center + MAX_VALUE delta | RangeError from canonical affine operation; statePreserved true |
| Camera B independent | sameSnapshot true, center8,9/revision0 throughout |
| Authored owner unchanged | placement ground7,11 before/after; Document content unchanged, revision1/savedRevision null/isDirty true before/after |
| Both operations after dispose | TypeError: Camera is disposed; statePreserved true |

These are CPU observations through installed package roots. Document is intentionally
new/unsaved; dirty true is its original state, not a save claim. No gameplay object
or position is created. The preserved authored object is actual Editor-owned data,
not a dummy rendered geometry or fake engine.

## NOT_OBSERVED, failure policy and handoff

Live VisualInstance/graphics session state comparison, native camera application,
invalidation/submission, screen pixels, DPR/resize/projection application, browser
and gameplay positions remain NOT_OBSERVED. Phase8 source exists, but no genuine
live host is acquired by this CPU walkthrough; no fake session/lease is substituted.
Manual callback can later read genuine host-owned instance state. Session occupancy,
applied camera A/B and actual frames are not proven by CPU handle independence.

Dimensions and zoom are not operation inputs. Extra fields reject; existing viewport
and config constructors keep their own validators. An unknown plane differing from
the source rejects; well-formed source labels are declarations, not a world registry
existence claim. No resource lease is consumed, so expired-resource rejection is
inapplicable. Bounds/clamping, follow, smoothing, inertia, drag, render loop and
automatic pixel conversion remain unsupported. Representable subnormal results are
allowed; absorbed nonzero components reject, partial binary64 rounding still exists.

Rejected alternatives: widening old required handle methods, duplicate plane checks
or projection math, consumer-side pan implementation, early binding/RAF, clamp,
gameplay/world/instance mutation, fake native resources and implicit zoom/pixel units.
Unknown host errors propagate; failed candidates do not commit. Host code can itself
reenter during capture; disposal is rechecked and pan uses latest captured state.

## Actual gates

Preparation commands all exit0; required static/build gates repeated at committed
HEAD before push. Matching remote CI is reported in PR only after completion.

| Command / inspection | Actual result |
| --- | --- |
| `node harness/cli.mjs check` | ARCH_CHECK_PASS,138 JS/TS sources |
| `node harness/cli.mjs scope --projects runtime-render --allow-infra` | SCOPE_PASS; intended Render/Harness delta, preexisting .mcp.json untouched/excluded |
| `node harness/cli.mjs verify --projects runtime-render --with-consumers` | independent Render/Editor/Client BUILD_PASS |
| `npm run build -- --force` | forced five-project workspace build, exit0 |
| Strict actual emitted three roots + fourteen manual consumers | exit0; ES2022-only/no DOM, skipLibCheck false |
| New manual compile + owner Node execution | exit0; readbacks above |
| Exact baseline/current declaration audit | Render+3; Editor/Client+0; removed0/changed0 |
| `git diff --check` / protected scope | exit0; only intended eleven files committed |

Strict flags: NodeNext/ES2022, strict/noUncheckedIndexedAccess/exactOptionalPropertyTypes/
verbatimModuleSyntax, skipLibCheck false, lib ES2022, empty typeRoots. Previous thirteen
manual consumers plus new pan consumer and emitted roots compiled; no historical
automated suites run. No failed or unconfigured build remains. Existing Windows
Harness DEP0190 warning remains a warning, not a feature or security verification.

Rollback removes three additive exports/operations, restores the owner-local capture
extraction and pointers; no persisted migration or native cleanup. No prerequisite
or breaking-contract blocker established. Ready for next **supplied v0.9.4** after
fresh preflight. No unsupplied checkpoint, phase acceptance, merge, tag, release or
publication authorized by this checkpoint.
