# CM09/CM10 — camera / accepted viewport adapter

Canonical owner: Runtime Render. Editor/Client remain compatibility consumers.
This checkpoint uses real Phase4 mapping, Phase6 session/resize and v0.9.4 camera
configuration. Phase7 resources and Phase8 instances are not consumed or modified.
Additive contracts were authorized by the supplied task; no owner transfer.

## Public delta

```ts
getRenderCameraViewportSnapshot(
  camera: RenderCamera,
  session: RenderFrameSession,
  receipt: RenderViewportResizeReceipt,
  logical: ViewportMetrics2D,
): RenderCameraViewportSnapshot
```

The new readonly snapshot contains `status: 'configured-not-applied'`, `camera`
(current RenderCameraViewSnapshot), `viewport` (active Phase6 observation), `resize`
(the exact issued receipt), and `mapping` (canonical ViewportMapping2D in CSS px).
These are the only two new package-root names. Old types, signatures and unions
are unchanged. No native camera, active-camera occupancy or durable binder added.

## Truth / freshness

- `RenderViewportMetrics` are host-supplied positive logical CSS width/height and
  requested ratio. Host owns their measurement, CSS, visibility and timing.
- `planRenderViewportSize` is a floor-once validation candidate only. It cannot
  establish backend acceptance and is not accepted as a receipt.
- `resizeRenderViewport` / `resumeRenderViewport` own native mutation. Their issued
  receipt captures requested metrics, accepted drawing-buffer size and actual
  per-axis ratio (`accepted / logical`). No assumption that requested ratio was
  accepted exactly, nor that the drawing buffer equals the plan.
- `getRenderViewportSnapshot` alone has no logical CSS width/height. It cannot
  reconstruct a camera mapping without the exact current resize receipt.
- A private Phase6 WeakMap remembers the latest issued immutable receipt for each
  canonical session. Every accepted resize, including `unchanged` and resume,
  replaces it. Object identity is the freshness token: copied, forged, previous,
  cross-session and missing receipts reject. Session ID/size equality alone is
  insufficient when two requests round to the same buffer. No new public epoch,
  structural producer requirement, manager, callback or enumeration.
- The guard also checks current active/ready viewport, session ID and accepted
  size. Logical metrics are exact-data captured, canonically validated and must
  match the receipt CSS dimensions. Plane must be same-project, right/down CSS px.
  Matching labels declare context; they are not a plane-registry existence query.
- Context capture can invoke host proxies; current receipt/state and camera view
  are rechecked after capture. No old result is returned as current after reentry.

## Resize / units / lifecycle

Policy is the camera's existing `preserve-scale`: scale*zoom remains CSS px per
source unit, center maps to `(logicalWidth/2, logicalHeight/2)`. Re-read after an
accepted resize or ratio change; adapter recomputes mapping on the same camera and
session. No camera center/zoom/revision write. Aspect changes alter visible spans,
not axis ratios or zoom. The pure canonical Phase4 inverse admission is retained.

The accepted physical buffer and ratio remain in `resize`, separate from logical
mapping. No ratio multiplication enters CSS mapping. Device-pixel logical planes
reject; device/screen conversions require a separate explicit Phase4 mapping and
are not implicitly requested here. Optional screen mapping retains existing Phase4
explicit-origin rules. No default DPR, window, observer or live-buffer/CSS write.

Example expectations (not native observations): CSS800x450 has center400,225 at
ratio1 or2. If native accepts the candidates, buffers are800x450 /1600x900. CSS
600x400 has center300,200; preserve-scale keeps effective scale2 at zoom1. Candidate
sizes and accepted sizes are always separate evidence.

Suspended, pending, unavailable and terminal sessions reject with TypeError; no
ready projection is fabricated for hidden/zero CSS. Host uses existing Phase6
suspend/resume with fresh positive metrics. Disposed or unconfigured camera,
foreign session, stale/mismatched receipt, invalid extent/unit/project reject.
TypeError covers invalid data/state; canonical numeric limits retain RangeError;
unknown host exceptions propagate. Adapter rejection never changes camera, session,
receipt, authored placement, gameplay or resource state. Host proxy side effects
are outside that guarantee. Existing resize admission/failure policy is untouched.

Returned observations are immutable historical configurations. They are not live
health checks, GPU camera application, displayed pixels, a submitted frame or a
promise of liveness after the call. Re-read for current context. No invalidation
is needed for this read; Phase6 already invalidates on accepted resize. Camera
session application and Phase8 presentation integration remain future supplied work.

See [manual consumer](../manual/camera-viewport.md) and
[checkpoint evidence](../../harness/checkpoints/camera-v0.9.5.md). Build-only gates
do not establish runtime or visual acceptance.
