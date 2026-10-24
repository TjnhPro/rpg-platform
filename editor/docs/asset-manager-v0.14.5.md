# AM06 — deterministic project search

Editor searchManagedAssets queries the bound live canonical catalog without
retained indexes. AssetSearchRequest and AssetSearchResult are additive root types.
Exact projectId is required; malformed requests throw TypeError. Query max1024
UTF16 code units, trim then String.toLowerCase substring over assetId and string
editorDisplayName only. No locale/fuzzy/Unicode normalization. Optional exact kind
and category combine with AND. Unknown extension labels match exact authored
values or return empty; uncategorized matches absent metadata only, including
exclusion of explicitly authored text "uncategorized". Invalid categories cannot
match a category filter. No filter leaves the canonical ordered list intact.

Results freeze arrays/references and reuse immutable canonical definitions, include
project and generation/count. No IO, selection, metadata or storage mutation.
Finite root API observation: PLAYER ID and trimmed hero name each found player;
item filter found item; image filter found player; missing and unknown category
returned empty; uncategorized found plain only, ignoring vendor Hero metadata and
explicit category. Repeated empty/whitespace queries matched identically. Foreign
project, numeric query and 1025-character query rejected. All manual CLI exit0.
check/scope/verify exit0, architecture215, UI11/3 zero errors/manual warnings,
genuine TypeScript/Vite build. Existing chunk/DEP0190 warnings remain. No UI/IO/
visual verification, generated tests or canonical-owner source changes.
