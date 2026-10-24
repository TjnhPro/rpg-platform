// Optional explicit caller intents, not gameplay events or a domain simulation.
import { mountClientVfxHost } from '../dist/manual-vfx-host.js';
import { createClientAtlasInput } from './atlas-mvp.mjs';
const status = document.querySelector<HTMLElement>('[data-status]')!;
const files = document.querySelector<HTMLInputElement>('[data-files]')!;
let host: ReturnType<typeof mountClientVfxHost> | undefined, generation = 0;
let preparation = 'Select original Attack1_0.png and Attack1_0.tpsheet';
const report = () => { status.textContent = JSON.stringify({ preparation, client: host?.inspect() },
  (_, value) => typeof value === 'symbol' ? String(value) : value, 2); };
const close = () => { generation++; host?.close(); preparation = 'closed-new-mount-required'; report(); };
const listen = (selector: string, action: () => unknown) => document.querySelector(selector)!.addEventListener('click', () => {
  try { const result = action(); if (result instanceof Promise) void result.catch(error => { preparation = String(error); report(); }); }
  catch (error) { preparation = String(error); report(); }
});
listen('[data-load]', async () => {
  close(); const ticket = generation;
  const selected = Array.from(files.files ?? []);
  const png = selected.find(file => file.name === 'Attack1_0.png'), sheet = selected.find(file => file.name === 'Attack1_0.tpsheet');
  if (!png || !sheet) throw new TypeError('Select original Attack1_0 pair');
  const grant = await createClientAtlasInput(png, sheet, false, { projectId: 'client-vfx-manual', resourceId: 'attack-atlas' });
  if (ticket !== generation) { grant.close(); return; }
  try { host = mountClientVfxHost(document.querySelector('canvas')!, { ...grant, textureReference: 'Attack1_0.png' }, report); }
  catch (error) { grant.close(); throw error; }
  preparation = 'mounted-explicit-start-required'; report();
});
const required = () => { if (!host) throw new TypeError('Mount first'); return host; };
listen('[data-world]', () => { const client = required(); return client.intent({ type: 'spawn', correlationId: 'world-request',
  effectReference: 'impact-fire', placement: { mode: 'world', world: client.world() } }); });
listen('[data-aura]', () => { const client = required(); return client.intent({ type: 'spawn', correlationId: 'aura-request',
  effectReference: 'aura', placement: client.attachPlacement() }); });
listen('[data-start]', () => { required().start(); report(); });
listen('[data-pause]', () => { required().pause(); report(); });
listen('[data-step]', () => {
  const client = required();
  if (client.inspect().host.running) throw new TypeError('Pause RAF before explicit Step');
  return client.intent({ type: 'elapsed', deltaMs: 125 });
});
for (const command of ['stop', 'restart', 'pause', 'resume'] as const) listen(`[data-world-${command}]`,
  () => required().intent({ type: 'command', correlationId: 'world-request', command: { type: command } }));
listen('[data-remove]', () => required().intent({ type: 'remove', correlationId: 'world-request' }));
listen('[data-target]', () => { required().removeTarget(); report(); });
listen('[data-close]', close); listen('[data-observe]', report);
window.addEventListener('pagehide', close);
// Inspection / neutral caller seam for finite manual actions, no assertions/timer.
Object.assign(window, { clientVfxManual: { inspect: () => host?.inspect(), getHost: required, close } });
report();
