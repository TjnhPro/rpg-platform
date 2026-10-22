# v0.2.4 — Asset Reference & Dependency Contracts (AR07 / AR08)

Status: **READY_FOR_DEVELOPER_REVIEW**, subject to observed verification below.
Continue existing Phase 2 branch and Draft PR #2. Developer's instruction to
implement/verify without intermediate gates, with review at the final step,
supersedes the attachment's earlier checkpoint review prerequisite. Previous
checkpoints are not retroactively accepted. Stop before v0.2.5; no merge, phase
closure, tag, release or publish.

## Preflight / current source

Clean baseline `6e7b205a2f937a34ba4ed5370f7d0c524aa2eacc` (v0.2.3) on
`feat/editor-render-asset-contracts-v0.2`; Phase 1 baseline remains Developer-merged
`4cec85b5a00e2477f00eee29e2da6025a532e973`.
Read required root/project guidance, architecture/ownership/contracts/workflow/
verification, actual identity/definition/source/root APIs and relevant manifests/
compiler configuration. Editor has 19 root symbols, Render 14. No duplicated asset
reference type exists in either project. Render's host/session references concern
borrowed host bindings, not authored assets; they must not be repurposed.

Canonical primary owner: **Editor**, authored reference/dependency declarations.
Render needs no source/signature change or reverse dependency. No L1/L2 API is
needed/imported into asset contracts. No package dependency or ownership change.
Preflight declared new reference factory/types, optional dependencies, local-scope
and duplicate-target policy before edits. Eight paths: Editor src reference/
definition/index, manual reference consumer/README, Editor AGENTS, Harness CONTRACTS
and this report. Infra allowance covers only these two Harness notes.

## Public API delta — Editor owns all additions

| Surface | Contract |
| --- | --- |
| `AssetReferenceInput` | explicit projectId/assetId; optional nullable expectedKind/subresourceId |
| `AssetReference` | readonly primitive snapshot with all four fields; absent qualifiers become null |
| `createAssetReference` | shape validation and detached frozen data, no target lookup |
| `AssetDefinitionInput.dependencies` | optional readonly reference-input list |
| `AssetDefinition.dependencies` | detached frozen reference list, empty by default |

Three new package-root symbols (Editor 19 -> 22); Render retains 14. Internal
detachAssetDependencies is not a root API. Existing export maps block deep imports.
No separate redundant validator/listing framework: read the immutable record/list
directly. Existing factory inputs remain valid; output gains `dependencies: []`.
schemaVersion remains 1 for the additive in-memory field; old JSON bytes change and
hand-constructed AssetDefinition typed values now need dependencies. No tracked
production consumer constructs such values; earlier manual consumers are compiled.
No persisted export format or migration is implemented/claimed.

Reference keys reuse v0.2.1 identity validation: exact nonempty whitespace-free
projectId/assetId, case-sensitive equality with no normalization. No sourceId/path
or target-object pointer is stored. Extra host fields are not retained. Input must
be a nonnull nonarray object. Missing/invalid target keys throw native TypeError.

expectedKind, if supplied, is primitive nonempty whitespace-free resource/data text,
matching the existing open kind policy. It is an expectation only: no target kind
is consulted or cast into a particular resource payload. No game-role schema.
Optional qualifier omitted/undefined/null becomes null. subresourceId is primitive
nonblank opaque text retained verbatim, including internal/surrounding whitespace;
no numeric coercion, case folding or producer grammar is imposed. Blank/wrong-type
qualifiers throw native TypeError. All output fields are primitive and frozen;
caller mutation cannot alter a snapshot. Host getters/Proxy exceptions can propagate
as with existing identity inputs; this is a data API, not a hostile-object sandbox.

The task's explicit optional-subresource addressing requirement justifies the opaque
field; no real atlas/clip fixture or bytes establish a more specific shape. Example
address text is illustrative, not a discovered TPSheet frame ID. No directions,
frame indices, clip schema, VFX graph or subresource discovery is implemented.

## Scope / direct edge policy

References are explicitly qualified by projectId so the same local assetId in
another project is distinct; no implicit current project, singleton or target
pointer. A caller-local holder is not an asset and does not create an asset-to-asset
edge merely by carrying a reference. No Scene/Object/Entity/holder production type
is added. Future resolver is expected to use a caller-supplied project catalog
snapshot; no catalog or placeholder resolver API is introduced now.

