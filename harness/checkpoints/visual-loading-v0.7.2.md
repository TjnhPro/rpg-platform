# v0.7.2 — Asynchronous Resource Loading Lifecycle

VL02/VL04. **READY_FOR_NEXT_CHECKPOINT / BUILD_PASS**.
Finite source-stage traces below; overall **FEATURE_NOT_VERIFIED /
VISUAL_NOT_VERIFIED / TPSHEET_NOT_VERIFIED**. No GPU-ready or phase acceptance claim.

## Preflight, baseline and ownership

Starting HEAD `dd5865f694845fee1ddeb610e16ea029ef8395ef` (v0.7.1).
Branch `feat/visual-resource-loading-v0.7`, existing draft
[PR7](https://github.com/TjnhPro/rpg-platform/pull/7), base main. Refreshed origin/main
remains `33c9da5ac79cfce27043927fe5d7e08e3bd6d02c`. Prior exact-head
[push CI](https://github.com/TjnhPro/rpg-platform/actions/runs/39902765462) and
[PR CI](https://github.com/TjnhPro/rpg-platform/actions/runs/39902769554) SUCCESS.
No prior checkpoint is represented as Developer formally accepted.

Root/project AGENTS, architecture/foundation and Harness contracts/ownership/
workflow/verification inspected with current source/public declarations. Audited
v0.7.1 provider capture, bytes/media/length admission and normalization; Phase6
begin/acquireRenderFrameSession Promise error channel, terminal disposal/context
loss, backend resource clearing and Editor/Client late-result handling. Audited
Editor asset-visual/reference contracts, manual hosts, Client root and package
exports/manifests/lockfile. Current Three0.186.1/@types0.186.0/TS6.0.3 unchanged.
There is still no real PNG/TPSheet sample, decoder or GPU texture path in baseline.
Those are not prerequisites for this source-only lifetime milestone.

Initial tracked tree clean; only pre-existing untracked .mcp.json, left unread,
unchanged and excluded from commit. Ignored compiler/delivery artifacts remain local.

**Primary owner runtime-render:** explicit independent source-loading state and
release. Editor is touched only for optional manual provider/consumer evidence;
Editor/Client compile against the changed public root. No new ownership/import
direction; the supplied task authorizes the additive contract. No L1/L2 API needed.
Engine/Server/L1/L2, all manifests/lockfile/pins and Harness rules/config/checker
unchanged. Exactly five production projects. Graphics sessions remain canonical
Phase6 implementations; no competing renderer or graphics lifecycle is introduced.

## Files and public contract delta

- Render `src/visual-source-load.ts`: new source-only handle with getSnapshot,
  explicit start, copyBytes and terminal/idempotent release. One owner per request,
  no dedup or shared lease assumptions. Snapshots/Promise results contain metadata,
  never source buffers or providers.
- Render `src/visual-source.ts`: factor existing request capture/response admission
  into package-private helpers used by both paths. Existing one-shot normalization
  stays intact; lifecycle preserves unexpected thrown values instead of guessing
  WebGL/cancellation codes. Provider read and response admission are not duplicated.
- Render `src/index.ts`: three additive root symbols, Render77 ->80:
  createVisualSourceLoad, VisualSourceLoad, VisualSourceLoadObservation.
  Existing six provider types unchanged by static declaration comparison; existing
  acquireVisualSource signature/result contract unchanged. Editor134/Client0.
- Render [contract record](../../runtime-render/docs/visual-loading-v0.7.2.md) and
  [supplied task](../../runtime-render/docs/tasks/visual-loading-v0.7.2.md).
- Editor [manual consumer](../../editor/manual/visual-source-load.mts),
  [guide](../../editor/manual/visual-source-load.md), manual README link. Real
  authorized manifest snapshot, package-root imports only; no production Editor API.
- This report. Nine scoped files total; exact commit and exact-head CI links are
  appended to the same PR ledger after push, not self-embedded as a fabricated SHA.

States: requested ->pending ->source-acquired/failed ->released; release may occur
from any state. Stage is always source. prepareVisualResource stays synchronous,
pure metadata/NOT_PERFORMED. No decode/image/GPU-ready/upload/cache/queue/event-bus,
global singleton, atlas grammar, Scene instance or authored/gameplay schema change.

## Observed verification

| Gate | Actual result |
| --- | --- |
| node harness/cli.mjs check | Exit0, ARCH_CHECK_PASS82 JS/TS files |
| node harness/cli.mjs scope --projects runtime-render,editor,game-client --allow-infra | Exit0, SCOPE_PASS10: nine task paths plus pre-existing .mcp.json, excluded from commit |
| node harness/cli.mjs verify --projects runtime-render,editor,game-client --with-consumers | Exit0; genuine Render/Editor/Client independent BUILD_PASS |
| npm run build -- --force | Exit0; real all-five project-reference rebuild |
| Strict noEmit ES2022+DOM compile, editor/manual/visual-source-load.mts | Exit0, public-root consumer |
| Strict noEmit .artifacts/vl04-consumer.json, ES2022/types-empty/skipLibCheck:false | Exit0, three new symbols portable without browser types |
| Guide's finite Node host sequence | Exit0; source lifecycle observations below |
| Existing v0.7.1 manual guide after shared-path refactor | Exit0; real bytes, copy isolation, denied/missing/cap/media/foreign-project outcomes unchanged |
| Headless Render root import with throwing getters on window/document/URL/fetch/HTMLCanvasElement/WebGL2RenderingContext/ImageBitmap | Exit0, createVisualSourceLoad imported with no getter access |
| Static root inventory / declaration comparison | Render80, Editor134, Client0; existing six provider public types unchanged |
| git diff --cached --check | Exit0, no whitespace errors |

No failed or unconfigured final build. Existing Windows Harness DEP0190 warning
remains non-failing. No tests/assertion suites/runners or testing dependencies were
created or run. CI only builds/checks; it does not run the manual trace.

Manual input was the explicitly authorized committed editor/package.json snapshot,
bounded read <=4097 with rejection above4096 and file close before provider use.
Observed local483 bytes, application/json, SHA-256
`ecc9bccdc933060161ab4a6a5ec49191701a1dfd36512f735cbba1aadf448177`.
Checkout newline differences may change bytes/hash. This is real JSON data, not
PNG/TPSheet content or a coherent live-filesystem version guarantee.

Printed source-stage observations:

- Separate prepareVisualResource: NOT_PERFORMED, reads0.
- Delayed load: requested ->pending ->released before host delivery, copyBytes null.
- Two independent concurrent loads: requested ->pending ->source-acquired, length483,
  same real source revision, independent ownership. First caller copy483 has a
  separate buffer; first release clears its copyBytes access while second remains
  source-acquired/copy483; second explicitly released.
- After delivering the actual host-held response, late completion is released;
  late byte getter reads0, copyBytes null, repeated release stays terminal.
- Authorized absent host-snapshot key: requested ->pending ->failed/SOURCE_NOT_FOUND,
  no bytes, then release. This is not a physical-file missing claim.
- Explicit manual host rejection: requested ->pending ->failed/failure:null;
  caught error identity equals the original host Error; release leaves no bytes.
- Requested handle released before start: later start returns released; no read.
- Total host read count5; no decode or graphics operation entered.

## Lifetime limits and handoff

No architecture/dependency blocker for this milestone. Release clears the captured
provider before dispatch, drops pending source metadata/owned bytes and removes
stored completion/source observation references. Provider closure is dropped after
dispatch. A late fulfilled response is not inspected/copied/adopted; a second
terminal check prevents reentrant response accessors from reviving released state.
Known failures do not retain bytes. Unexpected active/late errors reach the caller
unchanged; release does not convert an already-started rejection into success.

Host still owns original buffers, permission/revision/containment and pending IO.
There is no abort/timeout or forced host Promise settlement. A non-settling host can
retain its own operation; Render clears its provider/request/byte cells on release.
Caller must catch/await a started Promise and drop caller-owned byte copies. Old
snapshots/Promise outcomes may retain metadata/errors under caller ownership.
Control-flow/reference-drop evidence is not garbage collection measurement, secure
zeroing, a performance result or an absolute leak-free guarantee. Every error and
reentrancy branch was not independently executed.

PNG decode, real TPSheet compatibility, browser host integration, GPU resources,
cache/lease lifetime and actual image/frame display remain unverified. Developer
owns product review/phase acceptance. No merge/release/publication or v0.7.3 code.
Continue on this branch/PR only when the next task is supplied; no checkpoint review
permission is required and no next-task requirements are invented here.
