import { createDocumentEnvelope, type DocumentEnvelope, type DocumentContentRecord } from './document-envelope.js';
import { diagnoseDocument, type DocumentValidationContext } from './document-diagnostics.js';
import { serializeDocument } from './document-codec.js';
import { createSceneIdentity, type SceneIdentity } from './scene-definition.js';
import { createSceneMembership, type SceneMembership, type SceneMembershipInput } from './scene-membership.js';
import { createCoordinateSpaceDefinition, type CoordinateSpaceDefinition } from './coordinate-space.js';
import { createOrthogonalGridDefinition, type OrthogonalGridDefinition } from './orthogonal-grid.js';
import type { AssetCatalog } from './asset-catalog.js';

export interface MapLayerDefinition {
  readonly layerKey: string; readonly role: 'background' | 'tiles' | 'objects'; readonly visible: boolean;
}
export interface MapProfile {
  readonly schemaVersion: 1;
  readonly extentCells: { readonly width: number; readonly height: number };
  readonly space: CoordinateSpaceDefinition; readonly grid: OrthogonalGridDefinition;
  readonly layers: readonly MapLayerDefinition[];
}
export interface MapProfileSnapshot {
  readonly document: DocumentEnvelope; readonly identity: SceneIdentity;
  readonly membership: SceneMembership; readonly profile: MapProfile;
}
export type MapProfileReadResult = { readonly status: 'supported'; readonly snapshot: MapProfileSnapshot }
  | { readonly status: 'not-a-map' | 'unsupported' | 'invalid'; readonly path: string; readonly reason: string };

/** Map-specific classification is meaningful only after profile admission. */
export function validateMapLayerMembership(profile: MapProfile, membership: SceneMembership): void {
  for (const entry of membership.objects) {
    const role = entry.definition.classification === 'editor-map:tile' ? 'tiles'
      : entry.definition.classification === 'editor-map:background' ? 'background' : null;
    if (role && profile.layers.find(layer => layer.layerKey === entry.layerKey)?.role !== role)
      throw new TypeError('MAP_LAYER_ROLE_MISMATCH');
  }
}

export const mapExtentLimits = Object.freeze({ maxCount: 4096, maxCells: 1_048_576 });
/** Internal common admission for profile reads and public bounds operations. */
export function captureMapExtent(input: unknown): MapProfile['extentCells'] {
  mapRecord(input, ['width', 'height'], 'MAP_EXTENT');
  const width = input['width'], height = input['height'];
  if (typeof width !== 'number' || typeof height !== 'number' || !Number.isSafeInteger(width) || !Number.isSafeInteger(height)
    || width <= 0 || height <= 0 || width > mapExtentLimits.maxCount || height > mapExtentLimits.maxCount
    || width * height > mapExtentLimits.maxCells) throw new TypeError('MAP_EXTENT_LIMIT');
  return Object.freeze({ width, height });
}

