# Manual Render consumers

## Viewport identity / independent sessions — v0.6.4

After building and serving the workspace as below, open
http://127.0.0.1:8080/runtime-render/manual/viewport-identity.html.
The genuine Render build compiles this typed public-root consumer. No assertions,
test runner, mock engine or automatic frame. **Not browser-executed at v0.6.4.**

Acquire A and B explicitly on their separate host-owned canvases. Observe both:
each acquisition starts uninitialized, then active if acquisition succeeds, or
unavailable if it fails. Active size describes the last configured native drawing
buffer in drawing-buffer-px, not CSS pixels, a world coordinate or live DOM query.
Actual browser allocation may differ from requested canvas attributes. Active does
not assert visibility, continuous GPU health, frame submission or displayed pixels.

Observe reports independentSessionIds and sameIdentity for acquisition/session
views. Symbol string descriptions alone are not identity; the logged boolean uses
actual symbol equality. Retained previous snapshots are historical immutable data.
Dispose A, then Observe: A should become terminal with size:null, while B retains
its own active state/size/identity. Reacquire A explicitly: its new identity should
differ from its preceding observation; B's remains unchanged. These are expected
review steps, not recorded outcomes or behavioral PASS. If graphics fails, record
the real diagnostic; do not claim two active viewports from compilation alone.

Terminal snapshots remain readable after clean/failed disposal or native context
loss via the same graphics lifecycle. `getRenderViewportSnapshot` accepts only
real acquisitions/sessions created by this package instance; metadata-only,
fabricated and foreign handles are rejected with TypeError without invoking them.
It does not acquire, resize, suspend, dispose or select a global viewport.

Suspended is a distinct reserved contract state; **no suspend/resume operation or
suspended producer is implemented in this checkpoint**. Hiding a canvas or pausing
host frame requests does not silently change its Render state. Resize/DPR/layout
synchronization is also absent: do not mutate canvas buffer attributes while held
and expect automatic synchronization. Release before replacing/removing a target.
There is no Scene/Document binding, serialization or dirty-state side effect.
Page exit requests release, including late acquisitions.

## Context loss / explicit recreation — v0.6.3

Use the graphics lifecycle page below. This is an optional manual procedure, with
no runner, assertions, polyfill or production loss/recovery backdoor. The build
compiles the consumer; **no browser run is recorded for v0.6.3**.

1. Begin acquisition on the canvas. If it fails, record the actual diagnostic and
   stop: no ready context exists to lose. If ready, optionally request one frame.
2. In browser DevTools, explicitly obtain the existing context and optional native
   extension (this command belongs only to the reviewer, not the public Render API):

   ```js
   const gl = document.querySelector('#canvas').getContext('webgl2');
   const loss = gl?.getExtension('WEBGL_lose_context');
   ```

   If null/unavailable, record CONTEXT_LOSS_NOT_EXERCISED. Do not substitute a fake
   event, mock or guessed PASS. If supported, call `loss.loseContext()` yourself.
3. Wait for the actual webglcontextlost log. The host permits browser restoration
   with preventDefault; Render checks native isContextLost, terminates the session,
   attempts cleanup and removes its listener plus Three's listeners via dispose.
   Expected observation after event dispatch: failed / CONTEXT_LOST / renderFrame,
   cleanupFailed false on clean cleanup, true if cleanup failed. Inspect reservation:
   unreserved only after clean cleanup; in-use if quarantined. These are expected
   contract outcomes, not recorded observations. A frame request before event
   delivery also checks native loss and must return no submitted receipt on loss.
4. Request one frame on the old handle: expect SESSION_DISPOSED/getSnapshot, no
   receipt. Explicit Dispose is idempotent and retains the terminal loss diagnostic.
   It does not retry cleanup or remove a failed-cleanup quarantine.
5. After loss event delivery, optionally call `loss.restoreContext()` in DevTools.
   Restoration is asynchronous and may be refused by browser/driver. Wait for the
   actual restored event; until then a new request can fail GRAPHICS_UNAVAILABLE.
   The old snapshot remains failed and its session remains terminal even after
   restoration. There is no automatic Render/Three recreation or asset upload.
6. Only after a restored event and an unreserved usable target, click Begin again
   for an explicit new session (new symbol). A submitted receipt from that request
   is still not proof of displayed pixels. If quarantine persists, choose a fresh
   host target/page; never force-release or promise that GPU memory was recovered.

