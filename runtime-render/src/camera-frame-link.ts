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
  try { for (const end of scope.listeners) end(); }
  finally { scope.listeners.clear(); }
}
