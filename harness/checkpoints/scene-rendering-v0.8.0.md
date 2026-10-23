# v0.8.0 — SR01 Scene Rendering architecture checkpoint

Outcome: **API_DESIGN_ONLY / READY_FOR_NEXT_CHECKPOINT** for the scoped
architecture work. **FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED**. Developer
acceptance of the phase/MVP is not claimed.

## Preflight and authorized scope

- Initial checkout: `feat/visual-resource-loading-v0.7` at
  `63df7e743f004100085a0fc131ab7408e9dc91d5`; tracked worktree clean. The existing
  untracked `.mcp.json` is unrelated, left untouched and excluded from the commit.
- Fresh fetched main/base: `ffb347140fbe6bf432bb8fe33c7057bed9a93941`.
  PR #7 is MERGED (2026-10-23T09:21:08Z), no open PR at preflight. New branch
  `feat/scene-rendering-v0.8` starts at that base; no main or older PR edits.
- Actual Phase 6 merge: `33c9da5ac79cfce27043927fe5d7e08e3bd6d02c`; actual Phase 7
  production endpoint: `8e43b40df3375559e703d416109b48e6360ccf48`. The task's
  historical main/PR6 assumptions no longer describe repository reality.
- Read root AGENTS, ARCHITECTURE, FOUNDATION; Harness CONTRACTS, OWNERSHIP,
  WORKFLOW, VERIFICATION, FAILURES; Render/Editor/Client AGENTS, actual roots,
  manifests, compiler settings, emitted declarations and relevant implementations.
  Route command suggested Render only; source ownership is the deciding evidence.
- Requested behavior: document the actual authored-to-live presentation boundary,
  graphics/resource lifetime and minimum future integration seams. Canonical primary
  owner: **runtime-render**. Editor supplies authored data/adapters; Client supplies
  independent presentation/host policy. They are audited/built, not source-edited.
  Harness records evidence only. No Engine/Server or upstream L1/L2 changes.
- Public contract delta: **zero names/signatures changed, added or removed**.
  No new DTO, implementation, dependency or consumer migration is introduced.
  Existing root-only consumers compile; no speculative consumer for nonexistent API.

## Reviewable file delta

| File | Purpose / owner |
| --- | --- |
| [Supplied task](../../runtime-render/docs/tasks/scene-rendering-v0.8.0.md) | Independent version task, content preserved with LF/trailing-space normalization; Render |
| [Architecture and compatibility matrix](../../runtime-render/docs/scene-rendering-v0.8.0.md) | Actual source map, four scene domains, identity/lifetime/resource decisions, MVP limits, rejected alternatives and future seams; Render |
| This report | Checkpoint evidence; Harness tooling |

Exactly five projects remain. No runtime source, historical checkpoint, manual
example, package manifest, lockfile, CI workflow, test or asset is changed.
Rollback is removal/revert of this documentation-only checkpoint.

## Dependency / public API findings

Phase 6 canonical acquisition, resize/suspension, demand, submitted frame receipt,
terminal cleanup/quarantine are actual implementations. Phase 7 provider/decode/
cache acquisition, independent texture rights, same-session validation, revision
admission, release and atlas resolution/view are actual APIs, not roadmap shims.
Their exact source contracts and missing capabilities are listed in the design
matrix. Current emitted roots: **Render126 / Editor134 / Client0** (TypeScript
symbol enumeration over rebuilt root declarations). No private emitted export
becomes a supported package subpath.

Important compatibility limits:

- `renderFrame()` still submits an empty private scene. The resource demo exposes
  one-shot central-quad submission. Neither supplies a retained visual scene or instance.
- `AtlasTextureView` borrows an image right; there is no standalone frame lease or
  retain API. A future instance needs a dedicated Phase 7 acquisition right.
- Texture allocation is private native WebGL, not `THREE.Texture`. Future native
  scene/material integration must prove a supported reuse seam; casting handles,
  second uploads/caches or private Three internals are not approved shortcuts.
