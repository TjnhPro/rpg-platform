# Editor UI v0.12.3 — component usage and default rules

Status: IMPLEMENTED; ARCH_CHECK_PASS; SCOPE_PASS; BUILD_PASS;
FEATURE_NOT_VERIFIED; VISUAL_NOT_VERIFIED. Developer acceptance remains open.
No UI_PASS, MVP_PASS or READY_TO_MERGE claim.

## Preflight and current baseline

- Branch: `feat/editor-ui-foundation-v0.12`; base checkpoint v0.12.2 at
  `cb48eeb3cb2ae486e7a55b57dbcbd6c155efab0c`. No associated/open Phase12 PR at
  preflight. Continue this branch and the single-phase-PR workflow; do not create
  a separate branch or PR per capability.
- Feature: prescribe direct Mantine component usage and central defaults, with
  one static manual catalog of real controlled inputs/actions/feedback.
- One canonical primary production owner: **editor**. Harness holds this report
  only. No other production collaborator or L1/L2 API is required.
- Read root/project AGENTS, ARCHITECTURE, OWNERSHIP, WORKFLOW, VERIFICATION,
  Editor package/tsconfig, UI configuration, v0.12.0/1/2 source/contracts and
  current portable root. Route returned Editor as a hint; source determines scope.
- Actual baseline already has React19.3.1, Mantine9.7.3, Vite8.3.5, a single
  theme/provider and a UI build mandatory within the Editor build. This supersedes
  the supplied task's historical pure-library baseline. No install is needed.
- Reused APIs: Mantine component.extend/defaultProps, Button, ActionIcon theme
  defaults, Input/TextInput/Textarea/NumberInput/Select/Checkbox/Switch, Tabs,
  Menu, Modal, Notification, Alert, Fieldset, Box, Stack, Group, Text and Title;
  React useState/useId and form event handling. Installed public declarations
  and official documentation were consulted. Existing editorTokens are retained.
- Scope: theme defaults, catalog composition, minimal App/entry wiring,
  ui-components documentation and this checkpoint. Expected gates: check,
  scope with Editor + infrastructure, verify Editor including ui:build.
- Public package/domain contract delta: **none**. No schema, business export,
  cross-project API, foundation or dependency-direction change. No consumer
  adjustment/build is needed. No upstream API blocker identified.

## Exact seven-file checkpoint scope

1. `editor/docs/ui-components.md` — need/component/props/feedback/forbidden
   decision table; defaults, action intent, ActionIcon, loading/error, placeholders,
   labels/validation, confirmation, file-control approval boundary and manual recipe.
2. `editor/ui/src/components/ComponentCatalog.tsx` — one presentation-only catalog
   using direct Mantine controls and transient React state.
3. `editor/ui/src/theme/theme.ts` — sm defaults for supported controls, native
   variants, Menu/Tabs/Modal behavior defaults and Notification/Alert feedback
   defaults, all within the existing theme and semantic tokens.
4. `editor/ui/src/theme/ThemeSample.tsx` — remove the superseded minimal sample.
5. `editor/ui/src/app/App.tsx` — mount the catalog as the internal app sample.
6. `editor/ui/src/main.tsx` — remove the older sample import/mount; retain the
   existing sole provider, dark scheme and nonpersistent manager unchanged.
7. `harness/checkpoints/editor-ui-v0.12.3.md` — this evidence and handoff.

No CSS, dependencies, icon package, custom control wrapper, generic form library,
store, feature form, shell/Panel or viewport work. No next checkpoint implemented.
Pre-existing untracked `.mcp.json` is local configuration, unchanged and excluded.
The task's tracked changes are committed; this unrelated untracked file remains.

## Source-level behavior and limits

- Catalog includes primary/neutral/destructive/disabled/loading Button states,
  controlled labeled TextInput/NumberInput/Select/Checkbox/Switch, named controlled
  Tabs and Menu, a controlled titled Modal, dismissible success/error Notification,
  live status and empty/unavailable/invalid/disabled feedback examples.
