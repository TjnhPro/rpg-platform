# Editor UI foundation contract — v0.12.0

Original v0.12.0 status: documentation contract only. The baseline below is historical.
Current v0.12.2 implementation: internal bootstrap plus unified theme and minimal sample;
browser/visual acceptance is not established. See the theme implementation section below.
Primary owner: Editor. Public contract delta: none.

## Baseline and ownership

Revalidated 2026-10-24 at main `f1a0750851994659a564ff100ba85959767f9b6f`
(after Phase 11 merge). Exactly five npm workspaces remain. Editor is a private
ESM portable library: root export is `dist/index.js` / `dist/index.d.ts`, build
is `tsc -b --force`, and tsconfig includes only `src/**/*.ts`. No React/Mantine
application, TSX configuration or UI build script exists at this baseline.
Editor depends on Runtime Engine and Runtime Render; neither needs modification.

| ID | Binding decision |
| --- | --- |
| UI-01 | Editor is the sole production owner of this browser UI. Harness records evidence only. No sixth workspace, UI package, common layer or cross-project source changes. |
| UI-02 | `editor/ui` is an internal application in the existing workspace. `editor/src/index.ts`, package exports and portable business contracts remain unchanged. The root must never import UI, CSS, React, Mantine or browser entrypoints. |
| UI-03 | React + Mantine Core is the sole control stack. Dependency installation/configuration belongs to the bootstrap task; select compatible versions from actual peers then, not from this document's date. Only Editor dependencies may explain root lockfile changes. Root package.json stays read-only. |
| UI-04 | New UI consumes existing Editor domain operations and Render public root APIs. No private cross-project imports, Three imports, duplicate gameplay validation, renderer, resource manager or bridge. No L1/L2 capability is added or modified. |
| UI-05 | All controls follow Mantine control → theme defaults → composition/layout → justified CSS Module. Follow the companion styling policy, including explicit prohibitions. |
| UI-06 | Exactly one createTheme and one MantineProvider configure the application. Initial foundation is dark, with default control size sm and centralized semantic tokens. No nested per-screen themes or automatic persisted preferences. |
| UI-07 | Shell regions are header, toolbar, left navigator, central viewport, right inspector and bottom status. They are layout slots, not authoring features, docking, Scene schema or Asset Manager implementations. |
| UI-08 | UI preferences/selection/expanded slots are transient React state. They do not enter authored Document content, dirty/revision semantics, Runtime state, localStorage, sessionStorage, IndexedDB, cookies or server storage. |
| UI-09 | Existing editor/src/viewport-host.ts owns browser observation, sizing/DPR sampling, acquisition orchestration, on-demand scheduling and teardown. Runtime Render owns native buffers, GPU resources, scene/camera math and frame submission. React owns mounting the target element and forwarding explicit commands. |
| UI-10 | Build gates are genuine architecture inspection and Editor builds. Once delivered, ui:check must be a mandatory prerequisite of Editor build, scanning editor/ui, not an optional command. No new test suite/runner. |
| UI-11 | Labels, keyboard navigation, focus indication, semantic regions, actionable diagnostics and distinguishable unavailable/error states are required. Build success does not prove accessibility or visual correctness. |
| UI-12 | Missing upstream API or need to alter these boundaries requires a concrete Developer decision before implementation. No agent-authored exception or local workaround changes the contract. |

## Internal source map

Planned locations (not created in this checkpoint):

| Path | Responsibility |
| --- | --- |
| editor/ui/index.html | Browser document and React root mounting target |
| editor/ui/src/app | Entry, root provider composition and transient application state |
| editor/ui/src/theme | The sole theme, component defaults and semantic tokens |
| editor/ui/src/components | Mantine-based shared Panel compositions; no competing control kit |
| editor/ui/src/layout | AppShell and the six standard region slots |
| editor/ui/src/viewport | React lifetime integration with existing Editor viewport host |
| editor/ui/src/styles | Approved structural CSS Modules only |

UI configuration must compile/bundle browser entrypoints separately from the
portable library without changing its root export or widening its domain contract.
Bundler/version choices are deferred to the actual bootstrap task. No Electron,
server, plugin system or routing framework is required by this foundation.

## Canonical component and accessibility path

For an action use Mantine Button (or ActionIcon with an accessible name); for text
use TextInput/Textarea; for selection use Select/Checkbox as appropriate. Omit
size/spacing/radius overrides when defaults suffice. Use Group/Stack/Grid and
AppShell for composition. Standard Panel is one shared Mantine composition with
heading, optional actions, body and empty/error/status slots, not a styled div
control library. Form fields require a visible label or justified accessible
name; placeholders/tooltips alone are insufficient. Preserve native keyboard
semantics and visible focus. Identify navigation/main/complementary/status regions
without multiple conflicting main landmarks. Status updates must remain readable
without color alone; errors expose safe actionable text rather than raw internals.

## Viewport integration example (design sketch, not shipped code)

