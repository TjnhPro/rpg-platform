# v0.1.4 — Error and failure handling (ER09)

Status: **READY_FOR_DEVELOPER_REVIEW — v0.1.4**, subject to recorded gates below.
**FEATURE_NOT_VERIFIED / FRAME_NOT_RENDERED**. Earlier checkpoints remain ready
for review, not ACCEPTED. This task authorizes ER09 only, not v0.1.5 or Phase 1
completion. Keep the same Draft PR; no merge/tag/release/publish.

## Audit / preflight

Baseline: clean `feat/editor-render-foundation-v0.1` at
`934a3a914f01376092bbe7a3a951553be0849e5f`, same open Draft PR #1 into main.
Read root/project AGENTS, ARCHITECTURE, FOUNDATION, Harness contracts, ownership,
verification and v0.1.3 report. Inspected actual source, public roots/manifests,
tsconfig references, dependencies and Harness configuration. Source matches the
prior checkpoint: created/bound lifecycle, terminal disposal and native exceptions.
No owner/source conflict was found. Preflight was posted in PR before edits.

Primary owner: **runtime-render**, classification of its own operations/failures.
Editor collaborates only to forward safe diagnostics from the root API; it owns
future user presentation, not Render cause classification. No L1/L2 APIs are used.
Exactly five private 0.0.0 projects remain, unchanged dependencies and references.
Render imports nothing; Editor references Engine/Render; Game Client is the other
Render consumer. Builds remain genuine project `tsc -b --force`, root `tsc -b`.

## Actual failure inventory / channel / state

| Failure at current source | Existing channel preserved | Classification / progress |
| --- | --- | --- |
| Invalid captured target shape during initialize | TypeError, message unchanged | INVALID_HOST_TARGET / initialize; before mutation, remains created |
| initialize on disposed session | Error, message unchanged | SESSION_DISPOSED / initialize; stays disposed |
| getSnapshot on disposed session | Error, message unchanged | SESSION_DISPOSED / getSnapshot; stays disposed |
| Null/undefined host container from untyped caller | Native property-access TypeError, unchanged | Unrecognized caller misuse during factory; no published handle |
| Host getter/proxy throws while reading host.target | Original thrown value, unchanged | Host-owned exception; no published handle; not mapped to target or backend failure |
| Invalid/fabricated session reference at Editor consumer call site | Existing native error or caller-defined behavior | Caller misuse outside Render operation; not a Render capability/authenticity check |
| Backend capability/graphics acquisition/async partial init | Not implemented | No invented error code/result, no success claim |
| Fallible resource cleanup | No concrete cleanup callbacks/resources exist | No cleanup-failure code or simulated failure path |

All current Render-authored failures are programmer/lifecycle misuse, so exceptions
remain the channel. No expected operational rejection exists yet to justify a
parallel result API or new success wrapper. `undefined` from classification means
**unrecognized**, never operation success, unsupported capability or recoverability.
No silent retry, log-only failure, fallback renderer or catch-return-success exists.

## Public error surface / compatibility

Render root adds:

```ts
type RenderFailure =
  | { readonly code: 'INVALID_HOST_TARGET'; readonly stage: 'initialize' }
  | { readonly code: 'SESSION_DISPOSED'; readonly stage: 'initialize' | 'getSnapshot' };
function getRenderFailure(error: unknown): RenderFailure | undefined;
```

Thrown errors use private subclasses of the original native TypeError/Error. Native
ancestry, inherited name, message, throwing behavior, current API signatures and
state transitions are preserved. Exact constructor identity, stack text and private
class names are not public contracts; no current consumer inspects those. Consumers
continue catching native types or forwarding errors and may opt into classification.
No migration or breaking owner/signature change is required for current consumers.

Each recognized error owns a frozen diagnostic with only code/stage literals,
stored in a private field. Classification uses those private brands; it does not
read unknown object's message/stack/cause/getters/properties or invoke unknown
methods/prototype hooks. Forged properties/prototypes, proxies around errors,
serialized errors and errors from another package instance remain unrecognized.
There is no mutable global identity registry or cross-realm/wire protocol.

The diagnostic copies no host target, identity, authored/gameplay data, secrets,
arbitrary message or raw exception. Existing native Error stack is still a local
exception artifact and is **not** the public domain diagnostic or safe UI/log
payload. Unknown exceptions retain existing behavior; the host must choose its own
safe presentation policy. This is deliberately not a generic exception sanitizer.

