import type { RenderFrameSession } from './frame-session.js';
import { requireTextureSession, getRenderTextureFailure } from './render-texture.js';
import { requireVisualEffectDefinition, getVisualEffectDefinitionFailure, type VisualEffectDefinition } from './visual-effect-definition.js';
import { createSpriteSequencePlayback, commandSpriteSequencePlayback, type SpriteSequencePlayback } from './sprite-animation-playback.js';
import { addRenderVisualInstance, getRenderVisualInstance, listRenderVisualInstances,
  removeRenderVisualInstance, readVisualInstanceFrameState, onVisualInstanceEnd,
  getRenderVisualInstanceFailure, type RenderVisualScene, type RenderVisualInstance } from './visual-scene.js';

declare const effectInstanceBrand: unique symbol;
/** Ephemeral issued identity, unrelated to authored/effect/drawable keys. */
export interface VisualEffectInstance {
  readonly [effectInstanceBrand]: true;
  readonly id: symbol;
}
export interface VisualEffectInstanceInput {
  readonly definition: VisualEffectDefinition;
  /** Explicit scene-local Phase8 membership key; never the effect's opaque ID. */
  readonly visualInstanceId: string;
}
export interface VisualEffectInstanceSnapshot {
  readonly id: symbol;
  readonly effectId: string;
  readonly projectId: string;
  readonly sceneId: symbol;
  readonly sessionId: symbol;
  readonly visualInstanceId: string;
  readonly state: 'created' | 'removed';
  readonly reason: null | 'removed' | 'membership-ended' | 'scene-disposed' | 'session-ended';
  /** Sticky logical cleanup uncertainty, never a native memory receipt. */
  readonly cleanupFailed: boolean;
}
export interface VisualEffectInstanceFailure {
  readonly code: 'INVALID_STRUCTURE' | 'INVALID_DEFINITION' | 'INVALID_ID' | 'DUPLICATE_ID'
    | 'FOREIGN_SCENE' | 'FOREIGN_SESSION' | 'FOREIGN_INSTANCE' | 'CONTEXT_MISMATCH' | 'SCENE_DISPOSED'
    | 'SESSION_UNAVAILABLE' | 'CLEANUP_FAILED';
  readonly cleanupFailed: boolean;
}
const failures = new WeakMap<object, VisualEffectInstanceFailure>();
function invalid(code: VisualEffectInstanceFailure['code'], cleanupFailed = false): never {
  const error = new TypeError(`Visual effect instance: ${code}`);
  failures.set(error, Object.freeze({ code, cleanupFailed }));
  throw error;
}
export function getVisualEffectInstanceFailure(error: unknown): VisualEffectInstanceFailure | undefined {
  return typeof error === 'object' && error !== null ? failures.get(error) : undefined;
}
interface Active {
  readonly scene: RenderVisualScene;
  readonly visual: RenderVisualInstance;
  readonly definition: VisualEffectDefinition;
  readonly playback: SpriteSequencePlayback;
  unsubscribe: () => void;
}
interface Data {
  readonly owner: WeakRef<RenderVisualScene>;
  readonly handle: VisualEffectInstance;
  snapshot: VisualEffectInstanceSnapshot;
  active: Active | undefined;
}
// Issuance/correlation only. Phase8 alone stores/enumerates live scene membership.
const instances = new WeakMap<VisualEffectInstance, Data>();
const effects = new WeakMap<RenderVisualInstance, Data>();

function record(input: unknown): Record<string, unknown> {
  if (typeof input !== 'object' || input === null || Array.isArray(input)
    || (Object.getPrototypeOf(input) !== Object.prototype && Object.getPrototypeOf(input) !== null)
    || Reflect.ownKeys(input).length !== 2) invalid('INVALID_STRUCTURE');
  const value: Record<string, unknown> = {};
  for (const key of ['definition', 'visualInstanceId']) {
    const field = Object.getOwnPropertyDescriptor(input, key);
    if (!field?.enumerable || !('value' in field)) invalid('INVALID_STRUCTURE');
    value[key] = field.value;
  }
  return value;
}
function issued(handle: VisualEffectInstance, scene?: RenderVisualScene): Data {
  const data = instances.get(handle);
  if (!data) invalid('FOREIGN_INSTANCE');
  if (scene !== undefined && data.owner.deref() !== scene) invalid('FOREIGN_SCENE');
  return data;
}
function sceneOperation<T>(operation: () => T): T {
  try { return operation(); }
  catch (error) {
    const code = getRenderVisualInstanceFailure(error)?.code;
    if (code === 'INVALID_ID' || code === 'DUPLICATE_ID' || code === 'FOREIGN_SCENE'
      || code === 'SCENE_DISPOSED' || code === 'SESSION_UNAVAILABLE') invalid(code);
    throw error;
  }
}

/** Terminal before cleanup; never throws into Phase8's owner-local end broadcast. */
function end(data: Data, reason: NonNullable<VisualEffectInstanceSnapshot['reason']>, removeMembership: boolean): boolean {
  const active = data.active;
  if (!active) return false;
  data.active = undefined;
  data.snapshot = Object.freeze({ ...data.snapshot, state: 'removed', reason });
  effects.delete(active.visual);
  let failed = false;
  const attempt = (operation: () => void): void => { try { operation(); } catch { failed = true; } };
  attempt(active.unsubscribe);
  attempt(() => { commandSpriteSequencePlayback(active.playback, { type: 'dispose' }); });
  if (removeMembership) attempt(() => { removeRenderVisualInstance(active.scene, active.visual); });
  if (failed) data.snapshot = Object.freeze({ ...data.snapshot, cleanupFailed: true });
  return true;
}
function membershipEnded(data: Data): void {
  const active = data.active;
  if (!active) return;
  const scene = active.scene.getSnapshot();
  end(data, scene.state === 'disposed' ? scene.reason : 'membership-ended', false);
}

