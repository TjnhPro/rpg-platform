# SA05 — playback state and commands

Runtime Render owns independent CPU playback. Editor and Client use the same
public root; no host implements transitions. Eight additive root symbols:
SpriteAnimationPlaybackState, SpriteAnimationPlayback, SpriteAnimationPlaybackInput,
SpriteAnimationPlaybackSnapshot, SpriteAnimationPlaybackCommand,
createSpriteAnimationPlayback, getSpriteAnimationPlaybackSnapshot,
commandSpriteAnimationPlayback. Existing exports/signatures remain unchanged.

```ts
const playback = createSpriteAnimationPlayback({
  clips: [idle, walk], // canonical EightWaySpriteClip definitions
  clipId: 'idle', directionIndex: 0,
});
commandSpriteAnimationPlayback(playback, { type: 'play', clipId: 'walk' });
commandSpriteAnimationPlayback(playback, { type: 'pause' });
commandSpriteAnimationPlayback(playback, { type: 'resume' });
commandSpriteAnimationPlayback(playback, { type: 'setDirection', directionIndex: 5 });
const snapshot = getSpriteAnimationPlaybackSnapshot(playback);
commandSpriteAnimationPlayback(playback, { type: 'dispose' });
```

## Capability, definitions and readback

Creation captures 1..256 unique exact clip keys from an ordinary dense array.
Every definition goes through createEightWaySpriteClip; all clips share a project.
Aggregate limit524,288 frame references, in addition to SA02/SA04 per-sequence
bounds. No new named animation-set/catalog/schema is introduced. The private Map
is the handle's single definition lookup, not a second lookup cache or Scene
registry. Definitions are detached/frozen and cannot be replaced in place.

The frozen handle contains only an ephemeral symbol ID. A private WeakMap checks
issued object identity; copied IDs/objects, proxies around handles and handles
from another package instance are foreign. It is not an enumerable active list
or lookup by authored/global ID. Each handle has independent state and lifecycle.

Snapshot: id, projectId, clipId, directionIndex, state, elapsedMs,
sampledElapsedMs, frameIndex, frame and completed. State is stopped, playing,
paused, completed or disposed. The frame is a captured Phase7 VisualFrameReference
address, **not** evidence of frame existence, current revision, geometry or texture.
Snapshot and nested frame are frozen historical values; reads need not allocate.
No snapshot may be imported as mutable authoritative playback state.

## One transition path

| Command / condition | Result |
| --- | --- |
| create | stopped, logical0, selected direction's first frame |
| play with same actively playing clip | No-op, same snapshot; no reset |
| play same paused clip | playing, retain logical time/frame |
| play different clip | playing, reset logical0, retain explicit direction |
| play completed clip | Explicit replay, reset0 and playing |
| selectClip same key | No-op, including transport |
| selectClip different key | stopped at0 in new clip; retain direction |
| pause playing | paused, preserve time/frame |
| pause stopped/paused | No-op |
| resume paused and not completed | playing, preserve time/frame |
| resume stopped/completed | No replay; no-op |
| stop | stopped at0, first frame of current direction; keep clip/direction |
| setDirection0..7 | Preserve logical time and transport; resample target count |
| dispose | Terminal disposed readback; release private clip collection |
| dispose again | Same terminal snapshot |
| other command after dispose | TypeError, preserve terminal snapshot |

SA03 is the sole frame/completion sampler. Logical elapsed is distinct from its
repeat remainder/once-clipped sampledElapsedMs. setDirection never substitutes a
slot, restarts or rescales elapsed; SA04's SAME-logical-time rule holds. Completion
is target-local: the sample controls completed/readback and the final once frame.
Underlying playing/paused transport is preserved across direction selection;
choosing a longer direction may no longer be completed at the same logical time.
Explicit play from completed resets; resume does not replay. No gameplay effects.

All commands pass through one synchronous capture/validate/candidate/commit
function. Closed plain records, own enumerable data fields only; unknown command,
extra state/delta fields, missing clip and invalid direction reject with bounded
TypeError. Invalid requests preserve the prior snapshot. Same-handle reentrancy
is rejected before any nested read/transition; the guard clears in finally even
after host/proxy exceptions. Unknown host traps propagate without state commit.
No callback, async queue or concurrent competing state writer is introduced.

## Scope and observation limits

There is deliberately no elapsed advance/seek/import. All newly created handles
remain at logical0 through SA05 commands. Nonzero pause/resume/direction behavior,
once completion and replay from an actually completed handle therefore cannot yet
be observed through this checkpoint's public surface. Their transition rules are
implemented, but live observations await the separately supplied v0.10.5 delta
task; no fake completed handle or extra clock is introduced to claim evidence.

The future adapter can read selected frame identity through this snapshot and
use existing Phase7/8 public APIs. This checkpoint acquires no atlas, source,
texture, lease, graphics session or Visual Instance; disposal is CPU-only and
does not dispose host resources. No Scene/camera/placement/origin change, elapsed
loop, renderer, events, gameplay state query or animation-name inference.

See [checkpoint evidence](../../harness/checkpoints/sprite-animation-v0.10.4.md).
Actual frame metadata readback was resolved manually against original source;
eight artwork facings, PNG/GPU/browser pixels remain VISUAL_NOT_VERIFIED.
