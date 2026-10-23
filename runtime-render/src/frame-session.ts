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
import { planRenderViewportSize, type RenderViewportMetrics, type RenderViewportSizeLimits } from './viewport-size.js';
import { readDecodedPng } from './png-bitmap.js';
import { registerTextureSession, TextureError, getRenderTextureFailure } from './render-texture.js';

export { getRenderFrameFailure, type RenderFrameFailure } from './frame-failure.js';

/** Submission returned without a detected context/GL error; not display evidence. */
export interface RenderFrameReceipt {
  readonly sessionId: symbol;
  readonly status: 'submitted';
  /**
   * Canonical sessions always attach the frozen active viewport used for this
   * submission. Optional for compatibility with earlier structural receipts.
   * Historical configuration, not live health or browser display evidence.
   */
  readonly viewport?: RenderViewportSnapshot & { readonly state: 'active' };
}

/** Explicit graphics session; existing binding-only factories remain unchanged. */
export interface RenderFrameSession extends RenderSessionLifecycle {
  /** Synchronous, on demand only. Nested requests reject; never queued/coalesced. */
  readonly renderFrame: () => RenderFrameReceipt;
}

/** Last observed graphics lifecycle, not a live GPU-health/display observation. */
export type RenderGraphicsSnapshot =
  | { readonly state: 'pending' | 'ready'; readonly failure: null }
  | {
    readonly state: 'failed' | 'disposed';
    /** Null on clean disposal or an unrecognized failure; never raw host data. */
    readonly failure: RenderFailure | RenderFrameFailure | null;
    /**
     * Canonical terminal observations always supply this, including unknown
     * exceptions. True also covers cleanup uncertainty requiring quarantine;
     * false is not evidence that GPU memory was reclaimed. Optional for older
     * structural producers; absence must not be interpreted as clean cleanup.
     */
    readonly cleanupFailed?: boolean;
  };

/** Observation of one acquisition and its resulting session, not a second session. */
export interface RenderFrameAcquisition {
  readonly getSnapshot: () => RenderGraphicsSnapshot;
  /** Rejects with the original exception. Caller must handle and release late results. */
  readonly result: Promise<RenderFrameSession>;
}

/** Detached, last-configured extent; not CSS size, world placement or screen mapping. */
export type RenderViewportSnapshot = {
  /** Buffer bounds (0,0,width,height) in drawing-buffer pixels; no subregions. */
  readonly scope: 'full-canvas';
  readonly graphics: RenderGraphicsSnapshot;
} & (
  | {
    /** Null only if binding descriptor creation itself failed. */
    readonly sessionId: symbol | null;
    readonly state: 'uninitialized' | 'unavailable' | 'terminal';
    readonly size: null;
  }
  | {
    /** One full-canvas viewport per session; existing symbol is its identity. */
    readonly sessionId: symbol;
    /** Host-controlled suspension retains the last configured positive extent. */
    readonly state: 'active' | 'suspended';
    readonly size: {
      readonly width: number;
      readonly height: number;
      readonly unit: 'drawing-buffer-px';
    };
  }
);

// Identity lookup only: non-enumerable weak keys, no global selection or manager.
// Readers retain only scalar state/immutable diagnostics, never targets/backends.
const viewportReaders = new WeakMap<object, () => RenderViewportSnapshot>();

/** Accepted synchronous backend configuration; not frame/display or memory evidence. */
export interface RenderViewportResizeReceipt {
  readonly sessionId: symbol;
  /** Unchanged means no backing-buffer attribute write was necessary. */
  readonly status: 'resized' | 'unchanged';
  readonly requested: RenderViewportMetrics;
  readonly size: {
    readonly width: number;
    readonly height: number;
    readonly unit: 'drawing-buffer-px';
  };
  /** Native accepted size / supplied logical CSS extent, per axis. */
  readonly effectivePixelRatio: { readonly x: number; readonly y: number };
}

const viewportResizers = new WeakMap<RenderFrameSession,
  (metrics: RenderViewportMetrics, limits: RenderViewportSizeLimits) => RenderViewportResizeReceipt>();
const viewportSuspensions = new WeakMap<RenderFrameSession, (suspended: boolean) => void>();

