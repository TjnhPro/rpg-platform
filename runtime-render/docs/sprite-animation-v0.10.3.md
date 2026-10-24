# SA04 — exact eight-direction mapping

Render root now exports six types and three functions:

```ts
type SpriteDirectionIndex = 0|1|2|3|4|5|6|7;
type SpriteDirectionSequences = readonly [SpriteFrameSequence, SpriteFrameSequence,
  SpriteFrameSequence, SpriteFrameSequence, SpriteFrameSequence, SpriteFrameSequence,
  SpriteFrameSequence, SpriteFrameSequence];
interface SpriteEightWayConvention {
  readonly axes: VisualOrientation2D['axes'];
  readonly directionZeroAngleRadians: number;
  readonly zeroIndex: SpriteDirectionIndex;
}
interface EightWaySpriteClipInput {
  readonly clipId: string;
  readonly timing: SpriteAnimationTimingInput;
  readonly repeat: SpriteAnimationRepeat;
  readonly convention: SpriteEightWayConvention;
  readonly directions: SpriteDirectionSequences;
}
interface EightWaySpriteClip {
  readonly clipId: string;
  readonly timing: SpriteAnimationTiming;
  readonly repeat: SpriteAnimationRepeat;
  readonly convention: SpriteEightWayConvention;
  readonly directions: SpriteDirectionSequences;
}
interface EightWaySpriteFrameResolution {
  readonly direction: SpriteDirectionIndex;
  readonly sequence: SpriteFrameSequence;
  readonly sample: SpriteAnimationFrameSample;
  readonly resolution: AtlasFrameResolution;
}
createEightWaySpriteClip(input: EightWaySpriteClipInput): EightWaySpriteClip;
selectEightWaySpriteDirection(convention: SpriteEightWayConvention,
  orientation: VisualOrientation2D): SpriteDirectionIndex;
resolveEightWaySpriteFrame(clip: EightWaySpriteClip, orientation: VisualOrientation2D,
  elapsedMs: number, atlas: AtlasMetadata|null,
  expectedRevision: symbol): EightWaySpriteFrameResolution;
```

## Capture and authority

Exactly eight ordinary dense tuple entries, uniquely occupying indexes0..7, are
mandatory. No extra entry, hole, inherited index, getter or unknown record field.
Each explicit sequence goes through SA02/SA03 capture and duration validation;
all output is detached/frozen. Repeated authored references/sequences are allowed,
but never synthesized as missing-slot fallback. Each slot may have a different
count/resource; every sequence retains one resource scope and all eight share
one project. One clipId, interval and repeat policy apply to the logical clip.
Each sequence admits1..65,536 entries, at most524,288 across eight slots.

Factories validate metadata, not existence/revision. No revision symbol enters
portable definitions. The pure frame resolver recaptures the complete mapping,
selects a slot, applies SA03 sampling, and calls Phase7 resolveAtlasFrame with
the selected reference and caller-supplied atlas/token. Only that selected frame
is resolved; no claim that all frames/other resources were resolved. Wrong token,
resource/project, unsupported/copy atlas, missing frame or absent atlas preserves
Phase7's typed unresolved result; invalid input shapes/angles/time throw bounded
TypeError. Consumers must inspect resolution.status before using a resolved frame.
Unknown host/proxy exceptions propagate. No legacy diagnostic union changes.

Resource/atlas identity is never inferred from filename, dimensions or source
arrival order. Same project can have several resources; host supplies the correct
canonical atlas for the selected one. Historical atlas/token pairs observe history,
not external freshness. Scene IDs, globals, loaders, graphics/session capabilities
and mutable registries are absent. No Scene object/placement/facing authority is
changed. Pure sampling does bounded data capture, not an optimized live draw loop.

## Canonical angular rule

Phase4 createVisualOrientation2D remains authoritative: angle is finite [0,2π),
zero numeric+x, increment toward positive numeric+y. right/down and left/up are
clockwise on screen; right/up and left/down counterclockwise. Convention and facing
axes must exactly match. Invalid angles reject before relative normalization;
negative/full-turn input is never silently wrapped.

Centers are zeroAngle+k*(2π/8), mapped to (zeroIndex+k)%8. Normalize only the
relative angle modulo one turn. Nearest-center sectors are lower-inclusive and
upper-exclusive, exact halfway ties advancing in positive angular order. Compare
relative angle directly to (k+0.5)*π/4 boundaries, at most8 comparisons; do not add
half a sector to input and round a just-below value forward. Arithmetic is binary64;
relative subtraction/wrap and boundary products can round, especially for shifted
zero. There is no arbitrary epsilon band or exact-real-angle precision guarantee.

| right/down, zeroAngle0, zeroIndex0 | Selected slot |
| --- | --- |
| 0°,45°,90°,135°,180°,225°,270°,315° |0,1,2,3,4,5,6,7 |
| π/8 minus Number.EPSILON |0 |
| π/8 (22.5°) |1 |
| 3π/8 (67.5°) |2 |
| 15π/8 (337.5°) |0 |
| zeroIndex3, angle0 |3 |
| zeroAngleπ/2, zeroIndex3, angleπ/2 or0 |3 or1 |

For different asset orders author the tuple explicitly. No JX1 direction convention
is presumed; no sorting, flip, mirror, blending,16/32 setting or missing fallback.

## Same logical elapsed — explicit task supersession

The supplied SA04 task supersedes SA01/SA03's proposed cycle-fraction preservation.
No prior implemented playback API changes. A host retains the SAME logical elapsed
when facing changes, then samples the target sequence's count with existing SA03
once clamp/repeat modulo. Never pass the prior direction's clipped/modulo sample
as the new logical elapsed; the host must retain the original time independently.

Observed at elapsed375ms, interval125ms:

| Target count | repeat sample | once sample |
| --- | --- | --- |
| 2 (D250ms) | index1, remainder125, incomplete | index1, clipped250, completed |
| 4 (D500ms) | index3, remainder375, incomplete | index3, elapsed375, incomplete |

No reset/rescale/transport state exists in this stateless operation. In particular
sample.completed is target-local once policy; it is not a retained terminal handle
state. Future playback must honor logical time and explicitly reconcile transport
with this policy. Same-clip no-op/different-clip reset proposals are unaffected.
Timing/count/elapsed limits and binary64 precision remain SA03-owned.

## Evidence boundary

Eight explicit distinct key sequences were resolved from original Attack1_0
metadata in a deliberately nonstandard order. This proves authored selection and
metadata lookup, not that those keys depict eight facings. No real eight-way art
or pixels were verified. [Checkpoint](../../harness/checkpoints/sprite-animation-v0.10.3.md)
records source hash, finite manual observations and build evidence. No clock,
playback instance, rendering, gameplay direction/movement or test suite was added.
