import { observeCamera, type RenderCamera, type RenderCameraViewSnapshot } from './camera.js';
import { getRenderCameraViewportSnapshot } from './camera-viewport.js';
import { invalidateRenderFrame, type RenderFrameReceipt, type RenderViewportResizeReceipt } from './frame-session.js';
import type { RenderVisualScene } from './visual-scene.js';
import { checkVisualEdit } from './visual-transform-backend.js';
import { viewportPointToPlane2D, type ViewportMapping2D, type ViewportMetrics2D } from './viewport-mapping.js';
import { requireCameraScene, onCameraSceneEnd, attachCameraFrameSource, type CameraFrameState } from './camera-frame-link.js';

/** Historical native submission evidence, not pixel/display or continuing liveness proof. */
export interface RenderCameraFrameSnapshot {
  readonly application: 'submitted';
  readonly camera: RenderCameraViewSnapshot;
  readonly sceneId: symbol;
  readonly sessionId: symbol;
  readonly resize: RenderViewportResizeReceipt;
  readonly mapping: ViewportMapping2D;
}
export interface RenderCameraSceneBindingSnapshot {
  readonly cameraId: symbol;
  readonly sceneId: symbol;
  readonly sessionId: symbol;
  readonly state: 'active' | 'disposed';
  readonly reason: null | 'binding-disposed' | 'camera-disposed' | 'scene-ended';
}
/** Explicit view-context refresh after every accepted resize. No scheduling or ownership transfer. */
export interface RenderCameraSceneBinding {
  readonly getSnapshot: () => RenderCameraSceneBindingSnapshot;
  readonly configure: (resize: RenderViewportResizeReceipt, logical: ViewportMetrics2D) => RenderCameraSceneBindingSnapshot;
  readonly dispose: () => RenderCameraSceneBindingSnapshot;
}
const submitted = new WeakMap<RenderFrameReceipt, RenderCameraFrameSnapshot>();
/** Undefined for legacy/no-camera, copied or foreign receipts. Never calls host receipt methods. */
export function getRenderCameraFrameSnapshot(receipt: RenderFrameReceipt): RenderCameraFrameSnapshot | undefined {
  return submitted.get(receipt);
}
/** Owner-local; only Phase6 calls this after native success. */
export function recordCameraFrame(receipt: RenderFrameReceipt, frame: CameraFrameState): void {
  submitted.set(receipt, frame.snapshot);
}

/** One configured camera per active canonical visual scene/session, one binding per camera.
 * No new graphics/scene/cache/loop. Existing instance projections remain legacy data;
 * bound draws instead use their localToScene in the camera's exact source plane. */
export function bindRenderCameraToVisualScene(camera: RenderCamera, scene: RenderVisualScene,
  resize: RenderViewportResizeReceipt, logical: ViewportMetrics2D): RenderCameraSceneBinding {
  const session = requireCameraScene(scene);
  checkVisualEdit(session);
  const context = getRenderCameraViewportSnapshot(camera, session, resize, logical);
  let snapshot: RenderCameraSceneBindingSnapshot = Object.freeze({ cameraId: context.camera.camera.id,
    sceneId: scene.getSnapshot().id, sessionId: context.viewport.sessionId, state: 'active', reason: null });
  let live: { camera: RenderCamera; scene: RenderVisualScene; session: typeof session;
    resize: RenderViewportResizeReceipt; logical: ViewportMetrics2D } | undefined =
    { camera, scene, session, resize, logical: context.mapping.metrics };
  let unobserve: (() => void) | undefined, unsubscribe: (() => void) | undefined, detach: (() => void) | undefined;
  const requireLive = () => {
    if (live === undefined) throw new TypeError('Camera scene binding is disposed');
    return live;
  };
  const end = (reason: NonNullable<RenderCameraSceneBindingSnapshot['reason']>) => {
    if (live === undefined) return snapshot;
    live = undefined;
    snapshot = Object.freeze({ ...snapshot, state: 'disposed', reason });
    const stopObserve = unobserve, stopEnd = unsubscribe, stopFrame = detach;
    unobserve = undefined; unsubscribe = undefined; detach = undefined;
    try { stopObserve?.(); } finally { try { stopEnd?.(); } finally { stopFrame?.(); } }
    return snapshot;
  };
  const captureFrame = (): CameraFrameState => {
    const current = requireLive();
    if (requireCameraScene(current.scene) !== current.session) throw new TypeError('Visual scene context changed');
    const captured = getRenderCameraViewportSnapshot(current.camera, current.session, current.resize, current.logical);
    const metrics = captured.mapping.metrics;
    const first = viewportPointToPlane2D(captured.mapping, { plane: metrics.plane, point: { x: 0, y: 0 } }).point;
    const last = viewportPointToPlane2D(captured.mapping, {
      plane: metrics.plane, point: { x: metrics.width, y: metrics.height } }).point;
    if (first.x === last.x || first.y === last.y) throw new RangeError('Camera native frustum collapsed');
    return Object.freeze({ snapshot: Object.freeze({ application: 'submitted', camera: captured.camera,
      sceneId: snapshot.sceneId, sessionId: snapshot.sessionId, resize: captured.resize, mapping: captured.mapping }),
    frustum: Object.freeze({ left: first.x, right: last.x, top: first.y, bottom: last.y }) });
  };
  try {
    captureFrame(); // Numeric/viewport admission before occupancy or redraw side effects.
    unobserve = observeCamera(camera, {
      beforeChange: () => checkVisualEdit(requireLive().session),
      changed: () => { invalidateRenderFrame(requireLive().session); },
      ended: () => { end('camera-disposed'); },
    });
    unsubscribe = onCameraSceneEnd(scene, () => { end('scene-ended'); });
    detach = attachCameraFrameSource(session, captureFrame);
  } catch (error) { end('binding-disposed'); throw error; }
  return Object.freeze({
    getSnapshot: () => snapshot,
    configure: (nextResize: RenderViewportResizeReceipt, nextLogical: ViewportMetrics2D) => {
      const current = requireLive();
      checkVisualEdit(current.session);
      const next = getRenderCameraViewportSnapshot(current.camera, current.session, nextResize, nextLogical);
      if (live !== current) throw new TypeError('Camera binding ended during context capture');
      checkVisualEdit(current.session);
      const previous = live;
      const candidate = { ...current, resize: nextResize, logical: next.mapping.metrics };
      live = candidate;
      try { captureFrame(); } catch (error) { if (live === candidate) live = previous; throw error; }
      invalidateRenderFrame(current.session);
      return snapshot;
    },
    dispose: () => {
      if (live !== undefined) checkVisualEdit(live.session);
      return end('binding-disposed');
    },
  });
}
