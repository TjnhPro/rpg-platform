# v0.10.10 SA11 - Game Client animation integration

**IMPLEMENTED_CLIENT_MANUAL_CONSUMER / FINITE_REAL_BROWSER_OBSERVATIONS.**
No Phase10 MVP_PASS, general visual acceptance or Developer acceptance claim.

## Delta preflight and scope

Previous checkpoint/base: `756720ae037363ace05b3e09e5fb40b88b1e9c7c` (SA10).
Main baseline: `78dc4a9d14288df33ca46b3af4d23d09ceef9b82`. Same branch
feat/sprite-directional-animation-v0.10 and open Draft
[PR10](https://github.com/TjnhPro/rpg-platform/pull/10). Containing SHA and actual
exact-head CI are recorded in the PR ledger after commit/push. Preexisting
untracked .mcp.json and local browser artifacts are excluded.

Delta preflight read root/project guidance, architecture/foundation and Harness
ownership/contracts/workflow/verification/failures. Inspected Client root, Phase6
viewport scheduling, Phase7 File capability, Phase8 Scene, Phase9 camera host,
Render animation source and emitted public declarations. Prerequisites exist at
this HEAD. Route hints name Render/Client; primary owner **game-client** owns
presentation intent and browser scheduling. Render remains animation owner.
No Engine/Editor/Server/Render or frozen L1/L2 edits; no new foundation API calls.

Scope: private animation-presentation/manual-animation-host and additive private
viewport content frame hook; optional manual page/server/compile config/guide;
existing File capability optional identity/revocation; supplied task and guidance.
No public-root exports, package/dependency, authored schema, provider/cache engine,
renderer, gameplay/network authority or automatic reconnect. Tooling is no sixth
production project. Existing viewport consumers omit the optional hook unchanged.

## Actual contracts and behavior

Only Render public-root APIs: createEightWaySpriteClip,
selectEightWaySpriteDirection, create/command/advance/getSpriteAnimationPlayback,
createSpriteAnimationVisualBinding, canonical orientation, Scene/instance/transform,
source load/parser/cache/leases, camera binding and Phase6 session APIs. Root
remains headless with zero exports and no import of private browser modules.

| Input/event | Host adaptation and canonical owner behavior |
| --- | --- |
| Explicit clipId/orientation/playing | Render validation/mapping; selectClip/setDirection only when different; canonical transport readback controls play/resume/stop |
| Recurring identical playing intent | No restart; completed once clip stays completed |
| Direction change | Render quantizes and preserves elapsed; no Client mapping formula |
| RAF | Host timestamp difference only; Render alone accumulates elapsed/selects frame |
| Start/Pause/hidden/zero size | Cancel/reset baseline; first resumed delta0, explicit Start required, no hidden catch-up |
| Stop/switch/unmount/pagehide/terminal | Latch closed, revoke grants, drain loads/playback/binding/camera/Scene/leases/caches and existing host; no reconnect |
| Late digest/acquisition/source result | Generation/closed guards, capability revocation, existing Phase6/7 cleanup; no readiness re-adoption |
| Unavailable source/rejected binding | Explicit failure and terminal close; no substitute image/frame |

Exactly8 explicit source slots per idle/walk clip with SA10 verified TPSheet keys;
no discovery/sort/mirroring. Inspection intervals150/125ms, right/down axes with
positive-x/toward-positive-y orientation, zeroIndex0/zeroAngle0. Source compass,
FPS and gameplay roles remain unverified. Explicit top-left0,0 inspection anchor
does not claim anatomical ground, trim0 or original untrimmed origin. Phase7 owns
frame identity/revision/geometry. Fixed placement140,90; canonical Phase9 camera;
one independently owned Client instance.

## Genuine gates

| Command/audit | Actual result |
| --- | --- |
| node harness/cli.mjs check | exit0 ARCH_CHECK_PASS172 sources |
| node harness/cli.mjs scope --projects game-client --allow-infra | exit0 SCOPE_PASS |
| node harness/cli.mjs verify --projects game-client | exit0 genuine BUILD_PASS after correction |
| npx tsc -p game-client/manual/animation.tsconfig.json | exit0 strict optional consumer emission |
| node .artifacts/sprite-animation-v0.10.10-public-audit.mjs | exit0 actual SA10/current declaration emission: Render271/Editor138/Client0, no changed/added/removed root symbols |
| Node import @rpg-platform/game-client | exit0 zero exports, globalThis.document undefined |
| git diff --check | exit0 |

Initial build TS2339 (cache.dispose returns void) corrected to dispose then inspect
snapshot. Initial manual compile TS2322 (array/eight-tuple) corrected at explicit
8-slot content boundary as in SA10. Initial server lacked own-project dist route;
fixed before observations. CLI require was unavailable; used explicit File paths.
No unresolved failed/unconfigured build. Preexisting nonfatal Node DEP0190 warning.
No tests/assertions/runners/matrices/coverage targets added or run. No Render
public delta requires with-consumers; CI retains its existing full build gates.

## Finite actual Chrome observations

Playwright skill/CLI used for manual UI/readback/screenshots only. Selected32
original files from sibling jx1-manager-editor/data/asset-sources/monster/ani063,
the same explicit SA10 set (manifest SHA256
2133f93a52d1ccf25d854e4d10b6ec08352f59006aa868a09b007caa730e4043).
No sibling edit/art copy. Local readbacks .artifacts/sa11-*.txt; inspected screenshot
.artifacts/sa11-evidence/screenshots/sa11-playing.png. These are not CI claims.

| INPUT | EXPECTED | OBSERVED |
| --- | --- | --- |
| Mount selected originals; Start walk0 | Real frame/advancing playback | ready/failure null;566 deltas, elapsed9416.334/frame3 NormalWalk_0/0006, active camera binding |
| Inspect screenshot | Pixels beyond submitted receipt | Grey creature/shadow visible on blue canvas; no general artwork acceptance |
| Continue recurring walk intent | No every-frame reset | Later playing19283.334ms |
| Angle0 to pi/2; repeat Apply in same UI task | Direction2, preserve elapsed | before/after/repeat19283.334/frame2; NormalWalk_0/0004 to NormalWalk_2/0020 |
| Pause; later Observe | Hold time, no callback | paused21316.734,submissions1280,callback false,viewport suspended |
| Start; pause/read after first actual RAF | Zero resumed delta, no gap catch-up | count1281,delta0,elapsed21316.734 unchanged |
| Editor Play/Step125 while Client paused; close Client | Independent state | Editor idle125/revision1/dirtytrue unchanged; Client walk21316.734/slot2 unchanged before close |
| Close then Start old Client | Terminal, no resurrection | playback disposed,host unmounted,callback false,graphics disposed/terminal cleanupFailed false;16 caches CPU0/GPU0/leases0; Start rejects fresh mount required |
| Deny image capability; Mount | Honest missing source | closed ASSET_NOT_AVAILABLE/SOURCE_NOT_FOUND,playback null,one empty disposed cache,uploads0 |
| Mount then immediate Close during File preparation; later read | No late adoption | preparation closed,previous closed mount retained; no new readiness/playback |
| Mount new scene while running | Dispose old, explicitly create fresh | old playback disposed/host unmounted,16 empty disposed caches; new ready/mounted walk2 elapsed0 NormalWalk_2/0016,failure null |
| Tool tab-select Editor and return | Observe actual hidden delivery if produced | hidden false,Client still running; tool did not establish hidden transition; NOT_OBSERVED |

SourceJobs/uploadCalls are counters, not native reclamation. Symbols serialize
with identical descriptions; isolation evidence is actual independent scopes,
state and ownership, not comparison of those strings.

NOT_OBSERVED: real hidden/minimized transition, native context loss/restoration,
cleanup failure injection, close during actual in-flight Render metadata/decode/
upload (observed cancellation was earlier File digest), pagehide/BFCache,
disconnected canvas, native memory reclamation, full8-way Client pixel matrix,
source compass/FPS/anatomical feet/untrimmed origin, sustained population load,
or independent Developer product review. Not claimed PASS; existing owner
lifetime guards are used without simulated success evidence.

Ready for separately supplied v0.10.11 real MVP proof; no next checkpoint work,
merge, tag, release or publication. Developer alone accepts completion.
