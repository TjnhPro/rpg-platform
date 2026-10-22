# Manual Scene membership consumer — v0.3.3

After the real package build from workspace root:

```sh
node node_modules/typescript/bin/tsc --ignoreConfig --noEmit --strict --exactOptionalPropertyTypes --module NodeNext --target ES2022 --lib ES2022,DOM editor/manual/scene-membership.mts
node editor/manual/scene-membership.mts
```

Finite observations show a player visual placeholder and three monster placeholders,
three references resolving the same existing Asset definition, detached frozen
captures, original snapshots unchanged by candidate adds/host edits, duplicate
rejection at create/add, foreign-project binding rejection, missing-target Phase 2
diagnostics without object deletion or registration, empty and assetless membership,
and reuse of a local ID in another Scene. Names are visual labels only, no gameplay.
This optional public-root consumer has no assertions, runner, test helpers or runtime
CI job. No Assets are loaded and no placement, renderer or file IO is exercised.

# Manual visual object definition consumer — v0.3.2

After the real package build from workspace root:

```sh
node node_modules/typescript/bin/tsc --ignoreConfig --noEmit --strict --exactOptionalPropertyTypes --module NodeNext --target ES2022 --lib ES2022,DOM editor/manual/scene-object-definition.mts
node editor/manual/scene-object-definition.mts
```

Prints distinct caller-provided IDs, independent frozen captures, unchanged mutable
input, stable captured values after host edits, exact case, nullable labels, known
output fields and invalid-input TypeErrors. Assetless/placementless data requires
no Scene membership, browser or graphics. This finite public-root example has no
assertions, runner, test helpers or automatic runtime CI. Uniqueness on Scene
insertion is deferred to v0.3.3; visuals remain NOT_VERIFIED.

# Manual Scene identity/definition consumer — v0.3.1

After the real package build from workspace root:

```sh
node node_modules/typescript/bin/tsc --ignoreConfig --noEmit --strict --exactOptionalPropertyTypes --module NodeNext --target ES2022 --lib ES2022,DOM editor/manual/scene-definition.mts
node editor/manual/scene-definition.mts
```

Prints an identity-only empty Scene, independent captures, unchanged mutable caller
input, frozen detached output, repeated reads, host-local title/path rename and ID
edit, the same local ID in another project, and invalid-ID rejections. No Asset
catalog, browser or graphics is required. Title/path are example host data, not
Scene fields or persistence. Optional finite observations only: no assertions,
runner, test helpers or automatic runtime CI. Rendering/visuals remain NOT_VERIFIED.

# Manual frame demo — v0.1.7

From workspace root, after README setup with pinned foundations:

```sh
npm run build -- --force
python -m http.server 4173 --bind 127.0.0.1 --directory .
```

Open http://127.0.0.1:4173/editor/manual/ in a browser supporting import maps and
WebGL2. This is a manual product entrypoint, not an automated test or test server.
Stop the local server with Ctrl+C. Do not open the HTML using file://.

