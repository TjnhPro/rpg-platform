import { getRenderVisualInstanceFailure as instanceFailure, getRenderVisualBindingFailure as bindingFailure,
  getRenderVisualLayerFailure as layerFailure, type RenderVisualInstanceFailure,
  type RenderVisualBindingFailure, type RenderVisualLayerFailure } from './visual-scene.js';
import { getRenderVisualDepthFailure as depthFailure, type RenderVisualDepthFailure } from './visual-depth.js';
import { getRenderFrameFailure as frameFailure, type RenderFrameFailure } from './frame-failure.js';
import { getRenderTextureFailure as textureFailure, type RenderTextureFailure } from './render-texture.js';
import { getVisualResourceCacheFailure as cacheFailure, type VisualResourceCacheFailure } from './visual-resource-cache.js';
import { VisualPresentationError } from './visual-presentation-error.js';
export { getRenderCameraViewportSnapshot, type RenderCameraViewportSnapshot } from './camera-viewport.js';
export { projectRenderCameraPoint, type RenderCameraProjectionResult } from './camera-projection.js';
export { viewportToRenderCameraSelectedPlane, screenToRenderCameraSelectedPlane,
  type RenderCameraSelectedPlaneInput, type RenderCameraSelectedPlaneResult } from './camera-inverse.js';
export { transitionRenderCameraWithinBounds, type RenderCameraBoundsPolicy,
  type RenderCameraBoundsMovement, type RenderCameraBoundsTransitionInput,
  type RenderCameraBoundsTransitionResult } from './camera-bounds.js';
export { createRenderCameraGroundConfiguration, projectRenderCameraGroundPoint,
  viewportToRenderCameraGround, screenToRenderCameraGround,
  type RenderCameraGroundConfiguration, type RenderCameraGroundPoint,
  type RenderCameraGroundProjectionResult, type RenderCameraGroundInverseInput,
  type RenderCameraGroundInverseResult } from './camera-ground.js';
export { getRenderVisualSceneDiagnostics, type RenderVisualSceneDiagnostics } from './visual-scene.js';

/** Safe error data only. null cleanup means unknown/not reported by that domain. */
export type RenderVisualDiagnostic =
  | { readonly domain: 'instance'; readonly code: RenderVisualInstanceFailure['code']; readonly cleanupFailed: null }
  | { readonly domain: 'binding'; readonly code: RenderVisualBindingFailure['code']; readonly cleanupFailed: null }
  | { readonly domain: 'layer'; readonly code: RenderVisualLayerFailure['code']; readonly cleanupFailed: null }
  | { readonly domain: 'depth'; readonly code: RenderVisualDepthFailure['code']; readonly cleanupFailed: null }
  | { readonly domain: 'presentation'; readonly code: 'INVALID_TRANSFORM' | 'INVALID_SPRITE_LAYOUT' | 'LOCAL_UNIT_MISMATCH' | 'SCENE_IN_USE'; readonly cleanupFailed: null }
  | { readonly domain: 'frame'; readonly code: RenderFrameFailure['code']; readonly cleanupFailed: boolean }
  | { readonly domain: 'texture'; readonly code: RenderTextureFailure['code']; readonly cleanupFailed: boolean }
  | { readonly domain: 'cache'; readonly code: VisualResourceCacheFailure['code']; readonly cleanupFailed: null }
  | { readonly domain: 'session'; readonly code: RenderFailure['code']; readonly cleanupFailed: null }
  | { readonly domain: 'unknown'; readonly code: 'UNKNOWN_FAILURE'; readonly cleanupFailed: null };

/** Only call for caught failures, never as a success probe. No message/cause copying. */
export function getRenderVisualDiagnostic(error: unknown): RenderVisualDiagnostic {
  const instance = instanceFailure(error);
  if (instance) return Object.freeze({ domain: 'instance', code: instance.code, cleanupFailed: null });
  const binding = bindingFailure(error);
  if (binding) return Object.freeze({ domain: 'binding', code: binding.code, cleanupFailed: null });
  const layer = layerFailure(error);
  if (layer) return Object.freeze({ domain: 'layer', code: layer.code, cleanupFailed: null });
  const depth = depthFailure(error);
  if (depth) return Object.freeze({ domain: 'depth', code: depth.code, cleanupFailed: null });
  const presentation = VisualPresentationError.code(error);
  if (presentation) return Object.freeze({ domain: 'presentation', code: presentation, cleanupFailed: null });
  const frame = frameFailure(error);
  if (frame) return Object.freeze({ domain: 'frame', code: frame.code, cleanupFailed: frame.cleanupFailed });
  const texture = textureFailure(error);
  if (texture) return Object.freeze({ domain: 'texture', code: texture.code, cleanupFailed: texture.cleanupFailed });
  const cache = cacheFailure(error);
  if (cache) return Object.freeze({ domain: 'cache', code: cache.code, cleanupFailed: null });
  const session = getRenderFailure(error);
  if (session) return Object.freeze({ domain: 'session', code: session.code, cleanupFailed: null });
  return Object.freeze({ domain: 'unknown', code: 'UNKNOWN_FAILURE', cleanupFailed: null });
}

