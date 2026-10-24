# AM01 — frozen Asset Manager architecture

Execution baseline: main f4ccba404c8b48994206cb5e803079fd435b3b51 (2026-10-24),
Phase13 merged. Branch feat/asset-manager-browser-v0.14. This checkpoint changes
Markdown only; no new implementation, serialized schema, export or dependency.
Read actual Phase2/5/7/12/13 source and emitted declarations, not planning baseline
aceea67. Phase12 Mantine app/theme/Panel/ui:check and Phase13 Project APIs exist.
Task source: [ordered manifest](tasks/phase14-asset-manager/MANIFEST.md).

```text
Host-selected open ProjectSession + explicit same-project root capability
    -> project manifest tracked asset Document references (kind asset, version1)
    -> Phase5 loadDocument / strict asset owner / AssetDefinition snapshot
    -> Phase2 createAssetCatalog (ordered, immutable, project-local)
    -> browser query/inspection/reference selection adapters (Editor)
    -> describeResolvedVisualAsset (supported image only)
    -> Render prepare/source provider/cache/PNG decode/texture lease
    -> Render Scene drawable + camera + frame session (only when mounted/authorized)
```

## Owners and identities

| Behavior | Canonical owner | Boundary |
| --- | --- | --- |
| Identity/definition/catalog/resolve | Editor Phase2 | No second catalog or mutable definition store |
| Project/root/document references | Editor Phase13 | Explicit caller-held ProjectSession; no global fallback |
| Asset Document/session/codec/persistence | Editor Phase5 | One definition per Document; separate manifest commit |
| Browser category/query/inspection/selection | Editor Phase14 adapters | Derived from canonical snapshots; no gameplay or serialized UI state |
| IO authorization and conditional publication | Explicit trusted Editor host | Root containment/permissions/revocation, bounded reads, real receipts |
| Decode/atlas/cache/texture/Scene/camera | Runtime Render, read-only | Existing public root APIs only; Editor owns acquired rights teardown |
| Gameplay/client/server/L1/L2 | Unchanged | No imports or edits needed for this phase |

AssetIdentity equality = exact projectId + assetId; optional sourceId is provenance.
DocumentIdentity = projectId + documentId; do not assume documentId == assetId.
Portable ResourceLocator is a project-relative dispatch key, not physical authority.
Physical root/binding/provider grant never enters authored data. Source locators are
authored portable references; the selected host maps them to storage. A Scene object,
gameplay entity, GPU resource and UI selection are distinct from AssetDefinition.

## Storage and catalog admission

Freeze one AssetDefinition snapshot per DocumentEnvelope schema1, documentKind
`asset`, contentSchemaVersion1, owner `asset`. Content retains complete schema1
definition (identity including sourceId, kind, metadata, sources, dependencies).
Use readAssetDefinitionSnapshot for stored data, never construction projection over
unknown fields. Envelope/content/project IDs must agree. No serialized catalog kind,
new codec, recursive scanning or file-name-derived identity. ProjectManager tracks
DocumentIdentity, kind/version and locator; reconstructed catalog follows manifest
order from supplied strictly valid documents. Duplicate asset IDs, foreign documents,
missing entries, wrong owner/version or malformed content fail closed with old data
untouched. Unknown dependency targets/subresources remain canonical diagnostics.

Catalog registration is an immutable in-memory candidate only. Each asset Document
has its own DocumentSession revision/dirty/saved evidence; the manifest session is
independent. Save each asset through saveDocument, then separately update/commit
manifest references using trackProjectDocument/replaceProjectManifest/saveProject.
No cross-file transaction, Save All, automatic save acknowledgement or rollback claim.
Failed/uncertain writes retain inherited quarantine and dirty state. Existing host
supports absent publication only; existing-file replacement/CAS remains unsupported.
New host support must attest genuine atomic full-payload publication and precondition;
read/check/hash plus unconditional rename is never CAS.

## Category and import decisions

