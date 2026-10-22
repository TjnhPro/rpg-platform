import {
  createAssetDefinition, detachPortableAssetData,
  type AssetDefinition, type AssetDefinitionInput, type AssetMetadata, type AssetMetadataValue,
} from './asset-definition.js';
import { AssetValidationError, atAssetPath } from './asset-validation.js';

/** Check snapshot field presence/compatibility only; existing factories validate values. */
function fields(value: AssetMetadataValue | undefined, names: readonly string[], path: string): AssetMetadata {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new AssetValidationError('INVALID_STRUCTURE', path, 'RECORD_OBJECT', `${path} must be a snapshot record`);
  }
  for (const name of Object.keys(value)) {
    if (!names.includes(name)) throw new AssetValidationError('UNSUPPORTED_FIELD', `${path}.${name}`,
      'SUPPORTED_FIELDS_ONLY', `Unsupported snapshot field: ${path}.${name}; original data must be retained`);
  }
  for (const name of names) {
    if (!Object.hasOwn(value, name)) throw new AssetValidationError('INVALID_STRUCTURE', `${path}.${name}`,
      'REQUIRED_SNAPSHOT_FIELD', `Missing snapshot field: ${path}.${name}`);
  }
  return value as AssetMetadata;
}

function list(value: AssetMetadataValue | undefined, path: string): readonly AssetMetadataValue[] {
  if (!Array.isArray(value)) throw new AssetValidationError('INVALID_STRUCTURE', path, 'ARRAY', `${path} must be an array`);
  return value;
}

/**
 * Read the complete current schemaVersion 1 definition snapshot, not construction
 * input. Caller may JSON.parse/stringify; no permanent file format or IO is chosen.
 * Unknown metadata extensions round-trip; unknown structural fields/versions reject
 * before any result is returned. Caller retains original data on failure. No migration.
 */
export function readAssetDefinitionSnapshot(input: unknown): AssetDefinition {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new AssetValidationError('INVALID_STRUCTURE', 'snapshot', 'RECORD_OBJECT', 'Asset snapshot must be a record');
  }
  const version = Object.getOwnPropertyDescriptor(input, 'schemaVersion');
  if (!version || !('value' in version) || version.value !== 1) {
    throw new AssetValidationError('UNSUPPORTED_SCHEMA_VERSION', 'snapshot.schemaVersion', 'SCHEMA_VERSION_1',
      'Unsupported asset snapshot schemaVersion; expected exactly 1, original data must be retained');
  }
  const record = fields(detachPortableAssetData(input, 'snapshot'),
    ['schemaVersion', 'identity', 'kind', 'metadata', 'sources', 'dependencies'], 'snapshot');
  fields(record['identity'], ['projectId', 'assetId', 'sourceId'], 'snapshot.identity');
  const sources = list(record['sources'], 'snapshot.sources');
  for (const [index, source] of sources.entries()) {
    const path = `snapshot.sources[${index}]`;
    const entry = fields(source, ['role', 'locator'], path);
    fields(entry['locator'], ['type', 'path'], `${path}.locator`);
  }
  const dependencies = list(record['dependencies'], 'snapshot.dependencies');
  for (const [index, reference] of dependencies.entries()) {
    fields(reference, ['projectId', 'assetId', 'expectedKind', 'subresourceId'], `snapshot.dependencies[${index}]`);
  }
  return atAssetPath('snapshot', () => createAssetDefinition(record as unknown as AssetDefinitionInput));
}
