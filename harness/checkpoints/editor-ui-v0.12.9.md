# v0.12.9 — Minimal Working Editor UI Foundation MVP

Status: IMPLEMENTED. Public contract delta: **none**. Full feature/visual and
Phase 12 acceptance remain Developer-owned; no MVP_PASS/READY_TO_MERGE claim.

## Preflight and ownership

- Baseline `739d7a2` on `feat/editor-ui-foundation-v0.12`. Git history contains
  the individual v0.12.0–8 checkpoint commits. No associated/open PR at inspection.
  Pre-existing untracked `.mcp.json` is unchanged and excluded.
- Read root/project AGENTS, ARCHITECTURE, harness OWNERSHIP/WORKFLOW/VERIFICATION,
  Editor manifests/tsconfigs, current portable root, App/catalog/theme/Panel/shell
  and viewport adapter, styling policy and v0.12.8 evidence. Current source takes
  precedence over the task's historical baseline. The actual package already has
  React/Mantine, UI gate/build/dev/preview and the real viewport integration.
- Feature → canonical primary production owner: **editor** owns this UI-only
  composition, presentation examples and manual instructions. No production
  collaborator needs a change; harness owns this checkpoint record only.
- Reuse the existing single MantineProvider/theme, ComponentCatalog, EditorPanel,
  EditorShell and Viewport. Same-project host seam remains
  `mountEditorViewport(target, notify)`; adapter commands remain `getSnapshot`,
  `start`, `requestFrame`, `suspend`, `resume`, `unmount`. The unchanged host
  consumes Render's public root; no GPU, resize or gameplay logic is copied.
- External L1/L2 APIs consumed: none. No public export, business API, Asset/Scene/
  Document/Runtime/Render schema, owner or boundary change. Allowed paths:
  `editor/ui/**`, `editor/docs/ui-mvp.md`, this checkpoint; no dependency/lockfile
  change needed. Expected gates: architecture check, editor scope with checkpoint
  infra, genuine Editor verification including UI check, portable tsc, UI
  typecheck and Vite bundle.

## Changed files

- `editor/ui/src/app/App.tsx`: one existing shell with three standard Panel
  regions and the existing center viewport. Inspector now embeds the existing
  interactive catalog and provides pressed Mantine Buttons for Controls/Panel
  states. Panel examples are a readonly typed EditorPanelState list; Navigator
  paragraphs use typed readonly UI sample records, never domain records.
- `editor/ui/src/components/ComponentCatalog.tsx`: embedded section rather than
  a second main landmark; h3/h4 headings within the Inspector's h2. Existing
  buttons/inputs/tabs/menu/confirmation/feedback behavior is reused, not copied.
  Confirmation registers a unique stackId with Mantine's modal coordination.
