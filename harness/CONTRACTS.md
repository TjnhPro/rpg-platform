# Foundation contract boundaries — deliberately minimal

This describes the *interactions to audit*, not finalized types or APIs. Do not create interfaces just to satisfy this document before a real MVP needs them.

Phase 6 v0.6.3 RV05: [Context loss policy](checkpoints/render-viewport-v0.6.3.md)
adds CONTEXT_LOST to RenderFrameFailure.code (57 root symbols unchanged). Native
loss events and pre/post-frame checks terminate the same acquired session and
attempt cleanup; failed snapshot retains the loss diagnostic/cleanupFailed flag.
Dispose removes Render/Three listeners; no automatic backend restoration. Host
explicitly requests a new session on a usable unreserved target. Quarantine is
never force-released. Unknown frame/host exceptions remain unknown and propagate;
builds and compiled manual procedure do not verify actual GPU loss/restoration.

Phase 6 v0.6.2 RV03/RV04: [Graphics lifecycle](checkpoints/render-viewport-v0.6.2.md)
adds beginRenderFrameSession, RenderFrameAcquisition and RenderGraphicsSnapshot
(Render57). An observation handle exposes pending/ready/failed/disposed for the
same canonical acquisition/session used by the unchanged async factory signature.
Ready is last acquired state, not live GPU-health or displayed pixels. Failed
retains safe diagnostics (null if unknown) while Promise rejection is preserved;
disposed is terminal even if cleanup fails. Binding-only factories/states and
session required members/error unions are unchanged. Manual consumer is compiled,
not browser-executed. Supplied RV03/RV04 tasks supersede provisional RV allocation.

Phase 6 v0.6.1 RV02: [Canvas target capabilities](checkpoints/render-viewport-v0.6.1.md)
adds inspectRenderTarget and RenderTargetCapabilities (Render54). Inspection is a
frozen target/dimension/reservation observation without context acquisition; graphics
is always NOT_CHECKED. Private native canvas validation is shared with existing
graphics acquisition. Binding factories, error unions and exclusive reservation
ownership remain unchanged. Manual public-root consumer supplied, not browser-verified.
The supplied RV02 scope supersedes v0.6.0's provisional metrics allocation.

Phase 6 v0.6.0 RV01: [Render Context architecture audit](checkpoints/render-viewport-v0.6.0.md)
records the merged Phase 1–5 baseline, exact existing Render52 declarations and
future-consumer matrix. API_DESIGN_ONLY: extend existing RenderFrameSession;
no new APIs or behavior. Render owns graphics/viewport; Editor/Client own canvas
UI/layout/measurements/frame requests. Host Canvas, graphics context and viewport
state are separate; bound, acquisition returned, submitted and displayed are not
interchangeable. Preserve binding-only hosts, pure Spatial math and authored
Scene/Document isolation. RV02–RV19/version allocations are provisional until
their tasks arrive; signatures, resize/ratio/zero-size/suspend/recovery policies
remain open. Current v0.6.0 authorization supersedes older next-phase stop notes,
without accepting prior functional/visual behavior. No phase completion implied.

Phase 5 v0.5.13: [Document integration/closure DC19](checkpoints/document-v0.5.13.md)
is the current Phase 5 inventory and safety disposition: fourteen checkpoints,
44 additive Editor symbols (134 total), Render52 unchanged, no closure API delta.
Existing content owners remain canonical. Real local create-only Save/Load,
conflict preservation, delayed acknowledgement and explicit migration candidate
observations are finite evidence; no existing-file CAS, universal no-data-loss,
recovery, durability, GUI or visual guarantee follows. Root README/architecture
Phase 4 capability counts are historical; this report records current Phase 5
source/declarations. READY_FOR_DEVELOPER_REVIEW; acceptance stays Developer-owned.
No Feature 06, merge, tag, release or publication is authorized by closure.

Phase 5 v0.5.12: [Minimal Document MVP DC19](checkpoints/document-v0.5.12.md)
records a public-API-only [manual workflow](../editor/manual/document-mvp.md).
No production/API/schema change: Editor134 / Render52 exports remain unchanged.
Existing Document gates compose actual Scene/Asset/Spatial owners; local host owns
real IO and create-only exclusive publication. Observations include saved/reloaded
authored metadata, conflict bytes/state preservation, delayed revision2 receipt
while revision3 stays dirty, saved-snapshot restore and migration candidate only.
Direction is sample-owned opaque metadata, not a new Scene schema. No Renderer
allocation, product CAS adapter, recovery, visual claim or automated suite.
Stop before v0.5.13; build/manual evidence does not establish phase acceptance.

