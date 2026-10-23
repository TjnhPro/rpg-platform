# v0.7.6 — VL09 Frame Identity & Resolution

Status: **READY_FOR_NEXT_CHECKPOINT / BUILD_PASS**.
**FRAME_LOOKUP_OBSERVED / TPSHEET_METADATA_OBSERVED** for finite original data.
**FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED / TPSHEET_VISUAL_NOT_VERIFIED**.

## Baseline, authorization and ownership

- Starting HEAD: `5d6b25eed7c72ad9a12411f33ca7e7a41dac5901` (v0.7.5).
- main baseline: `33c9da5ac79cfce27043927fe5d7e08e3bd6d02c`.
- Branch `feat/visual-resource-loading-v0.7`; existing open draft PR#7.
- Previous exact-head push [SUCCESS](https://github.com/TjnhPro/rpg-platform/actions/runs/39907545794)
  and PR [SUCCESS](https://github.com/TjnhPro/rpg-platform/actions/runs/39907549573).
  Prior implementation/CI evidence is not formal Developer acceptance.
- Supplied [task](../../runtime-render/docs/tasks/visual-loading-v0.7.6.md) authorizes
  this additive public contract and finite consumer without another review gate.
- Pre-existing untracked `.mcp.json` remains unread/unmodified/excluded.

Read root/relevant project guidance, architecture/Foundation, Harness ownership,
contracts/workflow/verification and current public/source APIs. Audited unchanged
Phase2 AssetReference/catalog resolver and visual adapter, canonical atlas parser,
source acquisition/revision/scope, frame/session/backend and Client root. Existing
Three0.186.1/@types0.186.0 and manifests/exports remain intact; no graphics work is
required. Actual original TPSheet samples and bounded host from v0.7.5 are available.

Runtime Render is the canonical primary owner of frame interpretation, lookup and
snapshot provenance. Editor is touched only for a finite manual public-root consumer;
Client is an impacted compile consumer. No production Editor, Engine/Server/L1/L2
changes or external APIs required. No dependency/manifests/lockfile, authored schemas,
checker/config/CI change. Exactly five projects. No breaking contract/owner move.

## Scoped files and public delta

Twelve task paths:

- Render `src/atlas-frame.ts`: reference capture, exact lookup, typed diagnostics.
- Render `src/atlas-metadata.ts`, `src/unity-atlas.ts`: weak provenance of canonical
  parsed snapshots from actual acquired metadata source revisions, no v0.7.5 shape change.
- Render `src/index.ts`: six additive root symbols.
- Render `docs/visual-loading-v0.7.6.md`, `docs/tasks/visual-loading-v0.7.6.md`:
  implementable task, contract/compatibility/revision limits.
- Editor `manual/frame-resolution.mts`, `manual/frame-resolution.md`:
  finite public Render/Editor composition and actual observations.
- Editor `manual/atlas-metadata.mts`, `manual/atlas-metadata-node.mjs`:
  optional observer/--frames mode reuses the original bounded host/provider;
  default atlas consumer retains behavior.
- Editor `manual/README.md`: entrypoint link.
- This checkpoint.

Render99 ->105; Editor134/Client0 unchanged from emitted root declarations.
Added `createVisualFrameReference`, `VisualFrameReference`,
`getAtlasMetadataRevision`, `AtlasMetadataRevision`, `resolveAtlasFrame`,
`AtlasFrameResolution`. No prior symbol/member/signature removed or reinterpreted.
Strict portable ES2022/no DOM compile and guarded headless import remain valid.
Metadata preparation remains synchronous NOT_PERFORMED. No GPU/native resource type.

Scope is exact asset-wide project/resource/frame key. Existing verified format
rejects globally duplicate keys, including across pages: no guessed page-prefix,
numeric order or fallback frame. Address remains opaque/case-sensitive/verbatim;
null is explicit SUBRESOURCE_NOT_SPECIFIED. Result includes detached frozen
page/frame/rectangle/pivot/image-source data and exact revision provenance.

Each parse has a fresh token; lookup requires the host's expected-current token.
Old/new mismatch rejects. Source scopes/revisions describe acquired metadata only,
not an unacquired image or GPU revision. Logical reference survives revision change;
resolve against the newly supplied snapshot, never a previous key cache. Host must
replace current slot/token after reload. Deliberate old/old pairing observes history,
not external freshness. No automatic watcher/load/invalidation/cache/registry.
The WeakMap is weak snapshot provenance only and retains no bytes/provider closures.
Copied/serialized atlas data lacks canonical provenance and is unsupported for lookup.

## Build/static evidence

All final commands exit0:

| Gate | Observed result |
| --- | --- |
| `npm run build --workspace runtime-render` | BUILD_PASS |
| `node harness/cli.mjs check` | ARCH_CHECK_PASS94 JS/TS files |
| `node harness/cli.mjs scope --projects runtime-render,editor,game-client --allow-infra` | SCOPE_PASS13 (12 task paths + excluded .mcp.json) |
| `node harness/cli.mjs verify --projects runtime-render,editor,game-client --with-consumers` | Independent Render/Editor/Client BUILD_PASS |
| `npm run build -- --force` | All-five workspace BUILD_PASS |
| Strict optional manual compile, explicit `--rootDir editor/manual` | PASS |
| Strict ES2022/types[]/skipLibCheck:false consumer of all six additions | PASS |
| Root import with throwing browser-global getters | PASS; metadata NOT_PERFORMED |
| Finite original-file consumer `--frames` | Exit0; observations below |
| `git diff --cached --check` | PASS |

Initial optional consumer compile failed TS2209 because importing the Editor root
from its own package requires an explicit rootDir; corrected compile command, no
new typings/dependencies or production workaround. No final failed/unconfigured build.
Existing Windows DEP0190 warning is non-failing. No tests/assertions/runners/browser
automation or historic exhaustive suites added or run. Exact checkpoint SHA and
push/PR CI are added to the PR#7 ledger after push, not invented in this report.

## Finite manual observations and limits

Used exact Wound_7.tpsheet/Attack1_0.tpsheet originals from v0.7.5 with unchanged
SHA256 `2a4f8e481fb7934b84431bf47deaece16d28af31c220646cd799cb0effc8f57d` and
`fe5c87c2e5cba46b43482080f15f5ed607450bb7e15cc72dff3f515c8969efc7`.
Node24.18.0 read-only bounded host, 2 pages/11 frames. No source dataset copied
into Git; redistribution rights unestablished. No original file modified.

- Holders of the same logical asset requested0050 and0000: resolved page-0/image-0
  and page-1/image-1 respectively, with expected source keys. Frozen result nested
  data and detached page/frame pointers observed; authored holders retained.
- Missing and page-prefix/whitespace addresses ->FRAME_NOT_FOUND; null address
  ->SUBRESOURCE_NOT_SPECIFIED; foreign resource ->RESOURCE_MISMATCH; null atlas
  ->ATLAS_NOT_AVAILABLE; structural atlas copy ->ATLAS_NOT_SUPPORTED.
- Explicit valid in-memory variant renamed0050 to0050-revision, SHA256
  `586824125b1cb702b759498ef2bc6b64eeef03b0bbd0640ae3e1f4332fc85095`.
  Tokens differ; both old/new pairings ->ATLAS_REVISION_MISMATCH. New/new old key
  ->FRAME_NOT_FOUND, explicit renamed key resolved. Old/old deliberately observes history.
- Provider reads before/after all frame lookups3/3; final5 includes originals,
  valid memory revision and two malformed memory variants. Lookup never loads
  a source per holder. Metadata preparation still NOT_PERFORMED/reads0.
- Transient in-memory Editor catalog + authored reference composition still
  reports SUBRESOURCE_NOT_SUPPORTED; Phase2 resolver source is unchanged.

See [manual instructions](../../editor/manual/frame-resolution.md) and
[contract](../../runtime-render/docs/visual-loading-v0.7.6.md).
These are human-inspected finite observations, not a universal functional PASS.
AMBIGUOUS_FRAME is defensive/unreachable from the current duplicate-rejecting parser;
future formats with page-local collisions need reviewed qualification semantics.
External revision freshness, image agreement, other data/profiles, UV/trim/rotation
geometry, GPU display/performance and full feature verification remain open.
No SpriteClip/sequence/direction/timer, visual instance, cache/lease or gameplay.
No architecture blocker observed. Developer owns manual/phase acceptance.
No merge/release/publish or v0.7.7 implementation bundled.
