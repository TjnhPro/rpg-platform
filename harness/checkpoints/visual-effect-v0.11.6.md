# v0.11.6 VE07 — Visual Instance Attachment

IMPLEMENTED: one-level translation-only attachment, explicit sync, freeze detach,
effective visibility inheritance and remove-effect target loss. Finite manual API
observations below; full VFX FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED.
Developer acceptance remains pending.

## Baseline and scope

Date: 2026-10-24 Asia/Bangkok. Branch feat/visual-effect-playback-v0.11, Draft PR11.
Main phase base aceea67f95cb309bdd06f1d6193767bfa06f42ce; prior VE06 HEAD
1c38808cc74ed83a811c3e41a9cc21d8b8b8cd1f. Containing commit and exact-head
push/PR CI are recorded in PR11 after commit.

Requested behavior: follow one live visual target without coupling playback or
gameplay. Canonical primary owner: runtime-render. Production changes are only
visual-effect-instance.ts, root exports and API documentation. Harness records
task/checkpoint/contracts/ownership. Editor/Game Client are unchanged public
contract build consumers. Engine/Server/L1/L2, authored schemas, dependencies,
pins, packages and CI are unchanged. No external foundation APIs are called.
Preexisting untracked .mcp.json and ignored observation artifacts are excluded.

Delta preflight read root/project AGENTS, ARCHITECTURE, FOUNDATION,
harness/{OWNERSHIP,CONTRACTS,WORKFLOW,VERIFICATION,FAILURES}, prior checkpoint
and current related source/public declarations. Route is advisory only; actual
source establishes Render ownership. Supplied task authorizes the additive seam.
No missing upstream capability, boundary expansion or breaking API was needed.

## Canonical contracts and compatibility

Phase4 captures finite offsets, exact plane compatibility and transform math.
Phase8 readVisualInstanceFrameState admits exact live same-scene handles;
get/setRenderVisualInstanceTransform supply applied target attachment and commit
the effect transform. getRenderVisualInstanceVisibility supplies effective target
visibility. Existing internal onVisualInstanceEnd handles terminal notifications;
Phase8 alone owns scene membership and retained resource release. VE03 identity/
retirement, VE04 guards and U1/Phase10 transport are reused unchanged.

Six additive root names, Render321→327: attachVisualEffectInstance,
syncVisualEffectAttachment, detachVisualEffectInstance,
getVisualEffectAttachmentSnapshot, VisualEffectAttachmentInput,
VisualEffectAttachmentSnapshot. Compiler-generated comparison found zero removed
or changed old root declarations across all five projects. Editor138 and
Client/Engine/Server0 unchanged. Strict emitted-root consumer compiles ES2022,
types[], skipLibCheck:false, no DOM. This is declaration compatibility evidence.

[API/runbook](../../runtime-render/docs/visual-effect-v0.11.6.md) defines exclusive
modes, source-plane offsets, host sync-before-submit protocol, visibility,
failure semantics and cleanup. No clock, renderer, hierarchy, gameplay lookup or
secondary transform storage. No VE08 VFX frame integration implemented early.

## Finite manual observation

Headed Chrome via installed Playwright CLI, actual Three.js sessions, emitted
Render public root, localhost8797. Ordinary target key player-visual represents
a visual target; no Player/Monster class is required or exercised. World context
project ve07, world/world-unit/right/up, explicit .01 clip mapping. Original
addresses0012/0000/0012 at8fps repeat. Real original texture bound frame:null;
this proves retained rights, not VFX animation-frame binding or pixels.

Original sources: sibling jx1-manager-editor/data/asset-sources/monster/ani063.

| Source | Bytes | SHA256 |
| --- | --- | --- |
| Attack1_0.tpsheet | 888 | fe5c87c2e5cba46b43482080f15f5ed607450bb7e15cc72dff3f515c8969efc7 |
| Attack1_0.png | 12270 | f31783508fe55cc39a421b9f3505503a831d7727605c1f2278e4a690585d3cd2 |

