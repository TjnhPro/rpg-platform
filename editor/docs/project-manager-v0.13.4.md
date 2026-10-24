# v0.13.4 — PM05 active Scene reference

Preflight e96fc6e3bd269c39feb9c742875bba4838e57b48 (PM04), exact task and current source audited. Owner editor;
project-active-scene adds set/clear/getProjectActiveScene, manifest cross-reference
admission, and tracking active-removal guard. No Scene/Render/UI/external delta.
Setter requires explicit DocumentIdentity + sceneId, rejecting foreign project
before selecting even when strings coincide. Tracked scene kind/version1 and exact
sceneId must agree; stale/unknown/wrong kind reject. Stored selection stays PM01
shape documentId/sceneId. No Scene body load/validation/render implied.

Clarification of PM01 explicit-clear wording: removal REJECTS until caller clears
selection; no cascade or silent retarget. Replacing a selected entry with incompatible
kind/sceneId also fails through canonical manifest cross-reference validation.

Finite Node observations: selected scene-main/start, JSON content roundtrip retained
exact pair. Active removal, stale sceneId, foreign and missing document rejected.
Explicit clear then remove succeeded, old selected snapshot unchanged. Actual Scene
existence/file/renderer not checked. check/scope/verify editor --with-consumers exit0
(200 sources, actual UI build). IO_NOT_VERIFIED / UI_NOT_VERIFIED. Next PM06 after commit.
