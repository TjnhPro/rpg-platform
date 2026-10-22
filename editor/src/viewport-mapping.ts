import {
  createViewportMapping2D,
  type OrthographicPlaneProjection, type ViewportMetrics2D, type ViewportMapping2D,
} from '@rpg-platform/runtime-render';

/**
 * Host supplies measured dimensions, explicit pixel units and optional screen
 * origin/scale. Render owns capture, validation and conversion; no DOM/DPR reads,
 * duplicate math, Scene mutation or frame-session target inference in this adapter.
 */
export function describeViewportMapping(
  projection: OrthographicPlaneProjection, metrics: ViewportMetrics2D,
): ViewportMapping2D {
  return createViewportMapping2D({ projection, metrics });
}
