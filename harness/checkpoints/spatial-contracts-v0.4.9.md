# v0.4.9 — Scene Spatial Integration (SP15)

READY_FOR_DEVELOPER_REVIEW. Finite public-root authored-data observations below
MANUALLY_OBSERVED; general functional/visual correctness FEATURE_NOT_VERIFIED.
Stop before v0.4.10. Checkpoint SHA/CI links recorded outside this self-referencing
commit in the same Draft [PR #4](https://github.com/TjnhPro/rpg-platform/pull/4).

## Preflight and scope

Source HEAD / previous implemented v0.4.8:
109613a0e0ba58cbc615676e08ef94694126eeb1. Continuing under Developer's explicit
instruction to implement without prior review requests, not inferring acceptance
from green builds. Phase 1–3 accepted merge baselines remain recorded in SP01,
ending at 5ce0feb4c1967c0dee14919b9c11d56991a46bd0. Initial local/upstream/PR heads
matched, clean worktree, feat/editor-render-spatial-contracts-v0.4, PR base main.

Read root/project guidance, task, architecture/ownership/contracts, Foundation,
README, workflow/verification, source/public roots/manifests/emitted declarations.
Audited Phase 3 SC08 placement, SC11 focused immutable updates, Scene/Object IDs,
Asset references, labels/layers/attachments and current v0.4.1–v0.4.8 contracts.
Existing Scene operation already preserves supported unrelated fields, but accepts
opaque coordinateSpaceId without validating a supplied coordinate definition.
Existing coordinate factories provide exact scoped keys, finite 2D data and explicit
units/axes/origin. No missing Render math capability is needed for a literal update.
Route hint Editor agrees with ownership derived from that source evidence.

Primary owner Editor; Render collaborator needs no source/API changes because
this operation does no conversion. No L1/L2 APIs required; installed Core2.0.0 /
Gameplay0.15.2 and pins unchanged. Eight paths only: editor/src/{index.ts,
scene-spatial-placement.ts}, editor/AGENTS.md, ARCHITECTURE.md, README.md,
harness/{OWNERSHIP.md,CONTRACTS.md} and this report. No Engine/Client/Server/Render
production change, manifest/dependency/lockfile/workflow/package version change.

## Additive contract

One new Editor root export (87 -> 88), updateSceneObjectSpatialPlacement:
(SceneMembership, objectId, CoordinateSpaceDefinition, SpatialPoint2D) -> SceneMembership.
Render stays 52. No old export/signature or Scene/Asset DTO changes.

Capture definition and point through createCoordinateSpaceDefinition and
createSpatialPoint2D; exact definition/point project+space and owning Scene project
must match. A single explicit definition provides the necessary per-call scope;
no list/index/cache or implicit resolution. Delegate to updateSceneObjectPlacement,
which calls canonical replacement/capture, never a parallel Scene implementation.

Target may have absent/null placement (attach) or existing placement (replace).
Other supported fields/IDs/order/references are preserved by value; candidate
recaptures objects, so reference equality/structural sharing is not promised.
No rename/upsert, relationship traversal or attached-object position propagation.
Source factory snapshots remain intact on success/failure. Unknown document fields
are outside the existing Scene factory contract; this is not a document save API.

Point values are already in the supplied definition's axes/units. Origin labels
are not added. A deliberate alternate definition+matching point can replace the
space literally; it does not preserve physical position by automatic conversion.
Caller retains definitions and is responsible for consistency across calls; this
does not retroactively validate every existing Scene placement. Prior opaque
Scene API remains compatible. TypeError for invalid data/mismatch/missing object;
unknown accessor errors propagate. Clearing uses existing updateSceneObjectPlacement
with null. No approved Scene anchor/direction fields exist: keep them separate
caller-owned visual config, as v0.4.6 already does. No automatic schema migration.

No external engine research needed: repository contracts resolve this data-only
integration. Any future numeric conversion must call Render root APIs; this task
adds no formulas, viewport mapping consumer, Render instance or preview adapter.

## Reproduce finite manual observations

Executed via one-off Node stdin (node --input-type=module), no saved script/test:

```js
import * as E from '@rpg-platform/editor';
const space=E.createCoordinateSpaceDefinition({reference:{projectId:'sample',coordinateSpaceId:'scene-plane'},componentCount:2,axes:{x:'right',y:'up'},origin:{x:999,y:888},unit:'metre'});
const ref={projectId:'sample',assetId:'visual-image',expectedKind:'image',subresourceId:null};
const old=E.createSceneMembership({scene:{identity:{projectId:'sample',sceneId:'zone'}},objects:[{definition:{objectId:'a',displayName:'First',classification:'placeholder'},assetReference:ref,layerKey:'front',placement:{coordinateSpaceId:'scene-plane',point:{x:1,y:2}}},{definition:{objectId:'b',displayName:'Second'},assetReference:ref,layerKey:'back'},{definition:{objectId:'vfx',displayName:'Effect'},assetReference:ref,attachment:{kind:'attachment',target:{sceneId:'zone',objectId:'a'}},placement:null}]});
const before=JSON.stringify(old);
const rawPoint={space:space.reference,point:{x:-3,y:4.5}};
const candidate=E.updateSceneObjectSpatialPlacement(old,'a',space,rawPoint);
const attached=E.updateSceneObjectSpatialPlacement(candidate,'b',space,{space:space.reference,point:{x:0,y:0}});
console.log(E.getSceneObject(old,'a').placement,E.getSceneObject(candidate,'a').placement);
console.log(before===JSON.stringify(old),E.getSceneObject(attached,'b').placement);
```

| Action/substitution | Expected | Observed |
| --- | --- | --- |
| Replace a placement (1,2) with (-3,4.5) | only a placement changes, no origin offset | exact; old still(1,2) |
| Attach b at (0,0) | placement added, earlier absence retained | new(0,0); prior hasOwn placement false |
| Compare Scene with placements removed | IDs/order/Asset refs/layers/labels/attachments retained | JSON equality true |
| Compare unrelated b/vfx entries before/after a update | unchanged supported values | JSON equality true |
| Snapshot/Asset catalog before/after | unchanged | both JSON equality true |
| Mutate raw point.x77 and raw definition origin.x77 | captured placement remains -3 | -3; Scene/list/placement point frozen true |
| Point space unknown/screen or foreign point project | TypeError, no screen fallback/removal | project/space mismatch |
| Matching foreign definition+point against sample Scene | TypeError | project/space mismatch |
| Infinity component / extra point z / missing definition / invalid axes | TypeError | canonical finite/exact-record/axes validation |
| Missing target (including empty Scene) | TypeError, no upsert | Cannot update a missing Scene objectId |
| Alternate explicit definition (left/down, tile-unit), point(1,2) | literal new space/point, no inferred conversion | alternate/(1,2) |
| Clear through existing API with null | candidate placement null, prior snapshot survives | null; prior(-3,4.5) |
| Empty/Text Scene without spatial fields | valid, no coordinates/grid required | objects0; text placement absent |
| Throwing point.space getter | original marker error | identity comparison true |
| Source after all rejected calls | unchanged | JSON equality true |

Also resolved the preserved image reference against existing Phase 2 catalog:
sample/visual-image, kind image, metadata {vendor:{keep:['opaque',7]}}, source
assets/visual.png. Resolver returned resolved; describeSceneObjectVisual returned
described with updated placement. Catalog/source metadata unchanged. No Asset IO,
image loading, session/camera/frame or graphical verification. window/document/
WebGLRenderingContext undefined. Visual labels do not implement gameplay entities.

## Verification / stop

| Command/evidence | Result |
| --- | --- |
| node harness/cli.mjs check | ARCH_CHECK_PASS, 58 JS/TS source files |
| node harness/cli.mjs scope --projects editor,runtime-render --allow-infra | SCOPE_PASS, eight paths before commit |
| node harness/cli.mjs verify --projects editor,runtime-render --with-consumers | BUILD_PASS Render, Editor, game-client |
| npm run build -- --force | BUILD_PASS all five projects |
| Source/emitted root inventory | Editor88/88, Render52/52, no previous exports removed |
| Strict in-memory public-root declaration consumer | zero diagnostics, new API + existing types, ES2022/NodeNext/no DOM, skipLibCheck:false |
| git diff --check | PASS |

Final static/build/declaration evidence repeated at checkpoint HEAD; SHA and CI
recorded in PR/handoff. No failed/unconfigured build remains. Existing Windows
Harness DEP0190 warning nonblocking. No test files/runners/CI steps created or run.
Text content stays opt-in; 2D/2.5D configuration may change without Scene/Asset ID
schema changes. Gameplay position/movement/collision stay Engine-owned; Server
requires no GPU/DOM. No blocking architecture decision. Definition persistence/
revision consistency, unknown-document preservation, stored visual config and
general product behavior remain open. No v0.4.10, merge, tag, release or publication.
