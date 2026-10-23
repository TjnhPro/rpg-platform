# v0.7.10 - VL15/VL16 Cache Invalidation, Limits & Diagnostics

Status: **READY_FOR_NEXT_CHECKPOINT / BUILD_PASS**.
**FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED**.

## Starting state, audit and ownership

Starting HEAD `b5dd08ee285174c93a25d810a8a33798d0c2ecfe`, branch
`feat/visual-resource-loading-v0.7`, existing draft [PR7](https://github.com/TjnhPro/rpg-platform/pull/7).
Main `33c9da5ac79cfce27043927fe5d7e08e3bd6d02c` unchanged.
Previous exact-head push [SUCCESS](https://github.com/TjnhPro/rpg-platform/actions/runs/39921929747)
and PR [SUCCESS](https://github.com/TjnhPro/rpg-platform/actions/runs/39921935566)
verified. Pre-existing untracked .mcp.json left unread/unmodified/excluded.
The supplied [task](../../runtime-render/docs/tasks/visual-loading-v0.7.10.md)
authorizes this scoped public extension without another checkpoint approval gate.
No formal phase acceptance inferred from prior commits/builds.

Root/project guidance, architecture/foundation and Harness contract/ownership/workflow/
verification read with actual source/emitted root contracts. Audited v0.7.9 CPU/GPU
keys and lease cleanup, Phase6 terminal dispatch, provider failure/revision shapes,
PNG admission, Three upload, atlas provenance/parser/geometry/frame resolver,
Editor asset adapter/references/manual entries, Client root/host and manifests.
Existing host-provided source revision and canonical atlas snapshot token already
exist; no metadata schema invention. Three0.186.1/@types0.186.0/native texture backend
unchanged; no external API/library migration needed.

Runtime Render is the sole revision/cache/parser/diagnostic owner. Editor adds
manual-only root consumer; Client is compile consumer. Exactly five projects.
No production Editor/Client, Engine/Server, L1/L2, authored schema, dependencies,
manifests/lockfile, boundary checker or CI changes. No external L1/L2 API needed.

Ten scoped paths: Render src/visual-resource-cache.ts, src/unity-atlas.ts,
src/index.ts; Render docs/visual-loading-v0.7.10.md and docs/tasks/visual-loading-v0.7.10.md;
Editor manual/cache-invalidation.mts/.html/.md and manual/README.md; this report.

## Implementation / public contract delta

Four additive root symbols: invalidateVisualResourceCache,
getVisualResourceCacheFailure, VisualResourceCacheFailure, AtlasMetadataLimits.
Render121 ->125, Editor134/Client0 unchanged (observed emitted declarations).
Old cache handle methods/signatures preserved through weak canonical dispatch.
Optional maxRevisionEntries and revisionEntries preserve structural producers;
canonical count always present. Parser's optional fourth limit argument preserves
three-argument calls. Existing frame/source/decode/atlas classifiers/unions retained.

Explicit guard is fixed-provider + project/resource + sourceIndex, independent of
locator/options. New acquisition must match declared current revision before cache
lookup/IO; old rights remain pinned, including pending loads. Source/decode/parser B
failure never rolls back implicitly or releases unrelated A. Terminal GPU/session
failure still invalidates all rights in that session through the Phase6 policy. Guard retained until disposal, bounded
(default maxCpuEntries, selectable1..4096), no silent eviction. Same-revision update
is idempotent; explicit rollback to exact A may reuse still-live A. No forced reload
or automatic freshness detection behind an unchanged revision. Reorder affected
source slots requires host invalidation or replacement. See [contract](../../runtime-render/docs/visual-loading-v0.7.10.md).

Branded fixed-code cache errors distinguish disposed/superseded/CPU/GPU/revision
capacity, retaining TypeError/RangeError categories. Unknown exceptions remain
unknown. Separate parser/source/decode/frame/texture results and released/invalidated
states retain their owners. Context-loss cause is read from existing viewport.graphics,
not guessed from an invalidated lease. Cleanup uncertainty remains sticky observation,
not a memory receipt. No authored reference is removed on a loading failure.

Atlas byte/sheet/total/page/frame limits can now be lowered within existing ceilings.
Byte check before copy/text decode; page check before traversal; frame check before
normalized append. Existing PNG byte/dimension/pixel bounds and native maximum
texture size remain. Host allocations, native decoder/GPU bytes and detached IO
are not controlled total-memory budgets. Counts do not measure saved bytes.

## Actual finite observations / evidence limits

Manually invoked Node public-root observation (exit0, no assertion suite):

- Explicit A -> B revision metadata update retained one guard, no source IO.
- New logical slot over maxRevisionEntries -> cache/REVISION_LIMIT_EXCEEDED.
- Unknown Error -> undefined classifier; disposed invalidation -> CACHE_DISPOSED.
- Real committed2x2 PNG with dimension/pixel budget1 -> decode/DECODE_LIMIT_EXCEEDED
  before native decoder. Native createImageBitmap is undefined in this Node host.
- Host-reported denied and missing reads -> SOURCE_DENIED and SOURCE_NOT_FOUND;
  releasing source is separately observed released.
- Over-budget page-list admission -> atlas LIMIT_EXCEEDED before sheet inspection.

These observations do not prove live GPU revision rejection/reuse or old A survival.
New optional finite browser consumer compiles and uses two explicitly selected
real files, SHA256 revisions, actual native session and safe fixed-code logging.
It supports valid A -> valid B and valid A -> malformed B inspection without fake
samples/decoder/context, but browser NOT_EXECUTED. No successful A/B decode/upload,
malformed B preserving usable A, cross-session GPU cleanup or visual claim.
Existing original TPSheet support unchanged; no new parser-format or out-of-bounds
runtime observation claimed in this checkpoint. Frame bounds remain existing typed
parser/geometry checks, source-audited only here. No aggregate behavior PASS.

## Commands / final results

| Command | Result |
| --- | --- |
| npm run build --workspace runtime-render | Exit0 BUILD_PASS |
| node harness/cli.mjs check | Exit0 ARCH_CHECK_PASS102 JS/TS sources |
| node harness/cli.mjs scope --projects runtime-render,editor,game-client --allow-infra | Exit0 SCOPE_PASS11: ten scoped paths plus excluded .mcp.json |
| node harness/cli.mjs verify --projects runtime-render,editor,game-client --with-consumers | Exit0 independent Render/Editor/Client BUILD_PASS |
| npm run build -- --force | Exit0 all-five workspace BUILD_PASS |
| Strict NodeNext optional manual compile | Exit0 |
| Strict ES2022/types[]/skipLibCheck:false four-symbol root consumer | Exit0 |
| Guarded no-browser-global root import / emitted root inventory | Exit0; metadata NOT_PERFORMED |
| Finite manual Node observation | Exit0, limits above |
| git diff --cached --check | Exit0 |

Initial manual compile incorrectly read cleanup fields outside viewport.graphics,
then outside its terminal union; corrected to read the canonical nested observation
with unknown preserved when absent. Final compile passed. Existing Windows DEP0190
warning is non-failing. No final failed/unconfigured builds. No testcases, runner,
assertion suite, coverage, browser automation or historic exhaustive suite created/run.
Exact checkpoint commit and push/PR CI links recorded on PR7 after actual completion.

No architecture blocker observed. Native/browser acceptance remains open for
Developer whole-phase review. No merge/release/publish or v0.7.11 work included.
