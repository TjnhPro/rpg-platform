# v0.8.4 — SR06 Visual Resource & Frame Binding

Runtime Render owns resource usage on an exact live visual instance. Loading,
upload, atlas parsing/resolution and allocation lifetime remain Phase 7. No draw,
material, mesh, animation, authored Scene schema or host integration is added.

## Public delta

Seven additive root names: `bindRenderVisualInstanceResource`,
`getRenderVisualInstanceResource`, `getRenderVisualBindingFailure`,
`RenderVisualResourceBindingInput`, `RenderVisualResourceBindingSnapshot`,
`RenderVisualFrameBinding`, `RenderVisualBindingFailure`.

```ts
bindRenderVisualInstanceResource(scene, instance, {
  resource: usablePhase7Lease,
  expectedSourceRevision: hostCurrentRevision,
  frame: null, // full image, or explicit Phase 7 frame request below
});
getRenderVisualInstanceResource(scene, instance);
bindRenderVisualInstanceResource(scene, instance, null); // unbind
```

Frame request: `{reference, atlas, expectedRevision, pixels}` uses the existing
`VisualFrameReference`, canonical `AtlasMetadata`, revision symbol and
`AtlasPagePixels`. Phase 7 `resolveAtlasFrameGeometry` owns exact address lookup,
missing/ambiguous frame, resource identity, atlas revision, layout, bounds and UV
interpretation. `createAtlasTextureView` checks the retained canonical texture
against page dimensions/source attestation. No parser/geometry math is copied.
Caller attests imageSourceId/layout exactly as Phase 7; dimensions and matching
revision labels do not prove that the host associated the correct image bytes.
No additional filename, atlas source inference or implicit reload.

## Dependency audit and usage ownership

Actual path: `VisualResourceCache.acquire(...)` -> existing `waiter(entry)` ->
upload through canonical session -> independent alias `RenderTexture` -> usable
`VisualResourceLeaseSnapshot` with texture, shared resourceId and sourceRevision.
This is real GPU upload admission, not metadata preparation/decoded-only readiness.
Neither a lease nor its texture is a public native/Three texture.

Binding accepts the public Phase 7 lease. A small **owner-local** weak dispatch in
the existing cache retains another waiter on the same ready entry. It reuses
`waiter`, group invalidation, counts and last-user `retire`; it creates no cache,
source job, decode, texture upload, allocation or revision entry. The helper is
not exported at the package root; consumers cannot deep import it. Existing cache
public contracts remain unchanged. Unsupported raw upload-only RenderTexture or
AtlasTextureView is not accepted as a resource lease.

One successful bind = one independent instance usage. Two instances can retain
the same input lease/allocation with separate rights. Caller keeps its input
lease and may release it after binding; instance rights remain. Returned binding
observations contain no releasable texture/lease, so callers cannot release an
instance's right. Explicit cache.dispose/session termination still revokes all
rights. No claim of lease survival across contexts or cache disposal.

## Admission, replacement and failure outcomes

| Operation | Outcome |
| --- | --- |
| bind/replace usable canonical lease | retain candidate, resolve optional frame, recheck live entry/state, commit, release previous usage |
| null input | commit unbound, release previous usage; repeated null is safe |
| pending/failed/released/invalidated lease | RESOURCE_NOT_USABLE; no queued bind or late completion callback |
| arbitrary structural lease | FOREIGN_RESOURCE; never invoke its methods |
| different canonical session | CONTEXT_MISMATCH; no cross-context reuse |
| sourceRevision differs from explicit expectation | SOURCE_REVISION_MISMATCH |
| missing frame / wrong atlas revision | existing FRAME_NOT_FOUND / ATLAS_REVISION_MISMATCH via binding classifier |
| stale/foreign/terminal instance | existing instance admission classifier, before ownership commit |
| input reflection reenters mutation | recheck exact entry, correlation snapshot and binding; changed target rejects and candidate usage releases |
| cache revocation | read returns unavailable; context-loss observation may terminate scene and throw existing terminal admission failure |
| remove/clear/dispose/session end | unlink owned entries, attempt every owned release; no host-lease release |

Existing pinned Phase 7 rights remain pinned after cache revision invalidation.
Expected source revision and atlas token are explicit host assertions. Old atlas
with its old token can still describe history; no global freshness is invented.
Host supplies its current revision to reject an obsolete asynchronous load result.
The exact instance handle rejects completion after remove, ID reuse or termination.
An obsolete host request for a still-live instance is not automatically cancelled;
host orchestration must track request generation/current expected revision.

Validation failures before commit preserve the previous binding. Unexpected
host/native exceptions propagate unchanged. Candidate cleanup can itself fail;
its cleanup exception then propagates. After commit, an old release failure
propagates with the new binding (or unbound/removal/terminal state) already
committed; there is no rollback to a released old right. Read current state and
inspect the canonical cache/graphics diagnostics. Removal/drain unlink before
cleanup; terminal disposal detaches even on failure and cannot retry a released
right. Retrying dispose is idempotent, not a certificate of successful cleanup.
No cleanup/leak-free/GPU completion claim follows from compilation.

## Optional manual handoff — compiled only

`manual/visual-instance-resource.mts` exports a finite walkthrough taking real
canvas hosts, authorized Phase 7 provider/descriptor/revision/decode options and
optional real parsed frame request. It loads through Phase 7, logs pending and
late/removed admission, two bindings, wrong session/revision, host release,
released-handle replacement, A removal and B usage, then unbind/cleanup. Frame
diagnostics require real compatible atlas input; choose a known absent key for
missing-frame observation (the illustrative suffix alone is not proof of absence).
No fixtures, assertions, automatic execution, frame submission or test runner.

```powershell
node node_modules/typescript/bin/tsc --ignoreConfig --strict --noUncheckedIndexedAccess --exactOptionalPropertyTypes --verbatimModuleSyntax --skipLibCheck false --module NodeNext --target ES2022 --lib ES2022 --typeRoots .artifacts/empty-types --rootDir runtime-render/manual --outDir .artifacts/visual-instance-resource runtime-render/manual/visual-instance-resource.mts runtime-render/manual/visual-instance-operations.mts runtime-render/manual/visual-instance-membership.mts runtime-render/manual/visual-scene-lifecycle.mts
```

`.artifacts/empty-types` is an empty ignored directory to exclude ambient browser
types. ES2022 root consumers compile without DOM/THREE types. Execute only in a
real host with permitted resources; browser/native observations are NOT_EXECUTED.
FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED. This checkpoint does not make binding
part of renderFrame submission; native material/draw integration remains later.

Three 0.186.1 / types 0.186.0 unchanged. Official
[Texture documentation](https://threejs.org/docs/pages/Texture.html) was consulted:
native Texture disposal/bitmap configuration is not ownership of the public
neutral lease. No native Texture API or upgrade is introduced here.
Rollback removes the seven additive root names, binding state/cleanup and private
retention dispatch; no persisted data or existing cache-public API migration.
