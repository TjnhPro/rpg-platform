# Manual CM18 consumer

This is a finite observation tool, not a test suite. Build first, then compile:

```powershell
node node_modules/typescript/bin/tsc --ignoreConfig --strict --noUncheckedIndexedAccess --exactOptionalPropertyTypes --verbatimModuleSyntax --skipLibCheck false --module NodeNext --target ES2022 --lib ES2022 --typeRoots .artifacts/empty-types --rootDir runtime-render/manual --outDir .artifacts/camera-diagnostics runtime-render/manual/camera-diagnostics.mts
node --input-type=module -e "const {observeCameraDiagnostics}=await import('./.artifacts/camera-diagnostics/camera-diagnostics.mjs');observeCameraDiagnostics((label,value)=>console.log(label,JSON.stringify(value)))"
```

EXPECTED: invalid kind/center/zoom/plane/dimensions/bounds/missing elevation and
disposed camera reject TypeError, inverse degeneracy RangeError. Exact prior view
and revision survive rejection. Bounds policy returns rejected without mutation.
Camera B retains its exact view and projection160,120 after A disposal. Original
Phase4 result104,209; original session SESSION_DISPOSED/getSnapshot. Frame exhaustive
switch compiles without new cases. Unknown caught exceptions stay unknown.

OBSERVED: those finite values/types/identities, revision0 retained; no numeric
difference for the integer projection samples (sample tolerance1e-12). The inverse
degeneracy sample uses a separate ill-conditioned camera; the log's sameView field
tracks A, while the inverse is a pure operation on the separate camera. No claim
of session/native isolation from this CPU observation. No gameplay model supplied.

NOT_OBSERVED: native loss/disposal/listener failure injection, stale real viewport,
expired real texture binding, actual applied frame/visual pixels and native A/B
isolation. Computer Use inventory reports apps[]/browsers[]; no browser was executed.
Use the existing [real PNG two-session demo](camera-scene.md) for these paths:
fresh Open A+B; resize A, draw stale, refresh; bind released lease; native loss A;
inspect terminal binding/Scene/session, attempt draw and then draw B; close all.
Use actual WEBGL_lose_context only when available, never a synthetic event or
fake renderer/receipt. Log caught error classifiers and cleanup observations;
undefined classifier is unknown, never success. Record EXPECTED/OBSERVED/
NOT_OBSERVED independently and do not call submitted receipts visual proof.

Camera/source placement and native instance snapshots are distinct. The browser
demo compares exact original transform identity/candidates; it does not supply
gameplay/authored state. Prior Node Editor-owned Scene/Document observation can
show immutable authored state only, not native rendering or gameplay authority.
All generated output stays ignored. Developer owns product acceptance.
