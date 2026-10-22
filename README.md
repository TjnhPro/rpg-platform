# RPG Platform — Foundation Workspace

Exactly five private npm workspace projects. This is Project Initialization only.
No gameplay, renderer implementation, Editor UI, Client/Server features or network
architecture is provided. Developer product review and acceptance remain pending.

## Setup and build

Use Git, Node **24.18.0** (`.node-version`) and npm **12.2.0**.

```sh
npm run foundations:prepare
npm ci --ignore-scripts --no-audit --no-fund
node harness/cli.mjs doctor
node harness/cli.mjs check
node harness/cli.mjs verify --projects runtime-engine,runtime-render,editor,game-client,game-server --with-consumers
npm run build -- --force
```

Preparation works before workspace dependencies are installed. It reconstructs
supported npm tarballs from exact external commits in temporary checkouts, verifies
SHA-512 against `harness/foundation-pins.json`, and stores them in ignored
`.artifacts/`. Cached artifacts must match the pinned bytes. No external source is
vendored, modified or imported directly. Initial setup requires GitHub and npm
registry access. Do preparation before `npm ci`: these private upstream packages
have no published registry/release artifact in the audited repositories.

Each project has its own genuine build, for example:

```sh
npm run build --workspace @rpg-platform/editor
# or, from editor/: npm run build
```

TypeScript project references build required upstream projects first, so any one
project can be built from a clean output tree after workspace installation.
`npm run build -- --force` compiles all five projects even if cached output exists.
Outputs are project-local `dist/` JavaScript/declarations/build metadata and ignored
by Git. No root runtime package or sixth production project exists.

## Structure

```text
runtime-engine/  package.json, tsconfig.json, AGENTS.md, src/index.ts
runtime-render/  package.json, tsconfig.json, AGENTS.md, src/index.ts
editor/          package.json, tsconfig.json, AGENTS.md, src/index.ts
game-client/     package.json, tsconfig.json, AGENTS.md, src/index.ts
game-server/     package.json, tsconfig.json, AGENTS.md, src/index.ts
harness/         supplied architecture tooling + pinned dependency preparation
.github/workflows/build.yml
package.json, package-lock.json, tsconfig.json, tsconfig.base.json
AGENTS.md, ARCHITECTURE.md, README.md, FOUNDATION.md
```

## Actual dependency graph

Arrows mean "consumes public package API".

```text
runtime-engine -> @rpg/core/kernel (L1), @rpg/gameplay (L2)
@rpg/gameplay  -> @rpg/core/kernel (upstream implementation; Core peer 2.0.0)
runtime-render -> (no runtime dependency yet; Three.js deferred)
editor         -> runtime-engine, runtime-render
game-client    -> runtime-engine, runtime-render
game-server    -> runtime-engine
```

Workspace package names are `@rpg-platform/<project>`. Only the package root is
exported, pointing at built ESM and declarations. All are private. The initial
public surfaces intentionally export no domain types or functions. Runtime Engine
has named imports of actual L1/L2 APIs to establish compile-time dependency linkage;
consumer entrypoints import the appropriate workspace roots. No calculation or
runtime lifecycle is invoked. These imports are Foundation wiring, not a game API.

## Architecture and verification

Read [AGENTS.md](AGENTS.md), [ARCHITECTURE.md](ARCHITECTURE.md),
[harness/OWNERSHIP.md](harness/OWNERSHIP.md),
[harness/CONTRACTS.md](harness/CONTRACTS.md) and each project's AGENTS.md before edits.
The supplied Harness CLI and dependency permissions are retained; config now points
to real package names and build commands. Tooling is not a production project.

```sh
node harness/cli.mjs route -- "describe requested behavior"
node harness/cli.mjs scope --projects runtime-engine,runtime-render,editor,game-client,game-server --allow-infra
```

The router provides hints only. The architecture checker scans literal JS/TS imports
and manifest dependencies; it does not prove semantic ownership or inspect computed
imports. CI runs only artifact preparation, static architecture checks and real
builds. There are no generated tests or test runners in this workspace. Upstream
Core's locked build toolchain includes its existing test dependency; it is installed
only in the temporary external checkout, and no upstream test suite is invoked.

`BUILD_PASS` is compilation evidence only. Gameplay, UI, visuals, security and product
behavior are **FEATURE_NOT_VERIFIED**. See [FOUNDATION.md](FOUNDATION.md) for the audit,
pins, ownership decisions and intentionally open contracts. No release or npm
publication is configured.
