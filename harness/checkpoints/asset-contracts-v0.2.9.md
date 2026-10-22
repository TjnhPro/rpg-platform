# v0.2.9 — Minimal Working Asset Reference MVP (AR15)

Status: **READY_FOR_DEVELOPER_REVIEW**, subject to the verification below.
Continue existing Phase 2 branch/Draft PR #2. Developer authorized implementation
and verification without intermediate review gates; this supersedes the attachment's
prior-checkpoint approval prerequisite without accepting those checkpoints. Stop
before v0.2.10; no phase closure, merge, tag, release or publish.

## Preflight / ownership / API audit

Clean baseline `4a693beff5242bbb4c2b54c5c607bdeefc0fdd37` on
`feat/editor-render-asset-contracts-v0.2`; Phase 1 remains Developer-merged baseline
`4cec85b5a00e2477f00eee29e2da6025a532e973`. Read mandatory root/project guidance,
architecture, ownership, contracts, verification/workflow, actual asset modules,
Render public surfaces, manifests, build config and earlier manual examples.

Canonical primary owner: **Editor**, for this manual authored-data flow. Render is
the existing neutral metadata consumer, with no source change. Public surfaces are
already sufficient: identity/definition/source/reference factories, catalog register/
lookup/update/remove/resolution, diagnostics, relocation/rebinding/snapshot reading,
Editor projection and Render preparation. No facade, schema or public API delta:
Editor retains 43 root symbols, Render 17. Root package exports resolve actual
dist/index.js and emitted declarations. No L1/L2 API or dependency change; no
consumer source adjustment. Exactly five projects remain.

Declared scope: five paths only: editor/manual/asset-reference-mvp.mts, its existing
README, editor/AGENTS.md, harness/CONTRACTS.md and this checkpoint. Infra allowance
covers the existing Harness documentation. All production src files remain unchanged.
Git tracked-file inventory contains no PNG/TPSheet bytes; example locations are
illustrative. No capability blocker for this metadata MVP; image loading/display
remain outside Phase 2.

## Working proof — observed public consumer report

Optional manual entrypoint imports only `@rpg-platform/editor` and
`@rpg-platform/runtime-render`. It has no assertions, test helpers, runner, framework,
automatic runtime job or product UI. Node exit 0 is a finite observation, not a
comprehensive behavioral PASS.

| Step / real input | Observed output |
| --- | --- |
| register into empty sample-project catalog | emptyCount 0 retained; one schemaVersion 1 image definition with caller ID monster-0012, sourceId string "0012", assets/0012.png image and assets/0012.tpsheet atlas-metadata |
| holder-a and holder-b, each with its own image reference | independentReferences true; statuses resolved/resolved; sameDefinition true |
| relocate source index 0 to assets/relocated/0012.png | projectId/assetId/sourceId retained; TPSheet path unchanged; both references still monster-0012 and resolved/resolved; sameDefinition true; prior PNG still assets/0012.png |
| reference unknown-asset expecting image | unresolved TARGET_NOT_FOUND, path reference.assetId, supplied-project lookup scope, original target retained, fileExistence NOT_CHECKED |
| monster-0012 expecting text | unresolved KIND_MISMATCH, path reference.expectedKind, details expectedKind text / actualKind image, reference retained, fileExistence NOT_CHECKED |
| explicitly register alternate-visual, sourceId "0013", assets/0013.png; rebind holder-a candidate | candidate holder-a targets alternate-visual; original holder-a and holder-b still monster-0012; both selected candidate and holder-b resolve |
| describe resolved relocated original with explicit image/png hint | described; identity sample-project/monster-0012; relocated PNG and unchanged atlas-metadata source retained |
| Render prepareVisualResource via public root | metadata-prepared, resourceLoading NOT_PERFORMED, exact projected identity/roles/locations printed |
| retain source observations | originalCatalogAndHoldersUnchanged true; erroneous unknown/wrong-kind references printed; moved catalog IDs remain only monster-0012 |

Final literal output: `ASSET_CONTENT_NOT_LOADED; fileExistence: NOT_CHECKED; VISUAL_NOT_VERIFIED`.
The alternate target is separately authored example data, not an inferred repair.
Rebinding proposes a new holder value; caller chooses adoption. Moving the PNG is
an authored locator transition, not a filesystem operation. Asset name monster-0012
is opaque sample text; kind remains image and no HP/AI/drop semantics are defined.

## Future contract stress review — design only

| Case | Current fit and remaining risk |
| --- | --- |
| Text RPG without renderer | Catalog/reference/diagnostics operate independently; do not call visual adapter. Existing adapter returns unsupported for text. No viewport or GPU requirement. |
| 2D image source | Demonstrated neutral image + atlas-metadata descriptions. Physical content, decoding, sizing and rendering unsupported/unverified. |
| 2.5D atlas pages | Ordered repeated image roles at distinct locations are representable today. Page selection and atlas interpretation require a later consumer contract; preparation proves neither. |
| Future 8/16/32 directions | Open authored metadata can retain portable extension data, but no direction grammar or semantics exist. Render's closed descriptor carries none of it; a future supported projection needs explicit additive/versioned design and consumer review. |
| Later VFX Fly/Explode | No VFX resource/player or gameplay behavior inferred. Open authored classification does not imply Render support; current adapter maps only image. Future contracts require their own ownership/capability decision. |

No reviewed case requires adding gameplay fields or Render -> Editor imports.
Current complete snapshot reader rejects unknown structural fields/versions and
preserves supported metadata extensions. Future Render shape changes cannot be
silently passed to the current closed reader; compatibility must be designed when
the real consumer exists. This review claims representability only where stated,
not implemented atlas, direction or VFX functionality.

## Verification

```sh
node node_modules/typescript/bin/tsc -b --clean
node harness/cli.mjs check
node harness/cli.mjs scope --projects editor,runtime-render --allow-infra
node harness/cli.mjs verify --projects editor,runtime-render --with-consumers
node node_modules/typescript/bin/tsc --ignoreConfig --noEmit --strict --exactOptionalPropertyTypes --module NodeNext --target ES2022 --lib ES2022,DOM editor/manual/asset-reference-mvp.mts
node editor/manual/asset-reference-mvp.mts
npm run build -- --force
```

Observed: compiler clean exit 0; Editor/Render dist file listings empty before
rebuild. ARCH_CHECK_PASS inspected 30 JS/TS sources. Independent Render/Editor/Client
builds BUILD_PASS, new public consumer strict compile exit 0, manual run exit 0,
forced whole-workspace build exit 0. Real package root resolution/declarations
inspected with unchanged exports. Scope PASS for five declared paths; whitespace
check passed. Existing Windows Harness DEP0190 warning unchanged. Exact-head push
and PR CI evidence belongs in continuing Draft PR #2; existing CI independently
builds all five projects and forces full workspace orchestration, with no manual
runtime execution added.

No tests, runners, asset generation, loader/decoder/cache, Scene/Map system,
animation/VFX player, importer/pack pipeline, storage or gameplay implementation.
File existence/content compatibility, media hint truth, GPU/display correctness and
durable persistence are NOT_VERIFIED. No L1/L2 pins, package manifests/lockfile,
production source, compiler/checker/CI or package topology changed. Developer owns
acceptance. No v0.2.10 work.
