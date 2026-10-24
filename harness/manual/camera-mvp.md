# CM20 manual Camera MVP — v0.9.13

## Build and open

From the repository root, with the pinned dependencies already installed:

```powershell
npm run build -- --force
node node_modules/typescript/bin/tsc --ignoreConfig --strict --noUncheckedIndexedAccess --exactOptionalPropertyTypes --verbatimModuleSyntax --skipLibCheck false --module NodeNext --target ES2022 --lib ES2022,DOM --typeRoots .artifacts/empty-types --rootDir harness/manual --outDir .artifacts/camera-mvp harness/manual/camera-mvp.mts harness/manual/camera-mvp-coordinates.mts
node node_modules/typescript/bin/tsc --ignoreConfig --strict --noUncheckedIndexedAccess --exactOptionalPropertyTypes --verbatimModuleSyntax --skipLibCheck false --module NodeNext --target ES2022 --lib ES2022 --typeRoots .artifacts/empty-types --rootDir harness/manual --outDir .artifacts/camera-mvp harness/manual/camera-mvp-coordinates.mts
node --input-type=module -e "import {observeCameraMvpCoordinates} from './.artifacts/camera-mvp/camera-mvp-coordinates.mjs'; observeCameraMvpCoordinates((event,value)=>console.log(event,JSON.stringify(value,(_,v)=>typeof v==='symbol'?String(v):v)));"
python -m http.server 8099 --bind 127.0.0.1
```

Open **http://127.0.0.1:8099/harness/manual/camera-mvp.html** in a WebGL2 browser.
Stop the local server after review. The emitted files must be served at their
stated paths. These are manual consumers, with no browser automation or assertions.
Build/receipt/source-acquired status is separate from displayed-pixel evidence.

## Actual sources and owner composition

Each session uses the same Render root URL `/runtime-render/dist/index.js`, with
its own canvas, camera, Scene, provider scope and resource cache. Editor uses the
existing ScenePreviewBridge with real authored Scene placements and a Document;
Client accepts neutral visuals and imports no Editor. Harness composes hosts only.
No Engine entities/gameplay positions were supplied. Map/Player/Monster are labels.

Source root: `/runtime-render/manual/scene-mvp-assets/`. The trusted committed
`manifest.json` profile is `original-scene-mvp-art-v1`. Provider reads are bounded,
allowlisted by exact identity/index/role/path/scope and checked by length/SHA256.
There is no texture fallback. The original procedural art/generator is licensed
for use/modification/redistribution without attribution: see
[provenance](../../runtime-render/manual/scene-mvp-assets/README.md).

| Path | Pixels / bytes | Source revision (SHA256) |
| --- | --- | --- |
| courtyard.png | 320x240 /1701 | 940cb2adf171150f6828d72c59f2534f412218145646fea02fd4a96390ef582f |
| traveler.png | 32x48 /236 | 2483022fb684d52f0054bf6baf4dc15d5a867a749a7828f89afbb51c4637cb2f |
| monsters.png | 96x48 /424 | dad6342f4deae4f05c198d6f80ab2cf0e80b8b7bcd440d81e4a1fcd9048b56bf |
| monsters.atlas.txt | 178 bytes | 6f690ddfddf9ca86b1b8f6e08c11b0ec05c72575abeea9bbe3ac93bd9c86663f |

The real acquired atlas metadata is parsed through Phase7: three32x48 cells at
x0/32/64, y0, no rotation/trim. This is hand-authored40300 rectangular-profile
metadata, not evidence of arbitrary TexturePacker/Unity exporter support.
`TPSHEET_NOT_VERIFIED`. Each source is decoded/uploaded by Phase7; Phase8 retains
independent usage after host leases release. Three atlas instances should share
one allocation per session. Different sessions should use distinct allocations.
This is a runtime observation to record, not a GPU leak-free guarantee.

The explicit source plane is `camera-mvp/ground`, `scene-unit`, right/down.
Map top-left is0,0; Player feet100,50; red130,70; green170,100; violet210,70.
Player/Monsters use32x48 scene extents and explicit bottom-center anchor/pivot.
Layer background priority-10 precedes actors priority0 with Phase8 ground-y/down.
Expected order: Map, Player, red, violet, green; equal y70 retains insertion order.
Camera pan does not change transforms, depth keys, frame selection or that order.
The required legacy Phase4 clip descriptor remains explicit; bound frames use
Render's existing localToScene camera path once, not host projection math.

## Worked coordinate observations (CPU, public roots)

Camera center100,50, zoom1, scale2 CSS px/scene-unit, viewport800x450 CSS.
The CPU example declares screen/client origin40,80 and scale1. Browser origin
comes from each untransformed, borderless, padding-free canvas's measured bounds.
`Viewport CSS` is distinct from `client CSS` and drawing-buffer device pixels.

| Operation / input | EXPECTED viewport CSS | OBSERVED CPU | Browser pixels |
| --- | --- | --- | --- |
| center100,50 | 400,225 | 400,225 | NOT_OBSERVED |
| world110,50 | 420,225 | 420,225 | NOT_OBSERVED |
| world100,60 | 400,245 | 400,245 | NOT_OBSERVED |
| pan center105,50; world100,50 | 390,225 | 390,225 | NOT_OBSERVED |
| reset then zoom2; world110,50 | 440,225 | 440,225 | NOT_OBSERVED |
| reset then viewport640x450; world110,50 | 340,225 | 340,225 | NOT_OBSERVED |