- The semantic sample form uses Mantine Box as a polymorphic form host and
  Stack/Fieldset for layout. Submit performs only demo required-field and integer
  checks. It preserves input, guards re-entry and holds loading until the explicit
  Finish sample operation action. No timer, IO, save, authored data or game rule
  is involved; text discloses these limitations.
- Confirmation Cancel receives data-autofocus. Close/Escape/cancel handlers only
  close the Modal; explicit confirmation changes one temporary sample flag. A
  restore action makes the example repeatable. Mantine owns focus/overlay behavior.
- No approved icon set exists here, so ActionIcon is documented/defaulted but
  not populated with an invented glyph; examples use text Button labels. Mantine
  built-in control indicators are retained.
- Native intent variants are filled/default with semantic error color for a
  destructive action. No invented primary/destructive variant or fake size prop:
  Tabs/Menu/Notification lack a control-size API; Modal.size means dialog width.
- Exactly one createTheme and one MantineProvider remain. All control styling
  inherits theme; layout uses existing token aliases. Source scan found no new raw
  controls, inline style overrides, storage, timer or frame scheduling APIs.
- No Editor/Render/Engine business API is consumed by the catalog; the portable
  Editor root and all authored/Runtime/Render semantics remain unchanged.

## Actual automatic gates and scope audit

- `node harness/cli.mjs check`: exit 0; ARCH_CHECK_PASS, 189 JS/TS source files
  inspected. Static boundary inspection is not interaction/accessibility proof.
- First `node harness/cli.mjs verify --projects editor`: BUILD_FAIL, UI typecheck
  rejected Stack's div event type for a form handler and native type props in
  Button/ActionIcon theme defaultProps. Corrected with polymorphic Box form host
  and Mantine's existing native button-type behavior. No cast, suppression,
  compiler-option or dependency change was used.
- Corrected `node harness/cli.mjs verify --projects editor`: exit 0; BUILD_PASS
  [editor]. Actual `tsc -b --force` → UI `tsc --noEmit` → Vite8.3.5 production
  bundle, 862 modules. Output: index.html 0.45kB, CSS 248.44kB, JS 493.69kB as
  displayed by Vite. Ignored artifacts are excluded. ui:build is already mandatory
  in verify; no redundant separate UI build was needed.
- Unchanged Harness launcher emitted Node DEP0190 deprecation warning; the final
  build still exited 0. No failed or unconfigured required project build remains.
- All 42 pre-existing Editor emitted declaration files SHA256-compared before and
  after: zero changes. Diff against v0.12.2 shows zero other-project production,
  editor/src, package/lockfile, compiler config, Harness CLI/config or public export
  delta. The checkpoint path and minimal app wiring are explicitly scoped above.
- `node harness/cli.mjs scope --projects editor --allow-infra`: exit 0; SCOPE_PASS.
  Final scope includes seven checkpoint files plus pre-existing untracked
  `.mcp.json`; staged audit excludes that local file. `git diff --cached --check`
  is clean before committing this single capability.

## Manual evidence and handoff

No browser interaction, screenshot or visual review was performed. No tests,
browser automation suite, runner or coverage were added/run. Actual rendered
states, keyboard/focus restoration (including Menu → Modal), screen-reader
announcements, form interaction, contrast and responsive readability remain
FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED. Build/source evidence cannot replace
Developer manual review or phase acceptance. No behavioral PASS is asserted.

Developer can run `npm run ui:dev --workspace @rpg-platform/editor` and follow
`editor/docs/ui-components.md` for the finite manual review. The catalog is at
the app root, replacing ThemeSample; reload resets every value. There is no
Runtime/Render connection, persistence or genuine async operation to verify.

Next supplied checkpoint is v0.12.4, on the same Phase12 branch. Reuse the theme
index and direct Mantine controls; inspect that checkpoint's actual task before
changing anything. UI enforcement `ui:check` remains NOT_CONFIGURED until its
assigned v0.12.5 task; it has not been invented early. No missing upstream API,
public contract delta, blocker, push, PR, merge or phase acceptance in this commit.
