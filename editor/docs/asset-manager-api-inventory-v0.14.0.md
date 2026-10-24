# AM01 — observed public source/declaration ledger

Baseline f4ccba404c8b48994206cb5e803079fd435b3b51. Signatures below are from
editor/src and editor/dist, runtime-render/src and runtime-render/dist. Public access
is package root only; emitted module declarations do not authorize subpath imports.
No public API delta in AM01. Editor root currently has178 exported names.

| Exact existing public signature | Source / emitted declaration |
| --- | --- |
| createAssetIdentity(input: AssetIdentityInput): AssetIdentity | editor asset-identity.ts/.d.ts; exact projectId/assetId, sourceId nullable provenance |
| createAssetDefinition(input: AssetDefinitionInput): AssetDefinition | editor asset-definition.ts/.d.ts; schema1 frozen portable metadata/sources/dependencies |
| readAssetDefinitionSnapshot(input: unknown): AssetDefinition | editor asset-snapshot.ts/.d.ts; complete stored schema; unknown structural fields reject |
| createAssetCatalog(input: AssetCatalogInput): AssetCatalog | editor asset-catalog.ts/.d.ts; projectId, optional ordered definitions |
| getAssetDefinition(catalog: AssetCatalog, assetId: string): AssetDefinition \| undefined | same; requires caller project scope |
| registerAssetDefinition(catalog: AssetCatalog, definition: AssetDefinitionInput): AssetCatalog | same; duplicate rejects |
| updateAssetDefinition(catalog: AssetCatalog, input: AssetDefinitionInput): AssetCatalog | same; missing rejects, preserves position |
| removeAssetDefinition(catalog: AssetCatalog, assetId: string): AssetCatalog | same; no cascade |
| resolveAssetReference(catalog: AssetCatalog, input: AssetReferenceInput): AssetReferenceResolution | same; PROJECT_MISMATCH/TARGET_NOT_FOUND/KIND_MISMATCH/SUBRESOURCE_NOT_SUPPORTED |
| createAssetReference(input: AssetReferenceInput): AssetReference | editor asset-reference.ts/.d.ts; null expectation/subresource; no IO |
| createResourceLocator(input: ResourceLocator): ResourceLocator | editor asset-sources.ts/.d.ts; lexical project-relative only |
| describeResolvedVisualAsset(resolution: AssetReferenceResolution, mediaType?: string \| null): AssetVisualDescription | editor asset-visual.ts/.d.ts; described descriptor or unsupported reason |
| createDocumentEnvelope(input: DocumentEnvelopeInput): DocumentEnvelope | editor document-envelope.ts/.d.ts; portable capture, no owner validation |
| createDocumentSession(envelope: DocumentEnvelope, revertBaseline: DocumentEnvelope \| null, loadedEvidence?: DocumentLoadedEvidence): DocumentSession | editor document-session.ts/.d.ts; explicit close discard, trusted evidence |
| diagnoseDocument(text: string, context?: DocumentValidationContext): DocumentValidationResult | editor document-diagnostics.ts/.d.ts; owner asset, optional catalog dependency validation, exact kind/version |
| loadDocument(port: DocumentReadPort, locator: string, context?: DocumentValidationContext): Promise<DocumentLoadResult> | editor document-load.ts/.d.ts; strict validation before open clean session |
| saveDocument(session: DocumentSession, port: DocumentWritePort, locator: string, expected: DocumentWritePrecondition, context?: DocumentValidationContext): Promise<DocumentSaveResult> | editor document-save.ts/.d.ts; absent/revision/unknown preconditions, atomic host receipt |
| getProjectSessionSnapshot(session: ProjectSession): ProjectSessionSnapshot | editor project-session.ts/.d.ts; projectId/documentId/bindingId/locator/state/manifest/revisions/dirty |
| replaceProjectManifest(session: ProjectSession, manifest: ProjectManifest, expectedRevision: number): ProjectSessionSnapshot | same; stale revision rejects |
| resolveProjectLocator(binding: ProjectRootBinding \| null, projectId: string, locator: ResourceLocator): string | editor project-root-binding.ts/.d.ts; original issued root validation; no disk proof |
| trackProjectDocument(manifest: ProjectManifest, reference: ProjectDocumentReference): ProjectManifest | editor project-document-tracking.ts/.d.ts; ProjectDocumentReference identity/kind/version/locator/sceneId |
| updateProjectDocument(manifest: ProjectManifest, identity: DocumentIdentity, reference: ProjectDocumentReference): ProjectManifest | same; no rename |
| removeProjectDocument(manifest: ProjectManifest, identity: DocumentIdentity): ProjectManifest | same; explicit active selection policy |
| openProject(options: OpenProjectOptions): Promise<ProjectOpenResult> | editor project-open.ts/.d.ts; root/locator/optional expectedProjectId |
| saveProject(session: ProjectSession, expected: DocumentWritePrecondition): Promise<ProjectSaveResult> | editor project-save.ts/.d.ts; manifest only |
| prepareVisualResource(input: VisualResourceDescriptor): VisualResourcePreparation | runtime-render visual-resource.ts/.d.ts; metadata only, no decoded pixels |
| acquireVisualSource(descriptor: VisualResourceDescriptor, sourceIndex: number, provider: VisualSourceProvider, maxBytes: number): Promise<VisualSourceAcquisition> | runtime-render visual-source.ts/.d.ts; explicit provider scope/revision/byte bound |
| createVisualSourceLoad(descriptor: VisualResourceDescriptor, sourceIndex: number, provider: VisualSourceProvider, maxBytes: number): VisualSourceLoad | runtime-render visual-source-load.ts/.d.ts; start/copyBytes/release terminal lifetime |
| createVisualResourceCache(provider: VisualSourceProvider, inputLimits: ResourceCacheLimits): VisualResourceCache | runtime-render visual-resource-cache.ts/.d.ts; acquire(session,descriptor,sourceIndex,expectedRevision,limits,options): VisualResourceLease |
| createRenderVisualScene(session: RenderFrameSession): RenderVisualScene | runtime-render visual-scene.ts/.d.ts; Render owns membership/resource binding |
| renderVisualResourceDemo(session: RenderFrameSession, texture: RenderTexture, geometry?: AtlasFrameGeometry): RenderFrameReceipt | runtime-render visual-resource-demo.ts/.d.ts; optional existing real draw seam, not a custom renderer |

Asset owner diagnostics accepts complete AssetDefinition snapshot, checks content
project vs envelope, and resolves declared dependencies against optional catalog.
Absent catalog with dependencies stays not checked; do not call that strict valid.
There is no catalog codec or public ProjectSession root getter. Internal helpers
requireProjectRoot/requireOpenProjectSession are not root exports and are prohibited
as consumer shortcuts. Caller must explicitly supply original root capability.

UI source: editor/ui/src/main.tsx singleton MantineProvider/theme, app/App.tsx
EditorShell, components/panel/EditorPanel.tsx. ProjectManagerPanel owns actual local
root/session selection; no public React project provider exists. UI checks/build are
real package scripts: build = ui:check + tsc -b --force + ui:build; ui:build = UI
TypeScript noEmit + Vite. No new framework or public UI foundation API is proposed.
