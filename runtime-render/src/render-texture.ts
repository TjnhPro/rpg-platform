import type { RenderFrameSession } from './frame-session.js';
import type { PngImageDecode } from './png-image.js';

/** Explicit choice per upload; nearest is the pixel-art profile, not a platform mandate. */
export interface RenderTextureOptions {
  readonly sampling: 'nearest' | 'linear';
  /** Host declares interpretation of decoded channels; no guessed PNG color profile. */
  readonly colorSpace: 'srgb' | 'linear-srgb';
}

export interface RenderTextureSnapshot {
  readonly id: symbol;
  readonly sessionId: symbol;
  readonly stage: 'gpu-texture';
  /** Usable = upload accepted without detected GL error; never GPU completion/display. */
  readonly state: 'usable' | 'released' | 'invalidated';
  readonly width: number;
  readonly height: number;
  readonly options: RenderTextureOptions;
  readonly cleanup: 'owned' | 'deleted' | 'delete-failed';
}

/** Opaque context-bound capability; no native/Three/bitmap reference escapes. */
export interface RenderTexture {
  readonly getSnapshot: () => RenderTextureSnapshot;
  readonly release: () => RenderTextureSnapshot;
}

export interface RenderTextureFailure {
  readonly code: 'SESSION_UNAVAILABLE' | 'IMAGE_NOT_DECODED' | 'CONTEXT_MISMATCH'
    | 'TEXTURE_LIMIT_EXCEEDED' | 'CONTEXT_LOST' | 'GL_STATE_ERROR' | 'UPLOAD_FAILED' | 'CLEANUP_FAILED';
  readonly cleanupFailed: boolean;
}

/** Package-private branded failure; unknown host/native errors stay unchanged. */
export class TextureError extends Error {
  readonly #failure: RenderTextureFailure;
  constructor(code: RenderTextureFailure['code'], cleanupFailed = false) {
    super(`Render texture operation failed: ${code}`);
    this.#failure = Object.freeze({ code, cleanupFailed });
  }
  static classify(error: unknown): RenderTextureFailure | undefined {
    return typeof error === 'object' && error !== null && #failure in error ? error.#failure : undefined;
  }
}

export function getRenderTextureFailure(error: unknown): RenderTextureFailure | undefined {
  return TextureError.classify(error);
}

// Weak dispatch/identity guards like the viewport APIs, not active-resource stores or caches.
const sessions = new WeakMap<RenderFrameSession, { readonly id: symbol;
  readonly upload: (image: PngImageDecode, options: RenderTextureOptions) => RenderTexture }>();
const textures = new WeakMap<RenderTexture, { readonly sessionId: symbol;
  readonly read: () => RenderTextureSnapshot }>();

/** Internal registration; no backend objects are exposed through root declarations. */
export function registerTextureSession(
  session: RenderFrameSession, id: symbol,
  upload: (image: PngImageDecode, options: RenderTextureOptions) => RenderTexture,
): void { sessions.set(session, { id, upload }); }

/** Internal capability branding, retained only while the caller holds the handle. */
export function registerRenderTexture(handle: RenderTexture, sessionId: symbol, read: () => RenderTextureSnapshot): void {
  textures.set(handle, { sessionId, read });
}

/** Synchronous upload into the existing canonical session. Never creates a session. */
export function uploadPngTexture(
  session: RenderFrameSession, image: PngImageDecode, options: RenderTextureOptions,
): RenderTexture {
  const control = sessions.get(session);
  if (control === undefined) throw new TypeError('Expected a graphics session from this Render package instance');
  const captured = Object.freeze({ sampling: options.sampling, colorSpace: options.colorSpace });
  if ((captured.sampling !== 'nearest' && captured.sampling !== 'linear')
    || (captured.colorSpace !== 'srgb' && captured.colorSpace !== 'linear-srgb')) {
    throw new TypeError('Explicit texture sampling and color interpretation are required');
  }
  return control.upload(image, captured);
}

/** Validate ownership before observing; a different/new context is never successful reuse. */
export function getRenderTextureSnapshot(session: RenderFrameSession, texture: RenderTexture): RenderTextureSnapshot {
  const owner = sessions.get(session), binding = textures.get(texture);
  if (owner === undefined || binding === undefined) throw new TypeError('Expected canonical graphics and texture handles');
  if (owner.id !== binding.sessionId) throw new TextureError('CONTEXT_MISMATCH');
  return binding.read();
}
