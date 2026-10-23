# VL07/VL08 — Atlas metadata and source-format boundary

Runtime Render alone owns parsing/normalized metadata. Editor passes neutral
source roles/locators and hosts an optional manual consumer; Client compiles the
Render root. Engine, Server, L1/L2 and authored Asset/Scene/Document APIs do not
participate. No new dependency, package, renderer, registry or cache.

## Verified format and source evidence

Supported name: **unity-tpsheet-40300-rect**, a deliberately restricted profile
observed in original local `.tpsheet` files, not JSON renamed as TPSheet. Samples
were discovered read-only in sibling `jx1-manager-editor/data/asset-sources/monster/ani063`:

| Original file | Bytes | SHA256 |
| --- | ---: | --- |
| Wound_7.tpsheet | 594 | 2a4f8e481fb7934b84431bf47deaece16d28af31c220646cd799cb0effc8f57d |
| Attack1_0.tpsheet | 888 | fe5c87c2e5cba46b43482080f15f5ed607450bb7e15cc72dff3f515c8969efc7 |
| Wound_7.png | 4132 | 564e290a89c9352aa8535e83857f8fc17ae16325d7e073a18ad21bd9f38b1a3d |
| Attack1_0.png | 12270 | f31783508fe55cc39a421b9f3505503a831d7727605c1f2278e4a690585d3cd2 |

Both metadata files are UTF8-compatible text, CRLF, no BOM, with CodeAndWeb
TexturePacker/Unity attribution and SmartUpdate comment. Wound has3 frame rows;
Attack has8. Header dimensions128x128/128x256 match PNG IHDR audit; that is not
PNG decode/display evidence. Existing neighboring conversion scripts were only
inspected, never run/imported/copied or used to manufacture the samples. Dataset
redistribution rights are not established. No metadata/image contents are copied
into this public repository; manual consumers take explicitly authorized originals.
The relative provenance and hashes document the observed files without credentials
or personal machine paths. Independent execution requires access to originals or
another legitimately supplied file in this same profile.

