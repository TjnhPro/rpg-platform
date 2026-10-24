// Optional browser host only; not imported/exported by the Client root.
import {
  beginRenderFrameSession, getRenderViewportSnapshot, getRenderFrameInvalidationSnapshot,
  resizeRenderViewport, resumeRenderViewport, suspendRenderViewport, getRenderFailure, getRenderFrameFailure,
  type RenderFrameAcquisition, type RenderFrameSession, type RenderViewportMetrics,
  type RenderViewportResizeReceipt,
} from '@rpg-platform/runtime-render';

/** Private composition seam; no Client public-root export. */
export interface ClientViewportContent {
  readonly acquired: (session: RenderFrameSession) => void;
  readonly configured: (session: RenderFrameSession, receipt: RenderViewportResizeReceipt,
    metrics: RenderViewportMetrics) => void;
  readonly release: () => void;
  /** Optional presentation hook before submission. Host-selected RAF delta only;
   * first frame after every start/cancel is zero, including hidden-page gaps. */
  readonly frame?: (session: RenderFrameSession, deltaMs: number) => void;
}

/** Existing Phase6 continuous policy, independently scoped to one canvas. */
export function mountClientViewport(target: HTMLCanvasElement,
  notify: (event: string, detail?: unknown) => void,
  pixelRatio: () => number = () => window.devicePixelRatio,
  content?: ClientViewportContent) {
  const limits = { maxWidthPixels: 4096, maxHeightPixels: 4096, maxPixelCount: 4_000_000 };
  let session: RenderFrameSession | undefined;
  let acquisition: RenderFrameAcquisition | undefined;
  let lastMetrics: RenderViewportMetrics | undefined;
  let lastConfiguration: RenderViewportResizeReceipt | undefined;
  let lastFailure: unknown = null;
  let ratioQuery: MediaQueryList | undefined;
  let callback: number | undefined;
  let running = false, pending = false, wanted = false, closed = false;
  let submissions = 0;
  let previousTimestamp: number | undefined;

  function snapshot() { return { running, callbackPending: callback !== undefined,
    pending, host: closed ? 'unmounted' : 'mounted', metrics: lastMetrics, lastConfiguration, lastFailure,
    submissions, viewport: acquisition && getRenderViewportSnapshot(acquisition),
    demand: session && getRenderFrameInvalidationSnapshot(session), display: 'NOT_VERIFIED' }; }
  function show(event: string, detail?: unknown): void { notify(event, detail); }
  function cancel(): void {
    running = false;
    previousTimestamp = undefined;
    if (callback !== undefined) cancelAnimationFrame(callback);
    callback = undefined;
  }
  const classify = (error: unknown) => getRenderFrameFailure(error) ?? getRenderFailure(error) ?? 'UNRECOGNIZED';
  function failure(error: unknown): void {
    cancel();
    lastFailure = classify(error);
    if (session && getRenderViewportSnapshot(session).graphics.state === 'ready') {
      try { suspendRenderViewport(session); }
      catch (suspensionError) { show('suspend-rejected', classify(suspensionError)); }
    }
    show('stopped-after-rejection', lastFailure);
  }
  function run(action: () => void): void { try { action(); } catch (error) { failure(error); } }
  function stop(): void {
    wanted = false; cancel();
    if (session && getRenderViewportSnapshot(session).graphics.state === 'ready') suspendRenderViewport(session);
    show('stopped-suspended');
  }
  function configure(resume = false): boolean {
    if (closed || !session) return false;
    if (getRenderViewportSnapshot(session).graphics.state !== 'ready') {
      cancel(); show('terminal-explicit-acquire-required'); return false;
    }
    if (!resume && content && getRenderViewportSnapshot(session).state === 'suspended') return false;
    // Demo canvas is untransformed, borderless and padding-free. Host measures CSS;
    // Render alone rounds/enforces budgets and writes the live backing buffer.
    const bounds = target.getBoundingClientRect();
    const next = { logicalWidthCssPx: bounds.width, logicalHeightCssPx: bounds.height,
      requestedPixelRatio: pixelRatio() };
    if (document.hidden || !target.isConnected || bounds.width <= 0 || bounds.height <= 0) {
      stop(); show('hidden-or-zero-explicit-start-required'); return false;
    }
    if (!resume && lastMetrics?.logicalWidthCssPx === next.logicalWidthCssPx
        && lastMetrics.logicalHeightCssPx === next.logicalHeightCssPx
        && lastMetrics.requestedPixelRatio === next.requestedPixelRatio) return true;
    const receipt = resume ? resumeRenderViewport(session, next, limits)
      : resizeRenderViewport(session, next, limits);
    lastMetrics = Object.freeze(next);
    lastConfiguration = receipt;
    content?.configured(session, receipt, next);
    show('configured-not-submitted', receipt);
    return true;
  }
  function schedule(): void {
    const current = session;
    if (!running || !current || closed || document.hidden || callback !== undefined) return;
    callback = requestAnimationFrame(timestamp => {
      callback = undefined;
      if (!running || session !== current || closed || document.hidden) { cancel(); return; }
      if (getRenderViewportSnapshot(current).state !== 'active') { cancel(); show('not-renderable'); return; }
      try {
        // Observer delivery may lag layout/DPR; remeasure before submission.
        if (!configure()) return;
        // Host clock policy only. Render alone accumulates animation elapsed;
        // no gameplay/simulation tick is introduced by this optional callback.
        const deltaMs = previousTimestamp === undefined ? 0 : timestamp - previousTimestamp;
        previousTimestamp = timestamp;
        content?.frame?.(current, deltaMs);
        const receipt = current.renderFrame();
        submissions++;
        schedule();
        show('submitted', { receipt, sameSession:
          receipt.sessionId === getRenderFrameInvalidationSnapshot(current).sessionId });
      } catch (error) { failure(error); }
    });
  }
  function dispose(): void {
    wanted = false; cancel();
    const owned = session;
    session = undefined;
    try { content?.release(); }
    finally { owned?.dispose(); } // Preserve terminal diagnostics even on content cleanup failure.
    show(pending ? 'release-awaiting-late-result' : 'disposed-see-cleanup-observation');
  }
  function startFrames(): void {
    if (!session || closed || document.hidden || pending) { show('start-unavailable'); return; }
    if (!configure(true)) return;
    if (!running) previousTimestamp = undefined;
    running = true; schedule(); show('started');
  }
  function acquire(): void {
    if (pending || closed) return;
    dispose(); pending = true; wanted = true;
    lastMetrics = undefined; lastConfiguration = undefined; lastFailure = null;
    const operation = beginRenderFrameSession({ target });
    acquisition = operation;
    show('acquiring');
    void (async () => {
      try {
        const acquired = await operation.result;
        if (!wanted || closed) { acquired.dispose(); show('late-acquisition-released'); return; }
        session = acquired; submissions = 0;
        content?.acquired(acquired);
        // Acquire/configure does not schedule; Start remains explicit.
        suspendRenderViewport(acquired);
      if (!content) configure();
        show('acquired-explicit-start-required');
      } catch (error) { failure(error); }
      finally { pending = false; show('acquisition-settled'); }
    })();
  }
  function visibility(): void {
    run(() => { if (document.hidden) stop(); else show('visible-explicit-start-required'); });
  }
  function layout(): void { if (!closed) run(() => { configure(); }); }
  function loss(): void { wanted = false; cancel(); show('native-loss-event-observe-after-dispatch'); }
  function watchRatio(): void {
    ratioQuery?.removeEventListener('change', ratioChanged);
    ratioQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    ratioQuery.addEventListener('change', ratioChanged);
  }
  function ratioChanged(): void { if (!closed) run(() => { watchRatio(); configure(); }); }
  const observer = new ResizeObserver(layout);
  function unmount(): void {
    if (closed) return;
    closed = true; wanted = false;
    // Close first; independently drain host cleanup even if backend release fails.
    for (const cleanup of [cancel, () => observer.disconnect(),
      () => ratioQuery?.removeEventListener('change', ratioChanged),
      () => window.removeEventListener('resize', layout),
      () => document.removeEventListener('visibilitychange', visibility),
      () => target.removeEventListener('webglcontextlost', loss),
      () => window.removeEventListener('pagehide', unmount), dispose]) run(cleanup);
    ratioQuery = undefined;
    show(pending ? 'unmounted-awaiting-late-release' : 'unmounted-reload-to-mount');
  }
  try {
    observer.observe(target);
    watchRatio();
    window.addEventListener('resize', layout);
    document.addEventListener('visibilitychange', visibility);
    target.addEventListener('webglcontextlost', loss);
    window.addEventListener('pagehide', unmount);
  } catch (error) { unmount(); throw error; }

  return Object.freeze({ getSnapshot: snapshot, acquire: () => run(acquire), start: () => run(startFrames),
    stop: () => run(stop), sync: () => run(layout), dispose: () => run(dispose), unmount });
}
