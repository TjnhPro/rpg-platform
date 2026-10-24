# VP12 — v0.17.11

Parentd0b6398d0cd6c92f9edc5adb94dfcbbc550835ec; branch feat/visual-object-placement-v0.17.
[Task](../../editor/docs/tasks/phase17-visual-object-placement/rpg-platform-v0.17.11-minimal-working-visual-placement-mvp-task.md).
Editor-only new feature workspace, minimal App import/slot/label replacement, manual
consumer extension and MVP guide. Audited preceding checkpoint/source/HEAD/status,
Phase13 active capability, Phase14 browser catalog/selection, Phase15 create/open/save,
Phase16 VisualFields/VisualViewport, and shell panel lifetime. Dependencies exist.
No public/package/foundation/theme/Shell/Render delta. Controller lives above slots;
effect owns subscription/disposal. Shared Phase16 selection and one held Document
for Placement+Inspector; no copied object store. Existing Map tool is independently
opened/closed, as before; no new global session registry or cross-tool synchronization.

Controls: explicit Scene create/open/close/save, IDs/dimensions, current Asset selection,
labels/layer/point-or-cell/alignment, Place, single-select, Move, fresh-ID Duplicate,
explicit Delete, same-context Inspector. Numeric bounds use canonical commands;
Inspector position routed through bounded move. Missing catalog/layer/root/preview and
CAS limitations stated. Project/catalog switches invalidate tokens; foreign held
Scene retained for explicit discard. Async stale Open result disposed, IO guarded,
dirty unload warning. Source wiring only; no invented UI interaction or visual PASS.
[Guide](../../editor/docs/visual-object-placement-v0.17.11-mvp.md).
Next v0.17.12; no generated suites/browser/RAF/GPU verification.

Observed: check267/scope3/Editor consumer verify incl ui:check20 sources/3 stylesheets,
zero errors/warnings, UI TS/Vite exit0. Added docs/manual/checkpoint then check267/
scope6/diff whitespace exit0. Existing Vite chunk/DEP0190 warnings only.
Finite public-root filesystem consumer exit0 with Player+Monster sharing actual PNG:
move4→5, monster-002 duplicate5→6, delete6→7, four rejects retain envelope/revision.
Initial Scene commit current/savedRevision7 clean; Project separate; existing save
blocked CONFLICT_UNDETECTABLE; exact reopen clean. Root
C:/Users/admin/AppData/Local/Temp/rpg-project-manager-JzHLMp/game-a.
UI_BUILD_PASS / SCENE_AUTHORING_OBSERVED / SCENE_IO_OBSERVED only.
UI_INTERACTION_NOT_VERIFIED / PREVIEW_NOT_OBSERVED / VISUAL_NOT_VERIFIED.
Unrelated .mcp.json excluded. No asset file deletion or gameplay activation.
