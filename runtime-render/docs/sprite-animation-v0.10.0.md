# SA01 — Sprite and eight-direction animation foundation

**API_DESIGN_ONLY.** Every Sprite* name below is a proposal, not an installed
export. v0.10.0 implements no sequence validator, mapping or playback. Existing
Phase4/6/7/8/9 contracts remain unchanged. Baseline is main
`78dc4a9d14288df33ca46b3af4d23d09ceef9b82`; see the
[actual API inventory](sprite-animation-api-inventory-v0.10.0.md).

## One-page contract map: six seams

| Seam | Data / operation proposed | Single canonical owner and invariant |
| --- | --- | --- |
| 1. Frame sequence | SpriteFrameSequence, createSpriteFrameSequence | Render captures ordered nonempty Phase7 VisualFrameReference values; no IO, fabricated keys, crop or resource ownership |
| 2. Clip identity + timing | SpriteAnimationTiming/Input, createSpriteAnimationTiming; EightWaySpriteClip/Input, createEightWaySpriteClip; SpriteAnimationSet/Input, createSpriteAnimationSet | Render validates neutral immutable definitions; Editor/host authors projectId/setId/clipId and references; interval normalized once; strings are not game states |
| 3. Exactly eight directions | SpriteDirectionIndex, SpriteEightWayConvention, SpriteDirectionSequences; selectEightWaySpriteDirection | Render maps canonical Phase4 orientation to explicit slots0..7; no fallback/mirror/filename sort or configurable direction count |
| 4. Independent playback | SpriteAnimationPlayback/Snapshot, createSpriteAnimationPlayback | Render owns one independent CPU timeline per issued handle; explicit deltaMs only; no session/clock/global registry required for pure playback |
| 5. Frame + origin binding | SpriteAnimationBinding/Input/Snapshot, bindSpriteAnimationToVisualInstance | Render adapts selected Phase7 frame and caller-held page lease to an existing Phase8 instance; explicit fixed local draw rectangle, no placement/depth/camera write |
| 6. Disposal/frame submission | binding.dispose + playback.dispose; existing invalidateRenderFrame and session.renderFrame | Render playback owns CPU state only; Phase8 owns retained bound usage; Phase7 owns cache/lease; Phase6 owns native frame/cleanup; host owns scheduling and source acquisitions |

Flow: authored references -> Render immutable sequence/eight-way clip/set ->
independent playback -> selected VisualFrameReference -> canonical Phase7
resolveAtlasFrame/resolveAtlasFrameGeometry + Phase8 bindRenderVisualInstanceResource
-> Phase8 draw candidates -> existing Phase6 session.renderFrame (optional Phase9
camera). No animation completion event changes HP, movement, AI, rewards or skills.
Engine alone owns gameplay intent/consequences; Client passes presentation intent.
Server can omit this entire path. Editor and Client import Render root, never each
other or private backend/cache/source files. There remain exactly five projects.

## Proposed public shape (not implemented or compile evidence)

All below belong to @rpg-platform/runtime-render root in later scoped checkpoints.
All records are readonly, detached/deep-frozen on capture. Reject unknown fields,
accessors, malformed plain records, nonfinite values and unsupported kinds;
unknown host exceptions propagate. No symbols in authored serializable data.

- SpriteFrameSequence: `{ frames: readonly VisualFrameReference[] }`.
  Factory createSpriteFrameSequence(input: SpriteFrameSequence): SpriteFrameSequence.
  Ordered, nonempty; duplicate references allowed as intentional repeated holds.
  Each reference is captured by createVisualFrameReference. All frames in one
  sequence share exact projectId/resourceId and have non-null subresourceId for
  this atlas-only MVP. Preserve `"0012"` verbatim, never parse/sort numeric IDs.
  Reference capture does not prove that a frame exists or a texture is loaded.
- SpriteAnimationTimingInput: exclusive `{ fps: number }` OR
  `{ frameIntervalMs: number }`; presence of both/neither rejects at runtime too.
  SpriteAnimationTiming: `{ frameIntervalMs: number }` only.
  Factory createSpriteAnimationTiming(input: SpriteAnimationTimingInput):
  SpriteAnimationTiming; normalized positive finite interval, no retained FPS.
- SpriteDirectionIndex: `0|1|2|3|4|5|6|7`.
  SpriteDirectionSequences: readonly tuple of exactly eight SpriteFrameSequence
  values, tuple position is the explicit slot; holes/extra entries reject.
  SpriteEightWayConvention: `{ axes: VisualOrientation2D['axes'],
  zeroAngleRadians: number, zeroIndex: SpriteDirectionIndex }`.
  Its zeroAngle is canonical Phase4 [0,2π), not a replacement zeroAxis convention.
  selectEightWaySpriteDirection(convention: SpriteEightWayConvention,
  orientation: VisualOrientation2D): SpriteDirectionIndex.
