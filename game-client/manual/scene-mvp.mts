// Optional Client-only finite public consumer; no Editor format, import or game loop.
import {
  addRenderVisualInstance, bindRenderVisualInstanceResource, removeRenderVisualInstance,
  setRenderVisualInstanceTransform, setRenderVisualInstanceSpriteLayout,
  setRenderVisualInstanceVisible, setRenderVisualInstanceOrder, getRenderVisualDiagnostic, getRenderVisualInstance,
  type RenderFrameSession, type RenderVisualScene, type RenderVisualInstance,
  type VisualResourceDescriptor, type VisualResourceLease, type RenderVisualFrameBinding,
  type RenderVisualInstanceTransformInput,
} from '@rpg-platform/runtime-render';
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
export function mountClientSceneMvp(input: Input, report: (event: string, data: unknown) => void) {
  const log = (event: string, data: unknown): void => { try { report(event, data); } catch {} };
  const handles = new Map<string, RenderVisualInstance>();
  let closed = false, started = false;
  const requireOpen = () => { if (closed) throw new TypeError('Client consumer closed'); input.requireOpen(); };
  const select = (key: string) => { requireOpen(); const value = handles.get(key);
    if (!value) throw new TypeError('Missing Client visual'); return value; };
  const draw = () => { requireOpen(); const receipt = input.session.renderFrame();
    log('Client FRAME_SUBMITTED; NOT VISUAL_PASS', receipt); input.observe(); return receipt; };
  const close = () => {
    if (closed) return; closed = true;
    for (const [key, handle] of handles) {
      try { removeRenderVisualInstance(input.scene, handle); }
      catch (error) { log('Client removal cleanup uncertain', { key, diagnostic: getRenderVisualDiagnostic(error) }); }
    }
    handles.clear();
  };
  return Object.freeze({ draw, close,
    async open() {
      requireOpen(); if (started) throw new TypeError('One-shot Client consumer'); started = true;
      for (const spec of input.specs) {
        requireOpen(); const lease = input.acquire(spec);
        try {
          const loaded = await lease.result; requireOpen();
          log('Client actual loaded lease', { key: spec.key, state: loaded.state });
          if (loaded.state !== 'usable') throw new TypeError('Client source not usable');
          const handle = addRenderVisualInstance(input.scene, { visualInstanceId: `client-${spec.key}` });
          handles.set(spec.key, handle); // Preserve partial outcomes if later operations reject.
          bindRenderVisualInstanceResource(input.scene, handle, { resource: lease,
            expectedSourceRevision: spec.sourceRevision, frame: spec.frame });
          setRenderVisualInstanceTransform(input.scene, handle, input.transform(spec));
          setRenderVisualInstanceSpriteLayout(input.scene, handle, { unit: 'scene-unit', x: 0, y: 0, width: spec.width, height: spec.height });
          setRenderVisualInstanceOrder(input.scene, handle, { layerKey: spec.layerKey, order: spec.order });
        } finally { log('Client temporary lease release', lease.release()); }
      }
      log('Client seven neutral handles; runtime observations only', [...handles.values()]); draw();
    },
    movePlayer(y: number) {
      const spec = input.specs.find(item => item.key === 'player');
      if (!spec) throw new TypeError('Player sample missing');
      const handle = select('player');
      setRenderVisualInstanceTransform(input.scene, handle, input.transform(spec, spec.x, y));
      log('Client Player handle retained', { handle,
        sameHandle: getRenderVisualInstance(input.scene, handle.visualInstanceId) === handle }); draw();
    },
    monsterB(visible: boolean) { setRenderVisualInstanceVisible(input.scene, select('monster-b'), visible); draw(); },
    removeMonsterA() {
      const handle = select('monster-a');
      const removed = removeRenderVisualInstance(input.scene, handle); handles.delete('monster-a');
      log('Client scoped removal', { removed, handle }); draw();
    },
  });
}
