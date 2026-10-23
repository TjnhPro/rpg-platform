import { createRenderCamera, type RenderCameraInput, type RenderCameraUpdate } from '@rpg-platform/runtime-render';

/** Explicit manual observation only: logs values, no assertions or pass/fail runner. */
export function observeCameraLifecycle(log: (label: string, value: unknown) => void): void {
  const input: RenderCameraInput = { kind: 'orthographic', source: {
    projectId: 'camera-manual', coordinateSpaceId: 'ground', unit: 'tile',
    axes: { x: 'right', y: 'up' },
  }, center: { x: 2, y: 3 } };
  const a = createRenderCamera(input), b = createRenderCamera(input);
  const a0 = a.getSnapshot(), b0 = b.getSnapshot();
  log('Initial independent state', { a: a0, b: b0, differentIds: a0.id !== b0.id });
  // Mutate only caller-owned records, never readonly snapshots.
  Object.assign(input.center, { x: 999 });
  Object.assign(input.source.axes, { y: 'down' });
  log('Detached/frozen capture', { aCenter: a0.center, aAxes: a0.source.axes,
    frozen: [a, a0, a0.center, a0.source, a0.source.axes].map(Object.isFrozen) });
  const a1 = a.update({ center: { x: 7, y: 8 } });
  log('A update leaves B and old A observation unchanged', { a: a1, oldA: a0,
    b: b.getSnapshot(), bSameSnapshot: b.getSnapshot() === b0, sameAId: a1.id === a0.id });
  log('Equal center no-op', { sameSnapshot: a.update({ center: { x: 7, y: 8 } }) === a1,
    revision: a.getSnapshot().revision });
  const rejection = (label: string, action: () => unknown): void => {
    try { log(label, { returned: action() }); }
    catch (error) { log(label, { thrown: error instanceof Error ? error.name : typeof error,
      message: error instanceof Error ? error.message : null }); }
  };
  rejection('Reject caller identity', () => createRenderCamera({ ...input, id: 'authored-id' } as RenderCameraInput));
  rejection('Reject empty context identity', () => createRenderCamera({ ...input, source: { ...input.source, projectId: '' } }));
  rejection('Reject invalid axes', () => createRenderCamera({ ...input,
    source: { ...input.source, axes: { x: 'unknown', y: 'up' } } } as unknown as RenderCameraInput));
  rejection('Reject unsupported kind', () => createRenderCamera({ ...input, kind: 'perspective' } as unknown as RenderCameraInput));
  rejection('Reject NaN update', () => a.update({ center: { x: NaN, y: 1 } }));
  rejection('Reject extra center field', () => a.update({ center: { x: 0, y: 0, z: 1 } } as RenderCameraUpdate));
  rejection('Reject context replacement', () => a.update({ center: { x: 0, y: 0 }, source: input.source } as RenderCameraUpdate));
  rejection('Reject premature zoom config', () => a.update({ center: { x: 0, y: 0 }, zoom: 0 } as RenderCameraUpdate));
  const sentinel = new Error('manual host failure');
  const throwingCenter = new Proxy({ x: 0, y: 0 }, { get: () => { throw sentinel; } });
  try { a.update({ center: throwingCenter }); }
  catch (error) { log('Unknown host exception preserved', { sameException: error === sentinel }); }
  log('Rejected requests preserve A', { sameSnapshot: a.getSnapshot() === a1 });
  const ended = a.dispose();
  rejection('Disposed update rejects', () => a.update({ center: { x: 0, y: 0 } }));
  log('Idempotent disposal, historical active observation', { terminal: ended,
    sameTerminal: a.dispose() === ended, oldState: a0.state, oldRevision: a0.revision });
  log('B remains active and independently updateable', b.update({ center: { x: -1, y: 4 } }));
  const c = createRenderCamera(input);
  const disposeDuringCapture = new Proxy({ x: 1, y: 1 }, {
    get: (target, key, receiver) => { c.dispose(); return Reflect.get(target, key, receiver); },
  });
  rejection('Disposal during host capture cannot resurrect C', () => c.update({ center: disposeDuringCapture }));
  log('C stays terminal', c.getSnapshot());
  b.dispose();
}
