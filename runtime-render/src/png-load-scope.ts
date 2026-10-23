import { prepareVisualResource, type VisualResourceDescriptor } from './visual-resource.js';
import { createVisualSourceLoad, type VisualSourceLoad, type VisualSourceLoadObservation } from './visual-source-load.js';
import type { VisualSourceProvider, VisualSourceFailureCode, VisualSourceRequest } from './visual-source.js';
import { createPngImageDecode, capturePngDecodeLimits, type PngDecodeLimits, type PngDecodeFailure,
  type PngImageDecode, type PngImageObservation } from './png-image.js';
import { registerDecodedPng, readDecodedPng } from './png-bitmap.js';

export type SharedPngLoadSnapshot = { readonly id: symbol; readonly stage: 'shared-png-load' } & (
  | { readonly state: 'pending' | 'released' }
  | { readonly state: 'failed'; readonly failure:
    { readonly stage: 'source'; readonly code: VisualSourceFailureCode | 'REVISION_MISMATCH' }
    | { readonly stage: 'decode'; readonly code: PngDecodeFailure } | null }
  | { readonly state: 'decoded'; readonly image: PngImageDecode;
    readonly source: Extract<VisualSourceLoadObservation, { state: 'source-acquired' }>['source'] }
);

/** One independent waiter/decoded owner. Release resolves a still-pending result immediately. */
export interface SharedPngLoad {
  readonly getSnapshot: () => SharedPngLoadSnapshot;
  /** Expected failures resolve failed; unexpected provider/native errors reject unchanged. */
  readonly result: Promise<SharedPngLoadSnapshot>;
  /** Also releases this waiter's decoded image; never another waiter's ownership. */
  readonly release: () => SharedPngLoadSnapshot;
}

/** Caller-owned pending registry; no global cache, GPU sharing or implicit uploads. */
export interface PngLoadScope {
  /** Host supplies the revision it expects; observed bytes must match exactly. */
  readonly acquire: (descriptor: VisualResourceDescriptor, sourceIndex: number,
    expectedRevision: string, limits: PngDecodeLimits) => SharedPngLoad;
  /** Closes acquisition and releases pending waiters. Settled decoded owners remain caller-owned. */
  readonly dispose: () => void;
}

type Failure = Extract<SharedPngLoadSnapshot, { state: 'failed' }>['failure'];
type Source = Extract<VisualSourceLoadObservation, { state: 'source-acquired' }>['source'];
interface Waiter {
  readonly fail: (failure: Failure, error?: { readonly value: unknown }) => void;
  readonly deliver: (image: PngImageDecode, source: Source) => void;
  readonly release: () => SharedPngLoadSnapshot;
}
interface Job {
  readonly waiters: Set<Waiter>;
  source: VisualSourceLoad | undefined;
  image: PngImageDecode | undefined;
  forget: (() => void) | undefined;
}

function forget(job: Job): void {
  const remove = job.forget;
  job.forget = undefined;
  remove?.();
}
function cleanup(job: Job): void {
  const image = job.image;
  job.image = undefined;
  job.source?.release();
  job.source = undefined;
  image?.release(); // Existing decoder owns native late-result/close handling.
}

/** Snapshot immutable provider authority; the original read method still receives its host this. */
export function createPngLoadScope(provider: VisualSourceProvider): PngLoadScope {
  const scope = Object.freeze({ ...provider.scope });
  const read = provider.read;
  if (typeof scope.projectId !== 'string' || scope.projectId.trim().length === 0
    || typeof scope.providerId !== 'symbol' || typeof scope.authorizationGeneration !== 'string'
    || scope.authorizationGeneration.trim().length === 0 || typeof read !== 'function') {
    throw new TypeError('Explicit immutable provider authority is required');
  }
  let bound: VisualSourceProvider | undefined = Object.freeze({ scope, read: (request: VisualSourceRequest) => read.call(provider, request) });
  const pending = new Map<string, Job>();
  let closed = false;
  return Object.freeze({
    acquire: (input: VisualResourceDescriptor, sourceIndex: number, expectedRevision: string, inputLimits: PngDecodeLimits): SharedPngLoad => {
      if (closed) throw new TypeError('PNG load scope is disposed');
      const descriptor = prepareVisualResource(input).descriptor;
      const limits = capturePngDecodeLimits(inputLimits);
      if (typeof expectedRevision !== 'string' || expectedRevision.trim().length === 0
        || !Number.isSafeInteger(sourceIndex) || descriptor.sources[sourceIndex]?.role !== 'image') {
        throw new TypeError('Image source, expected revision and bounded PNG decode limits are required');
      }
      // Full descriptor is conservative: order/unused sources may prevent sharing, never conflate it.
      // Provider identity/auth namespace is fixed by this registry instance. Decoder options are fixed v1.
      const key = JSON.stringify([descriptor, sourceIndex, expectedRevision, limits,
        'browser-png-v1/from-image/alpha-none/color-none/no-resize']);
      // Host getters may have disposed the scope during capture.
      if (closed) throw new TypeError('PNG load scope is disposed');
      let job = pending.get(key);
      const fresh = job === undefined;
      if (job === undefined) {
        job = { waiters: new Set(), image: undefined,
          source: createVisualSourceLoad(descriptor, sourceIndex, bound!, limits.maxBytes), forget: undefined };
        const current = job;
        job.forget = () => { if (pending.get(key) === current) pending.delete(key); };
        pending.set(key, job);
      }
      const waiter = createWaiter(job);
      if (fresh) void run(job, expectedRevision, limits);
      return waiter;
    },
    dispose: (): void => {
      if (closed) return;
      closed = true;
      bound = undefined;
      const jobs = [...pending.values()];
      pending.clear();
      // Continue releasing other jobs even if one native bitmap close fails.
      let failed = false, firstError: unknown;
      for (const job of jobs) for (const waiter of [...job.waiters]) {
        try { waiter.release(); } catch (error) { if (!failed) { failed = true; firstError = error; } }
      }
      if (failed) throw firstError;
    },
  });
}

