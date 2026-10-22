# Foundation contract boundaries — deliberately minimal

This describes the *interactions to audit*, not finalized types or APIs. Do not create interfaces just to satisfy this document before a real MVP needs them.

Phase 1 v0.1.0: [Editor–Render ER01/ER02/ER04 checkpoint](checkpoints/editor-render-v0.1.0.md)
records the source audit, ownership and documented public boundary as API_DESIGN_ONLY.
It introduces no runtime API symbols; future scene/preview interactions below remain unimplemented.

Phase 1 v0.1.1: [ER03/ER06 host/session checkpoint](checkpoints/editor-render-v0.1.1.md)
adds immutable session descriptors and borrowed host bindings through the Render root.
This metadata operation does not initialize a renderer or validate a graphics target.

Phase 1 v0.1.2: [ER07 initialization/lifecycle checkpoint](checkpoints/editor-render-v0.1.2.md)
adds an explicit created-to-bound session transition with immutable observations.
Binding accepts an opaque reference only; it does not acquire a graphics backend.

Phase 1 v0.1.3: [ER05/ER08 state ownership/disposal](checkpoints/editor-render-v0.1.3.md)
adds terminal disposal and releases the lifecycle's internal binding reference.
It never destroys the borrowed target or revokes caller-retained observations.

Phase 1 v0.1.4: [ER09 errors/failure handling](checkpoints/editor-render-v0.1.4.md)
adds safe code/stage classification for existing Render-authored exceptions while
preserving the throwing channel. Unrecognized host errors are never success.

Phase 1 v0.1.5: [ER04/ER10 Editor host integration](checkpoints/editor-render-v0.1.5.md)
adds Editor-owned mount/unmount/replace/close orchestration through existing Render
root APIs. A null target represents unavailable preview, without creating a session.

Phase 1 v0.1.6: [ER11–ER13 extension and compatibility](checkpoints/editor-render-v0.1.6.md)
inventories the current public surface, distinguishes existing binding operations
from deferred visual subsystems, and records host portability, compatibility rules
and Developer decision gates before GPU acquisition. No runtime API is added or changed.

Phase 1 v0.1.7: [ER14 minimal real renderer](checkpoints/editor-render-v0.1.7.md)
adds explicit async graphics acquisition and a submitted-frame receipt through the
Render root, plus an Editor manual demo. Existing binding-only APIs remain unchanged;
build evidence and visual evidence are separate.

Phase 1 v0.1.8: [ER15 integration and closure review](checkpoints/editor-render-v0.1.8.md)
audits all nine checkpoints, current public symbols, ownership, dependency pins and
consumer builds. No API delta; READY_FOR_DEVELOPER_REVIEW does not mean phase
acceptance. Manual graphics/visual evidence remains unavailable.

Phase 2 v0.2.0: [AR01/AR02 asset architecture and identity](checkpoints/asset-contracts-v0.2.0.md)
assigns authored asset records/references to Editor and future presentation resource
descriptors to Render. Asset IDs are caller-provided stable logical identities
within a project, separate from source IDs, filenames and locators. Resolution
uses explicit metadata inputs, with no IO/loading. This checkpoint is API_DESIGN_ONLY;
no asset public type, factory, catalog, resolver or renderer API is implemented.

Phase 2 v0.2.1: [Stable Asset Identity](checkpoints/asset-contracts-v0.2.1.md)
adds Editor-owned `createAssetIdentity`, `AssetIdentityInput` and `AssetIdentity`.
The factory validates explicit project-local IDs and preserves optional source text
in a frozen detached value; label/path are not identity inputs. No registry,
metadata descriptor, uniqueness check, IO or Render contract change is introduced.

Phase 2 v0.2.2: [Asset Classification & Metadata](checkpoints/asset-contracts-v0.2.2.md)
adds Editor-owned immutable authored definitions through `createAssetDefinition`
and four readonly types. Open kind strings describe resources/data; metadata is
deeply detached/frozen portable JSON data with unknown extension keys retained.
Record schemaVersion is 1; identity semantics are unchanged. No Render descriptor,
loaded resource, catalog, serializer or migration is introduced.

Phase 2 v0.2.3: [Resource Locator & Composite Sources](checkpoints/asset-contracts-v0.2.3.md)
adds Editor-owned `ResourceLocator`, `AssetSourceReference`, `createResourceLocator`
and optional `AssetDefinitionInput.sources` (frozen output list, empty by default).
Only literal project-relative paths are implemented. Ordered role/locator pairs
describe multiple sources under one identity without reads, parsing or loading.
Repeated roles are permitted; exact duplicate pairs are rejected. Identity and
metadata rules are unchanged; remote/archive location types remain deferred.

