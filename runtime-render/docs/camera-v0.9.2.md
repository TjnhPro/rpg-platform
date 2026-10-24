# CM05 — Orthographic camera configuration

Runtime Render is the canonical owner. New pure root constructor
`createOrthographicCameraConfiguration` and two readonly types
`OrthographicCameraConfigurationInput` / `OrthographicCameraConfiguration` add
configuration without changing the v0.9.1 camera lifecycle or any Phase4 DTO.
The [manual consumer](../manual/camera-configuration.md) exercises the package root.

## Explicit semantics

All six input fields are required, with no canvas/source-name/default inference:

| Field | Meaning |
| --- | --- |
| kind | Literal orthographic; perspective and 3D-camera kinds unsupported |
| source | Exact ProjectionPlane2D project/space/unit/axes; canonical Phase4 capture |
| center | Finite point in that source plane, anchoring logical viewport midpoint |
| scale | Exact unit css-px-per-source-unit with positive finite x/y ratios at zoom1 |
| zoom | Positive finite dimensionless factor; larger means larger presentation |
| viewportPolicy | Literal preserve-scale; each ratio is stable when logical extent changes |

Effective ratio per axis is `scale.axis * zoom`, computed once by the constructor
and returned in `effectiveCssPixelsPerSourceUnit`. Ratio is always positive; signs
from source/destination axes belong to Phase4 projection, not to scale or zoom.
Zoom1 retains the declared ratios. Source unit is whatever exact explicit unit
the source plane declares; labels perform no physical unit conversion or lookup.
CSS-px is a logical length, independent of drawing-buffer pixels and requested DPR.
Scale may be anisotropic by explicit caller choice, never an automatic aspect fix.

There is one extent policy for both horizontal and vertical dimensions: keep their
declared ratios, keep center anchored at `(logicalWidth/2, logicalHeight/2)`, and let
visible source spans change. In real arithmetic their magnitudes are
`logicalWidth/effective.x` and `logicalHeight/effective.y`. These equations explain
the policy; this constructor does not accept dimensions or calculate spans.
No fit-horizontal/fit-vertical, fixed-world-span, stretch-to-canvas, letterbox, bounds
or hidden fallback is implemented. A future explicit conversion would be required
to accept span-based intent; do not mix that with pixels-per-source-unit silently.

Example: right/down source center100,50, scale2,2, zoom1 and logical viewport800x450
imply center400,225, visible spans400x225 in real arithmetic. Zoom2 implies ratios4,4
and spans200x112.5. Changing viewport to1000x450 at zoom1 would imply midpoint500,225
and spans500x225, preserving the same config. Resize derivations are EXPECTED only,
not automatic mapping or a submitted/observed frame. Binary64 limits still apply.

## Admission and immutable observations

Outer input and scale require exact plain enumerable own data fields. Canonical
Phase4 plane/point capture validates/copies nested source/axes/center and finite
components. Every output record is detached/deeply frozen. No update/global state,
ID, revision, session reference or applied flag is invented for this pure value.
New candidate construction cannot modify a previous configuration.

- TypeError: malformed records, extra fields, unsupported kind/policy/scale unit,
  invalid source keys/axes, nonfinite center, nonpositive/nonfinite scale or zoom.
- RangeError: multiplying individually valid scale/zoom yields Infinity or zero
  by underflow. Finite positive subnormal output is allowed; no universal inverse
  conditioning or accuracy promise is made. Later Phase4 mapping may reject it.
- Unknown host proxy/accessor exceptions propagate unchanged, without normalization
  into success or an existing closed diagnostics union.

Output has a derived seventh field; select the six input fields when constructing
another candidate. Directly spreading output is rejected as extra data, as intended
by exact admission. A derived field supplied by a host cannot override computation.

## Integration seam and compatibility

This configuration is independent of viewport/session acceptance. It does not bind
or modify `RenderCamera`, whose narrow center-only update and unbound/not-applied
snapshot contract remain unchanged. Future configuration application/binding needs
its supplied task, canonical handle/liveness admission and additive contracts.

The manual example passes explicit source/center/effective ratios and a literal
destination midpoint to `createOrthographicPlaneProjection`, then uses existing
Phase4 `createViewportMapping2D`/point operations. No new projection calculator or
second automatic binder is introduced. General camera-to-viewport composition is
deferred to its own milestone; when implemented it must be one Render-owned path
using canonical affine/projection operations, not Editor/Client formulas.

Planar coordinates can describe a selected ground plane in 2D/2.5D content. These
axis declarations do not themselves implement an oblique/isometric basis, height,
arbitrary 3D camera, selected-height inverse or unknown-depth reconstruction.
Phase8 layer/depth/localToScene and legacy localToClip/fixed-camera path stay intact.
Phase6 alone accepts live viewport/buffer metrics and owns invalidation/application;
Phase7 alone owns resource leases. No DPR/native/GPU/frame operation occurs here.

Three new root names: Render191 ->194, Editor138/Client0 unchanged. No existing
declaration or closed union migration. No dependency/owner/schema/Engine/L1/L2 edit.
[Checkpoint](../../harness/checkpoints/camera-v0.9.2.md) separates observed pure
configuration/Phase4 correspondence from FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED
integrated Camera behavior. Browser NOT_EXECUTED; no automated tests added.