- Editor's authored subresource resolver remains unsupported; atlas selection
  needs explicit Render frame resolution. Authored layers/attachments remain
  uninterpreted and Document content/dirty state stays outside presentation.

Decisions: one active visual scene per graphics session; isolated sessions;
identity-preserving update; distinct hidden/removed/disposed; candidate rollback
and per-consumer release; canonical Phase 4 math and Phase 6 admission; explicit
layer/sort policy and stable ties. No DTO/signature is frozen for later milestones.
Rejected: Editor/Client duplicate renderer/math, authored-ID handles, global registry,
parallel loader/cache, implicit Y/depth, early ECS/camera/animation/gameplay scope.

Locked Three0.186.1/types0.186.0 were compared with installed source and official
r186/current documentation. No upgrade is required. Core2.0.0
`04b7239f998c3c688a0dfa3202f11811a9acd775` and Gameplay0.15.2
`acea332aa80f67552192a72b30f81c0bbbfc56bd` stay frozen; no new upstream API usage.

## Executed verification

| Command / observation | Exit / result |
| --- | --- |
| `node harness/cli.mjs check` | 0; ARCH_CHECK_PASS, 109 source files |
| `node harness/cli.mjs scope --projects runtime-render,editor,game-client --allow-infra` | 0; SCOPE_PASS, 4 paths: three checkpoint documents plus pre-existing unrelated `.mcp.json` |
| `node harness/cli.mjs verify --projects runtime-render,editor,game-client --with-consumers` | 0; actual Render, Editor, Client package builds PASS |
| `npm run build -- --force` | 0; genuine five-project TypeScript build PASS |
| `npx tsc -p .artifacts/closure-portable-tsconfig.json` | 0; existing ignored public-root consumer compile, ES2022 without DOM libs; metadata/graphics/cache legacy shapes |
| TypeScript checker export enumeration | 0; rebuilt declarations 126/134/0 |
| CC0 sample SHA256 observation | 0; e9aa41812d69aa8ebbee3fb351fede258f2a159c4a547b3187ee54184dea0b79 matches committed provenance |

Harness verification emitted Node DEP0190 about its existing child-process shell
invocation; exit remained 0. No tooling/dependency change is justified by this
documentation checkpoint. No unconfigured/failed project build was observed.

Scoped staging includes only the three documents listed above. `git diff --cached
--check` exited 0; no whitespace errors. Production source/manifests/lockfile diff
against the starting base is empty.
The exact checkpoint commit, single Phase 8 PR and matching push/PR workflow URLs
are attached to the PR ledger after push, avoiding a self-referential commit SHA.
Remote CI is not inferred from local success.

## Evidence limits / handoff

No new browser/GPU/manual runtime execution. Definition capture, instance creation,
GPU-ready resource, submitted frame and visually observed output remain different
stages. Scene/instance operations here are design obligations, not implemented
features. Previous Phase 6/7 native-browser visual gaps remain open and do not block
this design-only checkpoint under the supplied task.

Phase 7's actual TPSheet parsing/geometry evidence is inherited, not re-executed:
TPSHEET_METADATA_OBSERVED / TPSHEET_VISUAL_NOT_VERIFIED for Unity40300 rectangles
only. External original assets are not copied; redistribution rights unestablished.
Committed CC0 PNG provenance/hash was rechecked, without decoding/display claims.

No genuine missing upstream dependency or ownership/dependency-direction conflict
blocks SR01. Material/texture integration, exact future resource handoff/signatures
and supported sort/alpha profile remain implementation decisions requiring their
concrete consumer checkpoint evidence. Stop if those tasks demand private imports,
another renderer/cache, silent loss/use-after-release or changed ownership.

READY_FOR_NEXT_CHECKPOINT is architectural readiness only. The current supplied
task defines **v0.8.0 only**; v0.8.1's task contents have not been supplied in this
session. Do not invent its implementation or fold another milestone into SR01.
No intermediate review permission is needed to execute a supplied next task.
No merge/tag/release/publish is performed.
