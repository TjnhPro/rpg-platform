/** Host-owned opaque target reference; not a validated rendering capability. */
export interface RenderHostBinding {
  /** Borrowed: the host creates, mounts and removes it. Render never freezes it. */
  readonly target: object;
}

/** Immutable binding metadata, not an initialized renderer or resource handle. */
export interface RenderSessionDescriptor {
  /** Fresh in this JS execution; not serializable or a document/gameplay ID. */
  readonly id: symbol;
  readonly host: RenderHostBinding;
}

/**
 * Snapshot one host binding with an independent identity. Acquires no resources,
 * validates no backend/target conditions, and does not read DOM or GPU globals.
 * The binding wrapper is copied and frozen; the borrowed target remains host-owned.
 */
export function createRenderSession(host: RenderHostBinding): RenderSessionDescriptor {
  return Object.freeze({
    id: Symbol(),
    host: Object.freeze({ target: host.target }),
  });
}

/** Detached observation; bound means a reference was accepted, not graphics ready. */
export interface RenderSessionSnapshot {
  readonly descriptor: RenderSessionDescriptor;
  readonly state: 'created' | 'bound';
}

/** Host-controlled session boundary; no backend resources are acquired. */
export interface RenderSessionLifecycle {
  readonly getSnapshot: () => RenderSessionSnapshot;
  /** Idempotent once bound; invalid target reference throws before transition. */
  readonly initialize: () => RenderSessionSnapshot;
}

/**
 * Create independent lifecycle ownership with a new descriptor identity.
 * Initialization checks reference shape only, never target liveness or GPU support.
 * Existing metadata-only creation remains available without entering this lifecycle.
 */
export function createRenderSessionLifecycle(host: RenderHostBinding): RenderSessionLifecycle {
  const descriptor = createRenderSession(host);
  let state: RenderSessionSnapshot['state'] = 'created';

  const getSnapshot = (): RenderSessionSnapshot => Object.freeze({ descriptor, state });

  return Object.freeze({
    getSnapshot,
    initialize: (): RenderSessionSnapshot => {
      if (state === 'created') {
        const target = descriptor.host.target;
        if (target === null || (typeof target !== 'object' && typeof target !== 'function')) {
          throw new TypeError('Render host target must be an object reference');
        }
        state = 'bound';
      }
      return getSnapshot();
    },
  });
}
