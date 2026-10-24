# VP11 — v0.17.10

Parentdbb87da86f213fb7c6280265c8847fcb345036eb; branch feat/visual-object-placement-v0.17.
[Task](../../editor/docs/tasks/phase17-visual-object-placement/rpg-platform-v0.17.10-placement-preview-viewport-integration-task.md).
Editor-only thin preview adapter/index/checkpoint. Actual Phase16 VisualViewport
already owns existing Viewport content lifecycle, public Render scene/cache/camera
and ScenePreviewBridge, observed source revisions, Map layers and typed Visual
presentation. Reuse that component at VP12; no second renderer or host/RAF.
Additive syncVisualPlacementPreview lets explicit existing-bridge consumers sync a
strict current Scene with Phase16 presentation overrides. Null bridge explicitly
returns RENDER_SESSION_NOT_ACQUIRED. Bridge owns correlation/update/removal/drain,
helper owns no Render/cache/session handles. Host serializes batches and closes
bridge on context changes; UI existing contentFactory remount drains its own bridge
and reacquires on edited envelope. Unknown/nonvisual/VFX playback never invented.
Numeric input only; click/picking NOT_SUPPORTED. No Render/foundation/other owner
change. Next v0.17.11. GPU/PIXELS/PREVIEW_NOT_OBSERVED until a real acquired host.
Observed check266/scope4/Editor consumer verify incl UI/TS/Vite exit0. Finite built-root probe exit0: canonical PNG descriptor + scoped spatial description for npc-1, null bridge reports unavailable/RENDER_SESSION_NOT_ACQUIRED with no policy invocation or revision change. No live bridge/GPU/preview observation. Existing warnings only; .mcp.json excluded.
