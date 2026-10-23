# v0.8.9 — SR14 Visual Scene Frame Integration

Runtime Render connects the existing session-bound visual scope to the existing
Phase6 submission backend. No second renderer, canvas, scheduler, camera controller,
gameplay tick, Editor schema, loader or cache. Draw path implemented;
**FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED / ALPHA_NOT_VERIFIED** until observation.

## Minimal public delta

Three additive package-root names; previous signatures/required shapes unchanged:

```ts
interface RenderVisualSpriteLayout {
  readonly unit: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}
setRenderVisualInstanceSpriteLayout(scene: RenderVisualScene, instance: RenderVisualInstance,
  layout: RenderVisualSpriteLayout | null): RenderVisualSpriteLayout | null;
getRenderVisualInstanceSpriteLayout(scene: RenderVisualScene,
  instance: RenderVisualInstance): RenderVisualSpriteLayout | null;
```

Layout is necessary because old generic transforms carry no relationship between
image texels and local units/quad size. Never silently equate one texel with one
scene unit. Existing creations start layout=null and remain metadata-only, even
with a binding/transform, until explicitly opted in. A detached frozen layout
describes the **image top-left corner** `(x,y)` in transform-local coordinates;
positive width extends physically right, positive height physically down according
to the transform's declared source axes. It is not an image crop or scene placement.
Whole image or canonical selected frame UVs are stretched over that local rectangle.
Aspect/pixel ratio is host-selected; no automatic atlas source-size/trim adjustment.

Unit must exactly match the transform source-plane unit, whether layout or
transform is set first. Valid nonblank unit, own enumerable data only, finite
GPU-representable coordinates, positive dimensions and non-collapsing Float32
extents required; no normalization/fallback. Invalid layout/unit raises TypeError
before accepted changes. Existing branded instance/scene failures remain canonical.
Equal layouts reuse the accepted snapshot. null drops geometry participation but
retains identity, transform and Phase7 binding. No authored serialization schema.

## Fixed planar mapping and geometry

Reuse Phase4 `localToClip`, including anchor/pivot/local offset/TRS and declared
source axes/unit. Destination remains same-project `render-clip-2d`, `clip-unit`,
right/up. The existing identity Camera makes this precomposed planar orthographic
mapping final clip coordinates, z=0/w=1. Visible clip rectangle is [-1,1]²; native
viewport mapping follows Phase6. No perspective, camera inference or screen-Y depth.
Node matrix retains affine shear/reflection; geometry is not TRS-decomposed.

Four local vertices: top-left, top-right, bottom-right, bottom-left; two indexed
triangles. Right/bottom numerical directions come only from declared source axes.
Whole PNG UVs use [0,1]²; frame UV edges come unchanged from Phase7 canonical
AtlasFrameGeometry (first-uploaded-row, no guessed flip, crop, padding or inset).
Frames with unsupported geometry already reject in Phase7. Full-page or frame
pixels are mapped to the explicit layout. No half-pixel/pixel-perfect claim.
Native matrix coefficients must remain Float32-finite before submission; unsupported
numeric range fails the frame. No general precision/large-world guarantee.

The optional walkthrough fixes a 320×240 scene-unit view: source right/down,
source origin(0,0) -> clip(-1,1), ratios(2/320,2/240). Local layout(0,0,96,96),
bottom-center anchor=pivot(48,96), placements(136,176)/(184,176). Canvas backing
640×480 scales the declared view; no window/CSS/DPR measurement by Render.

## Consistent frame boundary and demand

No new submit operation: `RenderFrameSession.renderFrame()` still returns
`status:'submitted'`. After Phase6 active/suspended/reentry admission it captures
one frozen private array from the attached visual scope, under frameInProgress.
All public Visual Scene mutations, including metadata/create/remove/clear/dispose,
reject reentry during submission with existing FRAME_IN_PROGRESS; read observations
remain possible. Canonical terminal session cleanup bypasses edit admission and
always drains the scope. No await, host drawing callback or new scheduling loop.

Snapshot uses the v0.8.8 cached comparator: layer priority, layer ordinal, policy
depth, explicit order, instance ordinal. Only visible instance+layer entries with
layout, transform and binding participate. Incomplete metadata-only instances
intentionally skip; hidden ones retain transform/resource rights. A selected
binding whose retained lease is revoked/unavailable **fails the frame**, rather
than sampling an old native allocation or silently treating failure as success.
Rights/native backing are rechecked each submission, including reused drawables.
Context loss or session disposal prevents a submitted receipt.

