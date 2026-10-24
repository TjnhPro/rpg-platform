# Animation preview - v0.10.9

[Manual browser entry](animation-preview.md): two authored clips, eight explicit
source slots, same-handle controls and Render-owned live frame binding. Includes
run commands, source/anchor limitations and finite observation report.

# Camera host integration - v0.9.12

[Two-host manual guide](../../harness/manual/camera-hosts.md): canonical camera,
independent Editor on-demand / Client continuous scheduling, real PNG and honest
CPU/native evidence. Browser and visual acceptance remain pending.

# Editor Visual Resource Integration — v0.7.11

[Editor-owned host guide](editor-visual-resource.md): authored catalog/reference to
Render resource lease, explicit provider permissions and preview replacement/close/
unmount. Optional package-root consumer; no authored state mutation or public API
extension. Browser NOT_EXECUTED; FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED.

# Manual Source Loading Lifecycle — v0.7.2

[Async source guide](visual-source-load.md) traces independent requests, source-only
acquisition, failure, release and late delivery through the Render public root.

# Manual Resource Provider — v0.7.1

[Source-access guide](visual-source.md) demonstrates the Render public provider
port with a host-authorized snapshot of the real Editor manifest. It records bytes,
provenance, denied/missing sources and limits; no image decode or graphics proof.

# Manual Document MVP — v0.5.12

The [Document workflow guide](document-mvp.md) provides a finite PowerShell/Node
public-Editor-API sequence using actual local files: create, authored edit,
validation, conditional Save, Close, Load and saved-snapshot restore. It also
observes real create-only conflict, delayed acknowledgement, missing references
and explicit migration candidate preservation. No Renderer/GPU, production storage
adapter, automatic suite or new public contract is introduced.

# Manual Scene data-flow MVP — v0.3.10

The [v0.3.10 checkpoint](../../harness/checkpoints/scene-contracts-v0.3.10.md)
contains a finite TypeScript sequence and PowerShell invocation using only Editor
and Render package roots. After the workspace build, run the documented command
from workspace root; it compiles/runs one temporary consumer and removes it.
No permanent script/test file or automatic runtime job is added.

Observe scene-zone-01 with one Player, three Monster and one VFX visual placeholder,
shared Asset resolution, optional placements, immutable edit, VFX-to-Player intent,
distinct missing Asset/Object diagnostics, independent scene isolation and real
Render metadata preparation. No sprites, GPU frames, IO or gameplay are exercised.

# Manual Scene authoring consumer — v0.3.9

After the workspace build, optionally compile/run the finite package-root sequence:

```powershell
node node_modules/typescript/bin/tsc --ignoreConfig --noEmit --strict --exactOptionalPropertyTypes --module NodeNext --target ES2022 --lib ES2022,DOM editor/manual/scene-authoring.mts
node editor/manual/scene-authoring.mts
```

Assemble, inspect, add, replace a label, update placement, reorder, clear a relation
and remove via existing Editor exports. Observe stable Scene/Object/Asset keys,
retained old snapshots and detached frozen known fields. Unknown example host note
and active-tab data remain caller-owned, absent from captured records. This is not
a lossless document reader or serializer; no save/load, resource loading or visuals.
No assertions, runner or automatic runtime CI. Compatibility inventory and future
design limits are in the [checkpoint](../../harness/checkpoints/scene-contracts-v0.3.9.md).

# Manual Scene-to-Render metadata consumer — v0.3.8

After the workspace build, optionally compile/run the finite package-root sequence:

```powershell
node node_modules/typescript/bin/tsc --ignoreConfig --noEmit --strict --exactOptionalPropertyTypes --module NodeNext --target ES2022 --lib ES2022,DOM editor/manual/scene-visual.mts
node editor/manual/scene-visual.mts
```

Two Scene objects reference the same catalog definition and retain separate
correlation/placement records. Each described resource passes to real Render
prepareVisualResource; only resource metadata crosses that API. Observe frozen
detached results, explicit/null media hints, unchanged source, unsupported cases
and separate missing-reference diagnostics. Placement is not consumed by Render;
no resource load, GPU/session/frame work, visual proof or file IO. Optional manual
sequence only, with no assertions, runners or automatic runtime CI.

# Manual Scene diagnostics consumer — v0.3.7

After the workspace build, optionally compile/run this finite public-root sequence:

```powershell
node node_modules/typescript/bin/tsc --ignoreConfig --noEmit --strict --exactOptionalPropertyTypes --module NodeNext --target ES2022 --lib ES2022,DOM editor/manual/scene-diagnostics.mts
node editor/manual/scene-diagnostics.mts
```

Observe empty validity, present/deleted Assets, absent catalog, dangling objects,
kind/project/subresource outcomes, structural failures with exact paths, reciprocal
nonhierarchical attachments, stable diagnostic ordering and source/result isolation.
Host TypeError is propagated unchanged. This optional sequence has no assertions,
runner or automatic runtime CI. No files are probed, no data repaired and no visual
behavior verified. Asset metadata presence does not establish physical existence.

# Manual immutable Scene operations consumer — v0.3.6

