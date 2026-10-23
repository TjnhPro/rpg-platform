// Optional Editor host composition through package roots; no rendering implementation.
import { createAssetCatalog, createAssetReference, resolveAssetReference, describeResolvedVisualAsset,
  createSceneDefinition, createDocumentEnvelope, createDocumentSession,
  type AssetReference } from '@rpg-platform/editor';
import { beginRenderFrameSession, prepareVisualResource, createVisualResourceCache,
  getVisualResourceCacheFailure, getRenderFrameFailure, getRenderFailure, getRenderTextureFailure,
  getRenderViewportSnapshot, type RenderFrameSession, type VisualResourceCache,
  type VisualResourceLease, type VisualSourceProvider } from '@rpg-platform/runtime-render';

export function createPreviewAuthoredSample() {
  const projectId = 'editor-resource-manual';
  const catalog = createAssetCatalog({ projectId, definitions: [{
    identity: { projectId, assetId: 'sample-png' }, kind: 'image', metadata: { label: 'CC0 sample' },
    sources: [{ role: 'image', locator: { type: 'project-relative', path: 'png-sample/rgba-2x2.png' } }],
  }] });
  const reference = createAssetReference({ projectId, assetId: 'sample-png', expectedKind: 'image' });
  const scene = createSceneDefinition({ identity: { projectId, sceneId: 'inspection' } });
  // Demonstration-only portable content, not a published Scene document schema.
  const document = createDocumentSession(createDocumentEnvelope({ schemaVersion: 1,
    identity: { projectId, documentId: 'manual-content' }, documentKind: 'manual:visual-resource',
    contentSchemaVersion: null, content: { scene, catalog, reference },
  }), null);
  document.open(); // Unsaved authored data: dirty=true, never pretend storage-loaded.
  return Object.freeze({ catalog, reference, scene, document });
}
export type PreviewAuthoredSample = ReturnType<typeof createPreviewAuthoredSample>;
const classify = (error: unknown): unknown => getVisualResourceCacheFailure(error)
  ?? getRenderTextureFailure(error) ?? getRenderFrameFailure(error) ?? getRenderFailure(error)
  ?? { code: 'UNKNOWN_NOT_CLASSIFIED', details: 'WITHHELD' };