/** Redraw demand only; neither readiness, a queued callback nor display evidence. */
export interface RenderFrameInvalidationSnapshot {
  readonly sessionId: symbol;
  /** Retained after suspension/termination; consult viewport state before requesting. */
  readonly invalidated: boolean;
}

const frameInvalidations = new WeakMap<RenderFrameSession, {
  readonly read: () => RenderFrameInvalidationSnapshot;
  readonly invalidate: () => RenderFrameInvalidationSnapshot;
}>();

/** Read historical demand even after disposal, without scheduling or acquiring. */
export function getRenderFrameInvalidationSnapshot(session: RenderFrameSession): RenderFrameInvalidationSnapshot {
  const control = frameInvalidations.get(session);
  if (control === undefined) throw new TypeError('Expected a graphics session from this Render package instance');
  return control.read();
}

/**
 * Mark host-known presentation changes for redraw. Repeated invalidations coalesce
 * into one pending demand, not frame requests. Suspended sessions retain demand;
 * terminal sessions reject via the existing lifecycle guard. No scene update/IO.
 */
export function invalidateRenderFrame(session: RenderFrameSession): RenderFrameInvalidationSnapshot {
  const control = frameInvalidations.get(session);
  if (control === undefined) throw new TypeError('Expected a graphics session from this Render package instance');
  return control.invalidate();
}

/**
 * Explicitly defer rendering for host-hidden, paused or zero logical size UI.
 * Idempotent; retains backend, positive native extent and target reservation.
 * No CSS/native-buffer writes or GPU-health/readiness claim. Terminal guards
 * remain unchanged; custom/foreign handles throw TypeError.
 */
export function suspendRenderViewport(session: RenderFrameSession): RenderViewportSnapshot {
  const change = viewportSuspensions.get(session);
  if (change === undefined) throw new TypeError('Expected a graphics session from this Render package instance');
  change(true);
  return getRenderViewportSnapshot(session);
}

/**
 * Apply fresh positive host metrics on the same session before enabling frames.
 * Admission rejection preserves suspension; backend failure remains terminal.
 * Also valid on active sessions. Never implicitly creates/restores graphics.
 */
export function resumeRenderViewport(
  session: RenderFrameSession, metrics: RenderViewportMetrics, limits: RenderViewportSizeLimits,
): RenderViewportResizeReceipt {
  const change = viewportSuspensions.get(session);
  if (change === undefined) throw new TypeError('Expected a graphics session from this Render package instance');
  const receipt = resizeRenderViewport(session, metrics, limits);
  change(false);
  return receipt;
}

/**
 * Resize a canonical acquired session without replacing its identity/backend.
 * No CSS write, frame submission or implicit DPR. Foreign/custom handles throw
 * TypeError; disposed sessions use existing SESSION_DISPOSED/getSnapshot.
 * Invalid/over-budget admission leaves state untouched. Backend mutation failure
 * terminates graphics and attempts cleanup; no success receipt is returned.
 */
export function resizeRenderViewport(
  session: RenderFrameSession, metrics: RenderViewportMetrics, limits: RenderViewportSizeLimits,
): RenderViewportResizeReceipt {
  const resize = viewportResizers.get(session);
  if (resize === undefined) throw new TypeError('Expected a graphics session from this Render package instance');
  return resize(metrics, limits);
}

/**
 * Observe the viewport of a handle created by this package instance. Accepts
 * pending/failed acquisitions and disposed sessions; never acquires graphics.
 * Throws TypeError for binding-only/custom/foreign handles, without invoking them.
 */
export function getRenderViewportSnapshot(
  handle: RenderFrameAcquisition | RenderFrameSession,
): RenderViewportSnapshot {
  const read = viewportReaders.get(handle);
  if (read === undefined) throw new TypeError('Expected a graphics handle from this Render package instance');
  return read();
}

/**
 * Start the canonical async acquisition with pull-based lifecycle observations.
 * No callbacks, cancellation, extra backend or implicit frame. Snapshot remains
 * readable after failure/disposal, retaining no target or native handles.
 */
