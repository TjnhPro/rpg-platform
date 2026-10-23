# v0.7.13 — minimal visual demonstration contract

One additive root function (Render125 ->126):

```ts
renderVisualResourceDemo(
  session: RenderFrameSession,
  texture: RenderTexture,
  geometry?: AtlasFrameGeometry,
): RenderFrameReceipt
```

The function borrows a canonical live texture right for one synchronous frame.
Without geometry it draws the complete image; with geometry it draws that canonical
frame rectangle. Geometry must match texture dimensions. The host explicitly
attests page/source correspondence, as with createAtlasTextureView; dimensions do
not prove content identity. Foreign/mismatched/released rights reject before
submission; cross-session rights use existing CONTEXT_MISMATCH. A released alias
cannot draw a retained allocation owned by another lease.

The rectangle is stretched to the central80% of the full active viewport, over
the existing blue clear. Canonical UVs use first-uploaded-row origin; the private
quad maps that row to the top. Texture sampling/color interpretation uses the
existing upload options; output is sRGB for this narrow default-canvas demo.
No world placement, fit/aspect policy, pivot application, sorting, Scene instance,
animation, frame advancement or retained selection is introduced.

Existing renderFrame() keeps its clear-only behavior. Both paths use the same
canonical session admission/submission routine: suspension and nested-frame
rejection, viewport extent, context/GL errors, backend early-return detection,
terminal cleanup and invalidation acknowledgement. Receipts are SUBMITTED only,
never DISPLAYED. Invalidations schedule nothing. No new frame failure union.

There is one WebGLRenderer/backend/context per canonical session. Its private
single-quad shader/VAO are allocated lazily inside that backend, around Three's
public resetState cache synchronization. Texture aliases map to their backing
identity privately; native textures remain in the owning backend's map. No native,
Three or bitmap handle crosses the package root. Quad resources are disposed with
the session; textures still have independent lease/resource lifetimes. Failed
partial quad cleanup is sticky and quarantines the target through existing policy.

prepareVisualResource remains synchronous metadata-only NOT_PERFORMED. No
manifest/dependency/schema change, second loader, extra project, Engine/Server or
L1/L2 modification. Editor134 and Client0 root export counts stay unchanged.

Optional [manual runbook](../manual/visual-resource-mvp.md) composes Editor's
Catalog/reference descriptor and Client's independent provider with root APIs.
Expected counters and actual observations are separate. Browser NOT_EXECUTED;
FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED / TPSHEET_VISUAL_NOT_VERIFIED.
