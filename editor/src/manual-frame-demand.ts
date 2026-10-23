// Optional browser host, isolated from the Editor root. No authored-state mutation.
import {
  createRenderFrameSession, getRenderViewportSnapshot, getRenderFrameInvalidationSnapshot,
  invalidateRenderFrame, resizeRenderViewport, suspendRenderViewport, resumeRenderViewport,
  getRenderFailure, getRenderFrameFailure, type RenderFrameSession,
} from '@rpg-platform/runtime-render';

const canvas = document.querySelector<HTMLCanvasElement>('canvas');
const output = document.querySelector<HTMLPreElement>('#output');
if (!canvas || !output) throw new Error('On-demand host elements missing');
const target = canvas, log = output;
const limits = { maxWidthPixels: 4096, maxHeightPixels: 4096, maxPixelCount: 4_000_000 };
let session: RenderFrameSession | undefined;
let callback: number | undefined;
let pending = false, wanted = false, leaving = false;
let requests = 0, submissions = 0;

function show(event: string, detail?: unknown): void {
  log.textContent = JSON.stringify({ event, detail, requests, submissions,
    callbackPending: callback !== undefined,
    viewport: session && getRenderViewportSnapshot(session),
    demand: session && getRenderFrameInvalidationSnapshot(session),
    display: 'NOT_VERIFIED',
  }, (_key, value: unknown) => typeof value === 'symbol' ? String(value) : value, 2);
}
function cancel(): void {
  if (callback !== undefined) cancelAnimationFrame(callback);
  callback = undefined;
}
function failure(error: unknown): void {
  cancel(); // No automatic retry after any exception.
  show('request-rejected', getRenderFrameFailure(error) ?? getRenderFailure(error) ?? 'UNRECOGNIZED');
}
function schedule(): void {
  const current = session;
  if (!current || leaving || document.hidden || callback !== undefined) return;
  if (getRenderViewportSnapshot(current).state !== 'active'
      || !getRenderFrameInvalidationSnapshot(current).invalidated) return;
  callback = requestAnimationFrame(() => {
    callback = undefined;
    if (session !== current || leaving || document.hidden) return;
    if (getRenderViewportSnapshot(current).state !== 'active'
        || !getRenderFrameInvalidationSnapshot(current).invalidated) { show('deferred'); return; }
    try {
      requests++;
      const receipt = current.renderFrame();
      submissions++;
      show('submitted', { receipt, sameSession:
        receipt.sessionId === getRenderFrameInvalidationSnapshot(current).sessionId });
      // No idle polling/requeue: a later host event explicitly schedules demand.
    } catch (error) { failure(error); }
  });
  show('scheduled');
}
function metrics() {
  const bounds = target.getBoundingClientRect();
  return { logicalWidthCssPx: bounds.width, logicalHeightCssPx: bounds.height, requestedPixelRatio: 1 };
}
function dispose(): void {
  wanted = false;
  cancel();
  try { session?.dispose(); show('disposed'); } catch (error) { failure(error); }
  finally { session = undefined; }
}
function button(id: string, action: () => void): void {
  const element = document.querySelector<HTMLButtonElement>(`#${id}`);
  if (!element) throw new Error(`On-demand control missing: ${id}`);
  element.onclick = () => { try { action(); } catch (error) { failure(error); } };
}
button('acquire', () => {
  if (pending || leaving) return;
  dispose(); wanted = true; pending = true;
  show('acquiring');
  void (async () => {
    try {
      const acquired = await createRenderFrameSession({ target });
      if (!wanted || leaving) { acquired.dispose(); show('late-acquisition-released'); return; }
      session = acquired;
      requests = 0; submissions = 0;
      if (document.hidden) suspendRenderViewport(acquired);
      schedule();
      show('acquired');
    } catch (error) { failure(error); }
    finally { pending = false; }
  })();
});
button('invalidate', () => {
  if (!session) { show('no-session'); return; }
  // Three host invalidations in one turn; one pending browser callback/demand.
  invalidateRenderFrame(session); invalidateRenderFrame(session); invalidateRenderFrame(session);
  schedule(); show('invalidated-three-times');
});
button('resize', () => {
  if (!session) { show('no-session'); return; }
  target.style.width = target.style.width === '400px' ? '320px' : '400px';
  const receipt = resizeRenderViewport(session, metrics(), limits);
  show('resized-not-submitted', receipt); schedule();
});
button('stop', () => {
  wanted = false;
  cancel();
  if (session) suspendRenderViewport(session);
  show('suspended');
});
button('resume', () => {
  if (!session || document.hidden) { show('resume-unavailable'); return; }
  const receipt = resumeRenderViewport(session, metrics(), limits);
  show('resumed-not-submitted', receipt); schedule();
});
button('observe', () => show('observed'));
button('dispose', dispose);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) { show('visible-explicit-resume-required'); return; }
  wanted = false;
  cancel();
  try {
    if (session && getRenderViewportSnapshot(session).graphics.state === 'ready') suspendRenderViewport(session);
    show('hidden-suspended');
  } catch (error) { failure(error); }
});
// Host cancels pending work immediately on native loss; Render owns detection/cleanup.
target.addEventListener('webglcontextlost', () => { cancel(); show('native-loss-event'); });
window.addEventListener('pagehide', () => { leaving = true; dispose(); });
window.addEventListener('pageshow', () => { leaving = false; show('explicit-acquire-required'); });