Phase 5 v0.5.11: [Unknown data/content integration DC17/DC18](checkpoints/document-v0.5.11.md)
adds one Editor root function replaceSceneDocumentObject (133 -> 134 symbols).
Document Scene strict validation now requires a complete canonical SceneMembership
snapshot, with optional opaque portable metadata RECORDS only at content, scene,
objects[i], and objects[i].definition. Metadata is preserved, not interpreted or
reference-validated. Other unknown fields (including extra reference, identity,
placement or relationship fields), primitive metadata, or default-normalized
construction input produce UNSUPPORTED_CONTENT_PROFILE. Original decoded content
and text remain inspectable; existing load/save/compatibility/migration reuse this
strict gate. Current callers using canonical snapshots remain supported; old Scene
construction inputs that required normalization become inspect-only. Asset snapshot
metadata and Spatial exact-field policies are unchanged and reused directly.

replaceSceneDocumentObject(document, objectId, replacement, sceneContext) takes a
complete known-field SceneObjectMembership snapshot, delegates canonical same-ID
replacement and retains original metadata at all supported source slots. It rejects
extra replacement fields rather than stripping them. Explicit omission of optional
known fields clears them per the existing owner operation; unknown metadata cannot
be edited here. Exact current kind/version and strict source/candidate diagnostics
are required; failure throws without returning/adopting a candidate. Trusted resolver
errors and codec resource limits propagate. No schema bump, path patch engine,
session/saved-state mutation, IO or automatic save/migrate. Low-level whole-content
replacement remains caller-trusted: no API can restore data discarded before entry.
Portable metadata must be authored content only; plain UI/runtime-shaped data cannot
be distinguished by portability checks alone. Future semantics outside this profile
remain read-only/rejected even if their raw bytes can be retained.

Phase 5 v0.5.10: [Schema compatibility DC16](checkpoints/document-v0.5.10.md)
adds inspectDocumentCompatibility, migrateDocument, DocumentMigration,
DocumentCompatibilityResult and DocumentMigrationResult (Editor root 128 -> 133).
Caller supplies current owner/kind/content-version binding. Only supported envelope
schema 1 is decoded; malformed/future envelope, future content and mismatched kind
are rejected. Strict-valid current content is writable-compatible with
writeEligibility NOT_ESTABLISHED; older inspectable content stays read-only.
Migration requires an explicitly selected named synchronous pure owner transform
with exact numeric source/target versions and a forward step. It captures bounded
portable output, preserves every old content key/value/array position, then applies
canonical current owner/reference diagnostics. Projection loss blocks. Original
text and immutable candidate are returned without IO, session or saved-state changes.
Unknown fields are retained or blocked, never silently stripped. This conservative
additive profile does not support destructive/renaming migrations. Trusted callback
purity and semantic interpretation are host/content-owner duties, not sandboxed.
No auto-open migration, chain, registry, downgrade or general envelope upgrade.
Candidate Save is explicit through existing save policy and actual host guarantees.
Sample document-content versions do not change published Asset/envelope schema 1.

Phase 5 v0.5.9: [Persistence failure DC15](checkpoints/document-v0.5.9.md)
adds three Editor root types: DocumentPersistenceFailure, DocumentCleanupReceipt
and DocumentCleanupResult. Existing load/save status discriminants are retained;
rejected loads and save validation/write outcomes now include a frozen failure
record (code, RECOVERY_NOT_AVAILABLE, advisory nextAction). Blocked save outcomes
include failure for prior uncertainty or serialization rejection. No raw errors,
host paths or handles enter diagnostic records. Unexpected read/pre-dispatch
exceptions still propagate; any thrown/malformed write receipt is COMMIT_UNCERTAIN.
Optional failed receipt reason refines known failures to IO_DENIED or
WRITE_INTERRUPTED; absent/io-error is WRITE_FAILED. Failed still guarantees
unchanged target and no pending write. No inferred rollback or durability.

