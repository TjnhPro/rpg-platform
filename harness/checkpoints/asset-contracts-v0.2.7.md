# v0.2.7 — Asset Relocation, Rebinding & Compatibility (AR12 / AR13)

Status: **READY_FOR_DEVELOPER_REVIEW**, subject to the recorded verification.
Continue existing Phase 2 branch/Draft PR #2. Developer authorized implementation
and verification without intermediate gates; this supersedes the attachment's
prior-checkpoint review prerequisite, without retroactively accepting checkpoints.
Stop before v0.2.8; no merge, phase closure, tag, release or publish.

## Preflight / ownership

Clean baseline `47c843e2b846eef58a31b82b1e830007dc2dd880` on
`feat/editor-render-asset-contracts-v0.2`. Phase 1 baseline remains Developer-merged
`4cec85b5a00e2477f00eee29e2da6025a532e973`. Read root/project guidance,
architecture, ownership, contracts, verification/workflow, actual identity/source/
reference/definition/catalog/diagnostic APIs, manifests and compiler configuration.
Editor had 38 root symbols, Render 14. Existing update/resolver/factories supply
candidate validation; portable metadata detachment already exists. No version-aware
snapshot reader or relocation/rebinding operation existed.

Canonical primary owner: **Editor**. Render needs no source/signature change.
Client is an existing discovered build consumer; no consumer source adjustment.
No external L1/L2 APIs, package dependency or ownership changes. Declared scope:
ten paths: transitions/snapshot modules, definition's internal detacher, validation
code union, root exports, manual example/README, Editor AGENTS, Harness CONTRACTS
and this checkpoint. Infra allowance covers only the two Harness notes.

## Public API delta

Three new Editor root functions (38 -> 41), all Editor-owned; Render retains 14:

| API | Contract |
| --- | --- |
| `relocateAssetSource(catalog, assetId, sourceIndex, locator)` | new catalog candidate replacing one existing ordered source locator |
| `rebindAssetReference(catalog, reference, targetAssetId)` | new reference only if explicit new target resolves with retained qualifiers |
| `readAssetDefinitionSnapshot(unknown)` | validate/detach complete current schemaVersion 1 authored snapshot |

AssetDiagnosticCode's underlying validation union also gains
UNSUPPORTED_SCHEMA_VERSION and UNSUPPORTED_FIELD for compatibility failures. No new
record fields or schemaVersion bump; internal detacher/error helpers are not root
exports. Existing construction factories, catalog operations and diagnostics retain
their behavior and shapes. Construction factories accept typed construction input;
they are **not** versioned portable readers. Use the new reader for external snapshots.

Relocation gets an existing asset by exact case-sensitive key, validates a safe
integer source index in range and the locator using the existing factory, then
uses updateAssetDefinition. Source selection is by position because roles may repeat.
Only the selected locator value changes; projectId/assetId/sourceId, kind, metadata,
roles/order, other locators and dependency values remain. Invalid path, missing asset,
invalid index or duplicate resulting role/locator pair rejects without a candidate.
Old catalogs and captured references remain valid immutable observations. Host
chooses whether to commit the candidate. No file move or inferred content revision.

Rebinding validates the old reference structure, explicitly replaces only assetId
and delegates to the existing resolver. Current target may be absent, enabling an
explicit relink; proposed target must exist in this catalog/project and satisfy the
retained expectedKind when supplied. Null expectation means no kind restriction.
ProjectId and opaque subresourceId are retained, never silently reset; nonnull
subresources currently cannot resolve and therefore reject rebinding. Unresolved
target throws TypeError containing the existing reason; malformed keys also throw.
Only a detached frozen reference candidate is returned. No other holder, catalog or
dependency declaration is rewritten, and no implicit cross-project join occurs.

Semantics kept separate: locator move changes authored location; physical replacement
at the same path cannot be detected here and carries no compatibility guarantee.
Metadata label edits can use existing definition updates without identity changes;
no standardized display-name or revision field is imposed. Rebinding changes the
selected logical target and requires explicit caller intent; relocation never does.

## Portable compatibility policy

