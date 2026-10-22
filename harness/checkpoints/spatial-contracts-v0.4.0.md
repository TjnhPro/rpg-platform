# v0.4.0 — Spatial Architecture & Contract Foundation (SP01)

API_DESIGN_ONLY / FEATURE_NOT_VERIFIED / READY_FOR_DEVELOPER_REVIEW.
No numerical operation or public symbol is implemented. Stop before v0.4.1.

## Preflight and accepted baseline

Source HEAD / exact accepted Phase 3 baseline: 5ce0feb4c1967c0dee14919b9c11d56991a46bd0.
Previous checkpoint v0.3.11: 08ba8acf784384fd8b54dc00bc17e4dab57fe500.
Developer explicitly requested merging PR #3 into main, then supplied this task;
acceptance evidence comes from that instruction, not inferred from a green build.
Live GitHub audit confirmed all prerequisite PRs MERGED:

| Phase | PR | Exact merge baseline |
| --- | --- | --- |
| 1 / v0.1.8 | [#1](https://github.com/TjnhPro/rpg-platform/pull/1) | 4cec85b5a00e2477f00eee29e2da6025a532e973 |
| 2 / v0.2.10 | [#2](https://github.com/TjnhPro/rpg-platform/pull/2) | fea9b734b849fa1c6bc953530e1fa425d43cfca8 |
| 3 / v0.3.11 | [#3](https://github.com/TjnhPro/rpg-platform/pull/3) | 5ce0feb4c1967c0dee14919b9c11d56991a46bd0 |

Started with clean main equal to origin/main. New Phase 4 branch:
feat/editor-render-spatial-contracts-v0.4, from that exact baseline. No existing
Phase 4 branch/PR found. Create one Draft PR for v0.4.0–v0.4.12; subsequent tasks
must reuse it. Final checkpoint SHA, PR URL and exact-head CI links are recorded
in the PR/handoff after push, outside the self-referencing checkpoint commit.

Read root/project guidance, architecture/foundation/README, Harness ownership,
contracts/workflow/verification and relevant Phase 1/2/3 reports; inspected actual
roots/manifests, emitted declarations, SC08 capture, SC15 projection, Asset seams,
Render session/frame/private backend and Engine/Client/Server bootstrap imports.
Old reports describe their own revision, not today's acceptance or implementation.

Canonical primary owner of presentation spatial behavior: Runtime Render. Editor
collaborates as owner of authored coordinate/grid declarations and placement; Harness
records the boundary. No behavior changes here. Six documentation paths only:
ARCHITECTURE.md, editor/AGENTS.md, runtime-render/AGENTS.md, harness/OWNERSHIP.md,
harness/CONTRACTS.md and this report. No affected consumer source requires changes;
Render, Editor and discovered Client still build per the task's required command.
Public API delta: zero. No L1/L2 capability needed; Core 2.0.0 / Gameplay 0.15.2,
pins, manifests, graph, package versions, production source and CI remain unchanged.

## Actual source audit

| Baseline public contract / source | Present behavior | What it does not provide |
| --- | --- | --- |
| Editor SceneIdentity/SceneDefinition and Object APIs, src/scene-definition.ts, scene-object-definition.ts, scene-membership.ts | Explicit scoped IDs, optional detached/frozen placement, immutable operations | No coordinate definition lookup, grid, units, axes, conversion or gameplay state |
| SC08 SceneObjectPlacement, scene-membership.ts | Exact nonempty coordinateSpaceId; finite point x/y; omission stays absent, explicit null retained | x/y have no default world/screen/unit/parent meaning; unknown space key remains legal |
| SC15 describeSceneObjectVisual, scene-visual.ts | Retains caller correlation and placement, absent placement projects to null | Does not send placement/Scene IDs/layers/attachment to Render or instantiate anything |
| Phase 2 Asset roots, asset-reference.ts, asset-catalog.ts, asset-visual.ts | Existing canonical reference resolution and resource descriptor projection | No second spatial/Asset resolver, resource loading or anchor inferred from filename/metadata |
| Render VisualResourceDescriptor/prepareVisualResource, visual-resource.ts | Detached identity/mediaType/sources metadata; loading NOT_PERFORMED | No placement field, viewport transform or spatial request API |
| Render session/lifecycle root and frame-session.ts | Borrowed opaque host; binding-only lifecycle; separate explicit graphics acquisition/frame receipt | Bound/submitted does not define spatial semantics or confirm display |
| Private three-frame.ts | Private empty Three Scene + base Camera and one clear frame | No public orthographic camera, Scene objects, transform/projection API or viewport measurement contract |
| Engine / Client / Server roots | Engine imports calculateStats and createGameplayRuntime without invoking them; Client consumes Engine/Render; Server only Engine | No current gameplay position, movement, range, collision or spawn implementation |

Actual compiler-symbol inventories: Editor 74 exports (8 Phase 1, 35 Phase 2,
31 Phase 3); Render 17 (14 Phase 1, 3 Phase 2). Source/emitted root names match.
Only package roots are exported, resolving to manifest ESM artifacts/declarations.
No SP API exists. Keep Scene/Object/Asset identity and all existing state shapes.
Scene factories capture known fields only; they are not lossless document readers.
Do not add units, transforms, height or grid fields to those shapes in this version.

## Owner and contract map

The task defines SP01, the next checkpoint title and a v0.4.10 integration seam,
but supplies no individual SP02–SP18 definitions. The following allocation is a
**proposed design index**, not approved future API names, fixed version assignments
or authorization to implement them. Later task definitions supersede this index.
Proposed locations name existing project boundaries, not files/modules to scaffold.

| ID / proposed concern | Canonical definition owner / intended location | Collaborator and disposition |
| --- | --- | --- |
| SP01 architecture | This checkpoint + architecture/ownership docs | DESIGN_ONLY completed; no new API |
| SP02 authored space identity | Editor public root, alongside authored Scene data | DESIGN_ONLY; explicit scope/key, no global identity service |
| SP03 units/axes/origin declarations | Editor public root for authored definitions | DESIGN_ONLY; Render consumes explicit supported semantics |
| SP04 portable presentation point/context | Render public root | DESIGN_ONLY; Editor adapts authored records; no shared package |
| SP05 presentation transform declaration | Render public root | DESIGN_ONLY; Editor may author parameters, never duplicate math |
| SP06 transform application/composition | Render public root | DEFERRED; explicit source/target spaces and order |
| SP07 inverse and failure semantics | Render public root | DEFERRED; supported invertibility, finite output and numerical policy |
| SP08 authored grid declaration | Editor public root | DESIGN_ONLY; optional layout data, no gameplay collision/navigation |
| SP09 grid-to-plane presentation mapping | Render public root | DEFERRED; explicit cell dimensions/origin/anchor from Editor |
| SP10 plane-to-grid / rounding | Render public root for presentation conversion | DEFERRED; Editor chooses explicit authoring snap policy; Engine owns game grid rules |
| SP11 viewport metrics | Render public root for neutral numeric context | DESIGN_ONLY; Editor host measures UI; no DOM in portable DTO |
| SP12 plane/world-to-viewport projection | Render public root | DEFERRED; explicit projection/view/viewport and units |
| SP13 viewport-to-plane inverse | Render public root | DEFERRED; no implicit depth/plane, picking or raycast engine |
| SP14 anchor/height separation | Editor authored intent; Render presentation interpretation | DESIGN_ONLY seam; two distinct concerns, no shared mutable state or 2.5D implementation |
| SP15 direction conventions | Editor authored visual convention; Render presentation mapping | DESIGN_ONLY seam; game movement/facing rules stay Engine-owned |
| SP16 Scene/Editor presentation adapter | Editor public root calling Render public root | DESIGN_ONLY; intended v0.4.10 seam; exact DTO/consumer not yet supplied |
| SP17 finite spatial MVP evidence | Render owns math; Editor owns concrete authored consumer | DEFERRED; not simulated by this architecture task |
| SP18 phase integration/closure | Harness checkpoint, with Editor/Render audit | DEFERRED to scoped closure task; no automatic phase acceptance |

L1 numerical kernel and L2 gameplay remain read-only external foundations; no new
spatial import/pin/edit/reimplementation. Engine L3 alone owns game-specific position,
movement/range/collision/spawn state and semantics. An authored map/grid may configure
that game's rules through a later approved contract; it is not authority by itself.

Four invariants: **world != grid != screen**; **authored placement != Render instance**;
**gameplay spatial state != projection**; **Editor never rewrites Render projection**.
Presentation use of the word world never creates a gameplay world or entity.

Forbidden bypasses: Render -> Editor/Engine for spatial data or rules; Editor ->
Three/private Render modules; Engine -> Render for authoritative screen coordinates;
Client -> Editor runtime to obtain content; Server -> browser metrics/GPU as a
correctness prerequisite. No sixth package, universal projection graph, second
space identity registry, vector library, physics world or singleton transform store.

## Proposed direction, numeric context and stress review

DESIGN_ONLY future v0.4.10 sequence: caller supplies authored Scene/placement and
explicit space definitions; Editor validates authored reference/structure, retains
correlation and selects supported parameters. It creates a separate neutral request
for a future Render root API, supplying source/target space semantics, units, view/
projection/viewport context and policy explicitly. Render validates operation inputs
and performs presentation math with detached immutable results. Editor inspects the
result and explicitly adopts an authored candidate only when requested. No conversion
is added to createSceneMembership, describeSceneObjectVisual or prepareVisualResource.
No second copy of the math lives in Editor. No GPU/DOM is required for future pure
math; graphics resources and camera controls remain separate Features 08/09.

No concrete request type/signature is frozen here. Future operations must specify
finite inputs/results, known source/target definitions, composition order, rounding,
out-of-view behavior and failures for unsupported/missing context, singular inverses
or overflow; no silent identity conversion, NaN success or guessed depth. Exception
versus diagnostic return channel, epsilon/tolerance and exact keys await the scoped
consumer task. Existing factory TypeErrors and diagnostic behavior remain unchanged.

| Stress scenario | Explicit design example / required context | Disposition |
| --- | --- | --- |
| Text RPG | Identity-only Scene or object with absent/null placement requires no grid, viewport, camera or GPU; no default origin injected | Existing data contract preserved; no new manual execution in this task |
| Orthogonal 2D | Hypothetical cell (2,3), 16x16 scene-units/cell, origin (0,0), axes right/down: corner (32,48), center (40,56). Cell vs point and anchor must be explicit; at negative -0.2 floor and truncation differ | Design arithmetic only, NOT_VERIFIED; grid mapping/snapping DEFERRED |
| 2.5D anchor/direction | Same Scene/Object/Asset IDs can retain ground position while a later explicit sprite anchor/height/direction convention determines visual offset. No implicit world-z, texture pixels or movement direction inferred | DEFERRED; no new placement fields, universal 3D state or asset schema |
| World/plane -> screen | Hypothetical plane point (2,3), top-left origin (100,50) CSS px, right/down axes and 10 CSS px/unit gives (120,80); changing origin to (0,0) and scale to 20 gives (40,60) | Design arithmetic only, NOT_VERIFIED; viewport origin/extent, zoom/view, pixel kind and any device-pixel conversion must be explicit |

These examples are authored design illustrations, not actual API calls or observed
numerical proof. No project-wide axes, metres, pixels-per-unit or grid anchor is
selected. Orthogonal plane is the intended minimal future consumer; isometric layout,
perspective/depth ambiguity and full 2.5D sprite anchoring stay DEFERRED. Screen x/y
alone cannot determine a unique 3D point: a supported plane/depth constraint is
needed. Inverse guarantees apply only to an explicitly supported invertible mapping,
not rounded grid indices or depth-discarding projection. Do not implement picking.
Future Client can use neutral Render contracts without Editor runtime; Server stays
headless. Neither project is changed; Engine never treats pixels as gameplay truth.

## Research evidence (official documentation, accessed 2026-10-22)

| Reference | Observed principle | Platform design inference |
| --- | --- | --- |
| [Unity transforms](https://docs.unity3d.com/Manual/class-Transform.html), [world-to-screen](https://docs.unity3d.com/ScriptReference/Camera.WorldToScreenPoint.html), [screen-to-world](https://docs.unity3d.com/ScriptReference/Camera.ScreenToWorldPoint.html) | Local coordinates are parent-relative; screen pixels and camera-relative depth have different meanings | Name source/target spaces, units and depth; do not import hierarchy or metre defaults |
| [Godot coordinate systems](https://docs.godotengine.org/en/4.6/engine_details/architecture/2d_coordinate_systems.html), [viewport/canvas transforms](https://docs.godotengine.org/en/stable/tutorials/2d/2d_transforms.html) | Item/canvas/viewport/window transforms form an ordered mapping; reverse direction uses affine inverse | Require explicit order/context and invertibility; no SceneTree or transform graph copied |
| [Three.js Vector3](https://threejs.org/docs/pages/Vector3.html), [OrthographicCamera](https://threejs.org/docs/pages/OrthographicCamera.html) | project/unproject use a camera and NDC, not screen pixels; orthographic image size is independent of distance | Separate projection from viewport pixel mapping; no THREE types in authored/portable spatial DTO |

Three r186 docs also checked through Context7 against the installed r186 line.
The supplied old Godot URL returned 404; the official 4.6 replacement above was
read. These are boundary references, not copied engine implementations or proof
of this workspace's math. No Unreal/Tiled implementation research needed here.

## Verification and stop

Required commands run on final source and repeated on the checkpoint commit:

| Gate | Result |
| --- | --- |
| node harness/cli.mjs check | ARCH_CHECK_PASS; 45 JS/TS files, static scan only |
| node harness/cli.mjs scope --projects editor,runtime-render --allow-infra | SCOPE_PASS; six documentation paths before commit; clean worktree after commit, committed scope separately inspected |
| node harness/cli.mjs verify --projects editor,runtime-render --with-consumers | BUILD_PASS runtime-render, editor, game-client |
| Source/emitted root declaration inventory + package resolution | Editor 74 / Render 17, matching names; no public delta |
| Baseline-to-final Git scope and whitespace | Only six declared docs; no source, manifest/export-map, lockfile, pin or workflow changes; git diff --check passed |

No failed/unconfigured build; Windows Harness DEP0190 warning remains nonblocking.
No forced local workspace rebuild required by public API delta (there is none);
CI independently runs genuine all-five-project builds and forced workspace build.
Exact-head push/PR CI status and URLs belong in the Phase 4 PR/handoff after push.
No numerical/manual runtime, GPU/UI/visual, resource loading or gameplay execution
performed. No test files, runners, automated runtime gate, random matrix or coverage.
API_DESIGN_ONLY / FEATURE_NOT_VERIFIED; no functional/visual/numerical PASS claimed.

Open: final SP02–SP18 allocation, identity scope/units/axes, supported transform and
inverse/error policy, grid anchor/rounding, CSS vs device pixels, future depth/height/
direction and actual v0.4.10 request/consumer. None requires changing the accepted
baseline in this architecture-only task. STOP for Developer review; do not implement
v0.4.1, merge, tag, release, publish or claim Phase 4 acceptance.
