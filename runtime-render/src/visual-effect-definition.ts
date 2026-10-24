import { prepareVisualResource, type VisualResourceDescriptor } from './visual-resource.js';
import { createSpriteTimedClip, type SpriteTimedClipInput, type SpriteTimedClip } from './sprite-animation-timing.js';
import { getAtlasMetadataRevision, type AtlasMetadata } from './atlas-metadata.js';
import { resolveAtlasFrame } from './atlas-frame.js';
import { resolveAtlasFrameGeometry, type AtlasPagePixels, type AtlasFrameGeometry,
  type AtlasFrameGeometryResult } from './atlas-geometry.js';

/** Exact expected content revision, not proof of IO or a live resource capability. */
export interface VisualEffectSourceRevision {
  readonly sourceId: string;
  readonly sourceIndex: number;
  readonly revision: string;
}

export interface VisualEffectDefinitionInput {
  readonly effectId: string;
  readonly kind: 'sprite-sequence';
  /** Explicit Phase10 single-track data, not a key into an implicit clip registry. */
  readonly clip: SpriteTimedClipInput;
  readonly resource: VisualResourceDescriptor;
  /** Exactly one pin for every ordered descriptor source. */
  readonly sources: readonly VisualEffectSourceRevision[];
}

/** Portable immutable data only. Capture does not resolve frame existence. */
export interface VisualEffectDefinition {
  readonly effectId: string;
  readonly kind: 'sprite-sequence';
  readonly clip: SpriteTimedClip;
  readonly resource: VisualResourceDescriptor;
  readonly sources: readonly VisualEffectSourceRevision[];
}

export interface VisualEffectDefinitionFailure {
  readonly code: 'INVALID_STRUCTURE' | 'INVALID_EFFECT_ID' | 'UNSUPPORTED_KIND'
    | 'INVALID_CLIP' | 'INVALID_RESOURCE' | 'INVALID_SOURCE_BINDING'
    | 'RESOURCE_SCOPE_MISMATCH' | 'FOREIGN_DEFINITION';
}

const failures = new WeakMap<object, VisualEffectDefinitionFailure>();
function invalid(code: VisualEffectDefinitionFailure['code']): never {
  const error = new TypeError(`Visual effect definition: ${code}`);
  failures.set(error, Object.freeze({ code }));
  throw error;
}

/** Only recognizes this package's capture/admission errors; undefined is not success. */
export function getVisualEffectDefinitionFailure(error: unknown): VisualEffectDefinitionFailure | undefined {
  return typeof error === 'object' && error !== null ? failures.get(error) : undefined;
}

const definitions = new WeakSet<VisualEffectDefinition>(); // Provenance, never an ID/content registry.
/** Owner-local issuance check; never admits a copied/JSON definition as live data. */
export function requireVisualEffectDefinition(definition: VisualEffectDefinition): VisualEffectDefinition {
  if (!definitions.has(definition)) invalid('FOREIGN_DEFINITION');
  return definition;
}
function record(input: unknown, keys: readonly string[]): Record<string, unknown> {
  if (typeof input !== 'object' || input === null || Array.isArray(input)
    || (Object.getPrototypeOf(input) !== Object.prototype && Object.getPrototypeOf(input) !== null)
    || Reflect.ownKeys(input).length !== keys.length) invalid('INVALID_STRUCTURE');
  const output: Record<string, unknown> = {};
  for (const key of keys) {
    const entry = Object.getOwnPropertyDescriptor(input, key);
    if (!entry?.enumerable || !('value' in entry)) invalid('INVALID_STRUCTURE');
    output[key] = entry.value;
  }
  return output;
}

function list(input: unknown, max: number): readonly unknown[] {
  if (!Array.isArray(input) || Object.getPrototypeOf(input) !== Array.prototype
    || input.length < 1 || input.length > max || Reflect.ownKeys(input).length !== input.length + 1) {
    invalid('INVALID_STRUCTURE');
  }
  const output: unknown[] = [];
  for (let index = 0; index < input.length; index++) {
    const item = Object.getOwnPropertyDescriptor(input, String(index));
    if (!item?.enumerable || !('value' in item)) invalid('INVALID_STRUCTURE');
    output.push(item.value);
  }
  return output;
}

function token(input: unknown): input is string {
  return typeof input === 'string' && input.length > 0 && input.length <= 512
    && !/[\s\u0000-\u001f\u007f]/u.test(input);
}

function capture<T>(operation: () => T, code: VisualEffectDefinitionFailure['code']): T {
  try { return operation(); }
  catch (error) {
    if (error instanceof TypeError || error instanceof RangeError) invalid(code);
    throw error;
  }
}

