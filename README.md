# RPG Platform — Foundation Workspace

Exactly five private npm workspace projects. Phase 1 supplies Render host/session
contracts and an explicit one-frame graphics path. Phase 2 supplies authored asset
identity, metadata, sources, references, catalog, diagnostics and a Render metadata
handoff. Gameplay, Editor product UI and Client/Server features remain deferred.
See the [Phase 2 integration review](harness/checkpoints/asset-contracts-v0.2.10.md)
for current APIs, finite manual evidence and limits. Developer phase acceptance is
pending; asset contents are not loaded and image display is not verified.

## Setup and build

Current [Phase 4 Spatial integration/closure report](harness/checkpoints/spatial-contracts-v0.4.12.md)
records all checkpoint SHAs, the 90 Editor / 52 Render public symbols, dependency
and artifact audit, build evidence and manual MVP limits. Status is
READY_FOR_DEVELOPER_REVIEW, not phase acceptance or visual verification.
Feature 05 is not authorized by this closure.

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
runtime-render -> three (private graphics backend; no workspace project dependency)
editor         -> runtime-engine, runtime-render
game-client    -> runtime-engine, runtime-render
game-server    -> runtime-engine
```

Workspace package names are `@rpg-platform/<project>`. Only the package root is
exported, pointing at built ESM and declarations. All are private. Editor currently
exports 90 symbols and Render 52; the Phase 2 integration review inventories the
earlier 43/17, and [v0.3.1](harness/checkpoints/scene-contracts-v0.3.1.md) adds six
Editor-owned Scene identity/definition symbols. [v0.3.2](harness/checkpoints/scene-contracts-v0.3.2.md)
adds three Editor-owned Scene Object definition symbols without membership,
asset binding or runtime state. [v0.3.3](harness/checkpoints/scene-contracts-v0.3.3.md)
adds eight membership symbols: immutable Scene object lists with optional Phase 2
Asset references, create/add/list/get and local duplicate rejection.
[v0.3.4](harness/checkpoints/scene-contracts-v0.3.4.md) adds three symbols for
explicit authored reordering and local attachment references, plus optional layer
keys. These do not define renderer sorting, hierarchy or transforms.
[v0.3.5](harness/checkpoints/scene-contracts-v0.3.5.md) adds optional authored
placement with a caller-named coordinate space and finite numeric pair; space
semantics and conversion remain deferred to Feature 04.
[v0.3.6](harness/checkpoints/scene-contracts-v0.3.6.md) completes the minimal
immutable operation set with remove, same-ID complete replacement and focused
placement update. All return validated candidates without owning history or UI state.
[v0.3.7](harness/checkpoints/scene-contracts-v0.3.7.md) adds typed Scene diagnostics
over canonical capture and Phase 2 Asset diagnostics. Structural errors, missing
local targets and unresolved Assets remain distinct; catalog-free lookup and all
physical file existence remain NOT_CHECKED. No automatic authored-data repair.
[v0.3.8](harness/checkpoints/scene-contracts-v0.3.8.md) projects one Scene object
to detached correlation/placement plus the existing Phase 2 visual description.
Only its resource descriptor crosses Render's unchanged metadata preparation API;
placement stays caller-retained until spatial/visual-instance contracts are approved.
[v0.3.9](harness/checkpoints/scene-contracts-v0.3.9.md) consolidates the existing
authoring surface in a public-root manual consumer and audits all 31 Scene exports.
No production API is added. Scene capture retains known fields only; unknown host
data is not a lossless round-trip contract. Document preservation, storage and
migrations remain future decisions; never overwrite unknown documents with these
construction projections.
[v0.3.10](harness/checkpoints/scene-contracts-v0.3.10.md) records a reproducible
manual Scene data flow: five visual placeholders, shared Asset references, an
immutable placement edit, distinct missing-target diagnostics and real Render
metadata preparation. The ad hoc consumer is documented in the checkpoint;
no new API, permanent script, viewport or rendered Scene is introduced.
[v0.3.11](harness/checkpoints/scene-contracts-v0.3.11.md) audits the complete
Phase 3 commit chain, SC01–SC18 disposition, public contracts and future extension
boundaries. No production API changes; builds/static checks and finite manual data
observations remain separate from visual verification and Developer phase acceptance.
[v0.4.1](harness/checkpoints/spatial-contracts-v0.4.1.md) adds seven Editor-owned
symbols for explicit project-scoped coordinate definitions/references and finite
2D points. Scene placement remains optional and unchanged; there is no spatial
conversion, implicit unit scale or Render projection API.
[v0.4.2](harness/checkpoints/spatial-contracts-v0.4.2.md) adds a Render-owned
PlanarTransform2D descriptor/factory with explicit scale-rotate-translate semantics,
radians and zero pivot. Capture needs no graphics; application, composition,
inverse and projection remain deferred.
[v0.4.3](harness/checkpoints/spatial-contracts-v0.4.3.md) adds seven Render root
symbols for affine capture, point application, ordered composition and conditional
inverse. Composition preserves shear; [A,B] applies A then B. Pure math requires
explicit coherent numeric inputs, no Scene traversal or graphics acquisition.
The checkpoint documents numerical rejection/overflow policy and manual examples.
[v0.4.4](harness/checkpoints/spatial-contracts-v0.4.4.md) adds Editor-owned optional
orthogonal grid definition/capture, reusing coordinate-space references. Explicit
origin, positive cell dimensions and row/column direction/negative-index policies
are authored data only; Scene placement stays independent. Grid conversion remains
deferred to v0.4.5.
[v0.4.5](harness/checkpoints/spatial-contracts-v0.4.5.md) adds Render's canonical
orthogonal grid/scene conversions and an Editor adapter. Requests/results retain
scoped space and unit; explicit corner/center output and floor inverse use directed
half-open cells. Domain/mismatch/numerical failures reject without clamping.
Runtime Engine
has named imports of actual L1/L2 APIs to establish compile-time dependency linkage;
consumer entrypoints import the appropriate workspace roots. No calculation or
runtime lifecycle is invoked by those Engine/Client/Server bootstrap imports.
Render graphics acquisition is a separate explicit API; asset metadata operations
perform no file IO, decoding, GPU loading or frame submission.

## Architecture and verification

[v0.4.11 spatial MVP](harness/checkpoints/spatial-contracts-v0.4.11.md)
contains the executed, reproducible manual public-root scenario with one Player
visual and three Monster placeholders. Explicit grid/space, immutable placement,
anchor/facing, transforms and viewport/screen inverse are compared with hand-derived
numbers. No production API, automated suite, GPU Scene renderer or gameplay entity
is introduced. Finite observations do not establish general/visual correctness.

[v0.4.10 spatial handoff](harness/checkpoints/spatial-contracts-v0.4.10.md)
adds describeSceneObjectSpatialPoint and SceneObjectSpatialDescription. The pure
Editor adapter returns an existing Render point DTO plus caller-held authored
correlation, or explicit NO_PLACEMENT. Render root projection APIs consume only
the DTO; no formula duplication, session binding or Scene renderer is introduced.

[v0.4.9 Scene spatial checkpoint](harness/checkpoints/spatial-contracts-v0.4.9.md)
adds Editor's updateSceneObjectSpatialPlacement: explicit coordinate definition
and scoped point validation before the existing focused Scene placement update.
No Scene schema, registry, conversion math or Render API change. Old snapshots,
supported identities/bindings/relationships and spatially optional text are retained.

[v0.4.8 viewport/screen checkpoint](harness/checkpoints/spatial-contracts-v0.4.8.md)
adds pure explicit pixel metrics, optional screen origin/scale, and constrained
inverse to the declared orthographic source plane. Editor forwards caller metrics;
Render owns conversion and numeric validation. No automatic DPR, DOM measurement,
camera/session change, clipping or Scene integration is introduced.

[v0.4.7 projection checkpoint](harness/checkpoints/spatial-contracts-v0.4.7.md)
documents forward orthographic-plane conversion with explicit spaces/axes/units
and mapping parameters. Editor uses Render's public root; no live camera or
viewport/screen mapping is required or added.

[v0.4.6 anchor/pivot/facing checkpoint](harness/checkpoints/spatial-contracts-v0.4.6.md)
documents optional Render alignment and the Editor Scene-placement consumer.
Local-unit anchors are explicit; facing does not select frames or rotate geometry.
Scene/Asset data and existing frame/session APIs remain unchanged.

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
