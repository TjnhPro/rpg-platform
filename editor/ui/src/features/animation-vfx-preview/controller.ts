import * as R from '@rpg-platform/runtime-render';
import { getAssetManagerProjectSnapshot, validateVisualSceneDocument, describeMapLayers,
  type DocumentSession, type ScenePreviewPresentation } from '@rpg-platform/editor';
import { createAnimationPreviewContext, type AnimationPreviewBinding, type AnimationPreviewTicket } from '../../../../dist/animation-vfx-preview-context.js';
import { inspectAnimationPreviewAtlas, type AnimationPreviewInventory, type PreviewSheetDeclaration } from '../../../../dist/animation-vfx-preview-atlas.js';
import { prepareAnimationPreviewClips, type PreviewClipDeclaration, type PreparedPreviewClips } from '../../../../dist/animation-vfx-preview-clips.js';
import { configureAnimationPreviewClips, createConfiguredAnimationPreviewSprite, type PreviewPlaybackConfiguration } from '../../../../dist/animation-vfx-preview-config.js';
import { prepareAnimationPreviewEffect } from '../../../../dist/animation-vfx-preview-effect.js';
import { createAnimationPreviewEffectInstance } from '../../../../dist/animation-vfx-preview-effect-instance.js';
import { createAnimationPreviewResources } from '../../../../dist/animation-vfx-preview-resource.js';
import { createPreviewInspectionAlignment, inspectAnimationPreviewAlignment } from '../../../../dist/animation-vfx-preview-alignment.js';
import { createAnimationPreviewScene } from '../../../../dist/animation-vfx-preview-scene.js';
import { createPreviewClock } from './preview-clock.js';
import type { AssetResourceGrant } from '../asset-browser/AssetViewport.js';

