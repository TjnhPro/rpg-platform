// Optional manual browser entry; not imported or exported by the package root.
import {
  beginRenderFrameSession, getRenderViewportSnapshot, getRenderFailure, getRenderFrameFailure,
  type RenderFrameAcquisition, type RenderFrameSession, type RenderViewportSnapshot,
} from '@rpg-platform/runtime-render';

const output = document.querySelector<HTMLPreElement>('#output');
if (!output) throw new Error('Manual viewport output missing');
function write(value: unknown): void {
  output!.textContent += `${JSON.stringify(value, (_key, item: unknown) => typeof item === 'symbol' ? String(item) : item)}\n`;
}
function report(error: unknown): void {
  write(getRenderFailure(error) ?? getRenderFrameFailure(error) ?? { failure: 'UNRECOGNIZED' });
}

function slot(label: string) {
  const canvas = document.querySelector<HTMLCanvasElement>(`#canvas-${label}`);
  const acquire = document.querySelector<HTMLButtonElement>(`#acquire-${label}`);
  const dispose = document.querySelector<HTMLButtonElement>(`#dispose-${label}`);
  if (!canvas || !acquire || !dispose) throw new Error(`Manual viewport ${label} host missing`);
  let operation: RenderFrameAcquisition | undefined;
  let session: RenderFrameSession | undefined;
  let pending = false;
  let unwanted = false;
  let previous: RenderViewportSnapshot | undefined;
  const read = (): RenderViewportSnapshot | undefined => operation && getRenderViewportSnapshot(operation);
  const observe = (): void => {
    const current = read();
    write({ label, previous, current });
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
