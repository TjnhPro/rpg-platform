# v0.4.2 — Spatial Transform Foundation (SP05)

READY_FOR_DEVELOPER_REVIEW. Capture observations below are MANUALLY_OBSERVED;
numerical point mapping/rendering/gameplay remain FEATURE_NOT_VERIFIED.
STOP before v0.4.3 — Transform Composition & Inverse.

## Preflight / actual baseline

Source HEAD / accepted v0.4.1 checkpoint: c131d15c7c3ebe5ff6208cc55138ec32cc34c28a.
Developer supplied this next task following the completed checkpoint under the
earlier instruction to perform work/verification and review at the final step;
authorization is not inferred from CI success. Phase 1–3 accepted baselines remain
those in SP01, ending at 5ce0feb4c1967c0dee14919b9c11d56991a46bd0. Clean worktree,
feat/editor-render-spatial-contracts-v0.4, same open Draft [PR #4](https://github.com/TjnhPro/rpg-platform/pull/4)
against main. Final checkpoint SHA/CI links are recorded outside this commit in
that PR/handoff. No new PR, merge, version bump, tag, release or publication.

Read root/project AGENTS, architecture, Foundation/README, Harness ownership,
contracts/workflow/verification and v0.4.1. Inspected source roots/manifests/emitted
declarations, private three-frame.ts and lazy frame acquisition, SC08 placement and
coordinate-space.ts. Editor owns 81 root symbols; Render 17 before this addition.
SC08 finite pair and v0.4.1 point have no transform. Render has session/frame and
metadata APIs; private Three Scene/base Camera do not define a public transform.

Canonical owner: Runtime Render for the presentation descriptor/semantics. Editor
is a future authored caller, receives guidance only; no authored schema or source
change. No L1/L2 APIs required, frozen pins untouched. Nine scoped paths:
runtime-render/src/planar-transform.ts, runtime-render/src/index.ts,
runtime-render/AGENTS.md, editor/AGENTS.md, ARCHITECTURE.md, README.md,
harness/OWNERSHIP.md, harness/CONTRACTS.md and this checkpoint. No Engine/Client/
Server source, dependency, manifest, lockfile, workflow or sixth package changes.

API delta: PlanarTransform2D and createPlanarTransform2D at Render root, 17 -> 19.
Editor stays 81. Existing exports retained. Editor and game-client consume Render's
root and rebuild without source changes; no mandatory Server/GPU dependency.

## Contract and explicit numeric semantics

One readonly type is both factory input and output: translation {x,y},
rotationRadians, scale {x,y}. All fields required, all numbers finite; no defaults.
Plain/null-prototype records require exactly their declared own keys, rejecting
arrays, extra string/symbol keys/dimensions, missing fields and class instances.
Invalid authored data throws TypeError; unknown host accessor/proxy exceptions
propagate. Capture copies/freezes both pairs and outer record, not caller input.
Radians, negative values and signed zero are preserved without normalization.

Fixed intended order: component scale, rotate, translate (column point T*R*S*p).
Pivot is numeric (0,0), never automatically the v0.4.1 authored origin marker.

```text
x' = cos(r) * sx * x - sin(r) * sy * y + tx
y' = sin(r) * sx * x + cos(r) * sy * y + ty
```

Positive r maps +x toward +y; in right/up axes this is counterclockwise, right/down
clockwise. Other authored axis conventions require explicit interpretation by the
future caller, not an inferred axis conversion. Translation uses the selected
point unit; scale is dimensionless. Caller selects one coherent numeric plane/unit
before any future application. Descriptor does not carry a second coordinate-space
identity, resolve units, or automatically convert scene-local into editor-grid.

Identity: translation (0,0), r=0, scale (1,1). Zero scale collapses a component and
is representable, not invertible. Negative scale reflects the corresponding numeric
component before rotation (x negative reflects across the numeric y-axis).
No inverse API exists here. Finite parameters alone do not guarantee future
arithmetic is finite or numerically invertible. Composition may require an affine
representation to preserve shear; do not assume every composition fits this TRS.
That decision and tolerance/overflow handling belong to the later scoped task.

Semantic illustration ONLY: Scene point (1,2), coherent right/up plane/unit,
scale (2,3), r=pi/2, translation (10,-4) means scaled (2,6), rotated (-6,2),
translated (4,-2). Reordering would differ. This is design arithmetic, not an
observed operation: no apply-point, matrix/trig computation, composition or inverse
is implemented. SC08 placement/coordinate definitions remain unchanged. Neither
world-to-screen nor gameplay distance/height is implied. 2.5D supports describing
its ground plane only; anchor/height/depth/quaternion remain deferred. Text Scenes
need none of this data. No graphics resources, registry, hierarchy or physics world.

## Research evidence (official docs, accessed 2026-10-22)

[Godot matrices/transforms](https://docs.godotengine.org/en/stable/tutorials/math/matrices_and_transforms.html)
documents radians and positive rotation from x toward y, appearing clockwise in
its y-down system. [Three Matrix4](https://threejs.org/docs/pages/Matrix4.html)
documents mutable position/rotation/scale composition and cautions that some
nonuniform-parent transforms cannot decompose as TRS. r186 docs were also queried
through Context7. Platform inference: state axes/angle/order explicitly and keep
native matrix/scene graph private. S->R->T and numeric zero pivot are explicit
Platform choices, not a port of either engine's object hierarchy/API.

## Finite manual capture and declaration evidence

One-off Node stdin consumer of built @rpg-platform/runtime-render; no script/test
file, assertions, runner or new automatic runtime gate committed. Reproduce with
node --input-type=module from workspace root:

```js
import { createPlanarTransform2D } from '@rpg-platform/runtime-render';
const identity = createPlanarTransform2D({translation:{x:0,y:0},rotationRadians:0,scale:{x:1,y:1}});
const input = {translation:{x:10,y:-4},rotationRadians:Math.PI/2,scale:{x:2,y:-3}};
const snapshot = createPlanarTransform2D(input);
input.translation.x=99; input.rotationRadians=0; input.scale.y=99;
console.log(identity, snapshot);
console.log(Object.isFrozen(snapshot),Object.isFrozen(snapshot.translation),Object.isFrozen(snapshot.scale));
console.log(createPlanarTransform2D({translation:{x:0,y:0},rotationRadians:0,scale:{x:0,y:-1}}));
```

| Input/action | Expected | Observed |
| --- | --- | --- |
| Identity | Exact explicit identity data | (0,0), 0, (1,1) retained |
| Nonzero input then mutations above | Original detached frozen snapshot | translation (10,-4), angle 1.5707963267948966, scale (2,-3); three freeze flags true |
| Zero/negative scale | Accepted finite descriptor | scale (0,-1) retained |
| createPlanarTransform2D({...identity,rotationRadians:NaN}) | TypeError | rotationRadians must be a finite number |
| Same call, translation {x:Infinity,y:0} | TypeError | translation.x must be a finite number |
| Same call, scale {x:1,y:1,z:1} | TypeError | scale must be a plain record with exactly x, y |
| Same call, extra rotationDegrees:90 | TypeError | Planar transform must be a plain record with exactly translation, rotationRadians, scale |
| Import/capture in Node without graphics globals | Works without graphics acquisition | typeof document / WebGLRenderingContext both undefined |

Declaration consumer: TypeScript program created in memory, no file emitted or
written, strict/noEmit/skipLibCheck:false, NodeNext, ES2022 lib without DOM. Source:

```ts
import {createPlanarTransform2D, type PlanarTransform2D} from '@rpg-platform/runtime-render';
const input: PlanarTransform2D = {translation:{x:10,y:-4},rotationRadians:Math.PI/2,scale:{x:2,y:-3}};
const snapshot: PlanarTransform2D = createPlanarTransform2D(input);
const angle: number = snapshot.rotationRadians;
```

Observed PUBLIC_DECLARATION_CONSUMER_COMPILE_PASS, zero diagnostics. Initial virtual
file path matching failed on Windows slash spelling (TS6053); normalizing the
compiler-host path fixed the temporary observation harness, with no product edit.
No build failure or unconfigured project remains.

## Verification and stop

Final-source gates, repeated at checkpoint HEAD:

| Command/evidence | Result |
| --- | --- |
| node harness/cli.mjs check | ARCH_CHECK_PASS, 47 JS/TS source files; static scan only |
| node harness/cli.mjs scope --projects editor,runtime-render --allow-infra | SCOPE_PASS, nine paths before commit; clean after commit and committed scope separately inspected |
| node harness/cli.mjs verify --projects editor,runtime-render --with-consumers | BUILD_PASS runtime-render, editor, game-client |
| npm run build -- --force | BUILD_PASS all five projects |
| Source/emitted compiler-symbol inventories / root resolution | Editor 81 / Render 19 match; old exports retained, new root declaration consumer compiles |
| git diff --check | PASS; only declared files |

Existing Windows Harness DEP0190 warning remains nonblocking. Push/PR CI on exact
checkpoint SHA recorded in PR #4/handoff after push. No tests, runners, random
matrices or CI steps introduced. No numerical point mapping, visual/GPU/UI,
resource loading or gameplay verification. No completion/phase acceptance inferred
from compilation. No blocker for SP05 capture scope. STOP before v0.4.3.
