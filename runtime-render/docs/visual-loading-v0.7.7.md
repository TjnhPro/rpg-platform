# v0.7.7 — Atlas geometry and borrowed texture views

Canonical owner: Runtime Render. Six additive root symbols:
`AtlasPagePixels`, `AtlasFrameGeometry`, `AtlasFrameGeometryResult`,
`resolveAtlasFrameGeometry`, `AtlasTextureView`, `createAtlasTextureView`.
Existing APIs/shapes/exports remain intact. Editor/Client are compile consumers;
Editor contains only an optional manual public-root consumer.

## Verified layout, bounded support

Audited the official [TexturePacker 8.3.0 Linux distribution](https://www.codeandweb.com/download/texturepacker/8.3.0/TexturePacker-8.3.0.deb),
SHA256 `2a19ffd1d1af5a8f61293f5311d5ddcd9a6fb22192d70c455ab02400371dff9d`.
Read, did not install/execute or redistribute, these bundled exporter sources:
`usr/share/texturepacker/exporters/unity/exporter.xml` and
`unity/grantlee/0.2/TransformCoords.qs`. The XML selects BottomLeft sprite origin
and disables rotation; the export filter writes format40300, frame width/height
and Y as texture height minus internal frame Y minus height. This proves the
Unity exporter rectangle conversion, rather than deriving origin from a suffix.
[Official custom-exporter documentation](https://www.codeandweb.com/texturepacker/documentation/custom-exporter)
describes these installed templates. The modern exporter can emit additional
headers/polygons; this checkpoint does NOT broaden the restricted v0.7.5 parser.

Actual provided originals are Wound_7 and Attack1_0, as documented in v0.7.5.
Their 11-field rectangle rows have no rotation, source size or trim offsets.
Large/negative source pivots are retained raw; they do not recover missing source
geometry. Borders are disabled. Spacing/extrusion cannot be inferred from rows.
Other producers may use the same format number with different conventions:
caller MUST explicitly select `texturepacker-unity-bottom-left`. A header alone
is not proof of provenance; do not select that profile for an unaudited producer.
No top-left alternate profile, rotated, polygon or trimmed format is supported.

## Pixel and UV contract

`resolveAtlasFrameGeometry(reference, atlas, expectedRevision, pagePixels)` reuses
the canonical v0.7.6 lookup/revision guard. Caller identifies the page's exact
imageSourceId, verified layout and explicit image-pixel dimensions from its decoded
image. Numeric geometry is pure: it cannot itself prove a caller decoded an image.
Page/source identity, safe positive integer dimensions, exact page-size agreement,
nonnegative safe rectangle coordinates, positive extent and bounds are checked.
Subtraction-based bounds reject overflow; equality with the page edge is valid.
Copied atlas data/invalid page references fail canonical lookup; no first-page fallback.

For native bottom-left `(x,y,w,h)` in page `(W,H)`, output is top-left image-pixel
`(x,H-y-h,w,h)`. Rectangles denote half-open pixel edges `[x,x+w) × [y,y+h)`.
The last covered pixel is `(x+w-1,y+h-1)`. UV edges are
`left=x/W`, `right=(x+w)/W`, `top=(H-y-h)/H`, `bottom=(H-y)/H`.
No half-texel inset, padding addition, rotation, pivot compensation or placement
conversion is hidden. Linear filtering can bleed adjacent atlas content; no claim
of bleed-free sampling or automatic repacking/extrusion.

UV v=0 means the first uploaded image row, not a world-space upward axis. Current
PNG decoder uses unresized ImageBitmap/from-image, rejects PNG orientation metadata;
current backend uploads that bitmap without a Y transform. The
[WebGL specification](https://registry.khronos.org/webgl/specs/latest/1.0/#TEXIMAGE2D_HTML)
transfers the upper-left source pixel first; ImageBitmap orientation is baked at
creation and pixel-store flip flags are ignored for it. Thus the top-left output
and increasing-v-downward corners match this existing upload path. A future
backend/image orientation change must review this contract, not silently flip UVs.

## Extraction and lifetime

`createAtlasTextureView(session, texture, geometry, imageSourceId)` requires a
canonical geometry object and canonical same-session usable texture of matching
dimensions. The explicit source ID is the host's attestation of which image it
uploaded. Existing texture handles do not expose image-source revision provenance:
matching ID/dimensions does NOT verify content identity or external freshness.
Hosts must pair the current atlas/image correctly and re-resolve after revision
change. Never claim this API hashes/reloads/verifies an image automatically.

The frozen view borrows the EXACT existing texture and immutable geometry. It
performs no IO/decode/crop/copy/PNG encoding/upload/backend allocation and owns no
lease. Release the caller-owned page texture once, not once per frame. A view
cannot keep the texture usable after release/context loss. `view.getSnapshot()`
observes canonical current texture state; creation-time geometry is historical.
Observe before use. Cross-session texture use is rejected by existing diagnostics.
No native texture/Three object escapes. No cache/global registry: only weak
geometry authenticity, with no bytes/provider/session retention in that WeakSet.

`trim` and `sourceSize` are null (unavailable), `rotation` is none for this verified
profile. No assertion that original sprites were untrimmed. No new trim-offset
behavior is implemented or claimed. Geometry never accepts or changes authored
placement, Phase4 anchor/pivot/alignment or direction. Source pivot stays metadata.
There is no Scene renderer, quad submission, visual instance, animation or selection.

See [finite manual instructions](../../editor/manual/atlas-geometry.md) and
[checkpoint evidence](../../harness/checkpoints/visual-loading-v0.7.7.md).
