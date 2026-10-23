import {
  addRenderVisualInstance, removeRenderVisualInstance, bindRenderVisualInstanceResource,
  getRenderVisualInstanceResource, setRenderVisualInstanceTransform, setRenderVisualInstanceSpriteLayout,
  createPlanarTransform2D, createVisualAnchor2D, createVisualOrientation2D, createOrthographicPlaneProjection,
  setRenderVisualInstanceVisible, setRenderVisualInstanceOrder, getRenderVisualDiagnostic,
  type RenderVisualScene, type RenderVisualInstance, type RenderVisualInstanceTransformInput,
  type RenderVisualSpriteLayout, type RenderVisualInstanceOrder, type RenderVisualFrameBinding,
  type VisualResourceDescriptor, type VisualResourceLease, type RenderVisualDiagnostic,
} from '@rpg-platform/runtime-render';
import { createSceneMembership, type SceneMembership } from './scene-membership.js';
import { createAssetCatalog, type AssetCatalog } from './asset-catalog.js';
import { createSceneIdentity, type SceneIdentity } from './scene-definition.js';
import { describeSceneObjectVisual, type SceneObjectVisualDescription } from './scene-visual.js';
import { describeSceneObjectSpatialPoint } from './scene-spatial-point.js';
import { createCoordinateSpaceDefinition, type CoordinateSpaceDefinition } from './coordinate-space.js';

function capturePresentation(input: ScenePreviewPresentation): ScenePreviewPresentation {
  return Object.freeze({ space: createCoordinateSpaceDefinition(input.space),
    transform: Object.freeze({ local: createPlanarTransform2D(input.transform.local),
      anchor: createVisualAnchor2D(input.transform.anchor), orientation: createVisualOrientation2D(input.transform.orientation),
      projection: createOrthographicPlaneProjection(input.transform.projection) }),
    layout: Object.freeze({ ...input.layout }), visible: input.visible, order: Object.freeze({ ...input.order }),
    bindingKey: input.bindingKey, sourceRevision: input.sourceRevision,
    frame: input.frame === null ? null : Object.freeze({ ...input.frame,
      reference: Object.freeze({ ...input.frame.reference }), pixels: Object.freeze({ ...input.frame.pixels }) }),
  });
}

/** Explicit host presentation policy; no authored layer/order, extent or projection defaults. */
export interface ScenePreviewPresentation {
  readonly space: CoordinateSpaceDefinition;
  readonly transform: Omit<RenderVisualInstanceTransformInput, 'placement'>;
  readonly layout: RenderVisualSpriteLayout;
  readonly visible: boolean;
  readonly order: RenderVisualInstanceOrder;
  /** Change for source, sampling, frame/page/revision or other binding policy changes. */
  readonly bindingKey: string;
  readonly sourceRevision: string;
  readonly frame: RenderVisualFrameBinding | null;
}

export interface ScenePreviewOutcome {
  readonly objectId: string;
  readonly status: 'applied' | 'removed' | 'diagnosed';
  readonly reason: string | null;
  /** Historical handle only; diagnosed updates may have partially committed. */
  readonly instance: RenderVisualInstance | null;
  readonly failure: RenderVisualDiagnostic | null;
  readonly cleanupFailed: boolean;
}

export interface ScenePreviewBridge {
  /** Serial batches only. Captures authored inputs; each object has an explicit partial outcome. */
  readonly sync: (membership: SceneMembership, catalog: AssetCatalog,
    policy: (description: Extract<SceneObjectVisualDescription, { status: 'described' }>) => ScenePreviewPresentation,
  ) => Promise<readonly ScenePreviewOutcome[]>;
  /** Drains only this bridge's instances/pending leases, never the borrowed scene/session/cache. */
  readonly close: () => readonly ScenePreviewOutcome[];
}

/** One preview-only mapping for one authored Scene. Owns no document or graphics lifecycle.
 * acquire must issue a fresh host-owned Phase7 lease per call, using the supplied descriptor.
 * Host keeps the borrowed scene exclusive from external membership edits until close. */
