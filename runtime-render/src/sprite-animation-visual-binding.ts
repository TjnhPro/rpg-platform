import type { RenderFrameSession } from './frame-session.js';
import { requireTextureSession, onTextureSessionEnd } from './render-texture.js';
import { resolveAtlasFrameGeometry, type AtlasPagePixels, type AtlasFrameGeometryResult } from './atlas-geometry.js';
import type { AtlasMetadata } from './atlas-metadata.js';
import type { VisualResourceLease } from './visual-resource-cache.js';
import { resolveSpriteFrameAlignment, type SpriteFrameAlignmentData, type SpriteFrameAlignmentResult } from './sprite-frame-alignment.js';
import { getSpriteAnimationPlaybackSnapshot, getSpriteSequencePlaybackSnapshot, type SpriteSequencePlayback,
  type SpriteSequencePlaybackSnapshot, type SpriteAnimationPlayback, type SpriteAnimationPlaybackSnapshot } from './sprite-animation-playback.js';
import { readVisualInstanceFrameState, commitVisualInstanceFrame, onVisualInstanceEnd, bindRenderVisualInstanceResource,
  getRenderVisualInstanceResource, getRenderVisualBindingFailure, getRenderVisualInstanceFailure,
  type RenderVisualScene, type RenderVisualInstance, type RenderVisualResourceBindingSnapshot } from './visual-scene.js';
import type { PlanarPoint2D } from './planar-affine.js';

/** Borrowed existing page lease and exact metadata; never an acquisition request. */
export interface SpriteAnimationVisualFrameInput {
  readonly resource: VisualResourceLease;
  readonly expectedSourceRevision: string;
  readonly atlas: AtlasMetadata | null;
  readonly expectedRevision: symbol;
  readonly pixels: AtlasPagePixels;
  readonly planeUnitsPerPixel: PlanarPoint2D;
  readonly authored: SpriteFrameAlignmentData | null;
}

export type SpriteAnimationVisualFrameResult =
  | { readonly status: 'bound'; readonly playback: SpriteAnimationPlaybackSnapshot;
    readonly resource: RenderVisualResourceBindingSnapshot;
    readonly alignment: Extract<SpriteFrameAlignmentResult, { status: 'resolved' }> }
  | { readonly status: 'rejected'; readonly code:
    Extract<AtlasFrameGeometryResult, { status: 'rejected' }>['code']
    | Extract<SpriteFrameAlignmentResult, { status: 'rejected' }>['code']
    | 'FRAME_NOT_READY' | 'PLAYBACK_DISPOSED' | 'BINDING_DISPOSED'
    | 'INCOMPATIBLE_TRANSFORM' | 'GROUND_ANCHOR_MISMATCH' };

/** One borrowed playback and one existing instance. No automatic subscriptions to
 * playback edits, timer, acquisition or draw. sync always admits current inputs,
 * including repeated selections; success invalidates existing Phase6 demand.
 */
export interface SpriteAnimationVisualBinding {
  readonly sync: (input: SpriteAnimationVisualFrameInput) => SpriteAnimationVisualFrameResult;
  /** Validate then replace borrowed playback; last committed visual holds until sync. */
  readonly replacePlayback: (playback: SpriteAnimationPlayback) => void;
  /** Terminal/idempotent. Clear only this binding's still-owned Phase8 usage.
   * Keep placement/last transform/layout, never dispose borrowed playback/lease/session. */
  readonly unbind: () => void;
}

export type SpriteSequenceVisualFrameResult =
  | { readonly status: 'bound'; readonly playback: SpriteSequencePlaybackSnapshot;
    readonly resource: RenderVisualResourceBindingSnapshot;
    readonly alignment: Extract<SpriteFrameAlignmentResult, { status: 'resolved' }> }
  | Extract<SpriteAnimationVisualFrameResult, { status: 'rejected' }>;

/** Same admission/ownership lifecycle as directional binding, without direction selection. */
export interface SpriteSequenceVisualBinding {
  readonly sync: (input: SpriteAnimationVisualFrameInput) => SpriteSequenceVisualFrameResult;
  readonly replacePlayback: (playback: SpriteSequencePlayback) => void;
  readonly unbind: () => void;
}

type Playback = SpriteAnimationPlayback | SpriteSequencePlayback;
type Snapshot = SpriteAnimationPlaybackSnapshot | SpriteSequencePlaybackSnapshot;
type Rejected = Extract<SpriteAnimationVisualFrameResult, { status: 'rejected' }>;
type BindingResult<S extends Snapshot> =
  | { readonly status: 'bound'; readonly playback: S;
    readonly resource: RenderVisualResourceBindingSnapshot;
    readonly alignment: Extract<SpriteFrameAlignmentResult, { status: 'resolved' }> }
  | Rejected;
