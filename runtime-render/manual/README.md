# Manual Render target consumer — v0.6.1

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
