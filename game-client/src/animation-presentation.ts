// Private Client presentation adapter; no browser globals or gameplay semantics.
import * as R from '@rpg-platform/runtime-render';

export interface ClientAnimationIntent {
  readonly clipId: string;
  readonly orientation: R.VisualOrientation2D;
  readonly playing: boolean;
}

/** Owns one playback/binding; borrows the existing instance/session and frame rights.
 * Host owns instance membership, resource IO, Scene/session and scheduling lifetime.
 * Terminal closure never reacquires or reconnects. Names are opaque host content.
 */
export function createClientAnimationPresentation(input: {
  readonly session: R.RenderFrameSession;
  readonly scene: R.RenderVisualScene;
  readonly instance: R.RenderVisualInstance;
  readonly clips: readonly R.EightWaySpriteClip[];
  readonly clipId: string;
  readonly directionIndex: R.SpriteDirectionIndex;
  readonly frameInput: (frame: R.VisualFrameReference) => R.SpriteAnimationVisualFrameInput;
}) {
  const clips = input.clips.map(R.createEightWaySpriteClip);
  const playback = R.createSpriteAnimationPlayback({ clips, clipId: input.clipId, directionIndex: input.directionIndex });
  let binding: R.SpriteAnimationVisualBinding;
  try { binding = R.createSpriteAnimationVisualBinding(input.session, input.scene, input.instance, playback); }
  catch (error) { R.commandSpriteAnimationPlayback(playback, { type: 'dispose' }); throw error; }
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    try { binding.unbind(); }
    finally { R.commandSpriteAnimationPlayback(playback, { type: 'dispose' }); }
  };
  const requireOpen = () => {
    if (closed) throw new TypeError('Client animation presentation closed');
    if (R.getRenderViewportSnapshot(input.session).graphics.state !== 'ready') {
      close(); throw new TypeError('Client animation session terminal; fresh mount required');
    }
    try { R.getRenderVisualInstanceSnapshot(input.scene, input.instance); }
    catch (error) { close(); throw error; }
  };
  return Object.freeze({ close,
    inspect: () => ({ closed, playback: R.getSpriteAnimationPlaybackSnapshot(playback) }),
    intent: (intent: ClientAnimationIntent) => {
      requireOpen();
      const clip = clips.find(item => item.clipId === intent.clipId);
      if (!clip || typeof intent.playing !== 'boolean') throw new TypeError('Explicit declared clip and playing intent required');
      // Delegate angular convention/quantization to Render before making changes.
      const directionIndex = R.selectEightWaySpriteDirection(clip.convention, intent.orientation);
      let before = R.getSpriteAnimationPlaybackSnapshot(playback);
      if (before.clipId !== clip.clipId) before = R.commandSpriteAnimationPlayback(playback, { type: 'selectClip', clipId: clip.clipId });
      if (before.directionIndex !== directionIndex) before = R.commandSpriteAnimationPlayback(playback, { type: 'setDirection', directionIndex });
      // Read canonical transport, never maintain a parallel Client state engine.
      // In particular unchanged playing/completed intent never restarts a clip.
      if (!intent.playing && before.state !== 'stopped') R.commandSpriteAnimationPlayback(playback, { type: 'stop' });
      else if (intent.playing && before.state === 'stopped') R.commandSpriteAnimationPlayback(playback, { type: 'play', clipId: clip.clipId });
      else if (intent.playing && before.state === 'paused') R.commandSpriteAnimationPlayback(playback, { type: 'resume' });
      return R.getSpriteAnimationPlaybackSnapshot(playback);
    },
    pause: () => { requireOpen(); return R.commandSpriteAnimationPlayback(playback, { type: 'pause' }); },
    advance: (deltaMs: number) => { requireOpen(); return R.advanceSpriteAnimationPlayback(playback, deltaMs); },
    sync: () => {
      requireOpen();
      return binding.sync(input.frameInput(R.getSpriteAnimationPlaybackSnapshot(playback).frame));
    },
  });
}
