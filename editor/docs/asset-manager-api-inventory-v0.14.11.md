# Phase14 source and public API audit

Baseline `f4ccba404c8b48994206cb5e803079fd435b3b51`; audited production HEAD
`fe5d74de2609c826bce45fb0754fe8a85d5b731c`. Closure adds documentation only.
TypeScript AST inspection of baseline/current root exports and emitted index.d.ts:
174 baseline names, 207 current names, 207 emitted names; 33 additions, zero
removed names and zero source/emitted export-name mismatches. index.ts diff is
append-only. All pre-existing editor/src modules other than index.ts are byte-for-
byte unchanged in Git, preserving canonical Asset/Document/Project signatures.
This inventory describes public contracts, not behavioral acceptance.

| New module | Added root values/functions | Added root types |
| --- | --- | --- |
| asset-manager-project | createAssetManagerProject, getAssetManagerProjectSnapshot, adoptAssetManagerCatalog, closeAssetManagerProject, admitAssetManagerIdentity, rebuildAssetManagerCatalog | AssetManagerProject, AssetManagerProjectSnapshot |
| asset-manager-category | assetBrowserCategories, describeAssetBrowserCategory | AssetBrowserCategoryResult |
| asset-manager-registration | registerManagedAsset, updateManagedAssetMetadata, unregisterManagedAsset | AssetRegistrationCandidate |
| asset-manager-import | registerExistingAssetResource | ExistingResourceRequest, ExistingResourceObservation, ExistingResourcePort, ExistingResourceResult |
| asset-manager-search | searchManagedAssets | AssetSearchRequest, AssetSearchResult |
| asset-manager-inspector | inspectManagedAsset | AssetInspectorResult |
| asset-manager-selection | selectManagedAsset, getManagedAssetSelection | AssetSelectionResult |
| asset-manager-preview | createAssetPreviewController | AssetPreviewRequest, AssetPreviewAcquisition, AssetPreviewSnapshot, AssetPreviewController |

requireAssetManagerProject and observeManagedAssetSelection appear in individual
emitted modules for internal collaboration, but are absent from the package root;
package exports still permits only the root. No new deep/private consumer import.
No barrel star-export, dependency, root package/lock or schema change.

## Source ownership and lifetime

- Phase2 createAssetCatalog/register/update/remove/resolve remains the definition
  authority. Project adapter WeakMap stores a handle to that immutable catalog,
  its exact ProjectSession/root and generation; it is not a second definition
  index. Search derives ordered results directly. Selection WeakMaps retain
  references/observers per context, never global selected definitions.
- Phase5 owns envelope/codec/load/save/session acknowledgement. Each asset has its
  own Document; registration returns NOT_COMMITTED candidates. Phase13 owns root,
  manifest references and project session. Rebuild admits the complete known
  Document set; no recursive filesystem discovery or filename-derived identity.
- Category is exact optional metadata, separate from resource kind/gameplay.
  Metadata update delegates to Phase2 while retaining unrelated authored values.
  No Player/Item runtime semantics or generic RPG schema was added.
- Render root owns visual description preparation, PNG decode/cache/upload,
  retained leases, Scene instances and drawing. Preview controller owns only its
  borrowed-scene usage and pending epoch; it must be disposed before project/host
  replacement. No Three/Node filesystem in portable APIs, second renderer, GPU
  decoder, camera math or independent animation loop.
- Phase12 UI keeps one Mantine theme/Shell/Panel and existing viewport host. App
  composes stable ProjectManagerWorkspace and AssetBrowserWorkspace. Approved
  Phase13 UI delta moves original state/commands above responsive slots and shares
  active session/root plus an internal manifest refresh callback. Original
  ProjectManagerPanel compatibility wrapper remains. Viewport gains optional
  contentFactory forwarding, not a second host. No Shell/theme/CSS changes.
- Optional manual Node host is capability-scoped to two fresh roots and three
  exact Document paths; only A's exact existing PNG is readable. Browser provider
  requires the same root/binding/revision grant and aborts on replacement. It is a
  finite trusted-topology create-only adapter, not arbitrary filesystem access,
  existing-file CAS or a new portable persistence protocol.

Across the phase, zero changes in runtime-engine, runtime-render, game-client,
game-server, external foundations, canonical viewport-host, package/lock, CI or
Harness checker/CLI/config. Harness changes are ownership guidance and checkpoint
records only. Manual adapters are tooling, not a sixth production project.
