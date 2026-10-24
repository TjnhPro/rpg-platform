# Editor UI styling policy — v0.12.5

Status: policy implemented; Editor-local automated enforcement installed in v0.12.5.
Canonical owner: Editor. This refines the existing ST/EC rules and UI-05/06/10/12
from the [foundation decisions](ui-foundation-contract.md), retaining the
[component usage contract](ui-components.md). It grants no cross-project scope.

At v0.12.3 HEAD `0546354`, the application already uses the single theme and
direct Mantine controls. Its only stylesheet import is `@mantine/core/styles.css`
in `editor/ui/src/main.tsx`; there are no authored CSS/SCSS files or component
inline style overrides to migrate. v0.12.4 added documentation only; v0.12.5 adds
the build gate below without changing the ST/EC decisions or granting exceptions.

## Stable styling decisions

- ST-01: Use a Mantine Core control before introducing any styling. No raw HTML
  replacement for Button, input, select, checkbox, textarea or other interactive
  controls, including disguised role=button div/span controls.
- ST-02: One theme owns component defaults. Controls default to sm. Typography,
  spacing, radius and colors use Mantine theme tokens; no per-screen literal hex,
  rgb/hsl colors, radius or spacing values, including arbitrary pixel strings.
  Structural zero, full-size percentages and flex/grid constraints are layout
  values, not an alternate design-token palette.
- ST-03: Semantic tokens cover application surface, panel surface, border, muted
  text, accent, danger and viewport background. Define their mappings once in
  Editor theme code using Mantine tokens; consumers reference meanings, not hex.
  The implemented source is `editor/ui/src/theme/theme.ts`, exported through its
  existing index. Reuse its semantic aliases; do not create another token system.
- ST-04: Use Mantine layout props/compositions first. CSS Modules are restricted
  to demonstrably necessary shell constraints, min-size/overflow behavior and
  canvas sizing. No screen-specific global styles, inline style objects, style
  elements, arbitrary control classes or additional styling framework.
- ST-05: Only the application entry imports Mantine's required global stylesheet.
  Application-authored styles must be *.module.css. No .mantine-* overrides,
  global selectors, :global, ID selectors or selectors reaching component internals.
  Use named local structural classes; selectors for interactive controls are not
  a substitute for Mantine defaults. No !important or CSS-in-JS escape hatch.
  The exact module areas and sole current global import are listed below.
- ST-06: A necessary CSS Module rule must have its structural purpose documented
  in the scoped styling task and fit the Developer-authorized category. A code
  comment, allowlist or checker-disable directive cannot authorize an exception.
  New categories require Developer approval with a concrete Mantine limitation.
- ST-07: Shared Panel is a Mantine composition, not a second theme or custom
  border/background/spacing system. Its header/actions/body/status consume the
  same tokens. Feature screens cannot independently recreate the Panel pattern.

## Rule precedence

Apply these steps in order; a lower step never overrides a prohibition above it:

1. Use an actual Mantine component and its public props/defaults. Button intent,
   control size, disabled/loading and input feedback follow ui-components.md.
   Prefer Stack/Group/Grid/AppShell/ScrollArea composition for normal layout.
2. Supply existing theme tokens through supported props. Repeated control
   defaults belong in the existing sole theme. Use editorTokens semantic roles
   instead of literal palette values; spacing/radius use Mantine's named scale.
3. If a documented Mantine Styles API slot is needed, use that supported slot
   rather than reaching into generated/private DOM. `classNames` may map only
   to a justified structural class in an approved Module under step 4. A public
   styling hook is not permission to restyle controls or bypass tokens.
4. Add scoped CSS Modules only for a demonstrated layout-mechanics or canvas-CSS
   limitation that the preceding options cannot express. Record that limitation,
   exact path/selector/declarations and owning task in its checkpoint. Restrict
   the Module to the three areas below; do not create one merely for an example.

Application-authored `style` / `styles` objects or callbacks remain forbidden at
component usage sites, even when hidden behind variables/spreads or containing
tokens. Use supported props, central defaults or the scoped structural class.
The existing theme CSSVariablesResolver is the central semantic binding, not
permission to add local CSS variables/styles to screens. Mantine-generated
styles from its normal props are library-owned and are not prohibited inline
styles authored by the application. Preserve the existing theme/token contract.

## Exact paths, areas and exceptions

