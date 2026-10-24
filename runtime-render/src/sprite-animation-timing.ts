import { createSpriteAnimationClip, type SpriteAnimationClip } from './sprite-frame-sequence.js';

/** Exactly one timing source, also enforced for untyped callers. */
export type SpriteAnimationTimingInput =
  | { readonly fps: number; readonly frameIntervalMs?: never }
  | { readonly frameIntervalMs: number; readonly fps?: never };

export interface SpriteAnimationTiming {
  readonly frameIntervalMs: number;
}

export type SpriteAnimationRepeat = 'once' | 'repeat';

export interface SpriteTimedClipInput {
  readonly clip: SpriteAnimationClip;
  readonly timing: SpriteAnimationTimingInput;
  readonly repeat: SpriteAnimationRepeat;
}

/** Immutable composition, not a playback instance or resolved atlas capability. */
export interface SpriteTimedClip {
  readonly clip: SpriteAnimationClip;
  readonly timing: SpriteAnimationTiming;
  readonly repeat: SpriteAnimationRepeat;
  readonly frameCount: number;
  readonly durationMs: number;
}

export interface SpriteAnimationFrameSample {
  /** Clipped once elapsed or repeat remainder; never accumulated live state. */
  readonly elapsedMs: number;
  readonly frameIndex: number;
  readonly completed: boolean;
}

// Explicit admission limits: no sub-nanosecond intervals or unsafe-ms horizons.
const minIntervalMs = 0.000001;
const maxMs = Number.MAX_SAFE_INTEGER;
const maxFrames = 65536; // Existing Phase7/SA02 capacity, not a direction count.

function record(input: unknown, fields: readonly string[]): Record<string, unknown> {
  if (typeof input !== 'object' || input === null || Array.isArray(input)
    || (Object.getPrototypeOf(input) !== Object.prototype && Object.getPrototypeOf(input) !== null)
    || Reflect.ownKeys(input).length !== fields.length) throw new TypeError('Sprite timing requires a closed plain record');
  const result: Record<string, unknown> = {};
  for (const field of fields) {
    const item = Object.getOwnPropertyDescriptor(input, field);
    if (!item?.enumerable || !('value' in item)) throw new TypeError('Sprite timing requires own data fields');
    result[field] = item.value;
  }
  return result;
}

/** Normalize once to milliseconds; closed one-field input, no implicit precedence. */
export function createSpriteAnimationTiming(input: SpriteAnimationTimingInput): SpriteAnimationTiming {
  const fps = typeof input === 'object' && input !== null && Object.hasOwn(input, 'fps');
  const data = record(input, [fps ? 'fps' : 'frameIntervalMs']);
  const value = data[fps ? 'fps' : 'frameIntervalMs'];
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    throw new TypeError('Sprite timing requires a positive finite number');
  }
  const frameIntervalMs = fps ? 1000 / value : value;
  if (!Number.isFinite(frameIntervalMs) || frameIntervalMs < minIntervalMs || frameIntervalMs > maxMs) {
    throw new TypeError('Sprite frame interval is outside supported millisecond bounds');
  }
  return Object.freeze({ frameIntervalMs });
}

function duration(timing: SpriteAnimationTiming, frameCount: number, repeat: SpriteAnimationRepeat): number {
  if (!Number.isSafeInteger(frameCount) || frameCount < 1 || frameCount > maxFrames) {
    throw new TypeError('Sprite frame count must be an integer within 1..65536');
  }
  if (repeat !== 'once' && repeat !== 'repeat') throw new TypeError('Sprite repeat policy must be once or repeat');
  const durationMs = frameCount * timing.frameIntervalMs;
  if (!Number.isFinite(durationMs) || durationMs < minIntervalMs || durationMs > maxMs) {
    throw new TypeError('Sprite duration is outside supported millisecond bounds');
  }
  return durationMs;
}

/** Recapture SA02 metadata; retain exact clip identity/order and one normalized timing. */
export function createSpriteTimedClip(input: SpriteTimedClipInput): SpriteTimedClip {
  const data = record(input, ['clip', 'timing', 'repeat']);
  const timing = createSpriteAnimationTiming(data.timing as SpriteAnimationTimingInput);
  const repeat = data.repeat as SpriteAnimationRepeat;
  // Check policy before potentially large bounded sequence capture.
  if (repeat !== 'once' && repeat !== 'repeat') throw new TypeError('Sprite repeat policy must be once or repeat');
  const clip = createSpriteAnimationClip(data.clip as SpriteAnimationClip);
  const frameCount = clip.sequence.frames.length;
  const durationMs = duration(timing, frameCount, repeat);
  return Object.freeze({ clip, timing, repeat, frameCount, durationMs });
}

/**
 * Stateless policy evaluation at an explicit elapsed, not playhead advance.
 * Half-open boundaries are the binary64 products index*interval, without epsilon.
 * Binary search avoids division rounding a just-before-boundary time upward.
 * At most 17 comparisons for the existing 65,536-frame admission ceiling.
 */
export function sampleSpriteAnimationTiming(
  input: SpriteAnimationTiming, frameCount: number, repeat: SpriteAnimationRepeat, elapsedMs: number,
): SpriteAnimationFrameSample {
  const data = record(input, ['frameIntervalMs']);
  const timing = createSpriteAnimationTiming({ frameIntervalMs: data.frameIntervalMs as number });
  const durationMs = duration(timing, frameCount, repeat);
  if (typeof elapsedMs !== 'number' || !Number.isFinite(elapsedMs) || elapsedMs < 0 || elapsedMs > maxMs) {
    throw new TypeError('Sprite elapsed must be finite within 0..MAX_SAFE_INTEGER milliseconds');
  }
  const completed = repeat === 'once' && elapsedMs >= durationMs;
  const elapsed = repeat === 'once' ? Math.min(elapsedMs, durationMs) : elapsedMs % durationMs;
  if (completed) return Object.freeze({ elapsedMs: elapsed, frameIndex: frameCount - 1, completed: true });
  let lower = 0, upper = frameCount;
  while (lower < upper) {
    const middle = Math.floor((lower + upper) / 2);
    if (middle * timing.frameIntervalMs <= elapsed) lower = middle + 1;
    else upper = middle;
  }
  return Object.freeze({ elapsedMs: elapsed === 0 ? 0 : elapsed, frameIndex: lower - 1, completed: false });
}