Browser-only optional metadata key `editorBrowserCategory` is a plain nonblank
string. Absence means `uncategorized`. Preserve exact authored spelling; no automatic
trim/case folding. Defaults: player, monster, map, item, vfx, uncategorized. Other
nonblank strings remain extensible. Invalid explicit values are reported, never
silently recategorized. Kind stays resource/data classification image/text/vendor
types, never rewritten to category. No gameplay requirements from category. Other
metadata extensions survive unchanged; label/tags await a real use case.

MVP import means register an already-existing project-relative resource after host
authorization/actual observation where required. Lexical validity never proves file
existence or symlink/junction containment. No external copy, converter, directory scan,
file deletion/move, path-derived ID/category or silent source repair. Metadata-only
Item is kind text with no image source; not a fake visual resource.

## Session and preview lifecycle / dependency gates

Adapters bind an open original ProjectSession plus explicit matching root; reject
closed/stale/foreign project context before adoption or dispatch. New context on
switch, clear selection, invalidate pending preview generation; old immutable A
snapshots never become B writes. Per-document ownership remains explicit. No private
requireOpenProjectSession import: it is not a package-root API. Public snapshot
bindingId is host correlation, not proof of same physical root; host must supply
unique binding IDs and preserve original grants. resolveProjectLocator validates the
original root capability and project; it does not return the session's borrowed root.

Preview supports only resolved kind image with role image through the existing
describeResolvedVisualAsset. Then Render owns prepareVisualResource, provider-scoped
source acquisition, PNG decoding/cache/upload, lease, Scene binding and camera.
Unresolved/text/unsupported kind/missing source produces explicit unsupported state.
No Editor PNG decoder, Three import, texture cache, animation clock or camera math.
Host explicitly attests exact source revision and grants; never derive revision from
Document generation. Release owned instances/leases, drain late completion, dispose
only owned cache/session; borrowed Render/Project/Document resources remain separate.
No late selection/switch/close result can revive prior context or free B resources.

Phase12 actual UI is required at AM10/11: one feature Panel, native Mantine controls,
singleton theme/EditorShell and existing checker; no CSS/framework/dependency changes.
ProjectManagerPanel currently holds active selection/root/sessions privately. AM10
must examine its exact integration surface and obtain a narrow correct-owner delta
if sharing the real active capability requires changing read-only Phase13 UI logic;
do not create a second active-project owner or bypass with guessed IDs.
The Phase13 manual host authorizes project.json only. Actual asset Documents and PNG
require an explicit new approved manual-host authorization set, not pretending its
current read port can read arbitrary resources. Browser/GPU availability and genuine
source revision are gates for observed visual evidence, not invented PASS statuses.

## Ordered capability plan (proposed adapters, no code implemented here)

| Version | Capability / contract intent |
| --- | --- |
| 0.14.1 AM02 | Project-bound canonical catalog; explicit validated-document rebuild and session switch isolation |
| 0.14.2 AM03 | Pure optional category metadata reading/admission; preserve other metadata |
| 0.14.3 AM04 | Register/update/remove through Phase2; explicit document tracking candidates, no writes |
| 0.14.4 AM05 | Register existing resource descriptor with explicit host observation; no external copy |
| 0.14.5 AM06 | Deterministic search/category/kind filtering over canonical ordered definitions |
| 0.14.6 AM07 | Read-only inspector with exact metadata/sources/dependencies and separate existence status |
| 0.14.7 AM08 | Project-scoped reference selection through canonical resolution; opaque subresource unsupported |
| 0.14.8 AM09 | Supported image preview adapter using Render public lifetime/resource APIs only |
| 0.14.9 AM10 | One existing-shell Browser Panel using actual active project capability; prerequisite gate |
| 0.14.10 AM11 | Actual PNG + metadata Item; real asset/manifest Save/Open and A/B proof; tiny UI smoke if available |
| 0.14.11 AM12 | Audit all checkpoints, API/scope/evidence, full build, one final PR; Developer decides merge |

Later adapters only add asset-manager-*.ts and additive root names, with no Phase2/5/13
signature changes by default. Each exact API must be chosen against that checkpoint's
source and task, compiled against consumers and recorded separately. Any canonical
owner gap requires evidence and smallest additive proposal before implementation.
No later capability is implemented by this design ledger.
