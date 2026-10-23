# v0.8.13 — SR20 manual Scene Rendering MVP

Canonical primary owner: runtime-render for scene/resource/presentation behavior.
Editor collaborates through its existing authored preview bridge; Client owns its
neutral sample adapter. Harness wiring composes the two optional manual consumers.
No production source, public symbol/signature, schema or dependency changes.

The [runbook](../manual/scene-mvp.md) provides exact compilation/serving commands,
browser URL, source provenance and expected seven-instance composition. Original
PNG bytes and real 40300 rectangular atlas text are committed with a generator and
SHA-256 manifest. The bounded allowlisted host provider verifies acquired bytes;
Phase7 owns parsing, frame resolution, PNG decode, upload, cache and lease usage.
No fallback image disguises loading/atlas failure. This is not an exported TPSheet
compatibility sample; TPSHEET_NOT_VERIFIED / TPSHEET_VISUAL_NOT_VERIFIED remain.

Each mount has its own provider/cache/session/scene. Both hosts resolve the same
Render module. Temporary acquire leases release after binding; instances retain
their own usage. Controls expose canonical handles, ground-y ordering, move without
recreation, visibility, remove, shared allocation observations and independent close.
Counts/IDs are observations, not decode-count, performance or GPU-health proof.

Close aborts source IO, closes the consumer and independently attempts resource
cleanup. Late acquisition is disposed before adoption. Recreate uses the same
canvas and canonical Phase6 acquisition; cleanup quarantine is never bypassed.
Errors expose safe diagnostics/partial outcomes, not automatic recovery/success.

Editor retains authored catalog/membership locally, with no Document dirty/save
effects. Client imports no Editor. No gameplay/Engine/Server/L1/L2 changes,
animation, VFX playback, Camera Controller, alternate renderer/cache or sixth project.
Rollback removes these optional consumers/content/docs; no data migration.

Strict consumer compilation and genuine project builds are build-only evidence.
Browser NOT_EXECUTED; FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED. Frame submission
is not displayed-pixel evidence. Developer owns manual acceptance; Phase8 stays open.
