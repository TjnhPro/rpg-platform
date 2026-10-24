import { createVisualOrientation2D, type VisualOrientation2D } from './visual-alignment.js';
import { type SpriteFrameSequence } from './sprite-frame-sequence.js';
import { createSpriteTimedClip, createSpriteAnimationTiming, sampleSpriteAnimationTiming,
  type SpriteAnimationTimingInput, type SpriteAnimationTiming, type SpriteAnimationRepeat,
  type SpriteAnimationFrameSample } from './sprite-animation-timing.js';
import { resolveAtlasFrame, type AtlasFrameResolution } from './atlas-frame.js';
import type { AtlasMetadata } from './atlas-metadata.js';

export type SpriteDirectionIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type SpriteDirectionSequences = readonly [SpriteFrameSequence, SpriteFrameSequence,
  SpriteFrameSequence, SpriteFrameSequence, SpriteFrameSequence, SpriteFrameSequence,
  SpriteFrameSequence, SpriteFrameSequence];

export interface SpriteEightWayConvention {
  readonly axes: VisualOrientation2D['axes'];
  readonly directionZeroAngleRadians: number;
  readonly zeroIndex: SpriteDirectionIndex;
}

export interface EightWaySpriteClipInput {
  readonly clipId: string;
  readonly timing: SpriteAnimationTimingInput;
  readonly repeat: SpriteAnimationRepeat;
  readonly convention: SpriteEightWayConvention;
  /** Tuple position is the authored slot, never inferred from resource order. */
  readonly directions: SpriteDirectionSequences;
}

export interface EightWaySpriteClip {
  readonly clipId: string;
  readonly timing: SpriteAnimationTiming;
  readonly repeat: SpriteAnimationRepeat;
  readonly convention: SpriteEightWayConvention;
  readonly directions: SpriteDirectionSequences;
}

/** Selection/sample remains observable when canonical Phase7 resolution rejects. */
export interface EightWaySpriteFrameResolution {
  readonly direction: SpriteDirectionIndex;
  readonly sequence: SpriteFrameSequence;
  readonly sample: SpriteAnimationFrameSample;
  readonly resolution: AtlasFrameResolution;
}

function record(input: unknown, fields: readonly string[]): Record<string, unknown> {
  if (typeof input !== 'object' || input === null || Array.isArray(input)
    || (Object.getPrototypeOf(input) !== Object.prototype && Object.getPrototypeOf(input) !== null)
    || Reflect.ownKeys(input).length !== fields.length) throw new TypeError('Eight-way mapping requires a closed plain record');
  const output: Record<string, unknown> = {};
  for (const field of fields) {
    const item = Object.getOwnPropertyDescriptor(input, field);
    if (!item?.enumerable || !('value' in item)) throw new TypeError('Eight-way mapping requires own data fields');
    output[field] = item.value;
  }
  return output;
}

function orientation(input: unknown): VisualOrientation2D {
  const value = record(input, ['axes', 'zeroAxis', 'positiveRotation', 'angleRadians']);
  const axes = record(value.axes, ['x', 'y']);
  return createVisualOrientation2D({ axes: axes as unknown as VisualOrientation2D['axes'],
    zeroAxis: value.zeroAxis as VisualOrientation2D['zeroAxis'],
    positiveRotation: value.positiveRotation as VisualOrientation2D['positiveRotation'],
    angleRadians: value.angleRadians as number });
}

function convention(input: SpriteEightWayConvention): SpriteEightWayConvention {
  const value = record(input, ['axes', 'directionZeroAngleRadians', 'zeroIndex']);
  const captured = orientation({ axes: value.axes, zeroAxis: 'positive-x',
    positiveRotation: 'toward-positive-y', angleRadians: value.directionZeroAngleRadians });
  if (typeof value.zeroIndex !== 'number' || !Number.isInteger(value.zeroIndex)
    || value.zeroIndex < 0 || value.zeroIndex > 7) throw new TypeError('Eight-way zeroIndex must be an integer within 0..7');
  return Object.freeze({ axes: captured.axes, directionZeroAngleRadians: captured.angleRadians,
    zeroIndex: (value.zeroIndex === 0 ? 0 : value.zeroIndex) as SpriteDirectionIndex });
}

