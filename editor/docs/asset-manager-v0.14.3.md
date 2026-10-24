# AM04 — explicit registration candidates

Parentad9526d5b468e8085ccd2e8f0b0e0cff8ce51091; owner Editor. Added
asset-manager-registration.ts and four root names: registerManagedAsset,
updateManagedAssetMetadata, unregisterManagedAsset, AssetRegistrationCandidate.
No canonical owner edits, IO/UI, dependencies, schema or breaking signature change.
Actual source/emitted declarations audited after build.

Register delegates createAssetDefinition/registerAssetDefinition. Caller supplies
distinct explicit DocumentIdentity/locator; already tracked identity rejects new
registration. Candidate captures contextId/catalog generation/Project revision,
canonical catalog, owner asset envelope, tracking reference and manifest candidate.
Persistence always NOT_COMMITTED. Nothing adopts/saves automatically. For multiple
pending assets, host must retain unique pending document mappings and serially apply
explicit tracking candidates/rebind context; candidates from one revision cannot be
blindly combined. Project and catalog adoption have separate optimistic guards.

Metadata update uses explicit source Asset Document to establish document/asset
identity; canonical portable patch overlays only supplied metadata keys, retaining
unrelated keys, sources, dependencies and provenance. No deletion/rename inferred.
Update delegates updateAssetDefinition; category admission rejects invalid values.
Unregister delegates removeAssetDefinition and returns catalog candidate only;
existing references, document tracking/files and preview leases remain untouched.
Context/catalog generation invalidates future selection/preview consumers; no such
consumer is silently disposed here. No persistence evidence fabricated from RAM.

Host commit order is explicit: save owner asset Document through saveDocument, then
separately apply manifest candidate using replaceProjectManifest(expectedRevision)
and saveProject. Asset success/manifest failure leaves a real untracked asset;
manifest success/asset failure leaves an unresolved reference. Keep each original
result/evidence, report partial state and require explicit host action. No atomic
transaction or rollback/retry/delete promise. Existing-file updates remain limited
by actual host CAS support, independently of in-memory metadata update support.

Finite root API observation exit0: candidate NOT_COMMITTED with live catalog and
tracking still empty; explicit adoption of two assets; duplicate/foreign registration
rejected; metadata patch retained vendor{x:1}, sourceId0001, kind text; unregister
candidate left two-entry original, external reference and Project savedRevision null
unchanged. check/scope/verify exit0; architecture212, UI11/3 zero errors/warnings,
TS/Vite. Existing chunk/DEP0190 warnings. API_OBSERVED / persistence/UI/visual
NOT_VERIFIED; no tests. Next v0.14.4 after commit.