Phase 2 v0.2.4: [Asset Reference & Dependency Contracts](checkpoints/asset-contracts-v0.2.4.md)
adds Editor-owned `AssetReferenceInput`, `AssetReference`, `createAssetReference`
and optional definition dependencies (frozen output list, empty by default).
References contain project-local target keys, optional kind expectation and opaque
subresource text, never an in-memory target. Direct dependencies preserve order
and reject repeated target assets or cross-project edges; target existence is
not checked. No catalog, resolver, Scene implementation or graph engine is added.

Phase 2 v0.2.5: [Asset Catalog & Reference Resolution](checkpoints/asset-contracts-v0.2.5.md)
adds the Editor-owned project-local catalog and minimal pure resolver. Factory
validates/detaches definitions, rejects duplicate IDs and preserves declaration
order; register/update/remove return new candidates. definitions is the public
list, get uses exact local keys. Resolver returns the exact frozen target record
or explicit unresolved status, never a loaded resource. Opaque subresources remain
unsupported; full diagnostics stay deferred. No persistence, scanner or shared cache.

Phase 2 v0.2.6: [Missing Reference & Validation Diagnostics](checkpoints/asset-contracts-v0.2.6.md)
adds Editor-owned reference/definition diagnostic APIs over the existing resolver
and validators. Frozen portable results distinguish invalid authored structure,
unresolved targets and successful authored validation. Stable code, target hints,
path and primitive details accompany the deterministic first failure. File existence
is always NOT_CHECKED. Unknown host exceptions propagate; no raw Error/DOM payload,
placeholder repair, graph traversal or Render resource failure handling is introduced.

Phase 2 v0.2.7: [Asset Relocation, Rebinding & Compatibility](checkpoints/asset-contracts-v0.2.7.md)
adds Editor-owned single-locator catalog candidates, explicit single-reference
rebinding and a strict complete schemaVersion 1 snapshot reader. Existing identity,
source roles/order and unknown metadata extensions are preserved. Unknown structural
fields/versions reject without modifying the source; no silent downgrade/drop.
Construction inputs remain distinct from portable snapshot reading. No IO, file
replacement detection, permanent project file format, migration or save manager.

1. **Workspace/project discovery**: five identifiable projects, build entrypoint, explicit dependency direction and public import surfaces. Keep package naming editable until real manifests exist.
2. **Editor ↔ Render**: an authoring host can create/select/inspect/move a presentation object and save/reload scene/content without a duplicate renderer. The specific scene format/coordinate system belongs to the relevant MVP.
3. **Editor ↔ Runtime**: Editor can discover or be supplied the active game's supported content/config contract and run its validation/preview through public Runtime APIs. No universal Skill/Player/Monster contract is imposed.
4. **Runtime ↔ Render**: shared output is presentation-oriented state/events/adapters; rendering must not own gameplay decisions. Exact event naming, topology and update rate remain game-driven.
5. **Content consumption**: Editor-authored content has an identity/reference/version/validation story sufficient for the selected game, and can be consumed without the Editor being installed. Do not prescribe JSON/INI/database or client/server partition prematurely.
6. **Client/Server**: each can consume applicable Runtime/config data according to the chosen game model. Do not enforce a realtime protocol, persistent monster simulation, identical active state or authoritative rendering.
7. **External foundation usage**: `@rpg/core/kernel` and `@rpg/gameplay` are consumed only through approved public APIs; missing capabilities cause a recorded blocker.

Phase 2 v0.2.8: [Editor–Render Asset Consumption](checkpoints/asset-contracts-v0.2.8.md)
adds an Editor-owned resolved-image projection and Render-owned neutral descriptor/
preparation API, exercised by a public-root manual consumer. Render validates and
detaches portable metadata, reporting metadata-prepared and NOT_PERFORMED loading.
Only image kind with image source maps today; unresolved/nonvisual targets are
explicitly unsupported. No Editor types in Render, catalog duplication, decoder,
IO, texture or Phase 1 session changes.

Phase 2 v0.2.9: [Minimal Working Asset Reference MVP](checkpoints/asset-contracts-v0.2.9.md)
joins existing public APIs in a single optional manual data-flow consumer. Two
independent holders resolve one composite-source definition, survive PNG relocation,
support explicit selected rebinding, retain erroneous references with typed
diagnostics, and pass relocated metadata to Render. No API/schema delta; asset
contents are not loaded and visual correctness is not verified.

