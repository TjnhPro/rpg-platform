import type { VisualSourceLoad } from './visual-source-load.js';

/** Required admission budgets; hard ceilings: 16 MiB, 8192/axis, 16M pixels. */
export interface PngDecodeLimits {
  readonly maxBytes: number;
  readonly maxDimension: number;
  readonly maxPixels: number;
}

export type PngDecodeFailure = 'SOURCE_NOT_ACQUIRED' | 'NOT_PNG' | 'INVALID_PNG'
  | 'UNSUPPORTED_PNG' | 'DECODE_LIMIT_EXCEEDED' | 'DECODER_UNAVAILABLE' | 'DIMENSION_MISMATCH';

export type PngImageObservation = {
  readonly id: symbol;
  readonly stage: 'decoded-image';
  /** Fixed options are part of identity, not a cache implementation. */
  readonly decoder: 'browser-png-v1/from-image/alpha-none/color-none/no-resize';
  readonly cleanup: 'not-needed' | 'owned' | 'closed' | 'close-failed';
} & (
  | { readonly state: 'requested' | 'pending' | 'released' }
  | { readonly state: 'failed'; readonly failure: PngDecodeFailure | null }
  | { readonly state: 'decoded'; readonly width: number; readonly height: number; readonly format: 'image/png' }
);

/** Owns one private browser bitmap. No borrowed bitmap, sharing or GPU handle. */
export interface PngImageDecode {
  readonly getSnapshot: () => PngImageObservation;
  /** Source must already be acquired. Rejections preserve original browser errors. */
  readonly start: () => Promise<PngImageObservation>;
  /** Terminal/idempotent, including pending decode. Never releases the source. */
  readonly release: () => PngImageObservation;
}

type Header = { readonly width: number; readonly height: number };

// Bounded container admission, not an independent PNG decompressor/CRC validator.
function inspect(bytes: Uint8Array<ArrayBuffer>, limits: PngDecodeLimits): Header | PngDecodeFailure {
  if (bytes.length > limits.maxBytes) return 'DECODE_LIMIT_EXCEEDED';
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  if (signature.some((value, index) => bytes[index] !== value)) return 'NOT_PNG';
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let header: Header | undefined;
  let data = false;
  let endedData = false;
  let chunks = 0;
  for (let offset = 8; offset < bytes.length;) {
    if (++chunks > 65536) return 'DECODE_LIMIT_EXCEEDED';
    if (bytes.length - offset < 12) return 'INVALID_PNG';
    const length = view.getUint32(offset);
    if (length > bytes.length - offset - 12) return 'INVALID_PNG';
    const kind = String.fromCharCode(...bytes.subarray(offset + 4, offset + 8));
    if (!/^[A-Za-z]{4}$/u.test(kind)) return 'INVALID_PNG';
    if (header === undefined && (kind !== 'IHDR' || length !== 13)) return 'INVALID_PNG';
    if (kind === 'IHDR') {
      if (header !== undefined || length !== 13) return 'INVALID_PNG';
      const width = view.getUint32(offset + 8), height = view.getUint32(offset + 12);
      if (width === 0 || height === 0 || width > 0x7fffffff || height > 0x7fffffff) return 'INVALID_PNG';
      if (width > limits.maxDimension || height > limits.maxDimension
        || width * height > limits.maxPixels) return 'DECODE_LIMIT_EXCEEDED';
      const depth = bytes[offset + 16]!, color = bytes[offset + 17]!;
      const allowed: Readonly<Record<number, readonly number[]>> = {
        0: [1, 2, 4, 8, 16], 2: [8, 16], 3: [1, 2, 4, 8], 4: [8, 16], 6: [8, 16],
      };
      if (!allowed[color]?.includes(depth) || bytes[offset + 18] !== 0 || bytes[offset + 19] !== 0
        || bytes[offset + 20]! > 1) return 'INVALID_PNG';
      header = { width, height };
    } else if (kind === 'acTL' || kind === 'fcTL' || kind === 'fdAT' || kind === 'eXIf') {
      // Static PNG only; reject orientation metadata rather than silently rotating.
      return 'UNSUPPORTED_PNG';
    } else if (kind === 'IDAT') {
      if (endedData) return 'INVALID_PNG';
      data = true;
    } else if (kind === 'IEND') {
      return length === 0 && data && offset + 12 === bytes.length ? header! : 'INVALID_PNG';
    } else {
      if (data) endedData = true;
      if (kind !== 'PLTE' && kind[0] === kind[0]!.toUpperCase()) return 'UNSUPPORTED_PNG';
    }
    offset += length + 12;
  }
  return 'INVALID_PNG';
}

/**
 * Decode an independent copy from an acquired source. No IO, graphics session or
 * browser access at factory/import time. Native bitmap never crosses the root API.
 * Callers release each handle; releasing one cannot close another handle's bitmap.
 */
