# VP01 — Visual Placement design freeze

Execution baseline/parent bf95b5b8db9bfccc03335c4fe90b978c369486c6, synchronized
main after Phase16. Branch feat/visual-object-placement-v0.17. Unrelated untracked
.mcp.json is excluded. Exactly five workspaces. This version is docs only.
Editor is the only production owner; task folder authorizes additive feature
contracts/collection adapter, not modifications to canonical foundation sources.
No L1/L2 API required. Render/Engine/Client/Server remain read-only.

| Data/behavior | Canonical owner / actual source API |
| --- | --- |
|objectId/displayName/classification|SceneObjectDefinition / createSceneObjectDefinition; caller supplies exact ID, Scene enforces uniqueness|
|objects/order/attachments|SceneMembership / add/get/replace/removeSceneObject; removal currently leaves inbound references, feature must reject first|
|AssetReference/catalog/selection|Phase2 resolver + Phase14 select/getManagedAssetSelection, getAssetManagerProjectSnapshot; project-local|
|placement|SceneObjectPlacement + updateSceneObjectSpatialPlacement; no second position|
|Map bounds/grid/layers|readMapProfile, containsMapCell, mapCellToPlacement, describeGridConversion, describeMapLayers|
|visual properties|Phase16 read/createVisualPropertiesProfile, validateVisualSceneDocument, describeVisualPresentation|
|selection|Phase16 createVisualInspectorContext, issued token bound to Project/root/Document/revisions/generation; transient|
|revision/dirty/IO|DocumentSession, openMap/saveMap→loadDocument/saveDocument; issued ProjectRootBinding and tracked locator|
|preview instances/camera/resources|existing ScenePreviewBridge, Viewport, public Render scene/cache/camera APIs|

Phase14–16 actual public source exists on this HEAD. Inventory checked Scene
membership/definition, Spatial/coordinate/grid, document-scene-edit/profile,
Map profile/bounds/grid/layers/open/save, asset-manager-selection/project,
visual-inspector-context/document-edit/profile/preview and UI App/Viewport seams.
replaceSceneDocumentObject preserves supported metadata but only replaces existing
entries. No existing focused ordinary-object add/delete/clone Document adapter.
Phase15 tile/background collections cannot substitute for ordinary objects.

Data flow: explicit current Project/root + tracked active Map Document + canonical
Asset catalog/selection → bounded feature intent → pure Scene operation candidate
→ focused Document metadata-preserving adapter → strict Scene/Map/Visual validation
→ expected revision/token recheck → one DocumentSession.replaceContent → existing
saveMap→saveDocument; separate preview consumes resulting authored snapshot.

## Frozen policies

- Exact caller ID, no normalization/generator/registry. Authoring classifications
  player/monster/npc/item/vfx are labels only; never Asset kind, gameplay role or
  Render mode. Reserved editor-map tile/background remain Phase15-owned.
- Map free coordinates are numeric Scene units, no screen inference/clamp. Bounds
  use canonical Render grid conversion floor then Map containsMapCell; half-open
  cells. Explicit cell mode uses existing center mapping; no duplicated formulas.
- Placement requires a same-project resolvable supported image Asset and an actual
  objects-role layer. Classification vfx with image binding is a static authored
  label, not effect playback. No Asset definition/file creation/deletion.
- Scene snapshot operations alone cannot preserve Document metadata. VP10 focused
  adapter retains original content/Scene/entry/definition metadata and uses canonical
  known fields. Move delegates existing preserving replacement. Add appends; clone
  appends with fresh ID and explicit target point, keeps valid own profile/opaque
  metadata, rejects outgoing attachments rather than inventing clone relationships.
  Delete rejects inbound attachments, no cascade. Only focused owned fields change.
- Unknown Visual Profile is inspect-only. Unknown unrelated portable metadata is
  preserved exactly, never interpreted or normalized. Full strict validation before
  adopting candidates; no generic JSON patcher, codec, persistence or mirrored store.
- Context requires issued root, current tracked active Map Document and exact project.
  Host invalidates on project/catalog/session/Scene replacement or failed IO. Tokens
  bind revisions and transient generation. No automatic first-object fallback.
- Existing Phase15 filesystem host authorizes Scene locators and create-only atomic
  publication (unlike project.json-only Phase13 host). Finite create-before-first-save
  proof allowed; later overwrite must report UNSUPPORTED_CAS/CONFLICT_UNDETECTABLE.
  Save Scene is separate from Project and Assets; UI sessions are explicit.
- Existing Viewport/Render bridge path only. Numeric forms/list selection are MVP;
  no canvas drag/hit-test/gizmo, gameplay, VFX playback, undo or generated tests.

## Ordered scope / gates

|Version|Capability / intended feature path|
|---|---|
|0|this design, task copies, Harness pointer/checkpoint|
|1|visual-placement-identity.ts: exact ID/classification|
|2|visual-placement-context.ts: canonical Asset selection + active binding|
|3|visual-placement-position.ts: explicit position/cell + bounds|
|4|visual-placement-create.ts: pure ordinary Scene insertion|
|5|visual-placement-selection.ts: reuse Inspector transient selection|
|6|visual-placement-move.ts: focused canonical placement candidate|
|7|visual-placement-duplicate.ts: fresh ID, explicit point, safe relationships|
|8|visual-placement-delete.ts: inbound-reference guard|
|9|document-scene-placement.ts: preserving candidates + guarded session integration|
|10|visual-placement-preview.ts: reuse preview/viewport public path|
|11|features/visual-object-placement/**, minimal App wiring; manual real-file consumer|
|12|closure audit/checkpoint, exact-head CI / one PR|

Each task reread and source/HEAD/status audited before edits, one checkpoint/commit
per version. Additive index exports only when needed. Per version: architecture,
scope editor --allow-infra, verify editor --with-consumers (includes UI gates).
Closure also full five-project verify/forced build, public-declaration/baseline
protected-path audit and exact remote CI HEAD. No package/config/theme/Shell changes.
Missing dependency/metadata seam/security capability => stop with evidence and
smallest correct-owner delta; no replacements or skipped version. No routine
review pauses. Final Developer acceptance, merge and next phase remain external.
UI_BUILD_PASS is not UI_INTERACTION_VERIFIED or VISUAL_VERIFIED; this checkpoint
has source/design evidence only, no authoring/IO/preview observation.
