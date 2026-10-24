# v0.11.4 VE05 — Effect Loop, Duration & Completion

**IMPLEMENTED: explicit-delta once/repeat/timed-repeat and terminal receipts.**
Finite manual effect timing and retained-resource cleanup observations below.
Full VFX FEATURE_NOT_VERIFIED; VISUAL_NOT_VERIFIED / NOT_DRAWN.
Developer phase acceptance remains pending.

## Baseline, prerequisites and scope

Date: 2026-10-24 Asia/Bangkok. Branch feat/visual-effect-playback-v0.11, PR11.
Main phase base aceea67f95cb309bdd06f1d6193767bfa06f42ce; previous exact VE04 HEAD
05a52814d5c71e0124bc6bfc93787707f4fe7cba. The containing checkpoint SHA and
exact-head push/PR CI are recorded in the PR ledger after commit.

Requested behavior: presentation lifetime independent of cycle duration, explicit
delta, deterministic completion/release and detached history. Primary owner
**runtime-render**: effect instance module plus additive root exports and API docs.
Harness records task/checkpoint/contracts/ownership; Editor/Client unchanged
public-contract build consumers. No Engine/Server/L1/L2/gameplay, authored Scene/
Object, dependency/pin/package/CI changes. No external foundation API calls.
Preexisting untracked .mcp.json and ignored artifacts are excluded.

Delta preflight read root/project AGENTS, architecture/foundation and Harness
owner/contract/workflow/verification/failure guidance plus actual VE03/VE04/U1
source and declarations. Route hint was inconclusive; source establishes Render
ownership. Supplied task authorizes this additive scope with no boundary move.
Actual Phase10 advanceSpriteSequencePlayback supplies guarded explicit delta,
once clamp/repeat sample, elapsed bounds and completion; existing Phase8/VE03
end path supplies membership/drawable/usage retirement. No absent foundation is
invented and no upstream implementation delta is necessary.

## Delivered contract

[API](../../runtime-render/docs/visual-effect-v0.11.4.md) defines nine new root
names: four functions and five types. Existing create uses definition repeat mode
for once/indefinite; timed factory admits repeat+positive duration only. One
canonical Phase10 elapsed provides both frame and lifetime position, no extra
accumulator. Pause freezes both; stop resets/hides but retains; restart resets
the retained run. Bounded advance clips overshoot; completion retires membership
and owned playback through VE03 cleanup and stores a frozen receipt. Completed
handles cannot restart; new instance required. Explicit remove stays idempotent.

Old declarations/unions are preserved: VE03 membership is removed on automatic
retirement and VE04 playback is disposed; the new lifetime snapshot distinguishes
completed/removed/stopped using its receipt. Repeated valid advance on completed
history has completedNow false and never repeats cleanup. Completion signal is
per-call return data, not gameplay dispatch or scheduler activity.

Compiler-generated root comparison against VE04: Render308 → 317, nine additive
names, zero changed/removed prior declarations across all five projects. Editor138
and Client/Engine/Server0 unchanged. Phase10, Phase7/8 and all other production
implementations are unchanged; effect module delegates to their actual contracts.

## Actual manual observations

Local ignored public-root host `.artifacts/ve05/browser.mjs` used real Chrome,
Three.js, three canonical sessions/scenes and original ani063/Attack1_0 sources.
Metadata888 bytes SHA256
fe5c87c2e5cba46b43482080f15f5ed607450bb7e15cc72dff3f515c8969efc7;
PNG12270 bytes SHA256
f31783508fe55cc39a421b9f3505503a831d7727605c1f2278e4a690585d3cd2.
Issued once/repeat definitions used original frame addresses0012/0000/0012,
fps8 (cycle375ms). One real PNG lease/cache upload was acquired by the host.
The host explicitly bound whole-texture usages to two Phase8 effect memberships
to observe canonical retained-rights cleanup. This is existing Phase8 resource
binding, not VE08 VFX frame binding. No renderFrame or visual transform was called;
no VFX animation pixels or GPU-frame disappearance is claimed.

