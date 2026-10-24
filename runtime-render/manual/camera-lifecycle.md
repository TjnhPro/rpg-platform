# Camera state lifecycle — optional manual ES2022 consumer

v0.9.1, no graphics/session/resource/Scene allocation. Logs observations only;
no assertions, automated suite, scheduler or visual acceptance. Use package root.

From workspace root after the Render build:

```powershell
node node_modules/typescript/bin/tsc --ignoreConfig --strict --noUncheckedIndexedAccess --exactOptionalPropertyTypes --verbatimModuleSyntax --skipLibCheck false --module NodeNext --target ES2022 --lib ES2022 --typeRoots .artifacts/empty-types --rootDir . --outDir .artifacts/camera-manual runtime-render/manual/camera-lifecycle.mts
node --input-type=module -e "const m = await import('./.artifacts/camera-manual/runtime-render/manual/camera-lifecycle.mjs'); m.observeCameraLifecycle((label, value) => console.log(label, JSON.stringify(value)));"
```

Expected: A/B distinct symbols, initial center2,3 revision0. Host input mutations
leave captured center2,3 axes right/up; every logged frozen flag true. Updating A
to7,8 retains its ID, revision1, old A snapshot and exact B snapshot. Equal update
returns same snapshot/revision. Invalid identities/axes/kind/NaN/extra keys/context
replacement/zoom reject TypeError; unknown host error identity is retained and A
remains unchanged. Disposed A rejects updates, repeated disposal returns same
terminal snapshot/revision1; historical A remains active revision0. B updates to
-1,4 revision1. C disposed during capture stays disposed revision0 and rejects
the outer update. Symbols are not JSON-serialized; the consumer logs comparison
booleans instead. These are finite manual observations, not comprehensive proof.

Session A/B isolation, one-camera/session occupancy, frame invalidation, positive
dimension/zoom interpretation, GPU application, 2.5D inverse, resource expiry and
actual pixels are NOT_OBSERVED/not implemented by this pure lifecycle checkpoint.
No live Scene means no authored/gameplay state is involved to compare. Unknown
plane registry lookup does not exist; malformed context rejects, valid explicit
labels do not prove an authored coordinate space exists.
