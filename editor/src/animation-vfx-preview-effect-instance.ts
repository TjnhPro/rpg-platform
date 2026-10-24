import { createVisualEffectInstance, getVisualEffectInstanceSnapshot, commandVisualEffectPlayback,
  getVisualEffectPlaybackSnapshot, getVisualEffectLifetimeSnapshot, advanceVisualEffectInstance,
  removeVisualEffectInstance, getVisualEffectDiagnosticsSnapshot,
  type RenderFrameSession, type RenderVisualScene, type VisualEffectPlaybackCommand } from '@rpg-platform/runtime-render';
import type { AnimationPreviewContext, AnimationPreviewTicket } from './animation-vfx-preview-context.js';
import type { PreparedAnimationPreviewEffect } from './animation-vfx-preview-effect.js';
import { scaleAnimationPreviewDelta } from './animation-vfx-preview-config.js';

/** Own one effect; session/scene and authored targets are borrowed and never disposed. */
export function createAnimationPreviewEffectInstance(context: AnimationPreviewContext, ticket: AnimationPreviewTicket,
  prepared: PreparedAnimationPreviewEffect, session: RenderFrameSession, scene: RenderVisualScene, visualInstanceId: string, speed = 1) {
  const source = context.assert(ticket);
  if (source.descriptor !== prepared.inventory.descriptor) throw new TypeError('PREVIEW_EFFECT_CONTEXT_MISMATCH');
  scaleAnimationPreviewDelta(0, speed);
  const handle = createVisualEffectInstance(session, scene, { definition: prepared.definition, visualInstanceId });
  let disposed = false;
  const dispose = () => { if (!disposed) { disposed = true; removeVisualEffectInstance(scene, handle); }
    return getVisualEffectInstanceSnapshot(handle); };
  let unregister: () => unknown;
  try { unregister = context.own(ticket, dispose); } catch (error) { dispose(); throw error; }
  const guard = () => {
    context.assert(ticket);
    if (disposed || getVisualEffectInstanceSnapshot(handle).projectId !== source.scope.projectId) throw new TypeError('PREVIEW_EFFECT_RETIRED');
  };
  return Object.freeze({ handle, scene, session, prepared,
    read() { guard(); return Object.freeze({ playback: getVisualEffectPlaybackSnapshot(handle),
      lifetime: getVisualEffectLifetimeSnapshot(handle), diagnostics: getVisualEffectDiagnosticsSnapshot(handle) }); },
    command(command: VisualEffectPlaybackCommand) { guard(); return commandVisualEffectPlayback(handle, command); },
    step(deltaMs: number) { guard(); return advanceVisualEffectInstance(handle, scaleAnimationPreviewDelta(deltaMs, speed)); },
    dispose() { unregister(); return dispose(); }
  });
}
export type AnimationPreviewEffectInstance = ReturnType<typeof createAnimationPreviewEffectInstance>;
