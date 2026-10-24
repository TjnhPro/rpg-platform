# AP12 — v0.18.11

Parent1d1131b; branch feat/animation-vfx-preview-v0.18.
[Task](../../editor/docs/tasks/phase18-animation-vfx-preview/rpg-platform-v0.18.11-preview-scheduling-visibility-lifecycle-task.md).
Evidence-backed optional availabilityChanged seam in existing viewport host:
feature otherwise cannot observe Suspend/loss/zero extent and could keep logical
time advancing. Native submission/resize ownership unchanged. Optional playback
clock lives with viewport host scheduling; UI feature imports that seam only.
One pending playback callback, bounded monotonic delta<=100ms, no idle interval,
async presentation serial, generation cancellation, explicit resume/no catch-up.
Initial ui:check rejected feature-local RAF (EC-05); relocated scheduler to existing
owner, no checker bypass. Final check280/scope4/Editor consumer verify exit0,
UI contract21 sources/TS/Vite pass. Finite real browser host/Render sequence:
playing316.9ms; pause100ms and unavailable200ms both stay316.9; explicit resume
~100ms yields417.2. Host submitted27 demands. Dispose: clock closed, not running,
no pending callback, host unmounted, failures[]. Actual tab hide/loss UI interaction
NOT_CHECKED; source host notifications cover suspension paths. Earlier finite
context/resource probes cover late A/B publication and lease draining.
No root API/schema/dependency delta. Next v0.18.12.
