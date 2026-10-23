# v0.8.13 — manual seven-instance Scene Rendering MVP

**Compiled consumer only; browser NOT_EXECUTED. FEATURE_NOT_VERIFIED /
VISUAL_NOT_VERIFIED.** This is a button-driven demonstration, not a test suite.
Developer owns visual/functional review. There is no automatic pass/fail assertion.

## Preparation and exact browser path

From the workspace root after normal Foundation installation:

```powershell
npm run build -- --force
node node_modules/typescript/bin/tsc --ignoreConfig --strict --noUncheckedIndexedAccess --exactOptionalPropertyTypes --verbatimModuleSyntax --skipLibCheck false --module NodeNext --target ES2022 --lib ES2022,DOM --typeRoots .artifacts/empty-types --rootDir . --outDir .artifacts/scene-mvp runtime-render/manual/scene-mvp.mts editor/manual/scene-mvp.mts game-client/manual/scene-mvp.mts harness/manual/scene-mvp.mts
python -m http.server 8080 --bind 127.0.0.1
```

Open **http://localhost:8080/harness/manual/scene-mvp.html** in a browser with
WebGL2, ImageBitmap PNG decode, fetch streams and Web Crypto. Serve over localhost
(or HTTPS), not file://. All module import-map paths resolve to the same built
Render root; no bundler, extra package or server process is introduced by the demo.
Generated compilation under `.artifacts/scene-mvp/` is ignored, not committed.
`Open / recreate` in each host is independent; neither starts automatically.

## Authorized input sources and expected composition

See [source provenance, dimensions and regeneration](scene-mvp-assets/README.md)
and [SHA-256 manifest](scene-mvp-assets/manifest.json). All artwork is original
procedural pixel art created for this task, not third-party game content. Committed
source PNGs are actual image files, not substitute textures generated on load failure.
The static VFX image is intentionally a placeholder illustration, without playback.

One context's seven independent live handles should represent:

| Visual key | Expected illustration | Ground placement | Local extent | Layer |
| --- | --- | --- | --- | --- |
| map | Stone courtyard with green border | top-left (0,0) | 320x240 | background -10 |
| player | Blue coat, tan face, silver sword | (146,142) | 48x72 | actors 0 |
| monster-a | Red horned creature, atlas `red` | (160,150) | 48x72 | actors 0 |
| monster-b | Green horned creature, atlas `green` | (220,160) | 48x72 | actors 0 |
| monster-c | Violet horned creature, atlas `violet` | (265,150) | 48x72 | actors 0 |
| item | Gold potion image | (74,174) | 24x24 | actors 0 |
| static-vfx | Pale gold cross/spark image | (104,110) | 32x32 | overlay +10 |

Right/down scene plane, scene-unit, fixed 320x240 viewport and explicit clip-plane
projection. Non-map anchors/pivots are local bottom-center: sprite ground attachment
is its declared placement, independent of source pixel center. There is no camera,
zoom, automatic DPI fit or game world conversion. Each actor has order0; actors
opt into **ground-y, front down**. Larger ground y draws later. Layer priority wins
before depth; equal y ties use explicit order then insertion ordinal. Initial
expected actor order is Player, Monster A, Monster C, Monster B, Item. Background
precedes actors; static VFX follows them. These are expected observations, not results.

All three monsters use one descriptor, source revision and PNG atlas within each
context. Their canonical parsed frames are separate 32x48 cells. The public parser
must return `parsed` and geometry must return `resolved`; otherwise opening rejects.
Image bytes then pass through the real Phase7 cache/decode/upload/usable lease and
frame binding paths. No whole-image fallback hides atlas errors.

## Manual observation sequence — perform for both hosts

1. Open Editor, then Client. Record each successful source hash observation, parsed
   frame geometry, actual usable leases and frame receipts. Independently inspect
   the seven visible illustrations, their orientation, ground contacts and initial
   overlap. Initial Player is partially behind Monster A. Expected seven registered
   instances is distinct from seven drawable/visually observed instances.
2. Observe both. Record distinct session IDs and scene IDs, independent instance
   handles and same resource specifications. Symbol labels use actual symbol
   identity, not just identical `Symbol(...)` descriptions. Each host has its own
   provider, cache, native context and uploads. Do not compare IDs by label text
   or claim GPU sharing across contexts.
3. Click **Player in front** (y162) and **Player behind** (y142). At overlapping
   blue/red opaque pixels, Player should cover Monster A in front and be covered
   behind. Record unchanged Player handle/ordinal/binding and changed transform /
   candidate order. No instance is recreated by these controls. This is visual
   depth policy, not collision, movement rules or gameplay authority.
4. Hide Monster B: green illustration disappears; same handle/resources remain.
   Show it: reappears at unchanged position. Record visibility and next actual frame.
5. Remove Monster A: red illustration disappears, leaving six members. Monster B/C
   must still draw their correct separate green/violet frames. Compare their
   binding `resourceId` with the earlier atlas allocation: removal releases only A's
   usage. Observe `survivingMonsterAllocationShared` and real cache/scene snapshots.
   This boolean is an observation, not an assertion or visual proof.
6. Every acquire returns a temporary host lease; Client explicitly releases it
   after bind, Editor bridge releases it in its existing finally path. Instances
   retain independent rights. Observe acquire events, terminal temporary-lease
   states, scene logical usages, `cpuEntries/gpuEntries/leases`, `sourceJobs`,
   `uploadCalls`, `cpuHits/gpuHits`. These are public operation counts only: do not
   invent decode counts, decoded bytes, GPU completion or timing/speed claims.
7. Close Editor. Record bridge cleanup, scene/lease/cache/session terminal
   observations and any uncertainty. Then move/draw Client and inspect surviving
   pixels/IDs/resources. Repeat inverse disposal direction after recreating Editor.
8. Close a host, then **Open / recreate** on the **same canvas**. Only the canonical
   Phase6 acquisition decides whether it is usable/unreserved. Record new session,
   scene, instance and resource IDs, reloads and new frame/pixels. Quarantine/lost
   context rejection remains rejection; do not replace the target to disguise it.
   No automatic native context restore or retry. Close while loading is also
   available; other commands serialize per host, and a busy open must finish
   before another open. No late scene adoption/draw is permitted after close.

## Limits and current evidence

No browser actions above have been executed in this checkpoint. No pixels, frames,
stable identities, atlas allocation survival, disposal isolation or reacquisition
have been independently observed. Build and static gates establish compilation.
The demo logs **FRAME_SUBMITTED** only after actual calls return; those runtime
receipts still do not establish **VISUAL_PASS**. Record browser/version and actual
observations separately during Developer review; screenshots are not test assertions.

The hand-authored `.atlas.txt` exercises the existing 40300 rectangular parser
profile with real acquired bytes. It is not an exported TPSheet compatibility
sample. **TPSHEET_NOT_VERIFIED / TPSHEET_VISUAL_NOT_VERIFIED** remain. All atlas cells
have the full page height; no vertical packing, trim, rotation, multipage or filtering
edge correctness is proven. Binary alpha art intentionally avoids fractional-alpha
blending complexity. Painter ordering does not solve intersecting/transparent
surfaces generally; there is no alpha correctness or memory leak-free claim.

Failure after a committed operation can leave partial instance state; logs expose
that and Open failure closes the mount. Cleanup stages are independently attempted;
unknown remains unknown and canonical cleanup quarantine is never overridden.
Editor authored snapshots/catalog/bridge are local to Editor; no DocumentSession,
dirty/save/persistence effects. Client sees neutral Render inputs only. No animation,
VFX playback, game controls, networking, Engine/Server changes or phase closure.
