# CM13 — viewport/screen to selected camera plane

Runtime Render is the canonical owner. Editor/Client remain unchanged consumers.

```ts
interface RenderCameraSelectedPlaneInput {
  readonly cameraView: RenderCameraViewSnapshot;
  readonly selectedPlane: ProjectionPlane2D;
  readonly point: PlaneProjectionPoint2D;
}
viewportToRenderCameraSelectedPlane(camera, logical, input, accepted)
screenToRenderCameraSelectedPlane(camera, logical, input, accepted)
// Both return RenderCameraSelectedPlaneResult:
// { camera, mapping, selectedPlanePoint, acceptedViewport }
```

Four additive root names: two functions and two interfaces. Existing declarations,
failure unions, v0.9.6 forward result and Phase4 contracts are unchanged. The
result is detached/frozen and explicitly names the selected 2D plane. No `z`,
unqualified world point or unconditional screenToWorld3D API.

Supply the exact current issued `getRenderCameraViewSnapshot(camera)` observation,
or the current view from a forward result. Identity comparison rejects a copied,
other-camera or stale view even after zoom-only updates when the legacy center
revision did not advance. No-op state updates preserve the view. Logical metrics
are captured anew using the same owner-local admission as forward projection.
The selected plane must exactly match the camera source's project/space/unit/axes;
the input point must match viewport or explicit screen plane respectively. Labels
declare context, not registry membership or elevation. No guessed plane fallback.

Required `accepted` argument retains v0.9.6 semantics: null explicitly selects
logical-only CPU math. Host supplies the current logical metrics; Render cannot
attest their measurement time or detect a stale host declaration without a real
session. Non-null `{session, receipt}` requires the actual current active/ready
Phase6 session and latest issued resize receipt, including equal-buffer resizes.
Logical dimensions must exactly agree with receipt CSS extents. Receipt identity
is the viewport freshness token, not a newly invented revision counter. Stale,
copied, foreign, suspended or terminal native context rejects without CPU fallback.
Camera and receipt are rechecked after host input capture. Returned observations
are historical; re-read after camera, viewport or screen-geometry changes.

Viewport route delegates to `viewportPointToPlane2D`. Screen route first delegates
to `screenPointToViewport2D`, then the same selected-plane inverse. Screen requires
explicit origin, plane and positive per-axis scale. With screen null only the
screen route rejects; viewport inverse remains available. No DPR inferred/applied
twice, screen measurement, CSS/DOM lookup, clipping or clamping. Offviewport points
remain legal. No inverse formulas, tolerance overrides or second camera in hosts.

Phase4 numeric policy remains canonical: positive finite ratios; reject normalized
diagonal ratio `min(x,y)/max(x,y) <= 1e-12` or nonfinite/zero reciprocal. Invalid
zero ratio is TypeError at configuration admission, not a singular fallback.
Ill-conditioned mappings throw RangeError. Each inverse checks its own forward
destination residual `<= 1e-9 * max(1, abs(input component))`; screen and viewport
stages each apply that policy, with no additional overall source accuracy promise.
Binary64 cancellation/underflow can lose source information even when residual
passes. A finite input whose recovered point cannot satisfy residual rejects;
perfect source recovery is never guaranteed. Manual sample tolerance1e-12 is
evidence for those samples only, not a new global API tolerance.

Invalid dimensions, nonfinite point, incompatible plane, stale/foreign/copy view,
unconfigured/disposed camera and missing screen context throw TypeError. Numeric
overflow/cutoff/residual limits retain RangeError; unknown host exceptions propagate.
No state, dirty/revision, gameplay position, visual transform/depth or lease writes;
host proxy side effects are outside that guarantee. No resource is consumed, so
expiry is inapplicable. No native camera, invalidation, frame or GPU application.

Later 2.5D/3D presentation may associate one viewport position with a ray or a
family of elevated points. This operation only solves the explicitly selected
declared 2D source plane. Arbitrary height cannot be recovered from screen Y; no
picking, physics/raycast, terrain intersection or elevation schema is introduced.

See [manual](../manual/camera-inverse.md) and
[checkpoint](../../harness/checkpoints/camera-v0.9.7.md). Native/browser integration
and visual acceptance remain unobserved.
