# Texture upload — optional manual consumer

Render owns GPU upload and deletion; this Editor sample authorizes only the
existing original [2x2 PNG](png-sample/README.md). No sprite, draw path or frame
submission is added. Empty canvases are expected; inspect the trace manually.
No assertions, mocks, runner or browser automation.

```powershell
npm run build -- --force
node node_modules/typescript/bin/tsc --ignoreConfig --strict --noUncheckedIndexedAccess --exactOptionalPropertyTypes --module NodeNext --target ES2022 --lib ES2022,DOM --outDir .artifacts/texture-manual editor/manual/texture-upload.mts
python -m http.server 4173 --bind 127.0.0.1 --directory .
```

Open `http://127.0.0.1:4173/editor/manual/texture-upload.html` in a browser with
WebGL2, ImageBitmap, WebCrypto and import maps; click Run. Record actual browser,
GPU availability, exceptions and snapshots. Stop server with Ctrl+C.

Inspect source-acquired, image-decoded, explicit nearest/linear uploads in A and
an independent upload in B; no native object should appear. CPU image release
should leave GPU resources usable. Cross-session observation should reject with
CONTEXT_MISMATCH. Explicit texture release should be terminal/idempotent; A's
other resource should become invalidated on disposal while B stays usable.
Reacquiring A creates a new session: the old resource remains invalid. Finally B
becomes invalidated. These are instructions for observation, not recorded results.

Native context loss can be inspected separately by a Developer using browser GPU
tools while the resources are live. This finite example does not simulate a loss
event, force loss of the borrowed canvas, instrument deletion counts, or prove
driver memory reclamation. Session disposal/reacquisition is not native loss.
Native allocation/upload failure cleanup remains unobserved here. Usable means
native upload accepted without detected GL error; not GPU completion or display.
Current checkpoint: FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED / TPSHEET_NOT_VERIFIED.
