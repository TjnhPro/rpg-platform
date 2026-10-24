// Harness composition only. Render public root owns all graphics and camera math.
import { createSceneMembership, createAssetCatalog, createCoordinateSpaceDefinition,
  createDocumentEnvelope, createDocumentSession, type ScenePreviewPresentation } from '@rpg-platform/editor';
import { createOrthographicPlaneProjection, createVisualSourceLoad, parseUnityAtlasMetadata,
  getAtlasMetadataRevision, resolveAtlasFrameGeometry, type VisualSourceProvider,
  type VisualResourceDescriptor, type RenderVisualFrameBinding, type RenderVisualInstanceTransformInput,
  type RenderVisualLayerOrderingPolicy } from '@rpg-platform/runtime-render';
import { mountEditorCamera } from '../../editor/dist/manual-camera-host.js';
import { mountClientCamera } from '../../game-client/dist/manual-camera-host.js';

/** Actual HTTP source + public parser observation, independently callable without graphics. */
export async function loadCameraMvpSources(report: (event: string, value?: unknown) => void,
  signal: AbortSignal, base = '/runtime-render/manual/scene-mvp-assets/') {
  const log = (event: string, value?: unknown) => { try { report(event, value); } catch {} };
  const projectId = 'camera-mvp';
  const response = await fetch(base + 'manifest.json', { signal });
  if (!response.ok) throw new TypeError('Actual committed manifest unavailable');
  const manifest = await response.json() as { profile: string; files: {
    name: string; mediaType: string; bytes: number; sha256: string; width?: number; height?: number }[] };
  if (manifest.profile !== 'original-scene-mvp-art-v1' || !Array.isArray(manifest.files)) throw new TypeError('Unknown original sample profile');
  const file = (name: string) => {
    const found = manifest.files.find(entry => entry.name === name);
    if (!found || !Number.isSafeInteger(found.bytes) || found.bytes < 1 || found.bytes > 1048576
      || !/^[a-f0-9]{64}$/.test(found.sha256)) throw new TypeError('Invalid sample manifest');
    return found;
  };
  const choices = [['map', 'courtyard.png'], ['player', 'traveler.png'], ['monsters', 'monsters.png']] as const;
  const descriptors = new Map<string, VisualResourceDescriptor>(choices.map(([id, name]) => [id, {
    identity: { projectId, resourceId: id }, mediaType: 'image/png', sources: [
      { role: 'image', locator: { type: 'project-relative', path: name } },
      ...(id === 'monsters' ? [{ role: 'atlas-metadata', locator: { type: 'project-relative' as const, path: 'monsters.atlas.txt' } }] : [])],
  }]));
  const reads = { A: {} as Record<string, number>, B: {} as Record<string, number> };
  const provider = (label: 'A' | 'B'): VisualSourceProvider => {
    const scope = { projectId, providerId: Symbol(label), authorizationGeneration: manifest.profile };
    return { scope, async read(request) {
      const descriptor = descriptors.get(request.identity.resourceId), source = descriptor?.sources[request.sourceIndex];
      if (signal.aborted) return { status: 'failed', code: 'CANCELLED' };
      if (request.scope.providerId !== scope.providerId || request.scope.projectId !== projectId
        || request.scope.authorizationGeneration !== scope.authorizationGeneration || request.identity.projectId !== projectId
        || !source || request.source.role !== source.role || request.source.locator.type !== 'project-relative'
        || source.locator.type !== 'project-relative' || request.source.locator.path !== source.locator.path) {
        return { status: 'failed', code: 'SOURCE_DENIED' };
      }
      const info = file(source.locator.path);
      if (info.bytes > request.maxBytes) return { status: 'failed', code: 'CONTENT_TOO_LARGE' };
      const result = await fetch(base + info.name, { signal });
      if (!result.ok || !result.body) return { status: 'failed', code: 'SOURCE_NOT_FOUND' };
      const reader = result.body.getReader(), chunks: Uint8Array[] = [];
      let count = 0;
      try {
        while (true) {
          const part = await reader.read(); if (part.done) break;
          count += part.value.length;
          if (count > info.bytes || count > request.maxBytes) {
            await reader.cancel(); return { status: 'failed', code: 'CONTENT_TOO_LARGE' };
          }
          chunks.push(part.value);
        }
      } finally { reader.releaseLock(); }
      const bytes = new Uint8Array(count); let offset = 0;
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
      const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), n => n.toString(16).padStart(2, '0')).join('');
      if (signal.aborted) return { status: 'failed', code: 'CANCELLED' };
      if (count !== info.bytes || hash !== info.sha256) return { status: 'failed', code: 'SOURCE_DENIED' };
      reads[label][info.name] = (reads[label][info.name] ?? 0) + 1;
      log(`${label} actual source`, info);
      return { status: 'provided', bytes, contentLength: count, mediaType: info.mediaType, revision: hash };
    } };
  };
  const providerA = provider('A'), providerB = provider('B'), atlasDescriptor = descriptors.get('monsters')!;
  const metadata = createVisualSourceLoad(atlasDescriptor, 1, providerA, 1048576);
  let atlas: Extract<ReturnType<typeof parseUnityAtlasMetadata>, { status: 'parsed' }>['atlas'];
  try {
    const acquired = await metadata.start();
    if (signal.aborted || acquired.state !== 'source-acquired') throw new TypeError('Real atlas source unavailable');
    const parsed = parseUnityAtlasMetadata(atlasDescriptor,
      [{ sourceId: 'page-image', sourceIndex: 0 }, { sourceId: 'sheet', sourceIndex: 1 }],
      [{ pageId: 'monsters', metadataSourceId: 'sheet', imageSourceId: 'page-image', textureReference: 'monsters.png', metadata }]);
    if (parsed.status !== 'parsed') { log('Atlas rejection', parsed); throw new TypeError('Atlas parse failed'); }
    atlas = parsed.atlas;
  } finally { metadata.release(); }
  const atlasRevision = getAtlasMetadataRevision(atlas);
  if (!atlasRevision) throw new TypeError('Actual parsed atlas revision missing');
  const atlasPixels = file('monsters.png');
  if (file('courtyard.png').width !== 320 || file('courtyard.png').height !== 240
    || file('traveler.png').width !== 32 || file('traveler.png').height !== 48
    || atlasPixels.width !== 96 || atlasPixels.height !== 48) throw new TypeError('Unexpected original sample profile');
  const frame = (key: string): RenderVisualFrameBinding => {
    const binding: RenderVisualFrameBinding = { reference: { ...atlasDescriptor.identity, subresourceId: key }, atlas,
      expectedRevision: atlasRevision.id, pixels: { imageSourceId: 'page-image', unit: 'image-pixel',
        layout: 'texturepacker-unity-bottom-left', width: atlasPixels.width!, height: atlasPixels.height! } };
    const geometry = resolveAtlasFrameGeometry(binding.reference, atlas, binding.expectedRevision, binding.pixels);
    log('Parsed atlas frame geometry', geometry);
    if (geometry.status !== 'resolved') throw new TypeError('Real atlas frame unavailable');
    return binding;
  };
  return { projectId, base, manifest, file, choices, descriptors, reads, providerA, providerB, frame };
}

