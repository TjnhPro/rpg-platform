// Finite read-only manual consumer. No assertions, runner, comparisons or CI job.
import {
  createVisualSourceLoad, parseUnityAtlasMetadata, prepareVisualResource,
  type VisualSourceProvider, type VisualSourceLoad, type VisualResourceDescriptor,
  type AtlasSourceBinding, type UnityAtlasSheet, type AtlasMetadataResult,
} from '@rpg-platform/runtime-render';

const limit = 1024 * 1024;
const log = (label: string, value: unknown): void => console.log(label, JSON.stringify(value,
  (_key, item: unknown) => typeof item === 'symbol' ? String(item) : item, 2));
const hash = async (bytes: Uint8Array<ArrayBuffer>): Promise<string> =>
  Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), byte => byte.toString(16).padStart(2, '0')).join('');

export async function inspectAtlasMetadata(
  selected: readonly { readonly readMetadata: () => Promise<Uint8Array<ArrayBuffer>>;
    readonly textureReference: string; readonly imageLocator: string }[],
): Promise<void> {
  const sources: VisualResourceDescriptor['sources'][number][] = [
    { role: 'image', locator: { type: 'project-relative', path: 'unused/decoy.png' } },
  ];
  const bindings: AtlasSourceBinding[] = [], sheets: UnityAtlasSheet[] = [], loads: VisualSourceLoad[] = [];
  const descriptor: VisualResourceDescriptor = { identity: { projectId: 'atlas-manual', resourceId: 'selected-sheets' }, mediaType: null, sources };
  const scope = { projectId: descriptor.identity.projectId, providerId: Symbol(), authorizationGeneration: 'explicit-read-only-1' };
  let reads = 0;
  for (let index = 0; index < selected.length; index++) {
    const selection = selected[index]!;
    // Metadata first, repeated image/metadata roles, decoy image before real pages.
    const sourceIndex = sources.length;
    sources.push({ role: 'atlas-metadata', locator: { type: 'project-relative', path: `selected/metadata-${index}.tpsheet` } },
      { role: 'image', locator: { type: 'project-relative', path: selection.imageLocator } });
    bindings.push({ sourceId: `image-${index}`, sourceIndex: sourceIndex + 1 }, { sourceId: `metadata-${index}`, sourceIndex });
  }
  const makeLoad = (sourceIndex: number, read: () => Promise<Uint8Array<ArrayBuffer>>): VisualSourceLoad => {
    const expected = sources[sourceIndex]!;
    const provider: VisualSourceProvider = { scope, async read(request) {
      if (request.scope.providerId !== scope.providerId || request.scope.authorizationGeneration !== scope.authorizationGeneration
        || request.identity.projectId !== descriptor.identity.projectId || request.identity.resourceId !== descriptor.identity.resourceId
        || request.sourceIndex !== sourceIndex || request.source.role !== 'atlas-metadata'
        || request.source.locator.type !== expected.locator.type || request.source.locator.path !== expected.locator.path) {
        return { status: 'failed', code: 'SOURCE_DENIED' };
      }
      reads++;
      const bytes = await read();
      if (bytes.length > request.maxBytes) return { status: 'failed', code: 'CONTENT_TOO_LARGE' };
      return { status: 'provided', bytes, contentLength: bytes.length, mediaType: null, revision: await hash(bytes) };
    } };
    const load = createVisualSourceLoad(descriptor, sourceIndex, provider, limit);
    loads.push(load);
    return load;
  };
  const show = (label: string, result: AtlasMetadataResult): void => {
    log(label, result);
    if (result.status === 'parsed') log('frozen observations', { atlas: Object.isFrozen(result.atlas),
      pages: Object.isFrozen(result.atlas.pages), frames: Object.isFrozen(result.atlas.frames),
      rectangle: Object.isFrozen(result.atlas.frames[0]?.rectangle), pivot: Object.isFrozen(result.atlas.frames[0]?.sourcePivot) });
  };
  try {
    log('metadata only / provider reads', { result: prepareVisualResource(descriptor), reads });
    for (let index = 0; index < selected.length; index++) {
      const selection = selected[index]!, sourceIndex = index * 2 + 1;
      const metadata = makeLoad(sourceIndex, selection.readMetadata);
      log('source acquired', await metadata.start());
      sheets.push({ pageId: `page-${index}`, metadataSourceId: `metadata-${index}`, imageSourceId: `image-${index}`,
        textureReference: selection.textureReference, metadata });
    }
    const result = parseUnityAtlasMetadata(descriptor, bindings, sheets);
    show('original files, explicit page/frame/source IDs', result);
    const first = sheets[0];
    const original = first?.metadata.copyBytes();
    if (first !== undefined && original != null) {
      const text = new TextDecoder('utf-8', { fatal: true }).decode(original);
      const firstFrame = text.split(/\r?\n/u).find(line => line.length > 0 && !line.startsWith('#') && !line.startsWith(':'));
      if (firstFrame !== undefined) {
        const duplicate = new TextEncoder().encode(text + '\n' + firstFrame + '\n');
        const bad = makeLoad(1, async () => duplicate);
        await bad.start();
        show('malformed memory copy: duplicate frame', parseUnityAtlasMetadata(descriptor, bindings, [{ ...first, metadata: bad }]));
      }
      const unknown = new TextEncoder().encode(text.replace(':format=40300', ':future-header=unsupported\n:format=40300'));
      const future = makeLoad(1, async () => unknown);
      await future.start();
      show('unknown source header', parseUnityAtlasMetadata(descriptor, bindings, [{ ...first, metadata: future }]));
      show('missing explicit page source', parseUnityAtlasMetadata(descriptor, bindings, [{ ...first, imageSourceId: 'not-bound' }]));
      if (sheets[1] !== undefined) show('duplicate page ID', parseUnityAtlasMetadata(descriptor, bindings, [first, { ...sheets[1], pageId: first.pageId }]));
      original.fill(0); // Caller-owned copy; parsed metadata holds no byte reference.
    }
    for (const load of loads) load.release();
    show('parsed description after source release/copy mutation', result);
    log('provider reads; no image/GPU/catalog IO', reads);
  } finally { for (const load of loads) load.release(); }
}