The reader accepts a **complete current** definition snapshot: required schemaVersion,
identity, kind, metadata, sources and dependencies. Identity includes sourceId;
dependency references include expectedKind/subresourceId (nullable). Sparse earlier
construction inputs or historical in-memory records missing fields are not migrated
or silently defaulted by this reader. This task introduces the first portable read
contract; earlier schemaVersion 1 construction output was not a persistence format.

Order of checks: root record and own exact numeric version 1; existing portable-data
detachment; supported/required structural fields; existing definition validation.
Only plain enumerable string-keyed data objects, dense arrays and supported finite
primitives are accepted as before. No accessors, prototypes with behavior, cycles,
functions, undefined or nonportable values. Unknown host/Proxy exceptions propagate.
Snapshot value validation paths are prefixed with snapshot; shared portable-data
validation retains INVALID_METADATA code and precise path for non-JSON values.

Arbitrary supported JSON metadata extensions are preserved recursively, including
unknown keys. Structural fields at definition/identity/source/locator/dependency
levels are closed: unknown fields reject with UNSUPPORTED_FIELD, rather than being
silently dropped. Missing fields reject INVALID_STRUCTURE. Missing/new/string schema
versions reject UNSUPPORTED_SCHEMA_VERSION; no coercion or downgrade. Caller retains
the original object/bytes on failure; nothing is written. Byte-for-byte JSON ordering,
whitespace, duplicate keys before JSON.parse and arbitrary future schemas are not
preservation claims. Successful current snapshots preserve data values, ordered source
roles, dependencies and metadata extensions across host JSON stringify/parse/read.

No public serializer is needed: current snapshot data already supports host transport.
JSON demonstrates portability only; no permanent project format, catalog document
envelope, migration framework or Document Save Manager is chosen.

## Verification / finite evidence

```sh
node harness/cli.mjs check
node harness/cli.mjs scope --projects editor,runtime-render --allow-infra
node harness/cli.mjs verify --projects editor,runtime-render --with-consumers
node node_modules/typescript/bin/tsc --ignoreConfig --noEmit --strict --exactOptionalPropertyTypes --module NodeNext --target ES2022 --lib ES2022,DOM editor/manual/asset-relocation.mts editor/manual/asset-diagnostics.mts editor/manual/asset-catalog.mts editor/manual/asset-reference.mts editor/manual/asset-sources.mts editor/manual/asset-definition.mts editor/manual/asset-identity.mts
node editor/manual/asset-relocation.mts
```

Observed: architecture ARCH_CHECK_PASS (26 JS/TS source files), independent selected
builds Render/Editor/Client BUILD_PASS, strict compilation of all seven public asset
examples exit 0. Real emitted declarations inspected: three new root functions with
existing readonly input/output types; internal helper absent from root. Whitespace
check passed. Final scope gate: SCOPE_PASS, ten declared Editor/Harness paths.

Manual example exit 0: sample-project/visual-idle/sourceId 0012 retained, PNG locator
assets/0012.png -> assets/monsters/0012.png. Atlas-metadata source and metadata/direct
dependency values printed unchanged. Both old references resolved with NOT_CHECKED
files. Selected candidate alternate-image vs original/other visual-idle; rebound
target resolved. Wrong-kind rebind rejected with KIND_MISMATCH. Removed-asset relink
returned alternate-image while original missing reference retained removed-asset.
Invalid relocation rejected. Current snapshot JSON equality true; roles image,
atlas-metadata and vendor:future nested extension retained. Reader detached/frozen
observations true. Unsupported version and structural field rejected with explicit
messages; original version-2 data retained true. Original catalog/both holders
unchanged true. Finite observations only, no exhaustive behavioral PASS.

No assertions, tests, runners/helpers or runtime CI job created/run. Existing Windows
Harness DEP0190 warning unchanged. Exact-head push/PR CI results belong in continuing
Draft PR #2; CI independently builds all five projects and forces the workspace build.
Physical files/replacement equivalence, GPU/loading, graph validity, durable saves,
scene integration and visual correctness remain NOT_VERIFIED. No source revision
tracking, file IO/copy/move, autosave/transactions/watchers or next-version work.
Exactly five projects; unchanged Engine/Render/Client/Server source, dependencies,
read-only L1/L2 pins, manifests, lockfile, compiler/checker/CI.
