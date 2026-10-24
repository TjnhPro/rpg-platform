# VI01 — Visual Inspector design freeze

Baseline20014d1c415f6ef50755b68d2c4eba1fde67cfd0, main after Phase15 merge.
Editor is the only production owner. Design only at this checkpoint; no API/code.
Branch feat/visual-properties-inspector-v0.16. Thirteen ordered version commits;
continue without routine review; no merge/release/next phase.

| Field | Canonical authored owner | Preview mapping |
| --- | --- | --- |
| position | Scene entry placement, optional/null distinct | spatial request from existing Scene adapter |
| layer | Scene entry layerKey; referent from same Map profile | Phase15 describeMapLayers order/visibility |
| visual binding | Scene entry assetReference, explicit null clears | canonical resolver, ScenePreviewBridge resource binding |
| direction | editorVisual.orientation | Render VisualOrientation2D; no rotation/frame change |
| scale | editorVisual.scale | Render local.scale; dimensionless, zero/reflection allowed |
| anchor/pivot/localOffset | editorVisual.anchor | Render VisualAnchor2D, local numeric plane units |
| visible | editorVisual.visible | object intent only; layer/effective visibility stay separate |

## Exact v1 contract

Slot: content.objects[i].metadata.editorVisual, legitimate membership-entry metadata
per matchesSceneDocumentProfile. Profile is `{schemaVersion:1, orientation?,scale?,
anchor?,visible?}` with only these exact enumerable data keys. Optional means absent;
explicit null/undefined rejects, except profile itself absent => absent read status.
No field defaults injected on read. Present false stays false. Nested values:

- orientation:exact VisualOrientation2D `{axes:{x:right|left,y:up|down},zeroAxis:
  positive-x,positiveRotation:toward-positive-y,angleRadians}`; canonical[0,2π),
  reject2π/out-of-range rather than wrap; axes must match supplied placement space.
- scale:exact finite `{x,y}` admitted by createPlanarTransform2D with explicit
  temporary identity translation/rotation; only scale persisted. Zero and negatives
  accepted. Document portability rejects negative zero, accessors, cycles/nonfinite.
- anchor:exact VisualAnchor2D `{unit,anchor:{x,y},pivot:{x,y},localOffset:{x,y}}`;
  createVisualAnchor2D, exact supplied space unit. Local coordinates, not bitmap
  fractions; no texture-size/viewport inference. Placement remains independent.
- visible:boolean only. No effective visibility, animation, local rotation or
  translation, position, layer, asset ref, resource handle, session or selection.

Unknown fields/version reject write/preview; diagnostic inspect-only. Future
extension requires a new explicitly supported profile version, no silent migration.
Other metadata keys at content/Scene/entry/definition survive untouched. Factories
strip metadata, so never overwrite raw Document with a membership projection.
Generic Scene strict validation treats extensions as opaque; Inspector separately
validates owned profiles before edit/save/preview, never claims generic validation
understands editorVisual. Captures use bounded existing portable codec/factories,
not raw arbitrary JSON patching. Proxy host traps/exceptions are not authority.

## Actual source/public API inventory

Audited current source and emitted roots:244 Editor named exports; Phase14 manager
and Phase15 Map source really exist. Document Scene profile permits metadata at
content,Scene,entry,definition. replaceSceneDocumentObject(document,id,knownEntry,
SceneContext) preserves all those slots but cannot edit metadata. DocumentSession
open/replaceContent/getSnapshot/close owns revision/dirty; loadDocument/saveDocument
own strict admission, storage observations/tickets/conflicts/quarantine. mapDocumentContext
supplies exact space resolver; openMap/saveMap use real tracked Scene/root/catalog.
Project root is an issued capability, not a path inferred from identity.

