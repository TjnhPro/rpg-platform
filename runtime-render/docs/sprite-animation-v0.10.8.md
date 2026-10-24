# SA09 — shared definitions, independent actors

No public-root additions or signature changes. createSpriteAnimationPlayback now
reuses deeply frozen EightWaySpriteClip definitions issued by the canonical
Render factory. A weak issuance set records provenance only: no enumeration,
content/ID lookup, scheduling, actor membership or current playhead. Structural
host objects still pass through the existing validation/deep capture. Freezing
an arbitrary structural object is not sufficient to bypass validation.

Each playback still owns a separate clip-key Map, current snapshot, transport
state and transition guard. Disposing one clears its private Map, without
mutating the shared clip or another handle. Existing input/frame budgets apply
per playback even when definitions are shared. Readback fields already provide
selected clip (clipId), directionIndex, elapsedMs, sampledElapsedMs, frameIndex,
exact frame address, state and completed. Disposed state remains readable.
Definition identity is execution-local; no new persistence/schema is introduced.

## Ownership and one release path

| Component | Ownership |
| --- | --- |
| Caller/host | One playback and one binding per actor; explicit commands/deltas/draws; each acquired host lease must be released by its owner |
| Clip factory | Deeply immutable clip definitions; no mutable playhead or dispose operation |
| Phase10 binding | Borrows playback/instance/page lease; claims occupancy; closes on instance/session end; never disposes borrowed handles |
| Phase8 instance | Separate retained Phase7 usage after successful bind; replacement/removal/clear/session end drains that usage |
| Phase7 cache | Actual CPU page and session-local GPU allocation, shared while rights remain; no idle retention after final usage |
| Phase6 session | Native graphics lifetime and canonical terminal context-loss behavior; host controls its disposal |

The [manual actor host](../manual/sprite-instance-isolation.mts) takes ownership
of one existing instance and one acquired host lease on successful setup. It
creates one playback/binding, has one idempotent close path, and borrows the
session/Scene/cache/clips. close marks the local host closed before removing
the instance, unbinding, disposing playback and releasing the host lease. Nested
finally blocks attempt all cleanup even if an earlier step throws. A cleanup
exception remains an exception; there is no automatic retry or success claim.
Failed setup disposes the provisional playback and leaves the caller owning
instance/lease. The host must handle ready rejection and call close on failure.
It must not separately release ownership already transferred to this example.

The example stores only its own issued handles. Phase8 remains the sole
membership authority. It has no cache, renderer, timing math or actor registry.
Its inspect reads canonical membership and reports terminal membership separately
from CPU playback: session end does not automatically dispose a borrowed CPU
handle. The host's close completes that ownership, even after terminal graphics.

## Lifecycle decisions

| Operation | Behavior |
| --- | --- |
| Pause/advance A | Only A's transition changes; B advances only with its own explicit delta |
| Hide A | Phase8 visibility only; no implicit pause, elapsed reset, deletion or lease release. Host chooses whether to advance hidden actors |
| Select another declared clip on A | Existing selectClip resets A to stopped0 for a different clip, preserves direction; B unchanged. Same selection is a no-op |
| Play another declared clip | Existing play selects/restarts different clip at0, playing; B unchanged |
| Replace a definition | Definitions cannot mutate. Create a new playback with the new immutable clips, call the existing binding.replacePlayback, then dispose the old host-owned playback. Failure leaves old ownership with caller; visual holds until successful sync |
| Remove A | Existing exact-handle Phase8 removal closes A binding/releases its retained usage; host still disposes CPU playback/releases its acquired lease. B's usage remains valid |
| Async page readiness after removal | No Render acquisition continuation exists in binding. Manual host closed latch blocks sync after close; external removal is also rejected by the canonical binding's terminal guard. ID reuse cannot adopt an old handle |
| Session dispose/context loss | Phase6 terminal state drains that session's Phase7/8 rights and closes its bindings; CPU playback remains borrowed. Other sessions keep independent native allocations even for the same clip/page |
| Double close/dispose | Host close, binding unbind, playback dispose command and canonical resource/session release are idempotent. Never retry failed cleanup to claim recovery |

No timer, synchronization group, pooling, gameplay state or mandatory Server
participation. Exactly eight authored slots and SA04 same-logical-time policy
remain unchanged. SA07 authored origin and SA08 identity-local-TRS restrictions
still apply. See [checkpoint](../../harness/checkpoints/sprite-animation-v0.10.8.md)
for finite browser evidence; no complete eight-facing or product MVP claim.
