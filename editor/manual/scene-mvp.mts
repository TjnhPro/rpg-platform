// Optional authored seven-object preview through the existing Editor public bridge.
import { createScenePreviewBridge, createSceneMembership, createAssetCatalog,
  type ScenePreviewPresentation } from '@rpg-platform/editor';
import { type RenderFrameSession, type RenderVisualScene, type VisualResourceDescriptor,
  type VisualResourceLease, type RenderVisualFrameBinding, type RenderVisualInstance,
  type RenderVisualInstanceTransformInput } from '@rpg-platform/runtime-render';
interface Visual {
  readonly key: string; readonly descriptor: VisualResourceDescriptor;
  readonly sourceIndex: number; readonly sourceRevision: string; readonly frame: RenderVisualFrameBinding | null;
  readonly x: number; readonly y: number; readonly width: number; readonly height: number;
  readonly layerKey: string; readonly order: number;
}
interface Input {
  readonly session: RenderFrameSession; readonly scene: RenderVisualScene; readonly specs: readonly Visual[];
  readonly transform: (spec: Visual, x?: number, y?: number) => RenderVisualInstanceTransformInput;
  readonly acquire: (spec: Visual) => VisualResourceLease;
  readonly requireOpen: () => void; readonly observe: () => unknown;
}
export function mountEditorSceneMvp(input: Input, report: (event: string, data: unknown) => void) {
  const log = (event: string, data: unknown): void => { try { report(event, data); } catch {} };
  const first = input.specs[0]; if (!first) throw new TypeError('Empty sample');
  const plane = input.transform(first).placement.plane;
  const space = { reference: { projectId: plane.projectId, coordinateSpaceId: plane.coordinateSpaceId },
    unit: plane.unit, axes: plane.axes, componentCount: 2 as const, origin: { x: 0, y: 0 } };
  const identity = { projectId: plane.projectId, sceneId: 'authored-courtyard' };
  const catalog = createAssetCatalog({ projectId: plane.projectId,
    definitions: [...new Map(input.specs.map(spec => [spec.descriptor.identity.resourceId, spec.descriptor])).values()]
      .map(descriptor => ({ identity: { projectId: plane.projectId, assetId: descriptor.identity.resourceId },
        kind: 'image', metadata: {}, sources: descriptor.sources })) });
  const bridge = createScenePreviewBridge(input.scene, identity, (descriptor, presentation) => {
    const spec = input.specs.find(item => item.descriptor.identity.resourceId === descriptor.identity.resourceId
      && item.sourceRevision === presentation.sourceRevision);
    if (!spec) throw new TypeError('Unknown authored resource'); return input.acquire(spec);
  });
  let closed = false, y = 142, visibleB = true, removedA = false, started = false;
  let player: RenderVisualInstance | null = null;
  const requireOpen = () => { if (closed) throw new TypeError('Editor consumer closed'); input.requireOpen(); };
  const draw = () => { requireOpen(); const receipt = input.session.renderFrame();
    log('Editor FRAME_SUBMITTED; NOT VISUAL_PASS', receipt); input.observe(); return receipt; };
  const sync = async () => {
    requireOpen();
    const authored = createSceneMembership({ scene: { identity }, objects: input.specs
      .filter(spec => !removedA || spec.key !== 'monster-a').map(spec => ({ definition: { objectId: spec.key },
        assetReference: { projectId: plane.projectId, assetId: spec.descriptor.identity.resourceId },
        placement: { coordinateSpaceId: plane.coordinateSpaceId, point: { x: spec.x, y: spec.key === 'player' ? y : spec.y } } })) });
    const policy = (key: string): ScenePreviewPresentation => {
      const spec = input.specs.find(item => item.key === key); if (!spec) throw new TypeError('Unknown authored key');
      const { placement: _placement, ...transform } = input.transform(spec);
      return { space, transform, layout: { unit: plane.unit, x: 0, y: 0, width: spec.width, height: spec.height },
        visible: spec.key === 'monster-b' ? visibleB : true, order: { layerKey: spec.layerKey, order: spec.order },
        bindingKey: `${spec.descriptor.identity.resourceId}:${spec.frame?.reference.subresourceId ?? 'whole'}`,
        sourceRevision: spec.sourceRevision, frame: spec.frame };
    };
    const outcomes = await bridge.sync(authored, catalog, description => policy(description.correlation.objectId));
    log('Editor authored sync partial outcomes', outcomes);
    if (closed) return;
    const next = outcomes.find(outcome => outcome.objectId === 'player')?.instance ?? null;
    log('Editor Player identity observation', { previous: player, current: next, sameHandle: player ? player === next : null });
    player = next;
    if (outcomes.some(outcome => outcome.status === 'diagnosed')) throw new TypeError('Editor preview has diagnosed partial outcomes');
    draw();
  };
  return Object.freeze({ draw,
    async open() { requireOpen(); if (started) throw new TypeError('One-shot Editor consumer'); started = true; await sync(); },
    movePlayer: async (next: number) => { requireOpen(); y = next; await sync(); },
    monsterB: async (value: boolean) => { requireOpen(); visibleB = value; await sync(); },
    removeMonsterA: async () => { requireOpen(); removedA = true; await sync(); },
    close() { if (closed) return; closed = true; log('Editor bridge close', bridge.close()); },
  });
}
