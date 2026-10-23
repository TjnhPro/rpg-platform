# v0.7.14 — VL20 Visual Resource Loading Integration & MVP Closure

**READY_FOR_DEVELOPER_REVIEW — v0.7.14 / BUILD_PASS**.
**FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED / TPSHEET_VISUAL_NOT_VERIFIED**.
This delivers the whole-phase review packet; it does not declare Phase7 ACCEPTED.

## Starting state and approved scope

Starting HEAD `8e43b40df3375559e703d416109b48e6360ccf48` (v0.7.13), main/base
`33c9da5ac79cfce27043927fe5d7e08e3bd6d02c`. Same branch
`feat/visual-resource-loading-v0.7`, existing draft [PR7](https://github.com/TjnhPro/rpg-platform/pull/7).
Prior exact-head push [SUCCESS](https://github.com/TjnhPro/rpg-platform/actions/runs/39927931852)
and PR [SUCCESS](https://github.com/TjnhPro/rpg-platform/actions/runs/39927935914)
confirmed before this checkpoint. Only pre-existing untracked `.mcp.json` was
present; left unread/unmodified/excluded. No unrelated changes adopted.

Supplied [task](../../runtime-render/docs/tasks/visual-loading-v0.7.14.md) authorizes
docs/audit closure and continuous execution without another checkpoint review.
Canonical primary owner **runtime-render** for the resource/contract audit;
Editor/Client collaborate through consumer/host review, Harness owns evidence.
No ownership move, breaking API, missing canonical dependency or architecture
decision requiring scope expansion was identified. No new L1/L2 API use needed.

Read root/relevant project AGENTS, Architecture/Foundation and Harness contracts,
ownership/workflow/verification against actual source. Reviewed all preceding
checkpoint reports/commit file sets, full phase diff inventory, public roots/emitted
declarations, manifests/lock/pins, static configuration/CI, source/provider/decode/
atlas/frame/geometry/cache/texture/session/backend and selected-host/runbook paths.
Phase6 baseline and its accepted diagnostic migration/pending browser evidence
are retained explicitly; no assumption that previous green builds are acceptance.

## Exactly five changed paths — documentation only

- Render docs/tasks/visual-loading-v0.7.14.md: supplied task, normalized whitespace.
- Render docs/visual-loading-v0.7.14.md: VL01–VL20 status/evidence matrix, ownership,
  key/lease/invalidation/failure audit, actual originals and manual review limits.
- Render docs/public-api-delta-v0.7.14.md: all 56 additions with emitted declarations
  and pinned source links; full comparison against the frozen 70/134/0 baseline.
- Render docs/phase-inventory-v0.7.14.md: all 15 checkpoint slots, exact preceding
  SHAs/28 CI results and full 106-file phase inventory including this closure.
- This checkpoint report.

One closure commit; its exact SHA and both final workflow URLs are written to PR7
after push. A commit cannot contain its own SHA without self-reference. All14
preceding SHA/CI rows were freshly queried by exact head; none inferred from green
checks on a different revision. The final PR ledger supplies slot15, not a fake SHA.

## Public and architecture result

**Zero new/changed production APIs at closure.** Whole phase: Render70 ->126 root
names,56 additions; no removed or changed legacy declarations. Editor134/Client0
unchanged. The root-only public contracts remain portable. Existing
prepareVisualResource source is unchanged and returns synchronous NOT_PERFORMED;
createRenderFrameSession keeps canonical lazy acquisition; plain renderFrame stays
clear-only. New textures/quad cleanup joins that same backend, not a second loader
or renderer. Within-phase optional extensions are disclosed in the API inventory.

Exactly five projects. Render -> no Editor imports; Client consumer -> Render root
only; Editor owns authored catalog/reference/Document state and host permission.
No phase edits to production Editor/Client, Engine/Server, L1/L2, manifests/lock,
dependencies/tsconfigs/pins, rules/checker/CI or authored schemas. No copied logic.
Core2.0.0 `04b7239f998c3c688a0dfa3202f11811a9acd775`, Gameplay0.15.2
`acea332aa80f67552192a72b30f81c0bbbfc56bd`, Three0.186.1/types0.186.0 frozen.
No tests, runners, assertion suites, browser automation or coverage added/run.

## Gates and exact-head protocol

The complete documentation tree was validated locally with the commands below,
then committed. Required gates and optional consumer compilation are rerun at that
immutable closure HEAD before push; exact-head outcomes/CI are appended to PR7.
No production edits occur between those runs. A failed final-head gate must be
reported/fixed rather than relabelled as success from the earlier run.

| Command / inspection | Local observed result |
| --- | --- |
| node harness/cli.mjs check | Exit0 ARCH_CHECK_PASS109 JS/TS sources |
| node harness/cli.mjs scope --projects runtime-render,editor,game-client --allow-infra | Exit0; five closure docs plus excluded pre-existing .mcp.json |
| node harness/cli.mjs verify --projects runtime-render,editor,game-client --with-consumers | Exit0 independent Render/Editor/Client BUILD_PASS |
| npm run build -- --force | Exit0 all-five workspace BUILD_PASS: Engine, Render, Editor, Client, Server |
| Three strict optional NodeNext manual compiles from MVP runbook | Exit0 each; emitted package-root declarations used |
| Strict portable root consumer, ES2022/types[]/skipLibCheck:false | Exit0; legacy factory shapes and current cache contract compile without DOM/Node typings |
| Guarded no-browser-global root import / metadata observation | Exit0; NOT_PERFORMED,126/134/0 root names |
| TypeScript checker vs frozen baseline declarations |70 legacy Render +134 Editor unchanged;56 Render additions, no removals |
| Whole-phase protected-file comparison | No Engine/Server/Editor src/Client src/manifests/lock/pins/rules/CI diff |
| git diff --cached --check | Exit0 |

No failed/unconfigured final project build. Existing Windows Harness DEP0190 warning
is non-failing. An initial optional compile command unnecessarily selected absent
Node typings; corrected to explicit types[] without installing any dependency.
CI reconstructs exact pinned foundations, installs the lockfile,
checks architecture and builds all five independently plus forced workspace build;
it does not run the optional browser/manual behavior or establish display.
Generated builds and audit scripts/diff/logs remain local/ignored, not production
packages. All final-head result URLs/SHA are independently checked in PR7 ledger.

## Manual evidence and remaining limits

No new runtime/manual experiment at closure. The audit consolidates actual finite
observations in v0.7.1–13, with source/stage/limits in the closure matrix. Real
Wound_7/Attack1_0 TPSheets (2pages/11frames), original PNG SHA256s/offline dimensions,
official exporter conversion, exact frame0050 geometry, missing/stale frame/source,
bounded source/decode/parser failures and some pending-source coordination paths
are evidenced. Originals remain outside Git; only original CC0 2x2 PNG is committed.
No invented TPSheet or mock native decoder/context was used.

The supported parser is restricted unity-tpsheet-40300-rect, not all TPSheet variants.
Metadata parsing and numerical geometry are observed; **TPSHEET_VISUAL_NOT_VERIFIED**.
Browser **NOT_EXECUTED** in the recorded phase observations. Successful native PNG
decode/upload, live CPU/GPU cache reuse, independent native cleanup, two-session
survival/context loss, A/B replacement and actual image/frame display remain
**NOT_VERIFIED**. VL19's implementation exists, but its working visual MVP acceptance
is open. Counters, submission receipts, offline PNG decode and BUILD_PASS cannot
close that evidence gap. No performance, total-memory or leak-free claim.

No mandatory architecture dependency blocker found; review readiness is permitted
with explicitly pending manual evidence by the supplied task. Developer alone
decides functional/visual acceptance, merge and next Phase8 work. Follow the
[existing manual runbook](../../runtime-render/manual/visual-resource-mvp.md).
No merge/tag/release/publish or next-phase implementation is part of this closure.
