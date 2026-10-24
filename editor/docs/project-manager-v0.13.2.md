# v0.13.2 — PM03 roots

Preflight 7dd327522024f9fc94a32aa6ed98c2e65989dda7 (PM02), exact task/source audited; owner editor only. New
setProjectResourceRoots, createProjectRootBinding, resolveProjectLocator and
ProjectRootBinding exports. Source: project-resource-roots/root-binding; manifest
now delegates canonical root capture. No new schema or other project API change.

Root entries have exact rootId/locator keys, unique IDs, immutable ordered capture;
paths reuse createResourceLocator. Documents will remain project-relative directly,
not implicitly relative to a resource root. Binding is original issued capability
with projectId, bindingId and nullable borrowed ports, never portable manifest data.
Copies and foreign bindings reject before dispatch. Missing ports grant no IO.
resolveProjectLocator returns lexical dispatch string only, no physical safety claim.
Host still owns permissions/symlink/junction/TOCTOU containment and storage receipts.
No filesystem implementation, scans, folders or IO added at this checkpoint.

Finite Node observations: caller root mutation retained Assets; original manifest
roots remained empty. Duplicate root IDs, ../outside, /absolute and drive path
rejected. Separate A/B bindings resolved identical Assets/effect.png under their own
project scope; null/copy/foreign binding rejected (ROOT_UNAVAILABLE / PROJECT_ROOT_MISMATCH).
Portable manifest JSON retained only logical roots. Denied disk permission not exercised.
check/scope/verify editor --with-consumers exit0 (198 sources, UI gates included).
IO_NOT_VERIFIED / UI_NOT_VERIFIED. Next PM04 after commit.
