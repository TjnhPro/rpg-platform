# Finite public-root projection observations

No runner, assertions, suite, fake graphics or automated browser. Compile the
consumer against the actual built package root, from repository root:

```powershell
node node_modules/typescript/bin/tsc --ignoreConfig --strict --noUncheckedIndexedAccess --exactOptionalPropertyTypes --verbatimModuleSyntax --skipLibCheck false --module NodeNext --target ES2022 --lib ES2022 --typeRoots .artifacts/empty-types --rootDir . --outDir .artifacts/camera-projection-manual runtime-render/manual/camera-projection.mts
```

Create the empty ignored `.artifacts/empty-types` directory if absent. In a temporary
root `.artifacts/*.mjs` module, import `observeCameraProjection` from
`./camera-projection-manual/runtime-render/manual/camera-projection.mjs` and call it
with `(label, value) => console.log(label, JSON.stringify(value))`. An optional
second callback reads real owner state before/after. Do not invent gameplay state
or native acceptance. Node can run this logical-only finite consumer without DOM.

For authored evidence, import `createSceneMembership`, `createDocumentEnvelope`,
`createDocumentSession` from `@rpg-platform/editor`. Create a real in-memory Scene
with project `camera-manual`, Scene/Document ID `projection-observation`, object
`one` at ground `(100,50)`. Open a new unsaved document and supply a callback
returning the authored snapshot and `doc.getSnapshot()`. After logging, close with
`discard`. This is optional manual composition, not a production dependency or a
storage/gameplay/live-instance claim. The observed new document remains revision1,
savedRevision null, dirty true; point100,50 unchanged through camera pan/zoom.

Expected CSS results at800x450, scale2, center100,50: center400,225;
world110,50 ->420,225; world100,60 ->400,245. Up source ->400,205.
After center105,50: world100,50 ->390,225 and explicit origin20,30 at scale1
gives screen410,255. Sample absolute tolerance1e-12; errors are logged, never
asserted. No screen context returns null. Offviewport world1000,50 ->2200,225.
Check logged invalid inputs/error categories and independent B; retained results
remain immutable historical records. Consult checkpoint for actual observations.

Optional native use: a caller with two independently owned real Phase6 sessions
and current issued receipts can call `observeAcceptedCameraProjection` using
their logical metrics and source point. It logs accepted A/B and B camera/receipt
identity. Reuse [v0.9.5 native procedure](camera-viewport.md) for actual acquisition,
resize, stale/copy/foreign receipt, suspension/resume and cleanup; replace projection
reads with `projectRenderCameraPoint(camera, logical, point, {session, receipt})`.
Never fabricate a receipt/backend. Host disposes its cameras/sessions in finally.
This native path is compiled but NOT_EXECUTED in this checkpoint. No GPU/pixel,
DPR native behavior, live Scene or gameplay evidence is inferred from CPU results.
