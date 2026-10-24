# VP07 — v0.17.6

Parent8cc65b0645c3a99713947f98f4533ae438f57eef; branch feat/visual-object-placement-v0.17.
[Task](../../editor/docs/tasks/phase17-visual-object-placement/rpg-platform-v0.17.6-move-visual-object-task.md).
Editor-only focused move/index/checkpoint. Audited current getSceneObject,
updateSceneObjectSpatialPlacement, replaceSceneDocumentObject, Map and Visual
validators. Additive moveVisualObject: explicit Scene, existing ordinary objects-role
entry, VP04 bounded point, canonical update then existing preserving Document seam.
No metadata is reconstructed from bare membership; identity/asset/layer/attachments,
entry/definition/Scene/content metadata and visual profile survive. Reserved terrain
rejected. No session adoption until VP10, GPU/gameplay/dependency/owner delta.
Next v0.17.7; UI/IO/VISUAL_NOT_VERIFIED.
Observed check261/scope4/verify including UI/TS/Vite exit0. Finite built-root probe exit0: move to80,48 retains content/Scene/entry/definition opaque metadata and hidden scale profile; old source byte-semantic unchanged; negative cell and foreign Scene reject. Existing warnings only; unrelated .mcp.json excluded.
Evidence correction before advancing: first temporary probe mistakenly replaced scene.metadata and removed editorMap, returning NOT_A_MAP; the shell incorrectly continued into commit. Fixed fixture to retain original Map metadata; rerun observed exit0 with outcomes above. Amended checkpoint only, no production semantic correction.
