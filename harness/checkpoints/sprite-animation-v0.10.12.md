# v0.10.12 SA13 — Sprite Animation integration and MVP closure

**AUDIT_COMPLETE / READY_FOR_DEVELOPER_REVIEW / ACCEPTANCE_PENDING.**
Closure adds documentation only. Implementation, finite API/pixel observations,
static/build compatibility and unverified product scenarios are separate below.
No blanket MVP_PASS, phase acceptance, merge, publication or Phase11 work.

## Exact baseline and closure scope

Current main/origin/main and actual `git merge-base origin/main HEAD`:
`78dc4a9d14288df33ca46b3af4d23d09ceef9b82`. Previous checkpoint and audited
implementation HEAD: `e1a67c8f55e64ac22c5191dc94b9346260193533` (SA12).
Branch `feat/sprite-directional-animation-v0.10`; one open Draft
[PR10](https://github.com/TjnhPro/rpg-platform/pull/10). Closure's containing full
SHA and matching push/PR CI links are entered in the PR ledger after commit;
`git log -1 --format=%H -- harness/checkpoints/sprite-animation-v0.10.12.md`
resolves the report's containing commit without a self-referential hash.

Canonical primary owner **runtime-render**: animation contract/integration audit.
Harness records evidence; Editor and Client are reviewed consumer paths, not
new implementations. No external L1/L2 calls or changed foundation capabilities.
Preflight re-read root/project guidance, architecture/foundation and Harness
ownership/contracts/workflow/verification/failures; inspected all preceding
checkpoint records, actual animation and consumer code, Phase8 transaction diff,
root exports and freshly emitted declarations. Route hints Render only.

Closure files: this checkpoint, exact API/file/commit inventory, preserved supplied
task, and closure pointers in architecture, Harness ownership/contracts, Render
guidance and manual index. No production src, manual executable/manifest/art,
package/lock/pin, config, dependency, workflow, schema or ownership graph change.
Preexisting `.mcp.json`, local packaging/declaration/browser artifacts excluded.

## Thirteen-checkpoint audit

Each version's full commit and refreshed exact push/PR workflow links, all
changed-file owners, every current root name and all40 additive declarations are
in the [exact inventory](../../runtime-render/docs/sprite-animation-api-inventory-v0.10.12.md).
SA01–SA12 have twelve scoped commits and24 completed successful workflows,
independently matched by event/SHA during SA13. SA13 is the thirteenth record
and its own scoped closure commit in the same PR.

| Checkpoint | Implemented owner/surface | Evidence class and remaining distinction |
| --- | --- | --- |
| [SA01 v0.10.0](sprite-animation-v0.10.0.md) | Render architecture only;0 exports | Design/source/build, not runtime animation |
| [SA02 v0.10.1](sprite-animation-v0.10.1.md) | Immutable sequences/basic clips;+4 | Finite CPU capture/identity/immutability; structural keys not asset/pixel proof |
| [SA03 v0.10.2](sprite-animation-v0.10.2.md) | Normalized timing/pure sampling;+9 | Finite boundary/loop/binary64 observations, not live playback |
| [SA04 v0.10.3](sprite-animation-v0.10.3.md) | Exact eight-way selection/resolution;+9 | Real TPSheet keys/angular/numeric observations; keys in that experiment did not prove eight real facings |
| [SA05 v0.10.4](sprite-animation-v0.10.4.md) | Independent playback/commands;+8 | Finite zero-time transport/capability evidence; nonzero gap subsequently addressed by SA06 |
| [SA06 v0.10.5](sprite-animation-v0.10.5.md) | Deterministic explicit advance;+2 | Finite nonzero/large delta/once/fractional/isolation API evidence |
| [SA07 v0.10.6](sprite-animation-v0.10.6.md) | Explicit verified frame alignment;+4 | Canonical geometry/numeric ground evidence, not anatomical-foot pixels |
| [SA08 v0.10.7](sprite-animation-v0.10.7.md) | Live binding and owner-private Phase8 transaction;+4 | Actual decoded original sprites and rejection/lease/cleanup observations; repeated source slots not eight-facing proof |
| [SA09 v0.10.8](sprite-animation-v0.10.8.md) | Shared immutable definitions, separate playbacks;+0 | Actual multi-instance pixels/removal/late-result and native loss isolation observations; no native reclamation claim |
| [SA10 v0.10.9](sprite-animation-v0.10.9.md) | Editor optional authored-reference preview;+0 | Real browser frames and preserved Document revision1/dirtytrue/correlation; no persistent animation schema |
| [SA11 v0.10.10](sprite-animation-v0.10.10.md) | Client private intent/host integration;+0 | Actual recurring RAF/direction/pause/scene-switch/cleanup; hidden transition was not delivered by tab tool |
| [SA12 v0.10.11](sprite-animation-v0.10.11.md) | Real Player idle/walk + Monster8-way manual MVP;+0 | Committed actual facing/frame screenshots, sampled sole stability, A/B/C isolation and logical cleanup |
| SA13 v0.10.12 | Render/Harness audit only;+0 | Fresh declaration/package/build/browser smoke and explicit residual review items |

Render-root types+values231→271; Editor138→138; Client/Engine/Server0→0.
All40 additions belong to Render; zero old symbols removed or declaration-changed.
Every additive checkpoint built public consumers; closure rebuilds all five and
strict manual/package consumers. The runtime Render module has116 enumerable
values; this is a different count from compiler type-plus-value symbols.

## Canonical end-to-end path

1. Editor's optional `animation-preview.mts` uses existing Asset catalog/ref,
   Scene membership/placement and Document APIs. `createScenePreviewBridge`
   creates one correlated instance. Explicit authored slots adapt to Render
   clips; preview never writes a playhead into the authored Document or resyncs
   the bridge over an animated instance each frame.
2. Client's private `animation-presentation.ts` consumes Render root. It maps
   explicit clip/orientation/playing intent through Render, uses canonical
   snapshots, sends commands only as needed and never resets a completed clip
   for recurring intent. `viewport-host.ts` supplies RAF timestamp differences
   through one optional frame hook; cancel/start reset its timestamp baseline.
3. `sprite-eight-way.ts` validates explicit slots and selects direction;
   `sprite-animation-playback.ts` owns the only accumulated playhead/transport;
   `sprite-animation-timing.ts` normalizes/samples the selected direction.
4. `sprite-animation-visual-binding.ts` uses canonical Phase7 atlas geometry,
   parser revision and existing resource lease. `sprite-frame-alignment.ts`
   converts explicit authored pixel anchor/pivot/offset through Phase4 APIs.
   Missing origin is a rejection, never a guessed center or source trim.
5. Existing Phase8 `visual-scene.ts` retains its own right and commits resource,
   transform and layout through one owner-private transaction, reusing existing
   ordering/depth/visibility. Internal frame-state/commit/end-listener helpers
   are absent from the package root. Host retains its separate acquired leases.
6. Successful sync invalidates Phase6 demand; it does not submit/schedule frames.
   Host calls the existing session frame path. Phase9 camera binding affects
   projection only. Existing Phase7 texture/UV draw path produces real pixels.

Render imports no Engine/Editor/Client/Server or gameplay foundation. Animation
modules import only Render owner-local capabilities. No native/backend types in
the new neutral descriptors; installed no-DOM consumer compiles. Existing backend
Three implementation remains private/lazy. No second clock, Scene graph, loader,
cache, sorting implementation, gameplay authority, generic schema or sixth project.
Manual provider Maps store explicit grants/results; they delegate decoding and
CPU/GPU rights to Phase7. Client scheduling is host policy, not a second playhead.

## Current state, numeric and compatibility contract

| Concern | Source-audited final rule / evidence |
| --- | --- |
| Timing | Exactly one positive finite fps/interval input, normalized to interval1e-6..MAX_SAFE_INTEGER ms; count1..65536 and duration within horizon; no per-frame duration |
| Sampling | Half-open binary64 product boundaries; once holds last at duration, repeat modulo; binary search, no skipped-frame loop; fractional rounding is documented, no rational/partition-exact guarantee |
| Direction | Exactly8 dense slots, matching Phase4 axes, explicit zeroAngle/zeroIndex; nearest45° centers, exact halfway advances toward positiveY, last sector wraps; canonical orientation requires[0,2π) |
| Same clip | Playing Play retains progress; select same no-op; explicit Play from completed restarts; paused Play preserves time and becomes playing |
| Other clip | select different resets stopped0; Play different resets playing0; opaque authored keys, not built-in gameplay states |
| Direction switch | Preserve SAME logical elapsed and transport, sample target modulo/clamp. Target-local completion may change when switching unequal-duration once directions; no cycle-fraction remap |
| Advance | Validate even if paused/stopped; only playing progresses; repeat retains logical sum, once drops overshoot at target duration. Unsafe/non-growing positive sum rejects before clamp/commit |
| Pause/stop/dispose | Pause holds; resume only paused and not completed; stop resets0; disposed terminal/idempotent with historical snapshot retained. Client false playing intent means stop, viewport pause uses pause |
| Frame failures | Exact resource/revision/geometry required. Pending/released lease → FRAME_NOT_READY; removed instance/session → closed binding; failed admission preserves last valid state. Phase8 old-right cleanup failure after commit is not rollback |
| Origins | Explicit verified frame-local pixel data; sourcePivot numbers preserved, not silently assigned as ground. Source size/trim unknown; only none rotation/trim:null/sourceSize:null profile supported |
| Binding | Identity local TRS only, matching converted ground offset; preserves authored placement, ordering, depth and visibility. sync validates every call; replace borrows new playback; unbind never disposes borrowed playback/lease/session |
| Isolation | Shared canonical deeply frozen definitions via weak issuance; per-handle map/transport/snapshot/guard. Phase8 retained rights differ from host leases; remove/end closes binding, host disposes CPU handle. Late readiness cannot revive removed identity or ID reuse |

SA04 explicitly superseded SA01/SA03's proposed fractional direction policy
before live playback existed. SA07 established sourcePivot labeling from exporter
inspection documented there; it did not change Phase7 raw fields. Old proposal
names such as mode remain historical, not aliases of actual repeat.

**Migration:** no change to existing root signatures or diagnostic unions and no
persisted schema migration. Existing exhaustive consumers of old unions remain
compatible. New consumers must handle every current new state/result union,
including completed/disposed and rejected codes, and distinguish typed rejection
from canonical thrown diagnostics. Client's optional private frame callback is
backward-compatible for prior callers; it is not a new public-root contract.

## Fresh closure verification (2026-10-24)

| Exact command / observation | Actual exit/result |
| --- | --- |
| `git fetch origin`; `git merge-base origin/main HEAD` |0; main and merge-base exact78dc4a9d14288df33ca46b3af4d23d09ceef9b82 |
| `node harness/cli.mjs check` |0; ARCH_CHECK_PASS174 JS/TS sources |
| `node harness/cli.mjs scope --projects runtime-render --allow-infra` |0; closure Render/Harness/infrastructure docs only |
| `node harness/cli.mjs verify --projects runtime-engine,runtime-render,editor,game-client,game-server --with-consumers` |0; genuine BUILD_PASS for all five, no failed/unconfigured build |
| `npm run build -- --force` |0; forced TypeScript five-workspace build |
| `node .artifacts/sa13/public-audit.mjs` |0; exact baseline/current declaration emission and per-symbol comparison, counts above |
| `npx tsc -p runtime-render/manual/sprite-animation-mvp.tsconfig.json` |0 |
| `npx tsc -p editor/manual/animation-preview.tsconfig.json` |0 |
| `npx tsc -p game-client/manual/animation.tsconfig.json` |0 |
| `npm pack ./runtime-render --pack-destination .artifacts/sa13 --json` |0; local private package artifact only, not publication |
| `npm install --prefix .artifacts/sa13/installed --offline --ignore-scripts --no-audit --no-fund --package-lock=false ./.artifacts/sa13/rpg-platform-runtime-render-0.0.0.tgz` |0; actual packed Render and pinned Three installed in isolated local consumer |
| `npx tsc -p .artifacts/sa13/installed/tsconfig.json` |0; strict installed-root consumer, ES2022 only, types[], skipLibCheck false; no DOM |
| Node ESM import from isolated installed consumer |0; resolved its own installed dist/index.js,116 runtime values, document undefined;8fps→125ms; private deep import ERR_PACKAGE_PATH_NOT_EXPORTED |
| `git diff --exit-code e1a67c8 -- runtime-render/src editor/src game-client/src runtime-engine game-server package.json package-lock.json` |0; closure production/package delta empty |
| `git diff --check` / staged diff audit |0; documentation-only closure |

Existing Harness Node DEP0190 child-process warning was emitted; no failed build
is hidden. Architecture scan is static evidence, not complete dynamic analysis.
No tests, assertions, runners, matrices, coverage, benchmarks or speculative fixes.
Full closure SHA and exact completed CI are post-commit PR ledger evidence;
the historical24 successful runs are not substitutes for closure-head CI.

## Pixel/API evidence classification and Developer decisions

SA12's [reproduction guide](../../runtime-render/manual/sprite-animation-mvp.md)
and [committed screenshots](sprite-animation-v0.10.11.md) show real Player BODY
idle/walk8-way and Monster8-way sampled poses, distinct walk frames, Player sole
Y220 in supported samples, A/B independent progress and C session isolation.
Original48-file manifest includes SHA256/bytes; no colored stand-ins or identical
single image presented as eight genuine facings. Earlier SA04/08/09 repeated or
rearranged source slots remain numerical/binding evidence only, not that claim.

Fresh closure Chrome smoke via Playwright skill: initial exact sources ready;
Select walk/Play/Step125 → P playing125/BODY_0002, bound same, placement(90,220),
failure null. Close all → all four playback handles disposed; cache disposed,
CPU/GPU/leases/revisions0, cleanupFailed false. Separate reload Play/Step125 of
default idle showed real P and A/B pixels on main canvas; inspected local
`output/playwright/sa13-main125.png` (moved under ignored `.artifacts/sa13`).
Initial browser console404 was only absent favicon.ico, not an asset failure.
sourceJobs24/uploadCalls32 are cumulative counters, not remaining allocations.
These finite observations do not measure native memory reclamation.

| Classification | Result / actionable review item |
| --- | --- |
| Scoped implementation | SA02–SA12 implemented, canonical owner/source trace complete; no known compatibility/dependency/ownership blocker found |
| Build/static compatibility | PASS for actual commands above; declaration/API delta40 additive only |
| Numerical/manual API evidence | Finite recorded SA02–SA09/SA12 cases; no universal behavioral proof or timing precision beyond binary64 contract |
| Browser visual evidence | Finite actual original sprites and eight-direction MVP samples observed; submitted receipts alone were never promoted to pixels |
| FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED residuals | Every pixel/frame in every direction and every Editor/Client combination; original source compass/FPS/anatomical untrimmed pivot; full Player head/hand/equipment composition; independent Developer artwork/ground acceptance |
| Lifecycle residuals | SA09 observed native loss isolation in disposable Render host; Editor/Client native loss/restoration, hidden/minimized/BFCache, cleanup-exception injection and native GPU memory reclamation remain unverified. Do not erase SA09 evidence or generalize it to all hosts |
| Unsupported/deferred | Nonidentity local TRS for binding, trimmed/rotated source support,16/32 directions, per-frame duration, blending/state graphs/events/VFX/gameplay consequences, populations/performance guarantees |
| Developer review request | Review SA12 reproduction and current contracts; decide acceptance of the supported authored sample anchors/content and whether lifecycle/visual gaps need follow-up before accepting Phase10. Any discovered breaking/ownership issue requires a separate scoped decision, not a hidden closure fix |

No required prerequisite is absent and no production fix was made during audit.
Phase10 is ready for Developer review with explicit limitations. Stop here:
no automatic Phase11 implementation, merge, tag, publish or release.
