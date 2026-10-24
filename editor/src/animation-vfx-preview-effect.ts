import { createVisualEffectDefinition, resolveVisualEffectDefinition, type SpriteTimedClipInput } from '@rpg-platform/runtime-render';
import type { AnimationPreviewContext, AnimationPreviewTicket } from './animation-vfx-preview-context.js';
import type { AnimationPreviewInventory } from './animation-vfx-preview-atlas.js';

/** Metadata admission only. No effect/Scene/GPU allocation and no authored effect schema. */
export function prepareAnimationPreviewEffect(context: AnimationPreviewContext, ticket: AnimationPreviewTicket,
  inventory: AnimationPreviewInventory, input: { readonly effectId: string; readonly kind: 'sprite-sequence'; readonly clip: SpriteTimedClipInput }) {
  const source = context.assert(ticket);
  if (source.descriptor !== inventory.descriptor) throw new TypeError('PREVIEW_EFFECT_CONTEXT_MISMATCH');
  for (const observation of inventory.observations) {
    const scope = observation.request.scope;
    if (scope.projectId !== source.scope.projectId || scope.providerId !== source.scope.providerId
      || scope.authorizationGeneration !== source.scope.authorizationGeneration) throw new TypeError('PREVIEW_EFFECT_PROVENANCE_MISMATCH');
  }
  const definition = createVisualEffectDefinition({ effectId: input.effectId, kind: input.kind, clip: input.clip,
    resource: inventory.descriptor, sources: inventory.observations.map(item => ({
      sourceId: item.sourceId, sourceIndex: item.sourceIndex, revision: item.revision })) });
  const resolution = resolveVisualEffectDefinition(definition, { atlas: inventory.atlas,
    expectedRevision: inventory.revision.id, pages: inventory.pages });
  if (resolution.status !== 'resolved') throw new TypeError(`PREVIEW_EFFECT:${resolution.code}`);
  context.assert(ticket);
  return Object.freeze({ definition, resolution, inventory, provenance: 'PREVIEW_ONLY_EFFECT_DECLARATION' as const });
}
export type PreparedAnimationPreviewEffect = ReturnType<typeof prepareAnimationPreviewEffect>;