After the workspace build, optionally compile/run this finite public-root sequence:

```powershell
node node_modules/typescript/bin/tsc --ignoreConfig --noEmit --strict --exactOptionalPropertyTypes --module NodeNext --target ES2022 --lib ES2022,DOM editor/manual/scene-operations.mts
node editor/manual/scene-operations.mts
```

Observe add, complete replacement, focused placement update, remove, retained old
snapshots and dangling attachments; explicit null clearing, full replacement field
reset and reorder; detached/frozen captures and independent Scene IDs. Missing
operation targets, invalid identity, attempted rename, nonfinite placement and
foreign Asset references print TypeError. No assertions, runner or automatic runtime
CI; this is authored data evidence only, with no rendering, IO or history manager.

# Manual authored placement consumer — v0.3.5

After the real package build from workspace root:

```sh
node node_modules/typescript/bin/tsc --ignoreConfig --noEmit --strict --exactOptionalPropertyTypes --module NodeNext --target ES2022 --lib ES2022,DOM editor/manual/scene-placement.mts
node editor/manual/scene-placement.mts
```

Finite public-root observations print separate coordinate-space IDs/numeric pairs,
detached frozen captures after caller edits, a replacement candidate through the
existing factory with original unchanged, placement retained by add/reorder, text
without placement, empty/null cases and rejected invalid space/point fields.
No coordinate-space resolution, unit/axis assumptions, conversion, gameplay movement
or rendered placement is demonstrated. Optional manual sequence only: no assertions,
runner, test helpers or automatic runtime CI job.

# Manual authored ordering/attachment consumer — v0.3.4

After the real package build from workspace root:

```sh
node node_modules/typescript/bin/tsc --ignoreConfig --noEmit --strict --exactOptionalPropertyTypes --module NodeNext --target ES2022 --lib ES2022,DOM editor/manual/scene-ordering.mts
node editor/manual/scene-ordering.mts
```

Finite public-root observations show stable order through an unrelated label edit,
explicit reorder preserving identity/Asset refs/layers/attachment, detached frozen
reference/order after caller edits, missing target intent, old entry shape when
optional fields are omitted, nullable optional values, and invalid permutations or
self/cross-Scene attachments rejected. Layer names/attachment are authored intent
only; no renderer, parent hierarchy, transform following or file IO is exercised.
Optional manual sequence only: no assertions, runner, test helpers or runtime CI job.

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
# Editor viewport host — v0.6.11

Build the workspace, serve its root (for example
`python -m http.server 8080 --bind 127.0.0.1`), then open
http://127.0.0.1:8080/editor/manual/frame-demand.html.
This evolves the v0.6.9 on-demand consumer, using Editor's internal browser host
and only Render public APIs. The Editor package root stays portable. Earlier
index.html/manual-demo.ts remains the historical one-frame demo; it does not
provide this integrated layout/observer/unmount workflow. The binding-only
createEditorPreviewHost/openEditorPreviewHost API is unchanged and does not acquire
WebGL: mounted there is not graphics-ready here.

Expected manual review steps below are **not executed results**:

1. Mount host: UI mount installs ResizeObserver, resolution matchMedia, window
   resize, document visibility, native-loss and page-exit listeners. No graphics
   acquired/frame submitted. Start acquires one real Render session, then applies
   measured logical CSS extent and current window.devicePixelRatio through Render
   before scheduling the initial dirty frame. Observe prints host and graphics
   separately, requests/submissions, CSS/DPR metrics and actual native viewport.
2. Request one frame: one on-demand callback and synchronous renderFrame request.
   Request redraw x3 in one click: coalesces to one pending callback/submission.
   Observe never schedules; once clean there is no idle polling/requeue. Receipt
   is Render submission evidence only. Inspect actual opaque blue pixels manually;
   no Scene, authored object, gameplay tick, camera or animation is rendered.
3. Resize CSS width toggles 320/400 and applies metrics. ResizeObserver also reacts
   to external layout changes. Browser resize and re-armed resolution media query
   capture zoom/monitor DPR changes. Changed positive metrics invalidate via Render
   resize and schedule once; duplicate notifications with equal metrics do not
   independently dirty the viewport. At the callback, sample metrics again before
   submitting. Render owns pixel rounding/native limits; no direct canvas.width/
   height edits. This host has no canvas border/padding/CSS transforms; content
   measurement for arbitrary styled/transformed canvases is outside this demo.
4. Stop or Zero CSS width cancels pending callback and suspends active graphics;
   keep last positive native extent, reservation and redraw demand. Restore layout
   or visibility alone does not resume. Restore/resume uses fresh metrics through
   Render before scheduling. Switch tabs while active: hidden suspends; returning
   requires explicit Resume. While acquisition is pending, Stop/hidden instead
   invalidates intent and releases any late result; use Start after it settles.
   No Document envelope/session/dirty/revision/save API is accessed by this host.
5. Unmount closes immediately, cancels callback, disconnects observer and removes
   its media/window/document/canvas listeners, then disposes owned graphics. Canvas
   stays connected, CSS stays host-selected and Render does not force context loss.
   Button controls remain page-owned so Mount can explicitly create a fresh host.
   Repeated Unmount is inert. Start/Resume/redraw cannot revive a closed host.