Paths below are repository-relative globs; `**` includes nested files. These are
authored-source limits on future scoped tasks, not claims that the listed
directories exist. Generated output and dependencies have the explicit scan
boundary below. No Module, reset or new component is introduced by v0.12.4.

| Path / import | Status and permitted purpose |
| --- | --- |
| `editor/ui/src/theme/theme.ts`, `editor/ui/src/theme/index.ts` | Existing canonical theme/tokens and their export; no second theme/provider or per-screen scales |
| `editor/ui/src/styles/layout/**/*.module.css` | Reserved for shell-region shrink/flex/grid and logical overflow constraints when Mantine layout is insufficient |
| `editor/ui/src/styles/panel/**/*.module.css` | Reserved for shared Panel body shrink/scroll containment; no Panel decoration or per-feature control styling |
| `editor/ui/src/styles/viewport/**/*.module.css` | Reserved for constrained viewport host layout and canvas CSS display size; never native drawing-buffer configuration |
| `editor/ui/src/main.tsx` → `@mantine/core/styles.css` | Sole current approved global stylesheet import; distributed Mantine CSS is not copied, patched or reimported per component |
| `editor/ui/index.html` | Browser root markup, not a global-CSS exception; no authored style element, style attribute or extra stylesheet link |
| Root reset | No separate reset file/import/selector is approved at this HEAD. A necessary reset requires the exception proposal below, exact root targets and Developer approval before adding it |
| Any other authored `editor/ui/**/*.css`, `editor/ui/**/*.scss`, `editor/ui/**/*.sass`, `editor/ui/**/*.less` | Forbidden, including *.module.css outside the three areas, *.module.scss and per-screen feature styles |
| `editor/manual/**` | Existing legacy/manual hosts remain unchanged and outside the new UI-app convention scan; do not put new app screens there |

Being inside an allowed path does not authorize control styling, feature styles,
private selectors, copied third-party CSS or an unassigned task. Keep each Module
owned by its shared layout/panel/viewport responsibility. Import it as a Module
from its same-Editor consumer; do not attach global/raw class strings or use a
side-effect import to turn it into a global stylesheet. No CSS `@import`, remote
stylesheet, injected style element or new styling dependency is authorized.

Allowed selectors name local structural classes. No body/html/:root/universal,
ID, raw element, :global, .mantine-* or private-control descendant selectors.
Structural combinators may connect explicitly local classes only; do not use
an attribute selector or an obfuscated selector to reach Mantine internals.
Do not redefine --mantine-* variables in Modules or create an alternate token
namespace. Read existing `var(--mantine-...)` values where a token is needed.

## Decision table

| Subject | Allowed | Disallowed | Needs Developer approval |
| --- | --- | --- | --- |
| DOM controls | Mantine Button/ActionIcon/TextInput/Select/etc.; named canvas target and browser root document structure | Raw button/input/select/textarea equivalents, clickable div/span, native controls hidden under wrappers | A necessary control unavailable in Mantine, with evidence and accessible design |
| Structural DOM | Mantine Box and layout components; canvas with ref/name/fallback | Arbitrary hand-styled competing Panel or shell control | Additional exceptional structural element outside the canonical path |
| Theme | One createTheme/provider; centralized component defaults and semantic tokens | Nested themes, per-component hardcoded color/radius/spacing, ad hoc size overrides | A change to locked defaults or token semantics |
| Control styles | Native variant/size/error/loading props and centralized component defaults | Local style/styles callbacks/objects, control CSS classes or selectors reaching internals | A demonstrated missing control styling capability, before implementation |
| Spacing / typography | Existing editorTokens aliases and Mantine named props; var(--mantine-...) in a necessary structural Module | Literal design dimensions/colors/fonts in CSS, JSX or helper variables; unit conversion used to disguise a new scale | A missing token/scale or new CSS-mechanics category |
| Status colors | Semantic success/warning/error/neutral palettes with readable labels | Hex/rgba color literals, color-only failure/success, theme-variable redefinition | A change to locked semantic mapping |
| Panel scrolling | Mantine ScrollArea/layout first; justified logical shrink and scroll-containment Module in the panel area | CSS implementing a second Panel, global scrollbar/control overrides, arbitrary per-feature height/spacing | New behavior outside the shared Panel/layout category |
| Viewport sizing | Constrained parent and local canvas CSS percentages; existing viewport-host measures logical CSS pixels | UI canvas width/height attributes or assignments, DPR multiplication, renderer/observer/rAF duplication, gameplay positions expressed in CSS | Missing host/Render public capability; escalate to its owner |
| CSS global / reset | Exactly the main.tsx distributed Mantine import today | Other global CSS/SCSS imports, HTML style/link injection, body input rules, !important | A concrete minimal root-reset exception, not a generic reset license |
| Third-party overrides | Public Mantine props and approved structural Styles API class mapping | .mantine-* overrides, copied/modified vendor CSS, extra UI/style frameworks | An unresolved library limitation with a scoped proposal |
| CSS | Local Module structural classes for approved layout/canvas constraints | Global screen styles, .mantine-* targeting, :global, !important, control restyling, inline style escapes | A new structural category demonstrated necessary and reviewed before code |
| Dependencies | React/Mantine Core and required compatible peers/build tooling installed only for Editor at the assigned checkpoint | Second UI/CSS kit, new workspace, test runner, unnecessary routing/state/persistence stack | Additional dependency outside the declared stack/tooling need |
| Imports | Existing Editor domain APIs and same-project viewport-host; Render root only when justified | Render private paths, Three, other projects' source, UI re-export from portable root | Missing upstream public API or owner boundary change |
| State | Transient React workspace state | Writing UI preferences to Document/Runtime/storage, persisted default color manager | Persistence or new authored schema, outside this foundation |