DocumentWritePort.cleanup?(request, outcome) is called at most once, only after
commit settles, with the same frozen request and normalized primary status.
Host must release handles before settling commit and own per-request artifact
tracking. It must retain potentially sole valid copies; never delete destination,
retry or republish here. Cleanup is not a recovery capability. No hook yields
not-configured, not an assurance that artifacts are absent. Receipt cleaned or
retained is captured separately; failed, thrown or malformed cleanup is
CLEANUP_FAILED without replacing commit/conflict/uncertainty evidence. The active
guard remains held until cleanup settles. Host must settle promptly; no timer,
cancellation or forced handle disposal exists. Known commit still acknowledges
its exact ticket if cleanup fails; newer edits stay dirty. Unknown commit never
advances baseline or clears quarantine regardless of cleanup result. No recovery,
reconciliation/unlock or automatic retry, including on external conflict or
unsupported schema/target. Inspect storage and retained artifacts manually before
an explicit host decision; there is no API to certify that decision here.

Phase 5 v0.5.8: [Safe save DC14](checkpoints/document-v0.5.8.md) adds
saveDocument(session, port, locator, expected, context?) and five readonly public
write contracts. Preconditions are explicit absent, observed identity/revision, or
unknown (always blocked). Port declares create-only/compare-and-swap/unavailable
conflict protection and atomic-publish/unavailable publication. Missing guarantees
return CONFLICT_UNDETECTABLE or ATOMIC_PUBLICATION_UNAVAILABLE before write IO.
Revision tokens come from the host, never session/schema versions or guessed
mtime. Host must atomically enforce preconditions against all writers while
publishing the complete payload; a read-check-write sequence is insufficient.
Atomic publication is not power-loss durability. No unconditional overwrite mode.

Coordinator requires open session, captures an immutable session-bound ticket,
serializes through canonical codec and requires strict existing owner diagnostics.
Diagnostic writeEligibility remains advisory NOT_ESTABLISHED; actual admission
also requires explicit host authority/guarantees/precondition. Missing references,
unknown owner/version or unchecked context do not authorize writes. Serialize the
original ticket, never a projected validation candidate; unknown supported fields
survive. No automatic repair, schema bump or migration.

Only committed host receipt acknowledges that ticket. Host observation is
detached/frozen and remains separate from session generation. failed guarantees
unchanged target and no pending IO; conflicted does not overwrite; uncertain,
malformed/nonportable or thrown commit outcomes never advance saved baseline and
block further coordinator writes on that session. Retiring a ticket with the old
session failed seam only removes its capability, not a claim of known storage
failure. Pre-dispatch unexpected resolver errors propagate after releasing the
guard. Same-session overlap returns busy (no queue); separate sessions/hosts rely
on actual atomic host protection. Low-level session APIs are trusted seams and
must not bypass coordinator ordering; module-instance guards are not distributed
locks. Closing while pending does not cancel host IO: committed/session-closed
reports storage success without mutating/reopening the terminal session.

This version adds no recovery/unlock policy, registry, watcher, autosave, UI,
database or Render lifecycle integration. Local real host evidence is create-only
staged-file hardlink publication. Existing-file CAS/replacement and crash safety
are not established by this checkpoint; unsafe overwrite is refused.

Phase 5 v0.5.7: [Storage read/load DC13](checkpoints/document-v0.5.7.md)
adds loadDocument(port, locator, context?) and DocumentReadPort/DocumentReadResult/
DocumentStorageObservation/DocumentLoadResult through Editor root only. Locator is
an exact nonempty host string, independent of authored identity. Host read returns
exact decoded text and explicit nullable identity/revision observations, not an
implicit path policy or guaranteed concurrency token. Expected failures are
not-found or read-failed (permission-denied/io-error/unavailable); unexpected port
or resolver exceptions and invalid host contracts propagate, never empty fallback.
Host owns authorization, byte limits, lossless decoding and actual IO guarantees.
No portable module imports Node fs, browser storage or platform types.

The existing diagnoseDocument pipeline owns all decode/content/reference checks.
Decode rejection produces parse-failed (including invalid envelope/resource
profile), except unsupported envelope schema produces unsupported-schema.
Decoded but non-strict results produce validation-diagnostics, preserving unknown
content and original text without a mutable session. An unsupported content-owner
version remains its existing schema diagnostic; no new compatibility inference.
Every successful read result retains exact text, detached frozen observations and
canonical validation. Strict-valid creates one new open session with current and
saved revision 1, saved envelope equal to loaded authored content, no caller-memory
revert target and no connection to another current session. Clean means equal to
the read snapshot; it establishes no write permission or conflict safety. Future
schemas remain opaque text, never migrated, downgraded or overwritten. This
checkpoint adds no save/write, registry, cache, UI or Render initialization.

