# v0.8.9 manual Visual Scene frame consumer

Optional Developer observation only. Current implementation was compiled; browser
execution and all pixel/behavior observations below are **NOT_EXECUTED**. No tests.

From workspace root, build and compile the portable consumer:

```powershell
npm run build -- --force
node node_modules/typescript/bin/tsc --ignoreConfig --strict --noUncheckedIndexedAccess --exactOptionalPropertyTypes --verbatimModuleSyntax --skipLibCheck false --module NodeNext --target ES2022 --lib ES2022 --typeRoots .artifacts/empty-types --rootDir runtime-render/manual --outDir .artifacts/visual-scene-frame runtime-render/manual/visual-scene-frame.mts runtime-render/manual/visual-instance-depth.mts runtime-render/manual/visual-instance-ordering.mts runtime-render/manual/visual-instance-visibility.mts runtime-render/manual/visual-instance-transform.mts runtime-render/manual/visual-instance-resource.mts runtime-render/manual/visual-instance-operations.mts runtime-render/manual/visual-instance-membership.mts runtime-render/manual/visual-scene-lifecycle.mts
python -m http.server 8080 --bind 127.0.0.1
```

Open `http://127.0.0.1:8080/runtime-render/manual/visual-scene-frame.html` manually.
Serve only the intended local checkout, then stop the server after review. WebGL2,
same-realm canvas and browser PNG/ImageBitmap support are required. No automatic
browser launch or screenshot/assertion job. The page uses root-relative importmap
paths, so the server root must be the workspace root.

1. Select one or two authorized PNGs, each at most1MiB, dimensions at most2048,
   at most4M pixels. No image assets are supplied/committed by this task. For
   overlap inspection choose recognizably different images with transparent areas.
   Blank second selection creates two instances sharing the first real resource.
2. Load and submit. The walkthrough first submits an empty clear, then awaits two
   actual Phase7 cache acquire/decode/upload results. It binds independent usages,
   releases the host leases and submits both configured items together. A receipt
   only means submitted; Developer separately records what is visible.
3. Hide first, Draw; Show first, Draw. Move first ground Y, Draw. Explicit-order
   mode changes placement without depth change. First last, Draw applies order10.
   Ground sort, Draw uses bottom-center contact Y; different Y outranks explicit
   order, equal Y uses that order and registration ordinal. Draw repeats unchanged
   ordering. Inspect demand logs before each requested frame.
4. Clear scene, Draw should return to the clear. Edits targeting cleared handles
   reject rather than recreate them. Dispose releases scope/cache/session. Dispose
   before loading again. Pagehide closes a late-opened controller as well.
5. Optional code consumer: supply two `ManualVisualInput`s with real canonical
   `RenderVisualFrameBinding` values obtained through Phase7 APIs to inspect atlas
   extraction. No metadata/UV fabrication or PNG-top-left depth guessing. This
   page does not parse TPSheet and provides no TPSheet visual evidence.

Mapping: fixed 320×240 scene units over a 640×480 backing canvas. Two explicit
96×96 local rectangles at(0,0), image top-left, right/down axes. Ground anchor/pivot
(48,96); contacts(136,176)/(184,176). Projection origin(0,0)->clip(-1,1), ratios
(2/320,2/240). Images/frames intentionally stretch to the rectangle; no automatic
texel-to-scene-unit ratio or aspect preservation. Host owns CSS; Render never
measures window layout or schedules RAF. Current native viewport remains explicit.

Record browser/version/backend, exact commit, input provenance, operations and
actual observations separately. Do not turn clear/submitted logs into VISUAL_PASS,
general transparency or GPU leak-free evidence. Failure/loss/cleanup-uncertain
outcomes must be retained; recovery/new-session policy remains host-owned.
