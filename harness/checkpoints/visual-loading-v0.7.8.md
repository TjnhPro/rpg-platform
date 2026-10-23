# v0.7.8 — VL11 In-flight Load Deduplication

Status: **READY_FOR_NEXT_CHECKPOINT / BUILD_PASS**.
**SOURCE_FLOW_OBSERVED / FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED**.

## Baseline and ownership

Starting HEAD `14edc5212c2d48576bab65139247a7c12b8b66c6` (v0.7.7), branch
`feat/visual-resource-loading-v0.7`, existing draft [PR7](https://github.com/TjnhPro/rpg-platform/pull/7).
Main baseline `33c9da5ac79cfce27043927fe5d7e08e3bd6d02c`.
Previous exact-head push [SUCCESS](https://github.com/TjnhPro/rpg-platform/actions/runs/39909807459)
and PR [SUCCESS](https://github.com/TjnhPro/rpg-platform/actions/runs/39909812719).
Supplied [task](../../runtime-render/docs/tasks/visual-loading-v0.7.8.md) authorizes
this additive checkpoint without another per-version review gate. Build/CI does
not establish formal Developer acceptance. Pre-existing untracked `.mcp.json`
remains unread/unmodified/excluded.

Read root/relevant project guidance, Architecture/Foundation, Harness ownership,
contracts/workflow/verification and current source/public APIs. Audited existing
provider authority, coherent revisioned source bytes, source/decode lifecycle,
bitmap borrowing, upload/session disposal and atlas geometry. Three0.186.1 and
@types0.186.0 unchanged; no manifest/lock/dependency changes or L1/L2 API use.

Runtime Render is the primary coordination/decoded-resource owner. Editor touched
only for an optional finite public-root manual consumer; Client compile consumer.
No production Editor/Client/Engine/Server, L1/L2, authored schema, checker or CI
changes. Exactly five projects; no import-direction or ownership move.

Eleven scoped paths:

- Render `src/png-load-scope.ts`, `src/png-image.ts`, `src/index.ts`.
- Render `docs/visual-loading-v0.7.8.md`, `docs/tasks/visual-loading-v0.7.8.md`.
- Editor `manual/inflight-png.mts`, `manual/inflight-png-node.mjs`,
  `manual/inflight-png.html`, `manual/inflight-png.md`, `manual/README.md`.
- This checkpoint.

## Exact public delta and lifecycle

Four additive root symbols: `createPngLoadScope`, `PngLoadScope`, `SharedPngLoad`,
`SharedPngLoadSnapshot`. Render111 ->115; Editor134/Client0 unchanged. Existing
signatures remain; standalone source/decode factories retain independent ownership.
Existing PNG budget validation reused internally, not added to root exports.

Each caller-owned scope captures one provider authority/read method and maintains
only pending jobs. Key includes full validated descriptor, image source index,
explicit expected revision, bounded decode limits and fixed native decode profile.
Different provider instances/auth scopes, revisions or options never join. Observed
source revision mismatch fails before decode. Unknown mutable revisions require
host resolution rather than path-only sharing. No global or settled cache.

Each acquire returns an independent waiter/result and, on successful decode, an
independently releasable canonical image capability over the shared bitmap. Release
one does not release remaining owners; last release closes through existing decoder
semantics. Failure evicts before fanout; retry creates new work. Old canceled
completion cannot evict a replacement job. Source bytes released after decode.

Pending release resolves immediately. Last release abandons native/source work;
provider has no abort port, so actual host IO may finish and late results are not
adopted. Scope dispose closes acquisition and releases pending waiters; settled CPU
owners remain caller-owned. No session/upload operation is scheduled here. Hosts
release their waiter on session disposal; existing upload rejects disposed sessions
before bitmap borrowing. No cross-context GPU sharing or implicit late upload.
Full constraints and ownership semantics are in the contract document.

## Finite manual observations

Read-only original committed CC0 sample `editor/manual/png-sample/rgba-2x2.png`,
76 bytes, 2x2, SHA256
`e9aa41812d69aa8ebbee3fb351fede258f2a159c4a547b3187ee54184dea0b79`.
Host uses fixed authorized file, bounded4096-byte read, unchanged file metadata and
actual hash revision. Separate bootstrap read establishes expected revision.

Observed Node24.18.0 public-root trace (no fake native decoder):

- Three matching pending waiters dispatched one provider read. First release
  resolved released immediately; two survivors reached decode admission and both
  reported DECODER_UNAVAILABLE. Source sharing/failure fanout observed; successful
  shared native decode was NOT observed.
- Same key after settlement dispatched another read (1 ->2), no settled reuse.
- Different budgets/revision dispatched three reads on first provider; another
  provider dispatched one independent read. Wrong revision ->REVISION_MISMATCH.
- Two waiters rejected with the same original explicit host Error; snapshots were
  failed/failure:null. Retry dispatched a second read and reached decode admission.
- All abandoned waiters settled before host completion. Replacement plus joining
  waiter remained shared after late old rejection; two reads across old/new jobs.
- Scope disposal released pending waiter; late real host IO completed without a
  new owner. Ten actual file reads total including bootstrap/late canceled read.

Human-inspected finite observations, no assertions, suites or performance claim.
Optional browser native-decoder counter delegates unchanged and restores finally;
browser entry supplied but NOT_EXECUTED. Available Computer Use inventory had
apps[]/browsers[], and Node lacks createImageBitmap. No mock decoder/GPU introduced.

## Required gates

Final commands exit0:

| Command/gate | Result |
| --- | --- |
| `npm run build --workspace runtime-render` | BUILD_PASS |
| `node harness/cli.mjs check` | ARCH_CHECK_PASS99 source files |
| `node harness/cli.mjs scope --projects runtime-render,editor,game-client --allow-infra` | SCOPE_PASS12 (11 scoped paths + excluded .mcp.json) |
| `node harness/cli.mjs verify --projects runtime-render,editor,game-client --with-consumers` | Render/Editor/Client independent BUILD_PASS |
| `npm run build -- --force` | All-five workspace BUILD_PASS |
| Strict optional manual consumer compile | PASS |
| Strict ES2022/types[]/skipLibCheck:false four-symbol consumer | PASS |
| Root import with throwing browser-global getters | PASS; prepare NOT_PERFORMED |
| Explicit finite Node file-backed consumer | Exit0; observations above |
| `git diff --cached --check` | PASS |

Initial local implicit-parameter compile error corrected before final builds.
No failed/unconfigured final build. Existing Windows DEP0190 warning is non-failing.
No testcase, runner, browser automation or historical exhaustive suite added/run.
Exact committed SHA and push/PR CI links appended to PR7 after push.

Successful shared native decode, independent uploadable aliases, bitmap last-close/
late-close failure and real GPU session-disposal timing remain NOT_OBSERVED.
No sprite display, TPSheet visual observation, benchmark, leak-free or full feature
claim. Prior atlas metadata/geometry unchanged; no new TPSheet verification here.
No architecture blocker observed. Developer owns functional/visual acceptance.
No merge/release/publish or v0.7.9 implementation included.
