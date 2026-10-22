# v0.3.2 — Visual Object Identity & Definition (SC03/SC04)

Status: READY_FOR_DEVELOPER_REVIEW. Developer owns acceptance. Stop before v0.3.3.

## Preflight and ownership

Started at accepted v0.3.1 checkpoint 80179e1f25493f86bcab131d1ace15dc928598e6,
on feat/editor-render-scene-contracts-v0.3, continuing Draft PR #3:
https://github.com/TjnhPro/rpg-platform/pull/3.
Phase 1 PR #1 is MERGED at 4cec85b5a00e2477f00eee29e2da6025a532e973;
Phase 2 PR #2 is MERGED at fea9b734b849fa1c6bc953530e1fa425d43cfca8,
the accepted Phase 3 branch base. Live GitHub states and current source were read.
Task continuation authorizes this additive version contract; no baseline API changes.

Read root/project guidance, architecture, foundation pins, ownership, contracts,
verification/workflow and actual Scene/Asset/Render modules/exports/manifests.
Before this task Editor exposed 49 symbols; Render 17. Editor is the canonical
owner of authored object definitions. No Render collaborator needs source changes:
no presentation instance is requested. No L1/L2 APIs are needed; external pins,
Engine, Client and Server source, five-project graph and package exports stay intact.

## Contract and declared scope

Three additive Editor root exports: SceneObjectDefinitionInput,
SceneObjectDefinition and createSceneObjectDefinition. The working consumer is
editor/manual/scene-object-definition.mts, importing only @rpg-platform/editor.

- objectId is caller-provided, nonempty, whitespace-free and case-sensitive,
  without normalization/coercion/generation. Equal keys identify the same authored
  object only within the same owning Scene; a standalone record has no Scene
  context. A future external address requires project + Scene + object keys.
- displayName and classification accept nonblank strings or null/absence;
  strings retain exact text, absence becomes null. Classification is an opaque
  authoring label with no gameplay dispatch, schema registry or backend selection.
- Factory projects only known fields into a fresh frozen record. All fields are
  immutable scalars, so no nested mutable references survive. Caller data stays
  mutable. Invalid structure/fields throw TypeError; unknown host exceptions
  propagate. Like Scene construction, this is not a persisted snapshot reader.
- No Scene attachment, membership list, uniqueness registry, Asset reference,
  placement/transform, parent/root/component, GPU instance or gameplay fields.
  No extensibility map is needed by this consumer; controlled extensions remain
  DEFERRED until demonstrated rather than introducing an arbitrary state bag.

Eight paths: Editor src/scene-object-definition.ts, src/index.ts,
manual/scene-object-definition.mts, manual/README.md, AGENTS.md; root README;
Harness CONTRACTS.md and this checkpoint. Infra allowance covers documentation.
Existing Scene and Asset APIs/semantics remain unchanged; Editor grows 49 -> 52
root symbols and Render remains 17. No manifests, lockfile, checks or CI changes.

## Manual evidence and future stress cases

Optional public-root consumer strict-compiled and executed with exit 0.
MANUALLY_OBSERVED finite output:

- visual-0012 and visual-0013 were distinct definitions; the latter contained only
  its ID and null labels, with no Asset or placement required.
- inputUnchanged, callerMutable, detached, independentCaptures and frozen all
  printed true. Host edits left both prior captures at visual-0012 with old labels.
- Known output keys were exactly objectId, displayName, classification; repeated
  reads preserved the ID and case Visual-0012 was retained.
- A second standalone visual-0012 capture succeeded, without claiming membership
  or uniqueness. Empty/whitespace/numeric IDs and invalid labels printed TypeError.
- Final marker: AUTHORED_DATA_ONLY / NO_MEMBERSHIP / RENDERING_NOT_PERFORMED /
  VISUAL_NOT_VERIFIED.

No tests/assertions/runners/helpers or automatic runtime CI job are introduced.

DESIGN_ONLY, no stress implementation or scalability claim:

- VFX placeholder: identity and an optional label suffice before an Asset exists;
  eventual binding belongs to Scene membership/Asset contracts, not a fake loader.
- 500 monster visuals: 500 caller keys can describe independent authored records;
  uniqueness at insertion is v0.3.3, placement is later Phase 3, GPU allocation is
  Feature 08. Labels confer no HP, AI, spawning or gameplay authority.
- Text RPG object: the same descriptor needs no map, position, texture or backend.

## Verification

| Gate | Observed result |
| --- | --- |
| node harness/cli.mjs check | ARCH_CHECK_PASS; 34 JS/TS source files, static scan only |
| node harness/cli.mjs scope --projects editor,runtime-render --allow-infra | SCOPE_PASS; eight declared paths |
| node harness/cli.mjs verify --projects editor,runtime-render --with-consumers | BUILD_PASS: runtime-render, editor, game-client |
| npm run build -- --force | Exit 0; all five workspace projects compiled |
| Manual strict NodeNext compile and Node execution | Exit 0 each; finite observations above |
| Actual emitted .d.ts / public-root inventory | Editor 52, Render 17; source/declaration exports match; three additive Editor exports, none removed |
| git diff --check | Passed |

No failed/unconfigured local build. Existing Windows Harness DEP0190 child-process
warning remains unchanged. Manual commands are in editor/manual/README.md; actual
package resolution points to Editor's declared built root.

BUILD_PASS is compilation evidence only. Visuals, rendering, animation,
file IO/persistence, Scene membership and gameplay remain NOT_VERIFIED/DEFERRED.
The resulting checkpoint SHA and exact-head push/PR CI links are recorded in PR #3
after commit; this report avoids a self-referential SHA.
