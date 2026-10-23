// Optional finite public-root consumer. No assertions or automated comparisons.
import {
  createRenderFrameSession, createVisualSourceLoad, createPngImageDecode,
  uploadPngTexture, getRenderTextureSnapshot, getRenderTextureFailure,
  type RenderFrameSession, type RenderTexture, type VisualSourceProvider,
} from '@rpg-platform/runtime-render';

export async function inspectTextureUpload(
  firstCanvas: HTMLCanvasElement, secondCanvas: HTMLCanvasElement,
  bytes: Uint8Array<ArrayBuffer>, revision: string,
  log: (label: string, value: unknown) => void,
): Promise<void> {
  const scope = { projectId: 'texture-manual', providerId: Symbol(), authorizationGeneration: 'sample-1' };
  const provider: VisualSourceProvider = { scope, async read(request) {
    if (request.scope.providerId !== scope.providerId || request.scope.authorizationGeneration !== scope.authorizationGeneration
      || request.identity.projectId !== scope.projectId || request.identity.resourceId !== 'rgba-2x2'
      || request.source.role !== 'image' || request.source.locator.type !== 'project-relative'
      || request.source.locator.path !== 'rgba-2x2.png') return { status: 'failed', code: 'SOURCE_DENIED' };
    if (bytes.length > request.maxBytes) return { status: 'failed', code: 'CONTENT_TOO_LARGE' };
    return { status: 'provided', bytes, contentLength: bytes.length, mediaType: null, revision };
  } };
  const source = createVisualSourceLoad({ identity: { projectId: scope.projectId, resourceId: 'rgba-2x2' },
    mediaType: null, sources: [{ role: 'image', locator: { type: 'project-relative', path: 'rgba-2x2.png' } }] }, 0, provider, 4096);
  const image = createPngImageDecode(source, { maxBytes: 4096, maxDimension: 4, maxPixels: 16 });
  const sessions: RenderFrameSession[] = [];
  const textures: RenderTexture[] = [];
  try {
    log('source', await source.start());
    log('image', await image.start());
    const a = await createRenderFrameSession({ target: firstCanvas }); sessions.push(a);
    const b = await createRenderFrameSession({ target: secondCanvas }); sessions.push(b);
    const first = uploadPngTexture(a, image, { sampling: 'nearest', colorSpace: 'srgb' }); textures.push(first);
    const retained = uploadPngTexture(a, image, { sampling: 'linear', colorSpace: 'srgb' }); textures.push(retained);
    const other = uploadPngTexture(b, image, { sampling: 'nearest', colorSpace: 'srgb' }); textures.push(other);
    log('A upload accepted', getRenderTextureSnapshot(a, first));
    log('B independent upload accepted', getRenderTextureSnapshot(b, other));
    log('CPU image remains owned after upload', image.getSnapshot());
    log('release source', source.release());
    log('release CPU image', image.release());
    log('A texture after CPU release', first.getSnapshot());
    try { log('cross-session observation', getRenderTextureSnapshot(b, first)); }
    catch (error) { log('cross-session rejection', getRenderTextureFailure(error) ?? error); }
    log('release A texture', first.release());
    log('release A texture again', first.release());
    a.dispose();
    log('A retained texture after session disposal', retained.getSnapshot());
    log('B texture after A disposal', other.getSnapshot());
    const reacquired = await createRenderFrameSession({ target: firstCanvas }); sessions.push(reacquired);
    try { log('old resource in reacquired session', getRenderTextureSnapshot(reacquired, retained)); }
    catch (error) { log('reacquire rejection', getRenderTextureFailure(error) ?? error); }
    b.dispose();
    log('B terminal', other.getSnapshot());
  } finally {
    for (const texture of textures) try { log('texture cleanup', texture.release()); } catch (error) { log('texture cleanup error', error); }
    for (const session of sessions) try { session.dispose(); } catch (error) { log('session cleanup error', error); }
    try { image.release(); } finally { source.release(); }
  }
}
