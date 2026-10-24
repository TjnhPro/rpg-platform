# v0.10.2 SA03 — frame timing and loop contracts

**IMPLEMENTED_PURE_TIMING / FINITE_MANUAL_OBSERVATIONS / VISUAL_NOT_VERIFIED.**
No live playback or Phase10 MVP acceptance is claimed.

## Delta preflight

Previous checkpoint/HEAD/upstream: `00b3fd31c02c498cdd86ba72996a704fe5948401`.
Main: `78dc4a9d14288df33ca46b3af4d23d09ceef9b82`. Same Phase10 branch
`feat/sprite-directional-animation-v0.10`, same open Draft
[PR10](https://github.com/TjnhPro/rpg-platform/pull/10). Containing commit's full
SHA and completed exact-head CI are recorded in the PR ledger after push.
Tracked tree/index initially clean; preexisting untracked `.mcp.json` excluded.

Delta-focused preflight revisited root/project guidance, architecture, Harness
ownership/contracts/workflow/verification/failures, SA01 timing/switch proposal,
SA02 source/checkpoint and emitted sprite-frame-sequence.d.ts; inspected actual
Render root. Route hints Render and source confirms **runtime-render** as primary
owner. Editor/Client are public-root compilation consumers only; no source edits.
No L1/L2 API required or modified. Phase7/8/9 source remains available at the
baseline; task's historic missing-source note is not current dependency evidence.

Authorized scope: one sprite-animation-timing.ts module, root exports, task/API
documentation, checkpoint and Render/Harness guidance. No old signature/union,
dependency, package/lock, build/CI config, owner graph or foundation change.
No live playhead, timer, gameplay/Scene mutation, direction mapping or GPU path.

## Actual public delta and policy

Nine additive exports: SpriteAnimationTimingInput, SpriteAnimationTiming,
SpriteAnimationRepeat, SpriteTimedClipInput, SpriteTimedClip,
SpriteAnimationFrameSample, createSpriteAnimationTiming, createSpriteTimedClip,
sampleSpriteAnimationTiming. Existing SA02 definitions remain intact. Timed clip
wraps and recaptures basic metadata rather than silently extending a closed input.
Actual task uses repeat; future SA01 mode remains a proposal, not a second setting.

See [API and numerical contract](../../runtime-render/docs/sprite-animation-v0.10.2.md).
Exclusive FPS/interval is checked both statically and at runtime; canonical output
stores interval only. Clip count is derived, never injected. Same input clip/order
and exact IDs preserved; all nested output captured/frozen. Constant TypeErrors
never echo source input; host traps propagate; no legacy diagnostics extended.

Admission: interval1e-6..MAX_SAFE_INTEGER ms, count1..65,536, finite positive
count*interval<=MAX_SAFE_INTEGER; explicit elapsed0..MAX_SAFE_INTEGER. This
excludes subnormal/sub-nanosecond intervals and unsafe horizons without coercion.
Binary64 rounding/modulo limits are documented; no perfect rational time claim.
Half-open boundaries are representable k*interval products. At most17 comparisons
locate the selected frame without division rounding across a boundary or looping
through skipped frames. Once clips elapsed to duration and holds final frame on
equality/afterward; repeat uses bounded remainder and never completes.

Future policy lock: same clip no-op; different clip resets stopped at0; direction
change preserves cycle fraction and transport including once completion; explicit
stop resets. These transport operations remain unimplemented here. No origin,
trim/sourcePivot, atlas revision, session, resource or disposal rule changes.

## Actual verification

| Command / audit | Observed result |
| --- | --- |
| node harness/cli.mjs check | exit0, ARCH_CHECK_PASS161 JS/TS files |
| node harness/cli.mjs scope --projects runtime-render --allow-infra | exit0, SCOPE_PASS; .mcp.json local only, excluded from commit |
| node harness/cli.mjs verify --projects runtime-render --with-consumers | exit0, genuine Render/Editor/Client BUILD_PASS; no failed/unconfigured build |
| npx tsc -p .artifacts/sprite-animation-v0.10.2-tsconfig.json | exit0, strict ES2022/NodeNext types:[], no DOM; typed new public-root consumer |
| node .artifacts/sprite-animation-v0.10.2-public-audit.mjs | exit0; per-symbol emitted declarations against SA02: Render235->244 (+9), Editor138/Client0 unchanged, zero removed/changed exports |
| git diff --check | exit0 |

New emitted sprite-animation-timing.d.ts was inspected, not inferred from docs.
Consumer compilation confirms neutral type portability, not browser/pixel proof.
Existing Node DEP0190 harness warning emitted; genuine builds exited0.
CI must target the containing committed SHA; earlier SA02 CI is not SA03 evidence.

## Finite manual evidence

One-off public-root `.artifacts/sprite-animation-v0.10.2-manual.mts`, executed via
Node24 native TypeScript, exited0 and printed observations without adding a test
suite, assertions, runner or CI step. Hypothetical ordered addresses0012..0015
are structural input only, not fabricated source bytes or asserted resolved art.

| INPUT | EXPECTED | OBSERVED |
| --- | --- | --- |
| 4 frames at8fps, or interval125ms | Same canonical interval/duration | Both125ms/frame, count4, duration500ms |
| elapsed0/124.999/125/499 | Half-open indexes0/0/1/3 | Both policies return0/0/1/3, incomplete |
| elapsed500 | once final completed; repeat first incomplete | once index3/time500/true; repeat index0/time0/false |
| elapsed625/1000 | once clipped hold; repeat remainder | once index3/time500/true; repeat index1/time125 then index0/time0 |
| sample125,0,125 independently | No retained playhead | indexes1,0,1 |
| Mutate timing input FPS and original clip/order | Detached/frozen result | Captured walk/0012..0015/interval125 unchanged; wrapper/timing/clip/frames frozen |
| Both fields, both with undefined, neither, unknown field, string, accessor | Reject safely | Constant TypeErrors; getter counter0 |
| NaN/Infinity/zero/negative, FPS division overflow, subnormal/huge interval | Reject numeric limits | TypeError in each observed case |
| Count4 * MAX_SAFE_INTEGER interval; ping-pong repeat | Reject duration/policy | TypeError |
| NaN/Infinity/negative/above-MAX_SAFE elapsed | Reject | TypeError |
| interval1e-6; one frame MAX_SAFE interval at end | Inclusive supported limits | Lower interval captured; upper end holds index0/completed |
| I0.1, elapsed0.3 versus3*0.1 | Respect binary64 product boundary | index2 versus index3 at0.30000000000000004 |
| Inspect serialized timed clip | No session/playhead/clock/native state | clip/timing/repeat/frameCount/durationMs only; timing interval only |

NOT_OBSERVED: live delta advance, clip/direction switching execution, actual atlas
resolution/revision/PNG decode, GPU allocation/submission, browser or rendered
sprite pixels. No timers, callbacks or scene modifications occur in the new source.
Sample completed has no gameplay consequence. No behavioral claim extends beyond
these finite pure-data/numerical observations.

## Handoff

SA03 has no dependency blocker. Actual eight-way art remains unverified for later
visual MVP. Next referenced task is v0.10.3 exact eight-direction mapping; its
standalone instructions are not supplied here. No next-checkpoint implementation,
review pause, self-merge/tag/publication/release. Rollback is this additive commit's
revert; no authored/runtime migration required.
