# Component usage and default rules — v0.12.7

Canonical owner: Editor. This is an internal React/Mantine usage contract, not a
new package or portable Editor API. Follow the [foundation contract](ui-foundation-contract.md)
and [styling policy](ui-styling-policy.md). The application entry now mounts the
shell/standard Panel demonstration. The v0.12.3 ComponentCatalog remains a
separate source example; the older ThemeSample was replaced at that checkpoint.

## Standard Panel composition

`editor/ui/src/components/panel/EditorPanel.tsx` is the only Panel primitive.
Use it for Navigator, Inspector, Properties surfaces and Status. It composes
Mantine Paper, heading/Text, Stack/Group, Divider, ScrollArea and Alert/Loader;
it introduces no control wrapper, feature-specific Panel, form engine, theme
provider, renderer, registry or domain schema. Named PanelHeader/Body/Footer
exports are unnecessary: one typed props contract fixes their order and ownership.

| Prop | Internal presentation contract |
| --- | --- |
| `title: string` | Required plain-text accessible region heading; never a clickable title or hidden command |
| `subtitle?: string` | Optional description associated with the Panel region |
| `actions?: ReactNode` | Mantine controls in a named header action group; each Button has visible text, each ActionIcon needs its own aria-label |
| `children?: ReactNode` | Body contents, including Mantine section/form compositions; no business behavior inferred |
| `footer?: ReactNode` | Optional non-scrolling footer; status/help/actions follow the same control rules |
| `state?: EditorPanelState` | Discriminated `ready`, or `empty`/`loading`/`error` with a required safe message; default ready |
| `readOnlyReason?: string` | Visible Read-only explanation; presentation, never a permission check or automatic command blocker |
| `variant?: 'standard' \| 'status'` | Default standard fills a constrained flex slot. Status is intrinsic-height for the bottom shell slot, with the same heading/actions/body/footer semantics and compact textual feedback |

Empty is neutral, loading has a named pending message plus Mantine Loader, and
error has safe alert text and the semantic error palette. Status variant uses a
compact labeled Text for feedback; the shell already owns the live status region.
Use an actual owner result for real work. The demo explicitly labels its loading
as illustrative and provides Next example; no timer, network work or progress is
invented. Supply recovery controls through actions/footer when meaningful.

Read-only callers must pass `readOnly` to readable Mantine fields and independently
enforce owner authorization for commands. Do not silently disable copy/inspection
or assume a visual badge can prohibit mutation. The sample Properties Fieldset
contains a read-only TextInput; it is not a Properties editor implementation.

Panel children retain their React position while feedback changes. A hidden body
is not disposal, cancellation or a Render lifecycle command. Scrolling never
conditionally mounts children. A future live viewport must retain its own proper
host lifecycle and explicit hidden/resume policy; this task connects no host.

### Sizing, sections and escape rules

- The shell supplies a constrained, shrinkable flex slot; standard Panel owns its
  body ScrollArea. Keep header/footer outside that scrollport. Do not wrap a
  complete standard Panel in another scrolling container: that would scroll its
  heading/actions/footer. Panel min-block/min-inline sizes are zero, not fixed
  panel heights. Long body contents scroll instead of enlarging the page/grid.
  The approved v0.12.7 shell delta removes the former dock ScrollAreas and makes
  the full-screen Modal content/body shrinkable flex containers through its
  public Styles API. Main workspace scrolling remains shell-owned. These layout
  rules live in the existing `styles/layout/shell.module.css`; Panel rules stay
  in `styles/panel/panel.module.css`.
- The status variant sizes to short status content. Keep it brief; diagnostics
  histories belong in a constrained standard Panel rather than a tall app footer.
- Panels belong in shell slots. Use Mantine Stack, Divider, Fieldset, Accordion
  or headings for sections within a body; do not create nested scrolling Panels
  for each property, feature-specific PanelX wrappers, or a parallel header div.