interface Binding<P extends Playback, S extends Snapshot> {
  readonly sync: (input: SpriteAnimationVisualFrameInput) => BindingResult<S>;
  readonly replacePlayback: (playback: P) => void;
  readonly unbind: () => void;
}

// Weak occupancy guards only, no active list, ID lookup or animation/content registry.
const occupiedPlaybacks = new WeakSet<Playback>();
const occupiedInstances = new WeakSet<RenderVisualInstance>();

function capture(input: unknown, keys: readonly string[]): Record<string, unknown> {
  if (typeof input !== 'object' || input === null || Array.isArray(input)
    || (Object.getPrototypeOf(input) !== Object.prototype && Object.getPrototypeOf(input) !== null)
    || Reflect.ownKeys(input).length !== keys.length) throw new TypeError('Closed frame-binding data required');
  const result: Record<string, unknown> = {};
  for (const key of keys) {
    const field = Object.getOwnPropertyDescriptor(input, key);
    if (!field?.enumerable || !('value' in field)) throw new TypeError('Own frame-binding data required');
    result[key] = field.value;
  }
  return result;
}

interface Context<P extends Playback> {
  readonly scene: RenderVisualScene;
  readonly instance: RenderVisualInstance;
  playback: P;
  lastFrame: RenderVisualResourceBindingSnapshot | undefined;
  unsubscribe: () => void;
}

function lifecycle<P extends Playback, S extends Snapshot>(readPlayback: (playback: P) => S) {
  let context: Context<P> | undefined, busy = false;
  const close = (): void => {
    const previous = context; context = undefined;
    if (previous) {
      occupiedPlaybacks.delete(previous.playback); occupiedInstances.delete(previous.instance);
      previous.unsubscribe();
    }
  };
  const guard = (): Context<P> => {
    if (busy) throw new TypeError('Animation visual binding operation already in progress');
    if (!context) throw new TypeError('Animation visual binding is closed');
    return context;
  };
  type Code = Extract<SpriteAnimationVisualFrameResult, { status: 'rejected' }>['code'];
  const reject = (code: Code): BindingResult<S> => Object.freeze({ status: 'rejected', code });
  const handle: Binding<P, S> = Object.freeze({
    sync: (input: SpriteAnimationVisualFrameInput): BindingResult<S> => {
      if (!context) return reject('BINDING_DISPOSED');
      const active = guard(); busy = true;
      try {
        const before = readVisualInstanceFrameState(active.scene, active.instance);
        const playback = readPlayback(active.playback);
        if (playback.state === 'disposed') return reject('PLAYBACK_DISPOSED');
        const transform = before.transform;
        if (transform === null || transform.local.translation.x !== 0 || transform.local.translation.y !== 0
          || transform.local.rotationRadians !== 0 || transform.local.scale.x !== 1 || transform.local.scale.y !== 1) {
          return reject('INCOMPATIBLE_TRANSFORM');
        }
        const data = capture(input, ['resource', 'expectedSourceRevision', 'atlas', 'expectedRevision', 'pixels', 'planeUnitsPerPixel', 'authored']);
        const pixels = capture(data.pixels, ['imageSourceId', 'unit', 'width', 'height', 'layout']) as unknown as AtlasPagePixels;
        const ratios = capture(data.planeUnitsPerPixel, ['x', 'y']) as unknown as PlanarPoint2D;
        const geometry = resolveAtlasFrameGeometry(playback.frame, data.atlas as AtlasMetadata | null,
          data.expectedRevision as symbol, pixels);
        if (geometry.status !== 'resolved') return reject(geometry.code);
        const alignment = resolveSpriteFrameAlignment({ atlas: data.atlas as AtlasMetadata | null,
          expectedRevision: data.expectedRevision as symbol, geometry: geometry.geometry,
          placement: transform.placement, orientation: transform.orientation,
          planeUnitsPerPixel: ratios, authored: data.authored as SpriteFrameAlignmentData | null });
        if (alignment.status !== 'resolved') return reject(alignment.code);
        // Preserve the existing ground offset as well as authored/world placement.
        if (alignment.anchor.localOffset.x !== transform.anchor.localOffset.x
          || alignment.anchor.localOffset.y !== transform.anchor.localOffset.y) return reject('GROUND_ANCHOR_MISMATCH');
        const resource = commitVisualInstanceFrame(active.scene, active.instance, {
          before, binding: { resource: data.resource as VisualResourceLease,
            expectedSourceRevision: data.expectedSourceRevision as string,
            frame: { reference: playback.frame, atlas: data.atlas as AtlasMetadata | null,
              expectedRevision: data.expectedRevision as symbol, pixels } },
          transform: { placement: transform.placement, local: transform.local, anchor: alignment.anchor,
            orientation: transform.orientation, projection: transform.projection },
          layout: { unit: alignment.plane.unit, x: 0, y: 0,
            width: geometry.geometry.rectangle.width * ratios.x, height: geometry.geometry.rectangle.height * ratios.y },
          validate: () => {
            if (context !== active || readPlayback(active.playback) !== playback) {
              throw new TypeError('Playback changed during frame admission');
            }
          },
          committed: (accepted) => { active.lastFrame = accepted; },
        });
        active.lastFrame = resource;
        return Object.freeze({ status: 'bound', playback, resource, alignment });
      } catch (error) {
        const failure = getRenderVisualBindingFailure(error);
        if (failure?.code === 'RESOURCE_NOT_USABLE') return reject('FRAME_NOT_READY');
        // Other Phase8/6 failures keep their canonical branded diagnostics.
        throw error;
      } finally { busy = false; }
    },
    replacePlayback: (playback: P): void => {
      const active = guard(); busy = true;
      try {
        readVisualInstanceFrameState(active.scene, active.instance);
        const next = readPlayback(playback);
        if (next.state === 'disposed') throw new TypeError('Cannot bind disposed playback');
        if (playback === active.playback) return;
        if (occupiedPlaybacks.has(playback)) throw new TypeError('Playback already bound to an instance');
        occupiedPlaybacks.add(playback); occupiedPlaybacks.delete(active.playback); active.playback = playback;
      } finally { busy = false; }
    },
    unbind: (): void => {
      if (!context) return;
      const active = guard(); busy = true;
      try {
        const current = getRenderVisualInstanceResource(active.scene, active.instance);
        if (active.lastFrame && current?.frame === active.lastFrame.frame && current.resourceId === active.lastFrame.resourceId) {
          bindRenderVisualInstanceResource(active.scene, active.instance, null);
        }
      } catch (error) {
        const code = getRenderVisualInstanceFailure(error)?.code;
        if (code !== 'SCENE_DISPOSED' && code !== 'SESSION_UNAVAILABLE' && code !== 'MISSING_INSTANCE') throw error;
      } finally { close(); busy = false; }
    },
  });
  return { handle, close, initialize: (initial: Context<P>): void => { context = initial; } };
}

