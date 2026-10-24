# VP09 — v0.17.8

Parent27965abdf3659061ef62c162af927730f5653556; branch feat/visual-object-placement-v0.17.
[Task](../../editor/docs/tasks/phase17-visual-object-placement/rpg-platform-v0.17.8-delete-visual-object-task.md).
Editor-only delete/index/checkpoint. Audited VP08, actual Scene attachment semantics,
Map and typed Visual fields (neither defines additional inbound object references).
Additive deleteVisualObject validates current ordinary object then rejects every
known incoming attachment with source IDs; canonical removeSceneObject decides the
survivor set, original rich entries retain metadata/order. Full Map/Scene/Visual
validation returns frozen candidate. No Asset/file/project mutation or Render cleanup.
Opaque metadata is retained, never interpreted as an invented relationship schema.
Successful session deletion clears shared selection at VP10; failure leaves it alone.
No foundation/other owner/public contract replacement. Next v0.17.9.
UI/IO/VISUAL_NOT_VERIFIED.
Observed check263/scope4/verify incl UI/TS/Vite exit0. Finite built-root probe exit0: inbound attachment rejects with npc-2 diagnostic, missing ID rejects; deleting unreferenced npc-2 leaves exactly npc-1 and retained metadata/order, source and Asset catalog unchanged. Existing warnings only; .mcp.json excluded.
