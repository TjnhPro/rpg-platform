# v0.3.8 — Scene-to-Render Presentation Contracts (SC15)

READY_FOR_DEVELOPER_REVIEW; Developer owns acceptance. Stop before v0.3.9.

## Preflight and declared scope

Started at v0.3.7 b21588ccf3bc5150d3f4e2639f8a85e33038dedc, continuing
feat/editor-render-scene-contracts-v0.3 and existing Draft PR #3:
https://github.com/TjnhPro/rpg-platform/pull/3. Developer supplied the next task,
with the earlier instruction to implement/verify and review at the final step.
Live verified Phase 1 PR #1 MERGED at 4cec85b5a00e2477f00eee29e2da6025a532e973;
Phase 2 PR #2 MERGED at fea9b734b849fa1c6bc953530e1fa425d43cfca8 (Phase 3 base).

Read current root/project guidance, architecture/foundation, Harness ownership,
contracts, verification/workflow and actual Scene/Asset/Render modules, roots and
manifests. Primary implementation owner: Editor projection. Required collaborator:
Runtime Render's unchanged consumption boundary. Phase 1 host/frame lifecycle
does not consume authored placement; Phase 2 VisualResourceDescriptor and
prepareVisualResource already provide the needed image metadata handoff. No new
Scene descriptor or Render source change is justified. No L1/L2 capability needed
or modified. No ownership or dependency conflict found; no external framework
research was necessary for this boundary decision.

Nine paths: editor/src/scene-visual.ts, src/index.ts, manual/scene-visual.mts,
manual/README.md, AGENTS.md; runtime-render/AGENTS.md; root README;
harness/CONTRACTS.md and this checkpoint. Infrastructure allowance covers docs.
Exactly five projects; no Engine/Client/Server source, Render production source,
L1/L2 pins, manifests/lockfile, package versions/export maps, graph or workflow changes.

## Minimal public contract and handoff

Two additive Editor exports: describeSceneObjectVisual and SceneObjectVisualDescription.
Editor 72 -> 74 root symbols; Render remains 17. Existing Scene/Asset/Render shapes,
signatures and semantics remain unchanged. A real optional public-root consumer
uses both new exports and Render's actual public descriptor/preparation symbols.

describeSceneObjectVisual(membership, objectId, catalog, mediaType = null) selects
one exact local object from a factory snapshot. Invalid ID/missing object throws
TypeError; unknown host failures propagate. Existing canonical membership capture
detaches the Scene and selected object's known authored data without duplicating
validators. Phase 2 resolveAssetReference and describeResolvedVisualAsset remain
the sole Asset lookup/visual-mapping authority; no second resolver/registry/cache.

Result captures a frozen correlation { projectId, sceneId, objectId } and frozen
placement data or null, alongside the Phase 2 described/unsupported union. Omitted
authored placement projects to null; source omission/null semantics are unchanged.
Correlation IDs are external identifiers, not Render session IDs or instance handles.
Placement carries its caller coordinateSpaceId and numeric pair without space
resolution, units, axes, transforms or screen conversion. Caller projects a list by
iterating existing listSceneObjects; no bulk subsystem or hidden order is added.

Only described image resources with an image source yield VisualResourceDescriptor.
No Asset reference gives NO_ASSET_REFERENCE. Existing UNRESOLVED_REFERENCE,
NON_VISUAL_KIND and MISSING_IMAGE_SOURCE remain explicit. Unsupported objects keep
their correlation/placement and authored references; no placeholder fabrication,
deletion or auto-repair. Rich missing-target/kind diagnostics remain a separate call
to v0.3.7/Phase 2 APIs. Catalog is supplied explicitly, never global or loaded here.

Media hint is caller-selected per object, default null, never guessed from path or
arbitrary metadata. As in Phase 2, the projection describes it and Render validates
it on preparation. Projection does not claim Render acceptance before that handoff.