- EightWaySpriteClipInput: `{ clipId: string, timing: SpriteAnimationTimingInput,
  mode: 'once'|'repeat', convention: SpriteEightWayConvention,
  directions: SpriteDirectionSequences }`.
  EightWaySpriteClip has the same fields except timing is SpriteAnimationTiming.
  createEightWaySpriteClip(input: EightWaySpriteClipInput): EightWaySpriteClip.
  All directions mandatory. Counts can differ; one interval applies to all frames
  and slots of this clip. Per-frame durations are excluded.
- SpriteAnimationSetInput: `{ projectId: string, setId: string,
  clips: readonly EightWaySpriteClip[] }`; SpriteAnimationSet is its captured form.
  createSpriteAnimationSet(input: SpriteAnimationSetInput): SpriteAnimationSet.
  Nonempty, unique exact clipIds within this set; all references same project.
  IDs nonempty and whitespace-free, case-sensitive; resource IDs retain Phase7
  rules. Different clips/directions may reference different explicit resources.
  Replacement set creates a new immutable definition; no in-place hot reload.
- createSpriteAnimationPlayback(set: SpriteAnimationSet, initial:
  `{clipId: string, direction: SpriteDirectionIndex}`): SpriteAnimationPlayback.
  Handle readonly methods: getSnapshot(), selectClip(clipId), setDirection(index),
  play(), pause(), stop(), advance(deltaMs), dispose(). Every method returns
  SpriteAnimationPlaybackSnapshot; no other return-type overloads or callbacks.
  Constructor starts stopped at frame0. Issued ephemeral symbol ID, never setId,
  instanceId/sessionId/gameplay ID. No session allocated or required.
- SpriteAnimationPlaybackSnapshot: `{ id: symbol, projectId: string,
  setId: string, clipId: string, direction: SpriteDirectionIndex,
  state: 'playing'|'paused'|'stopped'|'completed'|'disposed',
  elapsedMs: number, frameIndex: number, frame: VisualFrameReference }`.
  elapsed is within current direction duration (repeat half-open; once closed).
  Historical snapshots remain readable. No GPU readiness/display implication.
- SpriteAnimationBindingInput: `{scene: RenderVisualScene,
  instance: RenderVisualInstance, playback: SpriteAnimationPlayback,
  layout: RenderVisualSpriteLayout, pages: readonly {
  descriptor: VisualResourceDescriptor, imageSourceIndex: number,
  expectedSourceRevision: string, resource: VisualResourceLease,
  atlas: AtlasMetadata, expectedAtlasRevision: symbol, pixels: AtlasPagePixels
  }[] }`.
  bindSpriteAnimationToVisualInstance(input: SpriteAnimationBindingInput):
  SpriteAnimationBinding. Root names reused here are real Phase7/8 types.
  pages must uniquely cover every referenced atlas page in the selected set;
  retain exact resource/descriptor/sourceIndex/atlas-page attestations, no lookup
  by filename or inference from matching dimensions. Admission resolves every
  frame through Phase7, checks geometry/origin policy and usable session rights.
  Runtime atlas token/leases never enter authored clip/set data.
  Descriptor-to-uploaded-page identity remains an explicit host attestation under
  Phase7, not something inferred/proven from equal size or revision strings.
- SpriteAnimationBinding has getSnapshot(), apply(), dispose(), all returning
  SpriteAnimationBindingSnapshot. Snapshot:
  `{state: 'active'|'disposed'|'failed', playbackId: symbol,
  applied: SpriteAnimationPlaybackSnapshot|null,
  resource: RenderVisualResourceBindingSnapshot|null, cleanupFailed: boolean}`.
  applied means last successfully bound selection, never submitted/displayed.
  resource is the latest available public Phase8 observation; null can mean none
  or unavailable observation on failure, never successful cleanup evidence.
  apply pulls current playback snapshot; it never advances time or renders.
  One exclusive binding per playback/visual instance is the proposed MVP policy.
  dispose is terminal/idempotent. No public global binding registry/subscriptions.

No APIs are added now. Names checked against actual package-root export sets;
implementation checkpoints must recheck signatures/collisions and consumers.
Do not silently add camera, clock or error cases to existing closed unions.
Separate future animation diagnostics need their own scoped additive design.

## Eight-direction lock and tie examples

