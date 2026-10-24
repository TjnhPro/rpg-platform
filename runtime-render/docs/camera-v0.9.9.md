# CM15 — Optional bounds and atomic transitions

Canonical owner: runtime-render. No Engine/Server/L1/L2 dependency or edits;
Editor/Client consume the same Render root without copied bounds/projection math.

## Contract and deliberate policy

`transitionRenderCameraWithinBounds(camera, logical, input, accepted)` is an opt-in
CPU state update. Input requires exact current issued `cameraView`, absolute target
`zoom`, `movement`, and `bounds`. Movement is `{kind:'center', target}` scoped to
the source plane, or `{kind:'pan', request:{plane,delta}}`. Pan uses the existing
canonical finite/absorbed-component policy. Center and zoom publish atomically
through the existing camera commit seam, view revision once if changed, identity
preserved for no-op. No intermediate outside-bounds center/zoom is published.

Bounds is explicitly `{kind:'disabled'}` or `{kind:'rectangle', plane, min, max,
movement:'clamp'|'reject', oversized:'reject'|'center'}`. min/max are ordered numeric
coordinates, regardless of axis directions, with finite min<max on both axes.
Plane exactly matches camera source project/space/unit/axes. These are camera view
bounds, not pixel viewport rectangles, authored map dimensions, physics colliders,
navigation, fog of war or gameplay authority. No unit conversion/defaults.

At target zoom and current explicit logical width/height, Render builds a zero-
centered mapping and uses Phase4 viewport inverse at opposite corners to obtain
source-space visible offsets. Orthographic axes/independent scale mean those
corners determine the entire rectangle. The feasible center interval per axis is
`[bounds.min - offset.min, bounds.max - offset.max]`. This includes zoom, aspect,
per-axis scale and axis signs, not only the requested center. No double DPR.
Final candidate mapping is inversely inspected again before committing; every
non-oversized axis must contain the complete view, with conservative numeric rejection.

- `movement:'clamp'`: project requested center into the feasible interval.
- `movement:'reject'`: return `rejected / CENTER_OUTSIDE_BOUNDS` if outside it.
- `oversized:'reject'`: any view span larger than bounds returns
  `rejected / VIEW_EXCEEDS_BOUNDS`, taking precedence over center admission.
- `oversized:'center'`: center each oversized axis on map midpoint, admitting
  deliberate overscroll and reporting `oversized-centered`, never `contained`.
  Other axes still obey movement policy; their rejection rejects the whole request.

Result `RenderCameraBoundsTransitionResult` contains before/view, requestedCenter,
target-zoom visibleSpan, captured metrics/policy and nullable `admittedViewport`.
That viewport is PRE-transition Phase6 admission evidence, never new GPU state.
Rejected results retain the exact before view, reason and `not-applied` containment;
success is updated/unchanged with contained/oversized-centered/unrestricted and
reason null. On rejection visibleSpan describes requested zoom, not retained view.

## Freshness, resize and compatibility

Policy is PER REQUEST, not registered or persisted on the camera. Old update/pan/
center/zoom/focus methods remain unrestricted, and can leave earlier bounds. All
callers requiring bounded motion must use this adapter consistently. No hidden
map schema, sticky policy/manager, subscription, automatic fit or teleport.
Resize alone never changes camera state. After resize or independent zoom changes,
submit a fresh transition with current issued view and current dimensions; reject
preserves state even if its old view no longer fits. Explicit clamp/oversize-center
may reposition only when requested. Repeating the same clamped/centered request
is a no-op; no background oscillation. Zoom itself is never silently clamped.

Required null accepted context is logical-only. Non-null must pass the existing
same ready Phase6 session/latest resize receipt and exact logical CSS dimensions;
no fallback from rejected native evidence. Exact current camera view required,
including zoom-only changes; copied/foreign/stale requests fail. Recheck context
after host capture before either policy rejection or compare-and-commit. A stale
request carrying old bounds is rejected by its view/receipt, but raw rectangle data
has no authored revision/registry: host remains responsible for fresh map intent
and honest current measurements. A valid rectangle is not a map attestation.

Bounds constrain camera's declared SOURCE plane. For CM14 oblique composition that
is the presentation plane, not unprojected ground. This rectangular policy does
not claim containment of an arbitrary ground polygon or all elevated sprites.

Invalid/stale/mismatched/unsupported inputs throw TypeError. Zoom outside its
declared limits, pan absorption/overflow, nonrepresentable intervals/spans or
failed canonical inverse/final containment throw RangeError. No partial commit,
numeric clamp fallback or source accuracy guarantee; host proxy side effects are
not rolled back. Unknown host exceptions propagate. Phase4 inverse cutoff/residual
semantics remain unchanged, binary64 error remains possible. Extreme coordinates
may be conservatively rejected even for mathematically feasible rectangles.

Five additive root names: function, `RenderCameraBoundsPolicy`,
`RenderCameraBoundsMovement`, `RenderCameraBoundsTransitionInput`,
`RenderCameraBoundsTransitionResult`. Old root declarations/unions unchanged.
Owner-local pan helpers are shared by old pan and this adapter, and a private
compare-and-commit operation uses the existing single atomic state seam. No new
camera registry, alternative renderer, frame scheduling, resource lease, geometry,
Scene/Document/anchor/depth/gameplay mutation, follow smoothing, streaming or UI.

See [manual proof](../manual/camera-bounds.md) and
[checkpoint](../../harness/checkpoints/camera-v0.9.9.md). Build-only policy;
integrated rendering remains FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED.
