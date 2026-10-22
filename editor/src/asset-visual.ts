import type { VisualResourceDescriptor } from '@rpg-platform/runtime-render';
import type { AssetReferenceResolution } from './asset-catalog.js';

export type AssetVisualDescription =
  | { readonly status: 'described'; readonly descriptor: VisualResourceDescriptor }
  | { readonly status: 'unsupported'; readonly reason: 'UNRESOLVED_REFERENCE' | 'NON_VISUAL_KIND' | 'MISSING_IMAGE_SOURCE' };

/**
 * Project a factory-resolved authored image into Render's neutral public contract.
 * Only kind image is currently mapped; other open authored kinds stay unsupported.
 * The caller supplies the media hint explicitly; arbitrary metadata is not guessed.
 * Render's prepareVisualResource validates this description before consumption.
 */
export function describeResolvedVisualAsset(
  resolution: AssetReferenceResolution, mediaType: string | null = null,
): AssetVisualDescription {
  if (resolution.status === 'unresolved') return Object.freeze({ status: 'unsupported', reason: 'UNRESOLVED_REFERENCE' });
  const definition = resolution.definition;
  if (definition.kind !== 'image') return Object.freeze({ status: 'unsupported', reason: 'NON_VISUAL_KIND' });
  if (!definition.sources.some(source => source.role === 'image')) {
    return Object.freeze({ status: 'unsupported', reason: 'MISSING_IMAGE_SOURCE' });
  }
  const descriptor: VisualResourceDescriptor = Object.freeze({
    identity: Object.freeze({ projectId: definition.identity.projectId, resourceId: definition.identity.assetId }),
    mediaType,
    sources: Object.freeze(definition.sources.map(source => Object.freeze({
      role: source.role, locator: Object.freeze({ type: source.locator.type, path: source.locator.path }),
    }))),
  });
  return Object.freeze({ status: 'described', descriptor });
}
