# CM14 finite public-root manual observation

Only `@rpg-platform/runtime-render` imports. No assertions, suite or mock graphics.
Build Render first, then compile the consumer with Node ES2022 only:

```powershell
node node_modules/typescript/bin/tsc --ignoreConfig --strict --noUncheckedIndexedAccess --exactOptionalPropertyTypes --verbatimModuleSyntax --skipLibCheck false --module NodeNext --target ES2022 --lib ES2022 --typeRoots .artifacts/empty-types --rootDir . --outDir .artifacts/camera-ground-manual runtime-render/manual/camera-ground.mts
node --input-type=module -e "import {observeCameraGround} from './.artifacts/camera-ground-manual/runtime-render/manual/camera-ground.mjs'; observeCameraGround((label,value)=>console.log(label,JSON.stringify(value)));"
```

`.artifacts/empty-types` is an empty ignored directory (create if absent). No DOM
ambient types; importing actual Render root in Node does not create a backend.

## EXPECTED

Basis columns `(1,0.5),(-1,0.5)`; origins zero; h unit height-unit;
presentation css-px/right/down, displacement `(0,-2)`; camera scale1,zoom1,
center0 and logical viewport800x450. Ground4,2 h3 -> presentation2,-3 ->
viewport402,222. At h0 ->2,3. Fixed h3 inverse ->4,2, absolute tolerance1e-12.
Explicit screen origin20,30 scale2 ->824,474. Origin ground1,1/presentation10,20
->12,16 with same inverse. Pan center1,1 and zoom2 -> viewport402,217;
authored ground/elevation remain4,2/h3. Independent camera B remains402,222.

## OBSERVED

Executed via actual installed package root in Node: all listed numeric values
matched, worked inverse absolute error0/0. Detached inverse result/ground/point/
elevation frozen. Missing height, wrong unit, unknown ground/presentation plane,
wrong axes, cross-project config, nonfinite height, unsupported kind, absent screen
geometry, invalid viewport width0/-1/Infinity, zoom0, foreign accepted context,
stale camera view and disposed camera threw TypeError without changing camera A.
Singular collinear/ill-conditioned basis and finite elevation overflow threw
RangeError; nonfinite basis and unknown inverse pixel plane threw TypeError.
Explicit ground-zero inverse returned4,2. Two-component displacement(1,-2)
returned5,-3 with inverse4,2.
B's exact view identity and402,222 projection survived A pan/zoom/disposal.

Executed owner observation additionally used real Editor public roots in an
ignored local driver: `createSceneMembership` with one placement4,2;
`createDocumentEnvelope` schemaVersion1, documentKind scene, contentSchemaVersion
null; `createDocumentSession(envelope,null)` then open; pass callback returning
`{authored, document: doc.getSnapshot()}` to observer; close discard afterward.
Actual before/after placement remained4,2, currentRevision1, savedRevision null,
isDirty true (new unsaved in-memory document). No persistence attestation or
gameplay state was fabricated. Reproduction of core math needs only command above.

## NOT_OBSERVED

No real graphics context/accepted resize receipt, browser pixels, resource lease,
live Visual Scene, frame submission, gameplay position or saved document used.
Native session A/B isolation and expired resource handling are not established
by the CPU observation; foreign-context rejection is not native integration proof.
For native manual follow-up use caller-owned real ready session/current receipt
in accepted argument and explicit current logical metrics; rerun after resize,
session end and camera changes, observing rejection. Do not fabricate a receipt.
Depth/anchors remain unchanged by source inspection; no visual depth acceptance.
FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED for integrated rendering.