function createWaiter(job: Job): SharedPngLoad {
  const id = Symbol('png-load-waiter');
  let snapshot: SharedPngLoadSnapshot = Object.freeze({ id, stage: 'shared-png-load', state: 'pending' });
  let resolve: ((snapshot: SharedPngLoadSnapshot) => void) | undefined;
  let reject: ((error: unknown) => void) | undefined;
  const result = new Promise<SharedPngLoadSnapshot>((yes, no) => { resolve = yes; reject = no; });
  let image: PngImageDecode | undefined;
  let owner: Job | undefined = job;
  const finish = (): void => { resolve?.(snapshot); resolve = undefined; reject = undefined; };
  const release = (): SharedPngLoadSnapshot => {
    if (snapshot.state === 'released') return snapshot;
    const current = owner;
    owner = undefined;
    const releasedImage = image;
    image = undefined;
    snapshot = Object.freeze({ id, stage: 'shared-png-load', state: 'released' });
    finish();
    current?.waiters.delete(control);
    // Mark the alias terminal before native cleanup, including throwing close().
    if (releasedImage !== undefined) aliasReleased = true;
    if (current !== undefined && current.waiters.size === 0) { forget(current); cleanup(current); }
    return snapshot;
  };
  let aliasReleased = false;
  const control: Waiter = {
    release,
    fail: (failure, error): void => {
      if (snapshot.state !== 'pending') return;
      snapshot = Object.freeze({ id, stage: 'shared-png-load', state: 'failed', failure });
      owner?.waiters.delete(control);
      owner = undefined;
      if (error !== undefined) { reject?.(error.value); resolve = undefined; reject = undefined; }
      else finish();
    },
    deliver: (base, source): void => {
      if (snapshot.state !== 'pending') return;
      const imageId = Symbol('png-load-image');
      const baseSnapshot = base.getSnapshot();
      const observe = (): PngImageObservation => Object.freeze({ ...baseSnapshot, id: imageId,
        ...(aliasReleased ? { state: 'released' as const, cleanup: base.getSnapshot().cleanup } : {}) });
      image = Object.freeze({ getSnapshot: observe, start: () => Promise.resolve(observe()),
        release: () => { release(); return observe(); } });
      const alias = image;
      registerDecodedPng(alias, () => aliasReleased ? undefined : readDecodedPng(base));
      snapshot = Object.freeze({ id, stage: 'shared-png-load', state: 'decoded', image, source });
      finish();
    },
  };
  job.waiters.add(control);
  return Object.freeze({ getSnapshot: () => snapshot, result, release });
}

async function run(job: Job, revision: string, limits: PngDecodeLimits): Promise<void> {
  let failure: Failure = null;
  let unexpected: { value: unknown } | undefined;
  let source: Source | undefined;
  try {
    const acquired = await job.source!.start();
    if (job.waiters.size === 0) return;
    if (acquired.state !== 'source-acquired') {
      failure = Object.freeze({ stage: 'source', code: acquired.state === 'failed' ? acquired.failure ?? 'PROVIDER_FAILED' : 'CANCELLED' });
    } else if (acquired.source.revision !== revision) {
      failure = Object.freeze({ stage: 'source', code: 'REVISION_MISMATCH' });
    } else {
      source = acquired.source;
      job.image = createPngImageDecode(job.source!, limits);
      const decoded = await job.image.start();
      if (job.waiters.size === 0) return;
      if (decoded.state !== 'decoded') {
        failure = decoded.state === 'failed' && decoded.failure !== null
          ? Object.freeze({ stage: 'decode', code: decoded.failure }) : null;
      } else {
        forget(job); // Only pending work is reusable. Settled ownership stays in caller handles.
        job.source?.release();
        job.source = undefined;
        for (const waiter of [...job.waiters]) waiter.deliver(job.image!, source);
        return;
      }
    }
  } catch (error) { unexpected = { value: error }; }
  finally {
    forget(job);
    if (job.waiters.size === 0) {
      // Underlying job has a rejection handler even after every caller releases.
      try { cleanup(job); } catch { /* Release/native decoder already records cleanup failure. */ }
    }
  }
  for (const waiter of [...job.waiters]) waiter.fail(failure, unexpected);
  try { cleanup(job); } catch { /* Preserve primary failure/error identity. */ }
}
