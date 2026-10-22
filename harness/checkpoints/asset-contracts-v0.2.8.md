# v0.2.8 — Editor–Render Asset Consumption (AR14)

Status: **READY_FOR_DEVELOPER_REVIEW**, subject to the verification below.
Continue Phase 2 branch/Draft PR #2. Developer authorized implementation/verification
without intermediate review gates; this supersedes the attachment's prior-version
approval prerequisite, without accepting those checkpoints. Stop before v0.2.9;
no phase closure, merge, tag, release or publish.

## Preflight and capability audit

Clean baseline f0b9225b86b1b41f7a9ada295c9a0a295f8523e5 on
feat/editor-render-asset-contracts-v0.2; Developer-merged Phase 1 baseline
4cec85b5a00e2477f00eee29e2da6025a532e973. Read mandatory root/project guidance,
architecture, ownership, contracts, verification/workflow, manifests, actual asset
factories/resolver and Render session/backend/public surfaces. Editor had 41 root
symbols, Render 14. Existing resolver produces an immutable authored definition.
Render's graphics session lazily acquires Three, then submits an empty blue frame;
it has no asset input, image loader or resource presentation operation.

Canonical primary owner: **Editor**, for resolved authoring-to-presentation mapping.
Required collaborator: **Runtime Render**, for its neutral input and validation.
This task explicitly authorizes that additive public boundary. No ownership or
package dependency change; no L1/L2 API touched. Client is a discovered build
consumer only. Declared scope: two new source modules, two root exports, one manual
consumer, manual README, both project AGENTS, CONTRACTS and this checkpoint (10
files). Infra allowance is for existing Harness documentation. No blocker to the
minimal metadata contract; graphics consumption remains a deliberate capability gap.

## Public API delta and semantics

| Owner | New root symbols | Purpose |
| --- | --- | --- |
| Editor | describeResolvedVisualAsset, AssetVisualDescription | factory-resolved authored image -> described descriptor or unsupported reason |
| Render | prepareVisualResource, VisualResourceDescriptor, VisualResourcePreparation | validate/detach neutral metadata -> metadata-prepared |

Editor 41 -> 43 symbols; Render 14 -> 17. No existing signature/lifecycle changes.
Editor maps exactly kind image with at least one image role; other open kinds are
not guessed. Unresolved reference, nonvisual kind and missing image source have
distinct unsupported reasons. Resolver retains the detailed unresolved reason.
Adapter expects factory-produced resolver data, copies/freezes all projected data,
and never recomputes catalog lookup. projectId/assetId become projectId/resourceId;
sourceId is external provenance, not Render identity. Ordered roles/locators are
retained, including repeated roles for pages. The nullable mediaType hint is an
explicit caller argument (default null), not inferred from suffixes, arbitrary
metadata or bytes. Arbitrary authored metadata, dependencies, schemaVersion and
Editor state stay outside Render.

Render requires exact plain data fields, dense ordinary arrays, nonempty
whitespace-free identity/role strings, null or image/<subtype> media hint without
parameters, project-relative source descriptions and at least one image role.
Duplicate role/location pairs reject; order and repeated roles at distinct paths
survive. Locations reject empty/dot/traversal segments, backslashes, colon, percent,
control characters and segment-edge whitespace; these are metadata checks, not
filesystem authorization, existence or symlink containment. Future loaders must
apply their own environment-specific security/IO policy. Unknown structural fields,
custom prototypes/accessors/symbol keys and sparse source arrays reject rather than
silently dropping data. Invalid input throws TypeError; unknown host/Proxy exceptions
propagate. Returned descriptor and all nested data are detached and frozen.

The operation genuinely reads/validates the supported metadata fields; status is
only metadata-prepared, resourceLoading always NOT_PERFORMED. It acquires nothing,
does not submit a frame and has no session handle. No dummy renderAsset success,
loader registration, singleton, catalog, cache, scene, texture, TPSheet decoder,
UV/frame/direction or gameplay role. Phase 1 source and ownership are untouched.
Authored text/metadata stay usable without this path. A future Client can supply
the structural descriptor from transported data and import only Render; Render's
declarations contain no Editor/Engine/L1/L2 dependency. No Client integration added.

## Verification and finite observations

```sh
node harness/cli.mjs check
node harness/cli.mjs scope --projects editor,runtime-render --allow-infra
node harness/cli.mjs verify --projects editor,runtime-render --with-consumers
node node_modules/typescript/bin/tsc --ignoreConfig --noEmit --strict --exactOptionalPropertyTypes --module NodeNext --target ES2022 --lib ES2022,DOM editor/manual/asset-consumption.mts editor/manual/asset-relocation.mts editor/manual/asset-diagnostics.mts editor/manual/asset-catalog.mts editor/manual/asset-reference.mts editor/manual/asset-sources.mts editor/manual/asset-definition.mts editor/manual/asset-identity.mts
node editor/manual/asset-consumption.mts
```

Observed ARCH_CHECK_PASS: 29 JS/TS sources, including the manual consumer. Render,
Editor and discovered Client independently BUILD_PASS. All eight asset manual
consumers strict-compile with exit 0. Real emitted root/module declarations inspected:
five new symbols, neutral Render data types, Editor type import uses Render root,
private validation helpers absent from public root. Scope and whitespace checks
pass for ten declared paths. Existing Harness Windows DEP0190 warning unchanged.

Manual exit 0: sample-project/visual-idle and ordered assets/0012.png plus
assets/0012.tpsheet arrive at Render with image/png. Result metadata-prepared and
NOT_PERFORMED; JSON round-trip equivalence, detached result and nested freeze print
true. Nonimage media hint and missing image role reject with TypeError. Text,
missing target and source-less image print their distinct unsupported reasons.
Original authored vendor metadata remains present. These are finite observations,
not exhaustive behavioral PASS. No assertions, tests, helpers, runner or runtime CI
job created/run. Exact-head push/PR CI evidence is recorded in continuing Draft PR #2;
existing CI independently builds all five projects and forced workspace orchestration.

File existence/contents, media hint truth, physical portability/security, source
replacement compatibility, GPU/image loading, display and visual correctness remain
NOT_VERIFIED. No Engine/Client/Server source, L1/L2 pins, manifests, lockfile,
compiler/checker/CI or five-project topology changed. Stop at this checkpoint.
