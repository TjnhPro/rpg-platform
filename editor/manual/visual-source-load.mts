// Optional finite host trace, not a test runner or Editor root dependency.
import {
  createVisualSourceLoad, prepareVisualResource,
  type VisualResourceDescriptor, type VisualSourceProvider,
} from '@rpg-platform/runtime-render';

export async function inspectVisualSourceLifecycle(bytes: Uint8Array<ArrayBuffer>, revision: string): Promise<void> {
  const scope = Object.freeze({ projectId: 'manual-project', providerId: Symbol('manual-lifecycle'),
    authorizationGeneration: 'grant-1' });
  let reads = 0;
  const hostError = new Error('Manual host read failure; not a graphics error');
  const provider = Object.freeze<VisualSourceProvider>({ scope, async read(request) {
    reads += 1;
    if (request.scope.providerId !== scope.providerId
      || request.scope.authorizationGeneration !== scope.authorizationGeneration
      || request.identity.projectId !== scope.projectId || request.source.role !== 'metadata') {
      return { status: 'failed', code: 'SOURCE_DENIED' };
    }
    if (request.source.locator.path === 'host-error.json') throw hostError;
    if (request.source.locator.path !== 'editor/package.json') return { status: 'failed', code: 'SOURCE_NOT_FOUND' };
    if (bytes.byteLength > request.maxBytes) return { status: 'failed', code: 'CONTENT_TOO_LARGE' };
    return { status: 'provided', bytes, revision, mediaType: 'application/json', contentLength: bytes.byteLength };
  } });
  const descriptor = (resourceId: string, path = 'editor/package.json'): VisualResourceDescriptor => ({
    identity: { projectId: scope.projectId, resourceId }, mediaType: null,
    sources: [
      { role: 'image', locator: { type: 'project-relative', path: 'ungranted.png' } },
      { role: 'metadata', locator: { type: 'project-relative', path } },
    ],
  });
  console.log('metadata-only', prepareVisualResource(descriptor('metadata')).resourceLoading, 'reads', reads);

  // Hold an actual authorized snapshot at the host boundary until explicitly delivered.
  let deliver!: () => void;
  let entered!: () => void;
  const delivery = new Promise<void>(resolve => { deliver = resolve; });
  const hostEntered = new Promise<void>(resolve => { entered = resolve; });
  let lateByteReads = 0;
  const delayed = Object.freeze<VisualSourceProvider>({ scope, async read(request) {
    const response = await provider.read(request);
    entered();
    await delivery;
    if (response.status === 'failed') return response;
    return { ...response, get bytes() { lateByteReads += 1; return response.bytes; } };
  } });
  const late = createVisualSourceLoad(descriptor('late'), 1, delayed, 4096);
  console.log('late requested', late.getSnapshot());
  const lateCompletion = late.start();
  console.log('late pending', late.getSnapshot());
  await hostEntered;
  console.log('late released before delivery', late.release(), 'copy', late.copyBytes());

  const first = createVisualSourceLoad(descriptor('first'), 1, provider, 4096);
  const second = createVisualSourceLoad(descriptor('second'), 1, provider, 4096);
  console.log('independent requested', first.getSnapshot(), second.getSnapshot());
  const firstCompletion = first.start();
  const secondCompletion = second.start();
  console.log('independent pending', first.getSnapshot(), second.getSnapshot());
  console.log('first acquired', await firstCompletion);
  console.log('second acquired', await secondCompletion);
  let callerCopy = first.copyBytes();
  console.log('first caller copy', callerCopy?.byteLength, 'separate host buffer', callerCopy?.buffer !== bytes.buffer);
  console.log('first cleanup', first.release(), 'owned copy unavailable', first.copyBytes());
  console.log('second still acquired', second.getSnapshot(), 'copy length', second.copyBytes()?.byteLength);
  console.log('second cleanup', second.release());
  callerCopy = null; // Host drops its independently owned copy explicitly.

  deliver();
  console.log('late completion after release', await lateCompletion, 'late-byte-getter-reads', lateByteReads);
  console.log('late remains terminal', late.getSnapshot(), 'copy', late.copyBytes(), 'repeat release', late.release());

  const missing = createVisualSourceLoad(descriptor('missing', 'absent.json'), 1, provider, 4096);
  console.log('missing requested', missing.getSnapshot());
  const missingCompletion = missing.start();
  console.log('missing pending', missing.getSnapshot());
  console.log('missing failed', await missingCompletion, 'copy', missing.copyBytes());
  console.log('missing cleanup', missing.release());

  const rejected = createVisualSourceLoad(descriptor('rejected', 'host-error.json'), 1, provider, 4096);
  console.log('reject requested', rejected.getSnapshot());
  const rejection = rejected.start();
  console.log('reject pending', rejected.getSnapshot());
  try { await rejection; } catch (error) {
    console.log('original host error identity', error === hostError, 'safe observation', rejected.getSnapshot());
  } finally { console.log('reject cleanup', rejected.release(), 'copy', rejected.copyBytes()); }

  const unused = createVisualSourceLoad(descriptor('never-started'), 1, provider, 4096);
  console.log('release requested', unused.release(), 'start after release', await unused.start());
  console.log('host read count', reads, 'no decoder/GPU stage entered');
}
