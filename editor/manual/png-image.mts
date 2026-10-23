// Finite optional public-root consumer. No assertions, mocks or test runner.
import {
  prepareVisualResource, createVisualSourceLoad, createPngImageDecode,
  type VisualSourceProvider, type VisualSourceLoad, type PngImageDecode,
} from '@rpg-platform/runtime-render';

export async function inspectPngImage(
  bytes: Uint8Array<ArrayBuffer>, revision: string,
  log: (label: string, value: unknown) => void = console.log,
): Promise<void> {
  const scope = Object.freeze({ projectId: 'png-manual', providerId: Symbol('png-manual'),
    authorizationGeneration: 'read-only-sample-1' });
  const descriptor = { identity: { projectId: scope.projectId, resourceId: 'rgba-2x2' }, mediaType: null,
    sources: [{ role: 'image', locator: { type: 'project-relative' as const, path: 'rgba-2x2.png' } }] };
  const sources: VisualSourceLoad[] = [];
  const images: PngImageDecode[] = [];
  let reads = 0;
  const load = async (payload: Uint8Array<ArrayBuffer>): Promise<VisualSourceLoad> => {
    const payloadRevision = payload === bytes ? revision : 'manual-copy-sha256:' +
      Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', payload)),
        value => value.toString(16).padStart(2, '0')).join('');
    const provider: VisualSourceProvider = { scope, async read(request) {
      reads += 1;
      if (request.scope.providerId !== scope.providerId || request.scope.authorizationGeneration !== scope.authorizationGeneration
        || request.identity.projectId !== scope.projectId || request.source.role !== 'image'
        || request.source.locator.path !== 'rgba-2x2.png') return { status: 'failed', code: 'SOURCE_DENIED' };
      if (payload.length > request.maxBytes) return { status: 'failed', code: 'CONTENT_TOO_LARGE' };
      // Byte content, not this hint, decides whether PNG admission succeeds.
      return { status: 'provided', bytes: payload, contentLength: payload.length, mediaType: null, revision: payloadRevision };
    } };
    const source = createVisualSourceLoad(descriptor, 0, provider, 4096);
    sources.push(source);
    log('source acquired', await source.start());
    return source;
  };
  const decode = (source: VisualSourceLoad, maxPixels = 16): PngImageDecode => {
    const image = createPngImageDecode(source, { maxBytes: 4096, maxDimension: 4, maxPixels });
    images.push(image);
    log('decode requested', image.getSnapshot());
    return image;
  };
  try {
    log('metadata only / provider reads', { result: prepareVisualResource(descriptor), reads });
    const source = await load(bytes);
    const first = decode(source), second = decode(source);
    const firstDone = first.start(), secondDone = second.start();
    const bothDone = Promise.all([firstDone, secondDone]);
    log('decode pending', first.getSnapshot());
    await Promise.resolve(); // Both decoders have taken their own source copies.
    log('release source while decoding', source.release());
    const [firstResult, secondResult] = await bothDone;
    log('first completed', firstResult);
    log('second completed', secondResult);
    log('release first', first.release());
    log('second independent', second.getSnapshot());
    log('release first again', first.release());
    log('release second', second.release());

    const lateSource = await load(bytes);
    const late = decode(lateSource);
    const lateDone = late.start();
    await Promise.resolve();
    log('release pending decode', late.release());
    lateSource.release();
    log('late completion stays released', await lateDone);
    log('late repeated release', late.release());

    const malformed = bytes.slice();
    malformed[0] = 0;
    const invalid = decode(await load(malformed));
    log('malformed signature', await invalid.start());
    const truncated = decode(await load(bytes.slice(0, bytes.length - 5)));
    log('truncated PNG', await truncated.start());
    const overBudget = decode(await load(bytes), 1);
    log('pixel budget', await overBudget.start());
    const corrupt = bytes.slice();
    if (corrupt.length === 76) corrupt[41] = 0; // Break sample zlib header, preserve container.
    const brokenStream = decode(await load(corrupt));
    try { log('corrupt stream outcome', await brokenStream.start()); }
    catch (error) { log('native corrupt-stream rejection', { error, observation: brokenStream.getSnapshot() }); }
  } finally {
    for (const image of images) {
      try { log('final image cleanup', image.release()); } catch (error) { log('native cleanup error', error); }
    }
    for (const source of sources) source.release();
    log('total provider reads', reads);
  }
}
