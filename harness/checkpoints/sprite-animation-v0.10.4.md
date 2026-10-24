# v0.10.4 SA05 — playback state and commands

**IMPLEMENTED_CPU_CONTROLS / FINITE_ZERO_TIME_OBSERVATIONS / VISUAL_NOT_VERIFIED.**
No elapsed advancement, completed-handle observation or Phase10 acceptance claim.

## Delta preflight and authorized scope

Previous checkpoint/HEAD/upstream: `72aae5c12d1e8ee29db2560823ad9440b6d82464`.
Main: `78dc4a9d14288df33ca46b3af4d23d09ceef9b82`. Same Phase10 branch
`feat/sprite-directional-animation-v0.10`, open Draft
[PR10](https://github.com/TjnhPro/rpg-platform/pull/10). Containing commit SHA
and completed exact-head CI are recorded in the PR ledger after push.
Tracked tree/index initially clean; preexisting untracked `.mcp.json` excluded.

Delta-focused inspection: root/Render/consumer guidance, ARCHITECTURE, FOUNDATION,
Harness OWNERSHIP/CONTRACTS/WORKFLOW/VERIFICATION/FAILURES, SA01 proposal and SA04
checkpoint/source, actual SA02 sequence and SA03 sampler source, emitted SA03/04
declarations and Render root. Existing camera weak-capability pattern inspected;
no camera implementation reused as playback. Route hint and source identify
**runtime-render** as sole behavior owner. Editor/Client are public compatibility
consumers only; no source changes. No L1/L2/L3 API required or modified. Actual
Phase7/8/9 source exists; pure CPU control requires no new scene/camera API.

Supplied task authorizes additive playback contracts. Scoped changes: one
sprite-animation-playback.ts, Render exports, supplied task/API doc, checkpoint
and Render/Harness guidance. No package/lock/dependency, build/CI config, old
signature/union, owner graph or foundation edits. No sixth project or global
animation/Scene registry. No next-checkpoint advance, timer, seek or state import.

## Actual contract and state decisions

Eight additive root exports: SpriteAnimationPlaybackState,
SpriteAnimationPlayback, SpriteAnimationPlaybackInput,
SpriteAnimationPlaybackSnapshot, SpriteAnimationPlaybackCommand,
createSpriteAnimationPlayback, getSpriteAnimationPlaybackSnapshot,
commandSpriteAnimationPlayback. [API/transition table](../../runtime-render/docs/sprite-animation-v0.10.4.md).

Input has clips, clipId and directionIndex; creation starts stopped at logical0.
Capture accepts dense1..256 unique keyed clips with aggregate524,288 frame refs,
all one project, delegating SA04 immutable validation. One private definition Map
per handle, no second set catalog/cache. Definitions are never mutated by commands.
Issued object identity is required; copied symbol IDs and lookalikes reject.
Snapshots retain exact frame addresses and separate original elapsed from target
sampled elapsed; frame address is not atlas/revision/texture success evidence.

One capture/validate/candidate/commit path handles play, pause, resume, stop,
selectClip, setDirection and dispose. Same active clip is idempotent; different
play restarts at0; select different resets stopped; pause/resume preserve progress;
stop resets first frame; direction preserves SAME logical elapsed/transport and
delegates target count sampling to SA03. Once sampling holds final frame and
reports completed; explicit play from completed resets, resume does not replay.
Completion is target-local, consistent with SA04's unequal-duration rule.

Invalid input preserves the previous snapshot. Closed records/data fields only;
safe constant TypeErrors, host/proxy exceptions propagate. Same-handle reentrancy
rejects nested read/write, finally clears busy flag. Disposal is terminal and
idempotent, drops private definition collection and retains last frozen readback.
No graphics/source/lease allocation means no resource disposal obligation or
Phase7/8 lifetime changes. Future adapter seam is readback.frame, not a new binding.
No authored world position, origin, orientation quantizer or gameplay change.

## Actual verification

| Command / audit | Observed result |
| --- | --- |
| node harness/cli.mjs check | exit0, ARCH_CHECK_PASS163 JS/TS sources |
| node harness/cli.mjs scope --projects runtime-render --allow-infra | exit0, SCOPE_PASS; .mcp.json local only, excluded |
| node harness/cli.mjs verify --projects runtime-render --with-consumers | exit0, genuine Render/Editor/Client BUILD_PASS; no failed/unconfigured builds |
| npx tsc -p .artifacts/sprite-animation-v0.10.4-tsconfig.json | exit0, strict ES2022/NodeNext public-root consumer, types:[], no DOM |
| node .artifacts/sprite-animation-v0.10.4-public-audit.mjs | exit0, emitted declarations against SA04: Render253->261 (+8), Editor138/Client0 unchanged; zero removed/changed exports |
| git diff --check | exit0 |

New emitted sprite-animation-playback.d.ts inspected. The final source change
was included in the successful consumer build and manual reads. Existing Node
DEP0190 Harness warning did not fail builds. Exact-head CI must follow commit;
prior SA04 CI is not SA05 evidence. No tests/runners/matrices added or run.

## Finite public-root manual evidence

One-off `.artifacts/sprite-animation-v0.10.4-manual.mts`, Node24, exit0, prints
observations without assertions or a test suite. Actual read-only source:
`../jx1-manager-editor/data/asset-sources/monster/ani063/Attack1_0.tpsheet`,888 bytes,
SHA256 `fe5c87c2e5cba46b43482080f15f5ed607450bb7e15cc72dff3f515c8969efc7`,
unchanged afterward. Actual Phase7 source load/parser produced atlas/revision;
load released. Explicit source keys, no copied/modified sibling files or fake art.
Slots use2 frames except slot5 uses4; idle/walk/attack are arbitrary authored keys.

| INPUT | EXPECTED | OBSERVED |
| --- | --- | --- |
| Create A/B idle0 | Independent stopped first frames | Both stopped0, index0,key0012; metadata resolved |
| A play walk twice | Start first frame; second no-op | playing0,index0,key0012; same snapshot on repeated play |
| pause then resume | Preserve elapsed/frame | paused then playing;0/index0/key0012 retained |
| playing direction0->5 | Preserve logical time; B unchanged | A playing0,key0002,index0; B idle/stopped0,key0012 |
| play idle then walk | Restart each at first frame | playing0/index0 in retained direction5 |
| stop; resume stopped | Reset stopped; no implicit play | stopped0/index0; resume no-op |
| select attack then play | Reset stopped then explicit play | attack stopped0 then playing0, incomplete |
| Missing clip, index8/-1/NaN, advance, extra field | Reject atomically | TypeError; same prior snapshot |
| Accessor command type | Reject without invocation | TypeError, getter counter0 |
| Proxy tries nested stop during capture | Reject nested operation, keep outer usable | Nested TypeError; outer stop succeeds |
| Copied ID/object, null handle | Reject foreign capability | TypeError for each read |
| Mutate frame/clip array/caller sequence | Frozen detached capture | Mutation TypeError; handle/readback frozen; selected0002 unchanged |
| dispose twice then all six control commands | Terminal/idempotent; commands reject | Same disposed snapshot; six TypeErrors, readback unchanged; B unchanged |
| Empty/duplicate/missing clips, direction16, elapsed import, sparse clips | Reject invalid creation | TypeError each |

NOT_OBSERVED: preservation at nonzero elapsed, reset from nonzero, actual once
completion/replay from completed handle, delta progression, real eight-facing
artwork, PNG decode, GPU/frame submission, browser pixels or Visual Instance
binding. SA05 has no progress input, so nonzero/completed states are not publicly
reachable yet. Completion rules exist in shared sampling/command logic but are
not claimed exercised by a fake/injected handle. No Date/RAF/engine query used.

## Handoff

No dependency blocker for SA05. v0.10.5 deterministic delta advancement is the
next referenced task; standalone instructions have not been supplied. Carry the
same logical-time and terminal-capability invariants forward. No next-task code,
review pause, merge/tag/release/publication or Developer acceptance. Rollback is
this additive commit's revert; no persisted authored/runtime migration.
