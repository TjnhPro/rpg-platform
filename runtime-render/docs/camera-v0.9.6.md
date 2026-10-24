# CM11/CM12 — camera world/scene to viewport and screen

Canonical owner: Runtime Render. No Editor/Client production changes.

```ts
projectRenderCameraPoint(
  camera: RenderCamera,
  logical: ViewportMetrics2D,
  point: PlaneProjectionPoint2D,
  accepted: { readonly session: RenderFrameSession;
    readonly receipt: RenderViewportResizeReceipt } | null,
): RenderCameraProjectionResult
```

These are two additive package-root names. The immutable result contains current
`camera` view, canonical `mapping`, `viewportPoint`, optional `screenPoint` and
`acceptedViewport`. No existing required field/signature/union changes.

The required fourth argument makes context explicit. `null` means logical-only CPU
projection; positive finite host-declared CSS dimensions are validated, but no
backend acceptance or visible canvas is claimed. A non-null exact data record
requires the real current active/ready session and latest issued resize receipt
under v0.9.5. Stale/copied/foreign/missing receipt, changed extent or suspended/ended
session rejects; it never falls back to CPU-only mode. `acceptedViewport` preserves
the accepted buffer/ratio separately. No DPR multiplication enters CSS projection.
Historical results do not establish continuing session liveness. Re-read after
camera/viewport changes. Point capture rechecks camera and accepted receipt to
avoid returning stale context after host proxy side effects.

Both paths share owner-local camera-to-Phase4 mapping composition. Existing
`createViewportMapping2D`, `projectPointToViewport2D`, `viewportPointToScreen2D`
perform projection, axis conversion and validation; no second formula or new math
DTO. Camera source is the selected scoped scene plane. Input must match its exact
project/space/unit/axes; there is no identity fallback or plane registry. Matching
labels are declarations, not proof of authored registry membership. Only the
existing orthographic camera configuration is accepted. Right/up source flips Y
against the right/down CSS viewport; center anchors the viewport midpoint.

Screen output is null unless host supplies the existing explicit screen plane,
origin and positive per-axis scale. No DOM lookup or inference from canvas target,
page/client origin, scroll, CSS transform or device ratio. Caller owns measurement
and identifies the chosen screen plane. Off-viewport coordinates are valid; no
clamp, visibility, clipping, culling, collision, picking or arbitrary 3D inverse.

Invalid dimensions, plane/units/axes, disposed/unconfigured camera, unsupported
projection and bad context throw TypeError; canonical finite arithmetic overflow
and numeric limits throw RangeError. Unknown host exceptions propagate. Reads do
not mutate camera, viewport, authored content, document revision/dirty state,
gameplay positions, Phase8 visual transforms/depth keys or Phase7 leases. Host
proxy side effects are outside that guarantee. No resource is acquired/consumed,
so lease expiry is inapplicable. No native-camera application, frame request,
invalidation or scheduling is introduced.

See [manual instructions](../manual/camera-projection.md) and
[checkpoint evidence](../../harness/checkpoints/camera-v0.9.6.md). Pure numeric
observations do not establish integrated GPU or visual acceptance.
