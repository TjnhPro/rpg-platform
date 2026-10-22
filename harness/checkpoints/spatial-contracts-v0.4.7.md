# v0.4.7 — Projection Foundation (SP12)

READY_FOR_DEVELOPER_REVIEW. Finite public-root numeric/data flow MANUALLY_OBSERVED;
general functional/visual correctness FEATURE_NOT_VERIFIED. Stop before v0.4.8.

## Preflight and audit

Source HEAD / previous implemented v0.4.6:
66d8b6617dedb1427c4d9df67beee393362bcaca. Continuing under Developer's explicit
instruction to implement without requesting prior review approval; no historical
approval inferred from green builds. Phase 1–3 exact accepted baselines remain in
SP01, ending at 5ce0feb4c1967c0dee14919b9c11d56991a46bd0. Clean initial worktree,
feat/editor-render-spatial-contracts-v0.4, same Draft [PR #4](https://github.com/TjnhPro/rpg-platform/pull/4),
base main; local/source/PR heads matched. Final SHA/CI recorded outside this commit.

Read root/project guidance, architecture/ownership/contracts, Foundation/README,
workflow/verification, current public roots/manifests/declarations and relevant
source. Baseline Editor 85 / Render 39 symbols. Audited coordinate definitions
(origin is a label), optional SC08 placement/SC15 visual metadata, planar TRS and
affine operations, grid conversion, independent anchor/facing alignment and frame
session/private three-frame backend. Existing graphics acquisition is explicit and
lazy; private backend owns a generic Three Camera for an empty clear frame.
It neither exposes a projection contract nor measures a global viewport for callers.
This task does not change that backend/session lifecycle or implement Phase 9.

Primary owner Runtime Render: portable pure forward mapping. Editor collaborator
adapts existing authored source/destination space definitions and explicit mapping
config through the Render public root, no formulas. Consumers Editor/game-client
rebuild; no L1/L2 API required. Eleven paths: Render src/{plane-projection.ts,index.ts},
Editor src/{plane-projection.ts,index.ts}, both AGENTS.md, ARCHITECTURE.md, README.md,
harness/{OWNERSHIP.md,CONTRACTS.md} and this report. No Engine/Client/Server sources,
pins/dependencies/manifests/lockfile, workflow, package version or sixth project edits.

## Contract and research decisions

Render adds ProjectionPlane2D, PlaneProjectionPoint2D, OrthographicPlaneProjection,
createOrthographicPlaneProjection and projectPlanePoint2D (39 -> 44). Editor adds
describeOrthographicPlaneProjection (85 -> 86). Existing exports/signatures retained.

Only kind orthographic-plane is supported: an axis-aligned selected 2D source plane
to declared presentation plane, with no depth, rotation, shear, NDC or clipping.
Each plane carries exact projectId/coordinateSpaceId/unit and explicit x right/left,
y up/down axes. Points carry that full plane context; source mismatches reject.
Unit labels stay verbatim and do not imply a scale; caller supplies positive finite
per-axis destinationUnitsPerSourceUnit, even when labels happen to match.

For each component, sign is +1 when corresponding source/destination axes agree,
-1 otherwise. Correspondence origins are explicit points in their respective units:

```text
q.x = destinationOrigin.x + signX * ratio.x * (p.x - sourceOrigin.x)
q.y = destinationOrigin.y + signY * ratio.y * (p.y - sourceOrigin.y)
```

Operation reuses existing affine point operations in two stages: subtract source
origin, then signed scale and destination translation. Editor adapter captures
existing CoordinateSpaceDefinition values and passes the mapping's three numeric
records into Render capture. Authored space origin labels are NOT additional
offsets. Construction projects known mapping fields; Render descriptor/point
records require exact own keys on plain/null-prototype objects, finite numbers,
valid axes/keys/unit and positive ratios. Snapshot/results deeply detach/freeze.
No input/global store/Scene/Object/Asset/facing/anchor mutation or resource loading.

Invalid/mismatched inputs/unsupported kind throw TypeError. Nonfinite intermediate
or output arithmetic throws RangeError, even if an alternative arithmetic order
could avoid overflow. Unknown host accessor/proxy exceptions propagate. Binary64
rounding, underflow or cancellation remain possible; no universal accuracy or
roundtrip claim. Positive ratios do not certify numerical invertibility.

Research accessed 2026-10-22: [Three orthographic documentation](https://threejs.org/docs/pages/OrthographicCamera.html)
states size is independent of camera distance, while [perspective documentation](https://threejs.org/docs/pages/PerspectiveCamera.html)
describes field-of-view/aspect and view extent at a supplied distance. Platform
decision/inference: keep this 2D affine case separate from live camera/frustum
state. An isometric/2.5D view may need explicit basis/height; projection from an
unconstrained 3D point to 2D loses depth. A perspective screen point alone cannot
select one 3D point without depth or a plane/ray constraint. Even orthographic
3D-to-2D needs a selected plane for unique recovery. No inverse is offered here,
and perspective/isometric kinds reject rather than guess a plane or return identity.
No Three implementation/types or external engine code imported into this contract.

## Reproduce finite manual observations

Executed one-off Node stdin, no test files/assertions/runners/CI steps. After build,
paste into `node --input-type=module` from workspace root:

```js
import * as E from '@rpg-platform/editor';
import * as R from '@rpg-platform/runtime-render';
const make=(id,axes,unit)=>E.createCoordinateSpaceDefinition({reference:{projectId:'sample',coordinateSpaceId:id},componentCount:2,axes,unit,origin:{x:999,y:888}});
const source=make('scene-plane',{x:'right',y:'up'},'metre');
const target=make('view-plane',{x:'right',y:'down'},'view-unit');
const mapping={sourceOrigin:{x:10,y:-4},destinationOrigin:{x:100,y:200},destinationUnitsPerSourceUnit:{x:20,y:10}};
const projection=E.describeOrthographicPlaneProjection(source,target,mapping);
const authored=E.createSpatialPoint2D({space:source.reference,point:{x:12,y:3}});
const input={plane:projection.source,point:authored.point};
console.log(R.projectPlanePoint2D(projection,input));
console.log(R.projectPlanePoint2D(projection,{...input,point:{x:10,y:-4}}));
mapping.sourceOrigin.x=999;
console.log(projection.sourceOrigin.x,Object.isFrozen(projection.source.axes));
try { R.projectPlanePoint2D(projection,{...input,plane:{...input.plane,coordinateSpaceId:'other'}}); } catch(e) { console.log(e.name,e.message); }
try { R.createOrthographicPlaneProjection({...projection,kind:'perspective'}); } catch(e) { console.log(e.name,e.message); }
```

| Input/action (including explicit substitutions above) | Independent expected | Observed |
| --- | --- | --- |
| p(12,3), mapping above | (100+20*2,200-10*7) = (140,130), destination plane | exact sample/view-plane/view-unit/right/down retained |
| p equals sourceOrigin (10,-4) | destinationOrigin (100,200) | exact; authored origin label (999,888) not added |
| p(8,-7) | (60,230) | exact |
| Destination axes left/down with p(12,3) | (60,130) | exact |
| Mutate raw mapping sourceOrigin.x999 | captured x10 | 10; detached/frozen flags true |
| Wrong source space / unit pixel / axes right-down | TypeError | Projection source plane, unit or axes mismatch |
| Kind perspective / isometric | TypeError, no fallback | Only orthographic-plane projection is supported |
| Ratio x0,y1 | TypeError | Projection unit ratios must be positive |
| Input point.x Infinity / point with z5 | TypeError | finite numbers / exactly x,y errors |
| Input point.x MAX_VALUE | RangeError | Planar point arithmetic produced a non-finite result |
| Throwing sourceOrigin host getter | original error propagates | caught error === supplied marker true |

Also executed existing Scene/Asset flow: sample/zone visual object binds sample/image,
SC08 scene-plane placement (12,3); image source assets/visual.png, metadata {}.
describeSceneObjectVisual provides that placement and the canonical resource DTO;
createSpatialPoint2D scopes its point, Render projects it as above, and
prepareVisualResource returns metadata-prepared. Original Scene/projection JSON
unchanged, result/point/axes frozen. Text object visual description placement null;
empty Scene membership length0; document/WebGLRenderingContext undefined. No frame
session/camera constructed, image content loaded, UI or visual observation claimed.

## Verification / stop

| Command/evidence | Result |
| --- | --- |
| node harness/cli.mjs check | ARCH_CHECK_PASS, 55 JS/TS source files, static scan only |
| node harness/cli.mjs scope --projects editor,runtime-render --allow-infra | SCOPE_PASS, eleven scoped paths before commit |
| node harness/cli.mjs verify --projects editor,runtime-render --with-consumers | BUILD_PASS Render, Editor, game-client |
| npm run build -- --force | BUILD_PASS all five projects |
| Root source/emitted inventory | Editor 86/86, Render 44/44; all previous exports retained |
| In-memory strict package-root declaration consumer | zero diagnostics, ES2022/NodeNext/no DOM, skipLibCheck:false, all six additions consumed |
| git diff --check | PASS |

Build/declaration evidence repeated at final checkpoint HEAD; exact-head push/PR CI
links/results and SHA recorded in PR/handoff outside the commit. Existing Windows
Harness DEP0190 warning nonblocking. No failed/unconfigured build. No tests created
or executed. Text content remains spatially optional; 2D/2.5D games may opt into this
selected-plane mapping without identity changes; gameplay spatial truth remains
Engine-owned and Server needs no graphics. No blocking architecture decision;
inverse, isometric/perspective, CSS/device units, viewport/screen mapping, Phase 9
camera state and general numerical/functional/visual verification remain open.
No v0.4.8, merge, tag, release, publication or package version bump.
