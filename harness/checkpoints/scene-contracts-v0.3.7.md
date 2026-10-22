# v0.3.7 — Scene Validation & Relationship Diagnostics (SC12)

READY_FOR_DEVELOPER_REVIEW; acceptance belongs to Developer. Stop before v0.3.8.

## Preflight and scope

Started at v0.3.6 fad00b34ccf900f838e05c0f054936d932f9c0aa on
feat/editor-render-scene-contracts-v0.3, continuing existing Draft PR #3:
https://github.com/TjnhPro/rpg-platform/pull/3. Developer supplied the next scoped
task, with the earlier instruction to implement/verify and review at the final step.
Live verified Phase 1 PR #1 MERGED at 4cec85b5a00e2477f00eee29e2da6025a532e973;
Phase 2 PR #2 MERGED at fea9b734b849fa1c6bc953530e1fa425d43cfca8 (Phase 3 base).

Read root/project guidance, architecture, foundation, Harness ownership/contracts/
verification/workflow, actual Scene/Asset modules and Editor/Render root exports/
manifests. Editor is the only production owner. Scene factories own structural
validation; Scene operations retain authored snapshots. Phase 2 owns catalog and
Asset diagnostics; reuse those functions without a second resolver. Render has no
authored Scene validation authority and needs no source changes. No L1/L2 API is
needed or modified; no boundary conflict found. Editor began at 67 root symbols,
Render 17. No framework research was necessary to decide this local boundary.

Twelve paths: editor/src/scene-definition.ts, scene-object-definition.ts,
scene-membership.ts, scene-validation.ts, scene-diagnostics.ts, index.ts;
editor/manual/scene-diagnostics.mts, manual/README.md, AGENTS.md; root README;
harness/CONTRACTS.md and this checkpoint. Infra allowance covers documentation.
Exactly five projects; no Engine/Render/Client/Server source, dependency graph,
L1/L2 pins, manifests/lockfile, export map, package versions, checker or workflows.

## Contract and deterministic priority

Five additive exports: diagnoseSceneMembership, SceneDiagnosticCode,
SceneDiagnosticTarget, SceneDiagnostic, SceneMembershipDiagnosticResult. Editor
67 -> 72; Render remains 17. Existing public signatures/records remain unchanged.

diagnoseSceneMembership(input: unknown, catalog?: AssetCatalog) first calls the
canonical createSceneMembership. Its factories gain an internal SceneValidationError
(a TypeError subclass) and path-prefix channel, following Phase 2's convention.
Existing validation conditions, order and messages remain unchanged; no broad
TypeError/message interpretation. Asset structural errors retain Phase 2's own
validation and get a containing Scene path. Operation-specific errors are unchanged.
Unknown getter/Proxy/runtime errors propagate, not invalid/unresolved results.

Malformed input yields status invalid, membership null, exactly the first canonical
structural diagnostic, and assetReferences NOT_CHECKED. This includes malformed
Scene/Object IDs/labels, membership shapes/duplicates, foreign bindings, invalid
references/layer/placement, self/cross-Scene or malformed attachments. Diagnostic
target hints use own data descriptors, without invoking accessors a second time.
Paths start at membership, e.g. membership.objects[1].definition.objectId.

After successful capture, all unresolved references are assessed in membership
order, attachment before Asset per entry. An ephemeral set checks exact scene-local
attachment target presence; missing target gives OBJECT_TARGET_NOT_FOUND with its
objectId and path. It does not change the reference or remove the source object.
With a caller-supplied factory AssetCatalog, diagnoseAssetReference supplies the
actual Phase 2 codes/details, mapped into the containing Scene path: TARGET_NOT_FOUND,
KIND_MISMATCH, PROJECT_MISMATCH and SUBRESOURCE_NOT_SUPPORTED. No target/kind policy
is reimplemented. Catalog project mismatch is distinct from invalid foreign-project
Scene bindings through status and details.

