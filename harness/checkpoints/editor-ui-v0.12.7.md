# v0.12.7 — Standard Panel Components

Status: IMPLEMENTED. Finite browser observations below do not establish full
feature, visual or Phase 12 acceptance; those remain Developer-owned.

## Preflight and ownership

- Baseline: `5c3bc36` (v0.12.6), branch
  `feat/editor-ui-foundation-v0.12`; no associated/open PR at inspection.
  Re-audited current shell, theme, policies and mandatory UI checker rather than
  relying on the task's historical baseline. Pre-existing untracked `.mcp.json`
  is unchanged and excluded from this checkpoint commit.
- Read root/project AGENTS, ARCHITECTURE, harness OWNERSHIP/WORKFLOW/VERIFICATION,
  Editor manifests/tsconfigs/public root, current shell/app/catalog/theme and
  foundation/component/styling policies; inspected installed public Mantine types.
- Requested behavior: one reusable Panel composition, constrained body scrolling,
  consistent feedback/actions/sections and integration into three shell slots.
- One canonical primary production owner: **editor**. No production collaborator
  requires changes. Harness owns this checkpoint record only.
- Reuse: React state/useId; Mantine Paper, Stack, Group, Box, Title/Text, Divider,
  ScrollArea with public viewportProps, Alert/Loader, Button and Fieldset/TextInput;
  existing sole Editor theme/provider and token aliases. The shell continues to
  use Mantine Modal focus handling and its public content/body Styles API.
  Public ScrollArea documentation was checked alongside installed Mantine 9.7.3
  types. No icon dependency is approved, so demo actions use named Buttons rather
  than fabricated ActionIcons.
- External L1/L2, portable Editor, viewport-host and Runtime/Render APIs consumed:
  **none**. Public exports, business schemas and contracts: **no delta**.
- Expected gates: architecture check, editor-only scope with checkpoint infra,
  and genuine Editor verify (UI checker, portable tsc, UI tsc and Vite bundle).

## Scope and approved shell delta

Original scope: components/panel, app, Panel CSS, component docs and checkpoint.
The optional flat CSS filename is reconciled with the already locked
`styles/panel/**/*.module.css` category; no policy/checker/allowlist was changed.

A concrete browser repro showed the former shell dock ScrollArea let the entire
Panel grow: at 1440×900, Navigator was about 2424 px tall and its body had equal
client/scroll height of 2231 px; the footer lay outside the dock. The whole Panel,
including header/footer, would scroll. Developer explicitly approved the minimum
additional paths `layout/EditorShell.tsx` and `styles/layout/shell.module.css`:
"Cho phép delta shell tối thiểu". The change removes outer dock ScrollAreas and
makes full-screen Modal content/body constrained flex containers. Main workspace
scrolling, shell ownership, theme and public APIs are unchanged.

Seven files in this checkpoint:

- `editor/ui/src/components/panel/EditorPanel.tsx`: sole Panel primitive and its
  internal readonly typed props/state union; no portable export or prop forwarding.
- `editor/ui/src/styles/panel/panel.module.css`: structural flex/shrink/overflow
  containment only; no decoration, raw controls, global/private selectors or tokens.
- `editor/ui/src/app/App.tsx`: Navigator actions/long sample, Inspector feedback/
  read-only Properties, and explicit bottom Status variant. All are labeled local
  presentation examples; no authored data, IO, timers or domain commands.
- `editor/ui/src/layout/EditorShell.tsx`: only the approved scrolling delta above.
- `editor/ui/src/styles/layout/shell.module.css`: Modal content/body layout only.
- `editor/docs/ui-components.md`: typed composition, state/readonly responsibilities,
  scrolling, nesting/sections, interactive-title and CSS escape rules.
- This checkpoint.

Zero cross-project production delta. No dependency/manifest/lockfile, root config,
CI, Harness implementation, `editor/src/**`, theme or foundation-policy changes.

## Panel contract and layout

Required text title, optional subtitle/actions/footer, children, discriminated
ready/empty/loading/error state, readOnlyReason and standard/status variant.
The title names its section; subtitle describes it; scroll bodies are named and
keyboard-focusable. Mantine controls own interaction. Header/footer sit outside
the ScrollArea; titles are text and actions have visible names.