Frame reconciliation removes nonparticipants, prepares changed drawables, assigns
unique comparator rank to each actual Mesh, then calls the **same** renderer.render.
Parent Object3D renderOrder is not relied on. Existing node matrices/visibility
match accepted state; synchronous mutation guard prevents a half-updated frame.
Membership/layer/depth/layout/transform/visibility/resource/correlation changes
invalidate existing Phase6 demand, conservatively including unused key edits.
Invalid/equal policy/layout edits do not publish new state. No resource async
completion sort, RAF/interval, automatic frame or layout ownership.

No active scope or no drawable items still submits the original opaque blue clear.
Existing binding-only sessions do not become graphics-ready. Legacy finite
`renderVisualResourceDemo` still draws its diagnostic quad after the scene pass,
as an explicit overlay; it is not used to implement Visual Scene sprites.

## Three/Phase7 ownership and failures

Locked Three0.186.1/types0.186.0 support official
[ExternalTexture](https://threejs.org/docs/pages/ExternalTexture.html), wrapping a
texture from the same context. Installed r186 WebGLTextures skips normal texture
upload/init ownership for this type and binds sourceTexture. No private renderer
properties, deep Three imports, copying native handles into public data, second
upload or ImageBitmap retention. Native allocation lifetime remains Phase7.

Each unchanged drawable reuses its BufferGeometry/MeshBasicMaterial/Mesh across
frames and movement/order changes. Immutable layout/frame/axis or backing changes
replace its geometry/material. One reference-counted ExternalTexture wrapper per
currently drawn Phase7 backing allocation is shared by multiple sprites. Sampling
comes from the original native allocation; wrapper colorSpace reflects the explicit
Phase7 upload option (sRGB native internal format or linear-sRGB RGBA8).

Binding/layout replacement drops an old drawable before releasing old resource
usage. Transform removal, instance removal, clear and scope disposal unlink node
and mesh, dispose owned geometry/material and drop wrapper references; they never
call texture.release/deleteTexture. Hiding can drop geometry at the next frame,
but retains the independent instance lease. Before sampling on show, live rights
are checked again. Released host leases cannot revoke separately retained instance
rights; explicit cache/session invalidation still can.

Partial construction disposes any geometry/material/wrapper acquired so far.
Replacements are tracked before old cleanup/attachment; terminal teardown drains
partial reconciliation. Every cleanup stage is attempted; uncertainty propagates
through existing FrameError cleanup diagnostics. Phase6 failure closes the session,
not a fake successful partial frame. Backend disposal drains sprite drawables before
invalidating native textures and disposing the renderer. External wrapper dispose
drops its source reference and does not own/delete Phase7 GL textures in r186.
No cross-context sharing, silent reuse-after-release or GPU leak-free claim.

## Alpha profile and unsupported cases

The selected v0.8.8 basic 2D profile is now installed using
[MeshBasicMaterial](https://threejs.org/docs/pages/MeshBasicMaterial.html): unlit
white map, transparent=true, NormalBlending, opacity1, premultipliedAlpha=false,
alphaTest0, depthTest=false, depthWrite=false, toneMapped=false, fog=false.
All sprites share one transparent group/list; ascending unique Mesh ranks determine
back-to-front source-over order. sRGB texture hardware decode/Three output color
handling is used, not a second color pipeline. Actual color/alpha pixels unobserved.

Refinement from the earlier planned front-facing quad: DoubleSide with
forceSinglePass=true handles explicit axes and affine reflections without a second
transparent pass. It is still one flat quad/two triangles; not 3D volume rendering.
No frustum-culling inference. Unsupported: intersecting translucent3D, per-triangle/
cyclic occlusion, OIT, mixed opaque/transmission/custom passes, depth-writing
occluders, postprocessing and arbitrary material hooks. Diagnostic overlay order
is separate. Layer rank cannot override unrelated native passes.

## Optional manual consumer, verification and rollback

`manual/visual-scene-frame.mts` uses package-root APIs and actual Phase7 loads;
`manual/visual-scene-frame.html` lets the Developer select authorized local PNGs.
No bundled third-party image, stored filename, upload endpoint, mock lease,
assertion, runner, browser automation or synthetic acceptance. See the
[manual guide](../manual/visual-scene-frame.md). Browser execution **NOT_EXECUTED**;
two-item/clear/hide/move/order/alpha/lifetime acceptance remains unverified.
TPSHEET_NOT_VERIFIED / TPSHEET_VISUAL_NOT_VERIFIED remains; the page selects whole
PNGs, while the compiled consumer also accepts existing canonical frame bindings.

Rollback removes three root symbols, private sprite layout/snapshot bridge and
draw scope integration; old explicit transform/membership/frame APIs remain.
No schema, dependency, public frame status, Engine/Server or L1/L2 migration.
