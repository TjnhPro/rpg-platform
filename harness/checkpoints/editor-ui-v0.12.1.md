# Editor UI v0.12.1 — React and Mantine bootstrap

Status: IMPLEMENTED; BUILD_PASS; UI_NOT_VERIFIED; FEATURE_NOT_VERIFIED;
VISUAL_NOT_VERIFIED. No UI_PASS, WEBGL_VISUAL_PASS or phase acceptance claim.

## Preflight and owner

- Branch: feat/editor-ui-foundation-v0.12.
- Base: d2bd23160deffaa081333dafc5060fca939dd3d2 (v0.12.0 contracts).
- Intent: a real internal browser entrypoint, provider and typed production bundle.
- Canonical primary owner: editor. Harness is evidence only. No production
  collaborator or external L1/L2 API needs changing or consuming for the placeholder.
- Re-read root/project guidance, architecture, ownership, workflow, verification,
  v0.12.0 contracts, package/tsconfig, public root and existing viewport host.
  Route command identified Editor as an advisory hint; actual responsibility
  and source determine ownership. No existing PR at preflight.
- Actual baseline: tsc -b --force portable package with five-workspace graph,
  no UI dependencies/configuration; existing manual HTML hosts remain unchanged.
- Reused public surfaces: React createRoot/StrictMode; MantineProvider/Text and
  MantineColorSchemeManager. No new Editor or Render API is needed/consumed.
  Existing viewport-host.ts is inspected and preserved for the later task.

## Implementation and exact scope

| File | Change |
| --- | --- |
| editor/package.json | Preserve tsc -b --force; append mandatory ui:build; add ui:dev/ui:preview; pin Editor dependencies/tooling |
| package-lock.json | Editor-only dependency closure; no other workspace/root record changes |
| editor/ui/index.html | Dedicated editor-ui-root, browser module entry, document title and initial dark attribute |
| editor/ui/src/main.tsx | Single stylesheet import, guarded createRoot, StrictMode and sole provider, fixed nonpersistent dark manager |
| editor/ui/src/app/App.tsx | Mantine Text displaying Editor UI Foundation only |
| editor/ui/tsconfig.json | Separate strict noEmit JSX/Bundler config, isolated from portable composite NodeNext config |
| editor/ui/vite.config.ts | One React plugin/config, explicit file-relative UI root, relative assets and ui/dist output |
| editor/docs/tasks/editor-ui-v0.12.1.md | Supplied task content; trailing whitespace normalized |
| harness/checkpoints/editor-ui-v0.12.1.md | This evidence and approved compatibility decision |

No shell, theme override/createTheme, Panel, CSS module, viewport, feature logic,
router, state manager, persistence, server, tests or test runner added. The
provider uses Mantine's built-in theme at bootstrap; unified theme is v0.12.2.
The explicit no-storage manager also avoids default manager reads/subscriptions
to browser storage; forceColorScheme alone still initializes the default manager
in the installed source. No UI preference is persisted.

## Installed dependency rationale

Native environment: Node v24.18.0, npm 12.2.0, existing TypeScript 6.0.3.
All added direct dependency versions are exact pins:

- React/react-dom 19.3.1: application rendering; react-dom peer matches React.
- @mantine/core and @mantine/hooks 9.7.3: canonical components and required exact
  hooks peer; no optional Mantine feature packages.
- Vite 8.3.5: genuine asset bundler/dev/preview server; Node requirement
  ^20.19.0 or >=22.12.0 fits the root Node >=22.13.0 minimum and local runtime.
- @vitejs/plugin-react 6.1.2: standard React Vite integration/dev refresh; Vite8
  peer matches. No optional compiler/Babel peer packages requested.
- @types/react and @types/react-dom 19.3.0: JSX/render typechecking.
- @types/node 24.19.2: typed Vite configuration and Node tooling declarations.
  Portable Editor retains its existing empty types list and unchanged tsconfig.

Lockfile audit against the pre-install copy: only existing `editor` package
record changed; 69 new records are this dependency/platform-optional closure.
All previously existing dependency records, root record, other four workspace
records and foundation pins are unchanged. npm ls --workspace
@rpg-platform/editor --depth=0 exits 0 without invalid peers. npm install reports
0 vulnerabilities; that is package-manager output, not a security audit claim.

