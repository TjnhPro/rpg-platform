// Optional Client consumer. All decoding, atlas interpretation and textures belong to Render.
import { prepareVisualResource, beginRenderFrameSession, createVisualResourceCache,
  createVisualSourceLoad, parseUnityAtlasMetadata, getAtlasMetadataRevision,
  resolveAtlasFrameGeometry, createAtlasTextureView, getRenderViewportSnapshot,
  getRenderFrameFailure, getRenderTextureFailure, getVisualResourceCacheFailure,
  type VisualSourceProvider, type VisualSourceLoad, type VisualResourceLease,
  type VisualResourceCache, type RenderFrameSession, type AtlasTextureView,
} from '@rpg-platform/runtime-render';

const maxBytes = 1024 * 1024;
export const clientDescriptor = prepareVisualResource({
  identity: { projectId: 'client-resource-manual', resourceId: 'selected-page' }, mediaType: null,
  sources: [
    { role: 'atlas-metadata', locator: { type: 'project-relative', path: 'selected/page.tpsheet' } },
    { role: 'image', locator: { type: 'project-relative', path: 'selected/page.png' } },
  ],
}).descriptor;
export interface ClientSelection {
  readonly png: File;
  readonly sheet: File;
  /** Exact header label and frame address supplied by the host, never parsed here. */
  readonly textureReference: string;
  readonly frameKey: string;
  readonly missingImage: boolean;
}
const hash = async (bytes: Uint8Array<ArrayBuffer>): Promise<string> =>
  Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), byte => byte.toString(16).padStart(2, '0')).join('');

/** Explicit selection grants access to two immutable File snapshots, not arbitrary paths. */
export function selectedClientProvider(input: ClientSelection): VisualSourceProvider {
  const selection = Object.freeze({ ...input });
  const scope = { projectId: clientDescriptor.identity.projectId, providerId: Symbol(), authorizationGeneration: 'selected-files-1' };
  return { scope, async read(request) {
    const expected = clientDescriptor.sources[request.sourceIndex];
    if (!expected || request.scope.providerId !== scope.providerId
      || request.scope.authorizationGeneration !== scope.authorizationGeneration
      || request.identity.projectId !== scope.projectId || request.identity.resourceId !== clientDescriptor.identity.resourceId
      || request.source.role !== expected.role || request.source.locator.type !== expected.locator.type
      || request.source.locator.path !== expected.locator.path) return { status: 'failed', code: 'SOURCE_DENIED' };
    if (selection.missingImage && request.sourceIndex === 1) return { status: 'failed', code: 'SOURCE_NOT_FOUND' };
    const file = request.sourceIndex === 0 ? selection.sheet : selection.png;
    if (file.size > Math.min(request.maxBytes, maxBytes)) return { status: 'failed', code: 'CONTENT_TOO_LARGE' };
    const bytes = new Uint8Array(await file.arrayBuffer());
    return { status: 'provided', bytes, contentLength: bytes.length,
      mediaType: request.sourceIndex === 1 ? 'image/png' : null, revision: await hash(bytes) };
  } };
}
const classify = (error: unknown): unknown => getVisualResourceCacheFailure(error)
  ?? getRenderTextureFailure(error) ?? getRenderFrameFailure(error) ?? { code: 'UNKNOWN', details: 'WITHHELD' };

