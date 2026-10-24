# v0.13.8 — PM09 Save

Preflight 077336fac4ae66a84c0b4ae67e9aa57555857e4d (PM08), exact task and existing saveDocument audited. Editor
owner; project-save adds saveProject/ProjectSaveResult. Uses original session-bound
root/locator/borrowed write port, fixed canonical project context and caller storage
precondition. No alternate port argument can redirect A to B. No JSON writer, fake
saved flags, transaction/retry/recovery, physical IO or Save All implementation.
Canonical DocumentSaveResult preserved; project-local binding/state/port gaps yield
project-blocked reason. Host create-only supports absent only; revision needs genuine
CAS. Unsupported guarantee stays blocked, no read/hash/rename substitute.

Finite explicitly simulated trusted-port outcomes, NOT disk evidence: first absent
committed captured project envelope/clean A; repeated absent conflicted; revision on
create-only blocked. Failed and uncertain left new sessions dirty; uncertain retry
blocked with one dispatch. Concurrent save blocked busy; close during pending commit
returned acknowledgement session-closed and Project stayed closed. Independent dirty
DocumentSession remained dirty. These receipts are simulation-only and not physical
commit evidence. PM10 must prove real storage. No new automated suite.
check/scope/verify editor --with-consumers exit0 (204 sources, UI build).
IO_NOT_VERIFIED / UI_NOT_VERIFIED. Next PM10 after this commit.
