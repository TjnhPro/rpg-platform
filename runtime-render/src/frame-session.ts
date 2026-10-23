import {
  createRenderSessionLifecycle,
  type RenderHostBinding,
  type RenderSessionLifecycle,
} from './index.js';
import { FrameError, getRenderFrameFailure } from './frame-failure.js';
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

  const dispose = () => {
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

  return Object.freeze({
    getSnapshot: lifecycle.getSnapshot,
    initialize: lifecycle.initialize,
    dispose,
    renderFrame: (): RenderFrameReceipt => {
      const snapshot = lifecycle.getSnapshot(); // Disposed sessions use existing error semantics.
      try {
        if (backend === undefined) throw new Error('Missing graphics resources');
        backend.renderFrame();
      } catch {
        let cleanupFailed = false;
        try { dispose(); } catch { cleanupFailed = true; }
        throw new FrameError('FRAME_FAILED', 'renderFrame', cleanupFailed);
      }
      return Object.freeze({ sessionId: snapshot.descriptor.id, status: 'submitted' });
    },
  });
}
