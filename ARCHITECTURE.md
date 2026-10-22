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
