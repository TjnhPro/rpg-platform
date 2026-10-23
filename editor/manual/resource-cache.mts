// Finite public-root manual observation, no assertions or automated browser runner.
import { createRenderFrameSession, createVisualResourceCache, getRenderTextureSnapshot,
  getRenderTextureFailure, type VisualSourceProvider, type VisualSourceResponse,
  type RenderFrameSession, type VisualResourceLease } from '@rpg-platform/runtime-render';

export async function inspectResourceCache(canvases: readonly HTMLCanvasElement[],
  readSource: () => Promise<{ bytes: Uint8Array<ArrayBuffer>; revision: string }>,
  revision: string, log: (label: string, value: unknown) => void): Promise<void> {
  const descriptor = { identity: { projectId: 'cache-manual', resourceId: 'rgba-2x2' }, mediaType: null,
    sources: [{ role: 'image', locator: { type: 'project-relative' as const, path: 'rgba-2x2.png' } }] };
  const limits = { maxBytes: 4096, maxDimension: 4, maxPixels: 16 };
  const options = { sampling: 'nearest' as const, colorSpace: 'srgb' as const };
  const authority = { projectId: 'cache-manual', providerId: Symbol(), authorizationGeneration: 'fixed-sample-1' };
  let providerReads = 0, nativeDecodeCalls = 0;
  let held: (() => Promise<VisualSourceResponse>) | undefined;
  const provider: VisualSourceProvider = { scope: authority, async read(request) {
    if (request.scope.providerId !== authority.providerId || request.scope.authorizationGeneration !== authority.authorizationGeneration
      || request.identity.projectId !== authority.projectId || request.identity.resourceId !== 'rgba-2x2'
      || request.sourceIndex !== 0 || request.source.role !== 'image' || request.source.locator.path !== 'rgba-2x2.png') {
      return { status: 'failed', code: 'SOURCE_DENIED' };
    }
    providerReads++;
    if (held !== undefined) return held();
    return provide();
  } };
  const provide = async (): Promise<VisualSourceResponse> => {
    const sample = await readSource();
    return { status: 'provided', ...sample, contentLength: sample.bytes.length, mediaType: null };
  };
  const cache = createVisualResourceCache(provider, { maxCpuEntries: 4, maxGpuEntries: 8 });
  const sessions: RenderFrameSession[] = [], leases: VisualResourceLease[] = [];
  const native = globalThis.createImageBitmap;
  if (typeof native === 'function') globalThis.createImageBitmap = ((...args: Parameters<typeof createImageBitmap>) => {
    nativeDecodeCalls++; return Reflect.apply(native, globalThis, args);
  }) as typeof createImageBitmap;
  const counts = () => ({ providerReads, nativeDecodeCalls: typeof native === 'function' ? nativeDecodeCalls : 'UNAVAILABLE',
    cache: cache.getSnapshot() });
  const acquire = (session: RenderFrameSession, selected = options): VisualResourceLease => {
    const lease = cache.acquire(session, descriptor, 0, revision, limits, selected);
    leases.push(lease); return lease;
  };
  try {
    for (const canvas of canvases) sessions.push(await createRenderFrameSession({ target: canvas }));
    const [a, b, c] = sessions;
    if (a === undefined || b === undefined || c === undefined) throw new Error('Three explicit canvases required');
    const hundred = Array.from({ length: 100 }, () => acquire(a));
    const completed = await Promise.all(hundred.map(lease => lease.result));
    log('100 logical references', { states: completed.map(item => item.state),
      resourceIdentities: new Set(completed.flatMap(item => item.state === 'usable' ? [item.resourceId] : [])).size,
      leaseIdentities: new Set(completed.map(item => item.id)).size, ...counts() });
    const other = acquire(b), otherState = await other.result;
    log('session B after A decoded (shared CPU, separate GPU)', { outcome: otherState, ...counts() });
    log('release first twice', [hundred[0]!.release(), hundred[0]!.release()]);
    log('second after first release', hundred[1]!.getSnapshot());
    for (const lease of hundred.slice(1)) lease.release();
    log('zero A leases; B remains', counts());
    const repeated = acquire(a); await repeated.result;
    log('new A GPU from B-retained CPU', counts());
    log('dispose A with live lease', a.dispose());
    log('A invalidated; B survives', { a: repeated.getSnapshot(), b: other.getSnapshot(), ...counts() });
    if (otherState.state === 'usable') {
      log('B canonical texture observation', getRenderTextureSnapshot(b, otherState.texture));
    }
    try { acquire(a); } catch (error) { log('disposed A acquire rejected before IO', getRenderTextureFailure(error) ?? error); }
    other.release();
    log('zero all leases / terminal B texture', { texture: otherState.state === 'usable' ? otherState.texture.getSnapshot() : null, ...counts() });

    let open!: () => void, entered!: () => void, completedRead!: () => void;
    const gate = new Promise<void>(yes => { open = yes; });
    const started = new Promise<void>(yes => { entered = yes; });
    const readFinished = new Promise<void>(yes => { completedRead = yes; });
    held = async () => { entered(); await gate; try { return await provide(); } finally { completedRead(); } };
    const pending = acquire(c);
    await started;
    c.dispose();
    log('session C disposed during source read', await pending.result);
    open(); await readFinished;
    log('late host bytes after C disposal / no new upload', counts());
  } finally {
    for (const lease of leases) try { lease.release(); } catch (error) { log('lease cleanup error', error); }
    try { cache.dispose(); } catch (error) { log('cache cleanup error', error); }
    for (const session of sessions) try { session.dispose(); } catch (error) { log('session cleanup error', error); }
    if (typeof native === 'function') globalThis.createImageBitmap = native;
    log('final cache observation (not GPU memory measurement)', cache.getSnapshot());
  }
}
