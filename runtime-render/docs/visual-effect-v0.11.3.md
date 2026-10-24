# v0.11.3 — Effect Playback Controls (VE04)

Primary owner: runtime-render. Commands operate on the Phase10 U1 playback already
owned by each VE03 effect. There is no VFX ticker, elapsed accumulator, direction,
advance API, event dispatch, binding, resource load or renderer in this change.

## Additive public contract

Six new root names: `commandVisualEffectPlayback`,
`getVisualEffectPlaybackSnapshot`, `getVisualEffectPlaybackFailure`,
`VisualEffectPlaybackCommand`, `VisualEffectPlaybackSnapshot`,
`VisualEffectPlaybackFailure`. All previous root declarations remain unchanged,
including VE03 lifecycle snapshots/errors and Phase10 directional/neutral APIs.

```ts
import {
  commandVisualEffectPlayback, getVisualEffectPlaybackSnapshot,
  type VisualEffectInstance,
} from '@rpg-platform/runtime-render';

export function control(effect: VisualEffectInstance) {
  commandVisualEffectPlayback(effect, { type: 'play' });
  commandVisualEffectPlayback(effect, { type: 'play' }); // same playing track
  commandVisualEffectPlayback(effect, { type: 'pause' });
  const paused = getVisualEffectPlaybackSnapshot(effect);
  commandVisualEffectPlayback(effect, { type: 'resume' });
  commandVisualEffectPlayback(effect, { type: 'stop' }); // retained, hidden
  const restarted = commandVisualEffectPlayback(effect, { type: 'restart' });
  return { paused, restarted };
}
```

The caller creates an issued VE02 definition and a VE03 effect in an existing
Phase6/8 scene/session first. No mutable playback handle is exposed.

## Command admission and transitions

Input is a closed plain record of enumerable data properties. `type` is required.
Only play/restart allow an optional `clipId`; omission means the definition's sole
declared clip. Explicit clipId must equal that clip, including exact string type.
There is no clip switch or resource override. Unknown clips reject
CLIP_NOT_DECLARED; unknown commands, extra resource fields, accessors, arrays and
malformed records reject INVALID_COMMAND. Resources must be declared/captured in
the definition; these commands cannot invent a missing clip or source.

| Command | Live-state behavior |
| --- | --- |
| play | New/stopped starts frame0; same playing track preserves the canonical snapshot/time; paused resumes; completed follows Phase10 replay at0 |
| pause | Playing becomes paused with unchanged frame/time; already paused is idempotent; stopped/completed reject INVALID_TRANSITION |
| resume | Paused continues unchanged frame/time; already playing is idempotent; stopped/completed reject INVALID_TRANSITION |
| stop | Canonical stop resets time/frame to0 and Phase8 visibility becomes false; instance/definition/playback remain owned for replay |
| restart | Canonical stop then play, resetting to frame0/time0 even on a playing track; Phase8 visibility becomes true |

Play also sets Phase8 visibility true. Pause/resume preserve host-selected
visibility; pausing does not hide. Active is true for a retained playing/paused
transport, and false for stopped/disposed or removed effects. The defensive
completed observation retains the last frame/active intent until stop/replay;
VE04 cannot advance an effect to completion. Automatic lifetime, duration,
completion/removal policies and explicit host-delta integration belong to VE05.
No completion or command triggers gameplay consequences.

Stop differs from remove: stop keeps canonical scene membership and allows play
or restart; remove remains terminal, disposes owned playback and releases only
its existing Phase8 membership. A removed handle cannot be restarted. No borrowed
scene/session or another effect's playback is disposed by these controls.

## Readback, resources and failures

Frozen snapshot contains:

- `instance`: existing VE03 snapshot, including effect instance symbol ID,
  effectId, scene/session IDs, lifecycle state and terminal reason.
- `playback`: actual frozen `SpriteSequencePlaybackSnapshot`, including clipId,
  state, directionIndex:null, logical elapsedMs, sampledElapsedMs, frameIndex,
  exact project/resource/subresource frame address and completed flag.
- `active`: transport intent only, independently of visibility/readiness.
- `resourceReadiness: 'NOT_CHECKED'`: these controls do not load or resolve pixels.

The canonical snapshot is read-only data, not a mutable internal object or an
issued capability. Its nested address is also frozen. Removal keeps only final
disposed playback readback, not the live playback/definition. Historical snapshots
remain detached. A selected declared frame is not a resolved/ready atlas frame;
source existence, revisions, leases and binding still need the Phase7/8/10 path
in the later visual-binding task. Play success is logical transport admission,
never successful source loading, rendered pixels or VFX readiness.

`getVisualEffectPlaybackFailure(error)` recognizes only new owner-issued control
errors. Codes: INVALID_COMMAND, INVALID_TRANSITION, CLIP_NOT_DECLARED,
FOREIGN_INSTANCE, INSTANCE_REMOVED, SESSION_ENDED, TRANSITION_IN_PROGRESS.
Explicit removal, clear and scene disposal reject commands as INSTANCE_REMOVED;
session/context end rejects SESSION_ENDED. Readback remains available for either.
Existing canonical scene/edit/native errors may propagate with their original
diagnostics; `getVisualEffectInstanceFailure` remains unchanged.

A per-effect synchronous command guard rejects nested control calls. Input
reflection can remove the effect/end its scene; live membership/session admission
is checked again after capture. Validated commands set visibility through Phase8
before changing CPU transport. Native visibility failure therefore does not
advance transport. Canonical stop/play restart has no host callback between its
two synchronous transitions and uses the already captured issued clip. Unexpected
native errors are not translated into success. No cross-resource transaction or
fault-injected native rollback guarantee is claimed.

## Compatibility and evidence

Render302 → 308, six additive roots; no old root declaration changes/removals
across the five projects. Only the VE03 owner module and root re-exports change
in production. No Phase10 implementation change, dependency/pin/schema change,
Engine/L1/L2 call or consumer production change.

[Checkpoint](../../harness/checkpoints/visual-effect-v0.11.3.md) records actual
builds and finite manual observations. Effect command states/visibility were
observed at elapsed0 in real graphics sessions. Fractional pause/resume and
nonzero reset were observed through a separate actual Phase10 public handle,
not an effect's owned handle. Nonzero effect progress remains NOT_OBSERVED until
explicit VFX advance is authorized. Full VFX FEATURE_NOT_VERIFIED;
VISUAL_NOT_VERIFIED / NOT_DRAWN.
