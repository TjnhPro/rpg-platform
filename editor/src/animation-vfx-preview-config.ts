import { createSpriteAnimationTiming, type SpriteAnimationTimingInput, type SpriteAnimationRepeat,
  type SpriteDirectionIndex } from '@rpg-platform/runtime-render';
import { prepareAnimationPreviewClips, type PreparedPreviewClips } from './animation-vfx-preview-clips.js';
import { createAnimationPreviewSprite } from './animation-vfx-preview-sprite.js';
import type { AnimationPreviewContext, AnimationPreviewTicket } from './animation-vfx-preview-context.js';

export interface PreviewPlaybackConfiguration {
  readonly timing: SpriteAnimationTimingInput; readonly repeat: SpriteAnimationRepeat; readonly speed: number;
}
/** Inspection overrides, not source FPS. Conservative UI envelope; Render validates timing. */
export function capturePreviewPlaybackConfiguration(input: PreviewPlaybackConfiguration) {
  const timing = createSpriteAnimationTiming(input.timing);
  if (timing.frameIntervalMs < 1000 / 120 || timing.frameIntervalMs > 10000
    || !Number.isFinite(input.speed) || input.speed < 0.125 || input.speed > 4
    || !['once', 'repeat'].includes(input.repeat)) throw new RangeError('PREVIEW_CONFIGURATION_BOUNDS');
  return Object.freeze({ timing, repeat: input.repeat, speed: input.speed, provenance: 'PREVIEW_OVERRIDE_NOT_SOURCE_FPS' as const });
}
export function scaleAnimationPreviewDelta(deltaMs: number, speed: number) {
  if (!Number.isFinite(deltaMs) || deltaMs < 0 || deltaMs > 60000 || !Number.isFinite(speed) || speed < 0.125 || speed > 4)
    throw new RangeError('PREVIEW_DELTA_BOUNDS');
  const scaled = deltaMs * speed;
  if (!Number.isFinite(scaled) || scaled > Number.MAX_SAFE_INTEGER || (deltaMs > 0 && scaled <= 0)) throw new RangeError('PREVIEW_DELTA_PRECISION');
  return scaled;
}
export function configureAnimationPreviewClips(prepared: PreparedPreviewClips, input: PreviewPlaybackConfiguration) {
  const config = capturePreviewPlaybackConfiguration(input);
  const declaration = prepared.mode === 'eight-way'
    ? { mode: prepared.mode, clips: prepared.clips.map(clip => ({ ...clip, timing: config.timing, repeat: config.repeat })) }
    : { mode: prepared.mode, clips: prepared.clips.map(clip => ({ clip: clip.clip, timing: config.timing, repeat: config.repeat })) };
  return Object.freeze({ config, prepared: prepareAnimationPreviewClips(prepared.inventory, declaration) });
}
/** Reconfiguration is replacement at stopped/zero. Caller unbinds old visual before disposal. */
export function createConfiguredAnimationPreviewSprite(context: AnimationPreviewContext, ticket: AnimationPreviewTicket,
  prepared: PreparedPreviewClips, clipId: string, direction: SpriteDirectionIndex | null, input: PreviewPlaybackConfiguration) {
  const configured = configureAnimationPreviewClips(prepared, input);
  const sprite = createAnimationPreviewSprite(context, ticket, configured.prepared, clipId, direction);
  return Object.freeze({ sprite, config: configured.config, read: sprite.read, command: sprite.command, dispose: sprite.dispose,
    step(deltaMs: number) { return sprite.step(scaleAnimationPreviewDelta(deltaMs, configured.config.speed)); } });
}
