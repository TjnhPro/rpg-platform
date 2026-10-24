# CM19: independent Editor and Client camera hosts

Run from the workspace root in PowerShell with installed workspace dependencies:

```powershell
npm run build -- --force
node node_modules/typescript/bin/tsc --ignoreConfig --strict --noUncheckedIndexedAccess --exactOptionalPropertyTypes --verbatimModuleSyntax --skipLibCheck false --module NodeNext --target ES2022 --lib ES2022,DOM --typeRoots .artifacts/empty-types --rootDir harness/manual --outDir .artifacts/camera-hosts harness/manual/camera-hosts.mts
node node_modules/typescript/bin/tsc --ignoreConfig --strict --noUncheckedIndexedAccess --exactOptionalPropertyTypes --verbatimModuleSyntax --skipLibCheck false --module NodeNext --target ES2022 --lib ES2022 --typeRoots .artifacts/empty-types --rootDir editor/manual --outDir .artifacts/camera-workspace editor/manual/camera-workspace.mts
node --input-type=module -e "import {observeCameraWorkspace} from './.artifacts/camera-workspace/camera-workspace.mjs'; observeCameraWorkspace((event,detail)=>console.log(event,JSON.stringify(detail,(_,v)=>typeof v==='symbol'?String(v):v)));"
python -m http.server 8099 --bind 127.0.0.1
```

Open http://127.0.0.1:8099/harness/manual/camera-hosts.html in a WebGL2 browser.
Stop the server after review. These are a manual page and finite API observations,
not a test runner. No automatic browser actions/assertion suite are supplied.
The emitted .artifacts script must be served at the stated path. Harness alone
composes the optional hosts; neither production project imports the other.

## Inputs and ownership

Render remains the canonical camera/projection/Scene/resource owner. Editor calls
its existing public Scene preview bridge with captured authored placement; Document
is held outside the host. Client uses one manual neutral presentation point, never
an Engine entity or fake gameplay position. No smoothing or picking is implemented.
Both hosts import Render only from @rpg-platform/runtime-render. Private browser
entries are absent from the public package roots. No Render export is needed.

Each host owns separate graphics acquisition, canvas, camera, Scene, cache/provider
scope and Phase7 usage. They share the real Render module, not a native context or
GPU allocation. The original traveler.png and its manifest supply 32x48 pixels.
The provider checks exact identity/path/scope, budget, length and SHA-256 revision.
Loading failure has no placeholder. Presentation extent is explicitly32x48 scene
units at zoom1. The legacy Phase4 clip descriptor is required Phase8 input; bound
frames use Render's canonical camera/localToScene path, with no second projection.

Canvas CSS must be untransformed, borderless and padding-free (outline is safe),
with one CSS px per client-coordinate unit. ClientX/Y use an explicit screen plane
and measured bounds origin. Selected-plane inverse, focus mapping and projection
come from Render. Input delta and zoom step policy belong to Editor. DPR affects
Phase6 accepted buffers once, never camera math. Stop/hidden/zero-layout require
explicit resume/start. Native loss has no automatic recreation.

Both mounts close synchronously and drain late graphics/leases. Content cleanup
attempts every stage, retains its first error and blocks re-acquisition through
that mount on uncertain cleanup; session disposal still runs in finally. Inspect
retains historical camera state. No GPU reclamation/leak-free claim is made.

## Manual browser observations to record

1. Mount both, Acquire A and Acquire B. Inspect after loads: Editor outcomes must
   be applied and Client loadState applied. Start B after acquisition settles.
   A draws on demand; B keeps submitting when demand is clean. Both should show
   the traveler at local CSS160,120, extent32x48. Inspect reports distinct issued
   Camera/session IDs. Receipts alone are not displayed pixels.
2. Record B's view/count and authored/Document/neutral-placement snapshots. Pan A
   (5,0): EXPECTED A center165,120 and visual anchor155,120; B remains160,120.
   Inspect should keep all unchanged-input observations true. Pixel tolerance is
   1 CSS px; these integer CPU projections use1e-9.
3. Drag A to pan. Wheel at a visible point: EXPECTED the selected-plane point stays
   under the pointer. Inclusive zoom limits0.1..10 reject an excessive step, without
   clamping/partial camera commit. Authored placement and Document revision/dirty
   remain unchanged. Inspect counts twice without new input: clean A should idle.
4. Change A ratio1->2: EXPECTED buffer640x480 at CSS320x240, same CSS projection.
   Toggle width A: preserve-scale changes visible extent, not center/zoom. Camera
   binding refreshes after each accepted Phase6 resize receipt.
5. Suspend A, change its ratio/size, Resume A; then Zero A/Restore A. Suspension
   cancels A's callback. B count should keep rising with unchanged view/placement.
   Unmount A and repeat B observation. The two hosts have separate listeners/rAFs.
6. Center B/Zoom B change only B presentation. These are neutral inputs, not Player
   follow or Engine state. Stop/Start B retain intent and accept fresh viewport
   context before another frame. Existing Phase6 Client page still has its old
   acquire/configure/explicit-start policy when no camera content is supplied.
7. Reload; Mount/Acquire, immediately Unmount while graphics/PNG loading is pending.
   Late graphics must be disposed and leases drained; closed hosts never adopt a
   result or schedule. Reload for a new mount.
8. Fresh pair: Native context loss A uses the actual WebGL extension if available.
   Inspect after dispatch: Render decides terminal state. A must not return a
   submitted receipt afterward; B continues. Unsupported loss is NOT_OBSERVED.
   Cleanup uncertainty is logged; reload instead of retrying that content mount.
9. For expired native resource/invalid binding admission through the public root,
   use existing runtime-render/manual/camera-scene.html and its guide: Released
   lease, Invalid width/zoom/Wrong plane. This page exposes no raw resource or
   backend handles. CPU negatives do not prove real resource-expiry behavior.

## EXPECTED / OBSERVED / NOT_OBSERVED

Finite public-root CPU observations: pan5 mapped160,120->155,120; pointer client
240,180 with origin40,80 selected source205,100 before/after zoom2; A placement then
projected110,140. B retained its exact view and160,120 after A disposal. Authored
Scene and full Document snapshots stayed equal (revision1, savedRevision null,
dirtytrue). Invalid width0, zoom0 and unknown plane threw TypeError with identical
A view. Safe UNKNOWN_FAILURE is honest for unbranded camera errors, not a new
stable camera failure code. These are specific CPU observations only.

Browser inventory returned apps[]/browsers[]. All pixels, native frame scheduling,
accepted DPR/resize, resource-expiry, context-loss and late-unmount paths above are
NOT_OBSERVED. Live Engine/gameplay positions are absent. FEATURE_NOT_VERIFIED /
VISUAL_NOT_VERIFIED remains. During Developer review record browser/version,
controls, counters, receipts, pixel tolerance and failures separately.
