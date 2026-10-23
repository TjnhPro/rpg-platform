// Optional manual public-root consumer; no assertions or graphics simulation.
import { planRenderViewportSize } from '@rpg-platform/runtime-render';

const limits = { maxWidthPixels: 4096, maxHeightPixels: 4096, maxPixelCount: 4_000_000 };
const metrics = { logicalWidthCssPx: 800, logicalHeightCssPx: 450, requestedPixelRatio: 2 };
console.log('Validation only; no canvas or actual drawing buffer:', planRenderViewportSize(metrics, limits));
console.log('Fractional CSS measurement, floor per axis:', planRenderViewportSize({
  ...metrics, logicalWidthCssPx: 800.25, requestedPixelRatio: 1.5,
}, limits));
for (const [label, change] of [
  ['zero width', { logicalWidthCssPx: 0 }],
  ['negative height', { logicalHeightCssPx: -1 }],
  ['NaN ratio', { requestedPixelRatio: NaN }],
  ['infinite width', { logicalWidthCssPx: Infinity }],
  ['rounded to zero', { requestedPixelRatio: 0.0001 }],
  ['over budget', { requestedPixelRatio: 10 }],
  ['arithmetic overflow', { logicalWidthCssPx: Number.MAX_VALUE }],
]) {
  try { console.log(label, planRenderViewportSize({ ...metrics, ...change }, limits)); }
  catch (error) { console.log(label, error.name, error.message); }
}
try { planRenderViewportSize(metrics, { ...limits, maxPixelCount: 1.5 }); }
catch (error) { console.log('fractional pixel budget', error.name, error.message); }