export {
  createRenderVisualScene,
  type RenderVisualScene,
  type RenderVisualSceneSnapshot,
  type RenderVisualSceneDisposal,
  addRenderVisualInstance,
  getRenderVisualInstance,
  listRenderVisualInstances,
  removeRenderVisualInstance,
  type RenderVisualInstance,
  type RenderVisualInstanceInput,
  type RenderVisualCorrelation,
  getRenderVisualInstanceSnapshot,
  updateRenderVisualInstance,
  getRenderVisualInstanceFailure,
  type RenderVisualInstanceProperties,
  type RenderVisualInstanceSnapshot,
  type RenderVisualInstanceFailure,
  bindRenderVisualInstanceResource,
  getRenderVisualInstanceResource,
  getRenderVisualBindingFailure,
  type RenderVisualResourceBindingInput,
  type RenderVisualResourceBindingSnapshot,
  type RenderVisualFrameBinding,
  type RenderVisualBindingFailure,
  setRenderVisualInstanceTransform,
  getRenderVisualInstanceTransform,
  setRenderVisualInstanceVisible,
  getRenderVisualInstanceVisibility,
  type RenderVisualInstanceVisibilitySnapshot,
  addRenderVisualLayer,
  updateRenderVisualLayer,
  getRenderVisualLayer,
  listRenderVisualLayers,
  removeRenderVisualLayer,
  setRenderVisualInstanceOrder,
  getRenderVisualInstanceOrder,
  listRenderVisualDrawCandidates,
  getRenderVisualLayerFailure,
  type RenderVisualLayerInput,
  type RenderVisualLayerSnapshot,
  type RenderVisualInstanceOrder,
  type RenderVisualDrawCandidate,
  type RenderVisualLayerFailure,
  setRenderVisualLayerOrderingPolicy,
  getRenderVisualLayerOrderingPolicy,
  setRenderVisualInstanceDepthKey,
  getRenderVisualInstanceDepthKey,
  setRenderVisualInstanceSpriteLayout,
  getRenderVisualInstanceSpriteLayout,
} from './visual-scene.js';
export { getRenderVisualDepthFailure, type RenderVisualDepthFailure,
  type RenderVisualDepthKey, type RenderVisualLayerOrderingPolicy } from './visual-depth.js';
export { type RenderVisualInstanceTransformInput, type RenderVisualInstanceTransformSnapshot } from './visual-instance-transform.js';
export { renderVisualResourceDemo } from './visual-resource-demo.js';
export {
  planRenderViewportSize,
  type RenderViewportMetrics,
  type RenderViewportSizeLimits,
  type RenderViewportSizePlan,
} from './viewport-size.js';
export {
  createViewportMapping2D,
  projectPointToViewport2D,
  viewportPointToPlane2D,
  viewportPointToScreen2D,
  screenPointToViewport2D,
  type ScreenMapping2D,
  type ViewportMetrics2D,
  type ViewportMapping2D,
} from './viewport-mapping.js';
export {
  createOrthographicPlaneProjection,
  projectPlanePoint2D,
  type ProjectionPlane2D,
  type PlaneProjectionPoint2D,
  type OrthographicPlaneProjection,
} from './plane-projection.js';
export {
  createVisualAnchor2D,
  createVisualOrientation2D,
  resolveVisualAlignment2D,
  type VisualAnchor2D,
  type VisualOrientation2D,
  type VisualAlignment2D,
} from './visual-alignment.js';
export {
  createOrthogonalGridConversion,
  gridCellToScenePosition,
  scenePositionToGridCell,
  type GridConversionSpace,
  type OrthogonalGridConversion,
  type GridCell2D,
  type GridScenePosition2D,
} from './grid-conversion.js';
export {
  toAffineTransform2D,
  applyPlanarPoint2D,
  composePlanarTransforms2D,
  invertPlanarTransform2D,
  type PlanarPoint2D,
  type AffineTransform2D,
  type PlanarInverseResult,
} from './planar-affine.js';
export { createPlanarTransform2D, type PlanarTransform2D } from './planar-transform.js';
export { prepareVisualResource, type VisualResourceDescriptor, type VisualResourcePreparation } from './visual-resource.js';
export { parseUnityAtlasMetadata } from './unity-atlas.js';
export { createVisualFrameReference, resolveAtlasFrame, type VisualFrameReference, type AtlasFrameResolution } from './atlas-frame.js';
export { getAtlasMetadataRevision, type AtlasMetadataRevision } from './atlas-metadata.js';
export {
  type AtlasSourceBinding, type UnityAtlasSheet, type AtlasMetadataPage,
  type AtlasMetadataFrame, type AtlasMetadata, type AtlasMetadataResult,
} from './atlas-metadata.js';
export {
  uploadPngTexture,
  getRenderTextureSnapshot,
  getRenderTextureFailure,
  type RenderTexture,
  type RenderTextureSnapshot,
  type RenderTextureOptions,
  type RenderTextureFailure,
} from './render-texture.js';
export {
  createPngImageDecode,
  type PngDecodeLimits,
  type PngDecodeFailure,
  type PngImageObservation,
  type PngImageDecode,
} from './png-image.js';
export {
  createVisualSourceLoad,
  type VisualSourceLoad,
  type VisualSourceLoadObservation,
} from './visual-source-load.js';
export {
  acquireVisualSource,
  type VisualSourceScope,
  type VisualSourceRequest,
  type VisualSourceResponse,
  type VisualSourceProvider,
  type VisualSourceFailureCode,
  type VisualSourceAcquisition,
} from './visual-source.js';
export {
  createRenderFrameSession,
  beginRenderFrameSession,
  type RenderFrameAcquisition,
  type RenderGraphicsSnapshot,
  getRenderViewportSnapshot,
  type RenderViewportSnapshot,
  resizeRenderViewport,
  type RenderViewportResizeReceipt,
  suspendRenderViewport,
  resumeRenderViewport,
  invalidateRenderFrame,
  getRenderFrameInvalidationSnapshot,
  type RenderFrameInvalidationSnapshot,
  inspectRenderTarget,
  type RenderTargetCapabilities,
  getRenderFrameFailure,
  type RenderFrameSession,
  type RenderFrameReceipt,
  type RenderFrameFailure,
} from './frame-session.js';

