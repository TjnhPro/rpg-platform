# v0.4.11 — Minimal Working Spatial MVP (SP17)

READY_FOR_DEVELOPER_REVIEW. Scenario below MANUALLY_OBSERVED in headless Node;
general numerical/product/visual correctness FEATURE_NOT_VERIFIED.
Stop before v0.4.12. Checkpoint SHA and exact-head CI are recorded outside this
self-referencing commit in the same Draft [PR #4](https://github.com/TjnhPro/rpg-platform/pull/4).

## Preflight and scope

Source HEAD / previous implemented v0.4.10:
3ccf181bb61d29de3f35c164052647406fea428c. Local/upstream/PR heads matched,
clean worktree, feat/editor-render-spatial-contracts-v0.4, PR base main.
Continuing under Developer's explicit instruction to implement and review at the
end; prior green CI is not historical acceptance. Phase 1–3 accepted merge baselines
remain recorded in SP01, ending at 5ce0feb4c1967c0dee14919b9c11d56991a46bd0.

Read task, root/project guidance, architecture/Foundation/README, Harness
ownership/contracts/workflow/verification, actual source/public roots/manifests
and emitted declarations. Audited v0.4.1–v0.4.10 coordinate capture, TRS/affine
operations, explicit grid, alignment/facing, projection/viewport and Scene adapters.
v0.4.0 is design-only. Existing APIs cover this scenario; no missing capability,
new symbol, signature/schema change or production implementation needed.
Source/emitted exports remain Editor90/90 and Render52/52, with no delta from source HEAD.

Canonical primary owner for the authored scenario: Editor; Render collaborator
owns every numeric conversion through its existing root. Harness owns this evidence
document. Route hints listed both projects, not a new ownership decision.
No L1/L2 API invocation; Core2.0.0/Gameplay0.15.2 artifacts/pins unchanged.
Only four documentation paths: this report, ARCHITECTURE.md, README.md and
editor/AGENTS.md. No Engine/Client/Server, production types/exports, dependencies,
lockfile, workflow, package version, stored schema or sixth project change.
No unresolved blocking architecture decision.

## Independently calculated expectations / observed values

All below were calculated from the declared inputs before comparing console output.
These are selected small finite binary64 examples, not a universal accuracy claim.
Use absolute component tolerance 1e-12 for these numeric comparisons only; discrete
IDs/indices/statuses and supported JSON values compare exactly. Render's own inverse
gate remains its existing destination residual 1e-9*max(1,abs(component)), with
normalized conditioning rejection; this report does not change that API policy.

Scene plane: spatial-mvp/scene-plane, metre, right/up. Grid start (10,-4),
cell width4/height2, columns +x, rows -y, nonnegative indices, center alignment.
Thus x=10+4*(column+0.5), y=-4-2*(row+0.5), and floor recovers the cell.
Space origin label (999,888) is deliberately not added.

Transforms on presentation-local point(1,2), in one coherent metre/right-up plane:
A scales to(2,6), rotates PI/2 to(-6,2), translates(5,-2) to(-1,0).
B translates(4,6), so application order [A,B] gives(3,6). These examples do not
write transformed points into Scene or create parenting/gameplay semantics.

Projection source correspondence (10,-4), destination (100,200), ratios(20,10),
destination right/down css-px: u=100+20*(x-10), v=200-10*(y+4).
Viewport800x600 does not imply automatic fit. Screen right/down device-px has
origin(300,150) and explicit scale(2,2): s=(300+2*u,150+2*v).
Selected-plane inverse reverses exactly that context, with no depth inference.

| Operation / owner API | Expected from inputs | Observed |
| --- | --- | --- |
| Render gridCellToScenePosition: row1/column2, center | (20,-7) | exact |
| Render scenePositionToGridCell, floor | row1/column2 | exact |
| Editor updateSceneObjectSpatialPlacement Player | old(12,-5), candidate(20,-7) | exact; old JSON unchanged |
| Editor update unrelated Monster entries | three unchanged entries; object IDs/Asset refs retained | JSON comparisons true |
| Editor describeSceneObjectAlignment via Render resolveVisualAlignment2D | origin=(20,-7)+(.5,-.5)-(1,2)=(19.5,-9.5); pivot+(2,3)=(21.5,-6.5) | exact |
| Facing 0 then PI/2 in right/up axes | same origin/pivot, metadata quarter-turn counterclockwise from +x | same numbers; angle1.5707963267948966; no geometry rotation |
| Render applyPlanarPoint2D(A,(1,2)) | (-1,0) | (-1,4.440892098500626e-16) |
| Render composePlanarTransforms2D([A,B]) then point apply | (3,6) | exact |
| Render invertPlanarTransform2D then point apply | inverted, recovered(1,2) | (0.9999999999999996,2), within1e-12 |
| Player Scene -> Editor request -> Render viewport -> screen -> viewport -> Scene | (20,-7) -> (300,230) -> (900,610) -> (300,230) -> (20,-7) | exact, same declared planes/units |
| monster-1 same handoff/inverse | (16,-5) -> (220,210) -> (740,570) -> (220,210) -> (16,-5) | exact; own correlation |
| monster-2 same handoff/inverse | (20,-5) -> (300,210) -> (900,570) -> (300,210) -> (20,-5) | exact; own correlation |
| monster-3 same handoff/inverse | (24,-5) -> (380,210) -> (1060,570) -> (380,210) -> (24,-5) | exact; own correlation |
| Render inverse scale(0,1) | non-invertible/SINGULAR_OR_ILL_CONDITIONED | exact; no identity fallback |
| Render grid position with foreign space | TypeError | Grid coordinate space or unit mismatch |
| Editor placement update with foreign point space | TypeError | Scene, coordinate definition and spatial point project/space mismatch |
| Original/candidate/catalog after alignment, projection and rejected calls | unchanged supported JSON | all true; four inspected freeze values true |
| Text-only narration without placement | unavailable/NO_PLACEMENT | exact; no forced grid/viewport |
| Existing SC15 + AR14 resource handoff on all four objects | metadata-prepared | four metadata-prepared; contents not loaded |
| Node host globals window/document/WebGLRenderingContext | absent for headless proof | all undefined |

Authored correlation is project+scene+object ID, not an ephemeral Render session
symbol. Player uses player-image; three Monster placeholders share monster-image
while retaining distinct object IDs. These names are display-only, with no
HP/combat/movement/entity implementation. Only portable {plane,point} crosses the
spatial boundary; labels/layers/Asset records remain authored. Anchor/facing is
caller config and leaves authored (20,-7) unchanged. Illustrative locators do not
establish file existence or loading. No graphics acquisition, session allocation,
frame submission, second Scene registry or duplicate math implementation.

## Reproduce the observed scenario

After README setup/build, paste the complete block into Node stdin via
`node --input-type=module` (PowerShell: a single-quoted here-string piped to that
command). It only prints observations; no assertions, runner, saved executable
script or CI hook. All conversions use the real public package roots.

```js
import * as E from '@rpg-platform/editor';
import * as R from '@rpg-platform/runtime-render';

// Caller-owned scene plane; origin is a label, not a second grid offset.
const space=E.createCoordinateSpaceDefinition({
  reference:{projectId:'spatial-mvp',coordinateSpaceId:'scene-plane'},
  componentCount:2,axes:{x:'right',y:'up'},origin:{x:999,y:888},unit:'metre'
});
const grid=E.createOrthogonalGridDefinition({
  space:space.reference,orientation:'orthogonal',origin:{x:10,y:-4},
  cellSize:{width:4,height:2},
  indexing:{columnDirection:'positive-x',rowDirection:'negative-y',negativeIndices:'reject'}
});
const conversion=E.describeGridConversion(grid,space);
const asset=(assetId,path)=>({
  identity:{projectId:'spatial-mvp',assetId},kind:'image',
  metadata:{vendor:{note:'illustrative, not loaded'}},
  sources:[{role:'image',locator:{type:'project-relative',path}}]
});
const catalog=E.createAssetCatalog({projectId:'spatial-mvp',definitions:[
  asset('player-image','assets/player.png'),asset('monster-image','assets/monster.png')
]});
const ref=assetId=>E.createAssetReference({
  projectId:'spatial-mvp',assetId,expectedKind:'image',subresourceId:null
});
const playerRef=ref('player-image'),monsterRef=ref('monster-image');
const ids=['player-visual','monster-1','monster-2','monster-3'];
const initialPositions=ids.map((id,column)=>R.gridCellToScenePosition(
  conversion,{space:conversion.space,cell:{row:0,column}},'center'));
const old=E.createSceneMembership({
  scene:{identity:{projectId:'spatial-mvp',sceneId:'zone-01'}},
  objects:ids.map((objectId,i)=>({
    definition:{objectId,displayName:i===0?'Player visual':'Monster placeholder '+i},
    assetReference:i===0?playerRef:monsterRef,layerKey:'actors',
    placement:{coordinateSpaceId:space.reference.coordinateSpaceId,point:initialPositions[i].point}
  }))
});
const oldJSON=JSON.stringify(old),catalogJSON=JSON.stringify(catalog);
const cell={space:conversion.space,cell:{row:1,column:2}};
const moved=R.gridCellToScenePosition(conversion,cell,'center');
console.log('grid',JSON.stringify({cell,moved,recovered:R.scenePositionToGridCell(conversion,moved,'floor')}));
const scene=E.updateSceneObjectSpatialPlacement(
  old,'player-visual',space,{space:space.reference,point:moved.point});
console.log('immutable',JSON.stringify({
  oldPlayer:E.getSceneObject(old,'player-visual').placement,
  newPlayer:E.getSceneObject(scene,'player-visual').placement,
  oldUnchanged:oldJSON===JSON.stringify(old),
  unrelatedEqual:JSON.stringify(old.objects.slice(1))===JSON.stringify(scene.objects.slice(1)),
  authoredKeysRetained:JSON.stringify(old.objects.map(o=>({id:o.definition.objectId,ref:o.assetReference})))===
    JSON.stringify(scene.objects.map(o=>({id:o.definition.objectId,ref:o.assetReference})))
}));
const anchor=R.createVisualAnchor2D({
  unit:'metre',anchor:{x:1,y:2},pivot:{x:2,y:3},localOffset:{x:0.5,y:-0.5}
});
const facing=R.createVisualOrientation2D({
  axes:space.axes,zeroAxis:'positive-x',positiveRotation:'toward-positive-y',angleRadians:Math.PI/2
});
const sceneJSON=JSON.stringify(scene);
console.log('alignment',JSON.stringify({
  facingZero:E.describeSceneObjectAlignment(scene,'player-visual',space,anchor,{...facing,angleRadians:0}),
  facingQuarterTurn:E.describeSceneObjectAlignment(scene,'player-visual',space,anchor,facing)
}));

// Explicit presentation-only local metre plane, right/up. Never write back to Scene.
const a=R.createPlanarTransform2D({
  translation:{x:5,y:-2},rotationRadians:Math.PI/2,scale:{x:2,y:3}
});
const b=R.createPlanarTransform2D({
  translation:{x:4,y:6},rotationRadians:0,scale:{x:1,y:1}
});
const composed=R.composePlanarTransforms2D([a,b]);
const local={x:1,y:2},transformed=R.applyPlanarPoint2D(composed,local);
const inverse=R.invertPlanarTransform2D(composed);
console.log('transforms',JSON.stringify({
  afterA:R.applyPlanarPoint2D(a,local),afterAB:transformed,inverseStatus:inverse.status,
  recovered:inverse.status==='inverted'?R.applyPlanarPoint2D(inverse.transform,transformed):inverse
}));

const viewport=E.createCoordinateSpaceDefinition({
  reference:{projectId:'spatial-mvp',coordinateSpaceId:'viewport-css'},
  componentCount:2,axes:{x:'right',y:'down'},origin:{x:0,y:0},unit:'css-px'
});
const projection=E.describeOrthographicPlaneProjection(space,viewport,{
  sourceOrigin:{x:10,y:-4},destinationOrigin:{x:100,y:200},
  destinationUnitsPerSourceUnit:{x:20,y:10}
});
const mapping=E.describeViewportMapping(projection,{
  plane:projection.destination,width:800,height:600,
  screen:{plane:{projectId:'spatial-mvp',coordinateSpaceId:'screen-device',
    axes:{x:'right',y:'down'},unit:'device-px'},
    origin:{x:300,y:150},screenUnitsPerViewportUnit:{x:2,y:2}}
});
for(const id of ids) {
  const description=E.describeSceneObjectSpatialPoint(scene,id,space);
  if(description.status==='described') {
    const request=description.request;
    const viewportPoint=R.projectPointToViewport2D(mapping,request);
    const screenPoint=R.viewportPointToScreen2D(mapping,viewportPoint);
    const fromScreen=R.screenPointToViewport2D(mapping,screenPoint);
    const restored=R.viewportPointToPlane2D(mapping,fromScreen);
    const visual=E.describeSceneObjectVisual(scene,id,catalog);
    console.log('handoff',JSON.stringify({correlation:description.correlation,request,viewportPoint,
      screenPoint,fromScreen,restored,resource:visual.status==='described'?
        R.prepareVisualResource(visual.descriptor).status:visual.status}));
  }
}
console.log('singular',JSON.stringify(R.invertPlanarTransform2D({
  translation:{x:0,y:0},rotationRadians:0,scale:{x:0,y:1}
})));
try {
  R.scenePositionToGridCell(conversion,{...moved,space:{...moved.space,coordinateSpaceId:'foreign'}},'floor');
} catch(error) {console.log('invalid-render-space',error.constructor.name,error.message);}
try {
  E.updateSceneObjectSpatialPlacement(scene,'player-visual',space,{
    space:{...space.reference,coordinateSpaceId:'foreign'},point:{x:1,y:2}});
} catch(error) {console.log('invalid-editor-space',error.constructor.name,error.message);}
const text=E.createSceneMembership({
  scene:{identity:{projectId:'spatial-mvp',sceneId:'text-only'}},
  objects:[{definition:{objectId:'narration'}}]
});
console.log('optional',JSON.stringify(E.describeSceneObjectSpatialPoint(text,'narration',space)));
console.log('final',JSON.stringify({
  originalUnchanged:oldJSON===JSON.stringify(old),candidateUnchanged:sceneJSON===JSON.stringify(scene),
  catalogUnchanged:catalogJSON===JSON.stringify(catalog),
  frozen:[Object.isFrozen(old),Object.isFrozen(scene),Object.isFrozen(scene.objects),
    Object.isFrozen(E.getSceneObject(scene,'player-visual').placement.point)],
  headless:[typeof window,typeof document,typeof WebGLRenderingContext]
}));
```

## Verification / stop

| Command or evidence | Result |
| --- | --- |
| node harness/cli.mjs check | ARCH_CHECK_PASS, 59 JS/TS source files |
| node harness/cli.mjs scope --projects editor,runtime-render --allow-infra | SCOPE_PASS, four documentation paths |
| node harness/cli.mjs verify --projects editor,runtime-render --with-consumers | BUILD_PASS Render, Editor, game-client |
| npm run build -- --force | BUILD_PASS all five projects |
| Public source/emitted root audit | Editor90/90, Render52/52; zero API delta |
| In-memory strict public-root declaration consumer composing the scenario APIs | zero diagnostics, NodeNext/ES2022/no DOM, skipLibCheck:false |
| git diff --check | PASS |

Static/build/declaration checks repeated at final checkpoint HEAD; exact SHA and
push/PR CI links recorded in PR/handoff. No failed/unconfigured build. Existing
Windows Harness DEP0190 warning is nonblocking. No test files/runners/coverage,
browser/UI/E2E execution or added CI steps. Finite observations are not numerical
correctness certification or visual acceptance. Text content stays spatially
optional; gameplay spatial truth stays Engine-owned; Server needs no DOM/GPU.
Unknown-document persistence, visual instances, live camera/UI, animation and
general product behavior remain outside this proof. No v0.4.12, merge, tag,
release or package publication.
