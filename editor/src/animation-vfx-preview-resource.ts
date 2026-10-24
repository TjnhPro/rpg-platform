import { createVisualResourceCache, resolveAtlasFrameGeometry,
  type RenderFrameSession, type VisualFrameReference, type SpriteAnimationVisualFrameInput,
  type SpriteFrameAlignmentData } from '@rpg-platform/runtime-render';
import type { AnimationPreviewContext, AnimationPreviewTicket } from './animation-vfx-preview-context.js';
import type { AnimationPreviewInventory } from './animation-vfx-preview-atlas.js';

/** One provider-scoped canonical cache. Own acquisition rights, never borrowed bindings. */
export function createAnimationPreviewResources(context: AnimationPreviewContext, ticket: AnimationPreviewTicket,
  inventory: AnimationPreviewInventory, session: RenderFrameSession) {
  const source = context.assert(ticket);
  if (source.descriptor !== inventory.descriptor) throw new TypeError('PREVIEW_RESOURCE_CONTEXT_MISMATCH');
  const cache = createVisualResourceCache(source.provider, { maxCpuEntries: 2, maxGpuEntries: 2, maxRevisionEntries: 32 });
  let closed = false, generation = 0;
  const pending = new Set<ReturnType<typeof cache.acquire>>();
  const dispose = () => { if (!closed) { closed = true; generation++;
    try { for (const lease of pending) lease.release(); } finally { pending.clear(); cache.dispose(); } }
    return cache.getSnapshot(); };
  const unregister = context.own(ticket, dispose);
  return Object.freeze({ read: cache.getSnapshot,
    async sync<T>(selected: () => VisualFrameReference | null,
      bind: (input: SpriteAnimationVisualFrameInput) => T,
      planeUnitsPerPixel: { readonly x: number; readonly y: number }, authored: SpriteFrameAlignmentData | null = null) {
      context.assert(ticket); if (closed) throw new TypeError('PREVIEW_RESOURCES_DISPOSED');
      const current = ++generation, frame = selected();
      if (!frame) throw new TypeError('PREVIEW_ADDRESS_NOT_SELECTED');
      const pixels = inventory.pages.find(page => resolveAtlasFrameGeometry(frame, inventory.atlas, inventory.revision.id, page).status === 'resolved');
      if (!pixels) throw new TypeError('PREVIEW_FRAME_UNRESOLVED');
      const observation = inventory.observations.find(item => item.sourceId === pixels.imageSourceId);
      if (!observation || observation.request.source.role !== 'image') throw new TypeError('PREVIEW_PAGE_UNAVAILABLE');
      const lease = cache.acquire(session, inventory.descriptor, observation.sourceIndex, observation.revision,
        { maxBytes: 4_194_304, maxDimension: 4096, maxPixels: 4_194_304 }, { sampling: 'nearest', colorSpace: 'srgb' });
      pending.add(lease);
      try {
        const loaded = await lease.result; context.assert(ticket);
        if (closed || current !== generation || JSON.stringify(selected()) !== JSON.stringify(frame)) throw new TypeError('STALE_PREVIEW_FRAME');
        if (loaded.state !== 'usable') throw new TypeError(`PREVIEW_RESOURCE:${loaded.state}`);
        const decoded = loaded.texture.getSnapshot();
        if (decoded.width !== pixels.width || decoded.height !== pixels.height) throw new TypeError('PREVIEW_DECODED_DIMENSIONS_MISMATCH');
        const result = bind({ resource: lease, expectedSourceRevision: observation.revision,
          atlas: inventory.atlas, expectedRevision: inventory.revision.id, pixels, planeUnitsPerPixel, authored });
        return Object.freeze({ address: frame, frame: 'frame_resolved', source: 'source_loaded', result,
          submission: 'NOT_CHECKED', pixels: 'NOT_VERIFIED' });
      } finally { pending.delete(lease); lease.release(); }
    },
    dispose() { unregister(); return dispose(); }
  });
}
export type AnimationPreviewResources = ReturnType<typeof createAnimationPreviewResources>;
