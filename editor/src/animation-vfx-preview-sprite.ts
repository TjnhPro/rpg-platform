import { createSpriteAnimationPlayback, commandSpriteAnimationPlayback, getSpriteAnimationPlaybackSnapshot,
  advanceSpriteAnimationPlayback, createSpriteSequencePlayback, commandSpriteSequencePlayback,
  getSpriteSequencePlaybackSnapshot, advanceSpriteSequencePlayback,
  type SpriteAnimationPlaybackCommand, type SpriteDirectionIndex } from '@rpg-platform/runtime-render';
import type { PreparedPreviewClips } from './animation-vfx-preview-clips.js';
import { selectAnimationPreviewClip } from './animation-vfx-preview-clips.js';
import type { AnimationPreviewContext, AnimationPreviewTicket } from './animation-vfx-preview-context.js';

/** Own one canonical playback only. No resource allocation, seek, scheduler or second playhead. */
export function createAnimationPreviewSprite(context: AnimationPreviewContext, ticket: AnimationPreviewTicket,
  prepared: PreparedPreviewClips, clipId: string, direction: SpriteDirectionIndex | null) {
  const source = context.assert(ticket);
  if (prepared.inventory.descriptor !== source.descriptor) throw new TypeError('PREVIEW_INVENTORY_CONTEXT_MISMATCH');
  selectAnimationPreviewClip(prepared, clipId, direction);
  const playback = prepared.mode === 'eight-way'
    ? { mode: 'eight-way' as const, handle: createSpriteAnimationPlayback({ clips: prepared.clips, clipId, directionIndex: direction! }) }
    : { mode: 'single-sequence' as const, handle: createSpriteSequencePlayback({ clips: prepared.clips, clipId }) };
  let disposed = false;
  const snapshot = () => playback.mode === 'eight-way' ? getSpriteAnimationPlaybackSnapshot(playback.handle) : getSpriteSequencePlaybackSnapshot(playback.handle);
  const invoke = (command: SpriteAnimationPlaybackCommand) => {
    if (playback.mode === 'eight-way') return commandSpriteAnimationPlayback(playback.handle, command);
    if (command.type === 'setDirection') throw new TypeError('PREVIEW_DIRECTION_NA');
    return commandSpriteSequencePlayback(playback.handle, command);
  };
  const dispose = () => { if (!disposed) { disposed = true; invoke({ type: 'dispose' }); } return snapshot(); };
  const unregister = context.own(ticket, dispose);
  const guard = () => { context.assert(ticket); if (disposed) throw new TypeError('PREVIEW_SPRITE_DISPOSED'); };
  return Object.freeze({ playback, prepared,
    read() { guard(); return snapshot(); },
    command(command: SpriteAnimationPlaybackCommand | { readonly type: 'restart' }) {
      guard();
      if (command.type === 'restart') { const id = snapshot().clipId; invoke({ type: 'stop' }); return invoke({ type: 'play', clipId: id }); }
      return invoke(command);
    },
    step(deltaMs: number) { guard(); return playback.mode === 'eight-way'
      ? advanceSpriteAnimationPlayback(playback.handle, deltaMs) : advanceSpriteSequencePlayback(playback.handle, deltaMs); },
    dispose() { unregister(); return dispose(); }
  });
}
export type AnimationPreviewSprite = ReturnType<typeof createAnimationPreviewSprite>;
