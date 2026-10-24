import { setVisualEffectWorldPlacement, attachVisualEffectInstance, syncVisualEffectAttachment,
  detachVisualEffectInstance, getRenderVisualInstance, getVisualEffectInstanceSnapshot,
  type RenderVisualScene, type VisualEffectWorldPlacementInput, type VisualEffectAttachmentInput } from '@rpg-platform/runtime-render';
import { createScenePreviewBridge, type ScenePreviewPresentation } from './scene-preview.js';
import { validateVisualSceneDocument } from './visual-document-edit.js';
import { describeVisualPresentation } from './visual-preview.js';
import type { DocumentSession } from './document-session.js';
import type { AnimationPreviewContext, AnimationPreviewTicket } from './animation-vfx-preview-context.js';
import type { AnimationPreviewEffectInstance } from './animation-vfx-preview-effect-instance.js';

/** A borrowed authored Scene and bridge-owned targets, disjoint from effect instances. */
export function createAnimationPreviewScene(context: AnimationPreviewContext, ticket: AnimationPreviewTicket,
  document: DocumentSession, scene: RenderVisualScene,
  acquire: Parameters<typeof createScenePreviewBridge>[2]) {
  const source = context.assert(ticket), captured = document.getSnapshot();
  if (captured.state !== 'open' || captured.envelope.identity.projectId !== source.scope.projectId) throw new TypeError('PREVIEW_SCENE_CONTEXT_MISMATCH');
  const map = validateVisualSceneDocument(captured.envelope, source.catalog);
  const bridge = createScenePreviewBridge(scene, map.identity, acquire);
  const targets = new Map<string, NonNullable<Awaited<ReturnType<typeof bridge.sync>>[number]['instance']>>();
  const effects = new Set<AnimationPreviewEffectInstance>();
  let closed = false;
  const dispose = () => { if (!closed) { closed = true;
    const failures: unknown[] = [];
    for (const effect of effects) { try { effect.dispose(); } catch (error) { failures.push(error); } }
    effects.clear(); targets.clear(); const outcomes = bridge.close();
    if (failures.length) throw new AggregateError(failures, 'PREVIEW_SCENE_CLEANUP_UNCERTAIN');
    return outcomes; }
    return []; };
  const unregister = context.own(ticket, dispose);
  const guard = () => { context.assert(ticket); const now = document.getSnapshot();
    if (closed || now.state !== 'open' || now.currentRevision !== captured.currentRevision || now.envelope !== captured.envelope) {
      dispose(); throw new TypeError('STALE_PREVIEW_SCENE'); }
  };
  const effectGuard = (effect: AnimationPreviewEffectInstance) => {
    guard(); const snapshot = getVisualEffectInstanceSnapshot(effect.handle);
    if (effect.scene !== scene || snapshot.projectId !== map.identity.projectId || snapshot.state !== 'created') throw new TypeError('PREVIEW_FOREIGN_EFFECT');
    effects.add(effect);
  };
  return Object.freeze({ map, scene,
    async preview(policy: Parameters<typeof bridge.sync>[2]) {
      guard(); const outcomes = await bridge.sync(map.membership, source.catalog,
        description => describeVisualPresentation(captured.envelope, description.correlation.objectId, source.catalog, policy(description)));
      guard(); targets.clear();
      for (const item of outcomes) if (item.status === 'applied' && item.instance) targets.set(item.objectId, item.instance);
      return outcomes;
    },
    targets() { guard(); return Object.freeze([...targets.keys()]); },
    world(effect: AnimationPreviewEffectInstance, input: VisualEffectWorldPlacementInput) {
      effectGuard(effect);
      if (input.placement.plane.coordinateSpaceId !== map.profile.space.reference.coordinateSpaceId
        || input.placement.plane.unit !== map.profile.space.unit) throw new TypeError('PREVIEW_WRONG_SCENE_PLANE');
      detachVisualEffectInstance(effect.handle); return setVisualEffectWorldPlacement(effect.handle, input);
    },
    attach(effect: AnimationPreviewEffectInstance, objectId: string, localOffset: VisualEffectAttachmentInput['localOffset']) {
      effectGuard(effect); const target = targets.get(objectId);
      if (!target || getRenderVisualInstance(scene, target.visualInstanceId) !== target) throw new TypeError('PREVIEW_TARGET_UNAVAILABLE');
      return attachVisualEffectInstance(effect.handle, { target, localOffset, inheritance: 'translation-only' });
    },
    syncAttachment(effect: AnimationPreviewEffectInstance) { effectGuard(effect); return syncVisualEffectAttachment(effect.handle); },
    detach(effect: AnimationPreviewEffectInstance) { effectGuard(effect); return detachVisualEffectInstance(effect.handle); },
    dispose() { unregister(); return dispose(); }
  });
}
export type AnimationPreviewScene = ReturnType<typeof createAnimationPreviewScene>;