A future component at `editor/ui/src/viewport/Viewport.tsx` can import
`mountEditorViewport` from `../../../src/viewport-host.js` (same Editor project).
It renders exactly one canvas through React's mount lifecycle, with a ref and
an accessible name/fallback text. It does not allocate another canvas using DOM
or GPU APIs. It imports no private Render files.

```text
React effect setup (after canvas ref exists)
  → create fresh mountEditorViewport(canvas, notify)
  → host.start() on explicit acquisition/start intent
  → host uses @rpg-platform/runtime-render root for graphics/resize/frame
React controls → host.requestFrame(), suspend(), resume(), sync() as appropriate
React effect cleanup → stop accepting UI notifications → host.unmount()
```

Use stable callback dependencies. Each setup creates a fresh host; never reuse
an unmounted host during React development setup/cleanup replay. Cleanup closes
before late acquisition drains; the existing host disposes late sessions and
removes observers/listeners/pending callbacks. Do not independently duplicate
that logic. Host creation does not itself mean graphics acquisition succeeded.
A hidden/zero-size host can pause; preserve its explicit resume/start policy.

Canvas CSS can fill the constrained parent; no padding, border or transforms on
the canvas. Put decoration on a Mantine wrapper. React must not set canvas width/
height attributes or native buffer dimensions. No UI ResizeObserver, DPR listener,
RAF loop, screen/scene math, clock or renderer. Host scheduling remains on demand.
Do not infer WebGL visibility from a mount, ready state or submitted frame count.
No animation/VFX content is silently added by this example.

## Legacy boundary

These existing manual HTML pages remain unchanged historical hosts, outside the
new UI convention scan: `editor/manual/index.html`, `viewport-mvp.html`,
`animation-preview.html`, `vfx-preview.html`, `texture-upload.html`,
`resource-cache.html`, `png-image.html`, `inflight-png.html`, `frame-demand.html`,
`editor-visual-resource.html`, `cache-invalidation.html` (all under editor/manual).
Their adjacent manual scripts remain historical tooling. This exclusion is a
path-specific baseline boundary, not permission to add new application screens
there or copy their raw controls/styles into editor/ui. The existing viewport
host is reused; legacy demos are not retroactively rewritten.

## Ordered delivery and gates

| Checkpoint | Independent capability / scope ceiling |
| --- | --- |
| v0.12.0 | These contracts, task copy and Harness checkpoint only |
| v0.12.1 | React/Mantine internal application bootstrap and necessary Editor configuration/dependencies |
| v0.12.2 | One unified theme and semantic design tokens |
| v0.12.3 | Canonical component usage and default rules |
| v0.12.4 | Structural CSS policy implementation |
| v0.12.5 | Editor-local convention enforcement as a required build gate |
| v0.12.6 | Shared application shell and region slots |
| v0.12.7 | Standard Mantine Panel compositions |
| v0.12.8 | Existing viewport host and constrained canvas layout integration |
| v0.12.9 | Minimal working UI composition using the preceding capabilities |
| v0.12.10 | Documentation/review-only integration and closure audit |

This is the authorized manifest, not a replacement for individual task acceptance
criteria. One Phase 12 branch/PR, one checkpoint commit per task in order. Do not
bundle or pre-implement capabilities. Individual task details are supplied later;
no review pause is required between supplied tasks unless a real owner/contract/
scope blocker is discovered. Developer alone accepts final completion.

Each checkpoint records changed paths, base/commit, public delta, native commands,
exit results and unknown manual evidence. Run `node harness/cli.mjs check`,
`node harness/cli.mjs scope --projects editor --allow-infra`, and
`node harness/cli.mjs verify --projects editor`. Run the UI build separately once
configured unless verify already includes it. The intended build chain includes
ui:check and both portable and browser compilation; enforcement arrives at its
assigned checkpoint, and interim absence must be explicit. No tests or fake PASS.
`BUILD_PASS` is neither `UI_PASS` nor `WEBGL_VISUAL_PASS`.

If blocked, report BLOCKED_WITH_EVIDENCE with required API, current source,
reproduction and correct owner proposal. Do not alter upstream contracts first.

## Framework reference checks

