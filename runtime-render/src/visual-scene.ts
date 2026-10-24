import { VisualPresentationError } from './visual-presentation-error.js';
import { registerCameraScene, endCameraScene } from './camera-frame-link.js';
import type { RenderFrameSession } from './frame-session.js';
import { requireTextureSession, onTextureSessionEnd, getRenderTextureSnapshot } from './render-texture.js';
import { retainVisualResourceLease, type VisualResourceLease } from './visual-resource-cache.js';
import { resolveAtlasFrameGeometry, createAtlasTextureView, type AtlasPagePixels,
  type AtlasFrameGeometry, type AtlasFrameGeometryResult } from './atlas-geometry.js';
import type { VisualFrameReference } from './atlas-frame.js';
import type { AtlasMetadata } from './atlas-metadata.js';
import { captureVisualInstanceTransform, type RenderVisualInstanceTransformInput,
  type RenderVisualInstanceTransformSnapshot } from './visual-instance-transform.js';
import { writeVisualTransform, writeVisualVisibility, writeVisualOrdering, readVisualViewportSuspension,
  type VisualPresentationWrite } from './visual-transform-backend.js';
import { captureSpriteLayout, type RenderVisualSpriteLayout } from './visual-sprite-layout.js';
import { FrameError } from './frame-failure.js';
import { checkVisualEdit, attachVisualFrameSource, type VisualFrameItem } from './visual-transform-backend.js';
import type { AffineTransform2D } from './planar-affine.js';
import { captureDepthKey, captureOrderingPolicy, explicitOrdering, sameOrderingPolicy, visualDepth,
  type RenderVisualDepthKey, type RenderVisualLayerOrderingPolicy } from './visual-depth.js';

export interface RenderVisualFrameBinding {
  readonly reference: VisualFrameReference;
  readonly atlas: AtlasMetadata | null;
  readonly expectedRevision: symbol;
  /** Explicit host attestation of page identity/layout, per Phase 7. */
  readonly pixels: AtlasPagePixels;
}

/** Draw participation gate only, never resource readiness or observed pixels. */
export interface RenderVisualInstanceVisibilitySnapshot {
  readonly visible: boolean;
  readonly viewportSuspended: boolean;
  /** Instance intent AND current layer visibility AND not viewport-suspended. */
  readonly effectiveVisible: boolean;
}

export interface RenderVisualResourceBindingInput {
  /** Borrowed only for admission; success retains a separate cache usage right. */
  readonly resource: VisualResourceLease;
  readonly expectedSourceRevision: string;
  /** null selects the entire texture; a frame must resolve through Phase 7. */
  readonly frame: RenderVisualFrameBinding | null;
}

/** Observation only; never exposes the instance's releasable usage capability. */
export interface RenderVisualResourceBindingSnapshot {
  readonly state: 'usable' | 'unavailable';
  readonly resourceId: symbol;
  readonly sessionId: symbol;
  readonly sourceRevision: string;
  readonly frame: AtlasFrameGeometry | null;
  readonly cleanupFailed: boolean;
}

export interface RenderVisualBindingFailure {
  readonly code: 'FOREIGN_RESOURCE' | 'RESOURCE_NOT_USABLE' | 'CONTEXT_MISMATCH'
    | 'SOURCE_REVISION_MISMATCH'
    | Extract<AtlasFrameGeometryResult, { status: 'rejected' }>['code'];
}

class BindingError extends TypeError {
  readonly #failure: RenderVisualBindingFailure;
  constructor(code: RenderVisualBindingFailure['code']) {
    super(`Visual resource binding rejected: ${code}`);
    this.#failure = Object.freeze({ code });
  }
  static classify(error: unknown): RenderVisualBindingFailure | undefined {
    return typeof error === 'object' && error !== null && #failure in error ? error.#failure : undefined;
  }
}

export function getRenderVisualBindingFailure(error: unknown): RenderVisualBindingFailure | undefined {
  return BindingError.classify(error);
}

interface OwnedBinding {
  readonly read: () => RenderVisualResourceBindingSnapshot;
  readonly draw: () => { readonly texture: import('./render-texture.js').RenderTexture; readonly frame: AtlasFrameGeometry | null };
  readonly release: () => void;
}

// Separate environment: released bindings do not retain cache/session via a lease.
function ownBinding(input: VisualResourceLease, frame: AtlasFrameGeometry | null): OwnedBinding {
  let lease: VisualResourceLease | undefined = input;
  const initial = input.getSnapshot();
  if (initial.state !== 'usable') throw new BindingError('RESOURCE_NOT_USABLE');
  let snapshot: RenderVisualResourceBindingSnapshot = Object.freeze({ state: 'usable',
    resourceId: initial.resourceId, sessionId: initial.sessionId, sourceRevision: initial.sourceRevision,
    frame, cleanupFailed: initial.cleanupFailed });
  return {
    draw: () => {
      const current = lease?.getSnapshot();
      if (current?.state !== 'usable') throw new FrameError('FRAME_FAILED', 'renderFrame');
      return Object.freeze({ texture: current.texture, frame });
    },
    read: () => {
      const current = lease?.getSnapshot();
      snapshot = Object.freeze({ ...snapshot, state: current?.state === 'usable' ? 'usable' : 'unavailable',
        cleanupFailed: snapshot.cleanupFailed || (current?.cleanupFailed ?? false) });
      return snapshot;
    },
    release: () => {
      const previous = lease;
      lease = undefined; // Unlink before native cleanup; release exactly once even on failure.
      if (previous !== undefined) {
        const ended = previous.release();
        snapshot = Object.freeze({ ...snapshot, state: 'unavailable', cleanupFailed: snapshot.cleanupFailed || ended.cleanupFailed });
      }
    },
  };
}

