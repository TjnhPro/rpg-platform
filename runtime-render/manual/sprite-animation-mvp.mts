// Optional manual public-root consumer. No production API, clock or test program.
import * as R from '@rpg-platform/runtime-render';

interface SourceFile { path: string; sha256: string; bytes: number }
interface Page { slot: number; name: string; files: [SourceFile, SourceFile]; frames: string[] }
interface Content { projectId: string; limitations: string[]; resources: { resourceId: string; pages: Page[] }[] }
const status = document.querySelector<HTMLElement>('[data-status]')!;
const controls = document.querySelector<HTMLFieldSetElement>('[data-controls]')!;
const actorSelect = document.querySelector<HTMLSelectElement>('[data-actor]')!;
const clipSelect = document.querySelector<HTMLSelectElement>('[data-clip]')!;
const direction = document.querySelector<HTMLSelectElement>('[data-direction]')!;
const delta = document.querySelector<HTMLInputElement>('[data-delta]')!;
const limits = { maxBytes: 1048576, maxDimension: 2048, maxPixels: 4194304 };
const axes = { x: 'right', y: 'down' } as const;
const angles = [0, Math.PI / 4, Math.PI / 2, 3 * Math.PI / 4, Math.PI, 5 * Math.PI / 4, 3 * Math.PI / 2, 7 * Math.PI / 4];
const facing = (slot: number) => R.createVisualOrientation2D({ axes, zeroAxis: 'positive-x', positiveRotation: 'toward-positive-y', angleRadians: angles[slot]! });
// Manually authored after enlarged source BODY/foot-line inspection, not source
// pivot normalization or inferred original untrimmed layout. X12 is an authored
// reference, not a reconstructed anatomical center. Y is the inspected sole line.
const footLines: Record<string, readonly (readonly number[])[]> = {
  'player-idle': [
    [65,65,65,65,65,65,65,65], [68,68,68,68,68,68,68],
    [65,65,65,65,65,65,65,65], [63,63,63,63,63,63,63],
    [61,61,61,61,61,61,61,61], [64,64,64,64,64,64,64],
    [66,66,66,66,66,66,66,66], [66,66,66,66,66,66,66]],
  'player-walk': [
    [67,67,64,66,66,66,63,67], [67,67,65,64,63,62,67],
    [63,65,65,65,63,63,64,65], [63,62,64,64,64,61,62],
    [65,66,62,63,65,62,63,64], [65,65,61,61,62,63,64],
    [63,63,64,64,63,64,65,64], [65,63,66,67,67,65,63]],
};
let content: Content | undefined, cache: R.VisualResourceCache | undefined;
let closed = false, ready = false, failure: unknown = null, observation: unknown = null;
const abort = new AbortController();
const loads = new Set<R.VisualSourceLoad>();
const sessions: R.RenderFrameSession[] = [], scenes: R.RenderVisualScene[] = [];
const cameras: ReturnType<typeof R.createConfiguredRenderCamera>[] = [];
const cameraBindings: R.RenderCameraSceneBinding[] = [];
const ended = new Set<number>();
type Resource = { descriptor: R.VisualResourceDescriptor; atlas: R.AtlasMetadata; revision: symbol; pages: Page[] };
const resources = new Map<string, Resource>();
type Actor = { key: string; sessionIndex: number; instance: R.RenderVisualInstance; playback: R.SpriteAnimationPlayback;
  binding: R.SpriteAnimationVisualBinding; leases: Map<string, R.VisualResourceLease>; closed: boolean };
const actors: Actor[] = [];
const leaseKey = (resourceId: string, slot: number) => `${resourceId}/${slot}`;
const inspect = () => ({ closed, ready, failure, observation, limitations: content?.limitations,
  cache: cache?.getSnapshot(), sessions: sessions.map(R.getRenderViewportSnapshot),
  actors: actors.map(actor => {
    let visual: unknown = null;
    if (!actor.closed && !ended.has(actor.sessionIndex)) {
      const scene = scenes[actor.sessionIndex]!;
      visual = { resource: R.getRenderVisualInstanceResource(scene, actor.instance),
        transform: R.getRenderVisualInstanceTransform(scene, actor.instance) };
    }
    return { key: actor.key, closed: actor.closed, playback: R.getSpriteAnimationPlaybackSnapshot(actor.playback), visual };
  }) });
