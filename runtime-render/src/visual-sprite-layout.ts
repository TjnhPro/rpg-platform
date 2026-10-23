import { VisualPresentationError } from './visual-presentation-error.js';
/** Image top-left in local coordinates; positive dimensions extend right/down
 * according to the transform's explicitly declared source axes. No pixel ratio inference. */
export interface RenderVisualSpriteLayout {
  readonly unit: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export function captureSpriteLayout(input: RenderVisualSpriteLayout | null): RenderVisualSpriteLayout | null {
  if (input === null) return null;
  const keys = ['unit', 'x', 'y', 'width', 'height'] as const;
  if (typeof input !== 'object' || Array.isArray(input)
    || (Object.getPrototypeOf(input) !== Object.prototype && Object.getPrototypeOf(input) !== null)
    || Reflect.ownKeys(input).length !== keys.length) throw new VisualPresentationError('INVALID_SPRITE_LAYOUT');
  const data: Record<string, unknown> = Object.create(null) as Record<string, unknown>;
  for (const key of keys) {
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    if (!descriptor?.enumerable || !('value' in descriptor)) throw new VisualPresentationError('INVALID_SPRITE_LAYOUT');
    data[key] = descriptor.value;
  }
  if (typeof data.unit !== 'string' || data.unit.trim().length === 0) throw new VisualPresentationError('INVALID_SPRITE_LAYOUT');
  for (const key of ['x', 'y', 'width', 'height'] as const) {
    if (typeof data[key] !== 'number' || !Number.isFinite(data[key]) || !Number.isFinite(Math.fround(data[key]))) {
      throw new VisualPresentationError('INVALID_SPRITE_LAYOUT');
    }
  }
  const result = data as unknown as RenderVisualSpriteLayout;
  if (result.width <= 0 || result.height <= 0 || Math.fround(result.width) === 0 || Math.fround(result.height) === 0
    || ![result.x + result.width, result.x - result.width, result.y + result.height, result.y - result.height]
      .every(value => Number.isFinite(Math.fround(value)))) throw new VisualPresentationError('INVALID_SPRITE_LAYOUT');
  if ([result.x + result.width, result.x - result.width].some(value => Math.fround(value) === Math.fround(result.x))
    || [result.y + result.height, result.y - result.height].some(value => Math.fround(value) === Math.fround(result.y))) {
    throw new VisualPresentationError('INVALID_SPRITE_LAYOUT');
  }
  return Object.freeze({ unit: result.unit, x: result.x, y: result.y, width: result.width, height: result.height });
}
