# v0.3.3 — Scene Membership & Asset Binding (SC05/SC06)

Status: READY_FOR_DEVELOPER_REVIEW. Developer owns acceptance; stop before v0.3.4.

## Preflight and baseline

Started at v0.3.2 checkpoint 3f45bfd847845eb64a9b7df7af1f2edacd7cdec2;
Developer supplied the next task to continue. Same branch
feat/editor-render-scene-contracts-v0.3 and Draft PR #3:
https://github.com/TjnhPro/rpg-platform/pull/3.
Live GitHub verified Phase 1 PR #1 MERGED at
4cec85b5a00e2477f00eee29e2da6025a532e973 and Phase 2 PR #2 MERGED at
fea9b734b849fa1c6bc953530e1fa425d43cfca8 (exact Phase 3 branch base).

Read root/project guidance, architecture, foundation, ownership, contracts,
verification/workflow, current Scene/Object/Asset source, exports and manifests,
and Render public surface. Pre-task root inventories: Editor 52, Render 17.
Editor is the sole source owner; Render needs no API/source change. No external
L1/L2 API is involved; frozen foundations/pins remain unchanged. Supplied task
authorizes the additive membership contract, not a break to previous contracts.

## Contract decision and scope

Eight additive Editor root symbols: SceneMembershipInput, SceneMembership,
SceneObjectMembershipInput, SceneObjectMembership, createSceneMembership,
addSceneObject, listSceneObjects, getSceneObject. Editor grows 52 -> 60 symbols;
Render stays 17. Existing SceneDefinition and SceneObjectDefinition remain intact.

Membership stores one detached Scene definition and inline owned object definitions,
each wrapped with a nullable Phase 2 AssetReference. This is the canonical authored
membership snapshot, not a second Scene registry, object catalog or Asset catalog.
Inline definitions avoid dangling object IDs that would require another registry.
Create/add call the existing factories, preserving validation/identity semantics.
Object IDs must be unique only inside this Scene; the same ID in another Scene is
valid. Input order and append order are preserved. This is deterministic list order,
not sibling/render sorting, layering or relationships (v0.3.4 remains deferred).

Optional binding defaults to null. References must target the Scene project,
consistent with Phase 2 project-local references; malformed reference structure is
validated only by createAssetReference. Existence/kind/subresource resolution is
not performed during capture. Repeated targets are allowed; no Asset definitions,
locators, loaded textures or direct URLs are copied into entries. Missing targets
stay authored references; no auto-registration or object deletion. Existing Phase 2
resolver/diagnostics remain canonical and can consume each binding directly.

Every capture detaches/freezes outer record, Scene identity/definition, list,
membership entries, object definitions and references. Add returns a revalidated
candidate, preserving the source even on rejection. List/get read factory snapshots;
get validates the exact local key and returns undefined for an absent valid key.
Construction projects known fields, not a persisted-data reader or migration API.
No global registry, clock, hidden ID generator, IO, gameplay, placement or rendering.

Eight paths: editor/src/scene-membership.ts, src/index.ts,
manual/scene-membership.mts, manual/README.md, AGENTS.md; root README;
harness/CONTRACTS.md and this checkpoint. Infrastructure allowance covers docs.
Exactly five projects; no manifests/lockfile, graph, checker, workflow,
Render/Engine/Client/Server source or package export-map changes.

## Manual observations

Optional public-root consumer strict-compiled and ran with exit 0. Finite output
was MANUALLY_OBSERVED, not an automated behavioral test:

- One Scene listed player-visual and monster-1/2/3 in declaration/append order.
  Earlier/current snapshots retained counts 2, 3 and 4 after candidate adds.
- Input unchanged, list/entry/definition/reference/Scene detachment and recursive
  frozen observations all printed true. Caller list clearing and object/Asset key
  edits did not change retained captured values; initial count stayed 2.
- All three monster bindings resolved through Phase 2 to the exact same catalog
  definition (identity comparison true); membership entry keys were only definition
  and assetReference. Player binding was null; get of an absent key was undefined.
- Phase 2 diagnoseAssetReference on an empty catalog reported TARGET_NOT_FOUND,
  fileExistence NOT_CHECKED; membership retained four objects and catalog count 0.
- Duplicate ID at create and add, and foreign-project binding, printed TypeError;
  complete source count stayed 4. Empty, assetless and second-Scene reuse printed
  valid snapshots without requiring an Asset catalog or backend.
- Final marker AUTHORED_MEMBERSHIP_ONLY / ASSETS_NOT_LOADED / VISUAL_NOT_VERIFIED.

No tests, assertions, runners/helpers, coverage, matrix or automatic runtime CI job.

## Future contract stress cases — DESIGN_ONLY

- Reference survives source relocation because it contains logical project/Asset
  keys only; existing Phase 2 relocation remains canonical. No file operation is
  implemented or demonstrated by this task.
- Zero-Asset Scenes can have empty membership or unbound objects without catalogs.
- Missing Asset diagnostics remain Phase 2; no policy deletes authored objects.

Placement, ordering/relationships, loaders (Feature 07), visual instances (08),
coordinates/camera (04/09), UI and persistence/export (05/19) remain DEFERRED.

## Verification

| Gate | Observed result |
| --- | --- |
| node harness/cli.mjs check | ARCH_CHECK_PASS; 36 JS/TS files; static scan only |
| node harness/cli.mjs scope --projects editor,runtime-render --allow-infra | SCOPE_PASS; eight declared paths |
| node harness/cli.mjs verify --projects editor,runtime-render --with-consumers | BUILD_PASS: runtime-render, editor, game-client |
| npm run build -- --force | Exit 0; all five projects |
| Manual strict NodeNext compile and Node execution | Exit 0 each after correcting a disjoint-type reference comparison in the manual example |
| Actual emitted declarations / root export inventories | Editor 60, Render 17; source/declaration inventories match; eight additive symbols, no removals; real package root resolves |
| git diff --check | Passed |

Manual commands are in editor/manual/README.md. No failed/unconfigured build remains;
the existing Windows Harness DEP0190 child-process warning is unchanged.
Exact checkpoint SHA and push/PR CI links
are placed in PR #3 after commit to avoid a self-referential SHA in this file.
Builds/static imports do not establish functional/visual PASS. Rendering, animation,
file IO/save, gameplay and visual correctness remain NOT_VERIFIED.