Phase 2 v0.2.10: [Asset Foundation Integration & MVP Closure review](checkpoints/asset-contracts-v0.2.10.md)
audits the complete commit chain, AR01–AR16, per-symbol ownership, current source/
declaration exports, consumers and finite public-root manual proof. No API or
production delta. READY_FOR_DEVELOPER_REVIEW is not Developer phase acceptance;
loading, visual correctness and future feature contracts remain open.

Phase 3 v0.3.0: [Scene Architecture & Contract Foundation](checkpoints/scene-contracts-v0.3.0.md)
assigns authored Scene Definition/Object identity, membership, relationships and
placement records to Editor. Render owns presentation runtime instances, never an
authored Scene catalog. Scene Definition != Render Scene Instance != Gameplay World;
Scene Object ID != Asset ID != Gameplay Entity ID != Render Session/Instance ID.
This is DESIGN_ONLY: no Scene public API, schema or runtime instance operation.
Asset references/resolution reuse Phase 2; existing Render metadata preparation
and frame submission do not provide a Scene consumer. Import graph is unchanged.
Text-only scenes need no map, coordinates, root node, texture or graphics session.

Phase 3 v0.3.1: [Scene Identity & Definition](checkpoints/scene-contracts-v0.3.1.md)
adds Editor-owned createSceneIdentity/createSceneDefinition and four readonly
input/result types. Exact projectId + sceneId identifies an authored Scene; caller
supplies both. Identity-only definitions support empty text scenes with no Asset
catalog, browser or graphics acquisition. Frozen detached results are directly
inspectable; no Scene Object, registry, persistence envelope or Render API is added.
Construction projects known fields, not a versioned reader of arbitrary saved data.

Phase 3 v0.3.2: [Visual Object Identity & Definition](checkpoints/scene-contracts-v0.3.2.md)
adds Editor-owned createSceneObjectDefinition and two readonly input/result types.
Explicit objectId is exact, case-sensitive and scene-local; standalone definitions
do not carry Scene/Asset/entity/Render identity or membership. Display/classification
labels are optional strings, captured verbatim or null. Frozen detached scalar data
contains no placement, backend, gameplay fields or arbitrary extension state. Scene
insertion and local uniqueness await v0.3.3. Existing contracts/graph are unchanged.

Phase 3 v0.3.3: [Scene Membership & Asset Binding](checkpoints/scene-contracts-v0.3.3.md)
adds Editor-owned SceneMembershipInput/SceneMembership,
SceneObjectMembershipInput/SceneObjectMembership and createSceneMembership,
addSceneObject, listSceneObjects, getSceneObject. Membership owns object definitions
inline, not through an unimplemented object registry. It captures an existing Scene
definition without changing that contract. Entries hold optional Phase 2 references
only, never Asset definitions; repeated Asset targets are allowed. Local duplicate
object IDs and foreign-project bindings reject. Missing targets remain authored
intent; Phase 2 resolver/diagnostics are the only target/kind authority. Lists preserve
declaration/append order, with no render-order or relationship semantics. No graph change.

Phase 3 v0.3.4: [Object Ordering & Relationship Contracts](checkpoints/scene-contracts-v0.3.4.md)
adds reorderSceneObjects, SceneObjectReference, SceneObjectAttachment and optional
membership layerKey/attachment fields. Reorder requires a full permutation of local
IDs; it preserves definitions, Asset reference values and authored metadata in a
new frozen candidate. Layers are opaque exact keys, not z sorting. An attachment
records one local Scene/object target, independently of lookup; missing targets are
retained, self/cross-Scene targets rejected. It is nonhierarchical authored intent:
no runtime following, parent/transform propagation, graph traversal or cycle policy.
Omitted fields remain absent; old entry shape and all prior signatures remain valid.

Phase 3 v0.3.5: [Placement Data Foundation](checkpoints/scene-contracts-v0.3.5.md)
adds Editor-owned SceneObjectPlacement and optional membership placement. Records
capture an exact caller coordinateSpaceId plus finite numeric point x/y, detached
and frozen. Omission stays absent; explicit null stays null. Existing create/add/
reorder capture/preserve placement without identity, Asset or order changes.
Space lookup, units, axes, origin, projection and any conversion belong to Feature
04, with camera behavior in 09; Phase 1 Render hosts provide no coordinate authority.
No default placement, screen/GPU types, transforms, snapping or mutation API added.