/** Host-owned opaque target reference; not a validated rendering capability. */
export interface RenderHostBinding {
  /** Borrowed: the host creates, mounts and removes it. Render never freezes it. */
  readonly target: object;
}

/** Immutable binding metadata, not an initialized renderer or resource handle. */
export interface RenderSessionDescriptor {
  /** Fresh in this JS execution; not serializable or a document/gameplay ID. */
  readonly id: symbol;
  readonly host: RenderHostBinding;
}

/**
 * Snapshot one host binding with an independent identity. Acquires no resources,
 * validates no backend/target conditions, and does not read DOM or GPU globals.
 * The binding wrapper is copied and frozen; the borrowed target remains host-owned.
 */
export function createRenderSession(host: RenderHostBinding): RenderSessionDescriptor {
  return Object.freeze({
    id: Symbol(),
    host: Object.freeze({ target: host.target }),
  });
}

/** Detached observation; bound means a reference was accepted, not graphics ready. */
export interface RenderSessionSnapshot {
  readonly descriptor: RenderSessionDescriptor;
  readonly state: 'created' | 'bound';
}

/** Terminal observation deliberately retains no host binding or target. */
export interface RenderSessionDisposal {
  readonly id: symbol;
  readonly state: 'disposed';
}

/** Safe diagnostics for current Render-authored misuse; no host data or raw cause. */
export type RenderFailure =
  | { readonly code: 'INVALID_HOST_TARGET'; readonly stage: 'initialize' }
  | { readonly code: 'SESSION_DISPOSED'; readonly stage: 'initialize' | 'getSnapshot' };

class InvalidHostTargetError extends TypeError {
  readonly #failure: RenderFailure = Object.freeze({
    code: 'INVALID_HOST_TARGET', stage: 'initialize',
  });

  constructor() {
    super('Render host target must be an object reference');
  }

  static getFailure(error: unknown): RenderFailure | undefined {
    if (typeof error === 'object' && error !== null && #failure in error) {
      return error.#failure;
    }
    return undefined;
  }
}

class SessionDisposedError extends Error {
  readonly #failure: RenderFailure;

  constructor(stage: 'initialize' | 'getSnapshot') {
    super('Render session is disposed');
    this.#failure = Object.freeze({ code: 'SESSION_DISPOSED', stage });
  }

  static getFailure(error: unknown): RenderFailure | undefined {
    if (typeof error === 'object' && error !== null && #failure in error) {
      return error.#failure;
    }
    return undefined;
  }
}

/**
 * Recognize errors created by this package instance. Undefined means unrecognized,
 * never success. Does not parse messages or copy unknown exception/context data.
 */
export function getRenderFailure(error: unknown): RenderFailure | undefined {
  return InvalidHostTargetError.getFailure(error) ?? SessionDisposedError.getFailure(error);
}

