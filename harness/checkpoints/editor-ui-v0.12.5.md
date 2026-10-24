# Editor UI v0.12.5 — convention enforcement

Status: IMPLEMENTED; UI_CONTRACT_PASS; ARCH_CHECK_PASS; SCOPE_PASS; BUILD_PASS.
FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED for product behavior and appearance.
Developer phase acceptance remains open; no UI_PASS/MVP_PASS/READY_TO_MERGE.

## Preflight and scope

- Existing Phase12 branch: `feat/editor-ui-foundation-v0.12`, starting at
  v0.12.4 `171211b`. `gh pr status` found no associated/open Phase12 PR.
  Preserve the single-phase-branch/PR workflow and one capability/checkpoint
  commit. Developer authorized continuing without intermediate review pauses.
- Requested behavior: a real mandatory Editor build gate rejects forbidden UI
  controls/styles/imports instead of allowing compilation alone to count as
  convention compliance.
- Canonical primary production owner: **editor**. Harness only records this
  evidence. No other production collaborator or external L1/L2 API is needed.
- Read root/project AGENTS, ARCHITECTURE, harness OWNERSHIP/WORKFLOW/VERIFICATION,
  Editor package/tsconfigs, the locked v0.12.4 policy/checkpoint and current
  theme/entry/catalog/public-root/viewport-host source. Current source, rather
  than the task's historical bootstrap baseline, determines the implementation.
- Actual dependencies already include React19.3.1/Mantine9.7.3/Vite8.3.5;
  root TypeScript6.0.3 provides the compiler API. No installation is necessary.
  Editor build already contains the portable library compiler and UI compiler/
  Vite bundle. Existing UI has no authored stylesheet or inline-style violation
  requiring a sample migration.
- Reused tooling APIs: TypeScript createProgram/type checker, JSX/source AST,
  scanner and module resolution; Node filesystem/path/URL APIs. Mantine/React
  declarations establish symbol provenance without executing application code.
  Existing semantic tokens stay in `editor/ui/src/theme/theme.ts`, provider in
  `editor/ui/src/main.tsx`; no app/public gameplay/Render API is added or invoked.
- Existing internal `editor/src/viewport-host.ts` remains the sole browser
  observation/scheduling adapter using Render public roots. The checker prevents
  common React-side duplication; no host/Render implementation change is needed.
- Allowed/actual change paths are exactly the four files listed below. Expected
  gates: check, Editor scope with infrastructure, verify Editor (includes both
  legacy tsc and ui:build). No consumer builds are needed: public contract delta
  **none**; no boundary/schema/dependency ownership changes.

## Delivered files and behavior

1. `editor/scripts/check-ui-contract.mjs`: Editor-local AST enforcement of
   EC-01–07, path/line/rule diagnostics, nonzero on proven violations or inability
   to inspect inputs; uncertainty produces explicit manual-review warnings.
2. `editor/package.json`: add real ui:check; mandatory build chain is
   `npm run ui:check && tsc -b --force && npm run ui:build`. UI typecheck and Vite
   commands are preserved. Exact configured build/check commands are inspected.
3. `editor/docs/ui-styling-policy.md`: record actual coverage, source boundaries,
   supported structural CSS grammar, warning semantics and static limitations.
   Existing ST/EC policy is retained; no new exception is granted.
4. `harness/checkpoints/editor-ui-v0.12.5.md`: this evidence and handoff.

The exception list is locked empty. There are no override flags or scan-root
options. Scope is the new Editor UI source, styles and entrypoints; generated
`editor/ui/dist` and installed dependencies are excluded. Nested source is not
silently ignored. Legacy `editor/manual`, old domain styles, documentation
examples and other production projects are not retroactively convention-scanned.
Type declarations are read only for symbol resolution. Public-root isolation is
also maintained by the unchanged source/manifest diff and existing architecture/
build gates; this task does not introduce a repository-wide UI scan.

The checker uses AST/symbols for native controls, aliases, JSX/forwarded props,
simple spread/helper values, central theme/provider placement, imports and common
DOM persistence/viewport/style injection APIs. It checks CSS ownership before
imports, accepts bound local Module classes/slot mappings and inspects a restricted
flat structural CSS grammar. Unsupported grammar fails inspection. Unclassified
properties/dynamic constructs are reported for manual review, not assumed safe
and not used to authorize a policy exception.

