# v0.2.2 — Asset Classification & Metadata (AR03 / AR04)

Status: **READY_FOR_DEVELOPER_REVIEW**, subject to verification recorded below.
Continue the existing Phase 2 branch/PR #2. Developer's explicit instruction to
implement/verify and review at the final step overrides earlier intermediate
checkpoint gates; it does not retroactively accept previous checkpoints.
Stop before v0.2.3. No merge, phase closure, tag, release or publish.

## Preflight / source audit

Baseline: clean `feat/editor-render-asset-contracts-v0.2` at
`d57ac96b0aa95e8ed2960cc29e357f67c9bb5301` (v0.2.1). Phase 1 baseline remains
Developer-merged `4cec85b5a00e2477f00eee29e2da6025a532e973`.
Read root AGENTS/ARCHITECTURE, Harness OWNERSHIP/CONTRACTS/VERIFICATION/WORKFLOW,
Editor/Render AGENTS, actual exports, package manifests and compiler settings.
Editor has 11 root symbols and Render 14 before this delta. Identity creation
already validates exact project-local keys and optional source text; reuse it.
No existing authored definition/metadata serializer or asset file pipeline exists.
Sample PNG names are illustrative metadata, not audited source files.

Primary owner: **Editor** for authored classification/metadata/definitions.
Render is an unchanged collaborator checked through genuine builds. No API crosses
into Render yet; its later presentation descriptors remain v0.2.8 work. No L1/L2
API is needed or imported in the new module. Dependencies/directions unchanged.

Metadata inventory is intentionally semantic guidance, not a universal schema:

| Resource/data | Potential authored data | This version |
| --- | --- | --- |
| Text/script | language, media/encoding hints, external dialect metadata | generic primitive/object extension data; no interpreter or required texture |
| 2D image | label, external source name/provenance, optional dimensions when actually known | illustrative source-name extension; no image IO or dimension inference |
| Atlas/2.5D/visual descriptor | producer format/version, origin or directional conventions | preserve opaque extension data; no frames/directions/coordinate schema or parsing |

TypeScript strict NodeNext/ES2022, readonly recursive types and runtime freeze are
available; declarations are built by tsc. JSON-compatible values are the metadata
constraint, not a finalized project export format. No serializer/migration exists;
future portability must preserve unknown extensions. Canvas, Three objects,
textures, cache handles, Editor selections/tabs and game rules are not authored
metadata inputs. No globally enforced kind list or plugin registry is justified.

Preflight announced this additive public API, file scope and verification before
edits. Seven paths: Editor src asset-definition/index, manual consumer/README,
Editor AGENTS, Harness CONTRACTS and this checkpoint. Harness allowance applies
only to these two Harness notes. No manifest/lockfile/checker/CI/compiler changes.

## Public contract delta — Editor owns all five added symbols

| Symbol | Contract |
| --- | --- |
| `AssetMetadataValue` | recursive null/boolean/number/string, readonly arrays or metadata objects |
| `AssetMetadata` | readonly string-keyed object, including unknown extension names |
| `AssetDefinitionInput` | explicit identity, kind and metadata object |
| `AssetDefinition` | readonly schemaVersion literal 1, identity, kind and metadata |
| `createAssetDefinition(input)` | validates and returns a detached deeply frozen definition; TypeError for invalid data |

Only package-root exports are public. Factory combines validation and creation;
inspect the readonly result directly, without redundant validate/get APIs. Five
symbols are additive (Editor 11 -> 16); existing identity/preview APIs and all
Render APIs remain unchanged. Manual consumer imports the real Editor package
root and declarations; production Client still imports Engine/Render only.

`kind` is an exact nonempty whitespace-free string. It describes resource/data,
e.g. image, text, vendor:atlas-metadata, not player/monster/skill. The list is open;
semantic appropriateness belongs to authors, not a hardcoded game-role blacklist
or guessed global vocabulary. No trimming/case folding or interpretation occurs.

`schemaVersion: 1` is produced by the factory, describes this record shape, and
does not version the source or any external extension. Only declared top-level
fields are copied. Extension data belongs inside metadata. Identity is recreated
through v0.2.1 factory: equality is exact projectId+assetId, sourceId is provenance,
omitted sourceId becomes null and leading zeroes are preserved. Kind/metadata
changes do not generate an ID or alter logical equality. No uniqueness check.

Metadata root is a plain object (ordinary current-realm Object prototype or null
prototype). Nested values may be null, strings, booleans, finite numbers except
negative zero, plain objects, or dense ordinary current-realm arrays. Negative
zero is rejected rather than silently losing its sign through later JSON use.
Only own enumerable string-keyed data properties are accepted. Unknown keys and
values are copied without renaming, filtering or schema interpretation, including
an own `__proto__` key copied as data. Null-prototype inputs become ordinary
output objects; prototypes/property mutability are not authored data.

