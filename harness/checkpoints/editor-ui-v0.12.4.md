# Editor UI v0.12.4 — CSS and styling policy

Status: IMPLEMENTED (policy documentation); ARCH_CHECK_PASS; SCOPE_PASS;
BUILD_PASS; FEATURE_NOT_VERIFIED; VISUAL_NOT_VERIFIED.
Developer phase acceptance remains open. No UI_PASS/MVP_PASS/READY_TO_MERGE.

## Preflight

- Branch: `feat/editor-ui-foundation-v0.12`; base v0.12.3 at
  `05463545764601a69d690e1978f387093df9488b`. No associated/open Phase12 PR at
  preflight. Continue the existing branch/single-phase-PR workflow, one capability
  per checkpoint commit. Developer explicitly authorized proceeding without
  waiting for intermediate review.
- Feature: make CSS/styling priority, permitted Module areas, global exception,
  geometry/viewport ownership and exception handling concrete for subsequent tasks.
- Canonical primary production owner: **editor**. Harness holds evidence only.
  No production collaborators or external L1/L2 APIs are needed.
- Read root/project AGENTS, ARCHITECTURE, OWNERSHIP, WORKFLOW, VERIFICATION,
  current Editor package/tsconfigs, theme/component contracts, v0.12.3 checkpoint,
  all eight authored UI files and existing viewport-host/public-root source.
  Route hint identified Editor; source and ownership contracts determined scope.
- Current baseline already has React19.3.1, Mantine9.7.3, Vite8.3.5, the single
  provider/theme and mandatory UI typecheck/bundle inside Editor build. No install
  or historical pure-library bootstrap assumption is needed.
- Reused/reference APIs: existing editorTokens and Mantine component props,
  theme defaults, Styles API classNames and named responsive props. The document
  explains existing internal mountEditorViewport operations and its Render-root
  metric forwarding. No new API is consumed by executable code.
- Allowed/actual paths: `editor/docs/ui-styling-policy.md` and this checkpoint.
  The current catalog has no inline hardcode needing migration; no source/CSS
  file is justified. Expected gates: check, Editor scope with infrastructure,
  and verify Editor (already includes ui:build).
- Public production contract delta: **none**. No authored schema, portable
  export, ownership/dependency-direction or cross-project change. No consumer
  build/adjustment required; no upstream capability blocker found.

## Exact two-file scope and decisions

1. `editor/docs/ui-styling-policy.md` — retain ST-01–07/EC-01–07; concretize
   priority and classifications, exact Module/import boundaries, examples,
   geometry/responsive conventions, viewport ownership and exception workflow.
2. `harness/checkpoints/editor-ui-v0.12.4.md` — this audit and handoff.

Policy specifies:

- Mantine component/default props → existing theme tokens → supported Styles API
  slot → justified structural CSS Module. Styles API support does not authorize
  component-local style/styles objects/callbacks or control restyling.
- Exact future Module areas:
  `editor/ui/src/styles/layout/**/*.module.css`,
  `editor/ui/src/styles/panel/**/*.module.css`,
  `editor/ui/src/styles/viewport/**/*.module.css`. These are reserved limits, not
  implemented directories/components or permission to begin later checkpoints.
- Only current global exception: `@mantine/core/styles.css` from
  `editor/ui/src/main.tsx`. No root reset is currently approved/needed. New reset,
  category/token/breakpoint/native-geometry exceptions require a concrete scoped
  Developer decision; normal already-authorized usage needs no extra approval.
- Classification covers controls, spacing, status colors, Panel scrolling,
  viewport sizing, CSS global/reset and third-party overrides. Includes an
  allowed token-based scroll Module example and rejected JSX/CSS examples with
  Mantine alternatives. Fenced examples remain documentation, not shipped CSS.
- Logical shrink/scroll containment and percentage canvas display geometry are
  distinct from design tokens. Mantine named responsive props use current theme
  breakpoints. No PostCSS breakpoint pipeline exists at this HEAD; documentation
  does not pretend CSS var() media conditions or Sass variables will work, and
  does not install preprocessing or create another breakpoint scale.
- React only mounts/names the canvas. Existing viewport-host measures CSS/DPR,
  forwards metrics and owns browser scheduling/lifetime. Render owns native
  buffer ratio/rounding/limits, resources and submissions. No UI buffer writes,
  duplicate observers/RAF, CSS gameplay math or renderer are authorized.
- Future checker must inspect authored UI files/imports, exact Module areas,
  illegal styling forms and unsupported syntax; generated `editor/ui/dist/**`,
  dependencies, documentation and existing `editor/manual/**` are distinct from
  authored application source. It must not silently skip new nested app files.

## Actual verification and scope evidence

- Source inventory: eight authored UI files; sole CSS import at main.tsx:1 is
  distributed Mantine CSS. No authored CSS/SCSS files, inline styles, local control
  style classes or literal color/pixel styling were found in existing samples.
  Demo numeric constraints are UI example values, not styling-token violations.
- `node harness/cli.mjs check`: exit 0; ARCH_CHECK_PASS, 189 JS/TS source files
  inspected. This is architecture inspection, not the future UI-policy checker.
- `node harness/cli.mjs verify --projects editor`: exit 0; BUILD_PASS [editor].
  Actual `tsc -b --force` → UI `tsc --noEmit` → Vite8.3.5 production bundle,
  862 modules. Displayed output sizes: HTML0.45kB, CSS248.44kB, JS493.69kB.
  ui:build is mandatory within verify, so it was not redundantly invoked again.
- No failed/unconfigured required project build. The existing unchanged Harness
  launcher emitted Node DEP0190 deprecation warning without failing the build.
- `node harness/cli.mjs scope --projects editor --allow-infra`: exit 0;
  SCOPE_PASS. Final status contains exactly the two checkpoint paths plus the
  pre-existing untracked `.mcp.json`; that local configuration remains unchanged
  and excluded from this commit. Task-owned tracked changes are committed cleanly.
- `git diff --cached --check`: clean before commit. Exact staged file audit is
  the two Markdown paths above. Zero source, CSS, package/lockfile, compiler,
  public root, Editor legacy/manual, other production project, CI or Harness
  CLI/config delta. No tests, dependencies, runner, linter or checker added/run.

## Outstanding observations and handoff

No browser interaction, screenshot, canvas sizing or visual review performed.
The examples were reviewed as policy/source documentation; they are not executed
feature evidence. Existing focus/interaction/contrast/overflow/viewport and UI
visual observations remain FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED. Developer
alone accepts product/visual behavior and final phase completion.

Next is the separately supplied v0.12.5 convention-enforcement task on the same
branch. Reuse the actual theme/component paths and ST/EC rules above; ui:check
is still NOT_CONFIGURED here and no checker is implemented early. There are no
missing APIs or new exception requests. No public contract delta, blocker, push,
PR, merge, phase acceptance or subsequent-capability implementation in this commit.
