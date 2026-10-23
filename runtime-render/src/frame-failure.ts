/** Separate graphics diagnostics; existing RenderFailure remains unchanged. */
export interface RenderFrameFailure {
  readonly code: 'UNSUPPORTED_TARGET' | 'TARGET_IN_USE' | 'GRAPHICS_UNAVAILABLE'
    | 'ACQUISITION_FAILED' | 'CONTEXT_LOST' | 'FRAME_FAILED' | 'CLEANUP_FAILED' | 'RESIZE_FAILED';
  readonly stage: 'acquire' | 'renderFrame' | 'dispose' | 'resize';
  readonly cleanupFailed: boolean;
}

/** Internal error implementation, not a package-root export. */
export class FrameError extends Error {
  readonly #failure: RenderFrameFailure;

  constructor(code: RenderFrameFailure['code'], stage: RenderFrameFailure['stage'], cleanupFailed = false) {
    super(`Render graphics operation failed: ${code}`);
    this.#failure = Object.freeze({ code, stage, cleanupFailed });
  }

  static classify(error: unknown): RenderFrameFailure | undefined {
    return typeof error === 'object' && error !== null && #failure in error
      ? error.#failure : undefined;
  }
}

/** Same-package-instance branding only; undefined is unknown, never success. */
export function getRenderFrameFailure(error: unknown): RenderFrameFailure | undefined {
  return FrameError.classify(error);
}
