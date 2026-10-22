import '@rpg-platform/runtime-engine';
import {
  createRenderSession,
  createRenderSessionLifecycle,
  type RenderSessionDescriptor,
  type RenderSessionDisposal,
  type RenderSessionLifecycle,
} from '@rpg-platform/runtime-render';

/**
 * Host adapter seam only: the caller supplies its own target and retains the
 * descriptor. No preview UI, target validation or renderer initialization occurs.
 */
export function createEditorPreviewSession(target: object): RenderSessionDescriptor {
  return createRenderSession({ target });
}

/** Accept the host binding explicitly; this does not initialize graphics or UI. */
export function initializeEditorPreviewSession(target: object): RenderSessionLifecycle {
  const session = createRenderSessionLifecycle({ target });
  try {
    session.initialize();
  } catch (error) {
    session.dispose();
    throw error;
  }
  return session;
}

/** Host calls before removing its target, then drops its own handles/snapshots. */
export function disposeEditorPreviewSession(session: RenderSessionLifecycle): RenderSessionDisposal {
  return session.dispose();
}