- Titles remain text. Put title-related navigation/actions in explicit named
  Mantine controls in `actions`; never put onClick/role=button on the heading.
  This Panel has no drag/drop, collapse, persistence or docking behavior.
- For scroll-body mechanics, use Mantine props first. The only added Module is
  `editor/ui/src/styles/panel/panel.module.css`, inside the locked
  `styles/panel/**/*.module.css` area (the task's optional flat filename is not
  an exception to that existing path policy). Its `.panel` flex column/shrink/
  overflow containment, `.body` flex/shrink, `.status` intrinsic flex column/
  inline containment and `.statusBody` inline shrink rules contain no decoration.
  Mantine supplies ScrollArea overflow; Box props do not expose overflow and the
  supported min-height/flex props alone do not contain a complete Panel region.
- No `className`/style overrides or forwarded arbitrary control props are exposed
  by EditorPanel. A missing layout need requires a concrete scoped decision,
  not custom feature CSS, private Mantine selectors, inline styles or another
  Panel implementation. Decoration/spacing use the existing theme/tokens only.

Current app examples: Navigator normal actions and a switchable 30-paragraph
layout sample; Inspector cycles empty/loading/error/read-only Properties;
bottom Status starts with an explicitly illustrative error and can be cleared.
All sample state lives in App, survives responsive slot remounts and resets on
reload. No authored document, selection model, IO or Runtime state is connected.
See the [v0.12.7 checkpoint](../../harness/checkpoints/editor-ui-v0.12.7.md)
for finite scrolling/responsive observations and remaining acceptance limits.

## Default path

Import controls directly from `@mantine/core`. Repeated defaults belong only in
`editor/ui/src/theme/theme.ts`, under the existing sole provider. Do not add
EditorButton/EditorTextInput/EditorSelect wrappers or another form/control kit.
Use Stack/Group and the existing `editorTokens` aliases for composition. Omit
local size, radius, font and color props unless a documented semantic role needs
one. Do not add CSS overrides, literal color/spacing values or inline styles.

