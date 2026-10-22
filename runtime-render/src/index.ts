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

/** Terminal observation deliberately retains no host binding or target. */
export interface RenderSessionDisposal {
  readonly id: symbol;
  readonly state: 'disposed';
}

/** Host-controlled session boundary; no backend resources are acquired. */
export interface RenderSessionLifecycle {
  /** Active observations only; throws after disposal. Previously returned snapshots survive. */
  readonly getSnapshot: () => RenderSessionSnapshot;
  /** Idempotent once bound; throws for invalid target or after disposal. */
  readonly initialize: () => RenderSessionSnapshot;
  /** Terminal and idempotent; releases internal binding, never destroys host target. */
  readonly dispose: () => RenderSessionDisposal;
}

/**
 * Create independent lifecycle ownership with a new descriptor identity.
 * Initialization checks reference shape only, never target liveness or GPU support.
 * Existing metadata-only creation remains available without entering this lifecycle.
 */
export function createRenderSessionLifecycle(host: RenderHostBinding): RenderSessionLifecycle {
  let descriptor: RenderSessionDescriptor | undefined = createRenderSession(host);
  let state: RenderSessionSnapshot['state'] | 'disposed' = 'created';
  const disposal: RenderSessionDisposal = Object.freeze({ id: descriptor.id, state: 'disposed' });

  const getSnapshot = (): RenderSessionSnapshot => {
    if (state === 'disposed' || descriptor === undefined) {
      throw new Error('Render session is disposed');
    }
    return Object.freeze({ descriptor, state });
  };

  return Object.freeze({
    getSnapshot,
    initialize: (): RenderSessionSnapshot => {
      if (state === 'disposed' || descriptor === undefined) {
        throw new Error('Render session is disposed');
      }
      if (state === 'created') {
        const target = descriptor.host.target;
        if (target === null || (typeof target !== 'object' && typeof target !== 'function')) {
          throw new TypeError('Render host target must be an object reference');
        }
        state = 'bound';
      }
      return getSnapshot();
    },
    dispose: (): RenderSessionDisposal => {
      descriptor = undefined;
      state = 'disposed';
      return disposal;
    },
  });
}
