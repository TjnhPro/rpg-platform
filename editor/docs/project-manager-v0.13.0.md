# PM01 — frozen Project Manager design

Baseline: main `592e4d0b0352614ae151ec7e8495c7a2fbd31abf`, branch
`feat/project-manager-v0.13`. Specification copies: [task manifest](tasks/phase13-project-manager/MANIFEST.md).
This checkpoint is architecture only; subsequent versions implement one capability each.

| Behavior | Canonical owner | Collaborator / boundary |
| --- | --- | --- |
| Portable project authoring and validation | Editor | Existing Document/Asset/Scene owners remain authoritative |
| Project session/create/open/save | Editor | DocumentSession, loadDocument, saveDocument; no second persistence stack |
| Physical root, permissions, containment, commit receipts | Trusted Editor host | Borrowed read/write ports, never serialized |
| Project controls | Existing Editor React/Mantine application | Phase12 shell, singleton theme, EditorPanel, ui:check |
| Scene presentation | Runtime Render, unchanged | No physical roots or project manager import |
| Gameplay rules | Runtime Engine, unchanged | No Project Manager involvement or L1/L2 calls |
| Client/server | Unchanged independent projects | No Editor imports |

## Closed manifest v1

One existing `DocumentEnvelope`: schemaVersion 1, documentKind `project`,
contentSchemaVersion 1, identity `{projectId, documentId}`. Its **content** is:

```ts
{
  schemaVersion: 1,
  projectId: string,
  metadata: { name: string, description?: string },
  resourceRoots: Array<{ rootId: string, locator: ResourceLocator }>,
  documents: Array<{
    identity: DocumentIdentity,
    documentKind: string,
    contentSchemaVersion: number | null,
    locator: ResourceLocator,
    sceneId: string | null
  }>,
  activeScene: null | { documentId: string, sceneId: string }
}
```

All structural keys are closed. No unknown extensions, contents, ports, absolute
roots, UI/GPU/runtime state or sessions. Exact identifiers reuse DocumentIdentity
validation (nonempty, whitespace-free, case-sensitive). Name must be nonblank,
without leading/trailing whitespace; description absent differs from empty string,
which is allowed. No trimming, generated IDs or identity inferred from folders.
The manifest's projectId must equal envelope identity.projectId.

ResourceLocator is the existing `{type:'project-relative',path:string}`. Resource
roots label project-relative directories; documents also use project-relative
locators directly, not rootId-relative paths. No implicit concatenation or required
root membership. Repeated root IDs or document IDs/locators reject; root paths may
overlap deliberately. Manifest document cannot track itself. Kind is an exact
nonempty whitespace-free explicit owner binding; version is null or positive safe
integer. `documentKind:'scene'` requires a nonnull exact sceneId; other kinds require
null. References do not establish the target's existence/content validity. Active
Scene must match a tracked scene document and its sceneId; removal clears its
selection explicitly, replacement cannot silently retarget it.

Six distinct concepts: logical projectId; manifest DocumentIdentity; tracked
documentId; sceneId; portable locator; physical root capability. Each session keeps
an explicit same-project binding with opaque bindingId and borrowed ports; no global
active-root lookup, physical path serialization or implied symlink containment.
Host must authorize locator dispatch and actual containment, including junctions,
symlinks, permissions and TOCTOU. A/B bindings remain separate even for equal paths.

## Flow and invariants

Pure metadata/content -> roots -> document references -> active scene -> project
session -> Create -> Open -> Save -> minimal UI/real host -> closure.
Project session wraps one canonical DocumentSession; its dirty/revision/saved state
is derived from that session, never a second dirty counter. It owns no tracked
document sessions. Closing requires explicit discard, is terminal, and does not
dispose borrowed ports or unrelated resources. Reopen creates a fresh session.

Create produces unsaved memory only. Open delegates one read/decode/strict validation
to loadDocument, checks requested project/root identity, and adopts a fresh session
only on success; rejection cannot replace another session or write storage. Save
delegates the manifest only to saveDocument, using its ticket, exact revision,
in-flight/uncertain guards, strict validation, host precondition and acknowledgement.
Save All is excluded. Edits during pending IO stay dirty; late completion cannot
resurrect a closed project. A trusted port must enforce preconditions atomically
against all writers and publish full content atomically. Read/hash/rename is not CAS.
Create-only absent publication is sufficient for MVP; replacement remains unsupported
unless a host genuinely attests CAS. No power-loss durability claim.

## Ordered implementation / public surface proposal

| Version | Capability / planned project module and additive root API |
| --- | --- |
| 0.13.0 | PM01 docs/inventory only |
| 0.13.1 | PM02 project-manifest / project-diagnostics: createProjectManifest, diagnoseProjectManifest; additive Document owner project |
| 0.13.2 | PM03 project-roots: setProjectResourceRoots, createProjectRootBinding, resolveProjectLocator |
| 0.13.3 | PM04 project-documents: track/list/get/update/removeProjectDocument, diagnoseProjectDocuments |
| 0.13.4 | PM05 project-active-scene: set/clear/getProjectActiveScene |
| 0.13.5 | PM06 project-session: createProjectSession, session snapshot/replace/close |
| 0.13.6 | PM07 project-create: createProject |
| 0.13.7 | PM08 project-open: openProject |
| 0.13.8 | PM09 project-save: saveProject |
| 0.13.9 | PM10 UI ProjectManagerPanel and manual trusted filesystem host, A/B proof |
| 0.13.10 | PM11 integration inventory, evidence, full build, review packet |

PM02 admits empty collections only until their canonical validators arrive at
PM03–05; final representation is already frozen, unsupported nonempty data rejects
rather than being dropped or falsely admitted. Later validators replace these
staged restrictions without changing serialized shape. No later capability is
implemented early. Pure factory snapshots detach/freeze all nested data; data
accessors/classes/sparse arrays are rejected by existing portable capture. Proxies
are untrusted executable inputs, not a sandboxable JSON transport; trap exceptions
propagate rather than becoming invented validation success.

Compatibility: old exports/Document contexts remain valid; no edits to load/save/
session, Asset/Scene/Render. Future schema/unknown structural fields reject without
repair/migration or overwriting original bytes. Failures distinguish invalid input,
unsupported schema, wrong project/root, unknown/untracked selection, closed session,
and inherited Document parse/read/validation/conflict/uncertain/cleanup outcomes.
File existence is always NOT_CHECKED until actual host IO. No fabricated recovery.

Deferred: wizard/recent projects, Save All/autosave, scan/index, scene content load,
Asset Manager, ZIP/cloud/multiwindow/routing. UI reuses existing Foundation without
theme/CSS/component rebootstrap. No engine, external foundation or dependency change.
