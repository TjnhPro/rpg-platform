# v0.3.1 — Scene Identity & Definition (SC01/SC02)

**READY_FOR_DEVELOPER_REVIEW.** Stop before v0.3.2; no merge/tag/release/publish.
Continue [Draft PR #3](https://github.com/TjnhPro/rpg-platform/pull/3) on
`feat/editor-render-scene-contracts-v0.3`, with one checkpoint commit for this task.

## Preflight and decisions

Clean starting HEAD: approved v0.3.0 `777c3ef62ab9a3e8d8e322032b689bee4b19cfac`.
Developer supplied v0.3.1 with explicit instruction to continue implementation;
that authorizes this checkpoint, not automatic future versions. Live GitHub state:
PR #3 open Draft at that HEAD; PR #1 merged at
`4cec85b5a00e2477f00eee29e2da6025a532e973`, PR #2 merged at
`fea9b734b849fa1c6bc953530e1fa425d43cfca8`, the Phase 3 branch baseline.
Read required guidance, approved boundary decision, actual public exports/manifests,
Asset identity conventions and immutable data/consumer patterns. No new external
framework research was necessary: this task implements the approved ownership.

Canonical primary owner **Editor**. Render is an unchanged consumer boundary;
Scene creation needs neither its operations nor Asset catalog. No L1/L2 API is
needed. Core 2.0.0 `04b7239f998c3c688a0dfa3202f11811a9acd775` and Gameplay
0.15.2 `acea332aa80f67552192a72b30f81c0bbbfc56bd` remain pinned/read-only.

The minimum real operation is construction and direct inspection of an empty
authored Scene. Its entire current definition is `{ identity: { projectId,
sceneId } }`. No metadata/title/name is needed by this consumer, so none is added;
no empty object-list placeholder, schemaVersion, manager or inspect wrapper.
An identity-only definition represents zero authored contents in this revision;
object/membership APIs await their assigned versions.

Both keys follow existing Asset project/local-key conventions: nonempty strings
without whitespace, exact case-sensitive equality, no trimming/coercion/Unicode
normalization or generated UUIDs. Identity equality compares the project/scene
pair; equal local IDs in different projects do not collide. The caller chooses and
retains keys; creation does not enforce uniqueness across independent definitions.
The small Scene validator is owner-local; it neither constructs an AssetIdentity
nor introduces a shared project-ID subsystem or changes Asset validation.

Creation detaches/freeze-captures the identity and outer definition without freezing
caller data. Results are readonly plain data; repeated reads retain the same keys
and identity record. Independent calls share no mutable state or object identity.
Invalid structure/keys throw TypeError; host getter/Proxy exceptions propagate.
These are typed construction factories projecting known fields, not strict saved
record readers: extra host fields are not retained. Do not use them to migrate or
round-trip unknown persisted Scene data. Persistence/envelopes remain Features 05/19.
Title and save path remain host concerns, with no filename/database policy.

## Public delta and file scope

| Owner / package root | Added symbol | Purpose |
| --- | --- | --- |
| Editor | SceneIdentityInput | Explicit projectId/sceneId construction keys |
| Editor | SceneIdentity | Readonly captured logical identity |
| Editor | createSceneIdentity | Validate/capture identity without a registry |
| Editor | SceneDefinitionInput | Explicit identity input for the empty definition |
| Editor | SceneDefinition | Immutable authored identity-only snapshot |
| Editor | createSceneDefinition | Create/detach/freeze that definition |

Editor grows 43 -> 49 root symbols; Render remains 17. Existing public symbols,
Asset schema/semantics, package export maps and dependency graph are unchanged.
The manual consumer imports only `@rpg-platform/editor`; internal module paths are
not public imports. Scene module itself imports no Engine/Render/Asset/DOM APIs.
The existing Editor root bootstrap imports remain unchanged and acquire no GPU.

Eight paths: Editor src/scene-definition.ts, src/index.ts, manual/scene-definition.mts,
manual/README.md, AGENTS.md; Harness CONTRACTS.md and this report; root README.
Root README's current API count is refreshed from 43 to 49, avoiding a newly stale
public inventory. Infra allowance covers this documentation. No Render/Engine/
Client/Server source, manifests, lockfile, pins, checker or workflow changes.

## Manual evidence and future stress cases

Optional public-root consumer strict-compiled and ran with Node, exit 0.
MANUALLY_OBSERVED finite output, not an automated test result:

- Captured text-project/intro-0012 using no Asset catalog, browser or graphics.
- Input unchanged by creation true; caller outer/identity records remain mutable.
- Detached outer/identity and frozen outer/identity observations all true.
- Repeated reads show the same identity; two captures have distinct outer/identity
  records. Editing caller identity to edited-host-id leaves all captures intro-0012.
- Host title and savePath rename leaves Scene unchanged. This demonstrates data
  independence only, not a physical file rename/save operation.
- other-project/intro-0012 remains a separate logical identity; Intro-0012 case is
  retained. Missing sceneId, whitespace and numeric ID examples produce TypeError.
- Final marker: SCENE_METADATA_ONLY / RENDERING_NOT_PERFORMED / VISUAL_NOT_VERIFIED.

Text-only empty Scene is observed as data. Same local key across projects is
observed. Future path-rename persistence behavior is DESIGN_ONLY (Features 05/19).
Visual Objects/membership, coordinates/projection (04/09), loaded resources (07),
visual instances (08), UI and gameplay remain DEFERRED to their owners. No Scene
Definition is treated as Render Scene Instance or Gameplay World.

## Verification

| Gate | Observed result |
| --- | --- |
| node harness/cli.mjs check | ARCH_CHECK_PASS; 32 JS/TS files, static scan only |
| node harness/cli.mjs scope --projects editor,runtime-render --allow-infra | SCOPE_PASS; eight declared paths |
| node harness/cli.mjs verify --projects editor,runtime-render --with-consumers | BUILD_PASS: runtime-render, editor, game-client |
| npm run build -- --force | Exit 0; full workspace TypeScript build |
| Manual strict NodeNext compile, then Node execution | Exit 0 for each; optional finite observations above |
| Real .d.ts and package root | Six new Scene symbols; source/declaration counts Editor 49 / Render 17; real Editor dist root resolves |
| git diff --check | Passed |

Manual commands are in editor/manual/README.md. No failed/unconfigured local build;
existing Windows Harness DEP0190 warning unchanged. Exact resulting checkpoint SHA
and push/PR CI evidence are recorded in PR #3 after push, avoiding a self-referential
SHA. Both CI runs must match that HEAD; older success is not this task's evidence.

No tests/assertions/runners/helpers, coverage or runtime CI job added. Builds do not
prove all behavior. Scene rendering, file IO/save, animation and visual correctness
remain NOT_VERIFIED; no functional/visual PASS or Developer acceptance is claimed.
