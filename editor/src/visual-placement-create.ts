import { addSceneObject } from './scene-membership.js';
import { createAssetReference, type AssetReferenceInput } from './asset-reference.js';
import { resolveAssetReference, type AssetCatalog } from './asset-catalog.js';
import { describeResolvedVisualAsset } from './asset-visual.js';
import { prepareVisualPlacementIdentity } from './visual-placement-identity.js';
import { resolveVisualPlacementPosition, type VisualPlacementPosition } from './visual-placement-position.js';
import { createVisualPropertiesProfile, type VisualPropertiesProfile } from './visual-properties-profile.js';
import { validateVisualSceneDocument } from './visual-document-edit.js';
import { serializeDocument, deserializeDocument } from './document-codec.js';
import type { DocumentEnvelope } from './document-envelope.js';
import type { SceneIdentity } from './scene-definition.js';
import type { SceneObjectDefinitionInput } from './scene-object-definition.js';

export interface PlaceVisualObjectRequest {
  readonly scene: SceneIdentity; readonly definition: SceneObjectDefinitionInput;
  readonly reference: AssetReferenceInput; readonly layerKey: string;
  readonly position: VisualPlacementPosition; readonly visual?: VisualPropertiesProfile;
}
/** Pure candidate only. Optional visual profile is not a second membership store. */
export function placeVisualObject(document: DocumentEnvelope, catalog: AssetCatalog, input: PlaceVisualObjectRequest) {
  const decoded = deserializeDocument(serializeDocument({ ...document, content: input } as unknown as DocumentEnvelope));
  if (decoded.status !== 'decoded') throw new TypeError('PLACEMENT_CAPTURE');
  const request = decoded.document.content as unknown as PlaceVisualObjectRequest;
  if (!request || Object.keys(request).some(key => !['scene', 'definition', 'reference', 'layerKey', 'position', 'visual'].includes(key)))
    throw new TypeError('PLACEMENT_FIELDS');
  const source = validateVisualSceneDocument(document, catalog);
  const definition = prepareVisualPlacementIdentity(source.membership, request.scene, request.definition);
  if (!definition.classification || definition.classification.startsWith('editor-map:')) throw new TypeError('PLACEMENT_CLASSIFICATION_RESERVED');
  if (source.profile.layers.find(layer => layer.layerKey === request.layerKey)?.role !== 'objects') throw new TypeError('PLACEMENT_OBJECT_LAYER_REQUIRED');
  const reference = createAssetReference(request.reference);
  if (reference.projectId !== source.identity.projectId) throw new TypeError('PLACEMENT_ASSET_PROJECT_MISMATCH');
  const visualAsset = describeResolvedVisualAsset(resolveAssetReference(catalog, reference), 'image/png');
  if (visualAsset.status !== 'described') throw new TypeError(`UNSUPPORTED_PLACEMENT_VISUAL:${visualAsset.reason}`);
  const position = resolveVisualPlacementPosition(document, catalog, request.position);
  const visual = Object.hasOwn(request, 'visual') ? createVisualPropertiesProfile(request.visual, source.profile.space) : null;
  const membership = addSceneObject(source.membership, { definition, assetReference: reference, layerKey: request.layerKey,
    placement: { coordinateSpaceId: position.space.coordinateSpaceId, point: position.point } });
  return Object.freeze({ membership, objectId: definition.objectId, visual });
}
