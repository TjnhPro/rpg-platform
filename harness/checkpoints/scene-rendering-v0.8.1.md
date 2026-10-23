# v0.8.1 — SR02 Runtime Visual Scene lifecycle

Outcome: **READY_FOR_NEXT_CHECKPOINT** for scoped implementation, build and static
architecture prerequisites. **FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED**.
No browser execution or Developer acceptance is claimed.

## Preflight / ownership / API delta

Starting HEAD: `33bd7124bb0d0520023c940619b54386604f1f04`, branch
`feat/scene-rendering-v0.8`, existing draft PR #8. Fetched main remains
`ffb347140fbe6bf432bb8fe33c7057bed9a93941`; the task's older Phase 6 assumptions
were superseded by the merged Phase 6/7 baseline audited in SR01.
Tracked checkout was clean. Pre-existing unrelated untracked `.mcp.json` is
untouched and excluded from staging.

Read root AGENTS/ARCHITECTURE/FOUNDATION, Harness OWNERSHIP/CONTRACTS/WORKFLOW/
VERIFICATION/FAILURES, Render/Editor/Client AGENTS, compiler configurations,
public roots/declarations, actual graphics, resource, spatial, authored-scene and
client implementations. Canonical primary owner is **runtime-render**: an empty
runtime presentation scope attached to one living graphics session. Editor and
Client are compatibility consumers, built but not source-edited. Harness records
ownership and contract evidence. Engine, Server and upstream foundations are
unchanged. Supplied SR02 explicitly authorizes this additive contract.

Public root adds exactly four names: `createRenderVisualScene`, `RenderVisualScene`,
`RenderVisualSceneSnapshot`, `RenderVisualSceneDisposal`. Existing signatures and
dependency directions remain unchanged. Rebuilt symbol counts:
**Render130 / Editor134 / Client0**, previously 126/134/0.
No DOM, Three or native backend object appears in the new declarations.

Phase 6 canonical session acquisition, terminal listeners and before-backend
cleanup exist in actual source. Phase 7 texture lease/release and atlas frame
APIs remain implemented, though SR02 allocates none. Reuses private owner-local
`requireTextureSession`/`onTextureSessionEnd`; no new renderer, acquisition path,
cache or public private-subpath import. Frozen Core2.0.0
`04b7239f998c3c688a0dfa3202f11811a9acd775` and Gameplay0.15.2
`acea332aa80f67552192a72b30f81c0bbbfc56bd` receive no new usage or edits.
Three0.186.1/types0.186.0 stay as audited against official docs/installed source
in SR01; SR02 introduces no native/Three API calls or asset bytes.

## Reviewable delta and decisions

- `runtime-render/src/visual-scene.ts`: canonical admission, fresh runtime identity,
  immutable observations, empty clear, typed idempotent disposal and session-end
  cascade. One active scope per session; second active admission rejects.
- `runtime-render/src/index.ts`: the four additive root exports.
- `runtime-render/manual/visual-scene-lifecycle.mts`: optional finite public-root
  consumer with two actual host bindings; no assertions/fakes/runner/auto-execution.
- `runtime-render/docs/tasks/scene-rendering-v0.8.1.md`: supplied version task,
  normalized LF and trailing whitespace only.
- `runtime-render/docs/scene-rendering-v0.8.1.md`: full contract, decision table,
  portable compile command, optional browser instructions and evidence limits.
- `runtime-render/AGENTS.md`, `harness/OWNERSHIP.md`, `harness/CONTRACTS.md`:
  ownership/lifecycle documentation; this report records checkpoint evidence.

Snapshot contains only symbols and logical state. The closure environment drops
the session-retaining detach callback on terminal; this is source-level retention
analysis, not a measured GC/GPU leak claim. First terminal reason wins. Existing
session broadcast closes scenes before backend cleanup, including loss/failure;
it does not confer successful native cleanup. Detached history stays historical.
Methods bind to their closure, cannot be retargeted across sessions, and accept no
foreign scene/session pair. Empty clear owns nothing to release, never touches
cache/other scopes, and rejects after terminal. Scene disposal never disposes the
borrowed session or host canvas; a live session can create a fresh scope afterward.

Rejected: allocating another native Scene/renderer, process-wide scene registry,
implicit same-session switch, structural fake sessions, replacing session.dispose,
generic lifecycle framework, metadata-based GPU readiness/cleanup claims.
Rollback removes the additive exports/module/consumer and accompanying docs;
there is no persisted-data migration. Future resource-owning instances must add
their own cleanup through this lifetime without weakening Phase 6/7 semantics.

## Executed verification

| Command / observation | Observed result |
| --- | --- |
| `npm run build --workspace runtime-render` | exit 0 |
| `node harness/cli.mjs check` | exit 0; ARCH_CHECK_PASS, 111 JS/TS files |
| `node harness/cli.mjs scope --projects runtime-render,editor,game-client --allow-infra` | exit 0; SCOPE_PASS; includes unrelated pre-existing `.mcp.json` in scanner output only |
| `node harness/cli.mjs verify --projects runtime-render,editor,game-client --with-consumers` | exit 0; actual Render, Editor, Client package builds PASS |
| `npm run build -- --force` | exit 0; forced genuine five-project workspace build PASS |
| Portable consumer compiler, exact command in contract/runbook | exit 0; ES2022 only, strict, isolated empty typeRoots, skipLibCheck false |
| Isolated equivalent config with types: [] | exit 0; public-root consumer compile |
| TypeScript checker over rebuilt root declarations | exit 0; 130/134/0 exported symbols |

An initial PowerShell CLI attempt passing an empty `--types` argument failed with
TS6044; corrected to an isolated config and the reproducible empty-typeRoots
command, both successful. This was compiler invocation syntax, not a source/build
failure. Harness emits existing Node DEP0190 about child-process shell invocation;
its build gate exits 0. No failed/unconfigured project build was observed.
No tests, fake fixtures, browser automation, runtime matrix or dependencies added.
Static checking proves import boundaries only; compile proves compatibility only.

Scoped staging excludes `.mcp.json`, node_modules, dist and ignored `.artifacts`.
Exact commit and matching push/PR CI URLs are recorded in the single PR ledger
after push, avoiding a self-referential commit SHA. Remote success is checked
separately, never inferred from local builds.

## Evidence limits / next handoff

The public-root manual consumer compiles without Editor or ambient DOM types;
its two-session observations, duplicate rejection, clear, historical snapshots,
fresh identity and terminal cascade have **NOT_EXECUTED** in a browser here.
No rendered frame, GPU cleanup success, native loss observation or leak-free
behavior is claimed. These remain Developer-owned manual verification.
Inherited TPSHEET_METADATA_OBSERVED / TPSHEET_VISUAL_NOT_VERIFIED applies only to
the prior Unity40300 metadata evidence; no sample was decoded/displayed here.

Exactly five projects remain. No instance, PNG load, ordering, camera, frame
algorithm, Editor/Client feature, gameplay or protocol implementation is added.
No genuine dependency/ownership blocker for this empty lifecycle was found.
Readiness is scoped architectural/build readiness, not MVP acceptance.
The v0.8.2 task has not been supplied; no next-version scope is invented.
Continue its authorized checkpoint when supplied without intermediate approval.
No merge, main edit, tag, release, package publication or other PR edit.
