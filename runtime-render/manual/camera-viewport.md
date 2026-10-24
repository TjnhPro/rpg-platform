# CM09/CM10 — finite public-root manual consumer

Build Render and consumers first. Compile from workspace root (the empty typeRoots
directory under ignored `.artifacts` already used by Phase9 may be created empty):

```powershell
node node_modules/typescript/bin/tsc --ignoreConfig --strict --noUncheckedIndexedAccess --exactOptionalPropertyTypes --verbatimModuleSyntax --skipLibCheck false --module NodeNext --target ES2022 --lib ES2022 --typeRoots .artifacts/empty-types --rootDir . --outDir .artifacts/camera-viewport-manual runtime-render/manual/camera-viewport.mts
node --input-type=module -e "import {observeForeignCameraViewport} from './.artifacts/camera-viewport-manual/runtime-render/manual/camera-viewport.mjs'; observeForeignCameraViewport((label,value)=>console.log(label,JSON.stringify(value)));"
```

EXPECTED / OBSERVED in Node: foreign `{}` graphics handle rejects with TypeError
`Expected a graphics handle from this Render package instance`, cameraUnchanged
true. Exit0 is a finite logging consumer outcome, not automated behavioral PASS.
No accepted receipt, canvas, backend or native session is faked for Node.

## Optional real-browser walkthrough — NOT_EXECUTED

Serve workspace root as in existing manual hosts, for example
`python -m http.server 8765 --bind 127.0.0.1`. An optional host page can include:

```html
<canvas id="a" width="800" height="450"></canvas>
<canvas id="b" width="800" height="450"></canvas>
<button id="observe">Observe once</button><pre id="output"></pre>
<script type="importmap">
{"imports":{"@rpg-platform/runtime-render":"/runtime-render/dist/index.js",
"three":"/node_modules/three/build/three.module.js"}}
</script>
<script type="module">
import { observeCameraViewport } from '/.artifacts/camera-viewport-manual/runtime-render/manual/camera-viewport.mjs';
const button = document.querySelector('#observe');
const output = document.querySelector('#output');
button.onclick = async () => {
  button.disabled = true;
  try {
    await observeCameraViewport({target: document.querySelector('#a')},
      {target: document.querySelector('#b')}, (label, value) => {
        output.textContent += label + ': ' + JSON.stringify(value,
          (_key, item) => typeof item === 'symbol' ? String(item) : item) + '\n';
      });
  } catch (error) { output.textContent += String(error); }
};
</script>
```

This finite host declares logical sizes explicitly (800x450 then600x400); it does
not measure DOM/CSS and should not be used as a CSS layout integration claim.
Only Phase6 writes accepted live buffer size. Each session is actually acquired
through Render; both are disposed in finally. Reload to repeat. No frames/pixels
are submitted or visually claimed. Host can provide a synchronous `readOwnedState`
callback as fourth argument when a real authored owner is involved; do not fabricate
one. Default explicitly records that no authored/live owner was supplied.

EXPECTED if native acquisition and sizing succeed: center projects400,225 CSS at
ratio1/2, then300,200 at600x400. Receipt reports actual buffers/ratios independently;
do not label1600x900 accepted unless the receipt actually reports it. Same camera,
center, zoom and revision; B still has800x450 context after A resizes. Stale (also
equal-buffer `unchanged`), copied, missing and other-session receipts reject;
zero/negative/nonfinite/wrong logical extent, device plane and other project reject.
Suspension rejects; resume requires new receipt; disposed camera/session reject.
History remains frozen. All acceptance paths and these native negative paths are
currently NOT_OBSERVED. No display, browser integration or gameplay verification.
