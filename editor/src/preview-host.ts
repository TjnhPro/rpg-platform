import {
  createRenderSessionLifecycle,
  type RenderSessionLifecycle,
  type RenderSessionSnapshot,
} from '@rpg-platform/runtime-render';

/** Editor observations only; mounted means session initialized, never frame-ready. */
export type EditorPreviewHostSnapshot =
  | { readonly state: 'mounted'; readonly session: RenderSessionSnapshot }
  | { readonly state: 'unmounted' | 'unavailable' | 'closed' };

/** One Editor-owned preview slot. Host retains responsibility for actual target UI. */
export interface EditorPreviewHost {
  readonly getSnapshot: () => EditorPreviewHostSnapshot;
  /** Null explicitly reports unavailable preview capability; creates no session. */
  readonly mount: (target: object | null) => EditorPreviewHostSnapshot;
  /** Dispose the old session first; failed replacement leaves the slot unmounted. */
  readonly replace: (target: object | null) => EditorPreviewHostSnapshot;
  readonly unmount: () => EditorPreviewHostSnapshot;
  /** Terminal and idempotent; getSnapshot remains available after close. */
  readonly close: () => EditorPreviewHostSnapshot;
}

/** No document, gameplay, DOM or renderer is created by this factory. */
export function createEditorPreviewHost(): EditorPreviewHost {
  let session: RenderSessionLifecycle | undefined;
  let emptyState: 'unmounted' | 'unavailable' | 'closed' = 'unmounted';

  const getSnapshot = (): EditorPreviewHostSnapshot => session === undefined
    ? Object.freeze({ state: emptyState })
    : Object.freeze({ state: 'mounted', session: session.getSnapshot() });

  const assertOpen = (): void => {
    if (emptyState === 'closed') {
      throw new Error('Editor preview host is closed');
    }
  };

  const unmount = (): EditorPreviewHostSnapshot => {
    assertOpen();
    // Retain the slot if disposal throws; do not pretend cleanup succeeded.
    session?.dispose();
    session = undefined;
    emptyState = 'unmounted';
    return getSnapshot();
  };

  const mount = (target: object | null): EditorPreviewHostSnapshot => {
    assertOpen();
    if (session !== undefined) {
      throw new Error('Editor preview is already mounted; use replace');
    }
    emptyState = 'unmounted';
    if (target === null) {
      emptyState = 'unavailable';
      return getSnapshot();
    }

    const pending = createRenderSessionLifecycle({ target });
    try {
      pending.initialize();
    } catch (error) {
      pending.dispose();
      throw error;
    }
    session = pending;
    return getSnapshot();
  };

  return Object.freeze({
    getSnapshot,
    mount,
    replace: (target: object | null): EditorPreviewHostSnapshot => {
      unmount();
      return mount(target);
    },
    unmount,
    close: (): EditorPreviewHostSnapshot => {
      if (emptyState !== 'closed') {
        unmount();
        emptyState = 'closed';
      }
      return getSnapshot();
    },
  });
}

/** Compiled usage seam: caller supplies its target, or null for text/headless tools. */
export function openEditorPreviewHost(target: object | null): EditorPreviewHost {
  const host = createEditorPreviewHost();
  host.mount(target);
  return host;
}
