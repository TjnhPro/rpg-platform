/** Owner-local exact camera data capture; not a package-root export. */
export function captureCameraFields(input: unknown, keys: readonly string[]): Record<string, unknown> {
  if (typeof input !== 'object' || input === null || Array.isArray(input)
    || (Object.getPrototypeOf(input) !== Object.prototype && Object.getPrototypeOf(input) !== null)
    || Reflect.ownKeys(input).length !== keys.length) {
    throw new TypeError('Camera input must be an exact plain data record');
  }
  const result: Record<string, unknown> = Object.create(null) as Record<string, unknown>;
  for (const key of keys) {
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    if (!descriptor?.enumerable || !('value' in descriptor)) {
      throw new TypeError('Camera input must contain the declared data fields only');
    }
    result[key] = descriptor.value;
  }
  return result;
}
