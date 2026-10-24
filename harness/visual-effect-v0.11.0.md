# VE01 — VFX architecture and contract foundation

Current availability: Developer approved U1 after VE02; the additive neutral live
seam is delivered in the [U1 checkpoint](checkpoints/visual-effect-u1.md).
The audit and BLOCKED_DEPENDENCY statements below describe the VE01 baseline.

**ARCHITECTURE_PROPOSAL_ONLY.** No VFX API or runtime is implemented here.
Baseline: merged main `aceea67f95cb309bdd06f1d6193767bfa06f42ce`, including
Phase10 [PR10](https://github.com/TjnhPro/rpg-platform/pull/10).
The task's earlier main/PR7 observation is historical, superseded by this checkout.
The supplied VE01 authorizes this ledger, not an upstream playback extension.

## Canonical path and decision ledger

Editor authored reference / Client presentation request → Render effect definition
→ independent effect instance → Phase10 playback → Phase7 exact frame/lease
→ Phase8 drawable → Phase6 frame, with Phase4 anchor and optional Phase9 camera.
Engine alone owns gameplay intent/consequences. Server needs no VFX or GPU.
There remain five projects; Harness is documentation/tooling only.

| Seam | Canonical owner; input → output family | Boundary / errors / lifetime |
| --- | --- | --- |
| Authored reference | Editor; existing Asset/Scene/Document references → explicit Render data | No persisted playhead or preview writes to Document; no Render import of Editor; invalid references stay authoring diagnostics |
| Definition | Render proposed immutable definition ID + project + `SpriteTimedClip` + explicit placement/origin/lifetime policy → captured data | No IO, live handle, gameplay schema or asset catalog; invalid data rejects before allocation; missing frame resolution is separate |
| Instance | Render proposed issued effect capability → detached state observation | Independent of definition and drawable IDs; no global registry; invalid/foreign/removed handle rejection, idempotent terminal removal |
| Timeline | Phase10 `SpriteTimedClip`/timing → frame sample; live single-track playback **missing** | No VFX playhead/sampler implementation, eight duplicated tracks or cast to directional handle; upstream gate below |
| Resource | Phase7 `VisualFrameReference`, atlas/revision, caller-held `VisualResourceLease` → canonical frame/retained usable right | Exact opaque frame key and source revision; missing/stale/foreign/pending resource not success; VFX borrows host lease, Phase8 owns its retained right |
| Drawable | Phase8 `RenderVisualScene`/`RenderVisualInstance` → membership/layout/visibility/order | One VFX-owned drawable per instance; no replacement Scene/sorting/cache; remove only owned drawable, preserve others |
| Origin/placement | Phase4 plane/anchor + Phase10 explicit frame-origin data → Phase8 transform | Explicit plane/unit/axes; unknown trim/size/origin rejects; identity local TRS binding restriction remains |
| Attachment | Render VFX proposed one borrowed target capability + explicit offset → own drawable placement | Same Scene/session; translation only, exact target identity, target loss removes effect; no parent graph or gameplay lookup |
| Submission | Phase6 session + existing Phase8 source + optional Phase9 camera → receipt | Host schedules and supplies delta; camera only projects; receipt is historical submission, not pixels or gameplay completion |
| Teardown | VFX coordinates its binding/playback/drawable; Phase7/8/6 perform native cleanup | Terminal before cleanup, attempt all owned releases, report cleanup failure separately; never dispose borrowed target/cache/session/camera/host lease |

All proposed neutral records must be detached readonly data, bounded at capture,
and contain no DOM/THREE/GPU types. Editor/Client consume package root only.
No L1/L2 API is used or changed. No public exports or existing unions change in VE01.
Future failure families in this ledger are semantic proposals, not exported codes.

## Source and emitted-declaration audit

Inspected current source and freshly built `dist/*.d.ts`, not only phase documents.
Every workspace manifest is still version `0.0.0`; v0.x checkpoint numbers are
roadmap versions, not published package versions. Render root has 271 compiler
type/value names, Editor 138, Client/Engine/Server 0; source and emitted root-name
inventories match. [Complete current names](visual-effect-api-inventory-v0.11.0.md).
Root-only exports remain configured; owner-local exports are not consumer APIs.

| Phase | Actual root surface inspected (representative reused families) | Actual source / limitation |
| --- | --- | --- |
| 4 | `PlaneProjectionPoint2D`, `ProjectionPlane2D`, `PlanarPoint2D`, `PlanarTransform2D`, `createPlanarTransform2D`, `applyPlanarPoint2D`, `VisualAnchor2D`, `createVisualAnchor2D`, `VisualOrientation2D`, `resolveVisualAlignment2D` | [plane-projection](../runtime-render/src/plane-projection.ts), [alignment](../runtime-render/src/visual-alignment.ts), [affine](../runtime-render/src/planar-affine.ts); plane labels do not perform lookup/unit conversion |
| 6 | `RenderFrameSession`, `createRenderFrameSession`, `RenderFrameReceipt`, `invalidateRenderFrame`, `getRenderViewportSnapshot`, `suspendRenderViewport`, `resumeRenderViewport` | [frame-session](../runtime-render/src/frame-session.ts); host scheduling, accepted viewport and terminal native lifecycle stay here |
| 7 | `VisualFrameReference`, `createVisualFrameReference`, `parseUnityAtlasMetadata`, `resolveAtlasFrame`, `getAtlasMetadataRevision`, `resolveAtlasFrameGeometry`, `createAtlasTextureView`, `VisualResourceLease`, `createVisualResourceCache`, `invalidateVisualResourceCache` | [atlas](../runtime-render/src/atlas-geometry.ts), [cache](../runtime-render/src/visual-resource-cache.ts); none rotation, trim:null, sourceSize:null; geometry/view is not resource ownership |
| 8 | `RenderVisualScene`, `createRenderVisualScene`, `RenderVisualInstance`, `addRenderVisualInstance`, `removeRenderVisualInstance`, `getRenderVisualInstance`, `getRenderVisualInstanceSnapshot`, `getRenderVisualInstanceTransform`, `setRenderVisualInstanceTransform`, `setRenderVisualInstanceVisible`, `bindRenderVisualInstanceResource`, layer/order/depth APIs | [visual-scene](../runtime-render/src/visual-scene.ts), [transform](../runtime-render/src/visual-instance-transform.ts); exact issued capability/membership, retained resource usage, no public instance-end subscription |
| 9 | `RenderCamera`, `createConfiguredRenderCamera`, `bindRenderCameraToVisualScene`, `RenderCameraSceneBinding`, `getRenderCameraFrameSnapshot` | [camera-scene](../runtime-render/src/camera-scene.ts); projects localToScene, no VFX position/timing authority |
| 10 metadata | `SpriteFrameSequence`, `SpriteAnimationClip`, `SpriteTimedClip`, `createSpriteFrameSequence`, `createSpriteAnimationClip`, `createSpriteAnimationTiming`, `createSpriteTimedClip`, `sampleSpriteAnimationTiming` | [sequence](../runtime-render/src/sprite-frame-sequence.ts), [timing](../runtime-render/src/sprite-animation-timing.ts); **real single-sequence metadata and pure sampler exist** |
| 10 live | `SpriteAnimationPlaybackInput`, `createSpriteAnimationPlayback`, `getSpriteAnimationPlaybackSnapshot`, `commandSpriteAnimationPlayback`, `advanceSpriteAnimationPlayback`, `createSpriteAnimationVisualBinding`, `resolveSpriteFrameAlignment` | [playback](../runtime-render/src/sprite-animation-playback.ts), [binding](../runtime-render/src/sprite-animation-visual-binding.ts); input is only `readonly EightWaySpriteClip[]` plus mandatory directionIndex; binding only accepts that issued playback |

Compare [merged Phase10 implementation audit](checkpoints/sprite-animation-v0.10.12.md)
and [historical SA01 proposal](../runtime-render/docs/sprite-animation-v0.10.0.md).
Current repeat naming, logical elapsed direction behavior and identity local TRS
restriction override earlier proposals. Phase8 frame-transaction and instance-end
helpers are owner-local, absent from root; Editor/Client must not deep-import them.
`getRenderVisualInstanceSnapshot` throws for removed/foreign membership; detached
snapshots alone are not continuing liveness proof.

## U1 — minimum upstream decision before non-directional live VFX

**BLOCKED_DEPENDENCY for live non-directional playback/binding**, not for this
architecture-only deliverable. At exact baseline above, `SpriteTimedClip` cannot
be passed to `createSpriteAnimationPlayback`; there is no single-track issued
playback root or corresponding live binding. Existing neutral sampler is not a
stateful transport and does not by itself satisfy the VFX reuse requirement.

Smallest proposed upstream scope: inside Render's **Phase10 animation owner**,
add an independent single-sequence playback entry surface consuming one canonical
`SpriteTimedClip`, with create/read/command/advance/dispose semantics and a matching
single-sequence visual-binding entry surface. Reuse one internal validated
transport/advance/sampling path and the existing Phase7/8 admission transaction;
factor internal code if necessary, never copy a second transport into VFX.
The new neutral snapshot/commands have no direction field/command. These are
conceptual surfaces, not approved names or implemented exports.

Keep existing EightWay types, constructors, unions, signatures, diagnostic domains
and eight-only behavior intact. Separate additive roots avoid changing exhaustive
old consumers. Reuse Phase10 alignment/revision/lease guards, occupancy and
terminal unlinking. No change to Phase7 geometry or Phase8 public ownership is
authorized. Internal same-Render collaboration may use existing owner-private
instance/session-end hooks; exposing those hooks publicly is not requested.

Developer authorization must explicitly cover that Phase10 additive public
extension and its consumer builds before source implementation. VE01 records it;
it does not grant it. Rebuild Render+Editor+Client, compile neutral no-DOM roots,
compare old declarations/unions, and require explicit-delta and real binding
evidence at the extension checkpoint. Pure definition work can use the existing
`SpriteTimedClip` after its own supplied task; live VE03 and later consumers
cannot bypass U1. Do not infer approval from Phase11 task delivery or this PR.

## Independent identities and possession

1. **Authored Asset/reference:** Editor project-scoped durable content identity;
   supplied as correlation only, never an authority to fetch arbitrary paths.
2. **Effect definition ID:** proposed Render portable project-scoped opaque key;
   immutable `SpriteTimedClip`, origin and policy data. No live resource handles,
   runtime symbols or Document sessions inside serializable definitions.
3. **Effect instance ID/capability:** proposed Render ephemeral issued identity;
   one independent lifecycle/age, even when definitions are shared. Not persisted,
   not equal to definition, authored ID or gameplay entity.
4. **Phase8 visual instance:** actual issued drawable capability, scoped by Scene,
   session, visualInstanceId and insertionOrdinal. One owned drawable per effect;
   VFX owns removal, never target membership. Reusing a string ID cannot revive it.
5. **Animation playback:** separate Phase10 ephemeral CPU capability, owned by the
   effect instance after U1. A definition or drawable is not a playhead.

No implicit effect-definition lookup/global registry. Host supplies canonical
definition and exact scene/session/target capabilities. Sharing immutable data
does not share playback or transfer borrowed target/cache/lease ownership.

## Proposed lifecycle (normative plan, not observed runtime behavior)

| State | Transition policy | Drawable / resource possession |
| --- | --- | --- |
| created | Capture definition/request, age0; play admits live prerequisites; failed creation/play rolls back owned candidates | No drawable, binding or acquired texture; optional CPU stopped playback only after U1 |
| playing | Same play is idempotent; pause → paused; stop → stopped; clip/lifetime end → completed; remove/target loss/session end → removed | Own drawable, Phase10 playback/binding; Phase8 retains its bound lease; host page leases borrowed |
| paused | Hold age and playback; resume/play → playing without restart; stop resets; remove/target loss/session end terminal | Same drawable/rights and last visibility as playing; attachment still follows valid target, not time |
| stopped | Reset age/playback to0, hide drawable; play → playing at0; stop idempotent | Retain owned drawable/binding and bound right for explicit replay; no source reacquisition on stop |
| completed | Terminal for advancement, not disposal; hide at completion, retain final readback; explicit play restarts age/playback at0; resume no-op, stop → stopped | Retain hidden drawable/binding and bound right until remove; once last-frame readback is not a promise to display that frame after completion |
| removed | Mark terminal first; repeated remove/read detached final observation only; reject play/advance/placement/attachment writes | Release all owned binding/playback/drawable rights exactly once; never release borrowed host lease/target/cache/session |

Every nonremoved state allows explicit remove. Stop on created is a no-op;
stopped possession above applies to previously admitted playing instances.
Created has no resumable pause;
pause/resume outside playing/paused are no-ops. Validate all commands and delta
before effects, even no-op states. Completion is presentation only; no gameplay
expiry/hit/skill event. Stop/completion intentionally retain resources for replay:
**the host must remove finished effects**; finite lifetime hides presentation,
it is not automatic cache eviction. Remove is the only effect-level release.
Unready/failed frame admission preserves the last valid drawable and yields an
explicit rejected/pending outcome. It must not forge resource/pixel success.
Playback/lifetime may have advanced before a later frame sync rejects; report
logical state separately from last-bound frame, not an invented cross-owner rollback.

## Time, repeat and finite lifetime

The host supplies one finite nonnegative `deltaMs` per active effect per host step,
bounded by current Phase10 `0..MAX_SAFE_INTEGER` ms. No wall clock, RAF, native
frame count, Date.now/performance.now, hidden catch-up or VFX-private frame index.
Phase10 owns normalized interval, frame sampling and accumulated playback time.
VFX owns only **active presentation age** used to cap finite lifetime, not a
general timer, scheduler or second animation clock. Same admitted delta drives
both; pause freezes both. Hide/viewport suspension alone does not imply pause;
Editor/Client choose explicit scheduling/pause with reset timestamp on resume.

| Clip policy | Lifetime policy | Completion decision |
| --- | --- | --- |
| once | clip-end (no explicit duration) | Phase10 once completion completes/hides effect |
| once | finite positive duration | Earlier of clip end or lifetime ends effect; no post-clip age ticking |
| once | infinite | Reject incompatible policy; use clip-end for a once clip |
| repeat | finite positive duration | Loop via Phase10 until active age reaches duration, then complete/hide |
| repeat | infinite | Play until explicit stop/remove or lost target/session; CPU numeric horizon still applies |
| repeat | clip-end | Reject; a loop has no natural final end |

Finite duration is `0 < durationMs <= MAX_SAFE_INTEGER`; zero/NaN/Infinity rejects.
For a finite remainder, admit effectiveDelta = min(host delta, remaining life),
also respecting once's remaining clip span; discard completion overshoot rather
than advancing a new instance. Preflight Phase10-compatible numeric admission and
VFX age candidate before committing either; if playback advance rejects, age
must not change. If a positive effective increment is absorbed by binary64 or
would exceed horizon, reject rather than wrap/reset. No invented exact partition
invariance: retain Phase10 half-open binary64 boundaries (interval >=1e-6 ms,
count1..65536, duration <=MAX_SAFE_INTEGER). Zero delta selects no new time.
Completion/completionNow is a detached per-call result, never a queued gameplay event.

## Placement, attachment and stale identity

World-local mode captures one explicit `PlaneProjectionPoint2D` in the same
Scene/camera source plane plus verified frame origin and positive pixel-to-plane
ratios. Bind with identity local TRS, preserve ground offset; Phase10 changes
draw geometry/layout, not authored or Engine position. Phase9 pan/zoom only projects.

Attached mode borrows exactly one existing **non-VFX** Phase8 target in the same
Scene/session; capture exact capability and insertionOrdinal, not string lookup.
Offset is an explicit vector in that target placement's plane/unit/axes; mismatch
rejects without conversion inference. Position is target transform's `placement`
point plus that offset, using Phase4 translation/finite validation; do not inherit
target local TRS, orientation, pivot, layer, depth or visibility. Use its placement
point (not projectedAttachment or sprite rectangle) consistently. Missing target
transform is inadmissible initially and `remove-effect` if later lost. No nested
effect attachment, hierarchy, transform propagation engine or gameplay lookup.
Self/owned-effect targets reject; ownership occupancy is local to Render Scene,
not a sixth manager or shared gameplay registry.

Resolve attachment on explicit VFX sync/advance (even delta0 and paused), before
drawable writes. Use existing same-owner lifecycle hooks to invalidate immediately
on target/owned instance/Scene/session end; guard captured membership again before
commit. Current public root has no target-end subscription: consumers do not
reimplement it. Removed target stays terminal even if a new target uses the same
visualInstanceId. Target loss wins over pause/stop/completion and removes effect;
late resource readiness must never recreate it. Finite coordinates and plane
compatibility must be checked before mutating the effect drawable.

## Resources, revisions and release order

Host owns source grants/provider/cache and acquired page leases, supplies exact
sourceRevision plus canonical atlas revision token, and retains borrowed leases
while future sync needs them. Definition addresses retain exact subresourceId;
cache revisions/metadata tokens are not inferred from filenames or effect IDs.
No VFX IO/decoder/crop/upload-per-frame or cache eviction. An invalidated lease
cannot silently migrate an effect; new source/revision requires explicit validated
recreation after old effect removal in MVP. Unsupported trim/rotation/sourceSize
and missing authored origin remain errors, not zero/center defaults.

Phase8 retains its own usable resource right when binding; unbinding/removal
releases that right, not another consumer's. VFX remove first closes its mutation
guard and lifecycle subscriptions, then unbinds its animation binding, disposes
owned CPU playback and removes its owned drawable; attempt every step even if a
cleanup throws. Render-local hooks use existing Scene/session lifetime machinery.
Scene/session may already have drained the drawable: treat known already-ended
ownership idempotently, never recreate or release a borrowed target. Keep primary
failure separate from cleanup diagnostics and native resource reclamation unknown.
Existing Phase8 post-commit old-right cleanup failure cannot be reported as a
rolled-back admission. These are implementation requirements for later tasks.

## One-capability checkpoint map

Only VE01 is supplied/authorized now. VE02–VE13 below are planning boundaries,
not fabricated future task titles, implementation or approval. Reconcile each
future supplied task before editing; conflicting scope requires a decision.

| Checkpoint/version | One capability; API boundary | Consumer | Required success evidence / dependency gate |
| --- | --- | --- | --- |
| VE01 v0.11.0 | Architecture/lifecycle contract ledger; zero API delta | Harness, Editor/Client read-only | Actual exports+d.ts, scoped docs, architecture/build; record U1 gate |
| VE02 v0.11.1 | Immutable effect definition and exact visual references | Render data; future authoring adapter | Capture/reject finite metadata against real Phase7/10 roots; no live playback; requires supplied task |
| VE03 v0.11.2 | Independent live effect-instance creation/identity | Render host | Issued instance isolation and rollback evidence; **U1 approved+delivered**, real Phase8 membership, supplied task |
| VE04 v0.11.3 | Effect transport lifecycle commands | Editor/Client presentation intent | Explicit state/idempotence/terminal observations delegating Phase10; VE03 |
| VE05 v0.11.4 | Explicit-delta lifetime/animation coordination | Host scheduling | Once/repeat/finite/infinite boundary and rejected-delta observations; VE04, U1; no second sampler |
| VE06 v0.11.5 | World-local placement | Render Scene consumer | Matching plane/unit, finite position and stable anchor readbacks; VE03, Phase4/8, verified origin |
| VE07 v0.11.6 | Single translation-only attachment | Render target consumer | Same-scene target motion, pause-follow and terminal loss/ID-reuse observations; VE06, existing owner-local end hooks |
| VE08 v0.11.7 | Live frame/resource binding | Render drawable consumer | Exact atlas/revision/frame admissions, rejection preserves prior bound state, actual original pixels where observed; U1 binding, Phase7/8, VE05/6 |
| VE09 v0.11.8 | Multi-instance ownership and release isolation | Render manual host | Shared-definition separate playback, borrowed lease survival, late readiness/removal/Scene-end cleanup; VE07/8 |
| VE10 v0.11.9 | Editor preview integration | Editor public-root adapter | Authored-reference correlation and unchanged Document revision/dirty; same Render path; VE09, supplied Editor scope |
| VE11 v0.11.10 | Game Client presentation integration | Client public-root adapter | Explicit host deltas, pause/resume/mount teardown and no Editor runtime import; VE09, supplied Client scope |
| VE12 v0.11.11 | Minimal real-source VFX MVP composition | Existing optional manual hosts | Verified source provenance, real changing frames at world/attached positions, target loss and independent release; VE10/11 and suitable real asset; pixels or explicit VISUAL_NOT_VERIFIED |
| VE13 v0.11.12 | Integration/compatibility/MVP closure audit | Harness + all five builds | Exact merge-base/API/commit/CI ledger, real installed consumer, evidence gaps and Developer acceptance request; VE12, no new feature |

No new project/dependency/schema, effect designer, gameplay skill/buff model,
state graph, particle framework, projectile tracking, 16/32 directions or benchmark
runner is approved. Builds never certify lifecycle/pixels. Future inability to
observe mandatory asset/render proof stays BLOCKED_WITH_EVIDENCE; optional browser
gaps stay VISUAL_NOT_VERIFIED. Phase completion and merge remain Developer-owned.
