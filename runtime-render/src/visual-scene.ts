import type { RenderFrameSession } from './frame-session.js';
import { requireTextureSession, onTextureSessionEnd, getRenderTextureSnapshot } from './render-texture.js';
import { retainVisualResourceLease, type VisualResourceLease } from './visual-resource-cache.js';
import { resolveAtlasFrameGeometry, createAtlasTextureView, type AtlasPagePixels,
  type AtlasFrameGeometry, type AtlasFrameGeometryResult } from './atlas-geometry.js';
import type { VisualFrameReference } from './atlas-frame.js';
import type { AtlasMetadata } from './atlas-metadata.js';

export interface RenderVisualFrameBinding {
  readonly reference: VisualFrameReference;
  readonly atlas: AtlasMetadata | null;
  readonly expectedRevision: symbol;
  /** Explicit host attestation of page identity/layout, per Phase 7. */
  readonly pixels: AtlasPagePixels;
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
    read: () => {
      const current = lease?.getSnapshot();
      snapshot = Object.freeze({ ...snapshot, state: current?.state === 'usable' ? 'usable' : 'unavailable',
        cleanupFailed: current?.cleanupFailed ?? snapshot.cleanupFailed });
      return snapshot;
    },
    release: () => {
      const previous = lease;
      lease = undefined; // Unlink before native cleanup; release exactly once even on failure.
      previous?.release();
    },
  };
}

