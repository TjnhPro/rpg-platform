import { createConfiguredRenderCamera, getRenderCameraViewSnapshot, projectRenderCameraPoint,
  screenToRenderCameraSelectedPlane, screenPointToViewport2D, zoomRenderCameraAtFocus,
  panRenderCamera, setRenderCameraCenter, setRenderCameraZoom, planRenderViewportSize,
  transitionRenderCameraWithinBounds, createRenderCameraGroundConfiguration,
  projectRenderCameraGroundPoint, viewportToRenderCameraGround, getRenderVisualDiagnostic,
  type RenderCameraGroundInverseInput } from '@rpg-platform/runtime-render';
import { createSceneMembership, createDocumentEnvelope, createDocumentSession } from '@rpg-platform/editor';

/** Button/Node-invoked finite observations; no assertions or automated suite. */
export function observeCameraMvpCoordinates(log: (event: string, detail: unknown) => void): void {
  const plane = { projectId: 'camera-mvp', coordinateSpaceId: 'ground', unit: 'scene-unit', axes: { x: 'right', y: 'down' } } as const;
  const authored = createSceneMembership({ scene: { identity: { projectId: plane.projectId, sceneId: 'manual-coordinates' } },
    objects: [['Map', 0, 0], ['Player', 100, 50], ['Monster-red', 130, 70], ['Monster-green', 170, 100], ['Monster-violet', 210, 70]].map(
      ([objectId, x, y]) => ({ definition: { objectId: String(objectId) },
        placement: { coordinateSpaceId: plane.coordinateSpaceId, point: { x: Number(x), y: Number(y) } } })) });
  const document = createDocumentSession(createDocumentEnvelope({ schemaVersion: 1,
    identity: { projectId: plane.projectId, documentId: 'manual-coordinate-document' }, documentKind: 'scene',
    contentSchemaVersion: 1, content: authored }), null);
  document.open();
  const truth = JSON.stringify({ authored, document: document.getSnapshot() });
  const config = { kind: 'orthographic', source: plane, center: { x: 100, y: 50 },
    scale: { unit: 'css-px-per-source-unit', x: 2, y: 2 }, zoom: 1, viewportPolicy: 'preserve-scale' } as const;
  const a = createConfiguredRenderCamera(config, { min: 0.1, max: 10 }), b = createConfiguredRenderCamera(config, { min: 0.1, max: 10 });
  const bBefore = getRenderCameraViewSnapshot(b);
  const logical = { plane: { ...plane, coordinateSpaceId: 'viewport-css', unit: 'css-px' }, width: 800, height: 450,
    screen: { plane: { ...plane, coordinateSpaceId: 'client-css', unit: 'css-px' }, origin: { x: 40, y: 80 },
      screenUnitsPerViewportUnit: { x: 1, y: 1 } } };
  const limits = { maxWidthPixels: 4096, maxHeightPixels: 4096, maxPixelCount: 16777216 };
  const observe = (label: string, x: number, y: number, expected: { x: number; y: number }) => {
    const point = { plane, point: { x, y } }, p = projectRenderCameraPoint(a, logical, point, null);
    const inverse = screenToRenderCameraSelectedPlane(a, logical,
      { cameraView: p.camera, selectedPlane: plane, point: p.screenPoint! }, null).selectedPlanePoint.point;
    log(label, { EXPECTED: expected, OBSERVED: { viewport: p.viewportPoint.point, screen: p.screenPoint!.point, inverse,
      residual: { x: inverse.x - x, y: inverse.y - y }, acceptedViewport: p.acceptedViewport }, tolerance: 1e-9 });
  };
  const rejected = (label: string, action: () => unknown, subject = a) => {
    const before = getRenderCameraViewSnapshot(subject);
    try { log(label, { EXPECTED: 'reject', OBSERVED: { returned: action() } }); }
    catch (error) { log(label, { EXPECTED: 'reject', OBSERVED: { thrown: error instanceof Error ? error.name : typeof error,
      safe: getRenderVisualDiagnostic(error), exactViewUnchanged: before === getRenderCameraViewSnapshot(subject) } }); }
  };
  try {
    observe('center', 100, 50, { x: 400, y: 225 });
    observe('world +X10', 110, 50, { x: 420, y: 225 });
    observe('world +Y10', 100, 60, { x: 400, y: 245 });
    panRenderCamera(a, { plane, delta: { x: 5, y: 0 } });
    observe('pan center105,50', 100, 50, { x: 390, y: 225 });
    setRenderCameraCenter(a, { plane, point: { x: 100, y: 50 } }); setRenderCameraZoom(a, 2);
    observe('center zoom2', 110, 50, { x: 440, y: 225 });
    setRenderCameraZoom(a, 1);
    const focus = { plane: logical.screen.plane, point: { x: 540, y: 280 } };
    const selectFocus = () => screenToRenderCameraSelectedPlane(a, logical,
      { cameraView: getRenderCameraViewSnapshot(a), selectedPlane: plane, point: focus }, null).selectedPlanePoint.point;
    const focusBefore = selectFocus(), mapping = projectRenderCameraPoint(a, logical, { plane, point: config.center }, null).mapping;
    zoomRenderCameraAtFocus(a, { zoom: 2, mapping, focus: screenPointToViewport2D(mapping, focus) });
    const focusAfter = selectFocus();
    log('focus zoom', { EXPECTED: { x: 150, y: 37.5 }, OBSERVED: { before: focusBefore, after: focusAfter,
      residual: { x: focusAfter.x - focusBefore.x, y: focusAfter.y - focusBefore.y } }, tolerance: 1e-9 });
    setRenderCameraZoom(a, 1); setRenderCameraCenter(a, { plane, point: config.center });
    log('CSS vs device buffer', { EXPECTED: 'same420,225 CSS at DPR1/2; candidate800x450/1600x900',
      OBSERVED: { dpr1: planRenderViewportSize({ logicalWidthCssPx: 800, logicalHeightCssPx: 450, requestedPixelRatio: 1 }, limits),
        dpr2: planRenderViewportSize({ logicalWidthCssPx: 800, logicalHeightCssPx: 450, requestedPixelRatio: 2 }, limits),
        projection: projectRenderCameraPoint(a, logical, { plane, point: { x: 110, y: 50 } }, null).viewportPoint },
      NOT_OBSERVED: 'Native accepted buffers/pixels; plans are validated-not-applied' });
    log('resize640x450 preserve scale', { EXPECTED: { x: 340, y: 225 }, OBSERVED:
      projectRenderCameraPoint(a, { ...logical, width: 640 }, { plane, point: { x: 110, y: 50 } }, null).viewportPoint });
    rejected('zero width', () => projectRenderCameraPoint(a, { ...logical, width: 0 }, { plane, point: config.center }, null));
    rejected('NaN height', () => projectRenderCameraPoint(a, { ...logical, height: NaN }, { plane, point: config.center }, null));
    rejected('zero zoom', () => setRenderCameraZoom(a, 0)); rejected('NaN zoom', () => setRenderCameraZoom(a, NaN));
    rejected('unknown plane', () => projectRenderCameraPoint(a, logical,
      { plane: { ...plane, coordinateSpaceId: 'unknown' }, point: config.center }, null));
    const bounds = { kind: 'rectangle', plane, min: { x: 0, y: 0 }, max: { x: 320, y: 240 }, movement: 'reject', oversized: 'reject' } as const;
    const transition = () => ({ cameraView: getRenderCameraViewSnapshot(a), zoom: getRenderCameraViewSnapshot(a).configuration.zoom,
      movement: { kind: 'center' as const, target: { plane, point: { x: 1000, y: 1000 } } }, bounds });
    log('oversized bounds', { EXPECTED: 'rejected VIEW_EXCEEDS_BOUNDS', OBSERVED: transitionRenderCameraWithinBounds(a, logical, transition(), null) });
    setRenderCameraZoom(a, 2);
    log('outside bounds', { EXPECTED: 'rejected CENTER_OUTSIDE_BOUNDS', OBSERVED: transitionRenderCameraWithinBounds(a, logical, transition(), null) });
    log('clamped bounds', { EXPECTED: { x: 220, y: 183.75 }, OBSERVED: transitionRenderCameraWithinBounds(a, logical,
      { ...transition(), bounds: { ...bounds, movement: 'clamp' } }, null) });
    const presentationPlane = { ...plane, coordinateSpaceId: 'oblique-presentation' };
    const ground = createRenderCameraGroundConfiguration({ kind: 'affine-ground-elevation', groundPlane: plane, presentationPlane,
      groundOrigin: { x: 0, y: 0 }, presentationOrigin: { x: 0, y: 0 },
      basis: { x: { x: 1, y: 0.5 }, y: { x: -1, y: 0.5 } }, elevation: { unit: 'height-unit', displacement: { x: 0, y: -2 } } });
    const elevatedCamera = createConfiguredRenderCamera({ ...config, source: presentationPlane, center: { x: 0, y: 0 },
      scale: { unit: 'css-px-per-source-unit', x: 1, y: 1 } }, { min: 0.1, max: 10 });
    try {
      const point = { ground: { plane, point: { x: 4, y: 2 } }, elevation: { unit: 'height-unit', value: 3 } };
      const p = projectRenderCameraGroundPoint(elevatedCamera, logical, ground, point, null);
      const input = { cameraView: p.camera, point: p.viewportPoint, elevation: point.elevation };
      const inverse = viewportToRenderCameraGround(elevatedCamera, logical, ground, input, null);
      log('fixed h3 inverse (numeric only)', { EXPECTED: { presentation: { x: 2, y: -3 }, viewport: { x: 402, y: 222 }, ground: { x: 4, y: 2 } },
        OBSERVED: { presentation: p.presentationPoint, viewport: p.viewportPoint, inverse,
          residual: { x: inverse.ground.ground.point.x - 4, y: inverse.ground.ground.point.y - 2 } }, tolerance: 1e-9 });
      rejected('unknown height', () => viewportToRenderCameraGround(elevatedCamera, logical, ground,
        { cameraView: p.camera, point: p.viewportPoint } as RenderCameraGroundInverseInput, null), elevatedCamera);
    } finally { elevatedCamera.dispose(); }
    a.dispose();
    const recreated = createConfiguredRenderCamera(config, { min: 0.1, max: 10 });
    try { log('camera recreation/isolation/truth CPU', { OBSERVED: {
      freshId: recreated.getSnapshot().id !== a.getSnapshot().id, bExactViewUnchanged: bBefore === getRenderCameraViewSnapshot(b),
      bCenter: projectRenderCameraPoint(b, logical, { plane, point: config.center }, null).viewportPoint,
      authoredDocumentUnchanged: truth === JSON.stringify({ authored, document: document.getSnapshot() }) } }); }
    finally { recreated.dispose(); }
    log('NOT_OBSERVED', ['native pixels', 'live instance transforms/order', 'native texture sharing', 'released GPU lease rejection',
      'DPR accepted buffers', 'native recreation/cleanup', 'live gameplay positions (not supplied)']);
  } finally { a.dispose(); b.dispose(); }
}
