import { createSpriteTimedClip, createEightWaySpriteClip, resolveAtlasFrameGeometry,
  type SpriteTimedClipInput, type EightWaySpriteClipInput, type SpriteDirectionIndex } from '@rpg-platform/runtime-render';
import type { AnimationPreviewInventory } from './animation-vfx-preview-atlas.js';

export type PreviewClipDeclaration =
  | { readonly mode: 'single-sequence'; readonly clips: readonly SpriteTimedClipInput[] }
  | { readonly mode: 'eight-way'; readonly clips: readonly EightWaySpriteClipInput[] };

/** Admit explicit host preview declarations against actual parsed provenance. No filename inference. */
export function prepareAnimationPreviewClips(inventory: AnimationPreviewInventory, declaration: PreviewClipDeclaration) {
  if (declaration.clips.length < 1 || declaration.clips.length > 32) throw new RangeError('PREVIEW_CLIP_LIMIT');
  const prepared = declaration.mode === 'single-sequence'
    ? { mode: declaration.mode, clips: Object.freeze(declaration.clips.map(input => createSpriteTimedClip(input))) }
    : declaration.mode === 'eight-way'
      ? { mode: declaration.mode, clips: Object.freeze(declaration.clips.map(input => createEightWaySpriteClip(input))) }
      : null;
  if (!prepared) throw new TypeError('PREVIEW_MODE_UNSUPPORTED');
  const ids = new Set<string>();
  for (const clip of prepared.clips) {
    const id = 'directions' in clip ? clip.clipId : clip.clip.clipId;
    if (ids.has(id)) throw new TypeError('PREVIEW_DUPLICATE_CLIP'); ids.add(id);
    const sequences = 'directions' in clip ? clip.directions : [clip.clip.sequence];
    if ('directions' in clip && new Set(sequences.map(sequence => JSON.stringify(sequence.frames))).size !== 8)
      throw new TypeError('PREVIEW_DISTINCT_DECLARED_DIRECTION_SLOTS_REQUIRED');
    for (const sequence of sequences) for (const frame of sequence.frames) {
      // Canonical resolver diagnoses identity, revision and key; do not synthesize missing frames.
      const resolutions = inventory.pages.map(pixels => resolveAtlasFrameGeometry(frame, inventory.atlas, inventory.revision.id, pixels));
      if (!resolutions.some(result => result.status === 'resolved')) throw new TypeError('PREVIEW_FRAME_UNRESOLVED');
    }
  }
  return Object.freeze({ ...prepared, inventory, provenance: 'EXPLICIT_PREVIEW_DECLARATION_NOT_AUTHORED_TIMING' as const });
}
export type PreparedPreviewClips = ReturnType<typeof prepareAnimationPreviewClips>;

export function selectAnimationPreviewClip(prepared: PreparedPreviewClips, clipId: string, direction: SpriteDirectionIndex | null) {
  const clip = prepared.clips.find(item => ('directions' in item ? item.clipId : item.clip.clipId) === clipId);
  if (!clip) throw new TypeError('PREVIEW_CLIP_NOT_DECLARED');
  if ('directions' in clip) {
    if (!Number.isInteger(direction) || direction === null || direction < 0 || direction > 7) throw new TypeError('PREVIEW_DIRECTION_REQUIRED');
    return Object.freeze({ clipId, direction, sequence: clip.directions[direction] });
  }
  if (direction !== null) throw new TypeError('PREVIEW_DIRECTION_NA');
  return Object.freeze({ clipId, direction: null, sequence: clip.clip.sequence });
}
