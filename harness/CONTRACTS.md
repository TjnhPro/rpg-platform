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

## Unresolved until demonstrated

- Scene identity/coordinates and whether text-only content needs a visual scene.
- Persisted asset identity/reference semantics belong to Editor (v0.2.0); record serialization/export format and other content schema/serializer ownership remain unresolved. **Assign one canonical owner when used**.
- Rule/config discovery shape (descriptors, type contracts, explicit editors, mixed approaches).
- State/event update model, client/server data projections, authority/verifier, persistence.
- Physical L3/L4 split and package/repository boundaries after working games.

## Three data classes that must not be conflated

Authored content/config != Editor local workspace state != Runtime mutable instance state. If an interface crosses two, specify which it carries and why.
