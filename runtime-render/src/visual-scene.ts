import type { RenderFrameSession } from './frame-session.js';
import { requireTextureSession, onTextureSessionEnd } from './render-texture.js';

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

interface MembershipControl {
  readonly add: (input: RenderVisualInstanceInput) => RenderVisualInstance;
  readonly get: (id: string) => RenderVisualInstance | undefined;
  readonly list: () => readonly RenderVisualInstance[];
  readonly remove: (instance: RenderVisualInstance) => boolean;
}

// Weak canonical capability dispatch only: no enumerable/global scene registry.
const memberships = new WeakMap<RenderVisualScene, MembershipControl>();

function membership(scene: RenderVisualScene): MembershipControl {
  const control = memberships.get(scene);
  if (control === undefined) throw new TypeError('Expected a canonical visual scene');
  return control;
}

function dataRecord(value: unknown, required: readonly string[], optional: readonly string[] = []): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new TypeError('Visual instance input must be a plain data record');
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) throw new TypeError('Expected a plain data record');
  const keys = Reflect.ownKeys(value);
  if (required.some(key => !keys.includes(key))
    || keys.some(key => typeof key !== 'string' || (!required.includes(key) && !optional.includes(key)))) {
    throw new TypeError('Unexpected or missing visual instance fields');
  }
  const captured: Record<string, unknown> = Object.create(null) as Record<string, unknown>;
  for (const key of keys) {
    const field = Object.getOwnPropertyDescriptor(value, key);
    if (!field?.enumerable || !('value' in field)) throw new TypeError('Expected enumerable data fields');
    captured[key as string] = field.value;
  }
  return captured;
}

function instanceToken(value: unknown): string {
  if (typeof value !== 'string' || value.length === 0 || /\s/u.test(value)) {
    throw new TypeError('Visual identity fields must be nonempty whitespace-free strings');
  }
  return value;
}

function captureInstance(input: RenderVisualInstanceInput): {
  readonly visualInstanceId: string; readonly correlation: RenderVisualCorrelation | null;
} {
  const data = dataRecord(input, ['visualInstanceId'], ['correlation']);
  const visualInstanceId = instanceToken(data.visualInstanceId);
  let correlation: RenderVisualCorrelation | null = null;
  if (Object.hasOwn(data, 'correlation') && data.correlation !== null) {
    const fields = dataRecord(data.correlation, ['projectId', 'sceneId', 'objectId']);
    correlation = Object.freeze({ projectId: instanceToken(fields.projectId),
      sceneId: instanceToken(fields.sceneId), objectId: instanceToken(fields.objectId) });
  }
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

// Separate environment: retained terminal handles cannot keep the factory's session
// parameter alive after the detach callback has been dropped.
function createScope(sessionId: symbol) {
  const id = Symbol('visual-scene');
  let snapshot: RenderVisualSceneSnapshot = Object.freeze({ id, sessionId, state: 'active' });
  let detach: (() => void) | undefined;
  const instances = new Map<string, RenderVisualInstance>();
  const issued = new WeakSet<RenderVisualInstance>();
  let nextOrdinal = 0;
  const requireActive = (): void => {
    if (snapshot.state === 'disposed') throw new TypeError('Visual scene is disposed');
  };

  const end = (reason: RenderVisualSceneDisposal['reason']): RenderVisualSceneDisposal => {
    if (snapshot.state === 'disposed') return snapshot;
    snapshot = Object.freeze({ id, sessionId, state: 'disposed', reason });
    instances.clear(); // No resources/native objects are owned by SR03/SR04 records.
    const release = detach;
    detach = undefined; // Terminal before unlinking; no retained session/subscription.
    release?.();
    return snapshot;
  };
  const handle: RenderVisualScene = Object.freeze({
    getSnapshot: (): RenderVisualSceneSnapshot => snapshot,
    clear: (): RenderVisualSceneSnapshot => {
      requireActive();
      instances.clear(); // Keep ordinal/provenance: old handles cannot target re-adds.
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
      if (instances.has(captured.visualInstanceId)) throw new TypeError('Duplicate live visualInstanceId');
      if (!Number.isSafeInteger(nextOrdinal)) throw new RangeError('Visual instance insertion ordinal exhausted');
      const instance = Object.freeze({ ...captured, sceneId: id, sessionId,
        insertionOrdinal: nextOrdinal }) as RenderVisualInstance;
      instances.set(instance.visualInstanceId, instance);
      issued.add(instance);
      nextOrdinal += 1;
      return instance;
    },
    get: (key): RenderVisualInstance | undefined => {
      requireActive();
      return instances.get(instanceToken(key));
    },
    list: (): readonly RenderVisualInstance[] => {
      requireActive();
      return Object.freeze([...instances.values()]);
    },
    remove: (instance): boolean => {
      requireActive();
      if (!issued.has(instance)) throw new TypeError('Expected an instance issued by this visual scene');
      if (instances.get(instance.visualInstanceId) !== instance) return false;
      return instances.delete(instance.visualInstanceId);
    },
  });
  return { handle, end, attach: (callback: () => void): void => { detach = callback; } };
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
  });
  occupiedSessions.add(session);
  return scope.handle;
}
