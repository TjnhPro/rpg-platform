# v0.8.10 — Resource lifetime and rendering diagnostics

SR15/SR17 are Runtime Render-owned. Four additive root symbols:
`getRenderVisualDiagnostic`, `RenderVisualDiagnostic`,
`getRenderVisualSceneDiagnostics`, `RenderVisualSceneDiagnostics`.
No old required shape, error union, lease contract or frame receipt changes.

## Safe diagnostics

Call `getRenderVisualDiagnostic(error)` for a caught failure only. It returns frozen
domain/code/cleanupFailed data, without message, stack, cause, IDs, host paths,
provider locators, native handles, DOM or Three objects. Existing branded domain
classifiers remain available. No duck typing, name/message parsing or success arm.
Unknown values, foreign-package errors and host exceptions produce
`unknown / UNKNOWN_FAILURE / null`; null means not reported, never clean/success.

| Failure | Domain and representative stable codes |
| --- | --- |
| Membership | instance: DUPLICATE_ID, MISSING_INSTANCE, FOREIGN_INSTANCE, FOREIGN_SCENE, INSTANCE_CHANGED |
| Terminal scope | instance: SCENE_DISPOSED, SESSION_UNAVAILABLE |
| Resource binding | binding: RESOURCE_NOT_USABLE, FOREIGN_RESOURCE, CONTEXT_MISMATCH, SOURCE_REVISION_MISMATCH; existing canonical atlas codes |
| Layer/depth | layer and depth retain their existing exact codes |
| Owner presentation admission | presentation: INVALID_TRANSFORM, INVALID_SPRITE_LAYOUT, LOCAL_UNIT_MISMATCH, SCENE_IN_USE |
| Graphics | frame: CONTEXT_LOST, FRAME_FAILED, FRAME_IN_PROGRESS, CLEANUP_FAILED and existing Phase6 codes |
| Texture/cache/session | existing branded texture/cache/lifecycle codes |

INVALID_TRANSFORM brands owner-local shape/projection/orientation rejection.
Nested Phase4 validation/arithmetic still preserves its original exceptions: an
unbranded TypeError/RangeError cannot safely be distinguished from a host Proxy
trap/getter exception, so it stays UNKNOWN_FAILURE. No generic exception is
reclassified as a known GPU/admission failure. Operation failures still throw the
original exception; the diagnostic helper neither catches work nor grants retry.
Existing idempotent stale-remove false and missing-key undefined remain results,
not invented failure codes. Invalid handles on reads/updates still reject.

## Count-only lifetime observation

`getRenderVisualSceneDiagnostics(scene)` is available after terminal disposal and
returns state, instances, boundUsages, usableUsages, unavailableUsages,
cleanupFailed and releaseAttempts. Counts describe logical ownership only; no
allocation identities, releasable capabilities or mutable maps escape.
Bound usage observation can discover actual context loss through Phase7 and cause
canonical terminal cleanup. If this changes the scene revision during observation,
the returned counts reflect the now-drained scope rather than a partial iteration.
Unknown observation exceptions propagate; there is no fabricated zero-success.

cleanupFailed is sticky scope-local uncertainty. It records failed binding cleanup,
native node removal/detach and observed Phase7 cleanup flags. False is not a global
graphics/cache/GPU-health claim. Use the existing frame/cache diagnostics for those
owners. releaseAttempts counts scene-managed OwnedBinding release calls, including
prepared candidate rollback; it excludes temporary Phase7 retains rejected inside
binding admission, host leases and canonical cache/session revocation. It is not
native delete count. No retry/reset API exists. Repeated dispose retains evidence.

Uncertain scene cleanup does not vacate this session's visual-scope occupancy.
A new scope on that session rejects SCENE_IN_USE (or canonical terminal session
admission); dispose the graphics session and use a fresh authorized session/target
according to Phase6 policy. No reuse or released-quarantine claim is inferred from
logical disposal. Host canvas ownership remains unchanged.

## Ownership audit and failure state

| Path | Acquisition, commit and cleanup |
| --- | --- |
| Create/update metadata/transform/layout/order/visibility | No resource acquisition; identity and existing independent usage retained. Proposed validation precedes accepted logical changes; native failure can terminate session. |
| Bind usable lease | Canonical Phase7 retain issues one independent waiter; same session/revision and optional canonical atlas geometry checked. No IO/upload/cache duplication. |
| Bind admission rejection | Release temporary retained waiter; old binding unchanged unless host reentry/session termination independently changed it. Cleanup exception may replace the admission error; sticky uncertainty records it. |
| Replace/unbind | Validate candidate, recheck live entry, remove old private drawable, commit new binding, then release old usage. Old cleanup failure occurs AFTER commit; no rollback/atomic promise. Inspect actual current state if still active. |
| Remove | Unlink exact entry first, remove native node/drawable, attempt usage release even if native removal fails. Stale same-scene remove returns false; never touches a reused ID. |
| Clear | Unlink all entries first, attempt every entry cleanup, then throw first recorded error. Not a transactional batch; membership may already be empty on failure. |
| Scene dispose | Mark terminal first, drain every owned entry, detach session/source, preserve first reason. Never dispose borrowed session or another scope. Sticky failures survive repeated disposal; no repeated release. |
| Context/session end | Existing Phase6/7 terminal broadcast closes scene and cache group before backend teardown. Cache may already invalidate a retained waiter: subsequent idempotent release is not a second native delete. |
| Async late result | Bind requires usable canonical lease, never pending. Phase7 populate checks closed entries before/after upload and releases late allocation; scene has no async adoption callback or revival path. |

Phase7 waiter accounting keeps shared texture alive until its last owner ends.
Private Three wrapper disposal does not release/delete native texture ownership.
Distinct sessions have distinct context allocations; session A cleanup cannot use
session B's handles. No cross-context texture sharing or absolute leak-free claim.

## Manual evidence, limits and rollback

[Two-session manual walkthrough](../manual/visual-lifetime.md) reuses the real
Phase7 resource/frame consumer, with Developer-selected authorized PNG. No bundled
asset, assertion, runner, framework or automated browser action. Browser execution
NOT_EXECUTED: shared-resource survival, independent session pixels, stale admission,
repeated dispose and cleanup/context failure outcomes are not behavioral PASS.
TPSHEET_NOT_VERIFIED / VISUAL_NOT_VERIFIED remain inherited.

No profiler, global bus, telemetry, new cache, backend or scheduler. No Engine,
Editor/Client production source, Server, L1/L2, schema, dependency or gameplay change.
Rollback removes the four additive symbols and local error branding/observations;
the cleanup-quarantine fix should be retained or explicitly reconsidered. No
persisted-data migration. Next milestone needs its supplied detailed task.
