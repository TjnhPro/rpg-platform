# v0.12.6 — Editor Application Shell

Status: IMPLEMENTED. Finite browser observations recorded below; final feature,
visual and Phase 12 acceptance remain Developer-owned. No MVP_PASS or merge claim.

## Preflight and ownership

- Baseline: `1830517` (v0.12.5), branch
  `feat/editor-ui-foundation-v0.12`; no associated/open PR at inspection.
  v0.12.1–5 source, theme, component defaults and mandatory UI checker are present.
  The pre-existing untracked `.mcp.json` was left unchanged and excluded.
- Read root/project AGENTS, ARCHITECTURE, harness OWNERSHIP/WORKFLOW/VERIFICATION,
  current Editor manifests/tsconfigs, public root, UI entry/catalog/theme, foundation
  decisions, component/styling policy and installed Mantine public types/source.
- Feature: a reusable application shell with six actual regions, responsive panel
  access, constrained workspace sizing and transient demonstration controls.
- One canonical primary production owner: **editor**. No production collaborator
  needs modification. Harness owns only this checkpoint record.
- Reuse: React state/refs/effect; Mantine AppShell static grid, Box/Group/Stack,
  ScrollArea public `content` Styles API, Modal focus management, Button/Switch,
  useMantineTheme/useMediaQuery and the existing Editor theme/token index.
- External L1/L2, Editor domain, viewport-host and Runtime/Render APIs consumed:
  **none**. Portable package exports, business schemas and contracts: **no delta**.
- Expected gates: architecture check, editor-only scope with checkpoint infra,
  and genuine Editor verify. Its locked build already includes ui:check,
  portable TypeScript build, UI typecheck and Vite production bundle.

## Changed files and internal composition

- `editor/ui/src/layout/EditorShell.tsx`: the only AppShell implementation.
  Internal readonly ReactNode slots: header, toolbar, navigator, inspector, status
  and workspace children. These are not re-exported from the portable package.
- `editor/ui/src/app/App.tsx`: mounts the shell demonstration with labeled empty
  Navigator/Inspector and viewport placeholder. Focus workspace moves keyboard
  focus to main; Show guidance changes only local presentation/status text.
  Existing ComponentCatalog remains unchanged. No fake business command.
- `editor/ui/src/styles/layout/shell.module.css`: necessary layout mechanics,
  described below; no component decoration, global selectors or theme changes.
- This checkpoint. No manifest, dependency, lockfile, root config, CI, Harness
  implementation, `editor/src/**` or other production-project change.

## Layout, keyboard and CSS rationale

AppShell owns the grid and all region placement. Header/footer use intrinsic
height and wrapping Mantine Groups. Each docked sidebar has a static width of
eight existing `--mantine-spacing-xl` units (256 CSS pixels at the current theme),
not a new token palette. No resize handles, docking, persistence or absolute
positioning of individual regions.

- At/above theme `lg`: both sidebars are docked.
- Between theme `md` and `lg`: Navigator docked; Inspector opens from toolbar.
- Below theme `md`: both sidebars hidden; independent toolbar buttons open their
  contents in one full-screen Mantine dialog. At most one dialog is open. A
  panel returning to its dock closes the temporary dialog. Contents mount only
  in their current dock/dialog location; consumer-owned state must live above
  these slots if it must survive responsive remounts.
- Tab reaches toolbar controls; Enter/Space activates them. Modal traps focus,
  Escape/Close panel closes it and returns focus to its opener. Collapsed docks
  use responsive display plus inert and contain no mounted slot contents.
- Main has an accessible name and programmatic focus target. Each dock/workspace
  ScrollArea has a labeled keyboard-focusable viewport. Full-screen panel dialog
  scrolling/scroll lock is owned by Mantine; no custom browser lifecycle.

The task's optional flat `styles/layout.module.css` filename is reconciled with
the already locked ST-04/05/06 path `styles/layout/**/*.module.css`: the module
uses that existing shell category. No new CSS category, exception, allowlist or
checker/policy edit. Exact mechanics:

- `.shell`: `position: fixed; inset: 0; min-inline-size: 0; overflow: hidden` on
  an outer Mantine Box. AppShell static mode is parent-sized and does not establish
  a viewport-sized root. This anchors only the outer application boundary without
  global html/body/root resets; all regions remain AppShell's ordinary grid flow.
- `.region`: `min-inline-size: 0; min-block-size: 0; overflow: hidden` on docked
  sections/main. Box props do not expose overflow. Grid content can shrink while
  its existing ScrollArea owns scrolling rather than the document body.
- `.workspaceContent`: `display: flex; flex-direction: column;
  min-block-size: 100%` via ScrollArea's public content class slot. Default table
  content sizes to its children; the documented structural hook lets placeholder
  flex fill the actual available viewport and still overflow locally when needed.

No private selectors/variables, raw controls, authored inline style objects,
colors, arbitrary spacing/radius scale, canvas or Render host. An initial local
`100dvh` declaration was rejected by the unchanged checker; it was removed in
favor of the structural viewport-boundary composition above before verification.

## Actual gates

- `node harness/cli.mjs check`: ARCH_CHECK_PASS; 191 JS/TS source files inspected.
- `node harness/cli.mjs scope --projects editor --allow-infra`: SCOPE_PASS.
- `node harness/cli.mjs verify --projects editor`: BUILD_PASS / verification pass;
  includes UI_CONTRACT_PASS (7 source files, 1 authored stylesheet, 0 errors,
  0 manual-review warnings), portable tsc, UI tsc and Vite (863 modules).
- UI build is already in verify; no redundant separate build was required.
- `git diff --check`: clean. No unconfigured/failed final build.
- Nonblocking diagnostics: Vite bundle size advisory (512.70 kB JS, 157.55 kB
  gzip) and Harness process-launch Node DEP0190 warning. No unrelated toolchain
  changes were made to suppress them.

## Finite browser observations — 2026-10-24

Observed directly against the local Vite app using browser navigation, inspection,
keyboard and screenshot tools. No test files, runner, fixtures, snapshots suite
or assertions added to the repository. Screenshot inspected at 1440×900.

- 1440×900: all six regions visible; Header ends at y≈88, sidebars are 256 wide,
  Main is 928×771, placeholder fills 904×747, footer ends at y=900. No region
  overlap or document scrollbar observed.
- 1024×768: Navigator remains docked, Inspector collapses with its toolbar opener;
  placeholder is 744×615. Document extent equals the viewport.
- 390×844: both docks hidden, toolbar wraps, placeholder is 366×643 and footer
  remains visible. Tab/Enter opened Navigator; Tab cycled within the dialog;
  Escape removed it and returned focus to Open navigator. Tab/Space opened
  Inspector. The dialog occupied 390×844. Resizing an open Inspector to desktop
  removed the dialog and left exactly one Inspector heading in its dock.
- 390×320: Workspace client height 119, content height 182. Focus workspace,
  Tab, End moved workspace scrollTop to 63 while page scrollY stayed zero;
  document extent remained 390×320.
- Show guidance toggled placeholder instructions and status text together.
- Browser console had a favicon.ico 404 from the existing entry, with no observed
  application exception. This task does not add icons or edit entry metadata.

## Handoff and limits

IMPLEMENTED; public contract delta **none**; no missing owner API or blocker.
FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED remain applicable to full Developer
acceptance: observations cover this static shell only, not all devices, zoom,
assistive technology, long future business-slot contents or production deployment.
No Render/canvas, domain workflow or persistence is functionally verified here.
No new shared Panel or subsequent task capability implemented. No push, PR,
merge, publication or final phase acceptance is part of this checkpoint.