- `editor/ui/src/layout/EditorShell.tsx`: actual narrow-layout defect found during
  this task: Escape with sample confirmation open closed both it and Inspector.
  Shell now provides Mantine Modal.Stack and registers its panel dialog with a
  useId-derived stackId. No shell prop, layout, CSS, theme, public package API or
  ownership change. Mantine handles modal order, focus and Escape; no custom DOM
  listener/keyboard workaround. Official [Modal.Stack documentation](https://mantine.dev/core/modal/)
  and installed Mantine 9.7.3 Modal/ModalStack source informed this scoped fix.
- `editor/docs/ui-mvp.md`: actual dev/preview commands, finite manual scenarios,
  expected outcomes, theme-token exercise, viewport/dependency distinctions and
  explicit evidence gaps. Catalog state resets at its mount boundary are
  documented; no store or persistence is introduced.
- This checkpoint. No authored stylesheet, theme token/default, UI checker,
  manifest, lockfile, portable `editor/src/**`, root configuration, Harness code,
  test/runner or cross-project production delta. Temporary radius change was
  restored before the final build; only the existing theme engine is used.

## Actual gates

- **STATIC_PASS**: `node harness/cli.mjs check` → ARCH_CHECK_PASS, 193 JS/TS
  source files. `scope --projects editor --allow-infra` → SCOPE_PASS. UI checker
  → UI_CONTRACT_PASS, 9 source files, 3 authored stylesheets, 0 errors and
  0 manual-review warnings. Static source compliance is not behavioral proof.
- **BUILD_PASS**: `node harness/cli.mjs verify --projects editor` genuinely
  compiled the portable package and browser application, including UI check,
  UI typecheck and Vite production build (925 modules). A standalone `ui:build`
  also passed during development. No failed/unconfigured final build.
- Final bundle: UI 543.90 kB / 166.99 kB gzip; existing dynamically acquired
  Three backend 536.85 kB / 134.44 kB gzip. Nonblocking Vite >500 kB advisory
  and Harness Node DEP0190 process-launch warning remain. `git diff --check`
  is clean. No suites, test counts, browser runner or retained diagnostic script.

## Finite manual observations — 2026-10-24

**UI_INTERACTION_OBSERVED** using local Vite dev (`http://127.0.0.1:5173/`) with
StrictMode and the built preview (`http://127.0.0.1:4173/`). Browser snapshots,
individual interactions, bounded DOM/native diagnostics and screenshots were
used; no automated suite was created. Browser and both servers were stopped.
Artifacts are outside the repo:
`C:\Users\admin\AppData\Local\Temp\rpg-editor-ui-mvp-v0.12.9-browser-evidence`.

- Start sample operation disabled its fields and submit button, enabled Finish,
  and exposed pending guidance. Finish produced local-only completion feedback.
  Empty Sample text then Start produced aria-invalid=true, a labeled correction
  and operation-not-started status. Unavailable actions stayed disabled.
- Menu displayed a disabled item; Show sample error selected Feedback patterns
  and exposed the illustrative alert. Remove confirmation initially focused
  Cancel; confirm/restore changed only the temporary sample entry. Shared Panel
  empty/loading/error/read-only states and active mode presentation were observed.
- Changed only `editorTokens.radius` from sm to md: computed Button/TextInput/
  Panel Paper radii all changed 4px → 8px. Restoring sm returned all to 4px.
  Theme HMR reloaded temporary state; no second provider/theme engine was added.
- 1440×900: canvas CSS 904×474.42, native buffer 904×474 at DPR 1. Navigator
  body scrolled to 1727 (504 client / 2231 total); Inspector to 907 (504 client /
  1411 total). Headers/footers stayed outside body scroll. Same canvas remained
  through Inspector mode changes and panel scrolling; document extent 1440×900.
- 390×844: same center canvas, CSS 366×127.16, native 366×127, document extent
  390×844. Controls wrapped and both docks became accessible dialogs. Narrow
  Inspector body/confirmation were reachable. Before fix, Escape closed both
  dialogs; after Modal.Stack fix, first Escape left Inspector open, second closed
  it. Focus remained inside Inspector after confirmation closed and returned to
  Open inspector after panel close. Desktop/narrow screenshots were inspected.
- Real Acquire reached graphics ready / viewport active; explicit Frame changed
  submissions 1 → 2. Suspend/Resume returned to active. CDP DPR 2 plus layout
  resize: CSS 906×474.42, native 1812×948, requested DPR 2 (applied once). A first
  short-lived CDP session detached before observation and yielded DPR 1; the
  recorded DPR 2 observation was read while its override remained active, then
  override cleared. No real monitor/zoom claim.
- Requested native context loss on the existing real WebGL2 context. UI exposed
  graphics failed / terminal and CONTEXT_LOST, disabled Frame/Resume/Acquire,
  and did not retry. Explicit Unmount removed the canvas; Mount/Acquire created
  a fresh usable session. Final healthy dev Unmount observed graphics disposed /
  terminal and zero canvases. This is not GPU memory/leak proof.
- Built production preview independently opened the shell, acquired real graphics
  and submitted a Frame (2 submissions, CSS 904×474.42/native 904×474). Its
  screenshot was inspected and target explicitly unmounted before closing.
- Console: favicon.ico 404; no observed application exception. Native context
  loss was intentional. A package rebuild while dev was open caused Vite HMR
  refresh activity; the independent preview observation used the finished bundle.

**WEBGL_PIXELS_OBSERVED**: inspected dev and production-preview screenshots show
the existing backend's solid blue clear canvas with shell/controls. This is pixel
evidence beyond a status receipt, limited to clear frames. No Scene, animation,
VFX, sprite, authored document or gameplay rendering is implied. UI's conservative
Display: NOT_VERIFIED label remains unchanged.

**NOT_OBSERVED**: unavailable-WebGL2/backend-import/cleanup failure paths; actual
monitor/zoom/DPR-only event delivery; hidden-tab/zero-height scenarios in this
checkpoint (v0.12.8 records its own earlier observations); GPU memory reclamation,
exhaustive leak checks, all-device/browser/a11y/visual acceptance and deployment.
No product editing, persistence, resource workflow or full business Editor MVP
is implemented or verified. FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED remain
for full Developer acceptance, independently of the bounded observations above.

## Handoff

No missing owner API or blocker. Existing host/Render lifetime and explicit
resume policy remain canonical. Next checkpoint must use current source and
retain these evidence limits. This task adds no v0.12.10 capability, push, PR,
merge, publication or final phase acceptance.
