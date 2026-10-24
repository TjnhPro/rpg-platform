# VP05 — v0.17.4

Parent306f7f9ad6347bbab4cf6dee3e461f8efccda6d6; branch feat/visual-object-placement-v0.17.
[Task](../../editor/docs/tasks/phase17-visual-object-placement/rpg-platform-v0.17.4-place-visual-object-task.md).
Audited VP04/status and canonical addSceneObject, Asset reference/resolver/descriptor,
Visual Profile and Map APIs. Editor feature create + additive root only. Bounded
intent capture, explicit Scene/project/unique ID, objects layer, supported image,
resolved bounded point, optional actual Visual Profile then canonical Scene append.
Returns immutable candidate + optional profile for later preserving Document seam;
never writes session/disk/GPU or invents profile defaults/Asset/gameplay state.
No foundation/other-owner/L1/L2 delta. Next v0.17.5. UI/VISUAL/IO_NOT_VERIFIED.

Observed: architecture check exit0 (260 sources), scope exit0, Editor + consumer
verify exit0 (UI_CONTRACT_PASS, tsc, Vite). Existing chunk-size/DEP0190 warnings.
Finite built-root probe: one PNG-backed npc at cell1,1 center (48,48), old empty
snapshot unchanged; wrong layer and foreign asset project rejected before a result.
No filesystem/preview/UI claim. Changed feature create/index/checkpoint only;
unrelated untracked .mcp.json excluded. Commit continues ordered VP06.
