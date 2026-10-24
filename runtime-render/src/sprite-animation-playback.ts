import { createEightWaySpriteClip, type EightWaySpriteClip, type SpriteDirectionIndex } from './sprite-eight-way.js';
import { sampleSpriteAnimationTiming } from './sprite-animation-timing.js';
import type { VisualFrameReference } from './atlas-frame.js';

export type SpriteAnimationPlaybackState = 'stopped' | 'playing' | 'paused' | 'completed' | 'disposed';

/** Ephemeral capability; a copied ID or structural lookalike is not an issued handle. */
export interface SpriteAnimationPlayback { readonly id: symbol }

export interface SpriteAnimationPlaybackInput {
  readonly clips: readonly EightWaySpriteClip[];
  readonly clipId: string;
  readonly directionIndex: SpriteDirectionIndex;
}

export interface SpriteAnimationPlaybackSnapshot {
  readonly id: symbol;
  readonly projectId: string;
  readonly clipId: string;
  readonly directionIndex: SpriteDirectionIndex;
  readonly state: SpriteAnimationPlaybackState;
  /** Original logical time, never replaced by the target direction's remainder. */
  readonly elapsedMs: number;
  readonly sampledElapsedMs: number;
  readonly frameIndex: number;
  /** Address only: neither atlas/revision resolution nor texture ownership. */
  readonly frame: VisualFrameReference;
  readonly completed: boolean;
}

export type SpriteAnimationPlaybackCommand =
  | { readonly type: 'play'; readonly clipId: string }
  | { readonly type: 'selectClip'; readonly clipId: string }
  | { readonly type: 'setDirection'; readonly directionIndex: SpriteDirectionIndex }
  | { readonly type: 'pause' | 'resume' | 'stop' | 'dispose' };

/** Per-call change observation, never a queued event or automatic redraw. */
export interface SpriteAnimationAdvanceResult {
  readonly snapshot: SpriteAnimationPlaybackSnapshot;
  /** Selected project/resource/subresource address differs from before this call. */
  readonly frameChanged: boolean;
  /** This advance first entered target-local once completion. */
  readonly completedNow: boolean;
}

type Transition = SpriteAnimationPlaybackCommand | { readonly type: 'advance'; readonly deltaMs: number };

type Transport = 'stopped' | 'playing' | 'paused';
interface PlaybackData {
  clips: Map<string, EightWaySpriteClip> | null;
  snapshot: SpriteAnimationPlaybackSnapshot;
  transport: Transport;
  busy: boolean;
}

// Weak issued-capability lookup only; no ID lookup, active list, scene or global content registry.
const playbacks = new WeakMap<SpriteAnimationPlayback, PlaybackData>();

function record(input: unknown, fields: readonly string[]): Record<string, unknown> {
  if (typeof input !== 'object' || input === null || Array.isArray(input)
    || (Object.getPrototypeOf(input) !== Object.prototype && Object.getPrototypeOf(input) !== null)
    || Reflect.ownKeys(input).length !== fields.length) throw new TypeError('Playback requires a closed plain record');
  const output: Record<string, unknown> = {};
  for (const field of fields) {
    const item = Object.getOwnPropertyDescriptor(input, field);
    if (!item?.enumerable || !('value' in item)) throw new TypeError('Playback requires own data fields');
    output[field] = item.value;
  }
  return output;
}

function direction(input: unknown): SpriteDirectionIndex {
  if (typeof input !== 'number' || !Number.isInteger(input) || input < 0 || input > 7) {
    throw new TypeError('Playback direction must be an integer within 0..7');
  }
  return (input === 0 ? 0 : input) as SpriteDirectionIndex;
}

function issued(handle: SpriteAnimationPlayback): PlaybackData {
  const data = playbacks.get(handle);
  if (!data) throw new TypeError('Playback handle was not issued by this Render module');
  if (data.busy) throw new TypeError('Playback transition is already in progress');
  return data;
}

