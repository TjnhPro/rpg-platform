# v0.3.11 — Scene Foundation Integration & MVP Closure (SC18)

READY_FOR_DEVELOPER_REVIEW. This closes the requested audit deliverable; Developer
alone accepts Phase 3. No next phase, merge, tag, release or publication authorized.

## Baseline, scope and commit chain

Continue branch feat/editor-render-scene-contracts-v0.3 and existing Draft
[PR #3](https://github.com/TjnhPro/rpg-platform/pull/3). Live GitHub inspection
confirmed Phase 1 PR #1 MERGED at 4cec85b5a00e2477f00eee29e2da6025a532e973
and Phase 2 PR #2 MERGED at fea9b734b849fa1c6bc953530e1fa425d43cfca8.
The latter is the exact Phase 3 merge-base and first checkpoint parent. Developer
supplied v0.3.11 after v0.3.10, with review deferred to the final step. Starting
HEAD and PR head were 82ace7759e0773f5a92e6a7729d51ae830a694cc; worktree clean.

| Checkpoint | Exact commit (one commit per version) |
| --- | --- |
| v0.3.0 | 777c3ef62ab9a3e8d8e322032b689bee4b19cfac |
| v0.3.1 | 80179e1f25493f86bcab131d1ace15dc928598e6 |
| v0.3.2 | 3f45bfd847845eb64a9b7df7af1f2edacd7cdec2 |
| v0.3.3 | 9ea409aa4f1bd78e71f956a889e672a2445fb3a1 |
| v0.3.4 | eb8f4bd145eec403702e8a1e51ea2465ab8a57ae |
| v0.3.5 | c633b9e12235c8d24b47594f4967b5c52247ff40 |
| v0.3.6 | fad00b34ccf900f838e05c0f054936d932f9c0aa |
| v0.3.7 | b21588ccf3bc5150d3f4e2639f8a85e33038dedc |
| v0.3.8 | 22d77a2a5db066609ed44fc3aa7d7a57623c3b6a |
| v0.3.9 | ed0fb3f002cde10faec63fde89b0c02ac4e3ddc9 |
| v0.3.10 | 82ace7759e0773f5a92e6a7729d51ae830a694cc |
| v0.3.11 | Commit containing this report; exact checked SHA/CI recorded in PR #3 after push |

Reviewed root/project AGENTS, architecture/foundation, Harness ownership/contracts/
verification/workflow/failures, all prior Phase 3 reports, current Scene/Asset/Render
implementations, roots, manifests and emitted declarations. No recorded unresolved
Harness failure or serious contract break found in this scoped audit. No framework
research was needed to decide the existing boundaries.

Editor remains the canonical primary owner of authored Scene data; Runtime Render
collaborates through its existing resource public contract, Harness owns review
evidence. This checkpoint changes only README.md, editor/AGENTS.md,
runtime-render/AGENTS.md, harness/CONTRACTS.md, harness/OWNERSHIP.md and this report.
Public API delta: none. No production source, manifest, dependency or schema change.

## Source truth and owner matrix

| Contract | Canonical source / owner | Actual behavior and limit |
| --- | --- | --- |
| Scene identity/definition | editor/src/scene-definition.ts / Editor | Exact projectId + sceneId; explicit caller keys, detached frozen identity-only definition |
| Visual Object identity/labels | editor/src/scene-object-definition.ts / Editor | Scene-local objectId; optional labels become null; no gameplay role |
| Membership/relationships/placement/operations | editor/src/scene-membership.ts / Editor | Ordered inline definitions; project-local Asset refs; local unique IDs; optional opaque layers, attachment, coordinate-space point; immutable candidates |
| Structural and relationship diagnostics | editor/src/scene-diagnostics.ts, scene-validation.ts / Editor | Canonical factories validate; first structural failure, then missing local targets and delegated Asset diagnostics; unknown host errors propagate |
| Asset catalog/resolution/relocation | Existing Phase 2 asset-* modules / Editor | One explicit immutable catalog; no second resolver, IO or loaded resources |
| Object-to-resource projection | editor/src/scene-visual.ts + asset-visual.ts / Editor | Caller retains correlation/placement; only identity/mediaType/sources resource descriptor crosses Render boundary |
| Resource metadata/session/graphics state | runtime-render public root / Runtime Render | Existing prepareVisualResource returns metadata-prepared / NOT_PERFORMED; separate frame API unchanged; no authored Scene catalog |
| Gameplay entity, spawn, simulation | runtime-engine composed with read-only L1/L2 | No Phase 3 implementation or invocation of gameplay rules |

Source and emitted root exports match by TypeScript compiler symbol enumeration:
Editor 74 (43 prior + 31 Scene), Render 17 unchanged. Package-root resolution points
to declared built ESM artifacts; manual consumers compile against root declarations.
The complete Scene inventory is also in [v0.3.9](scene-contracts-v0.3.9.md):

- 13 functions: createSceneIdentity, createSceneDefinition,
  createSceneObjectDefinition, createSceneMembership, addSceneObject,
  listSceneObjects, getSceneObject, reorderSceneObjects, removeSceneObject,
  replaceSceneObject, updateSceneObjectPlacement, diagnoseSceneMembership,
  describeSceneObjectVisual.
- 18 types: SceneIdentityInput, SceneIdentity, SceneDefinitionInput, SceneDefinition,
  SceneObjectDefinitionInput, SceneObjectDefinition, SceneMembershipInput,
  SceneMembership, SceneObjectMembershipInput, SceneObjectMembership,
  SceneObjectReference, SceneObjectAttachment, SceneObjectPlacement,
  SceneDiagnosticCode, SceneDiagnosticTarget, SceneDiagnostic,
  SceneMembershipDiagnosticResult, SceneObjectVisualDescription.

Scene Definition != Render Scene Instance != Gameplay World; Scene Object ID !=
Asset ID != Gameplay Entity ID != Render ID. Authored snapshots, Editor local UI
state, gameplay mutable state and Render session/GPU state stay distinct. The graph
remains Engine -> public L1/L2; Editor/Client -> Engine + Render; Server -> Engine;
Render -> Three.js privately. Exactly five workspace projects, root exports only.

## SC01–SC18 disposition

IDs follow actual checkpoint task headers, rather than retroactively inventing
individual definitions from the grouped v0.3.0 proposal. IMPLEMENTED describes the
scoped source capability, not functional or visual acceptance of all future uses.

| ID | Status / scoped evidence | Deferred or unverified boundary |
| --- | --- | --- |
| SC01 | IMPLEMENTED: .1 explicit Scene identity | Global uniqueness remains caller responsibility |
| SC02 | IMPLEMENTED: .1 identity-only Scene definition | Document envelope/persistence DEFERRED |
| SC03 | IMPLEMENTED: .2 explicit local Object identity | No Entity/Render instance identity |
| SC04 | IMPLEMENTED: .2 optional visual labels | Gameplay classification/extension system DEFERRED |
| SC05 | IMPLEMENTED: .3 ordered Scene membership | No object registry/UI store |
| SC06 | IMPLEMENTED: .3 Phase 2 Asset binding | Physical content NOT_VERIFIED |
| SC07 | IMPLEMENTED: .4 full-permutation ordering and optional layer key | Actual layer sorting DEFERRED |
| SC08 | IMPLEMENTED: .5 optional coordinateSpaceId + finite x/y | Spatial semantics/projection DEFERRED |
| SC09 | DESIGN_ONLY groundwork in .4; local attachment record IMPLEMENTED | Parenting/nesting/transform inheritance DEFERRED |
| SC10 | DESIGN_ONLY groundwork in .4; target scope/self rules IMPLEMENTED | Hierarchy traversal/cycle/runtime-following policy DEFERRED |
| SC11 | IMPLEMENTED: .6 immutable remove/replace/placement candidates | No history or persistence transaction |
| SC12 | IMPLEMENTED: .7 structural/relationship/Asset diagnostics | Missing catalog and all files NOT_CHECKED |
| SC13 | IMPLEMENTED: .6 detached immutable operation results | No global state, implicit IDs or undo store |
| SC14 | IMPLEMENTED: .9 public-root authoring consumer integration | Editor UI NOT_VERIFIED |
| SC15 | IMPLEMENTED: .8 resource projection via existing Render seam | Actual Scene instances/rendered placement DEFERRED |
| SC16 | IMPLEMENTED: .9 current API compatibility audit | Future schema/serialization compatibility DESIGN_ONLY / NOT_VERIFIED |
| SC17 | IMPLEMENTED: .10 finite authored-data flow; MANUALLY_OBSERVED | Rendered Scene/gameplay NOT_VERIFIED |
| SC18 | IMPLEMENTED: this audit/report and build evidence | Developer phase acceptance pending |

## Stress review and extension points

| Case | Evidence and disposition | Future owner / decision |
| --- | --- | --- |
| Text without placement/map/Asset | Identity-only Scene and omitted optional membership fields supported by source and earlier manual consumers; no graphics dependency in data operations | No visual requirement imposed |
| 2D / 2.5D | Optional named space + finite x/y implemented; v.10 observes omitted placement -> null projection | Feature 04 Spatial / 09 Camera define axes, units, depth and projection; 2.5D NOT_VERIFIED |
| One Asset / many placements | v.10 observed three IDs/positions resolving to the exact same catalog definition | Feature 08 owns future visual instances; no cache/instance claim |
| Optional parent/attachment | Omission/null supported; same-Scene nonhierarchical attachment implemented; missing/forward targets retained, self/cross-Scene rejected | Parenting/nesting DEFERRED; no propagation or hierarchy cycle policy |
| Asset relocation | Phase 2 relocateAssetSource changes locator retaining logical identity; Scene stores only AssetReference, so does not encode filenames | Source-reviewed compatibility; .2.9 manual evidence historical, not rerun here; physical relocation NOT_VERIFIED |
| Future Client without Editor runtime | Existing Client graph has no Editor dependency; records use portable scalar/array/record fields | Feature 05/19 content/export adapter DESIGN_ONLY; no emitted Scene format or Client content consumer yet |
| Server headless / wave spawning | Server imports Engine only; authored definitions allocate no gameplay or Render instances | Game-specific spawn/persistence policy DESIGN_ONLY; waves are runtime gameplay state, not saved authored Scene objects |
| Phase 04/05/08/14 extension | Existing scoped IDs and optional records provide reference seams; no observed requirement to replace them | Spatial, Documents, Render instances, Map/UI must get scoped public contracts and consumers; future compatibility NOT_VERIFIED |

Scene capture projects known construction fields only; unknown host fields are
ignored. It is not a lossless reader or versioned save schema. Feature 05/19 must
preserve/reject unknown document data explicitly; never overwrite an unknown
document with a factory projection. Phase 2 Asset metadata preservation is distinct.
Full replacement retains ID/position but omitted optional fields clear old values;
focused placement updates preserve other authored fields. Removal does not cascade.

## Observed proof and verification

Recompiled and invoked the existing [v0.3.10 finite sequence](scene-contracts-v0.3.10.md)
once during this audit; no new permanent script or assertion. Both commands exited 0,
temporary consumer removed. Actual observations matched the prior report:

- scene-zone-01 contains Player, three Monsters sharing monster-image, and VFX
  attached to player-01. Labels have no gameplay behavior.
- monster-02 candidate moved (20,-5) -> (25,-8); original stayed (20,-5).
  Independent scene-zone-02/player-01 stayed (0,0) after caller point x=999.
  Identity/reference values, original/independent/catalog snapshots and frozen
  detached state were retained.
- Valid diagnostics: valid / [] / Asset CHECKED / fileExistence NOT_CHECKED.
  Missing Asset: TARGET_NOT_FOUND at membership.objects[3].assetReference.assetId.
  Missing Object: OBJECT_TARGET_NOT_FOUND at membership.objects[4].attachment.target.objectId.
  Both missing references remained authored; missing Asset projected unsupported.
- Three actual prepareVisualResource calls received only identity/mediaType/sources
  and returned metadata-prepared / resourceLoading NOT_PERFORMED, detached/frozen.
  Player/VFX returned NO_ASSET_REFERENCE. No PNG file supplied/read/loaded.

| Gate on final checkpoint source (required checks/builds repeated after commit) | Result |
| --- | --- |
| node harness/cli.mjs check | ARCH_CHECK_PASS; 45 JS/TS files; static scan only |
| node harness/cli.mjs scope --projects editor,runtime-render --allow-infra | SCOPE_PASS; six documentation paths before commit, clean worktree after commit; committed paths also audited with Git; infra allowance for Harness/root docs |
| node harness/cli.mjs verify --projects editor,runtime-render --with-consumers | BUILD_PASS runtime-render, editor, game-client |
| npm run build -- --force | BUILD_PASS all five projects: runtime-engine, runtime-render, editor, game-client, game-server |
| Strict NodeNext compile of nine existing Scene manual consumers and .10 ad hoc consumer | Exit 0; public-root declarations resolve |
| Source/emitted declaration root inventories | Matching names, Editor 74 / Render 17; no export-map delta |
| git diff --check | Passed |

No failed/unconfigured build. Windows Harness DEP0190 warning remains nonblocking.
The final SHA and exact-head push/pull_request CI URLs are attached to PR #3 after
push, avoiding a self-referential commit SHA. Starting v.10 CI was also confirmed
SUCCESS at 82ace7759e0773f5a92e6a7729d51ae830a694cc: [push](https://github.com/TjnhPro/rpg-platform/actions/runs/39755770199)
and [pull_request](https://github.com/TjnhPro/rpg-platform/actions/runs/39755777885).

Phase 2 baseline-to-Phase 3 protected-path diff is empty for runtime-engine,
game-client, game-server, runtime-render/src, all manifests/export maps, lockfile,
tsconfigs, foundation pins and workflows. Existing Phase 2 asset modules unchanged.
Core 2.0.0 (04b7239f998c3c688a0dfa3202f11811a9acd775) and Gameplay 0.15.2
(acea332aa80f67552192a72b30f81c0bbbfc56bd) remain read-only and unmodified.
Entire Phase 3 production delta is Editor-owned Scene modules/root exports; Render
production source unchanged. Closure adds no production delta, tests or runtime CI.

BUILD_PASS and ARCH_CHECK_PASS are compilation/static evidence. MANUALLY_OBSERVED
is limited to the finite data sequence above. GPU/Scene display, actual sprite
placement, animation/VFX, physical files/loading, gameplay, browser UI, serialized
round-trip and future format compatibility remain NOT_VERIFIED or DEFERRED. No
mandatory proof blocker found within this scope; open decisions stay with the
future owners above. STOP for Developer review and phase acceptance.
