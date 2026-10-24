import { createRenderCamera, setRenderCameraCenter, panRenderCamera,
  type ProjectionPlane2D, type RenderCameraPan } from '@rpg-platform/runtime-render';

/** Finite manual CPU observations through the public root; no assertions or runner.
 * Optional owner readback is supplied by a real host, never fabricated by Render. */
export function observeCameraPan(log: (label: string, value: unknown) => void,
  readOwnedState: () => unknown = () => 'No authored/live consumer supplied'): void {
  const plane: ProjectionPlane2D = { projectId: 'camera-manual', coordinateSpaceId: 'ground',
    unit: 'world-unit', axes: { x: 'right', y: 'down' } };
  const a = createRenderCamera({ kind: 'orthographic', source: plane, center: { x: 100, y: 50 } });
  const b = createRenderCamera({ kind: 'orthographic', source: plane, center: { x: 8, y: 9 } });
  const history = a.getSnapshot(), bHistory = b.getSnapshot();
  log('Owner before', readOwnedState());
  const forward = panRenderCamera(a, { plane, delta: { x: 5, y: 0 } });
  log('Forward', forward);
  const reverse = panRenderCamera(a, { plane, delta: { x: -5, y: 0 } });
  log('Reverse and historical state', { reverse, history, sameIdentity: reverse.id === history.id,
    frozen: [forward, forward.center, forward.source, forward.source.axes].map(Object.isFrozen),
    absoluteError: { x: Math.abs(reverse.center.x - history.center.x), y: Math.abs(reverse.center.y - history.center.y) },
    exampleTolerance: 1e-12 });
  log('Absolute set', setRenderCameraCenter(a, { plane, point: { x: 20, y: 30 } }));
  const unchanged = a.getSnapshot();
  log('No-op references', {
    set: setRenderCameraCenter(a, { plane, point: { x: 20, y: 30 } }) === unchanged,
    pan: panRenderCamera(a, { plane, delta: { x: 0, y: 0 } }) === unchanged });
  const attempt = (label: string, action: () => unknown): void => {
    const before = a.getSnapshot();
    try { log(label, { returned: action() }); }
    catch (error) { log(label, { thrown: error instanceof Error ? error.name : typeof error,
      message: error instanceof Error ? error.message : null, statePreserved: before === a.getSnapshot() }); }
  };
  attempt('Wrong plane', () => panRenderCamera(a, { plane: { ...plane, coordinateSpaceId: 'unknown' }, delta: { x: 5, y: 0 } }));
  attempt('Wrong project', () => panRenderCamera(a, { plane: { ...plane, projectId: 'other' }, delta: { x: 5, y: 0 } }));
  attempt('Wrong unit', () => setRenderCameraCenter(a, { plane: { ...plane, unit: 'css-px' }, point: { x: 0, y: 0 } }));
  attempt('Wrong axes', () => panRenderCamera(a, { plane: { ...plane, axes: { x: 'left', y: 'down' } }, delta: { x: 5, y: 0 } }));
  attempt('Infinite delta', () => panRenderCamera(a, { plane, delta: { x: Infinity, y: 0 } }));
  attempt('Infinite center', () => setRenderCameraCenter(a, { plane, point: { x: 0, y: Infinity } }));
  attempt('Absorbed component', () => panRenderCamera(a, { plane, delta: { x: Number.MIN_VALUE, y: 1 } }));
  attempt('Unexpected zoom/dimensions', () => panRenderCamera(a, { plane, delta: { x: 5, y: 0 }, zoom: 0, width: 0 } as RenderCameraPan));
  const huge = createRenderCamera({ kind: 'orthographic', source: plane, center: { x: Number.MAX_VALUE, y: 0 } });
  const hugeBefore = huge.getSnapshot();
  try { panRenderCamera(huge, { plane, delta: { x: Number.MAX_VALUE, y: 0 } }); }
  catch (error) { log('Overflow', { thrown: error instanceof Error ? error.name : typeof error,
    statePreserved: hugeBefore === huge.getSnapshot() }); }
  huge.dispose();
  log('Owner after', readOwnedState());
  log('Independent B', { sameSnapshot: bHistory === b.getSnapshot(), snapshot: b.getSnapshot() });
  a.dispose();
  attempt('Pan after disposal', () => panRenderCamera(a, { plane, delta: { x: 1, y: 0 } }));
  attempt('Set after disposal', () => setRenderCameraCenter(a, { plane, point: { x: 0, y: 0 } }));
  b.dispose();
}
