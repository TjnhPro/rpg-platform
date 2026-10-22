/** Internal validation channel; factories still throw TypeError, never public diagnostics. */
export type AssetValidationCode =
  | 'INVALID_STRUCTURE' | 'INVALID_ID' | 'INVALID_KIND' | 'INVALID_METADATA'
  | 'INVALID_LOCATOR' | 'INVALID_SOURCE' | 'INVALID_REFERENCE' | 'INVALID_DEPENDENCY'
  | 'DUPLICATE_SOURCE' | 'DUPLICATE_DEPENDENCY'
  | 'UNSUPPORTED_SCHEMA_VERSION' | 'UNSUPPORTED_FIELD';

export class AssetValidationError extends TypeError {
  constructor(
    readonly code: AssetValidationCode,
    readonly path: string,
    readonly rule: string,
    message: string,
  ) { super(message); }
}

/** Attach a containing data path without parsing messages or catching host exceptions. */
export function atAssetPath<T>(prefix: string, operation: () => T): T {
  try { return operation(); }
  catch (error) {
    if (!(error instanceof AssetValidationError)) throw error;
    throw new AssetValidationError(error.code, error.path ? `${prefix}.${error.path}` : prefix,
      error.rule, error.message);
  }
}
