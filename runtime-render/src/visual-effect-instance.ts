import type { RenderFrameSession } from './frame-session.js';
import { requireTextureSession, getRenderTextureFailure } from './render-texture.js';
import { requireVisualEffectDefinition, getVisualEffectDefinitionFailure, type VisualEffectDefinition } from './visual-effect-definition.js';
import { createSpriteSequencePlayback, commandSpriteSequencePlayback, getSpriteSequencePlaybackSnapshot, advanceSpriteSequencePlayback,
  type SpriteSequencePlayback, type SpriteSequencePlaybackSnapshot } from './sprite-animation-playback.js';
import { addRenderVisualInstance, getRenderVisualInstance, listRenderVisualInstances,
  removeRenderVisualInstance, readVisualInstanceFrameState, onVisualInstanceEnd, setRenderVisualInstanceVisible,
  setRenderVisualInstanceTransform, getRenderVisualInstanceTransform, getRenderVisualInstanceVisibility,
  getRenderVisualInstanceFailure, type RenderVisualScene, type RenderVisualInstance } from './visual-scene.js';
import { captureVisualInstanceTransform, type RenderVisualInstanceTransformSnapshot } from './visual-instance-transform.js';
import { createOrthographicPlaneProjection, captureSourcePlanePoint2D, captureProjectionPoint2D,
  type PlaneProjectionPoint2D, type OrthographicPlaneProjection } from './plane-projection.js';