A definition declares only its direct asset-to-asset edges. Dependencies must be
an array; each entry is recreated through the reference factory, must match the
owner definition's projectId, and is copied in caller order. One edge per target
asset; duplicate target assetId within the same project is rejected even when
expectedKind/subresourceId differs. Do not silently collapse conflicting qualifiers.
This list is not a list of every holder/subresource use: multiple holders may freely
target the same asset outside this single direct-edge declaration list. Multiple
subresource uses do not require repeated asset-to-asset edges.

No dependencies means an empty frozen list, not inferred requirements. Missing
assetId is invalid structure; a valid assetId with no imported definition is a
permitted forward declaration. Missing target *existence*, kind mismatch and actual
subresource existence are future resolver outcomes (v0.2.6), not creation errors.
No referential integrity claim is made. Self/cyclic declarations are not evaluated;
no graph traversal, transitive closure, cycle engine, scheduler or topological sort.

Future stress review: two independently captured holder references survive explicit
locator relocation since they store project/asset keys only. Atlas/VFX producer
addresses can later supply opaque keys without assigning frame/direction semantics
here. Sources remain file-location relationships; dependencies target logical assets.
Neither implies eager resource loading, gameplay ownership or a Render import of Editor.

## Verification / limits

Separate public-root manual consumer `editor/manual/asset-reference.mts` prints
two independent holder snapshots, source relocation, opaque forward reference,
direct dependency detachment/freezing and native rejections. It has no assertions,
runner/test helpers or automatic runtime CI job; no Scene API, catalog, IO or GPU.

```sh
node harness/cli.mjs check
node harness/cli.mjs scope --projects editor,runtime-render --allow-infra
node harness/cli.mjs verify --projects editor,runtime-render --with-consumers
node node_modules/typescript/bin/tsc --ignoreConfig --noEmit --strict --exactOptionalPropertyTypes --module NodeNext --target ES2022 --lib ES2022,DOM editor/manual/asset-reference.mts editor/manual/asset-sources.mts editor/manual/asset-definition.mts editor/manual/asset-identity.mts
node editor/manual/asset-reference.mts
```

Inspect emitted declarations and diff whitespace/scope. Existing CI independently
builds all five projects and forces the workspace build; exact SHA and push/PR CI
evidence are recorded in continuing Draft PR #2. No test suite is added/run.

Observed locally on Node 24.18.0 / npm 12.2.0:

| Gate / evidence | Result |
| --- | --- |
| Harness static architecture | ARCH_CHECK_PASS; 18 JS/TS source files |
| Scope | SCOPE_PASS; eight Editor/Harness paths as declared |
| Render independent build | BUILD_PASS |
| Editor independent build | BUILD_PASS |
| Discovered Client consumer independent build | BUILD_PASS; no source changes |
| Public-consumer strict NodeNext compilation | Exit 0 for new reference consumer and all three prior asset examples |
| Emitted declarations | Three added root exports, primitive readonly snapshot, optional input/readonly output dependencies; internal helper absent from root |
| Manual public Node consumer | Exit 0; finite observations below, not a test-suite PASS |
| Whitespace | git diff --check passed |

Two holder snapshots printed the same sample-project / visual-idle target, one
expectedKind image and the other null; both subresourceIds were null. Frozen,
distinct snapshot and same logical target observations printed true. Changing
hostTarget.assetId did not alter captured references. Explicit relocated source
retained reference target equality true. A forward reference to not-imported
printed vendor:visual-data expectation and opaque producer supplied address; no
catalog or target definition existed/was queried in the example. Direct list
printed both references in declaration order; list/entry freeze observations true,
captured edge count 2 vs mutated host list count 1. Missing assetId, repeated target
with a different expectation, and cross-project dependency each printed TypeError
recognition true with relevant messages. No exhaustive validator coverage claim.

No failed/unconfigured build remains. Existing Windows Harness DEP0190 warning is
unchanged. Unchanged Engine/Server independent builds and the full workspace build
are delegated to existing CI, not repeated locally for this selected scope.

Build PASS only proves compile;
target existence/kind/subresource resolution, graph validity, real file existence,
export round-trip, scene integration and graphics/visual correctness remain
**NOT_VERIFIED**. No catalog v0.2.5, resolver v0.2.6 or other next-version work.
Exactly five projects, unchanged Engine/Render/Client/Server source/dependencies,
read-only unchanged L1/L2 pins; no compiler/checker/manifest/lockfile/CI edits.
