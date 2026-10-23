import {
  createRenderSessionLifecycle,
  getRenderFailure,
  type RenderFailure,
  type RenderHostBinding,
  type RenderSessionLifecycle,
} from './index.js';
import { FrameError, getRenderFrameFailure, type RenderFrameFailure } from './frame-failure.js';
import type { ThreeFrameBackend } from './three-frame.js';
import { readBrowserCanvas } from './canvas-target.js';

export { getRenderFrameFailure, type RenderFrameFailure } from './frame-failure.js';

/** Submission returned without a detected context/GL error; not display evidence. */
export interface RenderFrameReceipt {
  readonly sessionId: symbol;
  readonly status: 'submitted';
}

/** Explicit graphics session; existing binding-only factories remain unchanged. */
export interface RenderFrameSession extends RenderSessionLifecycle {
  readonly renderFrame: () => RenderFrameReceipt;
}

/** Last observed graphics lifecycle, not a live GPU-health/display observation. */
export type RenderGraphicsSnapshot =
  | { readonly state: 'pending' | 'ready'; readonly failure: null }
  | {
    readonly state: 'failed' | 'disposed';
    /** Null on clean disposal or an unrecognized failure; never raw host data. */
    readonly failure: RenderFailure | RenderFrameFailure | null;
  };

/** Observation of one acquisition and its resulting session, not a second session. */
export interface RenderFrameAcquisition {
  readonly getSnapshot: () => RenderGraphicsSnapshot;
  /** Rejects with the original exception. Caller must handle and release late results. */
  readonly result: Promise<RenderFrameSession>;
}

/**
 * Start the canonical async acquisition with pull-based lifecycle observations.
 * No callbacks, cancellation, extra backend or implicit frame. Snapshot remains
 * readable after failure/disposal, retaining no target or native handles.
 */
export function beginRenderFrameSession(host: RenderHostBinding): RenderFrameAcquisition {
  let snapshot: RenderGraphicsSnapshot = Object.freeze({ state: 'pending', failure: null });
  const update = (next: RenderGraphicsSnapshot): void => { snapshot = Object.freeze(next); };
  const result = acquireRenderFrameSession(host, update).catch((error: unknown) => {
    update({ state: 'failed', failure: getRenderFailure(error) ?? getRenderFrameFailure(error) ?? null });
    throw error;
  });
  return Object.freeze({ getSnapshot: () => snapshot, result });
}

// Resource ownership guard, not a cache. Scoped to this package instance.
const occupiedTargets = new WeakSet<object>();

/** Detached target observation, never an acquisition/readiness guarantee. */
export type RenderTargetCapabilities =
  | { readonly status: 'invalid-target' | 'unsupported-target' }
  | {
    readonly status: 'supported-target';
    readonly kind: 'html-canvas';
    /** Native drawing-buffer attributes, not CSS/logical layout measurements. */
    readonly width: number;
    readonly height: number;
    readonly dimensions: 'valid' | 'invalid';
    /** Includes pending acquisition and cleanup-failure quarantine. */
    readonly reservation: 'unreserved' | 'in-use';
    readonly graphics: 'NOT_CHECKED';
  };

/**
 * Inspect a raw target without creating a context, reserving it or loading Three.
 * Only same-realm native browser canvases are supported. No target property duck
 * typing, DOM mutations or cached observations. Unreserved does not promise that
 * acquisition will succeed: graphics availability is checked by the async factory.
 * Safe to call without DOM globals; object targets then report unsupported.
 */
export function inspectRenderTarget(target: unknown): RenderTargetCapabilities {
  if (target === null || (typeof target !== 'object' && typeof target !== 'function')) {
    return Object.freeze({ status: 'invalid-target' });
  }
  const supported = readBrowserCanvas(target);
  if (supported === undefined) return Object.freeze({ status: 'unsupported-target' });
  const { width, height } = supported;
  return Object.freeze({
    status: 'supported-target', kind: 'html-canvas', width, height,
    dimensions: width > 0 && height > 0 ? 'valid' : 'invalid',
    reservation: occupiedTargets.has(target) ? 'in-use' : 'unreserved',
    graphics: 'NOT_CHECKED',
  });
}

/**
 * Bind then acquire Three.js resources on an explicit async path. Supports one
 * graphics session per same-realm HTML canvas. No frame is submitted by creation.
 * Caller must await acquisition and dispose even a late/unwanted result.
 */
export async function createRenderFrameSession(host: RenderHostBinding): Promise<RenderFrameSession> {
  return beginRenderFrameSession(host).result;
}

/** One canonical implementation for both the existing factory and observation handle. */
async function acquireRenderFrameSession(
  host: RenderHostBinding, update: (snapshot: RenderGraphicsSnapshot) => void,
): Promise<RenderFrameSession> {
  const lifecycle = createRenderSessionLifecycle(host);
  let target: object | undefined;
  let backend: ThreeFrameBackend | undefined;
  try {
    const snapshot = lifecycle.initialize();
    target = snapshot.descriptor.host.target;
    if (occupiedTargets.has(target)) {
      target = undefined; // This call does not own the other session's reservation.
      throw new FrameError('TARGET_IN_USE', 'acquire');
    }
    occupiedTargets.add(target);
    const { createThreeFrameBackend } = await import('./three-frame.js');
    backend = createThreeFrameBackend(target);
  } catch (error) {
    lifecycle.dispose();
    if (target !== undefined && !getRenderFrameFailure(error)?.cleanupFailed) {
      occupiedTargets.delete(target);
    }
    // Keep existing target-validation diagnostics intact; unknown module-load
    // errors stay exceptions, rather than being mislabeled as missing WebGL.
    throw error;
  }

  const disposeResources = () => {
    const owned = backend;
    backend = undefined;
    let cleanupFailed = false;
    try {
      owned?.dispose();
    } catch {
      cleanupFailed = true;
    }
    const observation = lifecycle.dispose();
    if (target !== undefined) {
      // Failed cleanup quarantines this target from further use in this instance.
      if (!cleanupFailed) occupiedTargets.delete(target);
      target = undefined;
    }
    if (cleanupFailed) throw new FrameError('CLEANUP_FAILED', 'dispose', true);
    return observation;
  };

  const session: RenderFrameSession = Object.freeze({
    getSnapshot: lifecycle.getSnapshot,
    initialize: lifecycle.initialize,
    dispose: () => {
      // Only the first release changes graphics observations. Repeated release
      // must not erase a preceding frame failure or cleanup-failure diagnostic.
      const firstRelease = backend !== undefined;
      try {
        const observation = disposeResources();
        if (firstRelease) update({ state: 'disposed', failure: null });
        return observation;
      } catch (error) {
        if (firstRelease) update({ state: 'disposed', failure: getRenderFrameFailure(error) ?? null });
        throw error;
      }
    },
    renderFrame: (): RenderFrameReceipt => {
      const snapshot = lifecycle.getSnapshot(); // Disposed sessions use existing error semantics.
      try {
        if (backend === undefined) throw new Error('Missing graphics resources');
        backend.renderFrame();
      } catch {
        let cleanupFailed = false;
        try { disposeResources(); } catch { cleanupFailed = true; }
        const error = new FrameError('FRAME_FAILED', 'renderFrame', cleanupFailed);
        update({ state: 'failed', failure: getRenderFrameFailure(error) ?? null });
        throw error;
      }
      return Object.freeze({ sessionId: snapshot.descriptor.id, status: 'submitted' });
    },
  });
  update({ state: 'ready', failure: null });
  return session;
}
