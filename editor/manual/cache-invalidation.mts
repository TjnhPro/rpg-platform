// Optional finite public-root consumer. No assertions or automatic browser runner.
import { createRenderFrameSession, createVisualResourceCache, invalidateVisualResourceCache, getVisualResourceCacheFailure,
  getRenderTextureFailure, getRenderFrameFailure, getRenderViewportSnapshot,
  type VisualSourceProvider, type VisualResourceLeaseSnapshot } from '@rpg-platform/runtime-render';

type Sample = { readonly bytes: Uint8Array<ArrayBuffer>; readonly revision: string };
export async function inspectCacheInvalidation(canvas: HTMLCanvasElement, a: Sample, b: Sample,
  log: (label: string, value: unknown) => void): Promise<void> {
  const descriptor = { identity: { projectId: 'revision-manual', resourceId: 'selected-image' }, mediaType: null,
    sources: [{ role: 'image', locator: { type: 'project-relative' as const, path: 'selected.png' } }] };
  let selected = a, reads = 0;
  const provider: VisualSourceProvider = {
    scope: { projectId: 'revision-manual', providerId: Symbol(), authorizationGeneration: 'selected-files-1' },
    async read() { reads++; return { status: 'provided', ...selected, contentLength: selected.bytes.length, mediaType: null }; },
  };
  const cache = createVisualResourceCache(provider, { maxCpuEntries: 2, maxGpuEntries: 2, maxRevisionEntries: 1 });
  const session = await createRenderFrameSession({ target: canvas });
  const acquire = (revision: string) => cache.acquire(session, descriptor, 0, revision,
    { maxBytes: 16777216, maxDimension: 8192, maxPixels: 16777216 }, { sampling: 'nearest', colorSpace: 'srgb' });
  const safe = (state: VisualResourceLeaseSnapshot) => ({ state: state.state, cleanupFailed: state.cleanupFailed,
    failure: state.state === 'failed' ? state.failure : null });
  const failure = (error: unknown) => getVisualResourceCacheFailure(error)
    ?? getRenderTextureFailure(error) ?? getRenderFrameFailure(error) ?? { code: 'UNKNOWN_NOT_CLASSIFIED' };
  try {
    const old = acquire(a.revision);
    log('A outcome', safe(await old.result));
    selected = b;
    invalidateVisualResourceCache(cache, descriptor, 0, b.revision);
    try { acquire(a.revision); } catch (error) { log('old revision admission', failure(error)); }
    const revised = acquire(b.revision);
    try { log('B outcome', safe(await revised.result)); }
    catch (error) { log('B unexpected error (details withheld)', failure(error)); }
    log('A after B outcome (fresh observation)', safe(old.getSnapshot()));
    log('ownership observations, not bytes', { reads, cache: cache.getSnapshot() });
    revised.release(); old.release();
    log('released ownership', cache.getSnapshot());
  } catch (error) { log('unknown details withheld', failure(error)); }
  finally {
    try { cache.dispose(); } catch (error) { log('cache cleanup', failure(error)); }
    try { session.dispose(); } catch (error) { log('session cleanup', failure(error)); }
    const viewport = getRenderViewportSnapshot(session);
    log('terminal graphics', { state: viewport.state, failure: viewport.graphics.failure, cleanupFailed: 'cleanupFailed' in viewport.graphics ? viewport.graphics.cleanupFailed : 'UNKNOWN' });
  }
}
