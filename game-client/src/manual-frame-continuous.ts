// Optional browser host only; not imported/exported by the Client root.
import {
  createRenderFrameSession, getRenderViewportSnapshot, getRenderFrameInvalidationSnapshot,
  resumeRenderViewport, suspendRenderViewport, getRenderFailure, getRenderFrameFailure,
  type RenderFrameSession,
} from '@rpg-platform/runtime-render';

const canvas = document.querySelector<HTMLCanvasElement>('canvas');
const output = document.querySelector<HTMLPreElement>('#output');
if (!canvas || !output) throw new Error('Continuous host elements missing');
const target = canvas, log = output;
const limits = { maxWidthPixels: 4096, maxHeightPixels: 4096, maxPixelCount: 4_000_000 };
let session: RenderFrameSession | undefined;
let callback: number | undefined;
let running = false, pending = false, wanted = false, leaving = false;
let submissions = 0;

function show(event: string, detail?: unknown): void {
  log.textContent = JSON.stringify({ event, detail, running, callbackPending: callback !== undefined,
    submissions, viewport: session && getRenderViewportSnapshot(session),
    demand: session && getRenderFrameInvalidationSnapshot(session), display: 'NOT_VERIFIED',
  }, (_key, value: unknown) => typeof value === 'symbol' ? String(value) : value, 2);
}
function cancel(): void {
  running = false;
  if (callback !== undefined) cancelAnimationFrame(callback);
  callback = undefined;
}
function failure(error: unknown): void {
  cancel();
  show('stopped-after-rejection', getRenderFrameFailure(error) ?? getRenderFailure(error) ?? 'UNRECOGNIZED');
}
function schedule(): void {
  const current = session;
  if (!running || !current || leaving || document.hidden || callback !== undefined) return;
  callback = requestAnimationFrame(() => {
    callback = undefined;
    if (!running || session !== current || leaving || document.hidden) { cancel(); return; }
    if (getRenderViewportSnapshot(current).state !== 'active') { cancel(); show('not-renderable'); return; }
    try {
      // Continuous policy deliberately requests even when invalidated=false.
      // Browser timestamp is unused; no simulation/animation time is advanced.
      const receipt = current.renderFrame();
      submissions++;
      schedule();
      show('submitted', { receipt, sameSession:
        receipt.sessionId === getRenderFrameInvalidationSnapshot(current).sessionId });
    } catch (error) { failure(error); }
  });
}
function stop(): void {
  wanted = false; cancel();
  if (session && getRenderViewportSnapshot(session).graphics.state === 'ready') suspendRenderViewport(session);
  show('stopped-suspended');
}
function dispose(): void {
  wanted = false; cancel();
  try { session?.dispose(); show('disposed'); } catch (error) { failure(error); }
  finally { session = undefined; }
}
function startFrames(): void {
  if (!session || leaving || document.hidden) { show('start-unavailable'); return; }
  const bounds = target.getBoundingClientRect();
  resumeRenderViewport(session, { logicalWidthCssPx: bounds.width,
    logicalHeightCssPx: bounds.height, requestedPixelRatio: 1 }, limits);
  running = true; schedule(); show('started');
}
function button(id: string, action: () => void): void {
  const element = document.querySelector<HTMLButtonElement>(`#${id}`);
  if (!element) throw new Error(`Continuous control missing: ${id}`);
  element.onclick = () => { try { action(); } catch (error) { failure(error); } };
}
button('acquire', () => {
  if (pending || leaving) return;
  dispose(); pending = true; wanted = true;
  show('acquiring');
  void (async () => {
    try {
      const acquired = await createRenderFrameSession({ target });
      if (!wanted || leaving) { acquired.dispose(); show('late-acquisition-released'); return; }
      session = acquired; submissions = 0;
      if (document.hidden) suspendRenderViewport(acquired);
      show('acquired-explicit-start-required');
    } catch (error) { failure(error); }
    finally { pending = false; }
  })();
});
button('start', startFrames);
button('stop', stop);
button('dispose', dispose);
button('observe', () => show('observed'));
document.addEventListener('visibilitychange', () => {
  try { if (document.hidden) stop(); else show('visible-explicit-start-required'); }
  catch (error) { failure(error); }
});
target.addEventListener('webglcontextlost', () => { cancel(); show('native-loss-event'); });
window.addEventListener('pagehide', () => { leaving = true; dispose(); });
window.addEventListener('pageshow', () => { leaving = false; show('explicit-acquire-required'); });
