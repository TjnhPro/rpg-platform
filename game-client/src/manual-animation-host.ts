// Optional browser host. Reuses Phase6 scheduling and Phase7 source/cache APIs.
import * as R from '@rpg-platform/runtime-render';
import { createClientAnimationPresentation, type ClientAnimationIntent } from './animation-presentation.js';
import { mountClientViewport } from './viewport-host.js';

export interface ClientAnimationPage {
  readonly descriptor: R.VisualResourceDescriptor;
  readonly provider: R.VisualSourceProvider;
  readonly revision: string;
  readonly textureReference: string;
  readonly close: () => void;
}

/** Dedicated canvas, one Scene/instance/playback per mount. Pages are existing
 * selected-File grants; each distinct provider owns its own canonical cache scope.
 * Host Stop/scene switch is terminal close; Pause/Start is explicitly resumable.
 */
export function mountClientAnimationHost(target: HTMLCanvasElement, input: {
  readonly pages: readonly ClientAnimationPage[];
  readonly clips: readonly R.EightWaySpriteClip[];
  readonly initialIntent: ClientAnimationIntent;
}, notify: (event: string, observation: unknown) => void) {
  let closed = false, ready = false, failure: unknown = null;
  let intent = Object.freeze({ clipId: input.initialIntent.clipId, playing: input.initialIntent.playing,
    orientation: R.createVisualOrientation2D(input.initialIntent.orientation) });
  let session: R.RenderFrameSession | undefined, scene: R.RenderVisualScene | undefined;
  let instance: R.RenderVisualInstance | undefined;
  let actor: ReturnType<typeof createClientAnimationPresentation> | undefined;
  let camera: ReturnType<typeof R.createConfiguredRenderCamera> | undefined;
  let cameraBinding: R.RenderCameraSceneBinding | undefined;
  const caches: R.VisualResourceCache[] = [], leases: R.VisualResourceLease[] = [];
  const loads = new Set<R.VisualSourceLoad>();
  const pages = new Map<string, { atlas: R.AtlasMetadata; revision: symbol; imageRevision: string; lease: R.VisualResourceLease }>();
  let submittedDeltas = 0, lastDeltaMs: number | null = null;
  const plane = { projectId: input.clips[0]!.directions[0].frames[0]!.projectId,
    coordinateSpaceId: 'client-animation-ground', unit: 'world-unit', axes: { x: 'right', y: 'down' } } as const;
  const log = (event: string) => { try { notify(event, inspect()); } catch {} };
  const inspect = () => {
    let visual: unknown = null;
    if (!closed && scene && instance) {
      try { visual = { instance: R.getRenderVisualInstanceSnapshot(scene, instance),
        transform: R.getRenderVisualInstanceTransform(scene, instance), resource: R.getRenderVisualInstanceResource(scene, instance) }; }
      catch (error) { visual = R.getRenderVisualDiagnostic(error); }
    }
    return { closed, ready, failure, intent, animation: actor?.inspect() ?? null, visual,
      host: host.getSnapshot(), camera: camera?.getSnapshot(), cameraBinding: cameraBinding?.getSnapshot(),
      caches: caches.map(cache => cache.getSnapshot()), submittedDeltas, lastDeltaMs };
  };
  const release = () => {
    ready = false;
    // Phase6 calls release before its initial acquisition as well as on disposal.
    if (!session) return;
    const errors: unknown[] = [];
    const drain = (action: () => unknown) => { try { action(); } catch (error) { errors.push(R.getRenderVisualDiagnostic(error)); } };
    for (const page of input.pages) drain(page.close);
    for (const load of loads) drain(() => load.release()); loads.clear();
    drain(() => actor?.close()); drain(() => cameraBinding?.dispose()); drain(() => camera?.dispose()); drain(() => scene?.dispose());
    for (const lease of leases) drain(() => { if (lease.release().cleanupFailed) errors.push('LEASE_CLEANUP_UNCERTAIN'); });
    for (const cache of caches) drain(() => { cache.dispose(); if (cache.getSnapshot().cleanupFailed) errors.push('CACHE_CLEANUP_UNCERTAIN'); });
    pages.clear();
    if (errors.length) { failure = { status: 'CLEANUP_UNCERTAIN', errors }; throw new TypeError('Client cleanup uncertain'); }
  };
  const close = () => {
    if (closed) return;
    closed = true; window.removeEventListener('pagehide', close);
    for (const page of input.pages) page.close();
    host.unmount(); log('closed');
  };
  const host = mountClientViewport(target, event => {
    if (event === 'stopped-suspended' && ready && !closed) {
      try { actor?.pause(); } catch (error) { failure = R.getRenderVisualDiagnostic(error); }
    }
    if (!closed && ['terminal-explicit-acquire-required', 'native-loss-event-observe-after-dispatch',
      'stopped-after-rejection', 'not-renderable'].includes(event)) {
      failure = { status: 'HOST_TERMINAL', event, diagnostic: host.getSnapshot().lastFailure };
      close(); return;
    }
    // Finite UI work: frame counters remain inspectable; do not log every frame.
    if (event !== 'submitted' || host.getSnapshot().submissions === 1) log(event);
  }, () => window.devicePixelRatio, {
    acquired(acquired) {
      session = acquired;
      scene = R.createRenderVisualScene(acquired);
      const ownedScene = scene;
      camera = R.createConfiguredRenderCamera({ kind: 'orthographic', source: plane, center: { x: 160, y: 120 },
        scale: { unit: 'css-px-per-source-unit', x: 1, y: 1 }, zoom: 1, viewportPolicy: 'preserve-scale' }, { min: 0.1, max: 10 });
      void (async () => {
        try {
          for (const page of input.pages) {
            if (closed) return;
            const metadata = R.createVisualSourceLoad(page.descriptor, 0, page.provider, 1048576); loads.add(metadata);
            try {
              const loaded = await metadata.start(); if (closed) return;
              if (loaded.state !== 'source-acquired') { failure = { status: 'ASSET_NOT_AVAILABLE', loaded }; close(); return; }
              const parsed = R.parseUnityAtlasMetadata(page.descriptor,
                [{ sourceId: 'metadata', sourceIndex: 0 }, { sourceId: 'image', sourceIndex: 1 }],
                [{ pageId: 'page', metadataSourceId: 'metadata', imageSourceId: 'image', textureReference: page.textureReference, metadata }]);
              if (parsed.status !== 'parsed') throw new TypeError(JSON.stringify(parsed));
              const cache = R.createVisualResourceCache(page.provider, { maxCpuEntries: 1, maxGpuEntries: 1 }); caches.push(cache);
              const lease = cache.acquire(acquired, page.descriptor, 1, page.revision,
                { maxBytes: 1048576, maxDimension: 2048, maxPixels: 4194304 }, { sampling: 'nearest', colorSpace: 'srgb' }); leases.push(lease);
              const result = await lease.result; if (closed) return;
              if (result.state !== 'usable') { failure = { status: 'ASSET_NOT_AVAILABLE', result }; close(); return; }
              if (pages.has(page.descriptor.identity.resourceId)) throw new TypeError('Duplicate presentation resource');
              pages.set(page.descriptor.identity.resourceId, { atlas: parsed.atlas,
                revision: R.getAtlasMetadataRevision(parsed.atlas)!.id, imageRevision: page.revision, lease });
            } finally { metadata.release(); loads.delete(metadata); }
          }
          if (closed) return;
          instance = R.addRenderVisualInstance(ownedScene, { visualInstanceId: 'client-animation-subject' });
          R.setRenderVisualInstanceTransform(ownedScene, instance, {
            placement: { plane, point: { x: 140, y: 90 } },
            local: { translation: { x: 0, y: 0 }, rotationRadians: 0, scale: { x: 1, y: 1 } },
            anchor: { unit: plane.unit, anchor: { x: 0, y: 0 }, pivot: { x: 0, y: 0 }, localOffset: { x: 0, y: 0 } },
            orientation: input.initialIntent.orientation,
            projection: { kind: 'orthographic-plane', source: plane,
              destination: { projectId: plane.projectId, coordinateSpaceId: 'render-clip-2d', unit: 'clip-unit', axes: { x: 'right', y: 'up' } },
              sourceOrigin: { x: 0, y: 0 }, destinationOrigin: { x: -1, y: 1 }, destinationUnitsPerSourceUnit: { x: 2 / 320, y: 2 / 240 } },
          });
          actor = createClientAnimationPresentation({ session: acquired, scene: ownedScene, instance, clips: input.clips,
            clipId: input.initialIntent.clipId, directionIndex: 0, frameInput(frame) {
              const page = pages.get(frame.resourceId); if (!page) throw new TypeError('Frame source unavailable');
              const pixels = page.atlas.pages[0]!;
              return { resource: page.lease, atlas: page.atlas, expectedRevision: page.revision, expectedSourceRevision: page.imageRevision,
                pixels: { imageSourceId: 'image', unit: 'image-pixel', width: pixels.width, height: pixels.height, layout: 'texturepacker-unity-bottom-left' },
                planeUnitsPerPixel: { x: 1, y: 1 }, authored: { reference: frame, revision: page.revision,
                  provenance: 'SA11 explicit inspection top-left(0,0), not anatomical ground or original untrimmed origin',
                  unit: 'image-pixel', origin: 'frame-top-left', groundAnchor: { x: 0, y: 0 }, pivot: { x: 0, y: 0 }, localOffset: { x: 0, y: 0 } } };
            } });
          actor.intent(intent);
          const result = actor.sync(); if (result.status !== 'bound') throw new TypeError(result.code);
          ready = true; log('ready-explicit-start-required');
        } catch (error) {
          if (!closed) { failure = R.getRenderVisualDiagnostic(error); close(); }
          else { failure = { status: 'LATE_CLEANUP_UNCERTAIN', diagnostic: R.getRenderVisualDiagnostic(error) }; log('late-failure'); }
        }
      })();
    },
    configured(_session, receipt, metrics) {
      if (!camera || !scene) throw new TypeError('Camera scene unavailable');
      const logical = { plane: { projectId: plane.projectId, coordinateSpaceId: 'client-animation-css', unit: 'css-px', axes: plane.axes },
        width: metrics.logicalWidthCssPx, height: metrics.logicalHeightCssPx, screen: null };
      if (cameraBinding) cameraBinding.configure(receipt, logical);
      else cameraBinding = R.bindRenderCameraToVisualScene(camera, scene, receipt, logical);
    },
    frame(_session, deltaMs) {
      if (!ready || !actor) throw new TypeError('Animation resources not ready');
      // Recurring intent every host frame is deliberate. The adapter must not reset.
      actor.intent(intent); actor.advance(deltaMs);
      const result = actor.sync(); if (result.status !== 'bound') throw new TypeError(result.code);
      lastDeltaMs = deltaMs; submittedDeltas++;
    }, release,
  });
  window.addEventListener('pagehide', close);
  host.acquire();
  return Object.freeze({ inspect, close,
    start: () => { if (closed || !ready) throw new TypeError('Fresh ready Client mount required'); host.start(); },
    pause: () => { if (!closed) host.stop(); },
    intent(next: ClientAnimationIntent) {
      if (closed || !ready || !actor) throw new TypeError('Client presentation unavailable');
      // Validate/admit through Render before retaining new host intent.
      actor.intent(next);
      intent = Object.freeze({ clipId: next.clipId, playing: next.playing, orientation: R.createVisualOrientation2D(next.orientation) });
      const result = actor.sync(); if (result.status !== 'bound') throw new TypeError(result.code);
      log('intent');
    },
  });
}
