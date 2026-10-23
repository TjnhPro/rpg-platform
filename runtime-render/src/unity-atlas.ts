import { prepareVisualResource, type VisualResourceDescriptor } from './visual-resource.js';
import { captureAtlasMetadata, type AtlasSourceBinding, type UnityAtlasSheet,
  type AtlasMetadata, type AtlasMetadataPage, type AtlasMetadataFrame, type AtlasMetadataResult } from './atlas-metadata.js';

const budgets = { bytesPerSheet: 1024 * 1024, totalBytes: 8 * 1024 * 1024,
  pages: 64, bindings: 256, frames: 65536, line: 2048, dimension: 32768 } as const;
type Rejection = Extract<AtlasMetadataResult, { status: 'rejected' }>;
const reject = (code: Rejection['code'], pageId: string | null = null, line: number | null = null): Rejection =>
  Object.freeze({ status: 'rejected', code, pageId, line });

// Closed API inputs: no accessors, sparse arrays, symbol/unknown fields or coercion.
function record(value: unknown, fields: readonly string[]): Record<string, unknown> | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)
    || (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null)
    || Reflect.ownKeys(value).length !== fields.length) return undefined;
  const result: Record<string, unknown> = {};
  for (const field of fields) {
    const item = Object.getOwnPropertyDescriptor(value, field);
    if (!item?.enumerable || !('value' in item)) return undefined;
    result[field] = item.value;
  }
  return result;
}
function dense(value: unknown, max: number): value is readonly unknown[] {
  if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype || value.length < 1 || value.length > max
    || Reflect.ownKeys(value).length !== value.length + 1) return false;
  for (let index = 0; index < value.length; index++) {
    const item = Object.getOwnPropertyDescriptor(value, String(index));
    if (!item?.enumerable || !('value' in item)) return false;
  }
  return true;
}
function id(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= 512 && !/[\s\u0000-\u001f\u007f]/u.test(value);
}
function textureLabel(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= 512
    && !/[\\:%\u0000-\u001f\u007f]/u.test(value)
    && value.split('/').every(part => part.length > 0 && part !== '.' && part !== '..' && part.trim() === part);
}
function integer(value: string, positive = false): number | undefined {
  if (!/^\d+$/u.test(value)) return undefined;
  const result = Number(value);
  return Number.isSafeInteger(result) && result >= (positive ? 1 : 0) && result <= budgets.dimension ? result : undefined;
}
function decimal(value: string): number | undefined {
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/u.test(value)) return undefined;
  const result = Number(value);
  return Number.isFinite(result) ? result : undefined;
}

/**
 * Parse the observed Unity TPSheet40300 rectangular profile from acquired bytes.
 * Explicit source IDs/roles, no IO, filename inference, PNG decode, geometry or GPU.
 * Known data rejections return a safe result; unknown host exceptions propagate.
 */
