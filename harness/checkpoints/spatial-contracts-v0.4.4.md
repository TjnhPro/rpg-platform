# v0.4.4 — Grid Coordinate Foundation (SP08)

READY_FOR_DEVELOPER_REVIEW. Authored capture examples MANUALLY_OBSERVED;
conversion, UI/visuals/gameplay FEATURE_NOT_VERIFIED. STOP before v0.4.5.

## Preflight and scope

Source HEAD / previous checkpoint: 30c5012e0b1c256cea5628a870f4c876f0ce8dc5.
Developer supplied this task under the earlier instruction to implement/verify and
review at the final step; authorization comes from those instructions, not CI.
Phase 1–3 exact accepted baselines/evidence remain in SP01, ending at
5ce0feb4c1967c0dee14919b9c11d56991a46bd0. Initial worktree clean, same branch
feat/editor-render-spatial-contracts-v0.4 and open Draft
[PR #4](https://github.com/TjnhPro/rpg-platform/pull/4), base main.
Final checkpoint SHA and exact-head push/PR CI links recorded in PR/handoff outside
this commit. No merge, tag, release, npm publication or package-version bump.

Read root/project guidance, architecture, Foundation/README and Harness ownership,
contracts/workflow/verification. Audited coordinate-space.ts, SC08 placement, Scene
definitions, source/root manifests and emitted declarations. Baseline Editor 81 /
Render 26 exports. No grid source/API exists. Coordinate space already owns scoped
reference, axes and unit; Scene placement is optional finite point data, not indices.
Router suggested Editor, used as a hint only.

Canonical owner: Editor authored grid declarations. Render collaborator guidance
only: no catalog, API or source changes. Existing Editor code needs no adjustment;
the real ad hoc root consumer below uses both new exports and existing Scene/space
APIs. No production project consumes Editor currently. Required Harness command
also rebuilds Render and its game-client consumer. No L1/L2 API required.

Nine paths: editor/src/{orthogonal-grid.ts,index.ts}, editor/AGENTS.md,
runtime-render/AGENTS.md, ARCHITECTURE.md, README.md, harness/OWNERSHIP.md,
harness/CONTRACTS.md and this checkpoint. No Engine/Client/Server source,
Scene/Asset schema, pins, manifest, dependency, lockfile or workflow changes.

## Contract choices and limits

Two additive Editor root exports: OrthogonalGridDefinition and
createOrthogonalGridDefinition (81 -> 83). Render unchanged at 26; baseline exports
retained. Same readonly type for complete input/output; every field required:
space, orientation:'orthogonal', origin:{x,y}, cellSize:{width,height}, indexing.
Factory reuses createSpatialPoint2D for reference/origin validation and capture.
Exact own-key plain/null-prototype records, finite origin, positive finite sizes,
detached/deeply frozen outputs. Invalid data TypeError; host exceptions propagate.

Origin is cell (row=0,column=0)'s start corner, not center or coordinate-space
origin label. Rectangular dimensions are extents in the referenced space's unit,
not tile pixels or map width/height. Columns follow x, rows y; direction explicitly
positive-x/negative-x and positive-y/negative-y. These are numeric signs, interpreted
through the caller's matching coordinate definition, not hardcoded physical axes.
Example: right/down metre space, grid origin (10,-4), size (2.5,3), columns +x and
rows -y describes a 2.5m by 3m cell extending right/up from its starting corner.
This is descriptor semantics, not an observed conversion algorithm.

Indices mean zero-based safe-integer row/column. negativeIndices:'allow' permits
negative indices; 'reject' declares nonnegative indices. No index input/check,
rounding, floor/nearest boundary rule or clamping operation exists in SP08.
Cell index identifies a cell only in its specific caller-owned grid context; no
global cell/grid ID is inferred from space or row/column. Scene points remain
independent fractional/negative values; tile IDs belong to future authored Asset/map
binding, map dimensions to future Editor map content. Neither is defined here.
No bounded extent, occupancy, paint layers, collisions, registry or manager.

Research: [Tiled TMX reference](https://doc.mapeditor.org/en/stable/reference/tmx-map-format/)
(accessed 2026-10-22) distinguishes orientation, map/tile dimensions, tile IDs and
freely placed objects. Platform choice is narrower: only orthogonal descriptor
capture, no Tiled format/tileset import. Isometric needs different basis semantics,
staggered needs offset/parity, hex needs topology/axis policy; all reject explicitly,
no advertised conversion support. Existing Render affine math is not an authored
grid catalog. Future grid conversion belongs to Render's approved scope.

Text Scene needs no grid/coordinates. 2.5D may use this optional ground plane with
explicit axes/unit; no height, anchor, projection or Scene/Asset identity change.
Engine retains game-specific movement/range/collision policy; Server requires no
DOM/GPU. No missing architectural decision blocks this descriptor-only scope.

## Manual public-root evidence

One-off Node stdin after build, no test/script file, assertion suite or automatic
runtime gate. Reproduce core observations with `node --input-type=module`:

```js
import {createCoordinateSpaceDefinition as spaceDefinition,createOrthogonalGridDefinition as gridDefinition,createSceneMembership} from '@rpg-platform/editor';
const space=spaceDefinition({reference:{projectId:'sample',coordinateSpaceId:'scene-plane'},componentCount:2,axes:{x:'right',y:'down'},origin:{x:0,y:0},unit:'metre'});
const raw={space:space.reference,orientation:'orthogonal',origin:{x:10,y:-4},cellSize:{width:2.5,height:3},indexing:{columnDirection:'positive-x',rowDirection:'negative-y',negativeIndices:'allow'}};
const scene=createSceneMembership({scene:{identity:{projectId:'sample',sceneId:'zone'}},objects:[{definition:{objectId:'visual'},placement:{coordinateSpaceId:'scene-plane',point:{x:7.25,y:-2}}}]});
const before=JSON.stringify({raw,scene}),a=gridDefinition(raw),b=gridDefinition(raw);
console.log(space,a,a!==b,before===JSON.stringify({raw,scene}));
console.log(Object.isFrozen(a),Object.isFrozen(a.space),Object.isFrozen(a.origin),Object.isFrozen(a.cellSize),Object.isFrozen(a.indexing));
raw.origin.x=999;raw.cellSize.width=999;raw.indexing.negativeIndices='reject';
console.log(a.origin.x,a.cellSize.width,a.indexing.negativeIndices,scene);
console.log(createSceneMembership({scene:{identity:{projectId:'sample',sceneId:'text'}}}));
const observe=(label,input)=>{try{console.log(label,gridDefinition(input));}catch(e){console.log(label,e.name,e.message);}};
observe('ZERO_WIDTH',{...a,cellSize:{width:0,height:3}});
observe('NEGATIVE_HEIGHT',{...a,cellSize:{width:2.5,height:-1}});
observe('UNSUPPORTED',{...a,orientation:'isometric'});
```

| Input/action | Expected | Observed |
| --- | --- | --- |
| Metre space + nonzero grid above | Explicit supported descriptor retained | origin(10,-4), size(2.5,3), orthogonal, +x/-y/allow |
| Two calls with same input/Scene | Independent immutable captures; caller unchanged | distinct references; before/after JSON equal; all five freeze flags true |
| Mutate raw origin/size/policy | Captured data retained | 10, 2.5, allow |
| Existing free placement with grid authored separately | Identity and coordinates independent | sample/zone + visual, scene-plane point(7.25,-2), unchanged |
| Text Scene with no grid/coordinates | Valid authored Scene | sample/text, objects[] |
| Reversed directions and negativeIndices reject | Explicit policy captured without clamp | negative-x/positive-y/reject |
| width 0; height -1; height Infinity | TypeError | respective cellSize.width/height must be a positive finite number |
| origin x NaN | TypeError | Spatial point components x/y must be finite numbers |
| isometric; staggered; hexagonal orientation | TypeError | Only orthogonal grid orientation is supported |
| Missing negativeIndices | TypeError | Grid indexing must be a plain record with exactly columnDirection, rowDirection, negativeIndices |
| Extra mapWidth:10 | TypeError | Orthogonal grid must be a plain record with exactly space, orientation, origin, cellSize, indexing |
| Headless capture | No graphics globals required | document/WebGLRenderingContext undefined |

Additional rows were observed by the same root consumer using the explicit input
substitutions listed; no generalized test matrix or saved runner was created.
No grid-index validation or grid/Scene conversion was claimed observed.

## Build/static verification

| Command/evidence (repeated at checkpoint HEAD) | Result |
| --- | --- |
| node harness/cli.mjs check | ARCH_CHECK_PASS, 49 JS/TS source files, static scan only |
| node harness/cli.mjs scope --projects editor,runtime-render --allow-infra | SCOPE_PASS, nine paths precommit; committed scope inspected, clean afterward |
| node harness/cli.mjs verify --projects editor,runtime-render --with-consumers | BUILD_PASS runtime-render, editor, game-client |
| npm run build -- --force | BUILD_PASS all five projects |
| Source/emitted root symbol inventories | Editor 83/83, Render 26/26; all old exports retained |
| In-memory declaration consumer | Root imports both additions plus existing space/Scene, strict/noEmit/skipLibCheck:false NodeNext ES2022 without DOM; zero diagnostics |
| git diff --check | PASS |

No failed/unconfigured build. Existing Windows DEP0190 warning is nonblocking.
Exact-head push/PR CI results are in PR/handoff. No tests/runners/dependencies/CI
steps added. Builds/capture observations do not verify conversion, UI/snapping,
visuals, GPU frames, resource loading, maps or gameplay. Developer owns product
review/acceptance. STOP before v0.4.5 — Grid & Scene Coordinate Conversions.