import type { VisualAnchor2D } from './visual-alignment.js';
import type { PlanarPoint2D } from './planar-affine.js';

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
  terminalPlayback: SpriteSequencePlaybackSnapshot;
  commanding: boolean;
  readonly mode: 'once' | 'repeat' | 'timed-repeat';
  readonly durationMs: number | null;
  completion: VisualEffectCompletionReceipt | null;
  lastWorldTransform: RenderVisualInstanceTransformSnapshot | null;
  attachment: EffectAttachment | undefined;
}
interface EffectAttachment {
  readonly target: RenderVisualInstance;
  readonly offset: PlanarPoint2D;
  readonly unsubscribe: () => void;
  ownVisible: boolean;
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
  const attachment = data.attachment;
  data.attachment = undefined;
  data.snapshot = Object.freeze({ ...data.snapshot, state: 'removed', reason });
  effects.delete(active.visual);
  let failed = false;
  const attempt = (operation: () => void): void => { try { operation(); } catch { failed = true; } };
  if (attachment) attempt(attachment.unsubscribe);
  attempt(active.unsubscribe);
  attempt(() => {
    data.terminalPlayback = getSpriteSequencePlaybackSnapshot(active.playback);
    data.terminalPlayback = commandSpriteSequencePlayback(active.playback, { type: 'dispose' });
  });
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
  return createEffect(session, scene, input, null);
}
function createEffect(session: RenderFrameSession, scene: RenderVisualScene,
  input: VisualEffectInstanceInput, durationMs: number | null): VisualEffectInstance {
  const value = record(input);
  let definition: VisualEffectDefinition;
  try { definition = requireVisualEffectDefinition(value.definition as VisualEffectDefinition); }
  catch (error) { if (getVisualEffectDefinitionFailure(error)) invalid('INVALID_DEFINITION'); throw error; }
  if (durationMs !== null && definition.clip.repeat !== 'repeat') lifetimeInvalid('INVALID_MODE');
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
      terminalPlayback: getSpriteSequencePlaybackSnapshot(playback), commanding: false,
      lastWorldTransform: null, attachment: undefined,
      mode: durationMs !== null ? 'timed-repeat' : definition.clip.repeat,
      durationMs: durationMs ?? (definition.clip.repeat === 'once' ? definition.clip.durationMs : null), completion: null,
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

export type VisualEffectPlaybackCommand =
  | { readonly type: 'play' | 'restart'; readonly clipId?: string }
  | { readonly type: 'pause' | 'resume' | 'stop' };
export interface VisualEffectPlaybackSnapshot {
  readonly instance: VisualEffectInstanceSnapshot;
  /** Frozen canonical observation only; not a mutable playback capability. */
  readonly playback: SpriteSequencePlaybackSnapshot;
  /** Transport activity, independent of resource readiness or actual pixels. */
  readonly active: boolean;
  /** Commands select declared addresses; this observation never attests loaded pixels. */
  readonly resourceReadiness: 'NOT_CHECKED';
}
export interface VisualEffectPlaybackFailure {
  readonly code: 'INVALID_COMMAND' | 'INVALID_TRANSITION' | 'CLIP_NOT_DECLARED'
    | 'FOREIGN_INSTANCE' | 'INSTANCE_REMOVED' | 'SESSION_ENDED' | 'TRANSITION_IN_PROGRESS';
}
const playbackFailures = new WeakMap<object, VisualEffectPlaybackFailure>();
function playbackInvalid(code: VisualEffectPlaybackFailure['code']): never {
  const error = new TypeError(`Visual effect playback: ${code}`);
  playbackFailures.set(error, Object.freeze({ code }));
  throw error;
}
export function getVisualEffectPlaybackFailure(error: unknown): VisualEffectPlaybackFailure | undefined {
  return typeof error === 'object' && error !== null ? playbackFailures.get(error) : undefined;
}
function playbackData(handle: VisualEffectInstance): Data {
  const data = instances.get(handle);
  if (!data) playbackInvalid('FOREIGN_INSTANCE');
  return data;
}
function livePlayback(data: Data): Active {
  getVisualEffectInstanceSnapshot(data.handle); // Canonical edit/session health admission.
  if (!data.active) playbackInvalid(data.snapshot.reason === 'session-ended' ? 'SESSION_ENDED' : 'INSTANCE_REMOVED');
  return data.active;
}
/** Safe historical readback remains available after removal and session termination. */
export function getVisualEffectPlaybackSnapshot(handle: VisualEffectInstance): VisualEffectPlaybackSnapshot {
  const data = playbackData(handle), instance = getVisualEffectInstanceSnapshot(handle);
  const playback = data.active ? getSpriteSequencePlaybackSnapshot(data.active.playback) : data.terminalPlayback;
  return Object.freeze({ instance, playback, resourceReadiness: 'NOT_CHECKED', active: instance.state === 'created'
    && playback.state !== 'stopped' && playback.state !== 'disposed' });
}
function capturePlaybackCommand(input: unknown): { type: string; clipId: unknown; explicitClip: boolean } {
  if (typeof input !== 'object' || input === null || Array.isArray(input)
    || (Object.getPrototypeOf(input) !== Object.prototype && Object.getPrototypeOf(input) !== null)) playbackInvalid('INVALID_COMMAND');
  const typeField = Object.getOwnPropertyDescriptor(input, 'type');
  if (!typeField?.enumerable || !('value' in typeField)) playbackInvalid('INVALID_COMMAND');
  const type: unknown = typeField.value;
  if (typeof type !== 'string' || !['play', 'pause', 'resume', 'stop', 'restart'].includes(type)) playbackInvalid('INVALID_COMMAND');
  const keys = Reflect.ownKeys(input), explicitClip = keys.includes('clipId');
  if (keys.length !== (explicitClip ? 2 : 1) || keys.some(key => key !== 'type' && key !== 'clipId')
    || (explicitClip && type !== 'play' && type !== 'restart')) playbackInvalid('INVALID_COMMAND');
  const clip = explicitClip ? Object.getOwnPropertyDescriptor(input, 'clipId') : undefined;
  if (explicitClip && (!clip?.enumerable || !('value' in clip))) playbackInvalid('INVALID_COMMAND');
  return { type, clipId: clip?.value, explicitClip };
}
/** Commands delegate to the owned Phase10 transport. No ticker, clock or advance. */
export function commandVisualEffectPlayback(handle: VisualEffectInstance,
  input: VisualEffectPlaybackCommand): VisualEffectPlaybackSnapshot {
  const data = playbackData(handle);
  if (data.commanding) playbackInvalid('TRANSITION_IN_PROGRESS');
  data.commanding = true;
  try {
    livePlayback(data);
    const command = capturePlaybackCommand(input);
    const active = livePlayback(data); // Reflection may remove the effect or end its session.
    const before = getSpriteSequencePlaybackSnapshot(active.playback), clipId = active.definition.clip.clip.clipId;
    if (command.explicitClip && command.clipId !== clipId) playbackInvalid('CLIP_NOT_DECLARED');
    if ((command.type === 'pause' || command.type === 'resume')
      && before.state !== 'playing' && before.state !== 'paused') playbackInvalid('INVALID_TRANSITION');
    // Validate everything before native visibility. Native failure must not advance transport.
    // Pause/resume preserve independently host-selected visibility; play/restart activate.
    if (command.type === 'play' || command.type === 'restart' || command.type === 'stop') {
      const ownVisible = command.type !== 'stop';
      const visible = ownVisible && (!data.attachment
        || getRenderVisualInstanceVisibility(active.scene, data.attachment.target).effectiveVisible);
      sceneOperation(() => setRenderVisualInstanceVisible(active.scene, active.visual, visible));
      livePlayback(data);
      if (data.attachment) data.attachment.ownVisible = ownVisible;
    }
    if (command.type === 'restart') {
      commandSpriteSequencePlayback(active.playback, { type: 'stop' });
      commandSpriteSequencePlayback(active.playback, { type: 'play', clipId });
    } else if (command.type === 'play') {
      commandSpriteSequencePlayback(active.playback, { type: 'play', clipId });
    } else {
      commandSpriteSequencePlayback(active.playback, { type: command.type as 'pause' | 'resume' | 'stop' });
    }
    return getVisualEffectPlaybackSnapshot(handle);
  } finally { data.commanding = false; }
}

/** Finite presentation lifetime applies only to an explicitly repeating definition. */
export interface VisualEffectTimedInstanceInput extends VisualEffectInstanceInput {
  readonly durationMs: number;
}
export interface VisualEffectCompletionReceipt {
  readonly instanceId: symbol;
  readonly reason: 'clip-completed' | 'duration-elapsed';
  readonly elapsedMs: number;
  /** Final address/time before owned transport disposal, never a live capability. */
  readonly playback: SpriteSequencePlaybackSnapshot;
}
export interface VisualEffectLifetimeSnapshot {
  readonly instance: VisualEffectInstanceSnapshot;
  readonly mode: 'once' | 'repeat' | 'timed-repeat';
  readonly state: 'stopped' | 'playing' | 'paused' | 'completed' | 'removed';
  readonly durationMs: number | null;
  readonly elapsedMs: number;
  readonly playback: SpriteSequencePlaybackSnapshot;
  readonly completion: VisualEffectCompletionReceipt | null;
}
export interface VisualEffectAdvanceResult {
  readonly snapshot: VisualEffectLifetimeSnapshot;
  readonly frameChanged: boolean;
  /** True only on the call that first retired this effect through completion. */
  readonly completedNow: boolean;
}
export interface VisualEffectLifetimeFailure {
  readonly code: 'INVALID_DURATION' | 'INVALID_MODE' | 'INVALID_DELTA';
}
const lifetimeFailures = new WeakMap<object, VisualEffectLifetimeFailure>();
function lifetimeInvalid(code: VisualEffectLifetimeFailure['code']): never {
  const error = new TypeError(`Visual effect lifetime: ${code}`);
  lifetimeFailures.set(error, Object.freeze({ code }));
  throw error;
}
export function getVisualEffectLifetimeFailure(error: unknown): VisualEffectLifetimeFailure | undefined {
  return typeof error === 'object' && error !== null ? lifetimeFailures.get(error) : undefined;
}
export function createVisualEffectTimedInstance(session: RenderFrameSession, scene: RenderVisualScene,
  input: VisualEffectTimedInstanceInput): VisualEffectInstance {
  // Capture all host data before any effect allocation; common creation rechecks scope.
  if (typeof input !== 'object' || input === null || Array.isArray(input)
    || (Object.getPrototypeOf(input) !== Object.prototype && Object.getPrototypeOf(input) !== null)
    || Reflect.ownKeys(input).length !== 3) invalid('INVALID_STRUCTURE');
  const fields: Record<string, unknown> = {};
  for (const key of ['definition', 'visualInstanceId', 'durationMs']) {
    const field = Object.getOwnPropertyDescriptor(input, key);
    if (!field?.enumerable || !('value' in field)) invalid('INVALID_STRUCTURE');
    fields[key] = field.value;
  }
  const durationMs = fields.durationMs;
  if (typeof durationMs !== 'number' || !Number.isFinite(durationMs)
    || durationMs < 0.000001 || durationMs > Number.MAX_SAFE_INTEGER) lifetimeInvalid('INVALID_DURATION');
  return createEffect(session, scene, { definition: fields.definition as VisualEffectDefinition,
    visualInstanceId: fields.visualInstanceId as string }, durationMs);
}
/** Completion history is separate from the backward-compatible VE03 membership state. */
export function getVisualEffectLifetimeSnapshot(handle: VisualEffectInstance): VisualEffectLifetimeSnapshot {
  const data = playbackData(handle), current = getVisualEffectPlaybackSnapshot(handle);
  const playback = data.completion?.playback ?? current.playback;
  return Object.freeze({ instance: current.instance, mode: data.mode, durationMs: data.durationMs,
    state: data.completion ? 'completed' : current.instance.state === 'removed' ? 'removed'
      : playback.state as 'stopped' | 'playing' | 'paused',
    elapsedMs: playback.elapsedMs, playback, completion: data.completion });
}
/** One bounded canonical advance, no per-frame loop or independent VFX time accumulator. */
export function advanceVisualEffectInstance(handle: VisualEffectInstance, deltaMs: number): VisualEffectAdvanceResult {
  const data = playbackData(handle);
  if (data.commanding) playbackInvalid('TRANSITION_IN_PROGRESS');
  data.commanding = true;
  try {
    if (typeof deltaMs !== 'number' || !Number.isFinite(deltaMs) || deltaMs < 0
      || deltaMs > Number.MAX_SAFE_INTEGER) lifetimeInvalid('INVALID_DELTA');
    if (data.completion) return Object.freeze({ snapshot: getVisualEffectLifetimeSnapshot(handle), frameChanged: false, completedNow: false });
    const active = livePlayback(data), before = getSpriteSequencePlaybackSnapshot(active.playback);
    // Validate caller budget even while paused/stopped, then honor canonical no-op semantics.
    const bound = data.durationMs;
    const admitted = before.state === 'playing' && bound !== null
      ? Math.min(deltaMs, bound - before.elapsedMs) : deltaMs;
    const advanced = advanceSpriteSequencePlayback(active.playback, admitted);
    const after = advanced.snapshot;
    const complete = after.state === 'playing' && data.mode === 'timed-repeat' && after.elapsedMs >= bound!
      || data.mode === 'once' && after.completed;
    if (complete) {
      data.completion = Object.freeze({ instanceId: handle.id,
        reason: data.mode === 'once' ? 'clip-completed' : 'duration-elapsed', elapsedMs: after.elapsedMs, playback: after });
      end(data, 'removed', true); // One canonical membership/playback cleanup, terminal before native release.
      if (data.snapshot.cleanupFailed) invalid('CLEANUP_FAILED', true);
    }
    return Object.freeze({ snapshot: getVisualEffectLifetimeSnapshot(handle), frameChanged: advanced.frameChanged, completedNow: complete });
  } finally { data.commanding = false; }
}

/** Translation-only placement; all anchor coordinates/offsets use the explicit source plane unit/axes. */
export interface VisualEffectWorldPlacementInput {
  readonly placement: PlaneProjectionPoint2D;
  readonly anchor: VisualAnchor2D;
  /** Existing Phase8 legacy projection context; camera binding remains independently Phase9-owned. */
  readonly projection: OrthographicPlaneProjection;
}
export interface VisualEffectWorldPlacementSnapshot {
  readonly instance: VisualEffectInstanceSnapshot;
  /** Live canonical Phase8 value, or last observed/committed value after removal. */
  readonly transform: RenderVisualInstanceTransformSnapshot | null;
}
/** Detached history does not keep a scene/session/resource capability alive. */
export function getVisualEffectWorldPlacementSnapshot(handle: VisualEffectInstance): VisualEffectWorldPlacementSnapshot {
  const data = playbackData(handle), instance = getVisualEffectInstanceSnapshot(handle);
  if (data.active) data.lastWorldTransform = getRenderVisualInstanceTransform(data.active.scene, data.active.visual);
  return Object.freeze({ instance, transform: data.lastWorldTransform });
}
/** Capture/validate before a single Phase8 mutation; never changes time, identity or resource ownership. */
export function setVisualEffectWorldPlacement(handle: VisualEffectInstance,
  input: VisualEffectWorldPlacementInput): VisualEffectWorldPlacementSnapshot {
  const data = playbackData(handle);
  if (data.commanding) playbackInvalid('TRANSITION_IN_PROGRESS');
  data.commanding = true;
  try {
    const active = livePlayback(data), before = readVisualInstanceFrameState(active.scene, active.visual);
    if (data.attachment) throw new TypeError('Detach effect before setting world placement');
    if (typeof input !== 'object' || input === null || Array.isArray(input)
      || (Object.getPrototypeOf(input) !== Object.prototype && Object.getPrototypeOf(input) !== null)
      || Reflect.ownKeys(input).length !== 3) throw new TypeError('Effect world placement requires placement, anchor and projection');
    const fields: Record<string, unknown> = {};
    for (const key of ['placement', 'anchor', 'projection']) {
      const field = Object.getOwnPropertyDescriptor(input, key);
      if (!field?.enumerable || !('value' in field)) throw new TypeError('Effect world placement requires data fields');
      fields[key] = field.value;
    }
    const projection = createOrthographicPlaneProjection(fields.projection as OrthographicPlaneProjection);
    if (projection.source.projectId !== data.snapshot.projectId) throw new TypeError('Effect world placement project mismatch');
    const candidate = captureVisualInstanceTransform({ placement: fields.placement as PlaneProjectionPoint2D,
      anchor: fields.anchor as VisualAnchor2D, projection,
      local: { translation: { x: 0, y: 0 }, rotationRadians: 0, scale: { x: 1, y: 1 } },
      orientation: { axes: projection.source.axes, zeroAxis: 'positive-x', positiveRotation: 'toward-positive-y', angleRadians: 0 } });
    // A move cannot silently reinterpret an already placed instance's numeric world coordinates.
    if (before.transform) captureSourcePlanePoint2D(before.transform.placement.plane, candidate.placement);
    livePlayback(data); // Host reflection may remove membership or terminate the session.
    const current = readVisualInstanceFrameState(active.scene, active.visual);
    if (current.revision !== before.revision) throw new TypeError('Effect world placement changed during capture');
    data.lastWorldTransform = setRenderVisualInstanceTransform(active.scene, active.visual, {
      placement: candidate.placement, anchor: candidate.anchor, local: candidate.local,
      orientation: candidate.orientation, projection: candidate.projection });
    return getVisualEffectWorldPlacementSnapshot(handle);
  } finally { data.commanding = false; }
}

export interface VisualEffectAttachmentInput {
  readonly target: RenderVisualInstance;
  /** Replaces the effect anchor localOffset, in the existing effect/target plane unit/axes. */
  readonly localOffset: PlanarPoint2D;
  readonly inheritance: 'translation-only';
}
export interface VisualEffectAttachmentSnapshot {
  readonly instance: VisualEffectInstanceSnapshot;
  readonly mode: 'world' | 'attached' | 'removed';
  readonly target: RenderVisualInstance | null;
  readonly localOffset: PlanarPoint2D | null;
  readonly inheritance: 'translation-only' | null;
  readonly visibility: 'inherit-effective' | null;
  readonly transform: RenderVisualInstanceTransformSnapshot | null;
}
export function getVisualEffectAttachmentSnapshot(handle: VisualEffectInstance): VisualEffectAttachmentSnapshot {
  const data = playbackData(handle), placement = getVisualEffectWorldPlacementSnapshot(handle), attachment = data.attachment;
  return Object.freeze({ ...placement, mode: placement.instance.state === 'removed' ? 'removed' : attachment ? 'attached' : 'world',
    target: attachment?.target ?? null, localOffset: attachment?.offset ?? null,
    inheritance: attachment ? 'translation-only' : null, visibility: attachment ? 'inherit-effective' : null });
}
function attachmentCandidate(active: Active, target: RenderVisualInstance, offset: PlanarPoint2D) {
  // Canonical exact-handle admission enforces live same-scene/session before any mutation.
  const targetState = readVisualInstanceFrameState(active.scene, target);
  if (target === active.visual || effects.has(target)) throw new TypeError('Effect self/chain attachment is unsupported');
  const current = readVisualInstanceFrameState(active.scene, active.visual).transform;
  const targetTransform = targetState.transform;
  if (!current || !targetTransform) throw new TypeError('Attachment requires explicit effect and target transforms');
  captureSourcePlanePoint2D(current.placement.plane, targetTransform.placement);
  if (current.local.translation.x !== 0 || current.local.translation.y !== 0 || current.local.rotationRadians !== 0
    || current.local.scale.x !== 1 || current.local.scale.y !== 1) throw new TypeError('Effect attachment requires identity local TRS');
  const input = { placement: { plane: current.placement.plane, point: targetTransform.attachment },
    anchor: { ...current.anchor, localOffset: offset }, local: current.local,
    orientation: current.orientation, projection: current.projection };
  // All Phase4 arithmetic/overflow admission completes before Phase8 writes.
  captureVisualInstanceTransform(input);
  return { input, targetVisible: getRenderVisualInstanceVisibility(active.scene, target).effectiveVisible, current };
}
function attachmentTargetEnded(data: Data): void {
  const active = data.active;
  if (!active) return;
  const scene = active.scene.getSnapshot();
  if (scene.state === 'disposed') { end(data, scene.reason, false); return; }
  // Phase8 clear drains membership before broadcasting. Never attempt a second
  // remove while that owner already holds the effect's resource cleanup receipt.
  const member = getRenderVisualInstance(active.scene, active.visual.visualInstanceId);
  end(data, member === active.visual ? 'removed' : 'membership-ended', member === active.visual);
}
/** Attach only after explicit VE06 world placement; replacing a valid target is transactional for input rejection. */
export function attachVisualEffectInstance(handle: VisualEffectInstance,
  input: VisualEffectAttachmentInput): VisualEffectAttachmentSnapshot {
  const data = playbackData(handle);
  if (data.commanding) playbackInvalid('TRANSITION_IN_PROGRESS');
  data.commanding = true;
  try {
    const active = livePlayback(data), before = readVisualInstanceFrameState(active.scene, active.visual);
    if (typeof input !== 'object' || input === null || Array.isArray(input)
      || (Object.getPrototypeOf(input) !== Object.prototype && Object.getPrototypeOf(input) !== null)
      || Reflect.ownKeys(input).length !== 3) throw new TypeError('Attachment requires target, localOffset and inheritance');
    const fields: Record<string, unknown> = {};
    for (const key of ['target', 'localOffset', 'inheritance']) {
      const field = Object.getOwnPropertyDescriptor(input, key);
      if (!field?.enumerable || !('value' in field)) throw new TypeError('Attachment requires data fields');
      fields[key] = field.value;
    }
    if (fields.inheritance !== 'translation-only') throw new TypeError('Unsupported effect attachment inheritance');
    const target = fields.target as RenderVisualInstance, offset = captureProjectionPoint2D(fields.localOffset as PlanarPoint2D);
    const candidate = attachmentCandidate(active, target, offset);
    livePlayback(data);
    if (readVisualInstanceFrameState(active.scene, active.visual).revision !== before.revision) {
      throw new TypeError('Scene changed during attachment capture');
    }
    const ownVisible = data.attachment?.ownVisible ?? getRenderVisualInstanceVisibility(active.scene, active.visual).visible;
    data.lastWorldTransform = setRenderVisualInstanceTransform(active.scene, active.visual, candidate.input);
    setRenderVisualInstanceVisible(active.scene, active.visual, ownVisible && candidate.targetVisible);
    const unsubscribe = onVisualInstanceEnd(active.scene, target, () => { attachmentTargetEnded(data); });
    data.attachment?.unsubscribe();
    data.attachment = { target, offset, ownVisible, unsubscribe };
    return getVisualEffectAttachmentSnapshot(handle);
  } finally { data.commanding = false; }
}
function syncAttachment(data: Data): void {
  const active = livePlayback(data), attachment = data.attachment;
  if (!attachment) return;
  const candidate = attachmentCandidate(active, attachment.target, attachment.offset);
  const before = candidate.current;
  // Target rotation/scale are not inherited; only its applied attachment point is followed.
  if (before.placement.point.x !== candidate.input.placement.point.x || before.placement.point.y !== candidate.input.placement.point.y
    || before.anchor.localOffset.x !== attachment.offset.x || before.anchor.localOffset.y !== attachment.offset.y) {
    data.lastWorldTransform = setRenderVisualInstanceTransform(active.scene, active.visual, candidate.input);
  }
  setRenderVisualInstanceVisible(active.scene, active.visual, attachment.ownVisible && candidate.targetVisible);
}
/** Host calls after target/visibility edits and before submission, like Phase10 binding sync; never a ticker. */
export function syncVisualEffectAttachment(handle: VisualEffectInstance): VisualEffectAttachmentSnapshot {
  const data = playbackData(handle);
  if (data.commanding) playbackInvalid('TRANSITION_IN_PROGRESS');
  data.commanding = true;
  try { syncAttachment(data); return getVisualEffectAttachmentSnapshot(handle); }
  finally { data.commanding = false; }
}
/** Sync first, freeze current effective world placement, restore independent effect visibility, then unlink. */
export function detachVisualEffectInstance(handle: VisualEffectInstance): VisualEffectAttachmentSnapshot {
  const data = playbackData(handle);
  if (data.commanding) playbackInvalid('TRANSITION_IN_PROGRESS');
  data.commanding = true;
  try {
    syncAttachment(data);
    const active = livePlayback(data), attachment = data.attachment;
    if (attachment) {
      setRenderVisualInstanceVisible(active.scene, active.visual, attachment.ownVisible);
      attachment.unsubscribe();
      data.attachment = undefined;
    }
    return getVisualEffectAttachmentSnapshot(handle);
  } finally { data.commanding = false; }
}
