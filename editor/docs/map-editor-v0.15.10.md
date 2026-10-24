# ME11 — Map UI integration

Parent c35eefe, Editor is the sole production owner. App selects Map or Asset
workspace inside the existing Shell; Map controller remains mounted above panels.
Existing Project/Asset controllers, root grants, Document sessions and public Map
operations own state. No new export, schema, stylesheet, dependency or theme change.

Map panel exposes explicit create/open/save/discard, profile values, layer visibility
and order, selected Asset Browser background/tile binding and numeric cell editing.
Candidates validate before session replacement; errors display without adoption.
Project/asset/map saves remain separate. One held document must be explicitly closed
before opening another; project changes clear input/selection drafts, retain the
held session and hide it in another project. Pending reads check captured project,
root and catalog; stale open results are discarded. Unsaved unload warns.

MapViewport uses existing Viewport acquisition/resize/frame host, Render public
scene/layers/cache/camera APIs and ScenePreviewBridge. Same-project authorized
image bytes/revisions are required. No CSS/Canvas renderer or gameplay arithmetic.
Edits remount the preview and require acquisition again. Bridge, camera binding,
camera, scene and cache release through their respective owners on teardown.

Observed gates: check (239 files), scope, verify editor with consumers, ui:check
(16 sources/3 stylesheets, zero errors/warnings) and UI TS/Vite build exit0.
git diff --check exit0. Build warns about existing bundle size and Node DEP0190.
Source inspection confirms controls invoke existing Map APIs, including the cell
bounds gate; it is not an observed browser interaction. Previous ME07/ME10 finite
API/IO observations remain the behavioral evidence for those operations.

Browser inventory returned no surfaces; creating an iab tab returned
`Browser is not available: iab`. UI_FUNCTIONAL_NOT_VERIFIED / VISUAL_NOT_VERIFIED.
Create/Save/Open clicks, OOB feedback, switching projects, responsive shell and
native Render pixels remain Developer manual acceptance. Next ME12 finite MVP.
