# ME01 — Map architecture decisions

Baseline: `0d8c4ea8e63ec284259ce05e2619010199f545e9`, main after Phase14 merge.
Owner Editor. This checkpoint changes documentation only; external L1/L2 and
the four other projects stay read-only. No production API or UI is added.

## One authored representation

One Map is one existing SceneIdentity (projectId, sceneId) in one Scene Document.
DocumentIdentity.documentId is a storage-independent logical key, not another
map identity. No mapId, tile array, map registry, codec or Engine authority.
Scene membership owns background/tile entries and their assetReference, layerKey
and placement. MapProfileSnapshot will be an immutable projection of an envelope.

The sole extension is content.scene.metadata.editorMap:
`{schemaVersion:1, extentCells:{width,height}, space, grid, layers}`.
space is the complete canonical CoordinateSpaceDefinition; grid is the canonical
OrthogonalGridDefinition referencing that exact project/space. layers is an
ordered array of `{layerKey,role,visible}` with unique exact keys and roles
background/tiles/objects. Ordered sequence alone defines authored layer order.
Controlled profile fields are closed; unknown profile/version is unsupported,
not normalized. Unknown permitted metadata outside editorMap remains intact.

Phase5 matchesSceneDocumentProfile permits opaque metadata records on membership,
Scene, entry and definition. Factories strip these extension slots: never serialize
a reconstructed SceneMembership over the original Document. Edits must merge
only their controlled fields into the captured source, retain all other metadata,
and diagnose the entire detached candidate before session replacement.

Explicit classifications are `editor-map:background` and `editor-map:tile` inside
a supported Map only. Background optional/single; tiles sparse, one per layer/cell.
Non-map classifications survive unchanged. Both use resolved whole-image assets
in the same project, background/tiles role respectively, and canonical placement.
Background placement is the declared grid origin; its presentation extent is
derived from cell counts and cell size. Render sprite layout accepts explicit
width/height in declared units, but this source capability is not pixel proof.
Tile placement is cell center; inverse floor and exact forward-center agreement
derive occupancy. Off-center tiles diagnose, never snap. No duplicate row/column
is persisted. Rebase/remap of occupied maps is deferred.

Counts are positive safe integers. ME03 admission policy: each count <=4096 and
product <=1,048,576; sparse objects only. ME02 captures safe positive counts;
ME03 adds operational quotas/bounds. Cell domain is zero-based half-open. Axis,
unit, origin, cell size and indexing signs are always explicit. The MVP caller
chooses 8x6, axes right/down, unit scene-unit, origin(0,0), size32x32,
positive-x/positive-y and negativeIndices reject. This is an example, not defaults.
Render alone converts cell(3,2) center to (112,80) and back; camera is independent.

## Collision decisions and dependency staging

| Collision | Decision / evidence |
| --- | --- |
| Map versus Scene | SceneIdentity and SceneMembership win; fabricated mapId is rejected as an extra controlled field |
| Grid versus Render math | Editor captures grid/space/bounds; describeGridConversion delegates arithmetic to Render gridCellToScenePosition / scenePositionToGridCell |
| Save Map versus Save Project | Phase5 saves only the Scene Document; Phase13 tracking/active scene and manifest save remain explicit separate transitions |
| Asset versus resource | Phase2/14 catalog resolves logical refs; host root authorizes bytes; Render owns decode/cache/GPU and preview |

ME02 profile can use supported Scene metadata without canonical schema changes.
ME03 bounds, ME04 grid, ME05 layers remain pure. ME06/07 consume real Phase2/14
catalogs. ME08–10 consume real Phase13 ProjectSession/root/tracking and Phase5
ports. ME11 uses current Mantine Shell/Panel, stable ProjectManagerWorkspace and
AssetBrowserWorkspace capabilities; inspect exact seams before changing UI.
ME12 needs real host authorization for map Scene path and two PNGs; Phase14 finite
host only authorizes project.json/player.asset.json/item.asset.json and one PNG,
so it cannot be misrepresented as already supporting map storage/two-image IO.
ME13 is audit only. Existing Render ScenePreviewBridge, resource/cache/lease and
camera/viewport roots are available; no renderer fallback is permitted.

## Design acceptance

On paper the explicit 8x6 sample is compatible with the opaque Scene metadata
slot and canonical grid/space exact shapes. An added mapId violates the closed
profile; wrong project/space and future version must reject. No runtime Map API
has run at this design checkpoint. BUILD_PASS is not IO/UI/VISUAL verification.
Each version gets one commit and check/scope/Editor-with-consumers build. At MVP
and closure run forced root build. Finite manual public API/file observations only;
no generated tests/Playwright. Actual pixels/controls require manual observation;
unexecuted browser remains NOT_VERIFIED. Continue sequentially without routine
review; stop on actual canonical-owner/public-contract/security/scope blockers.
