import { createVisualSourceLoad, parseUnityAtlasMetadata, getAtlasMetadataRevision,
  type AtlasSourceBinding, type VisualSourceLoad, type AtlasPagePixels } from '@rpg-platform/runtime-render';
import type { AnimationPreviewContext, AnimationPreviewTicket } from './animation-vfx-preview-context.js';

export interface PreviewSheetDeclaration {
  readonly pageId: string; readonly metadataSourceId: string; readonly imageSourceId: string; readonly textureReference: string;
}
/** Explicit host declaration only: no discovery, path matching or frame synthesis. */
export async function inspectAnimationPreviewAtlas(context: AnimationPreviewContext, ticket: AnimationPreviewTicket,
  inputBindings: readonly AtlasSourceBinding[], inputSheets: readonly PreviewSheetDeclaration[]) {
  const source = context.assert(ticket), descriptor = source.descriptor;
  if (!descriptor.sources.some(item => item.role === 'atlas-metadata')) throw new TypeError('HOST_METADATA_UNAVAILABLE:STATIC_IMAGE_ONLY');
  if (inputBindings.length > 128 || inputSheets.length > 32) throw new RangeError('PREVIEW_ATLAS_LIMIT');
  const bindings = inputBindings.map(item => ({ sourceId: item.sourceId, sourceIndex: item.sourceIndex }));
  const sheets = inputSheets.map(item => ({ pageId: item.pageId, metadataSourceId: item.metadataSourceId,
    imageSourceId: item.imageSourceId, textureReference: item.textureReference }));
  if (bindings.length !== descriptor.sources.length || new Set(bindings.map(item => item.sourceIndex)).size !== descriptor.sources.length)
    throw new TypeError('PREVIEW_EXPLICIT_SOURCE_BINDINGS_REQUIRED');
  const loads = new Map<string, VisualSourceLoad>(), unregister: (() => unknown)[] = [];
  try {
    for (const binding of bindings) {
      const role = descriptor.sources[binding.sourceIndex]?.role;
      if (role !== 'image' && role !== 'atlas-metadata') throw new TypeError('PREVIEW_SOURCE_ROLE_UNSUPPORTED');
      const load = createVisualSourceLoad(descriptor, binding.sourceIndex, source.provider, role === 'image' ? 4_194_304 : 1_048_576);
      loads.set(binding.sourceId, load); unregister.push(context.own(ticket, () => load.release()));
      const observation = await load.start(); context.assert(ticket);
      if (observation.state !== 'source-acquired') throw new TypeError(`PREVIEW_SOURCE:${observation.state}`);
      if (role === 'atlas-metadata' && !['text/plain', 'application/vnd.texturepacker.tpsheet'].includes(observation.source.mediaType ?? ''))
        throw new TypeError('HOST_METADATA_UNAVAILABLE:MEDIA_TYPE');
    }
    const result = parseUnityAtlasMetadata(descriptor, bindings, sheets.map(sheet => {
      const metadata = loads.get(sheet.metadataSourceId);
      if (!metadata) throw new TypeError('PREVIEW_METADATA_BINDING_REQUIRED');
      return { ...sheet, metadata };
    }), { maxBytesPerSheet: 1_048_576, maxTotalBytes: 4_194_304, maxPages: 32, maxFrames: 16384 });
    if (result.status !== 'parsed') throw new TypeError(`PREVIEW_ATLAS:${result.code}`);
    const revision = getAtlasMetadataRevision(result.atlas);
    if (!revision) throw new TypeError('PREVIEW_ATLAS_PROVENANCE');
    const observations = bindings.map(binding => {
      const observation = loads.get(binding.sourceId)!.getSnapshot();
      if (observation.state !== 'source-acquired') throw new TypeError('PREVIEW_SOURCE_RELEASED');
      return Object.freeze({ ...binding, ...observation.source });
    });
    const pages: readonly AtlasPagePixels[] = Object.freeze(result.atlas.pages.map(page => Object.freeze({
      imageSourceId: page.imageSourceId, unit: 'image-pixel' as const, width: page.width, height: page.height,
      layout: 'texturepacker-unity-bottom-left' as const })));
    context.assert(ticket);
    return Object.freeze({ atlas: result.atlas, revision, descriptor, pages,
      observations: Object.freeze(observations), provenance: 'FRAME_INVENTORY_OBSERVED' as const,
      dimensions: 'METADATA_DECLARED_NOT_DECODED' as const });
  } finally { for (const load of loads.values()) load.release(); for (const remove of unregister) remove(); }
}
export type AnimationPreviewInventory = Awaited<ReturnType<typeof inspectAnimationPreviewAtlas>>;