6. Review pending unmount on a cold load with cache disabled/network throttled:
   Start then Unmount before backend acquisition settles. Observe pending:true
   and unmounted, then pending:false with terminal graphics after late release.
   Remount is refused until old acquisition drains. Public acquisition has no
   abort API: temporary backend allocation can finish after close, but the result
   is immediately disposed without adoption/metrics/frame scheduling. No fake
   delays or hooks. pagehide uses the same teardown; BFCache return needs Mount.
7. For native context loss use the real optional DevTools extension procedure in
   the [Render guide](../../runtime-render/manual/README.md). Host only cancels;
   Render detects actual loss and performs cleanup. Observe after dispatch for
   terminal diagnostics. Resume cannot restore a terminal session; Start is an
   explicit reacquisition attempt. Cleanup failure keeps Render quarantine. UI
   retains safe lastFailure and terminal cleanupFailed even when failure is null;
   unknown errors stay UNRECOGNIZED, not successful recovery. Invalid/budget-rejected
   sizing cancels and suspends this host until an explicit valid Resume/Start.

The fixed native buffer attributes are initial acquisition inputs; only CSS/DPR
metrics accepted by Render configure the live viewport. Positive extents over the
host's 4096-per-axis / 4,000,000-pixel budgets reject without clamping. Native limits
may reject earlier. No GPU-memory reclamation or displayed-pixel claim follows from
cleanup/submission. Modern ResizeObserver/matchMedia/WebGL2 are required; mount
failure is shown as unrecognized rather than substituting a renderer or mock.

The real build compiles the browser entry and internal integration. There are no
assertions, runners, mocks, browser automation or runtime CI. At v0.6.11 all browser
procedures, pending/unmount races, native DPR/resize/loss and pixels remain
**FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED**. Developer owns manual acceptance.
# Two-host Viewport MVP — v0.6.13

Open [viewport-mvp.html](viewport-mvp.html) after the workspace build and serving
its root. This manual-only composition loads the existing Editor and Client
browser entries into scoped sections of one document. Both resolve the same
Render root; no package-to-package implementation import or new root API.
A starts at 800×450 and toggles to 600×400; each host offers explicit ratio1/2 or
browser DPR. Last accepted resize receipt remains visible beside current metrics.
See the [manual procedure/evidence matrix](../../harness/checkpoints/render-viewport-v0.6.13.md).
Browser execution unavailable here; FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED.

## PNG decoding — v0.7.3

See [optional PNG consumer](png-image.md) for an original 2x2 PNG, browser
decode/cleanup procedure and finite headless admission-only trace. No GPU display,
automated tests or headless decoder is provided.

## Texture upload — v0.7.4

See [optional texture consumer](texture-upload.md) for bounded PNG acquisition,
two real graphics sessions, opaque upload handles, independent CPU release,
cross-session rejection, terminal cleanup and explicit reacquisition. This
consumer submits no frames and has not been run in a browser here.

## Atlas metadata — v0.7.5

See [finite atlas consumer](atlas-metadata.md) for read-only original TPSheet40300
metadata parsing, explicit multi-page source bindings and malformed-copy
diagnostics. Local original metadata was observed; no authored catalog change,
PNG decode, frame geometry or visual acceptance is implied.

## Frame identity/resolution — v0.7.6

See [finite frame consumer](frame-resolution.md) for two logical holders, exact key
lookup, typed missing/unsupported/revision diagnostics and unchanged Phase2 catalog
semantics. The optional `--frames` mode reuses the bounded original-file atlas host;
frame lookup performs no extra source reads and no image/GPU operation.

- [v0.7.7 atlas geometry](atlas-geometry.md): finite rect/UV inspection over original
  metadata and an optional borrowed-texture hook. Numeric observation is not GPU display.

- [v0.7.8 in-flight PNG scope](inflight-png.md): finite provider counters, waiter
  release/failure/retry trace and optional browser-native decode entry.

- [v0.7.9 resource cache](resource-cache.md): optional finite 100-lease/multi-session
  public-root consumer. Compiled only; native reuse/cleanup requires manual observation.

- [v0.7.10 explicit cache revision/limits](cache-invalidation.md): optional finite A/B consumer, compiled only; browser/GPU observations remain open.

- [v0.7.13 visual resource MVP](../../runtime-render/manual/visual-resource-mvp.md):
  Editor Catalog/reference and independent Client host adapters, shared Render
  demonstration path, concurrent holders/release/revision controls. Browser NOT_EXECUTED.
- [v0.8.11 Scene preview sync](scene-preview.md): public-root Editor bridge consumer,
  three shared-asset objects, missing reference, stable update/remove controls.
  Compiled only; browser NOT_EXECUTED.

- [v0.8.13 seven-instance Scene MVP](../../runtime-render/manual/scene-mvp.md):
  original PNG/atlas sources, independent Editor/Client hosts, canonical resource
  leases and instance controls. Strict compiled manual consumer only; browser
  NOT_EXECUTED, FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED.
