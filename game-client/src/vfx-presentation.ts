// Client-local correlation/ownership adapter. No DOM, gameplay or Editor imports.
import * as R from '@rpg-platform/runtime-render';

export type ClientVfxPlacement =
  | { readonly mode: 'world'; readonly world: R.VisualEffectWorldPlacementInput }
  | { readonly mode: 'attachment'; readonly world: R.VisualEffectWorldPlacementInput;
      readonly target: R.RenderVisualInstance; readonly offset: R.PlanarPoint2D };
export type ClientVfxIntent =
  | { readonly type: 'spawn'; readonly correlationId: string; readonly effectReference: string; readonly placement: ClientVfxPlacement }
  | { readonly type: 'command'; readonly correlationId: string; readonly command: R.VisualEffectPlaybackCommand }
  | { readonly type: 'remove'; readonly correlationId: string }
  | { readonly type: 'elapsed'; readonly deltaMs: number };
export interface ClientVfxAsset {
  readonly definition: R.VisualEffectDefinition;
  readonly frameInput: (frame: R.VisualFrameReference) => R.VisualEffectFrameInput;
}
export interface ClientVfxAcquisition {
  readonly result: Promise<ClientVfxAsset>;
  /** Revokes this request's rights, including a still-pending lease. */
  readonly release: () => void;
}

export function createClientVfxPresentation(input: {
  readonly session: R.RenderFrameSession;
  readonly scene: R.RenderVisualScene;
  readonly acquire: (effectReference: string) => ClientVfxAcquisition;
}) {
  type Entry = { acquisition: ClientVfxAcquisition; effect?: R.VisualEffectInstance; asset?: ClientVfxAsset };
  const requests = new Map<string, Entry>();
  let closed = false, serial = 0;
  let lastTerminal: unknown = null;
  const drain = (actions: readonly (() => unknown)[]) => {
    let first: { error: unknown } | undefined;
    for (const action of actions) try { action(); } catch (error) { first ??= { error }; }
    if (first) throw first.error;
  };
  const retire = (key: string, entry: Entry) => {
    if (requests.get(key) !== entry) return;
    requests.delete(key); // Invalidate pending admission before releasing anything.
    drain([() => { if (entry.effect) R.removeVisualEffectInstance(input.scene, entry.effect); },
      () => { if (entry.effect) lastTerminal = R.getVisualEffectDiagnosticsSnapshot(entry.effect); }, entry.acquisition.release]);
  };
  const reconcile = () => {
    drain(Array.from(requests, ([key, entry]) => () => {
      if (entry.effect && R.getVisualEffectInstanceSnapshot(entry.effect).state === 'removed') retire(key, entry);
    }));
  };
  const requireOpen = () => {
    if (closed) throw new TypeError('Client VFX presentation closed');
    if (R.getRenderViewportSnapshot(input.session).graphics.state !== 'ready') {
      close(); throw new TypeError('Client VFX session terminal; fresh mount required');
    }
  };
  const sync = (entry: Entry) => {
    if (!entry.effect || !entry.asset) return;
    if (R.getVisualEffectInstanceSnapshot(entry.effect).state !== 'created') return;
    R.syncVisualEffectAttachment(entry.effect);
    if (R.getVisualEffectInstanceSnapshot(entry.effect).state === 'created') {
      const result = R.syncVisualEffectFrame(entry.effect,
        entry.asset.frameInput(R.getVisualEffectPlaybackSnapshot(entry.effect).playback.frame));
      if (result.status !== 'bound') throw new TypeError(`Client VFX frame unavailable: ${result.code}`);
    }
  };
  const close = () => {
    if (closed) return;
    closed = true;
    drain(Array.from(requests, ([key, entry]) => () => retire(key, entry)));
  };
  const transport = (type: 'pause' | 'resume') => {
    requireOpen(); reconcile();
    for (const entry of requests.values()) if (entry.effect) {
      const state = R.getVisualEffectPlaybackSnapshot(entry.effect).playback.state;
      if ((type === 'pause' && state === 'playing') || (type === 'resume' && state === 'paused'))
        R.commandVisualEffectPlayback(entry.effect, { type });
    }
  };
  const advance = (deltaMs: number) => {
    requireOpen(); reconcile();
    if (!Number.isFinite(deltaMs) || deltaMs < 0) throw new TypeError('Finite nonnegative presentation delta required');
    try {
      for (const entry of requests.values()) if (entry.effect) {
        R.advanceVisualEffectInstance(entry.effect, deltaMs); sync(entry);
      }
    } finally { reconcile(); }
  };
  return Object.freeze({ close, reconcile, advance,
    pause: () => transport('pause'), resume: () => transport('resume'),
    inspect: () => ({ closed, requests: Array.from(requests, ([correlationId, entry]) => ({ correlationId,
      state: entry.effect ? 'admitted' : 'pending', effect: entry.effect ? R.getVisualEffectDiagnosticsSnapshot(entry.effect) : null,
      playback: entry.effect ? R.getVisualEffectLifetimeSnapshot(entry.effect) : null })), lastTerminal }),
    async intent(intent: ClientVfxIntent): Promise<void> {
      requireOpen(); reconcile();
      if (intent.type === 'elapsed') {
        advance(intent.deltaMs); return;
      }
      const key = intent.correlationId;
      if (typeof key !== 'string' || !key.length || key.length > 512) throw new TypeError('Explicit bounded client correlation required');
      const entry = requests.get(key);
      if (intent.type === 'remove') { if (entry) retire(key, entry); return; }
      if (intent.type === 'command') {
        if (!entry?.effect) throw new TypeError('Client VFX request not admitted');
        R.commandVisualEffectPlayback(entry.effect, intent.command); sync(entry); return;
      }
      if (entry) throw new TypeError('Duplicate client VFX correlation');
      if (requests.size >= 256) throw new RangeError('Client VFX request budget exceeded');
      // Capture placement before awaiting caller IO. Render admits the canonical
      // world request and target scope after acquisition; target handles stay opaque.
      const placement = intent.placement;
      const world = { ...placement.world, placement: { plane: { ...placement.world.placement.plane,
        axes: { ...placement.world.placement.plane.axes } }, point: { ...placement.world.placement.point } },
        anchor: { ...placement.world.anchor, anchor: { ...placement.world.anchor.anchor },
          pivot: { ...placement.world.anchor.pivot }, localOffset: { ...placement.world.anchor.localOffset } },
        projection: R.createOrthographicPlaneProjection(placement.world.projection) };
      const attachment = placement.mode === 'attachment' ? { target: placement.target, localOffset: { ...placement.offset }, inheritance: 'translation-only' as const } : null;
      const pending: Entry = { acquisition: input.acquire(intent.effectReference) };
      requests.set(key, pending);
      try {
        const asset = await pending.acquisition.result;
        if (closed || requests.get(key) !== pending) return;
        requireOpen();
        pending.asset = asset;
        // Render identity is mount-local and never derived from a gameplay/network ID.
        pending.effect = R.createVisualEffectInstance(input.session, input.scene,
          { definition: asset.definition, visualInstanceId: `client-vfx-${++serial}` });
        R.setVisualEffectWorldPlacement(pending.effect, world);
        if (attachment) R.attachVisualEffectInstance(pending.effect, attachment);
        R.commandVisualEffectPlayback(pending.effect, { type: 'play' }); sync(pending);
      } catch (error) {
        try { retire(key, pending); } catch (cleanupError) { throw new AggregateError([error, cleanupError], 'Client VFX admission and cleanup failed'); }
        throw error;
      }
    },
  });
}
