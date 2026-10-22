# v0.3.4 — Object Ordering & Relationship Contracts

SC07; SC09/SC10 contract groundwork. READY_FOR_DEVELOPER_REVIEW; acceptance is
Developer-owned. Stop before v0.3.5 Placement Data Foundation.

## Preflight

Started at v0.3.3 checkpoint 9ea409aa4f1bd78e71f956a889e672a2445fb3a1 on
feat/editor-render-scene-contracts-v0.3, continuing Draft PR #3:
https://github.com/TjnhPro/rpg-platform/pull/3.
Developer supplied the next scoped task; no automatic future version acceptance.
Live GitHub verified Phase 1 PR #1 MERGED at
4cec85b5a00e2477f00eee29e2da6025a532e973 and Phase 2 PR #2 MERGED at
fea9b734b849fa1c6bc953530e1fa425d43cfca8 (exact Phase 3 base).

Read root/project guidance, architecture, foundation, ownership, contracts,
verification/workflow and actual Scene/Object/membership/Asset and Render APIs and
manifests. Editor started with 60 root symbols, Render 17. Membership's list already
preserves declaration/append order; Phase 2 references demonstrate exact logical
keys but its Asset resolver must not become an object resolver.

Editor is the canonical source owner. No Render API/source collaborator is needed:
this task captures authored intent, not runtime relationships. No L1/L2 API calls,
foundation edits or pin changes. This task authorizes additive ordering/reference
contracts; no new ownership or dependency edge is introduced.

## Contract delta and rationale

Three new Editor root symbols: reorderSceneObjects, SceneObjectReference,
SceneObjectAttachment. Membership input/result types gain optional layerKey and
attachment fields. Old required fields/signatures remain intact; omission retains
the original two-key entry shape, and explicit null stays null. SceneDefinition,
SceneObjectDefinition and Asset contracts are unchanged. Editor 60 -> 63; Render 17.

- Authored order is the membership list order, stable across unrelated metadata
  edits that retain input order. Reorder accepts every existing exact ID once;
  missing/extra/duplicate/unknown keys reject without changing the source. New
  candidates recapture existing data; IDs and binding values never change implicitly.
- Optional layerKey is an exact nonempty whitespace-free string or null; no
  normalization, layer registry, depth, priority or Render sort behavior. No lookup
  is needed to capture a layer key. Different keys do not impose order.
- One justified relation: a VFX visual placeholder may declare attachment intent
  to another visual object. The typed record is kind attachment plus a target
  containing exact sceneId/objectId. The project is inherited from the owning Scene;
  target Scene must match. This prevents accidental cross-Scene ID collision.
- Target existence is independent of capture. Missing/forward targets remain
  authored references, without deletion or invented resolution status. Self-target
  rejects. No Asset resolver is used for objects. There is no target pointer,
  parent/root requirement, scene tree, ownership cascade or transform propagation.
- Attachment is explicitly nonhierarchical metadata: cycles between distinct
  objects are not traversed or rejected here. Runtime interpretation and future
  validation must define their constraints before execution; no acyclic hierarchy
  guarantee is made. Cross-Scene references remain DEFERRED.
- Capture/add/reorder detach and freeze attachment/target records and retain
  supplied optional values. Existing factory validation remains canonical.

Eight paths: editor/src/scene-membership.ts, src/index.ts,
manual/scene-ordering.mts, manual/README.md, AGENTS.md; root README;
harness/CONTRACTS.md and this report. Infra allowance is documentation only.
Five projects; no Engine/Render/Client/Server source, manifest/lockfile, workflow,
checker, export map, package version or dependency changes.

## Manual evidence and design stress cases

Optional public-root manual consumer strict-compiled and executed with exit 0.
Finite output MANUALLY_OBSERVED:

- Initial and unrelated caption-label edit both listed player, spark, caption.
  Explicit reorder listed spark, player, caption; original order stayed unchanged.
- Before/after player records retained player identity, demo/player-image reference
  and actors layer. Spark retained its attachment to room/player. Caller target
  edit and order-array reversal did not change the reordered candidate.
- Frozen outer snapshot, list, attachment and target each printed true.
- Adding unresolved-effect preserved reference to room/future-visual while get of
  future-visual returned undefined. This is no target-existence success claim.
- Plain text-only object needed no relation/layer; entry keys stayed definition
  and assetReference. Explicit null layer/attachment values were retained.
- Incomplete, duplicate and unknown ID permutations printed TypeError; source IDs
  stayed player, spark, caption. Cross-Scene and self attachments printed TypeError.
- Final marker AUTHORED_ORDER_AND_INTENT_ONLY / NO_TRANSFORM_PROPAGATION /
  VISUAL_NOT_VERIFIED.

No tests/assertions/runners/helpers, coverage, test matrix or runtime CI job added.

DESIGN_ONLY stress cases: VFX attached to a player is representable as authored
intent without gameplay entity coupling; several layer keys need no renderer order;
objects without parent/relation/layer remain valid. None demonstrates actual VFX
following, layer compositing or parent behavior. Hierarchy/renderer instances are
future scope; no framework research is needed to copy a scene tree model.

## Verification and limits

| Gate | Observed result |
| --- | --- |
| node harness/cli.mjs check | ARCH_CHECK_PASS; 37 JS/TS files; static scan only |
| node harness/cli.mjs scope --projects editor,runtime-render --allow-infra | SCOPE_PASS; eight declared paths |
| node harness/cli.mjs verify --projects editor,runtime-render --with-consumers | BUILD_PASS: runtime-render, editor, game-client |
| npm run build -- --force | Exit 0; all five projects |
| Manual strict NodeNext compile | Exit 0; current ordering and three prior Scene consumers |
| Optional current manual Node execution | Exit 0; finite observations above |
| Actual .d.ts and public roots | Editor 63 / Render 17; source/declaration names match; three additions and no removals; actual Editor built root resolves |
| git diff --check | Passed |

No failed/unconfigured build. Existing Windows Harness DEP0190 warning unchanged.
Manual commands are in editor/manual/README.md. Optional fields emit as optional in
the real declarations; prior consumers compile without source changes.
Exact checkpoint
SHA and push/PR CI links go into PR #3 after commit, avoiding a self-reference.
Builds/static scans do not establish functional/visual PASS. Placement, transforms,
layer sorting, rendering/animation, UI, gameplay and file IO remain NOT_VERIFIED.