Click **Start / new frame**. Expected visual output is a solid opaque blue canvas
(#147da8). The status reports only submission, not successful display or visual
verification. Click **Dispose** to release the Render session. Start again to create
a fresh session on the same host canvas; no old renderer is reused. A retained
blue buffer after disposal is not evidence of an active renderer. Target dimensions
are fixed; no resizing, viewport controls or render loop is implemented.

Missing WebGL2, unsupported target or lost context is a failure, never an empty
successful preview. Text-only content tools can keep using the existing null path
without calling the graphics factory. There is no host-level automatic restore/retry.

The HTML import map resolves the Render **package root** to the artifact declared
by its manifest, and Three to its installed ESM artifact. Editor TS imports only
`@rpg-platform/runtime-render`; it never imports Three or Render-private paths.
No CDN, bundler, UI framework or sixth project is needed. Three is installed only
as a Render dependency (npm may hoist it to workspace node_modules).

Build evidence is not visual evidence. No automated browser execution/assertions,
screenshots, UI tests or frame probes are part of this checkpoint's gates. Record
manual observation separately; absent observation means **VISUAL_NOT_VERIFIED**.

## Manual identity consumer — v0.2.1

After the normal package build, type-check this separate public consumer and run
it manually with the workspace's Node 24.18.0 (native TypeScript stripping):

```sh
node node_modules/typescript/bin/tsc --ignoreConfig --noEmit --strict --exactOptionalPropertyTypes --module NodeNext --target ES2022 --lib ES2022,DOM editor/manual/asset-identity.mts
node editor/manual/asset-identity.mts
```

It imports only `@rpg-platform/editor`, prints the frozen detached identity retaining
`sourceId: '0012'` after its host input is changed, separate project/text identities,
case-sensitive IDs and rejected invalid inputs. Name/path fields are host-local
example data, not a metadata descriptor. There are no assertions, test helpers or
automatic test jobs; this is the task's requested manual Node/TypeScript consumer.
No browser, renderer acquisition, filesystem asset access or file rename occurs.

## Manual authored definition consumer — v0.2.2

After the same real package build, run the separate public-root consumer:

```sh
node node_modules/typescript/bin/tsc --ignoreConfig --noEmit --strict --exactOptionalPropertyTypes --module NodeNext --target ES2022 --lib ES2022,DOM editor/manual/asset-definition.mts
node editor/manual/asset-definition.mts
```

It prints image/text definitions, detached nested extension data after host edits,
deep freeze observations, unchanged logical identity with new unknown metadata,
and a TypeError for a Date supplied by an untyped host. This is a manual example,
without assertions, a test suite or automatic CI runtime gate. It loads no assets
and does not implement an exporter, extension parser or Render descriptor.

## Manual composite source consumer — v0.2.3

After the same real package build, compile/run the public-root example:

```sh
node node_modules/typescript/bin/tsc --ignoreConfig --noEmit --strict --exactOptionalPropertyTypes --module NodeNext --target ES2022 --lib ES2022,DOM editor/manual/asset-sources.mts
node editor/manual/asset-sources.mts
```

It prints image + atlas-metadata sources under one logical identity, frozen/detached
source records, explicit relocation and multiple image pages retaining that identity,
and native rejections for traversal, unsupported remote type and duplicate source
pairs. Names are illustrative; no bytes, filesystem or network are accessed.
This is a manual example without assertions, test helpers or an automatic CI job.

## Manual reference/dependency consumer — v0.2.4

After the real package build, compile/run the public-root example:

```sh
node node_modules/typescript/bin/tsc --ignoreConfig --noEmit --strict --exactOptionalPropertyTypes --module NodeNext --target ES2022 --lib ES2022,DOM editor/manual/asset-reference.mts
node editor/manual/asset-reference.mts
```

It prints two independent caller-local holders targeting one asset, optional kind
expectation, unchanged reference data after explicit source relocation, an opaque
forward subresource reference and detached frozen direct dependency declarations.
It prints TypeErrors for a missing target key, duplicate direct target and
cross-project dependency. No Scene API, catalog/target lookup, IO, loader or
subresource parser is involved. No assertions, suite, test helpers or CI runtime job.

## Manual catalog/resolver consumer — v0.2.5

After the real package build, compile/run this public-root example:

```sh
node node_modules/typescript/bin/tsc --ignoreConfig --noEmit --strict --exactOptionalPropertyTypes --module NodeNext --target ES2022 --lib ES2022,DOM editor/manual/asset-catalog.mts
node editor/manual/asset-catalog.mts
```

It prints create/register/list/get, two references resolving to the exact frozen
definition in one snapshot, candidate metadata update without changing prior data,
duplicate rejection, removal and minimal unresolved outcomes. Catalog parameters
are factory-created snapshots; raw host data enters through create/register/update.
No assertions, test helpers/runner or automatic runtime job; no filesystem/network,
resource loading, subresource discovery, graph traversal or persistent host commit.

## Manual validation diagnostics consumer — v0.2.6

After the package build:

```sh
node node_modules/typescript/bin/tsc --ignoreConfig --noEmit --strict --exactOptionalPropertyTypes --module NodeNext --target ES2022 --lib ES2022,DOM editor/manual/asset-diagnostics.mts
node editor/manual/asset-diagnostics.mts
```

Prints resolved target, absent authored target, kind mismatch, missing ID, invalid
structure, invalid locator, project mismatch and unsupported subresource outcomes.
Physical files always remain NOT_CHECKED/NOT_VERIFIED. It also prints frozen result
records, captured target detachment and unchanged input observations. This is a
manual public-root example with no assertions, runner, test helpers or runtime CI job.

## Manual relocation/rebinding/compatibility consumer — v0.2.7

After the real package build:

```sh
node node_modules/typescript/bin/tsc --ignoreConfig --noEmit --strict --exactOptionalPropertyTypes --module NodeNext --target ES2022 --lib ES2022,DOM editor/manual/asset-relocation.mts
node editor/manual/asset-relocation.mts
```

Prints one PNG locator candidate, two old references still resolving, explicit
selected-reference rebinding and wrong-kind rejection. Round-trip uses host
JSON.stringify/parse and the public snapshot reader, retaining ordered source roles,
identity, dependencies and unknown metadata extensions. Unsupported version/structural
fields reject, leaving original data with the caller. Input records/holders stay
unchanged. No assertions, runners, test helpers or runtime CI job; no physical files
or persistence are involved. JSON is a demonstration transport, not a project format.

## Manual Editor–Render asset consumption — v0.2.8

After the real package build:

```sh
node node_modules/typescript/bin/tsc --ignoreConfig --noEmit --strict --exactOptionalPropertyTypes --module NodeNext --target ES2022 --lib ES2022,DOM editor/manual/asset-consumption.mts
node editor/manual/asset-consumption.mts
```

Imports both public package roots. Resolves an authored image, projects its stable
identity and ordered image/atlas-metadata sources, then invokes Render's real
metadata validator. Prints metadata-prepared / resourceLoading NOT_PERFORMED;
no image is displayed. Host JSON transport then feeds the same independent Render
contract, demonstrating detached/frozen portable output. Prints unsupported text,
unresolved reference and missing-image-source outcomes, plus Render rejections for
nonimage media hint and missing image role. Authored metadata remains in the catalog.
No assertions, test helpers, runner, browser or automatic runtime CI job. File
existence, source contents, GPU/display correctness and Client integration are not
verified. Atlas metadata is retained as a source description, never decoded.

## Minimal working asset reference MVP — v0.2.9

After the normal package build, optionally compile/run the single public consumer:

```sh
node node_modules/typescript/bin/tsc --ignoreConfig --noEmit --strict --exactOptionalPropertyTypes --module NodeNext --target ES2022 --lib ES2022,DOM editor/manual/asset-reference-mvp.mts
node editor/manual/asset-reference-mvp.mts
```

The example joins the existing APIs in one flow: register caller-provided
sample-project/monster-0012 (sourceId string "0012", image + atlas-metadata
locators), create two independent data holders, resolve both to one definition,
relocate only the PNG, observe both references unchanged, diagnose an unknown ID
and wrong expected kind, explicitly rebind one holder to a separately declared
alternate target, then hand the relocated original image to Render's metadata API.
Full input/output records are printed, including retained erroneous references and
the old catalog. The alternate target is explicit example input, never automatic
missing-reference repair. Holder names/IDs impose no Scene/Map/gameplay contract.

No tracked PNG/TPSheet asset bytes are supplied. All example file locators are
illustrative and never read or generated. Final output explicitly reports
ASSET_CONTENT_NOT_LOADED, fileExistence NOT_CHECKED and VISUAL_NOT_VERIFIED.
This is an optional manual example with no assertions, runner, test helpers or CI
runtime job. It is not an image viewer, loader, asset importer or persisted format.
Finite observed output and future compatibility limits are recorded in the
[v0.2.9 checkpoint](../../harness/checkpoints/asset-contracts-v0.2.9.md).
