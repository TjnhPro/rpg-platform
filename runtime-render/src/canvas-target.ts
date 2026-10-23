/** Private native brand/realm validation, shared by inspection and acquisition. */
export function readBrowserCanvas(target: unknown): {
  readonly canvas: HTMLCanvasElement;
  readonly width: number;
  readonly height: number;
} | undefined {
  if (typeof HTMLCanvasElement === 'undefined') return undefined;
  // Invoke native getters rather than reading arbitrary target properties. A
  // lookalike/prototype spoof/Proxy is not a canvas just because it has methods.
  const prototype = HTMLCanvasElement.prototype;
  const width = Object.getOwnPropertyDescriptor(prototype, 'width')?.get;
  const height = Object.getOwnPropertyDescriptor(prototype, 'height')?.get;
  if (width === undefined || height === undefined) return undefined;
  try {
    const nativeWidth: number = width.call(target);
    const nativeHeight: number = height.call(target);
    if (!(target instanceof HTMLCanvasElement)) return undefined;
    return { canvas: target, width: nativeWidth, height: nativeHeight };
  } catch {
    return undefined;
  }
}
