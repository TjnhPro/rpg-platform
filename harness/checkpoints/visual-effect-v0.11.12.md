# v0.11.12 — VE13 VFX integration and closure audit

2026-10-24 Asia/Bangkok. **CLOSURE_AUDIT_COMPLETE / BLOCKED_WITH_EVIDENCE for
Phase11 MVP acceptance. FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED remain for
the incomplete combined MVP and Client cases. No MVP_PASS or Developer acceptance.**

## Scope and exact baseline

Canonical primary behavior owner: **runtime-render**. Harness owns this audit;
Editor and Game Client are public-root build consumers. This version adds only
documentation and archived evidence; no production code, API, schema, dependency,
build/CI configuration, game authority or capability change. L1/L2 APIs are not
called or modified. No targeted regression implementation is silently included.

One branch `feat/visual-effect-playback-v0.11`, one open Draft [PR11](https://github.com/TjnhPro/rpg-platform/pull/11),
base main/merge-base `aceea67f95cb309bdd06f1d6193767bfa06f42ce` (Phase10 merge).
Audited prior HEAD `7a5493081d7c73b2aa28662f3828afb5e4dbb5e3` (VE12).
This report's containing commit is the VE13 SHA; recover it with
`git log --diff-filter=A --format=%H -- harness/checkpoints/visual-effect-v0.11.12.md`.
The PR records push/PR CI against that exact SHA after commit, avoiding a
self-referential committed hash. No merge/tag/release/publication/Phase12 work.

Read root/project guidance, ARCHITECTURE/FOUNDATION, Harness owner/contracts/
workflow/verification/failures, all twelve existing numbered reports and U1,
actual root declarations and relevant definition/playback/attachment/frame/
resource/consumer source. Route had no reliable keyword hint; actual owners
decide scope. Closure's task authoring note about absent Phase8–10 is historical:

| Actual dependency | Closure source revision | Merge available in phase base |
| --- | --- | --- |
| Phase7 resource loading | 63df7e743f004100085a0fc131ab7408e9dc91d5 | PR7, ffb3471 |
| Phase8 visual scene | b63c82aff7ec5ea81035e3e41033523305c159c1 | PR8, e4464ac |
| Phase9 camera | 497cde7a6c0552c0ed710e8fdb206b795f2dc2b5 | PR9, 78dc4a9 |
| Phase10 animation | a9a9a1d132649405c6b10f294b6a283cd9e7e7cd | PR10, aceea67 |
| Missing neutral live seam at VE01/02 | approved U1, df28c2a059121b77eab01e59c710c4d0c7a4290c | delivered on Phase11 branch |

Actual Phase7 source/atlas/lease, Phase8 visual frame/layer/depth and Phase9 camera
APIs exist. U1 shares Phase10 transport/sampler/binding, resolving the old neutral
playback blocker. There is no current BLOCKED_DEPENDENCY on those owner APIs.

## Thirteen numbered checkpoints, plus separately approved U1

All 13 task copies and reports v0.11.0–v0.11.12 exist with one numbered commit
each. U1 is an additional approved upstream commit, not a missing or renamed
numbered task: total phase commits after VE13 is **14**, not13.
The [machine inventory](evidence/visual-effect-v0.11.12/inventory.json) contains
full SHAs, exact paths changed by every prior commit, all phase paths, per-commit
Render root additions, protected-path results and archived-evidence hashes.
VE13 paths are separately listed there; its SHA is the containing commit.

| Version / capability | Commit | Primary owner | New Render roots | Evidence status |
| --- | --- | --- | --- | --- |
| 0.11.0 VE01 architecture | fde8517 | Render |0| design/audit; neutral live gap recorded |
| 0.11.1 VE02 definition/references | 77b0191 | Render |9| real metadata CPU observation |
| Approved U1 neutral playback/binding | df28c2a | Render |12| finite real-source CPU/browser observations |
| 0.11.2 VE03 instance lifecycle | ce5833e | Render |10| canonical membership/lifecycle observations |
| 0.11.3 VE04 playback commands | 05a5281 | Render |6| command observations; nonzero cases followed in VE05 |
| 0.11.4 VE05 loop/duration/completion | 2046a4a | Render |9| effect-handle3000ms/pause/logical rights observations; no pixels |
| 0.11.5 VE06 world/offset | 1c38808 | Render |4| placement/anchor observations; not artist origin proof |
| 0.11.6 VE07 attachment | a193622 | Render |6| translation/target-loss observations |
| 0.11.7 VE08 frame/scene | 296d639 | Render |3| original monster frames, camera/follow and rights observations |
| 0.11.8 VE09 resources/diagnostics | d020b98 | Render |9| shared rights, pending load, context-loss and cleanup observations |
| 0.11.9 VE10 Editor preview | d057e36 | Editor |0| finite browser controls/Document preservation; shell integration open |
| 0.11.10 VE11 Client intents | a389211 | Client |0| implemented/compiled; mounted effect flow not observed |
| 0.11.11 VE12 working MVP | 7a54930 | Render; Harness audit |0| **partial** CPU/asset audit; combined MVP not delivered/observed |
| 0.11.12 VE13 closure | containing commit | Render; Harness audit |0| evidence-only audit; acceptance remains blocked |

No checkpoint is silently counted as a completed functional capability. Earlier
reports' implementation labels do not establish the full MVP; VE12 remains the
material incomplete integration/proof checkpoint.

## Public contracts and compatibility

Compiler-generated declaration audit against pre-phase merge-base:

| Public package | Before | After | Added | Removed / changed old declarations |
| --- | --- | --- | --- | --- |
| runtime-render |271|339|68|0 /0|
| editor |138|138|0|0 /0|
| game-client |0|0|0|0 /0|
| runtime-engine |0|0|0|0 /0|
| game-server |0|0|0|0 /0|

All 68 names and emitted declaration bodies are in
[public-declarations.json](evidence/visual-effect-v0.11.12/public-declarations.json).
Nine definition, twelve U1, ten instance, six playback, nine lifetime, four
placement, six attachment, three frame and nine diagnostic/work roots sum68.
Private `capturePlaybackTimedClip` is not a root API. Consumer DOM hosts remain
outside portable roots. There are no newly exported THREE/DOM/GPU capabilities
in neutral effect DTOs; GPU rights enter only through existing owner handles.

Pre-phase RenderVisualDiagnostic, SpriteAnimationPlaybackState/Command and
directional frame-result unions are unchanged. **VisualEffectDiagnostic is a
new union**, including canonical Render diagnostics plus effect-definition,
instance, playback, lifetime, coordinate and work domains; exhaustive consumers
of this new API must cover them. Effect frame results add definition-binding
rejection codes on their own new surface. No old exhaustive-switch migration is
indicated by declaration comparison. This is structural/source compatibility
evidence, not a proof of every possible runtime consumer.

U1 changes internals of the existing playback/timing/binding modules: mode-based
capture/selection uses one transition, sampler and binding lifecycle. Directional
APIs retain eight authored slots and logical elapsed semantics. Neutral snapshots
have directionIndex:null, with no setDirection. Structurally similar playback
handles still require runtime issuance/mode checks; callers must use the correct
factory. Frozen timed clips share weak issuance provenance; structural input is
recaptured and checked. No second animation engine or fabricated eight-way VFX.

Phase11 evolution also has semantic changes on its **new** surfaces: once/timed
completion automatically retires the effect; restart after retirement rejects;
stop resets/hides while retaining membership/rights for restart. VE09 limits256
active effects per scene and makes explicit remove/completion propagate the
first original cleanup exception after attempting all cleanup. Broadcast cleanup
remains nonthrowing/sticky. These behaviors are documented, not old Phase7/8
lease or directional state-union migrations. No known required compatibility
migration was found; accepting these semantics remains Developer-owned.

## Ownership/lifecycle audit

Exactly five workspaces remain. Engine/Server, root package/lock, pins and CI have
zero phase diff. Cached L1 Core2.0.0 at04b7239f998c3c688a0dfa3202f11811a9acd775
and L2 Gameplay0.15.2 atacea332aa80f67552192a72b30f81c0bbbfc56bd match pinned
SHA512 artifact integrity; full values are in inventory.json. No external edits.

| Contract | Actual source composition / limit |
| --- | --- |
| Identity | Authored reference, immutable Render definition, issued branded effect symbol, Phase8 membership key and gameplay identity remain separate; no gameplay lookup/callback |
| Timing | Effect owns neutral Phase10 playback; only explicit delta advances; pause freezes frame and lifetime. Timed repeat clamps admitted delta to remaining duration. No Render clock/scheduler |
| Scene ownership | Effects enumerate canonical Phase8 membership via weak correlations; no parallel Scene store. World placement uses Phase4/8 APIs; camera remains Phase9-owned |
| Attachment | Same-scene exact ordinary target; translation-only offset and effective visibility; host sync required before frame/submission. No effect chains/physics/entity targeting; target end removes effect |
| Frame | Exact source/atlas revision, selected page and authored origin flow through U1/Phase7/8 atomic frame transaction. Sync never advances, acquires, uploads a new independent texture or submits |
| Resources | Host owns acquired leases/async loads; Phase8 independently retains drawable usage. Effect cleanup unbinds, disposes its playback and removes its membership, never cache/session/peer rights |
| Terminal | State becomes terminal before owned cleanup; completion/target/scene/session end share retirement path. Client cancels pending admission correlation before release, preventing a settled request from recreating a retired effect |
| Diagnostics | Bounded frozen historical data and branded owner errors; last bound result, active playback, submitted receipt and cleanupFailed:false are not current-pixel/native-memory proof |
| Consumers | Editor imports Render root for preview, preserves authored Document; Client private adapter imports Render root with mount-local requests; no Editor runtime dependency or copied gameplay rules |
| Server | Unchanged root imports Engine only. Five package roots plus private Client adapter actually imported under Node with window/document undefined; no mandatory GPU participation |

## Functional and visual evidence: observed versus missing

No browser was rerun during closure. Prior checkpoint reports and local raw
captures were inspected. Selected **historical captures** are archived
here with original and archived SHA256s in inventory.json (text CRLF normalized
to LF only, screenshots unchanged): VE05 timing transcript,
VE08 frame0000/frame0002/follow-camera screenshots, VE09 cleanup transcript,
VE10 corrected context-loss transcript. Two frame screenshots were re-opened in
this audit: original monster poses differ; this is historical image inspection,
not a new run at closure HEAD. The host label says left/right but canvases wrap
vertically. Raw transcripts may contain empty serialized native objects; these
are not usable capabilities or GPU-memory receipts.

Shared source identity is the original ani063 Attack1_0 PNG12270 bytes,128x256,
SHA256 f31783508fe55cc39a421b9f3505503a831d7727605c1f2278e4a690585d3cd2;
TPSheet888 bytes SHA256 fe5c87c2e5cba46b43482080f15f5ed607450bb7e15cc72dff3f515c8969efc7.
Historical hosts used original source bytes in headed Chrome, Three/WebGL2,
explicit125ms frame intervals and frame-local anchor/pivot12,50 at1:1 units.
That anchor and track order are host-authored inspection choices, not inferred
artist ground, compass, FPS or verified production VFX art.

| Required case / input | Expected | Actual evidence and remaining limit |
| --- | --- | --- |
| Impact once, distinct frames, retire | Pixel change then disappear | VE08 original0000/0002 pixels differ; VE05/VE09/VE10 separately observe completion/cleanup. Combined real Impact visual disappearance in VE12 **NOT OBSERVED** |
| Aura attached loop, move then delete target | Follow/loop then remove | VE07/08 transform/target-loss and VE08 follow/camera captures; VE10 attached screenshot reported. Production Player/aura and new Client path **NOT OBSERVED** |
| Ground repeat3000ms; pause+1000ms | Pause preserves budget; complete exactly3000 admitted ms | VE05 effect handles stayed187.5 paused, then2999.5→3000 duration-elapsed; integer tolerance0ms, fractional example exactly representable. Bound logical rights cleanup observed; fixed-ground pixels/full scene **NOT OBSERVED** |
| Shared atlas, independent instances/session | No peer eviction or per-frame uploads | VE08 cache CPU/GPU2/2 unchanged across frames for two sessions; VE09 remaining peer/context loss/cleanup receipts. Logical rights/counters, not native profiler evidence; simultaneous Editor+Client execution **NOT OBSERVED** |
| World/offset, camera pan/zoom, layer/depth | Applied presentation, no authored/gameplay writes | VE06/08 stored positions and camera/follow observations; VE10 Document identity/revision/dirty unchanged. Complex overlap/alpha depth and running gameplay-state comparison **NOT OBSERVED** |
| Target/scene/session end and late IO | No orphan/late revival | VE09 late source settle/target/context-loss/clear; VE10 delayed close and corrected context loss recorded. New Client async runtime flow and native reclamation **NOT OBSERVED** |
| VE12 CPU125ms/pause/resume/stop | Canonical neutral transport | Committed VE12 raw JSON confirms CPU only; no effect-instance or pixel substitute |

Other unverified cases include full Editor shell, hidden/visible browser behavior,
multipage/trimmed/rotated assets, unsupported decode paths in live consumers,
injected native cleanup failure, GC/native GPU reclamation and context restoration.
Historical source/build success does not convert any missing case to PASS.

## Blocker and Developer handoff

VE11 browser file selection denied original sibling media as outside allowed
roots; VE12 found no eligible real VFX atlas within the workspace. Local procedural
samples and screenshots cannot serve as source textures. No copy/media-route or
alternate transfer was used to evade the denial. Exact source/frame geometry and
finite manual repro are preserved in [VE12](visual-effect-v0.11.11.md).

Smallest follow-up: provide legitimate browser access to real atlas bytes and
verified tracks/origins, then authorize/execute the unfinished combined public-API
Impact/Aura/Ground scene and Client/Editor isolation proof within the existing
owners. It requires a targeted follow-up, not a v0.11.13 invented here. No source
regression is proven by this evidence audit and no speculative fix is inserted.

Developer may review the architecture/implementation and explicitly defer named
evidence gaps, or require that follow-up before phase acceptance/merge. This audit
does **not** choose acceptance/deferral on the Developer's behalf. VE13 audit is
complete; Phase11 functional/visual MVP acceptance remains BLOCKED_WITH_EVIDENCE.

## Actual gates at closure

- `node harness/cli.mjs check`: exit0, ARCH_CHECK_PASS183 JS/TS sources.
- `node harness/cli.mjs scope --projects runtime-render,editor,game-client --allow-infra`:
  scope limited to Harness documentation/evidence; result recorded before commit.
- `node harness/cli.mjs verify --projects runtime-render,editor,game-client --with-consumers`:
  exit0; genuine Render/Editor/Client builds, no unconfigured builds.
- `npm run build -- --force`: exit0; root references all five workspaces.
- Strict Editor/Client manual consumers and no-DOM diagnostic consumer: tsc exit0,
  actual emitted roots, skipLibCheck:false; no new runner/test framework.
- Pre-phase five-root emitted declaration audit: exit0,68 additions, zero removed/
  changed prior roots. Protected-path Git diff empty; artifact integrity matches.
- Finite five-root/private adapter Node imports: exit0, window/document undefined.
- Staged whitespace audit and exact-head remote CI recorded before handoff/on PR11.

Windows PowerShell, Node24.18.0/npm12.2.0. Existing Harness DEP0190 warning remains
nonfatal. No unit/integration/browser/Playwright/E2E/snapshot/visual-regression
suite, mocks, matrix or fake assets added/run. CI confirms static/build gates only.
Next action is Developer Phase11 review; no automatic Phase12 implementation.