| Need | Mantine component | Prescribed props | Feedback contract | Forbidden workaround |
| --- | --- | --- | --- | --- |
| Main action | Button | Inherit filled/primary/sm; explicit label and handler; `type="submit"` only for form submission | `loading` while pending; prevent repeated submission and explain the pending state | Custom button, clickable div, style-only wrapper, fake primary variant |
| Neutral action | Button | `variant="default"`; inherit sm | Label describes cancel, finish or secondary action; explain unavailability outside a disabled control | Independent gray CSS or a second button implementation |
| Destructive action | Button or Menu.Item | Filled Button plus `color={editorTokens.colors.error}`; verb/object label; Menu.Item uses same semantic palette | Open a named Mantine Modal first; disclose target/consequence, focus Cancel, mutate only on explicit confirmation | Instant deletion, color-only warning, native confirm dialog or custom overlay |
| Compact icon action | ActionIcon | Inherit sm/default; `aria-label` names the action | Disabled/loading semantics as for Button; tooltip may supplement the accessible name | Unnamed icon, placeholder glyph, added icon framework without approval |
| Text / multiline | TextInput / Textarea | Visible `label`, controlled `value`/`onChange`; `required` when meaningful | `description` for guidance, `error` for a specific correction; disabled or readOnly by meaning | Placeholder-only label, raw input/textarea or local style wrapper |
| Number | NumberInput | Visible label; `value: string \| number` / `onChange`; bounds/decimal policy only as required by the actual owner | Preserve empty/intermediate string state; show correction text rather than coercing empty to zero | TextInput with parseInt/Number in its change handler, copied gameplay validation |
| Option selection | Select | Labeled controlled `string \| null`; explicit `data`; `clearable` only when null is handled | Placeholder is an instruction, disabled options remain visibly unavailable; loading/error text is separate from empty options | Raw select, DIY dropdown, silently choosing the first option |
| Selection membership / consent | Checkbox | Labeled `checked`/`onChange(event.currentTarget.checked)` | Description explains selection; errors are associated text, not color alone | Switch used for set membership; raw checkbox |
| Immediate boolean setting | Switch | Labeled `checked`/`onChange(event.currentTarget.checked)` | Explain immediate effect and unavailable state | Checkbox used as an unlabeled setting, custom toggle |
| Related local views | Tabs | Controlled `value`/`onChange`; named Tabs.List; stable matching Tab/Panel values | Preserve Mantine arrow navigation, focus and tab-panel relationships | Styled links/divs with DIY keyboard code; invented size prop |
| Contextual action list | Menu | Controlled `opened`/`onChange`; named Button in Menu.Target and labeled Menu.Dropdown | Click trigger, keyboard activation, Escape and return focus; disabled item states | Hover-only menu, custom popup/listener/focus handling |
| Confirmation / dialog | Modal | Controlled `opened`/`onClose`; visible `title`, contextual `closeButtonProps` label and description | Mantine owns overlay/trap/return focus; Cancel is initially focused for destructive confirmation | Homemade overlay/focus trap, disabled Escape without justified flow |
| Operation outcome | Notification | Safe `title` and message; success/error semantic palette; `role="status"` for routine result, `role="alert"` for actionable error | If dismissible, opt into `withCloseButton`, name close button and handle `onClose`; retain recovery guidance until dismissed | New notification package/store, color-only result, raw exception/stack, fake success |
| Persistent empty / unavailable / error | Alert + Text + optional Button | Named title, semantic neutral/warning/error palette, relevant action when available | Distinguish no entries, unavailable capability and failed operation in words | Treat empty as an error; show an enabled action with no implementation |
| Pending operation / live status | Button loading, Notification loading, Text | Keep operation label, expose pending text via `role="status"`; disable conflicting controls | Tie loading to actual pending state; retain values and expose an appropriate completion/cancel path | Arbitrary timeout presented as real work, fake progress, perpetual spinner without explanation |

`primary`, `neutral` and `destructive` above describe intent. They are not custom
Mantine variant strings: use native `filled` / `default` plus the semantic palette.
The catalog uses only text action labels because no external icon set is approved.
Mantine's built-in indicators and close/number controls remain library-owned.
ActionIcon defaults are prepared centrally; do not render a pretend icon just to
populate the catalog. Use a labeled Button until approved icons exist.

## Central defaults and API limits

| Default | Source / consumers |
| --- | --- |
| `editorTokens.controlSize = sm` | Button, ActionIcon, Input, TextInput, Textarea, NumberInput, Select, Checkbox, Switch |
| Button filled | The primary theme palette is inherited; submit buttons explicitly opt into `type="submit"`; other native Buttons inherit Mantine's button type |
| ActionIcon default | No icon dependency or icon wrapper is introduced |
| Tabs default variant, keyboard activation | Mantine supplies tab sizing; it has no control `size` prop |
| Menu click trigger, Escape, return focus | Menu.Item font uses `editorTokens.textSize`; root has no control `size` prop |
| Modal centered, focus trap, Escape, return focus | Keep Mantine defaults for dialog width; `Modal.size` is width, not the sm control contract |
| Notification bordered, no close button by default | Dismissible usages explicitly supply close state/callback and accessible label; no fake size prop |
| Alert light variant; Text sm | Inherit existing theme typography, radius, palettes, spacing and reduced-motion behavior |

Labels, error/description text, callbacks, controlled values and intentional
semantic variants belong at the usage site. They are not style-only wrappers.
No new token scale, CSS, provider, global store, generic form engine, authored
schema or business API is needed. Theme defaults do not disable Mantine focus
indication or replace its built-in keyboard behavior.

## Form and feedback conventions

- Use a semantic form with `onSubmit` and a submit Button; other Buttons remain
  `type="button"`. Handle submission once, preserve values on failure and guard
  pending submission. Use Mantine Fieldset to disable related input controls.
