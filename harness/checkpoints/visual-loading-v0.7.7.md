# v0.7.7 — VL10 Atlas Geometry & Frame Extraction

Status: **READY_FOR_NEXT_CHECKPOINT / BUILD_PASS**.
**GEOMETRY_NUMERIC_OBSERVED / TPSHEET_METADATA_OBSERVED** for finite originals.
**FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED / TPSHEET_VISUAL_NOT_VERIFIED**.

## Baseline, scope and ownership

Starting HEAD `0757bf01398035c710e9b604263645cd794ea9de` (v0.7.6), branch
`feat/visual-resource-loading-v0.7`, existing draft [PR7](https://github.com/TjnhPro/rpg-platform/pull/7).
main baseline `33c9da5ac79cfce27043927fe5d7e08e3bd6d02c`.
Previous exact-head push [SUCCESS](https://github.com/TjnhPro/rpg-platform/actions/runs/39908534264)
and PR [SUCCESS](https://github.com/TjnhPro/rpg-platform/actions/runs/39908539127).
Implementation/CI is not formal Developer acceptance. Supplied
[task](../../runtime-render/docs/tasks/visual-loading-v0.7.7.md) explicitly authorizes
this additive contract/checkpoint without another per-version review gate.
Pre-existing untracked `.mcp.json` remains unread/unmodified/excluded.

Read root/relevant project guidance, Architecture/Foundation, Harness ownership,
contracts/workflow/verification and actual public/source APIs. Audited v0.7.5/6
parser/normalized frames/page/revision, decoder, texture lifetime/dispatch, actual
backend upload, Phase4 alignment, Editor adapter/reference/manual hosts, Client
root/host and current emitted declarations/manifests. Three0.186.1/@types0.186.0
unchanged. No new dependency/manifests/lockfile or external L1/L2 APIs needed.

Runtime Render is the sole primary geometry/texture owner. Editor touched only
for a finite optional public-root manual consumer; Client is a compile consumer.
No production Editor, Client, Engine, Server, L1/L2, authored schema, checker,
config or CI changes. Exactly five projects. No owner/import-direction move.

Nine scoped paths:

- Render `src/atlas-geometry.ts`, `src/index.ts`: geometry and borrowed subview API.
- Render `docs/visual-loading-v0.7.7.md`, `docs/tasks/visual-loading-v0.7.7.md`:
  source audit, contract and implementable task.
- Editor `manual/atlas-geometry.mts`, `manual/atlas-geometry.md`: numeric observer
  and optional pre-uploaded-texture hook, no production integration.
- Editor `manual/atlas-metadata-node.mjs`, `manual/README.md`: optional --geometry
  selection on existing bounded read-only host; existing modes preserved.
- This checkpoint.

## Exact public delta and behavior

Six additive root symbols, Render105 ->111, Editor134/Client0 unchanged:
`AtlasPagePixels`, `AtlasFrameGeometry`, `AtlasFrameGeometryResult`,
`resolveAtlasFrameGeometry`, `AtlasTextureView`, `createAtlasTextureView`.
Prior symbols/members/signatures/semantics unchanged; no browser/native types.

Pure geometry reuses canonical frame lookup/current revision validation. It requires
explicit verified layout selection, source ID, image-pixel unit and dimensions;
validates page agreement, safe finite integer dimensions and non-overflow bounds.
Native bottom-left is converted to top-left image-pixel half-open edges, then UVs
with v0 at first uploaded row. No inset/padding addition. The current ImageBitmap
upload has no Y transform; full audit and formulas are in the contract.

Borrowed view wraps the exact existing canonical same-session usable page texture,
checks dimensions/source attestation, and observes current state through its snapshot.
No crop/PNG encode/new upload/copy/allocation/lease/cache. Releasing the original
texture invalidates use of all views; callers retain/release their page ownership.
Image source ID is explicit host attestation: existing texture API does not expose
source revision provenance, so image identity/freshness is NOT automatically proven.
Geometry is historical; hosts must bind current atlas/image and re-resolve on reload.

Rotation none, sourceSize/trim null reflect the verified restricted format only.
No source-size/trim offset fabricated from pivots; no authored placement/anchor or
direction parameter accepted or changed. No trim-offset placement behavior claimed.
No Scene rendering/animation/direction/visual-instance/repacking/cache subsystem.
Synchronous metadata preparation remains resourceLoading NOT_PERFORMED.

## Source audit and finite observations

Official TexturePacker8.3.0 .deb read as archive only (not installed/executed), SHA256
`2a19ffd1d1af5a8f61293f5311d5ddcd9a6fb22192d70c455ab02400371dff9d`.
Bundled unity/exporter.xml and unity/grantlee/0.2/TransformCoords.qs prove bottom-left
frame Y via H-y-h. Modern optional headers/polygons remain unsupported by the current
restricted parser. Same header from another generator does not establish its origin;
new geometry API requires explicit audited TexturePacker Unity layout selection.
See [source links and semantics](../../runtime-render/docs/visual-loading-v0.7.7.md).
The upstream archive stays ignored in .artifacts; no external exporter code copied.

Read-only original TPSheet SHA256 values unchanged:
Wound_7 `2a4f8e481fb7934b84431bf47deaece16d28af31c220646cd799cb0effc8f57d`,
Attack1_0 `fe5c87c2e5cba46b43482080f15f5ed607450bb7e15cc72dff3f515c8969efc7`.
Pillow actually decoded corresponding PNGs to128x128/128x256, matching headers:
`564e290a89c9352aa8535e83857f8fc17ae16325d7e073a18ad21bd9f38b1a3d`,
`f31783508fe55cc39a421b9f3505503a831d7727605c1f2278e4a690585d3cd2`.
Original dataset/PNGs are outside workspace, unmodified/not redistributed.
This offline decode is not browser decoder/GPU observation.

Finite public-root Node consumer logged all11 frames across two pages. Examples:

| Frame/page | Top-left pixel x,y,w,h | UV left,top,right,bottom |
| --- | --- | --- |
|0050/page-0|1,1,60,47|.0078125,.0078125,.4765625,.375|
|0052/page-0|63,1,59,47|.4921875,.0078125,.953125,.375|
|0054/page-0|1,50,57,46|.0078125,.390625,.453125,.75|
|0000/page-1|78,1,32,56|.609375,.00390625,.859375,.22265625|
|0014/page-1|1,112,31,55|.0078125,.4375,.25,.65234375|

Frames near padded top/left/right page edges retain exact pixel extents; no inferred
padding subtraction. Explicit in-memory original-row x=MAX_SAFE_INTEGER variant
was rejected INVALID_FRAME at line15 before geometry creation. No source modified.
Wrong dimensions ->PAGE_DIMENSION_MISMATCH; Infinity ->INVALID_PAGE_PIXELS;
wrong source ->IMAGE_SOURCE_MISMATCH; forged missing-page snapshot ->ATLAS_NOT_SUPPORTED.
These are human-inspected finite observations, no assertion suite/functional PASS.

## Required gates and remaining limits

All final commands exit0:

| Gate | Observed result |
| --- | --- |
| `npm run build --workspace runtime-render` | BUILD_PASS |
| `node harness/cli.mjs check` | ARCH_CHECK_PASS96 source files |
| `node harness/cli.mjs scope --projects runtime-render,editor,game-client --allow-infra` | SCOPE_PASS10 (9 scoped paths + excluded .mcp.json) |
| `node harness/cli.mjs verify --projects runtime-render,editor,game-client --with-consumers` | Render/Editor/Client independent BUILD_PASS |
| `npm run build -- --force` | All-five workspace BUILD_PASS |
| Strict optional manual consumer compile | PASS |
| Strict ES2022/types[]/skipLibCheck:false six-symbol root consumer | PASS |
| Root import with throwing browser-global getters | PASS; preparation NOT_PERFORMED |
| Explicit original-file --geometry consumer | Exit0, numeric observations above |
| `git diff --cached --check` | PASS |

No failed/unconfigured build, tests/assertions/runners/browser automation or historic
exhaustive suite. Existing Windows DEP0190 warning remains non-failing. Exact SHA
and push/PR CI evidence are appended to PR7 after push, not invented in this report.

Optional GPU subview hook compiled but NOT_EXECUTED against real browser/GPU. No
GPU display, filtering/bleed, context-loss subview observation, trim-offset placement,
rotated/trimmed format, external freshness, performance or full feature verification.
Numeric edge inspection is not a rendered sprite. No architecture blocker observed.
Developer owns visual/functional phase acceptance. No merge/release/publish or
v0.7.8 implementation included.
