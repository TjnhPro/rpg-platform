import type { RenderFrameSession } from './frame-session.js';
import type { RenderVisualScene } from './visual-scene.js';
import type { RenderCameraFrameSnapshot } from './camera-scene.js';

/** Private dispatch only; no renderer, scene manager or public registry. */
export interface CameraFrameState {
  readonly snapshot: RenderCameraFrameSnapshot;
  readonly frustum: { readonly left: number; readonly right: number; readonly top: number; readonly bottom: number };
}
type Source = () => CameraFrameState;
const sessions = new WeakMap<RenderFrameSession, (source: Source | undefined) => void>();
const scenes = new WeakMap<RenderVisualScene, {
  readonly session: RenderFrameSession;
  readonly listeners: Set<() => void>;
}>();
export function registerCameraFrameSession(session: RenderFrameSession, set: (source: Source | undefined) => void): void {
  sessions.set(session, set);
}
/** Terminal unlink; existing detach closures can still finish their own cleanup. */
export function endCameraFrameSession(session: RenderFrameSession): void {
  sessions.delete(session);
}
export function attachCameraFrameSource(session: RenderFrameSession, read: Source): () => void {
  const set = sessions.get(session);
  if (set === undefined) throw new TypeError('Expected canonical camera frame session');
  set(read);
  return () => set(undefined);
}
export function registerCameraScene(scene: RenderVisualScene, session: RenderFrameSession): void {
  scenes.set(scene, { session, listeners: new Set() });
}
export function requireCameraScene(scene: RenderVisualScene): RenderFrameSession {
  const scope = scenes.get(scene);
  if (scope === undefined) throw new TypeError('Expected an active canonical visual scene');
  return scope.session;
}
export function onCameraSceneEnd(scene: RenderVisualScene, end: () => void): () => void {
  const scope = scenes.get(scene);
  if (scope === undefined) throw new TypeError('Expected an active canonical visual scene');
  scope.listeners.add(end);
  return () => scope.listeners.delete(end);
}
export function endCameraScene(scene: RenderVisualScene): void {
  const scope = scenes.get(scene);
  scenes.delete(scene);
  if (scope === undefined) return;
  const listeners = [...scope.listeners];
  scope.listeners.clear(); // Unsubscribe before callbacks, including reentrant teardown.
  let failure: { readonly error: unknown } | undefined;
  for (const end of listeners) {
    try { end(); } catch (error) { failure ??= { error }; }
  }
  if (failure !== undefined) throw failure.error;
}
