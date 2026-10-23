// Optional manual browser entry; not imported or exported by the package root.
import {
  beginRenderFrameSession, getRenderViewportSnapshot, getRenderFailure, getRenderFrameFailure,
  type RenderFrameAcquisition, type RenderFrameSession, type RenderViewportSnapshot,
  suspendRenderViewport, resumeRenderViewport, inspectRenderTarget,
} from '@rpg-platform/runtime-render';

const output = document.querySelector<HTMLPreElement>('#output');
if (!output) throw new Error('Manual viewport output missing');
function write(value: unknown): void {
  output!.textContent += `${JSON.stringify(value, (_key, item: unknown) => typeof item === 'symbol' ? String(item) : item)}\n`;
}
function report(error: unknown): void {
  write(getRenderFailure(error) ?? getRenderFrameFailure(error) ?? {
    failure: 'UNRECOGNIZED', exceptionName: error instanceof Error ? error.name : 'unknown',
  });
}

function slot(label: string) {
  const canvas = document.querySelector<HTMLCanvasElement>(`#canvas-${label}`);
  const acquire = document.querySelector<HTMLButtonElement>(`#acquire-${label}`);
  const dispose = document.querySelector<HTMLButtonElement>(`#dispose-${label}`);
  if (!canvas || !acquire || !dispose) throw new Error(`Manual viewport ${label} host missing`);
  const target = canvas;
  const logicalWidth = target.width, logicalHeight = target.height;
  const limits = { maxWidthPixels: 4096, maxHeightPixels: 4096, maxPixelCount: 4_000_000 };
  let operation: RenderFrameAcquisition | undefined;
  let session: RenderFrameSession | undefined;
  let pending = false;
  let unwanted = false;
  let previous: RenderViewportSnapshot | undefined;
  const read = (): RenderViewportSnapshot | undefined => operation && getRenderViewportSnapshot(operation);
  const observe = (): void => {
    const current = read();
    write({ label, previous, current, target: inspectRenderTarget(target),
      host: { hidden: target.hidden, measured: { width: target.getBoundingClientRect().width,
        height: target.getBoundingClientRect().height }, visibility: document.visibilityState } });
    if (session) {
      const fromSession: RenderViewportSnapshot = getRenderViewportSnapshot(session);
      write({ label, sessionObservation: fromSession,
        sameIdentity: current?.sessionId === fromSession.sessionId });
    }
    previous = current;
  };
  const release = (): void => {
    unwanted = true;
    try { session?.dispose(); } catch (error) { report(error); }
    observe();
  };
  acquire.onclick = async () => {
    if (pending) return;
    release();
    session = undefined;
    unwanted = false;
    pending = true;
    operation = beginRenderFrameSession({ target: canvas });
    observe();
    try {
      session = await operation.result;
      if (unwanted) session.dispose();
    } catch (error) { report(error); }
    finally { pending = false; observe(); }
  };
  dispose.onclick = release;
  const control = (name: string, action: (current: RenderFrameSession) => void): void => {
    const button = document.querySelector<HTMLButtonElement>(`#${name}-${label}`);
    if (!button) throw new Error(`Manual viewport ${label}/${name} control missing`);
    button.onclick = () => {
      if (!session) { write({ label, status: 'NO_SESSION' }); return; }
      try { action(session); } catch (error) { report(error); }
      observe();
    };
  };
  control('suspend', (current) => write(suspendRenderViewport(current)));
  control('hidden', () => { target.hidden = !target.hidden; }); // Host UI only.
  control('zero', (current) => {
    target.style.width = '0px'; target.style.height = '0px'; // Host layout, not buffer.
    const measured = target.getBoundingClientRect();
    if (measured.width === 0 || measured.height === 0) write(suspendRenderViewport(current));
  });
  control('invalid-resume', (current) => write(resumeRenderViewport(current,
    { logicalWidthCssPx: 0, logicalHeightCssPx: logicalHeight, requestedPixelRatio: 1 }, limits)));
  control('resume', (current) => {
    const before = getRenderViewportSnapshot(current);
    target.hidden = false;
    target.style.width = `${logicalWidth}px`; target.style.height = `${logicalHeight}px`;
    const measured = target.getBoundingClientRect();
    const receipt = resumeRenderViewport(current, { logicalWidthCssPx: measured.width,
      logicalHeightCssPx: measured.height, requestedPixelRatio: 1 }, limits);
    write({ label, receipt, sameIdentity: receipt.sessionId === before.sessionId });
  });
  control('frame', (current) => write(current.renderFrame()));
  return { read, observe, release };
}

const a = slot('A');
const b = slot('B');
const observe = document.querySelector<HTMLButtonElement>('#observe');
if (!observe) throw new Error('Manual viewport observe control missing');
observe.onclick = () => {
  a.observe(); b.observe();
  const first = a.read(), second = b.read();
  write({ independentSessionIds: first?.sessionId != null && second?.sessionId != null
    ? first.sessionId !== second.sessionId : 'NOT_AVAILABLE' });
};
window.addEventListener('pagehide', () => { a.release(); b.release(); });
