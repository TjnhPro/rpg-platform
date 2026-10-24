# TASK — RPG Platform v0.13.10: Project Manager Integration & MVP Closure

**Phase:** 13 — Editor Project Manager  
**Checkpoint:** 11/11 · **Capability:** PM11  
**Canonical primary owner:** L4 `editor` only  
**Repository:** https://github.com/TjnhPro/rpg-platform  
**Task status:** Specification only; not implementation or runtime/visual acceptance.  
**One objective:** Final strict Editor-only scope, contract and minimal-MVP evidence audit.

## A. Mục tiêu version và giới hạn

## Phạm vi: audit / fix defects thuộc PM01–PM10, không thêm tính năng mới

- Inventory all checkpoints `v0.13.0`…`v0.13.9`, current root exports and emitted declarations, unchanged Scene/Asset/Document meanings and Phase12 theme/components. Compare actual source to frozen PM01 manifest schema and owner table.
- Review **project isolation evidence**: A/B root capability, exact projectId comparison in content/envelope, document tracking/activeScene references, no implicit global project selection. Negative case must be source-backed or actually observed; CLI files distinct.
- Review **persistence semantics**: new create-only commit, loaded project evidence, conditional save behavior only where host can attest guarantee, failed/uncertain writes no false acknowledgement, Save Project does not Save All Documents.
- Review **UI**: PM10 is one Panel integrated into existing Shell using Mantine component defaults. Audit `ui:check` and CSS diff to ensure no new per-feature global CSS, duplicate widget kit, or business manager elsewhere.
- Re-run scoped Editor architecture/build/UI builds, impacted consumers only if root/public API changes, and phase-level real full workspace build as prescribed by existing harness. CI exact HEAD; no fake PASS.
- Report distinct: contracts verified, filesystem behavior observed, UI interaction observed/not observed, project identity isolation observed, unsupported CAS/Save updates, unknown physical symlink safety. Distinguish code assertion/contract reasoning from actual real storage evidence.
- Fix only narrowly evidenced defects in Editor; cross-project ownership/request to change Document Foundation breaking API requires Developer approval, not workaround.

## Deliverables

- `editor/docs/project-manager-v0.13.10-closure.md`: PM01–PM11 checklist, API delta inventory, source/ownership matrix, supported/deferred behaviors, actual commands and outputs, minimal repro/log path, UI observations, unresolved risks.
- `harness/checkpoints/project-manager-v0.13.10.md`: final branch/PR/commit and evidence, Developer decision required to merge. No automatic merge, release or publish.

## Acceptance chuyên biệt

- 11 version checkpoints present, individual capabilities not accidentally merged/skipped. Zero production changes outside Editor. All three MVP operations wired to real APIs; no fake browser result.
- No `MVP_PASS` without Create/Save/Open *real storage* plus A/B isolation; no `UI_VERIFIED` without actual browser interaction. Build green alone cannot close behavioral acceptance.
- Closure may be `READY_FOR_DEVELOPER_REVIEW_WITH_LIMITATIONS` if unsupported existing-file CAS or browser evidence remains, explicitly not full behavior PASS. Do not add new feature at closure just to remove warning.

## B. Strict ownership, limits and source truth

**Only L4 `editor` owns this feature.** Public/business code lives in `editor/src/project-*.ts`; UI only in the existing Phase12 `editor/ui/**` application; manual/demo host may live under `editor/manual/**`. Project is an Editor authored workspace; it is **not** an L3 Engine game instance or client/server runtime project. `@rpg/core/kernel`, `@rpg/gameplay`, `runtime-engine/`, `runtime-render/`, `game-client/`, `game-server/` are READ-ONLY for this entire phase. No sixth workspace, no Render/Scene/Asset/Document parallel manager. No external L1/L2 changes.

**File allowlist, narrow to this task's actual deliverables:** `editor/src/project-*.ts`; `editor/src/document-diagnostics.ts` **only PM02 authorized additive project content-owner integration**; `editor/src/index.ts` **only public Project API additions**; `editor/ui/**` **only PM10**; `editor/manual/**` **only PM10 real host demonstration**; `editor/docs/project-manager-*.md` and `editor/docs/tasks/**`; `editor/AGENTS.md` if a concise necessary rule pointer; `harness/checkpoints/project-manager-v0.13.N.md` and narrowly justified `harness/OWNERSHIP.md` / `harness/CONTRACTS.md` pointers. Do **not** modify `editor/src/document-load.ts`, `document-save.ts`, `document-session.ts`, `asset-*.ts`, `scene-*.ts`, `viewport-host.ts` or other UI Foundation component/theme files. If a true dependency gap requires a source edit outside this allowlist, **STOP** with source evidence and smallest correct-owner delta plan; do not silently expand scope. No root `package.json`, `package-lock.json` unless explicitly approved for a demonstrated missing Editor dependency, no `harness/cli.mjs`, `harness/config.json`, CI workflows.

**Source baseline (checked 2026-10-24, not a promise for execution HEAD):** main has Editor `DocumentEnvelope` schema1, `DocumentIdentity(projectId,documentId)`, `DocumentSession`, `loadDocument`, `saveDocument`, `DocumentValidationContext` with scene/asset/coordinate-space/text owners, and `createResourceLocator` for *project-relative* paths. Phase10 merged; Phase11 underway; **Phase12 UI task files exist but React/Mantine implementation is not visible in main at authoring time.** Re-audit exact HEAD and current branch; Phase13 must not recreate missing Phase12.

## C. Canonical contracts — apply to this checkpoint

