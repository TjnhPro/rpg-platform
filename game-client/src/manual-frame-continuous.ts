// Optional browser host only; not imported/exported by the Client root.
import {
  beginRenderFrameSession, getRenderViewportSnapshot, getRenderFrameInvalidationSnapshot,
  resizeRenderViewport, resumeRenderViewport, suspendRenderViewport, getRenderFailure, getRenderFrameFailure,
  type RenderFrameAcquisition, type RenderFrameSession, type RenderViewportMetrics,
  type RenderViewportResizeReceipt,
} from '@rpg-platform/runtime-render';

const root = document.querySelector('[data-client-viewport]') ?? document;
const canvas = root.querySelector<HTMLCanvasElement>('canvas');
const output = root.querySelector<HTMLPreElement>('[data-output], #output');
const ratio = root.querySelector<HTMLSelectElement>('[data-ratio]');
if (!canvas || !output) throw new Error('Continuous host elements missing');
const target = canvas, log = output;
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

function show(event: string, detail?: unknown): void {
  log.textContent = JSON.stringify({ event, detail, running, callbackPending: callback !== undefined,
    pending, host: closed ? 'unmounted' : 'mounted', metrics: lastMetrics, lastConfiguration, lastFailure,
    submissions, viewport: acquisition && getRenderViewportSnapshot(acquisition),
    demand: session && getRenderFrameInvalidationSnapshot(session), display: 'NOT_VERIFIED',
  }, (_key, value: unknown) => typeof value === 'symbol' ? String(value) : value, 2);
}
function cancel(): void {
  running = false;
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
  // Demo canvas is untransformed, borderless and padding-free. Host measures CSS;
  // Render alone rounds/enforces budgets and writes the live backing buffer.
  const bounds = target.getBoundingClientRect();
  const next = { logicalWidthCssPx: bounds.width, logicalHeightCssPx: bounds.height,
    requestedPixelRatio: ratio?.value === '1' ? 1 : ratio?.value === '2' ? 2 : window.devicePixelRatio };
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
  show('configured-not-submitted', receipt);
  return true;
}
function schedule(): void {
  const current = session;
  if (!running || !current || closed || document.hidden || callback !== undefined) return;
  callback = requestAnimationFrame(() => {
    callback = undefined;
    if (!running || session !== current || closed || document.hidden) { cancel(); return; }
    if (getRenderViewportSnapshot(current).state !== 'active') { cancel(); show('not-renderable'); return; }
    try {
      // Observer delivery may lag layout/DPR; remeasure before submission.
      if (!configure()) return;
      // Continuous policy requests even when invalidated=false. Timestamp unused:
      // a Render submission never advances gameplay/simulation/animation time.
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
  owned?.dispose(); // Failure propagates; acquisition retains cleanup/quarantine diagnostics.
  show(pending ? 'release-awaiting-late-result' : 'disposed-see-cleanup-observation');
}
function startFrames(): void {
  if (!session || closed || document.hidden || pending) { show('start-unavailable'); return; }
  if (!configure(true)) return;
  running = true; schedule(); show('started');
}
function button(id: string, action: () => void): void {
  const element = root.querySelector<HTMLButtonElement>(`[data-control="${id}"], #${id}`);
  if (!element) throw new Error(`Continuous control missing: ${id}`);
  element.onclick = () => { if (!closed) run(action); };
}
button('acquire', () => {
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
      // Acquire/configure does not schedule; Start remains explicit.
      suspendRenderViewport(acquired);
      configure();
      show('acquired-explicit-start-required');
    } catch (error) { failure(error); }
    finally { pending = false; show('acquisition-settled'); }
  })();
});
button('start', startFrames);
button('stop', stop);
button('dispose', dispose);
button('observe', () => show('observed'));
button('resize', () => { target.style.width = target.style.width === '480px' ? '320px' : '480px'; layout(); });
button('zero', () => { target.style.height = '0px'; layout(); });
button('restore', () => { target.style.height = '180px'; layout(); });
button('unmount', unmount);
if (ratio) ratio.onchange = () => layout();

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
  if (ratio) ratio.onchange = null;
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
