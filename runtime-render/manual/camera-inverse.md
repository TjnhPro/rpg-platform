# Finite public-root selected-plane inverse observations

No assertions, runner, tests or fake graphics. Build Render then compile this
manual consumer against actual installed/emitted package roots from workspace root:

```powershell
node node_modules/typescript/bin/tsc --ignoreConfig --strict --noUncheckedIndexedAccess --exactOptionalPropertyTypes --verbatimModuleSyntax --skipLibCheck false --module NodeNext --target ES2022 --lib ES2022 --typeRoots .artifacts/empty-types --rootDir . --outDir .artifacts/camera-inverse-manual runtime-render/manual/camera-inverse.mts
```

Use the empty ignored `.artifacts/empty-types` directory. In a temporary root
`.artifacts/*.mjs`, import `observeCameraInverse` from
`./camera-inverse-manual/runtime-render/manual/camera-inverse.mjs`. Call with
`(label, value) => console.log(label, JSON.stringify(value))`. Run that module with
Node. Optional second callback reads actual owner state before/after; no fabricated
gameplay/native state. For the authored observation used here, import actual Editor
root `createSceneMembership`, `createDocumentEnvelope`, `createDocumentSession`.
Create a new unsaved Scene Document with project `camera-manual`, Scene/Document
`inverse-observation`, object `one` at ground100,50. Open, supply a callback returning
authored membership plus `doc.getSnapshot()`, then close with `discard`. This is
finite manual composition, no new production dependency or persistence attestation.

Expected viewport roundtrip:110,60 ->420,245 ->110,60 at800x450, center100,50,
scale2, zoom1. Explicit screen origin20,30 scale2 gives860,520 ->110,60.
Right/up source gives420,205 ->110,60. Offviewport1000,-500 gives2200,-875 and
roundtrips unclamped. Logs include absolute sample errors and tolerance1e-12,
immutable observations, independent B, stale/foreign/copied camera view, invalid
dimensions/point/zoom/planes, zero ratio, cutoff equality1e-12 and large-center
residual rejection. Compare output manually; no source-accuracy guarantee follows
from a sample. With screen absent, viewport succeeds while screen route rejects.

Optional native observation `observeAcceptedCameraInverse` accepts caller-owned
real camera/session/current issued receipt and current matching logical metrics.
Use [v0.9.5 acquisition/resize runbook](camera-viewport.md); no fake receipt/renderer.
Observe A and B with separate real sessions. Resize/end A, retain B camera view and
receipt; call inverse on B and record isolation. Call inverse on A using its old
receipt, copied receipt, B receipt, suspended/ended session; record actual rejection.
After resume use its new issued receipt and current camera view. Host owns finally
cleanup. This native procedure is compiled but NOT_EXECUTED for this checkpoint.
No GPU/pixel, native DPR/receipt freshness or live Scene/gameplay behavior claimed.

Actual EXPECTED/OBSERVED/NOT_OBSERVED are in the
[checkpoint](../../harness/checkpoints/camera-v0.9.7.md).
