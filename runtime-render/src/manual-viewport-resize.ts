// Optional manual consumer, public root only; no automatic frame or assertions.
import {
  beginRenderFrameSession, resizeRenderViewport, getRenderViewportSnapshot,
  getRenderFailure, getRenderFrameFailure, inspectRenderTarget,
  type RenderFrameSession, type RenderViewportMetrics,
} from '@rpg-platform/runtime-render';

const canvas = document.querySelector<HTMLCanvasElement>('#canvas');
const output = document.querySelector<HTMLPreElement>('#output');
const ratio = document.querySelector<HTMLInputElement>('#ratio');
if (!canvas || !output || !ratio) throw new Error('Manual resize host missing');
const target = canvas, log = output, ratioInput = ratio;
let session: RenderFrameSession | undefined;
let pending = false;
let unwanted = false;
let last: RenderViewportMetrics | undefined;
let originalId: symbol | undefined;
const limits = { maxWidthPixels: 4096, maxHeightPixels: 4096, maxPixelCount: 4_000_000 };

function write(value: unknown): void {
  log.textContent += JSON.stringify(value, (_key, item: unknown) => typeof item === 'symbol' ? String(item) : item) + '\n';
}
function observe(): void {
  write({ viewport: session && getRenderViewportSnapshot(session), target: inspectRenderTarget(target),
    css: { width: target.style.width, height: target.style.height } });
}
function report(error: unknown): void {
  write(getRenderFailure(error) ?? getRenderFrameFailure(error) ?? {
    failure: error instanceof TypeError ? 'INVALID_REQUEST'
      : error instanceof RangeError ? 'REJECTED_REQUEST' : 'UNRECOGNIZED',
    name: error instanceof Error ? error.name : 'unknown',
  });
  observe();
}
function button(id: string, action: () => void): void {
  const control = document.querySelector<HTMLButtonElement>(`#${id}`);
  if (!control) throw new Error(`Manual control ${id} missing`);
  control.onclick = () => { try { action(); } catch (error) { report(error); } };
}
function apply(metrics: RenderViewportMetrics): void {
  if (!session) { write({ resize: 'NO_SESSION' }); return; }
  const receipt = resizeRenderViewport(session, metrics, limits);
  last = metrics;
  write({ receipt, sameIdentity: receipt.sessionId === originalId });
  observe();
}
button('acquire', () => {
  if (pending) return;
  if (session) { write({ acquire: 'RELOAD_DEMO_TO_ACQUIRE_AGAIN' }); return; }
  pending = true; unwanted = false;
  const acquisition = beginRenderFrameSession({ target });
  write(getRenderViewportSnapshot(acquisition));
  void acquisition.result.then((result) => {
    session = result;
    originalId = result.getSnapshot().descriptor.id;
    if (unwanted) result.dispose();
    observe();
  }).catch(report).finally(() => { pending = false; });
});
button('large', () => apply({ logicalWidthCssPx: 800, logicalHeightCssPx: 450, requestedPixelRatio: Number(ratioInput.value) }));
button('small', () => apply({ logicalWidthCssPx: 600, logicalHeightCssPx: 400, requestedPixelRatio: Number(ratioInput.value) }));
button('repeat', () => { if (last) apply(last); else write({ repeat: 'NO_ACCEPTED_REQUEST' }); });
button('invalid', () => apply({ logicalWidthCssPx: 0, logicalHeightCssPx: 400, requestedPixelRatio: 1 }));
button('excessive', () => apply({ logicalWidthCssPx: 800, logicalHeightCssPx: 450, requestedPixelRatio: 100 }));
button('frame', () => write(session ? session.renderFrame() : { frame: 'NO_SESSION' }));
button('observe', observe);
button('dispose', () => { unwanted = true; session?.dispose(); observe(); });
window.addEventListener('pagehide', () => {
  unwanted = true;
  try { session?.dispose(); } catch (error) { report(error); }
});
