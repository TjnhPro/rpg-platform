# v0.5.0 — Document Architecture & Contract Foundation

DC01. **API_DESIGN_ONLY / FEATURE_NOT_VERIFIED**.
Architecture checkpoint only; no production code, public types, Document operations,
storage implementation or tests. Target disposition: READY_FOR_DEVELOPER_REVIEW.

## Preflight, authorization and exact baseline

Source HEAD / accepted Phase 4 integration baseline:
`e46ec24dc662b1bc1588d5ec1c05d4f62739ac3c`, synchronized local/remote main.
Developer explicitly requested merging Phase 4, then instructed implementation of
this task without waiting for intermediate review. That session authorization is
the basis for proceeding; merged status and green CI alone are not acceptance.
It does not establish visual or general functional verification of earlier phases.
Phase 5 starts here: no previous Phase 5 checkpoint exists or is assumed accepted.

| Accepted integration baseline | Exact SHA | Root symbols Editor / Render |
| --- | --- | --- |
| Phase 1, PR #1 | 4cec85b5a00e2477f00eee29e2da6025a532e973 | 8 / 14 |
| Phase 2, PR #2 | fea9b734b849fa1c6bc953530e1fa425d43cfca8 | 43 / 17 |
| Phase 3, PR #3 | 5ce0feb4c1967c0dee14919b9c11d56991a46bd0 | 74 / 17 |
| Phase 4, PR #4 | e46ec24dc662b1bc1588d5ec1c05d4f62739ac3c | 90 / 52 |

New branch `feat/editor-document-contracts-v0.5` starts exactly at that Phase 4
merge. One Phase 5 PR, one v0.5.0 checkpoint commit; final SHA/PR/CI evidence goes
in the external PR/handoff to avoid self-referencing the checkpoint commit.
No merge, tag, release or publication in this task.

Canonical primary owner: **Editor authored Document architecture**. Harness records
the decisions, not a new production owner. Render is inspected/compiled only.
Changed paths: this checkpoint, harness/CONTRACTS.md, harness/OWNERSHIP.md and
editor/AGENTS.md. Expected/actual public API delta **0**; no consumer edits.
No Engine/Render/Client/Server source, package, dependency, pin, lockfile or workflow
change. Exactly five projects, with existing dependency directions preserved.

Read root and relevant project AGENTS, architecture, Foundation, README, ownership,
contracts, workflow, verification, source/index/manifests and emitted declarations.
Harness route reported Editor as a hint; actual authored source ownership supports
that decision. CLI syntax was inspected before required gates below.

## Actual capabilities and source boundaries