## Explicit Developer decision: UI-only optional property compatibility

Initial strict UI build failed with TS2320: Mantine 9.7.3 __InputProps declares
disabled?: boolean while React native input props declare disabled?: boolean |
undefined. Mantine interfaces extending both conflict under the repository's
exactOptionalPropertyTypes: true. Installed declaration locations:
@mantine/core/lib/components/Input/Input.d.ts:47 and
@types/react/index.d.ts (input/button disabled fields). Older published
Mantine 8.3.18 and 9.3.2 declarations were inspected; they retain this structure.
No dependency files were patched, aliased or suppressed.

Developer explicitly answered: "Cho phép ngoại lệ chỉ cho UI" to the proposal
to set exactOptionalPropertyTypes: false solely in editor/ui/tsconfig.json.
Applied exactly that exception. strict remains true, skipLibCheck remains false,
noUncheckedIndexedAccess and other inherited checks remain enabled. Root and
portable Editor configurations are unchanged; the exception is not a general
styling or future-checker exemption. No public/business contract delta.

The initial missing ReadonlySetLike error in Mantine hooks is independently
resolved by including ES2025.Collection library declarations in the UI config.
This supplies vendor types, not a polyfill or new runtime dependency; target
remains ES2022 and the placeholder does not use Set composition methods.

## Observed gates and finite evidence

- node harness/cli.mjs check: exit 0, ARCH_CHECK_PASS; 186 JS/TS files inspected.
- node harness/cli.mjs verify --projects editor: exit 0, BUILD_PASS [editor].
  Executes preserved tsc -b --force then genuine typed UI build/Vite bundle.
- npm run ui:build --workspace @rpg-platform/editor: exit 0 independently.
  TypeScript noEmit check precedes bundling; 859 modules transformed.
- npm run build --workspace @rpg-platform/editor: exit 0 independently;
  preserved legacy build and mandatory UI build both complete.
- node harness/cli.mjs scope --projects editor --allow-infra: exit 0,
  SCOPE_PASS. Staged path audit limits the checkpoint to the nine files above.
- All 42 pre-existing Editor declaration files were SHA256 compared before/
  after build: zero changes. No existing domain source, exports, root package.json,
  legacy tsconfig, other project or Harness CLI/config delta.
- Real output: editor/ui/dist/index.html; JS asset 261399 bytes, CSS asset
  248448 bytes. Output is git-ignored by existing dist/ rule and not committed.
- ui:preview bound 127.0.0.1:4173; HTTP 200 for HTML, JS (text/javascript) and
  CSS (text/css). ui:dev bound 127.0.0.1:5173; HTTP 200 for HTML and transformed
  main.tsx/App.tsx. Both temporary server sessions stopped after inspection.
  HTTP delivery does not demonstrate React execution, visual appearance or HMR.
- Initial BUILD_FAIL is retained above with its resolved cause. Unchanged
  Harness launcher emitted Node DEP0190 warning; final build still exited 0.

## Manual use and handoff

From repository root:

```sh
npm run build --workspace @rpg-platform/editor
npm run ui:dev --workspace @rpg-platform/editor
# Or serve the built bundle:
npm run ui:preview --workspace @rpg-platform/editor
```

Browser rendering, console errors, keyboard/accessibility, visual acceptance,
WebGL and HMR have not been verified. No browser/test suite was run. No canvas
exists yet, so no rendered Scene claim is possible. ui:check remains explicitly
NOT_CONFIGURED until its assigned v0.12.5 task; no fake checker was introduced.
Public contract delta: none; current upstream API blockers: none after the
approved compiler compatibility decision. Continue with supplied v0.12.2 task
on the same branch; no next capability is implemented early. Existing untracked
.mcp.json is outside this checkpoint and unchanged. No push/PR/merge performed.

Framework setup was checked against the official
[Vite guide](https://vite.dev/guide/) and
[Mantine Vite setup](https://mantine.dev/guides/vite/), plus installed package
metadata/declarations. Version compatibility evidence is the genuine local
typecheck/build, including the explicitly documented optional-property exception.
