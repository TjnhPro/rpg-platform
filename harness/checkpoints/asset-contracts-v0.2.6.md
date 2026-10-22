# v0.2.6 — Missing Reference & Validation Diagnostics (AR11)

Status: **READY_FOR_DEVELOPER_REVIEW**. Continue existing Phase 2 branch/Draft PR #2.
Developer's instruction to implement/verify without intermediate gates supersedes
the attachment's prior-checkpoint prerequisite; earlier versions are not thereby
accepted. Stop before v0.2.7; no merge, phase closure, tag, release or publish.

## Preflight / source evidence

Clean baseline `8afe9f436d4400ccb18cebf74fcd4c5534bc3798` on
`feat/editor-render-asset-contracts-v0.2`; Phase 1 Developer-merged baseline remains
`4cec85b5a00e2477f00eee29e2da6025a532e973`. Required agent guidance, architecture,
ownership, contracts, verification/workflow, actual asset sources/public APIs and
manifests/compiler options were inspected. Editor had 31 root symbols, Render 14.
v0.2.5 resolver distinguishes authored outcomes but provides no structured invalid
input report; existing factories throw TypeError and are the validation authority.

Primary owner: **Editor**, authored reference/descriptor validation diagnostics.
Render needs no source/signature change. Client is an existing discovered build
consumer. No L1/L2 API, package dependency or ownership change. Preflight declared
additive diagnostic entrypoints and internal structured TypeError metadata, retaining
existing validation/resolution semantics. Twelve paths: four asset validators,
internal validation channel, diagnostics module/root, manual example/README,
Editor AGENTS, Harness CONTRACTS and this report. Infra allowance covers only the
two Harness notes. No sixth project or new production consumer.

## Public API / deterministic policy

Seven Editor root additions (31 -> 38), all Editor-owned; Render retains 14:

| Surface | Contract |
| --- | --- |
| `AssetDiagnosticCode` | stable validation codes plus existing resolver reason codes |
| `AssetDiagnosticTarget` | projectId/assetId string-or-null hints |
| `AssetDiagnostic` | readonly code/target/path and readonly primitive details |
| `AssetReferenceDiagnosticResult` | resolved / unresolved / invalid union; NOT_CHECKED file existence |
| `AssetDefinitionDiagnosticResult` | valid / invalid union; NOT_CHECKED file existence |
| `diagnoseAssetReference(catalog, unknown)` | reuse resolver; malformed reference becomes invalid, valid absent target unresolved |
| `diagnoseAssetDefinition(unknown)` | reuse definition factory; detached validated definition or invalid report |

Each call reports one first failure, not an aggregate/scanner. Reference priority:
object shape, projectId, assetId, expectedKind, subresourceId, then existing resolver
project mismatch -> target absence -> expected kind mismatch -> unsupported subresource.
Definition priority remains factory order: object, kind, metadata root shape,
identity shape/projectId/assetId/sourceId, metadata contents, sources, dependencies.
Lists follow declared order, object metadata follows JavaScript own-key order.
Source validation: object, role, locator object/type/path, duplicate pair. Dependency
validation: reference fields, project scope, duplicate target. No new acceptance rules.

Structured validation uses an internal TypeError subclass retaining existing messages
and instanceof TypeError behavior; exact constructor identity now differs. No message
parsing, duplicate validators or raw Error/cause/stack payloads. Internal helper/class
are not root exports. Existing create/resolve APIs retain throwing behavior and their
return shapes; no changes to v0.2.5 catalog source. Only authored factory failures
become invalid reports. Unknown getter/Proxy/runtime exceptions still propagate,
never classified as corrupt state or resource failure. These data APIs are not a
hostile-object sandbox; caller must supply a factory-created catalog as before.

Paths use reference/definition roots, dot fields, array indices and existing quoted
metadata keys, e.g. definition.sources[0].locator.path. Validation details supply a
stable constraint string. Unresolved details supply expected/actual project or kind,
lookup scope, or unsupported subresource status. On invalid input, target fields are
best-effort own string data properties, not a claim of valid identity; unavailable
fields are null. Accessors/inherited hints are not read. Invalid descriptor target
identifies its owner; nested dependency failures identify their field via path.