function prepareBinding(session: RenderFrameSession, input: RenderVisualResourceBindingInput, cleanupFailure: () => void): OwnedBinding {
  const data = dataRecord(input, ['resource', 'expectedSourceRevision', 'frame']);
  if (typeof data.expectedSourceRevision !== 'string' || data.expectedSourceRevision.trim().length === 0) {
    throw new InstanceError('INVALID_DESCRIPTOR');
  }
  // Canonical weak dispatch never invokes methods on an arbitrary host lease.
  const retained = retainVisualResourceLease(data.resource as VisualResourceLease,
    requireTextureSession(session), data.expectedSourceRevision);
  if (typeof retained === 'string') throw new BindingError(retained);
  try {
    let geometry: AtlasFrameGeometry | null = null;
    if (data.frame !== null) {
      const frame = dataRecord(data.frame, ['reference', 'atlas', 'expectedRevision', 'pixels']);
      const pixels = dataRecord(frame.pixels, ['imageSourceId', 'unit', 'width', 'height', 'layout']);
      const resolved = resolveAtlasFrameGeometry(frame.reference as VisualFrameReference,
        frame.atlas as AtlasMetadata | null, frame.expectedRevision as symbol, pixels as unknown as AtlasPagePixels);
      if (resolved.status !== 'resolved') throw new BindingError(resolved.code);
      geometry = resolved.geometry;
      const current = retained.getSnapshot();
      if (current.state !== 'usable') throw new BindingError('RESOURCE_NOT_USABLE');
      const texture = getRenderTextureSnapshot(session, current.texture);
      if (texture.width !== geometry.pagePixels.width || texture.height !== geometry.pagePixels.height) {
        throw new BindingError('PAGE_DIMENSION_MISMATCH');
      }
      createAtlasTextureView(session, current.texture, geometry, geometry.imageSourceId);
    }
    requireTextureSession(session);
    return ownBinding(retained, geometry);
  } catch (error) {
    try { if (retained.release().cleanupFailed) cleanupFailure(); } catch (cleanupError) { cleanupFailure(); throw cleanupError; }
    // No previous binding touched; cleanup exception may replace the admission error.
    throw error;
  }
}

/** Terminal logical ownership observation, not a native cleanup/GPU-health receipt. */
export interface RenderVisualSceneDisposal {
  readonly id: symbol;
  readonly sessionId: symbol;
  readonly state: 'disposed';
  /** First terminal cause wins; session-ended includes graphics failure/loss. */
  readonly reason: 'scene-disposed' | 'session-ended';
}

/** Detached metadata only: never retains a session, canvas, backend or authored data. */
export type RenderVisualSceneSnapshot =
  | { readonly id: symbol; readonly sessionId: symbol; readonly state: 'active' }
  | RenderVisualSceneDisposal;

/** Presentation membership scope bound permanently to one canonical graphics session. */
export interface RenderVisualScene {
  /** Available after termination. Previously returned snapshots remain historical. */
  readonly getSnapshot: () => RenderVisualSceneSnapshot;
  /** Remove all owned membership while active; TypeError after termination. Never draws. */
  readonly clear: () => RenderVisualSceneSnapshot;
  /** Terminal/idempotent. Never disposes the borrowed graphics session or host. */
  readonly dispose: () => RenderVisualSceneDisposal;
}

// Weak occupancy guard only, not an enumerable scene registry or authored-ID lookup.
const occupiedSessions = new WeakSet<RenderFrameSession>();

/** Optional adapter metadata, never a live identity or an Editor type dependency. */
export interface RenderVisualCorrelation {
  readonly projectId: string;
  readonly sceneId: string;
  readonly objectId: string;
}

export interface RenderVisualInstanceInput {
  /** Caller-selected, scene-local nonempty whitespace-free key; never inferred. */
  readonly visualInstanceId: string;
  readonly correlation?: RenderVisualCorrelation | null;
  /** Omitted: scene-local built-in default layer and order zero. */
  readonly layerKey?: string;
  readonly order?: number;
}

export interface RenderVisualLayerInput {
  readonly layerKey: string;
  readonly priority: number;
  /** Defaults true, including on full update replacement. */
  readonly visible?: boolean;
}

export interface RenderVisualLayerSnapshot {
  readonly layerKey: string;
  readonly priority: number;
  readonly visible: boolean;
  readonly insertionOrdinal: number;
}

/** Full replacement of presentation assignment; neither field is gameplay depth. */
export interface RenderVisualInstanceOrder {
  readonly layerKey: string;
  readonly order: number;
}

/** Participation candidate only: may have no resource, transform or drawable. */
export interface RenderVisualDrawCandidate extends RenderVisualInstanceOrder {
  readonly instance: RenderVisualInstance;
  readonly layerPriority: number;
  readonly layerInsertionOrdinal: number;
  readonly insertionOrdinal: number;
}

export interface RenderVisualLayerFailure {
  readonly code: 'INVALID_LAYER' | 'INVALID_PRIORITY' | 'INVALID_ORDER' | 'DUPLICATE_LAYER'
    | 'MISSING_LAYER' | 'LAYER_IN_USE' | 'RESERVED_LAYER' | 'ORDERING_CHANGED';
}

class LayerError extends TypeError {
  readonly #failure: RenderVisualLayerFailure;
  constructor(code: RenderVisualLayerFailure['code']) {
    super(`Visual layer operation rejected: ${code}`);
    this.#failure = Object.freeze({ code });
  }
  static classify(error: unknown): RenderVisualLayerFailure | undefined {
    return typeof error === 'object' && error !== null && #failure in error ? error.#failure : undefined;
  }
}

export function getRenderVisualLayerFailure(error: unknown): RenderVisualLayerFailure | undefined {
  return LayerError.classify(error);
}

function layerKey(value: unknown): string {
  if (typeof value !== 'string' || value.length === 0 || /\s/u.test(value)) throw new LayerError('INVALID_LAYER');
  return value;
}

function sortInteger(value: unknown, code: 'INVALID_PRIORITY' | 'INVALID_ORDER'): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value)) throw new LayerError(code);
  return value === 0 ? 0 : value;
}

function layerRecord(input: unknown, required: readonly string[], optional: readonly string[] = []): Record<string, unknown> {
  try { return dataRecord(input, required, optional); }
  catch (error) {
    if (getRenderVisualInstanceFailure(error)?.code === 'INVALID_DESCRIPTOR') throw new LayerError('INVALID_LAYER');
    throw error;
  }
}

function captureLayer(input: RenderVisualLayerInput): Omit<RenderVisualLayerSnapshot, 'insertionOrdinal'> {
  const data = layerRecord(input, ['layerKey', 'priority'], ['visible']);
  const key = layerKey(data.layerKey), priority = sortInteger(data.priority, 'INVALID_PRIORITY');
  const visible = Object.hasOwn(data, 'visible') ? data.visible : true;
  if (typeof visible !== 'boolean') throw new LayerError('INVALID_LAYER');
  return { layerKey: key, priority, visible };
}

function captureOrder(input: RenderVisualInstanceOrder): RenderVisualInstanceOrder {
  const data = layerRecord(input, ['layerKey', 'order']);
  return Object.freeze({ layerKey: layerKey(data.layerKey), order: sortInteger(data.order, 'INVALID_ORDER') });
}

