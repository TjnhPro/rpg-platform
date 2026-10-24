import type { VisualResourceDescriptor } from '@rpg-platform/runtime-render';

// Explicit previously inspected ani063 sample inventory, not a filename/compass/FPS inference.
const idleKeys = [
  ['0000','0002','0004','0006','0008','0010','0012','0014'],
  ['0016','0018','0020','0022','0024','0026','0028'],
  ['0030','0032','0034','0036','0038','0040','0042','0044'],
  ['0046','0048','0050','0052','0054','0056','0058'],
  ['0060','0062','0064','0066','0068','0070','0072','0074'],
  ['0076','0078','0080','0082','0084','0086','0088'],
  ['0090','0092','0094','0096','0098','0100','0102','0104'],
  ['0106','0108','0110','0112','0114','0116','0118'],
];
export function finiteSampleDeclaration(descriptor: VisualResourceDescriptor): string | null {
  const names = descriptor.identity.resourceId === 'attack' ? ['Attack1_0']
    : descriptor.identity.resourceId === 'idle' ? ['NormalStand1_0','NormalStand1_1','NormalStand1_2','NormalStand1_3',
      'NormalStand1_4','NormalStand1_5','NormalStand1_6','NormalStand1_7'] : null;
  if (!names || descriptor.sources.length !== names.length * 2 || names.some((name, index) =>
    descriptor.sources[index * 2]?.role !== 'image' || descriptor.sources[index * 2]?.locator.path !== `${name}.png`
    || descriptor.sources[index * 2 + 1]?.role !== 'atlas-metadata' || descriptor.sources[index * 2 + 1]?.locator.path !== `${name}.tpsheet`)) return null;
  const reference = (subresourceId: string) => ({ ...descriptor.identity, subresourceId });
  const sequence = { clip: { clipId: 'attack', sequence: { frames: ['0000','0002'].map(reference) } },
    timing: { frameIntervalMs: 125 }, repeat: 'repeat' };
  const directions = idleKeys.map(keys => ({ frames: keys.map(reference) }));
  const convention = { axes: { x: 'right', y: 'down' }, zeroIndex: 0, directionZeroAngleRadians: 0 };
  return JSON.stringify({
    bindings: names.flatMap((_, i) => [{ sourceId: `image${i}`, sourceIndex: i * 2 }, { sourceId: `meta${i}`, sourceIndex: i * 2 + 1 }]),
    sheets: names.map((name, i) => ({ pageId: `page${i}`, imageSourceId: `image${i}`, metadataSourceId: `meta${i}`, textureReference: `${name}.png` })),
    declaration: names.length === 1 ? { mode: 'single-sequence', clips: [sequence] }
      : { mode: 'eight-way', clips: [
        { clipId: 'idle', directions, convention, timing: { frameIntervalMs: 150 }, repeat: 'repeat' },
        { clipId: 'idle-once', directions, convention, timing: { frameIntervalMs: 150 }, repeat: 'once' },
      ] },
  }, null, 2);
}
