# Minimal working Editor UI Foundation — v0.12.9

This is the internal React + Mantine UI Foundation application, not an Asset,
Scene or gameplay editor. Navigator paragraphs, Inspector values, notifications
and Status errors are labeled temporary UI examples. Nothing is saved. The
center canvas uses the real existing Editor viewport host and Render backend.

## Run locally

From the repository root with workspace dependencies installed:

```sh
npm run ui:dev --workspace @rpg-platform/editor -- --host 127.0.0.1
```

Open the local URL printed by Vite. The finite development session recorded in
the checkpoint used `http://127.0.0.1:5173/`; the server is not kept running.
For a production bundle served locally:

```sh
npm run ui:build --workspace @rpg-platform/editor
npm run ui:preview --workspace @rpg-platform/editor -- --host 127.0.0.1
```

Use the preview URL printed by Vite; its port can differ from development.
The portable package remains separate from the browser entry. Required gates:

```sh
node harness/cli.mjs check
node harness/cli.mjs scope --projects editor --allow-infra
node harness/cli.mjs verify --projects editor
```

Editor verification includes `ui:check`, portable package compilation, UI
typechecking and the Vite production build. No browser runner or test suite is
required or supplied. A successful build does not establish UI behavior.

## Manual UI walkthrough

1. At desktop size (for example 1440×900), inspect the single Header/Toolbar,
   Navigator, Workspace, Inspector and Status shell. Inspector initially shows
   Controls. Its pressed mode button and the selected catalog tab expose active
   states. There is one main landmark and one canvas.
2. In Inspector's Controls and actions tab, edit the labeled text, number,
   selection, checkbox and switch examples. Clear Sample text and use Start
   sample operation: expect a labeled error and no pending operation. Restore
   valid text, use Start: expect a loading button, disabled fields, enabled
   Finish and explicit pending guidance. Finish ends only this local example;
   the notification explicitly says nothing was saved. Unavailable action stays
   disabled. Scrolling the Inspector body may be needed to reach these controls.
3. Open Sample actions. The unavailable menu item stays disabled. Show sample
   error selects Feedback patterns and shows an illustrative error notification.
   Inspect empty, unavailable, invalid and disabled feedback; dismiss the notice.
   In Controls and actions, Remove sample entry… opens a confirmation with Cancel
   focused. Cancel/Escape leaves the entry; confirming removes only the temporary
   entry, and Restore sample entry restores it.
4. Select Panel states in the Inspector header. Next example cycles empty →
   loading → error → read-only, using the shared EditorPanel. Loading is manually
   advanced, never an actual pending backend task. The read-only property can be
   copied. Controls returns to a fresh catalog. Clear sample error in Status
   restores the local ready status; Show sample error restores its example.
5. Use Show long sample in Navigator. Scroll its body to the end; header,
   actions and footer should stay visible, with no document overflow or new
   canvas. Inspector also owns its body scroll independently of its header/footer.
6. Resize to a narrower window (for example 390×844). Docks become Open navigator
   and Open inspector dialogs, and toolbar/viewport controls wrap. Open Inspector,
   scroll its body and open the sample confirmation. The first Escape closes
   only confirmation; the second closes Inspector and returns to the toolbar.
   Shell uses Mantine Modal.Stack for modal ordering and Escape/focus handling.
   Catalog state is intentionally local: switching away, moving between dock and
   dialog, closing the dialog or reloading can reset it. App-level mode/state and
   the central viewport have their existing separate lifetimes; no persistence.

## Single-token demonstration

In development only, record computed border radii of the Inspector Controls
Button, Sample text input and Inspector Panel's outer Paper. Change exactly
`editorTokens.radius` in `ui/src/theme/theme.ts` from `sm` to `md`. The existing
single MantineProvider should propagate the same default radius to all three;
no component-specific override or second provider is needed. In the observed
session all changed **4px → 8px**. Restore `sm` afterward: all returned to 4px.
Theme HMR can reload this temporary application, so start a fresh graphics mount
after this exercise. The committed token remains `sm`.

## Real viewport walkthrough

- Before Acquire, mounting alone means no graphics; Frame is unavailable and
  submissions are zero. Acquire is explicit and admitted once per mount. On a
  compatible WebGL2 browser the host can submit its initial resize demand. Frame
  requests one additional submission; counters are receipts, not display proof.
- Inspect the canvas itself. The current content-free backend clears blue. A
  visible blue clear is WebGL pixel evidence only; there is no Scene, Camera,
  sprite, animation or VFX content in this UI MVP. `Display: NOT_VERIFIED` remains
  intentionally conservative in the application.
- Resize CSS width/height and inspect the host's accepted CSS, DPR and buffer
  metrics against the canvas native width/height. Change display scaling/zoom or
  use browser DPR emulation **with a layout resize**. Render alone applies DPR;
  UI must never assign bitmap sizes. The checkpoint records emulation, not a
  real multi-monitor observation. DPR-only event delivery remains unverified.
- Suspend then Resume explicitly. A hidden/zero-size canvas pauses the existing
  host; restoring size alone need not resume it. Use Resume when offered. At very
  short heights controls can consume all canvas space; use workspace scrolling
  or a taller window. Do not infer a usable drawing area from a mounted target.
- Unmount viewport: expect the target removed and controls disabled. Mount
  viewport creates a fresh target, initially unacquired. Acquire/Frame should
  work again when the dependency is available. Disposal observations do not
  prove physical GPU memory reclamation or absence of all leaks.
- For dependency failure review, use a browser without WebGL2 or developer-tools
  network request blocking for the actual dynamically loaded backend, then a
  fresh reload/acquisition. Expect a safe classified diagnostic or UNRECOGNIZED,
  no raw exception, automatic retry or UI-renderer fallback. This checkpoint did
  **not** induce unavailable-WebGL2, backend import failure or cleanup failure.
  Native context loss was induced on the existing real context: CONTEXT_LOST
  appeared, Frame/Resume/Acquire became unavailable, and explicit Unmount/Mount
  allowed a new acquisition. No Render capability was mocked.

## Evidence and limits

See [the checkpoint](../../harness/checkpoints/editor-ui-v0.12.9.md) for observed
gates and measurements, separately labeled STATIC_PASS, BUILD_PASS,
UI_INTERACTION_OBSERVED, WEBGL_PIXELS_OBSERVED and NOT_OBSERVED. Those bounded
observations do not establish all-device visual quality, accessibility acceptance,
product workflows, deployment or Phase 12 acceptance. Developer owns that review.
No public exports, authored schema, business API or other project's production
code is changed by this MVP.
