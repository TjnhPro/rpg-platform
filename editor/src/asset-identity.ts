/** Caller-supplied logical identity; never inferred from a filename or locator. */
export interface AssetIdentityInput {
  readonly projectId: string;
  readonly assetId: string;
  /** Optional provenance text, preserved exactly (including leading zeroes). */
  readonly sourceId?: string | null;
}

/** Identity equality compares projectId and assetId, case-sensitively, not sourceId. */
export interface AssetIdentity {
  readonly projectId: string;
  readonly assetId: string;
  readonly sourceId: string | null;
}

function identityPart(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.length === 0 || /\s/u.test(value)) {
    throw new TypeError(`${field} must be a non-empty string without whitespace`);
  }
  return value;
}

/**
 * Validate and detach a frozen value. IDs are exact strings: no coercion, case
 * folding, trimming, Unicode normalization, generation, uniqueness check or IO.
 * Missing/null sourceId becomes null; nonblank source text is preserved verbatim.
 */
export function createAssetIdentity(input: AssetIdentityInput): AssetIdentity {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new TypeError('Asset identity input must be an object');
  }
  const { projectId, assetId, sourceId = null } = input;
  const project = identityPart(projectId, 'projectId');
  const asset = identityPart(assetId, 'assetId');
  if (sourceId !== null && (typeof sourceId !== 'string' || sourceId.trim().length === 0)) {
    throw new TypeError('sourceId must be a nonblank string or null');
  }
  return Object.freeze({ projectId: project, assetId: asset, sourceId });
}
