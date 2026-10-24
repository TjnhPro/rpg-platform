// Editor-internal browser integration. Not exported/evaluated by the package root.
import {
  beginRenderFrameSession, getRenderViewportSnapshot, getRenderFrameInvalidationSnapshot,
  invalidateRenderFrame, resizeRenderViewport, suspendRenderViewport, resumeRenderViewport,
  getRenderFailure, getRenderFrameFailure,
  type RenderFrameAcquisition, type RenderFrameSession, type RenderViewportMetrics,
  type RenderViewportResizeReceipt,
} from '@rpg-platform/runtime-render';

/** Private composition seam; the viewport host retains session/scheduling ownership. */
export interface EditorViewportContent {
  /** Optional playback consumer notification; no transfer of native scheduling rights. */
  readonly availabilityChanged?: (available: boolean) => void;
  readonly acquired: (session: RenderFrameSession) => void;
  readonly configured: (session: RenderFrameSession, receipt: RenderViewportResizeReceipt,
    metrics: RenderViewportMetrics) => void;
  readonly release: () => void;
}

/** One UI mount; closed mounts never adopt a late graphics result or revive. */
export function mountEditorViewport(
  target: HTMLCanvasElement, notify: (event: string, detail?: unknown) => void,
  pixelRatio: () => number = () => window.devicePixelRatio,
  content?: EditorViewportContent,
) {
  const limits = { maxWidthPixels: 4096, maxHeightPixels: 4096, maxPixelCount: 4_000_000 };
  let acquisition: RenderFrameAcquisition | undefined;
  let session: RenderFrameSession | undefined;
  let callback: number | undefined;
  let pending = false, closed = false, paused = false;
  let wanted: object | undefined;
  let lastMetrics: RenderViewportMetrics | undefined;
  let lastConfiguration: RenderViewportResizeReceipt | undefined;
  let lastFailure: unknown = null;
  let requests = 0, submissions = 0;
  let ratioQuery: MediaQueryList | undefined;

  const snapshot = () => ({
    host: closed ? 'unmounted' : 'mounted', pending, paused, requests, submissions,
    callbackPending: callback !== undefined, metrics: lastMetrics, lastConfiguration, lastFailure,
    viewport: acquisition && getRenderViewportSnapshot(acquisition),
    demand: session && getRenderFrameInvalidationSnapshot(session), display: 'NOT_VERIFIED',
  });
  const cancel = (): void => {
    if (callback !== undefined) cancelAnimationFrame(callback);
    callback = undefined;
  };
  const classify = (error: unknown) =>
    getRenderFrameFailure(error) ?? getRenderFailure(error) ?? 'UNRECOGNIZED';
  const report = (error: unknown): void => {
    cancel(); paused = true;
    content?.availabilityChanged?.(false);
    lastFailure = classify(error);
    // Rejected metrics must not leave a queued frame using stale configuration.
    if (!closed && session && getRenderViewportSnapshot(session).graphics.state === 'ready') {
      try { suspendRenderViewport(session); }
      catch (suspensionError) { notify('suspend-rejected', classify(suspensionError)); }
    }
    notify('request-rejected', lastFailure);
  };
  const run = (action: () => void): void => { try { action(); } catch (error) { report(error); } };
  const ready = (): RenderFrameSession | undefined => session
    && getRenderViewportSnapshot(session).graphics.state === 'ready' ? session : undefined;
  const pause = (event: string): void => {
    wanted = undefined; paused = true; cancel();
    content?.availabilityChanged?.(false);
    const current = ready();
    if (current) suspendRenderViewport(current);
    notify(event);
  };
  // This host's CSS has no canvas border, padding or transforms: bounds are its
  // logical content extent. Render alone applies ratio/rounding and native limits.
  const metrics = (): RenderViewportMetrics => {
    const bounds = target.getBoundingClientRect();
    return { logicalWidthCssPx: bounds.width, logicalHeightCssPx: bounds.height,
      requestedPixelRatio: pixelRatio() };
  };
  const configure = (resume = false): boolean => {
    const current = ready();
    if (closed || !current) return false;
    const next = metrics();
    if (document.hidden || !target.isConnected
        || next.logicalWidthCssPx <= 0 || next.logicalHeightCssPx <= 0) {
      pause('hidden-or-zero-explicit-resume-required'); return false;
    }
    if (paused && !resume) return false;
    if (!resume && lastMetrics?.logicalWidthCssPx === next.logicalWidthCssPx
        && lastMetrics.logicalHeightCssPx === next.logicalHeightCssPx
        && lastMetrics.requestedPixelRatio === next.requestedPixelRatio) return true;
    // Never write canvas.width/height directly, infer DPR inside Render or clamp.
    const receipt = resume ? resumeRenderViewport(current, next, limits)
      : resizeRenderViewport(current, next, limits);
    lastMetrics = Object.freeze(next);
    lastConfiguration = receipt;
    if (resume) paused = false;
    content?.configured(current, receipt, next);
    content?.availabilityChanged?.(true);
    notify('configured-not-submitted', receipt);
    return true;
  };
  const schedule = (): void => {
    const current = ready();
    if (closed || paused || document.hidden || !current || callback !== undefined
        || !getRenderFrameInvalidationSnapshot(current).invalidated) return;
    callback = requestAnimationFrame(() => {
      callback = undefined;
      if (closed || paused || session !== current) return;
      run(() => {
        // Re-measure as layout/DPR may precede observer delivery.
        if (!configure() || !getRenderFrameInvalidationSnapshot(current).invalidated) return;
        requests++;
        const receipt = current.renderFrame();
        submissions++;
        notify('submitted', { receipt, sameSession:
          receipt.sessionId === getRenderFrameInvalidationSnapshot(current).sessionId });
        // No requeue/idle polling/gameplay update; later host demand schedules again.
      });
    });
    notify('scheduled');
  };
  const sync = (): void => { if (!closed && configure()) schedule(); };
  const release = (): void => {
    const owned = session;
    session = undefined;
    cancel();
    content?.availabilityChanged?.(false);
    try { content?.release(); }
    finally { owned?.dispose(); } // Retain acquisition for safe terminal observations.
  };
  const start = (): void => {
    if (closed || pending || document.hidden) { notify('start-unavailable'); return; }
    release(); // Cleanup failure aborts replacement; never silently reset quarantine.
    lastMetrics = undefined; lastConfiguration = undefined; lastFailure = null; requests = 0; submissions = 0;
    paused = false; pending = true;
    const intent = {}; wanted = intent;
    const operation = beginRenderFrameSession({ target });
    acquisition = operation;
    notify('acquiring');
    void (async () => {
      try {
        const acquired = await operation.result;
        if (closed || wanted !== intent) {
          acquired.dispose();
          notify('late-acquisition-released');
          return;
        }
        session = acquired;
        content?.acquired(acquired);
        // Initial native buffer is not yet configured for this UI's CSS/DPR.
        sync();
      } catch (error) { report(error); }
      finally { pending = false; notify('acquisition-settled'); }
    })();
  };
  const visibility = (): void => {
    if (closed) return;
    run(() => {
      if (document.hidden) pause('hidden-suspended');
      else notify('visible-explicit-resume-or-start-required');
    });
  };
  const layout = (): void => { if (!closed) run(sync); };
  const loss = (): void => {
    if (closed) return;
    // Render decides actual context loss/cleanup; Observe reads after dispatch.
    cancel(); paused = true; wanted = undefined;
    content?.availabilityChanged?.(false);
    notify('native-loss-event-observe-after-dispatch');
  };
  const watchRatio = (): void => {
    ratioQuery?.removeEventListener('change', ratioChanged);
    ratioQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    ratioQuery.addEventListener('change', ratioChanged);
  };
  const ratioChanged = (): void => {
    if (!closed) run(() => { watchRatio(); sync(); });
  };
  const observer = new ResizeObserver(layout);
  const unmount = (): void => {
    if (closed) { notify('already-unmounted'); return; }
    closed = true; wanted = undefined; paused = true;
    // Close synchronously. Existing acquisition handler drains late results;
    // closed mounts never adopt/schedule them, even after page exit.
    for (const cleanup of [cancel, () => observer.disconnect(),
      () => ratioQuery?.removeEventListener('change', ratioChanged),
      () => window.removeEventListener('resize', layout),
      () => document.removeEventListener('visibilitychange', visibility),
      () => target.removeEventListener('webglcontextlost', loss),
      () => window.removeEventListener('pagehide', unmount), release]) {
      try { cleanup(); } catch (error) { report(error); }
    }
    ratioQuery = undefined;
    notify(pending ? 'unmounted-awaiting-late-release' : 'unmounted-see-cleanup-observation');
  };
  try {
    observer.observe(target);
    watchRatio();
    window.addEventListener('resize', layout);
    document.addEventListener('visibilitychange', visibility);
    target.addEventListener('webglcontextlost', loss);
    window.addEventListener('pagehide', unmount);
  } catch (error) { unmount(); throw error; }

  return Object.freeze({
    getSnapshot: snapshot,
    start: () => run(start),
    sync: () => run(sync),
    requestFrame: () => run(() => {
      if (closed || !session) { notify('request-unavailable'); return; }
      invalidateRenderFrame(session); schedule();
    }),
    suspend: () => { if (!closed) run(() => pause('suspended')); },
    resume: () => run(() => { if (!closed && configure(true)) schedule(); }),
    unmount,
  });
}
/** Optional browser playback demand. Viewport host alone submits/resizes Render frames. */
export function createEditorPreviewClock(input: {
  readonly playing: () => boolean; readonly advance: (deltaMs: number) => void;
  readonly present: () => Promise<void>; readonly suspend: () => void; readonly failure: (error: unknown) => void;
}) {
  let closed = false, available = false, generation = 0, callback: number | undefined;
  let previous: number | null = null, running = false;
  const stop = () => { running = false; generation++; previous = null;
    if (callback !== undefined) cancelAnimationFrame(callback); callback = undefined; };
  const schedule = () => {
    if (closed || !running || !available || document.hidden || !input.playing() || callback !== undefined) return;
    const current = generation;
    callback = requestAnimationFrame(timestamp => {
      callback = undefined;
      if (closed || !running || !available || document.hidden || current !== generation) return;
      const delta = previous === null ? 0 : Math.min(100, Math.max(0, timestamp - previous));
      previous = timestamp;
      void (async () => {
        try {
          input.advance(delta); await input.present();
          if (current === generation && input.playing()) schedule();
          else if (current === generation) stop();
        } catch (error) { if (current === generation) { stop(); input.failure(error); } }
      })();
    });
  };
  return Object.freeze({
    start() { if (closed || !available || document.hidden) throw new TypeError('PREVIEW_CLOCK_UNAVAILABLE');
      stop(); running = true; schedule(); }, stop,
    setAvailable(value: boolean) { available = value;
      if (!value) { stop(); if (!closed) input.suspend(); } },
    read: () => Object.freeze({ closed, available, running, callbackPending: callback !== undefined }),
    dispose() { if (!closed) { stop(); closed = true; available = false; } }
  });
}

