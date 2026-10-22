/** Portable presentation metadata; neither an authored catalog nor a loaded image. */
export interface VisualResourceDescriptor {
  readonly identity: { readonly projectId: string; readonly resourceId: string };
  /** Explicit hint only; null means unknown. Never inferred from a filename. */
  readonly mediaType: string | null;
  readonly sources: readonly {
    readonly role: string;
    readonly locator: { readonly type: 'project-relative'; readonly path: string };
  }[];
}

export interface VisualResourcePreparation {
  readonly status: 'metadata-prepared';
  readonly descriptor: VisualResourceDescriptor;
  readonly resourceLoading: 'NOT_PERFORMED';
}

function record(value: unknown, fields: readonly string[], path: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)
    || (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null)
    || Reflect.ownKeys(value).length !== fields.length) {
    throw new TypeError(`${path} must be a plain record with exactly ${fields.join(', ')}`);
  }
  const result: Record<string, unknown> = {};
  for (const field of fields) {
    const property = Object.getOwnPropertyDescriptor(value, field);
    if (!property?.enumerable || !('value' in property)) throw new TypeError(`${path}.${field} must be data`);
    result[field] = property.value;
  }
  return result;
}

function token(value: unknown, path: string): string {
  if (typeof value !== 'string' || value.length === 0 || /\s/u.test(value)) {
    throw new TypeError(`${path} must be a nonempty whitespace-free string`);
  }
  return value;
}

/**
 * Validate and detach a closed, portable image-source description. Reads identity,
 * hint and ordered roles/locations; requires an image source and rejects duplicates.
 * Unknown host exceptions propagate. No IO, decoder, cache, GPU or session access.
 * Project-relative locations are metadata, not authorized filesystem paths/URLs.
 */
export function prepareVisualResource(input: VisualResourceDescriptor): VisualResourcePreparation {
  const root = record(input, ['identity', 'mediaType', 'sources'], 'descriptor');
  const identity = record(root.identity, ['projectId', 'resourceId'], 'identity');
  const projectId = token(identity.projectId, 'identity.projectId');
  const resourceId = token(identity.resourceId, 'identity.resourceId');
  const mediaType = root.mediaType;
  if (mediaType !== null && (typeof mediaType !== 'string' || !/^image\/[a-zA-Z0-9!#$&^_.+-]+$/u.test(mediaType))) {
    throw new TypeError('mediaType must be null or an image media type without parameters');
  }
  const list = root.sources;
  if (!Array.isArray(list) || Object.getPrototypeOf(list) !== Array.prototype
    || Reflect.ownKeys(list).length !== list.length + 1) throw new TypeError('sources must be a dense data array');
  const sources: VisualResourceDescriptor['sources'][number][] = [];
  const pairs = new Set<string>();
  for (let index = 0; index < list.length; index += 1) {
    const entry = Object.getOwnPropertyDescriptor(list, String(index));
    if (!entry?.enumerable || !('value' in entry)) throw new TypeError('sources must be a dense data array');
    const source = record(entry.value, ['role', 'locator'], `sources[${index}]`);
    const role = token(source.role, 'source.role');
    const locator = record(source.locator, ['type', 'path'], 'source.locator');
    const path = locator.path;
    if (locator.type !== 'project-relative' || typeof path !== 'string' || path.length === 0
      || /[\\:%\u0000-\u001f\u007f]/u.test(path)
      || path.split('/').some(segment => segment.length === 0 || segment === '.' || segment === '..' || segment.trim() !== segment)) {
      throw new TypeError('source.locator must describe a literal project-relative location');
    }
    const key = JSON.stringify([role, path]);
    if (pairs.has(key)) throw new TypeError('Duplicate source role/location pair');
    pairs.add(key);
    sources.push(Object.freeze({ role, locator: Object.freeze({ type: 'project-relative', path }) }));
  }
  if (!sources.some(source => source.role === 'image')) throw new TypeError('An image source role is required');
  return Object.freeze({
    status: 'metadata-prepared', resourceLoading: 'NOT_PERFORMED',
    descriptor: Object.freeze({ identity: Object.freeze({ projectId, resourceId }), mediaType, sources: Object.freeze(sources) }),
  });
}
