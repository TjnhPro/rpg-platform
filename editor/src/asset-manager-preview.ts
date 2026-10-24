import {
  addRenderVisualInstance, removeRenderVisualInstance, bindRenderVisualInstanceResource,
  getRenderVisualInstanceResource, setRenderVisualInstanceTransform, setRenderVisualInstanceSpriteLayout,
  type RenderVisualScene, type RenderVisualInstance, type RenderVisualInstanceTransformInput,
  type RenderVisualSpriteLayout, type VisualResourceDescriptor, type VisualResourceLease,
} from '@rpg-platform/runtime-render';
import { resolveAssetReference } from './asset-catalog.js';
import { describeResolvedVisualAsset } from './asset-visual.js';
import { requireAssetManagerProject, type AssetManagerProject } from './asset-manager-project.js';
import { getManagedAssetSelection, observeManagedAssetSelection } from './asset-manager-selection.js';
import type { ProjectRootBinding } from './project-root-binding.js';

export interface AssetPreviewRequest {
  readonly sourceRevision: string;
  readonly transform: RenderVisualInstanceTransformInput;
  readonly layout: RenderVisualSpriteLayout;
}
export interface AssetPreviewAcquisition {
  readonly root: ProjectRootBinding;
  readonly descriptor: VisualResourceDescriptor;
  readonly sourceIndex: number;
  readonly sourceRevision: string;
}
export interface AssetPreviewSnapshot {
  readonly state: 'idle' | 'loading' | 'ready' | 'unsupported' | 'failure' | 'disposed';
  readonly reason: string | null;
  readonly cleanupFailed: boolean;
  readonly pixels: 'NOT_VERIFIED';
}
export interface AssetPreviewController {
  readonly preview: (request: AssetPreviewRequest) => Promise<AssetPreviewSnapshot>;
  readonly getSnapshot: () => AssetPreviewSnapshot;
  readonly clear: () => AssetPreviewSnapshot;
  readonly dispose: () => AssetPreviewSnapshot;
}
/** Host borrows its existing viewport scene/session, supplies fresh canonical leases
 * from an exact root/provider/revision grant, schedules demand, and disposes this
 * controller before project switch/unmount. No graphics/session/cache ownership. */
export function createAssetPreviewController(context: AssetManagerProject, scene: RenderVisualScene,
  acquire: (request: AssetPreviewAcquisition) => VisualResourceLease,
  requestFrame: () => void,
): AssetPreviewController {
  requireAssetManagerProject(context);
  let state: AssetPreviewSnapshot['state'] = 'idle', reason: string | null = null;
  let cleanupFailed = false, epoch = 0, ordinal = 0, generation: number | undefined;
  let pending: VisualResourceLease | undefined, instance: RenderVisualInstance | undefined;
  const snapshot = (): AssetPreviewSnapshot => Object.freeze({ state, reason, cleanupFailed, pixels: 'NOT_VERIFIED' });
  const cleanup = (): void => {
    epoch++;
    const lease = pending, visual = instance; pending = undefined; instance = undefined;
    try { if (lease) cleanupFailed = lease.release().cleanupFailed || cleanupFailed; } catch { cleanupFailed = true; }
    try { if (visual) removeRenderVisualInstance(scene, visual); } catch { cleanupFailed = true; }
  };
  const clear = (): AssetPreviewSnapshot => {
    if (state === 'disposed') return snapshot();
    cleanup(); state = cleanupFailed ? 'failure' : 'idle'; reason = cleanupFailed ? 'CLEANUP_FAILED' : null;
    try { requestFrame(); } catch { state = 'failure'; reason = 'FRAME_REQUEST_FAILED'; }
    return snapshot();
  };
  const unsubscribe = observeManagedAssetSelection(context, () => { clear(); });
  const getSnapshot = (): AssetPreviewSnapshot => {
    if (state === 'disposed') return snapshot();
    try {
      const current = requireAssetManagerProject(context).snapshot;
      if (generation !== undefined && current.generation !== generation) { clear(); reason = 'STALE_CATALOG'; }
      if (state === 'ready' && instance && getRenderVisualInstanceResource(scene, instance)?.state !== 'usable') {
        cleanup(); state = 'failure'; reason = 'RESOURCE_UNAVAILABLE';
      }
    } catch { cleanup(); state = 'failure'; reason = 'STALE_CONTEXT'; }
    return snapshot();
  };
  return Object.freeze({ getSnapshot, clear,
    dispose() { if (state !== 'disposed') { cleanup(); unsubscribe(); state = 'disposed'; reason = null; } return snapshot(); },
    async preview(request: AssetPreviewRequest): Promise<AssetPreviewSnapshot> {
      if (state === 'disposed') throw new TypeError('PREVIEW_DISPOSED');
      clear();
      if (cleanupFailed) return snapshot();
      const initial = requireAssetManagerProject(context);
      generation = initial.snapshot.generation;
      const selection = getManagedAssetSelection(context);
      if (selection.status !== 'resolved') { state = 'idle'; reason = selection.status; return snapshot(); }
      const described = describeResolvedVisualAsset(resolveAssetReference(initial.snapshot.catalog, selection.reference), 'image/png');
      if (described.status !== 'described') { state = 'unsupported'; reason = described.reason; return snapshot(); }
      if (typeof request.sourceRevision !== 'string' || request.sourceRevision.length === 0)
        throw new TypeError('SOURCE_REVISION_REQUIRED');
      const sourceRevision = request.sourceRevision;
      // Canonical Render capture happens before awaiting host IO; no mutable pose retained.
      const visual = addRenderVisualInstance(scene, { visualInstanceId: `asset-preview-${++ordinal}` });
      instance = visual;
      const ticket = epoch;
      let lease: VisualResourceLease | undefined;
      state = 'loading'; reason = null;
      try {
        setRenderVisualInstanceTransform(scene, visual, request.transform);
        setRenderVisualInstanceSpriteLayout(scene, visual, request.layout);
        const sourceIndex = described.descriptor.sources.findIndex(source => source.role === 'image');
        lease = acquire(Object.freeze({ root: initial.root, descriptor: described.descriptor, sourceIndex,
          sourceRevision }));
        pending = lease;
        const loaded = await lease.result;
        if (ticket !== epoch) return snapshot();
        const current = requireAssetManagerProject(context);
        if (current.snapshot.generation !== generation) { clear(); reason = 'STALE_CATALOG'; return snapshot(); }
        if (loaded.state !== 'usable') { cleanup(); state = 'failure'; reason = 'RESOURCE_NOT_USABLE'; return snapshot(); }
        bindRenderVisualInstanceResource(scene, visual, { resource: lease,
          expectedSourceRevision: sourceRevision, frame: null });
        state = 'ready'; reason = null; requestFrame();
      } catch {
        if (ticket === epoch) { cleanup(); state = 'failure'; reason = 'PREVIEW_FAILED'; }
      } finally {
        if (pending === lease) pending = undefined;
        try { if (lease) cleanupFailed = lease.release().cleanupFailed || cleanupFailed; } catch { cleanupFailed = true; }
        if (cleanupFailed && snapshot().state !== 'disposed') { cleanup(); state = 'failure'; reason = 'CLEANUP_FAILED'; }
      }
      return snapshot();
    },
  });
}