/** A manual mount, never invoked by CI or a browser test runner. */
export async function mountCameraMvp(a: HTMLCanvasElement, b: HTMLCanvasElement,
  report: (event: string, value?: unknown) => void, ratioA: () => number, ratioB: () => number,
  signal: AbortSignal) {
  const log = (event: string, value?: unknown) => { try { report(event, value); } catch {} };
  const { projectId, base, manifest, file, choices, descriptors, reads, providerA, providerB, frame } = await loadCameraMvpSources(log, signal);
  const space = createCoordinateSpaceDefinition({ reference: { projectId, coordinateSpaceId: 'ground' },
    componentCount: 2, axes: { x: 'right', y: 'down' }, origin: { x: 0, y: 0 }, unit: 'scene-unit' });
  const plane = { ...space.reference, axes: space.axes, unit: space.unit };
  const specs = [
    { id: 'Map', resource: 'map', x: 0, y: 0, width: 320, height: 240, anchorX: 0, anchorY: 0, frame: null },
    { id: 'Player', resource: 'player', x: 100, y: 50, width: 32, height: 48, anchorX: 16, anchorY: 48, frame: null },
    { id: 'Monster-red', resource: 'monsters', x: 130, y: 70, width: 32, height: 48, anchorX: 16, anchorY: 48, frame: frame('red') },
    { id: 'Monster-green', resource: 'monsters', x: 170, y: 100, width: 32, height: 48, anchorX: 16, anchorY: 48, frame: frame('green') },
    { id: 'Monster-violet', resource: 'monsters', x: 210, y: 70, width: 32, height: 48, anchorX: 16, anchorY: 48, frame: frame('violet') },
  ];
  const layers = [
    { definition: { layerKey: 'background', priority: -10 }, ordering: { kind: 'explicit-order' } as RenderVisualLayerOrderingPolicy },
    { definition: { layerKey: 'actors', priority: 0 }, ordering: { kind: 'ground-y', plane, front: 'down' } as RenderVisualLayerOrderingPolicy },
  ];
  const authored = createSceneMembership({ scene: { identity: { projectId, sceneId: 'camera-scene' } },
    objects: specs.map(spec => ({ definition: { objectId: spec.id }, assetReference: { projectId, assetId: spec.resource },
      placement: { coordinateSpaceId: plane.coordinateSpaceId, point: { x: spec.x, y: spec.y } } })) });
  const catalog = createAssetCatalog({ projectId, definitions: choices.map(([assetId]) => ({
    identity: { projectId, assetId }, kind: 'image', metadata: {}, sources: descriptors.get(assetId)!.sources })) });
  const document = createDocumentSession(createDocumentEnvelope({ schemaVersion: 1, identity: { projectId, documentId: 'camera-document' },
    documentKind: 'camera-mvp-scene', contentSchemaVersion: 1, content: authored }), null);
  document.open();
  const projection = createOrthographicPlaneProjection({ kind: 'orthographic-plane', source: plane,
    destination: { projectId, coordinateSpaceId: 'render-clip-2d', unit: 'clip-unit', axes: { x: 'right', y: 'up' } },
    sourceOrigin: { x: 0, y: 0 }, destinationOrigin: { x: -1, y: 1 },
    destinationUnitsPerSourceUnit: { x: 0.00625, y: 0.008333333333333333 } });
  const visuals = specs.map(spec => {
    const descriptor = descriptors.get(spec.resource)!, source = file(descriptor.sources[0]!.locator.path);
    const transform: RenderVisualInstanceTransformInput = { placement: { plane, point: { x: spec.x, y: spec.y } },
      local: { translation: { x: 0, y: 0 }, rotationRadians: 0, scale: { x: 1, y: 1 } },
      anchor: { unit: plane.unit, anchor: { x: spec.anchorX, y: spec.anchorY },
        pivot: { x: spec.anchorX, y: spec.anchorY }, localOffset: { x: 0, y: 0 } },
      orientation: { axes: plane.axes, zeroAxis: 'positive-x', positiveRotation: 'toward-positive-y', angleRadians: 0 }, projection };
    return { id: spec.id, resource: { descriptor, sourceIndex: 0, sourceRevision: source.sha256, frame: spec.frame }, transform,
      layout: { unit: plane.unit, x: 0, y: 0, width: spec.width, height: spec.height },
      order: { layerKey: spec.id === 'Map' ? 'background' : 'actors', order: 0 } };
  });
  const camera = { kind: 'orthographic', source: plane, center: { x: 100, y: 50 },
    scale: { unit: 'css-px-per-source-unit', x: 2, y: 2 }, zoom: 1, viewportPolicy: 'preserve-scale' } as const;
  const zoomLimits = { min: 0.1, max: 10 };
  if (signal.aborted) throw new TypeError('Mount cancelled');
  const makeEditor = (target: HTMLCanvasElement) => mountEditorCamera(target, { authored, catalog, provider: providerA, camera, zoomLimits, layers,
    presentation(description): ScenePreviewPresentation {
      const visual = visuals.find(value => value.id === description.correlation.objectId);
      if (!visual) throw new TypeError('Unknown authored object');
      return { space, transform: visual.transform, layout: visual.layout, order: visual.order, visible: true,
        bindingKey: `${visual.resource.sourceRevision}:${visual.id}`, sourceRevision: visual.resource.sourceRevision, frame: visual.resource.frame };
    } }, (event, value) => log(`A ${event}`, value), ratioA);
  let editor = makeEditor(a);
  let client: ReturnType<typeof mountClientCamera>;
  try { client = mountClientCamera(b, { provider: providerB, visuals, camera, zoomLimits, layers },
    (event, value) => log(`B ${event}`, value), ratioB); }
  catch (error) { editor.close(); throw error; }
  const truth = { authored: JSON.stringify(authored), document: JSON.stringify(document.getSnapshot()), neutral: JSON.stringify(visuals) };
  let baseline: { a: ReturnType<typeof editor.inspect>; b: ReturnType<typeof client.inspect> } | undefined;
  const capture = () => {
    const av = editor.inspect(), bv = client.inspect();
    if (av.loadState !== 'applied' || bv.loadState !== 'applied' || av.visuals.length !== specs.length || bv.visuals.length !== specs.length) {
      throw new TypeError('Both actual scenes must be loaded before capture');
    }
    baseline = { a: av, b: bv }; log('Captured live Scene baseline', baseline);
  };
  const inspect = () => {
    const av = editor.inspect(), bv = client.inspect();
    const resources = (value: typeof av | typeof bv) => {
      const bound = value.visuals.map(visual => visual.resource).filter(resource => resource !== null);
      const monsters = bound.filter(resource => resource.frame !== null);
      return { boundCount: bound.length, uniqueAllocations: new Set(bound.map(resource => resource.resourceId)).size,
        atlasShared: monsters.length === 3 ? monsters.every(resource => resource.resourceId === monsters[0]!.resourceId) : null };
    };
    const comparison = baseline ? {
      aTransformsUnchanged: JSON.stringify(baseline.a.visuals.map(v => v.transform)) === JSON.stringify(av.visuals.map(v => v.transform)),
      bTransformsUnchanged: JSON.stringify(baseline.b.visuals.map(v => v.transform)) === JSON.stringify(bv.visuals.map(v => v.transform)),
      aOrderUnchanged: JSON.stringify(baseline.a.candidates) === JSON.stringify(av.candidates),
      bOrderUnchanged: JSON.stringify(baseline.b.candidates) === JSON.stringify(bv.candidates),
      bExactCameraUnchanged: baseline.b.camera === bv.camera,
    } : 'NOT_OBSERVED: capture after both loads';
    log('MVP observation (pixels separate)', { a: av, b: bv, comparison, reads, aResources: resources(av), bResources: resources(bv),
      crossSessionAllocationOverlap: av.visuals.length === specs.length && bv.visuals.length === specs.length
        ? av.visuals.some(v => v.resource && bv.visuals.some(w => w.resource?.resourceId === v.resource!.resourceId)) : null,
      authoredUnchanged: truth.authored === JSON.stringify(authored), documentUnchanged: truth.document === JSON.stringify(document.getSnapshot()),
      neutralInputsUnchanged: truth.neutral === JSON.stringify(visuals), document: document.getSnapshot(),
      distinctCameras: av.camera && bv.camera ? av.camera.camera.id !== bv.camera.camera.id : null,
      distinctSessions: av.binding && bv.binding ? av.binding.sessionId !== bv.binding.sessionId : null,
      gameplayPositions: 'NOT_SUPPLIED', pixelObservation: 'MANUAL_REVIEW_REQUIRED' });
  };
  log('Source provenance and explicit world inputs', { base, profile: manifest.profile, specs, plane, camera,
    license: 'Original repository procedural art; see scene-mvp-assets/README.md',
    atlasProfile: '40300 rectangular hand-authored; TPSHEET_NOT_VERIFIED' });
  return { get editor() { return editor; }, client, plane, capture, inspect,
    recreateEditor(target: HTMLCanvasElement) {
      const beforeB = client.inspect();
      editor.close(); editor = makeEditor(target); baseline = undefined;
      log('A explicitly remounted; B camera identity', { unchanged: beforeB.camera === client.inspect().camera });
    },
    close() { try { editor.close(); } finally { client.close(); } } };
}