- A visible label names each field. Placeholder gives an example/instruction,
  never a current value or the only accessible name. Description explains
  constraints before entry; error states identify the field and correction in
  safe text. Asterisk/`required` expresses a real requirement, not a style choice.
- Show input errors after a submit attempt or justified interaction, then update
  them as values change. Domain validation must come from its current owner API;
  the catalog's required text/option and 1–10 integer are explicitly demo-only.
  The sample form uses `noValidate` so its labeled Mantine errors demonstrate
  this path without a competing browser validation popup.
- `loading` means pending, `disabled` means unavailable, `readOnly` means readable
  but not editable. Explain why an action is unavailable in visible text; a
  disabled control cannot be relied on to receive focus or show a tooltip.
- Routine updates use a polite status region. Actionable errors use safe alert
  text, preserving input and providing a meaningful next step. Do not announce
  every keystroke, invent saved/committed claims or expose raw internal errors.
- Destructive confirmation identifies the target, scope and recovery consequence.
  Cancel, close, outside click and Escape do not mutate data. Focus Cancel via
  `data-autofocus`; leave focus trap/restoration to Mantine. Real feature commands
  will use their owner API; this task changes only a temporary sample flag.
- Do not implement raw `<input type="file">`. A future need must first be checked
  against Mantine FileInput/FileButton. Any necessary raw-file-input exception
  needs concrete evidence and Developer approval; no exception is granted here.

## Manual catalog and review recipe

Run `npm run ui:dev --workspace @rpg-platform/editor` and open the printed URL.
The root App mounts the shell/Panel demo described above. For the earlier catalog,
`editor/ui/src/components/ComponentCatalog.tsx` remains the source reference for
these v0.12.3 recipes; it is not mounted by the current entry. All catalog data and
state are local examples, reset by reload; no Runtime/Render/Editor domain API,
storage, timers or network is connected.

1. Review primary, neutral, destructive and disabled Buttons. Compare inputs,
   numeric steppers, Select, Checkbox and Switch; all omit local size/style props.
2. Use Tab/Shift+Tab to inspect visible focus and field labels/descriptions. Edit
   text, clear text/number/Select and submit by keyboard or Button: error text must
   identify corrections; no page reload or operation start on invalid values.
3. Enter valid values and start the sample operation. Inputs become unavailable,
   the submit Button loads and status explains how to finish. This is a manually
   held demonstration, not asynchronous work. Finish sample operation clears
   loading, preserves values and shows a dismissible success notification.
4. Toggle Checkbox and Switch and observe their textual summaries. Switch tabs
   with arrow keys. Feedback examples show empty, unavailable, invalid/readOnly
   and disabled states. Show sample error, inspect recovery text and dismiss it.
5. Open Sample actions using keyboard; inspect disabled item and error action.
   Escape/outside click closes the menu. Open Remove sample entry from Button or
   Menu. Check dialog title/description, Cancel focus, focus containment and return.
6. Cancel/close/Escape must preserve the entry. Explicit confirmation removes only
   the temporary entry; Restore sample entry enables it again. Verify labels,
   contrast, focus, wrapping and readability at the Developer's target sizes.

These are Developer manual observations to collect, not generated browser tests.
No automated unit/integration/browser/visual suite is added or run. Build success
does not establish interaction, accessibility, computed style or visual quality.
See [checkpoint evidence](../../harness/checkpoints/editor-ui-v0.12.3.md) for actual
gates and remaining FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED limitations.

API references: installed Mantine 9.7.3 public declarations, plus official
[default props](https://mantine.dev/theming/default-props/),
[NumberInput](https://mantine.dev/core/number-input/),
[Tabs](https://mantine.dev/core/tabs/), [Menu](https://mantine.dev/core/menu/),
[Modal](https://mantine.dev/core/modal/) and
[Notification](https://mantine.dev/core/notification/) documentation. Installed
types remain authoritative if documentation targets a newer release.
