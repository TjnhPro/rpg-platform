# Ownership decisions — do not classify by similar names

This table is for routing an implementation **after inspecting current source**. It is not a universal RPG feature list.

| Change | Primary owner | Allowed collaborator / note |
| --- | --- | --- |
| Game-specific projectile travel, hit, penetration and lifecycle | Runtime Engine | Render presents output; Editor authors *that game's* config |
| Skill/monster/player/item RULE definition | Runtime Engine | L1/L2 are external public capabilities, not places to move rules |
| Animation, VFX, sprite alignment, camera | Runtime Render | Editor controls/inspects via public API |
| Scene placement, selection, gizmo, authoring undo, workspace state | Editor | Runtime Render supplies shared visual scene operations |
| Authored asset identity, source identity, metadata/catalog, reference resolution and diagnostics | **Editor** | [Phase 2 integration review](checkpoints/asset-contracts-v0.2.10.md): immutable authored catalog/resolution/diagnostics are implemented. Render owns the neutral visual descriptor/preparation contract; loaded resources remain future work, never a second authored catalog |
| Authored Scene Definition, Scene/Object IDs, membership, relationships and placement records | **Editor** | [Phase 3 closure audit](checkpoints/scene-contracts-v0.3.11.md): minimal immutable Scene data/operations/diagnostics/projection implemented; authored data is independent of UI, GPU and gameplay. Attachment is nonhierarchical; documents, parenting and spatial semantics remain deferred |
| Authored coordinate-space/unit/grid declarations | **Editor** | [v0.4.1 SP02–SP04](checkpoints/spatial-contracts-v0.4.1.md): project-scoped 2D definitions/references and finite authored point capture implemented; grid deferred. Existing placement remains opaque/optional; no second identity registry or Scene schema change |
| Presentation transforms, grid/plane conversion and viewport projection | **Runtime Render** | [v0.4.2 SP05](checkpoints/spatial-contracts-v0.4.2.md) implements immutable planar TRS descriptor capture only; point application/composition/inverse/grid/projection remain deferred. Portable data needs no GPU or Editor imports. Editor supplies authored configuration and calls Render public APIs; gameplay grid/movement/collision policy stays Engine-owned |
| Presentation descriptions, visual instances and session-local Render state | **Runtime Render** | Editor projects through Render public APIs; no reverse import or parallel authored Scene catalog. Scene instance allocation belongs to Feature 08; no HP/AI/Drop semantics |
| Monster HP/AI/drop parameters supported by current game | Editor authors Runtime Engine's config | Engine is source of semantics and validation |
| User control or client input integration | Game Client | Runtime Engine owns effects of an accepted game command |
| Session creation, validation policy, settlement, issuing rewards, persistence | Game Server | Uses game Runtime; do not assume tick server or a single validation algorithm |
| Other saved content's resource/identity contract | **Unassigned until actual use case** | Asset and authored Scene identities are assigned above. Document envelopes, serialization/export and game content formats remain separate decisions in Features 05/19. No sixth `shared` package |
| Missing numerical/gameplay foundation API | **BLOCKED / Developer decision** | Do not modify L1/L2 or duplicate their ownership |

## Required reasoning for multi-project changes

State **(1)** which observable behavior changes, **(2)** who owns that behavior, **(3)** what public contract crosses projects, **(4)** which consumers need adjustments and why, **(5)** what remains unchanged. If two possible owners both make sense, inspect actual implementation and request a decision before irreversible architecture changes.

Examples:
- "Skill bay thẳng" is not an L2 capability merely because another game also has one. Game rules live in that game's Runtime Engine.
- "Thêm ô HP trên Monster Inspector" is Editor UI; HP semantics/value validation derive from current Runtime rules, not universal `RpgMonster`.
- "Quái spawn theo wave, Server chỉ tổng kết" can be fully valid. No imposed realtime game loop on Server.
- "Render collision shape" must be separated from authoritative collision/gameplay semantics; never use a draw callback as the source of damage truth.

## Escalation

Request Developer approval for a changed dependency direction, moved ownership, new public layer/package, modifying L1/L2, unexpected client/server authority model, or public schema break. Do not repair an unclear boundary by adding a generic service automatically.