export function beginRenderFrameSession(host: RenderHostBinding): RenderFrameAcquisition {
  // One local flag shared with canonical session operations, not a second lifecycle.
  const viewportControl = { suspended: false };
  let snapshot: RenderGraphicsSnapshot = Object.freeze({ state: 'pending', failure: null });
  let sessionId: symbol | null = null;
  let size: { readonly width: number; readonly height: number; readonly unit: 'drawing-buffer-px' } | null = null;
  let acquired = false;
  const update = (next: RenderGraphicsSnapshot): void => {
    snapshot = Object.freeze(next);
    if (next.state === 'ready') acquired = true;
    if (next.state === 'failed' || next.state === 'disposed') size = null;
  };
  const readViewport = (): RenderViewportSnapshot => {
    const common = { scope: 'full-canvas' as const, graphics: snapshot };
    if (snapshot.state === 'ready' && size !== null && sessionId !== null) {
      return Object.freeze({ ...common, sessionId, state: viewportControl.suspended ? 'suspended' : 'active', size });
    }
    const state = snapshot.state === 'pending' ? 'uninitialized'
      : acquired ? 'terminal' : 'unavailable';
    return Object.freeze({ ...common, sessionId, state, size: null });
  };
  const result = acquireRenderFrameSession(host, update, (id, extent) => {
    sessionId = id;
    size = extent === null ? null : Object.freeze({ ...extent, unit: 'drawing-buffer-px' });
  }, viewportControl).then((session) => {
    viewportReaders.set(session, readViewport);
    return session;
  }).catch((error: unknown) => {
    update({ state: 'failed', failure: getRenderFailure(error) ?? getRenderFrameFailure(error) ?? null,
      cleanupFailed: getRenderFrameFailure(error)?.cleanupFailed ?? false });
    throw error;
  });
  const operation = Object.freeze({ getSnapshot: () => snapshot, result });
  viewportReaders.set(operation, readViewport);
  return operation;
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
  captureViewport: (id: symbol, size: { readonly width: number; readonly height: number } | null) => void,
  viewportControl: { suspended: boolean },
): Promise<RenderFrameSession> {
  const lifecycle = createRenderSessionLifecycle(host);
  const sessionId = lifecycle.getSnapshot().descriptor.id;
  captureViewport(sessionId, null);
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
    backend = createThreeFrameBackend(target, () => {
      // Native loss is asynchronous: publish its diagnostic, never throw from
      // the browser event. Cleanup failure is retained in the same observation.
      failGraphics(new FrameError('CONTEXT_LOST', 'renderFrame'));
    }, (error) => { failGraphics(error); });
    captureViewport(sessionId, backend.viewportSize);
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
    viewportControl.suspended = false;
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

  function failGraphics(error: unknown): unknown {
    let cleanupFailed = false;
    try { disposeResources(); } catch { cleanupFailed = true; }
    const known = getRenderFrameFailure(error);
    const failure = known === undefined ? error
      : new FrameError(known.code, known.stage, known.cleanupFailed || cleanupFailed);
    update({ state: 'failed', failure: getRenderFrameFailure(failure) ?? null,
      cleanupFailed: cleanupFailed || (known?.cleanupFailed ?? false) });
    // Unknown backend exceptions remain original exceptions, not guessed codes.
    return failure;
  }

  let frameInProgress = false;
  // Bounded opaque tokens; no clock, unbounded revision, queue or callback.
  // Capture the submitted token so invalidation during backend work stays pending.
  let redrawToken: object = {};
  let submittedToken: object | undefined;
  const readInvalidation = (): RenderFrameInvalidationSnapshot =>
    Object.freeze({ sessionId, invalidated: redrawToken !== submittedToken });
  const session: RenderFrameSession = Object.freeze({
    getSnapshot: lifecycle.getSnapshot,
    initialize: lifecycle.initialize,
    dispose: () => {
      // Only the first release changes graphics observations. Repeated release
      // must not erase a preceding frame failure or cleanup-failure diagnostic.
      const firstRelease = backend !== undefined;
      try {
        const observation = disposeResources();
        if (firstRelease) update({ state: 'disposed', failure: null, cleanupFailed: false });
        return observation;
      } catch (error) {
        if (firstRelease) update({ state: 'disposed', failure: getRenderFrameFailure(error) ?? null,
          cleanupFailed: true });
        throw error;
      }
    },
    renderFrame: (): RenderFrameReceipt => {
      lifecycle.getSnapshot(); // Disposed sessions use existing error semantics.
      // Rejection is not a backend failure: no frame, cleanup or state transition.
      if (viewportControl.suspended) throw new FrameError('VIEWPORT_SUSPENDED', 'renderFrame');
      if (frameInProgress) throw new FrameError('FRAME_IN_PROGRESS', 'renderFrame');
      const viewport = getRenderViewportSnapshot(session);
      if (viewport.state !== 'active' || viewport.graphics.state !== 'ready') {
        throw failGraphics(new FrameError('FRAME_NOT_SUBMITTED', 'renderFrame'));
      }
      frameInProgress = true;
      const requestedToken = redrawToken;
      try {
        const owned = backend;
        if (owned === undefined) throw new FrameError('FRAME_FAILED', 'renderFrame');
        owned.renderFrame();
        // Do not receipt a frame whose session was released during backend work.
        if (backend !== owned) throw new FrameError('FRAME_FAILED', 'renderFrame');
        submittedToken = requestedToken;
        return Object.freeze({ sessionId: viewport.sessionId, status: 'submitted',
          viewport: Object.freeze({ ...viewport, state: 'active' as const }) });
      } catch (error) {
        throw failGraphics(error);
      } finally {
        frameInProgress = false;
      }
    },
  });
  registerTextureSession(session, sessionId, (image, options) => {
    const owned = backend;
    if (owned === undefined) throw new TextureError('SESSION_UNAVAILABLE');
    // Admission errors do not destroy another resource or a valid graphics session.
    const bitmap = readDecodedPng(image);
    if (bitmap === undefined) throw new TextureError('IMAGE_NOT_DECODED');
    if (frameInProgress) throw new FrameError('FRAME_IN_PROGRESS', 'renderFrame');
    try {
      const resource = owned.uploadTexture(sessionId, bitmap, options);
      if (backend !== owned) {
        resource.release();
        throw new TextureError('SESSION_UNAVAILABLE');
      }
      return resource;
    } catch (error) {
      // A dimension admission rejection is before allocation/mutation.
      if (getRenderTextureFailure(error)?.code === 'TEXTURE_LIMIT_EXCEEDED') throw error;
      if (backend === owned) {
        // Keep Phase6's recognized native-loss diagnostic without expanding its union.
        failGraphics(getRenderTextureFailure(error)?.code === 'CONTEXT_LOST'
          ? new FrameError('CONTEXT_LOST', 'renderFrame') : error);
      }
      throw error;
    }
  });
  frameInvalidations.set(session, {
    read: readInvalidation,
    invalidate: () => {
      lifecycle.getSnapshot();
      redrawToken = {};
      return readInvalidation();
    },
  });
  viewportSuspensions.set(session, (suspended) => {
    lifecycle.getSnapshot();
    viewportControl.suspended = suspended;
  });
  viewportResizers.set(session, (metrics, limits) => {
    lifecycle.getSnapshot(); // Terminal guard precedes validation.
    const plan = planRenderViewportSize(metrics, limits);
    lifecycle.getSnapshot(); // Host-supplied getters may have disposed the session.
    const owned = backend;
    if (owned === undefined) throw new Error('Missing graphics resources');
    try {
      owned.validateResize(plan);
    } catch (error) {
      // Admission happens before mutation. Only recognized backend failure is
      // terminal here; RangeError is rejection, never a pretend successful resize.
      if (getRenderFrameFailure(error) !== undefined) throw failGraphics(error);
      throw error;
    }
    try {
      const accepted = owned.resize(plan);
      captureViewport(sessionId, accepted.size);
      // Includes unchanged resize and resume: accepted configuration merits redraw,
      // but never performs/schedules it. Rejected admission leaves demand unchanged.
      redrawToken = {};
      return Object.freeze({
        sessionId, status: accepted.changed ? 'resized' : 'unchanged',
        requested: plan.requested,
        size: Object.freeze({ ...accepted.size, unit: 'drawing-buffer-px' as const }),
        effectivePixelRatio: Object.freeze({
          x: accepted.size.width / plan.requested.logicalWidthCssPx,
          y: accepted.size.height / plan.requested.logicalHeightCssPx,
        }),
      });
    } catch (error) { throw failGraphics(error); }
  });
  update({ state: 'ready', failure: null });
  return session;
}