function report() { status.textContent = JSON.stringify(inspect(), (_, value) => typeof value === 'symbol' ? String(value) : value, 2); }
function selected() {
  const actor = actors.find(item => item.key === actorSelect.value);
  if (!actor || actor.closed || ended.has(actor.sessionIndex)) throw new TypeError('Actor closed; reload for new scope');
  return actor;
}
function releaseActor(actor: Actor) {
  if (actor.closed) return;
  actor.closed = true;
  try { actor.binding.unbind(); }
  finally {
    try { R.commandSpriteAnimationPlayback(actor.playback, { type: 'dispose' }); }
    finally {
      try { if (!ended.has(actor.sessionIndex)) R.removeRenderVisualInstance(scenes[actor.sessionIndex]!, actor.instance); }
      finally { for (const lease of actor.leases.values()) lease.release(); }
    }
  }
}
function closeSession(index: number) {
  if (ended.has(index)) return;
  const errors: unknown[] = [];
  const drain = (action: () => unknown) => { try { action(); } catch (error) { errors.push(R.getRenderVisualDiagnostic(error)); } };
  for (const actor of actors.filter(item => item.sessionIndex === index)) drain(() => releaseActor(actor));
  ended.add(index);
  drain(() => cameraBindings[index]?.dispose()); drain(() => cameras[index]?.dispose());
  drain(() => scenes[index]?.dispose()); drain(() => sessions[index]?.dispose());
  if (errors.length) failure = { status: 'CLEANUP_UNCERTAIN', errors };
}
function close() {
  if (closed) return;
  closed = true; ready = false; controls.disabled = true; abort.abort();
  window.removeEventListener('pagehide', close);
  for (const load of loads) load.release(); loads.clear();
  for (let index = 0; index < sessions.length; index++) closeSession(index);
  cache?.dispose(); report();
}
window.addEventListener('pagehide', close);

