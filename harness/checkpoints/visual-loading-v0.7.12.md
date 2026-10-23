# v0.7.12 — VL18 Game Client Visual Resource Integration

Status: **READY_FOR_NEXT_CHECKPOINT / BUILD_PASS**.
**FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED / TPSHEET_VISUAL_NOT_VERIFIED**.

## Starting state, ownership and source audit

Starting HEAD `8c2db6b1c0e87a0ce9648298096f070ec116c208`, branch
`feat/visual-resource-loading-v0.7`, existing draft [PR7](https://github.com/TjnhPro/rpg-platform/pull/7).
Main remains `33c9da5ac79cfce27043927fe5d7e08e3bd6d02c`.
Previous exact-head push [SUCCESS](https://github.com/TjnhPro/rpg-platform/actions/runs/39924701851)
and PR [SUCCESS](https://github.com/TjnhPro/rpg-platform/actions/runs/39924706387).
Only pre-existing untracked .mcp.json was present; unread/unmodified/excluded.
Supplied [task](../../game-client/docs/tasks/visual-loading-v0.7.12.md) authorizes
this checkpoint without another version approval gate. Builds do not imply prior
checkpoint or phase acceptance.

Read root/project guidance, architecture/foundation and Harness ownership/contracts/
workflow/verification against actual source/declarations. Audited Phase6 Client
continuous host/root, Editor catalog/reference/image adapter/manual host, Render
root, frame acquisition/private Three backend, descriptor/source/provider/cache/
lease, Unity parser/provenance/frame geometry/borrowed view and manifests/lockfile.
Existing APIs are sufficient; no canonical dependency blocker or API break found.

Primary owner **game-client**: direct neutral descriptor, explicitly selected source
capabilities and consumer lifetime. Render's public implementation is reused
unchanged. Editor manual host gains only observe/frame seams needed for isolation
review. Harness owns a same-realm composition page; no project imports another
consumer project. No external L1/L2 API call/change needed. Core2.0.0 at
04b7239f998c3c688a0dfa3202f11811a9acd775 and Gameplay0.15.2 at
acea332aa80f67552192a72b30f81c0bbbfc56bd remain frozen. Three0.186.1/types0.186.0
unchanged. Exactly five projects; tooling is not a production package.

Eight paths: Client docs/tasks/visual-loading-v0.7.12.md,
manual/visual-resource.mts/.html/.md and manual/README.md;
Editor manual/editor-visual-resource.mts;
Harness manual/resource-host-isolation.html and this report.
No production src/root exports/schema/manifests/lockfile/dependency/checker/CI,
Engine/Server/L1/L2 or Render source changes.

## Implementation / contract delta

No package public API delta: Render125 / Editor134 / Client0 symbols unchanged.
Optional Client module imports Render root only. Client root stays portable and
does not import this browser host. No Three/private Render import, decoder/parser/
cache implementation, gameplay loop or graphics hooks in Runtime Engine.

Host selection authorizes two immutable File snapshots, one PNG and one genuine
TPSheet. Fixed virtual locators/source indices never become filesystem/network
permissions. Exact texture header label/frame key are explicit host inputs; Client
does not parse or infer them. Provider checks scope/resource/source/locator, bounds
bytes and supplies actual SHA256 revisions. Missing-image selection returns
SOURCE_NOT_FOUND without reading image bytes, including the expected-revision
pre-read. The unavailable revision marker describes no usable source or fallback.

Render source load/parser -> canonical atlas revision -> cache acquire/native PNG
decode/texture -> geometry and borrowed view -> optional one-shot Render frame.
Page binding is the host's explicit matching-pair attestation; hashes/dimensions do
not independently prove the selected pair's semantics. No sprite drawing/display
claim. prepareVisualResource remains metadata-only NOT_PERFORMED.

Dispose attempts lease, metadata source, cache, then graphics; borrowed view owns
no new lease. Cleanup uncertainty quarantines replacement. Open after dispose
creates a new provider/cache/session and drains older graphics acquisitions before
reserving the target. Revocation is independent of pending IO; stale callbacks
cannot adopt; unwanted late sessions are disposed. Physical reads may finish.
Terminal unmount/pagehide tears down only that host. No global singleton/tick.

Harness page uses two canvases in one realm and the same Render module URL. It
mounts optional Editor/Client consumers, observes Editor resource/graphics/authored
snapshots before/after Client disposal and permits explicit Editor submission.
Those seams are manual-module-only, not new Editor package exports. Neither Client
source nor its standalone HTML imports Editor. Import-map Three mapping resolves
Render's backend; Client code does not import Three.

## Actual observations / limits

Finite Node public-root observation, no assertions/runner, exit0:

- Native File snapshots of existing original Wound_7.tpsheet (594 bytes) and PNG
  (4132 bytes) supplied via this Client provider. Both reached source-acquired.
- Actual source SHA256: sheet
  2a4f8e481fb7934b84431bf47deaece16d28af31c220646cd799cb0effc8f57d;
  PNG 564e290a89c9352aa8535e83857f8fc17ae16325d7e073a18ad21bd9f38b1a3d.
- Canonical parser returned three keys0050/0052/0054,128x128 page; frame0050
  resolved at native rectangle1,80,60,47 with original source pivot retained.
- Host-withdrawn image returned source failed/SOURCE_NOT_FOUND. Source handles
  explicitly released. These are bytes/metadata observations, not PNG decoding.
- Native createImageBitmap unavailable in this Node host; no substitute used.

Originals remain outside repository; redistribution rights unestablished. Manual
guide identifies the already-audited local pair and accepts another authorized
supported original. No invented TPSheet or copied external dataset committed.

Client/Editor optional hosts strictly compiled; both HTML module scripts passed
syntax checking. Browser **NOT_EXECUTED**. Successful native decode/upload/cache
lease, borrowed GPU view, frame submission/display, dispose/recreate races and
same-realm Editor survival remain **NOT_VERIFIED**. No production Client readiness,
leak-free, GPU-memory, performance or phase acceptance claim. Developer owns manual
review. See [manual procedure](../../game-client/manual/visual-resource.md).

## Commands / final results

| Command | Result |
| --- | --- |
| Strict NodeNext Client optional compile (manual guide) | Exit0 |
| Strict NodeNext Editor optional compile (manual guide) | Exit0 |
| node harness/cli.mjs check | Exit0 ARCH_CHECK_PASS104 JS/TS sources |
| node harness/cli.mjs scope --projects runtime-render,editor,game-client --allow-infra | Exit0; final nine paths: eight scoped plus excluded .mcp.json |
| node harness/cli.mjs verify --projects runtime-render,editor,game-client --with-consumers | Exit0 independent Render/Editor/Client BUILD_PASS |
| npm run build -- --force | Exit0 all-five workspace BUILD_PASS |
| Guarded browser-global-free Render root import/declaration inventory | Exit0;125/134/0 exports, metadata NOT_PERFORMED |
| Finite original source/provider/parser/frame-address observation | Exit0; limits above |
| node --check on two extracted inline modules | Exit0 both |
| git diff --cached --check | Exit0 |

No final failed/unconfigured build. Existing Windows DEP0190 warning non-failing.
No tests, assertion suite, browser automation, coverage, runners or dependencies
added/run. Existing CI builds projects/workspace; optional manual consumers are
locally compiled separately. Exact checkpoint SHA and push/PR CI recorded on PR7
after actual results. No merge/release/publish or v0.7.13 work included.
