# v0.10.5 SA06 — deterministic animation advance

**IMPLEMENTED_EXPLICIT_DELTA / FINITE_CPU_OBSERVATIONS / VISUAL_NOT_VERIFIED.**
No GPU/Visual Instance binding or Phase10 acceptance claim.

## Delta preflight and scope

Previous checkpoint/HEAD/upstream: `c70bc4c3dae7e190602738e6a87f38aa6045fce0`.
Main: `78dc4a9d14288df33ca46b3af4d23d09ceef9b82`. Same branch
`feat/sprite-directional-animation-v0.10` and open Draft
[PR10](https://github.com/TjnhPro/rpg-platform/pull/10). Containing commit's full
SHA and completed exact-head CI are recorded in the PR ledger after push.
Tracked tree/index initially clean; preexisting untracked `.mcp.json` excluded.

Delta-focused preflight revisited root/project/consumer guidance, architecture,
foundation, Harness ownership/contracts/workflow/verification/failures, SA05
checkpoint and actual playback source/emitted declaration. Inspected canonical
SA03 timing sampler and SA04 direction-resolution seam. Actual Phase7/8/9 source
remains present; no new scene/camera contract is needed by pure CPU advancement.
Route hint and source agree: **runtime-render** is the sole primary owner.
Editor/Client supply delta and are public compilation consumers; no source edits.
No L1/L2/L3 API required or modified, gameplay timing remains outside Render.

Supplied task authorizes advance on existing playback. Scope: playback module,
root export, supplied task/API docs, checkpoint and Render/Harness guidance. No
new production module/project, package/lock/dependency/build/CI/owner graph changes.
No origin, parser, texture/cache/lease, Visual Instance or native frame changes.

## Contract decisions

Two additive root exports: advanceSpriteAnimationPlayback and
SpriteAnimationAdvanceResult. Old command union, snapshots and signatures remain
unchanged, including runtime rejection of advance on the old command entrypoint.
The new wrapper reaches the SAME private guard/validation/candidate/commit path.
No duplicate sampler, playback registry or mutable definition state.

[API/numeric/observation contract](../../runtime-render/docs/sprite-animation-v0.10.5.md).
Primitive finite delta0..MAX_SAFE_INTEGER, zero allowed. TypeError for invalid
delta even when not playing. Playing sum must remain finite<=MAX_SAFE_INTEGER
and grow for positive delta, otherwise RangeError before commit (including before
once clamp). Only playing progresses. Paused/stopped/completed-once and zero
return same snapshot/false flags. Repeat retains full logical elapsed; once
advance clamps to target duration and drops overshoot. Direction selection still
preserves logical elapsed independently of target modulo/clamp and transport.

Fractional progress retained without integer flooring. Binary64 partition sums
can differ within rounding tolerance; half-open index discontinuities near a
boundary remain SA03-owned, no epsilon/exact-rational promise. Large elapsed uses
modulo and at most17 frame-boundary comparisons, no per-skipped-frame/cycle loop.
Positive deltas absorbed at large time reject; no silent horizon wrap/reset.

Frozen result has snapshot, frameChanged and completedNow. frameChanged compares
project/resource/subresource addresses, not merely index; holds/whole cycles can
remain false. completedNow pulses false->true for this advance, independently of
frameChanged; later completed no-ops false. No intermediate events, callbacks,
invalidation or automatic draw. Old historical snapshots/results remain frozen.
Terminal/foreign/reentrancy rejection and CPU-only cleanup remain SA05-owned.

## Actual verification

| Command / audit | Observed result |
| --- | --- |
| node harness/cli.mjs check | exit0, ARCH_CHECK_PASS163 JS/TS sources |
| node harness/cli.mjs scope --projects runtime-render --allow-infra | exit0, SCOPE_PASS; .mcp.json local only, excluded |
| node harness/cli.mjs verify --projects runtime-render --with-consumers | exit0, genuine Render/Editor/Client BUILD_PASS; no failed/unconfigured builds |
| npx tsc -p .artifacts/sprite-animation-v0.10.5-tsconfig.json | exit0, strict ES2022/NodeNext public-root consumer; types:[], no DOM |
| node .artifacts/sprite-animation-v0.10.5-public-audit.mjs | exit0; emitted declarations against SA05: Render261->263 (+2), Editor138/Client0 unchanged; zero removed/changed exports |
| git diff --check | exit0 |

Actual emitted advance/result declarations inspected. Existing Node DEP0190
Harness warning did not fail builds. Exact-head CI follows the containing commit;
prior SA05 CI is not SA06 evidence. No tests/runners/matrices added or run.

## Finite public-root manual observations

One-off `.artifacts/sprite-animation-v0.10.5-manual.mts`, Node24, exit0, prints
observations without assertions or a test suite. Original read-only source:
`../jx1-manager-editor/data/asset-sources/monster/ani063/Attack1_0.tpsheet`,888 bytes,
SHA256 `fe5c87c2e5cba46b43482080f15f5ed607450bb7e15cc72dff3f515c8969efc7`,
unchanged afterward. Actual Phase7 source load/parser/atlas revision; load released.
Selected frame addresses resolved against original atlas. No copied source,
sibling edits, image/PNG fabrication or asserted eight-facing artwork.
Explicit4 frames at125ms, except direction5 has2 frames.

| INPUT | EXPECTED | OBSERVED |
| --- | --- | --- |
| Fresh playing once/repeat advance0/124.999/125/375/499.999 | Half-open indexes0/0/1/3/3 | Both match; incomplete, selected metadata resolved |
| Fresh advance500 | once final completed, repeat wraps | once index3/time500/completedNow true; repeat index0/logical500/remainder0/incomplete |
| Two62.5 versus one125 | Retain fractional remainder | Both logical125/index1; first62.5 remained index0 |
| Ten0.1 versus one1 | Binary64 tolerance |0.9999999999999999 vs1, difference-1.1102230246251565e-16; both index0 |
| Pause at125; advance300; resume; advance125 | Pause no-op then continue | Same paused snapshot/index1; resumed logical250/index2; B stays125/index1 |
| At375 direction0->5->0 | Preserve logical time | index3/sample375 -> index1/sample125 -> index3/sample375, logical375 throughout |
| Repeated play at375; zero delta | No reset | Same active snapshot/logical375; zero flags false |
| delta500*1,000,000,000+125 on two fresh handles | Bounded deterministic modulo | Both logical500000000125/index1/remainder125; script completed normally in under1s including all other observations, not a benchmark guarantee |
| MAX_SAFE_INTEGER from0 | Supported horizon | logical9007199254740991/remainder491/index3 |
| Negative/NaN/Infinity/above-limit/string/null/object/undefined delta | Reject atomically | TypeError each; prior snapshot identity retained |
| Horizon+1; absorbed MIN_VALUE at large time | Reject unsafe sum | RangeError; prior snapshot retained |
| Invalid NaN while paused; stopped advance300 | Reject invalid; valid no-op | TypeError; stopped same snapshot0/index0 |
| Once375 then advance5000 | Clamp and hold | logical500/index3/completed; frameChanged false, completedNow true |
| Completed advance300/resume; explicit play then125 | No replay until play | Completed unchanged; play resets0 then advances125/index1 |
| Once375 -> direction5 -> advance125 -> direction0 ->125 | Target completion rule | completed/sample250/logical375; no-op; longer target playing375 then completed500 |
| Repeated authored hold; whole repeat cycle | Address-based change | Hold index changes but frameChanged false; completion pulse true independently; full repeat500 returns same address/false |
| Foreign/disposed advance; nested advance during command capture | Reject safely | TypeError, terminal snapshot unchanged; reentrancy guard clears, outer pause succeeds |
| Old result after replay/other operations | Stable history | Frozen completed500 snapshot/frame unchanged |

NOT_OBSERVED: browser scheduling/suspension, Phase6 invalidation/render submission,
GPU frames, PNG decode, Visual Instance binding, eight actual artwork facings,
gameplay effects or origin alignment. These CPU observations close earlier SA05
nonzero/completed-handle evidence gaps only for the finite cases recorded here.
No Date/RAF/native frame counter or Engine query is used inside Render.

## Handoff

No SA06 dependency blocker. Next referenced v0.10.6 frame-origin alignment task
has not been supplied. No next-task implementation or routine review pause.
No merge/tag/release/publication/Developer acceptance. Rollback is this additive
checkpoint commit's revert; no authored/persisted migration required.