Phase 3 v0.3.6: [Immutable Scene State Operations](checkpoints/scene-contracts-v0.3.6.md)
adds Editor-owned removeSceneObject, replaceSceneObject and updateSceneObjectPlacement.
Factory snapshots produce fresh, validated, detached/frozen candidates; missing
operation targets reject with TypeError rather than upsert/no-op. Full replacement
retains exact object identity and list position; omitted optional fields clear their
old values. Focused placement update preserves all unrelated fields, null clears
placement. Removal retains other objects and authored references, without cascade,
relationship repair or diagnostics. Existing add/reorder and canonical factories
remain unchanged. No history/store, graph change, runtime state or new Render API.

Phase 3 v0.3.7: [Scene Validation & Relationship Diagnostics](checkpoints/scene-contracts-v0.3.7.md)
adds Editor-owned diagnoseSceneMembership and four readonly diagnostic types.
Canonical factories still reject with TypeError under unchanged structural rules;
their internal structured errors supply precise code/path without duplicated
validation or message parsing. Invalid input returns null membership and the first
structural diagnostic. Structurally valid input is captured and assessed for local
attachment targets and, with a supplied catalog, Phase 2 Asset reference diagnostics.
Unresolved records retain authored intent; no repair, deletion or remapping. Output
is frozen/detached; unknown host errors propagate. Asset checks without a catalog
and all physical file existence are NOT_CHECKED. Attachment is not hierarchy:
reciprocal links remain valid, with hierarchy cycle policy deferred. Graph unchanged.

Phase 3 v0.3.8: [Scene-to-Render Presentation Contracts](checkpoints/scene-contracts-v0.3.8.md)
adds Editor-owned describeSceneObjectVisual and SceneObjectVisualDescription.
Canonical local lookup/capture and Phase 2 Asset resolution/projection produce a
detached frozen result: external project/scene/object correlation, nullable opaque
authored placement and a described resource or explicit unsupported reason. Only
the existing resource descriptor crosses unchanged Render prepareVisualResource;
correlation/placement remains with caller. No authored Scene store, instance/handle,
layer/attachment interpretation, GPU allocation or resource loading is introduced.
Render public surface remains independent of Editor; dependency graph unchanged.

Phase 3 v0.3.9: [Scene Authoring & Compatibility Integration](checkpoints/scene-contracts-v0.3.9.md)
inventories the 31 Scene exports and joins existing create/inspect/add/remove/
replace/order/placement/relation operations in a finite root-only consumer. No
production API, dependency or owner changes. Scene factories capture known fields
only, unlike Phase 2 portable Asset metadata extensions. Unknown host fields remain
with the caller and are absent from output; spreading a captured record preserves
known fields only. This is not a document reader or preservation/save contract.
Feature 05/19 must explicitly preserve or reject unknown document data before any
future save; do not overwrite it with a construction projection. Current Scene
records contain scalar/array/record data, independent of DOM, GPU, UI and gameplay
instances. Future Map/visual metadata/clip/nesting shapes remain DESIGN_ONLY and
DEFERRED; existing scoped identities need no demonstrated change for those cases.

Phase 3 v0.3.10: [Minimal Working Scene MVP](checkpoints/scene-contracts-v0.3.10.md)
records a finite root-only manual authored-data/reference/projection flow. Existing
Scene operations and Phase 2 catalog/diagnostics feed Render's unchanged resource
metadata API. Five visual placeholders include three Monster references to one
Asset; candidate placement and missing-target edits retain original/independent
snapshots. Missing Asset and Object targets remain distinct authored diagnostics,
never physical-file or gameplay claims. No production API, script/test file, Scene
subsystem, Render instance, viewport or dependency change; frames remain deferred.

## Unresolved until demonstrated

- Scene identity is Editor-owned (v0.3.0 design decision); exact Scene schema/operations await scoped consumers. Coordinates/projection belong to Features 04/09; visual instance allocation/rendering to Feature 08. Text-only content does not require a visual scene.
- Authored Asset and Scene identity/reference semantics belong to Editor. Document lifecycle/envelopes (Feature 05), serialization/export (Feature 19) and other game content formats remain separate decisions. Ownership of authored data does not select a storage format or Client dependency on Editor.
- Rule/config discovery shape (descriptors, type contracts, explicit editors, mixed approaches).
- State/event update model, client/server data projections, authority/verifier, persistence.
- Physical L3/L4 split and package/repository boundaries after working games.

## Three data classes that must not be conflated

Authored content/config != Editor local workspace state != Runtime mutable instance state. If an interface crosses two, specify which it carries and why.
