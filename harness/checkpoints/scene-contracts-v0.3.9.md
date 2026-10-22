# v0.3.9 — Scene Authoring & Compatibility Integration (SC14, SC16)

READY_FOR_DEVELOPER_REVIEW; Developer owns acceptance. Stop before v0.3.10.

## Preflight and scope

Started at accepted v0.3.8 22d77a2a5db066609ed44fc3aa7d7a57623c3b6a on
feat/editor-render-scene-contracts-v0.3, continuing Draft PR #3:
https://github.com/TjnhPro/rpg-platform/pull/3. Developer supplied this next task
and previously instructed implementation/verification with review at the final step.
Live verified Phase 1 PR #1 MERGED at 4cec85b5a00e2477f00eee29e2da6025a532e973;
Phase 2 PR #2 MERGED at fea9b734b849fa1c6bc953530e1fa425d43cfca8 (Phase 3 base).

Read root/project guidance, architecture/foundation, Harness ownership/contracts/
verification/workflow, v0.3.0 constraints and actual Scene/Asset/Render modules,
public roots, manifests and emitted declarations. Primary owner: Editor authoring.
Render collaborates through its unchanged existing metadata contract; no Render
file change is needed. No L1/L2 API is required or modified. No architecture conflict
found. Current source is sufficient to decide the boundary; no external framework
research or new production API is justified for this integration checkpoint.

Six paths only: editor/manual/scene-authoring.mts, manual/README.md, AGENTS.md;
root README.md; harness/CONTRACTS.md and this checkpoint. Infra allowance covers
documentation. No production source, manifest/export map, lockfile/pin, workflow,
package version, graph or ownership changes. Exactly five projects; no Engine,
Client or Server implementation touched. Existing Scene APIs are the canonical
root surface; no alias wrapper, metadata bag or speculative extension point.

## Public inventory and validation audit

All 31 Scene root symbols introduced v0.3.1–8 are accounted for below. Existing
Phase 2 baseline Editor 43 plus these 31 = 74; Render remains 17. Actual source
exports and emitted declarations are compared after builds, not inferred from docs.

| Origin | Functions | Types |
| --- | --- | --- |
| v0.3.1 (6) | createSceneIdentity, createSceneDefinition | SceneIdentityInput, SceneIdentity, SceneDefinitionInput, SceneDefinition |
| v0.3.2 (3) | createSceneObjectDefinition | SceneObjectDefinitionInput, SceneObjectDefinition |
| v0.3.3 (8) | createSceneMembership, addSceneObject, listSceneObjects, getSceneObject | SceneObjectMembershipInput, SceneObjectMembership, SceneMembershipInput, SceneMembership |
| v0.3.4 (3) | reorderSceneObjects | SceneObjectReference, SceneObjectAttachment |
| v0.3.5 (1) | none | SceneObjectPlacement |
| v0.3.6 (3) | removeSceneObject, replaceSceneObject, updateSceneObjectPlacement | none |
| v0.3.7 (5) | diagnoseSceneMembership | SceneDiagnosticCode, SceneDiagnosticTarget, SceneDiagnostic, SceneMembershipDiagnosticResult |
| v0.3.8 (2) | describeSceneObjectVisual | SceneObjectVisualDescription |

Canonical validation paths remain distinct rather than competing:

- Scene identity/definition factories validate exact caller keys. Object factory
  owns local key and opaque optional labels. Membership composes them, plus the
  Phase 2 createAssetReference; it owns duplicates, project-local binding, layer,
  attachment and finite placement capture. Similar key conventions do not make
  Scene, Object and Asset identities interchangeable.
- Add/remove/replace/update/reorder produce candidates through that membership
  capture. Get validates its key through the object factory; list reads a factory
  snapshot. Full permutation and operation-target checks are operation semantics,
  not independent object validators. No parallel registry or global IDs.
- diagnoseSceneMembership uses the same capture and structured internal failures,
  then owns missing local-target diagnostics and delegates Asset checks to Phase 2.
  It does not parse exception messages or reimplement Asset lookup. Unknown host
  exceptions propagate. Internal error types remain implementation details, not
  root exports; public diagnostic unions emit correctly without exporting internals.
- describeSceneObjectVisual uses local lookup/capture and existing Phase 2
  resolveAssetReference/describeResolvedVisualAsset. Render receives only existing
  VisualResourceDescriptor via prepareVisualResource, with its separate boundary
  validation. That protects neutral Render input rather than redefining Scene rules.

Compared with v0.3.0 invariants, emitted records remain readonly declarative data:
explicit project/scene/object keys, ordered optional-content membership, optional
placement and nonhierarchical attachment intent. No compulsory Map, texture,
viewport, root node or coordinates. No Scene catalog/Render instance/gameplay world
equivalence. Later task specifics refined the original proposed version allocation;
the v0.3.0 roadmap was design-only, not an alternative API specification.

## Supported authoring workflow and compatibility

The root-only scene-authoring.mts uses existing create identity/definition/object/
membership, list/get, add, replace, placement update, reorder and remove. A relation
edit is explicit same-ID replacement, not a missing dedicated subsystem. Caller
chooses which immutable candidate to adopt; there is no hidden store/history/save.

