# VP10 — v0.17.9

Parent4001a76eb521ff06165921b2e601d35e3f2cb5ee; branch feat/visual-object-placement-v0.17.
[Task](../../editor/docs/tasks/phase17-visual-object-placement/rpg-platform-v0.17.9-scene-document-edit-integration-task.md).
Editor-only document-scene-placement/index/manual/checkpoint. Audited VP09/status,
existing strict Map/Scene/Visual validator, preserving replacement, DocumentSession,
Phase16 selection/editor, Project/Asset contexts, saveMap/saveDocument and Phase15
Scene-authorized filesystem host. No foundation changes. Additive focused insertion
and guarded editor facade; exactly one shared Phase16 inspector context. Place uses
issued current Asset selection intent; other edits use issued selection and expected
revision. Re-read owners before ONE replaceContent; successful delete clears selection.
Metadata-preserving candidates, no bare membership overwrite, IO or saved-state claims
in commands. Catalog changes require rebind; host disposes on binding replacement.
Manual IO uses existing Scene host and canonical saveMap→saveDocument; Save Scene is
separate from Save Project/Assets. Existing-file updates remain UNSUPPORTED_CAS.
Next v0.17.10; UI/VISUAL_NOT_VERIFIED.

Observed: initial check264/scope4/Editor consumer verify incl UI/TS/Vite exit0;
manual addition check265/scope5 exit0 (source unchanged). Existing warnings only.
`node editor/manual/visual-object-placement-document.mjs` exit0: real admitted PNG,
create revision2→3; move3→4, clone4→5, delete5→6; stale token/revision, negative bounds,
duplicate ID reject with same envelope/revision. Delete clears shared selection.
Unrelated rich entry/content/Scene metadata survives. Initial Scene save committed,
cleanup cleaned, current/savedRevision6 and dirty false; Project remains dirty until
separate save. Existing-file revision request blocked CONFLICT_UNDETECTABLE, no CAS
claim. Project/Asset/Scene filesystem reopen exact serialized document, clean session:
SCENE_AUTHORING_OBSERVED / SCENE_IO_OBSERVED. Local host root was
C:/Users/admin/AppData/Local/Temp/rpg-project-manager-uygTlj/game-a.
Additional finite root probe exit0 rejects foreign root, unknown layer, replaced Asset
selection intent, wrong owner/schema, future Map version, disposed context without
Scene adoption. Prior VP07–09 probes cover foreign Scene, missing object and inbound
attachment. No generated suites or browser/GPU assertion. .mcp.json excluded.
