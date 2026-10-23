import { Camera, Object3D, REVISION, Scene, WebGLRenderer } from 'three';
import type { AffineTransform2D } from './planar-affine.js';
import { FrameError, getRenderFrameFailure } from './frame-failure.js';
import { readBrowserCanvas } from './canvas-target.js';
import type { RenderViewportSizePlan } from './viewport-size.js';
import { createTextureLifetime } from './texture-lifetime.js';
import { TextureError, textureBacking, type RenderTexture, type RenderTextureOptions } from './render-texture.js';
import { createDemoQuad } from './demo-quad.js';
import type { DemoTextureRequest } from './visual-resource-demo.js';

/** Private browser backend; never exposed through public declarations. */
export interface ThreeFrameBackend {
  readonly viewportSize: { readonly width: number; readonly height: number };
  readonly validateResize: (plan: RenderViewportSizePlan) => void;
  readonly resize: (plan: RenderViewportSizePlan) => {
    readonly size: { readonly width: number; readonly height: number };
    readonly changed: boolean;
  };
  readonly renderFrame: (demo?: DemoTextureRequest) => void;
  readonly uploadTexture: (sessionId: symbol, bitmap: ImageBitmap, options: RenderTextureOptions) => RenderTexture;
  readonly setVisualTransform: (instance: object, matrix: AffineTransform2D | null) => void;
  readonly dispose: () => void;
}

