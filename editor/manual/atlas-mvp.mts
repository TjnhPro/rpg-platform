import { createAssetCatalog, createAssetReference, resolveAssetReference, describeResolvedVisualAsset } from '@rpg-platform/editor';
import { prepareVisualResource, type VisualSourceProvider } from '@rpg-platform/runtime-render';

const maxBytes = 1024 * 1024;
const digest = async (file: File) => {
  if (file.size > maxBytes) throw new RangeError('Selected file exceeds 1 MiB');
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', await file.arrayBuffer())),
    byte => byte.toString(16).padStart(2, '0')).join('');
};
// Host-only capability adapter, not a loader or cache. Each read captures its File.
export async function createEditorAtlasInput(png: File, sheet: File, missingImage: boolean) {
  const projectId = 'editor-mvp';
  const catalog = createAssetCatalog({ projectId, definitions: [{ identity: { projectId, assetId: 'atlas' },
    kind: 'image', metadata: { label: 'Manually selected original atlas' }, sources: [
      { role: 'atlas-metadata', locator: { type: 'project-relative', path: 'selected/page.tpsheet' } },
      { role: 'image', locator: { type: 'project-relative', path: 'selected/page.png' } },
    ] }] });
  const reference = createAssetReference({ projectId, assetId: 'atlas', expectedKind: 'image' });
  const resolved = resolveAssetReference(catalog, reference);
  const visual = describeResolvedVisualAsset(resolved);
  if (visual.status !== 'described') throw new TypeError('Selected authored image is unresolved');
  const descriptor = prepareVisualResource(visual.descriptor).descriptor;
  if (sheet.size > maxBytes) throw new RangeError('Selected sheet exceeds 1 MiB');
  let page = png, revision = await digest(png);
  const scope = { projectId: descriptor.identity.projectId, providerId: Symbol(), authorizationGeneration: 'explicit-files' };
  const provider: VisualSourceProvider = { scope, async read(request) {
    const expected = descriptor.sources[request.sourceIndex];
    if (!expected || request.scope.providerId !== scope.providerId
      || request.scope.authorizationGeneration !== scope.authorizationGeneration
      || request.identity.projectId !== scope.projectId || request.identity.resourceId !== descriptor.identity.resourceId
      || request.source.role !== expected.role || request.source.locator.type !== expected.locator.type
      || request.source.locator.path !== expected.locator.path) return { status: 'failed', code: 'SOURCE_DENIED' };
    if (missingImage && request.sourceIndex === 1) return { status: 'failed', code: 'SOURCE_NOT_FOUND' };
    const file = request.sourceIndex === 0 ? sheet : page;
    if (file.size > Math.min(request.maxBytes, maxBytes)) return { status: 'failed', code: 'CONTENT_TOO_LARGE' };
    const bytes = new Uint8Array(await file.arrayBuffer());
    const actualRevision = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)),
      byte => byte.toString(16).padStart(2, '0')).join('');
    return { status: 'provided', bytes, contentLength: bytes.length,
      mediaType: request.sourceIndex === 1 ? 'image/png' : null, revision: actualRevision };
  } };
  return { descriptor, provider, revision, async replacePng(file: File) {
    const next = await digest(file); page = file; revision = next; return revision;
  }, authored: Object.freeze({ catalog, reference }) };
}
