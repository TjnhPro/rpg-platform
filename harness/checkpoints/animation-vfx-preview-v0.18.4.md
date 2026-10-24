# AP05 — v0.18.4

Parent75243c4; feat/animation-vfx-preview-v0.18.
[Task](../../editor/docs/tasks/phase18-animation-vfx-preview/rpg-platform-v0.18.4-sprite-playback-controller-task.md).
Read AP04/task/HEAD and canonical directional/neutral playback transition source.
Editor-local sprite wrapper only; no root/API/schema delta, IO, RAF or frame math.
One owned Render handle. Guards current ticket before commands, context retirement
disposes it. Snapshot only from Render. Restart = stop+play; clip change canonical
selectClip stops/resets when changed. play same clip retains elapsed except completed;
pause only playing, resume only paused/noncompleted; advance only playing; dispose
terminal. Single-sequence rejects direction. No seek or paused-frame fabrication.
Observed check272/scope2/Editor consumer verify incl UI/TS/Vite exit0; same warnings.
Finite real8-page clip: stopped→play→300ms→pause→Step500 retains300/frame2;
direction7 retains300 selects0110; resume+150→450; negative/NaN reject; stop→0;
disposed commands reject. SPRITE_PLAYBACK_OBSERVED (manual canonical snapshots),
not FRAME_BOUND/UI/PIXELS. No borrowed Project/Scene/cache disposed. Next v0.18.5.