Phase 5 v0.5.6: [Document validation DC11/DC12](checkpoints/document-v0.5.6.md)
adds diagnoseDocument(text, context?) -> DocumentValidationResult, plus
DocumentDiagnosticCode/DocumentDiagnostic/DocumentValidationContext. JSON is decoded
through v0.5.5 first, preserving its resource and schema profile; no second envelope
or payload portability validator. Context explicitly binds exact documentKind and
contentSchemaVersion to one existing owner adapter (scene, asset snapshot,
coordinate-space, or string-only text). This is a per-call host assertion, not a
universal kind registry, inferred schema compatibility or migration. Missing owner
means not-checked; binding mismatch stops before domain validation. Catalogs are
factory snapshots; an optional synchronous authored-space resolver is host-trusted,
must use memory only and must not perform IO. Unknown resolver/host exceptions
propagate without turning into authored diagnostics.

Result always retains the ORIGINAL decoded/frozen envelope, including unknown
fields and broken references; never the potentially projected owner candidate.
Decode rejection returns document:null without fallback. Diagnostics are frozen
portable records: group, code, severity, document-root path, reference string/null
hints and primitive details. No raw exception message/backend handles. Existing
owner code/path/constraint priority is retained; no message parsing. Spatial owner's
plain TypeError yields coarse INVALID_SPATIAL_SPACE at the placement/content path.
Order: decode/binding first; canonical owner first structural error stops its
references; otherwise project correlation, Scene declaration order (attachment
before Asset), missing-context warnings, spatial declaration pass. Asset direct
dependencies use their declaration order. No transitive reference traversal.

status is invalid for envelope/schema/payload/spatial errors, unresolved for logical
reference errors alone, not-checked for warnings alone, valid otherwise. checks
separately records content/Asset/spatial coverage; NOT_APPLICABLE means no declared
reference of that supported owner, never unchecked unknown content. Missing catalog
or resolver is NOT_CHECKED, not an invented missing target. Missing space requires
explicit resolver returning undefined. Same Asset ID across Scene objects is valid;
owner enforces duplicate OBJECT definitions, not duplicate Asset use. Attachment
target is local/nonhierarchical; cross-Scene references keep the existing owner's
unsupported diagnostic. No parent system or new Scene catalog.

readEligibility.inspect permits decoded portable envelopes with diagnostics;
strict requires status valid for the DECLARED checks only. Neither opens a session.
writeEligibility is always NOT_ESTABLISHED; even valid authored references do not
establish write preconditions, physical resources, unknown-field semantics or safe
overwrite. fileExistence is always NOT_CHECKED. Host chooses admission policy;
result never fixes/drops/rebinds data, increments revision, clears dirty state,
saves, migrates, calls a loader or establishes storage guarantees. No v0.5.7.

Phase 5 v0.5.5: [Serialization/deserialization DC10](checkpoints/document-v0.5.5.md)
adds Editor-root serializeDocument(document): string and deserializeDocument(text):
DocumentDecodeResult, plus DocumentDecodeDiagnostic. Pure compact schema-1 JSON;
canonical envelope/portable capture is reused, not a second content schema system.
Encode rejects unsupported graphs before stringify (TypeError/RangeError; unknown
host exceptions propagate). Decode returns frozen decoded/document or rejected/
diagnostic; safe codes INVALID_INPUT, INVALID_JSON, DUPLICATE_KEY, LIMIT_EXCEEDED,
UNSUPPORTED_SCHEMA, INVALID_ENVELOPE. Fixed messages never echo untrusted text.
Duplicate decoded keys reject, including escaped equivalents. Native JSON.parse
remains grammar authority; a profile limit/duplicate can be detected before syntax.
Exact root/identity fields stay enforced; unknown portable content keys including
__proto__/constructor survive as own data without prototype merges. Explicit
schemaVersion 1 only; no fallback, migration, write permission or read-only mode.
contentSchemaVersion is preserved, not semantically interpreted. Fixed bounds:
1,048,576 UTF-16 code units of input/output and aggregate graph string/key data,
64 container levels (root=1), 100,000 value occurrences including root (keys are
not values). Shared records are detached by value; cycles reject. Bounds guard the
existing recursive detacher, not all possible host memory/Proxy behavior. Finite
binary64 excluding -0 only: JSON text can already round large integers/decimals or
underflow, so precision-sensitive values must be strings. Output follows native
ECMAScript key order/number rendering, compact without newline/BOM; no sorting,
semantic equality, hash or cryptographic canonicalization. Repeated captured input
is stable; fresh records with different insertion order can differ in bytes.
Codec never adopts a session, changes revision/dirty/saved evidence, interprets
Scene/Asset/Spatial schema/references, performs IO or saves. Host selects authored
payloads: portability cannot identify semantically misplaced plain UI records.
No v0.5.6 diagnostics implementation, storage adapter or extra project dependency.

