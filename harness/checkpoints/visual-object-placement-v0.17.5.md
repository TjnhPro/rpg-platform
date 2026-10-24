# VP06 — v0.17.5

Parent34c88dfb1f5f9d1791472d0508f6b90389901c21; branch feat/visual-object-placement-v0.17.
[Task](../../editor/docs/tasks/phase17-visual-object-placement/rpg-platform-v0.17.5-object-selection-task.md).
Editor primary owner; source audit finds Phase16 createVisualInspectorContext already
matches this capability. No new service, production code or public delta warranted.
The host shares this exact context with Placement and Inspector, calls select(id),
clear(), read(token); invalidates on Project/Scene replacement/failed IO. Command
invocations must read current owners and this token, never a retained object copy.
Invisible entries can be list-selected: selection has no visibility filter.

Finite built-root probe exit0: none, missing ID, selected npc-1, clear, forged-scene
token stale, host invalidation stale, closed Scene read-only then none. Select/clear
leave revision unchanged. Fixture uses one fresh ordinary Scene entry; production
collection adoption remains VP10. Cross-Project replacement requires host invalidate
as prescribed by existing API. No persisted selection. No new source path.
UI_INTERACTION_NOT_VERIFIED / VISUAL_NOT_VERIFIED / IO_NOT_VERIFIED. Next v0.17.6.
Observed gates: check260/scope2/verify Editor with consumers exit0; UI checker/TS/Vite pass. Existing chunk and DEP0190 warnings. Delta checkpoint only; .mcp.json excluded.
