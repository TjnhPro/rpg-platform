import { AssetValidationError } from './asset-validation.js';

/** Internal channel: canonical factories remain the structural authority. */
export type SceneValidationCode = 'INVALID_STRUCTURE' | 'INVALID_ID' | 'INVALID_LABEL'
  | 'DUPLICATE_OBJECT_ID' | 'INVALID_ASSET_REFERENCE' | 'PROJECT_MISMATCH'
  | 'INVALID_LAYER' | 'INVALID_ATTACHMENT' | 'CROSS_SCENE_ATTACHMENT'
  | 'SELF_ATTACHMENT' | 'INVALID_PLACEMENT';

export class SceneValidationError extends TypeError {
  constructor(readonly code: SceneValidationCode, readonly path: string,
    readonly rule: string, message: string) { super(message); }
}

/** Prefix only known authored errors; never classify arbitrary host exceptions. */
export function atScenePath<T>(prefix: string, operation: () => T): T {
  try { return operation(); }
  catch (error) {
    if (!(error instanceof SceneValidationError) && !(error instanceof AssetValidationError)) throw error;
    throw new SceneValidationError(error instanceof SceneValidationError ? error.code : 'INVALID_ASSET_REFERENCE',
      error.path ? `${prefix}.${error.path}` : prefix, error.rule, error.message);
  }
}
