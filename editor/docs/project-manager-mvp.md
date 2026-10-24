# PM10 — Project Manager manual MVP

Prerequisites: install existing pinned dependencies and build Editor. No new
dependencies, runner or test suite. Run from repository root:

```powershell
node harness/cli.mjs verify --projects editor --with-consumers
node editor/manual/project-manager-mvp.mjs
node editor/manual/project-manager-host.mjs
```

The last command prints a loopback URL and fresh temporary directory. Open that URL
in a browser. Ordinary Vite/static hosting has no filesystem capability; its panel
reports unavailable and disables IO instead of pretending to save in memory.
Each host launch allocates new game-a/game-b roots; it is a finite demonstration,
not a persistent project directory picker. Retained files can be inspected at the
printed path. No automatic deletion of authored/temp evidence on shutdown.

In Project Manager choose game-a, enter a name, Create (Unsaved), Save (actual
publication), Open (read from disk). Choose game-b, repeat, then choose game-a and
Open again. The two live sessions remain independent. Open never replaces a dirty
session; Create refuses an already-open slot. Clean successful Open replacement
explicitly closes only the prior clean slot. Browser unload warns if any slot is
unsaved. Name is create-time metadata; no extra edit/close/wizard controls.
Only Create/Open/Save, root selection, name, active identity/status are added to
Phase12's existing Navigator slot; same theme, EditorPanel, Mantine controls,
spacing/color tokens and ui:check. No feature stylesheet or GPU acquisition.

Save publishes only project.json. This host uses same-directory exclusive temporary
files, closes complete bytes then atomically hard-links to an absent destination.
Existing target produces conflict; there is no read/check/rename CAS. File updates
are **unsupported**: revision precondition on create-only returns blocked
CONFLICT_UNDETECTABLE, and the UI reports that result. No power-loss durability
claim. Unknown write outcome quarantines the canonical DocumentSession; no retry or
reconciliation. Cleanup removes only owned temporary files after definitive outcomes,
retains uncertain artifacts; never deletes destination. Browser bridge performs
host cleanup before returning receipt; client cleanup is not separately configured.

Host authorizes one literal flat project.json per fresh host-owned root; rejects
foreign binding/project IDs and all other paths. It rechecks root realpath/type,
refuses symlink files on read, bounds UTF8 input, retains exact decoded text, and
does not expose arbitrary user paths. Its trust boundary assumes this user's OS
account/root ancestors are trusted not to replace directory topology concurrently.
It does not claim a secure sandbox against hostile same-account symlink/junction
TOCTOU attacks. Hard-link conditional publication still enforces target absence
against concurrent target writers. Portable ResourceLocator alone proves neither
permissions nor containment. Browser receives only explicit same-origin root
capabilities; Node host listens on 127.0.0.1 with Host/Origin checks, capability token
and JSON-only writes. No CORS permission or arbitrary physical root selection.

## Observed evidence (2026-10-24)

Finite CLI invocation exited 0 at root
`C:\Users\admin\AppData\Local\Temp\rpg-project-manager-ch9HXH`:

- A/B actual project.json files committed, cleanup cleaned, dirty false.
- Repeated absent writes conflicted; revision replacement blocked without overwrite.
- Close then Open retained IDs, metadata/description, Assets logical root; A retained
  scene-main/start reference, B documents empty/activeScene null. Reopen clean at
  savedRevision1. Scene file was deliberately not created/read: NOT_CHECKED.
- Foreign B reference in A rejected DOCUMENT_PROJECT_MISMATCH; expected B through
  A root rejected root-mismatch; both snapshots unchanged. Editing A left B Game B.

Separate same-origin HTTP bridge observations at temporary root
`C:\Users\admin\AppData\Local\Temp\rpg-project-manager-cDtO8K`: UI asset GET 200;
real Save committed and Open retained Unicode name `Dự án A`; foreign binding and
foreign Origin received 403. This is HTTP/API evidence, **not browser interaction**.

Actual check/scope/verify --projects editor --with-consumers passed, including
11 UI source files, 3 unchanged stylesheets, zero UI checker errors/warnings,
TypeScript and Vite. Existing bundle-size and harness DEP0190 warnings remain.
Computer-use inventory returned no browsers; opening iab returned
`Browser is not available: iab`. Therefore CORE_IO_OBSERVED / UI_BUILD_PASS /
UI_NOT_VERIFIED / VISUAL_NOT_VERIFIED; no MVP_FULLY_VERIFIED or Developer acceptance.
No Playwright/browser automation suite or WebGL scenario was executed.