export function addRenderVisualLayer(scene: RenderVisualScene, input: RenderVisualLayerInput): RenderVisualLayerSnapshot {
  return membership(scene).addLayer(input);
}
export function updateRenderVisualLayer(scene: RenderVisualScene, input: RenderVisualLayerInput): RenderVisualLayerSnapshot {
  return membership(scene).updateLayer(input);
}
export function getRenderVisualLayer(scene: RenderVisualScene, key: string): RenderVisualLayerSnapshot | undefined {
  return membership(scene).getLayer(key);
}
/** Explicit priority/creation order, including hidden layers and the built-in default. */
export function listRenderVisualLayers(scene: RenderVisualScene): readonly RenderVisualLayerSnapshot[] {
  return membership(scene).listLayers();
}
/** Missing, built-in default or occupied layer rejects. No fallback/reassignment. */
export function removeRenderVisualLayer(scene: RenderVisualScene, key: string): void {
  membership(scene).removeLayer(key);
}
export function setRenderVisualInstanceOrder(scene: RenderVisualScene, instance: RenderVisualInstance,
  input: RenderVisualInstanceOrder): RenderVisualInstanceOrder {
  return membership(scene).order(instance, input);
}
export function getRenderVisualInstanceOrder(scene: RenderVisualScene, instance: RenderVisualInstance): RenderVisualInstanceOrder {
  return membership(scene).readOrder(instance);
}
/** Frozen ordered membership observations, filtered by layer/instance visibility and suspension. */
export function listRenderVisualDrawCandidates(scene: RenderVisualScene): readonly RenderVisualDrawCandidate[] {
  return membership(scene).candidates();
}

/** Opt in independently of layer definition updates. All members must admit the policy. */
export function setRenderVisualLayerOrderingPolicy(scene: RenderVisualScene, key: string,
  policy: RenderVisualLayerOrderingPolicy): RenderVisualLayerOrderingPolicy {
  return membership(scene).policy(key, policy);
}
export function getRenderVisualLayerOrderingPolicy(scene: RenderVisualScene, key: string): RenderVisualLayerOrderingPolicy {
  return membership(scene).readPolicy(key);
}
/** null clears the stored key only if the active policy does not require it. */
export function setRenderVisualInstanceDepthKey(scene: RenderVisualScene, instance: RenderVisualInstance,
  input: RenderVisualDepthKey | null): RenderVisualDepthKey | null {
  return membership(scene).depthKey(instance, input);
}
export function getRenderVisualInstanceDepthKey(scene: RenderVisualScene, instance: RenderVisualInstance): RenderVisualDepthKey | null {
  return membership(scene).readDepthKey(instance);
}

/** Opt-in sprite geometry; null returns to metadata-only participation. */
export function setRenderVisualInstanceSpriteLayout(scene: RenderVisualScene, instance: RenderVisualInstance,
  layout: RenderVisualSpriteLayout | null): RenderVisualSpriteLayout | null {
  return membership(scene).layout(instance, layout);
}
export function getRenderVisualInstanceSpriteLayout(scene: RenderVisualScene,
  instance: RenderVisualInstance): RenderVisualSpriteLayout | null {
  return membership(scene).readLayout(instance);
}

declare const visualInstanceBrand: unique symbol;

/**
 * Factory-issued frozen capability and historical registration metadata. No live
 * state/GPU claim; get/list determine current membership. Copies are not handles.
 */
export interface RenderVisualInstance {
  readonly [visualInstanceBrand]: true;
  readonly visualInstanceId: string;
  readonly sceneId: symbol;
  readonly sessionId: symbol;
  /** Zero-based, monotonically increasing within this scope; never recycled. */
  readonly insertionOrdinal: number;
  readonly correlation: RenderVisualCorrelation | null;
}

/** Complete replace payload for SR05; no identity, transforms or resource rights. */
export interface RenderVisualInstanceProperties {
  readonly correlation: RenderVisualCorrelation | null;
}

/** Detached current-state observation, not a capability or GPU-readiness claim. */
export interface RenderVisualInstanceSnapshot extends RenderVisualInstanceProperties {
  readonly visualInstanceId: string;
  readonly sceneId: symbol;
  readonly sessionId: symbol;
  readonly insertionOrdinal: number;
}

export interface RenderVisualInstanceFailure {
  readonly code: 'INVALID_DESCRIPTOR' | 'INVALID_ID' | 'DUPLICATE_ID'
    | 'FOREIGN_SCENE' | 'FOREIGN_INSTANCE' | 'MISSING_INSTANCE' | 'INSTANCE_CHANGED'
    | 'SCENE_DISPOSED' | 'SESSION_UNAVAILABLE';
}

class InstanceError extends TypeError {
  readonly #failure: RenderVisualInstanceFailure;
  constructor(code: RenderVisualInstanceFailure['code']) {
    super(`Visual instance operation rejected: ${code}`);
    this.#failure = Object.freeze({ code });
  }
  static classify(error: unknown): RenderVisualInstanceFailure | undefined {
    return typeof error === 'object' && error !== null && #failure in error ? error.#failure : undefined;
  }
}

/** Safe package-branded admission reason; unknown host exceptions remain unknown. */
export function getRenderVisualInstanceFailure(error: unknown): RenderVisualInstanceFailure | undefined {
  return InstanceError.classify(error);
}

export interface RenderVisualSceneDiagnostics {
  readonly state: 'active' | 'disposed';
  readonly instances: number;
  readonly boundUsages: number;
  readonly usableUsages: number;
  readonly unavailableUsages: number;
  /** Sticky scope-local cleanup uncertainty, not session/GPU health. */
  readonly cleanupFailed: boolean;
  readonly releaseAttempts: number;
}

/** Count-only observation; no native objects, IDs, revisions or host paths. */
export function getRenderVisualSceneDiagnostics(scene: RenderVisualScene): RenderVisualSceneDiagnostics {
  return membership(scene).diagnostics();
}