API concepts checked 2026-10-24; dependency versions are not selected here.
[MantineProvider](https://mantine.dev/theming/mantine-provider/) documents provider,
forced color scheme and the default storage manager; force dark centrally to avoid
accidental preference persistence. [Component defaults](https://mantine.dev/theming/default-props/)
belong in theme.components. [AppShell](https://mantine.dev/core/app-shell/) supplies
shell regions; toolbar remains a composition. [React effect lifecycle](https://react.dev/reference/react/useEffect)
requires matching cleanup and tolerating development setup/cleanup replay.

## Unified theme implementation — v0.12.2

`editor/ui/src/theme/index.ts` is the Editor-internal theme surface. It exports
the sole `editorTheme`, typed `editorTokens` aliases and
`editorCssVariablesResolver` from `theme.ts`. The only provider remains in
`editor/ui/src/main.tsx`, with this theme/resolver and the existing forced dark,
nonpersistent color scheme manager. No user-selectable theme or nested provider.
The initial HTML dark attribute from v0.12.1 remains unchanged; absence of a light
flash is not yet browser-observed. No dependency or portable package API change.

### Semantic color roles

| Token | Mantine mapping | Intent |
| --- | --- | --- |
| colors.primary | theme.colors.primary → DEFAULT_THEME.colors.blue; primaryShade 6 | Main action palette, inherited by Button |
| colors.neutral | theme.colors.neutral → DEFAULT_THEME.colors.gray | Neutral badges/text when explicitly needed |
| colors.success | theme.colors.success → DEFAULT_THEME.colors.teal | Positive feedback with a textual label |
| colors.warning | theme.colors.warning → DEFAULT_THEME.colors.yellow | Caution with a textual label |
| colors.error | theme.colors.error → DEFAULT_THEME.colors.red | Error actions/feedback with a textual label |
| colors.accent | --mantine-primary-color-filled | Current primary filled color |
| colors.foreground | --mantine-color-text | General readable foreground (Mantine dark-0 in dark mode) |
| colors.background | --mantine-color-body | App background (dark-7) |
| colors.surface | --mantine-color-default | Panel/sample surface (dark-6) |
| colors.border | --mantine-color-default-border | Standard surface border (dark-4) |
| colors.mutedText | --mantine-color-dimmed | Secondary explanatory text (dark-2) |
| colors.danger | --mantine-color-error | Scalar error feedback color |
| colors.viewportBackground | --mantine-color-dark-8 | Future host wrapper background only; never Render clear color |

Palette roles are valid Mantine `color` values; scalar roles are references to
existing Mantine CSS variables for color/style props. Do not pass a CSS scalar
as a palette key. No new parallel CSS variable namespace or hardcoded hex values.
The public CSSVariablesResolver hook maps Mantine's existing dark feedback
variables `--mantine-color-error` and `--mantine-color-success` to the corresponding
semantic palette shade 6. It creates no private selectors and adds no alternate
theme scale. Existing native Mantine surface/foreground variables remain the
authority. `theme.other.editor` references the same aliases for theme consumers;
the typed export avoids relying on the untyped `other` extension for validation.
Light-mode values are not a supported selectable theme in this MVP.

### Scale and control defaults

| Concern | Canonical value / source |
| --- | --- |
| Typography | system-ui, sans-serif for body/headings; Mantine default monospace stack |
| Font size xs/sm/md/lg/xl | Inherited Mantine 0.75/0.875/1/1.125/1.25 rem; Text defaults to textSize=sm |
| Spacing xs/sm/md/lg/xl | Inherited Mantine 0.625/0.75/1/1.25/2 rem; compact=xs, standard=sm, section=md aliases |
| Radius xs/sm/md/lg/xl | Inherited Mantine 0.125/0.25/0.5/1/2 rem; editorTokens.radius=sm supplies theme.defaultRadius |
| Breakpoints xs/sm/md/lg/xl | Inherited Mantine 36/48/62/75/88 em; use named breakpoints instead of screen literals |
| Control dimensions | editorTokens.controlSize=sm feeds Button, common Input and TextInput defaultProps; native Mantine sm height is 2.25rem × theme.scale for both sample controls |
| Motion/focus | respectReducedMotion=true; preserve Mantine focus behavior |

Numbers here document the installed Mantine 9.7.3 scale, not additional CSS to
copy into screens. No unsupported theme.controlHeights property is invented:
dimensions are selected through the documented `size` prop/defaults and Mantine's
own component size variables. Other control types are introduced under the
following component-usage task, with central defaults matching their public API.
Normal consumers omit size/radius/font overrides and use theme/layout tokens.

### Minimal sample and one-token propagation

`theme/ThemeSample.tsx` renders only Text, Button and a visibly labeled TextInput
in a Mantine Stack. It is mounted beside the existing App placeholder from main,
keeping App.tsx outside this task's narrow file scope. This is labeled presentation
content: the button performs no feature action and the input does not save data.
No shell, feature form, custom control, style object or authored CSS was added.

Source-level propagation evidence:

```text
editorTokens.controlSize (one value: sm)
  → editorTheme.components.Button.defaultProps.size
  → editorTheme.components.Input.defaultProps.size
  → editorTheme.components.TextInput.defaultProps.size
  → the sole MantineProvider theme
  → sample Button/TextInput (neither supplies a local size)
```

The installed Mantine Button/Input styles define sm height as 2.25rem × scale
and md as 2.625rem × scale. Thus the manual observation recipe is to change only
controlSize from sm to md in theme.ts, run ui:dev, observe both sample controls,
and restore sm. No component CSS or sample prop changes are needed. Likewise
changing editorTokens.radius changes the shared --mantine-radius-default consumed
by both controls. This dependency path is verified by source inspection and the
typed UI build; an actual before/after pixel measurement has not been performed.
Do not describe the expected rendered change as a visual PASS until observed.

Theme APIs were checked against the installed public declarations and official
[theme object](https://mantine.dev/theming/theme-object/),
[default props](https://mantine.dev/theming/default-props/) and
[CSS variable resolver](https://mantine.dev/styles/css-variables/) documentation.