Scene:getSceneObject/createSceneMembership/replaceSceneObject,
updateSceneObjectSpatialPlacement; Asset:createAssetReference/resolveAssetReference/
describeResolvedVisualAsset; Map:readMapProfile/describeMapLayers; Render public:
createVisualOrientation2D/createVisualAnchor2D/createPlanarTransform2D/
resolveVisualAlignment2D; ScenePreviewBridge.sync accepts explicit presentation
policy and owns its instances/pending lease rights, borrowed cache/scene stay host-owned.
No Render API change or L1/L2 API is needed; foundations remain pinned/read-only.

## Integration and safety decisions

Selection is a nonportable issued handle for exact ProjectSession/root/DocumentSession,
projectId/sceneId/objectId/documentId, current revision and selection generation.
Select/clear/reselect advances transient generation. Context/session/project/active
Scene replacement, missing object, failed IO or unsupported profile invalidates use;
no index lookup or global singleton. Hidden objects remain list-selectable.

VI04–VI10 produce known Scene entry candidates or immutable profile values only.
VI11 alone composes a strict validated detached envelope: replace known Scene fields
through replaceSceneDocumentObject, merge only editorVisual into the original entry
metadata, validate complete owned profiles plus generic Scene/Map context, then one
guarded DocumentSession.replaceContent. Check expectedRevision/selection again before
adoption; rejection changes nothing. Other entries/order/opaque metadata remain exact.
No save acknowledgement, dirty counter or second Document owner is introduced.

Preview mapper overlays present authored values onto explicit host policy; absent
profile values stay absent on disk. Host supplies local translation/rotation/layout,
projection/default orientation/scale/anchor/visibility/revision/frame. Facing never
changes local rotation or animation frame. Layers use Phase15 requests; Render
owns effective layer/viewport state. UI edits are transient drafts until Apply;
input callbacks never call GPU transform setters or implement gameplay math.

MVP uses an existing ordinary visual object player-001 in a real Map Scene main,
objects-role layer, free placement (not a map tile). This avoids violating Phase15
canonical tile/background policies. Inspector opens its own canonical Document
session through existing tracked Map IO; separate authoring sessions must retain
their own genuine storage preconditions. Initial save supported by finite create-only
host; existing-file updates are blocked, never advertised CAS. Save Scene is separate
from Save Project/Assets. No copy of the Phase13 filesystem host.

## Scope/dependency/evidence matrix

| Version | Allowed capability/path | Gate/evidence |
| --- | --- | --- |
|0| Editor docs + Harness pointer/checkpoint only | source design audit |
|1| visual-properties-profile.ts, additive root | immutable valid/invalid profile reads |
|2| visual-inspector-context.ts | real Project/root/Scene/session selection stale guards |
|3| visual-position.ts | canonical position, invalid space/nonfinite |
|4| visual-direction.ts | Render half-open radians; no frame/rotation |
|5| visual-layer.ts | actual Phase15 layer referents, unknown key rejection |
|6| visual-scale.ts | zero/reflection/finite semantics |
|7| visual-anchor.ts | unit/alignment separation |
|8| visual-visibility.ts | false survives, no membership deletion |
|9| visual-binding.ts | Phase14 canonical catalog, explicit clear/unsupported |
|10| visual-document-edit.ts / visual-preview.ts | single guarded adoption, strict roundtrip/owned profile gates |
|11| features/visual-inspector/**, App slot wiring, visual-inspector manual tooling | minimal Mantine UI, real initial file save/reopen |
|12| closure docs/Harness only |13 commits, root/export/CI/scope audit |

Every version may add narrow visual-inspector docs/checkpoint, additive index exports
when needed, genuine check/scope/Editor-with-consumers build. No generic document,
Asset/Project/Map source change, Theme/Shell/checker/TS/dependency/other-project delta.
UI uses existing EditorShell right Inspector slot, EditorPanel and Mantine tokens;
Controller mounted above responsive panels. Preview uses existing Viewport and
Render APIs. Phase14/15 dependencies READY on actual baseline; no missing API found
at design checkpoint. Missing genuine upstream seams later must stop with evidence.
No generated tests/screenshots/Playwright. Browser unavailable must remain UI_NOT_VERIFIED.
