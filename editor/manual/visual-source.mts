// Optional, finite host demonstration. Never imported by Editor's public root.
import {
  acquireVisualSource, prepareVisualResource,
  type VisualResourceDescriptor, type VisualSourceProvider,
} from '@rpg-platform/runtime-render';

/** Caller explicitly supplies an authorized snapshot, not a Render filesystem root. */
export async function inspectVisualSourceAccess(bytes: Uint8Array<ArrayBuffer>, revision: string): Promise<void> {
  const scope = Object.freeze({ projectId: 'manual-project', providerId: Symbol('manual-host'),
    authorizationGeneration: 'grant-1' });
  // Closed host store: a real manifest snapshot, plus an authorized absent key.
  // Not an atlas fixture, parser, decoder or general IO adapter.
  const permitted = new Set(['editor/package.json', 'absent.json']);
  const store = new Map([['editor/package.json', { bytes, revision }]]);
  let calls = 0;
  const provider = Object.freeze<VisualSourceProvider>({ scope, async read(request) {
    calls += 1;
    if (request.scope.providerId !== scope.providerId
      || request.scope.authorizationGeneration !== scope.authorizationGeneration
      || request.identity.projectId !== scope.projectId
      || !permitted.has(request.source.locator.path)) {
      return { status: 'failed', code: 'SOURCE_DENIED' };
    }
    const entry = store.get(request.source.locator.path);
    if (!entry) return { status: 'failed', code: 'SOURCE_NOT_FOUND' };
    if (entry.bytes.byteLength > request.maxBytes) return { status: 'failed', code: 'CONTENT_TOO_LARGE' };
    return { status: 'provided', bytes: entry.bytes, revision: entry.revision,
      mediaType: 'application/json', contentLength: entry.bytes.byteLength };
  } });
  const descriptor: VisualResourceDescriptor = {
    identity: { projectId: scope.projectId, resourceId: 'manifest-source-access-only' }, mediaType: null,
    sources: [
      { role: 'image', locator: { type: 'project-relative', path: 'ungranted.png' } },
      { role: 'metadata', locator: { type: 'project-relative', path: 'editor/package.json' } },
      { role: 'metadata', locator: { type: 'project-relative', path: 'absent.json' } },
    ],
  };
  console.log('metadata-only', prepareVisualResource(descriptor).resourceLoading, 'provider-calls', calls);
  const acquired = await acquireVisualSource(descriptor, 1, provider, 4096);
  console.log('authorized manifest bytes', acquired);
  if (acquired.status === 'source-acquired') {
    console.log('independent buffer', acquired.bytes.buffer !== bytes.buffer,
      'actual manifest text', new TextDecoder().decode(acquired.bytes));
  }
  console.log('ungranted image', await acquireVisualSource(descriptor, 0, provider, 4096));
  console.log('authorized absent host key', await acquireVisualSource(descriptor, 2, provider, 4096));
  console.log('bounded host response', await acquireVisualSource(descriptor, 1, provider, 1));
  console.log('media mismatch', await acquireVisualSource({ ...descriptor, mediaType: 'image/png',
    sources: [{ role: 'image', locator: { type: 'project-relative', path: 'editor/package.json' } }],
  }, 0, provider, 4096));
  console.log('foreign project', await acquireVisualSource({ ...descriptor,
    identity: { ...descriptor.identity, projectId: 'other-project' } }, 1, provider, 4096));
  console.log('total host reads', calls);
}
