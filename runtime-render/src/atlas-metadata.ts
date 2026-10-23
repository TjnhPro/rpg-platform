import type { VisualSourceLoad } from './visual-source-load.js';

/** Caller-selected Render-local ID for an exact descriptor source, not an Asset ID. */
export interface AtlasSourceBinding {
  readonly sourceId: string;
  readonly sourceIndex: number;
}

/** One verified single-page sheet; many sheets may compose one atlas. */
export interface UnityAtlasSheet {
  readonly pageId: string;
  readonly metadataSourceId: string;
  readonly imageSourceId: string;
  /** Exact header label expected by the host. Never resolved into an IO path. */
  readonly textureReference: string;
  readonly metadata: VisualSourceLoad;
}

export interface AtlasMetadataPage {
  readonly pageId: string;
  readonly metadataSourceId: string;
  readonly imageSourceId: string;
  readonly width: number;
  readonly height: number;
  /** Preserve the source convention until verified geometry conversion is requested. */
  readonly coordinateConvention: 'unity-tpsheet-40300-native';
}

export interface AtlasMetadataFrame {
  readonly key: string;
  readonly pageId: string;
  readonly rectangle: { readonly x: number; readonly y: number; readonly width: number; readonly height: number };
  readonly rotation: 'none';
  /** Null means unavailable, never an assertion that the original image was untrimmed. */
  readonly trim: null;
  /** Numeric source coordinates only; not Render alignment/animation/gameplay. */
  readonly sourcePivot: { readonly x: number; readonly y: number };
}

/** Detached immutable description; no bytes, providers, GPU handles or authored catalog. */
export interface AtlasMetadata {
  readonly format: 'unity-tpsheet-40300-rect';
  readonly identity: { readonly projectId: string; readonly resourceId: string };
  readonly sources: readonly {
    readonly sourceId: string;
    readonly sourceIndex: number;
    readonly role: string;
    readonly locator: { readonly type: 'project-relative'; readonly path: string };
  }[];
  readonly pages: readonly AtlasMetadataPage[];
  readonly frames: readonly AtlasMetadataFrame[];
}

export type AtlasMetadataResult =
  | { readonly status: 'parsed'; readonly atlas: AtlasMetadata }
  | { readonly status: 'rejected'; readonly code:
    'INVALID_BINDING' | 'DUPLICATE_PAGE_ID' | 'DUPLICATE_FRAME_KEY' | 'SOURCE_NOT_ACQUIRED'
    | 'SOURCE_MISMATCH' | 'LIMIT_EXCEEDED' | 'INVALID_ENCODING' | 'INVALID_HEADER'
    | 'UNSUPPORTED_FORMAT' | 'INVALID_FRAME' | 'TEXTURE_REFERENCE_MISMATCH';
    readonly pageId: string | null; readonly line: number | null };

/** Package-private normalized capture, independent of source grammar. */
export function captureAtlasMetadata(
  identity: AtlasMetadata['identity'], sources: AtlasMetadata['sources'],
  pages: readonly AtlasMetadataPage[], frames: readonly AtlasMetadataFrame[],
): AtlasMetadata {
  const pageIds = new Set<string>();
  const sourceIds = new Map(sources.map(source => [source.sourceId, source]));
  for (const page of pages) {
    if (pageIds.has(page.pageId) || sourceIds.get(page.imageSourceId)?.role !== 'image'
      || sourceIds.get(page.metadataSourceId)?.role !== 'atlas-metadata'
      || !Number.isSafeInteger(page.width) || !Number.isSafeInteger(page.height)
      || page.width < 1 || page.height < 1) throw new TypeError('Invalid normalized atlas page');
    pageIds.add(page.pageId);
  }
  const keys = new Set<string>();
  for (const frame of frames) {
    if (!pageIds.has(frame.pageId) || keys.has(frame.key)) throw new TypeError('Invalid normalized frame reference');
    keys.add(frame.key);
  }
  return Object.freeze({ format: 'unity-tpsheet-40300-rect', identity: Object.freeze({ ...identity }),
    sources: Object.freeze(sources.map(source => Object.freeze({ ...source, locator: Object.freeze({ ...source.locator }) }))),
    pages: Object.freeze(pages.map(page => Object.freeze({ ...page }))),
    frames: Object.freeze(frames.map(frame => Object.freeze({ ...frame,
      rectangle: Object.freeze({ ...frame.rectangle }), sourcePivot: Object.freeze({ ...frame.sourcePivot }) }))),
  });
}
