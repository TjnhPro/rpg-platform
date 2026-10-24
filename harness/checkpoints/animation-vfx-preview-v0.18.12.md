# AP13 — v0.18.12

Parent cd82b7c; branch feat/animation-vfx-preview-v0.18.
[Task](../../editor/docs/tasks/phase18-animation-vfx-preview/rpg-platform-v0.18.12-minimal-working-animation-vfx-preview-ui-mvp-task.md).
[Recipe and finite evidence](../../editor/docs/animation-vfx-preview-v0.18.12.md).

Editor only: feature Panel/controller/finite-sample plus App composition and the
explicitly Developer-approved exact adapter allowlist in check-ui-contract.mjs.
No root API/schema/dependency, protected production owner, Shell/theme/CSS delta.
Stable Workspace holds transient controls; one active existing Viewport owns its
acquired session. Package-root handles and emitted internal adapters share state.

Actual final commands: harness check (283 sources), Editor scope --allow-infra,
verify --projects editor --with-consumers, ui:check (24 sources) and ui:build;
exit0. BUILD_PASS/UI_BUILD_PASS, with existing Vite chunk-size/Node DEP0190 warnings.
No generated test suite. Browser smoke used finite commands, not committed tests.

SOURCE_LOADED/FRAME_BOUND and canonical SPRITE_PLAYBACK_OBSERVED/VFX_PLAYBACK_OBSERVED
for the finite real-source flows in the recipe. Sprite screenshot directly viewed;
full PIXELS/UI/Scene alignment acceptance remains open. B isolation/paused Step
are negative evidence; late pending-context guard was observed in AP02/AP09.
Real in-Scene UI and actual loss/visibility UI transitions NOT_CHECKED.
Final small cleanup correction reports stored context cleanup uncertainty and
stops the playback clock before completed-state diagnostics. Next v0.18.13.
