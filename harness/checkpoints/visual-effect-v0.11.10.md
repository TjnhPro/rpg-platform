# v0.11.10 — VE11 Game Client VFX Integration

2026-10-24 Asia/Bangkok. Branch `feat/visual-effect-playback-v0.11`, Draft PR11.
Prior VE10 HEAD `d057e3620e87dd98a2374a6c5a23ac6a03e35d58`; phase main base
`aceea67f95cb309bdd06f1d6193767bfa06f42ce`. Containing commit and exact-head CI
are recorded in PR11 after commit. No merge/tag/release/publication authorized.

## Scope and dependency audit

Primary owner **game-client**: neutral host intent/correlation, request-owned
leases, browser lifecycle and explicit presentation deltas. Render is consumed
through its unchanged public root for all effect/resource/scene/camera semantics.
Runtime Engine's actual root only establishes frozen foundation imports and
exports no gameplay presentation events. This checkpoint uses explicit caller
intent; it does not add an Engine event bus or invent gameplay types.

Read root/Client AGENTS, ARCHITECTURE, FOUNDATION, Harness OWNERSHIP/CONTRACTS/
WORKFLOW/VERIFICATION/FAILURES, VE10, actual Client animation/viewport/manual
source, Engine root and Render effect/sequence/resource/scene/camera contracts.
Route hints listed both Render and Client; behavior ownership selects Client.
No missing prerequisite, upstream delta or owner expansion was found.

Production changes: private `vfx-presentation.ts`, optional `manual-vfx-host.ts`
and four manual entry/server/config files. Documentation: manual runbook and
Harness task/checkpoint/contracts/ownership. Render, Editor, Engine and Server
production unchanged; no L1/L2 calls/edits, dependency/schema/package/CI change.
Preexisting `.mcp.json` excluded. No new renderer/cache/decoder/timeline/clock.

The adapter accepts spawn(effect reference + world/target placement), command,
remove and elapsed intents. Host correlations, definition IDs, issued Render
effect handles and visual membership keys stay separate. All request ownership
is mount-local; no singleton. Each spawn acquires its own canonical cache lease.
Completion/target loss/remove/close reconcile only those rights. Pending removal
invalidates admission before release; stale results cannot revive/rebind, even
after correlation reuse. Host owns target/base lease, source grant, scene/camera/
cache/session; adapter borrows these and never owns gameplay state.

[Detailed lifecycle, APIs and manual steps](../../game-client/manual/vfx.md).
Client uses the same Render effect APIs as VE10 Editor, no cross-import.
All five public root declaration inventories are unchanged against VE10:
Render339, Editor138, Client/Engine/Server0. Private adapter is not root-exported.

## Observed versus not observed

Genuine local builds compile the actual Client adapter, Render dependencies,
optional strict browser consumer and existing Editor consumer. A finite Node
import of all package roots plus the DOM-free private adapter is headless-safe.
There is no game-server DOM/GPU requirement and no gameplay production change.
This is build/import evidence, not an executed gameplay-state scenario.

Finite manual Playwright CLI opened the real Client page in headed Chrome at
localhost8782. Controls and file chooser were present. Mount without a selected
pair reports the explicit original-pair requirement. Browser console initially
reported only missing favicon. Attempt to select original files in sibling
`jx1-manager-editor/data/asset-sources/monster/ani063` was denied by Playwright:
`outside allowed roots`, allowed root was this workspace. No access workaround,
asset fabrication or new browser/test suite was used.

Shell inspection confirmed original source SHA256 identities, not browser loading:

| File | SHA256 |
| --- | --- |
| Attack1_0.png | f31783508fe55cc39a421b9f3505503a831d7727605c1f2278e4a690585d3cd2 |
| Attack1_0.tpsheet | fe5c87c2e5cba46b43482080f15f5ed607450bb7e15cc72dff3f515c8969efc7 |

Sample uses explicit frames0000/0002 at125ms, frame-local anchor/pivot12,50,
ratio1:1. Monster pixels are not actual fire/aura art or anatomical ground proof.

| Version acceptance | Evidence / limit |
| --- | --- |
| Once world intent + stop/remove without gameplay mutation | Real source implementation/compilation; no Engine calls; runtime/pixels FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED |
| Looping attached intent + target-loss cleanup | Canonical attach/remove-effect and host reconcile/release path audited; browser execution FEATURE_NOT_VERIFIED |
| Editor/Client same Render root | Imports, strict consumer compilation and declaration inventory verified; no Editor runtime dependency |
| Headless-safe roots; no L3/L1/L2/server semantics change | Finite actual Node imports and scoped diff verified |

Not observed: actual once completion, looping aura pixels, stop/restart retention,
shared lease protection, target deletion, pending spawn/remove/close, context loss,
hidden/visible transition or resumed first delta in this new Client flow. These
are source-audited paths, not behavioral PASS. Existing Phase6 host defines first
delta0 on every Start/cancel and explicit resume/no background catchup. Native
GPU reclamation, GC, unsupported/trimmed/rotated/multipage media and production
Player/skill integration also remain unverified. Developer owns manual acceptance.

## Required gates

- `node harness/cli.mjs check` — exit0, ARCH_CHECK_PASS183 JS/TS sources.
- `node harness/cli.mjs scope --projects game-client --allow-infra` — exit0.
- `node harness/cli.mjs verify --projects game-client,editor` — exit0; genuine
  Client and Editor builds (including referenced Render), no unconfigured build.
- `tsc -p game-client/manual/vfx.tsconfig.json` — exit0, strict emitted public
  consumer compile with skipLibCheck:false.
- Five-root emitted declaration comparison and finite headless imports — exit0.
- Staged `git diff --check` — exit0.

Existing Harness DEP0190 remains nonfatal. No historical/exhaustive/unit/
integration/E2E/browser test suite, runner, matrix or mock was added/run.
Ignored local artifacts: `.artifacts/ve11/public-audit.mjs`, declaration inventory
`.artifacts/ve11-public-audit.json`, headless import output and browser shell logs.
Earlier ready/world capture attempts contain no mounted client and are not
runtime evidence. PR11 records remote push/PR SHA and actual workflow results.

Next is v0.11.11 Minimal Working Visual Effect MVP, pending its task. This
checkpoint implements VE11 with explicit manual evidence gaps; it does not
declare Phase11 MVP_PASS or Developer acceptance.
