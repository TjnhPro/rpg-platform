# v0.4.10 — Editor–Render Spatial Integration (SP16)

READY_FOR_DEVELOPER_REVIEW. Finite headless observations MANUALLY_OBSERVED;
general functional/visual behavior FEATURE_NOT_VERIFIED. Stop before v0.4.11.
Checkpoint SHA and exact-head CI recorded outside this self-referencing commit in
the same Draft [PR #4](https://github.com/TjnhPro/rpg-platform/pull/4).

## Preflight / ownership

Source HEAD / previous implemented v0.4.9:
ce4971d3425c4c72f24ca1243a7ec95db5ad05f5. Clean local/upstream/PR heads matched;
feat/editor-render-spatial-contracts-v0.4, PR base main. Continue under Developer's
explicit instruction to implement and review at the end; green prior CI does not
establish acceptance. Phase 1–3 accepted merge baselines remain recorded in SP01,
ending at 5ce0feb4c1967c0dee14919b9c11d56991a46bd0.

Read task, root/project guidance, architecture/Foundation/README, Harness ownership,
contracts/workflow/verification, source roots, manifests and emitted declarations.
Audit: SC15 describeSceneObjectVisual retains correlation/opaque placement outside
AR14 resource descriptor; describeResolvedVisualAsset + prepareVisualResource only
prepare image metadata. Phase 1 createRenderSession uses ephemeral symbols;
frame acquisition/submission has no Scene instance or placement API. Do not attach
spatial requests to that lifecycle or claim they render objects. Phase 4 already
provides explicit coordinate definitions and canonical plane/viewport conversion.
Root-only package exports and Editor -> Render dependency already support this
handoff, with no new Render API required. No external engine documentation needed.

Primary behavior owner Editor (Scene adapter); Render collaborator owns all math
and unchanged portable input contract. Route hints listed both; source establishes
the split. L1/L2 unused by this change, installed Core2.0.0/Gameplay0.15.2 pins
unchanged. Eight paths: editor/src/{index.ts,scene-spatial-point.ts}, editor/AGENTS.md,
ARCHITECTURE.md, README.md, harness/{OWNERSHIP.md,CONTRACTS.md} and this report.
No Engine/Client/Server/Render production, schema, dependency/lockfile/workflow,
package version or sixth-project change. No unresolved blocking owner decision.

## Additive API / actual consumer

Two new Editor exports: describeSceneObjectSpatialPoint and
SceneObjectSpatialDescription (88 -> 90 source/emitted symbols). Render remains
52/52, no old exports removed. Function takes SceneMembership, objectId and explicit
CoordinateSpaceDefinition. Reuses canonical Scene capture and coordinate factory;
matching Scene project + placement space required. Frozen detached result contains
caller-held correlation {projectId,sceneId,objectId} and either described/request
or unavailable/NO_PLACEMENT. Absent/null placement returns before space validation,
consistent with existing optional alignment adapter; typed signature still requires
the explicit definition argument. Missing object and invalid/mismatched placed
data throw TypeError (SceneValidationError is its subclass); host errors propagate.

Only request {plane,point}, typed as existing Render PlaneProjectionPoint2D, crosses
to Render root projectPointToViewport2D or projectPlanePoint2D. No Editor document,
object definition, Asset reference/metadata, layer, attachment, label or UI state
crosses. Origin labels are not added. Caller supplies the approved viewport mapping;
Render validates kind/plane/unit/axes and computes results. Unsupported kinds reject
with TypeError, numeric overflow with RangeError, no identity fallback. No Editor
math, hidden lookup, attachment propagation, anchor/grid/transform application or
automatic conversion chain. Existing APIs remain separately composable as needed.

Authored correlation stays stable across calls and independent objects; Render
session.id remains a fresh nonserializable symbol. No DTO field conflates the two;
no session/visual instance mapping store or GPU allocation is introduced. AR14/SC15
resource description remains independent and unchanged. Spatial requests can be
used without an Asset; metadata preparation does not load/display anything.

## Reproduce finite manual observations

One-off Node stdin, public-root imports only; no saved scripts/test suite:

```js
import * as E from '@rpg-platform/editor';
import * as R from '@rpg-platform/runtime-render';
const space=E.createCoordinateSpaceDefinition({reference:{projectId:'sample',coordinateSpaceId:'scene-plane'},componentCount:2,axes:{x:'right',y:'up'},origin:{x:999,y:888},unit:'metre'});
const viewport=E.createCoordinateSpaceDefinition({...space,reference:{projectId:'sample',coordinateSpaceId:'viewport'},axes:{x:'right',y:'down'},unit:'css-px'});
const projection=E.describeOrthographicPlaneProjection(space,viewport,{sourceOrigin:{x:10,y:-4},destinationOrigin:{x:100,y:200},destinationUnitsPerSourceUnit:{x:20,y:10}});
const mapping=E.describeViewportMapping(projection,{plane:projection.destination,width:800,height:600,screen:null});
const scene=E.createSceneMembership({scene:{identity:{projectId:'sample',sceneId:'zone'}},objects:[{definition:{objectId:'a'},placement:{coordinateSpaceId:'scene-plane',point:{x:12,y:3}}},{definition:{objectId:'b'},placement:{coordinateSpaceId:'scene-plane',point:{x:10,y:-4}}},{definition:{objectId:'text'}},{definition:{objectId:'null'},placement:null}]});
for(const id of ['a','b','text','null']) {
  const d=E.describeSceneObjectSpatialPoint(scene,id,space);
  console.log(d.correlation,d.status==='described'?R.projectPointToViewport2D(mapping,d.request):d.reason);
}
```

| Input/action | Expected | Observed |
| --- | --- | --- |
| a scene(12,3), explicit mapping above | viewport(140,130), own a correlation | exact |
| b scene(10,-4) | viewport(100,200), own b correlation | exact; independent of a |
| Absent and null placement | unavailable/NO_PLACEMENT, no default coordinates | exact, even undefined definition from untyped JS |
| Recursive freeze and mutation of raw space axes/origin | detached frozen request remains up/(12,3) | true; request point distinct from Scene point |
| JSON roundtrip request/mapping through Render | portable DTO, same viewport result | (140,130) |
| Missing object / foreign project / unknown space / invalid axes | TypeError, no repair | observed canonical errors |
| Infinity placement from untyped caller | TypeError | SceneValidationError, finite components required |
| Substitute perspective kind in mapping | TypeError, no fallback | Only orthographic-plane projection is supported |
| Render request unit tile instead of metre | TypeError | source plane/unit/axes mismatch |
| MAX_VALUE x with mapping scale20 | RangeError | nonfinite planar arithmetic |
| Throwing space axes getter | original host error propagates | same error identity |
| Two binding-only createRenderSession calls | distinct symbols; authored ID remains a | symbol, distinct true; no session id in request |
| Scene/Asset catalog JSON before/after all calls | unchanged supported data | equality true |

Additional SC15/AR14 observation used the same a/b entries with image reference
sample/image, expectedKind image, null subresource; catalog image metadata
{vendor:{keep:[7,'opaque']}}, image source assets/image.png. Existing visual
description returned described and Render preparation metadata-prepared. Labels,
layer front and b attachment to a remained untouched. No actual file existence,
decoding/loading or display established. window/document/WebGLRenderingContext
were undefined. No session initialization, frame submission or GPU acquisition.

## Verification / limits

| Command/evidence | Result |
| --- | --- |
| node harness/cli.mjs check | ARCH_CHECK_PASS, 59 JS/TS source files |
| node harness/cli.mjs scope --projects editor,runtime-render --allow-infra | SCOPE_PASS, eight paths |
| node harness/cli.mjs verify --projects editor,runtime-render --with-consumers | BUILD_PASS Render, Editor, game-client |
| npm run build -- --force | BUILD_PASS all five projects |
| Source/emitted root inventory | Editor90/90, Render52/52; no removals |
| Strict in-memory public-root declaration consumer | zero diagnostics; NodeNext/ES2022/no DOM, skipLibCheck:false |
| New source/emitted DTO inspection | no THREE/DOM/backend/private path imports |
| git diff --check | PASS |

Static/build/declaration evidence repeated at final checkpoint HEAD. CI/SHA links
are recorded in PR/handoff. No failed/unconfigured build; existing Windows Harness
DEP0190 warning remains nonblocking. No test files/runners/coverage/CI steps added
or executed. Build is compilation evidence, not universal numerical correctness.
Text RPG remains coordinate-free. Presentation pixels are never Engine gameplay
truth; Server remains independent of GPU/DOM. General functional/visual review,
Scene instances/rendering, live camera/UI and persistent definition consistency
remain open. No v0.4.11, merge, tag, release or publication.
