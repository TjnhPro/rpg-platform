# v0.13.3 — PM04 document references

Preflight 07016881bdc05ec967e256fa33b54240a76d53db (PM03), previous checkpoint and exact task/source audited.
Owner editor; new project-document-tracking and additive track/list/get/update/
removeProjectDocument, diagnoseProjectDocuments exports. Manifest delegates list
validation. No document IO/session/codec, other-project or external API changes.

Closed entries follow PM01 DocumentIdentity/kind/version/locator/sceneId shape.
Exact unique document IDs and locator paths, deterministic order; scene kind requires
sceneId and other kinds require null. Duplicate registration (even identical),
foreign identity, rename, unknown update/remove reject. Lookup requires explicit
same-project DocumentIdentity; missing returns undefined. Replacement preserves slot.
Missing physical file references are valid declarations with fileExistence NOT_CHECKED,
not loaded/content-valid documents. No save/dirty flags in the reference list.

Finite public-root observations: registered scene-main then asset-list; list order
preserved; removing asset-list left original A at two refs and independent B empty.
Duplicate/foreign refs rejected; foreign lookup and unknown removal rejected.
Declaration diagnosis valid with fileExistence NOT_CHECKED, without any disk read.
Active selection remains unsupported until PM05; dependent removal policy next.
check/scope/verify editor --with-consumers exit0 (199 sources; UI build included).
IO_NOT_VERIFIED / UI_NOT_VERIFIED. Next PM05 after this commit.