## Concrete Allowed / Forbidden examples

Allowed: inherit control defaults and pass semantic tokens through Mantine props.
This uses the existing theme index from a component under src/components:

```tsx
import { Button, Stack, Text } from '@mantine/core';
import { editorTokens } from '../theme/index.js';

<Stack p={editorTokens.spacing.section} gap={editorTokens.spacing.standard}>
  <Text c={editorTokens.colors.mutedText}>Temporary sample action</Text>
  <Button color={editorTokens.colors.error} onClick={openConfirmation}>
    Remove sample entry…
  </Button>
</Stack>
```

Forbidden: arbitrary component styling, even if a helper or CSS variable hides it.

```tsx
<Button style={{ color: '#ffffff', margin: 12 }}>Remove</Button>
<Button styles={{ root: { background: 'rgba(255, 0, 0, 0.8)' } }}>Remove</Button>
```

Alternative: the semantic Button above, with spacing on its Mantine parent.
Do not move those declarations into a Module or a styles callback. A destructive
action still opens controlled confirmation; styling alone does not implement it.

Allowed CSS Module example, conditional on a later shared Panel task needing
logical scroll padding and scroll containment not supplied by its Mantine props.
`editor/ui/src/styles/panel/scroll-body.module.css` is an example path, not a
file created or a rendered behavior claimed by this checkpoint:

```css
.scrollBody {
  min-inline-size: 0;
  min-block-size: 0;
  overflow: auto;
  overscroll-behavior-block: contain;
  scroll-padding-block: var(--mantine-spacing-sm);
}
```

The constrained parent must establish the available extent. The token is scroll
padding for bringing content into view, not a second decorative spacing system.
Attach `classes.scrollBody` through Mantine `className`, or its documented
`classNames` slot when appropriate. Do not write a replacement Panel or use
this example to avoid Mantine ScrollArea without an actual limitation.

Forbidden CSS example, regardless of file location:

```css
body input { margin: 12px; }
.mantine-Button-root { background: #ff0000 !important; }
:global(.sample) { color: rgba(255, 255, 255, 0.8); }
```

Alternative: TextInput inherits theme defaults; its Stack/Group supplies token
spacing, and Button uses its semantic palette. No CSS is needed for these cases.

## Geometry and responsive rules

- Token values govern design spacing, typography, colors, radius and dimensions.
  A literal converted to rem/em or placed in calc() is still a design literal;
  changing units does not make it a theme token.
- Structural zero, 100% of a constrained parent, auto, flex ratios and grid
  minmax(0, 1fr) are allowed only for the declared layout mechanics. They are
  not permission for arbitrary percentage margins, pixel offsets or control
  dimensions. Prefer CSS logical inline/block sizing and overflow containment.
- Pure geometry declarations need no artificial var() reference. A Module
  needing a design value must read existing var(--mantine-...) tokens, as in the
  scroll-padding example. No duplicate token definitions or private color table.