export function parseUnityAtlasMetadata(
  descriptor: VisualResourceDescriptor, bindings: readonly AtlasSourceBinding[], sheets: readonly UnityAtlasSheet[],
): AtlasMetadataResult {
  const captured = prepareVisualResource(descriptor).descriptor;
  if (!dense(bindings, budgets.bindings) || !dense(sheets, budgets.pages)) return reject('INVALID_BINDING');
  const sources: AtlasMetadata['sources'][number][] = [];
  const byId = new Map<string, AtlasMetadata['sources'][number]>();
  const indices = new Set<number>();
  for (const input of bindings) {
    const binding = record(input, ['sourceId', 'sourceIndex']);
    if (binding === undefined || !id(binding.sourceId) || typeof binding.sourceIndex !== 'number'
      || !Number.isSafeInteger(binding.sourceIndex) || binding.sourceIndex < 0) return reject('INVALID_BINDING');
    const source = captured.sources[binding.sourceIndex];
    if (source === undefined || byId.has(binding.sourceId) || indices.has(binding.sourceIndex)) return reject('INVALID_BINDING');
    const entry = { sourceId: binding.sourceId, sourceIndex: binding.sourceIndex, ...source };
    byId.set(entry.sourceId, entry); indices.add(entry.sourceIndex); sources.push(entry);
  }
  const pages: AtlasMetadataPage[] = [], frames: AtlasMetadataFrame[] = [];
  const pageIds = new Set<string>(), frameKeys = new Set<string>(), metadataIds = new Set<string>();
  let totalBytes = 0;
  for (const input of sheets) {
    const sheet = record(input, ['pageId', 'metadataSourceId', 'imageSourceId', 'textureReference', 'metadata']);
    if (sheet === undefined || !id(sheet.pageId) || !id(sheet.metadataSourceId) || !id(sheet.imageSourceId)
      || !textureLabel(sheet.textureReference)) return reject('INVALID_BINDING');
    const pageId = sheet.pageId;
    if (pageIds.has(pageId)) return reject('DUPLICATE_PAGE_ID', pageId);
    pageIds.add(pageId);
    const metadataSource = byId.get(sheet.metadataSourceId), imageSource = byId.get(sheet.imageSourceId);
    if (metadataSource?.role !== 'atlas-metadata' || imageSource?.role !== 'image'
      || metadataIds.has(metadataSource.sourceId)) return reject('INVALID_BINDING', pageId);
    metadataIds.add(metadataSource.sourceId);
    // A host-supplied public source lifetime is a trusted seam, as with PNG decode.
    const source = sheet.metadata as UnityAtlasSheet['metadata'];
    if (source === null || typeof source !== 'object' || typeof source.getSnapshot !== 'function'
      || typeof source.copyBytes !== 'function') return reject('INVALID_BINDING', pageId);
    const observation = source.getSnapshot();
    if (observation.state !== 'source-acquired') return reject('SOURCE_NOT_ACQUIRED', pageId);
    const request = observation.source.request;
    if (request.identity.projectId !== captured.identity.projectId || request.identity.resourceId !== captured.identity.resourceId
      || request.sourceIndex !== metadataSource.sourceIndex || request.source.role !== metadataSource.role
      || request.source.locator.type !== metadataSource.locator.type || request.source.locator.path !== metadataSource.locator.path) {
      return reject('SOURCE_MISMATCH', pageId);
    }
    const length = observation.source.contentLength;
    if (!Number.isSafeInteger(length) || length < 1 || length > budgets.bytesPerSheet
      || totalBytes + length > budgets.totalBytes) return reject('LIMIT_EXCEEDED', pageId);
    const bytes = source.copyBytes();
    if (bytes === null) return reject('SOURCE_NOT_ACQUIRED', pageId);
    if (bytes.length !== length) return reject('SOURCE_MISMATCH', pageId);
    totalBytes += length;
    let text: string;
    try { text = new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
    catch (error) { if (error instanceof TypeError) return reject('INVALID_ENCODING', pageId); throw error; }
    if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(text) || /\r(?!\n)/u.test(text)) return reject('INVALID_ENCODING', pageId);
    const lines = text.split(/\r?\n/u), header = new Map<string, string>();
    let page: AtlasMetadataPage | undefined;
    let pageFrames = 0;
    for (let index = 0; index < lines.length; index++) {
      const line = lines[index]!;
      if (line.length > budgets.line) return reject('LIMIT_EXCEEDED', pageId, index + 1);
      if (line.trim().length === 0 || line.startsWith('#')) continue;
      if (line.startsWith(':')) {
        const equal = line.indexOf('=');
        const name = line.slice(1, equal), value = line.slice(equal + 1);
        if (page !== undefined || equal < 2 || !['format', 'texture', 'size', 'pivotpoints', 'borders'].includes(name)
          || header.has(name) || value.length === 0 || value.trim() !== value) return reject('INVALID_HEADER', pageId, index + 1);
        header.set(name, value);
        continue;
      }
      if (page === undefined) {
        if (header.size !== 5) return reject('INVALID_HEADER', pageId, index + 1);
        if (header.get('format') !== '40300' || header.get('pivotpoints') !== 'enabled'
          || header.get('borders') !== 'disabled') return reject('UNSUPPORTED_FORMAT', pageId, index + 1);
        if (header.get('texture') !== sheet.textureReference) return reject('TEXTURE_REFERENCE_MISMATCH', pageId, index + 1);
        const size = /^(\d+)x(\d+)$/u.exec(header.get('size')!);
        const width = size === null ? undefined : integer(size[1]!, true), height = size === null ? undefined : integer(size[2]!, true);
        if (width === undefined || height === undefined) return reject('INVALID_HEADER', pageId, index + 1);
        page = { pageId, metadataSourceId: metadataSource.sourceId, imageSourceId: imageSource.sourceId,
          width, height, coordinateConvention: 'unity-tpsheet-40300-native' };
        pages.push(page);
      }
      const fields = line.split(';');
      const key = fields[0]!;
      if (fields.length !== 11 || key.length === 0 || key.length > 512 || key.trim() !== key
        || /[\u0000-\u001f\u007f]/u.test(key)) return reject('INVALID_FRAME', pageId, index + 1);
      const numbers = fields.slice(1).map(value => value.trim());
      const x = integer(numbers[0]!), y = integer(numbers[1]!), width = integer(numbers[2]!, true), height = integer(numbers[3]!, true);
      const pivotX = decimal(numbers[4]!), pivotY = decimal(numbers[5]!);
      if (x === undefined || y === undefined || width === undefined || height === undefined || pivotX === undefined || pivotY === undefined
        || x + width > page.width || y + height > page.height || numbers.slice(6).some(value => decimal(value) !== 0)) {
        return reject('INVALID_FRAME', pageId, index + 1);
      }
      if (frameKeys.has(key)) return reject('DUPLICATE_FRAME_KEY', pageId, index + 1);
      if (frames.length >= budgets.frames) return reject('LIMIT_EXCEEDED', pageId, index + 1);
      frameKeys.add(key); pageFrames++;
      frames.push({ key, pageId, rectangle: { x, y, width, height }, rotation: 'none', trim: null,
        sourcePivot: { x: pivotX, y: pivotY } });
    }
    if (pageFrames === 0) return reject('INVALID_FRAME', pageId);
  }
  return Object.freeze({ status: 'parsed', atlas: captureAtlasMetadata(captured.identity, sources, pages, frames) });
}
