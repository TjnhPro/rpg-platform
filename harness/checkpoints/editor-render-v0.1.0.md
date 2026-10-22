# v0.1.0 — Editor–Render boundary checkpoint

Status: **READY_FOR_DEVELOPER_REVIEW**. ER01/ER02/ER04 boundary specification:
**API_DESIGN_ONLY**. Runtime/visual behavior: **FEATURE_NOT_VERIFIED**.
Phase 1 remains open; v0.1.1 requires Developer review and a separately approved task.

## Audit baseline and scope

Audit date: 2026-10-22. Clean `main` and fetched `origin/main` both at
`4874c1b3ce72cba7483b183093ec8c36f56187ea`; no existing phase branch or PR.
One branch, `feat/editor-render-foundation-v0.1`, and one continuing Phase 1 PR.
Checkpoint labels are documentation versions; all private package versions remain
0.0.0 because no package API or artifact version change is needed.

Primary owner: `runtime-render` for the presentation boundary. Collaborator:
`editor` for authoring-host consumption. Harness tooling documents the approved
boundary and adds one missing native-rendering dependency restriction. No production
behavior, public symbol, package dependency, workspace layout or CI change.

Inspected root/project AGENTS, architecture, Foundation record, ownership/contracts/
verification docs, all five manifests/source roots, TypeScript configs/references,
Harness config/import scanner, lockfile, installed foundations and CI commands.
Observed graph (arrows mean imports/dependencies, not authority):

```text
editor      ──> runtime-render
            └─> runtime-engine ──> @rpg/core/kernel + @rpg/gameplay
game-client ──> runtime-render
            └─> runtime-engine
game-server ──> runtime-engine
runtime-render ──> no dependencies
@rpg/gameplay ──> @rpg/core/kernel (upstream; Core 2.0.0 peer)
```

There are exactly five npm workspaces. All have root-only package exports to built
ESM `dist/index.js` and declarations `dist/index.d.ts`. Render's source contains
only `export {}`: zero public values/types, no backend, session, state or lifecycle.
Editor imports the Engine and Render package roots for side effects and exports
nothing. Client has the same bootstrap imports; Server imports only Engine.
These are wiring placeholders, not operational consumers of a renderer.

Editor references Engine/Render in tsconfig; Render references no project. Each
build is `tsc -b --force`; root `tsc -b` orchestrates the five project references.
Strict NodeNext declaration checking uses `skipLibCheck: false`. This checkpoint
enables `noUncheckedSideEffectImports` in Editor so its baseline root imports must
resolve; it adds no exported symbol just to manufacture a consumer.

Installed/locked/pinned foundations agree, and are unchanged:

| Foundation | Version | Exact revision | Permitted direct consumer/import |
| --- | --- | --- | --- |
| L1 Core | 2.0.0 | `04b7239f998c3c688a0dfa3202f11811a9acd775` | Engine only, `@rpg/core/kernel` |
| L2 Gameplay | 0.15.2 | `acea332aa80f67552192a72b30f81c0bbbfc56bd` | Engine only, `@rpg/gameplay` |

Core exposes eleven package entrypoints but only Kernel is allowed here. Gameplay
exposes its root only. Engine's existing named imports are `calculateStats` and
`createGameplayRuntime`; this task does not call them or add an L1/L2 consumer.
Artifact SHA-512 pins remain in [foundation-pins.json](../foundation-pins.json).

## Research applied to this boundary

These are design inferences for this workspace, not claims of framework compatibility:

