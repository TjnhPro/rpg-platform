# Verification policy — BUILD ONLY

## Required automated checks

1. Lightweight static boundary/import inspection (`node harness/cli.mjs check`). Reports how many JS/TS source files were actually inspected. It is not an execution test.
2. Genuine project build of the changed project(s), `verify --projects ...`.
3. If a public API changes, compile/build impacted consumers (`--with-consumers`).
4. Optional Git diff scope review (`scope --projects ...`) if operating in a Git workspace.

## Prohibited by default

No generated unit/integration/e2e/UI/browser/Playwright/snapshot/visual regression tests, code coverage, exhaustive matrices or automatically running old test suites. No adding test dependencies. This is an explicit project decision, **not** a general claim that tests are useless.

## Honest completion status

- `ARCH_CHECK_PASS` only indicates the static rule scan found no listed violations in inspected JS/TS source/import metadata. Regex scanning can miss aliases, generated files, reflection or computed dynamic imports.
- `BUILD_PASS` requires the real command to exit 0. A new empty project and `build: null` cannot PASS.
- `BUILD_UNCONFIGURED`, `ARCH_CHECK_FAIL`, `BUILD_FAIL`, `SCOPE_FAIL`, `BLOCKED` must remain visible.
- `FEATURE_NOT_VERIFIED`: a green build says nothing definitive about gameplay, UI, runtime correctness, exploits or visual quality.

If new project languages or build systems are introduced, extend the checker **only to cover the real project**, not as a speculative framework. Manual runtime review remains Developer-owned.
