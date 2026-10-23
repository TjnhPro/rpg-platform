// Optional browser entry. Editor root and binding-only PreviewHost stay portable.
import { mountEditorViewport } from './viewport-host.js';

const root = document.querySelector('[data-editor-viewport]') ?? document;
const canvas = root.querySelector<HTMLCanvasElement>('canvas');
const output = root.querySelector<HTMLPreElement>('[data-output], #output');
const ratio = root.querySelector<HTMLSelectElement>('[data-ratio]');
if (!canvas || !output) throw new Error('Editor viewport host elements missing');
const target = canvas, log = output;
let host: ReturnType<typeof mountEditorViewport> | undefined;

function show(event: string, detail?: unknown): void {
  log.textContent = JSON.stringify({ event, detail, ...host?.getSnapshot() },
    (_key, value: unknown) => typeof value === 'symbol' ? String(value) : value, 2);
}
function button(id: string, action: () => void): void {
  const element = root.querySelector<HTMLButtonElement>(`[data-control="${id}"], #${id}`);
  if (!element) throw new Error(`Editor viewport control missing: ${id}`);
  element.onclick = () => {
    try { action(); }
    catch { show('host-action-rejected', 'UNRECOGNIZED'); }
  };
}
button('mount', () => {
  if (host?.getSnapshot().pending) { show('wait-for-pending-acquisition-release'); return; }
  if (host?.getSnapshot().host === 'mounted') { show('already-mounted'); return; }
  host = mountEditorViewport(target, show, () => ratio?.value === '1' ? 1
    : ratio?.value === '2' ? 2 : window.devicePixelRatio);
  show('mounted-no-graphics');
});
button('acquire', () => { if (host) host.start(); else show('mount-required'); });
button('frame', () => host?.requestFrame());
button('invalidate', () => {
  host?.requestFrame(); host?.requestFrame(); host?.requestFrame();
});
button('resize', () => {
  if (root instanceof Element && root.hasAttribute('data-mvp')) {
    const large = target.style.width !== '800px';
    target.style.width = large ? '800px' : '600px';
    target.style.height = large ? '450px' : '400px';
  } else target.style.width = target.style.width === '400px' ? '320px' : '400px';
  host?.sync();
});
button('zero', () => { target.style.width = '0px'; host?.sync(); });
button('stop', () => host?.suspend());
button('resume', () => {
  target.style.width = target.style.width === '0px' ? '320px' : target.style.width;
  host?.resume();
});
button('observe', () => show('observed-without-scheduling'));
button('dispose', () => host?.unmount());
show('mount-required');
if (ratio) ratio.onchange = () => host?.sync();
