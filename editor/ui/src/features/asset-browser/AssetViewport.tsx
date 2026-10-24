import { Button, Stack, Text } from '@mantine/core';
import { useMemo, useRef, useState } from 'react';
import { createRenderVisualScene, createVisualResourceCache, type VisualSourceProvider } from '@rpg-platform/runtime-render';
import { createAssetPreviewController, getManagedAssetSelection, getAssetManagerProjectSnapshot,
  resolveAssetReference, type AssetManagerProject, type AssetPreviewController, type ExistingResourcePort,
  type ProjectRootBinding } from '@rpg-platform/editor';
import { Viewport } from '../../viewport/Viewport.js';
import { editorTokens } from '../../theme/index.js';

export interface AssetResourceGrant {
  readonly root: ProjectRootBinding;
  readonly provider: VisualSourceProvider;
  readonly existing: ExistingResourcePort;
}
/** Feature content uses the existing viewport host; no second target/session/loop. */
export function AssetViewport({ context, grant = null, showGuidance }: {
  readonly context: AssetManagerProject | null; readonly grant?: AssetResourceGrant | null; readonly showGuidance: boolean;
}) {
  const controller = useRef<AssetPreviewController | null>(null);
  const [message, setMessage] = useState('Acquire the viewport to preview a supported selection.');
  const contentFactory = useMemo(() => (requestFrame: () => void) => {
    let scene: ReturnType<typeof createRenderVisualScene> | undefined;
    let cache: ReturnType<typeof createVisualResourceCache> | undefined;
    return {
      acquired(session: Parameters<typeof createRenderVisualScene>[0]) {
        if (!context || !grant) return;
        scene = createRenderVisualScene(session);
        cache = createVisualResourceCache(grant.provider, { maxCpuEntries: 2, maxGpuEntries: 2 });
        controller.current = createAssetPreviewController(context, scene, request => {
          if (request.root !== grant.root || !cache) throw new TypeError('ROOT_MISMATCH');
          return cache.acquire(session, request.descriptor, request.sourceIndex, request.sourceRevision,
            { maxBytes: 4_194_304, maxDimension: 2048, maxPixels: 4_194_304 }, { sampling: 'nearest', colorSpace: 'srgb' });
        }, requestFrame);
      },
      configured() {},
      release() {
        try { controller.current?.dispose(); } finally {
          controller.current = null;
          try { scene?.dispose(); } finally { cache?.dispose(); }
        }
      },
    };
  }, [context, grant]);
  async function preview() {
    const owned = controller.current;
    if (!context || !grant || !owned) { setMessage('Acquire the viewport and connect a resource host first.'); return; }
    try {
      const snapshot = getAssetManagerProjectSnapshot(context);
      const selection = getManagedAssetSelection(context);
      if (selection.status !== 'resolved') { setMessage(`Selection: ${selection.status}`); return; }
      const resolved = resolveAssetReference(snapshot.catalog, selection.reference);
      let sourceRevision = 'unsupported-no-source-read';
      if (resolved.status === 'resolved' && resolved.definition.kind === 'image') {
        const source = resolved.definition.sources.find(item => item.role === 'image');
        if (!source) { setMessage('Image source unavailable.'); return; }
        const observation = await grant.existing.observe({ projectId: snapshot.projectId, bindingId: grant.root.bindingId, locator: source.locator });
        if (observation.status !== 'available') { setMessage(`Source: ${observation.reason}`); return; }
        sourceRevision = observation.observation.revision;
      }
      if (controller.current !== owned) return;
      const plane = { projectId: snapshot.projectId, coordinateSpaceId: 'asset-preview', unit: 'preview-unit', axes: { x: 'right' as const, y: 'up' as const } };
      const result = await owned.preview({ sourceRevision, layout: { unit: plane.unit, x: 0, y: 0, width: 1, height: 1 }, transform: {
        placement: { plane, point: { x: 0, y: 0 } },
        local: { translation: { x: 0, y: 0 }, rotationRadians: 0, scale: { x: 1, y: 1 } },
        anchor: { unit: plane.unit, anchor: { x: 0.5, y: 0.5 }, pivot: { x: 0, y: 0 }, localOffset: { x: 0, y: 0 } },
        orientation: { axes: plane.axes, zeroAxis: 'positive-x', positiveRotation: 'toward-positive-y', angleRadians: 0 },
        projection: { kind: 'orthographic-plane', source: plane,
          destination: { projectId: snapshot.projectId, coordinateSpaceId: 'render-clip-2d', unit: 'clip-unit', axes: plane.axes },
          sourceOrigin: { x: 0, y: 0 }, destinationOrigin: { x: 0, y: 0 }, destinationUnitsPerSourceUnit: { x: 1, y: 1 } },
      } });
      if (controller.current === owned) setMessage(`Preview: ${result.state}${result.reason ? ` · ${result.reason}` : ''} · Display not verified.`);
    } catch { if (controller.current === owned) setMessage('Preview unavailable for this selection or resource grant.'); }
  }
  return <Stack gap={editorTokens.spacing.standard} h="100%">
    <Button variant="default" disabled={!context || !grant} onClick={() => void preview()}>Preview selected asset</Button>
    <Text role="status">{message}</Text>
    <Viewport showGuidance={showGuidance} contentFactory={contentFactory} />
  </Stack>;
}
