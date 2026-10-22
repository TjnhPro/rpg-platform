# v0.3.0 — Scene Architecture & Contract Foundation

**READY_FOR_DEVELOPER_REVIEW.** Architecture only; Scene contracts below are
DESIGN_ONLY, not implemented APIs. Stop before v0.3.1; no merge/tag/release/publish.

## Baseline, owner and scope

Starting local HEAD was Phase 2 checkpoint `2c6158cf75c79732b9268e54c7920a62207bc10b`;
worktree was clean. Live GitHub evidence confirms Developer `TjnhPro` merged
[PR #1](https://github.com/TjnhPro/rpg-platform/pull/1) at
`4cec85b5a00e2477f00eee29e2da6025a532e973` and
[PR #2](https://github.com/TjnhPro/rpg-platform/pull/2) at
`fea9b734b849fa1c6bc953530e1fa425d43cfca8` (2026-10-22 08:14:34 UTC).
The latter accepted integration baseline is the exact branch point for
`feat/editor-render-scene-contracts-v0.3`, fetched from origin/main. Historical
checkpoint reports correctly describe acceptance as pending at their own revision;
the later Developer merge supplies the prerequisite evidence for this task.

Primary owner: **Editor**, authored Scene. Render collaborates on presentation
boundary analysis; Harness records it. Read root/project AGENTS, ARCHITECTURE,
FOUNDATION, OWNERSHIP, CONTRACTS, VERIFICATION, WORKFLOW, current manifests, public
roots and relevant Phase 1/2 modules. No L1/L2 API is needed. Their pins remain Core
2.0.0 `04b7239f998c3c688a0dfa3202f11811a9acd775` and Gameplay 0.15.2
`acea332aa80f67552192a72b30f81c0bbbfc56bd`; neither foundation is modified.

Three documentation paths only: this checkpoint, OWNERSHIP, CONTRACTS. Concrete
ambiguities: the saved-content row still left Scene identity unassigned, and visual
object identity named two owners. The supplied task assigns authored Scene to
Editor and runtime presentation to Render; these rows now distinguish them.
No production/type/schema/package/dependency delta or consumer source adjustment.
Exactly five projects; no shared package. A single new Draft Phase 3 PR records
this commit and exact-head CI evidence; its URL/SHA are provided in the final report.

## Current public symbol / owner matrix — source is authoritative

The following existing package-root symbols remain unchanged. Types count as
symbols even when absent from runtime JS. No Scene factory, definition, object,
catalog, projection or visual-instance API exists at this checkpoint.

| Owner / source module | Existing root exports |
| --- | --- |
| Editor / index, preview-host | createEditorPreviewSession, initializeEditorPreviewSession, disposeEditorPreviewSession, getEditorPreviewFailure, createEditorPreviewHost, openEditorPreviewHost, EditorPreviewHost, EditorPreviewHostSnapshot |
| Editor / asset-identity | AssetIdentityInput, AssetIdentity, createAssetIdentity |
| Editor / asset-definition | AssetMetadataValue, AssetMetadata, AssetDefinitionInput, AssetDefinition, createAssetDefinition |
| Editor / asset-sources | ResourceLocator, AssetSourceReference, createResourceLocator |
| Editor / asset-reference | AssetReferenceInput, AssetReference, createAssetReference |
| Editor / asset-catalog | AssetCatalogInput, AssetCatalog, createAssetCatalog, getAssetDefinition, registerAssetDefinition, updateAssetDefinition, removeAssetDefinition, AssetReferenceResolution, resolveAssetReference |
| Editor / asset-diagnostics | AssetDiagnosticCode, AssetDiagnosticTarget, AssetDiagnostic, AssetReferenceDiagnosticResult, AssetDefinitionDiagnosticResult, diagnoseAssetReference, diagnoseAssetDefinition |
| Editor / asset-transitions, asset-snapshot | relocateAssetSource, rebindAssetReference, readAssetDefinitionSnapshot |
| Editor / asset-visual | AssetVisualDescription, describeResolvedVisualAsset |
| Render / index | RenderHostBinding, RenderSessionDescriptor, createRenderSession, RenderSessionSnapshot, RenderSessionDisposal, RenderSessionLifecycle, createRenderSessionLifecycle, RenderFailure, getRenderFailure |
| Render / frame-session, frame-failure | RenderFrameSession, RenderFrameReceipt, RenderFrameFailure, createRenderFrameSession, getRenderFrameFailure |
| Render / visual-resource | VisualResourceDescriptor, VisualResourcePreparation, prepareVisualResource |

Editor totals 43, Render 17. Phase 1 binding accepts borrowed host references;
bound does not mean graphics-ready. Its separate async frame path submits the
private backend's frame, with terminal disposal, not authored Scene input. Phase 2
offers project-local immutable catalog candidates and pure resolution. A nonnull
subresource remains unsupported. describeResolvedVisualAsset maps only a resolved
image with an image source; prepareVisualResource reports metadata-prepared /
NOT_PERFORMED, never loaded. Snapshot reading requires the complete current Asset
schemaVersion 1; it is not a Scene serializer. Future work must consume these real
contracts instead of importing internal validators or creating a second resolver.

## Boundary decision record — SC01–SC05 architecture scope

The task supplies SC01–SC05 as a group, without individual ID definitions. The
following covers that group; it does not invent per-ID acceptance assignments.

| Concept / canonical owner | Uniqueness and lifetime decision | Expected consumers / origin of truth |
| --- | --- | --- |
| Authored Scene ID / Editor | Caller-selected, project-local; logical project + scene key, independent of file path or display name. No format/generator selected | Editor authoring, future document/export adapter; validated authored definition is truth, not active viewport |
| Scene Object ID / Editor | Caller-selected, unique within one Scene; external address needs project + scene + object context. Membership validation belongs to Scene owner; no global registry | Authoring operations/relationships and future projection correlation; stable across edits, not regenerated by preview recreation |
| Asset ID / Editor Asset Foundation | Existing exact case-sensitive projectId + assetId; sourceId/path never equality. Reused across scenes | Scene reference holders use existing AssetReference and caller-supplied catalog/resolver; no embedded live target |
| Render session ID / Render | Existing fresh JS symbol per session; ephemeral, nonserializable | Host lifecycle only, never authored identity |
| Future Render visual instance ID / Render | Ephemeral within owning runtime session; allocation/handle shape DEFERRED to Feature 08, not a new API now | Presentation operations; future adapter explicitly correlates object keys and handles, never writes handles into definitions |
| Future Gameplay Entity ID / Runtime Engine | Game-selected lifetime/uniqueness, DEFERRED to actual game contract | Engine gameplay authority; any association with authored object is explicit game-owned data, never inferred from equal strings |

Scene Definition != Render Scene Instance != Gameplay World. Scene Object ID !=
Asset ID != Gameplay Entity ID != Render Session/Instance ID. Equal text in two
identity domains implies no equivalence. Reusing an object-local key in another
Scene does not address the first Scene. Cross-scene transfer/remap policy awaits
a real operation; no implicit global uniqueness or automatic clone-ID generation.

| Data / operation | Owner and invariant | Status / boundary |
| --- | --- | --- |
| Authored Scene, objects, membership, relationships, optional placement | Editor validates structure and returns detached immutable captures/candidates; caller explicitly adopts transitions | DESIGN_ONLY; no required map, root node, texture, transform, coordinates or THREE.Scene |
| Asset lookup and missing diagnostics | Existing Editor Asset Foundation | IMPLEMENTED for Assets, Scene consumer DESIGN_ONLY; retain unresolved reference and NOT_CHECKED file status |
| Projection into presentation descriptions | Editor adapter uses only Render root contracts; no arbitrary authored/UI/gameplay payload passed through | Asset metadata handoff IMPLEMENTED; Scene handoff DESIGN_ONLY; current closed descriptor cannot accept speculative Scene fields |
| Presentation runtime/resources | Render, no Editor imports or authored Scene catalog | Current session/frame APIs IMPLEMENTED; Scene allocation Feature 08 and loading Feature 07 DEFERRED |
| Selection/dirty/tabs/undo adoption | Editor local workspace state, separate from authored snapshot | Document lifecycle Feature 05, tools Features 14/15 DEFERRED; no implicit save or IO |
| Coordinates / camera | Spatial Feature 04 / Camera Feature 09; Editor may later capture minimal explicit placement reference | Units, axes, dimensions, parenting transforms, world-to-screen and sorting semantics DEFERRED |
| Gameplay state/rules | Runtime Engine and existing read-only L1/L2 capabilities where applicable | Out of scope; visual labels Player/Monster confer no HP/AI/drop/collision/spawn behavior |
| Persistent envelope / export | Features 05/19 must choose concrete contract before implementation | DEFERRED; authored ownership does not select format, storage framework or Client import of Editor |

Current dependency graph stays Editor -> Engine + Render; Client -> Engine +
Render; Server -> Engine; Engine -> approved L1/L2 public entries; Render -> private
Three.js backend only. Scene work adds no edge. Exported content must eventually be
consumable without the Editor runtime package; designing that adapter is future work.

## External research — applied inference, no copied framework

Sources inspected 2026-10-22. The decisions in the last two columns are project
inferences from these sources, not claims of compatible engine implementations.

| Primary evidence | Apply to this boundary | Do not copy |
| --- | --- | --- |
| Unreal [Levels](https://dev.epicgames.com/documentation/en-us/unreal-engine/levels-in-unreal-engine) and [Actors](https://dev.epicgames.com/documentation/en-us/unreal-engine/actors-in-unreal-engine): level container and placeable actors, including gameplay objects | Distinguish authored containment/placement from this platform's runtime responsibilities | Actor/Component hierarchy, compulsory map/world, spawn/replication or gameplay entity semantics |
| Unity [Scenes](https://docs.unity3d.com/6000.0/Documentation/Manual/CreatingScenes.html) and [Prefabs](https://docs.unity3d.com/6000.0/Documentation/Manual/Prefabs.html): authored scene content and reusable asset templates with scene instances | One reusable asset may support multiple separately identified authored occurrences | Prefab override/inheritance system, GameObject/Component model or mandatory transform schema |
| Godot [PackedScene](https://docs.godotengine.org/en/stable/classes/class_packedscene.html) and [Node ownership](https://docs.godotengine.org/en/stable/classes/class_node.html#class-node-property-owner): serialized resource can instantiate nodes; packing follows owned nodes | Authored definition and live instance are distinct; explicit membership matters when exporting | SceneTree/root-node requirement, ResourceLoader/cache or treating authored definitions as mutable live nodes |
| JXQY pinned at 6ff516bc1439e2b622a2e0ee4e1433cd98f8ec61: [ProjectDocumentRegistry.h](https://github.com/Upwinded/JXQY-all-in-one/blob/6ff516bc1439e2b622a2e0ee4e1433cd98f8ec61/jxqy-editor/core/ProjectDocumentRegistry.h), [ProjectManager.h](https://github.com/Upwinded/JXQY-all-in-one/blob/6ff516bc1439e2b622a2e0ee4e1433cd98f8ec61/jxqy-editor/core/ProjectManager.h), [MapRenderCanvas.h](https://github.com/Upwinded/JXQY-all-in-one/blob/6ff516bc1439e2b622a2e0ee4e1433cd98f8ec61/jxqy-editor/ui/MapRenderCanvas.h): document dirty/path state, separate map zoom/scroll session state, map entity/tool structures | Keep document/workspace view state distinct from authored Scene; use explicit authoring operations | Path-derived Scene IDs, Qt Editor renderer, map projection or fixed NPC life/AI/drop fields. Save/failure implementation not audited here; lifecycle details remain Feature 05 decisions |

## Proposed delta roadmap — not authorization or placeholder APIs

Only v0.3.1's title is supplied by this task. Remaining allocations are proposals
for Developer's future tasks; exact symbol names/shapes require their real consumers
and preflight. Every row preserves the accepted Asset/session APIs. No later row
is implemented now; no automatic progression or permanent schema promise.

| Version | Proposed minimum contract/consumer delta | Gate / excluded work |
| --- | --- | --- |
| v0.3.1 Scene Identity & Definition | Editor explicit Scene identity and minimal immutable definition; a real root consumer | No mandatory visual/map/coordinate fields |
| v0.3.2 Object identity/definition | Editor object-local identity and detached authored record; definition consumer | No gameplay entity, renderer handle or generated ID |
| v0.3.3 Membership | Editor explicit ordered Scene membership with duplicate/project checks | No global Scene catalog, SceneTree or mandatory root |
| v0.3.4 Asset association | Object holder composes existing AssetReference; caller-provided catalog resolves it | No new registry/resolver or asset schema drift |
| v0.3.5 Placement boundary | Minimal optional authored placement/coordinate-space reference if a concrete consumer requires it | Feature 04 owns semantics; defer unsupported conversion rather than invent units/axes |
| v0.3.6 Relationships | Only actual authored object references required by consumer, with same-Scene target policy | No inherited transforms, gameplay behavior or general graph framework |
| v0.3.7 Authoring transitions | Minimal add/update/remove candidate operations; explicit identity/referential integrity policy | Define dangling-reference handling before removal; no undo/store framework |
| v0.3.8 Diagnostics | Scene-owned structural/relationship diagnostics, compose existing Asset diagnostics | No IO existence claim, auto-repair or duplicate Asset validation |
| v0.3.9 Presentation handoff | Editor projection and only necessary Render neutral description, if working metadata consumer justifies API | Public-root consumer build; no instance allocation, loader, backend scene graph or GPU proof (Feature 08) |
| v0.3.10 Minimal working flow | Optional manual public-root metadata consumer: Scene/object identity, shared asset, edit, diagnostics, projection | Finite observations, no test suite or claimed rendering |
| v0.3.11 Integration/closure review | Inventory deltas, compatibility, boundary/build evidence and unresolved decisions | Developer acceptance only; no next phase |

## Future stress review — design only

| Case | Expected boundary behavior / outstanding decision |
| --- | --- |
| Text content without coordinates | Empty/nonvisual Scene can be authored with no viewport/session; no default map/position injected. Future definition consumer proves this; NOT_VERIFIED now |
| Two scenes use one asset | Separate Scene/object keys hold the same AssetReference; one supplied catalog resolves both. Scene edit does not clone or mutate asset definition; Scene consumer not implemented |
| Preview destroyed/reopened | Render handles disappear; authored keys/references remain. Future Feature 08 adapter rebuilds correlations explicitly; no saved symbols/GPU objects |
| 2.5D placement | Retain optional explicit coordinate-space reference when specified; Feature 04/09 decides projection/axes. No invented transform math or silent 2D conversion |
| Asset moved/missing/subresource selected | Reuse relocation/resolver/diagnostics; path move does not change object or Asset IDs. Missing stays explicit; nonnull subresources remain unsupported |
| Object named Monster / Player | Display label only; Engine game contract must separately define entity association/rules |

## Verification evidence and limits

Required gates: `node harness/cli.mjs check`;
`node harness/cli.mjs scope --projects editor,runtime-render --allow-infra`;
`node harness/cli.mjs verify --projects editor,runtime-render --with-consumers`;
`npm run build -- --force`. Infra allowance is for these three Harness docs only.
Final results and exact commit/PR workflow links are recorded in the Phase 3 PR
and final report after running these gates; no old CI revision substitutes for HEAD.

| Local gate | Observed result |
| --- | --- |
| Harness check | ARCH_CHECK_PASS; 30 JS/TS files, static scan only |
| Harness scope | SCOPE_PASS; three documentation paths, Editor/Render + infra |
| Independent builds with consumers | BUILD_PASS: runtime-render, editor, game-client |
| Forced whole-workspace build | Exit 0; actual TypeScript project-reference build |
| Real emitted declarations / source root inventory | Matching names: Editor 43, Render 17; package roots resolve their dist/index.js |
| Installed foundation versions | Core 2.0.0 deduplicated, Gameplay 0.15.2; pins unchanged |
| Git whitespace / scope audit | diff --check passed; only these three docs differ from accepted base |

No failed/unconfigured build remains. Existing Windows Harness DEP0190 shell warning
is unchanged. Builds establish compilation, not Scene behavior. No manual API flow
was run for this architecture-only checkpoint; no production consumer was changed.

No Scene behavior or manual visual proof is claimed. Scene semantics, rendering,
animation, IO and visual correctness are NOT_VERIFIED. No test files, runners,
helpers or coverage introduced. No production API was needed for an architecture
checkpoint. Developer review is required before v0.3.1; future task specifics may
refine the proposed roadmap without retroactively claiming implemented capability.
