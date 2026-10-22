# Editor — project-specific agent guidance

**Canonical owner:** Project/content authoring tools, document lifecycle, config inspection, references, validation, visual/Rule preview and data export.

Read root agent guidance first.

- Follow the [Editor–Render boundary](../harness/checkpoints/editor-render-v0.1.0.md). v0.1.0 imports are bootstrap compilation only, not an operational preview consumer.
- [v0.1.1](../harness/checkpoints/editor-render-v0.1.1.md) adds a package-root host adapter for session descriptors. It is not preview UI or renderer initialization; target creation/mounting/removal stays host-owned.
- [v0.1.2](../harness/checkpoints/editor-render-v0.1.2.md) adds explicit host-binding initialization through the Render root. Editor calls the lifecycle; it does not own its state machine. Bound is not graphics-ready.
- Use Render's package root, never `three`, `@types/three`, Render source paths or private backend classes. Editor owns host UI and session-reference orchestration; Render owns its resources and their cleanup. Resource lifecycle remains deferred.

- Editor + Runtime Render => reusable scene/asset/object authoring. Do not assume visual NPC/Monster implies a shared RPG mechanics schema.
- Editor + Runtime Engine => configure what the **active game's Runtime** actually supports. Runtime is semantic owner; UI is the authoring surface.
- Preview gameplay uses the actual Runtime rule implementation. Do not write independent movement/damage/loot algorithms into Inspector or preview.
- Editor exports **data**, not a compiled game/client/server implementation.
- Keep project UI state, authored content and runtime sandbox state separate. Preserve unknown authored fields where possible; avoid destructive save operations.
- Learn from JXQY's Project/Document/Map/Skill/Goods/Playtest workflows, not its fixed skill/monster formats.
- MVP 1 can place a visual NPC without committing to HP, AI or Drop. No generated UI tests.
