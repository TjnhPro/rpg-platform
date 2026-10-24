# v0.11.1 VE02 — Effect Definition & Visual Asset References

**IMPLEMENTED: pure definition capture and metadata binding.**
Live VFX: FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED. No effect instance exists.
Developer phase acceptance remains pending; builds do not establish pixel output.

## Baseline and scope

Date: 2026-10-24 Asia/Bangkok. Branch `feat/visual-effect-playback-v0.11`.
Phase base main `aceea67f95cb309bdd06f1d6193767bfa06f42ce`; previous VE01 HEAD
`fde851791a681e8a1eadd3748bb20f5c1f641293`. One checkpoint commit; its exact SHA
and exact-head push/PR CI links are recorded in the existing Phase11 PR11 ledger
after commit. No self-referential committed hash, merge, release or tag.

Requested behavior: portable immutable definitions with explicit existing
clip/resource references and truthful binding diagnostics. Primary owner:
**runtime-render**, new definition module and additive public-root re-exports.
Harness records checkpoint/task/ownership/contracts; Render docs explain the API.
Editor/Client are read-only contract audits and build consumers; their code is
unchanged. Engine/Server and read-only external L1/L2 are untouched, no calls.
No package/schema/pin/dependency/CI changes or additional production project.
Preexisting untracked `.mcp.json` and ignored `.artifacts` are excluded.

Delta preflight used root architecture/foundation and Harness owner/contract/
workflow/verification/failure guidance plus Render AGENTS, VE01 source/emitted
inventory and actual Phase2/7/10 public APIs. The supplied task explicitly
authorizes this additive pure definition contract; no boundary move is needed.
Editor AssetReference is authored validation, not readiness, and its resolver
does not resolve subresourceId. No genuine authored clip/pin adapter consumer
exists here, so no Editor production change. Phase7 texture views contain live
textures and cannot be embedded in a portable definition.

## Delivered contract and compatibility

[API contract](../../runtime-render/docs/visual-effect-v0.11.1.md) defines the
capture, source pin, exact identity, JSON recapture, geometry binding and failure
policies. Reuses prepareVisualResource, createSpriteTimedClip,
getAtlasMetadataRevision, resolveAtlasFrame and resolveAtlasFrameGeometry.
No second catalog, atlas parser, timer, renderer or animation transport.

Render roots271 → 280: three functions and six types, all named in the contract.
Compiler-generated declaration comparison against VE01 found **zero removed or
changed prior root declarations** across all five projects. Editor138 and other
three roots0 remain unchanged. Existing source files other than Render index are
unchanged, so transitive legacy declarations/implementations are preserved too.
Public consumer compiles using emitted package root, strict ES2022 with no DOM,
types[] and skipLibCheck:false. No fixture, test suite, runner or coverage added.

## Actual manual observations

Local public-root Node observation used read-only original source:
`../jx1-manager-editor/data/asset-sources/monster/ani063/Attack1_0.tpsheet`, 888 bytes,
SHA256 `fe5c87c2e5cba46b43482080f15f5ed607450bb7e15cc72dff3f515c8969efc7`.
Host loaded metadata once through Phase7 and released that source after parsing.
No generated asset and no PNG read/decode; explicit host-attested page128x256.
Input/output log is local ignored `.artifacts/ve02/observations.json`.

| Input / expectation | Observed |
| --- | --- |
| spark-a and spark-b, same resource/clip, keys0012/0000/0012 | Both metadata-resolved in order;0012 geometry x1/y1/w37/h51; metadata reads stayed1 |
| Freeze and mutate original clip/path/pin | Deep freeze observed; captured0012/path/revision unchanged; JSON serialization succeeded |
| JSON copy then explicit recapture | Copy rejected FOREIGN_DEFINITION; recaptured definition resolved |
| Missing clip, directional-shaped clip, Infinity fps | INVALID_CLIP, no fake resolution or eight-way padding |
| Clip/resource scope differs during capture | RESOURCE_SCOPE_MISMATCH |
| Same names with other exact project scope | RESOURCE_MISMATCH on original atlas |
| Key12 rather than0012 | FRAME_NOT_FOUND at frame0, no first-frame fallback |
| Null/copied/stale-symbol atlas | ATLAS_NOT_AVAILABLE / ATLAS_NOT_SUPPORTED / ATLAS_REVISION_MISMATCH |
| Metadata revision changed / locator changed | SOURCE_REVISION_MISMATCH / SOURCE_BINDING_MISMATCH |
| Foreign image ID / NaN page width | PAGE_BINDING_MISMATCH / INVALID_PAGE_PIXELS |
| Unknown texture field | INVALID_STRUCTURE |

Observed metadata resourceLoading is NOT_PERFORMED. Source inspection plus the
manual host's invoked public operations establish no definition IO, graphics
session, image decode, texture allocation or timeline tick. These are not native
allocation profiler measurements. Image revision remains unverified expectation;
host page dimensions are not decode evidence. No authored Document/catalog write.

## Gates and limitations

| Command / audit | Actual result |
| --- | --- |
| `node harness/cli.mjs check` | Exit0 ARCH_CHECK_PASS,175 JS/TS sources |
| `node harness/cli.mjs scope --projects runtime-render --allow-infra` | Exit0; declared Render and Harness scope |
| `node harness/cli.mjs verify --projects runtime-render --with-consumers` | Exit0 BUILD_PASS Render, Editor, Game Client |
| `node .artifacts/ve02/public-audit.mjs` | Exit0; old declarations unchanged, nine additive roots |
| `npx tsc -p .artifacts/ve02/tsconfig.json` | Exit0 emitted public-root consumer |
| `node .artifacts/ve02/observe.mjs` | Exit0 real-source observations above |
| `git diff --cached --check` | Exit0 |

No failed/unconfigured local builds. Engine/Server local builds were not rerun
for this pure Render change; exact-head CI covers the five projects separately.
Existing Harness Node DEP0190 warning is nonfatal. No historic exhaustive tests,
browser automation, unit/integration/E2E/snapshot/visual tests were run or created.

Not observed: VFX pixels, transport/lifetime transitions, attachment movement,
live resource lease admission, native GPU reclamation or manual product acceptance.
U1 remains BLOCKED_DEPENDENCY for neutral single-track live playback/binding;
Phase10's pure SpriteTimedClip makes VE02 possible but supplies no neutral live
handle. VE02 does not bypass or implement U1. Next supplied checkpoint may be
v0.11.2 lifecycle; no next capability is added ahead of its task or U1 authorization.
