// Optional manual host composition. Public-root consumer; no new production API.
import {
  createSpriteAnimationPlayback, commandSpriteAnimationPlayback,
  advanceSpriteAnimationPlayback, getSpriteAnimationPlaybackSnapshot,
  createSpriteAnimationVisualBinding, getRenderVisualInstanceSnapshot,
  getRenderVisualInstanceResource, getRenderVisualInstanceVisibility,
  setRenderVisualInstanceVisible, removeRenderVisualInstance,
  getRenderVisualInstanceFailure,
  type RenderFrameSession, type RenderVisualScene, type RenderVisualInstance,
  type EightWaySpriteClip, type SpriteDirectionIndex,
  type SpriteAnimationPlaybackCommand, type SpriteAnimationVisualFrameInput,
  type VisualResourceLease,
} from '@rpg-platform/runtime-render';

/** Transfer one existing instance and one host lease to this example host.
 * Scene/session/cache and deeply immutable clips remain borrowed. Each invocation
 * owns its own playback, binding and closed latch; no second membership store.
 * Caller supplies authored alignment for the CURRENT frame, never a stale request.
 */
export function mountManualSpriteActor(input: {
  readonly session: RenderFrameSession;
  readonly scene: RenderVisualScene;
  readonly instance: RenderVisualInstance;
  readonly clips: readonly EightWaySpriteClip[];
  readonly clipId: string;
  readonly directionIndex: SpriteDirectionIndex;
  readonly lease: VisualResourceLease;
  readonly frameInput: (frame: ReturnType<typeof getSpriteAnimationPlaybackSnapshot>['frame']) =>
    Omit<SpriteAnimationVisualFrameInput, 'resource'>;
}) {
  const { session, scene, instance, lease } = input;
  let closed = false;
  const playback = createSpriteAnimationPlayback({ clips: input.clips,
    clipId: input.clipId, directionIndex: input.directionIndex });
  let binding: ReturnType<typeof createSpriteAnimationVisualBinding>;
  try { binding = createSpriteAnimationVisualBinding(session, scene, instance, playback); }
  catch (error) {
    commandSpriteAnimationPlayback(playback, { type: 'dispose' });
    // Setup failed: ownership never transfers; caller still owns instance/lease.
    throw error;
  }
  const sync = () => {
    if (closed) return { status: 'rejected', code: 'BINDING_DISPOSED' } as const;
    return binding.sync({ ...input.frameInput(getSpriteAnimationPlaybackSnapshot(playback).frame), resource: lease });
  };
  const requireOpen = () => { if (closed) throw new TypeError('Manual actor is closed'); };
  const close = () => {
    if (closed) return;
    closed = true; // Before draining: a late result can never sync this actor.
    try {
      try { removeRenderVisualInstance(scene, instance); }
      catch (error) {
        const code = getRenderVisualInstanceFailure(error)?.code;
        if (code !== 'MISSING_INSTANCE' && code !== 'SCENE_DISPOSED' && code !== 'SESSION_UNAVAILABLE') throw error;
      }
    } finally {
      try { binding.unbind(); }
      finally {
        try { commandSpriteAnimationPlayback(playback, { type: 'dispose' }); }
        finally { lease.release(); }
      }
    }
  };
  // A one-shot explicit readiness continuation, never a playback loop. Binding's
  // canonical lifetime guard also rejects external removal/session termination.
  const ready = lease.result.then(() => sync());
  return Object.freeze({
    ready, sync, close,
    command: (command: SpriteAnimationPlaybackCommand) => {
      requireOpen(); return commandSpriteAnimationPlayback(playback, command);
    },
    advance: (deltaMs: number) => { requireOpen(); return advanceSpriteAnimationPlayback(playback, deltaMs); },
    hide: (hidden: boolean) => { requireOpen(); return setRenderVisualInstanceVisible(scene, instance, !hidden); },
    inspect: () => {
      const state = getSpriteAnimationPlaybackSnapshot(playback);
      let current;
      try {
        current = { instance: getRenderVisualInstanceSnapshot(scene, instance),
          resource: getRenderVisualInstanceResource(scene, instance),
          visibility: getRenderVisualInstanceVisibility(scene, instance) };
      } catch (error) {
        const failure = getRenderVisualInstanceFailure(error);
        if (!failure || !['MISSING_INSTANCE', 'SCENE_DISPOSED', 'SESSION_UNAVAILABLE'].includes(failure.code)) throw error;
        return { closed, playback: state, membership: failure.code };
      }
      return { closed, playback: state, membership: 'live', ...current };
    },
  });
}