export function createPngImageDecode(source: VisualSourceLoad, limits: PngDecodeLimits): PngImageDecode {
  const captured = Object.freeze({ maxBytes: limits.maxBytes, maxDimension: limits.maxDimension,
    maxPixels: limits.maxPixels });
  if (!Number.isSafeInteger(captured.maxBytes) || captured.maxBytes <= 0 || captured.maxBytes > 16777216
    || !Number.isSafeInteger(captured.maxDimension) || captured.maxDimension <= 0 || captured.maxDimension > 8192
    || !Number.isSafeInteger(captured.maxPixels) || captured.maxPixels <= 0 || captured.maxPixels > 16777216) {
    throw new TypeError('Positive integer PNG budgets within the documented hard ceilings are required');
  }
  return createDecode(source, captured);
}

function createDecode(source: VisualSourceLoad | undefined, limits: PngDecodeLimits): PngImageDecode {
  const id = Symbol();
  const decoder = 'browser-png-v1/from-image/alpha-none/color-none/no-resize' as const;
  let cleanup: PngImageObservation['cleanup'] = 'not-needed';
  let snapshot: PngImageObservation = Object.freeze({ id, stage: 'decoded-image', decoder, cleanup, state: 'requested' });
  let owned: ImageBitmap | undefined;
  let completion: Promise<PngImageObservation> | undefined;
  const released = (): boolean => snapshot.state === 'released';
  const publish = (next: { state: 'pending' | 'released' } | { state: 'failed'; failure: PngDecodeFailure | null }
    | { state: 'decoded'; width: number; height: number; format: 'image/png' }): PngImageObservation => {
    if (released() && next.state !== 'released') return snapshot;
    snapshot = Object.freeze({ id, stage: 'decoded-image', decoder, cleanup, ...next });
    return snapshot;
  };
  const close = (): void => {
    const bitmap = owned;
    owned = undefined; // Exactly one close attempt even if native cleanup throws.
    if (bitmap === undefined) return;
    try { bitmap.close(); cleanup = 'closed'; }
    catch (error) { cleanup = 'close-failed'; throw error; }
  };
  return Object.freeze({
    getSnapshot: () => snapshot,
    start: (): Promise<PngImageObservation> => {
      if (released()) return Promise.resolve(snapshot);
      if (completion !== undefined) return completion;
      publish({ state: 'pending' });
      completion = Promise.resolve().then(async () => {
        if (released()) return snapshot;
        let current: VisualSourceLoad | undefined = source!;
        source = undefined;
        const observation = current.getSnapshot();
        if (released()) return snapshot;
        if (observation.state !== 'source-acquired') return publish({ state: 'failed', failure: 'SOURCE_NOT_ACQUIRED' });
        // Reject oversized source metadata before asking for a potentially large copy.
        if (observation.source.contentLength > limits.maxBytes) return publish({ state: 'failed', failure: 'DECODE_LIMIT_EXCEEDED' });
        let bytes = current.copyBytes();
        current = undefined;
        if (released()) return snapshot;
        if (bytes === null) return publish({ state: 'failed', failure: 'SOURCE_NOT_ACQUIRED' });
        const header = inspect(bytes, limits);
        if (typeof header === 'string') return publish({ state: 'failed', failure: header });
        if (typeof globalThis.createImageBitmap !== 'function' || typeof globalThis.Blob !== 'function') {
          return publish({ state: 'failed', failure: 'DECODER_UNAVAILABLE' });
        }
        const blob = new Blob([bytes], { type: 'image/png' });
        bytes = null;
        const bitmap = await globalThis.createImageBitmap(blob, {
          imageOrientation: 'from-image', premultiplyAlpha: 'none', colorSpaceConversion: 'none',
        });
        owned = bitmap;
        cleanup = 'owned';
        if (released()) { close(); return publish({ state: 'released' }); }
        const width = bitmap.width, height = bitmap.height;
        if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width <= 0 || height <= 0
          || width > limits.maxDimension || height > limits.maxDimension || width * height > limits.maxPixels
          || width !== header.width || height !== header.height) {
          close();
          return publish({ state: 'failed', failure: 'DIMENSION_MISMATCH' });
        }
        return publish({ state: 'decoded', width, height, format: 'image/png' });
      }).then(() => snapshot).catch((error: unknown) => {
        source = undefined;
        // Preserve native decoder/host error identity. Cleanup cannot mask it.
        try { close(); } catch { /* cleanup state remains separately observable */ }
        if (released()) publish({ state: 'released' });
        else publish({ state: 'failed', failure: null });
        throw error;
      });
      return completion;
    },
    release: (): PngImageObservation => {
      source = undefined;
      completion = undefined;
      publish({ state: 'released' });
      try { close(); } finally { publish({ state: 'released' }); }
      return snapshot;
    },
  });
}
