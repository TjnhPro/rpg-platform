// Optional Phase6 browser entry; reusable host remains outside the public root.
import { mountClientViewport } from './viewport-host.js';
const root = document.querySelector('[data-client-viewport]') ?? document;
const canvas = root.querySelector<HTMLCanvasElement>('canvas');
const output = root.querySelector<HTMLPreElement>('[data-output], #output');
const ratio = root.querySelector<HTMLSelectElement>('[data-ratio]');
if (!canvas || !output) throw new Error('Continuous host elements missing');
const target = canvas, log = output;
let host: ReturnType<typeof mountClientViewport> | undefined;
host = mountClientViewport(target, (event, detail) => {
  log.textContent = JSON.stringify({ event, detail, ...host?.getSnapshot() },
    (_key, value: unknown) => typeof value === 'symbol' ? String(value) : value, 2);
}, () => ratio?.value === '1' ? 1 : ratio?.value === '2' ? 2 : window.devicePixelRatio);
const mounted = host;
function button(id: string, action: () => void): void {
  const element = root.querySelector<HTMLButtonElement>(`[data-control="${id}"], #${id}`);
  if (!element) throw new Error(`Continuous control missing: ${id}`);
  element.onclick = () => { if (mounted.getSnapshot().host === 'mounted') action(); };
}
button('acquire', mounted.acquire); button('start', mounted.start); button('stop', mounted.stop);
button('dispose', mounted.dispose); button('unmount', mounted.unmount);
button('observe', () => { log.textContent = JSON.stringify(mounted.getSnapshot(),
  (_key, value: unknown) => typeof value === 'symbol' ? String(value) : value, 2); });
button('resize', () => { target.style.width = target.style.width === '480px' ? '320px' : '480px'; mounted.sync(); });
button('zero', () => { target.style.height = '0px'; mounted.sync(); });
button('restore', () => { target.style.height = '180px'; mounted.sync(); });
if (ratio) ratio.onchange = mounted.sync;
