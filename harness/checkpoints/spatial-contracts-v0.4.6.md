# v0.4.6 — Anchor, Pivot & Direction Contracts (SP10/SP11)

READY_FOR_DEVELOPER_REVIEW. Finite public-root observations MANUALLY_OBSERVED;
general functional/visual correctness FEATURE_NOT_VERIFIED. Stop before v0.4.7.

## Preflight and scope

Source HEAD / previous implemented checkpoint v0.4.5:
346d245bc8fd336755f79418bfd8e58b2f6fa051. Developer's latest explicit instruction
"triển khai task - không yêu cầu chấp thuận review" authorizes implementation
without the earlier prior-review gate; no historical approval is inferred from CI.
Phase 1–3 exact accepted baselines remain recorded in SP01, ending at
5ce0feb4c1967c0dee14919b9c11d56991a46bd0. Started clean on
feat/editor-render-spatial-contracts-v0.4, same Draft [PR #4](https://github.com/TjnhPro/rpg-platform/pull/4),
base main. Final checkpoint SHA/CI links recorded externally in PR and handoff.

Read root/project AGENTS, architecture/ownership/contracts, Foundation/README,
workflow/verification, source roots/manifests and emitted declarations. Audited
Scene definition/SC08 placement/SC15 visual description, coordinate definitions,
Render TRS/affine operations and Asset metadata/image projection. Asset metadata
has open portable extension keys, not canonical dimensions, pivot or direction
ordering; existing Render resource metadata does not decode images. No filenames,
TPSheet groups or arbitrary width/height/directions metadata are interpreted.
This contract chooses explicit local-unit data; no external engine convention
needs importing or porting. Numeric formulas reuse the existing Render point API.

Canonical primary owner: Runtime Render for visual anchor/pivot/facing semantics.
Editor collaborator reads authored placement plus explicit config/space and calls
the Render public root. Render's affected consumers Editor/game-client rebuild;
Engine/Server sources stay unchanged. No L1/L2 APIs/pins, dependencies, manifests,
lockfiles, workflows, Scene/Asset/session schemas or sixth project changes.
Eleven paths: runtime-render/src/{visual-alignment.ts,index.ts},
editor/src/{scene-visual-alignment.ts,index.ts}, both project AGENTS.md,
ARCHITECTURE.md, README.md, harness/{OWNERSHIP.md,CONTRACTS.md} and this checkpoint.

## Public contract / decisions

Render adds VisualAnchor2D, VisualOrientation2D, VisualAlignment2D,
createVisualAnchor2D, createVisualOrientation2D, resolveVisualAlignment2D (33 -> 39).
Editor adds describeSceneObjectAlignment (84 -> 85). Old exports retained.

Anchor descriptor contains unit, anchor, pivot and localOffset. All points are
absolute numeric local coordinates in the placement axes/unit at scale 1, NOT
normalized [0,1] fractions. Units are nonblank verbatim labels matched exactly;
labels alone cannot prove physical scale. Caller must supply coherent data.
No bounds/clamp, image metrics, trim rectangles or inferred center. A ground anchor
is a caller-chosen contact point; pivot is an independent caller-chosen point;
image center is just another explicit local coordinate, not the default pivot.
localOffset translates attachment in plane axes, never screen space or facing axes.

```text
attachment = authoredPosition + localOffset
origin     = attachment - localAnchor
planePivot = origin + localPivot
```

Resolver reuses existing planar affine point translations. Returns detached frozen
origin/pivot/unit/orientation, without replacing the Scene position. Pivot is
resolved as a point only; no rotation operation is applied. Facing remains visual
metadata, never a gameplay targeting decision, image rotation or animation selector.

Facing is angle-only: explicit zeroAxis positive-x, positiveRotation
toward-positive-y, declared axes x right/left and y up/down. Physical turn is
clockwise for right/down or left/up, counterclockwise for right/up or left/down.
0 is +x, PI/2 is +y, PI is -x, 3*PI/2 is -y. Canonical interval [0,2*PI): zero
included, full-turn endpoint rejected; negative angles do not wrap. Signed zero
canonicalizes to +0. No discrete transitions, frame indices or hard-coded counts:
8/16/32-direction consumers may later supply angles 2*PI*k/N for 0<=k<N; no
sector quantization, nearest-direction policy or animation binding implemented.

Exact own-key plain/null-prototype records and finite numbers; capture deeply
detaches/freezes nested data. Invalid structures, conventions, axes, angles and
unit mismatches throw TypeError. Nonfinite intermediate/output math throws
RangeError with no partial output; unknown host accessor/proxy exceptions propagate.
JS binary64 rounding/underflow remains possible; no universal accuracy guarantee.

Editor adapter uses canonical Scene capture, matches Scene project and placement
space to the supplied definition, matches facing axes, and delegates unit/math to
Render. Space origin remains a label, not an offset. No placement returns null
before spatial config validation; missing object rejects. Config stays with the
caller, not an additive Scene metadata schema or a global registry. Existing
describeSceneObjectVisual/prepareVisualResource continue the separate Asset flow.

## Reproducible manual observations

Executed one-off Node stdin, no test/script files, assertions, runner or CI step.
After build, paste into `node --input-type=module` from workspace root:

```js
import * as E from '@rpg-platform/editor';
import * as R from '@rpg-platform/runtime-render';
const space=E.createCoordinateSpaceDefinition({reference:{projectId:'sample',coordinateSpaceId:'scene-plane'},componentCount:2,axes:{x:'right',y:'down'},origin:{x:100,y:200},unit:'local-unit'});
const scene=E.createSceneMembership({scene:{identity:{projectId:'sample',sceneId:'zone'}},objects:[{definition:{objectId:'visual'},assetReference:{projectId:'sample',assetId:'image'},placement:{coordinateSpaceId:'scene-plane',point:{x:100,y:200}}},{definition:{objectId:'text'}}]});
const raw={unit:'local-unit',anchor:{x:16,y:64},pivot:{x:16,y:32},localOffset:{x:2,y:-3}};
const a=R.createVisualAnchor2D(raw);
const o=R.createVisualOrientation2D({axes:space.axes,zeroAxis:'positive-x',positiveRotation:'toward-positive-y',angleRadians:Math.PI/2});
const before=JSON.stringify(scene);
console.log(E.describeSceneObjectAlignment(scene,'visual',space,a,o));
console.log(E.describeSceneObjectAlignment(scene,'visual',space,{...a,anchor:{x:16,y:32}},o));
console.log(E.describeSceneObjectAlignment(scene,'visual',space,a,{...o,angleRadians:Math.PI}));
console.log(E.describeSceneObjectAlignment(scene,'text',space,a,o));
raw.anchor.y=999;
console.log(a.anchor.y,before===JSON.stringify(scene),Object.isFrozen(a.anchor),Object.isFrozen(o.axes));
try { R.createVisualOrientation2D({...o,zeroAxis:'north'}); } catch(e) { console.log(e.name,e.message); }
```

| Explicit observation (including substitutions in the above flow) | Expected | Observed |
| --- | --- | --- |
| Ground anchor (16,64), pivot (16,32), offset (2,-3), position (100,200) | origin (86,133), pivot (102,165) | exact |
| Change only anchor to (16,32) | origin (86,165), pivot (102,197) | exact; authored placement still (100,200) |
| Change facing PI/2 to PI | same origin/pivot, new angle only | exact, no animation fields |
| Mutate raw anchor.y to 999 | captured y64, original Scene unchanged | 64/true; nested freeze flags true |
| Text object with no placement | null, no graphics needed | null; document/WebGLRenderingContext undefined |
| zeroAxis north or positiveRotation clockwise | TypeError unknown convention | Unsupported visual orientation convention |
| angle -0.1 or 2*PI | TypeError, no normalization | [0,2*PI) rejection |
| angle 2*PI-1e-12 | accepted below endpoint | 6.283185307178586 |
| pivot.x NaN | TypeError finite validation | Visual point components must be finite numbers |
| Render placement unit device-pixel vs anchor local-unit | TypeError | Visual anchor and placement unit mismatch |
| Editor space ID other or facing y up | TypeError | Scene placement and visual coordinate space/axes mismatch |
| position.x MAX_VALUE and offset.x MAX_VALUE | RangeError, no Infinity result | Planar point arithmetic produced a non-finite result |

Separate observed Asset flow: createAssetCatalog for sample/image, kind image,
metadata {width:32,height:64,directions:8}, image source assets/visual.png; call
describeSceneObjectVisual(scene,'visual',catalog,'image/png') then Render
prepareVisualResource(description.descriptor). Observed metadata-prepared /
resourceLoading NOT_PERFORMED with resourceId image. Metadata does not supply
anchor, pivot or facing; both flows retain existing Scene/Asset identities.

## Verification and limits

| Command/evidence | Result |
| --- | --- |
| node harness/cli.mjs check | ARCH_CHECK_PASS, 53 JS/TS source files (static scan only) |
| node harness/cli.mjs scope --projects editor,runtime-render --allow-infra | SCOPE_PASS; eleven scoped paths |
| node harness/cli.mjs verify --projects editor,runtime-render --with-consumers | BUILD_PASS Render, Editor, game-client |
| npm run build -- --force | BUILD_PASS all five projects |
| Root source/emitted declarations inventory | Editor 85/85, Render 39/39, all prior exports retained |
| In-memory strict public-root declaration consumer | zero diagnostics, NodeNext/ES2022/no DOM, skipLibCheck:false; all seven additions consumed |
| git diff --check | PASS |

No unconfigured/failed builds. Existing Windows Harness DEP0190 warning remains.
Exact checkpoint SHA, final-head verification and push/PR CI results are recorded
outside this commit in PR/handoff to avoid self-reference. No automated tests added
or executed. Text content remains coordinate-free; 2D/2.5D alignment is opt-in;
Engine retains gameplay range/movement/collision ownership. No Client/Server code
or headless-server graphics requirement. Image loading, visuals/GPU, rotation about
pivot, discrete animation selection and general numerical behavior not verified.
No blocking architecture decision; future normalized anchors need explicit metrics
and a separately scoped conversion. No projection or v0.4.7 implementation.
