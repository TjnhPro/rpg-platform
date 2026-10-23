import { Camera, REVISION, Scene, WebGLRenderer } from 'three';
import { FrameError } from './frame-failure.js';
import { readBrowserCanvas } from './canvas-target.js';

/** Private browser backend; never exposed through public declarations. */
export interface ThreeFrameBackend {
  readonly renderFrame: () => void;
  readonly dispose: () => void;
}

export function createThreeFrameBackend(input: object): ThreeFrameBackend {
  const supported = readBrowserCanvas(input);
  if (supported === undefined || supported.width <= 0 || supported.height <= 0) {
    throw new FrameError('UNSUPPORTED_TARGET', 'acquire');
  }
  const target = supported.canvas;

  let context: WebGL2RenderingContext | null;
  try {
    context = target.getContext('webgl2', { preserveDrawingBuffer: true });
  } catch {
    throw new FrameError('GRAPHICS_UNAVAILABLE', 'acquire');
  }
  if (context === null || context.isContextLost()) {
    throw new FrameError('GRAPHICS_UNAVAILABLE', 'acquire');
  }

  let renderer: WebGLRenderer | undefined;
  let scene: Scene | undefined;
  let camera: Camera | undefined;
  const previousEngineAttribute = target.getAttribute('data-engine');
  const dispose = (): void => {
    const ownedRenderer = renderer;
    const ownedScene = scene;
    renderer = undefined;
    scene = undefined;
    camera = undefined;
    let failed = false;
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
      if (renderer === undefined || scene === undefined || camera === undefined || context.isContextLost()) {
        throw new Error('Graphics resources unavailable');
      }
      // Empty scene deliberately submits a visible, opaque blue clear frame.
      const previousFrame = renderer.info.render.frame;
      renderer.render(scene, camera);
      if (renderer.info.render.frame !== previousFrame + 1
        || context.isContextLost() || context.getError() !== context.NO_ERROR) {
        throw new Error('Frame submission encountered a graphics error');
      }
    },
    dispose,
  });
}
