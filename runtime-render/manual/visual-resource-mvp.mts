// Finite, button-driven consumer of package-root APIs. Not a test or alternate loader.
import { beginRenderFrameSession, createVisualSourceLoad, parseUnityAtlasMetadata,
  getAtlasMetadataRevision, resolveAtlasFrameGeometry, createAtlasTextureView,
  createVisualResourceCache, invalidateVisualResourceCache, renderVisualResourceDemo,
  getRenderViewportSnapshot, getRenderFrameFailure, getRenderTextureFailure,
  getVisualResourceCacheFailure, type VisualResourceDescriptor, type VisualSourceProvider,
  type RenderFrameSession, type VisualResourceLease, type AtlasMetadata,
} from '@rpg-platform/runtime-render';

type Input = { descriptor: VisualResourceDescriptor; provider: VisualSourceProvider; revision: string;
  replacePng: (file: File) => Promise<string> };
const limits = { maxBytes: 1048576, maxDimension: 2048, maxPixels: 4194304 };
const options = { sampling: 'nearest', colorSpace: 'srgb' } as const;
export async function openVisualResourceMvp(targets: readonly [HTMLCanvasElement, HTMLCanvasElement],
  input: Input, textureReference: string, frameKey: string,
  report: (event: string, data: unknown) => void) {
  const log = (event: string, data: unknown) => { try { report(event, data); } catch {} };
  const failure = (error: unknown) => getRenderFrameFailure(error) ?? getRenderTextureFailure(error)
    ?? getVisualResourceCacheFailure(error) ?? { code: 'UNKNOWN', details: 'WITHHELD' };
  const sessions: RenderFrameSession[] = [], leases: VisualResourceLease[] = [];
  const reads = { metadata: 0, image: 0 };
  const provider: VisualSourceProvider = { scope: input.provider.scope, read(request) {
    if (request.sourceIndex === 0) reads.metadata++; else reads.image++;
    return input.provider.read(request);
  } };
  const cache = createVisualResourceCache(provider, { maxCpuEntries: 4, maxGpuEntries: 4, maxRevisionEntries: 1 });
  const source = createVisualSourceLoad(input.descriptor, 0, provider, limits.maxBytes);
  let atlas: AtlasMetadata | undefined, closed = false, busy = false;
  const observe = () => ({ reads: { ...reads }, cache: cache.getSnapshot(),
    leases: leases.map(lease => { const s = lease.getSnapshot(); return s.state === 'usable'
      ? { state: s.state, id: s.id, sessionId: s.sessionId, resourceId: s.resourceId,
        texture: s.texture.getSnapshot(), sourceRevision: s.sourceRevision } : s; }),
    graphics: sessions.map(session => getRenderViewportSnapshot(session).graphics) });
  const cleanup = (stage: string, action: () => unknown) => {
    try { action(); } catch (error) { log('cleanup-uncertain', { stage, failure: failure(error) }); }
  };
  const close = () => {
    if (closed) return; closed = true;
    for (const lease of leases) cleanup('lease', () => lease.release());
    cleanup('metadata', () => source.release()); cleanup('cache', () => cache.dispose());
    for (const session of sessions) cleanup('session', () => session.dispose());
    log('closed', observe());
  };
  const acquire = (session: RenderFrameSession, revision: string) => {
    const lease = cache.acquire(session, input.descriptor, 1, revision, limits, options);
    leases.push(lease); return lease;
  };
  const draw = (index: number, wholeImage = false) => {
    if (closed) return;
    const lease = leases[index], snapshot = lease?.getSnapshot();
    if (!lease || !snapshot || snapshot.state !== 'usable' || !atlas) {
      log('draw-unavailable', { index, lease: snapshot }); return;
    }
    const session = sessions.find(item => getRenderViewportSnapshot(item).sessionId === snapshot.sessionId);
    if (!session) throw new TypeError('No owned graphics session');
    const pixels = snapshot.texture.getSnapshot();
    const geometry = resolveAtlasFrameGeometry({ ...input.descriptor.identity, subresourceId: frameKey },
      atlas, getAtlasMetadataRevision(atlas)!.id, { imageSourceId: 'page-image', unit: 'image-pixel',
        layout: 'texturepacker-unity-bottom-left', width: pixels.width, height: pixels.height });
    log('geometry', geometry);
    if (!wholeImage && geometry.status !== 'resolved') return; // No full-image fallback.
    if (geometry.status === 'resolved') {
      log('borrowed-view', createAtlasTextureView(session, snapshot.texture, geometry.geometry, 'page-image').getSnapshot());
    }
    log('frame-submitted-NOT-display', renderVisualResourceDemo(session, snapshot.texture,
      wholeImage || geometry.status !== 'resolved' ? undefined : geometry.geometry));
  };
  try {
    // Sequential acquisition makes partial-construction cleanup explicit; resources load concurrently below.
    for (const target of targets) {
      const operation = beginRenderFrameSession({ target });
      try { sessions.push(await operation.result); }
      catch (error) { log('graphics-acquisition-failed', operation.getSnapshot()); throw error; }
    }
    const state = await source.start(); log('metadata-source', state);
    if (state.state === 'source-acquired') {
      const parsed = parseUnityAtlasMetadata(input.descriptor,
        [{ sourceId: 'sheet', sourceIndex: 0 }, { sourceId: 'page-image', sourceIndex: 1 }],
        [{ pageId: 'page', metadataSourceId: 'sheet', imageSourceId: 'page-image', textureReference, metadata: source }],
        { maxBytesPerSheet: limits.maxBytes, maxTotalBytes: limits.maxBytes, maxPages: 1, maxFrames: 4096 });
      log('atlas', parsed); if (parsed.status === 'parsed') atlas = parsed.atlas;
    }
    source.release();
    if (atlas) {
      const a = sessions[0]!, b = sessions[1]!;
      const holders = [acquire(a, input.revision), acquire(a, input.revision), acquire(b, input.revision)];
      const outcomes = await Promise.all(holders.map(lease => lease.result));
      log('concurrent-outcomes', outcomes.map(state => state.state === 'failed' ? state : { state: state.state }));
      draw(0); draw(2);
    }
    log('opened', observe());
  } catch (error) { log('open-failed', failure(error)); close(); }
  return Object.freeze({ observe, close, draw,
    release(index: number) { if (!closed) { cleanup('partial/final lease', () => leases[index]?.release()); log('released', observe()); } },
    disposeA() { if (!closed) { cleanup('session A only', () => sessions[0]?.dispose()); log('A-disposed', observe()); } },
    async replace(file: File) {
      if (closed || busy) return; busy = true;
      try {
        const revision = await input.replacePng(file);
        if (closed) return;
        invalidateVisualResourceCache(cache, input.descriptor, 1, revision);
        const lease = acquire(sessions[1]!, revision), index = leases.length - 1;
        await lease.result;
        if (!closed) { log('revision-acquired', { index, observation: observe() }); draw(index); }
      } catch (error) { log('replacement-failed', failure(error)); }
      finally { busy = false; }
    },
  });
}
