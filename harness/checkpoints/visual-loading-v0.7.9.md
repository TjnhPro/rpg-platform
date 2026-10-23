# v0.7.9 — VL12/VL13/VL14 Resource Caching & Acquire/Release

Status: **READY_FOR_NEXT_CHECKPOINT / BUILD_PASS**.
**FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED**.

## Starting state and approved scope

Starting HEAD `87eea780f6dbe44df94310a484a4865651aff7be` (v0.7.8), branch
`feat/visual-resource-loading-v0.7`, existing draft [PR7](https://github.com/TjnhPro/rpg-platform/pull/7).
Main `33c9da5ac79cfce27043927fe5d7e08e3bd6d02c`.
Prior exact-head push [SUCCESS](https://github.com/TjnhPro/rpg-platform/actions/runs/39911297251)
and PR [SUCCESS](https://github.com/TjnhPro/rpg-platform/actions/runs/39911301668)
verified before implementation. Worktree had only pre-existing untracked
`.mcp.json`, left unread/unmodified/excluded. Supplied
[task](../../runtime-render/docs/tasks/visual-loading-v0.7.9.md) authorizes this
additive contract without another per-version review gate. Formal Developer phase
acceptance is not implied by this checkpoint or prior implementation/CI.

Preflight read root/project guidance, Architecture/Foundation, Harness ownership,
contracts/workflow/verification, actual package-root/source/emitted contracts,
existing provider/source/decode/pending/texture/session lifecycle, Three backend,
Editor asset adapter/reference/manual hosts and Client root/host/manifests.
Runtime Render is the sole cache/resource owner; Editor adds optional manual
root consumer only, Client is compile consumer. No production Editor/Client,
Engine/Server, L1/L2, schema, dependencies/manifests/lockfile or checker/CI changes.
Exactly five projects; ownership and dependency directions unchanged.

Eleven scoped paths:

- Render `src/visual-resource-cache.ts`, `src/render-texture.ts`,
  `src/frame-session.ts`, `src/index.ts`.
- Render `docs/visual-loading-v0.7.9.md`, `docs/tasks/visual-loading-v0.7.9.md`.
- Editor `manual/resource-cache.mts`, `manual/resource-cache.html`,
  `manual/resource-cache.md`, `manual/README.md`.
- This checkpoint.

## Implementation and exact public delta

Six additive root symbols: `createVisualResourceCache`, `ResourceCacheLimits`,
`VisualResourceCache`, `VisualResourceCacheSnapshot`, `VisualResourceLease`,
`VisualResourceLeaseSnapshot`. Render115 ->121, Editor134/Client0 unchanged.
Prior public signatures retained; v0.7.8 remains pending-only. New CPU cache
composes it and the existing canonical upload instead of copying loaders/backend.

CPU keys include fixed provider scope, complete descriptor, source index, expected
revision and decode limits/profile. GPU entries add canonical session and texture
options. Settled cache hit uses the same live allocation with fresh independent
opaque capabilities. Leases/texture aliases release the same usage right once;
resourceId exposes only allocation identity, never Three/native handles.

Zero GPU leases immediately retires that entry and releases its native texture;
zero CPU rights retires decode and closes bitmap. No idle retention, TTL/LRU,
prefetch or eviction of valid owners. Explicit CPU/GPU entry admission bounds,
existing per-image budgets and safe operation counts documented. These count
ownership/attempts, not bytes/performance or GPU memory reclamation.

Package-private canonical terminal subscription revokes pending/usable leases
before backend teardown, drains all cleanup and forwards failure to existing
session diagnostics/quarantine. Other-session CPU/GPU owners survive. Deferred
CPU dispatch registers ownership before reentrant host IO. Closed entries cannot
upload/resurrect; providers without abort support may finish discarded late IO.
Original unexpected errors reject still-pending results; session invalidation can
already settle a result during upload failure, in which case canonical viewport
failure/cleanup observations remain the diagnostic source. No result is rewritten.

Three0.186.1/@types0.186.0 unchanged. Audit found existing direct native texture
upload, not THREE.Texture allocation. Retained deleteTexture/resource lifetime
and renderer.dispose; no invented texture.dispose migration. Official
[Three disposal guidance](https://threejs.org/manual/pages/how-to-dispose-of-objects.html)
confirms texture and ImageBitmap cleanup have separate ownership. No competing
renderer, gameplay, Scene instance, authored catalog or L1/L2 change.

## Actual observations and evidence gaps

Finite manually invoked Node public-root observation:

- New cache active with zero CPU/GPU entries/leases/operations.
- Foreign noncanonical session ->TypeError before input/provider read; providerReads0.
- maxCpuEntries0 ->TypeError with documented limits.
- Repeated empty cache dispose leaves disposed/zero counts; acquire then rejects.
- Native createImageBitmap undefined. No fake decoder/context/session installed.

These are admission/empty-lifecycle observations, NOT cache reuse or native cleanup
proof. Optional browser manual consumer compiled and supplied, but NOT_EXECUTED:
100 acquisitions in session A, later B CPU hit/separate GPU, one/double/final lease
release, live A disposal/B survival, disposed-A rejection and pending C disposal
before real late source completion. No observed 100 usable references, shared
successful decode/upload, last bitmap close, native deletion, cross-session runtime
survival or display claim. A source counter/native/GPU receipt is not a sprite.

Manual host uses original committed CC0 png-sample/rgba-2x2.png,76 bytes,2x2,
SHA256 `e9aa41812d69aa8ebbee3fb351fede258f2a159c4a547b3187ee54184dea0b79`,
fixed authorized bounded URL/hash host. No proprietary source changes or redistribution.
Existing TPSheet parser/geometry unchanged; no new TPSheet verification in this task.

## Commands and results

Final commands exit0:

| Gate | Observed result |
| --- | --- |
| `npm run build --workspace runtime-render` | BUILD_PASS |
| `node harness/cli.mjs check` | ARCH_CHECK_PASS101 JS/TS files |
| `node harness/cli.mjs scope --projects runtime-render,editor,game-client --allow-infra` | SCOPE_PASS12 (11 scoped paths + excluded .mcp.json) |
| `node harness/cli.mjs verify --projects runtime-render,editor,game-client --with-consumers` | Render/Editor/Client independent BUILD_PASS |
| `npm run build -- --force` | All-five workspace BUILD_PASS |
| Strict optional manual consumer compile | PASS |
| Strict six-symbol ES2022/types[]/skipLibCheck:false root consumer | PASS |
| Root import with throwing browser-global getters | PASS; metadata NOT_PERFORMED |
| Finite Node admission observation | Exit0, limits above |
| `git diff --cached --check` | PASS |

Initial optional demo compile rejected an unsupported host label; removed before
final compile. A local Python encoding read failed and was corrected with explicit
UTF8. No failed/unconfigured final build. Existing Windows DEP0190 warning remains
non-failing. No tests/assertion suites/coverage/browser automation or historical
exhaustive suites created/run. Exact commit SHA and push/PR CI evidence appended
to PR7 after push, not guessed here.

Native/GPU/manual acceptance remains open; no architecture blocker observed.
Developer owns phase acceptance. No merge/release/publish or v0.7.10 work included.
