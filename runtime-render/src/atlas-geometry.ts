import type { AtlasMetadata } from './atlas-metadata.js';
import { resolveAtlasFrame, type VisualFrameReference, type AtlasFrameResolution } from './atlas-frame.js';
import type { RenderFrameSession } from './frame-session.js';
import { getRenderTextureSnapshot, type RenderTexture, type RenderTextureSnapshot } from './render-texture.js';

/** Host-attested decoded dimensions and verified exporter layout; not an IO request. */
export interface AtlasPagePixels {
  readonly imageSourceId: string;
  readonly unit: 'image-pixel';
  readonly width: number;
  readonly height: number;
  readonly layout: 'texturepacker-unity-bottom-left';
}

export interface AtlasFrameGeometry {
  readonly reference: VisualFrameReference;
  readonly revision: symbol;
  readonly pageId: string;
  readonly imageSourceId: string;
  readonly pagePixels: { readonly unit: 'image-pixel'; readonly width: number; readonly height: number };
  /** Pixel edges, [x,x+width) by [y,y+height); no padding or texel-center inset. */
  readonly rectangle: { readonly unit: 'image-pixel'; readonly origin: 'top-left'; readonly bounds: 'half-open';
    readonly x: number; readonly y: number; readonly width: number; readonly height: number };
  /** v=0 is the first uploaded image row; matches current unflipped ImageBitmap upload. */
  readonly uv: { readonly unit: 'normalized-texture'; readonly origin: 'first-uploaded-row';
    readonly left: number; readonly top: number; readonly right: number; readonly bottom: number };
  readonly rotation: 'none';
  /** Absent in this format, not zero offsets or proof that source was untrimmed. */
  readonly trim: null;
  readonly sourceSize: null;
}

export type AtlasFrameGeometryResult =
  | { readonly status: 'resolved'; readonly geometry: AtlasFrameGeometry }
  | { readonly status: 'rejected'; readonly code:
    Extract<AtlasFrameResolution, { status: 'unresolved' }>['code']
    | 'UNSUPPORTED_LAYOUT' | 'INVALID_PAGE_PIXELS' | 'IMAGE_SOURCE_MISMATCH'
    | 'PAGE_DIMENSION_MISMATCH' | 'INVALID_FRAME_BOUNDS' | 'UNSUPPORTED_FRAME_GEOMETRY' };

const geometries = new WeakSet<AtlasFrameGeometry>();
const positive = (n: number): boolean => Number.isSafeInteger(n) && n > 0;

/** Pure interpretation of a canonical atlas snapshot; no decode, crop, upload or authored placement. */
export function resolveAtlasFrameGeometry(
  reference: VisualFrameReference, atlas: AtlasMetadata | null, expectedRevision: symbol, pixels: AtlasPagePixels,
): AtlasFrameGeometryResult {
  const fail = (code: Extract<AtlasFrameGeometryResult, { status: 'rejected' }>['code']): AtlasFrameGeometryResult =>
    Object.freeze({ status: 'rejected', code });
  const resolved = resolveAtlasFrame(reference, atlas, expectedRevision);
  if (resolved.status !== 'resolved') return fail(resolved.code);
  if (pixels.layout !== 'texturepacker-unity-bottom-left') return fail('UNSUPPORTED_LAYOUT');
  const { width, height, imageSourceId } = pixels;
  if (pixels.unit !== 'image-pixel' || !positive(width) || !positive(height)) return fail('INVALID_PAGE_PIXELS');
  const { frame, page } = resolved;
  if (page.coordinateConvention !== 'unity-tpsheet-40300-native') return fail('UNSUPPORTED_LAYOUT');
  if (imageSourceId !== page.imageSourceId) return fail('IMAGE_SOURCE_MISMATCH');
  if (!positive(page.width) || !positive(page.height) || width !== page.width || height !== page.height) {
    return fail('PAGE_DIMENSION_MISMATCH');
  }
  if (frame.rotation !== 'none' || frame.trim !== null) return fail('UNSUPPORTED_FRAME_GEOMETRY');
  const r = frame.rectangle;
  // Subtraction avoids accepting overflowing sums. Equality admits the final edge.
  if (!Number.isSafeInteger(r.x) || !Number.isSafeInteger(r.y) || r.x < 0 || r.y < 0
    || !positive(r.width) || !positive(r.height) || r.width > width || r.height > height
    || r.x > width - r.width || r.y > height - r.height) return fail('INVALID_FRAME_BOUNDS');
  const y = height - r.y - r.height;
  const geometry: AtlasFrameGeometry = Object.freeze({ reference: resolved.reference, revision: resolved.revision.id,
    pageId: page.pageId, imageSourceId, pagePixels: Object.freeze({ unit: 'image-pixel', width, height }),
    rectangle: Object.freeze({ unit: 'image-pixel', origin: 'top-left', bounds: 'half-open',
      x: r.x, y, width: r.width, height: r.height }),
    uv: Object.freeze({ unit: 'normalized-texture', origin: 'first-uploaded-row',
      left: r.x / width, top: y / height, right: (r.x + r.width) / width, bottom: (y + r.height) / height }),
    rotation: 'none', trim: null, sourceSize: null,
  });
  geometries.add(geometry);
  return Object.freeze({ status: 'resolved', geometry });
}

/** Borrowed subview. It acquires no lease and must not outlive its caller-owned texture. */
export interface AtlasTextureView {
  readonly geometry: AtlasFrameGeometry;
  readonly texture: RenderTexture;
  /** Observe before use; terminal texture state is never hidden by the geometry snapshot. */
  readonly getSnapshot: () => RenderTextureSnapshot;
}

/**
 * Associate an existing canonical texture with geometry. imageSourceId is an explicit
 * host attestation of which page it uploaded, not a content/revision verification.
 * Matching dimensions alone cannot prove image identity. Never uploads/crops/copies.
 */
export function createAtlasTextureView(
  session: RenderFrameSession, texture: RenderTexture, geometry: AtlasFrameGeometry, imageSourceId: string,
): AtlasTextureView {
  if (!geometries.has(geometry)) throw new TypeError('Expected canonical frame geometry');
  const snapshot = getRenderTextureSnapshot(session, texture);
  if (snapshot.state !== 'usable') throw new TypeError('Atlas texture is not usable');
  if (imageSourceId !== geometry.imageSourceId || snapshot.width !== geometry.pagePixels.width
    || snapshot.height !== geometry.pagePixels.height) throw new TypeError('Atlas texture page binding mismatch');
  return Object.freeze({ geometry, texture, getSnapshot: () => getRenderTextureSnapshot(session, texture) });
}
