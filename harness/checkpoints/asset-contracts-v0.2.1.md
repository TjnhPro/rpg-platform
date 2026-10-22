# v0.2.1 — Stable Asset Identity (AR01 / AR02)

Status: **READY_FOR_DEVELOPER_REVIEW — v0.2.1**, subject to recorded verification.
Developer explicitly instructed this turn to implement and verify without waiting
for intermediate reviews, with review at the final step. That instruction overrides
the previous-checkpoint review gate in the pasted task and v0.2.0 note; no prior
checkpoint is retroactively labelled accepted. Only v0.2.1 is implemented here.
Stop before v0.2.2; no merge, phase closure, tag, release or publish.

## Preflight and actual baseline

Clean Phase 2 branch `feat/editor-render-asset-contracts-v0.2` at
`31ddf24d7d753e80cc4a4783010affa099358726`, continuing [PR #2](https://github.com/TjnhPro/rpg-platform/pull/2).
Phase 1 baseline remains Developer-merged `4cec85b5a00e2477f00eee29e2da6025a532e973`.
Read mandatory root/project guidance, architecture/ownership/contracts/workflow/
verification, actual Editor exports/manifests/compiler settings and v0.2.0 note.
Editor has 8 root symbols before this change, Render 14; no asset identity type or
module exists. No PNG/TPSheet/0012 fixture is present in the tracked workspace
source inventory. The task's numeric filename `0012.png`, source ID `0012`, path
and label are illustrative host inputs, not an audited real JX1 asset convention.

Canonical primary owner: **Editor**, authored identity creation/validation. No
Render collaborator code is needed: resource descriptors are still deferred.
No L1/L2 API is needed. Preflight declared new minimal root exports and validation
policy before edits. Existing package/build/dependency direction is unchanged.

Seven paths: Editor src asset-identity/index, manual asset-identity.mts and manual
README, Editor AGENTS, Harness CONTRACTS and this report. Infrastructure allowance
is only the two Harness notes. No Engine/Render/Client/Server source or public
contract, manifest/lockfile/compiler/checker/CI change. Exactly five projects.

## Public API and validation contract

All three added symbols belong to Editor, exposed solely through
`@rpg-platform/editor` root (existing ESM/declaration export map):

| Symbol | Implemented contract |
| --- | --- |
| `AssetIdentityInput` | readonly projectId/assetId strings; optional sourceId string or null |
| `AssetIdentity` | readonly projectId/assetId strings and sourceId string or null; flat detached value |
| `createAssetIdentity(input): AssetIdentity` | Validates runtime inputs, copies primitive fields into Object.freeze result; throws native TypeError for invalid input |

Project and asset IDs must be primitive nonempty strings containing no ECMAScript
whitespace (`\s`, including surrounding/internal spaces, tabs and newlines).
Wrong types, empty or whitespace-containing IDs are rejected, not coerced/trimmed.
Input must be a nonnull nonarray object. No case folding or Unicode normalization.
Equality is exact case-sensitive string equality of **both projectId and assetId**;
object identity and sourceId are not logical identity equality. Same local ID in
another project is distinct; no shared state/counter/registry exists. Caller owns
the choice/stability of these keys; factory does not check uniqueness or provenance.

Omitted/undefined/null sourceId yields null. A supplied sourceId must be a primitive
nonblank string; empty/all-whitespace and nonstrings are rejected. Nonblank source
text is retained exactly, including leading zeroes, case and any surrounding
whitespace; it is not parsed as numeric or normalized. Source provenance scope and
multi-source associations remain deferred, not a new metadata schema.

Only the three primitive identity fields are copied. Name/path/other host fields
are not read or retained, so later host edits cannot change returned identity.
No image path is required for text assets. Output is frozen at runtime and readonly
in declarations; input is not frozen or modified. There is no stateful update API.
Unknown host accessor exceptions propagate; no general diagnostic framework added.

The factory requires an explicit assetId: it never falls back to sourceId, filename,
label or path and never hashes them. A caller may explicitly choose text resembling
a filename as its logical key; validation cannot determine the caller's intent.
No extension ban or JX1-specific numeric convention is imposed. Stability across
rename means preserving caller-supplied logical keys, not tracking real file moves.

## Consumer and compatibility

The separate manual `.mts` consumer imports the real Editor package root, not src
or private dist paths. It is type-checked after the genuine package build, then
run manually using installed Node's native TypeScript stripping. No test runner,
assertion, suite, helper, matrix or CI runtime gate is added. It prints a detached
identity plus mutated host input, cross-project/text/case examples and native
rejections for blank, missing and numeric asset IDs. Host-only label/path sample
fields deliberately remain outside factory/public type definitions.

Three symbols are additive (Editor 8→11); existing 8 preview APIs and Render's
14 symbols retain their signatures. Render never imports Editor. Client remains
an Engine/Render root consumer only; future exported asset data must not require
an Editor runtime dependency. Editor root retains pre-existing Engine/Render
imports; the identity implementation itself has no imports or DOM/IO/resource
operations. This does not claim the whole Editor package is a standalone SDK.

Build consumers through Harness; current graph discovers Client through Render,
not because Client uses the new Editor API. The manual TypeScript consumer is the
actual named consumer of new exports. Emitted `.d.ts` must match the three fields
and factory; private identityPart is not exported.

## Limits and future stress — no feature expansion

Rename scenario is host-string mutation only, not filesystem IO. Two projects can
use identical local keys with no global state. Leading zeroes are retained in
source text. Text identity needs no path/canvas/texture. Missing ID is rejected
even when sourcePath/sourceId are supplied; no implicit file identity.
These do not implement metadata descriptors (v0.2.2), locators, catalogs, asset
uniqueness (v0.2.5), reference resolution, loaders/decoders/cache, UI, gameplay or
export format. No real asset file, catalog integration or visual behavior verified.

L1 Core 2.0.0 `04b7239f998c3c688a0dfa3202f11811a9acd775`, L2 Gameplay 0.15.2
`acea332aa80f67552192a72b30f81c0bbbfc56bd` remain unchanged/read-only; no upstream
checkout, export, tarball, pin or dependency is edited.

## Verification

```sh
node harness/cli.mjs check
node harness/cli.mjs scope --projects editor,runtime-render --allow-infra
node harness/cli.mjs verify --projects editor,runtime-render --with-consumers
node node_modules/typescript/bin/tsc --ignoreConfig --noEmit --strict --exactOptionalPropertyTypes --module NodeNext --target ES2022 --lib ES2022,DOM editor/manual/asset-identity.mts
node editor/manual/asset-identity.mts
```

The final command is explicitly requested manual public-consumer evidence, not a
test suite or behavioral PASS derived from compilation. No unit/integration/UI/
browser/E2E/snapshot/visual runner or upstream suite is created/run. Exact commit
SHA and CI evidence are recorded in continuing PR #2 after push. Observations are
recorded below after real execution; manual examples do not establish exhaustive
validation, asset pipeline correctness or visual acceptance.

Observed locally on Node 24.18.0 / npm 12.2.0:

| Gate / evidence | Result |
| --- | --- |
| Static architecture | ARCH_CHECK_PASS; 12 JS/TS source files, including manual consumer |
| Scope | SCOPE_PASS; 7 paths in Editor plus two justified Harness notes |
| Render independent build | BUILD_PASS |
| Editor independent build | BUILD_PASS; new root exports emitted |
| Discovered Client consumer independent build | BUILD_PASS; existing source unchanged |
| Manual public TypeScript consumer no-emit compile | Exit 0 under strict NodeNext/exactOptionalPropertyTypes |
| Manual Node public consumer | Exit 0; observed output below, not a suite/test PASS |
| Emitted declarations | Three added exports match source contract; private helper absent from public declarations |
| Whitespace | git diff --check passed |

Manual output retained `{ projectId: 'sample-project', assetId: 'visual-idle',
sourceId: '0012' }` and `Object.isFrozen` printed true, while host fields printed
the renamed path/label, changed assetId and sourceId '12'. Another project printed
the same local assetId with null sourceId; text identity printed without path;
`Visual-idle` retained its uppercase V. Blank, path-only/missing and numeric ID
examples each printed native TypeError recognition true. These are the finite
observations made, not exhaustive invalid-input, catalog or filesystem checks.

No failed/unconfigured build remains. Existing Windows Harness DEP0190 warning
is unchanged. Engine/Server are unchanged and not independently invoked locally
for this selected scope; existing CI also covers them and forced workspace build.
File existence, actual file rename, metadata/resolution/loading/GPU/visual behavior
remain **NOT_VERIFIED**. No test runner/suite or automated runtime CI job was added.
