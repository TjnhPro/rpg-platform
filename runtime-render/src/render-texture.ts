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
  readonly upload: (image: PngImageDecode, options: RenderTextureOptions) => RenderTexture;
  terminal: boolean; readonly listeners: Set<() => void> }>();
const textures = new WeakMap<RenderTexture, { readonly sessionId: symbol;
  readonly read: () => RenderTextureSnapshot; readonly backing: RenderTexture }>();

/** Internal registration; no backend objects are exposed through root declarations. */
export function registerTextureSession(
  session: RenderFrameSession, id: symbol,
  upload: (image: PngImageDecode, options: RenderTextureOptions) => RenderTexture,
): void { sessions.set(session, { id, upload, terminal: false, listeners: new Set() }); }

/** Internal capability branding, retained only while the caller holds the handle. */
export function registerRenderTexture(handle: RenderTexture, sessionId: symbol, read: () => RenderTextureSnapshot, backing = handle): void {
  textures.set(handle, { sessionId, read, backing });
}
/** Private backing identity only; never returns a native object. Caller validates the live right. */
export const textureBacking = (handle: RenderTexture): RenderTexture | undefined => textures.get(handle)?.backing;

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

/** Internal canonical admission, before source IO or cache reuse. */
export function requireTextureSession(session: RenderFrameSession): symbol {
  const control = sessions.get(session);
  if (control === undefined) throw new TypeError('Expected a canonical graphics session');
  if (control.terminal) throw new TextureError('SESSION_UNAVAILABLE');
  return control.id;
}

/** Internal owned cleanup subscription; removed when the cache has no session entries. */
export function onTextureSessionEnd(session: RenderFrameSession, listener: () => void): () => void {
  requireTextureSession(session);
  const control = sessions.get(session)!;
  control.listeners.add(listener);
  return () => { control.listeners.delete(listener); };
}

/** Called by canonical terminal cleanup before backend disposal. Always drains listeners. */
export function endTextureSession(session: RenderFrameSession): boolean {
  const control = sessions.get(session);
  if (control === undefined || control.terminal) return false;
  control.terminal = true;
  const listeners = [...control.listeners];
  control.listeners.clear();
  let failed = false;
  for (const listener of listeners) try { listener(); } catch { failed = true; }
  return failed;
}
