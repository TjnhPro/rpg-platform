/** Package-private branding; never classify arbitrary host TypeError by name/message. */
export class VisualPresentationError extends TypeError {
  readonly #code: 'INVALID_TRANSFORM' | 'INVALID_SPRITE_LAYOUT' | 'LOCAL_UNIT_MISMATCH' | 'SCENE_IN_USE';
  constructor(code: VisualPresentationError['code']) {
    super(`Visual presentation rejected: ${code}`); this.#code = code;
  }
  get code() { return this.#code; }
  static code(error: unknown): VisualPresentationError['code'] | undefined {
    return typeof error === 'object' && error !== null && #code in error ? error.#code : undefined;
  }
}
