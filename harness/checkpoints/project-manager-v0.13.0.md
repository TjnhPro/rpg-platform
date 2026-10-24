# v0.13.0 — PM01 architecture checkpoint

Branch feat/project-manager-v0.13; parent/main
592e4d0b0352614ae151ec7e8495c7a2fbd31abf. Commit is the unique v0.13.0 checkpoint
in `git log --oneline -- harness/checkpoints/project-manager-v0.13.0.md` (no self-hash).
PR not yet created. No production source/public/dependency delta.

Editor is the only owner. Harness stores design and sequential execution guidance;
other four projects and L1/L2 remain read-only. No external public APIs called.
See [frozen design](../../editor/docs/project-manager-v0.13.0.md),
[actual inventory](../../editor/docs/project-manager-api-inventory-v0.13.0.md), and
[exact supplied tasks](../../editor/docs/tasks/phase13-project-manager/MANIFEST.md).

Changed: those reports, task copies, this checkpoint, and a narrow OWNERSHIP pointer
recording Developer's strict sequential-commit instruction. Root manifest/CI/source
unchanged. No implementation of PM02 or later capability.

Actual commands on baseline: check exit 0 (193 files); scope --projects editor
--allow-infra exit 0; verify --projects editor --with-consumers exit 0, including
UI contract check, TypeScript and Vite. Phase12 source is present on actual HEAD.
Recheck scope/check with documentation delta before commit. Existing bundle-size
and Node harness deprecation warnings remain. IO_NOT_VERIFIED / UI_NOT_VERIFIED;
no feature, physical containment, storage receipt or functional acceptance asserted.

Next: v0.13.1 only after verifying this commit and reading PM02 exact task. No
routine review gate; no skipping versions. Final Developer review, no self-merge.
