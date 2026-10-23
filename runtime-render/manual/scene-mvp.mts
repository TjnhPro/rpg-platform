// Optional browser composition sample; package-root consumer, never production API.
import {
  beginRenderFrameSession, createRenderVisualScene, createVisualResourceCache,
  createVisualSourceLoad, parseUnityAtlasMetadata, getAtlasMetadataRevision,
  resolveAtlasFrameGeometry, addRenderVisualLayer, setRenderVisualLayerOrderingPolicy,
  getRenderViewportSnapshot, getRenderVisualSceneDiagnostics, listRenderVisualInstances,
  listRenderVisualDrawCandidates, getRenderVisualInstanceResource, getRenderVisualInstanceTransform,
  getRenderVisualInstanceVisibility, getRenderVisualDiagnostic,
  type VisualResourceDescriptor, type VisualSourceProvider, type VisualSourceLoad,
  type RenderFrameSession, type RenderVisualScene, type VisualResourceLease,
  type RenderVisualFrameBinding, type RenderVisualInstanceTransformInput,
} from '@rpg-platform/runtime-render';

const base = '/runtime-render/manual/scene-mvp-assets/';
const projectId = 'scene-mvp-original-art';
const limits = { maxBytes: 1048576, maxDimension: 2048, maxPixels: 4194304 };
const choices = [
  ['map', 'courtyard.png'], ['player', 'traveler.png'], ['monsters', 'monsters.png'],
  ['item', 'potion.png'], ['vfx', 'static-spark.png'],
] as const;
interface FileInfo { name: string; mediaType: string; bytes: number; sha256: string }
export interface SampleVisual {
  readonly key: string; readonly descriptor: VisualResourceDescriptor;
  readonly sourceIndex: number; readonly sourceRevision: string; readonly frame: RenderVisualFrameBinding | null;
  readonly x: number; readonly y: number; readonly width: number; readonly height: number;
  readonly layerKey: string; readonly order: number;
}
const plane = { projectId, coordinateSpaceId: 'courtyard-ground', unit: 'scene-unit',
  axes: { x: 'right', y: 'down' } } as const;

/** Explicit presentation data only; canonical Phase4/8 operations own all math. */
function transform(spec: SampleVisual, x = spec.x, y = spec.y): RenderVisualInstanceTransformInput {
  const ground = spec.key !== 'map';
  const anchor = ground ? { x: spec.width / 2, y: spec.height } : { x: 0, y: 0 };
  return { placement: { plane, point: { x, y } },
    local: { translation: { x: 0, y: 0 }, rotationRadians: 0, scale: { x: 1, y: 1 } },
    anchor: { unit: plane.unit, anchor, pivot: anchor, localOffset: { x: 0, y: 0 } },
    orientation: { axes: plane.axes, zeroAxis: 'positive-x', positiveRotation: 'toward-positive-y', angleRadians: 0 },
    projection: { kind: 'orthographic-plane', source: plane,
      destination: { projectId, coordinateSpaceId: 'render-clip-2d', unit: 'clip-unit', axes: { x: 'right', y: 'up' } },
      sourceOrigin: { x: 0, y: 0 }, destinationOrigin: { x: -1, y: 1 },
      destinationUnitsPerSourceUnit: { x: 2 / 320, y: 2 / 240 } } };
}

async function readLimited(path: string, max: number, signal: AbortSignal): Promise<Uint8Array<ArrayBuffer>> {
  const response = await fetch(path, { signal, redirect: 'error', cache: 'no-store' });
  if (!response.ok || !response.body) throw new TypeError('Sample source unavailable');
  const reader = response.body.getReader(), parts: Uint8Array[] = [];
  let length = 0;
  try {
    for (;;) {
      const next = await reader.read();
      if (next.done) break;
      length += next.value.length;
      if (length > max) throw new RangeError('Sample source exceeds admission bound');
      parts.push(next.value);
    }
  } finally { try { await reader.cancel(); } finally { reader.releaseLock(); } }
  const result = new Uint8Array(length); let offset = 0;
  for (const part of parts) { result.set(part, offset); offset += part.length; }
  return result;
}

/** Resource/canvas tooling only. Each mount owns one independent provider/cache/session.
 * Host consumers below receive borrowed roots and own their instance orchestration. */
