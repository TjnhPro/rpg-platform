import { Camera, REVISION, Scene, WebGLRenderer } from 'three';
import { FrameError } from './frame-failure.js';
import { readBrowserCanvas } from './canvas-target.js';

/** Private browser backend; never exposed through public declarations. */
export interface ThreeFrameBackend {
  readonly renderFrame: () => void;
  readonly dispose: () => void;
}

export function createThreeFrameBackend(input: object, onContextLost: () => void): ThreeFrameBackend {
  const supported = readBrowserCanvas(input);
  if (supported === undefined || supported.width <= 0 || supported.height <= 0) {
    throw new FrameError('UNSUPPORTED_TARGET', 'acquire');
  }
  const target = supported.canvas;

  // A null/lost native context is known unavailability; thrown host exceptions
  // remain unknown rather than being guessed to mean missing WebGL.
  const context = target.getContext('webgl2', { preserveDrawingBuffer: true });
  if (context === null || context.isContextLost()) {
    throw new FrameError('GRAPHICS_UNAVAILABLE', 'acquire');
  }

  let renderer: WebGLRenderer | undefined;
  let scene: Scene | undefined;
  let camera: Camera | undefined;
  let contextLost = false;
  let released = false;
  const handleContextLost = (): void => {
    // Synthetic browser events alone are not evidence of actual context loss.
    if (released || contextLost || !context.isContextLost()) return;
    contextLost = true;
    onContextLost(); // Session records terminal failure and attempts cleanup.
  };
  const previousEngineAttribute = target.getAttribute('data-engine');
  const dispose = (): void => {
    released = true; // Even a failed listener removal cannot revive a terminal session.
    const ownedRenderer = renderer;
    const ownedScene = scene;
    renderer = undefined;
    scene = undefined;
    camera = undefined;
    let failed = false;
    try { target.removeEventListener('webglcontextlost', handleContextLost); } catch { failed = true; }
    try { ownedScene?.clear(); } catch { failed = true; }
    try { ownedRenderer?.dispose(); } catch { failed = true; }
    try {
      // Undo Three's metadata only if the host has not changed it meanwhile.
      if (target.getAttribute('data-engine') === `three.js r${REVISION}`) {
        if (previousEngineAttribute === null) target.removeAttribute('data-engine');
        else target.setAttribute('data-engine', previousEngineAttribute);
      }
    } catch { failed = true; }
    // Browser owns the canvas/context lifetime. Never remove, resize or force
    // context loss on this borrowed canvas; dispose all Three-owned resources.
    if (failed) throw new FrameError('CLEANUP_FAILED', 'dispose', true);
  };

  try {
    renderer = new WebGLRenderer({ canvas: target, context, preserveDrawingBuffer: true });
    renderer.setClearColor(0x147da8, 1);
    scene = new Scene();
    camera = new Camera();
    // Three's earlier listener permits browser restoration. Our terminal cleanup
    // disposes Three and removes its restore listener before a later restore event.
    target.addEventListener('webglcontextlost', handleContextLost);
  } catch {
    let cleanupFailed = false;
    // A throwing constructor may leave inaccessible internal allocations. Never
    // promise full cleanup or reuse of that canvas when no renderer was returned.
    const constructionIncomplete = renderer === undefined;
    try { dispose(); } catch { cleanupFailed = true; }
    throw new FrameError('ACQUISITION_FAILED', 'acquire', cleanupFailed || constructionIncomplete);
  }

  return Object.freeze({
    renderFrame: (): void => {
      if (contextLost || context.isContextLost()) {
        contextLost = true;
        throw new FrameError('CONTEXT_LOST', 'renderFrame');
      }
      if (renderer === undefined || scene === undefined || camera === undefined) {
        throw new FrameError('FRAME_FAILED', 'renderFrame');
      }
      // Empty scene deliberately submits a visible, opaque blue clear frame.
      const previousFrame = renderer.info.render.frame;
      try {
        renderer.render(scene, camera);
      } catch (error) {
        if (context.isContextLost()) {
          contextLost = true;
          throw new FrameError('CONTEXT_LOST', 'renderFrame');
        }
        throw error;
      }
      const glError = context.getError();
      if (context.isContextLost() || glError === context.CONTEXT_LOST_WEBGL) {
        contextLost = true;
        throw new FrameError('CONTEXT_LOST', 'renderFrame');
      }
      if (renderer.info.render.frame !== previousFrame + 1 || glError !== context.NO_ERROR) {
        throw new FrameError('FRAME_FAILED', 'renderFrame');
      }
    },
    dispose,
  });
}
