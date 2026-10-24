# v0.10.3 SA04 — exact eight-direction mapping

**IMPLEMENTED_PURE_MAPPING / FINITE_MANUAL_OBSERVATIONS / VISUAL_NOT_VERIFIED.**
No live playback or Phase10 MVP acceptance is claimed.

## Delta preflight

Previous checkpoint/HEAD/upstream: `f08b117c3210b9ac442e580c6c94d19a2aff830d`.
Main: `78dc4a9d14288df33ca46b3af4d23d09ceef9b82`. Same Phase10 branch
`feat/sprite-directional-animation-v0.10`, same open Draft
[PR10](https://github.com/TjnhPro/rpg-platform/pull/10). Containing commit's SHA
and completed exact-head CI are recorded in the PR ledger after push.
Tracked tree/index initially clean; preexisting untracked `.mcp.json` excluded.

Delta preflight revisited root/Render/consumer guidance, architecture, foundation,
Harness ownership/contracts/workflow/verification/failures and SA01–03. Inspected
actual source/public declarations for Phase4 orientation, Phase7 atlas/frame and
revision resolution, SA02 sequence capture and SA03 timing. Phase8/9 source is
present; this pure checkpoint requires no new scene/camera integration. Routing
hints and actual source agree: **runtime-render** is the sole behavior owner.
Editor authors mappings and Client supplies orientation as future consumers;
their source is unchanged. No L1/L2/L3 API or source changes.

Authorized scope: sprite-eight-way.ts, Render root exports, supplied task/API
documentation, historical proposal clarification, checkpoint and Render/Harness
guidance. No dependency, package/lock, build/CI, owner graph or old API change.

## Public delta and decisions

Nine additive exports: SpriteDirectionIndex, SpriteDirectionSequences,
SpriteEightWayConvention, EightWaySpriteClipInput, EightWaySpriteClip,
EightWaySpriteFrameResolution, createEightWaySpriteClip,
selectEightWaySpriteDirection, resolveEightWaySpriteFrame.
See [API and decision tables](../../runtime-render/docs/sprite-animation-v0.10.3.md).

Exactly eight explicit dense slots0..7, one logical clip ID/timing/repeat, all
sequences in one project. Per-direction resources/counts may differ; each sequence
retains SA02 resource scope. Repeated explicit sequences are allowed, never an
implicit missing-slot fallback. Detached frozen capture; no global/scene registry.
Nearest45-degree centers follow Phase4 numeric+x zero/toward-positive-y and
matching declared axes. Exact halfway ties advance; relative angle wraps only
after canonical [0,2PI) validation. Binary64 shifted-boundary limits documented.

**Supplied SA04 supersedes the SA01/SA03 proposed cycle-fraction switch policy:**
preserve SAME logical elapsed, then target count determines modulo/clamp. No
existing playback implementation/signature is changed. No playhead/clock added.
Canonical Phase7 resolveAtlasFrame checks selected frame/resource/revision and
preserves typed unresolved results. Factories alone do not prove asset existence;
other frames/resources are not eagerly validated. No texture/load/lease acquired
by the new implementation; no lifetime owner or origin/placement changes.

## Actual verification

| Command / audit | Observed result |
| --- | --- |
| node harness/cli.mjs check | exit0, ARCH_CHECK_PASS162 JS/TS files |
| node harness/cli.mjs scope --projects runtime-render --allow-infra | exit0, SCOPE_PASS; local .mcp.json excluded |
| node harness/cli.mjs verify --projects runtime-render --with-consumers | exit0, genuine Render/Editor/Client BUILD_PASS; no failed/unconfigured builds |
| npx tsc -p .artifacts/sprite-animation-v0.10.3-tsconfig.json | exit0, strict ES2022/NodeNext public-root consumer, types:[], no DOM |
| node .artifacts/sprite-animation-v0.10.3-public-audit.mjs | exit0; emitted declaration comparison against SA03: Render244->253 (+9), Editor138/Client0 unchanged; zero removed/changed exports |
| git diff --check | exit0 |

New emitted sprite-eight-way.d.ts and public-root consumer inspected. Existing
Node DEP0190 harness warning does not change successful build exits. CI must
target this checkpoint's committed SHA; earlier SA03 CI is not SA04 evidence.

## Finite manual evidence

One-off public-root `.artifacts/sprite-animation-v0.10.3-manual.mts`, Node24,
exit0; observations without assertion suite, runner or CI step. Used original
read-only sibling source `../jx1-manager-editor/data/asset-sources/monster/ani063/Attack1_0.tpsheet`,
888 bytes, SHA256 `fe5c87c2e5cba46b43482080f15f5ed607450bb7e15cc72dff3f515c8969efc7`.
Hash unchanged after observation; no sibling edits or copied source committed.
Actual createVisualSourceLoad provider returned those bytes; canonical parser
parsed them twice with explicit bindings and distinct parser revision tokens.
Load released. No fake atlas/image/PNG data. Deliberately authored slots0..7 map
to actual keys0012,0000,0014,0004,0010,0002,0008,0006, not filename ordering.

| INPUT | EXPECTED | OBSERVED |
| --- | --- | --- |
| Angles k*PI/4, k0..7 | Select eight explicit slots and keys | slots0..7, listed eight keys; canonical resolution resolved each |
| PI/8-EPS, PI/8,3PI/8,15PI/8,2PI-4EPS | Half-open ties/wrap | slots0,1,2,0,0 |
| zeroIndex3, facing0 | Explicit offset | slot3 |
| zeroAnglePI/2, zeroIndex3, facingPI/2 then0 | Explicit authored zero | slots3 then1 |
| Matching left/up axes, facingPI/2 | Same numeric angular convention | slot2 |
| Logical375ms, interval125, repeat counts2 then4 | Same elapsed, target modulo | index1/remainder125 then index3/remainder375; incomplete |
| Same input, once counts2 then4 | Target clamp | index1/time250/completed then index3/time375/incomplete |
| Same facing/mapping repeated | Deterministic pure read | Identical direction/sample/resolved frame |
| Wrong parser revision token | Typed rejection | ATLAS_REVISION_MISMATCH |
| Different declared resource; null atlas | Typed rejection | RESOURCE_MISMATCH; ATLAS_NOT_AVAILABLE |
| zeroIndex8/negative;16slots;32mode;7slots;sparse8 | Reject unsupported/missing slots | TypeError each |
| Axes mismatch; negative/full-turn/NaN angle; foreign-project slot | Reject incompatible metadata | TypeError each |
| Mutate caller frame key after capture | Detached immutable mapping | Captured0012 unchanged; wrapper/axes/tuple/nested frames frozen |

NOT_OBSERVED: those source keys depicting eight actual artwork facings; PNG
decode, GPU allocation/submission, browser/rendered pixels, live direction switch
transport, play/pause/resume/stop, gameplay movement/facing authority. Metadata
resolution is not visual evidence. No behavioral claim beyond these finite reads.

## Handoff

SA04 has no dependency blocker. Verified eight-direction artwork remains a later
visual MVP prerequisite. Next referenced task v0.10.4 play/pause/resume/stop has
not been supplied. No next-checkpoint implementation, per-version review pause,
self-merge/tag/publication/release or Developer acceptance claim. Rollback is this
additive commit's revert; no migration required.