/** Own a stopped CPU playback and an empty Phase8 metadata membership; never draws. */
export function createVisualEffectInstance(session: RenderFrameSession, scene: RenderVisualScene,
  input: VisualEffectInstanceInput): VisualEffectInstance {
  const value = record(input);
  let definition: VisualEffectDefinition;
  try { definition = requireVisualEffectDefinition(value.definition as VisualEffectDefinition); }
  catch (error) { if (getVisualEffectDefinitionFailure(error)) invalid('INVALID_DEFINITION'); throw error; }
  // Canonical dispatch first; no method invocation on arbitrary host scene objects.
  sceneOperation(() => listRenderVisualInstances(scene));
  const scope = scene.getSnapshot();
  let sessionId: symbol;
  try { sessionId = requireTextureSession(session); }
  catch (error) {
    if (getRenderTextureFailure(error)?.code === 'SESSION_UNAVAILABLE') invalid('SESSION_UNAVAILABLE');
    if (error instanceof TypeError) invalid('FOREIGN_SESSION');
    throw error;
  }
  if (scope.sessionId !== sessionId) invalid('CONTEXT_MISMATCH');
  const key = value.visualInstanceId;
  if (typeof key !== 'string' || key.length < 1 || key.length > 512 || /[\s\u0000-\u001f\u007f]/u.test(key)) invalid('INVALID_ID');
  if (sceneOperation(() => getRenderVisualInstance(scene, key))) invalid('DUPLICATE_ID');
  const playback = createSpriteSequencePlayback({ clips: [definition.clip], clipId: definition.clip.clip.clipId });
  let visual: RenderVisualInstance | undefined, data: Data | undefined;
  try {
    visual = sceneOperation(() => addRenderVisualInstance(scene, { visualInstanceId: key }));
    const handle = Object.freeze({ id: Symbol('visual-effect-instance') }) as VisualEffectInstance;
    data = { handle, owner: new WeakRef(scene), active: { scene, visual, definition, playback, unsubscribe: () => {} },
      snapshot: Object.freeze({ id: handle.id, effectId: definition.effectId,
        projectId: definition.resource.identity.projectId, sceneId: visual.sceneId, sessionId,
        visualInstanceId: visual.visualInstanceId, state: 'created', reason: null, cleanupFailed: false }) };
    const captured = data;
    data.active!.unsubscribe = onVisualInstanceEnd(scene, visual, () => membershipEnded(captured));
    instances.set(handle, data); effects.set(visual, data);
    return handle;
  } catch (error) {
    let cleanupFailed = false;
    if (data) { end(data, 'removed', true); cleanupFailed = data.snapshot.cleanupFailed; }
    else {
      try { commandSpriteSequencePlayback(playback, { type: 'dispose' }); } catch { cleanupFailed = true; }
      if (visual) try { removeRenderVisualInstance(scene, visual); } catch { cleanupFailed = true; }
    }
    const failure = typeof error === 'object' && error !== null ? failures.get(error) : undefined;
    if (failure && cleanupFailed) failures.set(error as object, Object.freeze({ ...failure, cleanupFailed: true }));
    throw error;
  }
}

/** Historical frozen data survives removal; active reads revalidate canonical membership. */
export function getVisualEffectInstanceSnapshot(handle: VisualEffectInstance): VisualEffectInstanceSnapshot {
  const data = issued(handle), active = data.active;
  if (active) {
    try { sceneOperation(() => readVisualInstanceFrameState(active.scene, active.visual)); }
    catch (error) {
      if (data.active || getVisualEffectInstanceFailure(error)?.code !== 'SESSION_UNAVAILABLE') throw error;
    }
  }
  return data.snapshot;
}
/** Enumerate Phase8 membership, never a parallel VFX scene store. Terminal scene rejects. */
export function listVisualEffectInstances(scene: RenderVisualScene): readonly VisualEffectInstance[] {
  return Object.freeze(sceneOperation(() => listRenderVisualInstances(scene))
    .flatMap(visual => { const data = effects.get(visual); return data?.active ? [data.handle] : []; }));
}
/** Opaque live ID lookup; removed IDs do not alias re-added visual membership keys. */
export function getVisualEffectInstance(scene: RenderVisualScene, id: symbol): VisualEffectInstance | undefined {
  if (typeof id !== 'symbol') invalid('INVALID_ID');
  return listVisualEffectInstances(scene).find(handle => handle.id === id);
}
/** Exact scope required even on repeated remove. Never disposes borrowed scene/session. */
export function removeVisualEffectInstance(scene: RenderVisualScene, handle: VisualEffectInstance): boolean {
  const data = issued(handle, scene), active = data.active;
  if (!active) return false;
  try { sceneOperation(() => readVisualInstanceFrameState(scene, active.visual)); }
  catch (error) {
    if (data.active || getVisualEffectInstanceFailure(error)?.code !== 'SESSION_UNAVAILABLE') throw error;
  }
  const removed = end(data, 'removed', true);
  if (data.snapshot.cleanupFailed) invalid('CLEANUP_FAILED', true);
  return removed;
}