| Case | Current contract and safe caller behavior |
| --- | --- |
| Identity | Explicit exact case-sensitive keys; object identity scoped by project/scene. Label, order, placement and unrelated object edits do not derive new IDs or rebind Assets. Value stability does not mean JS reference equality across captures |
| Optional data | Labels and Asset reference default null; layer/attachment/placement omission stays absent, explicit null retained. Visual projection alone maps absent placement to null |
| Focused edits | Spread current entry and nested definition for selected label/relation edits; placement updater preserves other known fields. Complete replacement intentionally resets omitted fields and cannot rename/upsert |
| Removal | Other authored references remain; dangling targets are diagnosable, never cascaded or repaired |
| Unknown Scene/Object fields | No extension field exists. Factories read known construction fields, ignore unknown host fields and leave caller input unchanged. Spreading a captured record cannot recover ignored data |
| Asset metadata | Phase 2 portable metadata retains unknown extension keys under its own explicit contract; that behavior does not extend implicitly to Scene/Object records |
| Future Document use | Keep original caller data separate. Never overwrite an unknown document with a factory projection. Feature 05/19 must explicitly choose preservation or rejection before save; no lossless Scene reader, versioned envelope or migration contract exists here |

Current captures are detached frozen plain records/arrays/scalars, with no DOM,
Three.js instance, Editor tab/selection state, renderer resource handle or gameplay
state in their declared or constructed output. They are portable declarative data
in principle, not a chosen file format or guarantee that arbitrary future records
round-trip. No serializer, import/export, persistence or generic schema is added.

## Future stress assessment — DESIGN_ONLY / DEFERRED

| Future case | Identity compatibility assessment and deferred owner |
| --- | --- |
| Map | Existing project/scene/object tuple can address authored occurrences; a Map need not rename them. Features 14/15 choose Map association and tools; Features 04/09 choose spatial semantics. No Map field/schema implemented |
| Player/Monster visual metadata | Existing labels may describe visuals without gameplay authority. A later justified typed visual extension can associate with the same tuple; no identity break is demonstrated. Editor owns authored visual data; Engine owns actual gameplay state/rules. No mutable any bag or HP/AI/drop fields |
| Animation clip reference | Existing AssetReference subresourceId is opaque and nonnull resolution is currently unsupported. Future animation work with Asset/Render owners must define real clip addressing/consumption. It need not replace Scene/Object/Asset identity; no clip resolver or supported animation claim |
| Optional Scene nesting | Current attachment allows only same-Scene nonhierarchical intent, not nesting. A future Editor composition contract must distinguish definition identity from repeated occurrence identity and choose cycles/remap rules; Feature 08 consumes instances. Existing scoped keys can remain, but current tuple alone is not promised as a globally unique nested runtime instance ID |

No demonstrated case requires changing existing identity contracts. This is not a
promise of zero future schema/API changes: payload, nesting occurrence and portable
Document contracts remain open until actual consumers justify them.

## Verification evidence

Results are recorded after running the final gates. Exact checkpoint SHA and push/PR
CI links belong in PR #3 to avoid a self-referential committed SHA.

| Gate | Observed result |
| --- | --- |
| node harness/cli.mjs check | ARCH_CHECK_PASS; 45 JS/TS files, static scan only |
| node harness/cli.mjs scope --projects editor,runtime-render --allow-infra | SCOPE_PASS; six declared paths |
| node harness/cli.mjs verify --projects editor,runtime-render --with-consumers | BUILD_PASS: runtime-render, editor, game-client |
| npm run build -- --force | Exit 0; all five projects |
| Strict public-root NodeNext compile | Exit 0; all nine Scene manual consumers, including scene-authoring.mts |
| Optional finite authoring consumer | Exit 0; observations below |
| Actual emitted declarations/root inventories | Source/declaration names match: Editor 74, including 31 Scene symbols; Render 17; root source unchanged, no symbol changes; both roots resolve |
| git diff --check | Passed |

MANUALLY_OBSERVED in the finite console output:

- Across all seven snapshots, demo/room and lantern remained unchanged; the Asset
  reference stayed demo/lantern-image, expectedKind image, subresourceId null.
  Explicit order changed lantern/glow to glow/lantern, then lantern after removal.
- Original label remained Lantern; final label Warm lantern. Final placement was
  author-space/(4,6), with original decorations layer and Asset binding retained.
  Previous glow attachment still targeted room/lantern; later relation was null
  and final lookup of the removed glow was absent. Old snapshots remained readable.
- Captured membership keys were scene/objects, Scene keys identity, object definition
  keys objectId/displayName/classification. Unknown futureNote and activeTab were
  absent; host note and activeTab remained caller-accessible and mutable. Captured
  frozen and caller-still-mutable observations both printed true after host edits.
- Full original/final records contained only authored scalar/record/array data.
  Final marker: AUTHORED_RECORDS_ONLY / UNKNOWN_FIELDS_NOT_ROUND_TRIPPED /
  NO_DOCUMENT_IO / VISUAL_NOT_VERIFIED. No resource or document IO occurred.

No failed/unconfigured build. Existing Windows Harness DEP0190 warning unchanged.
Source review confirms one-way Editor-to-Render imports and no cross-project private
imports. These observations cover the finite authoring sequence only; they are not
an exhaustive behavioral guarantee or acceptance of the Phase 3 MVP.

No tests/assertions, runner/helper, coverage/matrix or automatic runtime job added.
Build/static evidence is not functional PASS. Actual Scene rendering, placement
display, animation, files/resource loading, UI, gameplay and serialized compatibility
remain NOT_VERIFIED/DEFERRED. No v0.3.10 implementation, merge, tag, release or publish.
