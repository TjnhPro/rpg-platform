// Finite manual numeric inspection; no assertions, automatic comparisons or runner.
import { getAtlasMetadataRevision, resolveAtlasFrameGeometry, createAtlasTextureView,
  type AtlasMetadata, type AtlasPagePixels, type RenderFrameSession, type RenderTexture,
} from '@rpg-platform/runtime-render';

const log = (label: string, value: unknown): void => console.log(label, JSON.stringify(value,
  (_key, item: unknown) => typeof item === 'symbol' ? String(item) : item, 2));

export function inspectAtlasGeometry(atlas: AtlasMetadata): void {
  const revision = getAtlasMetadataRevision(atlas);
  if (revision === null) return;
  // Numeric inspection uses header dimensions. Independently decode selected PNGs
  // and inspect agreement before treating these as actual decoded-page dimensions.
  for (const frame of atlas.frames) {
    const page = atlas.pages.find(item => item.pageId === frame.pageId);
    if (page === undefined) continue;
    const reference = { ...atlas.identity, subresourceId: frame.key };
    const pixels: AtlasPagePixels = { imageSourceId: page.imageSourceId, unit: 'image-pixel',
      layout: 'texturepacker-unity-bottom-left', width: page.width, height: page.height };
    log(`geometry ${frame.key}`, resolveAtlasFrameGeometry(reference, atlas, revision.id, pixels));
  }
  const first = atlas.frames[0], page = atlas.pages[0];
  if (first === undefined || page === undefined) return;
  const reference = { ...atlas.identity, subresourceId: first.key };
  const pixels: AtlasPagePixels = { imageSourceId: page.imageSourceId, unit: 'image-pixel',
    layout: 'texturepacker-unity-bottom-left', width: page.width, height: page.height };
  log('wrong decoded dimensions', resolveAtlasFrameGeometry(reference, atlas, revision.id, { ...pixels, width: page.width + 1 }));
  log('nonfinite dimensions', resolveAtlasFrameGeometry(reference, atlas, revision.id, { ...pixels, height: Infinity }));
  log('wrong page image binding', resolveAtlasFrameGeometry(reference, atlas, revision.id, { ...pixels, imageSourceId: 'missing-image' }));
  log('forged page reference, not canonical', resolveAtlasFrameGeometry(reference,
    { ...atlas, frames: [{ ...first, pageId: 'missing-page' }] }, revision.id, pixels));
  log('metadata pivot retained without alignment interpretation', first.sourcePivot);
}

/** Optional browser host hook: caller has already decoded/uploaded this exact page once. */
export function inspectAtlasTextureViews(
  session: RenderFrameSession, texture: RenderTexture, atlas: AtlasMetadata, pageId: string,
): void {
  const revision = getAtlasMetadataRevision(atlas), page = atlas.pages.find(item => item.pageId === pageId);
  if (revision === null || page === undefined) return;
  const snapshot = texture.getSnapshot();
  const views = atlas.frames.filter(frame => frame.pageId === pageId).map(frame => {
    const result = resolveAtlasFrameGeometry({ ...atlas.identity, subresourceId: frame.key }, atlas, revision.id,
      { imageSourceId: page.imageSourceId, unit: 'image-pixel', layout: 'texturepacker-unity-bottom-left',
        width: snapshot.width, height: snapshot.height });
    return result.status === 'resolved' ? createAtlasTextureView(session, texture, result.geometry, page.imageSourceId) : result;
  });
  log('borrowed views, same existing texture; no upload in this function', views.map(view =>
    'getSnapshot' in view ? { geometry: view.geometry, texture: view.getSnapshot() } : view));
  // No release here: all views borrow the one caller-owned page texture.
}
