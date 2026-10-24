# VP03 — v0.17.2

Parent358a3cd91b24af8f0ca7137313266c4b81a8c1e1; branch feat/visual-object-placement-v0.17.
[Task](../../editor/docs/tasks/phase17-visual-object-placement/rpg-platform-v0.17.2-asset-selection-placement-context-task.md).
Audited VP02/HEAD/status, actual Phase14 managed selection/project and Phase15/16
profile/tracking/root APIs. Editor feature context + additive root only. Reuses
issued same Project/root manager, strict tracked active Map Scene and catalog.
Short-lived issued intent binds document/project revisions, catalog generation,
actual managed selection. Selection changes invalidate (including away/back).
Objects-role layer required; reserved Map classes excluded, open authored labels
retained. Public descriptor validates PNG visual support, not file existence or
Render success. Host invalidation/disposal on binding change is explicit.
No separate authored store/foundation/L1/L2/other-project edit. Next v0.17.3.
UI_NOT_VERIFIED / VISUAL_NOT_VERIFIED / SCENE_IO_NOT_VERIFIED.

Observed exit0: check258, scope4 paths, verify Editor with consumers/UI TS/Vite;
existing chunk/DEP0190 warnings. Initial finite fixture probes exited1 because the
probe omitted explicit nullable ports and required Asset metadata. Corrected only
temporary probe inputs, then reran exit0: valid npc/PNG context for a/main;
selection change rejects old intent, nonvisual text rejects NON_VISUAL_KIND,
valid PNG with missing tiles layer rejects PLACEMENT_OBJECT_LAYER_REQUIRED.
No file/Render claim. Evidence correction amends this checkpoint before advancing;
no production semantic change or extra capability commit.