1. **Project ID is logical and exact.** No folder-name-derived IDs, no global “active project” database, no implicit A→B fallback, no matching by name or filesystem locator. Project manifest DocumentIdentity and Asset/Scene identities must agree on `projectId` when bound.
2. **Project manifest is authored portable data**, not physical root, user settings, UI theme, gameplay state, Scene content, GPU resources or open sessions. `DocumentEnvelope`/codec/persistence from Editor remain authoritative; project-specific content validation is an additive Editor owner extension, not a second persistence stack.
3. **Logical roots vs physical root are different.** Reuse `createResourceLocator`; relative lexical validity alone is **not** symlink/permission/containment proof. Host explicitly authorizes root/filesystem operations. No path traversal, absolute path serialization or directory guessing.
4. **Tracked document list contains references only.** No eager recursive reads, document body clones, auto resource scans or claim `file exists` without host IO. One open session does not own another document's dirty/saved state.
5. **Active Scene = project-local selection reference only.** No implied Scene load, Scene rendering, camera/viewport switch, or gameplay scene transition. Invalid/foreign/untracked reference cannot be selected.
6. **Save Project = only manifest**. Uses `saveDocument`'s actual CAS/create-only contract and host-attested result; never saves tracked Scene/Asset documents, asserts disk safety from mere hash/check, auto-writes on open or clears others' dirty flags.
7. **Independent lifecycles.** A/B have separate root capability, document session identity and project session state. Close/unmount/dispose/reopen not allowed to resurrect prior session or free unrelated owner resources. Failure in B cannot corrupt A.
8. **React/Mantine v0.12 is mandatory for browser UI**, with theme/components, standard Panel and CSS checker; use only in PM10. No new framework, own Button/Input/Panel, per-feature CSS conventions, parallel app shell or WebGL dependencies.
9. **Contracts broad, MVP small.** Only Create/Save/Open, two project roots and one explicit mismatch rejection must be proven. No project wizard, recent projects, import ZIP, complex migration, Save All, project scan/index, multiwindow, cloud sync, Editor asset or scene browsers.
10. **No fake data/evidence:** no mock FS calling itself disk persistence, no fake saved receipts, no hardcoded “success” UI, no dummy builds or generated automated test suite. Build/static PASS is not file IO or UI behavior PASS.

## D. Agent workflow — one capability, one commit, one branch/PR

1. Read `AGENTS.md`, `ARCHITECTURE.md`, `FOUNDATION.md`, `editor/AGENTS.md`, `harness/{OWNERSHIP,CONTRACTS,WORKFLOW,VERIFICATION,FAILURES}.md`, the last PM checkpoint, real Editor declarations and **actual Phase12 UI contract at HEAD**. Scope delta narrowly; do not re-audit all unrelated work every version. `harness route` is advisory.
2. One Phase13 branch (`feat/project-manager-v0.13` suggested), **one PR**, `v0.13.0`→`v0.13.10` in order, **one task = one capability = one checkpoint commit**. Do not bundle versions or deploy later features ahead of scope. Continue automatically after genuine code/build/checkpoint gates; no routine Developer review pause. Developer owns final approval/merge.
3. Preflight record: current exact base/head, primary owner `editor`, reused canonical APIs, allowed paths, public type changes, expected semantics, discovered blockers. Preserve existing public API/backward compatibility and old Document owner validators. Breaking API or different canonical owner requires explicit Developer approval before code.
4. Implementation should be minimal *within* current capability, but **do not omit validation, deterministic state, error/recovery boundaries, or acceptance evidence** merely to save reasoning time. Prevent shadow layers, new dependency graphs, guessed APIs, insecure filesystem shortcuts.
5. Scope and build after version work:

```bash
node harness/cli.mjs check
node harness/cli.mjs scope --projects editor --allow-infra
node harness/cli.mjs verify --projects editor --with-consumers
```

Run exact equivalent commands matching HEAD harness; if Phase12 has `ui:check` / `ui:build`, invoke actual Editor UI gates at PM10/closure (and whenever UI changes). `npm run build -- --force` only at closure/full regression gate according to repo policy. If public Editor API consumers are known, compile impacted consumers; **do not add** cross-project changes merely to make builds pass. No dummy script, “skipped → PASS”, or invented CI run.
6. **Build-only automation policy:** no newly generated unit/integration/E2E/browser/Playwright/snapshot tests, test dependencies or screenshot matrices. Manual finite API/Node filesystem proof is permitted where appropriate; PM10 adds one minimal real browser interaction smoke **if environment provides it**. Record actual observations, not inference.
7. Checkpoint `harness/checkpoints/project-manager-v0.13.N.md`: exact branch/commit/PR links when known; changed files, source-backed owner/API delta, actual command exits, finite behaviors observed/not observed, storage guarantees and negative case, open issues and next checkpoint. No self-merge, release or publish. If blocker: `BLOCKED_WITH_EVIDENCE` with missing source signature, reproduction, proper owner + exact smallest proposal, rather than workaround.

## E. Common acceptance

- This version's named capability is actually implemented or audited in its permitted scope, without silently building the next version.
- No production delta outside `editor/`, no schema/public contract drift hidden from checkpoint, no alternative Document persistence, Asset Catalog or root access path.
- Build and architecture commands genuinely run; reports distinguish `ARCH_CHECK_PASS`, `BUILD_PASS`, `FEATURE_NOT_VERIFIED`, `IO_NOT_VERIFIED`, `UI_NOT_VERIFIED`, `BLOCKED` correctly.
- If missing Phase12 UI, proceed only with correctly authorized pure Project contracts; PM10 must stop for the actual UI prerequisite instead of creating a replacement Shell.

## F. Handoff / next checkpoint

Final status to Developer: READY_FOR_DEVELOPER_REVIEW or a transparent BLOCKED / NOT_VERIFIED outcome, with actual PR/CI links; no merge/release/tag.
