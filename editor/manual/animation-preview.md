# Editor animation preview — v0.10.9 / SA10

Optional manual browser consumer, not an Animation Designer or a test suite.
Editor owns authored Asset/Scene correlation, DOM, source authorization and manual
commands/deltas. Render alone validates clips, selects frames, advances elapsed,
binds the existing instance and renders through Phase6/7/8 public APIs.
No production public-root, persistent schema, dependency or gameplay changes.

From repository root, after normal foundation preparation/install:

```powershell
node harness/cli.mjs verify --projects editor
npx tsc -p editor/manual/animation-preview.tsconfig.json
node editor/manual/animation-preview-host.mjs
```

Open http://127.0.0.1:8770. The read-only server explicitly authorizes only
NormalStand1_[0..7] and NormalWalk_[0..7] PNG/TPSheet pairs in sibling folder
../jx1-manager-editor/data/asset-sources/monster/ani063. Supply a different
authorized directory and optional port as positional arguments. Missing sources
show ASSET_NOT_AVAILABLE; no source copying, synthetic fallback or rewriting.
Editor root transitively links the installed frozen foundations; the import map
serves those actual installed modules without modifying them.

The host explicitly binds numerical slots to sources in its authored sample.
It does not discover/sort filenames or claim a source compass convention. Render
convention is right/down, zero angle0 at slot0; the UI sends numerical slots
directly, never derives gameplay facing from images.

| Slot | idle source / first-last exact keys | walk source / first-last exact keys |
| --- | --- | --- |
| 0 | NormalStand1_0 / 0000–0014 (8) | NormalWalk_0 / 0000–0006 (4) |
| 1 | NormalStand1_1 / 0016–0028 (7) | NormalWalk_1 / 0008–0014 (4) |
| 2 | NormalStand1_2 / 0030–0044 (8) | NormalWalk_2 / 0016–0022 (4) |
| 3 | NormalStand1_3 / 0046–0058 (7) | NormalWalk_3 / 0024–0030 (4) |
| 4 | NormalStand1_4 / 0060–0074 (8) | NormalWalk_4 / 0032–0038 (4) |
| 5 | NormalStand1_5 / 0076–0088 (7) | NormalWalk_5 / 0040–0046 (4) |
| 6 | NormalStand1_6 / 0090–0104 (8) | NormalWalk_6 / 0048–0054 (4) |
| 7 | NormalStand1_7 / 0106–0118 (7) | NormalWalk_7 / 0056–0062 (4) |

All keys, including leading zeros, are explicitly listed in source; the table
abbreviates them. Each sequence retains its own resource and actual frame count.
Render resolves every address against canonical parsed metadata. No renaming,
padding or eight-copy substitute. idle150ms and walk125ms are authored inspection
timing, not verified source FPS or game states.

Choose clip/direction, Play, then Step to supply entered deltaMs. Pause + Step
retains elapsed; Resume continues it. Stop resets through Render and Step remains
stopped. Direction changes retain logical elapsed; a different clip uses Render's
stopped-zero transition. Invalid deltas are rejected by Render; failure displays
without replacing the last valid bound frame. A valid command can recover.

One preview bridge creates the Phase8 subject instance with Scene/object
correlation. One playback/binding subsequently updates the same instance. The
bridge is not resynchronized over playback frames. Phase7 owns decode/upload/
retained rights; all16 pages preload for this small sample, not a streaming policy.

Inspection anchor/pivot is explicitly frame-top-left(0,0), offset0, pixel ratio1.
Placement stays(140,90) in a320x240 plane submitted to a640x480 buffer. No artist
ground, trim, original untrimmed origin or sourcePivot semantics are inferred.
Source compass/FPS, game roles and redistribution rights remain unestablished;
original art stays outside this repository.

Status exposes clip/direction/frame/elapsed, canonical bound frame, correlation
and Document evidence. The sample is genuinely unsaved: revision1/dirty=true;
preview must not clear or increase these. It never replaces/saves authored
content or updates Scene placement.

No RAF, timer, elapsed accumulator or scheduled frame callback. Hidden-tab policy
pauses and requires explicit Resume. Close/pagehide latch closed, disable controls,
detach listeners, revoke/abort provider reads, release pending metadata, drain
bridge instances, unbind, dispose playback, release host leases, then dispose
Scene/cache/session. Cleanup continues after exceptions and reports uncertainty.
Late acquisition never adopts into a closed mount. The authored Document remains
for final readback; preview close is not an authored discard/save action.

See [actual observations and limits](../../harness/checkpoints/sprite-animation-v0.10.9.md).
Compilation, submitted receipts and finite observations do not establish general
visual acceptance or Phase10 MVP_PASS.
