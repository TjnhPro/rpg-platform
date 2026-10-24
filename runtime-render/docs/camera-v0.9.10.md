# v0.9.10 — Visual Scene & Frame Integration (CM16/CM17)

Runtime Render alone owns this optional integration. Phase4 supplies canonical
plane mapping/inverse, Phase6 submission/demand/native lifetime, Phase7 texture
rights and Phase8 instances/ordering. No Engine/Server/L1/L2 or schema changes.

## Additive public surface

```ts
bindRenderCameraToVisualScene(camera, scene, latestResizeReceipt, logicalCssMetrics)
  // => RenderCameraSceneBinding { getSnapshot, configure, dispose }
getRenderCameraFrameSnapshot(issuedFrameReceipt)
  // => RenderCameraFrameSnapshot | undefined
```

Five new root names: the two functions and RenderCameraSceneBinding,
RenderCameraSceneBindingSnapshot, RenderCameraFrameSnapshot. Render226 ->231,
Editor138 and Client0 unchanged; exact emitted old declarations unchanged.
No required field, closed union or renderFrame signature change. Existing CPU
camera snapshots retain their historical unbound/not-applied contract. They do
not observe the separate live binding or assert backend application. Use the new
binding and exact submitted-frame observation for those purposes.

One configured camera binds one active canonical visual scene/session. Scene and
camera identities are issued capabilities, not authored IDs. Second binding on
the same camera or session rejects, including binding the same pair twice. An
unconfigured CPU camera, foreign/disposed scene or noncurrent/foreign/copied
resize receipt rejects. No graphics acquisition occurs in binding.

The supplied logical CSS plane/extent must pass existing camera viewport admission
and match the latest accepted Phase6 receipt. Host owns fresh measurements; Render
never measures DOM, subscribes to resize or applies DPR twice. Bind/configure
detach and freeze logical metrics; mapping source is the camera's declared plane.
After *every* accepted resize (including unchanged), call binding.configure with
the new receipt and matching logical metrics. A stale bound context rejects frame
admission without native submission, receipt or session destruction. Suspension
uses the existing VIEWPORT_SUSPENDED policy; resume needs a fresh configure.

## Native draw and coherent submission

Phase6 captures the current camera view/mapping/resize context under its existing
synchronous frame guard, then the existing frozen, resource-validated ordered
Phase8 items. Bound camera edits/disposal, binding edits, scene edits, nested
frames, resize and suspend/resume during submission reject. This prevents a view
or viewport change being attributed to a different frame. Invalidations occurring
during submission still remain pending through Phase6's existing demand token.

The private backend lazily owns one OrthographicCamera, alongside the unchanged
legacy identity camera, in the *existing* renderer and Three.Scene. Canonical
viewportPointToPlane2D supplies source-plane top-left and bottom-right; these
become left/right/top/bottom of the orthographic frustum (reversed axes supported).
Near/far -1/+1 admit z0 planar geometry. Zoom and per-axis scale are already
included in canonical extents, so native camera zoom remains1. Projection and
instance matrices must remain finite in float32 admission; binary64/native
rounding limits remain and no universal pixel equivalence is promised.

For bound draws each drawable's placement plane must exactly match camera
project/space/unit/axes. Backend uses its existing localToScene, *not* the old
localToClip, to avoid double projection. Native node matrices are presentation
implementation details; immutable instance transform snapshots, source placement,
anchor, orientation, layer/depth keys and draw order are not rewritten. Canonical
Phase8 geometry/material/frame and Phase7 ExternalTexture borrowing are unchanged.
No new scene, cache, upload, texture lease, sorting algorithm, loop or scheduler.
The explicit Phase7 texture-demo quad is a separate legacy clip-space overlay;
it is not a camera-transformed Scene instance.

Without a binding, backend uses the original localToClip + identity Camera path.
Unbind/camera disposal restores that path on the next requested frame (including
already-created nodes); no implicit submit. Empty scene/legacy empty clear remain
valid. Old localToClip data is retained as the compatibility path even while bound.
CM14 affine ground/elevation projection is not automatically applied to geometry:
host must supply actual matching presentation-plane instances. No inferred ground
transform, arbitrary3D, perspective or picking implementation is added.

## Demand, receipts, termination and failure

All changed center/pan/zoom/focus/bounds commits use the same camera commit seam:
check frame edit admission, publish atomic view, then invalidateRenderFrame.
No-op/rejected camera edits do not invalidate. Bind/configure/unbind mark demand;
they never submit or schedule. Existing on-demand/continuous hosts remain host-owned;
this checkpoint does not migrate Editor/Client controls to the new binding.

Only after backend success and session identity recheck does Phase6 associate a
RenderCameraFrameSnapshot with the exact frozen receipt through a private weak
capability. It contains application submitted, camera view/revision, scene/session
IDs, accepted resize and logical mapping. Copied/foreign/no-camera receipts yield
undefined. It never means visible pixels, GPU completion, or ongoing native health.
Historical snapshots stay readable after edits/disposal; they retain no handles.

Binding.dispose is terminal/idempotent and does not dispose camera/scene/session
or release resources. Camera.dispose detaches binding. Scene disposal or session
termination ends binding before canonical scene resource/backend cleanup. Reusing
the still-active CPU camera requires a new explicit binding; no auto-recovery.
No texture release is performed by binding cleanup. Phase7 rights are released by
their existing owners exactly as before; no double deletion or cache bypass.

Invalid handles/context/dimensions/zoom/planes generally retain existing TypeError;
numeric mapping/frustum failures RangeError. Bound update/resize/frame guard uses
existing FRAME_IN_PROGRESS. Wrong plane on a *drawn* instance, resource expiry,
native/GL error or loss during backend submission takes the existing terminal
Phase6 failure/cleanup path; unknown errors are not relabeled as success. Wrong
draw-plane labels are not silently converted. Native loss remains terminal, not
restorable; binding observation is last logical state, not continuous GPU health.

## Evidence limits

See [manual runbook](../manual/camera-scene.md) and
[checkpoint](../../harness/checkpoints/camera-v0.9.10.md). Public-root Node CPU
projection/admission observations are separate from native application. Browser
surfaces were unavailable: IAB unavailable, apps[]/browsers[]. Native PNG pixels,
redraw consumption, real A/B lifetime, DPR/resize, context loss and instance-world
invariance remain NOT_OBSERVED. FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED.
