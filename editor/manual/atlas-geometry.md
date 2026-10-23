# Atlas geometry — optional finite manual consumer

Run after workspace build, from repository root (PowerShell):

```powershell
node node_modules/typescript/bin/tsc --ignoreConfig --strict --noUncheckedIndexedAccess --exactOptionalPropertyTypes --module NodeNext --target ES2022 --lib ES2022,DOM --rootDir editor/manual --outDir .artifacts/atlas-manual editor/manual/atlas-metadata.mts editor/manual/atlas-geometry.mts
node editor/manual/atlas-metadata-node.mjs --geometry <original.tpsheet> <exact-header-texture> <image-source-locator> [second triple]
```

The existing bounded, read-only file host/provider is reused. It reads only explicitly
selected original metadata, logs hashes and never resolves a texture header as a
filesystem path. Select the verified TexturePacker Unity exporter profile only.
The observer logs all exact keys, page/source IDs, image-pixel rectangles and UVs,
then wrong dimensions/nonfinite dimensions/wrong source/forged page diagnostics.
The host additionally changes only the first frame's x to MAX_SAFE_INTEGER in an
explicit malformed in-memory copy and logs parser rejection. No original file is
modified and the malformed copy is not evidence of another supported format.
No assertions, expected comparisons, runner or CI execution.

Numeric inspection uses header dimensions. Independently decode the corresponding
PNG pages and inspect agreement; this demo does NOT pretend header size is decoded
image evidence. In this run Pillow loaded original PNGs as128x128 and128x256,
matching header dimensions. Browser decoder/GPU evidence is separate.

Observed original Wound_7 examples (top-left half-open rectangles):

| Key | Pixel x,y,w,h | UV left,top,right,bottom |
| --- | --- | --- |
|0050|1,1,60,47|.0078125,.0078125,.4765625,.375|
|0052|63,1,59,47|.4921875,.0078125,.953125,.375|
|0054|1,50,57,46|.0078125,.390625,.453125,.75|

Attack1_0 key0000 is on image-1/page-1: `(78,1,32,56)`, UV
`(.609375,.00390625,.859375,.22265625)`. All11 frames were inspected numerically.
Malformed x rejected INVALID_FRAME at line15, before a geometry can be created.
Wrong dimensions -> PAGE_DIMENSION_MISMATCH, Infinity -> INVALID_PAGE_PIXELS,
wrong image source -> IMAGE_SOURCE_MISMATCH, forged page -> ATLAS_NOT_SUPPORTED.
The retained metadata pivot0050 is approximately(-2.266667,-2.489362); no anchor or
placement operation is invoked. Trim/source size remain null, no rotated support.

Optional `inspectAtlasTextureViews(session, texture, atlas, pageId)` is a compiled
public-root hook for a browser host that has independently decoded/uploaded the
exact page ONCE. It reads actual texture dimensions, creates borrowed subviews for
that page and logs current texture snapshots. It never uploads/releases a texture.
No browser host ran this hook during v0.7.7: GPU subview/display NOT_OBSERVED.
Do not supply fake handles or infer successful display from numeric geometry.

See [contract and provenance](../../runtime-render/docs/visual-loading-v0.7.7.md).
FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED / TPSHEET_VISUAL_NOT_VERIFIED remain.
No tests, browser automation, scene objects or crop/upload per frame.
