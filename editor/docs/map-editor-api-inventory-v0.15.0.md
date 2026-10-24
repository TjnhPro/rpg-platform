# ME01 source/emitted API ledger

Audited source and dist declarations on 0d8c4ea. Editor root has 207 export names
after Phase14; no Map symbols yet. All listed APIs are actual root exports except
matchesSceneDocumentProfile (internal source only, inspect but never deep-import
from a consumer). Public diagnoseDocument is the compatible admission seam.

| Source/declaration module | Actual signature / responsibility |
| --- | --- |
| scene-definition | createSceneIdentity(SceneIdentityInput): SceneIdentity; createSceneDefinition(SceneDefinitionInput): SceneDefinition |
| scene-membership | createSceneMembership(SceneMembershipInput): SceneMembership; addSceneObject(membership, SceneObjectMembershipInput); replaceSceneObject(membership, objectId, replacement); updateSceneObjectPlacement(membership, objectId, SceneObjectPlacement or null); removeSceneObject; reorderSceneObjects |
| scene-object-definition | createSceneObjectDefinition({objectId,displayName?,classification?}); no map/gameplay semantics |
| coordinate-space | createCoordinateSpaceDefinition(CoordinateSpaceDefinition); exact reference/componentCount2/axes/origin/unit |
| orthogonal-grid | createOrthogonalGridDefinition(OrthogonalGridDefinition); exact space/orientation/origin/cellSize/indexing, no map dimensions |
| grid-conversion | describeGridConversion(grid,space): Render OrthogonalGridConversion |
| Render grid-conversion | gridCellToScenePosition(conversion, GridCell2D, center or start-corner): GridScenePosition2D; scenePositionToGridCell(conversion, GridScenePosition2D, floor): GridCell2D |
| document-envelope/codec | createDocumentEnvelope(input); serializeDocument(envelope); deserializeDocument(text); bounded portable capture rejects accessors/cycles/nonfinite/negative-zero |
| document-diagnostics | diagnoseDocument(text, DocumentValidationContext?): DocumentValidationResult; Scene binding requires owner scene, documentKind, contentSchemaVersion, catalog and resolveCoordinateSpace when references need them |
| document-session | createDocumentSession(envelope,revertBaseline,loadedEvidence?): DocumentSession; open/replaceContent/getSnapshot/prepareSave/completeSave/close(discard); low-level replacement requires caller validation |
| document-load | loadDocument(port,locator,context?): Promise<DocumentLoadResult>; strict-only open session, original rejected text preserved |
| document-save | saveDocument(session,port,locator,expected,context?): Promise<DocumentSaveResult>; genuine host atomic-publish/create-only or CAS; no automatic manifest save |
| document-scene-edit | replaceSceneDocumentObject(document,objectId,replacement,sceneContext): DocumentEnvelope; complete known-field replacement preserving permitted metadata |
| scene-preview | createScenePreviewBridge(RenderVisualScene,SceneIdentity,acquire): ScenePreviewBridge; sync(membership,catalog,policy), close; explicit layout/transform/order/visible/source revision/frame; borrowed scene |
| project-session/root/tracking | getProjectSessionSnapshot; resolveProjectLocator(root,projectId,locator); trackProjectDocument; getProjectDocument; setProjectActiveScene; replaceProjectManifest; no public root retrieval from session |
| asset-manager-project/selection | getAssetManagerProjectSnapshot(context) returns canonical catalog; getManagedAssetSelection returns project-bound ref, not definition copy |
| UI source only | EditorShell slots; EditorPanel; ProjectManagerWorkspace(active,panel); AssetBrowserWorkspace(context,panel); Viewport optional contentFactory uses unchanged viewport-host |

SceneMetadata storage boundary: document-scene-profile source permits metadata
only at content/scene/objects[i]/objects[i].definition. Scene canonical factories
do not preserve unknown extensions. document-diagnostics compares captured source
to factory-known fields with that allowed-slot exception. Asset refs and placement
spaces must validate; missing context gives NOT_CHECKED rather than strict success.
No edits to these canonical modules are authorized by this inventory.