interface MembershipControl {
  readonly diagnostics: () => RenderVisualSceneDiagnostics;
  readonly layout: (instance: RenderVisualInstance, input: RenderVisualSpriteLayout | null) => RenderVisualSpriteLayout | null;
  readonly readLayout: (instance: RenderVisualInstance) => RenderVisualSpriteLayout | null;
  readonly policy: (key: string, policy: RenderVisualLayerOrderingPolicy) => RenderVisualLayerOrderingPolicy;
  readonly readPolicy: (key: string) => RenderVisualLayerOrderingPolicy;
  readonly depthKey: (instance: RenderVisualInstance, input: RenderVisualDepthKey | null) => RenderVisualDepthKey | null;
  readonly readDepthKey: (instance: RenderVisualInstance) => RenderVisualDepthKey | null;
  readonly addLayer: (input: RenderVisualLayerInput) => RenderVisualLayerSnapshot;
  readonly updateLayer: (input: RenderVisualLayerInput) => RenderVisualLayerSnapshot;
  readonly getLayer: (key: string) => RenderVisualLayerSnapshot | undefined;
  readonly listLayers: () => readonly RenderVisualLayerSnapshot[];
  readonly removeLayer: (key: string) => void;
  readonly order: (instance: RenderVisualInstance, input: RenderVisualInstanceOrder) => RenderVisualInstanceOrder;
  readonly readOrder: (instance: RenderVisualInstance) => RenderVisualInstanceOrder;
  readonly candidates: () => readonly RenderVisualDrawCandidate[];
  readonly add: (input: RenderVisualInstanceInput) => RenderVisualInstance;
  readonly get: (id: string) => RenderVisualInstance | undefined;
  readonly list: () => readonly RenderVisualInstance[];
  readonly remove: (instance: RenderVisualInstance) => boolean;
  readonly read: (instance: RenderVisualInstance) => RenderVisualInstanceSnapshot;
  readonly update: (instance: RenderVisualInstance, properties: RenderVisualInstanceProperties) => RenderVisualInstanceSnapshot;
  readonly bind: (instance: RenderVisualInstance, input: RenderVisualResourceBindingInput | null) => RenderVisualResourceBindingSnapshot | null;
  readonly binding: (instance: RenderVisualInstance) => RenderVisualResourceBindingSnapshot | null;
  readonly transform: (instance: RenderVisualInstance, input: RenderVisualInstanceTransformInput | null) => RenderVisualInstanceTransformSnapshot | null;
  readonly readTransform: (instance: RenderVisualInstance) => RenderVisualInstanceTransformSnapshot | null;
  readonly visibility: (instance: RenderVisualInstance, visible: boolean) => RenderVisualInstanceVisibilitySnapshot;
  readonly readVisibility: (instance: RenderVisualInstance) => RenderVisualInstanceVisibilitySnapshot;
}

// Weak canonical capability dispatch only: no enumerable/global scene registry.
const memberships = new WeakMap<RenderVisualScene, MembershipControl>();

function membership(scene: RenderVisualScene): MembershipControl {
  const control = memberships.get(scene);
  if (control === undefined) throw new InstanceError('FOREIGN_SCENE');
  return control;
}

function dataRecord(value: unknown, required: readonly string[], optional: readonly string[] = []): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new InstanceError('INVALID_DESCRIPTOR');
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) throw new InstanceError('INVALID_DESCRIPTOR');
  const keys = Reflect.ownKeys(value);
  if (required.some(key => !keys.includes(key))
    || keys.some(key => typeof key !== 'string' || (!required.includes(key) && !optional.includes(key)))) {
    throw new InstanceError('INVALID_DESCRIPTOR');
  }
  const captured: Record<string, unknown> = Object.create(null) as Record<string, unknown>;
  for (const key of keys) {
    const field = Object.getOwnPropertyDescriptor(value, key);
    if (!field?.enumerable || !('value' in field)) throw new InstanceError('INVALID_DESCRIPTOR');
    captured[key as string] = field.value;
  }
  return captured;
}

function instanceToken(value: unknown, code: 'INVALID_DESCRIPTOR' | 'INVALID_ID' = 'INVALID_DESCRIPTOR'): string {
  if (typeof value !== 'string' || value.length === 0 || /\s/u.test(value)) {
    throw new InstanceError(code);
  }
  return value;
}

function captureCorrelation(value: unknown): RenderVisualCorrelation | null {
  if (value === null) return null;
  const fields = dataRecord(value, ['projectId', 'sceneId', 'objectId']);
  return Object.freeze({ projectId: instanceToken(fields.projectId),
    sceneId: instanceToken(fields.sceneId), objectId: instanceToken(fields.objectId) });
}

function captureInstance(input: RenderVisualInstanceInput): {
  readonly visualInstanceId: string; readonly correlation: RenderVisualCorrelation | null;
  readonly ordering: RenderVisualInstanceOrder;
} {
  const data = dataRecord(input, ['visualInstanceId'], ['correlation', 'layerKey', 'order']);
  const visualInstanceId = instanceToken(data.visualInstanceId);
  const correlation = Object.hasOwn(data, 'correlation') ? captureCorrelation(data.correlation) : null;
  const ordering = captureOrder({ layerKey: Object.hasOwn(data, 'layerKey') ? data.layerKey : 'default',
    order: Object.hasOwn(data, 'order') ? data.order : 0 } as RenderVisualInstanceOrder);
  return { visualInstanceId, correlation, ordering };
}

/** Register metadata only, never a mesh/texture. Duplicate live IDs throw TypeError. */
export function addRenderVisualInstance(scene: RenderVisualScene, input: RenderVisualInstanceInput): RenderVisualInstance {
  return membership(scene).add(input);
}

/** Current scene-local lookup; valid missing ID returns undefined. Terminal throws. */
export function getRenderVisualInstance(scene: RenderVisualScene, visualInstanceId: string): RenderVisualInstance | undefined {
  return membership(scene).get(visualInstanceId);
}

/** New frozen array of immutable handles in insertion order, never render order. */
export function listRenderVisualInstances(scene: RenderVisualScene): readonly RenderVisualInstance[] {
  return membership(scene).list();
}

/**
 * Remove only this exact registration. Stale same-scene handles return false even
 * after ID reuse; foreign/copied handles throw TypeError. Terminal scene throws.
 */
export function removeRenderVisualInstance(scene: RenderVisualScene, instance: RenderVisualInstance): boolean {
  return membership(scene).remove(instance);
}

/** Read current props through an exact live capability. Historical snapshots stay unchanged. */
export function getRenderVisualInstanceSnapshot(
  scene: RenderVisualScene, instance: RenderVisualInstance,
): RenderVisualInstanceSnapshot {
  return membership(scene).read(instance);
}

