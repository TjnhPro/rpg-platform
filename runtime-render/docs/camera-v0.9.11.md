# CM18 — camera failures and terminal ownership

Runtime Render is the sole owner. This checkpoint strengthens existing terminal
cleanup without changing public signatures, closed unions, dependencies or math.
No new camera error classifier is required by a current consumer. Camera admission
retains TypeError/RangeError; do not parse exception messages as stable codes.
Host exceptions propagate; getRenderFrameFailure(undefined/unrecognized) is not
success. getRenderVisualDiagnostic on caught camera admission errors intentionally
returns unknown/UNKNOWN_FAILURE, with cleanupFailed null, never host message data.

| Failure | Existing result / policy | State and lifetime |
| --- | --- | --- |
| Unsupported camera/projection kind | TypeError | No camera/configuration adopted |
| Nonfinite center, invalid zoom/limits, malformed records | TypeError | Previous exact camera/view and revisions retained |
| Plane/project/unit/axes mismatch | TypeError | No fallback conversion, no mutation |
| Invalid logical width/height, invalid bounds | TypeError | No camera commit or native draw |
| Bounds policy excludes requested view | rejected + CENTER_OUTSIDE_BOUNDS or VIEW_EXCEEDS_BOUNDS | Both center and zoom unchanged |
| Numeric overflow, inverse ratio cutoff/residual, singular ground basis/frustum | RangeError | No pure commit; no arbitrary 3D inverse |
| Missing selected plane or elevation | TypeError | Never infer world height from a pixel |
| Stale/copied/foreign accepted resize receipt, suspended/terminal viewport | TypeError in camera viewport admission | Rejection before native frame; host must refresh explicit context |
| Disposed CPU camera or camera binding | TypeError | Historical snapshots readable; disposal idempotent |
| Disposed session public operation | RenderFailure SESSION_DISPOSED, original stage | Session remains terminal |
| Nested frame/edit, suspended frame | Existing Phase6 FRAME_IN_PROGRESS / VIEWPORT_SUSPENDED | Admission rejection, no repair/queue |
| Released/foreign/revision-mismatched resource on binding | Existing Phase7/8 binding family | Prior instance binding retained; camera owns no resource rights |
| Already retained resource becomes unusable during native draw | FRAME_FAILED or original unknown exception | Phase6 terminates graphics; no submitted receipt |
| Actual native context loss | CONTEXT_LOST at renderFrame, cleanup uncertainty retained | Scene/binding terminal, no automatic recovery |
| Native application failure | Existing branded frame error or original unknown exception | failed snapshot; unknown diagnostic null is not success |
| Cleanup failure | Existing CLEANUP_FAILED/cleanupFailed observation | Quarantine remains; no GPU reclamation/leak-free claim |

Source paths are camera*, viewport-mapping, frame-session/frame-failure,
visual-scene/render-texture/visual-resource-cache and three-frame. An unknown plane
means a mismatch with explicit camera source, not failed registry lookup.
CPU camera state is intent; a failed frame does not roll back a previously accepted
CPU update or claim that its view was applied. Only exact successful receipts have
getRenderCameraFrameSnapshot evidence; historical receipts do not prove current health.

On session teardown, unlink the camera dispatch weak entry and latest accepted
resize receipt before listener/backend cleanup. Existing detach closures remain
usable for their own teardown. Scene end first deletes its association and clears
listeners, then attempts every captured callback; rethrow the first exception after
all attempts, even if the thrown value was undefined. Scene drain/backend cleanup
still run via existing finally/owner paths. No user/native failure is suppressed
or reclassified as success. Camera binding end clears live references and all
unsubscribe/detach slots before calling them. A CPU camera can remain active after
its binding ends; this is deliberately separate from session/scene disposal.
Native OrthographicCamera and other backend references are cleared by Three owner;
borrowed canvas/context lifetime is browser-owned. Cleanup uncertainty is sticky.

Compatibility examples are in the public-root manual consumer:
original Phase4 projection maps (12,23) to (104,209); binding-only session disposal
still yields SESSION_DISPOSED/getSnapshot; the original exhaustive Phase6 code
switch compiles unchanged. Pure camera failures are not added to that union.
Render231, Editor138, Client0 root declarations remain exactly unchanged against
v0.9.10. These specific checks do not establish universal behavioral compatibility.

Root import in Node ES2022 does not instantiate browser graphics or load Three;
pure consumers compile without DOM library or ambient browser types. No native
Three/DOM types occur in neutral public declarations. Editor/Client remain public
consumers, Engine/Server/L1/L2 are unchanged. No gameplay positions or authored
placement/Document state are camera mutation targets.

See [manual evidence procedure](../manual/camera-diagnostics.md) and
[checkpoint](../../harness/checkpoints/camera-v0.9.11.md). Native context loss,
listener cleanup, real GPU resources and visible pixels remain NOT_OBSERVED in
this environment. Build and static inspection do not prove leak freedom or feature
acceptance. No generic diagnostics framework, telemetry, recovery shim or tests.