- Responsive behavior uses Mantine named breakpoint props. For example,
  `p={{ base: editorTokens.spacing.standard, sm: editorTokens.spacing.section }}`
  resolves the theme's existing sm breakpoint; do not copy numeric widths.
- This HEAD has no configured PostCSS breakpoint-variable pipeline. Do not add
  raw numeric @media/@container thresholds or assume Sass/$mantine-breakpoint-*
  preprocessing exists. `var(--mantine-breakpoint-sm)` inside a media condition
  is not a working substitute. If responsive structural CSS cannot use existing
  Mantine APIs, propose the exact token-to-build mechanism before adding it;
  do not install tooling or invent a parallel breakpoint scale in this task.
- Never translate gameplay positions or Render transforms into CSS layout math.
  Theme and browser geometry do not authorize game spatial semantics.

The syntax above is checked against installed Mantine9.7.3 public APIs and the
official [style props](https://mantine.dev/styles/style-props/),
[Styles API](https://mantine.dev/styles/styles-api/) and
[responsive styles](https://mantine.dev/styles/responsive/) documentation.
Library examples may allow styling patterns that this project's stricter policy
rejects; library support alone is not a project exception.

## Viewport exception: CSS size versus native drawing buffer

The canvas is a host-owned browser element, not a Mantine control replacement.
In the later viewport task, a justified local class can use display:block,
inline-size:100% and block-size:100% to fill an already constrained parent.
Logical shrink/overflow constraints belong to its layout/viewport parent. Do not
decorate or transform the canvas: no padding, border or CSS transform; put
decoration on the Mantine wrapper using existing theme props/tokens.

CSS display dimensions affect browser layout only. React owns mount/ref/unmount
and an accessible name/fallback. Existing `editor/src/viewport-host.ts` reads
getBoundingClientRect(), observes layout/DPR and supplies logicalWidthCssPx,
logicalHeightCssPx and requestedPixelRatio through Render's public APIs.
Runtime Render owns ratio/rounding/limits, native drawing-buffer dimensions,
graphics resources and frame submissions. The CSS/native values need not match.

Do not add `<canvas width={...} height={...}>`, canvas.width/height assignments,
setAttribute sizing, UI-side DPR multiplication/clamping, ResizeObserver,
matchMedia/DPR listeners, requestAnimationFrame loops or another renderer. Reuse
the existing host's start/sync/requestFrame/suspend/resume/unmount operations.
Read-only host measurements are not a CSS-token exception, and do not authorize
new measuring code in the React component. A genuine native-canvas geometry
exception must identify the public owner/measurement path and impact before
approval; it cannot reassign native-buffer ownership to UI.

Preserve hidden/zero-size handling and explicit resume policy. A styled/mounted
canvas, a ready state or a submitted frame count is not WEBGL_VISUAL_PASS.
This checkpoint does not mount a canvas, resize a viewport or change the host.

## Exception request workflow

Normal use within the locked theme/control rules and a supplied task's allowed
structural area proceeds without a review pause. A developer-authorized task
is sufficient authorization for its declared scope; do not ask again merely
because the implementation needs a normal Mantine prop or structural Module.

When no allowed solution is sufficient:

1. Inspect the current component/theme/public owner API and record the concrete
   limitation or reproducible layout failure. Finish independent in-scope work.
2. Prepare a minimal proposal before implementing the exception: behavior and
   one canonical owner; affected files/globs and selectors/declarations/imports;
   why props/defaults/tokens/Styles API cannot solve it; existing rule IDs;
   accessibility/layout/build impact, consumers and proposed verification.
3. For a root reset, identify exact root targets, missing default behavior and
   why distributed Mantine CSS is insufficient. For token/native geometry or
   upstream API changes, name the actual owner and contract; keep the evidence
   separate from a proposed ownership change.
4. Request Developer's explicit decision on that concrete delta. Record any
   accepted exact paths, scope and reason in policy/checkpoint before use.
   Pending/rejected exceptions stay unimplemented; keep blockers visible.

An agent comment, new allowlist entry, renamed extension, selector trick,
checker-disable directive or moved legacy file is not approval. Do not weaken
policy/checker rules to make a violation pass. No exception is requested or
granted in v0.12.4; its supplied scope only makes the existing policy concrete.

## Build enforcement contract

The editor-local ui:check implements the following contract. Scan
every application TS/TSX/JS/JSX, CSS and entrypoint beneath `editor/ui/**`,
including nested files and the actual import targets; do not silently
skip new extensions or pretend regex coverage proves semantic correctness. Report
unsupported source forms rather than silently passing them. Diagnostics identify
rule ID, relative path, line and reason, and exit nonzero on violations or inability
to inspect configured inputs. Only exact generated output `editor/ui/dist/**`
and installed dependencies are outside authored-source inspection; a new nested
source directory is not an exclusion. `editor/manual/**` and documentation code
fences (including deliberate Forbidden examples above) are outside this UI-app
scan, not an escape hatch for new app code. No tests/runner or root Harness CLI/CI
changes are authorized.

Machine-checkable requirements:

| Rule ID | Required inspection |
| --- | --- |
| EC-01 | Reject banned raw controls and interactive role/event substitutions (ST-01); canvas is the specified host element, not an arbitrary control exception |
| EC-02 | Enforce single theme/provider location; default control sizes and token definitions centralized in theme; reject per-component design literals (ST-02/03) |
| EC-03 | Enforce the exact three Module globs and main.tsx Mantine import above; reject other CSS/SCSS and stylesheet links/imports, authored style/styles objects/callbacks and HTML inline styles, @import, global/private/control selectors, !important, literal design values and local token redefinitions. Resolve Module class imports/mappings and report unsupported CSS/source forms rather than ignoring them (ST-04/05) |
| EC-04 | Verify imports stay within the approved stack and public/same-project boundaries; portable root cannot import UI (UI-02/04) |
| EC-05 | Reject UI-side renderer/canvas allocation, scheduling and buffer sizing APIs; viewport integration uses the existing host (UI-09) |
| EC-06 | Reject persistence APIs/configuration and checker suppression/agent-created exceptions (UI-08/ST-06) |
| EC-07 | Editor build obligatorily invokes checker and genuine UI compilation; verify cannot omit the new application |

Record actual coverage and known static limitations at implementation. AST-level
inspection may use existing TypeScript tooling; no new testing infrastructure.
Manual review still owns whether a control fits its task, semantic token choices,
accessibility, focus behavior, overflow, visual quality and WebGL correctness.
The checker is a build gate, not a behavioral acceptance suite.

## Installed enforcement and static limits — v0.12.5

Run `npm run ui:check --workspace @rpg-platform/editor` from the repository, or
`npm run ui:check` from Editor. `editor/scripts/check-ui-contract.mjs` resolves
its paths from its own URL, not the caller's current directory. No flags, custom
scan roots, suppression directives or feature-owned allowlist are supported.
The exception list is locked empty; the single Mantine CSS import is an existing
policy requirement, not a new exception.

Editor `build` now runs this mandatory sequence, stopping at the first failure:

```text
npm run ui:check
  && tsc -b --force
  && npm run ui:build
```

`ui:build` retains the genuine UI `tsc --noEmit` and Vite production build.
EC-07 also checks the exact configured commands; no optional/fallback checker
chain is accepted. Changing/removing the checker or build scripts is a reviewed
policy change, not something this editable source gate can make tamper-proof.
Root Harness/CI and all legacy manual hosts remain unchanged.

Inspection is confined to the new Editor application. It recursively inventories
`editor/ui`, parses all TS/TSX/JS/JSX and their mjs/cjs/mts/cts forms (including
unimported/nested app files), inventories authored styles, and inspects HTML
entrypoints. The existing Vite config is inspected with its exact tooling-import
boundary; JSON compiler configuration is not linted as application code. Exact
`editor/ui/dist/**` and installed `editor/ui/node_modules/**` are excluded, and
dependency declarations are used for symbol resolution only. A nested source
directory named dist is still inspected; a nested dependency-named source
directory is diagnosed rather than silently skipped. Symlinked inputs fail
ownership inspection. Unsupported inputs in src fail with a source-form
diagnostic; do not disguise source as another extension. No scanning of
`editor/manual`, documentation fences, other projects or old domain styles.

| Rule | Installed machine inspection | Still requires manual review |
| --- | --- | --- |
| EC-01 | TypeScript AST native button/input/select/textarea; resolvable intrinsic aliases and React/DOM factories; interactive role/event substitutions on native and recognized Mantine structural elements; polymorphic raw-control substitution | Control choice, dynamic component identity, custom wrapper behavior, accessible naming, keyboard/focus semantics and canvas input |
| EC-02 | Alias-aware single createTheme/provider at exact paths; local Mantine component extension/default configuration; literal design props including simple helper values and named responsive maps; source provenance of semantic tokens | Correct semantic meaning, unchanged central defaults/token mappings, arbitrary computed values, gameplay values versus legitimate geometry |
| EC-03 | Exact Module globs/global import; authored style/styles props including resolvable spreads and forwarded *Props objects; raw class strings; default Module class bindings/classNames slots; stylesheet links and common markup/style injection APIs; flat structural CSS, imports/private/global selectors, !important, decorative declarations, literal units/colors and variable redefinition | Whether CSS is necessary, task/category justification, public structural slot choice, unknown property classifications and dynamic class/props mappings |
| EC-04 | Static ESM/import-type/dynamic-literal imports resolve to approved UI files, existing Editor root/viewport-host or approved package roots; no private/extra UI stack/generated/manual imports, require/glob/eval or uninspectable local import targets | Computed import destinations, runtime reflection, ownership of business behavior; portable root is unchanged and reviewed through scope/build, not retroactively style-scanned |
| EC-05 | Canvas JSX sizing and typed buffer writes; DOM-proven allocation/getContext/observer/DPR/scheduling APIs and simple aliases; imperative sizing | Existing host lifecycle use, data flow through arbitrary callbacks/any/dynamic properties, resource cleanup and real frame/native behavior |
| EC-06 | Browser storage/cookie APIs, persisted Mantine manager, missing explicit entry manager/fixed dark scheme and recognized suppression directives | Arbitrary callbacks/host/server persistence, manager implementation semantics, absence of business-state writes |
| EC-07 | Exact nonoptional Editor checker/library/UI build commands | Review of future changes to the checker/build configuration itself |

The TypeScript compiler API parses executable source; arbitrary user strings,
labels, comments and ordinary numeric demo data are not searched as JSX/CSS.
Simple local/import aliases, object members, conditional style values and
resolvable spreads are inspected. Unresolved spreads, computed imports/props,
dynamic token/class values and unknown viewport-like calls emit path/line/rule
**WARNING** diagnostics for manual review, rather than speculative hard failures.
Warnings do not grant an exception or prove compliance of the unresolved value.

CSS inspection deliberately supports a small flat structural grammar: named
local classes connected only to local classes, declaration lists, existing
Mantine var() tokens, zero/full-parent sizing, flex ratios and grid mechanics.
Recognized properties cover display/box sizing, logical/physical min/max sizing,
flex/grid placement, alignment, overflow/overscroll, scroll padding, positioning
and logical inset. Prefer logical geometry. Clear control decoration/token
redefinitions are errors; an unclassified property produces a manual-review
warning. Nested/preprocessor/escaped rules, at-rules and unsupported selector
grammar fail inspection; this is not a general CSS parser or permission to add
another category. New grammar or missing structural capability must follow the
existing exception workflow, not a feature-owned checker edit.

Each diagnostic is `repository-relative-file:line:EC-rule: ERROR/WARNING reason`
with a Mantine/theme/owner alternative. Proven violations, parse failures,
unreadable/uninspectable configured inputs and build-command drift exit nonzero.
`UI_CONTRACT_PASS` means no recognized hard violations in inspected inputs; it
does not certify arbitrary data flow, runtime-generated styles, accessibility,
visual quality, overflow, layout or WebGL correctness. FEATURE_NOT_VERIFIED and
VISUAL_NOT_VERIFIED remain explicit until independent Developer review.

The checkpoint records ad hoc RED→GREEN observations using temporary untracked
source, including a build stopped by EC-01. No test/fixture/runner is retained.

## Practical additions

Button: import Mantine Button, supply a clear label and action, inherit defaults.
Input: import the appropriate Mantine input, label it and bind UI state or an
explicit existing domain command; never write a domain rule in its handler.
Panel: use the shared Mantine Panel composition once available; until its task,
do not introduce a competing component early. No CSS is needed for these normal
cases. A viewport flex child that must shrink may require a local min-width/min-
height/overflow constraint; document it under the approved structural category,
keep decoration in Mantine wrappers, and let Render size the native buffer.
