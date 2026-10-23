# v0.6.3 — Context Loss & Recovery Policy

RV05. IMPLEMENTED; **FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED**.
No browser execution, phase acceptance, merge, release or publication.

## Preflight / exact scope

Baseline HEAD/PR6: `ed424ba10a3a48dadc0407a21da391e6d1abc7fd` (v0.6.2).
Continue `feat/render-context-viewport-v0.6`, [draft PR6](https://github.com/TjnhPro/rpg-platform/pull/6),
main base `8aee145e7272dcccff3f20b9be4c70b63ec27b43` with merged Phase1–5.
Root/project AGENTS, architecture, Harness contracts/ownership/workflow/verification,
actual binding lifecycle, frame factory/backend/errors, observation API, consumers,
declarations and installed Three source were audited before editing.

Primary owner: **runtime-render**. Nine checkpoint paths: three private backend/
session/error sources, existing compiled manual entry and its HTML/guide, Render
guidance, Harness contracts/ownership, plus this report (ten paths total).
Editor/Client are build-only consumers, with no production changes. Root `.mcp.json`
was already untracked at preflight; `.orca/` also appeared during execution.
Both are preserved outside the checkpoint/commit, without reading private contents.

No Engine/Server/L1/L2, Scene/Spatial/Document schema or dirty/save state changes.
No dependency/package/compiler/scanner/CI changes, sixth project, render topology,
automatic recreation, GPU asset upload, recovery worker, polyfill, retry or loop.
Locked Three0.186.1 / @types/three0.186.0 / TypeScript6.0.3 unchanged. External refs:
L1 `04b7239f998c3c688a0dfa3202f11811a9acd775`,
L2 `acea332aa80f67552192a72b30f81c0bbbfc56bd` remain read-only.

## Source findings and implementation

Previously the backend checked isContextLost before/after submission but collapsed
loss into FRAME_FAILED. Installed Three WebGLRenderer registers context lost and
restored listeners: its restore handler calls initGLContext. Its dispose removes
those listeners before resource cleanup. Leaving a live renderer after loss would
permit implicit backend restoration inconsistent with RV05's explicit-only policy.

The private backend now registers one loss listener after Three construction.
It requires native isContextLost evidence (a synthetic event alone is insufficient)
and invokes session-owned terminal cleanup. Three's earlier lost listener permits
browser restoration, but disposing it removes its restored listener. Render neither
overwrites host handlers nor stops propagation; its cleanup removes only its own
listener and delegates Three-owned listener cleanup to dispose. There is no Render
restored listener and no production extension/debug API to force loss/restoration.
Clean disposal is not a guarantee that driver memory was reclaimed. Cleanup errors
are recorded and the target remains quarantined; no recovery guarantee on failure.

Pre-frame native checks reject observed loss before calling renderer.render.
Post-render checks and a render exception accompanied by native loss evidence also
classify CONTEXT_LOST. GL CONTEXT_LOST_WEBGL is likewise known loss. Other observed
GL errors/frame-counter mismatch remain FRAME_FAILED. No failed operation returns
a submitted receipt. Loss after the final synchronous check can only be observed
later: submitted never promises future GPU health or displayed pixels.

One shared session failure routine attempts disposal, retains known code/stage with
cleanupFailed, publishes failed, and returns the exception for renderFrame to throw.
The native event path has no caller Promise to reject; it publishes that same safe
terminal diagnostic without throwing from the event handler. Unknown frame errors
are rethrown unchanged with failure:null, not guessed FRAME_FAILED. Their cleanup
still runs and quarantines on failure (inspectRenderTarget observes reservation;
null does not claim successful cleanup). A throwing host getContext also propagates
unchanged; only native null/already-lost contexts imply GRAPHICS_UNAVAILABLE.
Existing constructor-failure ACQUISITION_FAILED + conservative quarantine remains.

## Public contract delta / transitions

Render root symbols **57**, Editor **134**, unchanged. Sole type delta:
RenderFrameFailure.code adds **CONTEXT_LOST**. No required members, function
signatures, stage union, binding states or receipt shape change. Consumers that
exhaustively enumerate graphics codes must account for the new variant; no local
consumer uses an exhaustive switch. Existing safe failure getter remains canonical.
CONTEXT_LOST uses renderFrame stage for operational loss, including asynchronous
loss events; acquire unavailability remains acquire, cleanup failure remains dispose.

| Trigger | Observation / ownership consequence |
| --- | --- |
| Acquire null/already-lost native context | failed / GRAPHICS_UNAVAILABLE / acquire; no session, clean failure releases own reservation |
| Acquired session loses context, event delivered or frame check detects it | failed / CONTEXT_LOST / renderFrame; binding disposed, cleanup attempted; no loss-frame receipt |
| Known non-loss frame failure | failed / FRAME_FAILED / renderFrame, same cleanup |
| Unknown frame exception without native loss evidence | failed / failure:null; original exception thrown, cleanup attempted |
| Loss/frame cleanup fails | original known failure + cleanupFailed:true; target quarantined |
| Explicit first disposal fails | disposed / CLEANUP_FAILED / dispose; quarantine retained |
| Dispose after terminal loss | existing idempotent disposal observation; original failed snapshot retained; no cleanup retry |
| Frame/initialize/binding snapshot after terminal loss | existing SESSION_DISPOSED stage error; no revival or submission |
| Browser restored event | old session remains terminal, no new backend/session, no asset upload |
| Host explicitly acquires again | new session/symbol only if usable target and not reserved; lost target may still reject, quarantined target stays TARGET_IN_USE |

Host may choose a fresh canvas, or wait for actual browser restoration then request
a new session on the old canvas if cleanup succeeded. Unreserved is not graphics
availability. If pre-frame checks dispose before lost-event delivery, Three's lost
listener is removed; a host wishing same-target restoration must permit it with its
own lost listener. Host must not suppress native loss delivery to Render. Native
event scheduling and browser/driver restoration remain external, not guaranteed.
Package import and metadata-only EditorPreviewHost still acquire no graphics.

## Manual evidence and verification

The [existing compiled consumer](../../runtime-render/src/manual-graphics-lifecycle.ts)
imports only the public root. Host listeners log actual lost/restored events and
defer observation until after dispatch; restoration only logs explicit-request
policy. Observe additionally reports target reservation. The
[manual procedure](../../runtime-render/manual/README.md) uses reviewer-invoked native
WEBGL_lose_context in DevTools if supported, requires actual events and distinguishes
unsupported/not-exercised from success. No mock/assertion/runner or production
loss/recovery backdoor. **Compiled, not browser-executed**: all transition entries
above are source/contract reasoning, not observed GPU/failure/cleanup results.

Reference: [Khronos native extension specification](https://registry.khronos.org/webgl/extensions/WEBGL_lose_context/)
documents asynchronous restoration and the preventDefault prerequisite; installed
Three source (`node_modules/three/src/renderers/WebGLRenderer.js`) is the actual
locked backend audit evidence for listener registration/disposal/restoration.

| Gate | Observed result |
| --- | --- |
| `node harness/cli.mjs check` | ARCH_CHECK_PASS; 71 JS/TS source files |
| `scope --projects runtime-render,editor,game-client --allow-infra` | SCOPE_PASS; 12 paths, including ten checkpoint paths and unrelated untracked .mcp.json/.orca paths excluded from commit |
| `verify --projects runtime-render,editor,game-client --with-consumers` | BUILD_PASS: Render, Editor, Client |
| `npm run build -- --force` | BUILD_PASS: all five projects |
| Strict ES2022-only public-root consumer compilation | PASS; existing factory signature plus new CONTEXT_LOST variant and safe getter, no DOM lib; ignored .artifacts/rv03-compile consumer, not executed |
| Public declaration inventory | Render57 / Editor134; root export list unchanged, only graphics code variant added, no native handles |
| `git diff --check` | PASS |

No failed/unconfigured build; existing Windows Harness DEP0190 shell warning remains.
Exact commit
SHA and push/pull_request CI results are recorded in PR6 after commit/push.
No v0.6.4 task supplied/implemented; whole-phase acceptance remains Developer-owned.
