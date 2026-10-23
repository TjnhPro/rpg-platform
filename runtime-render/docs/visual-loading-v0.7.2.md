# VL02/VL04 — asynchronous source loading lifetime

Canonical owner Runtime Render. Editor supplies only an optional finite manual
host trace; Editor and Client compile against the additive root. The supplied
v0.7.2 task authorizes this boundary, with no dependency/ownership move or L1/L2 API.

## Actual API delta

Three added root symbols, Render77 ->80: createVisualSourceLoad,
VisualSourceLoad, VisualSourceLoadObservation. Editor134/Client0 unchanged.
createVisualSourceLoad(descriptor, sourceIndex, provider, maxBytes) validates and
captures the existing source request, returns a new independent single-use handle,
and performs no IO until start(). Invalid capture throws synchronously with the
existing validation error; it does not create a failed pseudo-resource.

| Surface | Contract |
| --- | --- |
| getSnapshot() | Frozen historical observation, request-local symbol id and stage:source |
| start() | requested ->pending immediately; provider dispatched in a Promise microtask; repeats return the same completion before release |
| source-acquired | Validated/copied source bytes owned by the handle; snapshot holds request/revision/media/length only |
| copyBytes() | Fresh independent caller-owned Uint8Array only while acquired; null otherwise |
| release() | Terminal/idempotent, clears captured invocation, pending request, owned bytes, stored completion and current source metadata |

Observations distinguish requested, pending, source-acquired, failed and released.
No generic ready state, decoded-image or GPU usability exists here. Retained old
snapshots/settled completion results contain metadata only, never byte buffers or
providers. A caller-held copy survives release and must be dropped by that caller.
copyBytes can allocate another bounded source-sized copy each time; there is no
global memory/concurrency budget or shared ownership claim.

## One source admission path, compatibility and errors

The existing v0.7.1 validation/provider capture and response length/media/copy
admission are factored into package-private helpers in visual-source.ts. They
are not package-root exports or additional IO implementations. Existing
acquireVisualSource signature/results and normalization semantics remain intact:
provider rejection ->PROVIDER_FAILED, unexpected response exception ->INVALID_RESPONSE.
The old convenience API has no owned lifetime to release; caller owns its result.

The new handle directly preserves unexpected errors from the same captured
provider invocation/response admission. start() rejects with the original thrown
value (no message parsing, wrapping or WebGL inference); the safe observation is
failed/failure:null. Explicit typed host denial/missing/cancelled/too-large and
Render-detected malformed/media/length failures resolve a failed observation with
the known source code. Null means unknown, never success. No new graphics error
classifier/union is added. Caller must handle the started Promise even after release.

prepareVisualResource is still synchronous metadata-only/NOT_PERFORMED. Existing
VisualResourceDescriptor, provider port, Editor Asset/reference schemas, Phase6
RenderFrameSession factories/disposal/context-loss and dependency pins are unchanged.
Source loading does not allocate or replace a graphics session, and context loss
does not implicitly release unrelated source-only requests. Future texture work
must join canonical graphics cleanup explicitly at its authorized checkpoint.

## Release, late completion and retention

Before start: release clears the captured provider and metadata; later start
resolves released without invoking the provider. Between start and dispatch:
the same release gate avoids host IO. During host IO: release immediately clears
owned references and makes the handle terminal. An already-started Promise still
waits for host settlement; Render has no abort signal or timeout contract. A host
that never settles can retain its own IO state and leave that Promise pending.
Render clears the provider closure after dispatch and clears pending metadata/bytes
on release; the remaining settlement callbacks hold only the emptied lifetime cells.

Late fulfilled responses are discarded before inspecting/copying their bytes; the
started Promise resolves released, never source-acquired. A second terminal check
after response admission prevents a trusted host accessor's reentrant release from
publishing success. Late unexpected rejection still rejects that previously
started Promise with the original error, while the current snapshot stays released.
Subsequent start after release returns released and cannot retry/revive the request.

No bytes are retained on known failure/unknown rejection. Normal release drops the
one handle-owned source buffer; host retains/retires its original bytes/IO handles
under v0.7.1's stability rules. Complete buffers have no native cleanup callback.
This is explicit reference clearing, not deterministic garbage collection, secure
zeroing, process memory measurement or an absolute no-leak guarantee.

Independent handles always issue independent reads. No cache/dedup/global loader,
queue, event bus, shared in-flight cancellation, lease manager or GPU work is added.
This single-owner source lifetime does not prescribe future shared-cache leases.

## Observable manual evidence

[Editor manual guide](../../editor/manual/visual-source-load.md) compiles and runs
a real root-only consumer over an explicitly authorized bounded snapshot of the
committed Editor manifest. It traces two independent acquisitions/release, a real
host-delayed snapshot delivered after release, missing source, original host error
identity and release before start. No assertions/test framework or CI runtime job.
The supplied manifest is genuine JSON source bytes, not a PNG or fake atlas fixture.
Decode, texture upload, image display, TPSheet compatibility, browser integration,
and graphics resource lifetime remain unverified. See the checkpoint for command
exit codes, actual observations and the exact-head PR CI ledger.