/**
 * Replace the complete SR05 props after validation. Keeps handle/ID/ordinal and
 * insertion order. Equal props return the existing snapshot; no recreation/draw.
 */
export function updateRenderVisualInstance(
  scene: RenderVisualScene, instance: RenderVisualInstance, properties: RenderVisualInstanceProperties,
): RenderVisualInstanceSnapshot {
  return membership(scene).update(instance, properties);
}

/** Retain a validated usage before replacing; null explicitly unbinds. Never loads/draws. */
export function bindRenderVisualInstanceResource(scene: RenderVisualScene, instance: RenderVisualInstance,
  input: RenderVisualResourceBindingInput | null): RenderVisualResourceBindingSnapshot | null {
  return membership(scene).bind(instance, input);
}

/** Probe current usage, including cache revocation/context loss; history is not liveness. */
export function getRenderVisualInstanceResource(scene: RenderVisualScene,
  instance: RenderVisualInstance): RenderVisualResourceBindingSnapshot | null {
  return membership(scene).binding(instance);
}

/** Explicit planar update through Phase 4. null removes only the presentation transform/node. */
export function setRenderVisualInstanceTransform(scene: RenderVisualScene, instance: RenderVisualInstance,
  input: RenderVisualInstanceTransformInput | null): RenderVisualInstanceTransformSnapshot | null {
  return membership(scene).transform(instance, input);
}

/** Detached last accepted transform, not a GPU/visual-health observation. */
export function getRenderVisualInstanceTransform(scene: RenderVisualScene,
  instance: RenderVisualInstance): RenderVisualInstanceTransformSnapshot | null {
  return membership(scene).readTransform(instance);
}

/** Hide/show changes only draw intent; repeated values do not invalidate a frame. */
export function setRenderVisualInstanceVisible(scene: RenderVisualScene, instance: RenderVisualInstance,
  visible: boolean): RenderVisualInstanceVisibilitySnapshot {
  return membership(scene).visibility(instance, visible);
}

/** Fresh Phase 6 suspension observation; historical snapshots never track changes. */
export function getRenderVisualInstanceVisibility(scene: RenderVisualScene,
  instance: RenderVisualInstance): RenderVisualInstanceVisibilitySnapshot {
  return membership(scene).readVisibility(instance);
}