function clipFor(clips: Map<string, EightWaySpriteClip>, key: unknown): EightWaySpriteClip {
  const clip = typeof key === 'string' ? clips.get(key) : undefined;
  if (!clip) throw new TypeError('Playback requires a declared clip');
  return clip;
}

function snapshot(id: symbol, clip: EightWaySpriteClip, index: SpriteDirectionIndex,
  elapsedMs: number, transport: Transport): SpriteAnimationPlaybackSnapshot {
  const frames = clip.directions[index].frames;
  const sample = sampleSpriteAnimationTiming(clip.timing, frames.length, clip.repeat, elapsedMs);
  return Object.freeze({ id, projectId: frames[0]!.projectId, clipId: clip.clipId,
    directionIndex: index, state: sample.completed ? 'completed' : transport,
    elapsedMs, sampledElapsedMs: sample.elapsedMs, frameIndex: sample.frameIndex,
    frame: frames[sample.frameIndex]!, completed: sample.completed });
}

/** Starts stopped at zero. No elapsed import, seek, timer or delta advance at SA05. */
export function createSpriteAnimationPlayback(input: SpriteAnimationPlaybackInput): SpriteAnimationPlayback {
  const value = record(input, ['clips', 'clipId', 'directionIndex']);
  const index = direction(value.directionIndex), entries = value.clips;
  if (!Array.isArray(entries) || Object.getPrototypeOf(entries) !== Array.prototype
    || entries.length < 1 || entries.length > 256 || Reflect.ownKeys(entries).length !== entries.length + 1) {
    throw new TypeError('Playback requires a dense array of 1..256 clips');
  }
  const clips = new Map<string, EightWaySpriteClip>();
  let projectId: string | undefined, totalFrames = 0;
  for (let i = 0; i < entries.length; i++) {
    const item = Object.getOwnPropertyDescriptor(entries, String(i));
    if (!item?.enumerable || !('value' in item)) throw new TypeError('Playback clips require own data entries');
    const clip = createEightWaySpriteClip(item.value as EightWaySpriteClip);
    totalFrames += clip.directions.reduce((sum, sequence) => sum + sequence.frames.length, 0);
    if (totalFrames > 524288) throw new TypeError('Playback exceeds its captured frame budget');
    if (clips.has(clip.clipId)) throw new TypeError('Playback clip keys must be unique');
    const project = clip.directions[0].frames[0]!.projectId;
    if (projectId !== undefined && project !== projectId) throw new TypeError('Playback clips must share one project');
    projectId = project;
    clips.set(clip.clipId, clip);
  }
  const clip = clipFor(clips, value.clipId), id = Symbol('sprite-animation-playback');
  const handle: SpriteAnimationPlayback = Object.freeze({ id });
  playbacks.set(handle, { clips, snapshot: snapshot(id, clip, index, 0, 'stopped'), transport: 'stopped', busy: false });
  return handle;
}

/** Immutable historical readback remains available after terminal disposal. */
export function getSpriteAnimationPlaybackSnapshot(handle: SpriteAnimationPlayback): SpriteAnimationPlaybackSnapshot {
  return issued(handle).snapshot;
}

/** One synchronous capture/validate/candidate/commit path for every control command. */
export function commandSpriteAnimationPlayback(handle: SpriteAnimationPlayback,
  input: SpriteAnimationPlaybackCommand): SpriteAnimationPlaybackSnapshot {
  return transition(handle, input, false).snapshot;
}

/** Explicit host delta only, through the same guarded control transition path. */
export function advanceSpriteAnimationPlayback(handle: SpriteAnimationPlayback,
  deltaMs: number): SpriteAnimationAdvanceResult {
  return transition(handle, { type: 'advance', deltaMs }, true);
}

