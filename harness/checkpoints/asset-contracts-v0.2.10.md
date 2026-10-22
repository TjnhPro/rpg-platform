# v0.2.10 — Asset Foundation Integration & MVP Closure review (AR16)

**READY_FOR_DEVELOPER_REVIEW — Phase 2 acceptance pending Developer.**
Review/checks only; no production capability or public API delta. Continue
[Draft PR #2](https://github.com/TjnhPro/rpg-platform/pull/2) on
`feat/editor-render-asset-contracts-v0.2`. No merge, tag, release, publish, next phase
or automatic phase acceptance. Developer's explicit implementation/verification
authorization supersedes intermediate review gates without accepting checkpoints.

## Checked revision, preflight and commit chain

Clean starting HEAD: `d29c8a2aac36e008efd17bf0b9d2abfb8fd78066`.
Fetched origin/main and queried GitHub: PR base and merge-base are exactly
`4cec85b5a00e2477f00eee29e2da6025a532e973`, the Phase 1 PR #1 merge performed by
TjnhPro. All ten prior Phase 2 commits appear on the same open Draft PR, in order:

| Version | Exact commit |
| --- | --- |
| v0.2.0 | 31ddf24d7d753e80cc4a4783010affa099358726 |
| v0.2.1 | d57ac96b0aa95e8ed2960cc29e357f67c9bb5301 |
| v0.2.2 | e63981dd002b5d1acb4b211425a57a7040cd4830 |
| v0.2.3 | 6e7b205a2f937a34ba4ed5370f7d0c524aa2eacc |
| v0.2.4 | c99d9f569bcd26db53e8aeae4a332b32a9f59d95 |
| v0.2.5 | 8afe9f436d4400ccb18cebf74fcd4c5534bc3798 |
| v0.2.6 | 47c843e2b846eef58a31b82b1e830007dc2dd880 |
| v0.2.7 | f0b9225b86b1b41f7a9ada295c9a0a295f8523e5 |
| v0.2.8 | 4a693beff5242bbb4c2b54c5c607bdeefc0fdd37 |
| v0.2.9 | d29c8a2aac36e008efd17bf0b9d2abfb8fd78066 |
| v0.2.10 | Commit containing this report; exact resulting SHA and its CI evidence recorded in PR #2 |

Read mandatory root/project guidance, architecture, ownership, contracts, build-only
policy/workflow, all Phase 2 checkpoint topics, current asset modules, public roots,
manifests, consumer entrypoints, emitted declarations and v0.2.9 manual flow.
Canonical primary owner: **Editor**, authored data integration review. Render is
reviewed as the neutral presentation consumer; Harness carries the report/gates.
No L1/L2 API needed, ownership transfer, dependency change or consumer source edit.

Six documentation paths: this checkpoint, CONTRACTS, OWNERSHIP, both project AGENTS
and root README. Infra allowance covers Harness/root documentation. Root README's
initialization-only/no-renderer/no-public-API statements and OWNERSHIP's absent
catalog statement were stale; corrected to actual current capability. Historical
version reports remain historical, including earlier review gates and schema output
shapes. This inventory governs the current revision. No production correction was
required by this audit; no breaking redesign is authorized.

## AR01–AR16 acceptance matrix

IMPLEMENTED describes existing code or delivered review artifact, not an exhaustive
functional PASS. DESIGN_ONLY is reasoning without a product implementation;
DEFERRED means unsupported capability; NOT_VERIFIED identifies missing evidence.
AR grouping follows the supplied version/checkpoint assignments, not inferred new IDs.

| ID / topic | Current status and source evidence | Limits / evidence boundary |
| --- | --- | --- |
| AR01 logical identity | IMPLEMENTED: createAssetIdentity, explicit projectId + assetId | Caller chooses/stabilizes exact case-sensitive keys; no generator/path inference |
| AR02 external source identity | IMPLEMENTED: nullable string sourceId retained verbatim | Leading zeroes retained; provider namespace/association system DEFERRED |
| AR03 classification | IMPLEMENTED: open resource/data kind on AssetDefinition | No gameplay role schema or global kind registry |
| AR04 metadata | IMPLEMENTED: deeply detached/frozen portable metadata and schemaVersion 1 | Opaque extension semantics DESIGN_ONLY; no bytes/encoding validation |
| AR05 locator | IMPLEMENTED: project-relative literal locator validation | Remote/archive/other external location schemes DEFERRED; containment/existence NOT_VERIFIED |
| AR06 composite sources | IMPLEMENTED: ordered role/locator list, repeated roles, unique pairs | PNG+TPSheet manual descriptions; atlas parsing/content NOT_VERIFIED |
| AR07 references | IMPLEMENTED: explicit keys, expectedKind and nullable opaque subresourceId | Nonnull subresource resolution DEFERRED, returns SUBRESOURCE_NOT_SUPPORTED |
| AR08 dependency declarations | IMPLEMENTED: ordered unique project-local direct reference edges | Target existence, cycles/transitive graph analysis DEFERRED |
| AR09 catalog | IMPLEMENTED: immutable create/get/register/update/remove candidates | Linear lookup/copy validation; no global state, persistence or scanner |
| AR10 resolution | IMPLEMENTED: pure project/target/kind/subresource result | Exact frozen target within supplied factory snapshot; no IO or resource guarantee |
| AR11 diagnostics | IMPLEMENTED: typed codes/target/path/details, deterministic first failure | Always fileExistence NOT_CHECKED; unknown host exceptions propagate |
| AR12 relocation/rebinding | IMPLEMENTED: one locator candidate or one explicit reference target candidate | Demonstrated old holders retained; physical move/replacement equivalence NOT_VERIFIED |
| AR13 compatibility | IMPLEMENTED: complete current snapshot reader, unknown metadata retained, unknown structure/version rejects | Migration/project format/export pipeline DEFERRED; original bytes remain host responsibility |
| AR14 Render consumption | IMPLEMENTED: Editor description -> Render prepareVisualResource | metadata-prepared / NOT_PERFORMED; loading/display NOT_VERIFIED |
| AR15 minimal working flow | IMPLEMENTED: optional public-root asset-reference-mvp.mts, rerun manually | Finite output evidence only; ASSET_CONTENT_NOT_LOADED / VISUAL_NOT_VERIFIED |
| AR16 integration/closure review | IMPLEMENTED: this matrix, symbol/consumer/commit audit and gates | Phase acceptance DEFERRED to Developer; future phases DESIGN_ONLY |

## Public API delta and canonical owner of every Phase 2 symbol

Editor gained **35** root symbols (8 -> 43); Render gained **3** (14 -> 17).
Every symbol in the following Editor rows is Editor-owned; the final row is
Render-owned. Counts include types, which are absent from runtime JavaScript.

| Owner / introduced version | Symbols |
| --- | --- |
| Editor v0.2.1 | AssetIdentityInput, AssetIdentity, createAssetIdentity |
| Editor v0.2.2 | AssetMetadataValue, AssetMetadata, AssetDefinitionInput, AssetDefinition, createAssetDefinition |
| Editor v0.2.3 | ResourceLocator, AssetSourceReference, createResourceLocator |
| Editor v0.2.4 | AssetReferenceInput, AssetReference, createAssetReference |
| Editor v0.2.5 | AssetCatalogInput, AssetCatalog, createAssetCatalog, getAssetDefinition, registerAssetDefinition, updateAssetDefinition, removeAssetDefinition, AssetReferenceResolution, resolveAssetReference |
| Editor v0.2.6 | AssetDiagnosticCode, AssetDiagnosticTarget, AssetDiagnostic, AssetReferenceDiagnosticResult, AssetDefinitionDiagnosticResult, diagnoseAssetReference, diagnoseAssetDefinition |
| Editor v0.2.7 | relocateAssetSource, rebindAssetReference, readAssetDefinitionSnapshot |
| Editor v0.2.8 | AssetVisualDescription, describeResolvedVisualAsset |
| Render v0.2.8 | VisualResourceDescriptor, VisualResourcePreparation, prepareVisualResource |

Other public deltas: v0.2.3 added optional input sources/frozen output sources;
v0.2.4 similarly added dependencies. Earlier construction output JSON changed while
schemaVersion remained 1; hand-built typed records need the new fields. No permanent
persistence contract existed then. The v0.2.7 reader requires the complete current
shape, including sourceId and nullable reference qualifiers; it is not a migration
of sparse older input. AssetDiagnosticCode gained unsupported-version/field codes
in v0.2.7. Unknown metadata extensions survive; unknown structural fields reject.
No type rename, blanket compatibility claim or silent downgrade.

Unchanged Phase 1 Editor symbols (Editor-owned): createEditorPreviewSession,
initializeEditorPreviewSession, disposeEditorPreviewSession, getEditorPreviewFailure,
createEditorPreviewHost, openEditorPreviewHost, EditorPreviewHost,
EditorPreviewHostSnapshot. Unchanged Phase 1 Render symbols (Render-owned):
RenderHostBinding, RenderSessionDescriptor, createRenderSession,
RenderSessionSnapshot, RenderSessionDisposal, RenderSessionLifecycle,
createRenderSessionLifecycle, RenderFailure, getRenderFailure, RenderFrameSession,
RenderFrameReceipt, RenderFrameFailure, createRenderFrameSession, getRenderFrameFailure.
Private validators/detachers are not package-root APIs. Source and emitted root
symbol inventories match (43/17); actual package roots resolve dist/index.js.

## Invariants, consumers and frozen foundations

Construction APIs accept typed construction input and may project extra host fields;
complete snapshot reading and Render preparation are closed portable boundaries.
Catalog/resolver/adapter arguments are factory-produced snapshots, not unvalidated
JSON casts. Returned records are detached/frozen; old catalog observations remain
valid. No caller state is implicitly committed. Lookup priority is project, missing
target, kind, unsupported subresource; diagnostics preserve that policy. No missing
reference deletion, auto-created target, fallback image or second Render catalog.

Only project roots are exported. Editor imports Engine/Render roots; Client imports
Engine/Render roots; Server imports Engine only. Render imports no Editor, Engine,
L1/L2 or other workspace project. Its Three.js dependency (0.186.1, types 0.186.0)
is private backend implementation. Neutral preparation does not acquire graphics;
the separate Phase 1 frame path remains unchanged. Editor asset modules import no
L1/L2. Exactly five projects, unchanged manifest/lockfile/checker/CI/permissions.

Full branch diff from the accepted Phase 1 base has no Engine/Client/Server source,
foundation pin, package manifest/lockfile, compiler or workflow changes. v0.2.10 adds
documentation only. Installed Core 2.0.0 and Gameplay 0.15.2 match pins. SHA-512 of
both cached artifacts matches foundation-pins.json; commits remain read-only:
Core `04b7239f998c3c688a0dfa3202f11811a9acd775`, Gameplay
`acea332aa80f67552192a72b30f81c0bbbfc56bd`. No upstream source edited or upstream
test suite run.
Marker audit of Editor/Render source/manual and Harness found no TODO/FIXME/HACK/XXX
before this report. Absence of markers is not completeness evidence: deferred
capabilities are explicitly recorded here and in code result variants.

## Manual proof and gates

Reran the existing v0.2.9 consumer against real built package roots, exit 0:
register sample-project/monster-0012/sourceId "0012", PNG + TPSheet; two independent
references resolve to the same definition. PNG locator changes to
assets/relocated/0012.png while both references, sourceId and TPSheet remain. Typed
TARGET_NOT_FOUND and KIND_MISMATCH retain erroneous reference inputs; files stay
NOT_CHECKED. Explicit holder-a candidate targets alternate-visual while old holders
retain monster-0012. Render receives relocated sources and stable resource identity,
returns metadata-prepared / NOT_PERFORMED. OriginalCatalogAndHoldersUnchanged true.
Final output ASSET_CONTENT_NOT_LOADED / VISUAL_NOT_VERIFIED. No tracked asset bytes,
file IO or generated game assets. This finite evidence supports the metadata flow;
it is not exhaustive behavioral, visual or security verification.

Executed locally: harness check (ARCH_CHECK_PASS, 30 JS/TS sources), scope with
editor,runtime-render plus infra (six documentation paths), verify with those
projects and --with-consumers (independent Render/Editor/Client BUILD_PASS), forced
whole-workspace build (exit 0). All nine asset manual consumers strict-compile under
NodeNext/ES2022/exactOptionalPropertyTypes; only the existing MVP example was run
manually in this checkpoint. Emitted declaration inventory and whitespace checks
passed. No failed/unconfigured build remains; existing Windows DEP0190 Harness
warning unchanged. No tests, assertions, runners/helpers, coverage or runtime CI job.

Required commands: node harness/cli.mjs check;
node harness/cli.mjs scope --projects editor,runtime-render --allow-infra;
node harness/cli.mjs verify --projects editor,runtime-render --with-consumers;
npm run build -- --force. Exact v0.2.10 commit SHA and successful push/PR workflow
links are recorded in PR #2 after push, avoiding a self-referential SHA in this
commit. Both workflows must match that HEAD and independently build all five
projects plus workspace orchestration. Older green revisions are not closure evidence.

## Future stress review and proposed prerequisites (design only)

| Use case / future phase | Current fit and decision required before implementation |
| --- | --- |
| Text / 2D / 2.5D | Text needs no graphics acquisition; visual adapter explicitly rejects non-image kinds. Image/atlas ordered source descriptions fit; interpretation, dimensions, UV/frame/page semantics are unsupported. |
| Leading zeroes / same IDs across projects | Source text retained exactly, equality is projectId + assetId. Foreign-project lookup rejects; no implicit join or provider uniqueness guarantee. |
| Relocation / optional subresources | Single source locator changes without reference edits; source replacement is not detected. Nullable opaque selectors are retained but nonnull selectors cannot resolve without a producer contract. |
| Phase 03 Scene & Visual Object Contracts | First obtain Developer acceptance of Phase 2 and a concrete placement/inspection use case. Assign scene/document/visual-instance identities and owner, define minimal Render operations and reference holder fields through public contracts. Do not turn asset IDs into instance IDs or introduce HP/AI/drop. Decide what metadata-only preview can honestly do before loading exists. |
| Phase 05 Document Lifecycle | Assign actual document/export owner and versioned envelope when used. Define candidate adoption, dirty/save/cancel/failure and preservation rules; keep workspace state separate. Current complete record reader is not a save manager or permanent project format. |
| Phase 07 Resource Loading | Render owns host-specific source access, decoders, cache/lifetime/failures and loaded handles. Define capability, security/IO policy and revision/replacement handling. Current lexical locations/media hints prove neither safe file access nor media contents; metadata-prepared must remain distinct from loaded/displayed. |
| Phase 13 Asset Manager UI | Editor uses existing catalog/resolution/diagnostics, adds explicit user authoring/adoption policy. Import/discovery/provider namespaces and presentation are new decisions, not a hidden global catalog. |
| Future directions / VFX | Opaque metadata can retain 8/16/32-direction or Fly/Explode extension data, not execute it. Render's closed descriptor needs an explicitly reviewed supported contract; no speculative fields or gameplay authority added now. |

No blocker to Developer review of this metadata foundation. Physical file existence,
content fidelity, media hint truth, resource loading/sharing, atlas/subresource
interpretation, GPU/image display, durable saves and full product behavior remain
NOT_VERIFIED or DEFERRED as above. Developer alone accepts Phase 2; no future phase
is implemented or implicitly authorized by this review.