/** One canvas/session per mount; open recreates a session after disposal/drain. */
export function mountClientVisualResource(target: HTMLCanvasElement, report: (event: string, data: unknown) => void) {
  const log = (event: string, data: unknown): void => { try { report(event, data); } catch {} };
  let closed = false, cleanupUncertain = false, ticket: object | undefined;
  let graphicsTail = Promise.resolve();
  type Slot = { session: RenderFrameSession; metadata?: VisualSourceLoad;
    cache?: VisualResourceCache; lease?: VisualResourceLease; view?: AtlasTextureView };
  let owned: Slot | undefined;
  const inspect = () => ({ closed, cleanupUncertain, graphics: owned ? getRenderViewportSnapshot(owned.session).graphics : null,
    source: owned?.metadata?.getSnapshot(), cache: owned?.cache?.getSnapshot(),
    lease: owned?.lease?.getSnapshot(), view: owned?.view?.getSnapshot() });
  const dispose = (): void => {
    ticket = undefined;
    const old = owned; owned = undefined;
    if (!old) return;
    for (const [stage, action] of [ ['lease', () => old.lease?.release()],
      ['metadata', () => old.metadata?.release()], ['cache', () => old.cache?.dispose()],
      ['graphics', () => old.session.dispose()] ] as const) {
      try { action(); log('release-order', stage); }
      catch (error) { cleanupUncertain = true; log('cleanup-uncertain', { stage, failure: classify(error) }); }
    }
    const graphics = getRenderViewportSnapshot(old.session).graphics;
    if (old.lease?.getSnapshot().cleanupFailed || old.cache?.getSnapshot().cleanupFailed
      || ('cleanupFailed' in graphics && graphics.cleanupFailed === true)) cleanupUncertain = true;
    log('disposed', { lease: old.lease?.getSnapshot(), view: old.view?.getSnapshot(),
      cache: old.cache?.getSnapshot(), graphics, cleanupUncertain });
  };
  const frame = (): void => {
    if (closed || !owned) { log('frame-unavailable', inspect()); return; }
    try { log('frame-submitted-not-display', owned.session.renderFrame()); }
    catch (error) { log('frame-failed', classify(error)); }
  };
  const open = async (input: ClientSelection): Promise<void> => {
    if (closed || cleanupUncertain) { log('mount-unavailable', inspect()); return; }
    dispose();
    if (cleanupUncertain) return;
    // Capture host configuration; File byte snapshots are immutable browser capabilities.
    const selection = Object.freeze({ ...input }), current = {}; ticket = current;
    if (selection.png.size > maxBytes || selection.sheet.size > maxBytes) {
      log('host-admission', { code: 'CONTENT_TOO_LARGE' }); return;
    }
    const previous = graphicsTail;
    let drained!: () => void;
    graphicsTail = new Promise<void>(yes => { drained = yes; });
    let operation: ReturnType<typeof beginRenderFrameSession> | undefined;
    let slot: Slot | undefined;
    try {
      await previous;
      if (closed || ticket !== current || cleanupUncertain) return;
      operation = beginRenderFrameSession({ target });
      const session = await operation.result;
      if (closed || ticket !== current) {
        try { session.dispose(); } catch (error) { cleanupUncertain = true; log('late-cleanup-error', classify(error)); }
        const graphics = getRenderViewportSnapshot(session).graphics;
        if ('cleanupFailed' in graphics && graphics.cleanupFailed === true) cleanupUncertain = true;
        log('late-session-released', graphics); return;
      }
      slot = { session }; owned = slot;
    } catch (error) {
      const graphics = operation?.getSnapshot();
      if (graphics && 'cleanupFailed' in graphics && graphics.cleanupFailed === true) cleanupUncertain = true;
      if (!closed && ticket === current) log('acquire-failed', classify(error));
      return;
    } finally { drained(); }
    if (!slot) return;
    const active = (): boolean => !closed && ticket === current && owned === slot;
    try {
      const provider = selectedClientProvider(selection);
      slot.metadata = createVisualSourceLoad(clientDescriptor, 0, provider, maxBytes);
      const metadata = await slot.metadata.start();
      if (!active()) return;
      log('metadata-source', metadata);
      if (metadata.state !== 'source-acquired') return;
      const parsed = parseUnityAtlasMetadata(clientDescriptor,
        [{ sourceId: 'sheet', sourceIndex: 0 }, { sourceId: 'page-image', sourceIndex: 1 }],
        [{ pageId: 'page', metadataSourceId: 'sheet', imageSourceId: 'page-image',
          textureReference: selection.textureReference, metadata: slot.metadata }],
        { maxBytesPerSheet: maxBytes, maxTotalBytes: maxBytes, maxPages: 1, maxFrames: 4096 });
      log('atlas-result', parsed.status === 'parsed' ? { status: parsed.status, frames: parsed.atlas.frames.length } : parsed);
      if (parsed.status !== 'parsed') return;
      // Hash the explicitly chosen immutable page for the cache's exact expected revision.
      const revision = selection.missingImage ? 'host-image-unavailable'
        : await hash(new Uint8Array(await selection.png.arrayBuffer()));
      if (!active()) return;
      slot.cache = createVisualResourceCache(provider, { maxCpuEntries: 1, maxGpuEntries: 1 });
      slot.lease = slot.cache.acquire(slot.session, clientDescriptor, 1, revision,
        { maxBytes, maxDimension: 2048, maxPixels: 4194304 }, { sampling: 'nearest', colorSpace: 'srgb' });
      const outcome = await slot.lease.result;
      if (!active()) return;
      log('image-outcome', outcome.state === 'failed' ? outcome : { state: outcome.state, cleanupFailed: outcome.cleanupFailed });
      if (outcome.state !== 'usable') return;
      const pixels = outcome.texture.getSnapshot(), atlasRevision = getAtlasMetadataRevision(parsed.atlas)!;
      const geometry = resolveAtlasFrameGeometry({ ...clientDescriptor.identity, subresourceId: selection.frameKey },
        parsed.atlas, atlasRevision.id, { imageSourceId: 'page-image', unit: 'image-pixel',
          layout: 'texturepacker-unity-bottom-left', width: pixels.width, height: pixels.height });
      log('frame-geometry', geometry);
      if (geometry.status === 'resolved') slot.view = createAtlasTextureView(slot.session, outcome.texture, geometry.geometry, 'page-image');
      slot.metadata.release();
      log('client-observation', inspect());
      frame(); // Explicit one-shot request, no game tick, loop or sprite drawing.
    } catch (error) { if (active()) log('resource-error', classify(error)); }
  };
  const unmount = (): void => { if (!closed) { closed = true; dispose(); log('unmounted', inspect()); } };
  return Object.freeze({ open, dispose, unmount, inspect, frame });
}