Phase 5 v0.5.4: [Revision/dirty DC07/DC08](checkpoints/document-v0.5.4.md)
extends DocumentSession with currentRevision (starts 1), savedRevision/savedEnvelope
(null without explicit initial load evidence), and derived isDirty. Object.is on
captured content defines no-op/clean; no deep equality/hash. Different records are
edits; changed revert targets increment generation without fabricating savedRevision.
Legacy revert targets caller memory only; new revertToSaved requires a confirmed
loaded/committed snapshot. Optional loadedEvidence on the existing factory attests
the initial envelope, not the old revertBaseline. prepareSave returns an immutable
session-bound one-shot ticket with exact revision/envelope. completeSave accepts
committed evidence or failed/cancelled; only a valid committed outcome at least as
new as savedRevision updates the saved snapshot. Older acknowledgements are retired
without rollback. Save(2), edit(3), ack(2) keeps current=3/saved=2/dirty=true when
content differs. The trusted host must attest exact load/commit and order actual
storage writes; confirmation text is not verified IO or a storage-token protocol.
No writable dirty flag, schema bump, codec, IO, save loop or v0.5.5 operation.
Earlier entries retain their checkpoint-specific scope.

Phase 5 v0.5.3: [Document lifecycle DC06/DC09](checkpoints/document-v0.5.3.md)
adds an Editor-owned session capability. createDocumentSession(envelope,
revertBaseline) captures both inputs; an explicit null disables revert, otherwise
the caller-memory baseline must match identity, kind and schema versions. It is
never saved/storage evidence. Observations carry state/envelope/revertBaseline
outside authored data. open activates created data without IO; replaceContent
delegates to v0.5.2; revert restores only the supplied baseline. Both require open.
close('discard') requires explicit host admission from created/open; closed is
terminal and repeat close fails. Snapshot observation remains available and retains
final content. No dirty/equality/revision or saved inference, no implicit discard,
UI tab removal or Render disposal. Same-ID factory calls are independent; share
one session across views explicitly. No registry, codec, storage IO or v0.5.4.
Earlier entries retain their checkpoint-specific scope.

Phase 5 v0.5.2: [Document content isolation DC04/DC05](checkpoints/document-v0.5.2.md)
adds replaceDocumentContent(envelope, content) at the Editor root. It validates the
complete source envelope, then captures a fresh immutable whole-content replacement
through the existing portable-data detacher. Old snapshots stay unchanged; identity,
kind and both schema-version values stay fixed. This is not patch/merge, semantic
validation or write permission. Omitted old fields are intentionally not merged;
callers retain intended authored extensions and use canonical owner operations.
UI/session/Render/gameplay data stays outside authored payload by caller selection;
plain portable records cannot reveal those semantics automatically. Even equal
content yields a fresh envelope, so object identity is not a dirty/revision policy.
No lifecycle, current/saved revision, codec, IO or v0.5.3 operation is implemented.
Earlier entries describe their own checkpoint revisions.

Phase 5 v0.5.1: [Document identity/envelope DC02/DC03](checkpoints/document-v0.5.1.md)
adds createDocumentIdentity/createDocumentEnvelope at the Editor root. Identity is
exact projectId+documentId, independent of payload identity, kind and location.
Envelope schemaVersion is explicitly 1; contentSchemaVersion is explicitly a
positive safe integer or null for an unversioned owner. No codec format version,
editing revision, saved baseline or external storage token is introduced.
Document content is detached/frozen portable data, captured with the existing
Editor detacher; its kind/schema semantics remain the content owner's concern.
Unknown portable content keys survive; unsupported envelope/identity fields and
versions reject rather than being silently projected away. This is a construction
factory, not a decoder, compatibility/write authorization or storage API. No
session, registry, Save/Load/migration or v0.5.2 implementation. The v0.5.0 notes
below describe their earlier architecture-only revision.

