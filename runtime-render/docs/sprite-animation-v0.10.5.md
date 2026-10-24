# SA06 — deterministic explicit delta advancement

Two additive Render-root exports, with all old types/signatures unchanged:

```ts
interface SpriteAnimationAdvanceResult {
  readonly snapshot: SpriteAnimationPlaybackSnapshot;
  readonly frameChanged: boolean;
  readonly completedNow: boolean;
}
advanceSpriteAnimationPlayback(handle: SpriteAnimationPlayback,
  deltaMs: number): SpriteAnimationAdvanceResult;
```

The function uses the existing issued handle, captured definitions, busy guard
and single capture/validate/candidate/commit transition mechanism. No parallel
playback state or sampler. The old SpriteAnimationPlaybackCommand union remains
closed and unchanged: passing an untyped advance command to the old command API
still rejects. Hosts use the new entrypoint; no existing consumer migration.

## Time and transport

Delta must be a primitive finite number within0..Number.MAX_SAFE_INTEGER ms;
zero and negative zero are valid no-ops. Invalid delta raises TypeError even
while paused/stopped/completed. Foreign/disposed capabilities reject through the
existing lifecycle checks. Rejections preserve the prior snapshot/transport.

Only state playing advances. Paused, stopped and target-local completed-once
return the same snapshot with false change flags for any valid delta. Zero
also returns the same snapshot. No clock, counter, scheduler, timer or callback.

For playing, candidate logical time is elapsedMs+deltaMs. RangeError if the sum
exceeds MAX_SAFE_INTEGER, becomes nonfinite or a positive delta is absorbed by
binary64 addition (sum<=old elapsed). Validate this sum before once clipping:
oversized accumulation rejects even if a short once clip could otherwise clamp.
No state is partially written. Repeat retains the full bounded logical time,
not just the target's modulo remainder. Once advance clamps logical time to the
current direction's duration and discards overshoot; completion holds its final
frame. Explicit play from completed resets0; resume/advance do not replay.

SA03 alone computes sampledElapsedMs, frameIndex and completed. Repeat modulo
and at most17 binary-search comparisons select the final frame directly, with
no iteration over elapsed frames or cycles. Advance adds constant overhead,
independent of delta/cycle count, and does not recapture the definition collection.

setDirection preserves the SAME logical time and underlying transport from SA05,
then resamples the new target duration. It never copies sampledElapsedMs back
into logical elapsed. For example, repeat logical375 on4 frames gives index3;
switch to2 frames gives remainder125/index1, while logical time stays375.
Once direction selection may produce completed at logical375/sample250 for the
short target. Advance there is a no-op. Selecting the longer target can produce
playing again at375; another125 completes it at500. No cycle-fraction rescale.

## Fractional precision

Fractional milliseconds remain in logical time between calls; no flooring to
integer milliseconds or discarding sub-frame remainder. At125ms/frame,62.5+62.5
and one125 both select frame1 with logical125. Binary64 addition/modulo/product
rounding still applies: ten0.1 advances produced0.9999999999999999 versus1 for a
single1 advance, difference1.1102230246251565e-16 ms, both frame0 at this interval.
Accumulated sums can straddle a half-open frame boundary by rounding; there is
no exact-rational/partition-invariant index guarantee at such discontinuities.
No epsilon snapping changes SA03's canonical product boundary rules.

Large repeat logical time has a finite horizon because reducing it modulo the
current direction would lose information needed by differently sized directions.
At the horizon, hosts may explicitly stop then play to restart; no implicit reset.
Tiny absorbed deltas reject rather than silently claim progress. Supported timing,
duration/frame-count limits remain SA03-owned. No speed/time-scale feature added.

## Change observation and future draw seam

Each frozen result describes only this call. frameChanged compares selected
projectId/resourceId/subresourceId addresses before versus after; it is false for
a repeated authored hold or whole-cycle return to the same frame, even if elapsed
or frameIndex changed. completedNow is false->true target completion caused by
this advance, independently of frameChanged. Later completed no-ops report false;
snapshot.completed remains true. Intermediate skipped frames are not events.

Historical snapshots/results remain frozen after later commands. No Phase6
invalidation is called here; a future adapter can use frameChanged to decide
whether to update existing presentation and explicitly invalidate. A false flag
does not prove a native frame is current: resize/camera/other Scene changes have
their own invalidation. Completion observation is presentation-only and does not
settle gameplay. No frame submission, resource acquisition or Visual Instance
binding; frame addresses still need Phase7 atlas/revision validation.

See [checkpoint](../../harness/checkpoints/sprite-animation-v0.10.5.md) for finite
manual evidence, builds and numerical limits. GPU/browser pixels and real
eight-direction artwork remain VISUAL_NOT_VERIFIED. Next scope is supplied
separately; no frame-origin alignment is implemented here.