Reject undefined, function, symbol, bigint, NaN/infinity, negative zero, sparse
arrays, array extra/symbol keys, accessors, nonenumerable object properties,
cycles and class/platform instances (Date, Map, typed arrays, Canvas/Three etc.).
Metadata accessors are not invoked. Current-realm prototype constraint is explicit;
cross-realm plain objects must arrive as ordinary data first. Shared acyclic input
subobjects are copied independently, not rejected as cycles. Root/identity and
every copied metadata container are frozen, and host inputs are not modified.
No metadata prototype or object reference is retained. TypeScript number cannot
express the finite-number subset; runtime validation is authoritative.

Invalid metadata raises native TypeError with a property/index path and portable
data policy. Top-level input field access and Proxy traps can still throw host
exceptions; this is a trusted authoring-data API, not a hostile object sandbox.
No arbitrary depth/size safety budget or universal schema validator is introduced;
very deep input remains subject to the host call-stack/resource limit.

## Working proof and limits

`editor/manual/asset-definition.mts` is a separate public consumer with printed
observations, no assertions/runner/test helpers or automatic runtime CI job. It
creates image and text definitions, changes nested host metadata and identity,
prints frozen state, and creates an enriched immutable image definition with the
same logical identity. A Date from an explicitly untyped host demonstrates native
rejection. Unknown nested fields are visible in the printed JSON; this does not
implement serialization/export round-trip infrastructure.

Future stress review: the same explicit image ID can retain its source ID when
new directional producer metadata is supplied. No frames/directions are parsed
and no animation or atlas schema is established. A text definition requires no
locator/texture/canvas. External extension semantics/versioning stay with their
producer until an actual consumer exists; no plugin metadata registry.

Authored definitions are not loaded Render resources or Editor UI state. A plain
object with semantically inappropriate UI/game fields cannot be recognized by a
generic portability validator; callers must respect this ownership contract.
No file loading/existence check, import UI, locator, catalog, resolver, GPU/cache,
gameplay schema, universal rules, Render descriptor, migration or v0.2.3 work.
Exactly five projects. L1 Core 2.0.0 `04b7239f998c3c688a0dfa3202f11811a9acd775`
and L2 Gameplay 0.15.2 `acea332aa80f67552192a72b30f81c0bbbfc56bd` stay read-only,
with no upstream source/pin/artifact changes.

## Verification

```sh
node harness/cli.mjs check
node harness/cli.mjs scope --projects editor,runtime-render --allow-infra
node harness/cli.mjs verify --projects editor,runtime-render --with-consumers
node node_modules/typescript/bin/tsc --ignoreConfig --noEmit --strict --exactOptionalPropertyTypes --module NodeNext --target ES2022 --lib ES2022,DOM editor/manual/asset-definition.mts
node editor/manual/asset-definition.mts
```

Inspect emitted declarations and git diff whitespace/scope. CI retains existing
five independent builds and forced workspace build. Exact commit and CI URLs are
recorded in continuing Draft PR #2 after push. No test suite is created or run.
Build success alone never establishes functional/visual correctness.

Observed locally on Node 24.18.0 / npm 12.2.0:

| Gate / evidence | Observed result |
| --- | --- |
| Static architecture | ARCH_CHECK_PASS; 14 JS/TS files, including manual consumers |
| Scope | SCOPE_PASS; seven paths in declared Editor + justified Harness notes |
| Render independent build | BUILD_PASS |
| Editor independent build | BUILD_PASS |
| Discovered Client consumer independent build | BUILD_PASS; no consumer source changes |
| Manual strict NodeNext public-consumer compilation | Exit 0 against real package declarations |
| Manual Node public consumer | Exit 0; finite observations below, not automated behavioral PASS |
| Emitted declarations | Five added root exports match source, schemaVersion literal 1 and recursive readonly data; private helpers absent |
| Whitespace | git diff --check passed |

Manual image output retained identity `visual-idle` / sourceId `0012`, label Idle
and tags `[original]` while host identity became `host-changed`, label Renamed and
tags `[original, host-only]`. Freeze observations printed true for record,
identity, root metadata, nested extension object and nested array. Text output
had kind text, null sourceId and preserved language/script extension data without
any texture input. Enriched image printed same projectId+assetId true and retained
unknown metadata. Date input printed TypeError recognition true with path
`metadata["hostDate"]`. These observations do not exhaust all validation branches.

No failed/unconfigured build remains. Existing Windows Harness DEP0190 warning
is unchanged. Engine/Server are unchanged and not independently invoked locally
for this selected scope; existing CI builds both and forces the workspace build.
Actual file existence, file IO, catalog/Render integration, serialization/export
round-trip and graphics/visual correctness remain **NOT_VERIFIED**. Manual product
acceptance belongs to Developer; no gameplay or exhaustive test claim is made.
