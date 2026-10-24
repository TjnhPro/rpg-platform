# AM08 — context-local reference selection

Editor adds selectManagedAsset, getManagedAssetSelection and AssetSelectionResult.
WeakMap intent belongs to one exact AssetManagerProject capability. Phase2 captures
the reference and resolves afresh on every read. Successful handoff contains only
canonical AssetReference, not selected definitions or IO/Render rights. Null clears.
Invalid input clears previous intent then throws; unresolved attempts return null
handoff with not-found/wrong-project/kind-mismatch/subresource-unsupported status.
Catalog removal is reflected on next read; closed/stale Project contexts throw,
requiring a new context with empty selection. Old immutable receipts are historical
observations only; consumers must revalidate before handoff/async adoption.

Finite manual root API exit0: image selected resolved with null subresource;
expectedKind player (category) produced kind-mismatch, foreign B wrong-project,
missing not-found, opaque frame unsupported. Independent B with same assetId stayed
not-selected. Removal at generation2 no longer resolved; invalid ID cleared prior
intent; closure rejected read. Project snapshot unchanged. No Document/Scene writes
or loading. check/scope/verify exit0, architecture217/UI11/3 zero errors/manual
warnings; genuine TS/Vite with existing chunk/DEP0190 warnings. Scope/declaration
audit: three additive root symbols, no canonical owner changes or generated tests.
UI/IO/visual NOT_VERIFIED. Continue AM09 after distinct commit.
