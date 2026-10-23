// Explicit manual browser entry only; never imported/exported by the package root.
import {
  beginRenderFrameSession, getRenderFailure, getRenderFrameFailure, inspectRenderTarget,
  type RenderFrameAcquisition, type RenderFrameSession, type RenderGraphicsSnapshot,
} from '@rpg-platform/runtime-render';

const canvasElement = document.querySelector<HTMLCanvasElement>('#canvas');
const selectionElement = document.querySelector<HTMLSelectElement>('#target');
const outputElement = document.querySelector<HTMLPreElement>('#output');
const acquireButton = document.querySelector<HTMLButtonElement>('#acquire');
const inspectButton = document.querySelector<HTMLButtonElement>('#observe');
const frameButton = document.querySelector<HTMLButtonElement>('#frame');
const disposeButton = document.querySelector<HTMLButtonElement>('#dispose');
if (!canvasElement || !selectionElement || !outputElement || !acquireButton
  || !inspectButton || !frameButton || !disposeButton) {
  throw new Error('Manual graphics lifecycle host elements missing');
}
const canvas = canvasElement;
const selection = selectionElement;
const output = outputElement;
let acquisition: RenderFrameAcquisition | undefined;
let session: RenderFrameSession | undefined;
let pending = false;
let leaving = false;
let unwanted = false;

function write(value: unknown): void { output.textContent += `${JSON.stringify(value)}\n`; }
function observe(): void {
  const snapshot: RenderGraphicsSnapshot | undefined = acquisition?.getSnapshot();
  write(snapshot ?? { state: 'not-started' });
  write(inspectRenderTarget(canvas));
}
function report(error: unknown): void {
  write(getRenderFailure(error) ?? getRenderFrameFailure(error) ?? { failure: 'UNRECOGNIZED' });
}
function dispose(): void {
  unwanted = true;
  try { session?.dispose(); } catch (error) { report(error); }
  observe();
}

acquireButton.onclick = async () => {
  if (pending || leaving) return;
  // Retain the observation of the previous release before selecting a new request.
  dispose();
  session = undefined;
  unwanted = false;
  pending = true;
  const operation = beginRenderFrameSession({ target: selection.value === 'canvas' ? canvas : {} });
  acquisition = operation;
  observe();
  try {
    const acquired = await operation.result;
    session = acquired;
    if (leaving || unwanted) acquired.dispose();
    else write({ binding: acquired.getSnapshot().state, frame: 'NOT_SUBMITTED' });
  } catch (error) { report(error); }
  finally { pending = false; observe(); }
};
inspectButton.onclick = observe;
disposeButton.onclick = dispose;
frameButton.onclick = () => {
  if (!session) { write({ frame: 'NO_ACQUIRED_SESSION' }); return; }
  try { write(session.renderFrame()); } catch (error) { report(error); }
  observe();
};
window.addEventListener('pagehide', () => { leaving = true; dispose(); });
window.addEventListener('pageshow', () => { leaving = false; });
// Manual host listeners are separate from Render's private listener. Browser
// restoration does not acquire a session; the user must click Begin again.
canvas.addEventListener('webglcontextlost', (event) => {
  event.preventDefault();
  write({ browserEvent: 'webglcontextlost' });
  queueMicrotask(observe); // Observe after Render's event cleanup in this dispatch.
});
canvas.addEventListener('webglcontextrestored', () => {
  write({ browserEvent: 'webglcontextrestored', recreation: 'EXPLICIT_REQUEST_REQUIRED' });
  observe();
});
