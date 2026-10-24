# Editor UI v0.12.2 — unified theme and design tokens

Status: IMPLEMENTED; BUILD_PASS; FEATURE_NOT_VERIFIED; VISUAL_NOT_VERIFIED.
No UI_PASS, color/pixel PASS, WEBGL_VISUAL_PASS or Developer acceptance claim.

## Preflight

- Branch: feat/editor-ui-foundation-v0.12.
- Base: 01fa078ae9f0114aa7eb9c6975396f03d22c2047 (v0.12.1).
- Behavior: one Editor theme/token source and a minimal presentation sample.
- Canonical primary owner: editor. Harness records evidence only. No production
  collaborator, external L1/L2 API or Runtime/Render contract change is needed.
- Read root/project guidance, architecture, ownership/workflow/verification,
  current theme contracts and actual Editor package/tsconfigs/browser root.
  Existing source is React19.3.1/Mantine9.7.3/Vite8.3.5, not the old pure-library
  baseline in the supplied task. No open Phase12 PR at preflight.
- Route hint agrees with Editor ownership; source inspection remains authority.
- Reused public APIs: Mantine createTheme, DEFAULT_THEME, component.extend,
  CSSVariablesResolver, MantineProvider, Stack/Text/Button/TextInput. Existing
  Editor portable APIs and viewport host remain untouched and unconsumed here.
- Expected gates: architecture check, scoped diff and genuine Editor build
  (already includes strict UI typecheck and Vite bundle). No consumer build needed
  because public contracts are unchanged. No new test suite or runner.

## Exact seven-file scope

1. editor/ui/src/theme/theme.ts — sole createTheme, semantic aliases, defaults
   and existing Mantine feedback-variable resolver.
2. editor/ui/src/theme/index.ts — internal theme exports only.
3. editor/ui/src/theme/ThemeSample.tsx — Text/Button/labeled TextInput sample,
   Mantine Stack layout, no feature action or persistence.
4. editor/ui/src/main.tsx — wire theme/resolver and mount the sample under the
   existing sole provider; retain forced dark and nonpersistent manager.
5. editor/docs/ui-foundation-contract.md — minimal theme implementation section,
   palette/scales/default intent, source propagation and manual observation recipe.
6. editor/docs/tasks/editor-ui-v0.12.2.md — supplied task content with trailing
   whitespace normalized.
7. harness/checkpoints/editor-ui-v0.12.2.md — this report.

No App.tsx, HTML, configuration, package/lockfile, domain source, legacy demo,
other workspace, Harness CLI/config or public export changes. No new CSS,
parallel variable namespace, theme toggle, shell, Panel, viewport or feature
showcase. The existing .mcp.json is untracked local configuration, unchanged and
excluded from the commit.

## Theme decisions and source evidence

- Named Mantine palettes: primary=blue, neutral=gray, success=teal,
  warning=yellow, error=red, reusing DEFAULT_THEME palettes without hex literals.
- Surface/background/foreground/border/muted/accent/danger/viewport-wrapper roles
  reference existing Mantine variables. No GPU clear color or scene state changes.
- Body/headings use system-ui; fonts/spacing/radius/breakpoints keep Mantine's
  scale. Text defaults sm; sample controls and common Input use one controlSize=sm
  token. Shared defaultRadius=sm; reduced-motion preference respected.
- Sample controls have no local size/radius/color overrides. Changing the one
  controlSize token reaches both Button and TextInput defaultProps; main supplies
  the theme to their common provider. Installed native Button/Input styles map
  sm to 2.25rem and md to 2.625rem (times scale). This is source-level dependency
  evidence, not an observed resize. The before/after manual recipe is documented.
- Exactly one createTheme invocation and one provider found in application
  sources; no new literal color/control CSS. Internal theme exports do not become
  portable package exports.
- Prior Developer-approved UI-only exactOptionalPropertyTypes=false exception
  remains unchanged. strict=true and skipLibCheck=false remain inherited. No new
  compiler/styling exception is introduced. No missing upstream API identified.

## Actual verification

- node harness/cli.mjs check: exit 0; ARCH_CHECK_PASS, 189 JS/TS files inspected.
- node harness/cli.mjs verify --projects editor: exit 0; BUILD_PASS [editor].
  Real tsc -b --force → UI tsc --noEmit → Vite8.3.5 production bundle, 862 modules.
  ui:build is mandatory within this command, so no duplicate UI build is needed.
- Output: ignored editor/ui/dist/index.html plus JS 290.58kB and CSS 248.44kB
  (Vite's displayed sizes). Build output is excluded from the checkpoint.
- All 42 pre-existing Editor declaration files SHA256 compared before/after:
  zero changed. Protected paths, manifests and lockfile have zero diff.
- node harness/cli.mjs scope --projects editor --allow-infra: exit 0; SCOPE_PASS.
  Scope count includes pre-existing .mcp.json; staged file audit is exactly the
  seven paths above. git diff --cached --check is clean before commit.
- Existing Node DEP0190 warning from unchanged Harness launcher remains visible;
  it did not fail the build.

## Outstanding manual evidence and handoff

No browser was opened in this checkpoint. Dark mount/no-light-flash, actual token
propagation to computed size/colors, focus, input interaction, accessibility and
pixel/color quality remain unverified. Source/build evidence is not a substitute
for those observations. No tests were added/run. ui:check remains NOT_CONFIGURED
until v0.12.5; no optional or fake checker was introduced early.

Next supplied task is v0.12.3 component usage/default rules on the same branch.
Use the internal theme index and Mantine controls; keep the theme sample minimal
until that task replaces/extends it within its scope. Public contract delta: none.
No blocker, push, PR, merge or next-task implementation in this checkpoint.
