# v0.2.0 — Asset architecture and identity foundation (AR01 / AR02)

**READY_FOR_DEVELOPER_REVIEW — v0.2.0 / API_DESIGN_ONLY**.
Public API delta: **zero**. Asset behavior is **NOT_VERIFIED** because no asset
implementation is introduced. Stop here; v0.2.1 needs Developer acceptance first.
No phase closure, merge, tag, release or publish is authorized by this checkpoint.

## Baseline, preflight and source audit

Developer `TjnhPro` merged [Phase 1 PR #1](https://github.com/TjnhPro/rpg-platform/pull/1)
at 2026-10-22 12:33:44 Asia/Bangkok. GitHub reports merge commit
`4cec85b5a00e2477f00eee29e2da6025a532e973` on main, containing v0.1.8 commit
`ca06cdba01cba1927621efa39841161779d74f56`. The two trees are identical. This
Developer merge is the evidence used for baseline acceptance/authorization to
start Phase 2; no formal GitHub approval review exists. It does not retroactively
establish observed visual evidence: Phase 1's visual limitations remain recorded.

Created `feat/editor-render-asset-contracts-v0.2` from that exact origin/main merge
commit, separately from the Phase 1 branch/PR. This is the first of eleven possible
Phase 2 checkpoints, v0.2.0–v0.2.10, not authorization to execute the other ten.
One continuing Phase 2 PR will hold approved later checkpoints.

Read root/project AGENTS, ARCHITECTURE, Harness OWNERSHIP/CONTRACTS/VERIFICATION/
WORKFLOW, actual public exports/manifests, compiler references and Harness config.
Source search finds no existing Asset module/schema, catalog, sourceId contract or
resolver in Editor/Render. Current implementations are the Phase 1 binding/session
and explicit graphics paths; there is no existing asset owner to duplicate.
README's Foundation-era absence-of-renderer statements are stale; actual source
and v0.1.8 inventory govern this checkpoint. No unrelated README rewrite is needed.

Preflight declared before edits: **Editor is canonical primary owner** of authored
asset identity/reference semantics. **Runtime Render collaborates** only to review
the future presentation consumer boundary. The task explicitly assigns this asset
subset of formerly unassigned saved-content identity; other content ownership is
still open. No dependency direction changes. No L1/L2 API is needed here.

Five documentation paths only: this report, Harness OWNERSHIP/CONTRACTS and both
project AGENTS. No public types/functions or consumer changes are justified by an
asset usage in v0.2.0. Existing source, export maps, build scripts, dependencies,
lockfile, compiler configuration, checker and all Phase 1 reports remain unchanged.
The report is the single contract note; AGENTS/CONTRACTS link here for discovery.

Actual baseline public surfaces remain **8 Editor** and **14 Render** root symbols:

| Owner | Existing exports; unchanged |
| --- | --- |
| Editor | createEditorPreviewSession, initializeEditorPreviewSession, disposeEditorPreviewSession, getEditorPreviewFailure, createEditorPreviewHost, openEditorPreviewHost, EditorPreviewHost, EditorPreviewHostSnapshot |
| Render | RenderHostBinding, RenderSessionDescriptor, createRenderSession, RenderSessionSnapshot, RenderSessionDisposal, RenderSessionLifecycle, createRenderSessionLifecycle, RenderFailure, getRenderFailure, RenderFrameSession, RenderFrameReceipt, RenderFrameFailure, createRenderFrameSession, getRenderFrameFailure |

Only package `.` maps to built ESM/declarations. Editor references/depends on Engine
and Render; Render has no workspace dependency/reference and owns exact Three.js
0.186.1 (dev types 0.186.0). DOM libs remain scoped to Editor/Render. Client imports
Engine/Render roots; Server imports only Engine. Five private projects remain;
independent builds use `tsc -b --force`, root orchestration `tsc -b`.

## Research — ownership/identity lessons, not imported implementations

Reviewed official documentation on 2026-10-22. These lessons inform the design;
they do not promise compatibility with these engines or introduce their formats.

| Primary source | Documented mechanism | Local design inference / what is not copied |
| --- | --- | --- |
| [Unity 6.3 asset metadata](https://docs.unity.com/en-us/engine/6000.3/manual/assets-and-media/import-assets/asset-metadata) | Asset ID retained in .meta allows references to survive rename/move; losing metadata can break references | Separate identity from location; preserve mapping during relocation. Do not copy GUID generation, .meta files, importer/database or Unity serialization |
| [Godot ResourceUID, stable docs](https://docs.godotengine.org/en/stable/classes/class_resourceuid.html) | Project resource UIDs preserve links over rename/move; ResourceUID manages UID/path mapping as a singleton | Project scope and identity/path separation are useful. Do not adopt singleton, UID generator, uid:// syntax, cache or loader; Platform caller supplies logical identity |
| [Unreal Asset Registry](https://dev.epicgames.com/documentation/en-us/unreal-engine/asset-registry-in-unreal-engine) | Editor metadata describes assets without loading them; loading is a distinct operation | Metadata lookup need not instantiate graphics. Do not copy automatic discovery, disk watching, global module, registry framework or UObject metadata |
| [Unreal asset references](https://dev.epicgames.com/documentation/unreal-engine/referencing-assets-in-unreal-engine) | Indirect soft references separate a stored reference from loaded object access | Keep authored reference distinct from loaded resource. Do not adopt object-path identity, soft pointer classes or automatic loading semantics |

## AR01 — ownership and initial vocabulary

The following are conceptual terms, **not exported TypeScript names or schemas**.

| Concept | Canonical owner / identity scope | Relationship and implementation status |
| --- | --- | --- |
| Authored asset / definition | Editor; caller-provided stable logical asset ID within explicit project scope | Pure authoring record concept; points to relevant source metadata, optional future subresources. No record type/factory/catalog yet |
| Source file | Editor owns authored source metadata/locator association; actual file/bytes belong to external storage/provider | Filename/path locates a source, not the asset identity. One logical asset may involve multiple files; no filesystem model or importer implemented |
| External source ID | Editor owns provenance association; scope is source/provider dataset, not global | Numeric-looking text such as `"0012"`; preserve text/leading zeros, never Number coercion or implicit Asset ID. No provider schema or source-ID factory yet |
| Render resource | Runtime Render; future resource/session/backend lifetime | Loaded resource differs from authored record; Render will own presentation descriptor at the actual v0.2.8 consumer boundary. No asset descriptor/texture/decoder/cache now |
| Subresource | Editor owns authored selector/reference semantics; scope is its containing asset/source context | Possible named region/frame/part, distinct from a loaded GPU allocation. Stable addressing/rename rules are unresolved; no atlas/frame/animation schema |
| Reference holder | Its authoring/content owner; Editor owns asset-reference contract | Independent holder keeps an asset reference, not a cloned definition. No holder class, Scene/Object implementation or universal gameplay holder schema |

Display name is editable human-facing text, not identity. Kind describes an asset's
technical/content category when a real type is introduced; it must not encode a
game role such as Monster, Player, Skill or Item. Locator is a separate future
address/access description; its grammar and resource operations are not defined in
v0.2.0. Source ID is provenance, not a generated locator, filename or logical asset ID.

Identity equality is meaningful only with project context. The same text ID in
two projects does not identify the same asset. The caller explicitly supplies that
context; no global registry, hidden current-project singleton, ID generator,
path-derived hash or universal ID format is introduced. Multiple provider scopes
must not silently merge numeric-looking external IDs. Exact lexical validation,
normalization and duplicate handling operations await their version tasks.

## AR02 — reference boundary and reviewable invariants

These are requirements for later implementations, not runtime assertions already
implemented or tests performed in this checkpoint.

| Invariant | Concrete review criterion |
| --- | --- |
| Stable logical identity | Relocate/rename source or edit display name while retaining explicit project and asset ID; holders' references do not need replacement |
| Distinct source identity | `"0012"` remains text in provenance; identical filename/source ID alone cannot select an asset across projects/providers |
| No implicit per-reference copy | Two holders refer to one definition; changing one holder's selected reference does not mutate the other holder or duplicate the definition |
| Explicit missing outcome | Future resolution against supplied metadata must explicitly diagnose unknown project/asset reference as appropriate; no filename guess, silent new asset, fallback texture or successful empty resource |
| Pure resolution | Same explicit reference and metadata inputs determine result; resolution performs no filesystem/network access, existence probe, decoder or texture allocation |
| Immutable authored transitions | Later updates return a new record/state where state exists; no hidden singleton mutation, caller-record mutation or resource handles in authored data |
| No game semantics in asset kind | Technical identity/reference is independent of combat, loot, AI, progression or a universal actor model |
| Separate authoring and resources | Editor UI selection/workspace state and loaded Render handles never become authored definition fields or serialized references |

Conceptual future flow (not callable code): a holder supplies project context and
logical asset reference; Editor-owned resolution reads explicit metadata inputs;
it yields resolved metadata or a missing diagnostic. A later boundary adapter maps
the relevant visual information to a **Render-owned** descriptor. Render accepts
that descriptor through its public root without importing Editor or consulting a
second catalog. Resolution does not claim a file exists or a resource can load.
Loading/decoder/cache/GPU errors belong to the separate loading feature, not to
reference-lookup success. No placeholder resolver/descriptor is needed now.

Future exported content is **data**, separate from the authoring package. An
exporter can project the required resolved information/reference associations into
a versioned data artifact; Client consumes that artifact and the appropriate
Runtime/Render public contracts without importing `@rpg-platform/editor` at
runtime. This is a boundary requirement, not a finalized export format, runtime
resolver, new shared package or grant to copy Editor's catalog into Client/Render.
Exporter/serializer ownership and artifact versioning must be assigned for their
actual use case before implementation. No Client/Server dependency changes here.

## Contract roadmap — AR03–AR16 remain deferred

The supplied task names AR03–AR16 collectively but does not define their individual
capability-to-ID mapping. Reserve those IDs; do not fabricate an approved mapping
or a task schedule. This roadmap states the supplied milestones and dependency
constraints only; later Developer tasks define each API and AR assignment.

| Deferred milestone / contract topic | Requirement inherited from v0.2.0 |
| --- | --- |
| v0.2.1 identity factory | Caller-provided project-local logical identity; separate external numeric-looking text ID; exact validation/equality rules need its task |
| v0.2.2+ metadata/catalog | Editor ownership, explicit inputs, no singleton/second catalog; reference holders do not own copied definitions |
| v0.2.3 locators | Distinct from logical/source identity; no implicit IO from resolution; locator syntax/schemes deferred |
| AR03–AR16 reference/diagnostic/subresource and other contract details | Exact ID assignments, API signatures and version placement are unspecified here; retain the invariant table and resolve each only with a concrete caller/task |
| v0.2.8 Render consumer boundary | Render owns actual presentation descriptor; Editor adapts resolved data to it via Render root; no descriptor API before consumer evidence |
| Through v0.2.10 | One Phase 2 branch/PR; each next checkpoint requires prior Developer acceptance. No implementation of remaining versions by this report |
| Phase 07 / Phase 13 | Resource loading/decoder/cache/GPU belongs to Render Phase 07; Asset Browser/import UI belongs to Editor Phase 13; both outside Phase 2 |

Open decisions: ID lexical/equality/duplicate rules, explicit project context shape,
provider namespace and source associations, kind vocabulary, multi-file roles and
subresource selectors, metadata update/delete semantics, diagnostic codes,
locator schemes, exporter/serializer owner and artifact format/versioning. None
requires a placeholder public type in v0.2.0. No missing L1/L2 capability exists
for this documentation checkpoint and no gameplay model is requested.

## Future stress review — design evidence only

| Scenario | Expected boundary / limitation |
| --- | --- |
| Two projects each have `0012.png` | Distinct project contexts; filename cannot determine equality. Caller may choose identical ID text independently without global collision semantics |
| One logical asset has PNG + TPSheet | One asset identity may associate multiple sources; neither filename automatically becomes primary identity. Roles/locator/subresource format deferred; no TPSheet parser |
| Two independent holders refer to one asset | Both select same logical identity; no cloned definition per reference; per-holder changes are independent. No shared GPU-cache/reuse policy inferred |
| Source moves | Locator metadata changes, logical ID/references remain stable; actual file move/metadata update implementation deferred |
| Text RPG without texture | Authored metadata/reference work does not require Render acquisition, texture kind or graphics fallback. No text-authoring product UI implemented |
| Non-browser host processes metadata | Future pure data operations must not access DOM/WebGL/IO. Existing separate manual graphics entrypoint does not become a metadata dependency. No headless execution claim |

## Verification and scope evidence

Required genuine gates; no tests, runners, helpers, UI/browser/E2E/snapshot probes,
coverage, dummy builds or upstream verify suites:

```sh
node harness/cli.mjs check
node harness/cli.mjs scope --projects editor,runtime-render --allow-infra
node harness/cli.mjs verify --projects editor,runtime-render --with-consumers
```

Infra allowance covers OWNERSHIP, CONTRACTS and this checkpoint note only. Scope
inspects actual uncommitted/staged paths; branch base is explicitly the accepted
main merge above. Review `git diff 4cec85b5a00e2477f00eee29e2da6025a532e973...HEAD`
for committed scope. No scope extension to Engine/Client/Server/CI/root config.
Consumers compile against existing package roots; no asset code means no new .d.ts
delta is expected. Build is compilation only; identity relocation, missing
diagnostics, file existence, resource sharing/loading and visuals are NOT_VERIFIED.

L1 Core 2.0.0 `04b7239f998c3c688a0dfa3202f11811a9acd775` and L2 Gameplay 0.15.2
`acea332aa80f67552192a72b30f81c0bbbfc56bd` remain read-only exact pins. Neither is
imported into asset contracts. Their source/artifacts/exports, Engine's imports,
lock entries and preparation path remain unchanged. Exact checkpoint SHA and Phase 2
PR/CI evidence are attached to the new Phase 2 PR after commit/push (the commit
containing this report is the v0.2.0 checkpoint, not a hash embedded in itself).

Observed locally on Node 24.18.0 / npm 12.2.0:

| Gate / inspection | Observed result |
| --- | --- |
| Static architecture | ARCH_CHECK_PASS; 10 JS/TS source files |
| Scope, Editor/Render + justified Harness notes | SCOPE_PASS; exactly 5 modified/untracked documentation paths |
| Runtime Render independent build | BUILD_PASS |
| Editor independent build | BUILD_PASS |
| Discovered Game Client consumer build | BUILD_PASS |
| TypeScript compiler export inventory | 8 Editor and 14 Render root symbols; no asset symbol delta |
| Foundation artifact/install inspection | Both local SHA-512 digests match pins; installed Core 2.0.0 / Gameplay 0.15.2 match pins; public export maps intact |
| Whitespace review | git diff --check passed |

No failed/unconfigured build remains. Engine/Server have no changed contract or
source; separate independent builds were not required by the local selected scope.
Existing Windows Harness DEP0190 warning remains unchanged. No runtime/manual asset
example is claimed: no asset implementation exists, and all stress cases above
are design reasoning. No functional, file-existence, GPU or visual PASS follows
from these compile/static results. **READY_FOR_DEVELOPER_REVIEW — v0.2.0**.