| Input / expectation | Observed |
| --- | --- |
| Once advance374.5 then0.5 | playing then completed exactly375ms; clip-completed receipt; completedNow true once |
| Complete again / remove / restart | completedNow false; remove false; restart INSTANCE_REMOVED; no duplicate release |
| Two bound memberships before/after once completion | instances2→1, usable/boundUsages2→1, releaseAttempts0→1; other effect playing, borrowed lease usable; cleanupFailed false |
| Repeat aura advance1000000 | Still playing, no completion; stop+2000 stayed stopped0; restart+187.5 played frame1 |
| Timed3000, advance187.5, pause, delta1000 | Stayed paused187.5/frame1; both frame and lifetime froze |
| Resume+62.5, repeated play |250ms/frame2; repeated play retained the same canonical snapshot |
| Add2749.5 then0.5 | playing2999.5 then completed3000, duration-elapsed, no earlier timeout |
| MAX_SAFE_INTEGER single delta vs three1000ms deltas | Both completed3000 with same terminal frame/reason; per-call frameChanged differed legitimately |
| Restart at187.5 | Retained effect reset to playing0/frame0 |
| NaN/negative/Infinity/over-budget delta | INVALID_DELTA; current time remained0; zero no-op |
| Zero/Infinity/sub-resolution duration, timeout on once | INVALID_DURATION / INVALID_MODE; no admitted effect membership |
| Indefinite repeat at MAX_SAFE_INTEGER then+1 | Canonical RangeError; prior elapsed preserved |
| Explicit remove then advance | Lifetime removed with no receipt; INSTANCE_REMOVED |
| Receipt and canonical receipt snapshot freeze | Both frozen |
| Separate effect paused across manual host idle (>1s), no advance | Still187.5; resume+62.5 reached250 |
| Actual WEBGL_lose_context then advance | SESSION_ENDED; safe removed history at250ms |
| Host releases borrowed lease, disposes sessions/cache | Scene instances/boundUsages0, releaseAttempts2, cleanupFailed false; cache cpu/gpu/leases0 |

The active pause/resume/repeated-play/restart evidence is now on actual effect
handles at nonzero fractional time, closing VE04's earlier observation gap.
The wall-idle observation used no Render clock; only host inspection separated
manual calls. Raw records are ignored `.artifacts/ve05/observations-cli.txt`.
Browser console had only favicon404. Initial localhost8774 was occupied by an
existing unrelated host; it was left untouched and observation used8795 instead.
Browser and owned server were closed. No mock, fake asset, test runner or suite.

Not independently observed: native allocation reclamation, injected native
cleanup failure, unsupported fractional summation equivalence, VFX frame binding,
on-screen effect animation/disappearance, attachment or final product acceptance.
Shared-cache counters/retained rights are logical evidence, not GPU profiler
receipts. Once/timed modes are exclusive; timeout wins at a repeat cycle boundary
without a second completion event. No gameplay duration or consequence is inferred.

## Gates and handoff

| Command / audit | Actual result |
| --- | --- |
| node harness/cli.mjs check | Exit0 ARCH_CHECK_PASS,176 JS/TS sources |
| node harness/cli.mjs scope --projects runtime-render --allow-infra | Exit0 Render + Harness scope |
| node harness/cli.mjs verify --projects runtime-render --with-consumers | Exit0 BUILD_PASS Render, Editor, Game Client |
| node .artifacts/ve05/public-audit.mjs | Exit0 nine additive roots, prior declarations unchanged |
| npx tsc -p .artifacts/ve05/tsconfig.json | Exit0 strict emitted-root consumer, ES2022/types[]/skipLibCheck:false/no DOM |
| git diff --cached --check | Exit0 |

No failed/unconfigured final local build. Existing Harness DEP0190 warning is
nonfatal. Narrow local scope does not repeat Engine/Server builds; exact-head CI
separately covers all five projects plus full workspace build. No historic suites,
unit/integration/browser/Playwright/E2E/snapshot/visual regression suite, coverage
or matrix added/run; browser CLI only drove finite manual public-root observation.

Next is v0.11.5 World Position & Offset. No detailed next task supplied and no
next capability implemented. No routine review pause, merge/tag/release/publish
or phase acceptance is inferred from this checkpoint.
