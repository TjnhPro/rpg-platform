# VP04 — v0.17.3

Parent54aad128d5ede48ab5ad4e187f8f4345fb9e0508; branch feat/visual-object-placement-v0.17.
[Task](../../editor/docs/tasks/phase17-visual-object-placement/rpg-platform-v0.17.3-positioning-map-bounds-task.md).
Audited preceding checkpoint/status and actual Map bounds/grid, Spatial and Render
grid conversion signatures. Editor-only position adapter + additive root. Explicit
scene-point or grid-cell(center/start-corner); bounded portable capture, exact keys,
scoped space and canonical floor→containsMapCell. Half-open cell bounds; no clamp,
camera/viewport dimensions, origin formula, occupancy/collision or gameplay.
No foundation/other-owner/L1/L2 delta. Next v0.17.4. UI/VISUAL/IO_NOT_VERIFIED.

Observed: check259/scope4 exit0. First verify exited1 (TS2352 intentional raw codec capture needed unknown bridge for MapCell interface); corrected feature cast only, rerun verify exit0 including UI TS/Vite. Existing chunk/DEP0190 warnings. Finite public API exit0: cell1,2 center80,48/start64,32; free255.5,191.5 accepted, x256 boundary and NaN rejected. No session/IO mutation.