Phase 5 v0.5.0: [Document architecture DC01](checkpoints/document-v0.5.0.md)
assigns authored document identity/envelope/lifecycle, dirty/revision, codecs and
load/save/migration orchestration to Editor. API_DESIGN_ONLY: no Document public
symbol, state machine, serializer or storage adapter exists yet. Content validation
remains with the existing Asset/Scene/Spatial owners; future game-specific config
semantics belong to Runtime Engine. Document ID, content ID, filename and tab ID
are separate; document/content/format versions, editing revisions and external
storage tokens are separate domains. Encode/decode is pure conversion, not IO;
saved baseline advances only with commit evidence for the exact captured revision.
Save(2), edit(3), then acknowledge(2) remains dirty. Unknown compatibility requires
preservation within an explicit supported profile or read-only/rejection before
write; construction factories are not lossless readers. No automatic destructive
migration or universal atomic-write promise. Authored payload excludes workspace,
Render sessions/handles and gameplay state; text content requires no graphics.
Concrete fields/signatures, payload profiles and storage guarantees remain future
checkpoint decisions. Existing Feature 19 export scope is not implemented here.

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

Phase 3 v0.3.11: [Scene Foundation Integration & MVP Closure](checkpoints/scene-contracts-v0.3.11.md)
audits the full checkpoint chain, SC01–SC18 dispositions, 31 Scene additions and
unchanged Render surface. No production delta. Finite authored-data observations
and build/static evidence do not establish rendering, serialization compatibility
or Developer phase acceptance. Parenting/nesting and spatial/visual-instance
semantics remain deferred to approved future scopes.

Phase 4 v0.4.0: [Spatial Architecture & Contract Foundation](checkpoints/spatial-contracts-v0.4.0.md)
records SP01 as API_DESIGN_ONLY and proposes future SP02–SP18 owner/contract seams.
Editor owns authored space/grid declarations; Render owns presentation transforms,
projection and viewport mapping; Engine owns game spatial policy/state. No public
symbol or accepted Scene/Asset/session schema changes. Existing placement remains
opaque, optional and caller-retained. Future Editor presentation requests must use
Render's public root with explicit space/unit/viewport/policy context; no duplicate
projection in Editor, reverse import or sixth package. Numeric illustrations are
design examples, not observed math. Stop before v0.4.1.

Phase 4 v0.4.1: [Coordinate Space Identity & Units](checkpoints/spatial-contracts-v0.4.1.md)
adds seven Editor root symbols: createCoordinateSpaceReference,
createCoordinateSpaceDefinition, createSpatialPoint2D, CoordinateSpaceReference,
CoordinateSpaceDefinition, CoordinatePair2D and SpatialPoint2D. References use exact
projectId + coordinateSpaceId, no lookup/registry; callers derive SC08 scope from
the owning Scene project. Definitions explicitly require componentCount 2, increasing
x right/left and y up/down, finite reference-origin coordinates in the declared
space, and a nonblank verbatim unit label. Origin is not a parent offset; no
conversion or implicit scale exists. Points carry scoped references and finite
x/y, accepting zero/negative. All new records require exact own keys on plain/null-
prototype records, rejecting extra dimensions/keys and arrays with TypeError;
capture detaches/freezes every nested record. No Scene/Asset/session schema change,
Render descriptor, transform or projection. This scoped task supersedes SP01's
proposed SP04 allocation for authored values. Stop before v0.4.2.

Phase 4 v0.4.2: [Spatial Transform Foundation](checkpoints/spatial-contracts-v0.4.2.md)
adds Render root PlanarTransform2D/createPlanarTransform2D. Explicit translation,
rotationRadians and scale capture as detached deeply frozen finite data with exact
own-key plain/null-prototype records. No defaults, coercion, angle normalization,
unit/axis/space conversion or matrix exposure. Intended point semantics: component
scale about numeric (0,0), radians rotation about zero, then translation; positive
rotation maps +x toward +y. Zero scale collapses and negative scale reflects before
rotation. This checkpoint supplies descriptor capture only; point application,
composition/inverse, Scene bridge and projection remain deferred. Scene/Asset and
prior Render APIs remain unchanged. Stop before v0.4.3.

