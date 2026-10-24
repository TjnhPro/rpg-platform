# SA01 actual API and prerequisite inventory

Baseline: main `78dc4a9d14288df33ca46b3af4d23d09ceef9b82` (Phase9 merged).
The standalone task's earlier observation that Phase7 was open and Phase8/9
unconfirmed is historical. Current source implements those dependencies. This
inventory establishes source/declaration readiness, not native product acceptance.

## Source and emitted declaration audit

Each source below was inspected together with its corresponding emitted
`runtime-render/dist/<same-name>.d.ts` after genuine builds. Package-root export
membership was separately resolved through `src/index.ts`; a symbol emitted from
an internal file is not automatically a public-root contract.

| Phase / seam | Current source under runtime-render/src | Actual public-root surface and limits |
| --- | --- | --- |
| 4 orientation/origin | visual-alignment.ts, planar-affine.ts | VisualAnchor2D, VisualOrientation2D, createVisualAnchor2D, createVisualOrientation2D, resolveVisualAlignment2D; numeric local anchor/pivot, canonical axes and angle; alignment does not select or rotate sprite frames |
| 6 submission | frame-session.ts, viewport-size.ts | RenderFrameSession, RenderFrameReceipt, invalidateRenderFrame, getRenderFrameInvalidationSnapshot, resizeRenderViewport; demand submission, no animation clock |
| 7 frame identity | atlas-frame.ts, atlas-metadata.ts, unity-atlas.ts | VisualFrameReference, createVisualFrameReference, resolveAtlasFrame, parseUnityAtlasMetadata, getAtlasMetadataRevision; exact opaque subresourceId and parser-issued revision symbol |
| 7 geometry/view | atlas-geometry.ts | AtlasPagePixels, AtlasFrameGeometry, resolveAtlasFrameGeometry, AtlasTextureView, createAtlasTextureView; source-page attestation and canonical geometry, no IO/crop/upload |
| 7 cache/leases | visual-resource-cache.ts, visual-resource.ts, visual-source.ts | VisualResourceDescriptor, VisualResourceLease, createVisualResourceCache; host acquisitions and session-scoped live resources; retainVisualResourceLease is owner-private and absent from root |
| 8 live instances | visual-scene.ts, visual-sprite-layout.ts, visual-instance-transform.ts | RenderVisualScene, RenderVisualInstance, createRenderVisualScene, addRenderVisualInstance, bindRenderVisualInstanceResource, getRenderVisualInstanceResource, set/getRenderVisualInstanceSpriteLayout, set/getRenderVisualInstanceTransform; public resource snapshots expose observations, not retained release rights |
| 8 native draw | three-visual-draw.ts | Owner-private adapter uses existing Phase7 native texture allocation and selected UV geometry; animation must use Scene root, not import this backend |
| 9 camera | camera.ts, camera-scene.ts, camera-projection.ts, camera-inverse.ts | RenderCamera, createRenderCamera, bindRenderCameraToVisualScene, getRenderCameraFrameSnapshot; optional camera composes existing session/scene; no new camera or renderer needed |

Selected actual signatures, abbreviated only by omitting readonly members/comments:

```ts
createVisualOrientation2D(input: VisualOrientation2D): VisualOrientation2D;
createVisualFrameReference(input: VisualFrameReference): VisualFrameReference;
resolveAtlasFrame(input: VisualFrameReference, atlas: AtlasMetadata | null,
  expectedRevision: symbol): AtlasFrameResolution;
resolveAtlasFrameGeometry(reference: VisualFrameReference,
  atlas: AtlasMetadata | null, expectedRevision: symbol,
  pixels: AtlasPagePixels): AtlasFrameGeometryResult;
createAtlasTextureView(session: RenderFrameSession, texture: RenderTexture,
  geometry: AtlasFrameGeometry, imageSourceId: string): AtlasTextureView;
bindRenderVisualInstanceResource(scene: RenderVisualScene,
  instance: RenderVisualInstance, input: RenderVisualResourceBindingInput | null
): RenderVisualResourceBindingSnapshot | null;
getRenderVisualInstanceResource(scene: RenderVisualScene,
  instance: RenderVisualInstance): RenderVisualResourceBindingSnapshot | null;
```

RenderVisualResourceBindingInput contains resource:VisualResourceLease,
expectedSourceRevision:string and frame:RenderVisualFrameBinding|null. The frame
contains reference, atlas, expectedRevision and pixels. Phase8 validates then
retains its own usage right; it commits a new binding before old usage cleanup.
Cleanup failure can therefore follow a successful state change. Layout/resource
setters are separate; no atomic combined operation is present.

Atlas metadata sourcePivot contains numeric x/y only. Current supported profile
has rotation:'none', trim:null and geometry sourceSize:null. Neither sourcePivot
units nor absent original dimensions can be inferred by animation. A matching
historical atlas token observes its historical object, not automatic freshness.

## Compatibility evidence

TypeScript compiler export enumeration and declaration-only emission compared
every exported symbol against source at the baseline SHA, not just export counts.
No added/removed/changed declaration was observed:

| Neutral root | Baseline | Current | Added / removed / changed |
| --- | --- | --- | --- |
| runtime-render | 231 | 231 | 0 / 0 / 0 |
| editor | 138 | 138 | 0 / 0 / 0 |
| game-client | 0 | 0 | 0 / 0 / 0 |

Proposed Sprite*/EightWaySprite* names in the [design](sprite-animation-v0.10.0.md)
are not installed exports. No existing signature, diagnostic union, dependency,
package root or generated declaration is changed by SA01. Root compilation under
strict ES2022/NodeNext with types:[] and no DOM lib remains separate from behavior.

Installed baseline: Three0.186.1, @types/three0.186.0, TypeScript6.0.3.
Core2.0.0 revision `04b7239f998c3c688a0dfa3202f11811a9acd775` and Gameplay0.15.2
revision `acea332aa80f67552192a72b30f81c0bbbfc56bd` remain read-only and unchanged.
No L1/L2 API is required by this design-only change.

## Readiness boundary

No required Phase4/6/7/8/9 public seam is absent for the proposed fixed-layout
composition. No automatic disposal notification, public lease-retain operation,
atomic layout/resource update or trim reconstruction is assumed. The design
uses explicit host lifetime and existing public observations instead.

No runtime animation was implemented, executed or rendered. There is no supplied
verified eight-direction asset; visual MVP remains dependent on real authored
eight-slot sequences and source provenance. v0.10.1 capture can proceed only from
its supplied scope and a fresh delta preflight; no future task is inferred here.
