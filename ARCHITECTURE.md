# Five-project architecture — ownership before layout

## Fixed at this stage

Exactly one workspace and five independently owned projects:

| Project | Canonical responsibility | Must not own |
| --- | --- | --- |
| Runtime Engine | Compose public L1/L2 capabilities to define and execute **this game's** rules, state and lifecycle | Editor UI, Three.js renderer, Client network UI, Server database and deployment |
| Runtime Render | Shared visual/scene presentation, animation, VFX, cameras and assets | Gameplay rules, combat decisions and rewards |
| Editor | Author project, scene/content and Runtime-provided configuration; preview and export **data** | Separate game simulation or duplicate visual renderer |
| Game Client | Handle user interaction, load content, use selected Runtime/Render functions | Rules copied from Runtime, default authority over rewards |
| Game Server | Game-chosen orchestration, validation, settlement, rewards and persistence | Mandatory live simulation, tick-by-tick monster synchronization or mandatory GPU render |

External: L1 `@rpg/core/kernel`, L2 `@rpg/gameplay`. **Do not modify** in this roadmap.

## Useful dependency directions

```text
L1 / L2 public APIs
       |
       v
 runtime-engine          runtime-render
      / | \                  /  |  \
     /  |  \                /   |   \
  editor       game-client       game-server

Editor / Client -> Runtime Engine and Runtime Render (where needed)
Server -> Runtime Engine + game content; Runtime Render optional if justified
Runtime Engine -X-> Runtime Render, Editor, Client, Server
Runtime Render -X-> gameplay Rules, Editor, Client, Server
```

*This is a dependency guide, not a mandatory scene/server runtime topology.*

## Three data concepts that cannot be conflated

- **Authored content/config:** Editor creates game-specific definitions against the active Runtime/Render contracts.
- **Runtime instance/state:** Runtime evolves state per the selected game's rules; not saved back into the content definition accidentally.
- **Editor workspace state:** UI tabs, selection, gizmos, zoom, unsaved-document lifecycle; not part of game content export.

## Two intentional reuse paths

- Editor + Render => reusable scene and visual authoring tools. Object placement does not imply a universal `Monster` gameplay schema. Text RPG may use content tools without 2D viewport requirements.
- Editor + Runtime => game-specific rule config and playtest. Editor MUST consult the active game's Runtime contract, not hardcode other games' semantics.
- Runtime + Render + Content => game can run; Client and Server responsibilities are selected **per game**.

## Initial evolution order

Phase 0 Foundation boundaries/contracts -> MVP 1 Editor + Render (Project, assets, scene/map, visual object placement) -> MVP 2 Editor + Runtime (minimal player/monster/skill/item for the selected game) -> MVP 3 client/server vertical slice (this game's authority/settlement) -> review after evidence.

Do not lock the physical L3/L4 layer split, fixed package names, a universal RPG schema, or a mandatory realtime Server now. Rules with identical labels may have incompatible contracts across games.

## Spatial boundary — Phase 4

[v0.4.0 SP01](harness/checkpoints/spatial-contracts-v0.4.0.md) records the source
audit and proposed spatial contract map; no spatial API or math is implemented.
Editor owns authored space/grid/placement declarations. Runtime Render owns
presentation transforms, projection and viewport mapping; Editor calls its public
API rather than duplicating math. Runtime Engine owns gameplay spatial policy/state.
World/scene, grid and screen positions are distinct; authored placement is neither
a Render instance nor gameplay truth. Existing Phase 3 placement remains opaque.
Coordinates stay optional for text content. Future portable requests must carry
explicit space/unit/view/viewport/policy context without DOM, GPU or THREE types;
pure math must not require graphics acquisition. No reverse Render-to-Editor import,
shared spatial package, identity registry or global transform store is introduced.

[v0.4.1 SP02–SP04](harness/checkpoints/spatial-contracts-v0.4.1.md) adds only
Editor-owned project-scoped coordinate references, explicit 2D declarations and
finite spatial point capture. This supersedes the proposed SP04 owner allocation
in SP01 for authored values; Render still owns future presentation math. SC08
remains unchanged and optional. No grid conversion or projection exists.

[v0.4.2 SP05](harness/checkpoints/spatial-contracts-v0.4.2.md) adds a Render-owned
immutable planar TRS descriptor: scale about numeric zero, rotate in radians about
zero, then translate. It captures finite data without applying it to points or
changing Scene placement; composition, inverse and graphics integration are deferred.

[v0.4.3 SP06/SP07](harness/checkpoints/spatial-contracts-v0.4.3.md) implements
Render-owned point application, explicit ordered composition and conditional inverse
using a portable immutable six-coefficient affine result that retains shear.
SC09 attachments remain nonhierarchical authored references. No Scene traversal,
Editor math duplication, unit/axis conversion or GPU dependency is introduced.

[v0.4.4 SP08](harness/checkpoints/spatial-contracts-v0.4.4.md) implements optional
Editor-owned orthogonal grid declarations with explicit referenced space, origin,
cell dimensions and index policies. Grid configuration does not alter Scene/Object
identity or require gridded placement. Render has no grid catalog or new API;
coordinate conversion remains deferred to its approved future scope.

[v0.4.5 SP09](harness/checkpoints/spatial-contracts-v0.4.5.md) implements canonical
orthogonal conversion in Render using its own portable requests/results, independent
of Editor, GPU and gameplay. Editor adapts authored grid + matching space through
the Render public root without formulas. Coordinate-space reference/unit survives
both directions; Scene/Asset schema remains unchanged.

[v0.4.6 SP10/SP11](harness/checkpoints/spatial-contracts-v0.4.6.md) adds Render-owned
local-unit anchor/pivot alignment and explicit angle-based visual facing. Editor
adapts optional existing Scene placement and validates caller-supplied space/axes;
no authored schema changes. Facing remains independent of geometry and animation.
Alignment is unrotated pure translation, not a render instance or gameplay position.
