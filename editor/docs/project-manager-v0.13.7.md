# v0.13.7 — PM08 Open

Preflight cceb95755bf9f4b77b2af74ea3954b0fee080e02 (PM07), exact task/loadDocument/session source audited. Editor
owner; project-open adds openProject, immutable projectDocumentContext, options/result.
One explicit root/read/locator; optional expected logical ID defaults to explicit root
ID, never global active. Delegate original bytes to loadDocument with project owner
kind project/version1, adopt its evidenced DocumentSession unchanged. Captured locator
is held across await, so caller mutation cannot redirect the admitted session.

Missing, read failure, parse failure and envelope unsupported schema retain canonical
Document outcomes. Wrong logical identity/root or unsupported project format have
explicit rejected reasons with available exact text/validation; malformed project
structure remains validation-diagnostics. Failed binding closes transient loaded
DocumentSession; no new live ProjectSession returned. Existing sessions never arguments
or mutated. No tracked-document reads, writes, Scene render or Node host adapter.

Finite in-memory trusted read-port observations (NOT disk proof): A opened clean with
savedRevision1 and metadata/resource roots. Missing, permission denied, corrupt JSON,
unsupported content version distinct outcomes. Reading A through B root rejected
project-mismatch; previous A stayed open. Null observations faithfully remained unknown.
check/scope/verify editor --with-consumers exit0 (203 sources, UI build); verify rerun
after await locator capture correction. IO_NOT_VERIFIED / UI_NOT_VERIFIED. Next PM09.
