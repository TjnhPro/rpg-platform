# v0.13.6 — PM07 Create

Preflight aafd73f0376d5251397175d72e0a9cf95a960f9f (PM06), exact task/current factory APIs audited. Editor only;
project-create exports createProject/CreateProjectOptions. Explicit DocumentIdentity,
metadata, optional logical roots, host root capability and manifest locator required.
Canonical envelope schema1/project/contentVersion1 wraps pure manifest; canonical
DocumentSession starts unsaved then opens. No IDs generated, global project, folder
creation, file IO, initial documents/scenes, storage evidence or Render/Engine calls.

Finite public-root observations: A/B distinct handles and roots, A open generation1,
savedRevision null/isDirty true; docs empty and activeScene null. Bad metadata, empty
identity, foreign root rejected before a returned session; no ports configured and
no filesystem dispatch possible. Captured state is Unsaved, never Saved.
check/scope/verify editor --with-consumers exit0 (202 sources, UI build included).
IO_NOT_VERIFIED / UI_NOT_VERIFIED. Next PM08 only after this commit.