/**
 * Capture one Phase10 timed sequence and exact Phase7 source expectations.
 * No source/clip lookup, IO, allocation of graphics, playhead or authored catalog.
 * Unknown fields/live handles are rejected. Runtime metadata TypeError/RangeError
 * becomes a bounded domain diagnostic; other host exceptions propagate.
 */
export function createVisualEffectDefinition(input: VisualEffectDefinitionInput): VisualEffectDefinition {
  const data = record(input, ['effectId', 'kind', 'clip', 'resource', 'sources']);
  if (!token(data.effectId)) invalid('INVALID_EFFECT_ID');
  if (data.kind !== 'sprite-sequence') invalid('UNSUPPORTED_KIND');
  const clip = capture(() => createSpriteTimedClip(data.clip as SpriteTimedClipInput), 'INVALID_CLIP');
  // Bound this version to Phase7's existing source-binding ceiling before capture.
  const resource = capture(() => {
    const fields = record(data.resource, ['identity', 'mediaType', 'sources']);
    const sources = list(fields.sources, 256);
    return prepareVisualResource({ identity: fields.identity as VisualResourceDescriptor['identity'],
      mediaType: fields.mediaType as string | null, sources: sources as VisualResourceDescriptor['sources'] }).descriptor;
  }, 'INVALID_RESOURCE');
  if (!token(resource.identity.projectId) || !token(resource.identity.resourceId)
    || (resource.mediaType !== null && resource.mediaType !== 'image/png')
    || !resource.sources.some(source => source.role === 'atlas-metadata')
    || resource.sources.some(source => source.locator.path.length > 2048)) invalid('INVALID_RESOURCE');
  const first = clip.clip.sequence.frames[0]!;
  if (first.projectId !== resource.identity.projectId || first.resourceId !== resource.identity.resourceId) {
    invalid('RESOURCE_SCOPE_MISMATCH');
  }
  const sources = capture(() => {
    const pins = list(data.sources, 256), ids = new Set<string>(), indexes = new Set<number>();
    if (pins.length !== resource.sources.length) invalid('INVALID_SOURCE_BINDING');
    return Object.freeze(pins.map(pin => {
      const fields = record(pin, ['sourceId', 'sourceIndex', 'revision']);
      const index = fields.sourceIndex;
      if (!token(fields.sourceId) || typeof index !== 'number' || !Number.isSafeInteger(index)
        || index < 0 || index >= resource.sources.length || ids.has(fields.sourceId) || indexes.has(index)
        || typeof fields.revision !== 'string' || fields.revision.trim().length === 0
        || fields.revision.length > 2048 || /[\u0000-\u001f\u007f]/u.test(fields.revision)) invalid('INVALID_SOURCE_BINDING');
      ids.add(fields.sourceId); indexes.add(index);
      return Object.freeze({ sourceId: fields.sourceId, sourceIndex: index === 0 ? 0 : index, revision: fields.revision });
    }));
  }, 'INVALID_SOURCE_BINDING');
  const definition: VisualEffectDefinition = Object.freeze({ effectId: data.effectId,
    kind: 'sprite-sequence', clip, resource, sources });
  definitions.add(definition);
  return definition;
}

export interface VisualEffectDefinitionBindingInput {
  readonly atlas: AtlasMetadata | null;
  /** Exact package-local parsed snapshot identity; not part of portable definition. */
  readonly expectedRevision: symbol;
  /** Host-attested page dimensions/layout only; resolution performs no decode. */
  readonly pages: readonly AtlasPagePixels[];
}

export type VisualEffectDefinitionBindingResult =
  | { readonly status: 'resolved'; readonly resourceLoading: 'NOT_PERFORMED';
    readonly effectId: string; readonly atlasRevision: symbol;
    readonly frames: readonly AtlasFrameGeometry[] }
  | { readonly status: 'rejected'; readonly code:
    Extract<AtlasFrameGeometryResult, { status: 'rejected' }>['code']
    | 'SOURCE_BINDING_MISMATCH' | 'SOURCE_REVISION_MISMATCH' | 'PAGE_BINDING_MISMATCH';
    /** Null for definition-wide failure; otherwise first failing ordered frame. */
    readonly frameIndex: number | null };

/**
 * All-or-nothing metadata resolution against one exact canonical Phase7 atlas.
 * Image revision strings remain expectations until Phase7 live lease admission;
 * metadata revisions are checked against actual parser provenance. No IO/texture.
 */
