# v0.11.8 VE09 — Resource lifetime and diagnostics

The effect owns its stopped/playing U1 playback, its Phase8 drawable membership,
attachment subscriptions and U1 binding. It borrows scene, session, atlas and
the host's acquired Phase7 lease. Phase8 owns one independently retained usage
per bound drawable. Removing an effect releases that usage, not the host lease
or another consumer's texture rights. No cache/lease semantics change.

## Ownership audit and terminal policy

| Path | Responsibility |
| --- | --- |
| Once/timed completion | Record completion, retire effect, unbind U1, dispose playback, remove drawable/retained usage |
| Stop | Hide drawable and reset transport under VE04; retain playback, membership and resource usage for restart |
| Explicit remove | Mark terminal before cleanup, attempt every owned cleanup; repeated remove is false |
| Attached target deletion | Existing VE07 remove-effect policy; unsubscribe and terminalize once |
| Scene clear/disposal | Phase8 drains membership and retained usages; effect end notification unlinks U1/playback; never disposes session |
| Session/context loss | Phase6/7/8 revoke rights; membership end terminalizes effects, no restoration or automatic rebind |
| Load rejection | Host observes lease result/failure, decides removal or retry, releases its acquired lease in finally |
| Late async completion | Host owns outstanding read/promise/lease; retired effect rejects sync before resource admission, host releases settled rights |

U1 unbind only removes its playback/drawable association. Phase8 removes native
drawable and releases retained usage in its existing cleanup path. Phase7 retains
CPU/GPU entries only while owners exist, with bounded admission (CPU <=1024,
GPU <=4096, revision guards <=4096). Explicit invalidation pins future acquisitions
to the new revision; existing rights remain pinned. Same-revision invalidation
does not force reload. No per-effect cache invalidation or texture.release is used.
Native texture final release remains Phase7/session-owned.

Explicit effect remove and completion now attempt every cleanup then rethrow
the first original exception unchanged, including unrecognized host/native errors.
Terminal snapshots retain only cleanupFailed, never that exception. Owner-local
membership/target end broadcasts remain nonthrowing so other members can drain;
their cleanup uncertainty is sticky. The Phase8 initiating operation retains its
own error behavior. Creation rollback preserves its original admission exception.
No GPU reclamation receipt is implied by successful removal.

## Additive public surface

Nine roots are added (Render330→339); previous declarations remain unchanged:

- getVisualEffectDiagnostic / VisualEffectDiagnostic
- getVisualEffectDiagnosticsSnapshot / VisualEffectDiagnosticsSnapshot
- VisualEffectResourceObservation
- getVisualEffectWorkSnapshot / VisualEffectWorkSnapshot
- getVisualEffectWorkFailure / VisualEffectWorkFailure

getVisualEffectDiagnostic classifies caught exceptions only. Existing Phase6/7/8
owner brands take precedence, followed by effect definition/instance/playback/
lifetime/work admission. Nonfinite/non-numeric own data points in effect world
placement and attachment offset receive effect-coordinate/INVALID_COORDINATE;
canonical Phase4 still validates structure, planes, transforms and arithmetic.
Other unbranded structural/overflow exceptions remain unknown. No message, name,
cause or arbitrary error properties are read/copied.

Keep result records distinct from exception classification:

| Observation | Canonical record |
| --- | --- |
| Target lost | Terminal instance + attachment history under VE07; not a fake failure exception |
| Resource not ready/unavailable | Frame sync rejected/FRAME_NOT_READY or Phase7 lease state/failure |
| Stale atlas | Frame sync rejected/ATLAS_REVISION_MISMATCH |
| Wrong authored reference | Frame sync rejected/ALIGNMENT_FRAME_MISMATCH; selected missing frame can be FRAME_NOT_FOUND |
| Unsupported media/PNG | Phase7 source MEDIA_TYPE_MISMATCH or decode UNSUPPORTED_PNG/INVALID_PNG and related owner result; no invented VFX media error |
| Disposed scene/session | Existing canonical scene/texture/session/effect admission brands |
| Unknown provider/native exception | Original rejection/throw; classifier returns unknown/UNKNOWN_FAILURE |

The diagnostics snapshot is frozen and has bounded instance identity strings
(admitted <=512), opaque symbols, resourceState, lastFrameSync, and a last safe
resource observation. Source revision prefix <=2048 and frame key prefix <=512
are display hints, never equality/lookup tokens. Atlas revision is an opaque
symbol. No lease, playback capability, texture, provider, source bytes, native
context, canvas, geometry object or scene is returned/retained by this observation.
Historical resource observation is last-observed data: resourceState=retired
never means live rights, and lastFrameSync=bound never proves current visibility.
Rejected sync can leave a prior committed drawable usable. Scene cleanupFailed
is an independently sticky, scene-wide observation (null if unobserved), not
attribution to this effect; local instance cleanupFailed remains separate.

## Work admission

At most 256 active effects per canonical scene, checked before allocating
playback/drawable. The 257th distinct key throws branded effect-work/
ACTIVE_EFFECT_LIMIT. Removal reopens capacity. Counts come from canonical Phase8
membership; no parallel registry or global resource pool. The snapshot reports
activeEffects, maxActiveEffects and synchronous inFlightOperations. Each effect
has one guarded synchronous mutation at a time; no effect-owned async queue,
load job or promise exists. Host IO remains subject to Phase7 entry/read/decode
limits and host cancellation/release policy. Ordinary visuals and separate
scenes are independent; this is not a global GPU-byte budget.
