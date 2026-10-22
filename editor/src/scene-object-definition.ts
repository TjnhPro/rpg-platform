/** Caller-supplied objectId is local to its eventual owning Scene. */
export interface SceneObjectDefinitionInput {
  readonly objectId: string;
  readonly displayName?: string | null;
  /** Opaque authoring label, never a gameplay role or Render backend selector. */
  readonly classification?: string | null;
}

/** Authored visual object data, independent of assets, placement and runtime state. */
export interface SceneObjectDefinition {
  readonly objectId: string;
  readonly displayName: string | null;
  readonly classification: string | null;
}

function optionalLabel(value: unknown, field: string): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new TypeError(`${field} must be a non-blank string or null`);
  }
  return value;
}

/**
 * Capture known construction fields as a detached frozen record. Keys are exact,
 * case-sensitive, nonempty strings without whitespace; labels retain their text.
 * No generated ID, registry, membership or uniqueness check: the future owning
 * Scene enforces local uniqueness on insertion. This is not a saved-data reader.
 * Throws TypeError for invalid structure/fields; unknown host exceptions propagate.
 */
export function createSceneObjectDefinition(
  input: SceneObjectDefinitionInput,
): SceneObjectDefinition {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new TypeError('Scene object definition input must be an object');
  }
  const { objectId, displayName, classification } = input;
  if (typeof objectId !== 'string' || objectId.length === 0 || /\s/u.test(objectId)) {
    throw new TypeError('objectId must be a non-empty string without whitespace');
  }
  return Object.freeze({
    objectId,
    displayName: optionalLabel(displayName, 'displayName'),
    classification: optionalLabel(classification, 'classification'),
  });
}
