# PM01 source and declaration inventory

Inspected baseline `592e4d0b0352614ae151ec7e8495c7a2fbd31abf` (Phase12 merged).
Source and emitted declarations under editor/src and editor/dist agree after the
real Editor build. No Project API or project Document owner exists at this baseline.

| Actual source / declaration | Contract reused |
| --- | --- |
| document-envelope.ts / .d.ts | DocumentIdentity(projectId,documentId), createDocumentIdentity; createDocumentEnvelope(input), replaceDocumentContent(envelope,unknown); schema 1 portable immutable capture |
| document-codec.ts / .d.ts | serializeDocument(DocumentEnvelope):string; deserializeDocument(string):DocumentDecodeResult. Duplicate keys reject; max 1,048,576 UTF16 units, depth 64, 100000 values |
| document-diagnostics.ts / .d.ts | diagnoseDocument(text,context?):DocumentValidationResult. Context exact kind/version plus scene/asset/coordinate-space/text owner; no project. Strict valid vs inspect, write NOT_ESTABLISHED, fileExistence NOT_CHECKED |
| document-load.ts / .d.ts | DocumentReadPort.read(locator:string):Promise<DocumentReadResult>; loadDocument(port,locator,context?):Promise<DocumentLoadResult>. One read; strict valid creates open clean session, otherwise preserved diagnostics/text |
| document-save.ts / .d.ts | saveDocument(session,port,locator,expected,context?):Promise<DocumentSaveResult>. Atomic publication plus create-only/CAS; unknown expected blocked; no replacement fallback |
| document-session.ts / .d.ts | createDocumentSession(envelope,revertBaseline,loadedEvidence?):DocumentSession; created/open/closed, snapshots, replaceContent, explicit revert, ticket-bound completeSave, close(discard). New starts dirty; only trusted load/commit evidence establishes saved state |
| asset-identity.ts / .d.ts | createAssetIdentity: exact logical projectId+assetId; no folder identity |
| asset-sources.ts / .d.ts | createResourceLocator(ResourceLocator):ResourceLocator. Literal project-relative only; no traversal, backslash, drive/URL, dot/empty segments. No disk containment proof |
| scene-definition.ts / .d.ts | createSceneIdentity(projectId+sceneId), createSceneDefinition; independent of documentId |
| src/index.ts / dist/index.d.ts | Canonical Editor package root, existing exports retained; no private cross-project imports needed |

Read/commit storage observations are host nullable identity/revision tokens, not
Document IDs/generations. Save result distinguishes blocked, validation-diagnostics,
conflicted, failed, uncertain and committed; cleanup never rewrites primary outcome.
Document content is portable generic data, so Project validation must be an additive
owner in diagnostics, not inferred from a successful envelope factory call.

Phase12 exists: ui/src/main.tsx imports Mantine CSS and installs one StrictMode /
MantineProvider with the singleton theme; fixed nonpersistent dark scheme. Actual
App is ui/src/app/App.tsx; EditorShell, EditorPanel, Viewport and ComponentCatalog
already exist. Viewport uses existing host seam, not a new root export. ui:check
enforces EC01–07. Three authored CSS modules belong to layout/panel/viewport.
React 19.3.1, Mantine 9.7.3, Vite 8.3.5 are already installed/pinned in Editor.

Actual Editor build: `npm run ui:check && tsc -b --force && npm run ui:build`;
ui:build is TypeScript noEmit then Vite. UI uses its separate bundler config and
dist. It is not bootstrapped by Project Manager. Existing Vite >500kB chunk warning
and Node DEP0190 harness warning do not prevent build. No dependency additions.

Baseline check/scope/verify --projects editor --with-consumers exited 0.
Architecture inspected 193 JS/TS files, UI checker 9 sources/3 stylesheets. Scope
includes pre-existing untracked .mcp.json, excluded from this work/commits.
BUILD_PASS is compilation only; IO_NOT_VERIFIED / UI_NOT_VERIFIED for Project
Manager. No Project behavior exists yet. Existing Phase12 visual claims are not
repeated as new evidence. No automated tests or browser scenarios were run.
