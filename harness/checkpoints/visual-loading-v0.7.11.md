# v0.7.11 — VL17 Editor Visual Resource Integration

Status: **READY_FOR_NEXT_CHECKPOINT / BUILD_PASS**.
**FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED / TPSHEET_NOT_VERIFIED**.

## Starting state and preflight

Starting HEAD `3bd51ef35308b062f9d157ce388f064857adaa5b`, branch
`feat/visual-resource-loading-v0.7`, existing draft [PR7](https://github.com/TjnhPro/rpg-platform/pull/7).
Main remains `33c9da5ac79cfce27043927fe5d7e08e3bd6d02c`.
Previous exact-head push [SUCCESS](https://github.com/TjnhPro/rpg-platform/actions/runs/39923284402)
and PR [SUCCESS](https://github.com/TjnhPro/rpg-platform/actions/runs/39923292681).
Pre-existing untracked .mcp.json left unread/unmodified/excluded; otherwise clean.
Supplied [task](../../editor/docs/tasks/visual-loading-v0.7.11.md) authorizes this
scoped checkpoint without a new per-version approval gate. Prior checkpoints are
not presumed formally accepted.

Root/project guidance, architecture/foundation and Harness ownership/contracts/
workflow/verification read against actual public source/declarations. Audited
Asset catalog/reference/visual adapter, Scene identity, Document envelope/session,
Phase6 Editor host and Render graphics acquisition, Phase7 provider/revision/cache/
lease APIs and terminal cleanup, Client root/host, manifests/exports/lockfile and
existing manual consumers. The image adapter supports image-kind assets; opaque
authored subresource references are not frame-resolution evidence.

Primary behavior owner: **editor**, for authoring resolution, source authorization
and preview ownership. Collaborator: runtime-render's existing public loading/
cache/session implementation, unchanged. Client is a build consumer only. No new
external L1/L2 call or change: existing Core2.0.0/Gameplay0.15.2 pins remain frozen.
Three0.186.1/types0.186.0 and actual native backend remain unchanged. No missing
canonical dependency or architecture blocker found for the selected PNG path.

Six scoped paths: Editor docs/tasks/visual-loading-v0.7.11.md;
manual/editor-visual-resource.mts/.html/.md; manual/README.md; this report.
No production src, public exports, boundary direction, authored schema, package,
lockfile, checker, CI, Engine/Server/L1/L2 change. Exactly five projects.

## Implementation and public contract delta

No root API delta: emitted Render125, Editor134, Client0 symbols unchanged.
Optional finite Editor host composes existing package roots, with no Three/private
Render import, second parser/loader, shim canvas or fake decoding/upload outcome.

Canonical authored catalog/reference -> resolveAssetReference ->
describeResolvedVisualAsset -> prepareVisualResource -> real Render graphics
session + provider-bound cache.acquire. prepare remains metadata-only NOT_PERFORMED.
Host authorizes one exact project/resource/source slot/local PNG; stream byte limit
and actual SHA256 revision precede Render decoding. Missing/denied source modes
have explicit host-safe source diagnostics; missing Asset resolves before graphics.

One owned preview slot; replacement/close/unmount revokes intent, releases lease,
disposes cache, then graphics. Every stage is attempted if another throws; logging
cannot interrupt disposal. Cleanup uncertainty quarantines further acquisition.
Graphics acquisition/drain is serialized separately from provider IO, preventing
replacement from racing a pending target reservation. Late graphics are disposed;
late resource callbacks cannot adopt after close/unmount/replacement. Provider IO
may still finish; no physical abort or measured GPU-memory reclamation claim.

Scene/Asset data stay in a real unsaved Document envelope/session, separate from
preview ownership. Sample content kind is demonstration-only, not a new persisted
Scene schema. Failure paths do not invoke content mutation/save/dirty APIs. Trace
reports reference/content/envelope/revision/dirty observations and safe diagnostics,
without removing unresolved references or fabricating clean storage evidence.

## Evidence and limits

Finite Node public-root observation, exit0, no assertion suite:

- Authored sample built using actual Editor factories; reference resolved,
  visual descriptor described, metadata preparation returned NOT_PERFORMED.
- Missing Asset returned TARGET_NOT_FOUND with its authored reference retained.
- Authored envelope identity/revision unchanged, revision1 and dirty=true.
- Real committed PNG hash confirmed
  e9aa41812d69aa8ebbee3fb351fede258f2a159c4a547b3187ee54184dea0b79.
- Native createImageBitmap is undefined in this Node host. No fake substitute.

Optional browser entry and host compiled; inline browser module syntax checked.
Browser **NOT_EXECUTED**. Successful native decode/acquire/upload, denied/missing
source preservation during live graphics, late replacement/unmount cleanup and
resource release remain **NOT_VERIFIED**. Demo does not draw a sprite; a usable
texture is not display evidence. Source audit/build are not functional acceptance.

Selected scope is PNG through the existing Editor image adapter. Invalid-atlas
preview preservation is NOT_EXECUTED; no second atlas adapter/parser or invented
TPSheet format/sample added. Existing Render atlas support is unchanged. These
evidence gaps remain for whole-phase Developer review, as allowed by the task.
See [manual guide](../../editor/manual/editor-visual-resource.md).

## Commands and final results

| Command | Result |
| --- | --- |
| Strict NodeNext optional manual compile (guide command) | Exit0 |
| node harness/cli.mjs check | Exit0 ARCH_CHECK_PASS103 JS/TS sources |
| node harness/cli.mjs scope --projects runtime-render,editor,game-client --allow-infra | Exit0; final seven paths: six scoped plus excluded .mcp.json |
| node harness/cli.mjs verify --projects runtime-render,editor,game-client --with-consumers | Exit0 independent Render/Editor/Client BUILD_PASS |
| npm run build -- --force | Exit0 all-five workspace BUILD_PASS |
| Guarded no-browser-global root import / declaration inventory | Exit0; Render125/Editor134/Client0, metadata NOT_PERFORMED |
| Finite headless metadata observation | Exit0; limits above |
| node --check .artifacts/editor-resource-inline.mjs | Exit0 |
| git diff --cached --check | Exit0 |

No final failed/unconfigured build. Existing Windows DEP0190 warning is non-failing.
No tests, runner, assertions suite, browser automation, coverage or dependencies
added/run. Existing CI verifies project/workspace builds, not optional manual native
behavior. Exact checkpoint SHA and push/PR CI results are recorded on PR7 after
completion. No merge/release/publish or v0.7.12 implementation in this checkpoint.
