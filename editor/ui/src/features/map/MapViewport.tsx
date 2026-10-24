import { Button, Stack, Text } from '@mantine/core';
import { useMemo, useRef, useState } from 'react';
import { createRenderVisualScene, createVisualResourceCache, addRenderVisualLayer,
  createConfiguredRenderCamera, bindRenderCameraToVisualScene } from '@rpg-platform/runtime-render';
import { readMapProfile, describeMapLayers, describeMapBackgroundLayout, mapCellToPlacement,
  createScenePreviewBridge, createSceneMembership, resolveAssetReference,
  type DocumentEnvelope, type AssetCatalog, type ScenePreviewBridge, type ScenePreviewPresentation } from '@rpg-platform/editor';
import type { AssetResourceGrant } from '../asset-browser/AssetViewport.js';
import { Viewport } from '../../viewport/Viewport.js';
import { editorTokens } from '../../theme/index.js';

export function MapViewport({ document, catalog, grant, showGuidance }: {
  readonly document: DocumentEnvelope | null; readonly catalog: AssetCatalog | null;
  readonly grant: AssetResourceGrant | null; readonly showGuidance: boolean;
}) {
  const [message, setMessage] = useState('Acquire, then preview the current Map.');
  const live = useRef<{ bridge: ScenePreviewBridge; preview: () => Promise<void> } | null>(null);
  const contentFactory = useMemo(() => (requestFrame: () => void) => {
    let scene: ReturnType<typeof createRenderVisualScene> | undefined;
    let cache: ReturnType<typeof createVisualResourceCache> | undefined;
    let camera: ReturnType<typeof createConfiguredRenderCamera> | undefined;
    let binding: ReturnType<typeof bindRenderCameraToVisualScene> | undefined;
    let bridge: ScenePreviewBridge | undefined;
    let closed = false, busy = false;
    return {
      acquired(session: Parameters<typeof createRenderVisualScene>[0]) {
        if (!document || !catalog || !grant || grant.root.projectId !== document.identity.projectId) return;
        const admitted = readMapProfile(document, catalog);
        if (admitted.status !== 'supported') return;
        const { profile, membership, identity } = admitted.snapshot;
        const requests = describeMapLayers(document, catalog);
        scene = createRenderVisualScene(session);
        for (const layer of requests.layers) addRenderVisualLayer(scene, layer);
        cache = createVisualResourceCache(grant.provider, { maxCpuEntries: 4, maxGpuEntries: 4 });
        bridge = createScenePreviewBridge(scene, identity, (descriptor, presentation) => {
          if (closed || !cache) throw new TypeError('MAP_PREVIEW_CLOSED');
          const sourceIndex = descriptor.sources.findIndex(source => source.role === 'image');
          return cache.acquire(session, descriptor, sourceIndex, presentation.sourceRevision,
            { maxBytes: 4_194_304, maxDimension: 2048, maxPixels: 4_194_304 }, { sampling: 'nearest', colorSpace: 'srgb' });
        });
        const plane = { ...profile.space.reference, unit: profile.space.unit, axes: profile.space.axes };
        camera = createConfiguredRenderCamera({ kind: 'orthographic', source: plane,
          center: mapCellToPlacement(document, { column: Math.floor((profile.extentCells.width - 1) / 2), row: Math.floor((profile.extentCells.height - 1) / 2) }, catalog).point,
          scale: { unit: 'css-px-per-source-unit', x: 1, y: 1 }, zoom: 1, viewportPolicy: 'preserve-scale' }, { min: 0.25, max: 4 });
        const owned = bridge;
        live.current = { bridge: owned, async preview() {
          if (busy || closed) return;
          busy = true;
          try {
            const presentations = new Map<string, ScenePreviewPresentation>();
            const objects = membership.objects.filter(entry => ['editor-map:background', 'editor-map:tile'].includes(entry.definition.classification ?? ''));
            for (const object of objects) {
              const resolution = resolveAssetReference(catalog, object.assetReference!);
              if (resolution.status !== 'resolved') throw new TypeError('MAP_SOURCE_UNRESOLVED');
              const source = resolution.definition.sources.find(item => item.role === 'image')!;
              const observed = await grant.existing.observe({ projectId: identity.projectId, bindingId: grant.root.bindingId, locator: source.locator });
              if (closed) return;
              if (observed.status !== 'available') throw new TypeError('MAP_SOURCE_UNAVAILABLE');
              const order = requests.objects.find(item => item.objectId === object.definition.objectId)!.order;
              presentations.set(object.definition.objectId, { space: profile.space, frame: null, order,
                visible: profile.layers.find(layer => layer.layerKey === object.layerKey)!.visible,
                bindingKey: JSON.stringify([object.assetReference, observed.observation.revision]), sourceRevision: observed.observation.revision,
                layout: object.definition.classification === 'editor-map:background' ? describeMapBackgroundLayout(document, catalog)
                  : { unit: plane.unit, x: -profile.grid.cellSize.width / 2, y: -profile.grid.cellSize.height / 2,
                    width: profile.grid.cellSize.width, height: profile.grid.cellSize.height },
                transform: { local: { translation: { x: 0, y: 0 }, rotationRadians: 0, scale: { x: 1, y: 1 } },
                  anchor: { unit: plane.unit, anchor: { x: 0, y: 0 }, pivot: { x: 0, y: 0 }, localOffset: { x: 0, y: 0 } },
                  orientation: { axes: plane.axes, zeroAxis: 'positive-x', positiveRotation: 'toward-positive-y', angleRadians: 0 },
                  projection: { kind: 'orthographic-plane', source: plane,
                    destination: { ...plane, coordinateSpaceId: 'render-clip-2d', unit: 'clip-unit', axes: { x: 'right', y: 'up' } },
                    sourceOrigin: { x: 0, y: 0 }, destinationOrigin: { x: 0, y: 0 }, destinationUnitsPerSourceUnit: { x: 1, y: 1 } } }
              });
            }
            if (closed) return;
            const outcomes = await owned.sync(createSceneMembership({ scene: membership.scene, objects }), catalog,
              description => presentations.get(description.correlation.objectId)!);
            if (!closed) { requestFrame(); setMessage(outcomes.map(item => `${item.objectId}: ${item.status}${item.reason ? ` (${item.reason})` : ''}`).join(' · ') || 'Map has no background/tiles.'); }
          } catch { if (!closed) setMessage('Map preview unavailable. Inspect image authorization and Render diagnostics.'); }
          finally { busy = false; }
        } };
      },
      configured(_session: Parameters<typeof createRenderVisualScene>[0], resize: Parameters<typeof bindRenderCameraToVisualScene>[2], metrics: { logicalWidthCssPx: number; logicalHeightCssPx: number }) {
        if (!scene || !camera) return;
        const logical = { plane: { projectId: camera.getSnapshot().source.projectId, coordinateSpaceId: 'map-viewport',
          unit: 'css-px', axes: { x: 'right' as const, y: 'down' as const } }, width: metrics.logicalWidthCssPx, height: metrics.logicalHeightCssPx, screen: null };
        if (binding) binding.configure(resize, logical); else binding = bindRenderCameraToVisualScene(camera, scene, resize, logical);
      },
      release() {
        closed = true;
        if (live.current?.bridge === bridge) live.current = null;
        try { bridge?.close(); } finally { try { binding?.dispose(); camera?.dispose(); } finally { try { scene?.dispose(); } finally { cache?.dispose(); } } }
      }
    };
  }, [document, catalog, grant]);
  return <Stack gap={editorTokens.spacing.standard} h="100%">
    <Button variant="default" disabled={!document || !catalog || !grant} onClick={() => void live.current?.preview()}>Preview Map</Button>
    <Text role="status">{message}</Text>
    <Viewport showGuidance={showGuidance} contentFactory={contentFactory} />
  </Stack>;
}
