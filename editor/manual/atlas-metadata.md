# Atlas metadata — finite manual consumer

This consumer reads one or two explicitly selected original TPSheet files through
a bounded host/provider and calls only the Render public root. It prints page/
frame/source IDs and malformed-copy diagnostics for human inspection. No test
runner, assertions, expected-result comparisons, directory scan or automatic CI.
No authored Asset Catalog, PNG decode, GPU/session or visual operation.

```powershell
npm run build -- --force
node node_modules/typescript/bin/tsc --ignoreConfig --strict --noUncheckedIndexedAccess --exactOptionalPropertyTypes --module NodeNext --target ES2022 --lib ES2022,DOM --outDir .artifacts/atlas-manual editor/manual/atlas-metadata.mts
node editor/manual/atlas-metadata-node.mjs '../jx1-manager-editor/data/asset-sources/monster/ani063/Wound_7.tpsheet' Wound_7.png pages/wound.png '../jx1-manager-editor/data/asset-sources/monster/ani063/Attack1_0.tpsheet' Attack1_0.png pages/attack.png
```

The last command is the observed local dataset invocation. Those originals are
not distributed here because redistribution rights were not established. Replace
each triple with an authorized original file, exact expected `:texture` header
label, and explicit image source locator. The image locator is descriptive only;
the consumer does not read it or infer it from the metadata filename. Never rename
JSON or generate a fake TPSheet to substitute for a missing original. See
[provenance/profile](../../runtime-render/docs/visual-loading-v0.7.5.md).

The `.mjs` host owns exact-file realpath/open/bounded read, pre/post size/time
observations, close and SHA256 provenance. It performs no write. These checks
detect ordinary concurrent modification, not adversarial transactional integrity.
The separately compiled `.mts` consumer owns only scoped provider composition.
No Node typings/dependencies are added just for the optional host. All derived
malformed data remains in memory with its own byte hash/revision.

Descriptor order starts with an unbound decoy image, then metadata before its
page image; both roles repeat for two sheets. Source bindings use explicit IDs
and indices; page1 and page0 have independent source bindings. Inspect that the
decoy never supplies a page. Valid originals print native rectangles/source pivots
and frozen observations. Duplicate-frame memory copy, unknown header, missing
image binding and duplicate page ID print safe rejections. Caller byte-copy
mutation and source release leave the previously parsed description inspectable.

Observed Node24.18.0: metadata preparation NOT_PERFORMED/reads0; originals parsed
to page-0(128x128,0050/0052/0054) and page-1(128x256,0000/0002/0004/0006/0008/0010/
0012/0014). Four provider reads total: two original files and two memory variants.
Duplicate frame rejected DUPLICATE_FRAME_KEY at line19; unknown header
INVALID_HEADER at line9; missing source INVALID_BINDING; duplicate page
DUPLICATE_PAGE_ID. Atlas/pages/frames/first rectangle/pivot were frozen. Metadata
remained after source release and caller-copy mutation; original hashes unchanged.
This is a finite manual observation, not universal parser acceptance or tests.

TPSHEET_METADATA_OBSERVED for those exact originals/profile. FEATURE_NOT_VERIFIED /
VISUAL_NOT_VERIFIED / TPSHEET_VISUAL_NOT_VERIFIED for full feature/pixel behavior.
PNG counterparts were only hash/IHDR-audited, not decoded/rendered. Coordinate
origin conversion, UV/trim/rotation geometry, large datasets and all other TPSheet
versions/profiles remain unverified or unsupported. Developer owns acceptance.
