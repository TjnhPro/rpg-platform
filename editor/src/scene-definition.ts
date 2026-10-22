/** Caller-selected logical keys; sceneId is local to projectId. */
export interface SceneIdentityInput {
  readonly projectId: string;
  readonly sceneId: string;
}

/** Equality uses both exact, case-sensitive keys, never a title or save path. */
export interface SceneIdentity {
  readonly projectId: string;
  readonly sceneId: string;
}

export interface SceneDefinitionInput {
  readonly identity: SceneIdentityInput;
}

/** Empty authored Scene snapshot, independent of UI, assets and Render state. */
export interface SceneDefinition {
  readonly identity: SceneIdentity;
}

function identityPart(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.length === 0 || /\s/u.test(value)) {
    throw new TypeError(`${field} must be a non-empty string without whitespace`);
  }
  return value;
}

/**
 * Validate explicit keys and return a detached frozen identity. No trimming,
 * normalization, coercion, ID generation, uniqueness registry or IO. Project keys
 * follow the existing Asset identity convention without making Scenes Assets.
 */
export function createSceneIdentity(input: SceneIdentityInput): SceneIdentity {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new TypeError('Scene identity input must be an object');
  }
  const { projectId, sceneId } = input;
  return Object.freeze({
    projectId: identityPart(projectId, 'projectId'),
    sceneId: identityPart(sceneId, 'sceneId'),
  });
}

/**
 * Capture a minimal empty Scene with its own frozen identity. Reading the returned
 * data does not create state or change identity. Known construction fields only;
 * this is not a versioned snapshot reader, serializer or persistence schema.
 * Throws TypeError for invalid structure/keys; unknown host exceptions propagate.
 */
export function createSceneDefinition(input: SceneDefinitionInput): SceneDefinition {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new TypeError('Scene definition input must be an object');
  }
  return Object.freeze({ identity: createSceneIdentity(input.identity) });
}
