# CM07/CM08 — absolute center zoom and focus preservation

Runtime Render owns the same canonical camera capability. New root surface:

```ts
createConfiguredRenderCamera(input: OrthographicCameraConfigurationInput,
  limits: RenderCameraZoomLimits): RenderCamera;
getRenderCameraViewSnapshot(camera: RenderCamera): RenderCameraViewSnapshot;
setRenderCameraZoom(camera: RenderCamera, zoom: number): RenderCameraViewSnapshot;
zoomRenderCameraAtFocus(camera: RenderCamera,
  input: RenderCameraFocusZoomInput): RenderCameraViewSnapshot;
// RenderCameraZoomLimits: { readonly min: number; readonly max: number }
// RenderCameraFocusZoomInput: { readonly zoom: number;
//   readonly mapping: ViewportMapping2D; readonly focus: PlaneProjectionPoint2D }
```

`RenderCameraViewSnapshot` contains readonly `camera` (existing snapshot),
`configuration` (existing orthographic config), `zoomLimits` and `revision`.
All nested observations are detached/frozen. One ephemeral camera identity and
one lifecycle, no separate Camera Manager or session. The old factory/handle/
snapshot declarations stay unchanged; old snapshots still count center changes
only. New view revision counts center or zoom changes, once per accepted commit.
Center-only zoom changes the view, preserving the old center snapshot reference.
Focus zoom commits center and zoom atomically. No-op zoom returns the same view;
focus no-op still validates its entire context/inverse. Disposal updates the nested
camera state without incrementing revisions; historical reads remain available.

The new factory explicitly opts into zoom state using v0.9.2 configuration and
host-chosen inclusive limits. `0 < min <= max`, both finite, initial/current zoom
within limits; values outside reject, never clamp. No hardcoded product zoom range
or authored schema. The limits are fixed per capability. Existing plain cameras
have no inferred scale/zoom; new view/zoom operations on them reject. Existing
center/pan operations work on either factory and keep configured center in sync.
Relative multiplier API is intentionally omitted; callers may supply an absolute
zoom candidate. Multiplication by 1 resulting in the current zoom is a no-op.

Center zoom requires no viewport and preserves center. Focus zoom requires an
exact current `ViewportMapping2D`: same source project/space/unit/axes, source
origin equal to current center, current effective ratios, same project destination
plane, CSS-px right/down metrics and destination origin at logical width/2,height/2.
Caller supplies both metrics and projection; no DOM size, implicit DPR, device-pixel
focus, missing context or stale-ratio/center fallback. Value context is validated,
not a session/camera identity token; an equivalent mapping value remains usable.
Off-viewport finite local points are allowed, with no clamp/clip policy.

Canonical composition:

1. Capture mapping with `createViewportMapping2D` and exact plane/point admission.
2. Obtain selected-plane focus world point with `viewportPointToPlane2D`.
3. Use that same inverse with new effective ratios and source origin zero to get
   the source offset; use Phase4 `applyPlanarPoint2D` translation to obtain center.
4. Rebuild the canonical final mapping; forward-project the original world point
   and invert the focus again before any commit.

No copied projection/inverse formula in Render, Editor or Client. Phase4 retains its
relative determinant cutoff1e-12, reciprocal finite/nonzero checks and inverse
destination residual1e-9*max(1,abs(input component)). Focus commit additionally
requires forward pixel residual and recovered world residual within that same
component-relative bound. This is binary64 admission, not exactness for all inputs
or an accumulated-drift guarantee. The task example and reverse have observed error0
within the manual absolute tolerance1e-12. Nonfinite/zero effective scales reject
through the existing config constructor. Pure center zoom may admit a positive
ratio that is unsuitable for inversion; focus then rejects through Phase4.

TypeError: malformed data, nonpositive/nonfinite zoom, incompatible/missing/stale
context, unconfigured/foreign/disposed camera. RangeError: finite zoom outside
limits, effective scale overflow/zero-underflow, unsafe inverse/residual or revision
exhaustion. Unknown host exceptions propagate. Reentrant capture cannot commit over
disposal or a changed view; a host's own accepted reentrant edit is not rolled back.
No rejected operation publishes a partial center/zoom change.

The existing private commit seam remains the future Render invalidation integration
point. Snapshots remain `unbound` / `not-applied`: this checkpoint creates no GPU
camera, automatic viewport application, session binding, frame request or RAF.
Disposed cameras reject; an actual disposed graphics-session binding is not yet a
camera contract and is not claimed verified. No texture/lease is consumed, so
resource expiry is inapplicable. Unknown source labels declare context, not a world
registry; mismatch rejects. No authored placement, Document dirty, instance/layer/
depth, gameplay position, wheel handler, control, animation, follow or 3D inverse.

See [manual](../manual/camera-zoom.md) and
[checkpoint](../../harness/checkpoints/camera-v0.9.4.md).