export function mountSceneMvpResources(target: HTMLCanvasElement, report: (event: string, data: unknown) => void) {
  const log = (event: string, data: unknown): void => { try { report(event, data); } catch {} };
  const abort = new AbortController(), leases: VisualResourceLease[] = [];
  let closed = false, started = false, reads = 0;
  let session: RenderFrameSession | undefined, scene: RenderVisualScene | undefined;
  let cache: ReturnType<typeof createVisualResourceCache> | undefined, metadata: VisualSourceLoad | undefined;
  const inspect = () => {
    const active = scene?.getSnapshot().state === 'active';
    const instances = scene && active ? listRenderVisualInstances(scene) : [];
    return { closed, providerReads: reads, viewport: session ? getRenderViewportSnapshot(session) : null,
      scene: scene ? getRenderVisualSceneDiagnostics(scene) : null, cache: cache?.getSnapshot() ?? null,
      leases: leases.map(lease => { const s = lease.getSnapshot(); return { id: s.id, state: s.state,
        sessionId: s.sessionId, cleanupFailed: s.cleanupFailed }; }),
      instances: instances.map(instance => ({ instance,
        binding: getRenderVisualInstanceResource(scene!, instance), transform: getRenderVisualInstanceTransform(scene!, instance),
        visibility: getRenderVisualInstanceVisibility(scene!, instance) })),
      drawOrder: scene && active ? listRenderVisualDrawCandidates(scene).map(item => item.instance.visualInstanceId) : [] };
  };
  const close = () => {
    if (closed) return; closed = true; abort.abort();
    for (const [stage, action] of [ ['scene', () => scene?.dispose()],
      ...leases.map(lease => ['lease', () => lease.release()] as const),
      ['metadata', () => metadata?.release()], ['cache', () => cache?.dispose()],
      ['session', () => session?.dispose()] ] as const) {
      try { log(`cleanup ${stage}`, action()); }
      catch (error) { log(`cleanup uncertain ${stage}`, getRenderVisualDiagnostic(error)); }
    }
    log('terminal observations; NOT memory/GPU-health proof', inspect());
  };
  return Object.freeze({ inspect, close,
    async open() {
      if (closed || started) throw new TypeError('Fresh one-shot mount required'); started = true;
      try {
        const manifest = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(
          await readLimited(base + 'manifest.json', 16384, abort.signal))) as { profile: string; files: FileInfo[] };
        if (manifest.profile !== 'original-scene-mvp-art-v1' || !Array.isArray(manifest.files)) throw new TypeError('Unknown sample profile');
        const files = new Map(manifest.files.map(info => [info.name, info]));
        const descriptors = new Map(choices.map(([key, name]) => [key, { identity: { projectId, resourceId: key },
          mediaType: 'image/png', sources: [
            ...(key === 'monsters' ? [{ role: 'atlas-metadata', locator: { type: 'project-relative' as const, path: 'monsters.atlas.txt' } }] : []),
            { role: 'image', locator: { type: 'project-relative' as const, path: name } },
          ] } satisfies VisualResourceDescriptor]));
        const scope = { projectId, providerId: Symbol('scene-mvp-provider'), authorizationGeneration: manifest.profile };
        const provider: VisualSourceProvider = { scope, async read(request) {
          if (closed) return { status: 'failed', code: 'CANCELLED' };
          const descriptor = descriptors.get(request.identity.resourceId as typeof choices[number][0]);
          const source = descriptor?.sources[request.sourceIndex];
          if (request.scope.providerId !== scope.providerId || request.scope.projectId !== projectId
            || request.scope.authorizationGeneration !== scope.authorizationGeneration || request.identity.projectId !== projectId
            || !source || source.role !== request.source.role || source.locator.type !== request.source.locator.type
            || source.locator.path !== request.source.locator.path) return { status: 'failed', code: 'SOURCE_DENIED' };
          const info = files.get(source.locator.path);
          if (!info || !Number.isSafeInteger(info.bytes) || info.bytes < 1 || info.bytes > Math.min(request.maxBytes, limits.maxBytes)) {
            return { status: 'failed', code: 'CONTENT_TOO_LARGE' };
          }
          // Fixed allowlisted source path, never resolve a request-provided arbitrary URL.
          const bytes = await readLimited(base + source.locator.path, info.bytes, abort.signal);
          const digest = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), b => b.toString(16).padStart(2, '0')).join('');
          if (bytes.length !== info.bytes || digest !== info.sha256) throw new TypeError('Sample provenance mismatch');
          if (closed) return { status: 'failed', code: 'CANCELLED' };
          reads++; log('authorized source bytes', { name: info.name, bytes: bytes.length, sha256: digest });
          return { status: 'provided', bytes, contentLength: bytes.length, mediaType: info.mediaType, revision: digest };
        } };
        const atlasDescriptor = descriptors.get('monsters')!;
        metadata = createVisualSourceLoad(atlasDescriptor, 0, provider, limits.maxBytes);
        const acquired = await metadata.start();
        if (closed) throw new TypeError('Mount closed');
        if (acquired.state !== 'source-acquired') throw new TypeError('Atlas metadata source unavailable');
        const parsed = parseUnityAtlasMetadata(atlasDescriptor,
          [{ sourceId: 'sheet', sourceIndex: 0 }, { sourceId: 'page-image', sourceIndex: 1 }],
          [{ pageId: 'monsters', metadataSourceId: 'sheet', imageSourceId: 'page-image', textureReference: 'monsters.png', metadata }]);
        if (parsed.status !== 'parsed') { log('atlas rejection', parsed); throw new TypeError('Atlas parse rejected'); }
        metadata.release();
        const revision = getAtlasMetadataRevision(parsed.atlas);
        if (!revision) throw new TypeError('Canonical atlas revision unavailable');
        const frame = (key: string): RenderVisualFrameBinding => {
          const value = { reference: { ...atlasDescriptor.identity, subresourceId: key }, atlas: parsed.atlas,
            expectedRevision: revision.id, pixels: { imageSourceId: 'page-image', unit: 'image-pixel' as const,
              layout: 'texturepacker-unity-bottom-left' as const, width: 96, height: 48 } };
          const result = resolveAtlasFrameGeometry(value.reference, value.atlas, value.expectedRevision, value.pixels);
          log('actual parsed atlas geometry', result);
          if (result.status !== 'resolved') throw new TypeError('Atlas geometry rejected');
          return value;
        };
        const spec = (key: string, resource: typeof choices[number][0], x: number, y: number, width: number, height: number,
          layerKey: string, atlasKey: string | null = null): SampleVisual => {
          const descriptor = descriptors.get(resource)!, sourceIndex = resource === 'monsters' ? 1 : 0;
          const file = files.get(descriptor.sources[sourceIndex]!.locator.path);
          if (!file) throw new TypeError('Sample manifest incomplete');
          return { key, descriptor, sourceIndex, sourceRevision: file.sha256, frame: atlasKey ? frame(atlasKey) : null,
            x, y, width, height, layerKey, order: 0 };
        };
        const specs = [spec('map', 'map', 0, 0, 320, 240, 'background'),
          spec('player', 'player', 146, 142, 48, 72, 'actors'),
          spec('monster-a', 'monsters', 160, 150, 48, 72, 'actors', 'red'),
          spec('monster-b', 'monsters', 220, 160, 48, 72, 'actors', 'green'),
          spec('monster-c', 'monsters', 265, 150, 48, 72, 'actors', 'violet'),
          spec('item', 'item', 74, 174, 24, 24, 'actors'),
          spec('static-vfx', 'vfx', 104, 110, 32, 32, 'overlay')];
        const operation = beginRenderFrameSession({ target });
        const graphics = await operation.result;
        if (closed) { graphics.dispose(); throw new TypeError('Mount closed during graphics acquisition'); }
        session = graphics; scene = createRenderVisualScene(graphics);
        cache = createVisualResourceCache(provider, { maxCpuEntries: 5, maxGpuEntries: 5 });
        addRenderVisualLayer(scene, { layerKey: 'background', priority: -10 });
        addRenderVisualLayer(scene, { layerKey: 'actors', priority: 0 });
        addRenderVisualLayer(scene, { layerKey: 'overlay', priority: 10 });
        setRenderVisualLayerOrderingPolicy(scene, 'actors', { kind: 'ground-y', plane, front: 'down' });
        const requireOpen = () => {
          if (closed || cache!.getSnapshot().cleanupFailed || getRenderVisualSceneDiagnostics(scene!).cleanupFailed) {
            throw new TypeError('Mount closed or cleanup uncertain');
          }
        };
        return Object.freeze({ session, scene, specs, transform,
          acquire(input: SampleVisual) {
            requireOpen();
            const lease = cache!.acquire(graphics, input.descriptor, input.sourceIndex, input.sourceRevision, limits,
              { sampling: 'nearest', colorSpace: 'srgb' });
            leases.push(lease); log('acquire', { key: input.key, lease: lease.getSnapshot(), cache: cache!.getSnapshot() });
            return lease;
          },
          observe: () => { const value = inspect(); log('resource observations', value); return value; },
          requireOpen,
        });
      } catch (error) { log('open rejected', getRenderVisualDiagnostic(error)); close(); throw error; }
    },
  });
}