export function resolveVisualEffectDefinition(definition: VisualEffectDefinition,
  input: VisualEffectDefinitionBindingInput): VisualEffectDefinitionBindingResult {
  if (!definitions.has(definition)) invalid('FOREIGN_DEFINITION');
  const data = record(input, ['atlas', 'expectedRevision', 'pages']);
  if (typeof data.expectedRevision !== 'symbol') invalid('INVALID_STRUCTURE');
  type Code = Extract<VisualEffectDefinitionBindingResult, { status: 'rejected' }>['code'];
  const reject = (code: Code, frameIndex: number | null = null): VisualEffectDefinitionBindingResult =>
    Object.freeze({ status: 'rejected', code, frameIndex });
  const atlas = data.atlas as AtlasMetadata | null;
  if (atlas === null) return reject('ATLAS_NOT_AVAILABLE');
  const revision = getAtlasMetadataRevision(atlas);
  if (revision === null) return reject('ATLAS_NOT_SUPPORTED');
  if (revision.id !== data.expectedRevision) return reject('ATLAS_REVISION_MISMATCH');
  if (atlas.identity.projectId !== definition.resource.identity.projectId
    || atlas.identity.resourceId !== definition.resource.identity.resourceId) return reject('RESOURCE_MISMATCH');
  if (atlas.sources.length !== definition.sources.length) return reject('SOURCE_BINDING_MISMATCH');
  for (const pin of definition.sources) {
    const source = atlas.sources.find(item => item.sourceId === pin.sourceId);
    const expected = definition.resource.sources[pin.sourceIndex]!;
    if (source?.sourceIndex !== pin.sourceIndex || source.role !== expected.role
      || source.locator.type !== expected.locator.type || source.locator.path !== expected.locator.path) {
      return reject('SOURCE_BINDING_MISMATCH');
    }
    if (expected.role === 'atlas-metadata') {
      const observed = revision.sources.find(item => item.sourceId === pin.sourceId);
      if (observed?.revision !== pin.revision || observed.scope.projectId !== definition.resource.identity.projectId) {
        return reject('SOURCE_REVISION_MISMATCH');
      }
    }
  }
  const pages = new Map<string, AtlasPagePixels>();
  for (const item of list(data.pages, 64)) {
    const page = record(item, ['imageSourceId', 'unit', 'width', 'height', 'layout']);
    if (!token(page.imageSourceId) || pages.has(page.imageSourceId)
      || !atlas.pages.some(candidate => candidate.imageSourceId === page.imageSourceId)) return reject('PAGE_BINDING_MISMATCH');
    if (page.layout !== 'texturepacker-unity-bottom-left') return reject('UNSUPPORTED_LAYOUT');
    if (page.unit !== 'image-pixel' || typeof page.width !== 'number' || typeof page.height !== 'number'
      || !Number.isSafeInteger(page.width) || !Number.isSafeInteger(page.height)
      || page.width <= 0 || page.height <= 0) return reject('INVALID_PAGE_PIXELS');
    pages.set(page.imageSourceId, Object.freeze({ imageSourceId: page.imageSourceId,
      unit: page.unit as AtlasPagePixels['unit'], width: page.width as number,
      height: page.height as number, layout: page.layout as AtlasPagePixels['layout'] }));
  }
  const frames: AtlasFrameGeometry[] = [];
  const resolved = new Map<string, AtlasFrameGeometry>();
  for (const [index, reference] of definition.clip.clip.sequence.frames.entries()) {
    // Resolve through Phase7; never build a second atlas/frame lookup algorithm.
    let geometry = resolved.get(reference.subresourceId!);
    if (geometry === undefined) {
      // The first public Phase7 resolution establishes the authoritative page.
      // Geometry resolution below repeats canonical frame validation intentionally.
      const frame = resolveAtlasFrame(reference, atlas, data.expectedRevision);
      if (frame.status !== 'resolved') return reject(frame.code, index);
      const pixels = pages.get(frame.page.imageSourceId);
      if (pixels === undefined) return reject('PAGE_BINDING_MISMATCH', index);
      const result = resolveAtlasFrameGeometry(reference, atlas, data.expectedRevision, pixels);
      if (result.status !== 'resolved') return reject(result.code, index);
      geometry = result.geometry;
      resolved.set(reference.subresourceId!, geometry);
    }
    frames.push(geometry);
  }
  return Object.freeze({ status: 'resolved', resourceLoading: 'NOT_PERFORMED', effectId: definition.effectId,
    atlasRevision: revision.id, frames: Object.freeze(frames) });
}