function frameInput(actor: Actor): R.SpriteAnimationVisualFrameInput {
  const snapshot = R.getSpriteAnimationPlaybackSnapshot(actor.playback), frame = snapshot.frame;
  const resource = resources.get(frame.resourceId)!;
  const page = resource.pages[snapshot.directionIndex]!;
  const atlasPage = resource.atlas.pages[snapshot.directionIndex]!;
  const pixelAnchor = actor.key === 'P'
    ? [12, footLines[frame.resourceId]![snapshot.directionIndex]![snapshot.frameIndex]!] : [0, 0];
  return { resource: actor.leases.get(leaseKey(frame.resourceId, snapshot.directionIndex))!,
    expectedSourceRevision: page.files[1].sha256, atlas: resource.atlas, expectedRevision: resource.revision,
    pixels: { imageSourceId: `image-${snapshot.directionIndex}`, unit: 'image-pixel', width: atlasPage.width, height: atlasPage.height, layout: 'texturepacker-unity-bottom-left' },
    planeUnitsPerPixel: { x: 1, y: 1 }, authored: { reference: frame, revision: resource.revision,
      provenance: actor.key === 'P'
        ? 'SA12 enlarged BODY foot-line inspection; authored x12 reference, explicit per-frame sole Y; not original pivot'
        : 'SA12 explicit inspection top-left0,0; anatomical origin UNKNOWN',
      unit: 'image-pixel', origin: 'frame-top-left', groundAnchor: { x: pixelAnchor[0]!, y: pixelAnchor[1]! },
      pivot: { x: pixelAnchor[0]!, y: pixelAnchor[1]! }, localOffset: { x: 0, y: 0 } } };
}
function present(actor: Actor) {
  const result = actor.binding.sync(frameInput(actor));
  observation = result;
  if (result.status !== 'bound') throw new TypeError(result.code);
}
function draw(index: number) { if (!ended.has(index)) sessions[index]!.renderFrame(); }
function action(selector: string, work: () => void) {
  document.querySelector(selector)!.addEventListener('click', () => {
    if (closed) return;
    try {
      if (!ready && selector !== '[data-close]' && selector !== '[data-observe]') throw new TypeError('Wait for resource readiness');
      if (selector !== '[data-observe]') failure = null;
      work();
    } catch (error) { failure = { status: 'MANUAL_COMMAND_REJECTED', ...R.getRenderVisualDiagnostic(error), message: String(error) }; }
    report();
  });
}
action('[data-observe]', () => {});
action('[data-close]', close);
action('[data-close-main]', () => closeSession(0));
action('[data-release]', () => { const actor = selected(); releaseActor(actor); draw(actor.sessionIndex); });
action('[data-select]', () => { const actor = selected(); R.commandSpriteAnimationPlayback(actor.playback, { type: 'selectClip', clipId: clipSelect.value }); present(actor); draw(actor.sessionIndex); });
action('[data-facing]', () => {
  const actor = selected(), before = R.getSpriteAnimationPlaybackSnapshot(actor.playback);
  const clip = clipsFor(actor.key).find(item => item.clipId === before.clipId)!;
  const slot = R.selectEightWaySpriteDirection(clip.convention, facing(Number(direction.value)));
  R.commandSpriteAnimationPlayback(actor.playback, { type: 'setDirection', directionIndex: slot }); present(actor); draw(actor.sessionIndex);
});
for (const command of ['play', 'pause', 'resume', 'stop'] as const) action(`[data-command=${command}]`, () => {
  const actor = selected(), before = R.getSpriteAnimationPlaybackSnapshot(actor.playback);
  R.commandSpriteAnimationPlayback(actor.playback, command === 'play' ? { type: command, clipId: before.clipId } : { type: command }); present(actor); draw(actor.sessionIndex);
});
action('[data-step]', () => { const actor = selected(); observation = R.advanceSpriteAnimationPlayback(actor.playback, Number(delta.value)); present(actor); draw(actor.sessionIndex); });
action('[data-step-main]', () => { for (const actor of actors.filter(item => item.sessionIndex === 0 && !item.closed)) { R.advanceSpriteAnimationPlayback(actor.playback, Number(delta.value)); present(actor); } draw(0); });
action('[data-missing-origin]', () => { const actor = selected(); observation = actor.binding.sync({ ...frameInput(actor), authored: null }); });
action('[data-missing-frame]', () => {
  const actor = selected(), before = R.getSpriteAnimationPlaybackSnapshot(actor.playback), input = frameInput(actor);
  observation = R.resolveAtlasFrame({ ...before.frame, subresourceId: 'SA12-absent-source-key' }, input.atlas, input.expectedRevision);
});
const clipSets = new Map<string, readonly R.EightWaySpriteClip[]>();
const clipsFor = (key: string) => clipSets.get(key === 'P' ? 'player' : 'monster')!;