export function createThreeFrameBackend(
  input: object, onContextLost: () => void, onResourceFailure: (error: unknown) => void,
): ThreeFrameBackend {
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
  const textures = new Set<ReturnType<typeof createTextureLifetime>>();
  const nativeTextures = new Map<RenderTexture, WebGLTexture>();
  let demoQuad: ReturnType<typeof createDemoQuad> | undefined;
  let textureCleanupFailed = false;
  const visualNodes = new Map<object, Object3D>();
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
    visualNodes.clear(); // Nodes own no materials/geometry/GPU resources.
    let failed = textureCleanupFailed;
    // Invalidate every resource before releasing the renderer; never close CPU images.
    for (const texture of [...textures]) {
      try { texture.invalidate(); } catch { failed = true; }
    }
    textures.clear();
    nativeTextures.clear();
    const quad = demoQuad; demoQuad = undefined;
    try { quad?.dispose(); } catch { failed = true; }
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
    setVisualTransform: (instance: object, matrix: AffineTransform2D | null): void => {
      if (contextLost || context.isContextLost()) throw new FrameError('CONTEXT_LOST', 'renderFrame');
      if (released || scene === undefined) throw new FrameError('FRAME_FAILED', 'renderFrame');
      const previous = visualNodes.get(instance);
      if (matrix === null) {
        visualNodes.delete(instance);
        if (previous !== undefined) scene.remove(previous);
        return;
      }
      const node = previous ?? new Object3D();
      node.matrixAutoUpdate = false;
      // Explicit local-plane -> clip mapping; fixed existing identity Camera, z=0.
      // No TRS decomposition: preserve nonuniform scale/reflection/affine shear.
      node.matrix.set(matrix.a, matrix.c, 0, matrix.tx,
        matrix.b, matrix.d, 0, matrix.ty, 0, 0, 1, 0, 0, 0, 0, 1);
      node.matrixWorldNeedsUpdate = true;
      if (previous === undefined) { visualNodes.set(instance, node); scene.add(node); }
      node.updateMatrixWorld(true);
    },
    uploadTexture: (sessionId: symbol, bitmap: ImageBitmap, options: RenderTextureOptions): RenderTexture => {
      if (contextLost || context.isContextLost()) throw new TextureError('CONTEXT_LOST');
      if (released || renderer === undefined) throw new TextureError('SESSION_UNAVAILABLE');
      const ownedRenderer = renderer;
      const { width, height } = bitmap;
      const maxSize: unknown = context.getParameter(context.MAX_TEXTURE_SIZE);
      if (typeof maxSize !== 'number' || !Number.isSafeInteger(maxSize) || maxSize <= 0) {
        throw new TextureError('UPLOAD_FAILED');
      }
      if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width < 1 || height < 1
        || width > maxSize || height > maxSize) throw new TextureError('TEXTURE_LIMIT_EXCEEDED');
      // Never drain and hide an existing GL error before claiming our upload succeeded.
      if (context.getError() !== context.NO_ERROR) throw new TextureError('GL_STATE_ERROR');
      let native: WebGLTexture | null = null;
      const destroy = (texture: WebGLTexture): void => {
        try {
          context.deleteTexture(texture);
          const error = context.getError();
          if (!context.isContextLost() && error !== context.NO_ERROR) throw new TextureError('CLEANUP_FAILED', true);
        } catch (error) {
          textureCleanupFailed = true;
          throw error;
        }
      };
      try {
        // Public Three resetState synchronizes its state cache around private native work.
        // Direct upload avoids Three r186's catch-and-log texImage2D wrapper.
        ownedRenderer.resetState();
        context.bindBuffer(context.PIXEL_UNPACK_BUFFER, null);
        native = context.createTexture();
        if (native === null) throw new TextureError('UPLOAD_FAILED');
        context.activeTexture(context.TEXTURE0);
        context.bindTexture(context.TEXTURE_2D, native);
        const sampling = options.sampling === 'nearest' ? context.NEAREST : context.LINEAR;
        context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, sampling);
        context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, sampling);
        context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_S, context.CLAMP_TO_EDGE);
        context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_T, context.CLAMP_TO_EDGE);
        context.texParameteri(context.TEXTURE_2D, context.TEXTURE_BASE_LEVEL, 0);
        context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAX_LEVEL, 0);
        context.pixelStorei(context.UNPACK_ALIGNMENT, 1);
        context.pixelStorei(context.UNPACK_FLIP_Y_WEBGL, false);
        context.pixelStorei(context.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        context.pixelStorei(context.UNPACK_COLORSPACE_CONVERSION_WEBGL, context.NONE);
        context.texImage2D(context.TEXTURE_2D, 0,
          options.colorSpace === 'srgb' ? context.SRGB8_ALPHA8 : context.RGBA8,
          context.RGBA, context.UNSIGNED_BYTE, bitmap);
        const exists = context.isTexture(native);
        context.bindTexture(context.TEXTURE_2D, null);
        ownedRenderer.resetState();
        ownedRenderer.setViewport(0, 0, viewportSize.width, viewportSize.height);
        ownedRenderer.setClearColor(0x147da8, 1);
        const glError = context.getError();
        if (contextLost || context.isContextLost() || released || renderer !== ownedRenderer) {
          throw new TextureError('CONTEXT_LOST');
        }
        if (!exists || glError !== context.NO_ERROR) throw new TextureError('UPLOAD_FAILED');
        const uploaded = native;
        const resource = createTextureLifetime(sessionId, width, height, options, () => {
          textures.delete(resource);
          nativeTextures.delete(resource.handle);
          try { destroy(uploaded); }
          catch (error) {
            // Unknown errors remain original. Existing session cleanup records uncertainty.
            if (!released) onResourceFailure(error);
            throw error;
          }
        }, handleContextLost);
        textures.add(resource);
        nativeTextures.set(resource.handle, uploaded);
        native = null; // Ownership moved into the resource; no ImageBitmap reference retained.
        return resource.handle;
      } catch (error) {
        if (native !== null) {
          try { destroy(native); } catch { /* sticky cleanup failure quarantines the session */ }
        }
        throw error;
      }
    },
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
    renderFrame: (demo?: DemoTextureRequest): void => {
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
      // Presentation nodes have no drawables yet; the opaque blue clear remains.
      const previousFrame = renderer.info.render.frame;
      try {
        renderer.render(scene, camera);
        if (demo !== undefined) {
          const backing = textureBacking(demo.texture);
          const native = backing === undefined ? undefined : nativeTextures.get(backing);
          if (native === undefined || context.getError() !== context.NO_ERROR) {
            throw new FrameError('FRAME_FAILED', 'renderFrame');
          }
          renderer.resetState();
          context.viewport(0, 0, viewportSize.width, viewportSize.height);
          demoQuad ??= createDemoQuad(context);
          demoQuad.draw(native, demo.uv);
          renderer.resetState();
          renderer.setViewport(0, 0, viewportSize.width, viewportSize.height);
          renderer.setClearColor(0x147da8, 1);
        }
      } catch (error) {
        if (getRenderFrameFailure(error)?.cleanupFailed) textureCleanupFailed = true;
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
