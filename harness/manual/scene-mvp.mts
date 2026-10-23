// Typed manual composition only. Never imported by a production project/root.
import { mountSceneMvpResources } from '../../runtime-render/manual/scene-mvp.mjs';
import { mountEditorSceneMvp } from '../../editor/manual/scene-mvp.mjs';
import { mountClientSceneMvp } from '../../game-client/manual/scene-mvp.mjs';
import { getRenderVisualDiagnostic } from '@rpg-platform/runtime-render';
const output = document.querySelector<HTMLPreElement>('#output');
if (!output) throw new TypeError('Missing output panel');
const labels = new Map<symbol, string>();
const log = (event: string, data: unknown) => {
  output.textContent += `${event}: ${JSON.stringify(data, (_, value: unknown) => {
    if (typeof value !== 'symbol') return value;
    if (!labels.has(value)) labels.set(value, `${String(value)}#${labels.size + 1}`);
    return labels.get(value);
  })}\n`;
  output.scrollTop = output.scrollHeight;
};
type Mount = ReturnType<typeof mountSceneMvpResources>;
type Consumer = ReturnType<typeof mountEditorSceneMvp> | ReturnType<typeof mountClientSceneMvp>;
interface Slot {
  id: string; busy: boolean; closed: boolean; mount: Mount | undefined;
  consumer: Consumer | undefined; close: () => void;
}
let alive = true;
const slots: Slot[] = [];
for (const [id, factory] of [['editor', mountEditorSceneMvp], ['client', mountClientSceneMvp]] as const) {
  const root = document.getElementById(id), canvas = document.createElement('canvas');
  if (!root) throw new TypeError('Missing host panel');
  canvas.width = 320; canvas.height = 240; root.append(canvas);
  const slot: Slot = { id, busy: false, closed: true, mount: undefined, consumer: undefined,
    close: () => { throw new TypeError('Host not configured'); } };
  slots.push(slot);
  const report = (event: string, data: unknown) => log(`${id}: ${event}`, data);
  const close = () => {
    slot.closed = true;
    for (const [stage, action] of [['consumer', () => slot.consumer?.close()], ['resources', () => slot.mount?.close()]] as const) {
      try { action(); } catch (error) { report(`cleanup uncertain ${stage}`, getRenderVisualDiagnostic(error)); }
    }
  };
  slot.close = close;
  const requireConsumer = () => {
    if (slot.closed || !slot.consumer) throw new TypeError('Open this host first'); return slot.consumer;
  };
  const actions: Record<string, () => unknown> = {
    async 'Open / recreate'() {
      if (!slot.closed) throw new TypeError('Close before recreating this host');
      slot.closed = false; slot.consumer = undefined;
      slot.mount = mountSceneMvpResources(canvas, report);
      try {
        const input = await slot.mount.open();
        if (!alive || slot.closed) return;
        slot.consumer = factory(input, report);
        await slot.consumer.open();
        if (!alive || slot.closed) return;
        report('OPEN returned; visually observed remains PENDING', slot.mount.inspect()); observe();
      } catch (error) { close(); throw error; }
    },
    'Player behind': () => requireConsumer().movePlayer(142),
    'Player in front': () => requireConsumer().movePlayer(162),
    'Hide Monster B': () => requireConsumer().monsterB(false),
    'Show Monster B': () => requireConsumer().monsterB(true),
    'Remove Monster A': () => requireConsumer().removeMonsterA(),
    Draw: () => requireConsumer().draw(), Observe: () => report('observations', slot.mount?.inspect()), Close: close,
  };
  for (const [label, action] of Object.entries(actions)) {
    const button = document.createElement('button'); button.textContent = label; root.append(button);
    button.onclick = async () => {
      // Close stays available during IO. Other commands serialize per host.
      if (label === 'Close') { close(); return; }
      if (!alive || slot.busy) { report('command unavailable', { busy: slot.busy, alive }); return; }
      slot.busy = true;
      try { await action(); } catch (error) { report('command rejected; inspect partial outcomes', getRenderVisualDiagnostic(error)); }
      finally { slot.busy = false; }
    };
  }
}
function observe() {
  const views = slots.map(slot => slot.mount?.inspect());
  log('independent host observations', {
    differentSessionIds: views[0]?.viewport?.sessionId && views[1]?.viewport?.sessionId
      ? views[0].viewport.sessionId !== views[1].viewport.sessionId : null,
    hosts: views.map((view, index) => {
      const monsters = view?.instances.filter(item => (item.instance.correlation?.objectId
        ?? item.instance.visualInstanceId).includes('monster')) ?? [];
      const allocations = monsters.map(item => item.binding?.resourceId);
      return { host: slots[index]?.id, observations: view,
        survivingMonsterAllocationShared: allocations.length >= 2 && allocations.every(id => id && id === allocations[0]) };
    }),
  });
}
const observeButton = document.querySelector<HTMLButtonElement>('#observe');
if (!observeButton) throw new TypeError('Missing observation control');
observeButton.onclick = observe;
window.addEventListener('pagehide', () => { alive = false; for (const slot of slots) slot.close(); }, { once: true });
