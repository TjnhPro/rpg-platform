// Optional browser composition; portable Client root does not evaluate this file.
import * as R from '@rpg-platform/runtime-render';
import { createClientVfxPresentation, type ClientVfxIntent } from './vfx-presentation.js';
import { mountClientViewport } from './viewport-host.js';

export function mountClientVfxHost(canvas: HTMLCanvasElement, page: {
  readonly descriptor: R.VisualResourceDescriptor; readonly provider: R.VisualSourceProvider;
  readonly revision: string; readonly textureReference: string; readonly close: () => void;
}, notify: () => void) {
  let closed = false, ready = false, loading = false, failure: unknown = null;
  let session: R.RenderFrameSession | undefined, scene: R.RenderVisualScene | undefined;
  let cache: R.VisualResourceCache | undefined, metadata: R.VisualSourceLoad | undefined;
  let target: R.RenderVisualInstance | undefined, targetLease: R.VisualResourceLease | undefined;
  let targetPlayback: R.SpriteSequencePlayback | undefined, targetBinding: R.SpriteSequenceVisualBinding | undefined;
  let actor: ReturnType<typeof createClientVfxPresentation> | undefined;
  let camera: R.RenderCamera | undefined, cameraBinding: R.RenderCameraSceneBinding | undefined;
  let lossTask: ReturnType<typeof setTimeout> | undefined;
  let lastDeltaMs: number | null = null, firstDeltaMs: number | null = null, frameCount = 0;
  let receipt: unknown = null;
  const leases = new Set<R.VisualResourceLease>();
  const plane = { projectId: page.descriptor.identity.projectId, coordinateSpaceId: 'client-vfx-ground',
    unit: 'world-unit', axes: { x: 'right', y: 'down' } } as const;
  const projection = R.createOrthographicPlaneProjection({ kind: 'orthographic-plane', source: plane,
    destination: { projectId: plane.projectId, coordinateSpaceId: 'render-clip-2d', unit: 'clip-unit', axes: { x: 'right', y: 'up' } },
    sourceOrigin: { x: 0, y: 0 }, destinationOrigin: { x: -1, y: 1 }, destinationUnitsPerSourceUnit: { x: 2 / 320, y: 2 / 240 } });
  const world = (x = 210): R.VisualEffectWorldPlacementInput => ({ placement: { plane, point: { x, y: 170 } }, projection,
    anchor: { unit: plane.unit, anchor: { x: 12, y: 50 }, pivot: { x: 12, y: 50 }, localOffset: { x: 0, y: 0 } } });
  const log = () => { try { notify(); } catch (error) { console.error('Client VFX observation', error); } };
  const drain = (actions: readonly (() => unknown)[]) => {
    const errors: unknown[] = [];
    for (const action of actions) try { action(); } catch (error) { errors.push(R.getVisualEffectDiagnostic(error)); }
    if (errors.length) { failure = { status: 'CLEANUP_UNCERTAIN', errors }; throw new TypeError('Client VFX cleanup uncertain'); }
  };
  const releaseLease = (lease: R.VisualResourceLease) => {
    if (!leases.delete(lease)) return;
    if (lease.release().cleanupFailed) throw new TypeError('Client VFX lease cleanup uncertain');
  };
  const removeTarget = () => {
    drain([() => targetBinding?.unbind(),
      () => { if (targetPlayback) R.commandSpriteSequencePlayback(targetPlayback, { type: 'dispose' }); },
      () => { if (target && scene?.getSnapshot().state === 'active') R.removeRenderVisualInstance(scene, target); },
      () => actor?.reconcile(), () => { if (targetLease) releaseLease(targetLease); }]);
    target = undefined; targetLease = undefined; log();
  };
  const release = () => {
    ready = false;
    drain([page.close, () => metadata?.release(), () => actor?.close(), removeTarget,
      ...Array.from(leases, lease => () => releaseLease(lease)), () => cameraBinding?.dispose(),
      () => camera?.dispose(), () => scene?.dispose(), () => {
        cache?.dispose(); if (cache?.getSnapshot().cleanupFailed) throw new TypeError('Client VFX cache cleanup uncertain');
      }]);
  };
  const close = () => {
    if (closed) return;
    closed = true; ready = false;
    if (lossTask !== undefined) clearTimeout(lossTask); lossTask = undefined;
    window.removeEventListener('pagehide', close);
    // Host's initial pre-acquisition release must not revoke the new grant.
    drain([page.close, host.unmount]); log();
  };
  const host = mountClientViewport(canvas, (event, detail) => {
    if (event === 'native-loss-event-observe-after-dispatch') {
      lossTask = setTimeout(() => { lossTask = undefined; if (!closed) {
        failure = session && R.getRenderViewportSnapshot(session).graphics; close();
      } }, 0); return;
    }
    if (event === 'stopped-suspended' && !closed && ready) actor?.pause();
    if (event === 'submitted') { receipt = detail; return; }
    if (!closed && ['stopped-after-rejection', 'terminal-explicit-acquire-required', 'not-renderable'].includes(event)) {
      failure = { status: 'HOST_TERMINAL', event, detail }; close(); return;
    }
    log();
  }, () => window.devicePixelRatio, {
    acquired(current) {
      session = current; scene = R.createRenderVisualScene(current);
      cache = R.createVisualResourceCache(page.provider, { maxCpuEntries: 1, maxGpuEntries: 1 });
      camera = R.createConfiguredRenderCamera({ kind: 'orthographic', source: plane, center: { x: 160, y: 120 },
        scale: { unit: 'css-px-per-source-unit', x: 1, y: 1 }, zoom: 1, viewportPolicy: 'preserve-scale' }, { min: .5, max: 4 });
      void prepare(current, scene, cache);
    },
    configured(_session, accepted, metrics) {
      const viewport = { plane: { projectId: plane.projectId, coordinateSpaceId: 'client-vfx-css', unit: 'css-px', axes: plane.axes },
        width: metrics.logicalWidthCssPx, height: metrics.logicalHeightCssPx, screen: null };
      if (cameraBinding) cameraBinding.configure(accepted, viewport);
      else cameraBinding = R.bindRenderCameraToVisualScene(camera!, scene!, accepted, viewport);
    },
    frame(_session, deltaMs) {
      if (!ready || !actor) throw new TypeError('Client VFX not ready');
      firstDeltaMs ??= deltaMs; lastDeltaMs = deltaMs; frameCount++;
      actor.advance(deltaMs);
    },
    release: () => { if (session) release(); },
  });
  async function prepare(current: R.RenderFrameSession, ownedScene: R.RenderVisualScene, ownedCache: R.VisualResourceCache) {
    loading = true; log();
    const load = metadata = R.createVisualSourceLoad(page.descriptor, 0, page.provider, 1048576);
    try {
      const source = await load.start(); if (closed) return;
      if (source.state !== 'source-acquired') { failure = source; close(); return; }
      const parsed = R.parseUnityAtlasMetadata(page.descriptor,
        [{ sourceId: 'metadata', sourceIndex: 0 }, { sourceId: 'image', sourceIndex: 1 }],
        [{ pageId: 'page', metadataSourceId: 'metadata', imageSourceId: 'image', textureReference: page.textureReference, metadata: load }]);
      if (parsed.status !== 'parsed') { failure = parsed; close(); return; }
      const atlas = parsed.atlas, revision = R.getAtlasMetadataRevision(atlas)!.id;
      const definitions = new Map(['impact-fire', 'aura'].map(reference => {
        const definition = R.createVisualEffectDefinition({ effectId: `sample-${reference}`, kind: 'sprite-sequence', resource: page.descriptor,
          clip: { clip: { clipId: reference, sequence: { frames: ['0000', '0002'].map(subresourceId => R.createVisualFrameReference({ ...page.descriptor.identity, subresourceId })) } },
            timing: { frameIntervalMs: 125 }, repeat: reference === 'aura' ? 'repeat' : 'once' },
          sources: [{ sourceId: 'metadata', sourceIndex: 0, revision: source.source.revision }, { sourceId: 'image', sourceIndex: 1, revision: page.revision }] });
        const resolved = R.resolveVisualEffectDefinition(definition, { atlas, expectedRevision: revision,
          pages: atlas.pages.map(value => ({ imageSourceId: value.imageSourceId, width: value.width, height: value.height,
            unit: 'image-pixel', layout: 'texturepacker-unity-bottom-left' })) });
        if (resolved.status !== 'resolved') throw new TypeError(JSON.stringify(resolved));
        return [reference, definition] as const;
      }));
      const acquireLease = () => {
        const lease = ownedCache.acquire(current, page.descriptor, 1, page.revision,
          { maxBytes: 1048576, maxDimension: 2048, maxPixels: 4194304 }, { sampling: 'nearest', colorSpace: 'srgb' });
        leases.add(lease); return lease;
      };
      const frameInput = (lease: R.VisualResourceLease, reference: R.VisualFrameReference): R.VisualEffectFrameInput => ({
        resource: lease, atlas, expectedRevision: revision, expectedSourceRevision: page.revision,
        pixels: { imageSourceId: 'image', unit: 'image-pixel', width: atlas.pages[0]!.width, height: atlas.pages[0]!.height, layout: 'texturepacker-unity-bottom-left' },
        planeUnitsPerPixel: { x: 1, y: 1 }, authored: { reference, revision,
          provenance: 'VE11 explicit original frame-local anchor12,50; no anatomical/untrimmed guarantee',
          unit: 'image-pixel', origin: 'frame-top-left', groundAnchor: { x: 12, y: 50 }, pivot: { x: 12, y: 50 }, localOffset: { x: 0, y: 0 } } });
      const lease = targetLease = acquireLease();
      const result = await lease.result; if (closed) return;
      if (result.state !== 'usable') { failure = result; close(); return; }
      target = R.addRenderVisualInstance(ownedScene, { visualInstanceId: 'client-vfx-subject' });
      R.setRenderVisualInstanceTransform(ownedScene, target, { ...world(110),
        local: { translation: { x: 0, y: 0 }, rotationRadians: 0, scale: { x: 1, y: 1 } },
        orientation: { axes: plane.axes, zeroAxis: 'positive-x', positiveRotation: 'toward-positive-y', angleRadians: 0 } });
      targetPlayback = R.createSpriteSequencePlayback({ clips: [definitions.get('aura')!.clip], clipId: 'aura' });
      targetBinding = R.createSpriteSequenceVisualBinding(current, ownedScene, target, targetPlayback);
      targetBinding.sync(frameInput(lease, R.getSpriteSequencePlaybackSnapshot(targetPlayback).frame));
      actor = createClientVfxPresentation({ session: current, scene: ownedScene, acquire(reference) {
        const definition = definitions.get(reference);
        if (!definition) throw new TypeError('UNRESOLVED_EFFECT_REFERENCE');
        const owned = acquireLease(); let released = false;
        return { result: owned.result.then(result => {
          if (result.state !== 'usable') throw new TypeError(`Client VFX resource ${result.state}`);
          return { definition, frameInput: frame => frameInput(owned, frame) };
        }), release() { if (released) return; released = true; releaseLease(owned); } };
      } });
      ready = true;
    } catch (error) {
      failure = R.getVisualEffectDiagnostic(error); if (!closed) close();
    } finally { load.release(); loading = false; log(); }
  }
  window.addEventListener('pagehide', close); host.acquire();
  return Object.freeze({ close, removeTarget, world,
    inspect: () => ({ closed, ready, loading, failure, targetAvailable: !!target && scene?.getSnapshot().state === 'active',
      presentation: actor?.inspect(), cache: cache?.getSnapshot(), scene: scene && R.getRenderVisualSceneDiagnostics(scene),
      host: host.getSnapshot(), firstDeltaMs, lastDeltaMs, frameCount, lastFrameReceipt: receipt, pixels: 'NOT_VERIFIED' }),
    start() { if (closed || !ready) throw new TypeError('Fresh ready Client mount required'); firstDeltaMs = null; actor!.resume(); host.start(); },
    pause() { if (!closed) host.stop(); },
    intent(intent: ClientVfxIntent) { if (closed || !ready) throw new TypeError('Client VFX unavailable'); return actor!.intent(intent).finally(log); },
    attachPlacement() { if (!target) throw new TypeError('PREVIEW_TARGET_UNAVAILABLE'); return { mode: 'attachment' as const, world: world(110), target, offset: { x: 35, y: 0 } }; },
  });
}
