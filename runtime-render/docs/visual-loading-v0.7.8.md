# v0.7.8 — In-flight PNG load scope

Runtime Render is the sole canonical owner. Four additive package-root symbols:
`createPngLoadScope`, `PngLoadScope`, `SharedPngLoad`, `SharedPngLoadSnapshot`.
No existing signature/member removed. The standalone source and PNG factories keep
their single-use independent allocation semantics; sharing is explicit opt-in.
The PngImageDecode capability documentation now also describes canonical waiter
capabilities produced by this new factory. Its shape/stage/failure contract is intact.
The old PNG budget validator is reused internally, not replaced or exported at root.

## Audit and equality

Existing v0.7.1 source acquisition is host-authorized, coherent revisioned bytes.
v0.7.2 source load owns its copied bytes and cannot abort host IO. v0.7.3 PNG decode
owns one native bitmap, closes unwanted late results and exposes no bitmap at root.
v0.7.4 uploads synchronously to one canonical graphics session, rejects a disposed
backend before borrowing a bitmap, and keeps texture/native cleanup session-local.
v0.7.5-7 atlas parsing, revision lookup and geometry remain separate and unchanged.
Three0.186.1/@types0.186.0 and all manifests/locks stay unchanged.

`createPngLoadScope(provider)` captures one provider read method and authority
namespace (projectId/providerId/authorizationGeneration). Each explicit instance
has its own pending Map; no cross-instance sharing even if providers reuse symbols.
Hosts must create a new scope when their grant/root changes and enforce current
permission inside read, including before returning bytes. A locator is not permission.

`scope.acquire(descriptor, sourceIndex, expectedRevision, limits)` detaches the
validated descriptor and canonical bounded PNG limits. Only image roles are admitted.
Expected revision must be explicit nonblank text; the observed response revision
must equal it exactly, else source-stage REVISION_MISMATCH (no decode). It is a host
freshness expectation, not an instruction to retrieve a historical version. Existing
provider request shape is unchanged. Hosts need a known revision/invalidation value;
unknown mutable content is not safely deduplicated by this API.

Within one scope the equality key includes the complete captured descriptor,
sourceIndex, exact expected revision, maxBytes/maxDimension/maxPixels and the fixed
browser-png-v1/from-image/alpha-none/color-none/no-resize profile. Descriptor includes
project/resource identity, source roles/order/locators and media hint. Full-descriptor
equality is deliberately conservative: unrelated source changes can prevent sharing.
Different revision, budgets/options, provider scope or authorization never join an
existing job. Decode options are currently fixed, not silently caller-configurable.
GPU sampling/color/session are not CPU equality fields because this API shares NO
GPU operations. Hosts upload independently through existing uploadPngTexture.

## Waiters, settlement and cleanup

Acquire starts/join source+decode work, returning a fresh waiter ID, snapshot and
result Promise. All matching pending waiters observe one source/decode pipeline.
Known source/decode failures resolve typed failed snapshots; unexpected provider/
native errors reject each active Promise with the same original error, failure:null.
Hosts must await/catch each waiter. Failure entries are removed before notification:
a later acquire always retries rather than joining poisoned work.

Releasing a pending waiter resolves its own Promise to released immediately. It
never rejects another waiter or aborts a job with remaining owners. This is a new
waiter contract, NOT a change to the older standalone source/decode release API.
The last waiter removes its pending entry, releases source/decoder and discards late
source data without adoption. Provider has no abort signal: actual host IO may still
finish/reject. The internal pipeline handles late rejection after all waiters release;
there is no hidden unhandled Promise. The existing decoder closes a late bitmap.
Late cleanup/error after all owners release is not delivered to canceled waiters;
this API does not provide a retained orphan-job diagnostics store.

On successful decode the entry is removed BEFORE delivering per-waiter canonical
PngImageDecode capabilities. These are independent handle/IDs over one private
bitmap, accepted by the existing upload API via its private synchronous borrow guard.
Releasing waiter or image is the SAME ownership release. One release cannot close
another active waiter's bitmap. Last owner closes once using existing native cleanup
semantics; throwing close remains terminal. Released image cannot be uploaded.
Image cleanup observations describe the shared bitmap: released/owned can mean
other owners still retain it; after last close it reports closed/close-failed.
No bitmap/native texture/provider object escapes the public outcome.

Source bytes are released after decode (and on failure/abandonment). Successful
bitmap remains only for explicit consumer ownership. Registry holds pending jobs
only, with no settled lookup, TTL, eviction, prefetch or long-term CPU/GPU cache.
A new acquire after settlement performs new IO/decode even while prior decoded
owners remain alive. A canceled old completion cannot delete a replacement entry.
`scope.dispose()` closes acquisition and releases all PENDING waiters; already
settled decoded owners remain the caller's responsibility to release. Repeated
scope/owner release is idempotent. No global singleton or resource catalog.

## Graphics boundary and host responsibility

The coordinator accepts no graphics session and schedules no upload/frame. CPU
ownership is independent of any one context. A host must release its waiter when
its intended session/preview goes away; it must also catch its result. If another
consumer remains, decode can still complete for that owner. If none remains, late
resources are released by the existing decoder path. Scope dispose can release all
pending waiters at host shutdown. Disposing only a GPU session does not revoke a
separate CPU owner; release it explicitly rather than orphaning it.

Even if a host later tries upload with a stale/disposed session, existing
uploadPngTexture rejects before native upload. No automatic late upload can occur
inside this new scope. There is no GPU sharing across contexts and no change to
context-loss reservation/quarantine/texture cleanup policy. Browser/GPU timing and
shared successful decode lifetime have not been observed in this environment.

See [finite manual consumer](../../editor/manual/inflight-png.md) and
[checkpoint](../../harness/checkpoints/visual-loading-v0.7.8.md).
No change to prepareVisualResource (synchronous NOT_PERFORMED), authored references,
atlas format/geometry, scene objects, gameplay, dependencies, checker or CI policy.
