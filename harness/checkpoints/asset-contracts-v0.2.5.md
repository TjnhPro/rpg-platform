# v0.2.5 — Asset Catalog & Reference Resolution (AR09 / AR10)

Status: **READY_FOR_DEVELOPER_REVIEW**. Continue the existing Phase 2 branch and Draft PR #2.
Developer authorized implementation/verification without intermediate review gates;
this supersedes the attachment's previous-checkpoint gate, without retroactively
accepting earlier checkpoints. Stop before v0.2.6; no merge, release or phase closure.

## Preflight / ownership

Clean baseline `c99d9f569bcd26db53e8aeae4a332b32a9f59d95` (v0.2.4), branch
`feat/editor-render-asset-contracts-v0.2`. Phase 1 remains Developer-merged baseline
`4cec85b5a00e2477f00eee29e2da6025a532e973`. Required root/project guidance,
architecture, ownership, contracts, verification/workflow and actual public asset
APIs/manifests were inspected. Editor previously exposed 22 root symbols, Render 14.
Existing definition/reference factories provide validation and detached snapshots;
there is no existing catalog or host filesystem dependency to reuse.

Canonical primary owner: **Editor**, project-local authored catalog/resolution.
Render needs no source or contract change. Client is a discovered build consumer;
Engine/Server need no changes. No external L1/L2 API, dependency or ownership change.
Preflight declared immutable catalog transitions, exact key lookup and pure resolver.
Seven paths: Editor catalog/index, manual catalog/README, Editor AGENTS, Harness
CONTRACTS and this checkpoint. Infra allowance covers only the two Harness notes.

## Public contract delta

Nine new Editor root exports (22 -> 31); Render retains 14:

| API | Contract |
| --- | --- |
| `AssetCatalogInput`, `AssetCatalog`, `createAssetCatalog` | explicit projectId, optional input definitions; validated detached frozen snapshot |
| `catalog.definitions` | public ordered readonly list; no redundant list service |
| `getAssetDefinition` | exact local assetId -> snapshot definition or undefined |
| `registerAssetDefinition` | append in new snapshot, duplicate ID throws TypeError |
| `updateAssetDefinition` | replace existing ID at its original position in new snapshot; missing throws |
| `removeAssetDefinition` | remove existing ID in new snapshot; missing throws; no cascade |
| `AssetReferenceResolution`, `resolveAssetReference` | validated reference -> exact snapshot definition or explicit unresolved result |

Catalog consumers accept factory-created snapshots, not arbitrary unvalidated
objects or deserialized JSON cast to AssetCatalog. Creation validates each definition
through the existing factory, rejects foreign-project definitions/duplicate exact
assetId, and preserves caller order. Empty catalog is valid. Registration appends,
update preserves the replaced slot, removal preserves survivor order. All candidates
detach/revalidate their definitions and freeze nested data. Caller holds old snapshots
and decides when to commit/persist a candidate; no shared mutable cache/singleton.
Lookup is linear; transitions copy/revalidate the catalog. No index/database service.

IDs remain case-sensitive, nonempty whitespace-free strings without normalization,
consistent with v0.2.1. No implicit project, cross-project join, filename lookup or
sourceId lookup. References do not store definition pointers. Two references may
resolve to the same immutable definition within a snapshot; neither shares a mutable
runtime resource. Updating a candidate does not retarget previously captured results.

Resolution recreates/validates the reference, then checks in explicit priority order:
project mismatch (`PROJECT_MISMATCH`), absent target (`TARGET_NOT_FOUND`), supplied
kind mismatch (`KIND_MISMATCH`), nonnull subresource (`SUBRESOURCE_NOT_SUPPORTED`).
Malformed reference data throws TypeError; well-formed unknown targets stay unresolved
and retain authored keys/qualifiers. Successful resolution returns the exact validated
definition in the supplied snapshot, including its authored source descriptors.
No file existence, resource loading, dependency traversal or automatic missing asset.
Opaque subresource addresses cannot be verified with current producer contracts and
therefore never report resolved. This minimal result union is necessary for AR10;
full diagnostics, aggregation and graph analysis remain outside v0.2.5.

Definition dependencies remain forward declarations. Catalog creation does not
enforce their target existence, kinds, cycles or subresources; removal does not repair
references. No source relocation, asset browser, scanner, UI or gameplay schema.

## Verification / evidence

Manual public-root consumer `editor/manual/asset-catalog.mts` prints register/list/
lookup, two resolutions, old/candidate labels, duplicate rejection, unresolved cases
and removal. It contains no assertions, runner or automated runtime CI job.

```sh
node harness/cli.mjs check
node harness/cli.mjs scope --projects editor,runtime-render --allow-infra
node harness/cli.mjs verify --projects editor,runtime-render --with-consumers
node node_modules/typescript/bin/tsc --ignoreConfig --noEmit --strict --exactOptionalPropertyTypes --module NodeNext --target ES2022 --lib ES2022,DOM editor/manual/asset-catalog.mts editor/manual/asset-reference.mts editor/manual/asset-sources.mts editor/manual/asset-definition.mts editor/manual/asset-identity.mts
node editor/manual/asset-catalog.mts
```

Observed locally:

| Gate | Result |
| --- | --- |
| Harness static architecture | ARCH_CHECK_PASS; 20 JS/TS source files |
| Scope | SCOPE_PASS; seven Editor/Harness paths |
| Selected independent builds with consumers | BUILD_PASS: Render, Editor, Client |
| Strict public-consumer compilation | Exit 0 for catalog and all four earlier asset examples |
| Real emitted declarations | Nine root additions; readonly list/snapshots and discriminated resolution union |
| Manual public-root consumer | Exit 0; finite observations below, not a test-suite PASS |
| git diff --check | Passed |

Manual output: empty/registered counts 0/1; lookup visual-idle and frozen catalog,
list, definition, metadata all true. Two references resolved with exact target
identity true. Old/new metadata labels Original/Candidate; captured result retained
Original and holder retained its keys/qualifiers. Duplicate registration printed
TypeError recognition true with original count 1 and label Original. Unknown target
retained not-imported and printed TARGET_NOT_FOUND; other-project, wrong-kind and
opaque subresource examples printed their respective explicit reasons. Removal
printed new/prior counts 0/1 and unresolved. No exhaustive behavioral coverage claim.
Existing Windows Harness DEP0190 warning remains unchanged. Engine/Server independent
builds and full workspace build are delegated to existing CI for this checkpoint.

Continuing Draft PR #2 records checkpoint SHA and exact-head push/PR build evidence.
No tests, runners, helpers or coverage are created/run. Build proves compilation only.
Full diagnostics, graph validity, actual files/resources, persistence/export round-trip,
scene integration and visual correctness remain **NOT_VERIFIED**. Exactly five
projects; unchanged Engine/Render/Client/Server source, package dependencies and
read-only L1/L2 pins. No manifest, lockfile, compiler, checker or CI changes.
