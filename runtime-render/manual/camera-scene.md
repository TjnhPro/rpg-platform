# v0.9.10 — optional manual Camera/Scene consumer

This is a button-driven public-root consumer, not a test/suite. Browser execution
was unavailable in this session: IAB unavailable; Computer Use inventory apps[] /
browsers[]. All native observations below are **NOT_EXECUTED / NOT_OBSERVED**.
No dummy renderer, simulated successful native session or assertion runner.

```powershell
npm run build -- --force
node node_modules/typescript/bin/tsc --ignoreConfig --strict --noUncheckedIndexedAccess --exactOptionalPropertyTypes --verbatimModuleSyntax --skipLibCheck false --module NodeNext --target ES2022 --lib ES2022 --typeRoots .artifacts/empty-types --rootDir runtime-render/manual --outDir .artifacts/camera-scene runtime-render/manual/camera-scene.mts
python -m http.server 8099 --bind 127.0.0.1
```

Open http://127.0.0.1:8099/runtime-render/manual/camera-scene.html in a real
WebGL2 browser. Serve only this checkout while reviewing; stop the server afterward.
The original Phase8 traveler PNG is local repository content with documented
permission in scene-mvp-assets/README.md. Provider grants only this path/identity,
bounded to1MiB. No external assets, upload, persistence or fallback texture.
The declared sample revision identifies the committed sample; the consumer does
not claim cryptographic attestation. Each canvas has independent session/cache/
lease, same Render implementation. No rAF or automatic submits after controls.

1. Open A+B. Each loads/decode/uploads actual PNG through Phase7, retains an
   independent Scene usage, releases the host usage, and draws once. A/B should
   each display traveler32x48 centered at160,120 in a320x240 CSS viewport.
2. Pan A. **Before Draw**, pixels should remain at the old position while A
   demand becomes true. Camera center becomes192,120; instance transform identity,
   placement160,120 and draw order remain unchanged. Draw A should move center
   to128,120 CSS, with exact applied view revision in the frame observation.
   Draw B should retain160,120; its camera view and instance remain independent.
3. Zoom A sets2 about current center: after Draw A image should be64x96 centered
   at96,120. No-op A after that draw should keep demand clean and revision unchanged.
   Submission logs alone do not prove these pixels. CSS display may scale on the
   host; compare local CSS positions, not drawing-buffer coordinates.
4. Invalid zoom/Invalid width/Wrong plane should reject without changing view or
   previous usable binding. Released lease should reject through canonical Phase7/8
   admission while the instance's independently retained resource remains usable.
5. Resize A DPR2 accepts buffer640x480 while CSS remains320x240. Draw A before
   Refresh A context should reject stale receipt without terminating session.
   Refresh A context then Draw A should keep96,120 CSS at zoom2, no doubled DPR.
6. Unbind A then Draw A restores original Phase8 placement/projection. Dispose
   camera A ends binding but leaves scene/session usable via legacy projection.
   Dispose scene A ends binding/releases its usage; Draw A can still clear.
   These are alternative paths; Close all/Open anew before the next sequence.
7. Close A then Draw B: B must remain usable. Inspect captures transform identity
   and candidates; it does not contain a gameplay or authored Document model.
8. Fresh Open A+B, Lose native context A invokes the actual WebGL loss extension
   if supported (no synthetic event). Inspect A after loss and attempt Draw A:
   no successful receipt/recovery, binding terminal, resource cleanup canonical.
   Draw B must remain independent. Extension unavailable is NOT_OBSERVED, not PASS.
9. Close all. Cleanup attempts binding/camera/scene/lease/cache/session even after
   a prior failure. No leak-free/GPU reclamation claim. Record actual output and
   observed pixels, errors, browser/environment, tolerance and unknowns separately.

Finite Node public-root evidence recorded in the checkpoint uses logical-only
CPU projection:160,120 ->128,120 after pan32 ->96,120 atzoom2; invalid zoom0,
width0, unknown plane, foreign Scene identity reject; CameraB stays unchanged.
An actual Editor-owned in-memory Scene placement and Document revision/dirty
state were logged before/after unchanged. This is **not** native Scene/world/GPU
evidence. No live gameplay consumer exists in this observation.
