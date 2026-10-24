# SA07 — per-frame origin and alignment

Four additive browser-neutral Render-root exports: resolveSpriteFrameAlignment,
SpriteFrameAlignmentData, SpriteFrameAlignmentInput, SpriteFrameAlignmentResult.
No old signature/union changes. This is a pure calculation, separate from sequence
start frame, playback, Visual Instance binding and authored/gameplay placement.

## Actual Phase7 metadata and exporter audit

Current AtlasMetadataFrame stores finite raw sourcePivot x/y unchanged, with no
clamping to0..1. AtlasFrameGeometry has canonical revision/reference, top-left
half-open image-pixel rectangle, normalized texture UV (first uploaded row),
rotation none, trim null and sourceSize null. Null is absent information, never
zero trim or proof of an original untrimmed image. SA07 changes none of these.

Inspected the official [TexturePacker8.3.0 distribution](https://www.codeandweb.com/download/texturepacker/8.3.0/TexturePacker-8.3.0.deb)
without installing/running it. SHA256:
`2a19ffd1d1af5a8f61293f5311d5ddcd9a6fb22192d70c455ab02400371dff9d`.
Files: usr/share/texturepacker/exporters/unity/exporter.xml and
unity/grantlee/0.2/TransformCoords.qs. ExportData emits format40300, frame rect,
TrimmedPivotX and TrimmedMirroredPivotY. The exporter uses BottomLeft sprite
origin. X uses pivotPointNorm.x, or (pivotPoint.x-sourceRect.x)/sourceRect.width
for a trimmed sprite. Y uses pivotPointNorm.y, or converts via untrimmed height,
subtracts sourceRect.y, divides by sourceRect.height, then mirrors with1-y.
Therefore emitted pivot coordinates are normalized relative to the exported
frame, bottom-left, x right/y up; finite values outside0..1 are meaningful.
The current rectangle-only parser does not expose the intermediate sourceRect
or untrimmedSize. These formulas do not establish sourceSize or artist intent.

Result sourcePivot labels that verified convention and preserves original x/y;
it is observation only. It is never silently used as ground contact or as the
authored rotation pivot. A host could explicitly verify/designate it and convert
to top-left frame pixels using x*width,(1-y)*height, but this API does not infer
that choice, anatomical ground contact, missing trim or source bounds.

## Request and calculation

Provide canonical issued geometry, canonical atlas, explicit expectedRevision,
placement plane/point, Phase4 orientation, positive finite planeUnitsPerPixel x/y
and authored data or null. Atlas/geometry are borrowed immutable Phase7 snapshots;
their actual provenance/revision is checked. Old atlas+old token deliberately
observes history, not external freshness. Host owns choosing the current token.
The request is portable across browser/Node without GPU types; revision symbols
and issued geometry are execution-local capabilities, not JSON persistence data.

Authored data names the exact reference/revision and nonblank verification
provenance. It supplies groundAnchor, independent pivot and localOffset, all
finite frame-local image-pixel edge coordinates with origin frame-top-left,
x right/y down. localOffset is the ground translation relative to placement,
expressed in those same pixel axes; it is not an atlas-page coordinate. Negative
and outside-frame coordinates are admitted. The caller verifies the authored
alignment against its content; a provenance string is an attestation, not proof
Render can authenticate. Editor may supply it without a new authoring schema.

Let C scale pixel x/y by the explicit ratios and flip signs for a left/up plane.
Reuse Phase4 applyPlanarPoint2D to convert all three points, createVisualAnchor2D
to capture them in plane units and resolveVisualAlignment2D to obtain:

```
attachment = placement + C(localOffset)
origin     = attachment - C(groundAnchor)
pivot      = origin + C(authoredPivot)
pixelToPlane(p) = origin + C(p)
```

Result contains the unchanged canonical geometry (hence exact frame/revision),
provenance, detached frozen plane, original sourcePivot, Phase4 anchor/alignment,
an affine pixelToPlane mapping and its actual mapped ground point. The offset
from placement is represented by the alignment origin; no Scene state is written.
Two frames with different verified local anchors can map to the same attachment.
Rectangle x/y/UV remain page-addressing information and are not added to these
frame-local coordinates. No center, half-size or sourceSize heuristic is used.

Plane project must match the frame; orientation axes must match the explicit
placement plane. The plane key/unit is caller-selected, not looked up in a Scene.
As in Phase4, orientation is metadata here and never rotates/scales the offsets.
This function does not implement arbitrary local TRS or automatically apply an
instance transform; future binding must use Phase8's actual transform/layout APIs.

## Failure and precision policy

| Condition | Outcome |
| --- | --- |
| No authored data, null original layout | FRAME_ORIGIN_UNAVAILABLE |
| Blank/nonstring provenance | FRAME_ORIGIN_UNAVAILABLE |
| Copied/foreign geometry | INVALID_FRAME_GEOMETRY |
| Geometry/current atlas token disagreement | ATLAS_REVISION_MISMATCH |
| Atlas resolution fails | Existing Phase7 unresolved code |
| Authored frame/revision differs | ALIGNMENT_FRAME_MISMATCH |
| Plane project or orientation axes disagree | INCOMPATIBLE_PLANE |
| Nonfinite conversion/origin/pivot/mapped-ground arithmetic | NONFINITE_CONVERSION |
| Malformed records, nonfinite points/pivot/ratios, nonpositive ratios, unsupported pixel convention | TypeError |

Closed outer/authored/placement records; every coordinate is captured through
existing Phase4 validation. Unknown host exceptions propagate. Success/failure
records and nested outputs are frozen, inputs are never frozen or modified by
this calculation. No handles, registries or cleanup resources are allocated.

Finite primitive binary64 inputs only; ratios strictly positive, without an
invented integer-pixel or MAX_SAFE_INTEGER coordinate cutoff. All calculated
points must remain finite. Binary64 rounding, cancellation and subnormal
underflow remain possible at extreme magnitudes. No rounding/snapping, epsilon,
universal error bound or exact ground-equality guarantee for all finite scales.
The example uses exactly representable quarters/halves; future native pixel
review must separately verify apparent stability and content ground selection.

No crop, upload, draw, placement/gameplay mutation, Phase7 format extension,
playback transition, renderer, scheduling or invalidation. See the
[checkpoint](../../harness/checkpoints/sprite-animation-v0.10.6.md) for observed
finite evidence and limitations. VISUAL_NOT_VERIFIED.
