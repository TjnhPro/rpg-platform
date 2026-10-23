# v0.8.12 — SR19 Client Scene host integration

Canonical owner **game-client**: optional browser host, neutral sample presentation,
canvas/provider selection and frame scheduling. Runtime Render remains the sole
scene/instance/ordering/spatial/resource/backend implementation. The Client sample
is compiled by its normal project build, separate from the portable public root.
No root API additions: Render186 / Editor138 / Client0, existing signatures intact.

## Minimal integration

`src/manual-scene-host.ts` exports an owner-private browser mount to the Client
manual page. Inputs are Render `VisualResourceDescriptor`, source index/revision,
optional canonical frame binding and Phase7 provider. These describe presentation
resources, not an authored Scene/catalog, gameplay entity or server protocol.
The Client-owned sample chooses local visual keys, explicit 320x240 source plane,
anchor/orientation/TRS, clip projection and 64x64 sprite layout. All validation,
composition and drawing go through Render public operations. No spatial formula,
renderer, loader or catalog is copied from Editor. Engine has no existing intent
API required here and is not changed to manufacture gameplay state.

One mount permits one open attempt. Phase6 `beginRenderFrameSession` acquires the
canvas; a late acquired session after close is disposed without adoption. Phase7
`createVisualResourceCache` acquires actual PNG/texture readiness, then two neutral
instances bind independent retained rights. The sample retains one extra host lease
until close so the Add control can create more instances without a new loading
pipeline. Remove releases only that instance's retained usage; the extra host lease
means last-instance removal alone does not evict the loaded resource in this demo.
Cache limits are 2 CPU/2 GPU entries; PNG limits 1 MiB/2048 dimension/4194304 pixels.

Client add/move/visibility/order/remove call Render root and coalesce one browser
rAF request. Callback checks existing Phase6 `invalidated` demand and submits through
`renderFrame`. There is no continuous simulation, animation update, fixed timestep,
gameplay clock, networking or Render-owned scheduler. Explicit Draw submits directly.
Fixed canvas demo has no new resize/DPR/visibility policy; existing Phase6 host
remains available separately. No UI framework, navigation or controls for a game.

## Failure and ownership

Instances are recorded immediately after add: a later bind/transform/layout failure
can leave a visible-to-inspection partial instance. Controls propagate exceptions;
the page reports failures rather than claiming transactional success. No global
clear/rebuild, automatic repair or placeholder texture. Inspect exposes only public
observations/opaque handles; no native texture or Three objects. Local keys and
session symbols are runtime-only; no content persistence path exists.

Close marks terminal/cancels the scheduled callback, then independently attempts
scene disposal, host lease release, cache disposal and session disposal. All stages
are observed even if another throws. Errors use Render's safe diagnostic classifier;
unknown remains unknown. Terminal snapshots retain existing cleanup uncertainty;
false is not GPU health or memory reclamation proof. Existing uncertain scene/cache
cleanup blocks further mutation. Closed/pending-load mounts do not adopt late loads;
no replacement/reopen/retry manager is introduced. Canonical Phase6/7 quarantine
continues to govern target/resource cleanup.

## Same specification, independent contexts

The standalone [Client page](../manual/scene.html) imports no Editor runtime.
Harness [comparison page](../../harness/manual/scene-hosts.html) is composition tooling,
not a production project dependency. It independently mounts this Client module and
the existing v0.8.11 Editor consumer on distinct canvases. Both resolve the same
`@rpg-platform/runtime-render` URL. The same selected immutable PNG specification
can be offered to separate provider scopes/caches; the comparison records session
symbols with strict identity comparison rather than string descriptions.

Each context performs its own Phase7 upload. No GPU texture sharing across contexts
is promised; cache resource/allocation IDs are context-local. Disposing one host
must leave the other usable, but that behavior needs actual manual observation.
Only Harness tooling imports both host consumers; no Client->Editor dependency.

Rollback removes the optional host/pages/docs only; no public or stored migration.
No backend/Engine/Server/L1/L2, package/compiler/workflow or gameplay change.
No bundled asset: only authorized user selection. TPSHEET_NOT_VERIFIED inherited;
whole PNG pages do not claim an atlas parser or frame visual acceptance.

Build/static gates verify compilation only. Browser NOT_EXECUTED;
FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED remain until independent observations.