Use createVisualOrientation2D for canonical finite angle and exact axes validation.
Numeric zero is +x; positive angles advance toward +y. For right/down axes this is
clockwise; for right/up it is counterclockwise. These are visual sectors, not a
movement restriction. Convention axes must exactly match orientation and instance
placement axes, otherwise reject; no implicit conversion or angle wrapping input.

Sector width w=2π/8=π/4; centers at zeroAngle + k*w modulo2π. Nearest-center sectors
are lower-inclusive/upper-exclusive around each center; at an exact half-sector
tie choose the next slot in positive angular order (wrap7 ->0). Mathematical rule:
`slot = (zeroIndex + floor(mod(theta-zeroAngle+w/2, 2π)/w)) mod 8`.
Modulo here is positive normalization of the relative angle, never permission to
accept noncanonical input. Binary64 boundary rounding must be documented; no
arbitrary epsilon band or universal precision guarantee.

| Input, axes right/down, zeroAngle0, zeroIndex0 | Proposed selected index |
| --- | --- |
| angle0 /45° /90° /135° /180° /225° /270° /315° |0 /1 /2 /3 /4 /5 /6 /7 |
| angle22.5° (π/8), exact theoretical boundary |1 |
| angle just below22.5° |0 |
| angle337.5° (15π/8), boundary7 ->0 |0 |
| angle0 with zeroIndex3 instead |3; angle45° ->4 |
| negative angle,2π,NaN, foreign axes, missing direction entry | reject |

This table is design arithmetic, **NOT_OBSERVED animation behavior**. No frame
sequence is inferred from an atlas's stored order; all eight tuple entries authored.
No 16/32-way setting, flips/mirrors, shortest-angle hysteresis or fallback clip.

## Timing and state transitions

Normalize FPS as1000/fps; interval input is already milliseconds. Both input and
normalized result must be finite and >0, with a finite positive duration
D=N*interval for every direction. Reject overflow/underflow or unrepresentable
advance/remapping; never coerce invalid time into a successful frame.
advance validates finite deltaMs>=0, even while paused/stopped/completed. Pure
elapsed uses explicit host delta only; no Date/performance/RAF/native receipt or
frame-count clock. Render neither clamps long pauses nor invents a fixed timestep.

For playing repeat: t advances modulo D, frame=floor(t/interval), 0<=t<D.
For once: t=min(t+delta,D); frame=min(N-1,floor(t/interval)); at t=D state completed.
An implementation must avoid overflowing intermediate sums and reject arithmetic
whose result cannot satisfy these finite interval bounds; no unbounded loop over
skipped frames or accumulated loop counter. Zero delta preserves snapshot identity.
Frame skipping under a large explicit delta is presentation only, no gameplay event.

| Operation / prior state | Proposed result |
| --- | --- |
| play from stopped | playing at retained frame0/time0 |
| play from paused | playing at retained exact elapsed/frame |
| play while playing/completed | no-op; completed needs explicit stop then play to restart |
| pause while playing | paused, no progress change |
| pause from other active states | no-op |
| stop/reset from any active state | stopped, elapsed0/frame0; repeated stop at0 no-op; no separate implicit restart |
| selectClip same exact clipId in same captured set | no-op in any active transport state; never resets elapsed |
| selectClip different valid clipId | retain direction, reset elapsed0/frame0, stopped; caller explicitly play |
| advance paused/stopped/completed | validated delta, no elapsed/frame change |
| advance playing once at D | completed, final frame retained indefinitely, no automatic next clip |
| setDirection same index | no-op |
| setDirection different valid index | preserve normalized progress u=t/D, new time=u*newD; preserve transport, including completed final frame; no restart |
| dispose | terminal disposed snapshot; methods other than read/repeated dispose reject |

Different slot counts therefore preserve cycle fraction, not absolute frame index.
Example interval100ms: N4,t150 ->u0.375 ->N8,t300/frame3, same playing/paused state.
Repeat remapping must remain <newD despite rounding; reject an unrepresentable
boundary rather than silently wrapping to zero. Once completed maps to newD and
new final frame. Direction change never mutates VisualOrientation2D, placement or
layer/depth. Hosts may call the pure mapping function then setDirection explicitly.
All rejected CPU updates preserve the exact prior snapshot; no partial clip/time
commit. Independent handles can share immutable definitions and advance differently.

## Origin authority and minimum legitimate live composition

Phase7 sourcePivot is numeric source metadata only. It does not declare a unit,
normalized-vs-pixel semantics, trim offset or Render anchor. Current geometry is
rotation:none, trim:null, sourceSize:null; null means unavailable, not untrimmed.
Do not subtract sourcePivot, assume image center/feet, add zero trim or reconstruct
original dimensions. Future rotated/trimmed decoding belongs to Phase7.