Record browser/version, actual state/failure/reservation output, extension support,
event ordering, cleanup results and any visible frame separately. Restoration,
failure cleanup and GPU recovery are NOT_VERIFIED until actually observed. Loss
occurring after the final synchronous frame check can only be detected later;
a submitted receipt is not a future context-health guarantee.

Reference: [Khronos WEBGL_lose_context specification](https://registry.khronos.org/webgl/extensions/WEBGL_lose_context/)
defines asynchronous restoration and its preventDefault prerequisite. The installed
Three0.186.1 WebGLRenderer adds lost/restored listeners and removes them in dispose;
the private Render backend uses that cleanup, not a competing recovery engine.

## Graphics lifecycle — v0.6.2

After the workspace build, serve the root as below and open
http://127.0.0.1:8080/runtime-render/manual/graphics-lifecycle.html.
Its TypeScript browser entry is compiled by the genuine Render build, imports the
public package root, and is isolated from the package root's module evaluation.
No assertions, mocks, test runner or automatic frame loop.

Begin acquisition reports pending, then ready or failed from the same operation.
Unsupported object selects a real acquisition failure, not a simulated backend.
On browser canvas, actual WebGL2 availability determines fulfillment/rejection.
Observe reads the current immutable graphics snapshot. Binding still says bound
on a ready session. Request one frame explicitly calls renderFrame; submitted is
not displayed/visual PASS. Dispose reports terminal disposed (failure retained if
cleanup throws); a later Request one frame uses the old handle and reports existing
SESSION_DISPOSED/getSnapshot without submitting. Repeated disposal does not erase
the terminal failure. Begin again is an explicit new request, not implicit recovery.
Dispose while pending/page exit releases the late result; it does not cancel the
backend request. Failure snapshots may have failure:null for unknown exceptions;
the result Promise still rejects and the consumer reports UNRECOGNIZED.

Browser sequence is supplied for manual review; build evidence does not establish
these outcomes occurred on a real GPU. No browser run is recorded at v0.6.2.

## Target capabilities consumer

From the workspace root, build with `npm run build -- --force`, then serve the
workspace locally, for example `python -m http.server 8080 --bind 127.0.0.1`.
Open http://127.0.0.1:8080/runtime-render/manual/target-capabilities.html.
This optional browser consumer uses only the Render public root, with the same
installed Three ESM mapping as the existing Editor demo. No test/assertion runner.

Choose a target and click Inspect: native same-realm canvas reports supported;
zero width reports invalid dimensions; an object reports unsupported; null reports
invalid-target. Nothing calls getContext, draws or reserves from inspection.
Dimensions are native buffer attributes, not CSS measurements or a resize policy.

Acquire explicitly requests the existing graphics factory and reports its safe
failure getter. A missing/lost WebGL2 context is GRAPHICS_UNAVAILABLE, not a target
capability failure. Invalid references use existing INVALID_HOST_TARGET; unsupported
objects/empty canvas retain existing UNSUPPORTED_TARGET acquisition diagnostics.
Capability inspection supplies the finer target/dimension distinction without
changing the old error unions. Unknown exceptions stay unknown.

With an acquired session, click Acquire same target again: the existing exclusive
reservation rejects with TARGET_IN_USE and the first reservation remains in-use.
Click Dispose to release; Inspect can observe the current reservation. In-use also
includes pending acquisition and cleanup-failure quarantine, not just live handles.
Unreserved is a momentary observation, never a readiness/reuse guarantee. Snapshot
graphics is always NOT_CHECKED, even when this host holds a session.

Both elements, CSS/layout and host listeners belong to this HTML consumer. Render
never appends/removes them. Dispose releases Render resources, not the native
canvas/context lifetime. Page exit releases any held or late-acquired session.
No frame is requested by this consumer. No image or visual PASS is claimed.
No OffscreenCanvas/cross-realm/worker/fallback support is implied.
## Viewport resize — v0.6.6

Build the workspace and serve the root (`python -m http.server 8080 --bind 127.0.0.1`).
Open http://127.0.0.1:8080/runtime-render/manual/viewport-resize.html.
The compiled TypeScript entry uses only the public Render root. No automatic
resize/frame loop, assertions, test runner, mocked context or forced PASS.

1. Acquire: initial native dimensions come from the existing 800x450 canvas, not
   CSS measurement. No logical size or host ratio is inferred on acquisition.
2. With explicit ratio1, click Resize800x450, then Resize600x400. Observe actual
   snapshot extent and receipt; sameIdentity compares real session symbols.
   Host inline CSS stays800x450, so the backing buffer is displayed stretched.
   Request one frame after resize to inspect the opaque blue clear manually.
3. Repeat accepted request: unchanged means no buffer attribute writes, with
   native extent rechecked and a fresh frozen receipt. No renderer/context recreate.
4. Set ratio2 and click Resize800x450: within host/native budgets, requested
   candidate1600x900. Receipt records native accepted size and per-axis effective
   ratio; native limits/allocation can reject or accept smaller than requested.
   CSS still800x450. Fractional positive CSS/ratios use the RV07 floor policy.
5. Invalid zero width prints INVALID_REQUEST (TypeError). Excessive ratio prints
   REJECTED_REQUEST (RangeError). Snapshot/reservation should stay unchanged;
   request another frame to inspect continued usability manually.
6. Dispose, then try resize: existing SESSION_DISPOSED/getSnapshot. Terminal
   snapshot has size:null. Reload to acquire a new session. Disposal during pending
   acquisition/page exit releases its late result. No cancellation/recovery claim.

Backend admission additionally queries MAX_VIEWPORT_DIMS/MAX_RENDERBUFFER_SIZE
before mutation; exceeding these rejects with RangeError. Recognized lost context
uses CONTEXT_LOST/resize and existing terminal cleanup; native loss events may have
already terminated the session, in which case the disposed guard takes precedence.
Failure after mutation clears the active extent and attempts existing cleanup,
without claiming rollback. RESIZE_FAILED/resize covers known invalid native result
or GL error; unknown native exceptions remain unknown. Clean cleanup releases the
target reservation; failed cleanup quarantines it as before. No success receipt
on failure. Native accepted configuration is not GPU-idle, submitted or displayed
evidence. No allocation guarantee follows from pixel-count budget/context limits.

**Compiled, not browser-executed** at this checkpoint. Real resize/repeated resize,
native limits, loss/failure cleanup and visual clear remain FEATURE_NOT_VERIFIED /
VISUAL_NOT_VERIFIED. Developer records actual browser/GPU observations separately.

## Viewport size validation — v0.6.5 (historical checkpoint)

After building, run `node runtime-render/manual/viewport-size.mjs` from the root.
This optional public-root consumer prints real pure-API results, without assertions,
canvas, mocks or graphics. **VALIDATION CONTRACT ONLY: no resize is implemented.**

Host supplies logicalWidthCssPx/logicalHeightCssPx and requestedPixelRatio explicitly.
800x450 at 2 yields a **candidate** 1600x900 (1,440,000 pixels), not a GPU allocation.
Positive fractional CSS sizes/ratios are valid: 800.25x450 at 1.5 floors to 1200x675;
planned effective x=1200/800.25 differs from requested 1.5, y=1.5. No integer-only
CSS requirement, automatic DPR, rounding-to-nearest or adaptive clamp.

Zero/negative/nonfinite metrics and fractional/nonpositive/unsafe integer limits
throw TypeError. Rounded-empty size, overflow, signed-32-bit dimension budget
overflow and exceeded width/height/total-pixel budget throw RangeError. No silent
clamp, fallback ratio or partial plan. Zero means no positive drawable plan;
this function does not suspend a session. Caller can retain its previous plan.
Records are detached/frozen. Supplied maxPixelCount bounds pixel-driven memory
pressure, not total GPU bytes: depth/stencil, multisampling, driver padding and
other resources are not measured or allocated. No memory availability guarantee.

Limits are caller admission budgets, **not detected backend capabilities**. Current
backend at v0.6.5 did not query MAX_VIEWPORT_DIMS/MAX_RENDERBUFFER_SIZE or resize. Future
Render application must combine actual context limits and budgets, avoid applying
ratio twice, and read actual drawingBufferWidth/Height after allocation before
claiming accepted metrics. Do not set canvas.width/height externally on a live
session or feed this candidate into a viewport snapshot. Existing session snapshots
remain last configured native extents; actual logical CSS size/ratio is unknown.
No CSS style/layout writes or Phase4 screen/scene conversions occur here.
