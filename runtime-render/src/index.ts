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
