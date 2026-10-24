# CM06 — manual public-root observation

Finite Node/ES2022 observation only; no assertions, runner, mocks or automatic CI job.
From workspace root after genuine builds:

```powershell
node node_modules/typescript/bin/tsc --ignoreConfig --strict --noUncheckedIndexedAccess --exactOptionalPropertyTypes --verbatimModuleSyntax --skipLibCheck false --module NodeNext --target ES2022 --lib ES2022 --typeRoots .artifacts/empty-types --rootDir . --outDir .artifacts/camera-pan-manual runtime-render/manual/camera-pan.mts
```

For a real authored owner readback, save the following as ignored
`.artifacts/camera-pan-owner.mjs` and run `node .artifacts/camera-pan-owner.mjs`:

```js
import { createSceneMembership, createDocumentEnvelope, createDocumentSession } from '@rpg-platform/editor';
import { observeCameraPan } from './camera-pan-manual/runtime-render/manual/camera-pan.mjs';
const authored = createSceneMembership({
  scene: { identity: { projectId: 'camera-manual', sceneId: 'pan-observation' } },
  objects: [{ definition: { objectId: 'one' },
    placement: { coordinateSpaceId: 'ground', point: { x: 7, y: 11 } } }],
});
const doc = createDocumentSession(createDocumentEnvelope({ schemaVersion: 1,
  identity: { projectId: 'camera-manual', documentId: 'pan-observation' },
  documentKind: 'scene', contentSchemaVersion: null, content: authored }), null);
doc.open(); // New unsaved in-memory document, no fabricated storage attestation.
observeCameraPan((label, value) => console.log(label, JSON.stringify(value)),
  () => ({ authored, document: doc.getSnapshot() }));
doc.close('discard');
```

EXPECTED: center100,50 ->105,50 ->100,50; reverse absolute error0 within1e-12;
same identity; retained snapshot100,50/revision0, frozen state; set20,30/revision3;
same snapshot for identical set and zero pan; B8,9/revision0 unchanged. Owner
placement7,11 and new unsaved document revision1/isDirty true remain unchanged.
This is a real in-memory authored document, not evidence of disk persistence.

Wrong project/space/unit/axes, infinity and extra zoom/dimension fields reject
with TypeError. Absorbed component and overflow reject with RangeError. Rejection
leaves accepted state unchanged; set and pan after disposal reject. No early clamping.
Checkpoint records observed readbacks. There are no behavioral assertions in this
consumer and it is not an automated suite.

NOT_OBSERVED: real session/VisualInstance preservation, applied projection/pixels,
camera binding/invalidation/frame submission, GPU, gameplay position and browser.
A live host can supply an owner readback callback for genuine instance/Scene state
alongside authored state. Do not fabricate a session to turn that limitation into
PASS. CPU operations do not consume dimensions, zoom or resource leases.
