# Editor — project-specific agent guidance

**Canonical owner:** Project/content authoring tools, document lifecycle, config inspection, references, validation, visual/Rule preview and data export.

Read root agent guidance first.

- Editor + Runtime Render => reusable scene/asset/object authoring. Do not assume visual NPC/Monster implies a shared RPG mechanics schema.
- Editor + Runtime Engine => configure what the **active game's Runtime** actually supports. Runtime is semantic owner; UI is the authoring surface.
- Preview gameplay uses the actual Runtime rule implementation. Do not write independent movement/damage/loot algorithms into Inspector or preview.
- Editor exports **data**, not a compiled game/client/server implementation.
- Keep project UI state, authored content and runtime sandbox state separate. Preserve unknown authored fields where possible; avoid destructive save operations.
- Learn from JXQY's Project/Document/Map/Skill/Goods/Playtest workflows, not its fixed skill/monster formats.
- MVP 1 can place a visual NPC without committing to HP, AI or Drop. No generated UI tests.
