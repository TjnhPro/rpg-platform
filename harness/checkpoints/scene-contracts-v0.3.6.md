# v0.3.6 — Immutable Scene State Operations (SC11, SC13)

READY_FOR_DEVELOPER_REVIEW; Developer owns acceptance. Stop before v0.3.7.

## Preflight and scope

Started at v0.3.5 c633b9e12235c8d24b47594f4967b5c52247ff40, continuing
feat/editor-render-scene-contracts-v0.3 and existing Draft PR #3:
https://github.com/TjnhPro/rpg-platform/pull/3. Developer supplied this next scoped
task and previously instructed implementation/verification with review at the end.
Phase 1 PR #1 live verified MERGED at 4cec85b5a00e2477f00eee29e2da6025a532e973;
Phase 2 PR #2 MERGED at fea9b734b849fa1c6bc953530e1fa425d43cfca8, the exact
Phase 3 baseline. No main rebase, new PR or next-version work.

Read root/project guidance, architecture/foundation, Harness ownership/contracts/
verification/workflow and current public exports/manifests. Editor is the sole
production owner. Existing create/add/list/get/reorder operate on SceneMembership
snapshots through canonical Scene/Object/Asset capture. Phase 2 Asset APIs own
reference validation/resolution; Render's 17 symbols own host/session/presentation
metadata, not authored Scene state. Neither collaborator needs source changes.
No L1/L2 API is needed or changed. There is no boundary conflict or owner change.

Eight paths: editor/src/scene-membership.ts, src/index.ts,
manual/scene-operations.mts, manual/README.md, AGENTS.md; root README;
harness/CONTRACTS.md and this checkpoint. Infrastructure allowance is docs only.
Exactly five projects; no Engine/Render/Client/Server source, dependency graph,
manifest/lockfile, package version/export map, checker or workflow changes.

## Additive API and decisions

Editor 64 -> 67 root symbols; Render remains 17. Existing signatures/shapes and
factories are unchanged. Three additive functions have a real optional public-root
manual consumer; no new public type or subsystem is needed:

- removeSceneObject(snapshot, objectId): requires an existing local ID; retains
  the relative order and data of all other entries. Removing the last entry is
  valid. No implicit cascade or reference rewrite: attachments targeting a removed
  object remain authored intent, as existing missing-target capture permits.
- replaceSceneObject(snapshot, objectId, replacement): complete entry replacement
  at the same index, requiring the exact existing objectId. Never rename/upsert.
  Caller supplies retained metadata via spread when desired. Omitting an optional
  field clears it under the existing capture rules; omitted Asset reference becomes
  null, omitted placement/layer/attachment stays absent. This is not a patch merge.
- updateSceneObjectPlacement(snapshot, objectId, placementOrNull): focused update
  via replacement of the existing entry spread; preserves object definition, Asset
  reference values, layer, attachment, order and Scene identity. Null clears
  placement explicitly, without defining a new coordinate space or conversion.

Operations accept existing factory snapshots, consistent with add/get/reorder.
All ID/field checks reuse existing factories/get lookup; invalid IDs, missing
operation targets, renamed replacements, invalid placement or cross-project Asset
bindings throw TypeError. Unknown host exceptions propagate. Candidate capture
recursively detaches/freezes known authored fields before a result is returned.
Failures never write to the source. No secondary validator, registry, clock, ID
generator, storage, event bus, cache or history manager. Relationship updates use
complete replacement with existing attachment capture; ordering uses the already
approved full-permutation API. No new relationship semantics.

## Manual observations and deferred work

Optional scene-operations.mts strict-compiled and ran through the package root with
exit 0. MANUALLY_OBSERVED finite output:

- Original room contained lamp at author/(1,2). Add appended glow attached to lamp;
  replace set lamp to author/(4,6); focused update set other-space/(-8,0); remove
  retained only glow with its still-authored lamp reference. Scene identity stayed
  demo/room and the Asset target, labels and layer stayed intact during placement
  changes. Original snapshot remained unchanged.
- Original-unchanged, fresh-candidates, host-still-mutable, detached-point and
  frozen-snapshot observations all printed true. Editing caller x to 99 left the
  captured replacement at 4. Reordered entries retained metadata and placement.
- Null placement/attachment clearing and full replacement resetting omitted fields
  were visible. Independently captured other-room retained its own lamp record.
- Missing remove/replace/update targets, whitespace ID, rename, NaN placement and
  foreign-project Asset binding printed TypeError. Retained snapshots printed their
  previous values after these failures, with no partial changes.
- Final marker AUTHORED_CANDIDATES_ONLY / NO_HISTORY_STORE / VISUAL_NOT_VERIFIED.

No tests, assertions, runners/helpers, coverage, matrix or automatic runtime CI.
DESIGN_ONLY: future tabs/history can retain and select old immutable values in
caller-owned state. No undo/redo UI, dirty state, autosave, command framework or
storage transaction is implemented. Dangling-target diagnostics remain v0.3.7;
coordinates/conversion Feature 04/09; visual instances Feature 08. No framework
research was necessary for this additive operation boundary.

## Verification and limits

| Gate | Observed result |
| --- | --- |
| node harness/cli.mjs check | ARCH_CHECK_PASS; 39 JS/TS files; static scan only |
| node harness/cli.mjs scope --projects editor,runtime-render --allow-infra | SCOPE_PASS; eight declared paths |
| node harness/cli.mjs verify --projects editor,runtime-render --with-consumers | BUILD_PASS: runtime-render, editor, game-client |
| npm run build -- --force | Exit 0; all five projects |
| Strict NodeNext public-root compile | Exit 0; operations and all five prior Scene consumers |
| Optional operations consumer Node execution | Exit 0; finite observations above |
| Actual emitted declarations/root inventories | Editor 67 / Render 17; source/declaration exports match, three additions and no removals; built root resolves |
| git diff --check | Passed |

No failed/unconfigured build; existing Windows Harness DEP0190 warning unchanged.
Actual declarations expose the three operations using existing readonly records.
Resulting commit SHA and exact-head push/PR CI evidence are recorded in PR #3,
avoiding a self-referential SHA. Build/static success is not functional/visual PASS.
Product UI, actual rendering/animation, physical IO/persistence, gameplay and future
diagnostics/spatial behavior remain NOT_VERIFIED/DEFERRED. Developer review pending.
