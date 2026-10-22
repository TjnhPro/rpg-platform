import { AssetValidationError, atAssetPath } from './asset-validation.js';

/** Literal project-relative data, never a filesystem path or a constructed URL. */
export interface ResourceLocator {
  readonly type: 'project-relative';
  /** Exact case-sensitive slash-separated path; see createResourceLocator policy. */
  readonly path: string;
}

/** Role describes this source's use (e.g. image or atlas-metadata), not game semantics. */
export interface AssetSourceReference {
  readonly role: string;
  readonly locator: ResourceLocator;
}

/**
 * Validate/detach a frozen locator without IO or normalization. Only project-relative
 * locators are supported. Reject empty/dot/traversal segments, backslashes, absolute
 * paths, URL/drive syntax, percent escapes, control characters, selected Windows
 * device names/characters, segment-edge whitespace and trailing dots. Internal spaces/Unicode remain
 * exact. This lexical check cannot establish filesystem/symlink containment.
 */
export function createResourceLocator(input: ResourceLocator): ResourceLocator {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new AssetValidationError('INVALID_LOCATOR', '', 'NONNULL_NONARRAY_OBJECT', 'Resource locator must be an object');
  }
  const { type, path } = input;
  if (type !== 'project-relative') {
    throw new AssetValidationError('INVALID_LOCATOR', 'type', 'PROJECT_RELATIVE_ONLY', 'Only project-relative resource locators are supported');
  }
  if (typeof path !== 'string' || path.length === 0 || /[\\<>:"|?*#%\u0000-\u001f\u007f]/u.test(path)) {
    throw new AssetValidationError('INVALID_LOCATOR', 'path', 'LITERAL_PROJECT_RELATIVE_PATH',
      'Locator path must be a literal project-relative slash-separated path');
  }
  for (const segment of path.split('/')) {
    if (segment.length === 0 || segment === '.' || segment === '..'
      || segment.trim() !== segment || segment.endsWith('.')
      || /^(?:con|prn|aux|nul|com[1-9¹²³]|lpt[1-9¹²³])(?:\.|$)/iu.test(segment)) {
      throw new AssetValidationError('INVALID_LOCATOR', 'path', 'PORTABLE_PATH_SEGMENTS',
        'Locator path contains an empty, dot, traversal or nonportable segment');
    }
  }
  return Object.freeze({ type, path });
}

/** Internal definition construction; not exported from the Editor package root. */
export function detachAssetSources(input: readonly AssetSourceReference[]): readonly AssetSourceReference[] {
  if (!Array.isArray(input)) throw new AssetValidationError('INVALID_SOURCE', 'sources', 'ARRAY', 'sources must be an array');
  const result: AssetSourceReference[] = [];
  const seen = new Map<string, Set<string>>();
  for (const source of input) {
    const path = `sources[${result.length}]`;
    if (typeof source !== 'object' || source === null || Array.isArray(source)) {
      throw new AssetValidationError('INVALID_SOURCE', path, 'NONNULL_NONARRAY_OBJECT', 'Each source must be an object with role and locator');
    }
    const { role, locator: locatorInput } = source;
    if (typeof role !== 'string' || role.length === 0 || /\s/u.test(role)) {
      throw new AssetValidationError('INVALID_SOURCE', `${path}.role`, 'NONEMPTY_WHITESPACE_FREE_STRING',
        'Source role must be a non-empty resource/data role without whitespace');
    }
    const locator = atAssetPath(`${path}.locator`, () => createResourceLocator(locatorInput));
    const paths = seen.get(role) ?? new Set<string>();
    if (paths.has(locator.path)) throw new AssetValidationError('DUPLICATE_SOURCE', path, 'UNIQUE_ROLE_LOCATOR_PAIR',
      'Duplicate source role and locator pair');
    paths.add(locator.path);
    seen.set(role, paths);
    result.push(Object.freeze({ role, locator }));
  }
  return Object.freeze(result);
}
