# v0.4.1 — Coordinate Space Identity & Units (SP02, SP03, SP04)

READY_FOR_DEVELOPER_REVIEW / FEATURE_NOT_VERIFIED beyond finite manual capture
observations below. Stop before v0.4.2; no phase acceptance, merge or publication.

## Preflight and scope

Source HEAD / accepted previous checkpoint: 6fa55ebb3606a135ead25f9f23a583fd4feebc0d
(v0.4.0). Developer supplied this next task after the completed checkpoint; the
earlier instruction defers review to the final step. This is the acceptance/work
authorization evidence, not CI success. Phase 1–3 accepted baselines remain those
recorded in SP01, ending at 5ce0feb4c1967c0dee14919b9c11d56991a46bd0.
Continue feat/editor-render-spatial-contracts-v0.4 and Draft [PR #4](https://github.com/TjnhPro/rpg-platform/pull/4),
base main. Checkpoint SHA and exact-head push/PR CI links are recorded in that PR
and handoff after commit to avoid a self-reference.

Read root/project guidance, architecture, Foundation, README, Harness contracts,
ownership/workflow/verification, SP01 and current source/manifests/declarations.
Compiler-symbol baseline: Editor 74 / Render 17 source and emitted exports match.
SC08 already stores coordinateSpaceId + finite x/y without definition lookup;
Scene identity is projectId + sceneId, Assets projectId + assetId. Therefore use
projectId + coordinateSpaceId, retaining the exact existing space key; no extra
Scene ID, globally unique key, identity service or automatic ID generation.

Canonical owner: Editor authored definitions, references and portable authored
values. Render reviewed as future presentation consumer, no source/API change.
The explicit v0.4.1 task supersedes SP01's proposed SP04 Render allocation, which
was a provisional index, not an approved public contract. No ownership of Render
math moves. External L1/L2 APIs: none needed; frozen pins and graph unchanged.

Expected/actual API delta: three factories + four readonly types at Editor root
(74 -> 81); Render stays 17. No existing export removed or changed. Existing
Client root import is the discovered downstream consumer; it requires no source
edit and is rebuilt. Engine/Client/Server source stays untouched.

Nine paths: editor/src/coordinate-space.ts, editor/src/index.ts, editor/AGENTS.md,
runtime-render/AGENTS.md, ARCHITECTURE.md, README.md, harness/OWNERSHIP.md,
harness/CONTRACTS.md and this checkpoint. No package/lockfile/workflow/version,
Scene/Asset schema or dependency changes. Exactly five projects remain.

## Public contract and semantics

| Export | Behavior / boundary |
| --- | --- |
| CoordinateSpaceReference / createCoordinateSpaceReference | Exact case-sensitive projectId + coordinateSpaceId; both nonempty whitespace-free strings. Detached frozen record; no existence/uniqueness enforcement |
| CoordinatePair2D | Exactly x/y finite numeric components; no implicit unit, z, gameplay or pixel meaning |
| CoordinateSpaceDefinition / createCoordinateSpaceDefinition | Explicit reference, componentCount 2, axes x right/left and y up/down, finite origin pair and nonblank verbatim unit label |
| SpatialPoint2D / createSpatialPoint2D | Scoped space reference + finite point pair, detached/frozen; no definition lookup, arithmetic or conversion |

The same readonly types describe factory inputs and snapshots. Nested records
are copied/frozen; caller inputs are not frozen. All fields are required; there
are no axes/unit/origin defaults. Origin is the coordinate pair assigned to the
caller's authored reference location, expressed in this space's unit. It does not
locate that space inside a parent or supply a transform. Units are opaque labels:
cell, scene-unit, CSS px, etc. do not cause scale/conversion or screen semantics.
Increasing axis conventions describe the authored plane, not a camera.

All new records require exactly the listed own keys, with Object.prototype or
null prototype; unknown string/symbol keys, arrays, missing components, class
instances, unsupported dimensions and nonfinite/nonnumeric components reject
with TypeError. Zero, negative and signed zero are retained. Host accessor/proxy
exceptions propagate. These are minimal construction records, not a versioned
document reader or migration/preservation API; they do not alter SC08's existing
known-field capture behavior. Definition existence and caller consistency remain
explicit responsibilities, not an implicit resolver or cross-space comparison.

SC08 compatibility: caller checks that its selected reference project equals the
Scene's project, then explicitly passes its existing coordinateSpaceId and pair
to the unchanged placement shape. No adapter API is needed merely to copy these
fields. Old unknown space keys remain legal, and Scene/Object need not opt in.
Do not infer a space from Scene ID, Asset ID, Render session or a filename.

Text stress: no placement/space definition required. Orthogonal 2D: explicit
right/up or right/down and unit labels are captured, no grid operations. 2.5D:
ground-plane x/y can retain Scene/Object/Asset identities; height, anchor, direction
and depth remain deferred, never add ambiguous z to this pair. Gameplay position,
range/collision/spawn stay Engine-owned. Future Render descriptors/math are separate
Render contracts, supplied through a later Editor adapter; no Editor import into
Render, Three/DOM DTO, global store, GPU requirement or Server change.

## Finite manual public-root observation

MANUALLY_OBSERVED using built @rpg-platform/editor, in a one-off Node stdin
consumer after build. No script/test file, runner or CI runtime gate was added.
Reproduce the positive capture from workspace root with node --input-type=module:

```js
import { createCoordinateSpaceDefinition, createSpatialPoint2D }
  from '@rpg-platform/editor';
const input = { reference: { projectId: 'sample', coordinateSpaceId: 'scene-local' },
  componentCount: 2, axes: { x: 'right', y: 'up' }, origin: { x: 0, y: 0 }, unit: 'scene-unit' };
const scene = createCoordinateSpaceDefinition(input);
const grid = createCoordinateSpaceDefinition({ ...input,
  reference: { projectId: 'sample', coordinateSpaceId: 'editor-grid' },
  axes: { x: 'right', y: 'down' }, unit: 'cell' });
const raw = { space: input.reference, point: { x: 0, y: -3 } };
const a = createSpatialPoint2D(raw);
const b = createSpatialPoint2D({ space: grid.reference, point: raw.point });
input.reference.coordinateSpaceId = 'changed'; input.axes.y = 'down';
input.origin.x = 20; raw.point.y = 99;
console.log(scene, grid, a, b);
console.log(Object.isFrozen(scene), Object.isFrozen(scene.reference),
  Object.isFrozen(scene.axes), Object.isFrozen(scene.origin),
  Object.isFrozen(a), Object.isFrozen(a.space), Object.isFrozen(a.point));
```

| Explicit input/action | Expected | Observed |
| --- | --- | --- |
| scene-local/scene-unit/right-up and editor-grid/cell/right-down, each point (0,-3) | Different scoped references/conventions; no implicit combining/conversion | Both captured as declared, pair remains (0,-3) |
| Mutate input reference/axes/origin/point after capture | Snapshots unchanged and deeply frozen | scene-local, up, origin (0,0), points (0,-3); seven freeze observations true |
| createSpatialPoint2D with scene reference and point {x:NaN,y:0} or {x:0,y:Infinity} | TypeError | Spatial point components x/y must be finite numbers |
| Same point call with {x:0,y:0,z:0}, [0,0] or {x:0} | TypeError | Spatial point components must be a plain record with exactly x, y |
| createCoordinateSpaceDefinition({...scene,componentCount:3}) | TypeError | Only componentCount 2 is supported |
| createCoordinateSpaceReference({projectId:'',coordinateSpaceId:'scene-local'}) | TypeError | projectId must be a non-empty string without whitespace |
| Existing createSceneMembership of sample/text with one paragraph object and no placement | No placement injected | Object.hasOwn(entry,'placement') false |
| Existing membership factory given placement {coordinateSpaceId:a.space.coordinateSpaceId,point:a.point}, Scene project sample | Old SC08 shape retained | sample / {coordinateSpaceId:'scene-local',point:{x:0,y:-3}} |

These observations cover capture/rejection only, not numerical transforms,
projection, grid mapping, rendering, resource loading, gameplay or product UI.

## Verification and stop

Commands run on final source and repeated at checkpoint HEAD:

| Gate | Result |
| --- | --- |
| node harness/cli.mjs check | ARCH_CHECK_PASS; 46 JS/TS files, static import scan only |
| node harness/cli.mjs scope --projects editor,runtime-render --allow-infra | SCOPE_PASS; nine scoped paths before commit; clean worktree after commit, committed diff inspected independently |
| node harness/cli.mjs verify --projects editor,runtime-render --with-consumers | BUILD_PASS runtime-render, editor, game-client |
| npm run build -- --force | BUILD_PASS all five workspace projects |
| Compiler-symbol source/emitted inventory and root resolution | Editor 81 / Render 17 match, existing exports retained, package roots resolve to built artifacts |
| git diff --check / committed scope | PASS; only declared paths |

No failed/unconfigured build. Existing Windows Harness DEP0190 warning is
nonblocking. Exact-head push/PR CI results go in PR #4/handoff, outside this commit.
No tests, test frameworks or CI steps created. Finite manual capture evidence is
separate from build evidence and does not establish full functional correctness.

Open/deferred: transform/inverse/error math, grid conversion/snap, projection,
viewport/DPR, Render descriptor/consumer, height/anchor/direction, document format
and definition resolution. No blocker for this scoped additive capture API.
READY_FOR_DEVELOPER_REVIEW; STOP before v0.4.2.
