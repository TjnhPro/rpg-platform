# v0.8.11 — Editor Scene preview synchronization

Canonical owner: **editor** for authored-to-live mapping and preview orchestration.
Runtime Render remains the only instance, transform, ordering and resource owner.
This supplied task authorizes four additive Editor root names:
`createScenePreviewBridge`, `ScenePreviewBridge`, `ScenePreviewPresentation`,
`ScenePreviewOutcome`. Render/Client roots and all existing signatures are unchanged.
No Document schema, revision, save/load, dependency or Engine/L1/L2 change.

## Scope and host responsibilities

One bridge binds one captured `(projectId, sceneId)` to a borrowed canonical visual
scene. Its private map uses authored object keys; Render receives independently
generated `preview-N` keys plus optional correlation. Handles/maps/leases never
enter authored Membership, AssetCatalog or Documents. The host must give the bridge
exclusive membership access to the borrowed scene, including key allocation, until
close; it must not externally remove/clear bridge instances. Layers are configured
by the host before synchronization. One bridge per dedicated preview scene.

Host policy explicitly supplies coordinate definition, local transform, anchor,
orientation, projection, local sprite extent, visibility and Render layer/order.
Authored layer labels, attachment links or declaration order are not inferred as
Render behavior. Existing `describeSceneObjectVisual` uses canonical Phase2 asset
resolution. Only image descriptors with image sources are supported, with the
current PNG loader hint. `describeSceneObjectSpatialPoint` supplies Phase4 portable
placement. Existing Render factories capture the transform components/projection;
all spatial arithmetic and live transform validation stay in Render.

Host acquisition callback must return a fresh Phase7 lease from the existing cache
using the descriptor and explicit source revision. It must not allocate another
loader/cache, return a reused host lease or mutate the bridge during callbacks.
The bridge awaits real lease readiness, binds through Render (which retains an
independent right), and releases its temporary host lease in finally. Host cache,
graphics session, target, frame requests and document lifecycle remain host-owned.

## Incremental and failure policy

Whole Membership/Catalog validation and project/scene checks happen before any
mutation. Batches are serial; concurrent sync throws instead of queuing. Membership,
catalog and per-object policy data are captured before asynchronous adoption.
Frame atlas references must be canonical immutable Phase7 snapshots.

| Input/change | Mapping and ownership outcome |
| --- | --- |
| New supported placed object | Await real Phase7 load, allocate independent ID, bind retained usage, set presentation |
| Same descriptor/key/revision/frame with usable binding | Keep exact instance and existing retained right; no acquire/rebind |
| Placement/visibility/order/layout only | Update same instance via public Render operations; no lease churn |
| Changed resource/binding or unusable retained usage | Await candidate, bind replacement through Render; release temporary host right |
| Removed authored object | Remove exact mapped handle only; other instances keep their rights |
| Missing/unsupported asset or missing placement | Diagnose; allocate nothing for a new object; preserve existing preview as stale |
| Invalid spatial/policy/resource admission | Diagnose that object; retain previous or explicitly partially committed presentation |
| close while load pending | Release pending host rights, drain mapped instances; late load cannot adopt/create |

This is a **documented partial batch**, not an atomic transaction or rollback.
Removals run first, then authored objects in captured order. For each object:
resolve/policy/spatial preparation, load if necessary, add if needed, bind, transform,
layout, visibility, order. A failure after add/bind may leave a mapped partial
instance/new binding; a later batch can retry through the same handle. Render may
commit replacement before old-right cleanup fails. Never clear/rebuild the whole
scene to conceal failure. Every attempted/unsupported/removed object yields a frozen
`applied`, `removed` or `diagnosed` outcome with historical handle, reason, redacted
Render failure where available and cleanup uncertainty. `applied` means operations
returned, never observed pixels. Load failure state is explicit, not a placeholder.

Host must retain/display diagnosed outcomes: an old preview can be stale even when
still drawable. It must never call the batch wholly successful from partial results.
Input factory failures reject the batch before mutation; unknown per-object errors
remain UNKNOWN_FAILURE rather than inferred GPU faults. A cleanup failure observed
on release/removal or a branded cleanup error prevents future sync; close can still
drain remaining rights and preserves uncertainty in its summary. Failed removals
remain mapped for explicit cleanup observation. No silent cleanup success or retry
of native resource deletion is promised. Host must preserve Render's own sticky
scene/session diagnostics and follow its quarantine/recovery policy.

No cancellation service, scheduling loop, generic diff engine, Scene editor UI,
autosave, native type exposure, duplicate renderer, gameplay/world semantics or
Client adapter is introduced. Host closes the bridge before disposing scene/cache/
session. Historical returned handles are nonserializable live capabilities.

## Evidence limits

The root consumer compiles real catalog/membership, Phase4 context and Phase7
acquisition for three shared-asset objects plus a missing reference. Manual guide:
[scene-preview](../manual/scene-preview.md). Browser NOT_EXECUTED;
FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED / TPSHEET_NOT_VERIFIED remain.
Build/static checks are not runtime, visual, atomicity or memory-leak acceptance.
