# SA03 — frame timing and once/repeat contracts

**SA04 supersession:** the later supplied task replaces the future direction
switch fraction rule below with SAME logical elapsed, sampled against the target
sequence's duration. See [current directional contract](sprite-animation-v0.10.3.md).
SA03's implemented timing/sampling APIs and observations are unchanged.

Render owns pure normalization and stateless numeric policy. Existing SA02 clip
and sequence factories/types are unchanged. Nine additive root symbols:

```ts
type SpriteAnimationTimingInput =
  | { readonly fps: number; readonly frameIntervalMs?: never }
  | { readonly frameIntervalMs: number; readonly fps?: never };
interface SpriteAnimationTiming { readonly frameIntervalMs: number }
type SpriteAnimationRepeat = 'once' | 'repeat';
interface SpriteTimedClipInput {
  readonly clip: SpriteAnimationClip;
  readonly timing: SpriteAnimationTimingInput;
  readonly repeat: SpriteAnimationRepeat;
}
interface SpriteTimedClip {
  readonly clip: SpriteAnimationClip;
  readonly timing: SpriteAnimationTiming;
  readonly repeat: SpriteAnimationRepeat;
  readonly frameCount: number;
  readonly durationMs: number;
}
interface SpriteAnimationFrameSample {
  readonly elapsedMs: number;
  readonly frameIndex: number;
  readonly completed: boolean;
}
createSpriteAnimationTiming(input: SpriteAnimationTimingInput): SpriteAnimationTiming;
createSpriteTimedClip(input: SpriteTimedClipInput): SpriteTimedClip;
sampleSpriteAnimationTiming(timing: SpriteAnimationTiming, frameCount: number,
  repeat: SpriteAnimationRepeat, elapsedMs: number): SpriteAnimationFrameSample;
```

Timing accepts exactly one own enumerable data field, fps OR frameIntervalMs.
Both present rejects even if equal or one is undefined. Neither, unknown/symbol
fields, accessors, nonplain records and coerced numeric strings reject. FPS is
finite positive and normalized as1000/fps; interval input is already milliseconds.
Only normalized frameIntervalMs remains. Input and normalized result must pass
the bounds below. All known rejections are constant bounded TypeErrors without
authored input. Host/proxy exceptions propagate. No new error union is introduced.

The timed clip factory recaptures the existing basic clip, then derives frameCount
from its actual ordered sequence and durationMs from count*interval. Callers cannot
inject either derived field. Its repeat property follows this task's actual name;
SA01's future mode field remains a proposal, not another implemented loop setting.
Clip identity and opaque frame order survive unchanged. All output/nested data is
detached/frozen. No capability issuance, mutable registry or disposal is needed.

## Numeric admission and precision

- Interval range: inclusive1e-6..Number.MAX_SAFE_INTEGER ms. The lower bound is
  one nanosecond, an explicit presentation admission policy excluding subnormal
  and sub-nanosecond intervals, not a claim about timer or display precision.
- Frame count: integer1..65,536, matching SA02/Phase7 capacity.
- Duration count*interval: finite positive, at most Number.MAX_SAFE_INTEGER ms.
  Larger products reject, never saturate. FPS division overflow and normalized
  intervals below/above bounds reject before composition. No zero/NaN/Infinity.
- Explicit elapsed: finite0..Number.MAX_SAFE_INTEGER ms; negative zero becomes
  positive zero in samples. Invalid elapsed rejects even for a completed once
  descriptor. No integer quantization of fractional milliseconds.

These are binary64 values, not exact rational time. Normalization rounds once;
FPS/interval producing the same binary64 duration have identical policy. Products
and `%` use JavaScript numeric arithmetic. Long horizons can lose fine temporal
resolution; these admission limits do not guarantee nanosecond resolution at large
elapsed values, perfect loop phase recovery, or universal equality for rationally
equivalent FPS inputs. Hosts choose meaningful elapsed precision. No epsilon,
silent decimal rounding, timer-derived quantization or whole-loop accumulation.

## Half-open policy, no playhead

Let I=interval, N=frameCount and D=N*I. The stateless sampler validates its inputs,
computes once t=min(elapsed,D) or repeat t=elapsed%D, then returns a detached frozen
sample. Once completes at elapsed>=D and retains indexN-1; repeat never completes.
For t<D, frame k owns [k*I,(k+1)*I). These boundaries are binary64 products.
The implementation finds the greatest boundary<=t with at most17 binary-search
comparisons, rather than allowing division rounding to select a later frame.
This is the half-open floor rule with explicit representable-boundary semantics,
not an epsilon band. No loop visits every skipped frame or accumulated cycle.

Observed examples, N4 and I125ms (8FPS):

| Explicit elapsed | once index / elapsed / completed | repeat index / elapsed / completed |
| --- | --- | --- |
| 0 |0 /0 /false |0 /0 /false |
| 124.999 |0 /124.999 /false |0 /124.999 /false |
| 125 |1 /125 /false |1 /125 /false |
| 499 |3 /499 /false |3 /499 /false |
| 500 |3 /500 /true |0 /0 /false |
| 625 |3 /500 /true |1 /125 /false |
| 1000 |3 /500 /true |0 /0 /false |

Observed fractional example: I0.1, elapsed0.3 selects index2, while elapsed3*0.1
(0.30000000000000004) selects index3. This documents binary64 boundaries, not
exact-decimal arithmetic. Repeated independent calls125,0,125 produce1,0,1;
there is no retained elapsed or monotonic scheduling requirement.

## Future switch policy lock (not implemented transport)

| Future operation | Policy preserved from SA01 |
| --- | --- |
| Same exact clip in same captured set | No-op, retain progress and transport |
| Different clip | Reset time0/frame0, stopped; host explicitly plays |
| Different direction of same clip | Preserve normalized fraction t/D and transport, including completed final frame; no restart |
| Stop/reset | Reset0; subsequent play is explicit |

Future remapping must validate finite in-range arithmetic; unrepresentable repeat
end-boundary remaps reject rather than silently wrapping/restarting. No switch,
direction mapping, live playhead or transport method exists here. The sampler
does not accumulate delta, call callbacks, allocate a session, invalidate a scene,
read render receipts/frame count clocks or read Date/performance/RAF. Sample
completed is presentation policy only and never triggers gameplay consequences.

No delay/reverse/ping-pong/repeat-count/speed curve/per-frame duration is accepted.
Metadata validity still does not establish Phase7 FRAME_RESOLVED, PNG/GPU readiness
or pixels. [Checkpoint evidence](../../harness/checkpoints/sprite-animation-v0.10.2.md)
records finite public-root observations; visual MVP remains unverified.
