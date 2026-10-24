// Optional browser/manual Editor consumer. Never imported by the package root.
import * as E from '@rpg-platform/editor';
import * as R from '@rpg-platform/runtime-render';

const projectId = 'editor-animation-manual';
// Explicit host-authored slots, NOT discovery/sort or a claim of compass direction.
const authoredClips = [
  { clipId: 'idle', interval: 150, assets: ['NormalStand1_0', 'NormalStand1_1', 'NormalStand1_2', 'NormalStand1_3',
    'NormalStand1_4', 'NormalStand1_5', 'NormalStand1_6', 'NormalStand1_7'],
    frames: [
      ['0000', '0002', '0004', '0006', '0008', '0010', '0012', '0014'],
      ['0016', '0018', '0020', '0022', '0024', '0026', '0028'],
      ['0030', '0032', '0034', '0036', '0038', '0040', '0042', '0044'],
      ['0046', '0048', '0050', '0052', '0054', '0056', '0058'],
      ['0060', '0062', '0064', '0066', '0068', '0070', '0072', '0074'],
      ['0076', '0078', '0080', '0082', '0084', '0086', '0088'],
      ['0090', '0092', '0094', '0096', '0098', '0100', '0102', '0104'],
      ['0106', '0108', '0110', '0112', '0114', '0116', '0118'],
    ] },
  { clipId: 'walk', interval: 125, assets: ['NormalWalk_0', 'NormalWalk_1', 'NormalWalk_2', 'NormalWalk_3',
    'NormalWalk_4', 'NormalWalk_5', 'NormalWalk_6', 'NormalWalk_7'], frames: [
      ['0000', '0002', '0004', '0006'], ['0008', '0010', '0012', '0014'],
      ['0016', '0018', '0020', '0022'], ['0024', '0026', '0028', '0030'],
      ['0032', '0034', '0036', '0038'], ['0040', '0042', '0044', '0046'],
      ['0048', '0050', '0052', '0054'], ['0056', '0058', '0060', '0062'],
    ] },
] as const;
const catalog = E.createAssetCatalog({ projectId, definitions: authoredClips.flatMap(clip => clip.assets.map(assetId => ({
  identity: { projectId, assetId }, kind: 'image', metadata: { label: assetId }, sources: [
    { role: 'atlas-metadata', locator: { type: 'project-relative' as const, path: `${assetId}.tpsheet` } },
    { role: 'image', locator: { type: 'project-relative' as const, path: `${assetId}.png` } },
  ],
}))) });
const membership = E.createSceneMembership({ scene: { identity: { projectId, sceneId: 'preview' } }, objects: [{
  definition: { objectId: 'subject' }, assetReference: { projectId, assetId: 'NormalStand1_0' },
  placement: { coordinateSpaceId: 'ground', point: { x: 140, y: 90 } },
}] });
const space = E.createCoordinateSpaceDefinition({ reference: { projectId, coordinateSpaceId: 'ground' },
  componentCount: 2, axes: { x: 'right', y: 'down' }, origin: { x: 0, y: 0 }, unit: 'world-unit' });

/** Caller explicitly authorizes only these catalog sources on its local server.
 * Stream is bounded before aggregation. Scope is revoked on close, including IO.
 * Hashes describe actual bytes, not filenames or timestamps. No image decoding here.
 */
function localProvider() {
  let active = true;
  const pending = new Set<AbortController>();
  const scope = { projectId, providerId: Symbol('manual-source-grant'), authorizationGeneration: '1' };
  const provider: R.VisualSourceProvider = { scope, async read(request) {
    const definition = catalog.definitions.find(item => item.identity.assetId === request.identity.resourceId);
    const source = definition?.sources[request.sourceIndex];
    if (!active || request.scope.providerId !== scope.providerId || request.scope.authorizationGeneration !== '1'
      || request.scope.projectId !== projectId || request.identity.projectId !== projectId
      || source?.role !== request.source.role || source?.locator.path !== request.source.locator.path
      || request.source.locator.type !== 'project-relative') return { status: 'failed', code: 'SOURCE_DENIED' };
    const controller = new AbortController(); pending.add(controller);
    try {
      const response = await fetch(`/asset/${encodeURIComponent(source.locator.path)}`, { signal: controller.signal });
      if (response.status === 404) return { status: 'failed', code: 'SOURCE_NOT_FOUND' };
      if (!response.ok || !response.body) throw new Error('Local source response unavailable');
      const reader = response.body.getReader(), chunks: Uint8Array[] = [];
      let length = 0;
      try {
        while (true) {
          const part = await reader.read(); if (part.done) break;
          length += part.value.length;
          if (length > request.maxBytes) { await reader.cancel(); return { status: 'failed', code: 'CONTENT_TOO_LARGE' }; }
          chunks.push(part.value);
        }
      } finally { reader.releaseLock(); }
      const bytes = new Uint8Array(length); let offset = 0;
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
      const hash = await crypto.subtle.digest('SHA-256', bytes);
      const revision = Array.from(new Uint8Array(hash), value => value.toString(16).padStart(2, '0')).join('');
      if (!active) return { status: 'failed', code: 'CANCELLED' };
      return { status: 'provided', bytes, contentLength: length, revision,
        mediaType: source.role === 'image' ? 'image/png' : null };
    } catch (error) {
      if (!active || controller.signal.aborted) return { status: 'failed', code: 'CANCELLED' };
      throw error;
    } finally { pending.delete(controller); }
  } };
  return { provider, close: () => { active = false; for (const operation of pending) operation.abort(); pending.clear(); } };
}