Structurally valid input returns a detached frozen membership and status valid or
unresolved. Valid means no issues under the performed checks, not that unchecked
Assets exist. assetReferences is CHECKED only when a catalog was supplied; otherwise
NOT_CHECKED, with no presence/missing inference or forced IO. Physical fileExistence
is always NOT_CHECKED, including resolved metadata. A valid empty Scene needs no
Asset, placement, renderer, browser or storage. Diagnostics/list/target/primitive
details are frozen; no raw Error or caller object is retained.

Only the approved nonhierarchical attachment kind exists. Reciprocal attachments
are valid when both targets exist; no parent transform, hierarchy or acyclic rule
is implied. Hierarchy cycle policy is DEFERRED until a hierarchy is approved. No
generic DAG scheduler, autofix, placeholder deletion, ID remap, Asset fabrication,
file crawling, migration, persistence or runtime presentation implementation.

## Manual observations

Optional scene-diagnostics.mts strictly compiled through the public package root
and executed with exit 0 after correcting its initial missing required Asset
metadata fixture field. Final finite observations, MANUALLY_OBSERVED:

- Empty Scene and catalog-backed present Asset returned valid. Without catalog,
  the same binding returned valid with assetReferences NOT_CHECKED, not presence.
- Deleting image from the supplied catalog returned unresolved/TARGET_NOT_FOUND
  at membership.objects[0].assetReference.assetId. fileExistence stayed NOT_CHECKED.
- Removing lamp from the Scene retained glow's authored target and returned
  OBJECT_TARGET_NOT_FOUND with relatedObjectId lamp and attachment target path.
- Kind mismatch, unsupported subresource and wrong-project catalog reused the
  corresponding Phase 2 diagnostics and precise containing paths.
- null input, duplicate lamp, NaN x, empty Asset ID, foreign binding, self relation,
  cross-Scene relation and missing relation key returned invalid with distinct
  codes/paths. No structural failure proceeded to Asset presence assessment.
- Reciprocal lamp/glow attachments returned valid; no invented cycle rejection.
  One orphan with both missing object/Asset gave local diagnostic then Asset
  diagnostic, preserving both references.
- Original source unchanged, detached returned snapshot and frozen result/list/
  diagnostic/target/details observations printed true. A host getter TypeError
  propagated with the identical object (true), rather than being classified.
- Final marker AUTHORED_DIAGNOSTICS_ONLY / FILE_EXISTENCE_NOT_CHECKED /
  CYCLE_POLICY_DEFERRED / VISUAL_NOT_VERIFIED.

No test suite/assertions, runner/helper, coverage/matrix or automatic runtime CI.
Negative references remain inspectable; no authored state is repaired or mutated.

## Verification and limits

| Gate | Observed result |
| --- | --- |
| node harness/cli.mjs check | ARCH_CHECK_PASS; 42 JS/TS files, static scan only |
| node harness/cli.mjs scope --projects editor,runtime-render --allow-infra | SCOPE_PASS; twelve declared paths |
| node harness/cli.mjs verify --projects editor,runtime-render --with-consumers | BUILD_PASS: runtime-render, editor, game-client |
| npm run build -- --force | Exit 0, all five projects |
| Strict public-root NodeNext compile | Exit 0, diagnostics plus all six prior Scene consumers |
| Optional public-root diagnostics sequence | Exit 0, final observations above |
| Actual emitted declarations/root inventories | Editor 72 / Render 17, source/declaration match, five additions/no removals, built root resolves |
| git diff --check | Passed |

No remaining failed/unconfigured build. Existing Windows Harness DEP0190 warning
unchanged. Resulting commit and exact-head push/PR CI evidence go in PR #3 to avoid
a self-referential SHA. Build/static success is not functional/visual PASS. Product
UI, physical files, rendering, animation, spatial semantics, gameplay and any future
hierarchy remain NOT_VERIFIED/DEFERRED. Developer review pending; v0.3.8 not started.
