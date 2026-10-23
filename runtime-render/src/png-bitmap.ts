import type { PngImageDecode } from './png-image.js';

// Internal synchronous borrow only; not reachable from root declarations.
const decodedBitmaps = new WeakMap<PngImageDecode, () => ImageBitmap | undefined>();

export function registerDecodedPng(image: PngImageDecode, read: () => ImageBitmap | undefined): void {
  decodedBitmaps.set(image, read);
}

export function readDecodedPng(image: PngImageDecode): ImageBitmap | undefined {
  const read = decodedBitmaps.get(image);
  if (read === undefined) throw new TypeError('Expected a PNG decode handle from this Render package instance');
  return read();
}