// Separate environment: retained terminal handles cannot keep the factory's session
// parameter alive after the detach callback has been dropped.
function createScope(sessionId: symbol) {
  const id = Symbol('visual-scene');
  let snapshot: RenderVisualSceneSnapshot = Object.freeze({ id, sessionId, state: 'active' });
  let detach: (() => void) | undefined;
  let edit: ((invalidate: boolean, dropDrawable?: object) => void) | undefined;
  let prepare: ((input: RenderVisualResourceBindingInput, cleanupFailure: () => void) => OwnedBinding) | undefined;
  let cleanupFailed = false, releaseAttempts = 0;
  const noteCleanupFailure = (): void => { cleanupFailed = true; };
  const releaseBinding = (binding: OwnedBinding | undefined): void => {
    if (binding === undefined) return;
    releaseAttempts += 1;
    try { binding.release(); cleanupFailed ||= binding.read().cleanupFailed; } catch (error) { noteCleanupFailure(); throw error; }
  };
  let writeTransform: ((instance: object, matrix: AffineTransform2D | null, visible: boolean, renderOrder: number) => void) | undefined;
  let writeVisibility: ((instance: object, visible: boolean) => void) | undefined;
  let writeOrdering: ((writes: readonly VisualPresentationWrite[]) => void) | undefined;
  let readSuspended: (() => boolean) | undefined;
  interface Entry {
    readonly handle: RenderVisualInstance; snapshot: RenderVisualInstanceSnapshot;
    binding: OwnedBinding | undefined; transform: RenderVisualInstanceTransformSnapshot | null;
    visible: boolean; ordering: RenderVisualInstanceOrder; depthKey: RenderVisualDepthKey | null;
    layout: RenderVisualSpriteLayout | null;
  }
  const instances = new Map<string, Entry>();
  let layers = new Map<string, RenderVisualLayerSnapshot>([['default', Object.freeze({
    layerKey: 'default', priority: 0, visible: true, insertionOrdinal: 0,
  })]]);
  let nextLayerOrdinal = 1;
  let revision = {};
  const policies = new Map<string, RenderVisualLayerOrderingPolicy>();
  let orderCache: { readonly revision: object; readonly entries: readonly Entry[] } | undefined;
  const invalidateOrdering = (): void => { revision = {}; orderCache = undefined; edit?.(true); };
  const issued = new WeakSet<RenderVisualInstance>();
  let nextOrdinal = 0;
  const requireActive = (): void => {
    if (snapshot.state === 'disposed') {
      throw new InstanceError(snapshot.reason === 'session-ended' ? 'SESSION_UNAVAILABLE' : 'SCENE_DISPOSED');
    }
  };
  const requireEdit = (): void => { requireActive(); edit!(false); };
  const requireEntry = (instance: RenderVisualInstance) => {
    requireActive();
    if (!issued.has(instance)) throw new InstanceError('FOREIGN_INSTANCE');
    const entry = instances.get(instance.visualInstanceId);
    if (entry?.handle !== instance) throw new InstanceError('MISSING_INSTANCE');
    return entry;
  };

  const compare = (a: number, b: number): number => a === b ? 0 : a < b ? -1 : 1;
  const compareLayers = (a: RenderVisualLayerSnapshot, b: RenderVisualLayerSnapshot): number =>
    compare(a.priority, b.priority) || compare(a.insertionOrdinal, b.insertionOrdinal);
  const policyFor = (key: string, selected = policies): RenderVisualLayerOrderingPolicy => selected.get(key) ?? explicitOrdering;
  const requireLayer = (key: string): string => {
    requireActive(); const captured = layerKey(key);
    if (!layers.has(captured)) throw new LayerError('MISSING_LAYER');
    return captured;
  };
  const ordered = (entries?: readonly Entry[], definitions = layers, selected = policies): readonly Entry[] => {
    const cacheable = entries === undefined && definitions === layers && selected === policies;
    if (cacheable && orderCache?.revision === revision) return orderCache.entries;
    // Decorate once: no context validation/traversal inside the comparator.
    const decorated = (entries ?? [...instances.values()]).map(entry => ({ entry,
      layer: definitions.get(entry.ordering.layerKey)!,
      depth: visualDepth(policyFor(entry.ordering.layerKey, selected), entry.transform, entry.depthKey) }));
    decorated.sort((a, b) => compareLayers(a.layer, b.layer) || compare(a.depth, b.depth)
      || compare(a.entry.ordering.order, b.entry.ordering.order)
      || compare(a.entry.handle.insertionOrdinal, b.entry.handle.insertionOrdinal));
    const sorted = decorated.map(value => value.entry);
    if (cacheable) orderCache = { revision, entries: sorted };
    return sorted;
  };
  const syncOrdering = (entries?: readonly Entry[], definitions = layers, selected = policies): readonly Entry[] => {
    const sorted = ordered(entries, definitions, selected);
    writeOrdering!(sorted.map((entry, renderOrder) => ({ instance: entry.handle, renderOrder,
      visible: entry.visible && definitions.get(entry.ordering.layerKey)!.visible })));
    requireActive(); // Native failure/loss is terminal, never an accepted logical edit.
    return sorted;
  };
  const unchanged = (before: object): void => {
    requireActive();
    if (before !== revision) throw new LayerError('ORDERING_CHANGED');
  };

  const readVisibility = (instance: RenderVisualInstance): RenderVisualInstanceVisibilitySnapshot => {
    const entry = requireEntry(instance);
    const viewportSuspended = readSuspended!();
    requireEntry(instance);
    return Object.freeze({ visible: entry.visible, viewportSuspended,
      effectiveVisible: entry.visible && layers.get(entry.ordering.layerKey)!.visible && !viewportSuspended });
  };
  const releaseEntry = (entry: { readonly handle: RenderVisualInstance; binding: OwnedBinding | undefined;
    transform: RenderVisualInstanceTransformSnapshot | null; visible: boolean }): void => {
    const binding = entry.binding, transformed = entry.transform !== null;
    entry.binding = undefined; entry.transform = null;
    // Attempt resource cleanup even if native node removal fails.
    try { if (transformed) writeTransform?.(entry.handle, null, entry.visible, 0); }
    catch (error) { noteCleanupFailure(); throw error; }
    finally { releaseBinding(binding); }
  };
  const drain = (): void => {
    const previous = [...instances.values()];
    instances.clear();
    invalidateOrdering();
    let failure: { error: unknown } | undefined;
    for (const entry of previous) {
      try { releaseEntry(entry); } catch (error) { failure ??= { error }; }
    }
    if (failure !== undefined) throw failure.error;
  };
  const end = (reason: RenderVisualSceneDisposal['reason']): RenderVisualSceneDisposal => {
    if (snapshot.state === 'disposed') return snapshot;
    snapshot = Object.freeze({ id, sessionId, state: 'disposed', reason });
    prepare = undefined;
    const release = detach;
    detach = undefined; // Terminal before unlinking; no retained session/subscription.
    try { endCameraScene(handle); } finally {
      try { drain(); } finally {
        layers.clear();
        policies.clear();
        writeTransform = undefined; writeVisibility = undefined; writeOrdering = undefined;
        readSuspended = undefined; edit = undefined;
        try { release?.(); } catch (error) { noteCleanupFailure(); throw error; }
      }
    }
    return snapshot;
  };
  const handle: RenderVisualScene = Object.freeze({
    getSnapshot: (): RenderVisualSceneSnapshot => snapshot,
    clear: (): RenderVisualSceneSnapshot => {
      requireEdit();
      drain(); // Keep ordinal/provenance: old handles cannot target re-adds.
      return snapshot;
    },
    dispose: (): RenderVisualSceneDisposal => { if (snapshot.state === 'active') requireEdit(); return end('scene-disposed'); },
  });
  memberships.set(handle, {
    diagnostics: () => {
      const before = revision;
      let boundUsages = 0, usableUsages = 0;
      for (const entry of instances.values()) if (entry.binding !== undefined) {
        boundUsages += 1;
        const observation = entry.binding.read();
        cleanupFailed ||= observation.cleanupFailed;
        if (observation.state === 'usable') usableUsages += 1;
      }
      // Native context observation may terminate and drain the scope synchronously.
      if (before !== revision) return Object.freeze({ state: snapshot.state, instances: instances.size,
        boundUsages: 0, usableUsages: 0, unavailableUsages: 0, cleanupFailed, releaseAttempts });
      return Object.freeze({ state: snapshot.state, instances: instances.size, boundUsages,
        usableUsages, unavailableUsages: boundUsages - usableUsages, cleanupFailed, releaseAttempts });
    },
    readLayout: (instance) => requireEntry(instance).layout,
    layout: (instance, input) => {
      requireEdit();
      const entry = requireEntry(instance), before = revision;
      const candidate = captureSpriteLayout(input);
      requireEntry(instance); unchanged(before);
      if (candidate !== null && entry.transform !== null && candidate.unit !== entry.transform.placement.plane.unit) {
        throw new VisualPresentationError('LOCAL_UNIT_MISMATCH');
      }
      const previous = entry.layout;
      if (previous === candidate || (previous !== null && candidate !== null
        && previous.unit === candidate.unit && previous.x === candidate.x && previous.y === candidate.y
        && previous.width === candidate.width && previous.height === candidate.height)) return previous;
      edit!(true, instance);
      entry.layout = candidate; invalidateOrdering();
      return candidate;
    },
    readPolicy: (key) => policyFor(requireLayer(key)),
    policy: (key, input) => {
      requireEdit();
      const capturedKey = requireLayer(key), before = revision;
      const candidate = captureOrderingPolicy(input);
      unchanged(before);
      const previous = policyFor(capturedKey);
      if (sameOrderingPolicy(previous, candidate)) return previous;
      const selected = new Map(policies); selected.set(capturedKey, candidate);
      syncOrdering(undefined, layers, selected); // Validates all members, including hidden ones.
      unchanged(before);
      policies.set(capturedKey, candidate); invalidateOrdering();
      return candidate;
    },
    readDepthKey: (instance) => requireEntry(instance).depthKey,
    depthKey: (instance, input) => {
      requireEdit();
      const entry = requireEntry(instance), before = revision;
      const candidate = captureDepthKey(input);
      requireEntry(instance); unchanged(before);
      const previous = entry.depthKey, policy = policyFor(entry.ordering.layerKey);
      visualDepth(policy, entry.transform, candidate);
      if (previous === candidate || (previous !== null && candidate !== null
        && previous.value === candidate.value && previous.unit === candidate.unit)) return previous;
      if (policy.kind === 'depth-key') {
        syncOrdering([...instances.values()].map(current => current === entry ? { ...entry, depthKey: candidate } : current));
        requireEntry(instance); unchanged(before);
      }
      entry.depthKey = candidate; invalidateOrdering();
      return candidate;
    },
    addLayer: (input) => {
      requireEdit();
      requireActive();
      const before = revision, captured = captureLayer(input);
      unchanged(before);
      if (layers.has(captured.layerKey)) throw new LayerError('DUPLICATE_LAYER');
      if (!Number.isSafeInteger(nextLayerOrdinal)) throw new RangeError('Visual layer insertion ordinal exhausted');
      const result = Object.freeze({ ...captured, insertionOrdinal: nextLayerOrdinal++ });
      layers.set(result.layerKey, result); invalidateOrdering();
      return result;
    },
    updateLayer: (input) => {
      requireEdit();
      requireActive();
      const before = revision, captured = captureLayer(input);
      unchanged(before);
      const previous = layers.get(captured.layerKey);
      if (previous === undefined) throw new LayerError('MISSING_LAYER');
      if (previous.priority === captured.priority && previous.visible === captured.visible) return previous;
      const result = Object.freeze({ ...captured, insertionOrdinal: previous.insertionOrdinal });
      const candidate = new Map(layers); candidate.set(result.layerKey, result);
      syncOrdering([...instances.values()], candidate);
      unchanged(before);
      layers = candidate; invalidateOrdering();
      return result;
    },
    getLayer: (key) => { requireActive(); return layers.get(layerKey(key)); },
    listLayers: () => { requireActive(); return Object.freeze([...layers.values()].sort(compareLayers)); },
    removeLayer: (key) => {
      requireEdit();
      requireActive();
      const captured = layerKey(key);
      if (!layers.has(captured)) throw new LayerError('MISSING_LAYER');
      if (captured === 'default') throw new LayerError('RESERVED_LAYER');
      if ([...instances.values()].some(entry => entry.ordering.layerKey === captured)) throw new LayerError('LAYER_IN_USE');
      layers.delete(captured); policies.delete(captured); invalidateOrdering();
    },
    readOrder: (instance) => requireEntry(instance).ordering,
    order: (instance, input) => {
      requireEdit();
      const entry = requireEntry(instance), before = revision;
      const candidate = captureOrder(input);
      requireEntry(instance); unchanged(before);
      if (!layers.has(candidate.layerKey)) throw new LayerError('MISSING_LAYER');
      if (entry.ordering.layerKey === candidate.layerKey && entry.ordering.order === candidate.order) return entry.ordering;
      syncOrdering([...instances.values()].map(current => current === entry ? { ...entry, ordering: candidate } : current));
      requireEntry(instance); unchanged(before);
      entry.ordering = candidate; invalidateOrdering();
      return candidate;
    },
    candidates: () => {
      requireActive();
      const suspended = readSuspended!(); requireActive();
      return Object.freeze((suspended ? [] : ordered()).filter(entry => entry.visible && layers.get(entry.ordering.layerKey)!.visible)
        .map(entry => {
          const layer = layers.get(entry.ordering.layerKey)!;
          return Object.freeze({ instance: entry.handle, ...entry.ordering, layerPriority: layer.priority,
            layerInsertionOrdinal: layer.insertionOrdinal, insertionOrdinal: entry.handle.insertionOrdinal });
        }));
    },
    add: (input): RenderVisualInstance => {
      requireEdit();
      requireActive();
      const before = revision;
      const captured = captureInstance(input);
      // Reflection on untrusted input may reenter/dispose; recheck before mutation.
      unchanged(before);
      if (instances.has(captured.visualInstanceId)) throw new InstanceError('DUPLICATE_ID');
      if (!layers.has(captured.ordering.layerKey)) throw new LayerError('MISSING_LAYER');
      visualDepth(policyFor(captured.ordering.layerKey), null, null);
      if (!Number.isSafeInteger(nextOrdinal)) throw new RangeError('Visual instance insertion ordinal exhausted');
      const observation: RenderVisualInstanceSnapshot = Object.freeze({ visualInstanceId: captured.visualInstanceId,
        correlation: captured.correlation, sceneId: id, sessionId,
        insertionOrdinal: nextOrdinal });
      const instance = Object.freeze({ ...observation }) as RenderVisualInstance;
      instances.set(instance.visualInstanceId, { handle: instance, snapshot: observation,
        binding: undefined, transform: null, visible: true, ordering: captured.ordering, depthKey: null, layout: null });
      invalidateOrdering();
      issued.add(instance);
      nextOrdinal += 1;
      return instance;
    },
    get: (key): RenderVisualInstance | undefined => {
      requireActive();
      return instances.get(instanceToken(key, 'INVALID_ID'))?.handle;
    },
    list: (): readonly RenderVisualInstance[] => {
      requireActive();
      return Object.freeze([...instances.values()].map(entry => entry.handle));
    },
    remove: (instance): boolean => {
      requireEdit();
      requireActive();
      if (!issued.has(instance)) throw new InstanceError('FOREIGN_INSTANCE');
      const entry = instances.get(instance.visualInstanceId);
      if (entry?.handle !== instance) return false;
      instances.delete(instance.visualInstanceId);
      invalidateOrdering();
      releaseEntry(entry);
      return true;
    },
    read: (instance): RenderVisualInstanceSnapshot => requireEntry(instance).snapshot,
    readVisibility,
    visibility: (instance, visible) => {
      requireEdit();
      const entry = requireEntry(instance);
      if (typeof visible !== 'boolean') throw new InstanceError('INVALID_DESCRIPTOR');
      if (entry.visible === visible) return readVisibility(instance);
      writeVisibility!(instance, visible && layers.get(entry.ordering.layerKey)!.visible);
      requireEntry(instance); // Native loss/failure must not publish a successful flag.
      entry.visible = visible;
      invalidateOrdering();
      return readVisibility(instance);
    },
    readTransform: (instance) => requireEntry(instance).transform,
    transform: (instance, input) => {
      requireEdit();
      const entry = requireEntry(instance), beforeRevision = revision, before = entry.transform, beforeState = entry.snapshot,
        beforeBinding = entry.binding, beforeVisible = entry.visible;
      const candidate = input === null ? null : captureVisualInstanceTransform(input);
      const current = requireEntry(instance);
      if (revision !== beforeRevision) throw new InstanceError('INSTANCE_CHANGED');
      if (current !== entry || current.transform !== before || current.snapshot !== beforeState
        || current.binding !== beforeBinding || current.visible !== beforeVisible) throw new InstanceError('INSTANCE_CHANGED');
      if (candidate === null && before === null) return null;
      visualDepth(policyFor(entry.ordering.layerKey), candidate, entry.depthKey);
      if (candidate !== null && entry.layout !== null && entry.layout.unit !== candidate.placement.plane.unit) {
        throw new VisualPresentationError('LOCAL_UNIT_MISMATCH');
      }
      // Recompute all native ranks before placement: intervening metadata-only
      // adds/removals need no node writes, and cannot make ranks collide here.
      const proposed = [...instances.values()].map(value => value === entry ? { ...entry, transform: candidate } : value);
      const sorted = candidate === null ? undefined : syncOrdering(proposed);
      const rank = sorted?.findIndex(value => value.handle === instance) ?? 0;
      writeTransform!(instance, candidate?.localToClip ?? null,
        entry.visible && layers.get(entry.ordering.layerKey)!.visible, rank);
      requireEntry(instance); // Native loss/failure must not publish a successful transform.
      entry.transform = candidate;
      invalidateOrdering();
      return candidate;
    },
    binding: (instance) => {
      const binding = requireEntry(instance).binding;
      const observation = binding?.read() ?? null;
      requireEntry(instance); // Observation can terminate the canonical session.
      return observation;
    },
    bind: (instance, input) => {
      requireEdit();
      const entry = requireEntry(instance), before = entry.binding, beforeState = entry.snapshot;
      const candidate = input === null ? undefined : prepare!(input, noteCleanupFailure);
      try {
        const current = requireEntry(instance);
        if (current !== entry || current.binding !== before || current.snapshot !== beforeState) {
          throw new InstanceError('INSTANCE_CHANGED');
        }
      } catch (error) { releaseBinding(candidate); throw error; }
      try { edit!(true, instance); } catch (error) { releaseBinding(candidate); throw error; }
      entry.binding = candidate; // Commit before old cleanup; cleanup failure does not roll back.
      releaseBinding(before);
      const observation = candidate?.read() ?? null;
      requireEntry(instance);
      return observation;
    },
    update: (instance, properties): RenderVisualInstanceSnapshot => {
      requireEdit();
      const before = requireEntry(instance).snapshot;
      const data = dataRecord(properties, ['correlation']);
      const correlation = captureCorrelation(data.correlation);
      // Input reflection may mutate/remove/terminate via host Proxy traps.
      const entry = requireEntry(instance);
      if (entry.snapshot !== before) throw new InstanceError('INSTANCE_CHANGED');
      const previous = before.correlation;
      if (previous === correlation || (previous !== null && correlation !== null
        && previous.projectId === correlation.projectId && previous.sceneId === correlation.sceneId
        && previous.objectId === correlation.objectId)) return before;
      const candidate: RenderVisualInstanceSnapshot = Object.freeze({ ...before, correlation });
      edit!(true);
      entry.snapshot = candidate; // Single commit; no ID map mutation/reorder/ordinal increment.
      return candidate;
    },
  });
  const captureFrame = (): readonly VisualFrameItem[] => {
    requireActive();
    const before = revision;
    const items: VisualFrameItem[] = [];
    for (const [renderOrder, entry] of ordered().entries()) {
      if (!entry.visible || !layers.get(entry.ordering.layerKey)!.visible || entry.transform === null
        || entry.layout === null || entry.binding === undefined) continue;
      const resource = entry.binding.draw();
      unchanged(before);
      items.push(Object.freeze({ instance: entry.handle, renderOrder, transform: entry.transform,
        layout: entry.layout, ...resource }));
    }
    unchanged(before);
    return Object.freeze(items);
  };
  return { handle, end, captureFrame, cleanupUncertain: () => cleanupFailed, attach: (callback: () => void, factory: (input: RenderVisualResourceBindingInput, cleanupFailure: () => void) => OwnedBinding,
    transformWriter: (instance: object, matrix: AffineTransform2D | null, visible: boolean, renderOrder: number) => void,
    visibilityWriter: (instance: object, visible: boolean) => void,
    orderingWriter: (writes: readonly VisualPresentationWrite[]) => void, suspensionReader: () => boolean,
    editWriter: (invalidate: boolean, dropDrawable?: object) => void): void => {
    detach = callback; prepare = factory; writeTransform = transformWriter;
    writeVisibility = visibilityWriter; writeOrdering = orderingWriter; readSuspended = suspensionReader; edit = editWriter;
  } };
}