export interface PreviewSettings {
  readonly mode: 'sprite' | 'vfx'; readonly clipId: string; readonly direction: R.SpriteDirectionIndex;
  readonly playback: PreviewPlaybackConfiguration;
  readonly points: Pick<R.SpriteFrameAlignmentData, 'groundAnchor' | 'pivot' | 'localOffset'>;
  readonly world: { readonly x: number; readonly y: number }; readonly targetId: string | null;
}
export type PreviewCommand = 'play' | 'pause' | 'resume' | 'stop' | 'restart';
export interface PreviewDeclaration {
  readonly bindings: readonly R.AtlasSourceBinding[]; readonly sheets: readonly PreviewSheetDeclaration[];
  readonly declaration: PreviewClipDeclaration;
}
export function previewFailure(error: unknown): string {
  const known = R.getRenderVisualDiagnostic(error);
  if (known.domain !== 'unknown') return `${known.domain}:${known.code}`;
  return error instanceof TypeError || error instanceof RangeError ? error.message : 'PREVIEW_UNAVAILABLE: unknown host failure';
}
/** Own transient playback, one scene and resources inside the existing acquired viewport. */
export function createPreviewController(input: {
  readonly binding: AnimationPreviewBinding; readonly grant: AssetResourceGrant; readonly session: R.RenderFrameSession;
  readonly document: DocumentSession | null; readonly requestFrame: () => void; readonly notify: (value: string) => void;
}) {
  const context = createAnimationPreviewContext(input.binding), scene = R.createRenderVisualScene(input.session);
  let closed = false, available = false, ticket: AnimationPreviewTicket | null = null;
  let inventory: AnimationPreviewInventory | null = null, base: PreparedPreviewClips | null = null;
  let settings: PreviewSettings | null = null;
  let sprite: ReturnType<typeof createConfiguredAnimationPreviewSprite> | null = null;
  let effect: ReturnType<typeof createAnimationPreviewEffectInstance> | null = null;
  let binding: R.SpriteAnimationVisualBinding | R.SpriteSequenceVisualBinding | null = null;
  let visual: R.RenderVisualInstance | null = null;
  let resources: ReturnType<typeof createAnimationPreviewResources> | null = null;
  let sceneBridge: ReturnType<typeof createAnimationPreviewScene> | null = null;
  let sceneCache: R.VisualResourceCache | null = null;
  let cameraBinding: R.RenderCameraSceneBinding | null = null;
  let lastSync: unknown = 'NOT_CHECKED', alignment: unknown = 'NOT_CHECKED', cleanupUncertain = false;
  const catalog = getAssetManagerProjectSnapshot(input.binding.assets).catalog;
  const map = input.document ? validateVisualSceneDocument(input.document.getSnapshot().envelope, catalog) : null;
  const projectId = input.grant.root.projectId;
  const plane: R.ProjectionPlane2D = map ? { ...map.profile.space.reference, unit: map.profile.space.unit, axes: map.profile.space.axes }
    : { projectId, coordinateSpaceId: 'animation-preview', unit: 'preview-unit', axes: { x: 'right', y: 'down' } };
  const projection = R.createOrthographicPlaneProjection({ kind: 'orthographic-plane', source: plane,
    destination: { projectId, coordinateSpaceId: 'render-clip-2d', unit: 'clip-unit', axes: { x: 'right', y: 'up' } },
    sourceOrigin: { x: 0, y: 0 }, destinationOrigin: { x: 0, y: 0 }, destinationUnitsPerSourceUnit: { x: 1, y: 1 } });
  if (map && input.document) for (const layer of describeMapLayers(input.document.getSnapshot().envelope, catalog).layers) R.addRenderVisualLayer(scene, layer);
  const camera = R.createConfiguredRenderCamera({ kind: 'orthographic', source: plane, center: { x: 0, y: 0 },
    scale: { unit: 'css-px-per-source-unit', x: 1, y: 1 }, zoom: 1, viewportPolicy: 'preserve-scale' }, { min: .25, max: 4 });
  const readPlayback = () => sprite?.read() ?? effect?.read().playback.playback ?? null;
  const report = () => {
    if (closed) return;
    input.notify(JSON.stringify({ playback: readPlayback(), mode: sprite?.sprite.playback.mode ?? (effect ? 'sprite-sequence-vfx' : 'unprepared'),
      frameCount: base && settings ? (() => { const clip = base.clips.find(c => ('directions' in c ? c.clipId : c.clip.clipId) === settings!.clipId);
        return clip ? ('directions' in clip ? clip.directions[settings!.direction].frames.length : clip.clip.sequence.frames.length) : null; })() : null,
      lastSync, alignment, effects: effect?.read() ?? null, clock: clock.read(), cleanup: cleanupUncertain ? 'CLEANUP_UNCERTAIN' : 'no failure observed',
      resources: resources?.read() ?? null, scene: map ? { sceneId: map.identity.sceneId, targets: sceneBridge?.targets() ?? [] } : 'ASSET_ONLY',
      submission: 'See viewport receipt; binding is not display evidence', pixels: 'NOT_VERIFIED', artistGround: 'NOT_VERIFIED' }, null, 2));
  };
  const clock = createPreviewClock({ playing: () => readPlayback()?.state === 'playing',
    advance(delta) { if (sprite) sprite.step(delta); else effect?.step(delta); }, present,
    suspend() { if (readPlayback()?.state === 'playing') { if (sprite) sprite.command({ type: 'pause' }); else effect?.command({ type: 'pause' }); } },
    failure(error) { input.notify(previewFailure(error)); } });
  const drain = (actions: (() => unknown)[]) => { const failures: unknown[] = [];
    for (const action of actions) try { action(); } catch (error) { failures.push(error); }
    if (failures.length) { cleanupUncertain = true; throw new AggregateError(failures, 'CLEANUP_UNCERTAIN'); } };
  const clearPlayback = () => {
    clock.stop(); const oldBinding = binding, oldSprite = sprite, oldEffect = effect, oldVisual = visual;
    binding = null; sprite = null; effect = null; visual = null; lastSync = 'NOT_CHECKED'; alignment = 'NOT_CHECKED';
    drain([() => oldBinding?.unbind(), () => oldSprite?.dispose(), () => oldEffect?.dispose(),
      () => { if (oldVisual) R.removeRenderVisualInstance(scene, oldVisual); }]);
  };
  const clearLoad = () => {
    const oldBridge = sceneBridge, oldResources = resources, oldCache = sceneCache;
    sceneBridge = null; resources = null; sceneCache = null; base = null; inventory = null; ticket = null;
    drain([clearPlayback, () => oldBridge?.dispose(), () => oldResources?.dispose(), () => oldCache?.dispose()]);
  };
  function assert() { if (closed || !ticket) throw new TypeError('PREVIEW_NOT_PREPARED'); context.assert(ticket); }
  function authoredFrame(frame: R.VisualFrameReference) {
    if (!inventory || !settings) throw new TypeError('PREVIEW_NOT_PREPARED');
    const authored = createPreviewInspectionAlignment(inventory, frame, settings.points);
    const inspected = inspectAnimationPreviewAlignment(context, ticket!, inventory, frame, {
      placement: { plane, point: settings.world }, orientation: { axes: plane.axes, zeroAxis: 'positive-x', positiveRotation: 'toward-positive-y', angleRadians: 0 },
      planeUnitsPerPixel: { x: 1, y: 1 }, authored });
    alignment = inspected;
    if (inspected.alignment.status !== 'resolved') throw new TypeError(`PREVIEW_ALIGNMENT:${inspected.alignment.code}`);
    return { authored, anchor: inspected.alignment.anchor };
  }
  async function present() {
    assert(); const playback = readPlayback();
    if (!playback || !settings || !resources) return;
    if (playback.state !== 'playing') clock.stop();
    if (playback.state === 'disposed' || playback.completed && effect) { lastSync = 'INSTANCE_COMPLETED_REMOVED'; input.requestFrame(); report(); return; }
    const frame = playback.frame, prepared = authoredFrame(frame);
    if (effect) {
      if (settings.targetId && sceneBridge) sceneBridge.syncAttachment(effect);
      else R.setVisualEffectWorldPlacement(effect.handle, { placement: { plane, point: settings.world }, projection, anchor: prepared.anchor });
    } else if (visual) {
      R.setRenderVisualInstanceTransform(scene, visual, { placement: { plane, point: settings.world }, projection,
        anchor: prepared.anchor, local: { translation: { x: 0, y: 0 }, rotationRadians: 0, scale: { x: 1, y: 1 } },
        orientation: { axes: plane.axes, zeroAxis: 'positive-x', positiveRotation: 'toward-positive-y', angleRadians: 0 } });
    }
    const activeEffect = effect, activeBinding = binding;
    lastSync = await resources.sync(() => readPlayback()?.frame ?? null,
      data => activeEffect ? R.syncVisualEffectFrame(activeEffect.handle, data) : activeBinding!.sync(data), { x: 1, y: 1 }, prepared.authored);
    assert(); input.requestFrame(); report();
  }
  async function prepareScene() {
    if (!input.document || !inventory || !ticket) return;
    sceneCache = R.createVisualResourceCache(input.grant.provider, { maxCpuEntries: 16, maxGpuEntries: 16, maxRevisionEntries: 32 });
    sceneBridge = createAnimationPreviewScene(context, ticket, input.document, scene, (descriptor, plan) =>
      sceneCache!.acquire(input.session, descriptor, descriptor.sources.findIndex(s => s.role === 'image'), plan.sourceRevision,
        { maxBytes: 4_194_304, maxDimension: 4096, maxPixels: 4_194_304 }, { sampling: 'nearest', colorSpace: 'srgb' }));
    const presentations = new Map<string, ScenePreviewPresentation>(), layers = describeMapLayers(input.document.getSnapshot().envelope, catalog);
    for (const object of sceneBridge.map.membership.objects) {
      if (!object.assetReference) continue;
      const definition = catalog.definitions.find(item => item.identity.assetId === object.assetReference!.assetId);
      const image = definition?.sources.find(s => s.role === 'image');
      const order = layers.objects.find(o => o.objectId === object.definition.objectId)?.order;
      if (!image || !order) continue;
      const observed = await input.grant.existing.observe({ projectId, bindingId: input.grant.root.bindingId, locator: image.locator }); assert();
      if (observed.status !== 'available') continue;
      presentations.set(object.definition.objectId, { space: map!.profile.space, frame: null, order, visible: true,
        sourceRevision: observed.observation.revision, bindingKey: JSON.stringify([object.assetReference, observed.observation.revision]),
        layout: { unit: plane.unit, x: -16, y: -16, width: 32, height: 32 },
        transform: { projection, anchor: { unit: plane.unit, anchor: { x: 0, y: 0 }, pivot: { x: 0, y: 0 }, localOffset: { x: 0, y: 0 } },
          local: { translation: { x: 0, y: 0 }, rotationRadians: 0, scale: { x: 1, y: 1 } },
          orientation: { axes: plane.axes, zeroAxis: 'positive-x', positiveRotation: 'toward-positive-y', angleRadians: 0 } } });
    }
    await sceneBridge.preview(description => { const plan = presentations.get(description.correlation.objectId);
      if (!plan) throw new TypeError('PREVIEW_TARGET_SOURCE_UNAVAILABLE'); return plan; }); assert();
  }
  async function apply(next: PreviewSettings) {
    assert(); if (!base || !inventory) throw new TypeError('PREVIEW_NOT_PREPARED'); clearPlayback(); settings = next;
    const configured = configureAnimationPreviewClips(base, next.playback);
    if (next.mode === 'vfx') {
      if (configured.prepared.mode !== 'single-sequence') throw new TypeError('VFX_REQUIRES_NEUTRAL_SEQUENCE');
      const clip = configured.prepared.clips.find(c => c.clip.clipId === next.clipId);
      if (!clip) throw new TypeError('PREVIEW_CLIP_NOT_DECLARED');
      const prepared = prepareAnimationPreviewEffect(context, ticket!, inventory, { effectId: 'preview-only', kind: 'sprite-sequence',
        clip: { clip: clip.clip, timing: clip.timing, repeat: clip.repeat } });
      effect = createAnimationPreviewEffectInstance(context, ticket!, prepared, input.session, scene, 'animation-preview-effect', configured.config.speed);
      const frame = effect.read().playback.playback.frame, authored = authoredFrame(frame);
      const world = { placement: { plane, point: next.world }, projection, anchor: authored.anchor };
      if (sceneBridge) { sceneBridge.world(effect, world); if (next.targetId) sceneBridge.attach(effect, next.targetId, next.points.localOffset); }
      else { if (next.targetId) throw new TypeError('PREVIEW_SCENE_UNAVAILABLE'); R.setVisualEffectWorldPlacement(effect.handle, world); }
    } else {
      sprite = createConfiguredAnimationPreviewSprite(context, ticket!, base, next.clipId, base.mode === 'eight-way' ? next.direction : null, next.playback);
      visual = R.addRenderVisualInstance(scene, { visualInstanceId: 'animation-preview-sprite', correlation: {
        projectId, sceneId: map?.identity.sceneId ?? 'asset-preview', objectId: 'preview-only-sprite' } });
      const playback = sprite.sprite.playback;
      binding = playback.mode === 'eight-way' ? R.createSpriteAnimationVisualBinding(input.session, scene, visual, playback.handle)
        : R.createSpriteSequenceVisualBinding(input.session, scene, visual, playback.handle);
    }
    await present();
  }
  return Object.freeze({
    configure(receipt: R.RenderViewportResizeReceipt, metrics: R.RenderViewportMetrics) {
      const logical = { plane: { projectId, coordinateSpaceId: 'animation-preview-css', unit: 'css-px', axes: { x: 'right' as const, y: 'down' as const } },
        width: metrics.logicalWidthCssPx, height: metrics.logicalHeightCssPx, screen: null };
      if (cameraBinding) cameraBinding.configure(receipt, logical); else cameraBinding = R.bindRenderCameraToVisualScene(camera, scene, receipt, logical);
    },
    setAvailable(value: boolean) { available = value; clock.setAvailable(value); },
    async load(text: string, next: PreviewSettings) {
      if (closed || !available) throw new TypeError('ACQUIRE_VIEWPORT_FIRST');
      if (text.length > 1_048_576) throw new RangeError('PREVIEW_DECLARATION_LIMIT');
      const declaration = JSON.parse(text) as PreviewDeclaration;
      ticket = context.begin(); const current = ticket;
      context.own(current, clearLoad);
      inventory = await inspectAnimationPreviewAtlas(context, current, declaration.bindings, declaration.sheets); context.assert(current);
      base = prepareAnimationPreviewClips(inventory, declaration.declaration);
      resources = createAnimationPreviewResources(context, current, inventory, input.session);
      await prepareScene(); await apply(next);
      return Object.freeze({ mode: base.mode, clips: base.clips.map(c => 'directions' in c ? c.clipId : c.clip.clipId), targets: sceneBridge?.targets() ?? [] });
    }, apply,
    async direction(direction: R.SpriteDirectionIndex) { assert(); clock.stop();
      if (!sprite || sprite.sprite.playback.mode !== 'eight-way') throw new TypeError('PREVIEW_DIRECTION_NA');
      sprite.command({ type: 'setDirection', directionIndex: direction }); settings = { ...settings!, direction }; await present(); if (readPlayback()?.state === 'playing') clock.start(); },
    async command(command: PreviewCommand) {
      assert(); clock.stop(); if (!available) throw new TypeError('PREVIEW_VIEWPORT_UNAVAILABLE');
      if (sprite) sprite.command(command === 'play' ? { type: 'play', clipId: settings!.clipId } : { type: command }); else effect?.command({ type: command });
      await present(); if (readPlayback()?.state === 'playing') clock.start();
    },
    async step(deltaMs: number) { assert(); clock.stop();
      if (sprite) sprite.step(deltaMs); else effect?.step(deltaMs); await present(); if (readPlayback()?.state === 'playing') clock.start(); },
    dispose() { if (closed) return; closed = true;
      try { drain([() => clock.dispose(), clearLoad, () => {
        if (context.dispose().status === 'CLEANUP_UNCERTAIN') throw new TypeError('CLEANUP_UNCERTAIN');
      }, () => cameraBinding?.dispose(), () => camera.dispose(), () => scene.dispose()]); }
      catch { cleanupUncertain = true; throw new TypeError('CLEANUP_UNCERTAIN'); } },
  });
}
export type PreviewController = ReturnType<typeof createPreviewController>;