export function createScenePreviewBridge(scene: RenderVisualScene, identityInput: SceneIdentity,
  acquire: (descriptor: VisualResourceDescriptor, presentation: ScenePreviewPresentation) => VisualResourceLease,
): ScenePreviewBridge {
  const identity = createSceneIdentity(identityInput);
  const entries = new Map<string, { instance: RenderVisualInstance; bindingKey: string | null; frameRevision: symbol | null }>();
  const pending = new Set<VisualResourceLease>();
  let closed = false, busy = false, cleanupUncertain = false, ordinal = 0;
  const outcome = (objectId: string, status: ScenePreviewOutcome['status'], reason: string | null,
    instance: RenderVisualInstance | null, failure: RenderVisualDiagnostic | null = null,
    cleanupFailed = false): ScenePreviewOutcome => {
    cleanupUncertain ||= cleanupFailed;
    return Object.freeze({ objectId, status, reason, instance, failure, cleanupFailed });
  };
  const remove = (id: string): ScenePreviewOutcome => {
    const entry = entries.get(id)!;
    // Render unlinks before cleanup; do not accidentally release another object's rights.
    try { removeRenderVisualInstance(scene, entry.instance); entries.delete(id);
      return outcome(id, 'removed', null, entry.instance); }
    catch (error) { return outcome(id, 'diagnosed', 'REMOVE_FAILED', entry.instance, getRenderVisualDiagnostic(error), true); }
  };
  return Object.freeze({
    async sync(membership: SceneMembership, catalog: AssetCatalog,
      policy: (description: Extract<SceneObjectVisualDescription, { status: 'described' }>) => ScenePreviewPresentation,
    ): Promise<readonly ScenePreviewOutcome[]> {
      if (closed || busy || cleanupUncertain) throw new TypeError('Preview bridge closed, cleanup uncertain or batch in progress');
      // Whole-membership structural validation precedes any mutation/removal.
      const captured = createSceneMembership(membership), assets = createAssetCatalog(catalog);
      if (captured.scene.identity.projectId !== identity.projectId || captured.scene.identity.sceneId !== identity.sceneId
        || assets.projectId !== identity.projectId) throw new TypeError('Preview Scene/project mismatch');
      busy = true;
      const results: ScenePreviewOutcome[] = [];
      try {
        const ids = new Set(captured.objects.map(object => object.definition.objectId));
        for (const id of entries.keys()) if (!ids.has(id)) results.push(remove(id));
        for (const object of captured.objects) {
          const id = object.definition.objectId;
          let lease: VisualResourceLease | undefined;
          let error: unknown, failed = false, cleanupFailed = false;
          let reason: string | null = null;
          try {
            if (closed || cleanupUncertain) { reason = closed ? 'BRIDGE_CLOSED' : 'CLEANUP_UNCERTAIN'; continue; }
            const description = describeSceneObjectVisual(captured, id, assets, 'image/png');
            if (description.status !== 'described') { reason = description.reason; continue; }
            const plan = capturePresentation(policy(description));
            if (closed) { reason = 'BRIDGE_CLOSED'; continue; }
            const spatial = describeSceneObjectSpatialPoint(captured, id, plan.space);
            if (spatial.status !== 'described') { reason = spatial.reason; continue; }
            if (typeof plan.bindingKey !== 'string' || plan.bindingKey.trim().length === 0) {
              throw new TypeError('Explicit nonblank preview binding key required');
            }
            const key = JSON.stringify([description.descriptor, plan.bindingKey, plan.sourceRevision,
              plan.frame?.reference, plan.frame?.pixels]);
            const frameRevision = plan.frame?.expectedRevision ?? null;
            let entry = entries.get(id);
            const rebind = entry === undefined || entry.bindingKey !== key || entry.frameRevision !== frameRevision
              || getRenderVisualInstanceResource(scene, entry.instance)?.state !== 'usable';
            if (rebind) {
              lease = acquire(description.descriptor, plan); pending.add(lease);
              const loaded = await lease.result;
              if (closed) { reason = 'BRIDGE_CLOSED'; continue; }
              if (loaded.state !== 'usable') { reason = `RESOURCE_${loaded.state.toUpperCase()}`; continue; }
            }
            if (entry === undefined) {
              if (!Number.isSafeInteger(++ordinal)) throw new RangeError('Preview identity capacity exhausted');
              entry = { instance: addRenderVisualInstance(scene, { visualInstanceId: `preview-${ordinal}`,
                correlation: description.correlation }), bindingKey: null, frameRevision: null };
              entries.set(id, entry);
            }
            if (lease !== undefined) {
              bindRenderVisualInstanceResource(scene, entry.instance, { resource: lease,
                expectedSourceRevision: plan.sourceRevision, frame: plan.frame });
              entry.bindingKey = key;
              entry.frameRevision = frameRevision;
            }
            setRenderVisualInstanceTransform(scene, entry.instance, { ...plan.transform, placement: spatial.request });
            setRenderVisualInstanceSpriteLayout(scene, entry.instance, plan.layout);
            setRenderVisualInstanceVisible(scene, entry.instance, plan.visible);
            setRenderVisualInstanceOrder(scene, entry.instance, plan.order);
          } catch (caught) {
            error = caught; failed = true; reason = 'UPDATE_FAILED';
            cleanupFailed ||= getRenderVisualDiagnostic(caught).cleanupFailed === true;
          }
          finally {
            if (lease !== undefined && pending.delete(lease)) {
              try { cleanupFailed = lease.release().cleanupFailed || cleanupFailed; }
              catch (caught) { cleanupFailed = true; error = caught; failed = true; }
            }
            results.push(outcome(id, reason === null && !failed && !cleanupFailed ? 'applied' : 'diagnosed',
              cleanupFailed ? 'LEASE_CLEANUP_FAILED' : reason, entries.get(id)?.instance ?? null,
              failed ? getRenderVisualDiagnostic(error) : null, cleanupFailed));
          }
        }
        return Object.freeze(results);
      } finally { busy = false; }
    },
    close(): readonly ScenePreviewOutcome[] {
      closed = true;
      const results: ScenePreviewOutcome[] = [];
      for (const lease of pending) {
        pending.delete(lease);
        try { const ended = lease.release(); if (ended.cleanupFailed) results.push(outcome('', 'diagnosed', 'LEASE_CLEANUP_FAILED', null, null, true)); }
        catch (error) { results.push(outcome('', 'diagnosed', 'LEASE_CLEANUP_FAILED', null, getRenderVisualDiagnostic(error), true)); }
      }
      for (const id of entries.keys()) results.push(remove(id));
      if (cleanupUncertain) results.push(outcome('', 'diagnosed', 'CLEANUP_UNCERTAIN', null, null, true));
      return Object.freeze(results);
    },
  });
}
