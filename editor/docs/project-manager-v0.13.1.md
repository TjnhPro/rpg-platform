# v0.13.1 — PM02 manifest admission

Preflight parent: 08f18e742b65ae9524b2b390dc2d718746d96340 on feat/project-manager-v0.13; preceding PM01/task audited.
Owner editor, no collaborators or L1/L2 API calls. Additive public exports:
ProjectManifest/Input/Metadata/ResourceRoot/DocumentReference/ActiveScene,
create/read/diagnoseProjectManifest, ProjectDiagnostic/ManifestDiagnosis and
ProjectValidationError. DocumentValidationContext gains project owner; existing
owners and load/save/session signatures remain unchanged.

Manifest schema 1 uses frozen PM01 shape, strict stored reader vs authoring defaults.
Unknown structural keys/accessors/nonportable data reject; empty description retained,
blank/edge-whitespace name rejects. No IO or generated identity. Nested input detached.
Nonempty roots/docs/selection explicitly unsupported until PM03–05 canonical owners.
Existing Document diagnostics delegate project validation, enforce kind project/version1
and envelope/content projectId agreement; original decoded content is retained.

Actual finite Node public-root observations: valid strict admission; detached metadata
remained Game A after caller mutation; nested records/arrays frozen; invalid ID, extra
key, future schema, blank name, null roots and accessor rejected. Envelope mismatch
reported DOCUMENT_PROJECT_MISMATCH. Existing text owner remained valid. No automated
suite added. Old scene/asset/spatial branches unchanged by source diff, not newly
functionally verified. No proxy sandbox guarantee; unknown trap exceptions propagate.

check exit0 (196 sources), scope editor --allow-infra exit0, verify editor
--with-consumers exit0 including UI checker/TS/Vite. Existing warnings unchanged.
IO_NOT_VERIFIED / UI_NOT_VERIFIED. Next PM03 after this checkpoint commit.
