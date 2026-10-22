export { createPlanarTransform2D, type PlanarTransform2D } from './planar-transform.js';
export { prepareVisualResource, type VisualResourceDescriptor, type VisualResourcePreparation } from './visual-resource.js';
export {
  createRenderFrameSession,
  getRenderFrameFailure,
  type RenderFrameSession,
  type RenderFrameReceipt,
  type RenderFrameFailure,
} from './frame-session.js';

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

/** Safe diagnostics for current Render-authored misuse; no host data or raw cause. */
export type RenderFailure =
  | { readonly code: 'INVALID_HOST_TARGET'; readonly stage: 'initialize' }
  | { readonly code: 'SESSION_DISPOSED'; readonly stage: 'initialize' | 'getSnapshot' };

class InvalidHostTargetError extends TypeError {
  readonly #failure: RenderFailure = Object.freeze({
    code: 'INVALID_HOST_TARGET', stage: 'initialize',
  });

  constructor() {
    super('Render host target must be an object reference');
  }

  static getFailure(error: unknown): RenderFailure | undefined {
    if (typeof error === 'object' && error !== null && #failure in error) {
      return error.#failure;
    }
    return undefined;
  }
}

class SessionDisposedError extends Error {
  readonly #failure: RenderFailure;

  constructor(stage: 'initialize' | 'getSnapshot') {
    super('Render session is disposed');
    this.#failure = Object.freeze({ code: 'SESSION_DISPOSED', stage });
  }

  static getFailure(error: unknown): RenderFailure | undefined {
    if (typeof error === 'object' && error !== null && #failure in error) {
      return error.#failure;
    }
    return undefined;
  }
}

/**
 * Recognize errors created by this package instance. Undefined means unrecognized,
 * never success. Does not parse messages or copy unknown exception/context data.
 */
export function getRenderFailure(error: unknown): RenderFailure | undefined {
  return InvalidHostTargetError.getFailure(error) ?? SessionDisposedError.getFailure(error);
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
      throw new SessionDisposedError('getSnapshot');
    }
    return Object.freeze({ descriptor, state });
  };

  return Object.freeze({
    getSnapshot,
    initialize: (): RenderSessionSnapshot => {
      if (state === 'disposed' || descriptor === undefined) {
        throw new SessionDisposedError('initialize');
      }
      if (state === 'created') {
        const target = descriptor.host.target;
        if (target === null || (typeof target !== 'object' && typeof target !== 'function')) {
          throw new InvalidHostTargetError();
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
