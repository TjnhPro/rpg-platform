# ME08 — Create Map

Parent41f28a2. createMap + CreateMapOptions/CreateMapResult use real ProjectSession,
issued root/locator, Scene/envelope/session factories and trackProjectDocument.
Shared internal map-project checks active project and matching root handoff as
Phase14. No private canonical API use or ownership delta. New scene/document IDs
must differ, match project, avoid tracked IDs/Scene IDs/manifest locator.

Canonical ProjectDocumentReference requires a locator. Therefore caller supplies
trackingLocator as an explicit lexical declaration for the returned tracking
candidate; it is neither physical existence nor write authorization/precondition.
ME10 independently authorizes actual dispatch. Returned projectRevision supports
explicit optimistic candidate adoption. Active Scene stays unchanged.

Node with real finite filesystem host: new session open/dirty/savedRevision=null;
project docs remained0 and root files[] until explicit tracking adoption. Duplicate
document/Scene and foreign project rejected; independent second Map session remained
unsaved; closed project rejected PROJECT_NOT_OPEN. No disk writes or fake receipt.
check/scope/verify exit0 architecture232/UI14/3/TS/Vite. No UI/IO-save/pixel claim.
Next ME09.
