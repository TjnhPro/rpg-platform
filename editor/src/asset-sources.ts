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
    throw new TypeError('Resource locator must be an object');
  }
  const { type, path } = input;
  if (type !== 'project-relative') {
    throw new TypeError('Only project-relative resource locators are supported');
  }
  if (typeof path !== 'string' || path.length === 0 || /[\\<>:"|?*#%\u0000-\u001f\u007f]/u.test(path)) {
    throw new TypeError('Locator path must be a literal project-relative slash-separated path');
  }
  for (const segment of path.split('/')) {
    if (segment.length === 0 || segment === '.' || segment === '..'
      || segment.trim() !== segment || segment.endsWith('.')
      || /^(?:con|prn|aux|nul|com[1-9¹²³]|lpt[1-9¹²³])(?:\.|$)/iu.test(segment)) {
      throw new TypeError('Locator path contains an empty, dot, traversal or nonportable segment');
    }
  }
  return Object.freeze({ type, path });
}

/** Internal definition construction; not exported from the Editor package root. */
export function detachAssetSources(input: readonly AssetSourceReference[]): readonly AssetSourceReference[] {
  if (!Array.isArray(input)) throw new TypeError('sources must be an array');
  const result: AssetSourceReference[] = [];
  const seen = new Map<string, Set<string>>();
  for (const source of input) {
    if (typeof source !== 'object' || source === null || Array.isArray(source)) {
      throw new TypeError('Each source must be an object with role and locator');
    }
    const { role, locator: locatorInput } = source;
    if (typeof role !== 'string' || role.length === 0 || /\s/u.test(role)) {
      throw new TypeError('Source role must be a non-empty resource/data role without whitespace');
    }
    const locator = createResourceLocator(locatorInput);
    const paths = seen.get(role) ?? new Set<string>();
    if (paths.has(locator.path)) throw new TypeError('Duplicate source role and locator pair');
    paths.add(locator.path);
    seen.set(role, paths);
    result.push(Object.freeze({ role, locator }));
  }
  return Object.freeze(result);
}
