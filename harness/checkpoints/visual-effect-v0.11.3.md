# v0.11.3 VE04 — Effect Playback Controls

**IMPLEMENTED: command admission/transitions and canonical frame readback.**
Finite command/visibility evidence below; nonzero effect progress NOT_OBSERVED.
Full VFX FEATURE_NOT_VERIFIED, VISUAL_NOT_VERIFIED / NOT_DRAWN.
Developer acceptance remains pending.

## Baseline and scope

Date: 2026-10-24 Asia/Bangkok. Branch `feat/visual-effect-playback-v0.11`, PR11.
Main phase base `aceea67f95cb309bdd06f1d6193767bfa06f42ce`; exact prior VE03 HEAD
`ce5833ef1261c9d0eb00d1f391e24f911a0e575e`. Containing checkpoint SHA and exact-head
push/PR CI links are recorded in the PR ledger after commit.

Requested behavior: play/pause/resume/stop/restart per retained effect, selected
frame and canonical elapsed readback. Primary owner **runtime-render**, extending
visual-effect-instance.ts and root re-exports; Render docs explain the new API.
Harness records supplied task/checkpoint/contracts/ownership. Editor and Client
are unchanged public-contract build consumers. Engine/Server, read-only L1/L2,
authored Scene/Object definitions, dependencies, package pins, CI and all Phase10
production sources remain untouched; no external foundation APIs are called.
Preexisting `.mcp.json` and ignored local observation artifacts are excluded.

Delta preflight read root/project AGENTS, ARCHITECTURE, FOUNDATION and Harness
OWNERSHIP/CONTRACTS/WORKFLOW/VERIFICATION/FAILURES plus actual VE03/U1 source/root
and emitted declarations. Route hint was inconclusive; source establishes Render
ownership. The supplied task authorizes this additive control contract; no owner
or project boundary expansion is needed.

Actual prerequisite: VE03 already owns a stopped U1 SpriteSequencePlayback for
each admitted effect. Phase10 commandSpriteSequencePlayback supports play with
exact clipId, pause/resume/stop/dispose. getSpriteSequencePlaybackSnapshot returns
deeply frozen time/address readback; directionIndex is null. Restart needs only
canonical stop then play; no upstream extension is needed. Existing Phase8
setRenderVisualInstanceVisible supplies hide/reactivate without another drawable.

## Delivered contracts

[API contract](../../runtime-render/docs/visual-effect-v0.11.3.md) records the
command matrix, closed inputs, optional exact clip assertion, terminal reasons,
safe readback, visibility policy, reentrancy and resource-readiness limitations.
Repeated play delegates to the same canonical track and does not reset it;
restart explicitly resets via stop/play. Stop retains the effect for replay;
remove disposes it. No second timeline, elapsed accumulator, graph, direction,
clock, event, resource loader or renderer. Explicit VFX advance, duration and
auto-completion remain outside VE04.

Six additions: commandVisualEffectPlayback/getVisualEffectPlaybackSnapshot/
getVisualEffectPlaybackFailure and VisualEffectPlaybackCommand/Snapshot/Failure.
Compiler-generated comparison to VE03: Render302 → 308; zero prior root
declarations changed/removed across all five projects. Editor138 and
Client/Engine/Server0 unchanged. No old error union was widened. Terminal VE03
cleanup now retains final immutable canonical playback data for safe readback.

## Actual manual observations

Manual emitted-public-root Chrome host in ignored `.artifacts/ve04/browser.mjs`
used actual Three.js and three real graphics sessions/canonical scenes. It
captured the same real original ani063/Attack1_0 reference as VE03, one definition
spark with frame addresses0012/0000/0012, fps8/once, project ve03. No image/atlas
load, decode, renderFrame or effect advance occurred. Reference capture is not
source resolution/readiness. Browser/server were closed; only console error was
the unrelated favicon404. Raw record: `.artifacts/ve04/observations-final-cli.txt`.

