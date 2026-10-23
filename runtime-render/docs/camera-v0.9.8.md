# CM14 — Ground and elevation projection

Canonical owner: runtime-render. Additive CPU composition, not native camera or
Phase8 geometry application. Old axis-aligned orthographic/viewport/inverse
contracts and exhaustive unions are unchanged.

## Public surface and units

`createRenderCameraGroundConfiguration` captures a detached frozen exact config:
`kind: 'affine-ground-elevation'`, `groundPlane`, `presentationPlane`,
`groundOrigin`, `presentationOrigin`, `basis: {x,y}`,
`elevation: {unit, displacement}`. Both planes declare project/space/unit/axes;
projects must match. Basis columns are presentation units per ground unit,
and displacement is a signed presentation vector per declared elevation unit.
Axes are explicit conventions, not an inferred isometric orientation. Neither
unit names nor dimensions auto-convert. Origins belong to their respective planes.

The one path is `P = presentationOrigin + B*(ground-groundOrigin) + h*d`, using
Phase4 affine composition/application. P then enters the existing camera source
plane, which must EXACTLY match presentationPlane (project/space/unit/axes).
Camera center/pan are in this presentation plane, not unprojected ground units.
To request a ground-relative center, the caller supplies a declared presentation
intent; this checkpoint adds no camera-follow policy or authored placement writes.

Camera scale/axes/zoom apply once to the WHOLE P. Thus the viewport CSS elevation
displacement per height is `(signX*scaleX*zoom*d.x, signY*scaleY*zoom*d.y)`;
optional explicit host screen mapping subsequently scales it. No device DPR
factor is introduced. For the task example choose presentation unit css-px,
right/down axes and camera scale1/zoom1, so displacement `(0,-2)` is CSS px/h.
At other camera scales/axes it remains a declared vector, not a fixed pixel count.
This separation avoids silently ignoring camera scale or multiplying it twice.

`projectRenderCameraGroundPoint(camera, logical, config, {ground,elevation}, accepted)`
returns immutable `RenderCameraGroundProjectionResult`: old camera projection
fields plus `configuration`, detached `source` and `presentationPoint`.
`mapping` describes ONLY presentation-plane -> viewport, not the oblique ground
path. Consumers retain the configuration and use the new inverse for ground.
No sheared matrix is labelled `orthographic-plane`.

`viewportToRenderCameraGround` / `screenToRenderCameraGround` take the same camera,
logical metrics and config plus `{cameraView, point, elevation}` and accepted
context. They return `{projection, ground}`. Height `{unit,value}` is REQUIRED;
ground zero is explicitly `{unit, value:0}`. Omitted/null/unknown height is
underdetermined and rejected, not treated as zero. Supplied height is a constraint,
not a solved physical height. A wrong but valid declared height can select another
ground point; no scene membership/terrain registry is consulted.

Required `accepted: null` means logical-only CPU math. Non-null uses existing
exact current Phase6 session/resize receipt admission without fallback. Exact
current issued camera view required for inverse; copies/foreign/stale views fail.
Host logical/screen geometry is explicit; labels are declarations, not registry
attestation. Freshness is rechecked after capture, including rejected native paths.

## Numeric and compatibility limits

Reuse Phase4 `toAffineTransform2D`, `composePlanarTransforms2D`,
`applyPlanarPoint2D`, `invertPlanarTransform2D` and existing camera/viewport mapping.
Reject zero/singular basis or normalized determinant magnitude <=1e-12, even on
forward admission. Computed nonfinite intermediates/inverse throw RangeError;
nonfinite inputs, invalid context or unit mismatches throw TypeError. Unknown
host exceptions propagate. No clamp/identity fallback or generalized matrix engine.

Inverse removes supplied elevation, applies canonical ground inverse, and
reprojects to check presentation residual <=1e-9*max(1,abs(component)). Existing
camera inverse retains its own ratio/residual limits. Binary64 cancellation and
underflow remain possible; destination residual is not a universal source error
bound. Worked observations use absolute tolerance1e-12 only for those samples.

Phase8 transforms currently accept axis-aligned projection to render-clip-2d /
clip-unit / right,up; sprite local TRS/anchor is distinct. Depth policy is explicit
order/depth-key/ground-y and private Three draw disables depthTest/depthWrite.
This checkpoint does not inject oblique geometry into that path, change anchors,
select frames, resort by projected Y or consume a resource lease. Expired texture
handling remains Phase7/8 and is inapplicable to this CPU operation.

No Scene/Document/gameplay/visual-instance state writes, perspective, picking,
terrain solver, GPU application, animation, Editor/Client helper math, new project
or dependency change. Observed numeric evidence is in the
[manual runbook](../manual/camera-ground.md) and
[checkpoint](../../harness/checkpoints/camera-v0.9.8.md).