/** Nearest 45-degree center; exact half-sector ties advance toward positive Y. */
export function selectEightWaySpriteDirection(
  input: SpriteEightWayConvention, facingInput: VisualOrientation2D,
): SpriteDirectionIndex {
  const mapping = convention(input), facing = orientation(facingInput);
  if (mapping.axes.x !== facing.axes.x || mapping.axes.y !== facing.axes.y) {
    throw new TypeError('Eight-way mapping and orientation axes must match');
  }
  const turn = 2 * Math.PI, width = turn / 8;
  let relative = facing.angleRadians - mapping.directionZeroAngleRadians;
  if (relative < 0) relative += turn;
  // Compare half-open boundaries directly, without adding half a sector to input.
  // This avoids rounding a just-below-boundary value into the following sector.
  for (let sector = 0; sector < 8; sector++) {
    if (relative < (sector + 0.5) * width) return ((mapping.zeroIndex + sector) % 8) as SpriteDirectionIndex;
  }
  return mapping.zeroIndex; // Last half-sector wraps to the explicit zero slot.
}

/** Capture all eight authored slots, one logical ID/timing, one project scope. */
export function createEightWaySpriteClip(input: EightWaySpriteClipInput): EightWaySpriteClip {
  const data = record(input, ['clipId', 'timing', 'repeat', 'convention', 'directions']);
  const mapping = convention(data.convention as SpriteEightWayConvention);
  const timing = createSpriteAnimationTiming(data.timing as SpriteAnimationTimingInput);
  const entries = data.directions;
  if (!Array.isArray(entries) || Object.getPrototypeOf(entries) !== Array.prototype || entries.length !== 8
    || Reflect.ownKeys(entries).length !== 9) throw new TypeError('Eight-way mapping requires exactly eight dense slots');
  const directions: SpriteFrameSequence[] = [];
  let clipId = '', projectId = '';
  for (let index = 0; index < 8; index++) {
    const item = Object.getOwnPropertyDescriptor(entries, String(index));
    if (!item?.enumerable || !('value' in item)) throw new TypeError('Eight-way slots require own data entries');
    const timed = createSpriteTimedClip({ clip: { clipId: data.clipId as string,
      sequence: item.value as SpriteFrameSequence }, timing, repeat: data.repeat as SpriteAnimationRepeat });
    const frame = timed.clip.sequence.frames[0]!;
    if (index !== 0 && frame.projectId !== projectId) throw new TypeError('Eight-way sequences must share one project');
    clipId = timed.clip.clipId; projectId = frame.projectId;
    directions.push(timed.clip.sequence);
  }
  return Object.freeze({ clipId, timing, repeat: data.repeat as SpriteAnimationRepeat,
    convention: mapping, directions: Object.freeze(directions) as unknown as SpriteDirectionSequences });
}

/**
 * Stateless selection using the SAME logical elapsed for any direction.
 * Target count determines modulo/clamp, never normalized-progress remapping.
 * Host supplies the selected resource's canonical atlas/token; no load or fallback.
 */
export function resolveEightWaySpriteFrame(
  input: EightWaySpriteClip, facing: VisualOrientation2D, elapsedMs: number,
  atlas: AtlasMetadata | null, expectedRevision: symbol,
): EightWaySpriteFrameResolution {
  const clip = createEightWaySpriteClip(input);
  const direction = selectEightWaySpriteDirection(clip.convention, facing);
  const sequence = clip.directions[direction];
  const sample = sampleSpriteAnimationTiming(clip.timing, sequence.frames.length, clip.repeat, elapsedMs);
  const resolution = resolveAtlasFrame(sequence.frames[sample.frameIndex]!, atlas, expectedRevision);
  return Object.freeze({ direction, sequence, sample, resolution });
}