/** Host-controlled session boundary; no backend resources are acquired. */
export interface RenderSessionLifecycle {
  /** Active observations only; throws after disposal. Previously returned snapshots survive. */
  readonly getSnapshot: () => RenderSessionSnapshot;
  /** Idempotent once bound; throws for invalid target or after disposal. */
  readonly initialize: () => RenderSessionSnapshot;
  /** Terminal and idempotent; releases internal binding, never destroys host target. */
  readonly dispose: () => RenderSessionDisposal;
}

/**
 * Create independent lifecycle ownership with a new descriptor identity.
 * Initialization checks reference shape only, never target liveness or GPU support.
 * Existing metadata-only creation remains available without entering this lifecycle.
 */
export function createRenderSessionLifecycle(host: RenderHostBinding): RenderSessionLifecycle {
  let descriptor: RenderSessionDescriptor | undefined = createRenderSession(host);
  let state: RenderSessionSnapshot['state'] | 'disposed' = 'created';
  const disposal: RenderSessionDisposal = Object.freeze({ id: descriptor.id, state: 'disposed' });

  const getSnapshot = (): RenderSessionSnapshot => {
    if (state === 'disposed' || descriptor === undefined) {
      throw new SessionDisposedError('getSnapshot');
    }
    return Object.freeze({ descriptor, state });
  };

  return Object.freeze({
    getSnapshot,
    initialize: (): RenderSessionSnapshot => {
      if (state === 'disposed' || descriptor === undefined) {
        throw new SessionDisposedError('initialize');
      }
      if (state === 'created') {
        const target = descriptor.host.target;
        if (target === null || (typeof target !== 'object' && typeof target !== 'function')) {
          throw new InvalidHostTargetError();
        }
        state = 'bound';
      }
      return getSnapshot();
    },
    dispose: (): RenderSessionDisposal => {
      descriptor = undefined;
      state = 'disposed';
      return disposal;
    },
  });
}
export {
  resolveAtlasFrameGeometry, createAtlasTextureView,
  type AtlasPagePixels, type AtlasFrameGeometry, type AtlasFrameGeometryResult, type AtlasTextureView,
} from './atlas-geometry.js';
export {
  createPngLoadScope, type PngLoadScope, type SharedPngLoad, type SharedPngLoadSnapshot,
} from './png-load-scope.js';

export {
  createVisualResourceCache, type ResourceCacheLimits, type VisualResourceCache,
  type VisualResourceCacheSnapshot, type VisualResourceLease, type VisualResourceLeaseSnapshot,
} from './visual-resource-cache.js';

export { invalidateVisualResourceCache, getVisualResourceCacheFailure, type VisualResourceCacheFailure } from './visual-resource-cache.js';
export type { AtlasMetadataLimits } from './unity-atlas.js';

export { type RenderVisualSpriteLayout } from './visual-sprite-layout.js';
export { createRenderCamera, type RenderCameraInput, type RenderCameraUpdate,
  type RenderCameraSnapshot, type RenderCamera } from './camera.js';
export { setRenderCameraCenter, panRenderCamera, type RenderCameraPan } from './camera.js';
export { createConfiguredRenderCamera, getRenderCameraViewSnapshot, setRenderCameraZoom,
  zoomRenderCameraAtFocus, type RenderCameraViewSnapshot } from './camera.js';
export { type RenderCameraZoomLimits, type RenderCameraFocusZoomInput } from './camera-zoom.js';
export { createOrthographicCameraConfiguration, type OrthographicCameraConfigurationInput,
  type OrthographicCameraConfiguration } from './camera-configuration.js';
export { bindRenderCameraToVisualScene, getRenderCameraFrameSnapshot,
  type RenderCameraSceneBinding, type RenderCameraSceneBindingSnapshot, type RenderCameraFrameSnapshot } from './camera-scene.js';
export {
  createSpriteFrameSequence, createSpriteAnimationClip,
  type SpriteFrameSequence, type SpriteAnimationClip,
} from './sprite-frame-sequence.js';
export {
  createSpriteAnimationTiming, createSpriteTimedClip, sampleSpriteAnimationTiming,
  type SpriteAnimationTimingInput, type SpriteAnimationTiming, type SpriteAnimationRepeat,
  type SpriteTimedClipInput, type SpriteTimedClip, type SpriteAnimationFrameSample,
} from './sprite-animation-timing.js';
export {
  createEightWaySpriteClip, selectEightWaySpriteDirection, resolveEightWaySpriteFrame,
  type SpriteDirectionIndex, type SpriteDirectionSequences, type SpriteEightWayConvention,
  type EightWaySpriteClipInput, type EightWaySpriteClip, type EightWaySpriteFrameResolution,
} from './sprite-eight-way.js';
