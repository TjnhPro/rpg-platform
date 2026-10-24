# SA12 real eight-direction animation manual MVP

Run from the repository root (Node/npm installed):

```powershell
npm run build -- --force
npx tsc -p runtime-render/manual/sprite-animation-mvp.tsconfig.json
node runtime-render/manual/sprite-animation-mvp-host.mjs
```

Open http://127.0.0.1:8774 in a WebGL-capable browser. The optional first server
argument is the original asset-sources directory; the second is a loopback port.
Default source directory is `../jx1-manager-editor/data/asset-sources`.
No source assets are downloaded or generated. Missing files return 404; mismatched
bytes/SHA256 fail readiness. Supply the exact original files listed in
`sprite-animation-mvp-content.json`, not lookalike replacement art.

The manifest explicitly authors all frame IDs/order for Player BODY
`player/man/Body/body00/FreeStand1_0..7` and `FreeWalk_0..7`, and Monster
`monster/ani063/NormalWalk_0..7`. Each name has one original PNG and TPSheet.
Slots are inspection-authored, exactly 0..7, with Render's right/down axes,
positive-x zero and positive-toward-y rotation. Source compass and original FPS
are unknown. Eight FPS is the explicit demonstration rate, not an asset fact.

Player has idle/walk/walk-once, A/B/C have walk/walk-once. Select actor and clip,
click Select clip, set facing slot and click Set facing, then Play. Play does not
start a clock. Step selected passes the entered delta in milliseconds directly
to canonical Render. Step main advances P/A/B with the same explicit delta.
No RAF, elapsed accumulator, frame sampler, decoder or image crop is implemented
by this host. All presentation operations import only the Render public root.

Reproduce the observed cases:

1. P idle, facing0, Stop, Play, Step125: BODY_0002. Select walk, Stop/Play,
   Step125: BODY_0002 from a different atlas, still world(90,220).
2. Repeat for facing0..7: frame1 keys BODY_0002/0018/0032/0048/0062/0078/0092/0108.
   For A walk the corresponding keys are 0002/0010/0018/0026/0034/0042/0050/0058.
   Compare actual canvas poses, not just status text.
3. P walk facing0, Stop/Play, Step125 seven times: frame0..7 keys BODY_0000..0014
   in explicit even-key order. Observe distinct leg poses and the ground line.
   Play again at875 retains875. Set facing1 retains875 but samples frame0
   BODY_0016 because that direction has seven frames (875ms repeat duration).
4. Pause then Step250 retains875. Resume then Step125 gives1000/BODY_0018.
   Stop gives0/BODY_0016. Play then Step1000000 gives frame6/BODY_0028
   (1000000 modulo875 =750). Negative delta rejects and preserves prior binding.
5. Try missing origin returns FRAME_ORIGIN_UNAVAILABLE without changing the last
   visual. Try missing frame resolves an absent source key and reports
   FRAME_NOT_FOUND; this button is a resolver observation, not a binding attempt.
6. P walk-once facing0, Play, Step1000 completes on BODY_0014. A walk Stop/Play,
   Step125; B Stop/Play, Step250: A0002/B0004. Release A, step B125: B0006 remains
   visible. Close main, step C125: independent session still displays0002.
7. Close all: playback disposed, cache disposed, CPU/GPU/leases/revisions zero,
   cleanupFailed false. SourceJobs/uploadCalls are cumulative counters, not live
   allocations. Reload to establish new scopes; closed actors are terminal.

P uses explicitly authored x12 and an inspected sole Y per frame, recorded as
literal tables in the host. Enlarged original BODY imagery was inspected before
authoring these Y values. The white dashed HTML overlay is at canvas Y220. The
anchor holds the lowest sole line there; it does not reconstruct original trim,
anatomical center, root motion or physically correct foot planting. Monster
origin is explicitly top-left0,0, with no anatomical-ground claim. Source pivot
is preserved by Phase7; no pivot/center inference or trim support is added.
Player head/hands/equipment composition is absent.

See the [checkpoint](../../harness/checkpoints/sprite-animation-v0.10.11.md)
for finite observations and limitations. Manual product acceptance is Developer-owned.
