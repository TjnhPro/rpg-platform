# v0.7.10 - Explicit revision guards, limits and diagnostics

Runtime Render owns the implementation. Editor adds an optional public-root
manual consumer only; Client is a compile consumer. No L1/L2 API required.
Four additive root symbols: `invalidateVisualResourceCache`,
`getVisualResourceCacheFailure`, `VisualResourceCacheFailure`, `AtlasMetadataLimits`.
Render121 ->125; Editor134/Client0 unchanged. Existing handle methods stay intact.
`ResourceCacheLimits.maxRevisionEntries` and snapshot `revisionEntries` are optional
for structural compatibility; canonical snapshots always populate the count.
`parseUnityAtlasMetadata` accepts an optional fourth budgets argument. Old calls
retain the existing ceilings. No old error-code union or classifier is widened.

## Revision protocol

`invalidateVisualResourceCache(cache, descriptor, imageSourceIndex, nextRevision)`
requires a canonical cache and valid image descriptor/index/nonblank revision.
It performs no IO/decode/upload and never mutates or releases old leases.
In the fixed provider authority of that cache, the guard key is projectId +
resourceId + ordered sourceIndex, deliberately independent of locator/options.
Changing a locator cannot bypass an already-declared revision for that slot.
Reordering sources means changing logical slots; host must invalidate all affected
slots or replace the cache. This is not an authored catalog or a metadata cache.

Once declared, only that exact revision is admitted to NEW acquisitions of that
slot, before cache lookup/capacity/IO. Superseded revision -> branded TypeError
REVISION_SUPERSEDED; no stale fallback. Old pending/usable leases remain pinned
and complete/release under v0.7.9 ownership. Source/decode/parser failure for B
removes only B's work; valid A owners survive. Old pending A may still fail if host no longer serves A;
no archive of historical bytes is promised. If a GPU failure terminates the canonical
session, its A and B leases are both invalidated because no valid context remains;
this preserves Phase6 terminal policy, not a stale fallback. Capacity counts both A and B. If
there is no room for B it fails admission without evicting A.

Host must issue coherent exact-content revisions (e.g. digest of bytes). Setting
the same revision is idempotent, NOT forced reload. Explicitly setting A again
permits exact A reuse if still owned; this is caller-requested revision selection,
never automatic rollback after B failure. Changing bytes behind the same revision
cannot be detected. The API cannot revoke provider permissions; replace/dispose
the cache on authorization changes. Before the first explicit invalidation,
existing v0.7.9 expected-revision semantics remain unchanged.

Revision guards persist even after zero leases to prevent stale revival. They
are bounded by maxRevisionEntries (default maxCpuEntries, range1..4096), never
silently evicted. Existing guard updates work at capacity; a new slot throws
REVISION_LIMIT_EXCEEDED. Cache disposal clears guards and independently releases
all old/new rights through existing cleanup. Native deletion/bitmap-close errors
remain observable via v0.7.9; no cleanup receipt is fabricated.

## Real admission limits

| Layer | Configurable policy and actual enforcement |
| --- | --- |
| Host IO | Provider owns authorization and bounded reads before returning bytes; Render cannot limit allocations made inside arbitrary host code |
| Source/PNG | Existing maxBytes <=16MiB, maxDimension <=8192, maxPixels <=16M; PNG header admission precedes native bitmap decode; response length precedes Render byte copy |
| CPU/GPU ownership | Existing maxCpuEntries1..1024/maxGpuEntries1..4096 admission includes pending/old rights; no automatic eviction |
| Revision guards | maxRevisionEntries1..4096, default CPU bound; checks before adding metadata |
| Atlas | Optional maxBytesPerSheet <=1MiB, maxTotalBytes <=8MiB, maxPages <=64, maxFrames <=65536; positive safe integers, no ceiling increase |
| GPU | Existing decoded dimensions + native MAX_TEXTURE_SIZE before texture allocation; no total GPU-byte measurement |

Atlas checks sheet count before traversal, byte counts before copy/text decode,
and frame count before appending normalized frames. Acquired source bytes already
exist; string decode/splitting and browser decoder allocations are not a measured
heap budget. Existing binding256/line2048/dimension32768 ceilings remain. Snapshot
counts do not prove bytes saved, memory reclamation, performance or leak freedom.

## Diagnostic layers and safe presentation

| Observation | Safe domain |
| --- | --- |
| Cache admission | getVisualResourceCacheFailure -> cache stage; CACHE_DISPOSED, REVISION_SUPERSEDED, CPU_LIMIT_EXCEEDED, GPU_LIMIT_EXCEEDED, REVISION_LIMIT_EXCEEDED |
| Missing / denied / canceled IO | Existing source SOURCE_NOT_FOUND / SOURCE_DENIED / CANCELLED; host must report known condition |
| Coherence / decode | Existing source REVISION_MISMATCH; decode NOT_PNG, INVALID_PNG, DECODE_LIMIT_EXCEEDED etc.; unknown native exception remains rejected original + null diagnostic |
| Atlas malformed / frame bounds | Parser INVALID_HEADER/INVALID_FRAME etc.; geometry INVALID_FRAME_BOUNDS; resolver FRAME_NOT_FOUND is a missing key, not malformed PNG |
| Context loss / terminal session | Existing texture/frame classifiers and viewport.graphics; invalidated lease alone does not identify the cause |
| Released resource / cancellation | Lease released is consumer revocation; invalidated is cache/session revocation; source CANCELLED is separately host-reported |
| Cleanup uncertain | Existing cleanupFailed and native cleanup observations; false only means no observed exception, not memory proof |

Only WeakMap-branded cache errors classify; matching message/code-shaped objects
remain unknown. Existing RenderFrameFailure is unchanged. No unified catch-all
classifier guessing from error text. New diagnostics contain only fixed stage/code,
never input revisions/locators, tokens, URLs, bytes or paths. Hosts must not serialize
raw unexpected exceptions, source requests or whole descriptors as safe logs.
The new manual consumer withholds unknown details and prints only fixed outcomes
and numeric ownership counts. No authored reference/catalog/Document is changed.

[Manual consumer](../../editor/manual/cache-invalidation.md) is compiled but browser
NOT_EXECUTED. FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED. Node metadata/admission
observations do not prove GPU A/B survival or native cleanup. No watcher/HMR,
metrics dashboard, competing cache, gameplay, dependency change or tests.