function observation(before: SpriteAnimationPlaybackSnapshot,
  after: SpriteAnimationPlaybackSnapshot): SpriteAnimationAdvanceResult {
  return Object.freeze({ snapshot: after,
    frameChanged: before.frame.projectId !== after.frame.projectId
      || before.frame.resourceId !== after.frame.resourceId
      || before.frame.subresourceId !== after.frame.subresourceId,
    completedNow: !before.completed && after.completed });
}

function transition(handle: SpriteAnimationPlayback, input: Transition,
  allowAdvance: boolean): SpriteAnimationAdvanceResult {
  const data = issued(handle);
  data.busy = true;
  try {
    const typeField = typeof input === 'object' && input !== null
      ? Object.getOwnPropertyDescriptor(input, 'type') : undefined;
    const type: unknown = typeField && 'value' in typeField ? typeField.value : undefined;
    const fields = type === 'play' || type === 'selectClip' ? ['type', 'clipId']
      : type === 'setDirection' ? ['type', 'directionIndex']
      : type === 'advance' && allowAdvance ? ['type', 'deltaMs'] : ['type'];
    const command = record(input, fields);
    if (!['play', 'selectClip', 'setDirection', 'pause', 'resume', 'stop', 'dispose',
      ...(allowAdvance ? ['advance'] : [])].includes(type as string)) {
      throw new TypeError('Playback command is unsupported');
    }
    // Proxies may change descriptors between reads; do not commit a mixed command.
    if (command.type !== type) throw new TypeError('Playback command changed during capture');
    const before = data.snapshot;
    if (type === 'dispose') {
      if (before.state === 'disposed') return observation(before, before);
      const terminal = Object.freeze({ ...before, state: 'disposed' as const });
      data.snapshot = terminal;
      data.clips = null; // Release private definition collection; retain last address/readback only.
      return observation(before, terminal);
    }
    if (data.clips === null) throw new TypeError('Playback has been disposed');
    let clip = clipFor(data.clips, before.clipId), index = before.directionIndex;
    let elapsed = before.elapsedMs, transport = data.transport;
    switch (type) {
      case 'advance': {
        const delta = command.deltaMs;
        if (typeof delta !== 'number' || !Number.isFinite(delta) || delta < 0 || delta > Number.MAX_SAFE_INTEGER) {
          throw new TypeError('Playback delta must be finite within 0..MAX_SAFE_INTEGER milliseconds');
        }
        if (before.state !== 'playing' || delta === 0) return observation(before, before);
        const sum = elapsed + delta;
        if (!Number.isFinite(sum) || sum > Number.MAX_SAFE_INTEGER || sum <= elapsed) {
          throw new RangeError('Playback accumulated time exceeds bounds or absorbs a positive delta');
        }
        // Once advancement drops overshoot; direction changes still preserve logical elapsed.
        elapsed = clip.repeat === 'once'
          ? Math.min(sum, clip.directions[index].frames.length * clip.timing.frameIntervalMs) : sum;
        break;
      }
      case 'play': {
        const target = clipFor(data.clips, command.clipId);
        if (target !== clip || before.completed) elapsed = 0;
        clip = target; transport = 'playing';
        break;
      }
      case 'selectClip': {
        const target = clipFor(data.clips, command.clipId);
        if (target !== clip) { clip = target; elapsed = 0; transport = 'stopped'; }
        break;
      }
      case 'setDirection': index = direction(command.directionIndex); break;
      case 'pause': if (transport === 'playing') transport = 'paused'; break;
      case 'resume': if (transport === 'paused' && !before.completed) transport = 'playing'; break;
      case 'stop': elapsed = 0; transport = 'stopped'; break;
    }
    if (clip.clipId === before.clipId && index === before.directionIndex
      && elapsed === before.elapsedMs && transport === data.transport) return observation(before, before);
    const next = snapshot(before.id, clip, index, elapsed, transport);
    const result = observation(before, next);
    data.snapshot = next;
    data.transport = transport;
    return result;
  } finally { data.busy = false; }
}