/**
 * Create an initially empty, independent visual scope without graphics acquisition, native
 * scene allocation, IO or submission. Accepts only a live canonical session from
 * this package instance, including a suspended one. active is logical ownership,
 * not continuous GPU liveness. Binding-only/foreign/structural sessions reject
 * with TypeError; ended canonical sessions retain SESSION_UNAVAILABLE texture
 * diagnostics from the existing graphics admission hook.
 *
 * A second active scope on the same session rejects with TypeError. Dispose the
 * first explicitly before creating a fresh identity; no switch/transfer/upsert.
 * The canonical session's existing terminal broadcast closes the scope before
 * backend teardown, including loss/failure and cleanup-uncertain disposal.
 */
export function createRenderVisualScene(session: RenderFrameSession): RenderVisualScene {
  const sessionId = requireTextureSession(session);
  checkVisualEdit(session);
  if (occupiedSessions.has(session)) throw new VisualPresentationError('SCENE_IN_USE');
  const scope = createScope(sessionId);
  const unsubscribe = onTextureSessionEnd(session, () => { scope.end('session-ended'); });
  const detachFrame = attachVisualFrameSource(session, scope.captureFrame);
  scope.attach(() => {
    detachFrame();
    // Uncertain cleanup never grants a new visual scope on this session.
    if (!scope.cleanupUncertain()) occupiedSessions.delete(session);
    unsubscribe();
  }, (input, cleanupFailure) => prepareBinding(session, input, cleanupFailure),
  (instance, matrix, visible, renderOrder) => writeVisualTransform(session, instance, matrix, visible, renderOrder),
  (instance, visible) => writeVisualVisibility(session, instance, visible),
  writes => writeVisualOrdering(session, writes),
  () => readVisualViewportSuspension(session),
  (invalidate, instance) => checkVisualEdit(session, invalidate, instance));
  occupiedSessions.add(session);
  registerCameraScene(scope.handle, session);
  return scope.handle;
}