| Input / expected | Actual observation |
| --- | --- |
| Target attachment(10,20), effect anchor(2,3), pivot(1,1), offset(-4,5) | attached effect attachment(6,25), same playing187.5ms/frame1/0000 snapshot |
| Repeat sync without mutation | exact same transform object |
| Move target to(30,60), then sync | effect attachment(26,65), translation delta(20,40), same effect handle and playback |
| Resource preservation | reads1/uploads1, CPU/GPU entries1, leases3 (host/effect/target), no added rights on sync |
| Separate canonical target playback paused187.5ms/frame1, advance effect62.5ms | effect250ms/frame2; independent CPU transports; target playback not bound/drawn |
| Hide target, sync, advance effect125ms | effect hidden, elapsed375ms/sample0/frame0; no inferred pause |
| Stop effect then show target; play while target hidden | stop remains hidden; play remains hidden while target hidden |
| World setter while attached, self/effect-chain, missing target transform | TypeError; same valid target and transform |
| NaN/Infinity offset, full-trs inheritance, foreign second scene/session, removed target | rejected; same valid target/transform, foreign/missing canonical classification |
| Change target coordinateSpace then detach | TypeError; binding and transform retained; context restored |
| Move target100,200 hidden, then detach | world mode, frozen attachment(96,205), independent own-visible restored |
| Move former target200,400 then sync/detach world effect | frozen transform identity preserved, detach idempotent |
| Remove target with second attached aura | aura removed/disposed, binding cleared, cleanupFailed false; detached independent effect remains active |
| Retained rights after removal | target+aura releaseAttempts2; host usable, CPU/GPU1, leases2; no shared eviction |
| Repeat target removal, reuse same visual key | remove false; old aura stays removed with null target |
| Scene clear | effect membership-ended, instances/boundUsages0, cleanupFailed false |
| Session dispose / other scene dispose | effects session-ended / scene-disposed respectively; no cleanup failure |
| Final host release/cache dispose | CPU/GPU/leases0, reads1/uploads1, cleanupFailed false |

Raw records: ignored .artifacts/ve07/observations-cli.txt with host/server and
declaration audit. Initial manual host omitted required Phase10 clipId; corrected
host then completed. Console only favicon404. Browser/owned server closed.
No mocks, generated fake assets or test runner/suite were used.

Not observed: on-screen aura following an actual animated Player, bound target
animation pause, submitted/drawn VFX frames, target rotation/scale scenarios,
native fault injection, native allocation reclamation or listener heap profiling.
renderFrameCalls0. Logical cleanup receipts do not prove GPU memory reclamation.
Authored/gameplay nonmutation follows source scope, not a running Engine scenario.
Full VFX FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED; no MVP/Developer acceptance.

## Gates and handoff

| Command / audit | Actual result |
| --- | --- |
| node harness/cli.mjs check | Exit0 ARCH_CHECK_PASS,176 sources |
| node harness/cli.mjs scope --projects runtime-render --allow-infra | Exit0 Render + Harness scope |
| node harness/cli.mjs verify --projects runtime-render --with-consumers | Exit0 BUILD_PASS Render, Editor, Game Client |
| node .artifacts/ve07/public-audit.mjs | Exit0 six additions, zero old declaration changes |
| npx tsc -p .artifacts/ve07/tsconfig.json | Exit0 strict emitted-root consumer, no DOM |
| git diff --cached --check | Exit0 |

No failed/unconfigured final local build; existing DEP0190 warning nonfatal.
CI exact SHA and run receipts live in PR11. No unit/integration/browser/E2E/
snapshot/visual-regression suite, runner, coverage or matrix added/run. Browser
CLI drove finite manual API observations only. Next is v0.11.7 VFX Frame & Visual
Scene Integration; its detailed task has not been supplied. No next capability,
routine review pause, merge/tag/publish or phase acceptance is inferred.