Caller passes only description.descriptor to prepareVisualResource. Render sees
resource identity, mediaType and ordered source roles/locators, not the correlated
wrapper or authored Scene/Object/Asset definitions. It validates, detaches/freezes
metadata and returns metadata-prepared/resourceLoading NOT_PERFORMED. Correlation
and placement remain caller-retained data for future consumers; they are not staged
as Render instances and do not affect frames. Labels, layers, attachment intent,
authoring notes and gameplay/UI state are not interpreted or forwarded. There is
no GPU, decode/load, session allocation, render loop, map graph or reverse import.

## Manual observations

Optional scene-visual.mts strict-compiled and ran via public roots with exit 0.
Finite output MANUALLY_OBSERVED:

- left/right resolve to the same exact canonical lantern-image catalog definition
  (true), while producing separate descriptions and external object correlations.
- Placement stayed author-space/(4,6) for left and author-space/(20,-3) for right,
  after host input x was changed to 100. Caller iteration kept left/right order.
- Real prepareVisualResource calls returned metadata-prepared for both with
  resourceLoading NOT_PERFORMED. Hints were image/png and null, explicitly distinct.
- Distinct-descriptions, projection-detached, frozen and Render-detached observations
  printed true. Descriptor keys were identity/mediaType/sources; identity keys were
  projectId/resourceId. Neither sceneId/objectId nor placement crossed the API.
- Removing the Asset from a candidate catalog returned unsupported/UNRESOLVED_REFERENCE;
  separate Scene diagnostics retained both references with TARGET_NOT_FOUND paths.
- Assetless text, text-kind Asset and image without source returned respectively
  NO_ASSET_REFERENCE, NON_VISUAL_KIND and MISSING_IMAGE_SOURCE, with null placement.
- Missing object and invalid ID printed TypeError. Original Scene unchanged printed
  true. No sources were probed or loaded; no visual behavior was observed.
- Final marker RESOURCE_METADATA_HANDOFF_ONLY / PLACEMENT_NOT_CONSUMED_BY_RENDER /
  RESOURCE_LOADING_NOT_PERFORMED / VISUAL_NOT_VERIFIED.

No test suite, assertions, runner/helper, coverage/matrix or automatic runtime CI.

## Future contract assessment and verification limits

DESIGN_ONLY: a later Client/content loader can supply the same neutral resource
descriptor directly through Render's public root without importing Editor. This
does not establish a serialized Scene format or move projection code into Client.
Existing host/session contracts remain independent; reuse by other hosts does not
make this metadata preparation session-bound. No lifecycle change is needed here.
Spatial interpretation belongs to Features 04/09; actual object/Scene instances
and placement consumption to Feature 08; resource loading to Feature 07. Those
future contracts remain DEFERRED, not placeholder APIs.

| Gate | Observed result |
| --- | --- |
| node harness/cli.mjs check | ARCH_CHECK_PASS; 44 JS/TS files, static scan only |
| node harness/cli.mjs scope --projects editor,runtime-render --allow-infra | SCOPE_PASS; nine declared paths |
| node harness/cli.mjs verify --projects editor,runtime-render --with-consumers | BUILD_PASS: runtime-render, editor, game-client |
| npm run build -- --force | Exit 0, all five projects |
| Strict public-root NodeNext compile | Exit 0, visual projection and all seven prior Scene consumers |
| Optional public-root visual metadata sequence | Exit 0; observations above |
| Actual emitted declarations/root inventories | Editor 74 / Render 17; source/declaration match, two additions/no removals, roots resolve |
| git diff --check | Passed |

No failed/unconfigured build. Existing Windows Harness DEP0190 warning unchanged.
Source/exports have no Render-to-Editor import and no cross-project private paths.
Commit SHA and exact-head push/PR CI evidence are recorded in PR #3 to avoid a
self-referential SHA. Build/static success is not functional/visual PASS. Actual
rendering, placement display, animation, physical files, resource loading, gameplay,
Client content loading and serialized compatibility remain NOT_VERIFIED/DEFERRED.
No v0.3.9 work, merge, tag, release or publication; Developer review pending.