Roundtrip through explicit screen origin returned original coordinates, residual0
for these samples; tolerance1e-9 source units. Focus client540,280 selects150,37.5
before and after zoom2, residual0. Pixel review tolerance:1 CSS px.
Phase6 pure DPR plans yielded800x450 at1 and1600x900 at2; these are
`validated-not-applied`, not native accepted buffers. CSS projection stayed420,225.
Optional numeric 2.5D basis x(1,.5),y(-1,.5), elevation displacement(0,-2), h3:
ground4,2 -> presentation2,-3 -> CSS402,222; fixed-h inverse4,2, residual0.
Unknown height threw TypeError. No 2.5D native scene draw is claimed here.

## Browser steps and evidence to record

1. Mount, Acquire A, Acquire B; wait for both loadState values `applied`, then
   Start B. Capture loaded baseline and Inspect. EXPECTED: five actual instances
   each, real courtyard/traveler/three distinct atlas creatures visible; three
   unique resource allocations, atlasShared true, no cross-session overlap;
   cache sourceJobs/uploadCalls3 per session. Source read counts exclude the
   additional metadata read on A. Record pixels and resource stats separately.
2. Record the two distinct Camera/session identities, authored Document revision/
   dirty, transforms/resources and order. Use X/Y controls with Project to record
   the first three table rows; inverse includes current accepted resize evidence
   and measured client origin. Reset before independent table scenarios.
3. Pan A5: Player feet move10 CSS px left to390,225. B camera/image stays unchanged
   although its submission count grows. Inspect after pan/zoom/resize: all authored,
   Document, neutral-input, live-transform and order comparisons should stay true.
   Capture before changing B deliberately; bExactCameraUnchanged should become
   false after a B center/zoom action. A controls never author positions.
4. Reset A then Center zoom x2; image grows around logical viewport center. Drag A
   to pan. Wheel over a chosen visible feature: it should remain at the pointer.
   Camera projection/inverse/focus use only Render root functions. The host selects
   zoom steps and inclusive limits0.1..10; exceeding limits rejects, not clamps.
5. Reset A, set DPR1 then2: inspect accepted viewport/buffer separately from CSS
   mappings and visible image. EXPECTED buffer800x450 then1600x900; Project110,50
   stays420,225. Toggle width640: buffer1280x900 at DPR2, CSS projection340,225.
   Test B's ratio/resize separately. No host writes live canvas backing dimensions.
6. At800x450/zoom1, Bounds reject returns VIEW_EXCEEDS_BOUNDS for map0..320/0..240.
   Zoom2, Bounds reject returns CENTER_OUTSIDE_BOUNDS for requested1000,1000.
   Bounds clamp then centers220,183.75. This explicit per-request policy is not a
   persistent camera constraint: drag/pan/reset remain unrestricted by design.
7. Invalid width0, zoom0/NaN and unknown plane should reject; inspect previous view
   and resource state. Bind released B lease after real loading: expected public
   binding failure RESOURCE_NOT_USABLE, preserving old usable allocation/frame.
   Read the actual failure log; an unexpected admission is logged honestly.
8. Suspend A, change dimensions/ratio, Resume A. Zero/Restore A exercises explicit
   pause/resume. A should stop submitting while B continues. Close A and inspect
   B; disposed A has no live visual list, so compare its last pre-close snapshot.
   Recreate A uses a fresh canvas/mount. Acquire A again, await loading, capture a
   new baseline; B camera and existing resources should remain stable. This resets
   comparison baseline, not authored data; source read counters are cumulative.
9. Close both or navigate away during pending loads. Record terminal diagnostics,
   late-result release, sticky cleanup failures and cancelled host requests.
   No automatic native-loss recovery or proof of GPU reclamation is provided.

Current native observations for all nine steps: **NOT_OBSERVED / VISUAL_NOT_VERIFIED**.
Computer Use inventory returned apps[] and browsers[]. Do not turn a successful
HTTP response, build, source parse, submitted receipt or count into visual PASS.

## Source-only observation without browser graphics

With the server running, this calls the **same** provider/parser used by the page:

```powershell
node --input-type=module -e "import {loadCameraMvpSources} from './.artifacts/camera-mvp/camera-mvp.mjs'; import {createVisualSourceLoad} from '@rpg-platform/runtime-render'; const s=await loadCameraMvpSources(console.log,new AbortController().signal,'http://127.0.0.1:8099/runtime-render/manual/scene-mvp-assets/'); for(const k of ['red','green','violet']) s.frame(k); for(const [id,d] of s.descriptors) {const l=createVisualSourceLoad(d,0,s.providerA,1048576); try {console.log(id,(await l.start()).state,l.copyBytes()?.length);} finally {l.release();}}"
```

OBSERVED: metadata178 bytes acquired with matching hash, all three frame geometries
resolved; actual PNG sources acquired with1701/236/424 bytes and matching revisions.
This does not decode pixels, upload textures, create a native Scene or draw frames.
Released-resource, live ordering, native isolation/cleanup and gameplay remain
unobserved. Developer owns visual/functional acceptance.
