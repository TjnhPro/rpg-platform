import { createConfiguredRenderCamera, createRenderCamera, getRenderCameraViewSnapshot,
  setRenderCameraZoom, zoomRenderCameraAtFocus, panRenderCamera,
  createViewportMapping2D, viewportPointToPlane2D, projectPointToViewport2D,
  type RenderCamera, type RenderCameraFocusZoomInput, type ViewportMapping2D,
  type OrthographicCameraConfigurationInput } from '@rpg-platform/runtime-render';

/** Optional finite public-root CPU walkthrough, no assertions/runner or fake graphics. */
export function observeCameraZoom(log: (label: string, value: unknown) => void,
  readOwnedState: () => unknown = () => 'No authored/live owner supplied'): void {
  const input: OrthographicCameraConfigurationInput = { kind: 'orthographic',
    source: { projectId: 'camera-manual', coordinateSpaceId: 'ground', unit: 'world-unit', axes: { x: 'right', y: 'down' } },
    center: { x: 100, y: 50 }, scale: { unit: 'css-px-per-source-unit', x: 2, y: 2 },
    zoom: 1, viewportPolicy: 'preserve-scale' };
  const limits = { min: 0.25, max: 8 };
  const a = createConfiguredRenderCamera(input, limits), b = createConfiguredRenderCamera(input, limits);
  const bBefore = getRenderCameraViewSnapshot(b), history = getRenderCameraViewSnapshot(a);
  const mappingFor = (camera: RenderCamera): ViewportMapping2D => {
    const config = getRenderCameraViewSnapshot(camera).configuration;
    const plane = { projectId: config.source.projectId, coordinateSpaceId: 'viewport',
      unit: 'css-px', axes: { x: 'right', y: 'down' } } as const;
    return createViewportMapping2D({ projection: { kind: 'orthographic-plane', source: config.source,
      destination: plane, sourceOrigin: config.center, destinationOrigin: { x: 400, y: 225 },
      destinationUnitsPerSourceUnit: config.effectiveCssPixelsPerSourceUnit },
    metrics: { plane, width: 800, height: 450, screen: null } });
  };
  const mapping = mappingFor(a), focus = { plane: mapping.metrics.plane, point: { x: 500, y: 275 } };
  log('Owner before', readOwnedState());
  const world = viewportPointToPlane2D(mapping, focus);
  log('World focus before', world);
  const changed = zoomRenderCameraAtFocus(a, { zoom: 2, mapping, focus });
  const finalMapping = mappingFor(a), recovered = viewportPointToPlane2D(finalMapping, focus);
  log('Focus result', { center: changed.camera.center, zoom: changed.configuration.zoom,
    effective: changed.configuration.effectiveCssPixelsPerSourceUnit,
    cameraRevision: changed.camera.revision, viewRevision: changed.revision,
    worldAfter: recovered, projectedBeforeWorld: projectPointToViewport2D(finalMapping, world),
    absoluteWorldError: { x: Math.abs(world.point.x - recovered.point.x), y: Math.abs(world.point.y - recovered.point.y) },
    sampleTolerance: 1e-12, sameIdentity: changed.camera.id === history.camera.id,
    historyCenter: history.camera.center, historyZoom: history.configuration.zoom });
  log('Factor1 no-op', { centerZoom: setRenderCameraZoom(a, changed.configuration.zoom * 1) === changed,
    focusZoom: zoomRenderCameraAtFocus(a, { zoom: changed.configuration.zoom * 1, mapping: finalMapping, focus }) === changed });
  Object.assign(input.center, { x: 999 }); Object.assign(input.scale, { x: 999 }); Object.assign(limits, { max: 999 });
  log('Detached and frozen', { center: history.configuration.center, scale: history.configuration.scale,
    limits: history.zoomLimits, frozen: [changed, changed.configuration, changed.camera,
      changed.configuration.center, changed.configuration.scale, changed.zoomLimits].map(Object.isFrozen) });
  const c = createConfiguredRenderCamera({
    kind: 'orthographic', source: history.configuration.source, center: { x: 100, y: 50 },
    scale: history.configuration.scale, zoom: 1, viewportPolicy: 'preserve-scale' }, { min: 0.25, max: 8 });
  const cBefore = c.getSnapshot();
  const centered = setRenderCameraZoom(c, 2);
  log('Center zoom', { center: centered.camera.center, cameraSnapshotUnchanged: cBefore === c.getSnapshot(),
    viewRevision: centered.revision, atMidpoint: projectPointToViewport2D(mappingFor(c), {
      plane: centered.configuration.source, point: centered.camera.center }) });
  log('Inclusive limit endpoints', { min: setRenderCameraZoom(c, 0.25).configuration.zoom,
    max: setRenderCameraZoom(c, 8).configuration.zoom });
  c.dispose();
  const attempt = (label: string, camera: RenderCamera, action: () => unknown): void => {
    const before = getRenderCameraViewSnapshot(camera), cameraBefore = camera.getSnapshot();
    try { log(label, { returned: action() }); }
    catch (error) { log(label, { thrown: error instanceof Error ? error.name : typeof error,
      message: error instanceof Error ? error.message : null,
      viewPreserved: getRenderCameraViewSnapshot(camera) === before, cameraPreserved: camera.getSnapshot() === cameraBefore }); }
  };
  attempt('Zero zoom', a, () => setRenderCameraZoom(a, 0));
  attempt('Negative zoom', a, () => setRenderCameraZoom(a, -1));
  attempt('NaN zoom', a, () => setRenderCameraZoom(a, NaN));
  attempt('Infinite zoom', a, () => setRenderCameraZoom(a, Infinity));
  attempt('Outside limits', a, () => setRenderCameraZoom(a, 16));
  attempt('Missing context', a, () => zoomRenderCameraAtFocus(a, { zoom: 4 } as RenderCameraFocusZoomInput));
  attempt('Stale mapping', a, () => zoomRenderCameraAtFocus(a, { zoom: 4, mapping, focus }));
  attempt('Zero dimension', a, () => zoomRenderCameraAtFocus(a, { zoom: 4,
    mapping: { ...finalMapping, metrics: { ...finalMapping.metrics, width: 0 } }, focus }));
  attempt('Unknown source plane', a, () => zoomRenderCameraAtFocus(a, { zoom: 4, mapping: {
    ...finalMapping, projection: { ...finalMapping.projection,
      source: { ...finalMapping.projection.source, coordinateSpaceId: 'unknown' } } }, focus }));
  attempt('Focus physical pixels', a, () => zoomRenderCameraAtFocus(a, { zoom: 4, mapping: finalMapping,
    focus: { ...focus, plane: { ...focus.plane, unit: 'device-px' } } }));
  const numeric = createConfiguredRenderCamera({ kind: 'orthographic', source: history.configuration.source,
    center: { x: 100, y: 50 }, scale: history.configuration.scale, zoom: 1, viewportPolicy: 'preserve-scale' },
  { min: Number.MIN_VALUE, max: Number.MAX_VALUE });
  attempt('Unsafe candidate inverse', numeric, () => zoomRenderCameraAtFocus(numeric, { zoom: Number.MIN_VALUE, mapping: mappingFor(numeric), focus }));
  attempt('Effective scale overflow', numeric, () => setRenderCameraZoom(numeric, Number.MAX_VALUE));
  numeric.dispose();
  const tiny = createConfiguredRenderCamera({ kind: 'orthographic', source: history.configuration.source,
    center: { x: 0, y: 0 }, scale: { unit: 'css-px-per-source-unit', x: Number.MIN_VALUE, y: Number.MIN_VALUE },
    zoom: 1, viewportPolicy: 'preserve-scale' }, { min: Number.MIN_VALUE, max: 1 });
  attempt('Effective scale zero underflow', tiny, () => setRenderCameraZoom(tiny, Number.MIN_VALUE));
  tiny.dispose();
  log('Reverse focus', zoomRenderCameraAtFocus(a, { zoom: 1, mapping: finalMapping, focus }).configuration);
  log('Pan synchronizes view center', panRenderCamera(a, { plane: history.configuration.source, delta: { x: 5, y: 0 } }));
  log('View center after pan', getRenderCameraViewSnapshot(a).configuration.center);
  log('Independent B', { sameSnapshot: bBefore === getRenderCameraViewSnapshot(b), center: b.getSnapshot().center });
  log('Owner after', readOwnedState());
  a.dispose();
  attempt('Disposed camera set', a, () => setRenderCameraZoom(a, 2));
  attempt('Disposed camera focus', a, () => zoomRenderCameraAtFocus(a, { zoom: 2, mapping, focus }));
  b.dispose();
  const plain = createRenderCamera({ kind: 'orthographic', source: history.configuration.source, center: { x: 100, y: 50 } });
  try { setRenderCameraZoom(plain, 2); }
  catch (error) { log('Unconfigured camera rejects zoom', { thrown: error instanceof Error ? error.name : typeof error }); }
  plain.dispose();
}
