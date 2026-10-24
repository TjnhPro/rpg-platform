# v0.11.4 — Loop, Duration & Completion (VE05)

Canonical owner: runtime-render. Host supplies explicit deltas. One owned Phase10
single-sequence playback supplies both frame sampling and accumulated run time;
there is no second VFX timer, elapsed accumulator, scheduler or per-frame loop.
Presentation lifetime has no gameplay authority.

## Additive public root

Functions: `createVisualEffectTimedInstance`, `getVisualEffectLifetimeSnapshot`,
`advanceVisualEffectInstance`, `getVisualEffectLifetimeFailure`.
Types: `VisualEffectTimedInstanceInput`, `VisualEffectCompletionReceipt`,
`VisualEffectLifetimeSnapshot`, `VisualEffectAdvanceResult`,
`VisualEffectLifetimeFailure`.

All prior root declarations are preserved. Existing create/commands/remove are
used for once and indefinite repeat; the additive timed factory admits only
repeating definitions with explicit durationMs. It creates through the same VE03
admission/ownership path, not a new registry or session/scene factory.

```ts
import {
  createVisualEffectTimedInstance, commandVisualEffectPlayback,
  advanceVisualEffectInstance, getVisualEffectLifetimeSnapshot,
  type RenderFrameSession, type RenderVisualScene, type VisualEffectDefinition,
} from '@rpg-platform/runtime-render';

export function startAura(session: RenderFrameSession, scene: RenderVisualScene,
  repeatingDefinition: VisualEffectDefinition) {
  const effect = createVisualEffectTimedInstance(session, scene, {
    definition: repeatingDefinition, visualInstanceId: 'aura', durationMs: 3000,
  });
  commandVisualEffectPlayback(effect, { type: 'play' });
  const first = advanceVisualEffectInstance(effect, 187.5);
  commandVisualEffectPlayback(effect, { type: 'pause' });
  advanceVisualEffectInstance(effect, 1000); // time/frame remain at 187.5
  commandVisualEffectPlayback(effect, { type: 'resume' });
  const completed = advanceVisualEffectInstance(effect, 2812.5);
  return { effect, first, completed, history: getVisualEffectLifetimeSnapshot(effect) };
}
```

## Modes and state

| Mode | Admission | Completion boundary |
| --- | --- | --- |
| once | Existing create with definition.clip.repeat once | Canonical clip duration, inclusive |
| repeat | Existing create with definition.clip.repeat repeat | None; explicitly stop/remove |
| timed-repeat | New timed factory with repeat definition and finite durationMs | Active run elapsed >= durationMs |

The normalized clip's duration is the cycle duration, not a loop's total lifetime.
Snapshot durationMs is the clip duration for once, null for indefinite repeat,
and the supplied presentation limit for timed-repeat. The modes are exclusive;
once plus an independent timeout rejects INVALID_MODE, so there is no competing
clip-end/timeout race. At coincident loop-cycle/timeout boundaries, duration wins
once; the receipt stores Phase10's actual repeat sample at the boundary (which
may be frame0), with reason duration-elapsed. It does not synthesize a final
once frame. Once receipts have reason clip-completed and the canonical final
frame. Completion is not a skill/buff/cast event.

Lifetime snapshot has instance correlation, mode, state, durationMs, elapsedMs,
canonical playback observation and optional completion receipt. States are
stopped/playing/paused while retained, completed after automatic retirement,
removed after explicit removal or scene/session end. It exposes no mutable
playback handle, lease, definition store or native object.

Pause freezes the sole canonical run elapsed and frame. Valid deltas while paused
or stopped are no-ops; wall time with no calls changes nothing. Resume continues.
Stop retains membership but hides it using VE04, resets the run elapsed to0 and
freezes advancement. Play/restart starts a fresh run after stop; restart resets
both frame and lifetime via canonical stop/play. Repeated play preserves the same
playing run. No total age across stopped/restarted runs is maintained.

## Numeric admission and deterministic advance

Input duration is a closed plain three-field record: issued definition, explicit
visualInstanceId and durationMs. Properties must be enumerable data fields; no
unknown fields/accessors. Duration must be finite within 0.000001..MAX_SAFE_INTEGER
milliseconds, matching Phase10's supported temporal resolution/horizon. Invalid
duration/mode rejects before allocating membership/playback/listeners.

Delta must be a primitive finite number in 0..MAX_SAFE_INTEGER, including while
paused/stopped or reading completed history. Invalid values reject before commit.
Zero is a no-op. For a playing bounded effect, admitted delta is
min(requested delta, remaining lifetime); overshoot is intentionally discarded.
One canonical advance computes the sample and validates representable accumulated
time. Indefinite repeat passes the full delta; canonical overflow/absorbed-positive
delta RangeError propagates without state change. No Number coercion, epsilon,
per-frame iteration or callback per traversed frame.

Time uses Phase10 binary64 rules. Exactly representable deltas reaching the same
accumulated boundary have identical terminal time/address; different summation
orders can round differently. No universal epsilon/partition invariance is
claimed for arbitrary fractional inputs. Rejected increments that cannot advance
the existing representable time do not silently consume a lifetime budget.

Per-call result is frozen {snapshot, frameChanged, completedNow}. frameChanged
compares selected addresses across this call, not every traversed frame. It may
differ between a large call and the last of many small calls even with identical
terminal snapshots. completedNow is true only on the first completing call;
subsequent valid advances on completed history return false without mutation or
cleanup. This is a return value, not a queued/global completion event.

## Terminal ownership and compatibility

Completion stores a frozen detached receipt with instanceId, reason, canonical
elapsedMs and the final pre-disposal playback snapshot. It then uses VE03's one
end path: publish terminal membership state, unlink listener/correlation, dispose
owned playback and remove the Phase8 membership. Phase8 releases its own retained
Phase7 usage and removes its drawable. VFX never releases another consumer's
rights or the borrowed scene/session. Receipt data retains no active resource
capability. Cleanup uncertainty sticks in the existing instance snapshot and
throws existing CLEANUP_FAILED after terminal publication; receipt remains
inspectable. Native cleanup failure cannot be assumed to reclaim GPU memory.

Backward-compatible VE03 snapshot reports removed/reason removed after automatic
retirement; VE04 readback reports disposed/active:false. The additive lifetime
snapshot/receipt distinguishes completed from ordinary removed and stopped,
without widening old unions. Valid advance after completed remains idempotent;
commands, including restart, reject with existing INSTANCE_REMOVED. A new instance
is required for replay. Explicit remove after completion returns false and keeps
completion history. Scene/session end of a live effect produces removed with no
completion receipt; advance then rejects INSTANCE_REMOVED/SESSION_ENDED.

Existing per-effect synchronous command guard also protects advance. Capture
and native session health guards remain canonical. There is no late async load
commit path in VE05. Existing frame/resource binding APIs are not invoked by VFX
advance; visual synchronization remains VE08. Any visual draw requires the actual
Phase7/8/10 binding path and resource readiness. No pixels are implied by a frame
address or by effect completion.

getVisualEffectLifetimeFailure recognizes INVALID_DURATION/INVALID_MODE/
INVALID_DELTA. Prior instance/playback failure readers and native/canonical
errors retain their existing contracts. Production edits are limited to the
effect owner module and root exports; no Phase10 implementation changes,
Engine/L1/L2 calls, authored schema, dependency/pin changes or second renderer.

[Checkpoint evidence](../../harness/checkpoints/visual-effect-v0.11.4.md) records
real session timing and retained-resource release observations. VFX pixels and
native allocation reclamation remain VISUAL_NOT_VERIFIED / NOT_DRAWN.
