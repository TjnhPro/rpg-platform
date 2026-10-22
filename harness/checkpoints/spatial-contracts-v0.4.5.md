# v0.4.5 — Grid & Scene Coordinate Conversions (SP09)

READY_FOR_DEVELOPER_REVIEW. Finite numerical examples MANUALLY_OBSERVED;
general functional/visual/gameplay correctness FEATURE_NOT_VERIFIED.
STOP before v0.4.6. No merge, version bump, tag, release or publication.

## Preflight / scope

Source HEAD / previous checkpoint: 9fc76be0a5de8d4e78a7ec77b105b3b205a2ed76.
Task supplied under Developer's earlier instruction to implement/verify and review
at the final step; authorization is not inferred from CI. Phase 1–3 accepted
evidence remains in SP01, ending at 5ce0feb4c1967c0dee14919b9c11d56991a46bd0.
Initial worktree clean, feat/editor-render-spatial-contracts-v0.4, same open Draft
[PR #4](https://github.com/TjnhPro/rpg-platform/pull/4), base main. Final checkpoint
SHA and exact-head push/PR CI links recorded outside this commit in PR/handoff.

Read root/project guidance, architecture, Foundation/README, Harness ownership,
contracts/workflow/verification and source/root manifests/declarations. Audited
v0.4.1 coordinate definitions (space origin is a label), v0.4.4 orthogonal grid
(origin corner, numeric indexing directions, optional authored data), SC08 placement
and existing Render planar types. Baseline Editor 83 / Render 26 symbols.
Router named both projects as hints; canonical primary owner is Runtime Render
for pure conversion math. Editor collaborator adapts authored data with existing
factories, verifies matching space, and calls Render root request capture; no math.
Editor/game-client rebuild as Render consumers; no L1/L2 APIs required.

Eleven paths: runtime-render/src/{grid-conversion.ts,index.ts},
editor/src/{grid-conversion.ts,index.ts}, both project AGENTS.md, ARCHITECTURE.md,
README.md, harness/OWNERSHIP.md, harness/CONTRACTS.md and this checkpoint.
No Engine/Client/Server source, L1/L2/pins, manifests/dependencies/lockfile,
Scene/Asset schemas, workflows or sixth project changes.

## Additive APIs and numerical contract

Render adds seven root symbols (26 -> 33): GridConversionSpace,
OrthogonalGridConversion, GridCell2D, GridScenePosition2D,
createOrthogonalGridConversion, gridCellToScenePosition, scenePositionToGridCell.
Editor adds describeGridConversion (83 -> 84). All prior exports retained.
Editor adapter accepts authored grid + complete matching CoordinateSpaceDefinition,
projects reference plus verbatim unit, passes original grid origin/dimensions and
indexing policies into Render-owned portable capture. No reverse import, native
backend matrix or shared package. Axes choose physical interpretation of numeric
signs, not an additional transform; space origin label is never an extra offset.

Portable space is {projectId,coordinateSpaceId,unit}; all three match exactly on
each cell/position request and survive output. Caller supplies specific grid
context each time; no grid ID/store, proof of actual unit scale or lookup. Factory
and operations validate exact own-key plain/null-prototype finite records,
positive metrics and orthogonal-only kind. Inputs are borrowed read-only; capture
and results detach/freeze all nested records. Invalid input/mismatch/policy throws
TypeError; unknown host accessor/proxy exceptions propagate.

For numeric direction signs sx/sy in {+1,-1} and offset o:

```text
x = origin.x + sx * (column + o) * width
y = origin.y + sy * (row + o) * height
column = floor(((x - origin.x) / width) * sx)
row    = floor(((y - origin.y) / height) * sy)
```

Forward requires explicit alignment start-corner (o=0) or center (o=0.5).
Inverse requires explicit 'floor', meaning containing cell, not nearest center.
Cells are directed normalized [i,i+1): exactly normalized i+1 belongs to index i+1,
even on reversed axes. Negative values use floor, not truncation. Signed zero
indices canonicalize to +0. Indices must be safe integers; negativeIndices:'reject'
throws RangeError outside the nonnegative quadrant, with no clamp. There are no
upper map bounds. No snapping UI, occupancy or gameplay navigation is implemented.

Arithmetic is JS binary64 with no epsilon, decimal correction or intent recovery.
Nonfinite results/deltas/quotients, nonzero delta underflowing to zero quotient,
unsafe integer results and forward center offsets that cannot be represented
throw RangeError. Forward also verifies its result floor-classifies to the input
cell, and rejects center results collapsed onto the starting boundary. Thus some
finite inputs (including a rounded corner near a cell boundary) reject instead of
silently returning another cell. Remaining finite rounding errors are possible;
no universal position-accuracy or exact geometric-boundary promise is made for
pre-rounded real-number intent. No partial result or fallback returned on failure.

Official research: [Tiled TMX](https://doc.mapeditor.org/en/stable/reference/tmx-map-format/)
(accessed 2026-10-22) distinguishes orientation, grid/tile metrics and map dimensions.
Platform-specific decision: preserve the approved orthogonal numeric convention;
do not infer tile IDs or import TMX. Isometric/staggered/hex remain unsupported.
Floor/half-open policy is this contract's choice, not copied engine UI behavior.

Text Scene remains valid with no grid/position. Optional 2D/2.5D ground-plane use
preserves Scene/Asset identities; height/anchor/direction/projection remain deferred.
Engine owns gameplay range/movement/collision; Client/Server source untouched and
Server needs no DOM/GPU. No open architecture decision blocks this scoped work.

## Manual public-root observations

Executed finite one-off Node stdin consumers, no test/script file, assertions,
runner, random matrix or CI step added. Reproduce central flow after build with
`node --input-type=module` from workspace root:

```js
import {createCoordinateSpaceDefinition as makeSpace,createOrthogonalGridDefinition as makeGrid,describeGridConversion} from '@rpg-platform/editor';
import {gridCellToScenePosition as forward,scenePositionToGridCell as inverse} from '@rpg-platform/runtime-render';
const space=makeSpace({reference:{projectId:'sample',coordinateSpaceId:'scene-plane'},componentCount:2,axes:{x:'right',y:'down'},origin:{x:100,y:200},unit:'metre'});
const grid=makeGrid({space:space.reference,orientation:'orthogonal',origin:{x:10,y:-4},cellSize:{width:2.5,height:3},indexing:{columnDirection:'positive-x',rowDirection:'negative-y',negativeIndices:'allow'}});
const dto=describeGridConversion(grid,space);
const cell=(row,column)=>({space:dto.space,cell:{row,column}}),position=(x,y)=>({space:dto.space,point:{x,y}});
for(const [r,c,a] of [[0,0,'start-corner'],[2,3,'start-corner'],[2,3,'center'],[-1,-2,'start-corner']]){
  const p=forward(dto,cell(r,c),a);console.log(r,c,a,p,inverse(dto,p,'floor'));
}
for(const x of [12.5-1e-9,12.5,12.5+1e-9]) console.log(x,inverse(dto,position(x,-4),'floor'));
for(const y of [-7+1e-9,-7,-7-1e-9]) console.log(y,inverse(dto,position(10,y),'floor'));
try{console.log(inverse(dto,{space:{...dto.space,unit:'pixel'},point:{x:10,y:-4}},'floor'));}catch(e){console.log(e.name,e.message);}
```

| Explicit input/action | Expected | Observed |
| --- | --- | --- |
| row/column (0,0), corner | (10,-4) -> (0,0) | exact |
| (2,3), corner | (17.5,-10) -> (2,3) | exact |
| (2,3), center | (18.75,-11.5) -> (2,3) | exact |
| (-1,-2), corner, allow | (5,-1) -> (-1,-2) | exact |
| x=12.5-1e-9 / 12.5 / 12.5+1e-9; y=-4 | columns 0/1/1, row0 | exact |
| y=-7+1e-9 / -7 / -7-1e-9; x=10 | rows 0/1/1, col0 | exact |
| x=10-1e-9,y=-4 | column -1, not 0 | row0,column-1 |
| reverse signs to -x/+y, (2,3) center | (1.25,3.5) -> (2,3) | exact |
| Two adapter/forward calls, caller space/grid/Scene JSON compared | Independent frozen outputs; no caller mutation | all comparison/freeze flags true, scoped sample/scene-plane/metre retained |
| Mutate raw captured request origin/unit | Snapshot unchanged | origin.x10, unit metre |
| Mismatch project / coordinateSpaceId / unit | TypeError | Grid coordinate space or unit mismatch |
| Adapter supplied other coordinateSpaceId | TypeError | Authored grid and coordinate space mismatch |
| Reject policy + position(9,-4) or cell(-1,0) | RangeError | Grid cell is outside the nonnegative index domain |
| Fractional row1.5; NaN point.x | TypeError | safe integers / finite number errors |
| Width0 / height-1; hexagonal | TypeError | dimensions must be positive / only orthogonal supported |
| Inverse policy nearest | TypeError | Only floor grid-cell classification is supported |
| width MAX_VALUE, origin(0,0), col2 corner | RangeError | non-finite position result |
| origin.x1e20,width1,col1 corner | RangeError | cannot roundtrip at binary64 precision |
| origin.x1e20,width1,col0 center | RangeError | center collapsed onto a boundary |
| Position x1e20 | RangeError | result exceeds safe-integer indices |
| Headless import/conversion | No graphics requirement | document/WebGLRenderingContext undefined |

Additional rows observed with explicit input substitutions listed above and existing
createSceneMembership sample/zone + visual placement scene-plane (7.25,-2).
These observations do not constitute a numerical test suite or visual review.

## Verification

| Exact commands/evidence, repeated at checkpoint HEAD | Result |
| --- | --- |
| node harness/cli.mjs check | ARCH_CHECK_PASS, 51 JS/TS source files; static import scan only |
| node harness/cli.mjs scope --projects editor,runtime-render --allow-infra | SCOPE_PASS, eleven paths before commit; committed scope inspected, clean afterward |
| node harness/cli.mjs verify --projects editor,runtime-render --with-consumers | BUILD_PASS runtime-render, editor, game-client |
| npm run build -- --force | BUILD_PASS all five projects |
| Source/emitted root symbol inventory | Editor 84/84, Render 33/33; old exports retained |
| In-memory root declaration consumer | strict/noEmit/skipLibCheck:false, NodeNext ES2022 without DOM, zero diagnostics; Editor adapter and both Render operations with all new types |
| git diff --check | PASS |

No unconfigured/failed build. Existing Windows Harness DEP0190 warning nonblocking.
Exact-head push/PR CI links/results in PR/handoff. No broad numerical certification,
UI/snapping, visuals/GPU, asset loading, tile/maps or gameplay verification. Developer
owns product review and acceptance. STOP before v0.4.6.