| Primary source inspected | Lesson applied | Intentionally not adopted |
| --- | --- | --- |
| [Unreal modules](https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-modules), Runtime/Editor module types and public/private dependency sections | Public consumers should not depend on private rendering implementation; authoring remains separate from reusable presentation | C++ module loader, Build.cs, startup phases, additional production modules |
| [Unity assembly definitions](https://docs.unity3d.com/6000.6/Documentation/Manual/assembly-definition-files.html) and [platform-specific assemblies](https://docs.unity3d.com/6000.6/Documentation/Manual/assembly-definitions-creating.html#create-platform-specific) | Explicit compilation references and host-specific inclusion boundaries; Editor dependencies should not leak into runtime consumers | Assembly assets, Unity component hierarchy, mandatory Unity host |
| [Godot editor plugins](https://docs.godotengine.org/en/stable/tutorials/plugins/editor/making_plugins.html) and [resources](https://docs.godotengine.org/en/stable/tutorials/scripting/resources.html) | Initialization needs matching cleanup; authored data and instantiated visual resources have different lifetimes | Plugin registry, Node/Resource types, shared-resource cache semantics |
| JXQY source at `6ff516bc1439e2b622a2e0ee4e1433cd98f8ec61`: [ProjectDocumentRegistry.h](https://github.com/Upwinded/JXQY-all-in-one/blob/6ff516bc1439e2b622a2e0ee4e1433cd98f8ec61/jxqy-editor/core/ProjectDocumentRegistry.h), [ProjectManager.h](https://github.com/Upwinded/JXQY-all-in-one/blob/6ff516bc1439e2b622a2e0ee4e1433cd98f8ec61/jxqy-editor/core/ProjectManager.h), [FocusedContentPlaytest.h](https://github.com/Upwinded/JXQY-all-in-one/blob/6ff516bc1439e2b622a2e0ee4e1433cd98f8ec61/jxqy-editor/core/FocusedContentPlaytest.h), [MapRenderCanvas.h](https://github.com/Upwinded/JXQY-all-in-one/blob/6ff516bc1439e2b622a2e0ee4e1433cd98f8ec61/jxqy-editor/ui/MapRenderCanvas.h) | Document identity/dirty state and project view state are authoring concerns; focused playtest uses a separate temporary bootstrap rather than modifying saved content | Qt canvas drawing inside Editor, fixed NPC/Magic/Goods schemas, game-specific Lua/bootstrap implementation |

## ER01 — canonical ownership

| Concern | Canonical owner | Host/collaborator responsibility |
| --- | --- | --- |
| Public presentation surface | Render | Editor/Client call approved package-root APIs only |
| Host UI, target mounting and authoring input | Editor (Client for its own host) | Render receives only an explicitly approved target/integration contract, not UI stores |
| Session runtime state, visual objects and visual resource lifecycle | Render, when implemented | Host decides when a preview is needed and retains/releases its session reference |
| Selection, tabs, open document, dirty state, viewport UI preferences | Editor | Translate relevant presentation requests; do not pass the document/workspace object into Render |
| Authored content/config and serialization | Owner unassigned until actual content use case | Editor authors; Render may consume an explicitly approved visual projection, never serialize host UI or GPU state |
| Visual data/validation | Render for presentation meaning | Host adapts authored content under its future owner; opaque visual references imply no gameplay identity |
| Gameplay state, calculations and policy | Engine/L2/L1 according to existing ownership | Render receives presentation projections only; no HP/AI/damage/loot decisions |
| Rendering failures and partial native allocation cleanup | Render | Host presents diagnostics and chooses user-facing retry/close policy; no private cleanup calls |
| Host integration/input/document failures | Editor | Preserve authoring state and decide whether to request session release |
| Native textures/materials/GPU resources/listeners created by Render | Render | Host releases through public lifecycle; never reaches inside to free backend objects |
| Host DOM/UI/listeners created by host | Editor | Host removes its own bindings and target after agreed release ordering |

Task routing: rendering algorithms, backend resources and shared visual semantics
belong to Render; editing tools, document workflows and host UI belong to Editor;
gameplay rules belong to Engine. For a mixed change, identify one owner per behavior
and specify each boundary crossing; do not create a sixth shared owner.

## ER02 — minimum public boundary

Implemented surface remains exactly `@rpg-platform/runtime-render` with **zero
public symbols**. No new data type, interface, factory, session class, error code
or plugin hook is implemented. No DOM-canvas or Three.js target type is selected.

Contract constraints for later signatures, subject to their checkpoint review:

- Host calls Render; Render never imports Editor, Engine, Client, Server or L1/L2.
- Only package-root exports are consumable. Source paths, compiled private paths
  and backend classes are implementation details even when physically visible.
- Presentation requests/configuration and presentation observations/diagnostics may
  cross after explicit semantics are approved. A future session reference may
  expose approved operations; it must not grant native backend access.
- UI/workspace stores, mutable authoring documents, gameplay state and numerical
  policies must not enter Render contracts. Editor must adapt relevant data first.
- Native renderer/scene/material/texture instances, GPU handles, internal caches and
  backend-specific public type aliases must not escape Render. Authored exports must
  not contain such objects or a live session. Serialization/schema is still open.
- Importing the package must not implicitly require a graphics session. Host target
  ownership and platform affordances belong in the later reviewed integration seam;
  host-specific UI must not become a presentation-domain type.

Later checkpoints own the actual signatures and implementation:

| Version | Extension seam to review; no implementation here |
| --- | --- |
| v0.1.1 | Host/target and session contracts, independent-session ownership |
| v0.1.2 | Initialization ordering and acquisition/failure responsibilities |
| v0.1.3 | Disposal, terminal states, repeat-release behavior and shared-resource isolation |
| v0.1.4 | Error representation, partial failures and recovery boundaries |
| v0.1.5 | Actual Editor host integration |
| v0.1.6 | Extension/compatibility rules driven by real consumers; no generic plugin system |
| v0.1.7 | Real renderer/frame proof |
| v0.1.8 | Integration and MVP closure review |

## ER04 — planned host interaction (not executable API)

1. Editor opens/edits content without automatically creating graphics. A graphical
   preview explicitly requests a Render session using the future public contract.
2. Editor keeps the returned reference associated with its preview; Render keeps
   runtime visual state/resources. No global active-preview singleton is prescribed.
3. Editor adapts approved visual data and host intent, then calls public operations.
   Render owns visual interpretation and returns only approved observations/errors.
4. On preview close/replacement or Editor shutdown, Editor coordinates public release
   before dropping its reference/removing host-owned bindings as the later API defines.
   Render releases its allocations; saved content/document state survives independently.
5. On failure, Render owns its internal failure report/cleanup; Editor owns UI feedback
   and orchestration. Neither silently mutates the other's state or frees its resources.

Sync/async creation, cancellation, target type, resize/time/input transport, disposal
ordering, idempotency, error format and recovery remain open. There is no fake preview
manager or lifecycle implementation. Build success does not verify these responsibilities.

## Risks and guardrails

| Concrete risk | Guardrail and evidence level |
| --- | --- |
| Render imports Editor UI or Engine rules | Existing Harness project direction restrictions and read-only foundation consumer allowlist; literal static scan only |
| Editor imports Render private implementation | Existing cross-project relative/deep-package rejection, root-only exports and NodeNext package compilation |
| Editor creates a second renderer using Three.js | New small `checkImport` restriction rejects Editor `three`, `three/*`, `@types/three` and subpaths in literal imports and dependency manifests |
| Authored content embeds native Three.js objects | Documented prohibition; semantic content/schema review still needed when content exists |
| One preview disposes resources belonging to another | Render owns per-session lifetime; no global ownership required. Actual sharing/refcounts/disposal semantics deferred, not verified |
| Text-only editing or Server boot implicitly allocates GPU/DOM | Session creation must be explicit; Server graph has no Render edge. Future side effects remain a review gate |
| Bootstrap import compiles without resolving an actual Render package | Editor now enables `noUncheckedSideEffectImports`; compiler checks package root and declaration resolution |

No negative-control test/probe or new suite is introduced. The checker is a regex
scan, not an AST/declaration-leak/semantic analyzer: aliases, computed imports,
re-exported native types, alternate backend packages and hidden resource coupling
still require source review. The new guardrail does not claim complete prevention
of duplicate renderers or backend leakage.

## Future contract stress review — design evidence only

| Scenario | Boundary assessment | Deferred proof/decision |
| --- | --- | --- |
| Editor and Client share Render without Editor source | SUPPORTED_BY_BOUNDARY: both depend on the same root; Render has no Editor dependency | Operational consumers v0.1.5/v0.1.7, Client features outside this checkpoint |
| Two previews; dispose one without harming the other | DEFERRED_TO_VERSION: ownership permits independent references, but no session API exists | v0.1.1/v0.1.3 session identity, shared resources and disposal guarantees |
| Text RPG content editing without graphics/DOM/GPU | SUPPORTED_BY_BOUNDARY: authored state is separate and graphics acquisition must be explicit | Initialization/import effects v0.1.2; no text editor implemented |
| Scene/Camera/Sprite/directional animation/VFX later | SUPPORTED_BY_BOUNDARY: visual meaning stays Render-owned, tools stay Editor-owned | Actual schemas and operations require their approved feature tasks |
| Different browser/host render target | CONTRACT_RISK: ownership allows adaptation, but target/platform semantics could still leak | v0.1.1 review before fixing any target type; v0.1.6 compatibility |
| Server validates game data without GPU frames | SUPPORTED_BY_BOUNDARY: Server depends only on Engine in current graph | No Server behavior or protocol proof in this checkpoint |
| L3 gameplay rule changes without Render knowing HP/AI/damage policy | SUPPORTED_BY_BOUNDARY: no Engine edge or gameplay contract in Render | Future presentation projection design must retain this separation |

No irreversible target/backend or public schema decision is required now. These
assessments are constraints and deferred review points, not functional PASS results.

## Verification and review handoff

Commands for this checkpoint (root/Harness documentation and guardrail edits are
authorized infrastructure, so scope uses the CLI's existing `--allow-infra`):

```sh
node harness/cli.mjs check
node harness/cli.mjs scope --projects editor,runtime-render --allow-infra
node harness/cli.mjs verify --projects runtime-render,editor --with-consumers
npm run build -- --force
```

Observed local results on Node 24.18.0 / npm 12.2.0:

| Gate | Result |
| --- | --- |
| Static architecture scan | ARCH_CHECK_PASS; 5 JS/TS source files |
| Scope: Editor + Render + approved infrastructure | SCOPE_PASS; 6 changed/untracked files before commit |
| Harness Render build | BUILD_PASS |
| Harness Editor build | BUILD_PASS |
| Discovered Render consumer: Game Client build (no source edit) | BUILD_PASS |
| Whole workspace forced build, all five projects | BUILD_PASS |
| Emitted public declarations inspected | Root-only imports retained; Render has no public symbols |

No failed/unconfigured build remains. The existing Windows Harness subprocess emits
Node DEP0190; it is a pre-existing warning, not a failed build. No automated tests,
runtime/UI probes or upstream verification suites were run.

Exact commit/CI links are recorded on the continuing Phase 1 PR.
Inspected emitted `runtime-render/dist/index.d.ts` and `editor/dist/index.d.ts`:
Render remains `export {}`; Editor keeps only root side-effect imports plus `export {}`.
Compilation proves the baseline package/declaration boundary resolves, not an
operational session, initialization, cleanup, failure handling or visual output.

Changed files: this report; `harness/CONTRACTS.md` discovery link; Render/Editor AGENTS
ownership reminders; `harness/cli.mjs` native dependency guard; `editor/tsconfig.json`
side-effect import resolution. Runtime source, manifests, Engine/Client/Server, pins,
lockfile, package versions, workspace references and CI are unchanged.

Developer review must accept ER01/ER02/ER04 and decide whether to authorize v0.1.1.
Phase 1 is not complete. No merge, tag, publication or later checkpoint is authorized.
