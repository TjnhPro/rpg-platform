import { getRenderVisualDiagnostic, type RenderHostBinding, type VisualSourceProvider } from '@rpg-platform/runtime-render';
import { openVisualSceneFrames, type ManualVisualInput } from './visual-scene-frame.mjs';

/** Optional manual two-canvas walkthrough. Real Phase7 loads; no assertions or autorun. */
export async function openVisualLifetime(hostA: RenderHostBinding, hostB: RenderHostBinding,
  provider: VisualSourceProvider, image: ManualVisualInput,
  report: (label: string, value: unknown) => void) {
  // Each host uses the canonical backend; both A members share one actual resource.
  const a = await openVisualSceneFrames(hostA, provider, [image, image], () => {});
  const b = await openVisualSceneFrames(hostB, provider, [image, image], () => {})
    .catch(error => { a.close(); throw error; });
  const observe = () => report('Scope counts; not GPU health', { a: a.inspect(), b: b.inspect() });
  const action = (label: string, run: () => unknown) => {
    try { report(label, run()); } catch (error) { report(label, getRenderVisualDiagnostic(error)); }
    observe();
  };
  return Object.freeze({ observe,
    removeAFirst() { action('Remove A first; shared second retained', () => a.removeFirst()); },
    drawA() { action('A submitted only', () => a.draw()); },
    drawB() { action('B submitted only', () => b.draw()); },
    invalidBind() { action('Bind released host lease', () => a.bindReleased()); },
    disposeAScene() { action('A scene dispose/repeat', () => a.disposeScene()); },
    disposeASession() { action('A session dispose/repeat', () => a.disposeSession()); },
    close() { try { a.close(); } finally { b.close(); } observe(); },
  });
}