function prepareBinding(session: RenderFrameSession, input: RenderVisualResourceBindingInput): OwnedBinding {
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
    retained.release(); // No previous binding touched; cleanup exception may propagate.
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

interface MembershipControl {
  readonly add: (input: RenderVisualInstanceInput) => RenderVisualInstance;
  readonly get: (id: string) => RenderVisualInstance | undefined;
  readonly list: () => readonly RenderVisualInstance[];
  readonly remove: (instance: RenderVisualInstance) => boolean;
  readonly read: (instance: RenderVisualInstance) => RenderVisualInstanceSnapshot;
  readonly update: (instance: RenderVisualInstance, properties: RenderVisualInstanceProperties) => RenderVisualInstanceSnapshot;
  readonly bind: (instance: RenderVisualInstance, input: RenderVisualResourceBindingInput | null) => RenderVisualResourceBindingSnapshot | null;
  readonly binding: (instance: RenderVisualInstance) => RenderVisualResourceBindingSnapshot | null;
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
} {
  const data = dataRecord(input, ['visualInstanceId'], ['correlation']);
  const visualInstanceId = instanceToken(data.visualInstanceId);
  const correlation = Object.hasOwn(data, 'correlation') ? captureCorrelation(data.correlation) : null;
  return { visualInstanceId, correlation };
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

// Separate environment: retained terminal handles cannot keep the factory's session
// parameter alive after the detach callback has been dropped.
function createScope(sessionId: symbol) {
  const id = Symbol('visual-scene');
  let snapshot: RenderVisualSceneSnapshot = Object.freeze({ id, sessionId, state: 'active' });
  let detach: (() => void) | undefined;
  let prepare: ((input: RenderVisualResourceBindingInput) => OwnedBinding) | undefined;
  const instances = new Map<string, { readonly handle: RenderVisualInstance; snapshot: RenderVisualInstanceSnapshot;
    binding: OwnedBinding | undefined }>();
  const issued = new WeakSet<RenderVisualInstance>();
  let nextOrdinal = 0;
  const requireActive = (): void => {
    if (snapshot.state === 'disposed') {
      throw new InstanceError(snapshot.reason === 'session-ended' ? 'SESSION_UNAVAILABLE' : 'SCENE_DISPOSED');
    }
  };
  const requireEntry = (instance: RenderVisualInstance) => {
    requireActive();
    if (!issued.has(instance)) throw new InstanceError('FOREIGN_INSTANCE');
    const entry = instances.get(instance.visualInstanceId);
    if (entry?.handle !== instance) throw new InstanceError('MISSING_INSTANCE');
    return entry;
  };

  const drain = (): void => {
    const previous = [...instances.values()];
    instances.clear();
    let failure: { error: unknown } | undefined;
    for (const entry of previous) {
      const binding = entry.binding;
      entry.binding = undefined;
      try { binding?.release(); } catch (error) { failure ??= { error }; }
    }
    if (failure !== undefined) throw failure.error;
  };
  const end = (reason: RenderVisualSceneDisposal['reason']): RenderVisualSceneDisposal => {
    if (snapshot.state === 'disposed') return snapshot;
    snapshot = Object.freeze({ id, sessionId, state: 'disposed', reason });
    prepare = undefined;
    const release = detach;
    detach = undefined; // Terminal before unlinking; no retained session/subscription.
    try { drain(); } finally { release?.(); }
    return snapshot;
  };
  const handle: RenderVisualScene = Object.freeze({
    getSnapshot: (): RenderVisualSceneSnapshot => snapshot,
    clear: (): RenderVisualSceneSnapshot => {
      requireActive();
      drain(); // Keep ordinal/provenance: old handles cannot target re-adds.
      return snapshot;
    },
    dispose: (): RenderVisualSceneDisposal => end('scene-disposed'),
  });
  memberships.set(handle, {
    add: (input): RenderVisualInstance => {
      requireActive();
      const captured = captureInstance(input);
      // Reflection on untrusted input may reenter/dispose; recheck before mutation.
      requireActive();
      if (instances.has(captured.visualInstanceId)) throw new InstanceError('DUPLICATE_ID');
      if (!Number.isSafeInteger(nextOrdinal)) throw new RangeError('Visual instance insertion ordinal exhausted');
      const observation: RenderVisualInstanceSnapshot = Object.freeze({ ...captured, sceneId: id, sessionId,
        insertionOrdinal: nextOrdinal });
      const instance = Object.freeze({ ...observation }) as RenderVisualInstance;
      instances.set(instance.visualInstanceId, { handle: instance, snapshot: observation, binding: undefined });
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
      requireActive();
      if (!issued.has(instance)) throw new InstanceError('FOREIGN_INSTANCE');
      const entry = instances.get(instance.visualInstanceId);
      if (entry?.handle !== instance) return false;
      instances.delete(instance.visualInstanceId);
      const binding = entry.binding;
      entry.binding = undefined;
      binding?.release();
      return true;
    },
    read: (instance): RenderVisualInstanceSnapshot => requireEntry(instance).snapshot,
    binding: (instance) => {
      const binding = requireEntry(instance).binding;
      const observation = binding?.read() ?? null;
      requireEntry(instance); // Observation can terminate the canonical session.
      return observation;
    },
    bind: (instance, input) => {
      const entry = requireEntry(instance), before = entry.binding, beforeState = entry.snapshot;
      const candidate = input === null ? undefined : prepare!(input);
      try {
        const current = requireEntry(instance);
        if (current !== entry || current.binding !== before || current.snapshot !== beforeState) {
          throw new InstanceError('INSTANCE_CHANGED');
        }
      } catch (error) { candidate?.release(); throw error; }
      entry.binding = candidate; // Commit before old cleanup; cleanup failure does not roll back.
      before?.release();
      const observation = candidate?.read() ?? null;
      requireEntry(instance);
      return observation;
    },
    update: (instance, properties): RenderVisualInstanceSnapshot => {
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
      entry.snapshot = candidate; // Single commit; no ID map mutation/reorder/ordinal increment.
      return candidate;
    },
  });
  return { handle, end, attach: (callback: () => void, factory: (input: RenderVisualResourceBindingInput) => OwnedBinding): void => {
    detach = callback; prepare = factory;
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
  if (occupiedSessions.has(session)) throw new TypeError('Graphics session already has an active visual scene');
  const scope = createScope(sessionId);
  const unsubscribe = onTextureSessionEnd(session, () => { scope.end('session-ended'); });
  scope.attach(() => {
    occupiedSessions.delete(session);
    unsubscribe();
  }, input => prepareBinding(session, input));
  occupiedSessions.add(session);
  return scope.handle;
}
