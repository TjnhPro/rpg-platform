// Optional Editor browser composition; deliberately absent from the portable root.
import * as E from '@rpg-platform/editor';
import * as R from '@rpg-platform/runtime-render';
import { mountEditorViewport } from './viewport-host.js';

interface PreviewEffect {
  readonly label: string;
  readonly effectId: string;
  readonly reference: E.AssetReference;
  readonly frames: readonly string[];
  readonly frameIntervalMs: number;
  readonly repeat: 'once' | 'repeat';
}

/** Authored identity crosses to Render only through the existing Asset adapter.
 * Timing/frame slots here are explicit preview config, never inferred metadata. */
export function mountEditorVfxPreview(root: HTMLElement, input: {
  readonly catalog: E.AssetCatalog;
  readonly membership: E.SceneMembership;
  readonly space: E.CoordinateSpaceDefinition;
  readonly effects: readonly PreviewEffect[];
  readonly provider: R.VisualSourceProvider;
  readonly closeSources: () => void;
}) {
  const canvas = root.querySelector<HTMLCanvasElement>('canvas')!;
  const status = root.querySelector<HTMLElement>('[data-status]')!;
  const select = root.querySelector<HTMLSelectElement>('[data-effect]')!;
  const controls = root.querySelector<HTMLFieldSetElement>('fieldset')!;
  const field = (key: string) => Number(root.querySelector<HTMLInputElement>(`[data-${key}]`)!.value);
  input.effects.forEach((effect, index) => select.add(new Option(effect.label, String(index))));
  const documentSession = E.createDocumentSession(E.createDocumentEnvelope({ schemaVersion: 1,
    identity: { projectId: input.catalog.projectId, documentId: 'vfx-preview-content' },
    documentKind: 'manual:vfx-preview', contentSchemaVersion: null,
    content: { catalog: input.catalog, membership: input.membership, effects: input.effects },
  }), null);
  documentSession.open();
  const initial = documentSession.getSnapshot();
  const plane = { ...input.space.reference, axes: input.space.axes, unit: input.space.unit };
  const projection = R.createOrthographicPlaneProjection({ kind: 'orthographic-plane', source: plane,
    destination: { projectId: plane.projectId, coordinateSpaceId: 'render-clip-2d', unit: 'clip-unit', axes: { x: 'right', y: 'up' } },
    sourceOrigin: { x: 0, y: 0 }, destinationOrigin: { x: -1, y: 1 }, destinationUnitsPerSourceUnit: { x: 2 / 320, y: 2 / 240 } });
  let closed = false, generation = 0, loading = false;
  let lossCallback: ReturnType<typeof setTimeout> | undefined;
  let loadState = 'not-started', failure: unknown = null, frameResult: unknown = null, receipt: unknown = null;
  let session: R.RenderFrameSession | undefined, scene: R.RenderVisualScene | undefined;
  let cache: R.VisualResourceCache | undefined, camera: R.RenderCamera | undefined, cameraBinding: R.RenderCameraSceneBinding | undefined;
  let effect: R.VisualEffectInstance | undefined, target: R.RenderVisualInstance | undefined;
  let targetPlayback: R.SpriteSequencePlayback | undefined, targetBinding: R.SpriteSequenceVisualBinding | undefined;
  let loaded: { definition: R.VisualEffectDefinition; atlas: R.AtlasMetadata; revision: symbol;
    lease: R.VisualResourceLease; imageRevision: string } | undefined;
  const loads = new Set<R.VisualSourceLoad>(), leases = new Set<R.VisualResourceLease>();
  const listeners: (() => void)[] = [];
  const inspect = () => {
    const authored = documentSession.getSnapshot();
    return { closed, loading, loadState, failure, lastFrameResult: frameResult, lastFrameReceipt: receipt, pixels: 'NOT_VERIFIED',
      effect: effect ? R.getVisualEffectDiagnosticsSnapshot(effect) : null,
      playback: effect ? R.getVisualEffectLifetimeSnapshot(effect) : null,
      targetAvailable: !!target && scene?.getSnapshot().state === 'active',
      authored: { revision: authored.currentRevision, dirty: authored.isDirty,
        sameEnvelope: authored.envelope === initial.envelope, sameRevision: authored.currentRevision === initial.currentRevision,
        sameDirty: authored.isDirty === initial.isDirty },
      cache: cache?.getSnapshot(), scene: scene && R.getRenderVisualSceneDiagnostics(scene), host: host.getSnapshot() };
  };
  const report = () => { status.textContent = JSON.stringify(inspect(), (_, value) => typeof value === 'symbol' ? String(value) : value, 2); };
  const diagnose = (error: unknown) => { console.error('Editor VFX preview', error); failure = R.getVisualEffectDiagnostic(error); report(); };
  const attemptAll = (actions: readonly (() => unknown)[]) => {
    let first: { error: unknown } | undefined;
    for (const action of actions) { try { action(); } catch (error) { first ??= { error }; } }
    if (first) throw first.error;
  };
  const remove = () => { if (effect && scene) R.removeVisualEffectInstance(scene, effect); };
  const releaseSelection = () => {
    const owned = loaded; loaded = undefined;
    attemptAll([remove, () => targetBinding?.unbind(),
      () => targetPlayback && R.commandSpriteSequencePlayback(targetPlayback, { type: 'dispose' }),
      () => { if (target && scene?.getSnapshot().state === 'active') R.removeRenderVisualInstance(scene, target); },
      () => { if (owned) { owned.lease.release(); leases.delete(owned.lease); } }]);
    target = undefined; targetBinding = undefined; targetPlayback = undefined;
  };
  const release = () => {
    generation++;
    attemptAll([releaseSelection, ...Array.from(loads, load => () => load.release()),
      ...Array.from(leases, lease => () => lease.release()), () => cameraBinding?.dispose(),
      () => camera?.dispose(), () => scene?.dispose(), () => cache?.dispose()]);
  };
  const host = mountEditorViewport(canvas, (event, detail) => {
    // The owner broadcast may still be draining scene membership in this event.
    if (event === 'native-loss-event-observe-after-dispatch') return;
    if (event === 'submitted') receipt = (detail as { receipt: unknown }).receipt;
    if (event === 'request-rejected') failure = detail;
    report();
  }, () => window.devicePixelRatio, {
    acquired(current) {
      session = current; scene = R.createRenderVisualScene(current);
      cache = R.createVisualResourceCache(input.provider, { maxCpuEntries: 2, maxGpuEntries: 2 });
      camera = R.createConfiguredRenderCamera({ kind: 'orthographic', source: plane,
        center: { x: 160, y: 120 }, scale: { unit: 'css-px-per-source-unit', x: 1, y: 1 }, zoom: 1,
        viewportPolicy: 'preserve-scale' }, { min: .5, max: 4 });
      void choose();
    },
    configured(_current, accepted, metrics) {
      const viewport = { plane: { projectId: plane.projectId, coordinateSpaceId: 'editor-vfx-css', unit: 'css-px', axes: { x: 'right', y: 'down' } } as const,
        width: metrics.logicalWidthCssPx, height: metrics.logicalHeightCssPx, screen: null };
      if (cameraBinding) cameraBinding.configure(accepted, viewport);
      else cameraBinding = R.bindRenderCameraToVisualScene(camera!, scene!, accepted, viewport);
    }, release,
  });
  const offset = () => ({ x: field('offset-x'), y: field('offset-y') });
  const placement = (point: { x: number; y: number }, localOffset = offset()): R.VisualEffectWorldPlacementInput => ({
    placement: { plane, point }, projection,
    anchor: { unit: plane.unit, anchor: { x: 12, y: 50 }, pivot: { x: 12, y: 50 }, localOffset },
  });
  const frameInput = (reference: R.VisualFrameReference, localOffset = offset()): R.VisualEffectFrameInput => {
    if (!loaded) throw new TypeError('No loaded preview asset');
    const page = loaded.atlas.pages[0]!;
    return { resource: loaded.lease, atlas: loaded.atlas, expectedRevision: loaded.revision, expectedSourceRevision: loaded.imageRevision,
      pixels: { imageSourceId: 'image', unit: 'image-pixel', width: page.width, height: page.height, layout: 'texturepacker-unity-bottom-left' },
      planeUnitsPerPixel: { x: 1, y: 1 }, authored: { reference, revision: loaded.revision,
        provenance: 'VE10 explicit inspected frame-local anchor12,50; no anatomical or untrimmed guarantee', unit: 'image-pixel',
        origin: 'frame-top-left', groundAnchor: { x: 12, y: 50 }, pivot: { x: 12, y: 50 }, localOffset } };
  };
  const present = () => {
    if (closed || !effect || !loaded) return;
    if (R.getVisualEffectInstanceSnapshot(effect).state === 'created') {
      R.syncVisualEffectAttachment(effect);
      frameResult = R.syncVisualEffectFrame(effect, frameInput(R.getVisualEffectPlaybackSnapshot(effect).playback.frame));
    }
    host.requestFrame(); report();
  };
  const create = () => {
    if (!loaded || !scene || !session) throw new TypeError('Effect asset is not ready');
    remove();
    effect = R.createVisualEffectInstance(session, scene, { definition: loaded.definition, visualInstanceId: 'preview-effect' });
    R.setVisualEffectWorldPlacement(effect, placement({ x: field('world-x'), y: field('world-y') }));
    frameResult = null; present();
  };
  async function choose() {
    if (closed || loading || !cache || !session || !scene) return;
    loading = true; controls.disabled = true; select.disabled = true;
    const ticket = ++generation;
    const live = () => !closed && generation === ticket;
    let metadata: R.VisualSourceLoad | undefined, imageLoad: R.VisualSourceLoad | undefined;
    let acquiredLease: R.VisualResourceLease | undefined;
    try {
      releaseSelection(); effect = undefined; failure = null; frameResult = null; receipt = null;
      host.requestFrame();
      loadState = 'loading'; report();
      const config = input.effects[Number(select.value)];
      if (!config) throw new TypeError('Unknown preview selection');
      const resolution = E.resolveAssetReference(input.catalog, config.reference);
      const visual = E.describeResolvedVisualAsset(resolution, 'image/png');
      if (visual.status !== 'described') { loadState = 'unresolved'; failure = { ...visual, resolution }; return; }
      const descriptor = visual.descriptor;
      metadata = R.createVisualSourceLoad(descriptor, 0, input.provider, 1048576); loads.add(metadata);
      const observed = await metadata.start(); if (!live()) return;
      if (observed.state !== 'source-acquired') { loadState = 'failed'; failure = observed; return; }
      const parsed = R.parseUnityAtlasMetadata(descriptor, [{ sourceId: 'metadata', sourceIndex: 0 }, { sourceId: 'image', sourceIndex: 1 }],
        [{ pageId: 'page', metadataSourceId: 'metadata', imageSourceId: 'image', textureReference: `${config.reference.assetId}.png`, metadata }]);
      if (parsed.status !== 'parsed') { loadState = 'failed'; failure = parsed; return; }
      imageLoad = R.createVisualSourceLoad(descriptor, 1, input.provider, 1048576); loads.add(imageLoad);
      const image = await imageLoad.start(); if (!live()) return;
      if (image.state !== 'source-acquired') { loadState = 'failed'; failure = image; return; }
      const definition = R.createVisualEffectDefinition({ effectId: config.effectId, kind: 'sprite-sequence', resource: descriptor,
        clip: { clip: { clipId: config.effectId, sequence: { frames: config.frames.map(subresourceId => R.createVisualFrameReference({ ...descriptor.identity, subresourceId })) } },
          timing: { frameIntervalMs: config.frameIntervalMs }, repeat: config.repeat },
        sources: [{ sourceId: 'metadata', sourceIndex: 0, revision: observed.source.revision }, { sourceId: 'image', sourceIndex: 1, revision: image.source.revision }] });
      const revision = R.getAtlasMetadataRevision(parsed.atlas)!.id;
      const resolved = R.resolveVisualEffectDefinition(definition, { atlas: parsed.atlas, expectedRevision: revision,
        pages: parsed.atlas.pages.map(page => ({ imageSourceId: page.imageSourceId, width: page.width, height: page.height,
          unit: 'image-pixel', layout: 'texturepacker-unity-bottom-left' })) });
      if (resolved.status !== 'resolved') { loadState = 'failed'; failure = resolved; return; }
      const lease = acquiredLease = cache.acquire(session, descriptor, 1, image.source.revision,
        { maxBytes: 1048576, maxDimension: 2048, maxPixels: 4194304 }, { sampling: 'nearest', colorSpace: 'srgb' });
      leases.add(lease);
      const resource = await lease.result;
      if (!live()) { lease.release(); leases.delete(lease); return; }
      if (resource.state !== 'usable') { lease.release(); leases.delete(lease); loadState = 'failed'; failure = resource; return; }
      loaded = { definition, atlas: parsed.atlas, revision, lease, imageRevision: image.source.revision };
      // Target is optional and must originate in the existing authored Scene bridge.
      const authored = input.membership.objects[0];
      if (authored) {
        const described = E.describeSceneObjectVisual(input.membership, authored.definition.objectId, input.catalog, 'image/png');
        if (described.status === 'described' && described.placement?.coordinateSpaceId === plane.coordinateSpaceId
          && described.descriptor.identity.resourceId === descriptor.identity.resourceId) {
          target = R.addRenderVisualInstance(scene, { visualInstanceId: 'preview-target' });
          R.setRenderVisualInstanceTransform(scene, target, { ...placement(described.placement.point, { x: 0, y: 0 }),
            local: { translation: { x: 0, y: 0 }, rotationRadians: 0, scale: { x: 1, y: 1 } },
            orientation: { axes: plane.axes, zeroAxis: 'positive-x', positiveRotation: 'toward-positive-y', angleRadians: 0 } });
          targetPlayback = R.createSpriteSequencePlayback({ clips: [definition.clip], clipId: definition.clip.clip.clipId });
          targetBinding = R.createSpriteSequenceVisualBinding(session, scene, target, targetPlayback);
          targetBinding.sync(frameInput(R.getSpriteSequencePlaybackSnapshot(targetPlayback).frame, { x: 0, y: 0 }));
        }
      }
      loadState = 'ready'; // A loaded asset is separate from a created/playing effect.
      host.requestFrame();
    } catch (error) {
      if (live()) { loadState = 'failed'; diagnose(error); }
    } finally {
      try {
        attemptAll([
          () => { if (acquiredLease && loaded?.lease !== acquiredLease) { acquiredLease.release(); leases.delete(acquiredLease); } },
          ...[metadata, imageLoad].filter((load): load is R.VisualSourceLoad => !!load)
            .map(load => () => { load.release(); loads.delete(load); }),
        ]);
      } catch (error) {
        console.error('Editor VFX source cleanup', error);
        failure = { status: 'CLEANUP_UNCERTAIN', ...R.getVisualEffectDiagnostic(error) };
      }
      loading = false; controls.disabled = closed || !loaded; select.disabled = closed; report();
    }
  }
  const listen = (target: EventTarget, type: string, action: () => void) => {
    const listener = () => { if (closed) return; try { action(); } catch (error) { diagnose(error); } };
    target.addEventListener(type, listener); listeners.push(() => target.removeEventListener(type, listener));
  };
  const close = () => {
    if (closed) return;
    closed = true; loadState = 'closed'; generation++; controls.disabled = true; select.disabled = true;
    if (lossCallback !== undefined) clearTimeout(lossCallback);
    lossCallback = undefined;
    for (const removeListener of listeners) removeListener(); listeners.length = 0;
    try { attemptAll([input.closeSources, host.unmount]); }
    catch (error) { failure = { status: 'CLEANUP_UNCERTAIN', ...R.getVisualEffectDiagnostic(error) }; }
    report();
  };
  listen(select, 'change', () => { void choose(); });
  listen(root.querySelector('[data-create]')!, 'click', create);
  for (const button of root.querySelectorAll<HTMLButtonElement>('[data-command]')) listen(button, 'click', () => {
    if (!effect) throw new TypeError('Create an effect first');
    const type = button.dataset.command as R.VisualEffectPlaybackCommand['type'];
    if (type === 'resume') host.resume();
    R.commandVisualEffectPlayback(effect, { type }); present();
  });
  listen(root.querySelector('[data-step]')!, 'click', () => {
    if (document.hidden || host.getSnapshot().paused) throw new TypeError('Explicit visible viewport resume required');
    if (!effect) throw new TypeError('Create an effect first');
    R.advanceVisualEffectInstance(effect, field('delta')); present();
  });
  listen(root.querySelector('[data-place]')!, 'click', () => {
    if (!effect) throw new TypeError('Create an effect first');
    R.detachVisualEffectInstance(effect);
    R.setVisualEffectWorldPlacement(effect, placement({ x: field('world-x'), y: field('world-y') })); present();
  });
  listen(root.querySelector('[data-attach]')!, 'click', () => {
    if (!effect || !target) { failure = { code: 'PREVIEW_TARGET_UNAVAILABLE' }; report(); return; }
    R.attachVisualEffectInstance(effect, { target, localOffset: offset(), inheritance: 'translation-only' }); present();
  });
  listen(root.querySelector('[data-remove]')!, 'click', () => { remove(); host.requestFrame(); report(); });
  listen(root.querySelector('[data-close]')!, 'click', close);
  listen(window, 'pagehide', close);
  listen(canvas, 'webglcontextlost', () => {
    // Observe after Render's canonical terminal handler, then revoke host IO.
    // A microtask can run between native listeners. Use one cancellable host
    // task so Render's terminal broadcast has completed before any cleanup.
    lossCallback = setTimeout(() => {
      lossCallback = undefined;
      if (!closed) { failure = session && R.getRenderViewportSnapshot(session).graphics; close(); }
    }, 0);
  });
  listen(document, 'visibilitychange', () => {
    if (document.hidden && effect && R.getVisualEffectPlaybackSnapshot(effect).playback.state === 'playing') R.commandVisualEffectPlayback(effect, { type: 'pause' });
    report(); // Phase6 suspends; returning visible does not resume or catch up.
  });
  report(); host.start();
  return Object.freeze({ close, inspect });
}