Editor adds `getEditorPreviewFailure(error: unknown): RenderFailure | undefined`,
delegating to the public root so host code can distinguish code/stage without
private error-class imports. Existing init cleanup/rethrow and disposal adapters
remain unchanged. No UI toast/panel, logger, telemetry or retry manager is added.

## Failure lifecycle / cleanup limits

Invalid target is checked before state write. The captured binding cannot be
repaired by mutating the original wrapper; caller disposes/recreates with corrected
input. Disposed operations reject before any mutation; dispose itself remains
idempotent, returns target-free terminal metadata and cannot resurrect a session.
No error marks another session failed, retains target in diagnostics or resets
Editor/authored/gameplay state. State remains per-controller closure.

Editor initialization failure disposes its local handle then rethrows the original
error. Current disposal clears a reference/state without external work or fallible
callbacks; no cleanup exception is swallowed. If disposal ever throws, the existing
call propagates it rather than reporting successful cleanup, but preserving multiple
causes/partial progress must be designed alongside real fallible cleanup before
introducing it. No fake aggregate/partial-backend taxonomy is implemented now.
Host-owned getter side effects cannot be rolled back by Render; no transaction over
external host code is promised. No async partial acquisition currently exists.

## Relevant stress review — source reasoning only

- Browser lacks target capability: target creation is still host-owned; no browser
  adapter/capability detection exists in this package. Host must report that failure;
  a generic object becoming bound never means GPU support. Package import defines
  classes/functions only and uses no DOM/WebGL globals.
- One session fails: diagnostics capture code/stage only, no controller reference;
  existing closure isolation/state guards remain unchanged.
- Calls after disposal: same rejection and unchanged terminal state, now with an
  operation-specific stage; repeated dispose is still success, not misclassified.
- Future extension/backend errors: classify where the operation is owned, based on
  actual capability/acquisition/cleanup evidence; do not label all unknown values
  INVALID_HOST_TARGET or expose backend-native types. No plugin/error catalog is
  prebuilt. Later codes/compatibility require their authorized checkpoint review.

## Inventory / verification

Six changed files: Render/Editor source roots, both project AGENTS guidance,
`harness/CONTRACTS.md`, this report. Historical reports, Harness checker, manifests,
dependencies/references, Engine/Client/Server source, versions, lockfile, CI and
foundation artifacts/pins remain unchanged. Core 2.0.0 at
`04b7239f998c3c688a0dfa3202f11811a9acd775` and Gameplay 0.15.2 at
`acea332aa80f67552192a72b30f81c0bbbfc56bd` remain read-only.

```sh
node harness/cli.mjs check
node harness/cli.mjs scope --projects runtime-render,editor --allow-infra
node harness/cli.mjs verify --projects runtime-render,editor --with-consumers
npm run build -- --force
```

Infra allowance is only for checkpoint documentation/discovery. Exact checkpoint
SHA and push/PR CI are recorded on continuing PR #1. No tests, fault-injection
matrix, runtime/Node/browser probes, upstream verify or manual UI/visual evidence.
Builds establish compilation/public declaration resolution only; static checks and
source reasoning do not prove error behavior, isolation or redaction at runtime.
Actual browser integration v0.1.5, compatibility v0.1.6 and real backend/frame
proof v0.1.7 remain deferred. No gameplay, scene, asset or protocol feature is added.

Observed locally on Node 24.18.0 / npm 12.2.0:

| Gate | Result |
| --- | --- |
| Harness static architecture/import scan | ARCH_CHECK_PASS; 5 JS/TS files inspected |
| Scope (Render/Editor + checkpoint documentation) | SCOPE_PASS; 6 modified/untracked paths |
| Render independent build | BUILD_PASS |
| Editor independent build / named root failure API compilation | BUILD_PASS |
| Discovered Game Client consumer build | BUILD_PASS; source unchanged |
| Forced workspace build | BUILD_PASS; all five projects |
| Emitted declarations/JS and source review | Private exception classes absent from public declarations; expected safe union/root APIs; previous signatures/guards retained; no DOM/Three types |
| Git whitespace check | PASS |

No failed/unconfigured build remains. Existing Windows Harness DEP0190 warning is
unchanged. **FEATURE_NOT_VERIFIED / FRAME_NOT_RENDERED** remain explicit; no runtime
failure/redaction or GPU behavior is claimed PASS. Stop at v0.1.4, keep PR Draft.