Standard Panels fill a constrained flex slot with zero minimum block/inline
sizes. The status variant deliberately uses intrinsic height and compact text
feedback in the bottom slot. Keep status content short; histories belong in a
standard Panel. Existing tokens/theme determine spacing, colors and borders.

Feedback changes hide the children's existing React position instead of replacing
it; body scrolling never mounts/unmounts children. This is not disposal or a
viewport lifecycle policy. Responsive dock/dialog relocation still remounts slot
content as documented by the shell; example state lives above it in App. No live
viewport is connected. Read-only feedback is explanatory; callers must set field
readOnly and enforce actual command authorization themselves. The demo field is
readable/copyable, not disabled. No docking manager, persistence, independent
Inspector domain state machine, form framework or per-feature Panel wrappers.

## Actual final gates

- `node harness/cli.mjs check`: ARCH_CHECK_PASS; 192 JS/TS source files inspected.
- `node harness/cli.mjs scope --projects editor --allow-infra`: SCOPE_PASS.
- `node harness/cli.mjs verify --projects editor`: BUILD_PASS and verification
  pass, including UI_CONTRACT_PASS (8 source files, 2 authored stylesheets,
  0 errors, 0 manual-review warnings), portable TypeScript build, UI typecheck
  and Vite production bundle (865 modules).
- UI build is already in verify; no redundant final separate build was needed.
- `git diff --check`: clean. No unconfigured or failed final build.
- Nonblocking diagnostics: Vite bundle-size advisory (517.48 kB JS, 159.10 kB
  gzip), and Harness process-launch Node DEP0190 warning. No toolchain changes
  were made to suppress these diagnostics.
- No unit/integration/browser/visual test files, runner or suite added or run.

## Finite browser observations — 2026-10-24

Direct local Vite navigation, keyboard, accessibility/DOM inspection and two
visually inspected screenshots; these are bounded manual evidence, not a test
suite. Browser artifacts are outside the repo at
`C:\Users\admin\AppData\Local\Temp\rpg-editor-panel-v0.12.7-browser-evidence`.
Dev server and browser were stopped after observation.

- 1440×900, long Navigator: dock Panel about 255×684, body client height 504,
  scroll height 2231. Focused body + End moved scrollTop to 1727. Header remained
  y≈88.8 and footer y≈726.4; document extent remained 1440×900. Workspace width
  was 928 with a 904-wide placeholder. No canvas/renderer exists in this demo.
- 390×844, Navigator dialog: dialog 390×844; Panel 358×768, body client height
  609 / scroll height 1622. End moved scrollTop from 0 to 1013 while header
  remained y=61, footer y≈782.7, dialog scrollTop and page scrollY remained 0.
  Escape removed the dialog and restored focus to Open navigator. Document
  extent remained 390×844. Desktop/mobile final screenshots were inspected.
- 1024×768: Navigator remained docked, Inspector accessible through its opener;
  main was 768×552, Navigator body height 372; document extent 1024×768.
  Open inspector showed the read-only example in the full-screen dialog.
  Resizing to desktop removed the dialog and left one Inspector heading in dock.
- Inspector examples were observed as empty, loading with explanatory pending
  text, error, and read-only Properties. The last field had readOnly=true and
  disabled=false. Loading/error are explicitly illustrative, not actual work.
- Clearing the illustrative Status error replaced its alert with
  `No project connected · Guidance shown`; the action changed to Show sample error.
- 390×320: no page-level overflow; main was about 390×36 and workspace scrollport
  366×12. The intrinsic header/status consume most of this very short window;
  useful workspace visibility at such heights remains a product-review limitation.
- Console: existing favicon.ico 404 only; no observed application exception.

## Handoff and limits

IMPLEMENTED; public contract delta **none**; no missing owner API or blocker.
FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED remain applicable to full Developer
acceptance: observations cover the static demo at listed sizes, not all content,
devices, zoom, assistive technologies or production deployment. No Render host,
gameplay, authoring workflow, resource lifecycle or persistence is verified here.
No next checkpoint capability, push, PR, merge, publication or final phase
acceptance is included. The next task should consume this single Panel contract
and preserve the documented owner/lifecycle and CSS boundaries.
