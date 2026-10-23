import type { RenderFrameSession } from './frame-session.js';
import { requireTextureSession, onTextureSessionEnd } from './render-texture.js';

/** Terminal logical ownership observation, not a native cleanup/GPU-health receipt. */
export interface RenderVisualSceneDisposal {
  readonly id: symbol;
  readonly sessionId: symbol;
  readonly state: 'disposed';
  /** First terminal cause wins; session-ended includes graphics failure/loss. */
  readonly reason: 'scene-disposed' | 'session-ended';
}

/** Detached metadata only: never retains a session, canvas, backend or authored data. */
export type RenderVisualSceneSnapshot =
  | { readonly id: symbol; readonly sessionId: symbol; readonly state: 'active' }
  | RenderVisualSceneDisposal;

/** One empty presentation scope bound permanently to one canonical graphics session. */
export interface RenderVisualScene {
  /** Available after termination. Previously returned snapshots remain historical. */
  readonly getSnapshot: () => RenderVisualSceneSnapshot;
  /** Empty-scene no-op while active; TypeError after termination. Never draws. */
  readonly clear: () => RenderVisualSceneSnapshot;
  /** Terminal/idempotent. Never disposes the borrowed graphics session or host. */
  readonly dispose: () => RenderVisualSceneDisposal;
}

// Weak occupancy guard only, not an enumerable scene registry or authored-ID lookup.
const occupiedSessions = new WeakSet<RenderFrameSession>();

// Separate environment: retained terminal handles cannot keep the factory's session
// parameter alive after the detach callback has been dropped.
function createScope(sessionId: symbol) {
  const id = Symbol('visual-scene');
  let snapshot: RenderVisualSceneSnapshot = Object.freeze({ id, sessionId, state: 'active' });
  let detach: (() => void) | undefined;

  const end = (reason: RenderVisualSceneDisposal['reason']): RenderVisualSceneDisposal => {
    if (snapshot.state === 'disposed') return snapshot;
    snapshot = Object.freeze({ id, sessionId, state: 'disposed', reason });
    const release = detach;
    detach = undefined; // Terminal before unlinking; no retained session/subscription.
    release?.();
    return snapshot;
  };
  const handle: RenderVisualScene = Object.freeze({
    getSnapshot: (): RenderVisualSceneSnapshot => snapshot,
    clear: (): RenderVisualSceneSnapshot => {
      if (snapshot.state === 'disposed') throw new TypeError('Visual scene is disposed');
      // SR02 owns no instances or resources. Nothing else in the session is cleared.
      return snapshot;
    },
    dispose: (): RenderVisualSceneDisposal => end('scene-disposed'),
  });
  return { handle, end, attach: (callback: () => void): void => { detach = callback; } };
}

/**
 * Create an empty, independent visual scope without graphics acquisition, native
 * scene allocation, IO or submission. Accepts only a live canonical session from
 * this package instance, including a suspended one. active is logical ownership,
 * not continuous GPU liveness. Binding-only/foreign/structural sessions reject
 * with TypeError; ended canonical sessions retain SESSION_UNAVAILABLE texture
 * diagnostics from the existing graphics admission hook.
 *
 * A second active scope on the same session rejects with TypeError. Dispose the
 * first explicitly before creating a fresh identity; no switch/transfer/upsert.
 * The canonical session's existing terminal broadcast closes the scope before
 * backend teardown, including loss/failure and cleanup-uncertain disposal.
 */
export function createRenderVisualScene(session: RenderFrameSession): RenderVisualScene {
  const sessionId = requireTextureSession(session);
  if (occupiedSessions.has(session)) throw new TypeError('Graphics session already has an active visual scene');
  const scope = createScope(sessionId);
  const unsubscribe = onTextureSessionEnd(session, () => { scope.end('session-ended'); });
  scope.attach(() => {
    occupiedSessions.delete(session);
    unsubscribe();
  });
  occupiedSessions.add(session);
  return scope.handle;
}
