# v0.7.9 — Scoped resource caching and leases

Runtime Render is the canonical owner. Six additive root exports:
`createVisualResourceCache`, `ResourceCacheLimits`, `VisualResourceCache`,
`VisualResourceCacheSnapshot`, `VisualResourceLease`, `VisualResourceLeaseSnapshot`.
Render115 ->121; Editor134/Client0 unchanged. No previous signature removed or
changed. Standalone source/decode/upload and v0.7.8 pending-only scopes remain
independent. The new factory composes that loader and existing texture upload;
it does not replace either implementation or introduce a second backend.

## Source audit

Current Three0.186.1 backend owns one WebGLRenderer per canonical session.
Its existing texture path allocates native WebGLTexture directly, performs bounded
texImage2D with GL error checks and resets Three state around the native work.
It does NOT allocate THREE.Texture. Thus cleanup continues via existing native
deleteTexture/createTextureLifetime, followed by renderer.dispose on session end;
there is no fictitious THREE.Texture.dispose call to add. Decoded ImageBitmap
ownership remains separate from GPU ownership. This agrees with the separation
in [official Three disposal guidance](https://threejs.org/manual/pages/how-to-dispose-of-objects.html),
which requires explicit texture disposal and separate ImageBitmap.close ownership.
Three/@types, manifests and lockfile are unchanged. No L1/L2 API is required.

Existing frame-session terminal cleanup already handles explicit disposal, native
context loss, backend error, texture cleanup failure and target quarantine. A new
package-private subscription on the same canonical session dispatch revokes cache
leases before backend cleanup. It is not a second session, public event bus or
host callback API. Sessions are weak dispatch keys; listeners are removed when
last cache entry in a session is retired. All listeners drain even on cleanup error;
failed cleanup feeds existing session cleanupFailed/quarantine diagnostics.

## Keys, reuse and freshness

`createVisualResourceCache(provider, {maxCpuEntries, maxGpuEntries})` captures a
single provider authority through createPngLoadScope. Separate cache instances
never share, even if the same provider/symbols are passed. New authorization or
project root requires a new scope and explicit disposal of old authorization use.
The host owns permission checks and known source revision/invalidation.

Acquire requires canonical session, validated descriptor, image source index,
explicit expected revision, bounded PNG limits and explicit texture options.
CPU key includes complete descriptor (identity, ordered sources/locators, hint),
index, exact expected revision, maxBytes/maxDimension/maxPixels and fixed native
decode profile. GPU key adds exact session identity, sampling and colorSpace.
Distinct contexts NEVER share native textures. Different GPU options reuse CPU
only; different CPU keys/revisions/options never reuse a stale decode. An observed
source revision mismatch fails REVISION_MISMATCH before decode, as in v0.7.8.

A cache hit reuses an existing live allocation while returning a fresh independent
lease/texture capability. resourceId in usable lease observation is the shared
allocation identity, not the independently branded texture handle ID. Only texture
aliases escape; callers cannot release the underlying allocation or another lease.
Aliases work with getRenderTextureSnapshot/createAtlasTextureView. A borrowed atlas
view acquires no extra lease and must not outlive its owning lease.

A declared expected revision is a freshness assertion, not a live filesystem watch
or authorization renewal. Old content cannot be detected behind an unchanged host
revision. Hosts must advance the expected revision or replace the cache on grants
changing, and release obsolete owners. Old valid owners may coexist with a new
revision; they are never silently rebound. No polling or authoring catalog change.

## Lifecycle and retention policy

Each GPU entry holds one CPU usage right; each consumer holds one GPU lease.
Acquire same GPU key while pending joins the same entry; after settlement reuses
that entry until the last lease releases. A new session or GPU option holds another
CPU right but reuses decoded CPU data while it is still owned. CPU source bytes
are released after decode by v0.7.8; only decoded bitmap remains cached.

Zero leases -> remove GPU entry synchronously, release native texture once, drop
its CPU right. Zero CPU rights -> remove CPU entry and release its decoded owner,
closing bitmap through existing decoder semantics. No idle retention, TTL/LRU,
automatic prefetch or eviction of live users. Explicit admission bounds count
pending and settled entries: CPU1..1024 and GPU1..4096, caller selects smaller
limits. New distinct entry over capacity throws RangeError before IO; reuse still
works at capacity. Existing per-image budgets bound admitted bytes/dimensions;
entry counts are NOT actual byte usage or GPU memory measurements. Admission limits
bound indexed ownership, not abandoned provider IO that cannot physically abort. Consumer
lease objects are caller-owned; hosts must bound/release their own acquisitions.

A lease releases idempotently via lease.release OR its texture.release, using the
same ownership right. Release of one keeps other consumers usable. Result resolves
released/invalidated immediately if canceled before completion. Terminal reads
remain available; prior returned snapshots and resolved Promises are historical,
so inspect getSnapshot again before use. Cleanup failure is sticky in cache and
entry observations; native exceptions propagate rather than claiming cleanup PASS.
Aliases retain terminal native cleanup observation (owned/deleted/delete-failed);
logical release while others own the resource does not mean it was deleted.

Session termination revokes only that session's entries, pending and usable;
CPU owners in other sessions survive. Callback runs after backend is detached
from new uploads and before native backend teardown. Every lease is invalidated,
all cleanup attempts drain, then existing backend/renderer cleanup runs. No host
session is disposed by cache.dispose; that method closes the cache, invalidates
its leases in all sessions and drains its CPU/GPU ownership. Explicit session
dispose still independently cleans noncached textures.

CPU dispatch is deferred one microtask so ownership/subscriptions are registered
before host read can reenter disposal. If no owners remain before dispatch, no
source IO starts. If provider read is already running it has no abort port: late
bytes/results are abandoned through v0.7.8, and no closed entry can upload or
resurrect. Reentrant upload disposal is guarded by canonical upload and entry
closed checks. Failure evicts before notification/retry; unknown host/native errors
reject still-pending results unchanged, known load/texture failures have safe typed codes.
If upload failure already terminated the session synchronously, session invalidation
wins and its leases resolve invalidated; inspect existing getRenderViewportSnapshot
for the canonical graphics failure/cleanup diagnostics. A previously settled or
invalidated result is never overwritten by a later error.
No orphan diagnostics store is added; detached late failures have existing loader
handling, not a fabricated cleanup-success receipt. All consumers catch result.

## Diagnostics and evidence limits

Snapshot exposes counts of currently indexed CPU/GPU entries/leases and saturating
sourceJobs/uploadCalls/cpuHits/gpuHits. GPU hits include matching pending requests;
sourceJobs count loader dispatch, uploadCalls count upload API attempts, neither
proves GPU completion. cleanupFailed:false means no observed synchronous cleanup
exception, not proven memory reclamation, leak freedom or native completion.

[Finite manual consumer](../../editor/manual/resource-cache.md) supplies 100 real
acquisitions and multiple native sessions for explicit manual execution. This run
compiled that consumer but did not execute a browser/GPU. Node admission/empty
cache observations cannot prove cache reuse, last-close or cross-context lifetime.
FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED. No Scene/Sprite/animation/VFX,
new schema, gameplay, test suite, dependency or checker/CI change.
