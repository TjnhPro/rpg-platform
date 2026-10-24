# v0.11.5 VE06 — Effect World Position & Offset

Runtime Render owns presentation placement. VE06 adds four public root names:
`setVisualEffectWorldPlacement`, `getVisualEffectWorldPlacementSnapshot`,
`VisualEffectWorldPlacementInput`, `VisualEffectWorldPlacementSnapshot`.
All previous declarations remain unchanged (Render317→321).

## Input and numeric semantics

The setter takes one issued live Effect Instance and an exact plain data record:

```ts
{
  placement: PlaneProjectionPoint2D,
  anchor: VisualAnchor2D,
  projection: OrthographicPlaneProjection
}
```

There are no inferred coordinates or defaults. Placement contains projectId,
coordinateSpaceId, unit and axes, plus finite x/y. The source project must equal
the effect definition's resource project; placement must match the projection
source exactly. Once a Phase8 transform exists, moves must preserve its source
plane/project/unit/axes. A Render Scene itself has no world-plane declaration;
the first placement explicitly chooses that context. No lookup or conversion of
units, pixels, map cells or authored coordinates occurs.

Anchor, pivot and localOffset are explicit local numeric coordinates in the
source plane unit/axes, never normalized image fractions. This MVP deliberately
fixes local PlanarTransform2D to translation(0,0), rotation0, scale(1,1), and
orientation metadata to angle0 with the declared axes. It does not accept a
scale/rotation override. The canonical Phase4/8 composition remains:

1. Phase4 alignment computes attachment = placement + localOffset,
   origin = attachment - anchor, plane pivot = origin + local pivot.
2. Phase8 composes translation(-pivot), local TRS, translation(plane pivot).
   With identity local TRS the pivot cancels: local point q maps to origin + q.
3. Phase8 composes the supplied Phase4 plane projection for the legacy clip path.

Offset is thus a source-plane translation of the chosen attachment, not an
image-center correction and not multiplied by a hidden scale/rotation. Negative
finite offsets are valid. Arbitrary finite arithmetic retains Phase4 binary64
rounding/underflow limits; no universal exactness or inverse guarantee is added.
No pixel anchor, frame geometry, sourcePivot or unsupported trim is inferred.

Projection retains the existing Phase8 requirement: same project destination,
render-clip-2d / clip-unit / right,up. The mapping ratio and correspondence origins
are explicit. This context is required even when a separate Phase9 camera is
used. A bound camera uses canonical localToScene on submission; VE06 does not
project through the camera or calculate viewport coordinates. Camera pan/zoom
must not rewrite world placement.

## Mutation, readback and failures

The setter captures through canonical Phase4/8 functions before one Phase8
transform mutation/invalidation. There is no frame scheduling/submission, time
advance, playback replacement, lease acquisition, resource binding or visual
instance recreation. Current layer/order/depth/visibility and resource rights
remain Phase8-owned. A depth/layout incompatibility still rejects through that
owner's existing admission rules.

The snapshot returns `{instance, transform}`. Initial transform is null; live
readback reads canonical Phase8 state. Returned metadata is detached/deeply
frozen. After retirement it returns the last transform committed or observed
through this effect API, with the terminal VE03 instance snapshot. This history
is not live membership or a lease. A lower-level direct Phase8 edit after the
last effect observation is not retroactively captured when membership ends;
Phase8 remains the authority while live. Do not use direct lower-level edits to
reinterpret an effect's coordinate context or bypass the translation-only mode.

Malformed/missing context, project/plane/unit/axes mismatch and nonfinite input
throw TypeError before this setter mutates the scene. Nonfinite composed math
throws canonical RangeError. Phase8 presentation/native errors propagate with
their existing classification; unknown host exceptions propagate unchanged.
The existing getVisualEffectPlaybackFailure classifies forged handles,
INSTANCE_REMOVED / SESSION_ENDED and TRANSITION_IN_PROGRESS. No old error union
is widened. Top-level accessors are rejected; nested capture uses the existing
Phase4 admission semantics. Reflection that changes the scene revision causes
rejection before the outer commit. Host-caused mutations are not rolled back.
Removal/session termination during capture cannot resurrect the old membership.
Native failure follows Phase8's terminal/cleanup policy, not a rollback promise.

Completion, stop/restart and once/repeat/timed-repeat semantics are unchanged.
The setter works while stopped, playing or paused, rejects after retirement,
and preserves the exact canonical playback snapshot. It never writes authored
Scene objects, gameplay coordinates or Runtime Engine state. L1/L2 are unused.

## Finite manual evidence and limits

See the [checkpoint](../../harness/checkpoints/visual-effect-v0.11.5.md) for
actual inputs/results, source hashes and build gates. A real Chrome/Three.js
session accepted placements on the existing effect membership while its original
PNG resource was retained and its playback was playing187.5ms/frame1. Resource
identity, playback snapshot and visual handle were preserved; no additional
read/upload/lease occurred. Incorrect context/nonfinite/overflow inputs preserved
the previous transform. Pure configured-camera pan/zoom preserved it as well.

No renderFrame or VFX frame synchronization was exercised. Camera was unbound
in that observation. Pixel position, actual effect animation, camera-bound pixel
comparison, attachment following and native memory reclamation remain
VISUAL_NOT_VERIFIED / NOT_OBSERVED. This is not MVP or Developer acceptance.
VE07 attachment is not implemented ahead of its task.
