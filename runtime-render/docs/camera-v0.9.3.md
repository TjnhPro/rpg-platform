# CM06 — source-plane center and pan

`runtime-render` owns the additive public-root operations:

```ts
setRenderCameraCenter(camera: RenderCamera, input: PlaneProjectionPoint2D): RenderCameraSnapshot;
panRenderCamera(camera: RenderCamera, input: RenderCameraPan): RenderCameraSnapshot;
// RenderCameraPan = { readonly plane: ProjectionPlane2D; readonly delta: PlanarPoint2D }
```

Only handles issued by this installed Render module are admitted. A structural copy,
proxy wrapper or handle from another module instance is not the issued capability.
The private WeakMap retains no global current camera or textual-ID registry. Original
factory, handle, snapshot and update declarations remain unchanged. The original
`camera.update({center})` still uses its fixed source context; the new explicit
operations also require the declared plane. No overload or union is widened.

Set-center captures an absolute point. Pan translates the latest accepted center
through Phase4 `applyPlanarPoint2D` with an identity affine basis and delta translation.
Both reuse the exact same owner-local source-plane admission as `projectPlanePoint2D`;
project/space/unit/axes must all match. This extracted helper is not a root export.
No second plane validator or projection calculator is introduced.

Delta is in source axes and units, independent of zoom, viewport size, DPR and DOM
input. A positive x delta moves the center toward the declared positive x axis,
including when that axis is left. It does not mean dragging objects right on screen.
Pixel drag must first use canonical selected-plane camera/viewport conversion when
that integration is supplied. No implicit pixels-to-world fallback or bounds clamp.

Candidates are captured before reading the latest camera state. Disposal is checked
before capture and again before commit; a reentrant host cannot resurrect a camera.
Changed centers produce deeply immutable snapshots with the same identity and a
single revision increment. Identical centers and zero pan return the same snapshot,
including its revision. Historical snapshots and caller records are never mutated.

Malformed/nonfinite records, source mismatch, non-issued handles and disposed updates
throw TypeError. Affine nonfinite intermediate/output or revision exhaustion throws
RangeError. A nonzero delta component completely absorbed into an unchanged center
component throws RangeError before any commit, even if the other component changed.
Representable subnormal results remain allowed. Partial rounding is possible; no
universal pan/reverse guarantee or arbitrary epsilon clamp is promised. The manual
integer example has absolute tolerance 1e-12 and observed error zero.
Unknown host/proxy exceptions propagate unchanged. No native resources are acquired.

All old/new center updates share one private `commitCenter` seam. A future live
binding must integrate canonical Render invalidation after a changed commit here,
once, and preserve no-op/failure/disposal semantics. There is no pretend invalidation
callback, frame request, session binder or RAF in this CPU-only checkpoint. Snapshots
still truthfully say `unbound` / `not-applied`; v0.9.2 scale/config remains a separate
pure descriptor. Live binding and session occupancy are future supplied checkpoints.

Authored Scene placement, Document revision/dirty, gameplay position, Phase8 instance
transform/resource/layer/depth and camera B are outside the update capability. No
gameplay, follow target, smooth motion, inertia, UI, render loop or resource access.
Dimensions/zoom are not pan/set-center inputs and unexpected fields reject; their
existing constructors retain their own validation. Plane labels declare context,
not registry existence: an unknown label differing from this camera's source rejects,
but a well-formed source label does not imply a registered world. Resource expiry is
inapplicable because no lease is consumed. No GPU/pixel claim follows from CPU state.

See [manual runbook](../manual/camera-pan.md) and
[checkpoint](../../harness/checkpoints/camera-v0.9.3.md).
