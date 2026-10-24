# v0.10.8 SA09 — multi-instance playback isolation

**IMPLEMENTED_SHARED_IMMUTABLE_CLIPS / FINITE_LIVE_ISOLATION_OBSERVATIONS.**
No Phase10 MVP_PASS, complete eight-way artwork proof or Developer acceptance.

## Delta preflight

Previous checkpoint/base: `0f099ec203ab5e806a1d0a5fd01aa7605c49fa5c` (SA08).
Main baseline: `78dc4a9d14288df33ca46b3af4d23d09ceef9b82`. Same branch
feat/sprite-directional-animation-v0.10, open Draft
[PR10](https://github.com/TjnhPro/rpg-platform/pull/10). Containing commit SHA and
actual exact-head CI are recorded in that PR ledger after push. Tracked tree was
clean before this checkpoint; preexisting untracked .mcp.json excluded.

Read root/Render/consumer guidance, architecture/foundation and Harness ownership,
contracts/workflow/verification/failures with a delta-focused source/d.ts audit.
Actual source and emitted playback/binding APIs provide separate CPU handles,
SA08 one-playback/instance occupancy, Phase8 exact membership/remove/visibility,
Phase7 retained rights/cache and Phase6 terminal session subscriptions. These
dependencies exist at this HEAD; no substitute subsystem is needed. Route hints
agree with canonical owner **runtime-render**. Editor/Client compile compatibility
only; no source edits there and no external L1/L2 APIs used.

Task authorizes shared definitions and independent lifetimes. The existing
playback factory defensively recaptured even already canonical frozen clips;
this version shares those immutable definitions through an owner-local weak
issuance check. Structural host input still validates/deep-captures. Each handle
keeps its private clip collection, transport, snapshot and transition guard.
Zero public-root additions/removals/signature changes. No persistent schema,
dependencies, build/CI configuration, L1/L2/L3, Engine/Server or owner changes.

Scope: two existing Render source modules, an optional manual public-root host
and walkthrough, API/task docs, this report and Render/Harness guidance. The
manual host is tooling, not a sixth production project or actor manager.
No new cache, renderer, membership registry, timing math or current-actor store.

## Lifetime decisions

The [contract](../../runtime-render/docs/sprite-animation-v0.10.8.md) records
ownership and decisions for pause/hide/select/replace/remove/readiness/dispose/
context loss. Existing snapshot fields supply clipId, directionIndex, elapsedMs,
sampledElapsedMs, frameIndex, frame, state/completed; no duplicate state is added.

Host owns playback and acquired lease; Phase8 owns a distinct retained usage.
The [manual consumer](../../runtime-render/manual/sprite-instance-isolation.mts)
accepts transferred instance/host lease ownership, creates independent playback/
binding and closes through one idempotent path: latch closed, remove, unbind,
dispose playback, release lease. All cleanup stages are attempted through finally;
errors propagate. Failed setup leaves instance/lease with caller. ready has no
loop; host handles rejection and closes. Scene/session/cache are borrowed.

Hide has no implicit timing policy. selectClip resets only that actor to stopped0
for a different declared key. Replacing immutable definitions uses a new playback
and existing replacePlayback seam; old host-owned playback still needs disposal.
Removal/session end closes binding occupancy, not the borrowed CPU handle. Host
close supplies remaining disposal. Late readiness cannot rebind removed exact
handles or an ID-reused registration. Other sessions keep their own GPU rights.

## Actual verification

| Command / audit | Observed result |
| --- | --- |
| node harness/cli.mjs check | exit0, ARCH_CHECK_PASS166 JS/TS sources |
| node harness/cli.mjs scope --projects runtime-render --allow-infra | exit0, SCOPE_PASS; scoped files only committed |
| node harness/cli.mjs verify --projects runtime-render --with-consumers | exit0, genuine Render/Editor/Client BUILD_PASS; no failed/unconfigured project builds |
| npx tsc -p .artifacts/sa09-manual-tsconfig.json | exit0; actual manual .mts consumer emitted, strict ES2022/NodeNext, types:[], lib:ES2022, no DOM |
| node .artifacts/sprite-animation-v0.10.8-public-audit.mjs | exit0; against SA08 emitted Render271/Editor138/Client0 unchanged; zero removed/changed/added root exports |
| git diff --check | exit0 |

Internal capture helper is not a public-root export. Initial optional ad hoc tsc
invocations hit TS5112 (explicit files with current compiler config), then
TS2209/TS2688 (ambiguous root and unavailable node types). The isolated explicit
config above resolved these without adding dependencies or changing project
configuration. Existing Harness Node DEP0190 warning remains nonfatal.
No automated tests, suites, runners, assertions, coverage or matrices added/run.
Exact-head CI follows commit in the PR ledger; previous SA08 CI is not SA09 proof.

## Finite actual-browser observations

Disposable local HTTP host, Chrome through Playwright CLI and the emitted manual
consumer used only Render's public root. Two real640x480 graphics buffers shown
at320x240 CSS, two instances in session0 and another in session1. Explicit manual
commands/deltas/draws, no automated test or scheduler. Read-only original source:
../jx1-manager-editor/data/asset-sources/monster/ani063/Attack1_0.{tpsheet,png}.
Metadata888 bytes SHA256
`fe5c87c2e5cba46b43482080f15f5ed607450bb7e15cc72dff3f515c8969efc7`;
PNG12270 bytes SHA256
`f31783508fe55cc39a421b9f3505503a831d7727605c1f2278e4a690585d3cd2`,128x256.
Real provider/parser/cache/decode/upload paths; no sibling writes or copied art.

Shared canonical clip manual has actual frames0000/0002,125ms repeat and eight
explicit slots repeating that sequence. alternate has250ms timing. This does
not claim eight distinct artwork facings. Right/down world-unit plane, ratios1,
manual numeric grounds(12,50)/(13,49), pivot(12,50), offset0; instance placements
A(110,180), B(210,180), session1(160,180). Authored numeric examples are not artist
or anatomical-foot validation. Source project key sa08 remains just host context.

| INPUT | EXPECTED | OBSERVED |
| --- | --- | --- |
| Same immutable clip/page, separate A/B handles; A50ms paused direction2, B175ms playing direction6 | Independent state, shared page | A frame0000, B0002; same resourceId/sessionId; snapshot frames === respective canonical clip frame objects; CPU1/GPU2/leases6, sourceJobs1/uploads2 |
| Explicit sync/draw | Actual two-instance pixels | Screenshot visibly shows two original sprites in first canvas, third in second |
| Hide paused A; advance each125ms | Visibility separate from state, B progresses | A remains paused50ms/effectiveVisible:false; B300ms/frame0000; leases6, uploads2 unchanged |
| A selectClip alternate, sync/unhide | Only A changes | A stopped0/direction2/alternate; B remains300ms/manual/direction6 |
| close A twice, advance B125ms/sync/draw | B retains valid rights/progress | A disposed/MISSING_INSTANCE; B425ms/frame0002, host lease usable; leases4, uploads2; submitted and inspected screenshot shows B alone in first canvas |
| Real pending page acquisition with matching parsed atlas/clip under pending-atlas resource key | Pending is not success | Lease pending; sync FRAME_NOT_READY; deliberately held original PNG provider result |
| External Phase8 removal of pending instance, reuse ID, then deliver original resource result | Late success cannot revive old or bind new registration | Late host lease usable, old ready BINDING_DISPOSED/MISSING_INSTANCE; new ordinal3 resource null |
| Close pending host twice, remove reused empty instance, close B twice | Final session0 rights drain; session1 survives | CPU1/GPU1/leases2 remain solely for session1; its lease usable and submitted frame |
| New loss-observer actor hidden while playing, explicit25ms | Hide does not pause | playing25ms, visible:false; then explicitly unhidden/synced/drawn |
| Host WEBGL_lose_context extension on canvas0, await native event | Canonical terminal session0, isolated session1 | CONTEXT_LOST/renderFrame, terminal, cleanupFailed:false; actor sync BINDING_DISPOSED; session1 advances125ms/frame0002, lease usable and submitted |
| Close loss host twice and dispose ended session twice | No other-session revocation | Session1 still playing125ms, lease usable, submits; CPU1/GPU1/leases2 |
| Close final actor, drain Scenes/sessions/cache repeatedly | No remaining logical rights | Before cache dispose CPU0/GPU0/leases0; final cache disposed, cleanupFailed:false |
| Fresh page run: dispose live session0 twice, with both A/B still mounted | Clean disposal also isolated | B sync BINDING_DISPOSED; session1 advances175ms/frame0002 with usable lease and submitted receipt; final drain CPU0/GPU0/leases0 |
| Structural mutable clip capture then change host clip key/frame0000->0002 | Preserve defensive capture | Playback remains manual/frame0000; host frame identity differs; canonical issued clip/frame both frozen |

SourceJobs/uploads reached2/4 in the first run because the separate pending
resource was really loaded/uploaded and loss-observer reacquired a page after
the first session's final rights were released. These are explicit acquisitions,
not uploads on frame changes. Native texture handles remain private; allocation
identity/session diagnostics and actual target pixels provide finite evidence.

Local artifacts: .artifacts/sa09-independent.png, sa09-after-remove-a.png and
sa09-browser-observations.txt, inspected/recorded locally, not committed portable
assets. The first browser setup rejected IDs with spaces as INVALID_DESCRIPTOR;
valid opaque IDs were used on reload. The observed final run had no console
errors/warnings. Optional tsc setup and that invalid manual setup are not product
behavior claims. Screenshots supply pixel observations separately from receipts.

NOT_OBSERVED: mounted Editor/Client UI, complete eight-way artwork/ground contact,
camera-bound animation, arbitrary local TRS, native GPU-memory reclamation,
injected cleanup exceptions, browser restoration/reacquisition after context loss,
or large populations/performance. The session labels model separate consumers;
actual Editor/Client applications were built, not mounted in these observations.
Host-close-before-ready latch is source-inspected; the observed delayed case used
external Phase8 removal so that a genuinely usable late result exercised the
canonical binding guard. No all-scenario functional/visual PASS is claimed.

## Handoff

No SA09 dependency/ownership blocker found. v0.10.9 Editor animation consumer
requires its separate task; no speculative implementation here. Complete Phase10
MVP, visual/content and Developer acceptance remain open. No merge/tag/publish/
release. Rollback is this checkpoint commit; no stored-data migration.
