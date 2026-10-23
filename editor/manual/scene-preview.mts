import {
  createScenePreviewBridge, createSceneMembership, createAssetCatalog,
  type AssetCatalog, type ScenePreviewPresentation,
} from '@rpg-platform/editor';
import {
  createRenderFrameSession, createRenderVisualScene, createVisualResourceCache,
  getRenderVisualSceneDiagnostics, listRenderVisualInstances,
  type RenderHostBinding, type VisualSourceProvider,
} from '@rpg-platform/runtime-render';

/** Optional finite manual browser consumer. Host supplies authorized catalog/provider/PNG.
 * No assertions, auto-run, fake leases, test fixtures or authored persistence effects. */
export async function openEditorScenePreview(host: RenderHostBinding, provider: VisualSourceProvider,
  catalogInput: AssetCatalog, assetId: string, missingAssetId: string, sourceRevision: string,
  report: (label: string, value: unknown) => void) {
  const catalog = createAssetCatalog(catalogInput);
  const cache = createVisualResourceCache(provider, { maxCpuEntries: 4, maxGpuEntries: 4 });
  const session = await createRenderFrameSession(host).catch(error => { cache.dispose(); throw error; });
  const scene = (() => { try { return createRenderVisualScene(session); }
    catch (error) { try { cache.dispose(); } finally { session.dispose(); } throw error; } })();
  const identity = { projectId: catalog.projectId, sceneId: 'manual-preview' };
  const bridge = createScenePreviewBridge(scene, identity, (descriptor, plan) => cache.acquire(session,
    descriptor, 0, plan.sourceRevision, { maxBytes: 1048576, maxDimension: 2048, maxPixels: 4194304 },
    { sampling: 'nearest', colorSpace: 'srgb' }));
  const space = { reference: { projectId: catalog.projectId, coordinateSpaceId: 'preview-ground' },
    componentCount: 2, axes: { x: 'right', y: 'down' }, origin: { x: 0, y: 0 }, unit: 'scene-unit' } as const;
  const plane = { ...space.reference, axes: space.axes, unit: space.unit };
  let y = 140, removed = false, visible = true, order = 0, closed = false;
  const membership = () => createSceneMembership({ scene: { identity }, objects:
    ['object-a', 'object-b', 'object-c', 'missing'].filter(id => !removed || id !== 'object-b').map(id => ({
      definition: { objectId: id }, assetReference: { projectId: identity.projectId,
        assetId: id === 'missing' ? missingAssetId : assetId },
      placement: { coordinateSpaceId: space.reference.coordinateSpaceId,
        point: { x: 80 + ['object-a', 'object-b', 'object-c', 'missing'].indexOf(id) * 48,
          y: id === 'object-a' ? y : 140 } },
    })) });
  const policy = (): ScenePreviewPresentation => ({ space, bindingKey: 'whole-png-nearest-srgb', sourceRevision,
    frame: null, layout: { unit: space.unit, x: 0, y: 0, width: 64, height: 64 }, visible,
    order: { layerKey: 'default', order }, transform: {
      local: { translation: { x: 0, y: 0 }, rotationRadians: 0, scale: { x: 1, y: 1 } },
      anchor: { unit: space.unit, anchor: { x: 32, y: 64 }, pivot: { x: 32, y: 64 }, localOffset: { x: 0, y: 0 } },
      orientation: { axes: space.axes, zeroAxis: 'positive-x', positiveRotation: 'toward-positive-y', angleRadians: 0 },
      projection: { kind: 'orthographic-plane', source: plane,
        destination: { projectId: identity.projectId, coordinateSpaceId: 'render-clip-2d', unit: 'clip-unit', axes: { x: 'right', y: 'up' } },
        sourceOrigin: { x: 0, y: 0 }, destinationOrigin: { x: -1, y: 1 }, destinationUnitsPerSourceUnit: { x: 2 / 320, y: 2 / 240 } },
    } });
  const log = (label: string, value: unknown): void => { try { report(label, value); } catch {} };
  const sync = async () => {
    if (closed) throw new TypeError('Manual preview closed');
    const authored = membership();
    log('Authored input before preview', JSON.stringify(authored));
    const outcomes = await bridge.sync(authored, catalog, policy);
    log('Per-object partial outcomes; inspect diagnosed reasons', outcomes);
    log('Authored input after preview', JSON.stringify(authored));
    if (!closed) log('Submitted only; not visual proof', session.renderFrame());
    return outcomes;
  };
  const close = () => {
    closed = true;
    const failures: unknown[] = [];
    for (const action of [() => log('Bridge cleanup', bridge.close()), () => scene.dispose(),
      () => cache.dispose(), () => session.dispose()]) {
      try { action(); } catch (error) { failures.push(error); }
    }
    log('Cleanup exceptions; no leak-free claim', failures);
  };
  try {
    await sync();
    return Object.freeze({ sync, close,
      moveFirst: async (nextY: number) => { y = nextY; return sync(); },
      removeSecond: async () => { removed = true; return sync(); },
      visibility: async (next: boolean) => { visible = next; return sync(); },
      ordering: async (next: number) => { order = next; return sync(); },
      inspect: () => ({ instances: listRenderVisualInstances(scene),
        scene: getRenderVisualSceneDiagnostics(scene), cache: cache.getSnapshot() }),
    });
  } catch (error) { close(); throw error; }
}
