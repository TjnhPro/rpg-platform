# Manual Render consumers

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
