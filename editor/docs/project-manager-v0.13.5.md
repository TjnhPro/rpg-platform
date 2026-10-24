# v0.13.5 — PM06 session lifecycle

Preflight e0ab7bd453c491ed10af31f3402886b2699bb717 (PM05) and exact task/current DocumentSession audited.
Editor sole owner; new project-session and root exports createProjectSession,
getProjectSessionSnapshot, openProjectSession, replaceProjectManifest,
closeProjectSession plus ProjectSession/Snapshot. No external API calls/other owners.

Opaque original capability adopts one canonical document once, validates project/kind/
version/root/manifest-self-reference; no global active session. Snapshot state, dirty,
current/saved revision derive from DocumentSession. Replacement requires expected
revision, validates candidate before canonical replaceContent. Distinct captures
conservatively count as edits, no semantic deep-equality promise. Close requires
explicit discard; clears borrowed root/document references, retains closed immutable
snapshot, never disposes other owner's ports/resources. Reopen is a fresh capability.

Finite public-root observations: A edited to generation2/dirty, B name unchanged;
stale revision, duplicate document adoption, missing discard, copied handle reject.
A closed while B stayed open; double-close/reopen of A reject. New documents are
unsaved, no forged saved evidence. No Scene Document session is owned or cleared.
check/scope/verify editor --with-consumers exit0 (201 sources, UI build), rerun verify
after replacing candidate cast with canonical replaceDocumentContent. IO_NOT_VERIFIED /
UI_NOT_VERIFIED. No IO or second persistence/dirty implementation. Next PM07 after commit.