/** One manual mount, one owned slot; resources are disposed before graphics. */
export function mountEditorVisualResource(target: HTMLCanvasElement, authored: PreviewAuthoredSample,
  report: (event: string, observation: unknown) => void) {
  // An inspection callback must not interrupt disposal of the remaining owners.
  const log = (event: string, observation: unknown): void => { try { report(event, observation); } catch {} };
  let closed = false, intent: object | undefined, cleanupUncertain = false;
  let graphicsTail = Promise.resolve();
  let owned: { session: RenderFrameSession; cache: VisualResourceCache | undefined;
    lease: VisualResourceLease | undefined } | undefined;
  const initial = authored.document.getSnapshot();
  const initialContent = JSON.stringify(initial.envelope.content);
  const authoredObservation = () => {
    const current = authored.document.getSnapshot();
    return { currentRevision: current.currentRevision, isDirty: current.isDirty,
      sameEnvelope: current.envelope === initial.envelope,
      sameContent: JSON.stringify(current.envelope.content) === initialContent,
      sameDirty: current.isDirty === initial.isDirty,
      sameRevision: current.currentRevision === initial.currentRevision };
  };
  const release = (): void => {
    const old = owned; owned = undefined;
    if (!old) return;
    for (const [stage, action] of [
      ['lease', () => old.lease?.release()], ['cache', () => old.cache?.dispose()],
      ['graphics', () => old.session.dispose()],
    ] as const) {
      try { action(); log('release-order', { stage }); }
      catch (error) { cleanupUncertain = true; log('cleanup-uncertain', { stage, failure: classify(error) }); }
    }
    const lease = old.lease?.getSnapshot(), cache = old.cache?.getSnapshot();
    if (lease?.cleanupFailed || cache?.cleanupFailed) cleanupUncertain = true;
    log('terminal-resources', { lease, cache });
    const graphics = getRenderViewportSnapshot(old.session).graphics;
    if ('cleanupFailed' in graphics && graphics.cleanupFailed === true) cleanupUncertain = true;
    log('terminal-graphics', graphics);
  };
  const close = (): void => {
    intent = undefined; release();
    log('preview-closed', { authored: authoredObservation(), cleanupUncertain });
  };
  const open = async (reference: AssetReference, provider: VisualSourceProvider, revision: string): Promise<void> => {
    if (closed || cleanupUncertain) { log('open-unavailable', { closed, cleanupUncertain }); return; }
    intent = undefined; release();
    if (cleanupUncertain) { log('replacement-blocked-by-cleanup', null); return; }
    const ticket = {}; intent = ticket;
    const before = authoredObservation();
    const resolution = resolveAssetReference(authored.catalog, reference);
    if (resolution.status === 'unresolved') {
      log('authored-unresolved', { reason: resolution.reason, authored: authoredObservation() }); return;
    }
    const visual = describeResolvedVisualAsset(resolution, 'image/png');
    if (visual.status !== 'described') { log('unsupported-visual', { reason: visual.reason }); return; }
    const descriptor = prepareVisualResource(visual.descriptor).descriptor;
    const sourceIndex = descriptor.sources.findIndex(source => source.role === 'image');
    // Serialize ONLY graphics acquisition/drain, never wait for provider IO here.
    // A replaced pending session must release its reservation before the next acquisition.
    const previous = graphicsTail;
    let drained!: () => void;
    graphicsTail = new Promise<void>(yes => { drained = yes; });
    let acquired: RenderFrameSession | undefined;
    let operation: ReturnType<typeof beginRenderFrameSession> | undefined;
    try {
      await previous;
      if (closed || intent !== ticket || cleanupUncertain) return;
      operation = beginRenderFrameSession({ target });
      acquired = await operation.result;
      if (closed || intent !== ticket) {
        try { acquired.dispose(); } catch (error) { cleanupUncertain = true; log('late-graphics-cleanup', classify(error)); }
        const graphics = getRenderViewportSnapshot(acquired).graphics;
        if ('cleanupFailed' in graphics && graphics.cleanupFailed === true) cleanupUncertain = true;
        log('late-graphics-released', graphics); return;
      }
      owned = { session: acquired, cache: undefined, lease: undefined };
    } catch (error) {
      const graphics = operation?.getSnapshot();
      if (graphics && 'cleanupFailed' in graphics && graphics.cleanupFailed === true) cleanupUncertain = true;
      if (!closed && intent === ticket) log('graphics-failed', classify(error));
      return;
    } finally { drained(); }
    if (closed || intent !== ticket || acquired === undefined) return;
    const slot = owned!;
    try {
      slot.cache = createVisualResourceCache(provider, { maxCpuEntries: 2, maxGpuEntries: 2 });
      slot.lease = slot.cache.acquire(acquired, descriptor, sourceIndex, revision,
        { maxBytes: 4096, maxDimension: 4, maxPixels: 16 }, { sampling: 'nearest', colorSpace: 'srgb' });
      const result = await slot.lease.result;
      if (closed || intent !== ticket || owned !== slot) return;
      log('resource-outcome', { state: result.state,
        failure: result.state === 'failed' ? result.failure : null,
        cleanupFailed: result.cleanupFailed, cache: slot.cache.getSnapshot(),
        before, authored: authoredObservation(), display: 'NOT_VERIFIED' });
    } catch (error) {
      if (!closed && intent === ticket) log('resource-error', { failure: classify(error), authored: authoredObservation() });
    }
  };
  const unmount = (): void => {
    if (closed) return;
    closed = true; close();
    log('unmounted-no-future-adoption', authoredObservation());
  };
  // Optional manual observation seams for same-realm Client/Editor isolation review.
  const observe = () => ({ authored: authoredObservation(),
    lease: owned?.lease?.getSnapshot(), cache: owned?.cache?.getSnapshot(),
    graphics: owned ? getRenderViewportSnapshot(owned.session).graphics : null });
  const frame = (): void => {
    if (closed || !owned) { log('frame-unavailable', observe()); return; }
    try { log('frame-submitted-not-display', owned.session.renderFrame()); }
    catch (error) { log('frame-failed', classify(error)); }
  };
  return Object.freeze({ open, close, unmount, inspect: authoredObservation, observe, frame });
}