void (async () => {
  try {
    content = await (await fetch('/content.json', { signal: abort.signal })).json() as Content;
    if (closed) return;
    const descriptors = new Map(content.resources.map(resource => [resource.resourceId,
      R.prepareVisualResource({ identity: { projectId: content!.projectId, resourceId: resource.resourceId }, mediaType: null,
        sources: resource.pages.flatMap(page => page.files.map((file, index) => ({ role: index === 0 ? 'atlas-metadata' : 'image', locator: { type: 'project-relative' as const, path: file.path } }))) }).descriptor]));
    const scope = { projectId: content.projectId, providerId: Symbol('sa12-explicit-local-source-grant'), authorizationGeneration: '1' };
    // Source capability only: exact manifest scope/hash, bounded bytes. Phase7 owns
    // IO state/decode/cache/texture. No image cropping, decoding or timing here.
    const provider: R.VisualSourceProvider = { scope, async read(request) {
      const descriptor = descriptors.get(request.identity.resourceId), source = descriptor?.sources[request.sourceIndex];
      const file = content!.resources.find(item => item.resourceId === request.identity.resourceId)?.pages.flatMap(page => page.files)[request.sourceIndex];
      if (closed || request.scope.providerId !== scope.providerId || request.scope.projectId !== scope.projectId
        || request.scope.authorizationGeneration !== scope.authorizationGeneration || request.identity.projectId !== scope.projectId
        || !file || !source || request.source.role !== source.role || request.source.locator.type !== source.locator.type
        || request.source.locator.path !== file.path) return { status: 'failed', code: 'SOURCE_DENIED' };
      const response = await fetch(`/asset/${file.path}`, { signal: abort.signal, redirect: 'error' });
      if (response.status === 404) return { status: 'failed', code: 'SOURCE_NOT_FOUND' };
      if (!response.ok || !response.body) throw new TypeError('Local source unavailable');
      const reader = response.body.getReader(), chunks: Uint8Array[] = []; let length = 0;
      try { for (;;) { const part = await reader.read(); if (part.done) break; length += part.value.length;
        if (length > Math.min(request.maxBytes, limits.maxBytes)) return { status: 'failed', code: 'CONTENT_TOO_LARGE' };
        chunks.push(part.value); } } finally { try { await reader.cancel(); } finally { reader.releaseLock(); } }
      const bytes = new Uint8Array(length); let offset = 0;
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
      const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), value => value.toString(16).padStart(2, '0')).join('');
      if (closed) return { status: 'failed', code: 'CANCELLED' };
      if (length !== file.bytes || hash !== file.sha256) return { status: 'failed', code: 'SOURCE_DENIED' };
      return { status: 'provided', bytes, contentLength: length, revision: hash, mediaType: source.role === 'image' ? 'image/png' : null };
    } };
    cache = R.createVisualResourceCache(provider, { maxCpuEntries: 24, maxGpuEntries: 32 });
    for (const resource of content.resources) {
      const descriptor = descriptors.get(resource.resourceId)!, sheets: R.UnityAtlasSheet[] = [];
      try {
        for (const page of resource.pages) {
          const load = R.createVisualSourceLoad(descriptor, page.slot * 2, provider, limits.maxBytes); loads.add(load);
          const loaded = await load.start(); if (closed) return;
          if (loaded.state !== 'source-acquired') throw new TypeError(JSON.stringify(loaded));
          sheets.push({ pageId: `page-${page.slot}`, metadataSourceId: `metadata-${page.slot}`, imageSourceId: `image-${page.slot}`, textureReference: `${page.name}.png`, metadata: load });
        }
        const parsed = R.parseUnityAtlasMetadata(descriptor, resource.pages.flatMap(page => [
          { sourceId: `metadata-${page.slot}`, sourceIndex: page.slot * 2 }, { sourceId: `image-${page.slot}`, sourceIndex: page.slot * 2 + 1 }]), sheets);
        if (parsed.status !== 'parsed') throw new TypeError(JSON.stringify(parsed));
        const revision = R.getAtlasMetadataRevision(parsed.atlas)!.id;
        for (const page of resource.pages) for (const key of page.frames) {
          const result = R.resolveAtlasFrame({ ...descriptor.identity, subresourceId: key }, parsed.atlas, revision);
          if (result.status !== 'resolved') throw new TypeError(result.code);
        }
        resources.set(resource.resourceId, { descriptor, atlas: parsed.atlas, revision, pages: resource.pages });
      } finally { for (const sheet of sheets) { sheet.metadata.release(); loads.delete(sheet.metadata); } }
    }
    const makeClip = (clipId: string, resourceId: string, repeat: 'repeat' | 'once') => R.createEightWaySpriteClip({ clipId,
      timing: { fps: 8 }, repeat, convention: { axes, directionZeroAngleRadians: 0, zeroIndex: 0 },
      directions: resources.get(resourceId)!.pages.map(page => ({ frames: page.frames.map(subresourceId => ({ projectId: content!.projectId, resourceId, subresourceId })) })) as unknown as R.SpriteDirectionSequences });
    clipSets.set('player', [makeClip('idle', 'player-idle', 'repeat'), makeClip('walk', 'player-walk', 'repeat'), makeClip('walk-once', 'player-walk', 'once')]);
    clipSets.set('monster', [makeClip('walk', 'monster', 'repeat'), makeClip('walk-once', 'monster', 'once')]);
    const plane = { projectId: content.projectId, coordinateSpaceId: 'sa12-ground', unit: 'world-unit', axes } as const;
    for (const target of document.querySelectorAll<HTMLCanvasElement>('canvas')) {
      const session = await R.createRenderFrameSession({ target }); sessions.push(session); if (closed) { session.dispose(); return; }
      const scene = R.createRenderVisualScene(session); scenes.push(scene);
      const receipt = R.resizeRenderViewport(session, { logicalWidthCssPx: 480, logicalHeightCssPx: 300, requestedPixelRatio: 1 }, { maxWidthPixels: 1024, maxHeightPixels: 1024, maxPixelCount: 1048576 });
      const camera = R.createConfiguredRenderCamera({ kind: 'orthographic', source: plane, center: { x: 240, y: 150 }, scale: { unit: 'css-px-per-source-unit', x: 1, y: 1 }, zoom: 1, viewportPolicy: 'preserve-scale' }, { min: 0.1, max: 10 }); cameras.push(camera);
      cameraBindings.push(R.bindRenderCameraToVisualScene(camera, scene, receipt, { plane: { ...plane, coordinateSpaceId: 'sa12-css', unit: 'css-px' }, width: 480, height: 300, screen: null }));
    }
    for (const [key, sessionIndex, x, y] of [['P',0,90,220],['A',0,235,160],['B',0,350,160],['C',1,240,160]] as const) {
      const scene = scenes[sessionIndex]!, session = sessions[sessionIndex]!;
      const instance = R.addRenderVisualInstance(scene, { visualInstanceId: key });
      const anchor = { x: 0, y: 0 };
      R.setRenderVisualInstanceTransform(scene, instance, { placement: { plane, point: { x, y } },
        local: { translation: { x: 0, y: 0 }, rotationRadians: 0, scale: { x: 1, y: 1 } },
        anchor: { unit: plane.unit, anchor, pivot: anchor, localOffset: anchor }, orientation: facing(0),
        projection: { kind: 'orthographic-plane', source: plane, destination: { projectId: content.projectId, coordinateSpaceId: 'render-clip-2d', unit: 'clip-unit', axes: { x: 'right', y: 'up' } }, sourceOrigin: { x: 0, y: 0 }, destinationOrigin: { x: -1, y: 1 }, destinationUnitsPerSourceUnit: { x: 2 / 480, y: 2 / 300 } } });
      const clips = clipsFor(key), playback = R.createSpriteAnimationPlayback({ clips, clipId: key === 'P' ? 'idle' : 'walk', directionIndex: 0 });
      const binding = R.createSpriteAnimationVisualBinding(session, scene, instance, playback);
      const actor: Actor = { key, sessionIndex, instance, playback, binding, leases: new Map(), closed: false }; actors.push(actor);
      for (const resource of resources.values()) {
        if ((key === 'P') === (resource.descriptor.identity.resourceId === 'monster')) continue;
        for (const page of resource.pages) {
          const lease = cache.acquire(session, resource.descriptor, page.slot * 2 + 1, page.files[1].sha256, limits, { sampling: 'nearest', colorSpace: 'srgb' });
          actor.leases.set(leaseKey(resource.descriptor.identity.resourceId, page.slot), lease);
          const result = await lease.result; if (closed) return;
          if (result.state !== 'usable') throw new TypeError(JSON.stringify(result));
        }
      }
      present(actor);
    }
    ready = true; controls.disabled = false; draw(0); draw(1); report();
  } catch (error) { failure = { status: 'MVP_UNAVAILABLE', ...R.getRenderVisualDiagnostic(error), message: String(error) }; close(); }
})();
