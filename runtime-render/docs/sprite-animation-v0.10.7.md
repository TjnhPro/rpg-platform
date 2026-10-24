# SA08 — live Visual Instance frame binding

Four additive Render-root names: createSpriteAnimationVisualBinding,
SpriteAnimationVisualBinding, SpriteAnimationVisualFrameInput and
SpriteAnimationVisualFrameResult. Existing public signatures remain unchanged.
Render owns this extension; Editor/Client consume its root. No gameplay APIs.

## Admission and host flow

Create the binding with an existing canonical live session, its existing Scene
instance and an issued CPU playback. One binding occupies one playback and one
instance. It borrows these handles, never creates a Scene, instance or session.
The instance must already have an explicit Phase8 transform. This first binding
supports identity local TRS only; otherwise sync returns INCOMPATIBLE_TRANSFORM.
It preserves placement, projection, orientation, ground offset, instance identity,
correlation, layer/order, depth and visibility. It does not infer scale or origin.

Host commands/advances playback explicitly, then calls binding.sync with the
existing page lease, exact source revision, atlas/revision, page pixel attestation,
positive per-axis planeUnitsPerPixel and verified SA07 authored alignment data.
The lease is borrowed for admission; Phase8 retains an independent usage right.
Host remains responsible for acquiring/releasing its own page lease and drawing
through the same session when appropriate. No playback subscription, timer, RAF,
automatic acquisition, PNG decoding, cropping or per-frame texture upload.

Selected playback reference passes through canonical Phase7
resolveAtlasFrameGeometry (which uses resolveAtlasFrame), then SA07 alignment.
Phase8's existing prepareBinding repeats canonical geometry/revision admission,
createAtlasTextureView and retained-lease validation. There is no second geometry
or texture path. Layout is frame-local (0,0,width*ratioX,height*ratioY); Phase8's
existing layout/backend honors source-axis signs. Phase7 rotation none and null
trim/sourceSize remain unchanged. Source pivot is never inferred as ground.

The owner-local Phase8 transaction admits geometry, source/session rights,
alignment, transform/layout, ordering and unchanged playback/instance state
before native writes. It commits resource, transform and layout together, then
releases the previous usage. No host callback or asynchronous boundary separates
these fields. It uses existing Phase6 invalidation; host alone schedules/submits.
Repeated sync also admits and invalidates; there is no same-frame no-op guarantee.

Existing ground offset must exactly equal the converted authored offset, otherwise
GROUND_ANCHOR_MISMATCH. Placement and attachment remain unchanged; draw origin and
pivot may change with the frame. Binary64 limitations remain those of Phase4/SA07;
extreme dimensions may also fail Phase8's native-layout precision admission.

## Failure and lifetime

sync returns bound only after actual usable Phase8 commit. Pending/released
resource returns FRAME_NOT_READY. Missing atlas/frame, stale revision and missing
authored origin retain their Phase7/SA07 rejection codes. Disposed playback returns
PLAYBACK_DISPOSED; closed adapter returns BINDING_DISPOSED. Branded Phase8 failures
such as CONTEXT_MISMATCH, FOREIGN_RESOURCE and SOURCE_REVISION_MISMATCH propagate
through getRenderVisualBindingFailure; malformed data and unknown errors throw.
These admission failures preserve the previous committed presentation and do not
submit a frame. No placeholder-success or fabricated submitted receipt.

As in Phase8, native mutation failure terminates the canonical graphics scope;
cleanup failure after commit propagates without pretending rollback. A bound
result is historical admission evidence, never GPU completion or displayed pixels.
Host lease release cannot revoke an already retained instance usage, but that
released lease cannot admit a new update. Cache/session invalidation can revoke it.

replacePlayback validates before replacing the borrowed handle; it keeps the last
visual until a subsequent sync. Disposing playback freezes that presentation
until replacement/unbind; it does not dispose the instance. unbind is terminal,
idempotent and clears only the resource usage whose geometry identity/resourceId
still matches its last commit. An external Phase8 resource replacement is not
cleared. Last transform/layout/placement remain. It never disposes borrowed
playback, host lease, Scene or session. Instance removal/clear and canonical
session termination close occupancy and unlink subscriptions automatically.
There is no automatic GPU restoration or migration after context loss.

See the [checkpoint](../../harness/checkpoints/sprite-animation-v0.10.7.md) for
finite actual-browser observations and the remaining visual/product limitations.