/** Manual step policy: Play changes transport; only Step supplies numeric deltaMs.
 * No RAF, wall clock, elapsed accumulator, cropper or alternative playback state.
 */
export function mountEditorAnimationPreview(root: HTMLElement) {
  const canvas = root.querySelector<HTMLCanvasElement>('canvas')!;
  const status = root.querySelector<HTMLElement>('[data-status]')!;
  const controls = root.querySelector<HTMLFieldSetElement>('fieldset')!;
  const clipSelect = root.querySelector<HTMLSelectElement>('[data-clip]')!;
  const directionSelect = root.querySelector<HTMLSelectElement>('[data-direction]')!;
  const delta = root.querySelector<HTMLInputElement>('[data-delta]')!;
  const grant = localProvider();
  const documentSession = E.createDocumentSession(E.createDocumentEnvelope({ schemaVersion: 1,
    identity: { projectId, documentId: 'preview-content' }, documentKind: 'manual:animation-preview',
    contentSchemaVersion: null, content: { membership, catalog, authoredClips },
  }), null);
  documentSession.open(); // Unsaved authored content; preview must preserve true dirty state.
  const initial = documentSession.getSnapshot();
  let closed = false, failure: unknown = null;
  let session: R.RenderFrameSession | undefined, scene: R.RenderVisualScene | undefined;
  let cache: R.VisualResourceCache | undefined, bridge: E.ScenePreviewBridge | undefined;
  let playback: R.SpriteAnimationPlayback | undefined, binding: R.SpriteAnimationVisualBinding | undefined;
  let instance: R.RenderVisualInstance | undefined;
  const leases = new Map<string, { lease: R.VisualResourceLease; atlas: R.AtlasMetadata; revision: symbol; imageRevision: string }>();
  const loads = new Set<R.VisualSourceLoad>();
  const listeners: (() => void)[] = [];
  const inspect = () => {
    const current = documentSession.getSnapshot();
    let visual: unknown = null;
    if (!closed && scene && instance) {
      try { visual = { instance: R.getRenderVisualInstanceSnapshot(scene, instance),
        resource: R.getRenderVisualInstanceResource(scene, instance) }; }
      catch (error) { visual = R.getRenderVisualDiagnostic(error); }
    }
    return { closed, failure, playback: playback ? R.getSpriteAnimationPlaybackSnapshot(playback) : null,
      visual,
      authored: { revision: current.currentRevision, dirty: current.isDirty,
        sameEnvelope: current.envelope === initial.envelope, sameRevision: current.currentRevision === initial.currentRevision,
        sameDirty: current.isDirty === initial.isDirty }, cache: cache?.getSnapshot() ?? null };
  };
  const report = () => { status.textContent = JSON.stringify(inspect(), (_, value) => typeof value === 'symbol' ? String(value) : value, 2); };
  const recordError = (error: unknown) => { console.error('Manual preview failure', error);
    failure = { status: 'PREVIEW_FAILED', ...R.getRenderVisualDiagnostic(error) }; report(); };
  const close = () => {
    if (closed) return;
    closed = true; controls.disabled = true;
    for (const remove of listeners) remove(); listeners.length = 0;
    const cleanup: unknown[] = [];
    const drain = (action: () => unknown) => { try { action(); } catch (error) { cleanup.push(R.getRenderVisualDiagnostic(error)); } };
    drain(grant.close);
    for (const load of loads) drain(() => load.release()); loads.clear();
    drain(() => { const outcomes = bridge?.close();
      if (outcomes?.some(item => item.cleanupFailed || item.status === 'diagnosed')) cleanup.push(outcomes); });
    drain(() => binding?.unbind());
    drain(() => playback && R.commandSpriteAnimationPlayback(playback, { type: 'dispose' }));
    for (const entry of leases.values()) drain(() => entry.lease.release());
    leases.clear(); drain(() => scene?.dispose()); drain(() => cache?.dispose()); drain(() => session?.dispose());
    const terminalCache = cache?.getSnapshot();
    const terminalGraphics = session && R.getRenderViewportSnapshot(session).graphics;
    if (terminalGraphics && 'cleanupFailed' in terminalGraphics && terminalGraphics.cleanupFailed) cleanup.push(terminalGraphics);
    if (cleanup.length || terminalCache?.cleanupFailed) failure = { status: 'CLEANUP_UNCERTAIN', cleanup, terminalCache };
    report();
  };
  const listen = (target: EventTarget, event: string, action: () => void) => {
    const listener = () => { if (closed) return; try { action(); } catch (error) { recordError(error); } };
    target.addEventListener(event, listener); listeners.push(() => target.removeEventListener(event, listener));
  };
  const present = () => {
    if (closed || !playback || !binding || !session) return;
    const frame = R.getSpriteAnimationPlaybackSnapshot(playback).frame;
    const entry = leases.get(frame.resourceId);
    if (!entry) throw new TypeError('Selected authored source is unavailable');
    const page = entry.atlas.pages[0]!;
    const result = binding.sync({ resource: entry.lease, atlas: entry.atlas, expectedRevision: entry.revision,
      expectedSourceRevision: entry.imageRevision,
      pixels: { imageSourceId: 'image', unit: 'image-pixel', width: page.width, height: page.height, layout: 'texturepacker-unity-bottom-left' },
      planeUnitsPerPixel: { x: 1, y: 1 }, authored: { reference: frame, revision: entry.revision,
        provenance: 'SA10 explicit top-left inspection origin (0,0), not anatomical ground or untrimmed origin',
        unit: 'image-pixel', origin: 'frame-top-left', groundAnchor: { x: 0, y: 0 }, pivot: { x: 0, y: 0 }, localOffset: { x: 0, y: 0 } },
    });
    failure = result.status === 'rejected' ? result : null;
    session.renderFrame(); // Receipt alone is not pixel evidence.
    report();
  };
  const ready = (async () => {
    try {
      session = await R.createRenderFrameSession({ target: canvas });
      if (closed) { session.dispose(); return; }
      scene = R.createRenderVisualScene(session);
      cache = R.createVisualResourceCache(grant.provider, { maxCpuEntries: 20, maxGpuEntries: 20 });
      for (const definition of catalog.definitions) {
        const reference = E.createAssetReference({ ...definition.identity, expectedKind: 'image' });
        const visual = E.describeResolvedVisualAsset(E.resolveAssetReference(catalog, reference), 'image/png');
        if (visual.status !== 'described') throw new TypeError(visual.reason);
        const descriptor = visual.descriptor;
        const metadata = R.createVisualSourceLoad(descriptor, 0, grant.provider, 1048576); loads.add(metadata);
        try {
          const observed = await metadata.start(); if (closed) return;
          if (observed.state !== 'source-acquired') { failure = { status: 'ASSET_NOT_AVAILABLE', assetId: definition.identity.assetId, observed }; close(); return; }
          const parsed = R.parseUnityAtlasMetadata(descriptor, [{ sourceId: 'metadata', sourceIndex: 0 }, { sourceId: 'image', sourceIndex: 1 }],
            [{ pageId: 'page', metadataSourceId: 'metadata', imageSourceId: 'image', textureReference: `${definition.identity.assetId}.png`, metadata }]);
          if (parsed.status !== 'parsed') throw new TypeError(JSON.stringify(parsed));
          const image = await R.acquireVisualSource(descriptor, 1, grant.provider, 1048576); if (closed) return;
          if (image.status !== 'source-acquired') { failure = { status: 'ASSET_NOT_AVAILABLE', assetId: definition.identity.assetId, image }; close(); return; }
          const lease = cache.acquire(session, descriptor, 1, image.revision,
            { maxBytes: 1048576, maxDimension: 2048, maxPixels: 4194304 }, { sampling: 'nearest', colorSpace: 'srgb' });
          leases.set(definition.identity.assetId, { lease, atlas: parsed.atlas, revision: R.getAtlasMetadataRevision(parsed.atlas)!.id, imageRevision: image.revision });
          const loaded = await lease.result; if (closed) return;
          if (loaded.state !== 'usable') { failure = { status: 'ASSET_NOT_AVAILABLE', assetId: definition.identity.assetId, loaded }; close(); return; }
        } finally { metadata.release(); loads.delete(metadata); }
      }
      const clips = authoredClips.map(clip => R.createEightWaySpriteClip({ clipId: clip.clipId,
        timing: { frameIntervalMs: clip.interval }, repeat: 'repeat',
        convention: { axes: space.axes, directionZeroAngleRadians: 0, zeroIndex: 0 },
        directions: clip.assets.map((assetId, slot) => ({ frames: clip.frames[slot]!.map(subresourceId => {
          const resolution = E.describeResolvedVisualAsset(E.resolveAssetReference(catalog, E.createAssetReference({ projectId, assetId })), 'image/png');
          if (resolution.status !== 'described') throw new TypeError(resolution.reason);
          const frame = R.createVisualFrameReference({ ...resolution.descriptor.identity, subresourceId });
          const entry = leases.get(assetId)!;
          const resolved = R.resolveAtlasFrame(frame, entry.atlas, entry.revision);
          if (resolved.status !== 'resolved') throw new TypeError(resolved.code);
          return frame;
        }) })) as unknown as R.SpriteDirectionSequences,
      }));
      const first = leases.get('NormalStand1_0')!;
      bridge = E.createScenePreviewBridge(scene, membership.scene.identity, descriptor => cache!.acquire(session!, descriptor, 1,
        first.imageRevision, { maxBytes: 1048576, maxDimension: 2048, maxPixels: 4194304 }, { sampling: 'nearest', colorSpace: 'srgb' }));
      const plane = { ...space.reference, axes: space.axes, unit: space.unit };
      const anchor = { unit: space.unit, anchor: { x: 0, y: 0 }, pivot: { x: 0, y: 0 }, localOffset: { x: 0, y: 0 } };
      const orientation = R.createVisualOrientation2D({ axes: space.axes, zeroAxis: 'positive-x', positiveRotation: 'toward-positive-y', angleRadians: 0 });
      E.describeSceneObjectAlignment(membership, 'subject', space, anchor, orientation);
      const outcomes = await bridge.sync(membership, catalog, () => ({ space, bindingKey: 'initial-preview-only', sourceRevision: first.imageRevision,
        frame: null, layout: { unit: space.unit, x: 0, y: 0, width: 1, height: 1 }, visible: true, order: { layerKey: 'default', order: 0 },
        transform: { local: { translation: { x: 0, y: 0 }, rotationRadians: 0, scale: { x: 1, y: 1 } }, anchor, orientation,
          projection: { kind: 'orthographic-plane', source: plane,
            destination: { projectId, coordinateSpaceId: 'render-clip-2d', unit: 'clip-unit', axes: { x: 'right', y: 'up' } },
            sourceOrigin: { x: 0, y: 0 }, destinationOrigin: { x: -1, y: 1 }, destinationUnitsPerSourceUnit: { x: 2 / 320, y: 2 / 240 } } },
      }));
      if (closed) return;
      const outcome = outcomes[0]!;
      if (outcome.status !== 'applied' || !outcome.instance) throw new TypeError(JSON.stringify(outcome));
      instance = outcome.instance;
      playback = R.createSpriteAnimationPlayback({ clips, clipId: 'idle', directionIndex: 0 });
      binding = R.createSpriteAnimationVisualBinding(session, scene, outcome.instance, playback);
      listen(clipSelect, 'change', () => { R.commandSpriteAnimationPlayback(playback!, { type: 'selectClip', clipId: clipSelect.value }); present(); });
      listen(directionSelect, 'change', () => { R.commandSpriteAnimationPlayback(playback!, { type: 'setDirection', directionIndex: Number(directionSelect.value) as R.SpriteDirectionIndex }); present(); });
      for (const button of root.querySelectorAll<HTMLButtonElement>('[data-command]')) listen(button, 'click', () => {
        const type = button.dataset.command as 'play' | 'pause' | 'resume' | 'stop';
        R.commandSpriteAnimationPlayback(playback!, type === 'play' ? { type, clipId: clipSelect.value } : { type }); present();
      });
      listen(root.querySelector('[data-step]')!, 'click', () => { R.advanceSpriteAnimationPlayback(playback!, Number(delta.value)); present(); });
      listen(document, 'visibilitychange', () => { if (document.hidden) R.commandSpriteAnimationPlayback(playback!, { type: 'pause' }); report(); });
      controls.disabled = false; present();
    } catch (error) {
      if (!closed) { recordError(error); close(); }
      else { failure = { status: 'LATE_CLEANUP_UNCERTAIN', ...R.getRenderVisualDiagnostic(error) }; report(); }
    }
  })();
  // Install lifetime hooks before async graphics/source acquisition.
  listen(root.querySelector('[data-close]')!, 'click', close);
  listen(window, 'pagehide', close);
  report();
  return Object.freeze({ ready, close, inspect });
}

const root = document.querySelector<HTMLElement>('[data-animation-preview]');
if (root) mountEditorAnimationPreview(root);
