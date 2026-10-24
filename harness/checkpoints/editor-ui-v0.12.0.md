# Editor UI v0.12.0 — architecture foundation checkpoint

Status: IMPLEMENTED (documentation only); FEATURE_NOT_VERIFIED; VISUAL_NOT_VERIFIED.
Phase acceptance remains Developer-owned. No UI_PASS, WEBGL_VISUAL_PASS or MVP_PASS.

## Preflight

- Branch: feat/editor-ui-foundation-v0.12; base main f1a0750851994659a564ff100ba85959767f9b6f.
- Intent: freeze one internal React/Mantine UI path before application implementation.
- Canonical owner: editor. Collaborator: Harness evidence only; no other production project touched.
- Read root/project AGENTS, ARCHITECTURE, OWNERSHIP, WORKFLOW, VERIFICATION,
  real Editor package/tsconfig, public root and viewport host. Route hint agreed
  with Editor ownership; source and boundaries determine the decision.
- Actual baseline: portable TypeScript library, tsc -b --force, src/**/*.ts only;
  no React/Mantine dependencies, TSX app or ui:build. Eleven historical HTML hosts
  inventoried in the contract; unchanged, not imported into the new app.
- APIs reused in the design: existing internal mountEditorViewport and returned
  start/sync/requestFrame/suspend/resume/unmount/getSnapshot; Render package root.
  No API is newly consumed by executable code. External L1/L2 APIs: none touched.
- Public contract delta: none. No missing upstream capability identified for this
  documentation task. Runtime behavior, authored schemas and five-workspace graph unchanged.

## Exact file scope

1. editor/docs/ui-foundation-contract.md — UI-01–12, source map, lifetime path,
   accessibility, ordered manifest and honest verification contract.
2. editor/docs/ui-styling-policy.md — ST-01–07, allowed/disallowed/approval table,
   EC-01–07 future build enforcement requirements and normal component additions.
3. editor/docs/tasks/editor-ui-v0.12.0.md — supplied task content (trailing whitespace normalized).
4. harness/checkpoints/editor-ui-v0.12.0.md — this evidence.

No source, manifest, lockfile, CSS, CI, Harness CLI or other project delta.
Pre-existing untracked .mcp.json is outside the checkpoint and left untouched.

## Gates

- node harness/cli.mjs check: exit 0; ARCH_CHECK_PASS, 183 JS/TS files inspected.
- node harness/cli.mjs verify --projects editor: exit 0; actual npm run build →
  tsc -b --force completed; BUILD_PASS [editor]. No consumer flag needed because
  public contracts are unchanged.
- node harness/cli.mjs scope --projects editor --allow-infra: exit 0; SCOPE_PASS.
  Its five-path count includes pre-existing untracked .mcp.json; the actual
  staged checkpoint contains exactly the four allowed paths above.
- git diff --cached --check: clean after normalizing trailing whitespace in the
  task copy; git diff --name-only HEAD audited against the four-path allowlist.
- No protected production source, package manifest, lockfile or public export
  changed. Existing Node DEP0190 warning was emitted by the unchanged Harness
  build launcher; it did not fail the genuine Editor build.

## Handoff

User confirmed subsequent task details will be supplied after this branch and
commit. Stop implementation at v0.12.0; reuse this Phase 12 branch for subsequent
checkpoint commits and one phase PR. Scope ceilings from the supplied manifest
are recorded without replacing the individual tasks. Next is v0.12.1 bootstrap.
No per-checkpoint approval is required for supplied tasks within the locked scope.

ui:build and ui:check are NOT_CONFIGURED at this documentation-only checkpoint;
this is explicitly not a UI build result. Theme defaults, application, Panel,
enforcement and viewport React integration remain unimplemented. No browser,
keyboard, resize, cleanup or WebGL observation has been made. No new tests run or
introduced. Final v0.12.10 must remain documentation/review-only.
