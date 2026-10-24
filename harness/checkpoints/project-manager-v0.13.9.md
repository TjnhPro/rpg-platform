# v0.13.9 — PM10

Parent 07bfbe4949e9850de36eb561a70bdf3b4fd367b5; branch feat/project-manager-v0.13;
PR pending. Commit is uniquely identified by this checkpoint's addition in git log.
Editor owns the Project Manager Panel and public API consumption. The manual Node
host owns physical authorization and real create-only publication. No L1/L2 or
other production project, theme, stylesheet, dependency or Document core change.

Added one existing-shell Mantine Panel, two explicit root capabilities, actual
Create/Open/Save wiring, and finite real filesystem/HTTP demonstration hosts.
See [reproduction and observed evidence](../../editor/docs/project-manager-mvp.md).
CLI exit0: two distinct files saved/reopened; metadata/reference retention and A/B
isolation observed, foreign reference/root rejected. HTTP Save/Open retained Unicode;
foreign Origin/binding rejected. No existing-file CAS/update or durability claim.

Actual check, scope --projects editor --allow-infra and verify --projects editor
--with-consumers exited0. UI checker: 11 sources/3 stylesheets, zero errors/warnings;
TypeScript/Vite passed. Existing bundle-size/DEP0190 warnings remain.
CORE_IO_OBSERVED / UI_BUILD_PASS / UI_NOT_VERIFIED / VISUAL_NOT_VERIFIED: browser
inventory empty and iab unavailable. No browser automation/test suite or GPU work.
Next v0.13.10 audit only after this capability commit; Developer accepts the phase.
