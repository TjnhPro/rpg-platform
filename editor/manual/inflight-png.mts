// Finite human-inspected public-root consumer; no assertions, runner or expected comparisons.
import { createPngLoadScope, type VisualSourceProvider, type VisualSourceResponse,
  type SharedPngLoad, type PngLoadScope } from '@rpg-platform/runtime-render';

export async function inspectInFlightPng(
  readSource: () => Promise<{ bytes: Uint8Array<ArrayBuffer>; revision: string }>,
  revision: string, log: (label: string, value: unknown) => void,
): Promise<void> {
  const descriptor = { identity: { projectId: 'inflight-manual', resourceId: 'rgba-2x2' }, mediaType: null,
    sources: [{ role: 'image', locator: { type: 'project-relative' as const, path: 'rgba-2x2.png' } }] };
  const limits = { maxBytes: 4096, maxDimension: 4, maxPixels: 16 };
  const handles: SharedPngLoad[] = [], scopes: PngLoadScope[] = [];
  const gate = () => {
    let open!: () => void, entered!: () => void;
    const wait = new Promise<void>(yes => { open = yes; });
    const started = new Promise<void>(yes => { entered = yes; });
    return { open, entered, wait, started };
  };
  const host = () => {
    const scope = { projectId: descriptor.identity.projectId, providerId: Symbol(), authorizationGeneration: 'fixed-read-only-1' };
    let reads = 0;
    const actions: (() => Promise<VisualSourceResponse>)[] = [];
    const provider: VisualSourceProvider = { scope, async read(request) {
      if (request.scope.providerId !== scope.providerId || request.scope.authorizationGeneration !== scope.authorizationGeneration
        || request.identity.projectId !== scope.projectId || request.identity.resourceId !== descriptor.identity.resourceId
        || request.sourceIndex !== 0 || request.source.role !== 'image' || request.source.locator.path !== 'rgba-2x2.png') {
        return { status: 'failed', code: 'SOURCE_DENIED' };
      }
      reads++;
      const action = actions.shift();
      if (action !== undefined) return action();
      return provide();
    } };
    const provide = async (): Promise<VisualSourceResponse> => {
      const source = await readSource();
      return { status: 'provided', ...source, contentLength: source.bytes.length, mediaType: null };
    };
    const sharing = createPngLoadScope(provider); scopes.push(sharing);
    return { sharing, actions, provide, reads: () => reads };
  };
  const acquire = (scope: PngLoadScope, expected = revision, options = limits): SharedPngLoad => {
    const handle = scope.acquire(descriptor, 0, expected, options); handles.push(handle); return handle;
  };
  // Instrument only a real native decoder, delegating unchanged. Never install a fake decoder on Node.
  const nativeDecode = globalThis.createImageBitmap;
  let decodeCalls = 0;
  if (typeof nativeDecode === 'function') {
    globalThis.createImageBitmap = ((...args: Parameters<typeof createImageBitmap>) => {
      decodeCalls++; return Reflect.apply(nativeDecode, globalThis, args);
    }) as typeof createImageBitmap;
  }
  const counts = (hostReads: number) => ({ providerReads: hostReads,
    nativeDecodeCalls: typeof nativeDecode === 'function' ? decodeCalls : 'DECODER_UNAVAILABLE' });
  try {
    const a = host(), hold = gate();
    a.actions.push(async () => { hold.entered(); await hold.wait; return a.provide(); });
    const first = acquire(a.sharing), second = acquire(a.sharing), third = acquire(a.sharing);
    await hold.started;
    log('three matching requests pending', counts(a.reads()));
    log('release only first', first.release());
    hold.open();
    log('independent outcomes', await Promise.all([first.result, second.result, third.result]));
    log('three matching completed operation counts', counts(a.reads()));
    const retained = second.getSnapshot();
    if (retained.state === 'decoded') {
      log('release second image only', retained.image.release());
      const survivor = third.getSnapshot();
      log('third after second release', survivor.state === 'decoded' ? survivor.image.getSnapshot() : survivor);
    }
    const historical = third.getSnapshot();
    third.release();
    if (historical.state === 'decoded') log('last image release / shared cleanup', historical.image.getSnapshot());

    const beforeRetry = a.reads();
    const repeat = acquire(a.sharing);
    log('same key after settlement (no settled cache)', await repeat.result);
    log('provider reads before/after settled repeat', { beforeRetry, after: a.reads() });
    repeat.release();

    const b = host(), c = host();
    const same = acquire(b.sharing);
    const changedOptions = acquire(b.sharing, revision, { ...limits, maxPixels: 8 });
    const changedRevision = acquire(b.sharing, 'explicit-other-revision');
    const otherProvider = acquire(c.sharing);
    log('distinct options/revision/provider outcomes', await Promise.all([
      same.result, changedOptions.result, changedRevision.result, otherProvider.result,
    ]));
    log('distinct host counters', { firstProvider: b.reads(), otherProvider: c.reads() });

    const d = host(), rejectGate = gate(), hostError = new Error('explicit manual provider rejection');
    d.actions.push(async () => { rejectGate.entered(); await rejectGate.wait; throw hostError; });
    const failedA = acquire(d.sharing), failedB = acquire(d.sharing);
    // Handle both rejections before opening the host gate.
    const rejected = Promise.allSettled([failedA.result, failedB.result]);
    await rejectGate.started; rejectGate.open();
    const outcomes = await rejected;
    log('same raw provider rejection for active waiters', outcomes.map(item =>
      item.status === 'rejected' ? { status: item.status, sameHostError: item.reason === hostError } : item));
    log('failed snapshots', [failedA.getSnapshot(), failedB.getSnapshot()]);
    const retry = acquire(d.sharing);
    log('explicit retry after rejected job', await retry.result);
    log('rejection and retry host count', d.reads());

    const e = host(), abandoned = gate(), replacement = gate();
    e.actions.push(async () => { abandoned.entered(); await abandoned.wait; throw hostError; },
      async () => { replacement.entered(); await replacement.wait; return e.provide(); });
    const old = acquire(e.sharing);
    await abandoned.started;
    old.release();
    log('all abandoned waiter resolves without waiting for host', await old.result);
    const fresh = acquire(e.sharing);
    await replacement.started;
    abandoned.open();
    // Let the old job's handled rejection settle before attaching to the replacement.
    await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
    const joinsReplacement = acquire(e.sharing);
    replacement.open();
    log('replacement survives late old failure', await Promise.all([fresh.result, joinsReplacement.result]));
    log('abandoned and replacement provider reads', e.reads());

    const f = host(), late = gate(), lateResponse = gate();
    f.actions.push(async () => {
      late.entered(); await late.wait;
      try { return await f.provide(); } finally { lateResponse.entered(); }
    });
    const pending = acquire(f.sharing);
    await late.started;
    f.sharing.dispose();
    log('scope disposed while source pending', await pending.result);
    late.open();
    await lateResponse.started;
    log('final counters (native decode only if available)', counts(a.reads()));
  } finally {
    for (const handle of handles) try { handle.release(); } catch (error) { log('release cleanup error', error); }
    for (const scope of scopes) try { scope.dispose(); } catch (error) { log('scope cleanup error', error); }
    if (typeof nativeDecode === 'function') globalThis.createImageBitmap = nativeDecode;
  }
}