| Input / expectation | Observed |
| --- | --- |
| Initial state, pause/resume while stopped | stopped0; both INVALID_TRANSITION |
| play twice | playing frame0/0012/time0; same canonical playback snapshot object on repeated play |
| Pause a while b plays | a paused, b playing; independent handles; resume a retained frame0/time0 |
| Explicit restart | playing frame0/time0; restart after stop also reactivated Phase8 visible:true |
| Stop a | stopped0, active:false, Phase8 visible/effectiveVisible:false, live lookup still the same handle |
| Unknown clip / resource override / unsupported selectClip / accessor | CLIP_NOT_DECLARED / INVALID_COMMAND; no getter invoked; previous canonical snapshot preserved |
| Copied handle | FOREIGN_INSTANCE |
| Remove then restart | INSTANCE_REMOVED; final readback disposed/removed/active:false; prior snapshot frozen, b still playing |
| Input reflection removes its own effect | INSTANCE_REMOVED, no resurrection; final playback disposed |
| Input reflection issues nested command | nested TRANSITION_IN_PROGRESS; outer valid play completed |
| Session disposal then play | SESSION_ENDED; safe terminal snapshot |
| Actual WEBGL_lose_context then restart | isContextLost true; SESSION_ENDED; terminal disposed readback |

Separate actual Phase10 public-root Node observation used the original source
file `../jx1-manager-editor/data/asset-sources/monster/ani063/Attack1_0.tpsheet`,
888 bytes, SHA256
`fe5c87c2e5cba46b43482080f15f5ed607450bb7e15cc72dff3f515c8969efc7`.
It created zero effect handles. At fps8, explicit187.5ms selected frame1/0000;
repeated play returned the same snapshot. Pause plus explicit500ms stayed187.5ms
on frame1; resume retained187.5ms, then62.5ms reached250ms/frame2/0012. Canonical
stop/play reset to0/frame0. This establishes the upstream engine's finite
fractional behavior, not nonzero progress inside an effect.
Record: `.artifacts/ve04/upstream-observations.json`.

Acceptance boundary: actual effect playing→paused→resumed and independent
commands are observed at0. Nonzero/fractional effect pause preservation and
nonzero effect restart are **NOT_OBSERVED** because VE04 intentionally exposes no
advance or mutable owned playback handle. Their delegation is source-audited;
future explicit-delta integration must demonstrate them on effect handles.
No arbitrary time injection, private playback access or out-of-scope advance API
was added for evidence. No pixels, lease readiness, GPU/native rollback or VFX
completion/lifetime behavior was observed or claimed. Final snapshot explicitly
reports resourceReadiness:NOT_CHECKED; this is logical control, not a ready VFX.

## Gates and handoff

| Command / audit | Actual result |
| --- | --- |
| `node harness/cli.mjs check` | Exit0 ARCH_CHECK_PASS,176 JS/TS sources |
| `node harness/cli.mjs scope --projects runtime-render --allow-infra` | Exit0, Render + Harness scope |
| `node harness/cli.mjs verify --projects runtime-render --with-consumers` | Exit0 BUILD_PASS Render, Editor, Game Client |
| `node .artifacts/ve04/public-audit.mjs` | Exit0; six additive roots, prior declarations unchanged |
| `npx tsc -p .artifacts/ve04/tsconfig.json` | Exit0; strict emitted-root consumer, ES2022/types[]/skipLibCheck:false/no DOM |
| `node .artifacts/ve04/upstream-observe.mjs` | Exit0 actual Phase10 fractional observations above |
| `git diff --cached --check` | Exit0 |

No failed/unconfigured final local builds. Existing Harness DEP0190 warning is
nonfatal. Engine/Server local builds were not repeated for this narrow change;
exact-head CI separately covers all five projects plus full workspace build.
No unit/integration/browser/Playwright/E2E/snapshot/visual regression suite, runner,
mock engine, fake asset, coverage or CI test matrix was added/run. Browser CLI
only drove finite manual public-root observations, not a suite.

Next task is v0.11.4 Loop, Duration & Completion; its detailed specification is
not supplied and no capability is implemented ahead of it. No routine review
pause, merge, tag, release, publish or phase acceptance is inferred.
