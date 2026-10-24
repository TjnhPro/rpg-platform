# AP08 — v0.18.7

Parent50d6c9b; branch feat/animation-vfx-preview-v0.18.
[Task](../../editor/docs/tasks/phase18-animation-vfx-preview/rpg-platform-v0.18.7-vfx-playback-lifetime-task.md).
Read previous checkpoint, task and Render public lifetime implementation.
Editor adapter owns one effect only; borrowed scene/session/target retained.
No root/public/schema/Render changes. Commands/advances use canonical Render;
context invalidation removes owned effect. Timed-repeat is not exposed.
Actual check275/scope2/Editor consumer verify exit0, UI contract/TS/Vite pass.
Finite headed Chromium observation via existing loopback manual host and real
PNG/TPSheet: play125 frame1; pause125; resume250 wraps0; stop0; restart0;
repeat same instance. Duplicate ID canonical DUPLICATE_ID. Disposed commands
reject. Once250 yields clip-completed receipt, removed membership and retained
authored target. VFX_PLAYBACK_OBSERVED. Diagnostics unbound and resourceReadiness
NOT_CHECKED throughout; no frame or pixel claim. Browser script was temporary,
not a generated suite. Next v0.18.8.