Source and emitted root inventories are Editor **90/90**, Render **52/52**, with
matching name sets and no Document symbols. Both export maps expose only `.` built
ESM/declarations. Compiler inventory inspected all names; the existing
[Phase 4 inventory](spatial-contracts-v0.4.12.md#whole-pr-and-public-contract-audit)
records the 51 additive spatial symbols over the Phase 3 surface. This checkpoint
retains every baseline source/export/signature byte unchanged.

| Capability / current public consumer surface | Actual status and limit |
| --- | --- |
| Phase 1 host/preview APIs: create/openEditorPreviewHost, preview session adapters; Render session/lifecycle/frame APIs | IMPLEMENTED. Binding/frame/resource state belongs to Render and host orchestration, not authored Documents. No Document persistence consumer |
| Asset factories/catalog, references/diagnostics, relocateAssetSource/rebindAssetReference | IMPLEMENTED. Asset identity is exact projectId+assetId; optional sourceId is provenance, source locator/path is separate. Frozen metadata/catalog candidates are not disk transactions |
| readAssetDefinitionSnapshot(input: unknown): AssetDefinition | IMPLEMENTED. Complete schemaVersion 1 Asset snapshot only; structural unknown fields/versions reject, metadata extensions retained. Reuses canonical factory validation; no encoding, IO or migration |
| Scene identity/definition/object/membership factories and immutable add/remove/replace/reorder/placement APIs | IMPLEMENTED. Scene identity is projectId+sceneId; objectId is Scene-local. Optional Asset bindings, relationships, placement survive supported capture; factories capture known construction fields, not arbitrary saved documents |
| diagnoseSceneMembership, describeSceneObjectVisual / describeResolvedVisualAsset | IMPLEMENTED. Authored validation and metadata description, not file loading, saved state or Render instance allocation |
| CoordinateSpaceReference/Definition, SpatialPoint2D, OrthogonalGridDefinition and factories | IMPLEMENTED. Scoped projectId+coordinateSpaceId, explicit optional authored declarations; no persisted space registry or schema envelope |
| updateSceneObjectSpatialPlacement, describeSceneObjectSpatialPoint; alignment/grid/projection/viewport adapters | IMPLEMENTED. Editor validates/adapts content to canonical Render math; authored correlation stays caller-side, placement optional |
| Document identity/kind/envelope/schema, revision/dirty/session lifecycle | DOCUMENTED_ONLY here and earlier roadmap notes; runtime API UNAVAILABLE |
| Document Create/Open/Save/Load, codec, storage commit/acknowledgement, migration | UNAVAILABLE. No registry/adapter/serializer, save baseline or migration implementation found in Editor source/public exports |
| Existing manual examples | IMPLEMENTED illustrative entrypoints, not Document IO. Scene authoring explicitly reports NO_DOCUMENT_IO; browser demo's document.querySelector is DOM access, not an authored Document model |
| Runtime Engine config validator/schema | UNAVAILABLE at current Platform root (empty public surface; only named L1/L2 linkage imports). Future game-specific schema remains Engine-owned; Editor must not invent Skill/Monster/Item validation |
| L2 gameplay state archive | IMPLEMENTED externally: root exports GameplayStateRecord/Archive, validate/assemble/list/get and prepareGameplayStateRestore. Runtime gameplay state records are not Editor authored Documents; metadata restore preparation is not Editor Save/Load |

Relevant actual modules: editor/src/{asset-identity,asset-definition,asset-snapshot,
asset-catalog,scene-definition,scene-object-definition,scene-membership,
coordinate-space,orthogonal-grid,scene-spatial-placement,scene-spatial-point}.ts.
AssetDefinition has content schemaVersion 1; Scene and spatial records have no
document/content version envelope. Do not invent a version field for them here.
Asset metadata preserves supported portable extensions; Scene factories can omit
unknown fields, and spatial factories reject extra keys. Immutability therefore
does not imply unknown-field roundtrip safety or a storage format.

Actual graph remains Engine -> L1/L2; Render -> private Three backend;
Editor/Client -> Engine+Render; Server -> Engine. Client and Server do not import
Editor. No cross-project deep import, direct Editor Three import or reverse Render
dependency is needed. No external foundation API added/re-exported by this task.
Local tarball SHA-512 matches existing pins: Core 2.0.0 at
`04b7239f998c3c688a0dfa3202f11811a9acd775`, Gameplay 0.15.2 at
`acea332aa80f67552192a72b30f81c0bbbfc56bd`. No upstream edits or new pin audit.

## Ownership and proposed contract boundary

These decisions assign responsibilities, not concrete exported interfaces.

| Concern | Canonical owner / collaborator | Boundary |
| --- | --- | --- |
| Authored Document identity/kind/envelope, lifecycle and immutable candidates | Editor | Wrap existing payload owners; no second Scene/Asset/Spatial model |
| Current/saved revision, dirty and save acknowledgement correlation | Editor | Host commit evidence for exact captured content is required; no arbitrary dirty=false after IO dispatch |
| Codec and read/write compatibility orchestration | Editor | Pure representation conversion, independent of storage and UI; content validation delegated to its canonical owner |
| Asset/Scene/Spatial payload structure, IDs and validation | Existing Editor content APIs | Construction projection alone cannot authorize overwriting unknown saved data |
| Future game-specific config schema/semantic validation | Runtime Engine L3 | Editor wraps/configures only what an actual public Engine contract supports; missing capability stays unavailable |
| Storage reads/writes, location/access policy, external token and commit guarantees | Explicit host port, orchestrated by Editor | File/browser/remote guarantees differ; no selected backend, global transaction manager or atomicity promise |
| Migration decision and candidate orchestration | Editor; payload owner supplies content migration semantics | Explicit supported source/target, validation and approval before write; no destructive auto-upgrade |
| Workspace tabs/selection/zoom, two views | Editor workspace/host | Views refer to one document session; UI state is excluded from authored payload |
| Render sessions/resources/frames | Runtime Render | Receives approved presentation data; no dirty flag, document store, IO or authored migration |
| Gameplay archive/restore, game persistence | L2 as-is and game-specific Engine/Client/Server policies | Separate from authored Document envelope/codec; no Editor dependency imposed on Client/Server |

Conceptual envelope proposal: stable authored identity + explicit kind + document
schema discriminator + owner-validated portable payload. This is prose only, not
a JSON schema, field-name/signature commitment, payload union or storage layout.
Project scope, document-to-payload cardinality, kind dispatch and concrete supported
profiles must be justified at their own checkpoint with actual consumers.

| Distinct concept | Invariant / proposed interpretation |
| --- | --- |
| Document ID | Stable logical authored identity in explicitly chosen scope; not derived from path, Scene/Asset/Object ID or tab. Rename/move preserves identity unless an explicit copy/fork operation chooses otherwise |
| Document Kind | Explicit authored payload/profile discriminator, not filename extension, Render backend or guessed classification; unknown kind cannot gain write permission |
| Content ID | Existing payload-owner identity; one Scene may be wrapped without changing projectId/sceneId or its local objectIds |
| Storage Location | Host-owned address, optional for an unsaved document; not an identity, uniqueness proof, permission or implicit project-relative Asset locator |
| Document Schema Version | Envelope interpretation/compatibility domain; not the Asset record's schemaVersion |
| Content Schema Version | Payload owner's own version when present; do not manufacture one for current unversioned Scene/spatial records |
| Format Version | Selected codec/wire representation domain if needed; independent of document/content schema and npm package version (currently private 0.0.0) |
| Current Revision | Session-local identity for the exact edited candidate; no counter type, overflow, history/undo or global-clock policy locked here |
| Saved Revision | Exact current-session candidate known committed/loaded under a supported policy; absence of baseline is explicit, not fabricated revision zero |
| External Storage Revision | Opaque host token/ETag/precondition; neither editing revision nor schema version; absence cannot pretend optimistic concurrency protection |
| Session status / Tab ID | Ephemeral host lifecycle and views, separate from persisted authored identity; readonly, failed, pending and closed cannot be confused with saved |

### Safety and operation seams (not implemented)

1. Read storage bytes with explicit host context/token -> decode supported format ->
   check envelope and payload compatibility -> canonical owner validation -> present
   a candidate. Failed/unsupported reads must preserve current state and originals;
   successful decoding alone does not mean open/adopt/migrate/overwrite is safe.
2. Edit by adopting an explicit validated immutable candidate. Workspace and Render
   observations are excluded. Future Document operations wrap existing owner
   operations instead of recomputing Scene rules, projections or gameplay.
3. Capture exact revision and payload -> check write compatibility -> encode ->
   request host commit with explicit location/precondition -> validate correlated
   commit evidence -> acknowledge that captured revision. Encode is not Save;
   request completion without commit evidence cannot advance the saved baseline.
4. Save revision 2, then edit to 3, then acknowledge 2: current remains 3, saved may
   acknowledge only 2, document remains dirty. Stale/wrong-document/location/token
   or out-of-order acknowledgements must not roll back a newer baseline. Exact
   ordering/correlation and close/cancel semantics remain implementation decisions.
5. Unknown fields/kinds/future versions require an explicit preservation profile
   validated safe for write, or readonly/reject before write. Retain original input;
   never feed unknown data through a lossy factory then overwrite it as a success.
   Read compatibility, migration eligibility and write compatibility are separate.
6. Explicit migration produces a separately validated candidate; no automatic disk
   rewrite. Host atomic replace, durability, locking, conflict detection, cancellation
   and recovery guarantees must be stated from a real host, not inferred from a
   portable interface. No storage host is implemented or exercised in v0.5.0.

## Research: six lessons and limits

Primary sources read for principles; local implications below are design inferences,
not copied implementations or new runtime capabilities.

| Source / documented mechanism | Local lesson / deliberately not adopted |
| --- | --- |
| [VS Code Custom Editors](https://code.visualstudio.com/api/extension-guides/custom-editors): multiple editors can share one CustomDocument; save should not depend on a visible webview | Separate document/session from view state and UI-dependent serialization. Do not adopt VS Code's URI/file identity, webview/event API or undo stack |
| [Godot Resources](https://docs.godotengine.org/en/stable/tutorials/scripting/resources.html): data resources are distinct from node behavior and scene instantiation | Loading authored data need not allocate visual instances. No Godot Resource classes, loader cache, PackedScene or implicit sharing model |
| [Godot Saving games](https://docs.godotengine.org/en/stable/tutorials/io/saving_games.html): explicitly select persisted fields; JSON has restricted value types | Define portable supported payloads; decoding needs validation. Its gameplay save example is not an Editor Document schema or a durable-write guarantee |
| [Unity serialization rules](https://docs.unity3d.com/Manual/script-serialization-rules.html): serializable fields/types and inline/reference behavior are explicit | Choose representation and reference semantics deliberately; readonly/frozen JS snapshots alone are not codecs. No reflection attributes, Unity native references or engine object graph serializer |
| [Unreal versioning](https://dev.epicgames.com/documentation/en-us/unreal-engine/versioning-of-assets-and-packages-in-unreal-engine): separate version systems and object custom versions govern compatibility | Separate envelope/content/format from package versions; evaluate future compatibility before write. No GUID registry, FArchive, default-filling or silent dropping policy copied |
| JXQY pinned 6ff516bc1439e2b622a2e0ee4e1433cd98f8ec61: [ProjectDocumentRegistry.h](https://github.com/Upwinded/JXQY-all-in-one/blob/6ff516bc1439e2b622a2e0ee4e1433cd98f8ec61/jxqy-editor/core/ProjectDocumentRegistry.h), [.cpp](https://github.com/Upwinded/JXQY-all-in-one/blob/6ff516bc1439e2b622a2e0ee4e1433cd98f8ec61/jxqy-editor/core/ProjectDocumentRegistry.cpp), [DurableFileTransaction.h](https://github.com/Upwinded/JXQY-all-in-one/blob/6ff516bc1439e2b622a2e0ee4e1433cd98f8ec61/jxqy-editor/core/DurableFileTransaction.h), [.cpp](https://github.com/Upwinded/JXQY-all-in-one/blob/6ff516bc1439e2b622a2e0ee4e1433cd98f8ec61/jxqy-editor/core/DurableFileTransaction.cpp) | Registry path/type/dirty state is separate from prepared/checked writes, commit, recovery and cleanup warnings. Do not copy path-based identity, Windows case folding, Qt registry, journal/locks or infer those guarantees for every host. Source/header inspection only; no JXQY execution or full transaction audit |

## Future checkpoint allocation and acceptance evidence

Only v0.5.0 and the next v0.5.1 title are supplied in this task. The remaining
allocation below is a **proposed sequencing**, not fabricated accepted task specs;
future task files can refine it. No API names or signatures are reserved here.

| Version (proposed when not supplied) | Responsibility / owner | Required future evidence, not claimed now |
| --- | --- | --- |
| 0.5.0 DC01 | Editor architecture and source/boundary inventory | This docs-only checkpoint, actual exports and builds |
| 0.5.1 Document Identity & Schema Envelope | Editor portable identity/envelope | Separate Document/content/path/tab keys; supported envelope validation and root declaration consumer |
| 0.5.2 | Editor owner-dispatched payload profiles | Asset/Scene/Spatial validators reused; unsupported content cannot become writable; no placeholder L3 validator |
| 0.5.3 | Editor immutable document candidate operations | Supported fields/IDs retained, old snapshots untouched; no UI/runtime data leakage |
| 0.5.4 | Editor revision/dirty and saved baseline | Exact-revision tracking including unsaved and late acknowledgement cases |
| 0.5.5 | Editor lifecycle/adoption/close semantics | Failure/cancel/readonly/closed transitions without content loss; no GUI requirement |
| 0.5.6 | Editor pure codec boundary | Explicit supported representation, encode/decode with owner revalidation and unknown data policy; no IO PASS |
| 0.5.7 | Editor load/read compatibility | Unsupported/future input keeps originals/current session safe; no automatic migration |
| 0.5.8 | Explicit host storage boundary | Real host guarantees and preconditions; unavailable host reported, not a mock success |
| 0.5.9 | Editor save and commit acknowledgement | Real host before/after bytes where safe, revision/token and stale acknowledgement/conflict evidence |
| 0.5.10 | Editor migration orchestration + content owner | Explicit supported source/target candidate validation; no automatic destructive write |
| 0.5.11 | Editor content/host compatibility integration | Real accepted APIs composed; Editor-free Client/Server boundary preserved |
| 0.5.12 | Minimal manual Document scenario | Actual create/edit/encode/save/load evidence only for available real host, including failures/limits |
| 0.5.13 | Integration/closure audit | Exact checkpoint ledger, dependency/declaration audit, build and honest observed/unverified disposition |

These are future manual/build evidence obligations, not an automated test matrix.
Client game export belongs to Feature 19; no universal codec/storage/config registry
or dependency on Editor is imposed by this proposal. This task implements no .1–.13.

## Contract stress review and open decisions

| Scenario | Expected boundary (design only; not behavior verified) |
| --- | --- |
| Scene payload inside Document | Distinct Document key and Scene projectId/sceneId; member Object/Asset references unchanged |
| Game-specific skill config | Future public L3 validator is required; current missing contract stays unavailable |
| Text without coordinates | Document payload profile must permit text content without Scene/grid/viewport/graphics |
| 2D/2.5D or many Map visual objects | Existing authored IDs survive wrapping; no renderer allocation or duplicated map/spatial model |
| Two views, one document | Shared current content/revision, independent tab/selection/zoom; save can run without a view |
| Independent renderer, Client export, headless Server | Render receives presentation data; Client need not import Editor; Server never needs GPU to validate game state |
| Future fields/schema | Preserve under explicit writable profile or readonly/reject; no silent structural stripping |
| Late Save(2) ack after edit(3) | Remains dirty; old ack never claims revision 3 persisted |
| Host with/without atomic replace | Guarantees explicit per host; no SAFE_SAVE_PASS from interface compilation |

Open before implementation: Document identity scope/cardinality, concrete envelope
and supported kinds/payloads, codec representation, no-baseline and revision/undo
policy, concurrent/out-of-order commit correlation, actual host/token/recovery
guarantees, per-owner migration versions, readonly preservation and error shape.
No ownership conflict or baseline source mismatch blocks this architecture scope;
missing Document/L3/storage capabilities are explicit future work, not mocks.

## Build/static evidence and disposition

| Gate | Observed result |
| --- | --- |
| node harness/cli.mjs check | ARCH_CHECK_PASS, 59 JS/TS source files; static import constraints only |
| node harness/cli.mjs scope --projects editor --allow-infra | SCOPE_PASS, four declared Markdown paths before commit; committed scope inspected separately |
| node harness/cli.mjs verify --projects editor --with-consumers | BUILD_PASS Editor; no workspace project imports Editor yet |
| npm run build -- --force | BUILD_PASS all five projects including Render and headless Server |
| Source/emitted root inventory and package-root consumer | Editor90/90, Render52/52; strict NodeNext ES2022, types:[], no DOM, skipLibCheck:false; zero diagnostics |
| Baseline protected-path diff and git diff --check | No source/pins/dependencies/workflow delta; whitespace PASS |

Final-HEAD gates and exact push/PR CI are recorded in external PR/handoff; no tests,
new verification files, runners, coverage, browser/UI or exhaustive legacy suite.
Existing Windows Harness DEP0190 warning is nonblocking. Compile consumer runs
in memory through public roots, not cross-project source imports.

Manual Document behavior: **NOT_VERIFIED / UNAVAILABLE**. No actual document
Create/Open/Save/Load/migration API or storage host exists to execute. No storage
bytes were read/written as product proof; no SAFE_SAVE_PASS or MIGRATION_PASS.
Research/source inspection and builds do not verify persistence semantics.
**READY_FOR_DEVELOPER_REVIEW / API_DESIGN_ONLY / FEATURE_NOT_VERIFIED**.
No further version is implemented and no phase acceptance is asserted.