All result records, diagnostics, target hints and details are detached/frozen.
Validated references/definitions use existing factories; resolved definition is the
exact frozen record from the supplied snapshot. No authored input, catalog or holder
is mutated/deleted. Host retains invalid input even when result.reference/definition
is null. Unknown references retain their authored keys in unresolved results.

Every result has fileExistence: NOT_CHECKED, including successful resolution and
invalid descriptors. TARGET_NOT_FOUND means absence in the supplied authored catalog,
never physical file missing. No file existence probe is accepted/performed. Current
catalog has no verified subresource inventory, so SUBRESOURCE_NOT_SUPPORTED remains
unresolved; no SUBRESOURCE_MISSING code/claim. Project on an unmounted machine can
resolve authored data while files remain NOT_VERIFIED. Old links to removed assets
remain authored data and receive TARGET_NOT_FOUND without repair or placeholders.

## Verification / limits

```sh
node harness/cli.mjs check
node harness/cli.mjs scope --projects editor,runtime-render --allow-infra
node harness/cli.mjs verify --projects editor,runtime-render --with-consumers
node node_modules/typescript/bin/tsc --ignoreConfig --noEmit --strict --exactOptionalPropertyTypes --module NodeNext --target ES2022 --lib ES2022,DOM editor/manual/asset-diagnostics.mts editor/manual/asset-catalog.mts editor/manual/asset-reference.mts editor/manual/asset-sources.mts editor/manual/asset-definition.mts editor/manual/asset-identity.mts
node editor/manual/asset-diagnostics.mts
```

Observed local results:

| Gate / evidence | Result |
| --- | --- |
| Harness architecture | ARCH_CHECK_PASS; 23 JS/TS source files |
| Scope | SCOPE_PASS; twelve declared Editor/Harness paths |
| Independent builds with discovered consumers | BUILD_PASS: Render, Editor, Client |
| Strict NodeNext public-root compilation | Exit 0 for diagnostics and all five prior asset examples |
| Emitted declarations | Seven added root symbols, readonly discriminated results, literal NOT_CHECKED; internal error/helper not root exports |
| Manual public consumer | Exit 0; finite observations below, not automated-test PASS |
| Whitespace | git diff --check passed |

Manual output distinguished resolved/NOT_CHECKED/null diagnostic from unknown
target's unresolved/TARGET_NOT_FOUND at reference.assetId and kind mismatch at
reference.expectedKind (expected text, actual image). Missing ID returned
invalid/INVALID_ID with null asset hint; null reference/definition returned
INVALID_STRUCTURE at their roots. Cross-project reference returned PROJECT_MISMATCH;
opaque address returned SUBRESOURCE_NOT_SUPPORTED, never missing. Valid descriptor
was valid/NOT_CHECKED. Traversal locator returned INVALID_LOCATOR at
definition.sources[0].locator.path, constraint PORTABLE_PATH_SEGMENTS. Result,
diagnostic, target and details freeze observations were all true. Editing the host
identity after capture left diagnostic target visual-idle. Original catalog/reference/
descriptor serialized comparison printed unchanged true. Physical files printed
NOT_VERIFIED. This does not establish exhaustive validator or runtime coverage.
No failed/unconfigured selected build. Existing Windows Harness DEP0190 warning is
unchanged. Engine/Server independent and full workspace builds are delegated to CI.

Manual public-root example has no assertions/test helpers/runner or runtime CI job.
Exact-head push/PR CI evidence belongs in continuing Draft PR #2; CI builds all five
projects and the workspace. Physical files, Render loading/errors, graph integrity,
persistence/export, scene integration and visual correctness remain NOT_VERIFIED.
No automated tests created/run; build PASS proves compilation only. No scanner,
auto-fix, UI/toasts, watcher, subresource schema, relocation v0.2.7 or later work.
Engine/Render/Client/Server source, L1/L2 pins, manifests, lockfile, build/checker/CI
remain unchanged. Exactly five projects and unchanged dependency direction.
