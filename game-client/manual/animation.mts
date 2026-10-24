// Optional Client manual page: explicit selected files and presentation intent only.
import * as R from '@rpg-platform/runtime-render';
import { mountClientAnimationHost, type ClientAnimationPage } from '../dist/manual-animation-host.js';
import { createClientAtlasInput } from './atlas-mvp.mjs';
const projectId = 'client-animation-manual';
const authoredClips = [
  { clipId: 'idle', interval: 150, assets: ['NormalStand1_0', 'NormalStand1_1', 'NormalStand1_2', 'NormalStand1_3',
    'NormalStand1_4', 'NormalStand1_5', 'NormalStand1_6', 'NormalStand1_7'],
    frames: [
      ['0000', '0002', '0004', '0006', '0008', '0010', '0012', '0014'],
      ['0016', '0018', '0020', '0022', '0024', '0026', '0028'],
      ['0030', '0032', '0034', '0036', '0038', '0040', '0042', '0044'],
      ['0046', '0048', '0050', '0052', '0054', '0056', '0058'],
      ['0060', '0062', '0064', '0066', '0068', '0070', '0072', '0074'],
      ['0076', '0078', '0080', '0082', '0084', '0086', '0088'],
      ['0090', '0092', '0094', '0096', '0098', '0100', '0102', '0104'],
      ['0106', '0108', '0110', '0112', '0114', '0116', '0118'],
    ] },
  { clipId: 'walk', interval: 125, assets: ['NormalWalk_0', 'NormalWalk_1', 'NormalWalk_2', 'NormalWalk_3',
    'NormalWalk_4', 'NormalWalk_5', 'NormalWalk_6', 'NormalWalk_7'], frames: [
      ['0000', '0002', '0004', '0006'], ['0008', '0010', '0012', '0014'],
      ['0016', '0018', '0020', '0022'], ['0024', '0026', '0028', '0030'],
      ['0032', '0034', '0036', '0038'], ['0040', '0042', '0044', '0046'],
      ['0048', '0050', '0052', '0054'], ['0056', '0058', '0060', '0062'],
    ] },
] as const;

const status = document.querySelector<HTMLElement>('[data-status]')!;
const files = document.querySelector<HTMLInputElement>('[data-files]')!;
const clip = document.querySelector<HTMLSelectElement>('[data-clip]')!;
const angle = document.querySelector<HTMLInputElement>('[data-angle]')!;
const playing = document.querySelector<HTMLInputElement>('[data-playing]')!;
const missing = document.querySelector<HTMLInputElement>('[data-missing]')!;
let host: ReturnType<typeof mountClientAnimationHost> | undefined;
let generation = 0;
let preparation: string | null = null;
const report = () => { status.textContent = JSON.stringify({ preparation, client: host?.inspect() ?? null },
  (_, value) => typeof value === 'symbol' ? String(value) : value, 2); };
const intent = () => ({ clipId: clip.value, playing: playing.checked,
  orientation: R.createVisualOrientation2D({ axes: { x: 'right', y: 'down' }, zeroAxis: 'positive-x', positiveRotation: 'toward-positive-y', angleRadians: Number(angle.value) }) });
const close = () => { generation++; host?.close(); preparation = 'closed-explicit-new-mount-required'; report(); };
const listen = (selector: string, action: () => unknown) => document.querySelector(selector)!.addEventListener('click', () => {
  try { const result = action(); if (result instanceof Promise) void result.catch(error => { preparation = String(error); report(); }); }
  catch (error) { preparation = String(error); report(); }
});
listen('[data-load]', async () => {
  close(); const current = generation;
  const selected = Array.from(files.files ?? []);
  const pages: ClientAnimationPage[] = [];
  preparation = 'preparing-explicit-files'; report();
  try {
    const clips = authoredClips.map(authored => R.createEightWaySpriteClip({ clipId: authored.clipId,
      convention: { axes: { x: 'right', y: 'down' }, directionZeroAngleRadians: 0, zeroIndex: 0 },
      timing: { frameIntervalMs: authored.interval }, repeat: 'repeat',
      directions: authored.assets.map((asset, slot) => ({
        frames: authored.frames[slot]!.map(subresourceId => ({ projectId, resourceId: asset, subresourceId })) })) as unknown as R.SpriteDirectionSequences }));
    for (const authored of authoredClips) for (const asset of authored.assets) {
      if (current !== generation) return;
      const png = selected.find(file => file.name === `${asset}.png`);
      const sheet = selected.find(file => file.name === `${asset}.tpsheet`);
      if (!png || !sheet) throw new TypeError(`Select original pair ${asset}.png/.tpsheet`);
      const grant = await createClientAtlasInput(png, sheet, missing.checked, { projectId, resourceId: asset });
      if (current !== generation) { grant.close(); return; }
      pages.push({ ...grant, textureReference: `${asset}.png` });
    }
    host = mountClientAnimationHost(document.querySelector('canvas')!, { pages, clips, initialIntent: intent() }, () => report());
    preparation = 'mounted'; report();
  } finally { if (current !== generation || preparation !== 'mounted') for (const page of pages) page.close(); }
});
listen('[data-start]', () => { host?.start(); report(); });
listen('[data-pause]', () => { host?.pause(); report(); });
listen('[data-intent]', () => { host?.intent(intent()); report(); });
listen('[data-close]', close);
listen('[data-observe]', report);
window.addEventListener('pagehide', close);
report();
