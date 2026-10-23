import { getAtlasMetadataRevision, type AtlasMetadata, type AtlasMetadataRevision,
  type AtlasMetadataFrame, type AtlasMetadataPage } from './atlas-metadata.js';

/** Logical resource identity and exact opaque address; never an allocation/sequence. */
export interface VisualFrameReference {
  readonly projectId: string;
  readonly resourceId: string;
  readonly subresourceId: string | null;
}

export type AtlasFrameResolution =
  | { readonly status: 'resolved'; readonly stage: 'frame'; readonly reference: VisualFrameReference;
    readonly revision: AtlasMetadataRevision; readonly page: AtlasMetadataPage; readonly frame: AtlasMetadataFrame;
    readonly imageSource: AtlasMetadata['sources'][number] }
  | { readonly status: 'unresolved'; readonly stage: 'frame'; readonly reference: VisualFrameReference;
    readonly code: 'ATLAS_NOT_AVAILABLE' | 'ATLAS_NOT_SUPPORTED' | 'ATLAS_REVISION_MISMATCH'
    | 'RESOURCE_MISMATCH' | 'SUBRESOURCE_NOT_SPECIFIED' | 'FRAME_NOT_FOUND' | 'AMBIGUOUS_FRAME' };

/** Closed portable request, preserving nonblank authored addresses verbatim. */
export function createVisualFrameReference(input: VisualFrameReference): VisualFrameReference {
  if (typeof input !== 'object' || input === null || Array.isArray(input)
    || (Object.getPrototypeOf(input) !== Object.prototype && Object.getPrototypeOf(input) !== null)
    || Reflect.ownKeys(input).length !== 3) throw new TypeError('Frame reference must be a closed plain record');
  const data: Record<string, unknown> = {};
  for (const key of ['projectId', 'resourceId', 'subresourceId']) {
    const item = Object.getOwnPropertyDescriptor(input, key);
    if (!item?.enumerable || !('value' in item)) throw new TypeError('Frame reference fields must be data');
    data[key] = item.value;
  }
  const { projectId, resourceId, subresourceId } = data;
  if (typeof projectId !== 'string' || projectId.length === 0 || /\s/u.test(projectId)
    || typeof resourceId !== 'string' || resourceId.length === 0 || /\s/u.test(resourceId)
    || (subresourceId !== null && (typeof subresourceId !== 'string' || subresourceId.trim().length === 0))) {
    throw new TypeError('Explicit resource identity and null or nonblank opaque subresourceId required');
  }
  return Object.freeze({ projectId, resourceId, subresourceId });
}

/**
 * Exact asset-wide key lookup in one explicit parsed snapshot. No IO or memoization.
 * Host supplies its current revision token; an old atlas/new token never resolves.
 * Matching old atlas/old token deliberately observes history, not external freshness.
 */
export function resolveAtlasFrame(
  input: VisualFrameReference, atlas: AtlasMetadata | null, expectedRevision: symbol,
): AtlasFrameResolution {
  const reference = createVisualFrameReference(input);
  if (typeof expectedRevision !== 'symbol') throw new TypeError('Explicit current atlas revision token required');
  type Code = Extract<AtlasFrameResolution, { status: 'unresolved' }>['code'];
  const fail = (code: Code): AtlasFrameResolution => Object.freeze({ status: 'unresolved', stage: 'frame', reference, code });
  if (atlas === null) return fail('ATLAS_NOT_AVAILABLE');
  const revision = getAtlasMetadataRevision(atlas);
  if (revision === null || atlas.format !== 'unity-tpsheet-40300-rect') return fail('ATLAS_NOT_SUPPORTED');
  if (revision.id !== expectedRevision) return fail('ATLAS_REVISION_MISMATCH');
  if (reference.projectId !== atlas.identity.projectId || reference.resourceId !== atlas.identity.resourceId) return fail('RESOURCE_MISMATCH');
  if (reference.subresourceId === null) return fail('SUBRESOURCE_NOT_SPECIFIED');
  // Current format enforces global key uniqueness. Never choose first on ambiguity.
  const matches = atlas.frames.filter(frame => frame.key === reference.subresourceId);
  if (matches.length === 0) return fail('FRAME_NOT_FOUND');
  if (matches.length !== 1) return fail('AMBIGUOUS_FRAME');
  const frame = matches[0]!;
  const page = atlas.pages.find(candidate => candidate.pageId === frame.pageId);
  const imageSource = atlas.sources.find(source => source.sourceId === page?.imageSourceId && source.role === 'image');
  if (page === undefined || imageSource === undefined) return fail('ATLAS_NOT_SUPPORTED');
  return Object.freeze({ status: 'resolved', stage: 'frame', reference, revision,
    page: Object.freeze({ ...page }), frame: Object.freeze({ ...frame,
      rectangle: Object.freeze({ ...frame.rectangle }), sourcePivot: Object.freeze({ ...frame.sourcePivot }) }),
    imageSource: Object.freeze({ ...imageSource, locator: Object.freeze({ ...imageSource.locator }) }),
  });
}
