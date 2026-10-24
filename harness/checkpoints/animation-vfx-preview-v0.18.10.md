# AP11 — v0.18.10

Parent51756f9; branch feat/animation-vfx-preview-v0.18.
[Task](../../editor/docs/tasks/phase18-animation-vfx-preview/rpg-platform-v0.18.10-scene-preview-integration-task.md).
Source-backed Phase15 Map,16 Visual Properties,17 Placement public APIs present.
Editor-only adapter owns bridge targets, Render owns world/attachment math and
instances. Effect ID/handle separate from bridge target. Document snapshot/revision,
project/scene/plane and live target guarded. Disposal removes preview memberships,
never authored objects. Narrow existing Placement children seam now hands borrowed
validated DocumentSession to composition; no state ownership or public root delta.
First build caught wrong module and attachment field; corrected to actual source
contracts. Final check279/scope4/Editor consumer verify exit0, UI contract/TS/Vite
pass. Finite real Chromium session, explicitly constructed canonical sample Map:
authored object applied via bridge at100,100; separate VFX world120,100 then attached
translation-only3,4, sync and detach(world). Unknown target rejected. Scene revision/
dirty unchanged, authored object count1 after preview cleanup. SCENE_PREVIEW_OBSERVED
for labeled sample only; actual Shell interaction/pixels NOT_CHECKED yet.
Next v0.18.11.
