import {
  createRenderFrameSession, createRenderVisualScene, addRenderVisualInstance,
  removeRenderVisualInstance, bindRenderVisualInstanceResource, getRenderVisualInstanceResource,
  getRenderVisualBindingFailure, getRenderVisualInstanceFailure, createVisualResourceCache,
  type RenderHostBinding, type VisualSourceProvider, type VisualResourceDescriptor,
  type PngDecodeLimits, type RenderTextureOptions, type RenderVisualFrameBinding,
} from '@rpg-platform/runtime-render';

/** Optional real-resource walkthrough; caller supplies authorized bytes/metadata and two canvases.
 * No automatic execution, assertions, fake resources, frame request or visual PASS claim. */
export async function observeVisualInstanceResources(
  first: RenderHostBinding, second: RenderHostBinding, provider: VisualSourceProvider,
  descriptor: VisualResourceDescriptor, sourceIndex: number, sourceRevision: string,
  limits: PngDecodeLimits, options: RenderTextureOptions, frame: RenderVisualFrameBinding | null,
  write: (label: string, value: unknown) => void,
): Promise<void> {
  const a = await createRenderFrameSession(first);
  try {
    const b = await createRenderFrameSession(second);
    const cache = createVisualResourceCache(provider, { maxCpuEntries: 2, maxGpuEntries: 2 });
    try {
      const scene = createRenderVisualScene(a), foreign = createRenderVisualScene(b);
      const one = addRenderVisualInstance(scene, { visualInstanceId: 'one' });
      const two = addRenderVisualInstance(scene, { visualInstanceId: 'two' });
      const removed = addRenderVisualInstance(scene, { visualInstanceId: 'late' });
      const other = addRenderVisualInstance(foreign, { visualInstanceId: 'other' });
      const resource = cache.acquire(a, descriptor, sourceIndex, sourceRevision, limits, options);
      const request = { resource, expectedSourceRevision: sourceRevision, frame };
      const attempt = (label: string, operation: () => unknown): void => {
        try { write(label, operation()); }
        catch (error) { write(label, getRenderVisualBindingFailure(error) ?? getRenderVisualInstanceFailure(error) ?? error); }
      };
      attempt('Pending admission', () => bindRenderVisualInstanceResource(scene, one, request));
      removeRenderVisualInstance(scene, removed);
      write('Real load result', await resource.result);
      attempt('Late result / removed instance', () => bindRenderVisualInstanceResource(scene, removed, request));
      attempt('Bind one', () => bindRenderVisualInstanceResource(scene, one, request));
      attempt('Bind two to same allocation', () => bindRenderVisualInstanceResource(scene, two, request));
      write('Cache usage after bind', cache.getSnapshot());
      attempt('Wrong context', () => bindRenderVisualInstanceResource(foreign, other, request));
      attempt('Rejected replacement revision', () => bindRenderVisualInstanceResource(scene, two,
        { ...request, expectedSourceRevision: `${sourceRevision}:obsolete` }));
      if (frame !== null) {
        attempt('Rejected atlas revision', () => bindRenderVisualInstanceResource(scene, two,
          { ...request, frame: { ...frame, expectedRevision: Symbol('different-atlas-revision') } }));
        attempt('Missing frame address', () => bindRenderVisualInstanceResource(scene, two,
          { ...request, frame: { ...frame, reference: { ...frame.reference,
            subresourceId: `${frame.reference.subresourceId ?? ''}:caller-missing-key` } } }));
      }
      write('Host lease released', resource.release());
      write('One after host release', getRenderVisualInstanceResource(scene, one));
      write('Two after host release', getRenderVisualInstanceResource(scene, two));
      attempt('Released handle replacement', () => bindRenderVisualInstanceResource(scene, two, request));
      write('Remove one', removeRenderVisualInstance(scene, one));
      write('Two after one removed', getRenderVisualInstanceResource(scene, two));
      write('Unbind two', bindRenderVisualInstanceResource(scene, two, null));
      write('Cache usage after unbind', cache.getSnapshot());
      scene.dispose(); foreign.dispose();
    } finally { try { cache.dispose(); } finally { b.dispose(); } }
  } finally { a.dispose(); }
}
