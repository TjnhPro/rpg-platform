# v0.7.5 — VL07/VL08 Sprite Sheet & Atlas Metadata Foundation

Status: **READY_FOR_NEXT_CHECKPOINT / BUILD_PASS**.
**TPSHEET_METADATA_OBSERVED** for the two exact originals below.
**FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED / TPSHEET_VISUAL_NOT_VERIFIED**.

## Baseline and ownership

Starting HEAD: `85ab7a34c36bebf6971dcf28fc8d824fcff518d4` (v0.7.4).
main: `33c9da5ac79cfce27043927fe5d7e08e3bd6d02c`.
Branch: `feat/visual-resource-loading-v0.7`; existing open draft PR#7.
Previous exact-head push [SUCCESS](https://github.com/TjnhPro/rpg-platform/actions/runs/39906074058)
and PR [SUCCESS](https://github.com/TjnhPro/rpg-platform/actions/runs/39906077571).
This is implementation/CI evidence, not formal Developer acceptance.

The supplied [task](../../runtime-render/docs/tasks/visual-loading-v0.7.5.md)
authorizes this additive public contract and finite manual consumer. Root/project
guidance, architecture, Foundation, Harness ownership/contracts/workflow/verification
and current source/public APIs were audited. Runtime Render owns normalized metadata
and source-format parsing. Editor supplies an optional public-root-only manual host;
Client is a compile consumer. No external L1/L2 API is required or changed.
No Engine/Server, dependency, manifest/lockfile, authored catalog, checker/config or
CI changes. Exactly five projects. Pre-existing untracked `.mcp.json` stays unread,
unmodified and excluded. No breaking API or owner/import-direction change.

## Scoped files and contract

Ten task paths:

- Render `src/atlas-metadata.ts`, `src/unity-atlas.ts`, `src/index.ts`:
  detached immutable atlas/page/frame contracts and the restricted verified parser.
- Render `docs/visual-loading-v0.7.5.md`, `docs/tasks/visual-loading-v0.7.5.md`:
  actual format/provenance/policy/compatibility limits and supplied task.
- Editor `manual/atlas-metadata.mts`, `manual/atlas-metadata-node.mjs`,
  `manual/atlas-metadata.md`, `manual/README.md`: bounded exact-selected-file host,
  portable public consumer, observations and instructions.
- This checkpoint report.

Exactly seven additive Render root symbols: `parseUnityAtlasMetadata`,
`AtlasSourceBinding`, `UnityAtlasSheet`, `AtlasMetadataPage`, `AtlasMetadataFrame`,
`AtlasMetadata`, `AtlasMetadataResult`. Emitted root counts Render92 ->99;
Editor134/Client0 unchanged. Existing exports/semantics remain intact. Portable
ES2022 consumer needs no DOM types; headless import needs no browser global.
`prepareVisualResource()` stays synchronous metadata-only / NOT_PERFORMED.

Supported profile is `unity-tpsheet-40300-rect`: UTF8, five exact directives,
eleven semicolon fields, finite pivots and bounded native rectangles, no rotation,
zero border fields. Unknown/duplicate/late directives and malformed records reject.
Explicit source IDs map descriptor indices and repeated roles; exact texture label
is host-validated without becoming an IO locator. Multiple explicitly supplied
single-page originals compose an atlas; no invented multipack directive. Duplicate
page IDs/global frame keys and mismatched source acquisitions reject. Output is
deep-frozen and detached from bytes/provider lifetimes. Original native coordinates
and numeric pivots are preserved; trim is unavailable (`null`), not assumed absent.
No decode, GPU, UV/trim geometry, sprite, animation, cache, registry or gameplay.

## Real source and finite manual observations

Read-only authorized local originals under sibling
`jx1-manager-editor/data/asset-sources/monster/ani063/`:

| Original | Bytes | SHA256 |
| --- | --- | --- |
| Wound_7.tpsheet | 594 | `2a4f8e481fb7934b84431bf47deaece16d28af31c220646cd799cb0effc8f57d` |
| Attack1_0.tpsheet | 888 | `fe5c87c2e5cba46b43482080f15f5ed607450bb7e15cc72dff3f515c8969efc7` |

Actual CRLF UTF8 without BOM; TexturePacker attribution/SmartUpdate comments,
format40300/texture/size/pivotpoints-enabled/borders-disabled. Original files and
counterpart PNG hashes remained unchanged. No source dataset was copied into Git;
redistribution rights are not established. Official Unity documentation informs
the no-rotation limit, not a claim of a complete proprietary TPSheet specification;
see [source audit and hashes](../../runtime-render/docs/visual-loading-v0.7.5.md).

Node24.18.0 public-root manual consumer ran on the exact originals: parsed page-0
128x128 with keys0050/0052/0054, page-1 128x256 with keys0000 through0014 step2:
2 pages/11 frames. Descriptor starts with an unused image and repeated roles;
bindings differ from descriptor ordering. In-memory duplicate frame rejected
DUPLICATE_FRAME_KEY line19; unknown header INVALID_HEADER line9; missing binding
INVALID_BINDING; duplicate page DUPLICATE_PAGE_ID. Frozen atlas/pages/frames/first
rectangle/pivot observed; output remained after byte-copy mutation/source release.
Preparation NOT_PERFORMED/reads0; provider reads4 (two originals/two memory variants).
These are human-inspected finite observations, not an assertion suite or universal
parser acceptance. PNGs were only hash/IHDR-audited, not decoded or displayed.

## Build/static gates

Final commands exit0:

| Gate | Observed result |
| --- | --- |
| `npm run build --workspace runtime-render` | BUILD_PASS |
| `node harness/cli.mjs check` | ARCH_CHECK_PASS92 JS/TS files |
| `node harness/cli.mjs scope --projects runtime-render,editor,game-client --allow-infra` | SCOPE_PASS11 (10 task paths + excluded .mcp.json) |
| `node harness/cli.mjs verify --projects runtime-render,editor,game-client --with-consumers` | Independent Render/Editor/Client BUILD_PASS |
| `npm run build -- --force` | All-five workspace BUILD_PASS |
| Strict optional manual consumer compile | PASS |
| Strict portable ES2022/types[]/skipLibCheck:false public consumer compile | PASS |
| Headless public-root import with throwing browser-global getters | PASS; NOT_PERFORMED metadata |
| Exact-original manual metadata consumer | Exit0, observations above |
| `git diff --cached --check` | PASS |

Initial Node-typed manual compile lacked Node declarations; splitting the optional
Node host into `.mjs` and the portable consumer into `.mts` resolved it without new
dependencies. No final failed/unconfigured build. Existing Windows DEP0190 warning
is non-failing. No tests/assertion suites/runners/browser automation added or run.
Exact checkpoint SHA/push and PR CI results are recorded in PR#7's ledger after
push; no speculative CI success or self-referential commit SHA in this report.

No architecture blocker observed. Unsupported TPSheet versions/profiles, real
trim/rotation geometry, coordinate-origin conversion, PNG dimension agreement,
large datasets, GPU/display behavior and full feature verification remain open.
No visual/performance/leak-free or overall Phase7 acceptance claim. Developer owns
functional/visual acceptance. No merge/release/publish or v0.7.6 implementation.