/** Internal structural check on already captured portable data. */
export function mapRecord(value: unknown, keys: readonly string[], path: string): asserts value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)
    || (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null)
    || Reflect.ownKeys(value).length !== keys.length || keys.some(key => {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      return !descriptor?.enumerable || !('value' in descriptor);
    })) throw new TypeError(path);
}
/** Closed Map-owned profile; canonical capture rejects accessors before reading fields. */
export function createMapProfile(input: unknown, identityInput: SceneIdentity): MapProfile {
  const identity = createSceneIdentity(identityInput);
  const captured = createDocumentEnvelope({ schemaVersion: 1,
    identity: { projectId: identity.projectId, documentId: identity.sceneId }, documentKind: 'scene', contentSchemaVersion: 1, content: input }).content;
  mapRecord(captured, ['schemaVersion', 'extentCells', 'space', 'grid', 'layers'], 'editorMap');
  if (captured['schemaVersion'] !== 1) throw new TypeError('editorMap.schemaVersion');
  captureMapExtent(captured['extentCells']);
  const space = createCoordinateSpaceDefinition(captured['space'] as unknown as CoordinateSpaceDefinition);
  const grid = createOrthogonalGridDefinition(captured['grid'] as unknown as OrthogonalGridDefinition);
  if (space.reference.projectId !== identity.projectId || grid.space.projectId !== identity.projectId
    || grid.space.coordinateSpaceId !== space.reference.coordinateSpaceId) throw new TypeError('editorMap.space');
  const layers = captured['layers']; if (!Array.isArray(layers)) throw new TypeError('editorMap.layers');
  const seen = new Set<string>();
  for (const layer of layers) {
    mapRecord(layer, ['layerKey', 'role', 'visible'], 'editorMap.layers');
    if (typeof layer['layerKey'] !== 'string' || !layer['layerKey'] || /\s/u.test(layer['layerKey']) || seen.has(layer['layerKey'])
      || !['background', 'tiles', 'objects'].includes(layer['role'] as string) || typeof layer['visible'] !== 'boolean') throw new TypeError('editorMap.layers');
    seen.add(layer['layerKey']);
  }
  return captured as unknown as MapProfile;
}
function capturedProfile(document: DocumentEnvelope): { document: DocumentEnvelope; profile: MapProfile; identity: SceneIdentity } {
  const source = createDocumentEnvelope(document);
  const content = source.content as DocumentContentRecord;
  const scene = content?.['scene'] as DocumentContentRecord | undefined;
  const identity = createSceneIdentity(scene?.['identity'] as unknown as SceneIdentity);
  if (identity.projectId !== source.identity.projectId) throw new TypeError('DOCUMENT_PROJECT_MISMATCH');
  const metadata = scene?.['metadata'] as DocumentContentRecord | undefined;
  if (!metadata || !Object.hasOwn(metadata, 'editorMap')) throw new TypeError('NOT_A_MAP');
  const value = metadata['editorMap'] as DocumentContentRecord;
  if (value && typeof value === 'object' && value['schemaVersion'] !== 1) throw new TypeError('UNSUPPORTED_MAP_VERSION');
  return { document: source, identity, profile: createMapProfile(value, identity) };
}
/** Explicit Scene binding; no catalog fallback or filesystem authority. */
export function mapDocumentContext(document: DocumentEnvelope, catalog?: AssetCatalog): Extract<DocumentValidationContext, { owner: 'scene' }> {
  const { profile } = capturedProfile(document);
  return Object.freeze({ owner: 'scene', documentKind: 'scene', contentSchemaVersion: 1,
    ...(catalog ? { catalog } : {}), resolveCoordinateSpace: reference => reference.projectId === profile.space.reference.projectId
      && reference.coordinateSpaceId === profile.space.reference.coordinateSpaceId ? profile.space : undefined });
}
/** Ordinary/future/invalid data never becomes an editable Map or a repaired Scene. */
export function readMapProfile(document: DocumentEnvelope, catalog?: AssetCatalog): MapProfileReadResult {
  try {
    const captured = capturedProfile(document);
    const checked = diagnoseDocument(serializeDocument(captured.document), mapDocumentContext(captured.document, catalog));
    if (!checked.readEligibility.strict) return Object.freeze({ status: 'invalid', path: checked.diagnostics[0]?.path ?? 'document',
      reason: checked.diagnostics[0]?.code ?? 'SCENE_NOT_STRICT' });
    const membership = createSceneMembership(captured.document.content as unknown as SceneMembershipInput);
    validateMapLayerMembership(captured.profile, membership);
    return Object.freeze({ status: 'supported', snapshot: Object.freeze({ ...captured, membership }) });
  } catch (error) {
    if (!(error instanceof TypeError)) throw error;
    return Object.freeze({ status: error.message === 'NOT_A_MAP' ? 'not-a-map' : error.message === 'UNSUPPORTED_MAP_VERSION' ? 'unsupported' : 'invalid',
      path: 'document.content.scene.metadata.editorMap', reason: error.message });
  }
}
/** Internal checked projection, never a second authored store. */
export function requireMapProfile(document: DocumentEnvelope, catalog?: AssetCatalog): MapProfileSnapshot {
  const result = readMapProfile(document, catalog);
  if (result.status !== 'supported') throw new TypeError(`${result.status}:${result.reason}`);
  return result.snapshot;
}
/** Detached candidate retaining every other permitted metadata slot. No session edit/IO. */
export function replaceMapProfile(document: DocumentEnvelope, profileInput: unknown, catalog?: AssetCatalog): DocumentEnvelope {
  const source = requireMapProfile(document, catalog);
  const profile = createMapProfile(profileInput, source.identity);
  const content = source.document.content as DocumentContentRecord, scene = content['scene'] as DocumentContentRecord;
  const candidate = createDocumentEnvelope({ ...source.document, content: { ...content,
    scene: { ...scene, metadata: { ...(scene['metadata'] as DocumentContentRecord), editorMap: profile } } } });
  return requireMapProfile(candidate, catalog).document;
}
