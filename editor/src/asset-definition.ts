import { createAssetIdentity, type AssetIdentity, type AssetIdentityInput } from './asset-identity.js';
import { detachAssetSources, type AssetSourceReference } from './asset-sources.js';
import { detachAssetDependencies, type AssetReference, type AssetReferenceInput } from './asset-reference.js';
import { AssetValidationError, atAssetPath } from './asset-validation.js';

/** Portable authored data, never a loaded resource or an Editor UI object. */
export type AssetMetadataValue =
  | null | boolean | number | string
  | readonly AssetMetadataValue[]
  | AssetMetadata;

/** Unknown extension keys are retained verbatim; their semantics belong to authors. */
export interface AssetMetadata {
  readonly [key: string]: AssetMetadataValue;
}

export interface AssetDefinitionInput {
  readonly identity: AssetIdentityInput;
  /** Open resource/data classification (e.g. image, text, vendor:atlas-metadata). */
  readonly kind: string;
  readonly metadata: AssetMetadata;
  /** Omitted means no source references; order is preserved, duplicate role/locator pairs rejected. */
  readonly sources?: readonly AssetSourceReference[];
  /** Ordered direct edges within this project; one edge per target asset. No target lookup. */
  readonly dependencies?: readonly AssetReferenceInput[];
}

/** Version of this record shape, not the version of a source or metadata extension. */
export interface AssetDefinition {
  readonly schemaVersion: 1;
  readonly identity: AssetIdentity;
  readonly kind: string;
  readonly metadata: AssetMetadata;
  readonly sources: readonly AssetSourceReference[];
  readonly dependencies: readonly AssetReference[];
}

function invalidMetadata(path: string): never {
  throw new AssetValidationError('INVALID_METADATA', path, 'PORTABLE_JSON_DATA',
    `${path} must contain only portable JSON data: plain enumerable data objects, dense arrays and finite primitives (no negative zero or cycles)`);
}

function detachMetadata(value: unknown, path: string, ancestors: Set<object>): AssetMetadataValue {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number' && Number.isFinite(value) && !Object.is(value, -0)) return value;
  if (typeof value !== 'object' || value === null || ancestors.has(value)) return invalidMetadata(path);

  const array = Array.isArray(value);
  const prototype: unknown = Object.getPrototypeOf(value);
  if (!array && prototype !== Object.prototype && prototype !== null) return invalidMetadata(path);
  // No inherited/custom array serialization behavior or extra/symbol properties.
  if (array && (prototype !== Array.prototype || Reflect.ownKeys(value).length !== value.length + 1)) {
    return invalidMetadata(path);
  }

  ancestors.add(value);
  try {
    if (array) {
      const result: AssetMetadataValue[] = [];
      for (let index = 0; index < value.length; index += 1) {
        const entry = Object.getOwnPropertyDescriptor(value, String(index));
        if (!entry || !entry.enumerable || !('value' in entry)) return invalidMetadata(`${path}[${index}]`);
        result.push(detachMetadata(entry.value, `${path}[${index}]`, ancestors));
      }
      return Object.freeze(result);
    }
    const result: Record<string, AssetMetadataValue> = {};
    for (const key of Reflect.ownKeys(value)) {
      if (typeof key !== 'string') return invalidMetadata(path);
      const entry = Object.getOwnPropertyDescriptor(value, key);
      const entryPath = `${path}[${JSON.stringify(key)}]`;
      if (!entry || !entry.enumerable || !('value' in entry)) return invalidMetadata(entryPath);
      // Define a data property so even an unknown '__proto__' key is preserved safely.
      Object.defineProperty(result, key, {
        value: detachMetadata(entry.value, entryPath, ancestors), enumerable: true,
      });
    }
    return Object.freeze(result);
  } finally {
    ancestors.delete(value);
  }
}

/** Internal portable-data detacher shared by construction and snapshot reading. */
export function detachPortableAssetData(value: unknown, path: string): AssetMetadataValue {
  return detachMetadata(value, path, new Set());
}

/**
 * Validate, deeply detach and freeze authored data; throws TypeError on invalid
 * input. No kind registry, extension interpretation, IO, export or migration.
 * Read the readonly result directly; validation is part of creation, not a second API.
 */
export function createAssetDefinition(input: AssetDefinitionInput): AssetDefinition {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new AssetValidationError('INVALID_STRUCTURE', '', 'NONNULL_NONARRAY_OBJECT', 'Asset definition input must be an object');
  }
  const { identity, kind, metadata, sources = [], dependencies = [] } = input;
  if (typeof kind !== 'string' || kind.length === 0 || /\s/u.test(kind)) {
    throw new AssetValidationError('INVALID_KIND', 'kind', 'NONEMPTY_WHITESPACE_FREE_STRING',
      'kind must be a non-empty resource/data classification without whitespace');
  }
  if (typeof metadata !== 'object' || metadata === null || Array.isArray(metadata)) {
    return invalidMetadata('metadata');
  }
  const assetIdentity = atAssetPath('identity', () => createAssetIdentity(identity));
  return Object.freeze({
    schemaVersion: 1,
    identity: assetIdentity,
    kind,
    metadata: detachPortableAssetData(metadata, 'metadata') as AssetMetadata,
    sources: detachAssetSources(sources),
    dependencies: detachAssetDependencies(dependencies, assetIdentity.projectId),
  });
}
