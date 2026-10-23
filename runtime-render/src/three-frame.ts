import { Camera, REVISION, Scene, WebGLRenderer } from 'three';
import { FrameError, getRenderFrameFailure } from './frame-failure.js';
import { readBrowserCanvas } from './canvas-target.js';
import type { RenderViewportSizePlan } from './viewport-size.js';

/** Private browser backend; never exposed through public declarations. */
export interface ThreeFrameBackend {
  readonly viewportSize: { readonly width: number; readonly height: number };
  readonly validateResize: (plan: RenderViewportSizePlan) => void;
  readonly resize: (plan: RenderViewportSizePlan) => {
    readonly size: { readonly width: number; readonly height: number };
    readonly changed: boolean;
  };
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
  let viewportSize: ThreeFrameBackend['viewportSize'];
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
    // Initial native extent; CSS size/ratio remain unknown until an explicit resize.
    viewportSize = Object.freeze({ width: context.drawingBufferWidth, height: context.drawingBufferHeight });
    if (viewportSize.width <= 0 || viewportSize.height <= 0 || context.isContextLost()) {
      throw new FrameError('GRAPHICS_UNAVAILABLE', 'acquire');
    }
    renderer.setViewport(0, 0, viewportSize.width, viewportSize.height);
    scene = new Scene();
    camera = new Camera();
    // Three's earlier listener permits browser restoration. Our terminal cleanup
    // disposes Three and removes its restore listener before a later restore event.
    target.addEventListener('webglcontextlost', handleContextLost);
  } catch (error) {
    let cleanupFailed = false;
    // A throwing constructor may leave inaccessible internal allocations. Never
    // promise full cleanup or reuse of that canvas when no renderer was returned.
    const constructionIncomplete = renderer === undefined;
    try { dispose(); } catch { cleanupFailed = true; }
    const known = getRenderFrameFailure(error);
    // Preserve a recognized acquisition reason (e.g. an unusable initial
    // drawing buffer), while retaining conservative partial-construction cleanup.
    throw new FrameError(known?.code ?? 'ACQUISITION_FAILED', 'acquire',
      cleanupFailed || constructionIncomplete || (known?.cleanupFailed ?? false));
  }

  return Object.freeze({
    get viewportSize() { return viewportSize; },
    validateResize: (plan: RenderViewportSizePlan): void => {
      if (contextLost || context.isContextLost()) throw new FrameError('CONTEXT_LOST', 'resize');
      if (released || renderer === undefined) throw new FrameError('RESIZE_FAILED', 'resize');
      const viewportLimit: unknown = context.getParameter(context.MAX_VIEWPORT_DIMS);
      const bufferLimit: unknown = context.getParameter(context.MAX_RENDERBUFFER_SIZE);
      if (context.isContextLost()) throw new FrameError('CONTEXT_LOST', 'resize');
      if (!(viewportLimit instanceof Int32Array) || viewportLimit.length < 2
          || typeof bufferLimit !== 'number' || !Number.isSafeInteger(bufferLimit) || bufferLimit < 1
          || !Number.isSafeInteger(viewportLimit[0]) || !Number.isSafeInteger(viewportLimit[1])
          || viewportLimit[0]! < 1 || viewportLimit[1]! < 1) {
        throw new FrameError('RESIZE_FAILED', 'resize');
      }
      if (plan.drawingBuffer.width > Math.min(viewportLimit[0]!, bufferLimit)
          || plan.drawingBuffer.height > Math.min(viewportLimit[1]!, bufferLimit)) {
        throw new RangeError('Viewport candidate exceeds native context dimension limits');
      }
    },
    resize: (plan: RenderViewportSizePlan) => {
      if (contextLost || context.isContextLost()) throw new FrameError('CONTEXT_LOST', 'resize');
      if (released || renderer === undefined) throw new FrameError('RESIZE_FAILED', 'resize');
      const { width, height } = plan.drawingBuffer;
      // Plan already applied ratio and rounding. Three remains at its private
      // default ratio 1: passing logical CSS extents here would scale incorrectly.
      const changed = target.width !== width || target.height !== height;
      try {
        if (changed) renderer.setSize(width, height, false);
        const actualWidth = context.drawingBufferWidth;
        const actualHeight = context.drawingBufferHeight;
        if (context.isContextLost()) throw new FrameError('CONTEXT_LOST', 'resize');
        if (!Number.isSafeInteger(actualWidth) || !Number.isSafeInteger(actualHeight)
            || actualWidth < 1 || actualHeight < 1 || actualWidth > width || actualHeight > height) {
          throw new FrameError('RESIZE_FAILED', 'resize');
        }
        // Implementation may accept less than requested. Configure the viewport
        // from native dimensions, not Three's requested-size bookkeeping.
        renderer.setViewport(0, 0, actualWidth, actualHeight);
        const glError = context.getError();
        if (context.isContextLost() || glError === context.CONTEXT_LOST_WEBGL) {
          throw new FrameError('CONTEXT_LOST', 'resize');
        }
        if (glError !== context.NO_ERROR) throw new FrameError('RESIZE_FAILED', 'resize');
        viewportSize = Object.freeze({ width: actualWidth, height: actualHeight });
        return Object.freeze({ size: viewportSize, changed });
      } catch (error) {
        if (context.isContextLost()) throw new FrameError('CONTEXT_LOST', 'resize');
        throw error; // Unknown exceptions remain unknown; session handles cleanup.
      }
    },
    renderFrame: (): void => {
      if (contextLost || context.isContextLost()) {
        contextLost = true;
        throw new FrameError('CONTEXT_LOST', 'renderFrame');
      }
      if (renderer === undefined || scene === undefined || camera === undefined) {
        throw new FrameError('FRAME_FAILED', 'renderFrame');
      }
      // Host must use the public resize path for a live session. A zero or
      // externally replaced backing extent cannot receipt the configured viewport.
      if (context.drawingBufferWidth !== viewportSize.width
          || context.drawingBufferHeight !== viewportSize.height) {
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
      if (glError !== context.NO_ERROR) {
        throw new FrameError('FRAME_FAILED', 'renderFrame');
      }
      // Three can return early without throwing (invalid camera/internal loss).
      // Its counter alone is not GPU completion, but an unchanged counter cannot
      // establish that this private opaque-clear render path submitted anything.
      if (renderer.info.render.frame === previousFrame) {
        throw new FrameError('FRAME_NOT_SUBMITTED', 'renderFrame');
      }
      if (renderer.info.render.frame !== previousFrame + 1) {
        throw new FrameError('FRAME_FAILED', 'renderFrame');
      }
    },
    dispose,
  });
}
