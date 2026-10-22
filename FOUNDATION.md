# Foundation initialization record — 2026-10-22

## Authorized scope and ownership

The Developer's INIT PROJECT request authorizes five-project Foundation setup,
external L1/L2 integration, builds and creation/push of the public rpg-platform
repository. Root workspace tooling owns dependency preparation and orchestration.
Runtime Engine is the canonical owner of L1/L2 composition; Render owns only its
presentation boundary. Editor and Client consume both public roots; Server consumes
Engine. Each project is touched only to establish a real package/source/build
boundary. There is no gameplay behavior change.

The supplied Harness was already extracted at the workspace root. All supplied
Harness documents, registry and CLI were inspected. No implementation or existing
Git repository was present. The initial README described an unconfigured proposal;
it is replaced with actual setup instructions. Harness dependency permissions,
project AGENTS.md, ownership rules and CLI remain unchanged. Config supplies the
new private package identities and genuine build commands. No architecture/source
conflict was found after examining the non-default Gameplay main branch.

## External repository audit

| Foundation | Audited branch | Package version | Exact revision |
| --- | --- | --- | --- |
| [L1 RPG Core](https://github.com/TjnhPro/rpg_core/tree/04b7239f998c3c688a0dfa3202f11811a9acd775) | main (default) | 2.0.0 | 04b7239f998c3c688a0dfa3202f11811a9acd775 |
| [L2 RPG Gameplay](https://github.com/TjnhPro/rpg_gameplay/tree/acea332aa80f67552192a72b30f81c0bbbfc56bd) | main | 0.15.2 | acea332aa80f67552192a72b30f81c0bbbfc56bd |

Branch and tag inventories and release lists were audited via GitHub API. Neither
repository had tags or GitHub Releases at audit time. Core README calls 2.0.0 a
release candidate; `private: true` remains set. Gameplay's default branch `master`
at b118e1a72644e364b4097f894882b40fdca1ba8a is a 0.0.0-harness-foundation scaffold,
without production exports/build. Therefore default-branch installation is unsuitable.
The pinned Gameplay `main` commit has actual root exports, source/build and a
peer dependency on Core 2.0.0. Its `harness/core-pin.json` pins the same Core revision
selected here. Gameplay's README records State Archive Developer acceptance pending;
consuming this artifact does not assert upstream feature acceptance.

Core exposes 11 package entrypoints (root, contracts, stats, modifiers, combat,
damage, skills, effects, mechanics, spatial, kernel). This workspace permits only
`@rpg/core/kernel`. Runtime Engine imports actual `calculateStats` from that surface;
Core Legacy Gameplay entrypoints are not used. Gameplay exports its package root
only; Runtime Engine imports actual `createGameplayRuntime` from `@rpg/gameplay`.
No foundation symbol is re-exported as a new Platform domain contract. Other public
symbols were inspected through both repositories' public index files; none are
needed for initialization.

## Supported artifact path and reproducibility

Both manifests support npm packing and compile ESM/declarations into `dist`.
Core's prepack builds; Gameplay's prepack builds after its documented
`core:prepare` and `npm ci --ignore-scripts` setup. The Platform preparer uses
Gameplay's unchanged `core:prepare` command, which fetches exact Core, installs its
locked toolchain, builds with LF output and verifies the Core tarball SHA-512 against
Gameplay's lockfile. It then installs Gameplay's lockfile, runs its genuine `build`
and invokes `npm pack --ignore-scripts` after that explicit build.

Both final tarballs must match [harness/foundation-pins.json](harness/foundation-pins.json)
before copying to ignored `.artifacts/`. Root `package-lock.json` locks these same
artifacts and TypeScript 6.0.3. Node 24.18.0 and npm 12.2.0 are the reproducible
build toolchain, also selected in CI. No mutable branch is an install dependency.
Temporary checkouts contain downloaded external code only during reconstruction;
existing L1/L2 repositories are never edited. Generated artifacts are never committed.

## Verification interpretation and open decisions

Observed local gates on Node 24.18.0 / npm 12.2.0:

| Gate | Result |
| --- | --- |
| Exact-revision external artifact builds and repeated SHA-512 reconstruction | PASS |
| Workspace `npm ci --ignore-scripts --no-audit --no-fund` | PASS |
| Harness architecture check | ARCH_CHECK_PASS, 5 source files inspected |
| runtime-engine independent build | BUILD_PASS |
| runtime-render independent build | BUILD_PASS |
| editor independent build | BUILD_PASS |
| game-client independent build | BUILD_PASS |
| game-server independent build | BUILD_PASS |
| Whole workspace `npm run build -- --force` | BUILD_PASS |
| Harness scope (all five projects + infrastructure) | SCOPE_PASS |
| `npm ls --all` | PASS, one deduplicated Core 2.0.0 |

No unconfigured or failed build remains. The unchanged Harness emits Node's
DEP0190 shell deprecation warning on Windows; build commands are fixed configuration
and all exited successfully. GitHub Actions independently rebuilds from a fresh Linux
checkout; its result is available on the repository's commit checks.

Required commands and independent builds are documented in README. The source
entrypoints are intentionally minimal; successful compilation resolves named
foundation imports with `skipLibCheck: false` and emits real JS/declarations.
An empty Render public module is a boundary scaffold, not a renderer implementation.
No Three.js dependency or UI framework is selected in Foundation.

Open until actual MVP evidence: game-specific schemas, content format/ownership,
scene identity/coordinates, presentation adapters, lifecycle composition, UI framework,
render configuration, authority/protocol, persistence and settlement policy.
Server's permitted Render dependency is intentionally unused. There are exactly five
projects; root and Harness contain tooling only. No Player/Monster/Skill/Item model,
Rule DSL, gameplay implementation, renderer feature or Client/Server infrastructure
is introduced. No tests, UI verification, E2E suite, release or package publication.
Manual functional/visual review and completion acceptance belong to Developer.
