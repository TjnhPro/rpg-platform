# AP06 — v0.18.5

Parent0f254a3; feat/animation-vfx-preview-v0.18.
[Task](../../editor/docs/tasks/phase18-animation-vfx-preview/rpg-platform-v0.18.5-playback-configuration-task.md).
Read previous checkpoint/task/HEAD and Render immutable timing/transport APIs.
Editor-local config collaborator only, root unchanged. FPS XOR interval uses Render
validation; preview interval1000/120..10000ms and speed0.125..4, supplied delta0..60000
scaled exactly once. No second elapsed or source FPS claim. Configuration builds
fresh canonical clips/playback stopped at0; caller unbinds/disposes replaced owned
controller. No Render setters or authored state changes.
Observed check273/scope2/Editor consumer verify UI TS/Vite exit0, same warnings.
Finite actual8-page clip:200ms at0.5/1/2→100/200/400 and frames1/2/4. 10FPS and100ms
equivalent. Zero/both timing/NaN speed reject. Once completes, disposed then fresh
repeat controller stopped0. UI/RESOURCE/PIXELS_NOT_VERIFIED. Next v0.18.6.
