// Manual comparison wiring only; neither production project imports the other.
import { createSceneMembership, createAssetCatalog, createCoordinateSpaceDefinition,
  createDocumentEnvelope, createDocumentSession, type ScenePreviewPresentation } from '@rpg-platform/editor';
import { createOrthographicPlaneProjection, type VisualSourceProvider } from '@rpg-platform/runtime-render';
import { mountEditorCamera } from '../../editor/dist/manual-camera-host.js';
import { mountClientCamera } from '../../game-client/dist/manual-camera-host.js';

export async function mountCameraHosts(a: HTMLCanvasElement, b: HTMLCanvasElement,
  report: (event: string, value?: unknown) => void, ratioA: () => number, ratioB: () => number) {
  const projectId = 'camera-hosts-manual', assetId = 'traveler';
  const response = await fetch('/runtime-render/manual/scene-mvp-assets/manifest.json');
  if (!response.ok) throw new TypeError('Sample manifest unavailable');
  const manifest = await response.json() as { files: { name: string; width: number; height: number; bytes: number; sha256: string }[] };
  const source = manifest.files.find(file => file.name === 'traveler.png');
  if (!source || source.width !== 32 || source.height !== 48) throw new TypeError('Unexpected source dimensions');
  const revision = source.sha256;
  const provider = (): VisualSourceProvider => {
    const scope = { projectId, providerId: Symbol('camera-source'), authorizationGeneration: revision };
    return { scope, async read(request) {
      if (request.scope.providerId !== scope.providerId || request.scope.projectId !== projectId
        || request.scope.authorizationGeneration !== revision || request.identity.projectId !== projectId
        || request.identity.resourceId !== assetId || request.sourceIndex !== 0 || request.source.role !== 'image'
        || request.source.locator.type !== 'project-relative' || request.source.locator.path !== 'samples/traveler.png') {
        return { status: 'failed', code: 'SOURCE_DENIED' };
      }
      if (source.bytes > Math.min(request.maxBytes, 1048576)) return { status: 'failed', code: 'CONTENT_TOO_LARGE' };
      const result = await fetch('/runtime-render/manual/scene-mvp-assets/traveler.png');
      if (!result.ok) return { status: 'failed', code: 'SOURCE_NOT_FOUND' };
      const bytes = new Uint8Array(await result.arrayBuffer());
      const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), n => n.toString(16).padStart(2, '0')).join('');
      if (bytes.length !== source.bytes || bytes.length > request.maxBytes || hash !== revision) {
        return { status: 'failed', code: 'SOURCE_DENIED' };
      }
      return { status: 'provided', bytes, contentLength: bytes.length, mediaType: 'image/png', revision };
    } };
  };
  const space = createCoordinateSpaceDefinition({ reference: { projectId, coordinateSpaceId: 'preview-ground' },
    componentCount: 2, axes: { x: 'right', y: 'down' }, origin: { x: 0, y: 0 }, unit: 'scene-unit' });
  const plane = { ...space.reference, unit: space.unit, axes: space.axes };
  const authored = createSceneMembership({ scene: { identity: { projectId, sceneId: 'camera-scene' } },
    objects: [{ definition: { objectId: 'authored-illustration' }, assetReference: { projectId, assetId },
      placement: { coordinateSpaceId: plane.coordinateSpaceId, point: { x: 160, y: 120 } } }] });
  const sources = [{ role: 'image', locator: { type: 'project-relative', path: 'samples/traveler.png' } }] as const;
  const catalog = createAssetCatalog({ projectId, definitions: [{ identity: { projectId, assetId }, kind: 'image', metadata: {}, sources }] });
  const document = createDocumentSession(createDocumentEnvelope({ schemaVersion: 1, identity: { projectId, documentId: 'camera-document' },
    documentKind: 'camera-manual-scene', contentSchemaVersion: 1, content: authored }), null);
  document.open();
  // Legacy projection is explicit Phase4 data required by Phase8's existing input;
  // bound frames use Render's camera path, never this host's own projection math.
  const transform = { local: { translation: { x: 0, y: 0 }, rotationRadians: 0, scale: { x: 1, y: 1 } },
    anchor: { unit: plane.unit, anchor: { x: 16, y: 24 }, pivot: { x: 16, y: 24 }, localOffset: { x: 0, y: 0 } },
    orientation: { axes: plane.axes, zeroAxis: 'positive-x', positiveRotation: 'toward-positive-y', angleRadians: 0 },
    projection: createOrthographicPlaneProjection({ kind: 'orthographic-plane', source: plane,
      destination: { projectId, coordinateSpaceId: 'render-clip-2d', unit: 'clip-unit', axes: { x: 'right', y: 'up' } },
      sourceOrigin: { x: 0, y: 0 }, destinationOrigin: { x: -1, y: 1 },
      destinationUnitsPerSourceUnit: { x: 0.00625, y: 0.008333333333333333 } }) } as const;
  const layout = { unit: plane.unit, x: 0, y: 0, width: source.width, height: source.height };
  const presentation = (): ScenePreviewPresentation => ({ space, transform, layout, visible: true,
    order: { layerKey: 'default', order: 0 }, bindingKey: revision, sourceRevision: revision, frame: null });
  const camera = { kind: 'orthographic', source: plane, center: { x: 160, y: 120 },
    scale: { unit: 'css-px-per-source-unit', x: 1, y: 1 }, zoom: 1, viewportPolicy: 'preserve-scale' } as const;
  const zoomLimits = { min: 0.1, max: 10 };
  const editor = mountEditorCamera(a, { authored, catalog, provider: provider(), presentation, camera, zoomLimits },
    (event, value) => report(`A ${event}`, value), ratioA);
  let client: ReturnType<typeof mountClientCamera>;
  try {
    client = mountClientCamera(b, { provider: provider(), camera, zoomLimits,
      resource: { descriptor: { identity: { projectId, resourceId: assetId }, mediaType: 'image/png', sources },
        sourceIndex: 0, sourceRevision: revision, frame: null },
      transform: { ...transform, placement: { plane, point: { x: 160, y: 120 } } }, layout },
      (event, value) => report(`B ${event}`, value), ratioB);
  } catch (error) { editor.close(); throw error; }
  const before = { authored: JSON.stringify(authored), document: JSON.stringify(document.getSnapshot()),
    neutralPlacement: JSON.stringify(client.inspect().neutralPlacement) };
  const inspect = () => {
    const e = editor.inspect(), c = client.inspect();
    report('Independent camera/session and immutable truth observation', { editor: e, client: c,
      distinctCameraIds: e.camera && c.camera ? e.camera.camera.id !== c.camera.camera.id : null,
      distinctSessionIds: e.binding && c.binding ? e.binding.sessionId !== c.binding.sessionId : null,
      authoredUnchanged: JSON.stringify(authored) === before.authored,
      documentSnapshotUnchanged: JSON.stringify(document.getSnapshot()) === before.document,
      neutralPlacementUnchanged: JSON.stringify(c.neutralPlacement) === before.neutralPlacement });
  };
  return { editor, client, inspect, plane, close() { try { editor.close(); } finally { client.close(); } } };
}
