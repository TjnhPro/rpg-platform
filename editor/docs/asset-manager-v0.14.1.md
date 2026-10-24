# AM02 — project-bound canonical catalog

Parent99a3b8aee4b96c569e0705524cc449e2f84514c2; owner Editor. New
asset-manager-project.ts composes Phase2 catalog and Phase13 public snapshot/root
validation only. Eight additive root names: AssetManagerProject,
AssetManagerProjectSnapshot, createAssetManagerProject, getAssetManagerProjectSnapshot,
adoptAssetManagerCatalog, closeAssetManagerProject, admitAssetManagerIdentity,
rebuildAssetManagerCatalog. Emitted signatures match source after build. No canonical
owner source edits or filesystem/UI/preview. No external L1/L2 calls.

Opaque context owns one canonical immutable catalog snapshot, generation and borrowed
project/root. Project revision changes make operations stale; explicit fresh context
is required. Switch policy: close old context, bind new one; historical snapshots
remain immutable observations, never authority in B. No selected item/preview exists
yet. Close drops borrowed project/root references, retains historical catalog only;
does not close Project/Document or dispose another owner's resources. Host-issued
bindingId must uniquely correlate root authorization, as PM01 documented; root
original identity and exact project are checked by resolveProjectLocator.

Rebuild requires exactly the manifest's asset Document set, validates complete owner
snapshots and project/kind/version/unique document IDs, then creates the canonical
catalog in manifest order and runs strict diagnostics with that candidate for
dependencies. Missing/foreign/duplicate/invalid input never adopts partial state.
Supplied envelopes are in-memory data, not evidence of read/commit. Direct catalog
adoption is an explicit memory candidate and does not alter Project dirty/saved state.

Actual finite root API observation exit0: A/B counts1/0; foreign catalog and document
rejected CATALOG_PROJECT_MISMATCH/DOCUMENT_PROJECT_MISMATCH; stale generation and
changed Project revision rejected; fresh context rebuilt hero from tracked owner
Document; missing set rejected; B remained generation1/empty. check/scope/verify
--projects editor --with-consumers exit0, architecture210, UI11/3 zero errors/warnings,
TypeScript/Vite pass. Existing size/DEP0190 warnings. API_OBSERVED /
IO_NOT_VERIFIED / UI_NOT_VERIFIED / VISUAL_NOT_VERIFIED. No tests added. Next AM03.
