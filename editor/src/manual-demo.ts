// Explicit browser entrypoint only. Never imported by the Editor package root.
import {
  createRenderFrameSession,
  getRenderFailure,
  getRenderFrameFailure,
  type RenderFrameSession,
} from '@rpg-platform/runtime-render';

const canvas = document.querySelector('canvas');
const start = document.querySelector<HTMLButtonElement>('#start');
const release = document.querySelector<HTMLButtonElement>('#dispose');
const status = document.querySelector<HTMLOutputElement>('#status');
if (canvas === null || start === null || release === null || status === null) {
  throw new Error('Manual demo host elements missing');
}
const target = canvas;
const startButton = start;
const disposeButton = release;
const output = status;
let session: RenderFrameSession | undefined;
let pending = false;
let leaving = false;

function report(error: unknown): void {
  const graphics = getRenderFrameFailure(error);
  const binding = getRenderFailure(error);
  output.textContent = graphics
    ? `Failure: ${graphics.code} (${graphics.stage}); cleanupFailed=${graphics.cleanupFailed}`
    : binding ? `Failure: ${binding.code} (${binding.stage})` : 'Unknown failure; no success claimed.';
}

function dispose(): void {
  const owned = session;
  session = undefined;
  disposeButton.disabled = true;
  try {
    owned?.dispose();
    output.textContent = 'Disposed. Canvas remains host-owned. Start again for a new session.';
  } catch (error) {
    report(error);
  }
}

startButton.addEventListener('click', async () => {
  if (pending || leaving) return;
  dispose();
  pending = true;
  startButton.disabled = true;
  output.textContent = 'Acquiring graphics…';
  try {
    const acquired = await createRenderFrameSession({ target });
    if (leaving) {
      acquired.dispose();
      return;
    }
    session = acquired;
    const receipt = session.renderFrame();
    output.textContent = `Frame ${receipt.status}. Expected: solid blue canvas. Display/visual verification is manual.`;
    disposeButton.disabled = false;
  } catch (error) {
    // Frame failures already terminally clean up; repeated disposal is safe.
    try { session?.dispose(); } catch (cleanupError) {
      report(cleanupError);
      return;
    } finally { session = undefined; }
    report(error);
  } finally {
    pending = false;
    startButton.disabled = leaving;
  }
});
disposeButton.addEventListener('click', dispose);
window.addEventListener('pagehide', () => { leaving = true; dispose(); });
window.addEventListener('pageshow', () => { leaving = false; startButton.disabled = pending; });
