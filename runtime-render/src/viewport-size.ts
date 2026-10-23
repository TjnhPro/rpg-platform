/** Explicit host measurements. Fractional CSS pixels and ratios are allowed. */
export interface RenderViewportMetrics {
  readonly logicalWidthCssPx: number;
  readonly logicalHeightCssPx: number;
  readonly requestedPixelRatio: number;
}

/** Explicit admission budgets, not queried GPU capabilities or memory guarantees. */
export interface RenderViewportSizeLimits {
  readonly maxWidthPixels: number;
  readonly maxHeightPixels: number;
  /** Bounds pixel-dependent allocation pressure; does not measure GPU bytes. */
  readonly maxPixelCount: number;
}

/** Validation candidate only. Never an accepted backend/viewport snapshot. */
export interface RenderViewportSizePlan {
  readonly status: 'validated-not-applied';
  readonly requested: RenderViewportMetrics;
  readonly limits: RenderViewportSizeLimits;
  readonly drawingBuffer: {
    readonly width: number;
    readonly height: number;
    readonly unit: 'drawing-buffer-px';
    readonly pixelCount: number;
  };
  /** Rounded candidate ratios; not actual backend acceptance or screen scaling. */
  readonly plannedEffectivePixelRatio: { readonly x: number; readonly y: number };
}

/**
 * Floor logical extent * requested ratio exactly once, then reject over-budget
 * candidates (never silently clamp). No target, DOM, allocation or resize.
 * TypeError: invalid finite-positive metrics/integer limits. RangeError:
 * overflow, rounded-empty extent, unsafe product or exceeded budget.
 */
export function planRenderViewportSize(
  metrics: RenderViewportMetrics,
  limits: RenderViewportSizeLimits,
): RenderViewportSizePlan {
  const { logicalWidthCssPx, logicalHeightCssPx, requestedPixelRatio } = metrics;
  const { maxWidthPixels, maxHeightPixels, maxPixelCount } = limits;
  for (const value of [logicalWidthCssPx, logicalHeightCssPx, requestedPixelRatio]) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
      throw new TypeError('Viewport CSS extents and requested ratio must be finite and positive');
    }
  }
  for (const value of [maxWidthPixels, maxHeightPixels, maxPixelCount]) {
    if (!Number.isSafeInteger(value) || value <= 0) {
      throw new TypeError('Viewport limits must be positive safe integers');
    }
  }
  // WebGL GLsizei is signed 32-bit. This ceiling is not a hardware capability.
  if (maxWidthPixels > 0x7fffffff || maxHeightPixels > 0x7fffffff) {
    throw new RangeError('Viewport dimension budget exceeds the signed 32-bit domain');
  }
  const scaledWidth = logicalWidthCssPx * requestedPixelRatio;
  const scaledHeight = logicalHeightCssPx * requestedPixelRatio;
  if (!Number.isFinite(scaledWidth) || !Number.isFinite(scaledHeight)) {
    throw new RangeError('Viewport scaling overflow');
  }
  const width = Math.floor(scaledWidth);
  const height = Math.floor(scaledHeight);
  const pixelCount = width * height;
  const x = width / logicalWidthCssPx;
  const y = height / logicalHeightCssPx;
  if (width < 1 || height < 1 || width > maxWidthPixels || height > maxHeightPixels
      || !Number.isSafeInteger(pixelCount) || pixelCount > maxPixelCount
      || !Number.isFinite(x) || !Number.isFinite(y) || x <= 0 || y <= 0) {
    throw new RangeError('Viewport candidate is empty, unsafe or exceeds its explicit budget');
  }
  return Object.freeze({
    status: 'validated-not-applied',
    requested: Object.freeze({ logicalWidthCssPx, logicalHeightCssPx, requestedPixelRatio }),
    limits: Object.freeze({ maxWidthPixels, maxHeightPixels, maxPixelCount }),
    drawingBuffer: Object.freeze({ width, height, unit: 'drawing-buffer-px', pixelCount }),
    plannedEffectivePixelRatio: Object.freeze({ x, y }),
  });
}
