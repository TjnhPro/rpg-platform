import { resolveAtlasFrameGeometry, resolveSpriteFrameAlignment, resolveAtlasFrame,
  type VisualFrameReference, type SpriteFrameAlignmentInput, type SpriteFrameAlignmentData } from '@rpg-platform/runtime-render';
import type { AnimationPreviewInventory } from './animation-vfx-preview-atlas.js';
import type { AnimationPreviewContext, AnimationPreviewTicket } from './animation-vfx-preview-context.js';

/** Explicit inspection values for this exact frame; never artist/source verification. */
export function createPreviewInspectionAlignment(inventory: AnimationPreviewInventory, reference: VisualFrameReference,
  points: Pick<SpriteFrameAlignmentData, 'groundAnchor' | 'pivot' | 'localOffset'>): SpriteFrameAlignmentData {
  return Object.freeze({ reference: Object.freeze({ ...reference }), revision: inventory.revision.id,
    provenance: 'PREVIEW_INSPECTION_OVERRIDE: frame-local values; artist ground/untrimmed origin NOT_VERIFIED',
    unit: 'image-pixel', origin: 'frame-top-left', groundAnchor: Object.freeze({ ...points.groundAnchor }),
    pivot: Object.freeze({ ...points.pivot }), localOffset: Object.freeze({ ...points.localOffset }) });
}

/** Pure Render diagnostics. No authored placement/profile or playback writes. */
export function inspectAnimationPreviewAlignment(context: AnimationPreviewContext, ticket: AnimationPreviewTicket,
  inventory: AnimationPreviewInventory, reference: VisualFrameReference,
  input: Pick<SpriteFrameAlignmentInput, 'placement' | 'orientation' | 'planeUnitsPerPixel' | 'authored'>) {
  if (context.assert(ticket).descriptor !== inventory.descriptor) throw new TypeError('PREVIEW_ALIGNMENT_CONTEXT_MISMATCH');
  const resolution = inventory.pages.map(pixels => resolveAtlasFrameGeometry(reference, inventory.atlas, inventory.revision.id, pixels))
    .find(result => result.status === 'resolved');
  if (!resolution || resolution.status !== 'resolved') throw new TypeError('PREVIEW_ALIGNMENT_FRAME_UNRESOLVED');
  const frame = resolveAtlasFrame(reference, inventory.atlas, inventory.revision.id);
  const alignment = resolveSpriteFrameAlignment({ ...input, atlas: inventory.atlas,
    expectedRevision: inventory.revision.id, geometry: resolution.geometry });
  return Object.freeze({ geometry: resolution.geometry, alignment,
    sourcePivot: frame.status === 'resolved' ? Object.freeze({ ...frame.frame.sourcePivot,
      unit: 'normalized-frame', origin: 'bottom-left' }) : null,
    authored: input.authored, provenance: input.authored?.provenance ?? 'NO_AUTHORED_ALIGNMENT',
    dimensions: inventory.dimensions, artistGround: 'NOT_VERIFIED', trim: 'NOT_AVAILABLE', originalSize: 'NOT_AVAILABLE' });
}
