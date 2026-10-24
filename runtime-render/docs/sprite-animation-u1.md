# U1 — additive single-sequence live playback and binding

Developer explicitly approved this upstream Phase10 owner extension after VE02.
Canonical owner is runtime-render, on the existing Phase11 branch. This is not a
numbered VE03 lifecycle implementation and introduces no effect-instance store.

## Additive public delta

Twelve new root names; all previous280 root declarations preserved:

- createSpriteSequencePlayback, getSpriteSequencePlaybackSnapshot,
  commandSpriteSequencePlayback, advanceSpriteSequencePlayback;
- SpriteSequencePlayback, SpriteSequencePlaybackInput,
  SpriteSequencePlaybackSnapshot, SpriteSequencePlaybackCommand,
  SpriteSequenceAdvanceResult;
- createSpriteSequenceVisualBinding, SpriteSequenceVisualBinding,
  SpriteSequenceVisualFrameResult.

Creation accepts `{clips:readonly SpriteTimedClip[],clipId:string}`. VE02
`definition.clip` is directly usable. An issued deeply immutable timed clip is
shared through private weak provenance. Structural timed-clip data is recaptured
by the existing Phase10 factory; frameCount/durationMs must equal derived values.
No global content registry. Each playback has an independent captured clip map,
transport and snapshot. Existing limits apply: 1..256 clips, unique IDs, one
project, total captured frame budget524288, Phase10 per-sequence/timing bounds.
Different resource scopes within one project remain allowed as in the old API;
each frame is still resolved against its exact resource by binding.

Snapshot carries `directionIndex:null`, explicitly no direction. Commands are
play/selectClip/pause/resume/stop/dispose, with no setDirection. Untyped direction
commands and cross-kind/forged handles reject before mutation. Handles remain
structural TypeScript capability shapes, so runtime issuance/mode checks are
authoritative even when a caller can typecheck an inappropriate handle.

## One transport, sampler and visual admission lifecycle

Both factories enter the same private createPlayback path. Directional capture
retains the real eight-way clip; neutral capture retains the real timed clip.
Owner-local selection reads a directional slot or the single sequence. It never
materializes eight duplicate sequences or converts neutral data to an eight-way
clip. The same guarded transition/observation/snapshot functions and canonical
sampleSpriteAnimationTiming drive both modes. No alternate time accumulator,
clock, scheduler, event authority or renderer is introduced.

Old directional root signatures, unions, direction selection and completion
semantics are unchanged. Single-sequence shares them: starts stopped at0; play
same active clip does not restart, completed play restarts, different clip resets;
selecting another clip stops at0; pause freezes advancement; resume does not
revive completion; stop resets; dispose is terminal/idempotent with final readback.
Only explicit host delta advances playing state. Once clamps overshoot; repeat
keeps logical elapsed and samples remainder. Invalid/overflow/absorbed positive
delta rejects atomically through the same existing guards.

`createSpriteSequenceVisualBinding(session,scene,instance,playback)` consumes the
same SpriteAnimationVisualFrameInput, including borrowed Phase7 lease and exact
atlas/source revision, page pixels, unit ratios and authored frame origin. Its
result substitutes only the neutral playback snapshot; rejection codes are the
existing directional binding codes. No extra page decoder or resource cache.

Both binding factories call one generic owner-local createBinding/lifecycle with
the correct issued playback reader. They share instance/playback occupancy,
Phase7 geometry and Phase10 alignment, Phase8 atomic frame/transform/layout
commit, Phase6 invalidation, stale-input validation and terminal cleanup. A
directional binding cannot claim an instance already occupied by a neutral one.
Replacement validates the same kind and leaves the last visual until sync.
Unbind removes only its still-owned frame usage, never borrowed playback, lease,
session or scene; instance/session termination closes occupancy exactly as before.

No Editor/Client/Engine/Server source, L1/L2, gameplay contracts, dependencies,
package versions, formats, renderer semantics or approved source-pin policies
change. Rich VFX instance/lifetime/attachment behavior remains Phase11 work.

## Evidence boundary

[U1 checkpoint](../../harness/checkpoints/visual-effect-u1.md) records builds,
declaration audit, emitted-root consumer, real-source CPU traces and finite Chrome
binding/pixel/cleanup observations. Finite observations do not prove all possible
directional sequences, GPU native reclamation or a complete VFX MVP. U1 supplies
the previously missing neutral live seam; historical VE01/VE02 blocker statements
describe their own exact baseline, not current availability.
