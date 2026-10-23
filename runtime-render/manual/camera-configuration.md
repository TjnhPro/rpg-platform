# Orthographic configuration — optional manual public-root consumer

v0.9.2, Node/ES2022 only. Logs finite observations, no assertions, automated suite,
mock session, native renderer, texture or Scene. From workspace root after build:

```powershell
node node_modules/typescript/bin/tsc --ignoreConfig --strict --noUncheckedIndexedAccess --exactOptionalPropertyTypes --verbatimModuleSyntax --skipLibCheck false --module NodeNext --target ES2022 --lib ES2022 --typeRoots .artifacts/empty-types --rootDir . --outDir .artifacts/camera-configuration-manual runtime-render/manual/camera-configuration.mts
node --input-type=module -e "const m = await import('./.artifacts/camera-configuration-manual/runtime-render/manual/camera-configuration.mjs'); m.observeCameraConfiguration((label, value) => console.log(label, JSON.stringify(value)));"
```

EXPECTED: source right/down, world-unit; center100,50; scale2,2 CSS-px/source-unit,
zoom1, preserve-scale. Capture detaches/freeze all six logged records despite caller
mutation. Existing Phase4 APIs receive explicit correspondence center100,50 ->400,225,
CSS viewport800x450 and config effective ratios2,2. Their center output is400,225 and
point101,51 becomes402,227. This verifies ratio compatibility with an explicitly
supplied descriptor, not automatic camera-to-viewport binding. No projection formula
or viewport-center calculator is implemented in this consumer.

Zoom2 gives ratios4,4; original remains2,2. Unequal declared scale2,3 remains2,3.
Zero/negative/NaN/Infinity scale or zoom, wrong physical scale unit, invalid axes,
blank plane identity/unit, nonfinite center, perspective, fit-vertical and unexpected
dimension fields throw TypeError. Effective multiplication overflow/zero underflow
throw RangeError. Phase4 rejects mismatched point unit and zero logical width.
Unknown host exception is retained; original config remains unchanged throughout.
Concrete observed values and exception messages are in the checkpoint report.

NOT_OBSERVED: automatic viewport fitting/conversion, resize/DPR application,
session A/B or occupancy, actual GPU state/pixels, oblique/elevation inverse and
resource expiry. Configuration has no session, resource or dimensions. Authored
placement/gameplay state are not involved. Well-formed unknown source labels are
explicit declarations; no registry existence check exists. Browser NOT_EXECUTED.
