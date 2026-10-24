# Client animation integration - SA11

Build the Client and strict optional browser consumer:

```powershell
node harness/cli.mjs verify --projects game-client
npx tsc -p game-client/manual/animation.tsconfig.json
node game-client/manual/animation-host.mjs
```

Open http://127.0.0.1:8772. Select all32 original PNG/TPSheet files for
NormalStand1_0..7 and NormalWalk_0..7, for example from the sibling
jx1-manager-editor/data/asset-sources/monster/ani063. The server serves only local
compiled modules, never locates or fetches these assets; file selection grants
read access through the existing Client File capability adapter. Nothing is
copied into the repo. Missing pairs fail honestly. The optional Deny checkbox
withholds image access for a real SOURCE_NOT_FOUND review; no generated fallback.

Mount new scene closes the previous generation, then prepares explicit grants.
Start uses the existing Phase6 continuous host and Phase9 camera. Every frame
repeats the same opaque clip/orientation/playing intent and passes the host RAF
timestamp difference to Render. Render alone accumulates elapsed and chooses the
frame. First frame after Start/Pause/hidden cancellation has delta0. Hidden or
zero size pauses and requires an explicit Start; no catch-up on visibility return.
Recurring intent does not replay a completed once clip. A changed clip follows
Render selectClip semantics; a changed orientation uses Render quantization and
preserves elapsed. Unchecking Playing sends stop (reset), not host teardown.

Pause suspends presentation. Stop / Close scene, scene switch, pagehide and
terminal session close playback/binding, instance/scene, camera, leases/caches,
selected file grants and the existing host observers/callback. A closed mount
cannot Start; explicit new Mount is required. Late file digest/source/acquisition
results cannot adopt readiness after close. No automatic reconnect. Observe
reads current canonical state; frame callbacks avoid rewriting status each frame.

Authored inspection slots0..7 correspond explicitly to source suffixes0..7;
frames retain exact TPSheet keys. This is not a verified compass mapping, authored
source FPS or gameplay action. The inspection anchor is explicitly top-left0,0,
not a claim about anatomical feet, trim or original untrimmed origin. Placement
stays140,90. Render owns resource decoding/cache/UV/geometry/draw behavior.

For independent Editor comparison, compile/run the existing SA10 preview on8770
and open a separate tab. Step Editor while Client is paused; close Client and
read Editor again. No Editor import exists in Client. Browser package root
stays headless; this private optional entry is never exported/imported there.

See the [checkpoint](../../harness/checkpoints/sprite-animation-v0.10.10.md) for
actual finite browser evidence and explicit nonobservations. No test suite or
MVP/product acceptance claim accompanies this manual procedure.