MVP binding requires one explicitly authored fixed RenderVisualSpriteLayout for
the entire bound set, in the existing instance's local unit/axes. Width/height and
local x/y are intentional draw rectangle values, not derived pixel dimensions.
Host explicitly chooses how each verified source rectangle maps into that same
local destination rectangle (including any intentional scaling). The stable
VisualAnchor2D/local transform remains Phase4/8-owned; phase10 changes UV/resource
only. Different source frame dimensions alone do not imply a different origin.
Assets requiring automatic trim recovery/per-frame origin corrections reject as
unsupported unless the required explicit source facts/contracts are supplied by
their owner. No implicit centering or aspect-ratio policy.

Existing Phase8 layout and binding updates are separate public operations, with
no atomic combined transaction. Thus dynamic per-frame layout/anchor changes are
**not supported by this proposed fixed-layout MVP**. Configure/validate the fixed
layout as a separate explicit host authoring action before attaching animation;
attach requires that exact layout already exists. If later requirements demand
atomic variable-layout updates, stop for a scoped Phase8 additive contract decision,
never pretend two setters are atomic or patch Scene state privately.

## Resource/lifetime sequence and failure boundary

1. Host acquires actual metadata bytes through Phase7 provider/load, parses atlas,
   records canonical getAtlasMetadataRevision token and attests decoded page/source
   identity. Captured frame references are not these live capabilities.
2. Host owns a canonical cache and its usable page leases for the existing session.
   The binding borrows those explicit leases for its lifetime, retaining no new
   loader/cache/graphics session and never deep-importing retainVisualResourceLease.
   Host keeps all input leases usable until binding disposed; no hidden auto-fetch.
3. Bind/apply resolves exact selected frame/revision/page with Phase7 root APIs;
   binds through bindRenderVisualInstanceResource with expected source revision.
   Phase8 itself retains an independent usage right. Switching within one atlas
   changes UVs using the same texture allocation; no crop/upload-per-frame.
4. A successful Phase8 resource change invalidates through its canonical edit path.
   Host alone schedules session.renderFrame. No extra explicit invalidation is
   needed when Phase8 already did it. No-op selection/application causes no redraw.
5. Multiple playback handles/instances may share page allocations within a session,
   but have independent elapsed/direction/transport. Different sessions require
   independent usable session rights, no cross-context GPU-sharing claim.
6. Binding.dispose clears only its exclusively controlled instance resource via
   Phase8 null bind, then drops borrowed references. It does not delete the instance,
   dispose the host cache/session/camera, or release host leases. No restore of a
   previous resource is promised. Playback.dispose owns CPU state only; host
   disposes binding before playback, then releases host leases/cache/session.
7. Scene/session disposal already drains Phase8 retained rights and invalidates
   Phase7 resources. No public terminal subscription exists for animation today;
   future adapter must observe via public snapshots on each read/apply/dispose,
   become terminal and drop references, not invent a notification API. Host must
   still explicitly dispose the adapter on unmount. No leak-free claim is inferred.

Missing frame/clip/direction, stale atlas token, wrong descriptor/page/revision,
expired/foreign lease or disposed instance/session reject, no fallback. External
writes to the exclusively animated resource/layout are unsupported; adapter must
recheck public current instance state and reject interference before applying.
Pure playback can advance independently of native availability. Binding.applied
is distinct from current CPU selection, allowing truthful last-bound observation
if admission fails. No automatic rewind of gameplay/time after a rendering failure.

**Important existing failure seam:** Phase8 bind validates a candidate before
commit, then commits it *before* releasing old usage. Old cleanup can throw after
the new binding is installed. An adapter cannot promise universal rollback.
Pre-commit admission rejection leaves last valid binding/applied unchanged;
post-commit cleanup/native failure must mark binding failed, preserve cleanup
uncertainty and report actual public resource observation, never claim old frame
remains bound or retry blindly. Partial attach likewise reports failure and drains
its own references; canonical owners retain cleanup policy. Native failures remain
existing branded errors or unknown; do not grow legacy diagnostic unions silently.

## Readiness and exclusions

Existing dependencies are source/build-ready, not visually accepted. Phase9 merge
and green CI do not prove animation pixels. No eight-direction animation asset
has been provided or verified; the existing Map/Player/three Monster art does not
supply eight direction sequences. This is not a blocker for design or subsequent
pure capture work; actual eight-way visual MVP is blocked until verified real
source/geometry/provenance exists. No dummy frames or source path inference.

No new production module, parser, engine, export, UI, scheduler, demo or test here.
Only the supplied checkpoint is delivered. v0.10.1 requires its standalone task and
fresh delta preflight; planned names do not constitute implementation evidence.
