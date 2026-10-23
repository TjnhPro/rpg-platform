# v0.7.0 — Visual Resource Loading architecture and foundation

VL01/VL02. **API_DESIGN_ONLY / READY_FOR_NEXT_CHECKPOINT / BUILD_PASS**.
**FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED / TPSHEET_NOT_VERIFIED**.
This checkpoint delivers design/audit evidence, not an implemented loader.

## Preflight, baseline and authorized scope

Starting main/HEAD and fetched origin/main:
`33c9da5ac79cfce27043927fe5d7e08e3bd6d02c`, Phase 6 merge PR6.
Phase 6 code/checkpoints and Phase 2 authored contracts exist in this baseline.
Phase 6 merge was Developer-authorized with runtime verification deferred; no
functional/visual acceptance is inferred. No open PR existed when preflight ran.
Created branch `feat/visual-resource-loading-v0.7` from this synchronized main.
One phase/branch/PR; this is its first checkpoint. Exact checkpoint SHA and push/PR
CI links are recorded in the PR ledger after push rather than self-embedded here.

Primary owner **runtime-render**: proposed loading/resource lifetime contract.
Editor/Client are consumer-impact audit collaborators only; neither source changes.
Harness contributes this required checkpoint evidence; no checker/rule/config or
existing Harness document is changed. No concrete import/dependency gap requiring
a new guard was found. No production public contract is added or changed. No
external L1/L2 API is needed. Engine/Server/L1/L2 remain untouched.

Read root/project AGENTS, ARCHITECTURE, FOUNDATION, Harness CONTRACTS/OWNERSHIP/
WORKFLOW/VERIFICATION; audited actual root/source/declarations/manifests/lockfile,
manual hosts, asset resolution and native backend. A pre-existing untracked
`.mcp.json` is unread, unchanged and excluded. All other initial tracked files were
clean. Local compiler/export scripts and emitted artifacts stay ignored.

## Delivered files and decisions

- [Task](../../runtime-render/docs/tasks/visual-loading-v0.7.0.md): supplied v0.7.0
  task preserved as the implementable scope for this checkpoint, no later task.
- [Ownership decision record](../../runtime-render/docs/visual-loading-v0.7.0.md):
  existing/missing API matrix; separate authored/descriptor/bytes/decode/atlas/GPU/
  lease layers; cache/lifetime diagram; authorization/revision/options key
  principles; failure/compatibility matrix and cleanup ordering; proposed VL03–20
  allocation across v0.7.1–14; missing real-input gates and manual MVP proof plan.
- [Complete public API inventory](../../runtime-render/docs/public-api-baseline-v0.7.0.md):
  all root exports, actual full compact signatures/declarations, exact-baseline
  source links and SHA-256 hashes of contributing emitted declarations.
- This report: evidence, gate results and next-checkpoint constraints.

No empty interface/class, PNG loader, texture cache, atlas parser, worker, asset
server, renderer, public API, dependency or gameplay feature added. Existing
prepareVisualResource remains synchronous metadata-only, resourceLoading
NOT_PERFORMED. Resource source authorization never derives from a relative locator.
Authored opaque subresourceId and Editor SUBRESOURCE_NOT_SUPPORTED remain unchanged.
Future visual frame resolution belongs to Render, not a silently altered catalog.

Public delta **zero**: Render70, Editor134, Client0. Package exports remain root-only;
five independent projects/builds. Render -> Three only; Editor/Client -> Engine and
Render roots; Server -> Engine without graphics requirement. No sixth package or
reverse dependency. Pins unchanged: L1 core2.0.0
`04b7239f998c3c688a0dfa3202f11811a9acd775`; L2 gameplay0.15.2
`acea332aa80f67552192a72b30f81c0bbbfc56bd`.

Installed Three0.186.1/@types0.186.0 and TS6.0.3 were checked in lockfile and
installed source. Texture disposal is distinct from CPU ImageBitmap ownership;
renderer-scoped native caches do not provide application leases or permission.
Local Three Texture/WebGLTextures/WebGLRenderer and Platform cleanup were audited,
alongside official r186/disposal documentation, Addressables3.1 release ownership
and Godot4.5 cache modes. Links and exact scope of those references are in the
decision record; no engine/framework code or policy was copied.

## Verification — 2026-10-23

| Actual command / inspection | Exit / observed result |
| --- | --- |
| `node harness/cli.mjs check` | 0; ARCH_CHECK_PASS, 78 JS/TS files |
| `node harness/cli.mjs scope --projects runtime-render,editor,game-client --allow-infra` | 0; SCOPE_PASS5: four checkpoint documentation files plus excluded pre-existing .mcp.json |
| `node harness/cli.mjs verify --projects runtime-render,editor,game-client --with-consumers` | 0; BUILD_PASS Render, Editor, Client and referenced dependencies |
| `npm run build -- --force` | 0; BUILD_PASS all five projects/workspace |
| `npx tsc -p .artifacts/vl01-consumer-tsconfig.json` | 0; strict noEmit NodeNext ES2022/types[] root consumer compiles current descriptor, preparation/adapter/reference/session-disposal contracts without DOM lib |
| Node imports Render/Editor/Client roots | 0; HEADLESS_PUBLIC_ROOT_IMPORT_PASS; not graphics execution |
| TS checker public-root declaration enumeration | 0; Render70/Editor134/Client0; complete inventory generated from actual declarations |
| Tracked PNG/TPSheet/atlas sample inventory | No files found; no actual source/format sample supplied |
| `git diff --check` / staged diff check | 0; PASS |

No failed/unconfigured project builds; existing Harness DEP0190 is non-failing.
No automated tests, runner, assertion consumer, browser suite, coverage or runtime
CI introduced. Consumer compilation is type evidence only; no decode, frame,
upload, cleanup, native loss or displayed PNG was observed. Existing Phase 6 manual
verification remains deferred, not silently closed by this design checkpoint.

## Acceptance boundary and handoff

- [x] Decision record precedes any production loader/API change.
- [x] Full root API/signature/owner/consumer inventory and existing/missing matrix.
- [x] Ownership/cache lifecycle diagram, failure matrix, VL03–20 allocation and
  no-framework MVP proof plan.
- [x] DESIGN_ONLY separated from implemented source; no speculative Harness guard.
- [x] Genuine build/static/consumer compilation gates, exact source baseline.
- [ ] Real PNG/metadata and TPSheet producer sample/spec for dependent loading tasks.
- [ ] Host-authorized source-provider contract with ownership, revisions/limits.
- [ ] Actual decoder/atlas/upload/lease implementation and manual runtime evidence.

The last three items are **future implementation input/evidence gaps**, not a
missing prerequisite for this design-only milestone. No architecture blocker to
v0.7.0 was found. Do not fabricate format/parser support, select unauthorized
filesystem/URL behavior or add an alternative renderer to bypass those gaps.
The VL03–20 allocation is a proposal, not a substitute for subsequent task scope.
No v0.7.1 task was supplied; no implementation for it is bundled here. Continue on
the same branch/PR when its scoped task/input is available; no per-checkpoint
review required. No merge, release, publish or Phase 7 acceptance is authorized.