## Observed ad hoc RED to GREEN evidence

Temporary untracked inputs were created with collision checks, then removed in
finally blocks. No scratch source, test, fixture or runner is retained/committed.
These were manual checker probes required by the supplied task, not a new suite.

| Temporary input / command | Actual observed result |
| --- | --- |
| Native button/input/select/textarea, helper/spread style, helper color, Box component=button, aliased second provider/theme, React raw factory, canvas width, localStorage, rAF and ResizeObserver | Checker exit1, 17 errors, diagnostics EC-01/02/03/05/06 with exact file/line and alternative guidance |
| Unauthorized ui-root CSS, body/input/private Mantine selectors, literal margin/color and !important | Checker exit1, nine EC-03 errors; catches stylesheet even without importing it |
| Mantine controls, semantic main/section/header/div/label, canonical responsive tokens, named canvas, harmless literal strings and ordinary data/local function names | Checker exit0, zero errors/warnings; no blanket native-HTML/name ban |
| Approved panel Module with zero shrink, overflow, containment and Mantine var() scroll padding; className and classNames bindings | Checker exit0, zero errors/warnings |
| Missing Module class binding | Checker exit1, EC-03 unknown-class diagnostic |
| Unresolved JSX props spread | Checker exit0 with one EC-03 manual-review warning; does not silently assume compliance |
| Intrinsic button hidden behind a JSX identifier alias | Checker exit1, EC-01 |
| `npm run build --workspace @rpg-platform/editor` with temporary raw button | Actual build exit1 at ui:check with EC-01; legacy tsc and UI bundle do not run |

The Module probe initially exposed a false positive for whitespace in
`var( --mantine-spacing-sm )`. Matching was corrected to mask a valid token before
checking remaining variable expressions; the same Module/class mapping then
passed. No policy weakening or allowance was added.

## Final automatic gates and scope audit

- `node harness/cli.mjs check`: exit0; ARCH_CHECK_PASS, **190 JS/TS files**.
- `node harness/cli.mjs verify --projects editor`: exit0; BUILD_PASS [editor].
  Observed mandatory ui:check reports **six code files**, zero authored styles,
  zero errors/warnings; five app source files plus Vite config. HTML entry is also
  inspected. Then actual `tsc -b --force`, UI `tsc --noEmit`, Vite8.3.5 bundle;
  **862 modules**, HTML0.45kB, CSS248.44kB, JS493.69kB. ui:build already ran inside
  verify, so no redundant standalone UI build is required.
- The unchanged Harness child-process launcher emitted Node DEP0190 without
  failing the build. No failed/unconfigured required project build remains.
- `node harness/cli.mjs scope --projects editor --allow-infra`: SCOPE_PASS.
  Final audit contains the four task paths plus the pre-existing untracked
  `.mcp.json`, left unchanged and excluded from the checkpoint commit.
- Diff/whitespace review: only the four paths above are staged. Zero delta in
  Editor UI sample/theme/entry, portable source/exports, manual hosts, compiler
  config, dependencies/lockfile, other production projects, external L1/L2,
  root package/Harness CLI/config or CI. No test infrastructure or new dependency.

## Limitations and handoff

The independent evidence above verifies the checker rejects the demonstrated
inputs and the build stops on an error. It is not product interaction/visual
evidence. No browser, screenshot, focus/contrast/overflow, canvas/native-buffer,
host lifecycle or WebGL review was performed. Those remain
FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED and Developer-owned.

Static analysis cannot prove arbitrary callback/data-flow behavior, reflection,
computed import destinations, custom wrapper behavior, server persistence,
semantic token choice or whether a Module is justified. Review all warnings;
no warning/static pass grants an exception. Checker/config edits themselves
remain reviewable source, not a security sandbox.

No missing public capability, blocker or exception request. Next is the separately
supplied v0.12.6 task, using the existing Editor theme/component/viewport-host
paths and mandatory ui:check. Do not implement the next capability early, add an
allowlist entry or alter the root checker to make a feature pass. No push, PR,
merge or phase acceptance is part of this checkpoint.
