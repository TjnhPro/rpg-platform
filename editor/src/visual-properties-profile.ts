import { createVisualOrientation2D, createVisualAnchor2D, createPlanarTransform2D,
  type VisualOrientation2D, type VisualAnchor2D } from '@rpg-platform/runtime-render';
import { createDocumentEnvelope, type DocumentEnvelope, type DocumentContentRecord } from './document-envelope.js';
import { serializeDocument, deserializeDocument } from './document-codec.js';
import type { CoordinateSpaceDefinition } from './coordinate-space.js';

/** Only additional presentation intent; Scene retains placement/layer/reference. */
export interface VisualPropertiesProfile {
  readonly schemaVersion: 1;
  readonly orientation?: VisualOrientation2D;
  readonly scale?: Readonly<{ x: number; y: number }>;
  readonly anchor?: VisualAnchor2D;
  readonly visible?: boolean;
}
export type VisualProfileRead =
  | Readonly<{ status: 'absent' }>
  | Readonly<{ status: 'supported'; profile: VisualPropertiesProfile }>
  | Readonly<{ status: 'unsupported'; reason: string }>;

/** Codec bounds portable capture BEFORE Render factories can read any fields. */
export function createVisualPropertiesProfile(input: unknown, space?: CoordinateSpaceDefinition): VisualPropertiesProfile {
  // The codec must bound the raw graph before the recursive envelope detacher.
  const envelope = { schemaVersion: 1,
    identity: { projectId: 'visual', documentId: 'capture' }, documentKind: 'visual', contentSchemaVersion: 1, content: input } as DocumentEnvelope;
  const decoded = deserializeDocument(serializeDocument(envelope));
  if (decoded.status !== 'decoded') throw new TypeError('Visual profile capture failed');
  const value = decoded.document.content;
  if (value === null || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('Visual profile must be a record');
  const data = value as DocumentContentRecord;
  if (data['schemaVersion'] !== 1) throw new TypeError('Unsupported editorVisual schemaVersion');
  if (Object.keys(data).some(key => !['schemaVersion', 'orientation', 'scale', 'anchor', 'visible'].includes(key))) {
    throw new TypeError('Unknown editorVisual field');
  }
  const orientation = Object.hasOwn(data, 'orientation') ? createVisualOrientation2D(data['orientation'] as unknown as VisualOrientation2D) : undefined;
  const anchor = Object.hasOwn(data, 'anchor') ? createVisualAnchor2D(data['anchor'] as unknown as VisualAnchor2D) : undefined;
  const scale = Object.hasOwn(data, 'scale') ? createPlanarTransform2D({ translation: { x: 0, y: 0 }, rotationRadians: 0,
    scale: data['scale'] as unknown as { x: number; y: number } }).scale : undefined;
  if (Object.hasOwn(data, 'visible') && typeof data['visible'] !== 'boolean') throw new TypeError('Visual visible must be boolean');
  if (space && orientation && (orientation.axes.x !== space.axes.x || orientation.axes.y !== space.axes.y)) throw new TypeError('Visual orientation axes mismatch');
  if (space && anchor && anchor.unit !== space.unit) throw new TypeError('Visual anchor unit mismatch');
  return Object.freeze({ schemaVersion: 1, ...(orientation ? { orientation } : {}), ...(scale ? { scale } : {}),
    ...(anchor ? { anchor } : {}), ...(Object.hasOwn(data, 'visible') ? { visible: data['visible'] as boolean } : {}) });
}

/** Read the exact metadata slot; no defaults, field migration or source writes. */
export function readVisualPropertiesProfile(document: DocumentEnvelope, objectId: string, space?: CoordinateSpaceDefinition): VisualProfileRead {
  const captured = createDocumentEnvelope(document);
  const content = captured.content as DocumentContentRecord;
  const entries = content?.['objects'];
  if (!Array.isArray(entries)) return Object.freeze({ status: 'unsupported', reason: 'Scene objects unavailable' });
  const entry = (entries as readonly DocumentContentRecord[]).find(item =>
    (item['definition'] as DocumentContentRecord)?.['objectId'] === objectId);
  if (!entry) return Object.freeze({ status: 'unsupported', reason: 'Scene object missing' });
  const metadata = entry['metadata'] as DocumentContentRecord | undefined;
  if (!metadata || !Object.hasOwn(metadata, 'editorVisual')) return Object.freeze({ status: 'absent' });
  try { return Object.freeze({ status: 'supported', profile: createVisualPropertiesProfile(metadata['editorVisual'], space) }); }
  catch (error) {
    if (!(error instanceof TypeError)) throw error;
    return Object.freeze({ status: 'unsupported', reason: error.message });
  }
}
