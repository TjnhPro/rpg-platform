import { createOrthographicCameraConfiguration, createOrthographicPlaneProjection,
  projectPlanePoint2D, createViewportMapping2D, projectPointToViewport2D,
  type OrthographicCameraConfigurationInput, type ProjectionPlane2D } from '@rpg-platform/runtime-render';

/** Manual values only; no assertions, automated runner, fake session or GPU. */
export function observeCameraConfiguration(log: (label: string, value: unknown) => void): void {
  const input: OrthographicCameraConfigurationInput = { kind: 'orthographic',
    source: { projectId: 'camera-manual', coordinateSpaceId: 'ground', unit: 'world-unit', axes: { x: 'right', y: 'down' } },
    center: { x: 100, y: 50 }, scale: { unit: 'css-px-per-source-unit', x: 2, y: 2 },
    zoom: 1, viewportPolicy: 'preserve-scale' };
  const config = createOrthographicCameraConfiguration(input);
  log('Captured configuration', config);
  Object.assign(input.center, { x: 999 });
  Object.assign(input.scale, { x: 999 });
  Object.assign(input.source.axes, { y: 'up' });
  log('Detached and frozen', { center: config.center, scale: config.scale, axes: config.source.axes,
    frozen: [config, config.center, config.scale, config.source, config.source.axes,
      config.effectiveCssPixelsPerSourceUnit].map(Object.isFrozen) });
  const viewport: ProjectionPlane2D = { projectId: 'camera-manual', coordinateSpaceId: 'viewport',
    unit: 'css-px', axes: { x: 'right', y: 'down' } };
  // Explicit example correspondence, not a second automatic camera/viewport binder.
  const projection = createOrthographicPlaneProjection({ kind: 'orthographic-plane',
    source: config.source, destination: viewport, sourceOrigin: config.center,
    destinationOrigin: { x: 400, y: 225 }, destinationUnitsPerSourceUnit: config.effectiveCssPixelsPerSourceUnit });
  const mapping = createViewportMapping2D({ projection, metrics: {
    plane: viewport, width: 800, height: 450, screen: null } });
  log('Phase4 ratios and center correspondence', { ratios: projection.destinationUnitsPerSourceUnit,
    center: projectPointToViewport2D(mapping, { plane: config.source, point: config.center }),
    oneSourceUnitOffset: projectPlanePoint2D(projection, { plane: config.source, point: { x: 101, y: 51 } }) });
  const larger = createOrthographicCameraConfiguration({ ...configInput(config), zoom: 2 });
  log('Zoom2 doubles declared ratios, original unchanged', { zoom2: larger.effectiveCssPixelsPerSourceUnit,
    original: config.effectiveCssPixelsPerSourceUnit, center: larger.center });
  const unequal = createOrthographicCameraConfiguration({ ...configInput(config),
    scale: { unit: 'css-px-per-source-unit', x: 2, y: 3 } });
  log('Explicit anisotropy remains caller policy', unequal.effectiveCssPixelsPerSourceUnit);
  const observeRejection = (label: string, action: () => unknown): void => {
    try { log(label, { returned: action() }); }
    catch (error) { log(label, { thrown: error instanceof Error ? error.name : typeof error,
      message: error instanceof Error ? error.message : null }); }
  };
  for (const value of [0, -1, NaN, Infinity]) {
    observeRejection(`Reject zoom ${String(value)}`, () => createOrthographicCameraConfiguration({ ...configInput(config), zoom: value }));
    observeRejection(`Reject scale ${String(value)}`, () => createOrthographicCameraConfiguration({ ...configInput(config),
      scale: { unit: 'css-px-per-source-unit', x: value, y: 2 } }));
  }
  observeRejection('Reject physical scale unit', () => createOrthographicCameraConfiguration({ ...configInput(config),
    scale: { unit: 'device-px-per-source-unit', x: 2, y: 2 } } as unknown as OrthographicCameraConfigurationInput));
  observeRejection('Reject bad plane axis', () => createOrthographicCameraConfiguration({ ...configInput(config),
    source: { ...config.source, axes: { x: 'right', y: 'forward' } } } as unknown as OrthographicCameraConfigurationInput));
  observeRejection('Reject empty plane key', () => createOrthographicCameraConfiguration({ ...configInput(config),
    source: { ...config.source, coordinateSpaceId: '' } }));
  observeRejection('Reject blank source unit', () => createOrthographicCameraConfiguration({ ...configInput(config),
    source: { ...config.source, unit: ' ' } }));
  observeRejection('Reject nonfinite center', () => createOrthographicCameraConfiguration({ ...configInput(config), center: { x: Infinity, y: 50 } }));
  observeRejection('Reject perspective', () => createOrthographicCameraConfiguration({ ...configInput(config),
    kind: 'perspective' } as unknown as OrthographicCameraConfigurationInput));
  observeRejection('Reject implicit vertical fit', () => createOrthographicCameraConfiguration({ ...configInput(config),
    viewportPolicy: 'fit-vertical' } as unknown as OrthographicCameraConfigurationInput));
  observeRejection('Reject extra viewport dimensions', () => createOrthographicCameraConfiguration({ ...configInput(config),
    width: 800, height: 450 } as OrthographicCameraConfigurationInput));
  observeRejection('Reject effective overflow', () => createOrthographicCameraConfiguration({ ...configInput(config), zoom: Number.MAX_VALUE }));
  observeRejection('Reject effective zero underflow', () => createOrthographicCameraConfiguration({ ...configInput(config),
    scale: { unit: 'css-px-per-source-unit', x: Number.MIN_VALUE, y: 2 }, zoom: Number.MIN_VALUE }));
  observeRejection('Phase4 rejects mismatched point unit', () => projectPlanePoint2D(projection, {
    plane: { ...config.source, unit: 'metre' }, point: config.center }));
  observeRejection('Phase4 rejects zero logical width', () => createViewportMapping2D({ projection,
    metrics: { plane: viewport, width: 0, height: 450, screen: null } }));
  const sentinel = new Error('manual host error');
  const source = new Proxy(config.source, { get: () => { throw sentinel; } });
  try { createOrthographicCameraConfiguration({ ...configInput(config), source }); }
  catch (error) { log('Unknown host exception preserved', { sameException: error === sentinel }); }
  log('Previous configuration after rejected candidates', config);
}

// Deliberately select input fields; factory rejects output-only effective ratios.
function configInput(config: OrthographicCameraConfigurationInput): OrthographicCameraConfigurationInput {
  const { kind, source, center, scale, zoom, viewportPolicy } = config;
  return { kind, source, center, scale, zoom, viewportPolicy };
}
