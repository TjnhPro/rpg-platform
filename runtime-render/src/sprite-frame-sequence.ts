import { createVisualFrameReference, type VisualFrameReference } from './atlas-frame.js';

/** Ordered atlas addresses only; neither resolution evidence nor live resources. */
export interface SpriteFrameSequence {
  readonly frames: readonly VisualFrameReference[];
}

/** Host key local to its chosen set; unrelated to Scene/gameplay/live instance IDs. */
export interface SpriteAnimationClip {
  readonly clipId: string;
  readonly sequence: SpriteFrameSequence;
}

// Phase7 Unity parser ceiling: 65,536 frames and 2,048 characters per line.
// Repeated addresses are intentional holds, but also consume this sequence budget.
const maxFrames = 65536;
const maxIdentity = 512;
const maxFrameKey = 2048;

function record(input: unknown, fields: readonly string[]): Record<string, unknown> {
  if (typeof input !== 'object' || input === null || Array.isArray(input)
    || (Object.getPrototypeOf(input) !== Object.prototype && Object.getPrototypeOf(input) !== null)
    || Reflect.ownKeys(input).length !== fields.length) {
    throw new TypeError('Sprite metadata requires a closed plain record');
  }
  const result: Record<string, unknown> = {};
  for (const field of fields) {
    const item = Object.getOwnPropertyDescriptor(input, field);
    if (!item?.enumerable || !('value' in item)) throw new TypeError('Sprite metadata requires data fields');
    result[field] = item.value;
  }
  return result;
}

function identity(input: unknown): input is string {
  return typeof input === 'string' && input.length > 0 && input.length <= maxIdentity
    && !/[\s\u0000-\u001f\u007f]/u.test(input);
}

/**
 * Capture 1..65,536 explicit ordered addresses from one project/resource.
 * Closed {frames} record and dense ordinary array; duplicates intentionally hold.
 * No lookup/IO: missing keys may capture successfully and fail Phase7 resolution.
 * Rejections are bounded TypeErrors without authored values; host traps propagate.
 */
export function createSpriteFrameSequence(input: SpriteFrameSequence): SpriteFrameSequence {
  const { frames } = record(input, ['frames']);
  if (!Array.isArray(frames) || Object.getPrototypeOf(frames) !== Array.prototype
    || frames.length < 1 || frames.length > maxFrames
    || Reflect.ownKeys(frames).length !== frames.length + 1) {
    throw new TypeError('Sprite frames require a dense array of 1..65536 entries');
  }
  const captured: VisualFrameReference[] = [];
  for (let index = 0; index < frames.length; index++) {
    const item = Object.getOwnPropertyDescriptor(frames, String(index));
    if (!item?.enumerable || !('value' in item)) throw new TypeError('Sprite frames require own data entries');
    const frame = record(item.value, ['projectId', 'resourceId', 'subresourceId']);
    if (!identity(frame.projectId) || !identity(frame.resourceId)
      || typeof frame.subresourceId !== 'string' || frame.subresourceId.length > maxFrameKey
      || frame.subresourceId.trim().length === 0 || /[\u0000-\u001f\u007f]/u.test(frame.subresourceId)) {
      throw new TypeError('Sprite frames require bounded explicit atlas addresses');
    }
    const reference = createVisualFrameReference({ projectId: frame.projectId,
      resourceId: frame.resourceId, subresourceId: frame.subresourceId });
    const first = captured[0];
    if (first !== undefined && (reference.projectId !== first.projectId || reference.resourceId !== first.resourceId)) {
      throw new TypeError('Sprite sequence frames must share one project and resource');
    }
    captured.push(reference);
  }
  return Object.freeze({ frames: Object.freeze(captured) });
}

/** Metadata capture only. Timing, direction, set uniqueness and atlas binding are separate. */
export function createSpriteAnimationClip(input: SpriteAnimationClip): SpriteAnimationClip {
  const { clipId, sequence } = record(input, ['clipId', 'sequence']);
  if (!identity(clipId)) throw new TypeError('Sprite clip requires a bounded nonempty opaque key');
  return Object.freeze({ clipId, sequence: createSpriteFrameSequence(sequence as SpriteFrameSequence) });
}
