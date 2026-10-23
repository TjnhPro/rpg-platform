// Finite human-inspected composition, no assertions, expected comparisons or runner.
import { createVisualFrameReference, getAtlasMetadataRevision, resolveAtlasFrame,
  type AtlasMetadata, type AtlasFrameResolution, type VisualFrameReference } from '@rpg-platform/runtime-render';
import { createAssetReference, createAssetCatalog, resolveAssetReference } from '@rpg-platform/editor';

const log = (label: string, value: unknown): void => console.log(label, JSON.stringify(value,
  (_key, item: unknown) => typeof item === 'symbol' ? String(item) : item, 2));

export function inspectFrameResolution(atlas: AtlasMetadata, revised: AtlasMetadata): void {
  const current = getAtlasMetadataRevision(atlas), next = getAtlasMetadataRevision(revised);
  if (current === null || next === null) { log('no canonical atlas provenance', null); return; }
  const { projectId, resourceId } = atlas.identity;
  const authored = ['0050', '0000'].map(subresourceId => createAssetReference({ projectId, assetId: resourceId, subresourceId }));
  const holders: readonly { readonly holderId: string; readonly reference: VisualFrameReference }[] = authored.map((reference, index) => ({
    holderId: `holder-${index}`, reference: createVisualFrameReference({ projectId: reference.projectId,
      resourceId: reference.assetId, subresourceId: reference.subresourceId }),
  }));
  log('logical holders; same asset, different exact keys', holders);
  const show = (label: string, result: AtlasFrameResolution): void => {
    log(label, result);
    if (result.status === 'resolved') log('detached frozen lookup', { reference: Object.isFrozen(result.reference),
      page: Object.isFrozen(result.page), frame: Object.isFrozen(result.frame), rectangle: Object.isFrozen(result.frame.rectangle),
      pivot: Object.isFrozen(result.frame.sourcePivot), imageSource: Object.isFrozen(result.imageSource),
      pageIsAtlasPointer: result.page === atlas.pages.find(page => page.pageId === result.page.pageId),
      frameIsAtlasPointer: result.frame === atlas.frames.find(frame => frame.key === result.frame.key) });
  };
  for (const holder of holders) show(holder.holderId, resolveAtlasFrame(holder.reference, atlas, current.id));
  const reference = holders[0]!.reference;
  show('missing opaque address', resolveAtlasFrame({ ...reference, subresourceId: 'missing-frame' }, atlas, current.id));
  show('no prefix/page grammar or whitespace trimming', resolveAtlasFrame({ ...reference, subresourceId: ' page-0/0050 ' }, atlas, current.id));
  show('no implicit first frame', resolveAtlasFrame({ ...reference, subresourceId: null }, atlas, current.id));
  show('wrong logical resource', resolveAtlasFrame({ ...reference, resourceId: 'different-asset' }, atlas, current.id));
  show('no atlas', resolveAtlasFrame(reference, null, current.id));
  show('structural atlas copy not canonical', resolveAtlasFrame(reference, { ...atlas }, current.id));
  log('actual metadata source revisions', { original: current, memoryRevision: next, distinctSnapshotTokens: current.id !== next.id });
  show('old atlas with new current token', resolveAtlasFrame(reference, atlas, next.id));
  show('new atlas with old token', resolveAtlasFrame(reference, revised, current.id));
  show('logical reference unchanged, key removed in current revision', resolveAtlasFrame(reference, revised, next.id));
  show('explicit renamed key in memory revision', resolveAtlasFrame({ ...reference, subresourceId: '0050-revision' }, revised, next.id));
  show('old snapshot deliberately retained', resolveAtlasFrame(reference, atlas, current.id));
  log('holders retained', holders);
  // Transient in-memory authored data only. No catalog file/store/scene write.
  const catalog = createAssetCatalog({ projectId, definitions: [{ identity: { projectId, assetId: resourceId }, kind: 'image', metadata: {} }] });
  log('Phase2 remains unsupported for opaque subresource', resolveAssetReference(catalog, authored[0]!));
}