Phase 4 v0.4.3: [Transform Composition & Inverse](checkpoints/spatial-contracts-v0.4.3.md)
adds Render root PlanarPoint2D, AffineTransform2D, PlanarInverseResult,
toAffineTransform2D, applyPlanarPoint2D, composePlanarTransforms2D and
invertPlanarTransform2D (19 -> 26; Editor stays 81). Existing TRS API unchanged.
Affine x'=a*x+c*y+tx, y'=b*x+d*y+ty preserves shear/reflection; [A,B] applies A
then B (B*A), empty list gives identity. Only points include translation; no direction
API. Exact finite plain/null-prototype inputs, detached frozen outputs; invalid
inputs TypeError, nonfinite arithmetic RangeError. Inverse normalizes linear block
by max coefficient magnitude, rejects zero block or abs(normalized determinant)
<=1e-12 with non-invertible/SINGULAR_OR_ILL_CONDITIONED; otherwise inverted plus
affine transform. Binary64 underflow/rounding remains possible; success gives no
universal accuracy bound. No unit/axis/space inference, Scene traversal or GPU work.
Stop before v0.4.4.

Phase 4 v0.4.4: [Grid Coordinate Foundation](checkpoints/spatial-contracts-v0.4.4.md)
adds Editor root OrthogonalGridDefinition/createOrthogonalGridDefinition (81 -> 83;
Render stays 26). Explicit space reference, orthogonal orientation, origin corner,
positive finite cellSize width/height and indexing directions/negativeIndices policy.
Origin/dimensions use the referenced coordinate-space unit; no resolver or duplicate
unit/axes declaration. Columns follow numeric x, rows numeric y, either sign;
indices mean safe integers, zero-based, with negative values allowed/rejected by
the declared policy. No index values are accepted or validated in this capture API.
Exact finite plain/null-prototype input records detach/freeze deeply; invalid data
and unsupported orientation throw TypeError. No Scene/placement schema change,
tile ID, map extent/catalog, conversion, clamp, registry or GPU acquisition.
Stop before v0.4.5.

Phase 4 v0.4.5: [Grid & Scene Coordinate Conversions](checkpoints/spatial-contracts-v0.4.5.md)
adds Render root GridConversionSpace, OrthogonalGridConversion, GridCell2D,
GridScenePosition2D, createOrthogonalGridConversion, gridCellToScenePosition and
scenePositionToGridCell (26 -> 33), plus Editor describeGridConversion (83 -> 84).
Adapter validates authored grid + matching space; Render captures portable exact
records without Editor imports. Space includes projectId/coordinateSpaceId/unit,
preserved in immutable results and matched exactly. Forward requires start-corner
or center; inverse requires floor in directed index coordinates with [i,i+1) cells.
Invalid/mismatched input throws TypeError, domain/numerical limits RangeError.
No nearest/epsilon/clamp, implicit unit conversion, map bounds or grid catalog.
Successful forward results floor-roundtrip to their input cell; this is not a
general numerical accuracy guarantee. Scene/Asset schemas unchanged; no GPU.
Stop before v0.4.6.

Phase 4 v0.4.6: [Anchor, Pivot & Direction](checkpoints/spatial-contracts-v0.4.6.md)
adds six Render root symbols (33 -> 39) and Editor describeSceneObjectAlignment
(84 -> 85), retaining all prior signatures/exports. Local-unit coordinates are
not normalized fractions; explicit placement + offset - anchor gives unrotated
origin, and origin + local pivot gives plane pivot. Facing has explicit axes,
numeric +x zero and positive turn toward +y in [0,2*PI), independent of geometry
or animation selection. Editor validates scoped placement/axes and calls Render
math; no placement returns null. Invalid data/mismatch TypeError, nonfinite math
RangeError, unknown host exceptions propagate. Scene/Asset/session schemas unchanged.
No image decoding/metrics inference, normalization, discrete mapping or GPU work.
Stop before v0.4.7.

Phase 4 v0.4.7: [Projection Foundation](checkpoints/spatial-contracts-v0.4.7.md)
adds five Render root symbols (39 -> 44) and Editor
describeOrthographicPlaneProjection (85 -> 86). Pure orthographic-plane mapping
uses declared source/destination scoped keys, units/axes, correspondence origins
and positive per-axis destinationUnitsPerSourceUnit. Subtract source origin, apply
axis signs/ratios, add destination origin through existing affine point operations.
Mismatched source context, unsupported kind or invalid data throws TypeError;
nonfinite intermediate/output math RangeError. Deeply detached frozen data;
no inverse, depth reconstruction, camera, viewport/screen or global state.
Scene/Asset/session and facing/anchor schemas unchanged. Stop before v0.4.8.

