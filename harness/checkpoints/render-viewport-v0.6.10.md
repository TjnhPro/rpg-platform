# v0.6.10 — Render Diagnostics & Cleanup Integration

RV15/RV11. IMPLEMENTED minimal diagnostics integration and source ownership audit.
**FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED**; no browser execution or Phase6 acceptance.

## Preflight and scope

Baseline 1e57c0cee51689d6c32e130f2d73be3b184b4aa4, branch
feat/render-context-viewport-v0.6, same draft [PR6](https://github.com/TjnhPro/rpg-platform/pull/6).
Merged Phase1–5 base: 8aee145e7272dcccff3f20b9be4c70b63ec27b43. Read root/project
AGENTS, architecture, Harness contracts/ownership/workflow/verification and actual
classifier/session/target/backend/viewport/manual-consumer source. Route hint agrees
with canonical primary owner Runtime Render. Task authorizes this additive delta.

Render alone owns backend cleanup, session observations and reservation. Editor/
Client remain public consumers and own canvas/UI/frame policy/recovery; their source
needs no change. Impacted builds include both. No Engine/Server, gameplay, authored
Scene/Spatial/Document state, dependency direction or build configuration changes.
No external L1/L2 API is required. Frozen L1 04b7239f998c3c688a0dfa3202f11811a9acd775
and L2 acea332aa80f67552192a72b30f81c0bbbfc56bd remain read-only.
Lock remains Three0.186.1/@types0.186.0/TypeScript6.0.3; backend same-realm canvas/WebGL2.
Pre-existing untracked .mcp.json is unread and excluded from the commit.

## Source findings and minimal delta

1. failGraphics preserved an unknown original exception but published failure:null,
   losing any concurrent cleanup failure from the safe observation. Add optional
   cleanupFailed:boolean to terminal RenderGraphicsSnapshot variants; canonical
   producers always populate it. Optional preserves old structural producers;
   absence means unknown. Unknown original exceptions still propagate unchanged.
2. Backend construction catch collapsed recognized GRAPHICS_UNAVAILABLE (invalid/
   lost initial native buffer) into ACQUISITION_FAILED. Preserve recognized code
   while merging cleanup uncertainty; unexpected construction errors retain the
   supported ACQUISITION_FAILED/acquire diagnostic. No new error hierarchy/codes.
3. Existing compiled graphics-lifecycle manual consumer shows cleanup status
   separately, avoiding the interpretation failure:null = clean success.

Render70/Editor134/Client0 root symbols and factory/session/receipt signatures stay
unchanged. Both branded classifiers retain their separate domains. Diagnostics
and snapshots remain frozen scalar records: no raw exceptions, stack/message,
canvas/context/backend handles, credentials or host data. Earlier snapshots are
historical, not live health. cleanupFailed=true includes inaccessible constructor
allocations/uncertain cleanup; false means no reported cleanup failure, never
GPU completion, driver reclamation or successful frame/display evidence.

## Failure / cleanup matrix and manual review

All entries below are **source-derived expectations, not observed runtime PASS**.
Build, serve root with `python -m http.server 8080 --bind 127.0.0.1`, open
`/runtime-render/manual/graphics-lifecycle.html` (G), viewport-identity.html (I),
or viewport-resize.html (R). Observe after each operation. On a fresh G page
before clicking Begin (with its existing import map), DevTools may use the real
public module:

```js
const r = await import('/runtime-render/dist/index.js');
const canvas = document.body.appendChild(document.createElement('canvas'));
const a = r.beginRenderFrameSession({target:canvas});
const s = await a.result;
```

Handle each rejected Promise/throw with both public classifiers and inspect
a.getSnapshot(), r.getRenderViewportSnapshot(a), r.inspectRenderTarget(canvas).
Do not log raw exceptions into product UI. Use fresh pages/canvases for independent
procedures; dispose every acquired session, including unwanted late results.

| Path / operation to reproduce manually | Diagnostic and expected cleanup observation |
| --- | --- |
| Bad binding: begin with target:null and handle result rejection | INVALID_HOST_TARGET/initialize via getRenderFailure; failed, cleanupFailed:false; no reservation/backend |
| Unsupported object: G select object, Begin; or fresh canvas.width=0 before Begin | UNSUPPORTED_TARGET/acquire via getRenderFrameFailure; failed, cleanupFailed:false; own reservation released |
| In-use: after acquiring s, begin a second acquisition on canvas; catch rejection, then frame/dispose s | TARGET_IN_USE/acquire; second operation never owns/removes first reservation; first session remains independently owned |
| Graphics unavailable: on fresh canvas acquire a real 2D context before Render acquisition | GRAPHICS_UNAVAILABLE/acquire from null webgl2; own reservation released; failed cleanupFailed:false. Browser policy may also disable WebGL |
| Construction/initial-buffer failure | ACQUISITION_FAILED/acquire for unexpected construction failure; recognized GRAPHICS_UNAVAILABLE retained. Returned renderer cleanup attempted; constructor did not return => cleanupFailed:true/quarantine. No deterministic portable native trigger; source audit only |
| Native context loss: G acquire; DevTools get real canvas webgl2 context and WEBGL_lose_context extension, call loseContext if available; Observe after event dispatch | CONTEXT_LOST/renderFrame, failed/terminal, extent:null; cleanup attempted. Extension availability/browser timing conditional. Event alone without native loss is insufficient. Restore never revives session |
| Invalid metrics: R Invalid zero width / Excessive ratio, or I Invalid zero resume while suspended | TypeError/RangeError, both classifiers undefined; pre-mutation rejection leaves state/reservation/demand intact, no receipt/cleanup. Unknown classification is not success |
| Native resize admission/operation failure | Over-native-limit candidate rejects RangeError before mutation; recognized native failure gives RESIZE_FAILED/resize or CONTEXT_LOST/resize. During/after mutation, failure is terminal with cleanup, no rollback claim. R valid resize exercises real path; native allocation/GL failure not deterministically forced |
| Suspended: I Acquire A, Suspend A, Frame A | VIEWPORT_SUSPENDED/renderFrame, cleanupFailed:false on exception; graphics stays ready/suspended, reservation and last positive extent retained; resume explicitly |
| Frame extent mismatch: G acquire, DevTools increment host canvas.width, Request one frame | FRAME_FAILED/renderFrame; failed/terminal + cleanup. Deliberate external backing-size edit is diagnostic review only, unsupported normal host usage |
| FRAME_NOT_SUBMITTED / FRAME_IN_PROGRESS | Actual backend early return/no counter advance terminates; nested call rejects nonterminal. No public callback exposes nesting and no reliable portable early-return trigger; source-only audit, no injected hook |
| Clean/repeated Dispose: G acquire, Dispose twice; I acquire A/B and dispose A repeatedly | First release disposed/null/cleanupFailed:false, own reservation removed; repeats retain observation. B remains owned by its own session. Inspect width/height/style/DOM connection and host listeners manually |
| Disposal failure / concurrent unknown frame failure + cleanup failure | CLEANUP_FAILED/dispose for explicit release; failed frame preserves original unknown exception, safe failure:null plus cleanupFailed:true. All independent release steps attempted; target quarantined. Repeated Dispose preserves diagnostic and quarantine. No safe deterministic native failure trigger; source audit only, no monkey patch/mocks |
| Unknown native exception before backend mutation, e.g. getContext/resize admission throws | Original exception, classifiers undefined, never guessed from message. Acquisition failure releases own reservation if no backend allocations; pre-mutation resize leaves state. Post-mutation/frame exception terminates and records cleanup separately. No artificial exception injection; conditional native evidence only |
| After terminal: frame/resize/suspend/resume/invalidate on retained s | SESSION_DISPOSED/getSnapshot via getRenderFailure; safe viewport snapshot still readable; no reacquisition or cleanup of another session |

Native loss observed before resize/frame may already have disposed the binding;
then SESSION_DISPOSED takes precedence. Suspension can reject before polling loss.
Reacquisition requires an explicit host decision and usable unreserved target.
Quarantine is conservative package-instance WeakSet membership, not a global lock
or retry service. Report actual browser/version/steps/diagnostic/reservation if
manual review is performed; unavailable triggers remain unverified, not simulated.

## Resource-owner audit

| Resource | Owner / release path and limits |
| --- | --- |
| Canvas DOM, width/height attributes, CSS, host listeners | Borrowed from Editor/Client. Dispose never removes/resizes/styles canvas, removes host listeners or force-loses context. Public resize is the only intentional live buffer mutation path |
| Native WebGL2 context | Browser owns lifetime. Render borrows it; no explicit destruction/reclamation guarantee. No forceContextLoss on disposal |
| WebGLRenderer allocations | Render calls ownedRenderer.dispose once through session release. Installed Three WebGLRenderer.js dispose removes its three canvas listeners, disposes background/render lists/states/properties/environments/objects/bindings/uniform groups/program cache/XR, removes XR session listeners and stops its animation helper. If an internal step throws, remaining internal steps are not proven complete; quarantine retained |
| Scene / Camera | Private empty scene cleared; refs dropped before cleanup. Scene.clear detaches children, not geometry/material disposal. No authored mesh/material/texture/resource loader exists here; future resources need their own explicit owner/disposal, not an invented recursive disposer |
| Render native loss listener | Removed with the same callback. Failure does not revive terminal session; released guard blocks later handling |
| data-engine metadata | Restore prior value only if current value still equals Three's tag; preserve different host edits. Equal-value host writes are indistinguishable; conditional best effort, not general host metadata ownership |
| Reservation | Added only by owning acquisition. TARGET_IN_USE clears local target before rejection, preventing another session's release. Successful release deletes; failed/inaccessible cleanup keeps weak quarantine, never retry-unlocks |
| Session / observers / demand | Backend ref dropped before release, target ref cleared after reservation handling, binding descriptor cleared; terminal size:null and suspension reset. Weak maps retain no enumerable registry. Scalar snapshots/classifiers contain no native handles; closures needed by disposal/loss listeners are not a GC/reclamation proof |
| Pending result and host callbacks | Host awaits/handles rejection, releases unwanted late session, cancels own callbacks/listeners. Existing Editor/Client hosts preserve this ownership; Render does not create a scheduler |

Every independent backend cleanup step is attempted even if another throws; the
aggregate CLEANUP_FAILED is truthful, never catch-and-success. Session repeated
dispose skips already released backend and preserves terminal observation. No
source-proven new architecture-checker loophole: existing checker unchanged.
No centralized logger/telemetry, duplicate lifecycle, new package or test suite.

## Verification

| Gate | Observed result |
| --- | --- |
| `node harness/cli.mjs check` | ARCH_CHECK_PASS:77 JS/TS files, unchanged checker |
| `scope --projects runtime-render,editor,game-client --allow-infra` | SCOPE_PASS:9 paths,8 checkpoint files plus excluded pre-existing .mcp.json |
| `verify --projects runtime-render,editor,game-client --with-consumers` | BUILD_PASS: Render,Editor,Client, including actual typed manual consumer |
| `npm run build -- --force` | BUILD_PASS: all five projects, no unconfigured project |
| Strict public consumer compile, ES2022-only lib/types:[], noEmit | PASS: new terminal observation, old structural producer and both classifiers; Editor/Client roots resolve; compile only |
| Emitted root inventory | Render70 / Editor134 / Client0, unchanged |
| `git diff --check` | PASS |

No project build failed. Initial auxiliary compile mistakenly requested absent Node
typings; corrected to explicit types:[] without installing dependencies, then PASS.
Existing Harness DEP0190 warning remains non-failing. No runtime tests, injected
failures, browser run, visual acceptance or GPU reclamation measurement performed.
Exact-head commit and push/PR CI links are maintained in PR6 checkpoint ledger.
No GPU-memory reclaimed claim; no merge/release/publish or next milestone work.
