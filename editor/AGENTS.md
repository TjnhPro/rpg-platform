# Editor — project-specific agent guidance

**Canonical owner:** Project/content authoring tools, document lifecycle, config inspection, references, validation, visual/Rule preview and data export.

Read root agent guidance first.

- [Phase 2 v0.2.0 AR01/AR02](../harness/checkpoints/asset-contracts-v0.2.0.md): Editor owns authored asset IDs, source metadata, future catalog/reference resolution and diagnostics. Asset ID is caller-provided and stable within project scope, never inferred from filename/path or a numeric external source ID. This is design-only: no asset API, catalog, resolver, importer or UI yet. Resolution must not perform IO or load Render resources; exported content must not require Client to import Editor.
- [v0.2.1 Stable Asset Identity](../harness/checkpoints/asset-contracts-v0.2.1.md) implements the public identity factory: exact nonempty whitespace-free projectId/assetId strings, case-sensitive pair equality, optional/null source text retained verbatim. Output is detached/frozen; label/path never supply implicit identity. No uniqueness/catalog or metadata descriptor. Developer's latest instruction defers review to the final step; do not block execution solely on earlier checkpoint review gates.
- [v0.2.2 Asset Classification & Metadata](../harness/checkpoints/asset-contracts-v0.2.2.md) adds `createAssetDefinition` and readonly metadata/definition types. Kinds classify resource/data, never game roles; kind strings remain open. Factory creates schemaVersion 1 records, reuses identity validation and deeply detaches/freezes portable JSON metadata, retaining unknown extension keys. No Render resource, UI state, parser, catalog, serializer or migration is added.

- Follow the [Editor–Render boundary](../harness/checkpoints/editor-render-v0.1.0.md). v0.1.0 imports are bootstrap compilation only, not an operational preview consumer.
- [v0.1.1](../harness/checkpoints/editor-render-v0.1.1.md) adds a package-root host adapter for session descriptors. It is not preview UI or renderer initialization; target creation/mounting/removal stays host-owned.
- [v0.1.2](../harness/checkpoints/editor-render-v0.1.2.md) adds explicit host-binding initialization through the Render root. Editor calls the lifecycle; it does not own its state machine. Bound is not graphics-ready.
- [v0.1.3](../harness/checkpoints/editor-render-v0.1.3.md): use public disposal before removing the host target, then drop caller-owned handles/snapshots. Render never destroys host-owned targets. No preview manager is implemented.
- [v0.1.4](../harness/checkpoints/editor-render-v0.1.4.md): consume/forward safe Render failure diagnostics through the public root. Unknown exceptions remain unknown; presentation policy is host-owned. No UI, fallback or retry behavior is implemented.
- Current [v0.1.5 ER04/ER10](../harness/checkpoints/editor-render-v0.1.5.md): the Editor preview-host adapter owns one session slot, disposes before replacement, and supports null as explicitly unavailable preview capability. Mounted means session initialized, not a rendered frame. No DOM host/UI is implemented.
- [v0.1.6 ER11–ER13](../harness/checkpoints/editor-render-v0.1.6.md) records compatibility and portability limits. Keep null/unavailable distinct from unsupported graphical targets and failures; future Render features require public API consumer analysis, never Editor/private backend imports or a silent mounted-to-GPU-ready reinterpretation.
- [v0.1.7 ER14](../harness/checkpoints/editor-render-v0.1.7.md) supplies a separate [manual browser entrypoint](manual/README.md). It awaits public Render graphics acquisition, submits one frame and disposes via the public lifecycle; it is not imported by the Editor root. Existing preview-host APIs stay binding-only. No Three import, loop, framework or automated browser verification is allowed in the demo.
- Use Render's package root, never `three`, `@types/three`, Render source paths or private backend classes. Editor owns host UI and session-reference orchestration; Render owns its resources and their cleanup. The separate v0.1.7 graphics path owns backend cleanup; existing preview-host adapters remain binding-only.
- [v0.1.8 ER15](../harness/checkpoints/editor-render-v0.1.8.md) records integration/closure evidence without a new API. The manual entrypoint is separate from the public preview-host adapter; do not imply mounting submits a frame. Keep manual visual review and phase acceptance open for Developer.

- Editor + Runtime Render => reusable scene/asset/object authoring. Do not assume visual NPC/Monster implies a shared RPG mechanics schema.
- Editor + Runtime Engine => configure what the **active game's Runtime** actually supports. Runtime is semantic owner; UI is the authoring surface.
- Preview gameplay uses the actual Runtime rule implementation. Do not write independent movement/damage/loot algorithms into Inspector or preview.
- Editor exports **data**, not a compiled game/client/server implementation.
- Keep project UI state, authored content and runtime sandbox state separate. Preserve unknown authored fields where possible; avoid destructive save operations.
- Learn from JXQY's Project/Document/Map/Skill/Goods/Playtest workflows, not its fixed skill/monster formats.
- MVP 1 can place a visual NPC without committing to HP, AI or Drop. No generated UI tests.