## Unresolved until demonstrated

Phase 4 v0.4.10: [Editor-Render Spatial Integration](checkpoints/spatial-contracts-v0.4.10.md)
adds Editor describeSceneObjectSpatialPoint and SceneObjectSpatialDescription
(88 -> 90 symbols; Render stays 52). Existing Scene membership/objectId plus one
explicit CoordinateSpaceDefinition produces described/request or unavailable/
NO_PLACEMENT. The request is Render's existing PlaneProjectionPoint2D, containing
only plane and point; caller retains project/scene/object correlation separately.
Canonical Scene/space capture detaches/freezes supported data and validates exact
project/space matching. Origin labels are not offsets; placement absence does not
inspect the supplied definition. Missing object/invalid placed data/mismatch throw
TypeError; unknown host errors propagate. Caller sends request to Render root
projectPointToViewport2D; unsupported mapping throws TypeError, numerical failures
RangeError under existing contracts. No automatic fallback or Scene/Asset mutation.
Authored IDs never become ephemeral session symbols; no allocation or session
binding. Asset metadata preparation remains an independent existing path. No
Scene/Asset schema, Render signature, UI/backend or dependency change. Stop before v0.4.11.

Phase 4 v0.4.9: [Scene Spatial Integration](checkpoints/spatial-contracts-v0.4.9.md)
adds Editor updateSceneObjectSpatialPlacement (87 -> 88), Render unchanged at 52.
Input is an existing factory Scene snapshot, target objectId, explicit
CoordinateSpaceDefinition and SpatialPoint2D. Canonical factories validate both
spatial values; point/definition project+space and Scene project must match exactly.
One supplied definition is the operation's explicit scope, not a global catalog.
Canonical updateSceneObjectPlacement returns the frozen candidate, preserving
all supported fields except selected placement. Missing targets/mismatches/invalid
data throw TypeError; host errors propagate. Definitions stay caller-retained,
with no revision/consistency registry, implicit lookup or conversion. Null clearing
uses the existing Scene API. Schema unchanged; anchor/direction remain caller-owned
config, not new fields. Text/empty Scenes need no placement/grid. Stop before v0.4.10.

Phase 4 v0.4.8: [Viewport/Screen Mapping & Spatial Validation](checkpoints/spatial-contracts-v0.4.8.md)
adds ScreenMapping2D, ViewportMetrics2D, ViewportMapping2D,
createViewportMapping2D, projectPointToViewport2D, viewportPointToPlane2D,
viewportPointToScreen2D and screenPointToViewport2D (Render 44 -> 52), plus
Editor describeViewportMapping (86 -> 87). Existing signatures retained.
Viewport dimensions are positive finite; local origin is top-left (0,0), axes
right/down and units exactly css-px or device-px. Projection destination context
matches metrics exactly; numeric correspondence origins/scale are explicit.
Screen mapping is null or explicit plane/origin/per-axis scale; never implicit DPR.
Exact plain/null-prototype records capture deeply frozen snapshots. Invalid data
or mismatches throw TypeError; nonfinite arithmetic, normalized scale ratio
<=1e-12, nonfinite/zero reciprocal or failed inverse destination residual throw
RangeError. Residual bound is 1e-9*max(1,abs(input component)), not a universal
source accuracy guarantee. Off-viewport points remain valid, no clipping or
automatic aspect/fit. No camera, depth recovery, DOM/global reads, Scene schema
or session lifecycle change. Stop before v0.4.9.



- Scene identity, minimal authored records and immutable operations are Editor-owned and implemented through v0.3.8, with consumers/evidence in v0.3.9–v0.3.10. Versioned document schema, parenting/nesting and future extension compatibility remain open. Coordinates/projection belong to Features 04/09; visual instance allocation/rendering to Feature 08. Text-only content does not require a visual scene.
- Authored Asset and Scene identity/reference semantics belong to Editor. Document lifecycle/envelopes (Feature 05), serialization/export (Feature 19) and other game content formats remain separate decisions. Ownership of authored data does not select a storage format or Client dependency on Editor.
- Rule/config discovery shape (descriptors, type contracts, explicit editors, mixed approaches).
- State/event update model, client/server data projections, authority/verifier, persistence.
- Physical L3/L4 split and package/repository boundaries after working games.

## Three data classes that must not be conflated

Authored content/config != Editor local workspace state != Runtime mutable instance state. If an interface crosses two, specify which it carries and why.