/** Claim compatible live membership without changing its committed presentation.
 * Resources are supplied to sync; all are borrowed, Phase8 retains its own right.
 * Session termination closes occupancy; stale resources are never migrated.
 */
export function createSpriteAnimationVisualBinding(session: RenderFrameSession, scene: RenderVisualScene,
  instance: RenderVisualInstance, playback: SpriteAnimationPlayback): SpriteAnimationVisualBinding {
  return createBinding(session, scene, instance, playback, getSpriteAnimationPlaybackSnapshot);
}

export function createSpriteSequenceVisualBinding(session: RenderFrameSession, scene: RenderVisualScene,
  instance: RenderVisualInstance, playback: SpriteSequencePlayback): SpriteSequenceVisualBinding {
  return createBinding(session, scene, instance, playback, getSpriteSequencePlaybackSnapshot);
}

function createBinding<P extends Playback, S extends Snapshot>(session: RenderFrameSession, scene: RenderVisualScene,
  instance: RenderVisualInstance, playback: P, readPlayback: (playback: P) => S): Binding<P, S> {
  const sessionId = requireTextureSession(session);
  readVisualInstanceFrameState(scene, instance);
  if (instance.sessionId !== sessionId) throw new TypeError('Animation binding session mismatch');
  if (readPlayback(playback).state === 'disposed') throw new TypeError('Cannot bind disposed playback');
  if (occupiedPlaybacks.has(playback) || occupiedInstances.has(instance)) throw new TypeError('Playback or instance already bound');
  const scope = lifecycle(readPlayback);
  const unsubscribeSession = onTextureSessionEnd(session, scope.close);
  const unsubscribeInstance = onVisualInstanceEnd(scene, instance, scope.close);
  scope.initialize({ scene, instance, playback,
    unsubscribe: () => { unsubscribeSession(); unsubscribeInstance(); }, lastFrame: undefined });
  occupiedPlaybacks.add(playback); occupiedInstances.add(instance);
  return scope.handle;
}
