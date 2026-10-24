# v0.10.1 SA02 — animation clip and frame sequence

**IMPLEMENTED_METADATA / FINITE_MANUAL_OBSERVATIONS / VISUAL_NOT_VERIFIED.**
No phase/MVP acceptance is claimed.

## Delta preflight and authorized plan

Previous checkpoint/local HEAD/upstream before change:
`35a87b27d6e3c3581fb2a867369dc6947696b46d` (SA01).
Main: `78dc4a9d14288df33ca46b3af4d23d09ceef9b82`.
Same branch `feat/sprite-directional-animation-v0.10`, same Draft
[PR10](https://github.com/TjnhPro/rpg-platform/pull/10). Checkpoint's full SHA and
exact-head CI are recorded after commit in its PR ledger, not self-referenced here.
Initial tracked tree/index clean; preexisting untracked `.mcp.json` excluded.

Re-read root architecture/ownership, project guidance, foundation and Harness
workflow/contracts/verification/failures; delta-audited SA01 and current Phase7
atlas-frame/metadata/parser source with emitted declarations and Render root.
Route suggests Render; source confirms **runtime-render** as canonical owner.
Editor/Client are unchanged public-root build consumers only. No external L1/L2
API is needed. Existing Phase4/6/7/8/9 implementation remains available at this
base; task's historical uncertainty is not a missing dependency today.

Authorized production delta: one focused sprite-frame-sequence.ts and root
exports. Four additive symbols: SpriteFrameSequence, SpriteAnimationClip,
createSpriteFrameSequence, createSpriteAnimationClip. The basic clip metadata
type is distinct from future EightWaySpriteClip; it adds no timing/direction
methods to SA01's sequence proposal. No old export/signature/diagnostic change.
Other changes are this report, standalone supplied task, API notes and current
Render/Harness guidance. No package, lock, CI, Editor/Client source, Engine,
Server or foundation edits. No new project/registry/renderer/source loader.

## Contract and implementation

See [actual API and revision protocol](../../runtime-render/docs/sprite-animation-v0.10.1.md).
Capture is closed plain-record validation; frames are own dense data array
entries,1..65,536 (existing Phase7 parser capacity). IDs are bounded and exact.
One sequence shares one project/resource; atlas subresource must be non-null.
References are recaptured by Phase7's canonical factory then deeply frozen with
the array/record. Duplicate addresses are intentional holds; atlas-key uniqueness
does not prohibit repeat references. Clip capture recaptures its sequence and
checks a host-supplied opaque key, without a global/set registry or actor class.

Bounded TypeErrors contain constant descriptions, never authored input values.
No partial output or input mutation. Accessors are rejected via descriptors;
host/proxy exceptions propagate rather than being misclassified as safe failures.
No time/direction decision table applies yet: those are excluded future tasks.
No layout/origin/GPU path runs; Phase7 trim/sourcePivot limits remain unchanged.

Definitions contain no live atlas/revision/resource rights. A later host must
call resolveAtlasFrame(reference,canonicalAtlas,currentRevision.id); capture
does not assert FRAME_RESOLVED. Revisions remain Phase7 parser-issued observations,
not clip IDs or freshness guarantees. Geometry/page/source rights and visual
proof require their own later steps. This checkpoint neither loads nor resolves
real atlas bytes, and fabricates no image/frame content.

## Actual verification and manual observations

| Command | Observed result |
| --- | --- |
| node harness/cli.mjs check | exit0, ARCH_CHECK_PASS160 source files |
| node harness/cli.mjs scope --projects runtime-render --allow-infra | exit0, SCOPE_PASS; .mcp.json local-only excluded from commit |
| node harness/cli.mjs verify --projects runtime-render --with-consumers | exit0, genuine BUILD_PASS Render/Editor/Client; no unconfigured/failed build |
| npx tsc -p .artifacts/sprite-animation-v0.10.1-tsconfig.json | exit0; strict ES2022/NodeNext types:[], no DOM lib; new typed public-root consumer |
| node .artifacts/sprite-animation-v0.10.1-public-audit.mjs | exit0; emitted per-symbol declaration comparison against SA01: Render231->235 (+4), Editor138/Client0 unchanged; zero changed/removed exports |
| git diff --check | exit0 |

Manual one-off `.artifacts/sprite-animation-v0.10.1-manual.mts` consumer imports
only the installed Render public root. It prints finite observations, without
adding tests/runners/CI or production demo sources. Node24 native TypeScript
execution exited0. IDs below are explicitly hypothetical structural addresses,
not asserted real source data or resolved frames.

| INPUT | EXPECTED | OBSERVED |
| --- | --- | --- |
| Three ordered keys0012/0013/0014; mutate first input key, reverse/push caller array | Output unchanged | Exact ordered strings0012/0013/0014 retained |
| Read frozen sequence/array/frame and captured clip/sequence/array | Immutable detached values | All printed freeze observations true; direct frame write throws TypeError |
| walk/idle clip capture from one sequence | No mutable aliasing | Both sequences distinct from input/each other; nested frame detached; same original order |
| Empty/sparse, foreign project/resource, null/numeric/NaN key, unknown record/frame fields, null frame | Reject safely | TypeError, constant messages36..58 characters across observed invalid inputs |
| Record/entry accessor | No getter execution | TypeError; getter counter0 |
| 65,536 repeated references;65,537 entries | Bounded acceptance/rejection | First captures length65,536; second TypeError |
| Two identical addresses | Intentional holds preserved | Output0012/0012 |
| Captured frame with null atlas and explicit token passed to existing resolver | Structural validity does not resolve | unresolved / ATLAS_NOT_AVAILABLE |
| JSON serialization and field inspection | No native/session/bytes fields | Serializable clipId/sequence/frames only; fields frames and clipId/sequence |

NOT_OBSERVED: real atlas resolution/revision experiments, image decode, GPU
allocation/submission/pixels, timing progression, direction selection, playback,
browser behavior or visual MVP. Source review shows the new path calls only
Phase7 reference capture and immutable data operations; no graphics/IO calls.
Manual metadata observations do not establish future live readiness/acceptance.
Existing harness Node DEP0190 warning was observed; build still exited0.

## Handoff

No dependency blocker for SA02. Verified eight-way art remains a future visual
MVP prerequisite, not a metadata capture prerequisite. Next referenced task is
v0.10.2 timing/loop contracts, not supplied here; no premature implementation.
No review pause, self-merge, tag, publication or release. Rollback: revert this
additive checkpoint; existing consumers and definitions are unchanged.
