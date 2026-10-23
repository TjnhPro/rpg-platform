# Optional manual Editor Scene preview — v0.8.11

Status: **compiled only; browser NOT_EXECUTED**. No test or auto-run entry.
Use a real browser host and authorized PNG provider/catalog from Phase7; no bundled
sample asset, mock engine/lease, TPSheet parser or fabricated readiness.

Compile after workspace build:

```powershell
node node_modules/typescript/bin/tsc --ignoreConfig --strict --noUncheckedIndexedAccess --exactOptionalPropertyTypes --verbatimModuleSyntax --skipLibCheck false --module NodeNext --target ES2022 --lib ES2022 --typeRoots .artifacts/empty-types --rootDir editor/manual --outDir .artifacts/scene-preview editor/manual/scene-preview.mts
```

Serve the workspace over HTTP. In an existing browser host use the same public root
import-map URLs for Editor and Render as the other manual entries (Editor:
`/editor/dist/index.js`, Render: `/runtime-render/dist/index.js`, Three:
`/node_modules/three/build/three.module.js`). Import
`/.artifacts/scene-preview/scene-preview.mjs`. Call `openEditorScenePreview` with:
host binding `{target: canvas}`, real `VisualSourceProvider`, matching catalog,
the catalog's image assetId, an intentionally absent assetId, actual host source
revision, and a report callback. Image source must be at descriptor source index0.
Use a dedicated 320x240 canvas; explicit source projection covers that extent.
The function creates canonical graphics/cache/scene, then invokes the real Editor
bridge. It returns controls after initial asynchronous loading. No second renderer.

Manual observations to record (expected, not already observed):

1. Inspect initial outcomes: three applied objects sharing one asset, one diagnosed
   UNRESOLVED_REFERENCE; authored before/after JSON includes all four objects.
2. Record `inspect()` instance handles/IDs and cache counts. Call `moveFirst(180)`;
   record stable handles/IDs and no extra acquire/upload from placement-only sync.
3. Call `visibility(false)`, `visibility(true)`, `ordering(5)`; inspect/draw the same
   instances. These preview policies are runtime-only, not authored schema fields.
4. Call `removeSecond()`. Record only object-b removed; object-a/c identities and
   shared resource rights remain usable. Missing authored object is still present
   in serialized input with a diagnosed outcome; no repair/deletion is attempted.
5. If a host DocumentSession is open, separately record `getSnapshot()` before and
   after each preview-only sync: current/saved revisions and dirty/save state must
   stay unchanged. The bridge never receives that session or writes the document.
   Changing authored content through a separate authoring operation has its normal
   revision semantics and must not be confused with a preview sync side effect.
6. Call `close()` before unmounting canvas; inspect reported bridge cleanup and
   remaining exceptions. For late-load behavior, start a slow authorized provider
   sync then close while pending; record diagnosed closure and no late adoption.

Frame receipts prove submission only. Capture actual browser observations manually
before claiming identity/lifetime/rendering success. No absolute GPU leak-free claim.
Whole PNG consumer; canonical frame input is supported by the bridge but TPSheet
and atlas pixel observations remain unverified. General alpha limitations inherited.
