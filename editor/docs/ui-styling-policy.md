# Editor UI styling policy — v0.12.0

Status: contract only. Enforcement implementation is scheduled for v0.12.5.
See [foundation decisions](ui-foundation-contract.md); this document refines UI-05/06/10/12.

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
  Exact palette/token implementation belongs to v0.12.2.
- ST-04: Use Mantine layout props/compositions first. CSS Modules are restricted
  to demonstrably necessary shell constraints, min-size/overflow behavior and
  canvas sizing. No screen-specific global styles, inline style objects, style
  elements, arbitrary control classes or additional styling framework.
- ST-05: Only the application entry imports Mantine's required global stylesheet.
  Application-authored styles must be *.module.css. No .mantine-* overrides,
  global selectors, :global, ID selectors or selectors reaching component internals.
  Use named local structural classes; selectors for interactive controls are not
  a substitute for Mantine defaults. No !important or CSS-in-JS escape hatch.
- ST-06: A necessary CSS Module rule must have its structural purpose documented
  in the scoped styling task and fit the Developer-authorized category. A code
  comment, allowlist or checker-disable directive cannot authorize an exception.
  New categories require Developer approval with a concrete Mantine limitation.
- ST-07: Shared Panel is a Mantine composition, not a second theme or custom
  border/background/spacing system. Its header/actions/body/status consume the
  same tokens. Feature screens cannot independently recreate the Panel pattern.

## Decision table

| Subject | Allowed | Disallowed | Needs Developer approval |
| --- | --- | --- | --- |
| DOM controls | Mantine Button/ActionIcon/TextInput/Select/etc.; named canvas target and browser root document structure | Raw button/input/select/textarea equivalents, clickable div/span, native controls hidden under wrappers | A necessary control unavailable in Mantine, with evidence and accessible design |
| Structural DOM | Mantine Box and layout components; canvas with ref/name/fallback | Arbitrary hand-styled competing Panel or shell control | Additional exceptional structural element outside the canonical path |
| Theme | One createTheme/provider; centralized component defaults and semantic tokens | Nested themes, per-component hardcoded color/radius/spacing, ad hoc size overrides | A change to locked defaults or token semantics |
| CSS | Local Module structural classes for approved layout/canvas constraints | Global screen styles, .mantine-* targeting, :global, !important, control restyling, inline style escapes | A new structural category demonstrated necessary and reviewed before code |
| Dependencies | React/Mantine Core and required compatible peers/build tooling installed only for Editor at the assigned checkpoint | Second UI/CSS kit, new workspace, test runner, unnecessary routing/state/persistence stack | Additional dependency outside the declared stack/tooling need |
| Imports | Existing Editor domain APIs and same-project viewport-host; Render root only when justified | Render private paths, Three, other projects' source, UI re-export from portable root | Missing upstream public API or owner boundary change |
| State | Transient React workspace state | Writing UI preferences to Document/Runtime/storage, persisted default color manager | Persistence or new authored schema, outside this foundation |

## Build enforcement specification (not yet installed)

v0.12.5 must provide editor-local ui:check. Scan every application TS/TSX/JS/JSX,
CSS and entrypoint beneath editor/ui, including nested files; do not silently
skip new extensions or pretend regex coverage proves semantic correctness. Report
unsupported source forms rather than silently passing them. Diagnostics identify
rule ID, relative path, line and reason, and exit nonzero on violations or inability
to inspect configured inputs. No tests/runner or changes to root Harness CLI/CI.

Machine-checkable requirements:

| Rule ID | Required inspection |
| --- | --- |
| EC-01 | Reject banned raw controls and interactive role/event substitutions (ST-01); canvas is the specified host element, not an arbitrary control exception |
| EC-02 | Enforce single theme/provider location; default control sizes and token definitions centralized in theme; reject per-component design literals (ST-02/03) |
| EC-03 | Reject authored non-Module CSS, unapproved stylesheet imports, inline styling, global/private Mantine selectors and forbidden declarations (ST-04/05) |
| EC-04 | Verify imports stay within the approved stack and public/same-project boundaries; portable root cannot import UI (UI-02/04) |
| EC-05 | Reject UI-side renderer/canvas allocation, scheduling and buffer sizing APIs; viewport integration uses the existing host (UI-09) |
| EC-06 | Reject persistence APIs/configuration and checker suppression/agent-created exceptions (UI-08/ST-06) |
| EC-07 | Editor build obligatorily invokes checker and genuine UI compilation; verify cannot omit the new application |

Record actual coverage and known static limitations at implementation. AST-level
inspection may use existing TypeScript tooling; no new testing infrastructure.
Manual review still owns whether a control fits its task, semantic token choices,
accessibility, focus behavior, overflow, visual quality and WebGL correctness.
The checker is a build gate, not a behavioral acceptance suite.

## Practical additions

Button: import Mantine Button, supply a clear label and action, inherit defaults.
Input: import the appropriate Mantine input, label it and bind UI state or an
explicit existing domain command; never write a domain rule in its handler.
Panel: use the shared Mantine Panel composition once available; until its task,
do not introduce a competing component early. No CSS is needed for these normal
cases. A viewport flex child that must shrink may require a local min-width/min-
height/overflow constraint; document it under the approved structural category,
keep decoration in Mantine wrappers, and let Render size the native buffer.
