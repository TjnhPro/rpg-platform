import { createConfiguredRenderCamera, createRenderCameraGroundConfiguration,
  projectRenderCameraGroundPoint, viewportToRenderCameraGround, screenToRenderCameraGround,
  getRenderCameraViewSnapshot, setRenderCameraCenter, setRenderCameraZoom,
  type RenderCameraGroundInverseInput, type RenderCameraGroundConfiguration,
  type RenderFrameSession, type RenderViewportResizeReceipt, type ViewportMetrics2D,
} from '@rpg-platform/runtime-render';

/** Finite public-root observations only; no assertions, suite, graphics substitute. */
export function observeCameraGround(log: (label: string, value: unknown) => void,
  readOwnedState: () => unknown = () => 'No live authored/gameplay consumer supplied'): void {
  const groundPlane = { projectId: 'camera-manual', coordinateSpaceId: 'ground', unit: 'ground-unit',
    axes: { x: 'right', y: 'down' } } as const;
  const presentationPlane = { ...groundPlane, coordinateSpaceId: 'oblique-presentation', unit: 'css-px' };
  const configuration = createRenderCameraGroundConfiguration({ kind: 'affine-ground-elevation',
    groundPlane, presentationPlane, groundOrigin: { x: 0, y: 0 }, presentationOrigin: { x: 0, y: 0 },
    basis: { x: { x: 1, y: 0.5 }, y: { x: -1, y: 0.5 } },
    elevation: { unit: 'height-unit', displacement: { x: 0, y: -2 } } });
  const cameraConfig = { kind: 'orthographic', source: presentationPlane, center: { x: 0, y: 0 },
    scale: { unit: 'css-px-per-source-unit', x: 1, y: 1 }, zoom: 1, viewportPolicy: 'preserve-scale' } as const;
  const a = createConfiguredRenderCamera(cameraConfig, { min: 0.25, max: 8 });
  const b = createConfiguredRenderCamera(cameraConfig, { min: 0.25, max: 8 });
  const logical: ViewportMetrics2D = { plane: { ...presentationPlane, coordinateSpaceId: 'viewport' },
    width: 800, height: 450, screen: null };
  const source = Object.freeze({ ground: Object.freeze({ plane: groundPlane, point: Object.freeze({ x: 4, y: 2 }) }),
    elevation: Object.freeze({ unit: 'height-unit', value: 3 }) });
  const attempt = (label: string, action: () => unknown): void => {
    const before = getRenderCameraViewSnapshot(a);
    try { log(label, { returned: action() }); }
    catch (error) { log(label, { thrown: error instanceof Error ? error.name : typeof error,
      message: error instanceof Error ? error.message : null, cameraUnchanged: getRenderCameraViewSnapshot(a) === before }); }
  };
  try {
    log('Owner before', readOwnedState());
    const p = projectRenderCameraGroundPoint(a, logical, configuration, source, null);
    const input = { cameraView: p.camera, point: p.viewportPoint, elevation: source.elevation };
    log('Worked height3 expected presentation2,-3 viewport402,222', { presentation: p.presentationPoint,
      viewport: p.viewportPoint, acceptedViewport: p.acceptedViewport });
    log('Ground zero expected2,3', projectRenderCameraGroundPoint(a, logical, configuration,
      { ...source, elevation: { ...source.elevation, value: 0 } }, null).presentationPoint);
    log('Explicit ground zero inverse expected4,2', viewportToRenderCameraGround(a, logical, configuration,
      { cameraView: p.camera, point: { plane: logical.plane, point: { x: 402, y: 228 } },
        elevation: { unit: 'height-unit', value: 0 } }, null).ground);
    const inverse = viewportToRenderCameraGround(a, logical, configuration, input, null);
    log('Known height inverse expected4,2 tolerance1e-12', { observed: inverse.ground,
      absoluteError: { x: Math.abs(inverse.ground.ground.point.x - 4), y: Math.abs(inverse.ground.ground.point.y - 2) },
      frozen: [inverse, inverse.ground, inverse.ground.ground, inverse.ground.elevation].map(Object.isFrozen) });
    attempt('Unknown height underdetermined', () => viewportToRenderCameraGround(a, logical, configuration,
      { cameraView: p.camera, point: p.viewportPoint } as RenderCameraGroundInverseInput, null));
    attempt('Wrong elevation unit', () => viewportToRenderCameraGround(a, logical, configuration,
      { ...input, elevation: { unit: 'meters', value: 3 } }, null));
    attempt('Singular collinear basis', () => createRenderCameraGroundConfiguration({ ...configuration,
      basis: { x: { x: 1, y: 0.5 }, y: { x: 2, y: 1 } } }));
    attempt('Ill-conditioned basis', () => createRenderCameraGroundConfiguration({ ...configuration,
      basis: { x: { x: 1, y: 0 }, y: { x: 0, y: 1e-13 } } }));
    attempt('Nonfinite basis', () => createRenderCameraGroundConfiguration({ ...configuration,
      basis: { ...configuration.basis, x: { x: Infinity, y: 0.5 } } }));
    attempt('Finite elevation overflow', () => projectRenderCameraGroundPoint(a, logical, configuration,
      { ...source, elevation: { ...source.elevation, value: Number.MAX_VALUE } }, null));
    attempt('Unknown ground plane', () => projectRenderCameraGroundPoint(a, logical, configuration,
      { ...source, ground: { ...source.ground, plane: { ...groundPlane, coordinateSpaceId: 'unknown' } } }, null));
    attempt('Unknown presentation plane', () => projectRenderCameraGroundPoint(a, logical,
      { ...configuration, presentationPlane: { ...presentationPlane, coordinateSpaceId: 'unknown' } }, source, null));
    attempt('Unknown inverse pixel plane', () => viewportToRenderCameraGround(a, logical, configuration,
      { ...input, point: { ...p.viewportPoint, plane: { ...logical.plane, coordinateSpaceId: 'unknown' } } }, null));
    attempt('Wrong ground axes', () => projectRenderCameraGroundPoint(a, logical, configuration,
      { ...source, ground: { ...source.ground, plane: { ...groundPlane, axes: { x: 'right', y: 'up' } } } }, null));
    attempt('Cross-project config', () => createRenderCameraGroundConfiguration({ ...configuration,
      groundPlane: { ...groundPlane, projectId: 'other' } }));
    attempt('Nonfinite height', () => projectRenderCameraGroundPoint(a, logical, configuration,
      { ...source, elevation: { ...source.elevation, value: Infinity } }, null));
    attempt('Unsupported kind', () => createRenderCameraGroundConfiguration({ ...configuration,
      kind: 'perspective' } as unknown as RenderCameraGroundConfiguration));
    attempt('Missing screen mapping', () => screenToRenderCameraGround(a, logical, configuration, input, null));
    const screen = { ...logical, screen: { plane: { ...logical.plane, coordinateSpaceId: 'client' },
      origin: { x: 20, y: 30 }, screenUnitsPerViewportUnit: { x: 2, y: 2 } } };
    const sp = projectRenderCameraGroundPoint(a, screen, configuration, source, null);
    if (sp.screenPoint !== null) log('Explicit screen expected824,474 inverse4,2', {
      screen: sp.screenPoint, inverse: screenToRenderCameraGround(a, screen, configuration,
        { ...input, point: sp.screenPoint }, null).ground });
    const shifted = { ...configuration, groundOrigin: { x: 1, y: 1 }, presentationOrigin: { x: 10, y: 20 } };
    const shiftedP = projectRenderCameraGroundPoint(a, logical, shifted, source, null);
    log('Relative origins expected12,16 inverse4,2', { presentation: shiftedP.presentationPoint,
      inverse: viewportToRenderCameraGround(a, logical, shifted, { ...input, point: shiftedP.viewportPoint }, null).ground });
    const diagonal = { ...configuration, elevation: { unit: 'height-unit', displacement: { x: 1, y: -2 } } };
    const diagonalP = projectRenderCameraGroundPoint(a, logical, diagonal, source, null);
    log('Two-component displacement expected5,-3 inverse4,2', { presentation: diagonalP.presentationPoint,
      inverse: viewportToRenderCameraGround(a, logical, diagonal, { ...input, point: diagonalP.viewportPoint }, null).ground });
    for (const width of [0, -1, Infinity]) attempt(`Invalid width ${width}`, () =>
      projectRenderCameraGroundPoint(a, { ...logical, width }, configuration, source, null));
    attempt('Invalid zoom', () => setRenderCameraZoom(a, 0));
    attempt('Foreign accepted context', () => projectRenderCameraGroundPoint(a, logical, configuration, source,
      { session: {} as RenderFrameSession, receipt: undefined as unknown as RenderViewportResizeReceipt }));
    const bBefore = getRenderCameraViewSnapshot(b);
    setRenderCameraCenter(a, { plane: presentationPlane, point: { x: 1, y: 1 } });
    setRenderCameraZoom(a, 2);
    attempt('Stale inverse view', () => viewportToRenderCameraGround(a, logical, configuration, input, null));
    const moved = projectRenderCameraGroundPoint(a, logical, configuration, source, null);
    log('Pan zoom expected viewport402,217 source4,2 h3', { viewport: moved.viewportPoint, source,
      inverse: viewportToRenderCameraGround(a, logical, configuration,
        { ...input, cameraView: moved.camera, point: moved.viewportPoint }, null).ground });
    a.dispose();
    log('B independent after A pan zoom dispose', { sameView: bBefore === getRenderCameraViewSnapshot(b),
      viewport: projectRenderCameraGroundPoint(b, logical, configuration, source, null).viewportPoint });
    attempt('Disposed camera', () => projectRenderCameraGroundPoint(a, logical, configuration, source, null));
    log('Owner after', readOwnedState());
  } finally { a.dispose(); b.dispose(); }
}
