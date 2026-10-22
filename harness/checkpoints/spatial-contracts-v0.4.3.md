# v0.4.3 — Transform Composition & Inverse (SP06/SP07)

READY_FOR_DEVELOPER_REVIEW. Finite numerical observations: MANUALLY_OBSERVED.
Visuals, broader functional/gameplay correctness: FEATURE_NOT_VERIFIED.
STOP before v0.4.4. No merge, release, tag, publication or package version bump.

## Baseline, ownership and scope

Source HEAD / previous checkpoint: c42a26b5487e6173bb8c80a3e1ea8465c812bcd0.
Developer supplied this next task under the earlier instruction to implement and
verify, with review at the final step; authorization is not inferred from CI.
Phase 1–3 accepted evidence remains in SP01, ending at
5ce0feb4c1967c0dee14919b9c11d56991a46bd0. Clean initial worktree on
feat/editor-render-spatial-contracts-v0.4; same open Draft
[PR #4](https://github.com/TjnhPro/rpg-platform/pull/4), base main.
Final checkpoint SHA and exact-head push/PR CI links are recorded in that PR/handoff
outside this commit to avoid self-reference.

Read root/project agent guidance, architecture, Foundation/README, Harness
ownership/contracts/workflow/verification and actual source/index/manifests/emitted
declarations. Audited approved T*R*S descriptor, SC08 placement and SC09 attachment:
attachment is a nonhierarchical local reference, not a transform traversal contract.
Render has 19 root symbols, Editor 81 at baseline.

Canonical owner: Runtime Render pure presentation math. Editor retains authored
Scene/placement/relationships; guidance only, no Editor source change. Existing
Editor and game-client public-root consumers rebuild without consumer code edits.
No L1/L2 API is needed. Pins, manifests, dependencies, Engine/Client/Server sources,
workflows and exactly-five-project structure stay unchanged.

Ten scoped paths: runtime-render/src/{index.ts,planar-transform.ts,planar-affine.ts},
runtime-render/AGENTS.md, editor/AGENTS.md, ARCHITECTURE.md, README.md,
harness/OWNERSHIP.md, harness/CONTRACTS.md and this checkpoint. The old TRS file
only receives a descriptive comment update; approved shape/factory remain unchanged.

## Public contract and numerical policy

Seven additive Render root symbols (19 -> 26): PlanarPoint2D, AffineTransform2D,
PlanarInverseResult, toAffineTransform2D, applyPlanarPoint2D,
composePlanarTransforms2D, invertPlanarTransform2D. Editor remains 81; all baseline
exports retained. Affine representation was reported to Developer during work;
actual composition needs it to preserve shear instead of forcing TRS decomposition.

Affine coefficients mean x'=a*x+c*y+tx, y'=b*x+d*y+ty (column-point matrix).
TRS conversion preserves approved component scale -> radians rotation -> translation
about numeric zero. Positive rotation maps +x toward +y. [A,B] applies A then B,
returning B*A; [] returns affine identity. A local/parent example is an explicit
caller sequence only. No SceneTree, parent graph, implicit unit/axis conversion,
camera, global state or GPU acquisition is consulted. apply accepts a POINT and
includes translation; no direction/facing operation is introduced.

All inputs require exact own-key finite plain/null-prototype records; outputs are
detached/frozen. Invalid data throws TypeError; host accessor/proxy exceptions
propagate. Nonfinite arithmetic throws RangeError without a partial returned
result. JS binary64 rounding and underflow remain possible, no angle snapping.
Inverse sets s=max(abs(a),abs(b),abs(c),abs(d)); s=0 or normalized determinant
magnitude <=1e-12 returns {status:'non-invertible',reason:'SINGULAR_OR_ILL_CONDITIONED'}.
Otherwise returns {status:'inverted',transform}. Normalization avoids raw determinant
overflow/underflow for uniformly extreme scales. It deliberately rejects some
mathematically invertible ill-conditioned inputs. Inverse overflow still throws
RangeError; success is not a universal roundtrip accuracy guarantee. No NaN,
identity fallback or silent TRS approximation is returned.

Official research (2026-10-22): [Godot Transform2D](https://docs.godotengine.org/en/stable/classes/class_transform2d.html)
describes affine skew/scale; [Three Matrix4](https://threejs.org/docs/pages/Matrix4.html)
warns some nonuniform parent transforms cannot decompose into TRS (also confirmed
via Context7 r186). Platform choice: immutable affine output, explicit ordered
inputs and typed numerical rejection; no copied native engine matrix/hierarchy API.

## Finite manual observations, not an automatic test suite

Executed one-off Node stdin through built package roots; no test/script file,
assertion suite, random matrix, runner or CI step created. Comparison rule for these
moderate examples only: max component absolute error <=1e-12. Not an API accuracy bound.

| Input/action | Expected | Observed |
| --- | --- | --- |
| Identity at p=(1,2) | (1,2) | (1,2) |
| Translation (10,-4) | (11,-2) | (11,-2) |
| Rotation pi/2 | (-2,1) | (-2,1.0000000000000002) |
| Scale (2,3) | (2,6) | (2,6) |
| [translation,rotation] | (2,11) | (2.000000000000001,11) |
| [rotation,translation] | (8,-3) | (8,-3) |
| Local TRS t=(10,-4),r=pi/2,s=(2,3), then parent translation (100,50) | (104,48) | (104,48) |
| Inverse of that composition at (104,48) | Original (1,2) within comparison rule | (1,2), max error 0 |
| [rotation pi/4,scale(2,1)] | Shear retained; columns dot -1.5; mapped (-sqrt(2),3/sqrt(2)) | dot -1.5; (-1.4142135623730947,2.121320343559643) |
| Empty composition | affine identity | a=d=1; b=c=tx=ty=0 |
| Inverse scale(0,1) | explicit singular rejection | non-invertible/SINGULAR_OR_ILL_CONDITIONED |
| Inverse affine diag(1,1e-13) | policy rejection | same tagged result |
| Inverse affine diag(1e-200,1e-200) | finite inverse | inverted, diag(1e200,1e200) |
| NaN angle | TypeError | rotationRadians must be a finite number |
| Apply scale(MAX_VALUE,1) to (2,1) | RangeError | Planar point arithmetic produced a non-finite result |
| Compose scales MAX_VALUE then 2 | RangeError | Planar affine arithmetic produced a non-finite result |
| Inverse diag(MIN_VALUE,MIN_VALUE) | RangeError | Planar affine arithmetic produced a non-finite result |
| Two independent compose/apply/inverse calls with caller Scene/point/transform | Caller data unchanged; independent frozen results | JSON before/after equal; result references distinct; affine/point/inverse wrapper+transform freeze flags true |
| Mutate raw.translation.x after toAffine capture | captured tx stays 10 | 10 |
| Headless imports/operations | no graphics globals required | document and WebGLRenderingContext both undefined |

Reproduce the central public-API flow with `node --input-type=module` after build:

```js
import {
  createPlanarTransform2D as trs, toAffineTransform2D as affine,
  applyPlanarPoint2D as apply, composePlanarTransforms2D as compose,
  invertPlanarTransform2D as inverse,
} from '@rpg-platform/runtime-render';
import { createSceneMembership } from '@rpg-platform/editor';
const t=(x=0,y=0,r=0,sx=1,sy=1)=>trs({translation:{x,y},rotationRadians:r,scale:{x:sx,y:sy}});
const p={x:1,y:2}, translation=t(10,-4), rotation=t(0,0,Math.PI/2);
for(const m of [t(),translation,rotation,t(0,0,0,2,3),compose([translation,rotation]),compose([rotation,translation])]) console.log(apply(m,p));
const local={translation:{x:10,y:-4},rotationRadians:Math.PI/2,scale:{x:2,y:3}};
const scene=createSceneMembership({scene:{identity:{projectId:'sample',sceneId:'zone'}},objects:[{definition:{objectId:'visual'},placement:{coordinateSpaceId:'scene-local',point:p}}]});
const before=JSON.stringify({local,scene,p});
const m1=compose([local,t(100,50)]), m2=compose([local,t(100,50)]);
const mapped=apply(m1,p), inv=inverse(m1);
console.log(mapped,inv,inv.status==='inverted'?apply(inv.transform,mapped):null);
console.log(before===JSON.stringify({local,scene,p}),m1!==m2,Object.isFrozen(m1),Object.isFrozen(mapped),Object.isFrozen(inv),inv.status==='inverted'&&Object.isFrozen(inv.transform));
const captured=affine(local); local.translation.x=999; console.log(captured.tx);
console.log(compose([]),inverse(t(0,0,0,0,1)),inverse({a:1,b:0,c:0,d:1e-13,tx:0,ty:0}));
console.log(compose([t(0,0,Math.PI/4),t(0,0,0,2,1)]));
```

## Verification and limits

| Command/evidence | Observed result |
| --- | --- |
| node harness/cli.mjs check | ARCH_CHECK_PASS, 48 JS/TS files; static imports only |
| node harness/cli.mjs scope --projects editor,runtime-render --allow-infra | SCOPE_PASS, ten declared paths; committed scope inspected separately |
| node harness/cli.mjs verify --projects editor,runtime-render --with-consumers | BUILD_PASS runtime-render, editor, game-client |
| npm run build -- --force | BUILD_PASS all five projects |
| Source/emitted compiler-symbol inventory | Render 26/26, Editor 81/81, all old symbols retained |
| In-memory public-root declaration consumer | strict/noEmit/skipLibCheck:false, NodeNext ES2022 without DOM, zero diagnostics; imports all seven additions and narrows both inverse variants |
| git diff --check | PASS |

Gates repeated at final checkpoint HEAD; exact-head CI recorded in PR/handoff.
Existing Windows Harness DEP0190 warning is nonblocking. No unresolved blocker
within SP06/SP07. Finite manual examples are not general numerical certification.
No UI/visual/GPU, Scene rendering, resource loading, gameplay or broad behavioral
verification; manual product review and acceptance remain Developer-owned.
Grid, projection, Scene adapter, hierarchy and direction APIs remain deferred.
STOP before v0.4.4.
