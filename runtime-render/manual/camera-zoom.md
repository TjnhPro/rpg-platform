# CM07/CM08 — finite manual public-root observation

After project builds, from workspace root:

```powershell
node node_modules/typescript/bin/tsc --ignoreConfig --strict --noUncheckedIndexedAccess --exactOptionalPropertyTypes --verbatimModuleSyntax --skipLibCheck false --module NodeNext --target ES2022 --lib ES2022 --typeRoots .artifacts/empty-types --rootDir . --outDir .artifacts/camera-zoom-manual runtime-render/manual/camera-zoom.mts
```

Save the following as ignored `.artifacts/camera-zoom-owner.mjs`, then run
`node .artifacts/camera-zoom-owner.mjs`:

```js
import { createSceneMembership, createDocumentEnvelope, createDocumentSession } from '@rpg-platform/editor';
import { observeCameraZoom } from './camera-zoom-manual/runtime-render/manual/camera-zoom.mjs';
const authored = createSceneMembership({
  scene: { identity: { projectId: 'camera-manual', sceneId: 'pan-observation' } },
  objects: [{ definition: { objectId: 'one' },
    placement: { coordinateSpaceId: 'ground', point: { x: 7, y: 11 } } }],
});
const doc = createDocumentSession(createDocumentEnvelope({ schemaVersion: 1,
  identity: { projectId: 'camera-manual', documentId: 'pan-observation' },
  documentKind: 'scene', contentSchemaVersion: null, content: authored }), null);
doc.open(); // Actual new in-memory authored document; no storage attestation.
observeCameraZoom((label, value) => console.log(label, JSON.stringify(value)),
  () => ({ authored, document: doc.getSnapshot() }));
doc.close('discard');
```

EXPECTED: source right/down world-unit, center100,50, scale2 at zoom1, explicit
CSS viewport800x450 with midpoint400,225; focus500,275 inverses to150,75. Absolute
zoom2 gives effective4,4 and center125,62.5, preserving world150,75 and pixels500,275.
Reverse focus returns center100,50/zoom1. Absolute example tolerance1e-12, expected
errors0. Center zoom keeps source center100,50 at400,225, changes view revision once
and preserves old center snapshot. Same absolute zoom (factor1) preserves view
reference/revisions. Old history and independent camera B stay unchanged. Captured
config/limits survive caller mutation, nested frozen flags true. Limits0.25 and8
are inclusive. Subsequent canonical pan updates both center observations.

EXPECTED rejection without state replacement: zero/negative/NaN/Infinity zoom,
out-of-range16, missing/stale context, width0, unknown source plane, device-px focus,
unsafe tiny-scale inverse, scale overflow/zero-underflow and operations after camera
disposal. Plain unconfigured camera rejects zoom. Actual observed values/messages
are recorded in the checkpoint. No assertions or automatic runner are present.

Owner readback compares real Scene placement7,11 and Document revision1/isDirty true
before/after. This is unsaved memory, not persisted state or runtime gameplay.
NOT_OBSERVED: live VisualInstance, GPU/session binding or disposal interaction,
applied matrix, frames, pixels, browser/DPR/resize and gameplay positions. Expired
resource is inapplicable; no lease is consumed. No fake sessions/resources/renderers.