Official [Unity tutorial](https://www.codeandweb.com/texturepacker/tutorials/using-spritesheets-with-unity)
confirms the exporter/importer workflow. Official
[rotation policy](https://www.codeandweb.com/texturepacker/knowledgebase/unity-rotated-sprites)
disables Unity sprite rotation. The proprietary importer
[source is unavailable](https://www.codeandweb.com/texturepacker/knowledgebase/can-i-get-the-source-code).
The exact grammar below is grounded in the original samples, not a claim of a
complete official specification or universal TPSheet compatibility. No upstream
framework/parser implementation is copied.

## Exact profile

- Fatal UTF8 decode; optional UTF8 BOM accepted. LF/CRLF allowed, lone CR and
  unsupported controls reject. Blank lines and column0 `#` comments are ignored.
- Exactly five unique directives before frames: `format=40300`, `texture=<label>`,
  `size=<width>x<height>`, `pivotpoints=enabled`, `borders=disabled`, each preceded
  by `:`. Unknown/duplicate/late directives reject; other versions/profiles reject.
- Exactly11 semicolon fields: frame key, rectangle x/y/width/height, two numeric
  pivot values, four zero border values. Numeric surrounding whitespace is allowed;
  keys remain exact/case-sensitive, nonblank, no edge whitespace/control characters.
  Finite decimal/exponent pivots are binary64 values, may lie outside0..1 and are
  never clamped. Integer rectangles are nonnegative with positive sizes, within page.
- No rotation/trim/border extension is guessed from extra columns. Nonzero border
  data, malformed/unknown columns, duplicate frame keys and empty sheets reject.
  Comments are ignored provenance, never interpreted as layout/animation data.
- Fixed bounds:1MiB/sheet,8MiB total metadata,64 pages,256 source bindings,
  65536 frames total,2048 UTF16 code units/line,32768 per page axis/rectangle value,
  512 code units per ID/key/texture label. These bound admission, not all browser
  memory/CPU. Source provider must bound IO before returning bytes.

## Public surface and binding

Seven additive root symbols (92 →99): `parseUnityAtlasMetadata`,
`AtlasSourceBinding`, `UnityAtlasSheet`, `AtlasMetadataPage`, `AtlasMetadataFrame`,
`AtlasMetadata`, `AtlasMetadataResult`. No previous signature/meaning changes.
Root declarations remain portable ES2022 without DOM or backend types.

`parseUnityAtlasMetadata(descriptor, bindings, sheets)` synchronously parses
**already acquired** `VisualSourceLoad` byte copies; it does not start provider IO,
release sources or touch PNG/GPU. No automatic file suffix/media-hint dispatch.
`prepareVisualResource` stays synchronous metadata-only/NOT_PERFORMED.

Phase2 sources have role/locator pairs, no source ID; repeated roles are legal.
`AtlasSourceBinding` supplies a Render-local `sourceId` for an explicit
`sourceIndex` in this exact captured descriptor. IDs and indices must be unique;
the caller must update bindings when reordering the descriptor. There is no
image-first/metadata-second assumption or implicit mapping to Asset identity.
Bindings/sheets are closed dense data records; unknown fields/accessors/symbol
fields/sparse arrays reject. Descriptor capture reuses canonical validation.

Each sheet names pageId, metadataSourceId, imageSourceId, textureReference and
metadata lifetime. Referenced roles must be exactly atlas-metadata/image. Metadata
acquisition identity, index, role and locator must match the captured descriptor.
Its length must be bounded and match copied bytes. Public source lifetimes remain
a trusted host seam, as with the PNG decoder; forged implementations do not prove
authorization. Native/host exceptions propagate, not guessed from message strings.

The host explicitly declares the exact expected `:texture` label and its image
source binding. Header text is compared with this declaration, never joined to a
directory or fetched. The image locator may differ from that label because the
host controls packaging. A declaration is not proof the image exists or matches
dimensions; future consumption must compare actual decoded dimensions. Unbound
descriptor sources are allowed (including decoy image roles); only bound sources
are retained in metadata. Unknown authored extension data is not imported here.

## Normalized immutable result and compatibility

The source parser (`unity-atlas.ts`) feeds a separate private normalized capture
(`atlas-metadata.ts`). Parsed metadata is deeply detached/frozen, with resource
identity, explicit source table, ordered pages and ordered frame list; no bytes,
provider, source lifetime or backend is retained. Each page has unique pageId,
metadata/image source IDs and declared dimensions. Each frame has an atlas-wide
unique opaque key, pageId, numeric rectangle, sourcePivot, rotation:none and
trim:null. Null means trim unavailable, not known-untrimmed. Numeric coordinates
retain `unity-tpsheet-40300-native`; no origin conversion, UV, pivot application,
cropping, PNG splitting or draw geometry is performed. Order is source order,
not an animation timeline; neither numeric frame keys nor filenames imply facing,
action, duration, skill or gameplay identity.

Multi-page support means explicit composition of multiple observed single-page
files. Page references/duplicate page IDs/metadata-source reuse/duplicate global
frame keys reject atomically; no partial atlas escapes. No invented in-file
multipack directive. Additional verified formats may later adapt into normalized
metadata directly, without changing the old VisualResourceDescriptor or inventing
a plugin registry. Future trim/rotated metadata needs a real source/spec and an
explicit additive contract; present inputs reject unsupported records. v0.7.7 owns
actual origin/UV/rotation/trim geometry, after matching decoded page dimensions.

Known data failures return frozen `status:rejected` with code, safe pageId/line,
no raw source text or partial metadata. Invalid descriptors/unknown host errors
can throw unchanged. A successful parse establishes metadata only; release or
mutation of caller byte copies cannot rewrite the result. No lossless re-export,
authored import/save, cache key/revision policy or GPU readiness is implied.

## Evidence

The [manual consumer](../../editor/manual/atlas-metadata.md) parsed the exact two
original files above:2 pages/11 keys and known malformed-copy rejections observed.
This is **TPSHEET_METADATA_OBSERVED**, restricted to those files/profile. It is
not a broad TPSHEET_PASS or FUNCTION_PASS. Overall **FEATURE_NOT_VERIFIED /
VISUAL_NOT_VERIFIED / TPSHEET_VISUAL_NOT_VERIFIED**; pixels, geometry and rendering
are outside this checkpoint. No tests/assertion suites/runners were introduced.
