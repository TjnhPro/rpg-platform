import type { RenderFrameSession } from './frame-session.js';
import { prepareVisualResource, type VisualResourceDescriptor } from './visual-resource.js';
import type { VisualSourceProvider } from './visual-source.js';
import { capturePngDecodeLimits, type PngDecodeLimits } from './png-image.js';
import { createPngLoadScope, type SharedPngLoad, type SharedPngLoadSnapshot } from './png-load-scope.js';
import { requireTextureSession, onTextureSessionEnd, uploadPngTexture, registerRenderTexture,
  getRenderTextureFailure, TextureError, type RenderTexture, type RenderTextureOptions,
  type RenderTextureSnapshot, type RenderTextureFailure } from './render-texture.js';

/** Admission bounds, including pending entries. No idle retention or automatic eviction. */
export interface ResourceCacheLimits {
  readonly maxCpuEntries: number;
  readonly maxGpuEntries: number;
}
type LoadFailure = Extract<SharedPngLoadSnapshot, { state: 'failed' }>['failure'];
export type VisualResourceLeaseSnapshot = { readonly id: symbol; readonly sessionId: symbol;
  readonly cleanupFailed: boolean } & (
  | { readonly state: 'pending' | 'released' | 'invalidated' }
  | { readonly state: 'failed'; readonly failure: LoadFailure
    | { readonly stage: 'texture'; readonly code: RenderTextureFailure['code'] } }
  | { readonly state: 'usable'; readonly texture: RenderTexture;
    /** Shared allocation identity; individual texture capability IDs remain independent. */
    readonly resourceId: symbol; readonly sourceRevision: string }
);
export interface VisualResourceLease {
  readonly getSnapshot: () => VisualResourceLeaseSnapshot;
  /** Known loading failures resolve; unexpected errors reject unless session termination already invalidated the lease. */
  readonly result: Promise<VisualResourceLeaseSnapshot>;
  /** Terminal/idempotent, also when released through the texture capability. */
  readonly release: () => VisualResourceLeaseSnapshot;
}
export interface VisualResourceCacheSnapshot {
  readonly state: 'active' | 'disposed';
  readonly cpuEntries: number;
  readonly gpuEntries: number;
  readonly leases: number;
  /** Saturating operation counts, never bytes, GPU completion or performance measurements. */
  readonly sourceJobs: number;
  readonly uploadCalls: number;
  readonly cpuHits: number;
  readonly gpuHits: number;
  readonly cleanupFailed: boolean;
}
export interface VisualResourceCache {
  readonly acquire: (session: RenderFrameSession, descriptor: VisualResourceDescriptor, sourceIndex: number,
    expectedRevision: string, limits: PngDecodeLimits, options: RenderTextureOptions) => VisualResourceLease;
  readonly getSnapshot: () => VisualResourceCacheSnapshot;
  /** Revokes all leases and attempts every cleanup. Does not dispose borrowed sessions. */
  readonly dispose: () => void;
}

interface CpuEntry { readonly key: string; load: SharedPngLoad | undefined;
  result: Promise<SharedPngLoadSnapshot>; users: number }
interface Group { readonly session: RenderFrameSession; readonly id: symbol;
  readonly entries: Map<string, Entry>; unsubscribe: () => void }
interface Entry { readonly key: string; readonly group: Group; readonly cpu: CpuEntry;
  readonly options: RenderTextureOptions; readonly waiters: Set<Waiter>;
  texture: RenderTexture | undefined; terminalTexture: RenderTextureSnapshot | undefined; closed: boolean; cleanupFailed: boolean }
interface Waiter {
  readonly finish: (state: 'released' | 'invalidated') => VisualResourceLeaseSnapshot;
  readonly fail: (failure: LoadFailure | { readonly stage: 'texture'; readonly code: RenderTextureFailure['code'] },
    unexpected?: { readonly value: unknown }) => void;
  readonly deliver: (revision: string, base: RenderTextureSnapshot) => void;
}
const increment = (value: number): number => Math.min(Number.MAX_SAFE_INTEGER, value + 1);

