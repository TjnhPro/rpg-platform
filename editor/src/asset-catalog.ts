import { createAssetDefinition, type AssetDefinition, type AssetDefinitionInput } from './asset-definition.js';
import { createAssetIdentity } from './asset-identity.js';
import { createAssetReference, type AssetReference, type AssetReferenceInput } from './asset-reference.js';

export interface AssetCatalogInput {
  readonly projectId: string;
  readonly definitions?: readonly AssetDefinitionInput[];
}

/** Factory-created immutable snapshot. definitions is the ordered public list. */
export interface AssetCatalog {
  readonly projectId: string;
  readonly definitions: readonly AssetDefinition[];
}

/** Resolution describes authored data only, never file existence or loaded resources. */
export type AssetReferenceResolution =
  | { readonly status: 'resolved'; readonly reference: AssetReference; readonly definition: AssetDefinition }
  | { readonly status: 'unresolved'; readonly reference: AssetReference;
      readonly reason: 'PROJECT_MISMATCH' | 'TARGET_NOT_FOUND' | 'KIND_MISMATCH' | 'SUBRESOURCE_NOT_SUPPORTED' };

/** Validate/detach every definition, preserving input order; duplicate IDs never overwrite. */
export function createAssetCatalog(input: AssetCatalogInput): AssetCatalog {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new TypeError('Asset catalog input must be an object');
  }
  const { projectId, definitions = [] } = input;
  if (typeof projectId !== 'string' || projectId.length === 0 || /\s/u.test(projectId)) {
    throw new TypeError('projectId must be a non-empty string without whitespace');
  }
  if (!Array.isArray(definitions)) throw new TypeError('Catalog definitions must be an array');
  const result: AssetDefinition[] = [];
  const ids = new Set<string>();
  for (const inputDefinition of definitions) {
    const definition = createAssetDefinition(inputDefinition);
    if (definition.identity.projectId !== projectId) {
      throw new TypeError('Catalog definitions must belong to the catalog project');
    }
    if (ids.has(definition.identity.assetId)) throw new TypeError('Duplicate catalog assetId');
    ids.add(definition.identity.assetId);
    result.push(definition);
  }
  return Object.freeze({ projectId, definitions: Object.freeze(result) });
}

/** Read one exact local key from a factory-created snapshot; missing returns undefined. */
export function getAssetDefinition(catalog: AssetCatalog, assetId: string): AssetDefinition | undefined {
  const key = createAssetIdentity({ projectId: catalog.projectId, assetId });
  return catalog.definitions.find((definition) => definition.identity.assetId === key.assetId);
}

/** Append to a new validated snapshot. Throws on duplicate ID; never an upsert. */
export function registerAssetDefinition(catalog: AssetCatalog, definition: AssetDefinitionInput): AssetCatalog {
  return createAssetCatalog({ projectId: catalog.projectId, definitions: [...catalog.definitions, definition] });
}

/** Replace an existing key in place in a new snapshot; missing is an error, never an insert. */
export function updateAssetDefinition(catalog: AssetCatalog, input: AssetDefinitionInput): AssetCatalog {
  const definition = createAssetDefinition(input);
  if (definition.identity.projectId !== catalog.projectId) {
    throw new TypeError('Updated definition must belong to the catalog project');
  }
  const index = catalog.definitions.findIndex((entry) => entry.identity.assetId === definition.identity.assetId);
  if (index === -1) throw new TypeError('Cannot update a missing catalog assetId');
  const definitions = [...catalog.definitions];
  definitions[index] = definition;
  return createAssetCatalog({ projectId: catalog.projectId, definitions });
}

/** Remove an existing key in a new snapshot, preserving survivor order; no cascade. */
export function removeAssetDefinition(catalog: AssetCatalog, assetId: string): AssetCatalog {
  if (getAssetDefinition(catalog, assetId) === undefined) {
    throw new TypeError('Cannot remove a missing catalog assetId');
  }
  return createAssetCatalog({ projectId: catalog.projectId,
    definitions: catalog.definitions.filter((definition) => definition.identity.assetId !== assetId) });
}

/**
 * Resolve against one caller-supplied factory snapshot. Priority: project, target,
 * kind, subresource. Malformed reference throws; valid unknown target stays unresolved.
 * A nonnull opaque subresource cannot be verified here, so never reports resolved.
 * Success returns the exact frozen definition in this snapshot. No IO or edge traversal.
 */
export function resolveAssetReference(catalog: AssetCatalog, input: AssetReferenceInput): AssetReferenceResolution {
  const reference = createAssetReference(input);
  let reason: Extract<AssetReferenceResolution, { status: 'unresolved' }>['reason'];
  if (reference.projectId !== catalog.projectId) {
    reason = 'PROJECT_MISMATCH';
  } else {
    const definition = getAssetDefinition(catalog, reference.assetId);
    if (definition === undefined) reason = 'TARGET_NOT_FOUND';
    else if (reference.expectedKind !== null && reference.expectedKind !== definition.kind) reason = 'KIND_MISMATCH';
    else if (reference.subresourceId !== null) reason = 'SUBRESOURCE_NOT_SUPPORTED';
    else return Object.freeze({ status: 'resolved', reference, definition });
  }
  return Object.freeze({ status: 'unresolved', reference, reason });
}
