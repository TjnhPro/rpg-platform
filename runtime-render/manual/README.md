# Manual Render consumers

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
