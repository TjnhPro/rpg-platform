import { Button, Stack, Text } from '@mantine/core';
import { useMemo, useRef, useState } from 'react';
import { createRenderVisualScene, createVisualResourceCache, addRenderVisualLayer,
  createConfiguredRenderCamera, bindRenderCameraToVisualScene } from '@rpg-platform/runtime-render';
import { validateVisualSceneDocument, describeVisualPresentation, describeMapLayers, describeMapBackgroundLayout,
  createScenePreviewBridge, createSceneMembership, resolveAssetReference,
  type DocumentEnvelope, type AssetCatalog, type ScenePreviewPresentation } from '@rpg-platform/editor';
import type { AssetResourceGrant } from '../asset-browser/AssetViewport.js';
import { Viewport } from '../../viewport/Viewport.js';
import { editorTokens } from '../../theme/index.js';

/** Feature policy on the existing viewport host and Scene bridge; no renderer/RAF. */
export function VisualViewport({ document, catalog, grant, showGuidance }: {
  readonly document: DocumentEnvelope | null; readonly catalog: AssetCatalog | null;
  readonly grant: AssetResourceGrant | null; readonly showGuidance: boolean;
}) {
  const [message, setMessage] = useState('Acquire, then preview the current Scene.');
  const live = useRef<{ preview: () => Promise<void> } | null>(null);
  const contentFactory = useMemo(() => (requestFrame: () => void) => {
    let scene: ReturnType<typeof createRenderVisualScene> | undefined;
    let cache: ReturnType<typeof createVisualResourceCache> | undefined;
    let camera: ReturnType<typeof createConfiguredRenderCamera> | undefined;
    let cameraBinding: ReturnType<typeof bindRenderCameraToVisualScene> | undefined;
    let bridge: ReturnType<typeof createScenePreviewBridge> | undefined;
    let owned: typeof live.current = null, closed = false, busy = false;
    return {
      acquired(session: Parameters<typeof createRenderVisualScene>[0]) {
        if (!document || !catalog || !grant || grant.root.projectId !== document.identity.projectId) return;
        const map = validateVisualSceneDocument(document, catalog), { profile, identity, membership } = map;
        const requests = describeMapLayers(document, catalog);
        const plane = { ...profile.space.reference, unit: profile.space.unit, axes: profile.space.axes };
        scene = createRenderVisualScene(session);
        for (const layer of requests.layers) addRenderVisualLayer(scene, layer);
        cache = createVisualResourceCache(grant.provider, { maxCpuEntries: 4, maxGpuEntries: 4 });
        bridge = createScenePreviewBridge(scene, identity, (descriptor, presentation) => {
          if (closed || !cache) throw new TypeError('VISUAL_PREVIEW_CLOSED');
          return cache.acquire(session, descriptor, descriptor.sources.findIndex(source => source.role === 'image'), presentation.sourceRevision,
            { maxBytes: 4_194_304, maxDimension: 2048, maxPixels: 4_194_304 }, { sampling: 'nearest', colorSpace: 'srgb' });
        });
        // Explicit finite host view policy, independent of authored facing or scale.
        camera = createConfiguredRenderCamera({ kind: 'orthographic', source: plane, center: { x: 128, y: 128 },
          scale: { unit: 'css-px-per-source-unit', x: 1, y: 1 }, zoom: 1, viewportPolicy: 'preserve-scale' }, { min: 0.25, max: 4 });
        const currentBridge = bridge;
        owned = { async preview() {
          if (busy || closed) return;
          busy = true;
          try {
            const presentations = new Map<string, ScenePreviewPresentation>(), skipped: string[] = [];
            const objects = [];
            for (const object of membership.objects) {
              const id = object.definition.objectId, order = requests.objects.find(item => item.objectId === id)?.order;
              if (!object.assetReference || !object.placement || !order) { skipped.push(`${id}: unavailable binding/placement/layer`); continue; }
              const resolution = resolveAssetReference(catalog, object.assetReference);
              if (resolution.status !== 'resolved') { skipped.push(`${id}: unresolved Asset`); continue; }
              const source = resolution.definition.sources.find(item => item.role === 'image');
              if (!source) { skipped.push(`${id}: UNSUPPORTED_VISUAL`); continue; }
              const observed = await grant.existing.observe({ projectId: identity.projectId, bindingId: grant.root.bindingId, locator: source.locator });
              if (closed) return;
              if (observed.status !== 'available') { skipped.push(`${id}: source unavailable`); continue; }
              const host: ScenePreviewPresentation = { space: profile.space, frame: null, order, visible: true,
                bindingKey: JSON.stringify([object.assetReference, observed.observation.revision]), sourceRevision: observed.observation.revision,
                layout: object.definition.classification === 'editor-map:background' ? describeMapBackgroundLayout(document, catalog)
                  : { unit: plane.unit, x: -16, y: -16, width: 32, height: 32 },
                transform: { local: { translation: { x: 0, y: 0 }, rotationRadians: 0, scale: { x: 1, y: 1 } },
                  anchor: { unit: plane.unit, anchor: { x: 0, y: 0 }, pivot: { x: 0, y: 0 }, localOffset: { x: 0, y: 0 } },
                  orientation: { axes: plane.axes, zeroAxis: 'positive-x', positiveRotation: 'toward-positive-y', angleRadians: 0 },
                  projection: { kind: 'orthographic-plane', source: plane,
                    destination: { ...plane, coordinateSpaceId: 'render-clip-2d', unit: 'clip-unit', axes: { x: 'right', y: 'up' } },
                    sourceOrigin: { x: 0, y: 0 }, destinationOrigin: { x: 0, y: 0 }, destinationUnitsPerSourceUnit: { x: 1, y: 1 } } } };
              presentations.set(id, describeVisualPresentation(document, id, catalog, host)); objects.push(object);
            }
            if (closed) return;
            const outcomes = await currentBridge.sync(createSceneMembership({ scene: membership.scene, objects }), catalog,
              description => presentations.get(description.correlation.objectId)!);
            if (!closed) { requestFrame(); setMessage([...outcomes.map(item => `${item.objectId}: ${item.status}${item.reason ? ` (${item.reason})` : ''}`), ...skipped].join(' · ') || 'Scene has no previewable objects.'); }
          } catch { if (!closed) setMessage('PREVIEW_NOT_VERIFIED: preview unavailable; authored Scene is unchanged.'); }
          finally { busy = false; }
        } };
        live.current = owned;
      },
      configured(_session: Parameters<typeof createRenderVisualScene>[0], resize: Parameters<typeof bindRenderCameraToVisualScene>[2], metrics: { logicalWidthCssPx: number; logicalHeightCssPx: number }) {
        if (!scene || !camera) return;
        const logical = { plane: { projectId: camera.getSnapshot().source.projectId, coordinateSpaceId: 'inspector-viewport',
          unit: 'css-px', axes: { x: 'right' as const, y: 'down' as const } }, width: metrics.logicalWidthCssPx, height: metrics.logicalHeightCssPx, screen: null };
        if (cameraBinding) cameraBinding.configure(resize, logical); else cameraBinding = bindRenderCameraToVisualScene(camera, scene, resize, logical);
      },
      release() {
        closed = true; if (live.current === owned) live.current = null;
        try { bridge?.close(); } finally { try { cameraBinding?.dispose(); camera?.dispose(); }
          finally { try { scene?.dispose(); } finally { cache?.dispose(); } } }
      }
    };
  }, [document, catalog, grant]);
  return <Stack gap={editorTokens.spacing.standard} h="100%">
    <Button variant="default" disabled={!document || !catalog || !grant} onClick={() => void live.current?.preview()}>Preview Scene</Button>
    <Text role="status">{message}</Text>
    <Viewport showGuidance={showGuidance} contentFactory={contentFactory} />
  </Stack>;
}