/** Explicit provider-bound cache. CPU entries survive only while a pending/live GPU entry owns them. */
export function createVisualResourceCache(provider: VisualSourceProvider, inputLimits: ResourceCacheLimits): VisualResourceCache {
  const maxCpu = inputLimits.maxCpuEntries, maxGpu = inputLimits.maxGpuEntries;
  if (!Number.isSafeInteger(maxCpu) || maxCpu < 1 || maxCpu > 1024
    || !Number.isSafeInteger(maxGpu) || maxGpu < 1 || maxGpu > 4096) {
    throw new TypeError('Explicit entry bounds required: CPU 1..1024, GPU 1..4096');
  }
  const loads = createPngLoadScope(provider), cpus = new Map<string, CpuEntry>();
  const groups = new Map<RenderFrameSession, Group>();
  let closed = false, gpuCount = 0, leaseCount = 0, cleanupFailed = false;
  let sourceJobs = 0, uploadCalls = 0, cpuHits = 0, gpuHits = 0;

  // Unlink before cleanup, so reentrant native failure cannot double-decrement/revive an entry.
  function retire(entry: Entry): void {
    if (entry.closed) return;
    entry.closed = true;
    const group = entry.group;
    group.entries.delete(entry.key);
    gpuCount--;
    if (group.entries.size === 0) { groups.delete(group.session); group.unsubscribe(); }
    const texture = entry.texture;
    entry.texture = undefined;
    let error: { value: unknown } | undefined;
    try { texture?.release(); } catch (value) { error = { value }; }
    finally {
      try { entry.terminalTexture = texture?.getSnapshot(); } catch (value) { error ??= { value }; }
    }
    entry.cpu.users--;
    if (entry.cpu.users === 0) {
      cpus.delete(entry.cpu.key);
      try { entry.cpu.load?.release(); } catch (value) { error ??= { value }; }
    }
    if (error !== undefined) {
      cleanupFailed = entry.cleanupFailed = true;
      throw error.value;
    }
  }
  function endGroup(group: Group): void {
    let error: { value: unknown } | undefined;
    for (const entry of [...group.entries.values()]) {
      for (const waiter of [...entry.waiters]) {
        try { waiter.finish('invalidated'); } catch (value) { error ??= { value }; }
      }
    }
    if (error !== undefined) throw error.value;
  }
  function waiter(entry: Entry, ready?: { readonly revision: string; readonly base: RenderTextureSnapshot }): VisualResourceLease {
    const id = Symbol('resource-lease'), sessionId = entry.group.id;
    let state: VisualResourceLeaseSnapshot = Object.freeze({ id, sessionId, state: 'pending', cleanupFailed: false });
    let resolve: ((value: VisualResourceLeaseSnapshot) => void) | undefined;
    let reject: ((error: unknown) => void) | undefined;
    const result = new Promise<VisualResourceLeaseSnapshot>((yes, no) => { resolve = yes; reject = no; });
    let aliasSnapshot: RenderTextureSnapshot | undefined;
    const settle = (): void => { resolve?.(state); resolve = undefined; reject = undefined; };
    const finish = (next: 'released' | 'invalidated'): VisualResourceLeaseSnapshot => {
      if (state.state === 'released' || state.state === 'invalidated' || state.state === 'failed') return observe();
      state = Object.freeze({ id, sessionId, state: next, cleanupFailed: entry.cleanupFailed });
      if (aliasSnapshot !== undefined) aliasSnapshot = Object.freeze({ ...aliasSnapshot, state: next });
      entry.waiters.delete(control); leaseCount--;
      try { if (entry.waiters.size === 0) retire(entry); }
      finally { state = Object.freeze({ ...state, cleanupFailed: entry.cleanupFailed }); settle(); }
      return state;
    };
    const observe = (): VisualResourceLeaseSnapshot => {
      // Canonical texture probe detects native context loss and synchronously revokes group leases.
      if (state.state === 'usable') entry.texture?.getSnapshot();
      if (state.cleanupFailed !== entry.cleanupFailed) state = Object.freeze({ ...state, cleanupFailed: entry.cleanupFailed });
      return state;
    };
    const control: Waiter = {
      finish,
      fail: (failure, unexpected): void => {
        if (state.state !== 'pending') return;
        entry.waiters.delete(control); leaseCount--;
        state = Object.freeze({ id, sessionId, state: 'failed', failure, cleanupFailed: entry.cleanupFailed });
        if (unexpected !== undefined) { reject?.(unexpected.value); resolve = undefined; reject = undefined; }
        else settle();
      },
      deliver: (sourceRevision, base): void => {
        if (state.state !== 'pending' || entry.closed || entry.texture === undefined) return;
        const aliasId = Symbol('leased-texture');
        aliasSnapshot = Object.freeze({ ...base, id: aliasId });
        const read = (): RenderTextureSnapshot => {
          const current = entry.texture?.getSnapshot() ?? entry.terminalTexture;
          if (current !== undefined) aliasSnapshot = Object.freeze({ ...current, id: aliasId,
            ...(state.state === 'released' || state.state === 'invalidated' ? { state: state.state } : {}) });
          // After retirement retain actual terminal cleanup, never pretend native deletion succeeded.
          return aliasSnapshot!;
        };
        const texture: RenderTexture = Object.freeze({ getSnapshot: read,
          release: () => { finish('released'); return read(); } });
        registerRenderTexture(texture, sessionId, read);
        state = Object.freeze({ id, sessionId, state: 'usable', texture, resourceId: base.id,
          sourceRevision, cleanupFailed: false });
        settle();
      },
    };
    entry.waiters.add(control); leaseCount++;
    if (ready !== undefined) control.deliver(ready.revision, ready.base);
    return Object.freeze({ getSnapshot: observe, result, release: () => finish('released') });
  }
  async function populate(entry: Entry): Promise<void> {
    let failure: LoadFailure | { readonly stage: 'texture'; readonly code: RenderTextureFailure['code'] } = null;
    let unexpected: { value: unknown } | undefined;
    try {
      const loaded = await entry.cpu.result;
      if (entry.closed) return;
      requireTextureSession(entry.group.session);
      if (loaded.state === 'decoded') {
        uploadCalls = increment(uploadCalls);
        const texture = uploadPngTexture(entry.group.session, loaded.image, entry.options);
        if (entry.closed) { texture.release(); return; }
        entry.texture = texture;
        const base = texture.getSnapshot();
        if (entry.closed) return;
        for (const control of [...entry.waiters]) control.deliver(loaded.source.revision, base);
        return;
      }
      failure = loaded.state === 'failed' ? loaded.failure : null;
    } catch (value) {
      const known = getRenderTextureFailure(value);
      if (known === undefined) unexpected = { value };
      else failure = Object.freeze({ stage: 'texture', code: known.code });
    }
    if (entry.closed) return;
    // Cleanup and eviction before notifying failures. Preserve original unexpected exception identity.
    try { retire(entry); } catch (value) { unexpected ??= { value }; }
    for (const control of [...entry.waiters]) control.fail(failure, unexpected);
  }
  return Object.freeze<VisualResourceCache>({
    acquire: (session, input, sourceIndex, expectedRevision, inputDecodeLimits, inputOptions): VisualResourceLease => {
      if (closed) throw new TypeError('Visual resource cache is disposed');
      const sessionId = requireTextureSession(session);
      const descriptor = prepareVisualResource(input).descriptor;
      const limits = capturePngDecodeLimits(inputDecodeLimits);
      const options = Object.freeze({ sampling: inputOptions.sampling, colorSpace: inputOptions.colorSpace });
      if ((options.sampling !== 'nearest' && options.sampling !== 'linear')
        || (options.colorSpace !== 'srgb' && options.colorSpace !== 'linear-srgb')
        || typeof expectedRevision !== 'string' || expectedRevision.trim().length === 0
        || !Number.isSafeInteger(sourceIndex) || descriptor.sources[sourceIndex]?.role !== 'image') {
        throw new TypeError('Explicit image source/revision/decode and texture options required');
      }
      if (closed) throw new TypeError('Visual resource cache is disposed');
      requireTextureSession(session); // Input getters may have disposed it.
      const cpuKey = JSON.stringify([descriptor, sourceIndex, expectedRevision, limits,
        'browser-png-v1/from-image/alpha-none/color-none/no-resize']);
      const key = JSON.stringify([cpuKey, options]);
      let group = groups.get(session);
      let entry = group?.entries.get(key);
      if (entry !== undefined) {
        const current = entry.texture?.getSnapshot();
        if (entry.closed || (current !== undefined && current.state !== 'usable')) throw new TextureError('SESSION_UNAVAILABLE');
        gpuHits = increment(gpuHits);
        if (current !== undefined) {
          const loaded = entry.cpu.load?.getSnapshot();
          if (loaded?.state !== 'decoded') throw new TextureError('IMAGE_NOT_DECODED');
          return waiter(entry, { revision: loaded.source.revision, base: current });
        }
        return waiter(entry);
      }
      if (gpuCount >= maxGpu) throw new RangeError('GPU cache entry limit reached');
      let cpu = cpus.get(cpuKey);
      if (cpu === undefined && cpus.size >= maxCpu) throw new RangeError('CPU cache entry limit reached');
      if (cpu === undefined) {
        cpu = { key: cpuKey, load: undefined, users: 0, result: Promise.resolve(Object.freeze({
          id: Symbol(), stage: 'shared-png-load', state: 'released' })) };
        const captured = cpu;
        // Register every ownership edge before invoking host IO, which can reenter disposal.
        cpu.result = Promise.resolve().then(() => {
          if (captured.users === 0 || closed) return Object.freeze({
            id: Symbol(), stage: 'shared-png-load' as const, state: 'released' as const });
          sourceJobs = increment(sourceJobs);
          const load = loads.acquire(descriptor, sourceIndex, expectedRevision, limits);
          captured.load = load;
          // Host read may have synchronously terminated its last owning session.
          if (captured.users === 0 || closed) load.release();
          return load.result;
        });
        cpus.set(cpuKey, cpu);
      } else cpuHits = increment(cpuHits);
      if (group === undefined) {
        group = { session, id: sessionId, entries: new Map(), unsubscribe: () => {} };
        const captured = group;
        group.unsubscribe = onTextureSessionEnd(session, () => endGroup(captured));
        groups.set(session, group);
      }
      cpu.users++;
      entry = { key, group, cpu, options, waiters: new Set(), texture: undefined, terminalTexture: undefined, closed: false, cleanupFailed: false };
      group.entries.set(key, entry); gpuCount++;
      const lease = waiter(entry);
      void populate(entry);
      return lease;
    },
    getSnapshot: (): VisualResourceCacheSnapshot => Object.freeze({ state: closed ? 'disposed' : 'active',
      cpuEntries: cpus.size, gpuEntries: gpuCount, leases: leaseCount, sourceJobs,
      uploadCalls, cpuHits, gpuHits, cleanupFailed }),
    dispose: (): void => {
      if (closed) return;
      closed = true;
      let error: { value: unknown } | undefined;
      for (const group of [...groups.values()]) try { endGroup(group); } catch (value) { error ??= { value }; }
      try { loads.dispose(); } catch (value) { cleanupFailed = true; error ??= { value }; }
      if (error !== undefined) throw error.value;
    },
  });
}
