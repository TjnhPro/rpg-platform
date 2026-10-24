# CM15 finite public-root observation

No assertions, test runner or backend substitute. Build first; create empty ignored
`.artifacts/empty-types` if absent, then:

```powershell
node node_modules/typescript/bin/tsc --ignoreConfig --strict --noUncheckedIndexedAccess --exactOptionalPropertyTypes --verbatimModuleSyntax --skipLibCheck false --module NodeNext --target ES2022 --lib ES2022 --typeRoots .artifacts/empty-types --rootDir . --outDir .artifacts/camera-bounds-manual runtime-render/manual/camera-bounds.mts
node --input-type=module -e "import {observeCameraBounds} from './.artifacts/camera-bounds-manual/runtime-render/manual/camera-bounds.mjs'; observeCameraBounds((label,value)=>console.log(label,JSON.stringify(value)));"
```

## EXPECTED

Source ground/world-unit/right,down; bounds0,0..1000,600; viewport200x100 CSS;
scale2x2/zoom1 => view100x50, center500,300. Pan1000,-1000 clamps950,25,
actual source view900,0..1000,50. Movement reject with target zoom2 preserves
both center and old zoom1. Clamp at zoom2 gives975,300/span50,25 in one revision.
Same clamped request is no-op. Zoom0.05 gives span2000x1000, strict rejection.
Bounds80x30 center policy =>40,15 (oversized-centered), repeat no-op.
Bounds80x600 =>40,25; viewport width4000 => span2000x50, strict reject or
explicit500,300 midpoint. Disabled bounds =>2000,-2000, legacy pan =>2500,-2500.
Left/up axes with scale2x4 => span100x25, edge950,12.5. B remains500,300.

## OBSERVED

Node observations matched these exact finite values and policies. Strict rejection
and no-op retained exact view identity/revisions; changing center+zoom incremented
view/center revision once. Sample result/view/policy/metrics/span frozen.
Old/copy/foreign view, wrong bounds plane/project/unit/axes, inverted/nonfinite
bounds, zoom0, width0/-1/Infinity, foreign accepted session and disposed camera
threw TypeError, leaving A view unchanged. Camera B view identity unchanged.

An ignored local owner driver also used real Editor public roots:
createSceneMembership with authored placement4,2; createDocumentEnvelope schema1,
scene kind/contentSchemaVersion null; createDocumentSession(envelope,null), open;
callback returns authored snapshot and getSnapshot before/after observer; then
close discard. Placement4,2, currentRevision1/savedRevision null/isDirty true
remained unchanged (new unsaved in-memory document). No fabricated storage/gameplay.
Core observation is reproducible using the committed consumer and command above.

## NOT_OBSERVED

Native accepted session/resize receipts, actual browser resize/DPR/loss recovery,
native session A/B isolation, GPU frames/pixels, live Scene/resource lifetime,
gameplay positions and saved-file persistence. Expired resource inapplicable:
operation consumes no lease/texture. For native follow-up supply real ready session
and current issued resize receipt; after resize/end, old receipt must reject before
transition. Never fabricate a graphics handle. Null logical context cannot attest
host measurement freshness or bounds' authored revision.
FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED for integrated rendering.
