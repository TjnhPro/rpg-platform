# TASK — RPG Platform v0.17.2: Asset Selection & Placement Context

**Phase:** 17 — Visual Object Placement  
**Checkpoint:** 3/13 · **Capability:** VP03  
**Canonical owner:** `editor` only  
**Repository:** https://github.com/TjnhPro/rpg-platform  
**Task status:** Implementation specification; **not** evidence that code already exists  
**Execution:** one folder, 13 tasks in version order, 13 commits, one branch, one PR

## A. Objective and scope for this version

**Single objective:** Định nghĩa placement context từ Asset Browser/Project/Map/layer/coordinate space theo dữ liệu thật, không giữ bản sao asset manager.

### Required implementation decisions

- Consume API Phase14 chọn `AssetReference` project-scoped; dùng `createAssetReference`, `resolveAssetReference`/`diagnoseAssetReference` đã có; host cho biết resource visual supported/unsupported, không suy từ filename hay category.
- Đòi hỏi active ProjectSession, active tracked Scene/Map, đúng `projectId`, `sceneId`, `coordinateSpaceId`, known Map layer và allowed authoring class; thiếu dependency thật thì `BLOCKED_DEPENDENCY` với source evidence.
- PlacementContext là request/adapter ngắn hạn; không trở thành authored record song song với Project/Map/Scene. Project A/B same relative asset locator vẫn độc lập.
- Layer must exist according to current Phase15 map layer definition and be placeable for visual objects; không mặc nhiên đặt Player/NPC vào tile/background layers.
- `npc` là classification authoring; Asset Manager category NPC không bắt buộc. Asset vô hình hoặc metadata-only có thể giữ reference có chẩn đoán nhưng không được báo Render PASS.
- Kiểm tra selection stale khi đổi project/map/asset; không chuyển `selectedAssetId` global cho toàn Editor; không encode mutable live root handle vào Scene.

### Acceptance specific to v0.17.2

- Same-project valid visual asset + Scene + layer + space tạo context nhất quán; cross-project asset/root/Scene mismatch reject trước mutate.
- Unsupported/nonvisual asset status được trả rõ; không allocate Render hoặc tự import PNG decoder.
- Chuyển Project A→B không tái sử dụng context/selection cũ.

### This checkpoint's file scope

Focused Editor placement adapter; reuse Phase14/15 public modules unchanged; docs/checkpoint.

## B. Canonical ownership & non-negotiable guardrails

**Sole production owner: L4 `editor`**. Editor stores authored Scene object state; Phase13 owns ProjectManifest and tracked Scene reference; Phase14 owns Asset Catalog/Browser; Phase15 owns Map content, layers, grid/bounds; Phase16 owns Inspector + visual profile; Phase3 owns Scene objects/membership; Phase4 owns coordinate/grid conversion; Phase5 owns DocumentSession and codec/load/save; Phase7–9 `runtime-render` owns actual visual instances, scene resources and camera. `runtime-engine`, `runtime-render`, `game-client`, `game-server` and installed L1/L2 packages are **read-only** during Phase17. No sixth workspace.

1. **Reuse before new code**: inspect exact source and public root exports before adding an API. Never invent existing names for Phase14–16; their task specs are not implementation proof. If necessary contracts are missing, stop with `BLOCKED_DEPENDENCY` and a minimal correct-owner proposal; no parallel Asset Manager/Map Editor/Inspector/Document/Render system.
2. **Scene is canonical**: `SceneObjectDefinition` owns objectId/displayName/classification; `SceneMembership` owns assetReference/layerKey/placement/attachments/list order. No `PlacementObject` store or second position field; serializable selection forbidden.
3. **Presentation is distinct from gameplay**: Player, Monster, NPC, Item and VFX are **authoring labels**; gameplay entity id, AI, collision, pathfinding, effects playback and runtime spawn are excluded. Do not equate `classification` with `AssetDefinition.kind` or browser category.
4. **Document metadata preservation**: Source Scene Documents may contain legal opaque metadata on scene/content/object/definition, including Phase15 Map and Phase16 visual profiles. Any add/delete/duplicate/move through Document must preserve unrelated metadata; if unknown profile cannot be preserved safely, explicitly reject. Do not serialize bare `SceneMembership` over a richer Document.
5. **Project isolation**: `projectId` exact on active Project/Scene/Asset/Map/Document/root capability. Same relative resource path in two Projects is not same asset. No implicit project fallback/global active singleton.
6. **Host IO honesty**: `saveDocument` is sole canonical save authority; `Save Scene` ≠ `Save Project` ≠ `Save All`. `DocumentWritePrecondition`/actual host CAS/create-only receipts matter; never read-then-rename and claim CAS. The Phase13 manual host only authorizes `project.json` and create-only publication — it is **not** automatically a Scene Document write port.
7. **Safe delete/duplicate**: deletion default rejects inbound authored references, with no cascades; duplication must have fresh scene-local objectId and preserve only valid object-owned profile/metadata, never Render/session identity.
8. **UI policy**: existing Phase12 React/Mantine, EditorShell/EditorPanel, `ui:check` and shared theme. UI selection transient. Browser visual verification may be postponed to the dedicated UI phase, but source controls must work and evidence statuses must remain honest.
9. **Testing budget**: build/checks and small finite manual repros only. Do not generate unit/integration/E2E/Playwright/snapshot suites, large coverage pipelines or screenshot matrices unless Developer separately authorizes a documented critical need.

## C. Strict changed-file ceiling

Production additions should stay in `editor/src/visual-placement-*.ts` (or a source-verified existing Phase14–16 focused adapter), **optionally** `editor/src/document-scene-placement.ts` for Scene Document collection edits, `editor/src/index.ts` for additive exports, and `editor/ui/src/features/visual-object-placement/**` plus the smallest `editor/ui/src/app/App.tsx` wiring at VP12. Finite manual host/repro belongs under `editor/manual/visual-object-placement-*`; documentation under `editor/docs/visual-object-placement*`, task copies under `editor/docs/tasks/phase17-visual-object-placement/**`; evidence in `harness/checkpoints/visual-object-placement-v0.17.N.md`, with a narrow `harness/OWNERSHIP.md` pointer if warranted.

**Do not modify** generic Scene, Spatial, Asset, Document, Renderer or Project foundations merely for convenience; prior Phase14/15/16 owners may be consumed but not silently rewritten. Do not alter root package/lock, CI/harness CLI or UI theme/style conventions. If exact source shows a genuine owner-level defect that cannot be bridged safely, record code/impact/minimal delta and request Developer decision instead of unauthorized scope expansion. Each task's *Files* section is stricter than this ceiling.

## D. Agent protocol — one folder, ordered autonomous execution

1. Start from actual current repository HEAD, clean state, base branch and five-workspace graph. Read `AGENTS.md`, `ARCHITECTURE.md`, `FOUNDATION.md`, `editor/AGENTS.md`, relevant `harness/{OWNERSHIP,CONTRACTS,WORKFLOW,VERIFICATION,FAILURES}.md`, actual Phase14–16 public source and latest prior v0.17 checkpoint.
2. Implement **exactly this version's capability**, not later tasks. Before code, note affected owner/APIs, expected public delta, files allowed, dependency availability, and any existing reusable implementation. Never replace task acceptance with a guessed API.
3. Run authentic commands from repo root as applicable:

   ```bash
   node harness/cli.mjs check
   node harness/cli.mjs scope --projects editor --allow-infra
   node harness/cli.mjs verify --projects editor --with-consumers
   ```

   When UI touched run actual `npm --workspace editor run ui:check` and `npm --workspace editor run ui:build` **or** commands matching execution HEAD; don't invent npm workspace names if package scripts differ. At closure run full five-workspace verify/forced build as prescribed by harness. A build pass is not FS/UI/Render visual proof.
4. Record `harness/checkpoints/visual-object-placement-v0.17.N.md`: exact branch + current parent/commit identification, changed files, reused APIs/public delta, command exit statuses, finite observed outcomes/negative case, unsupported/unverified behavior and next version. **Each of 13 versions = separate commit, in order**; do not combine, skip, amend prior-version semantic changes without documented justified correction.
5. One Phase17 branch and **one PR**, continue versions automatically without routine Developer pauses. Escalate **material architecture/owner/contract conflicts** or actual missing prerequisites. No self-merge, auto-tag, publish or launch Phase18. Developer acceptance follows ChatGPT whole-PR review.

## E. Evidence & acceptance semantics

- `ARCH_CHECK_PASS` and `BUILD_PASS` require real command output; CI must be checked at exact PR HEAD.
- `SCENE_AUTHORING_OBSERVED` requires finite successful operations on actual canonical Scene data. `SCENE_IO_OBSERVED` requires filesystem write/readback under a host-authorized Scene locator, **not** memory roundtrip or project.json-only evidence.
- `PREVIEW_OBSERVED` requires a real Render bridge/host outcome; `VISUAL_VERIFIED` requires actual visual observation. UI buttons wired in TSX plus Vite build are `UI_BUILD_PASS`, **not** `UI_INTERACTION_VERIFIED`.
- Mark unsupported host revisions/Scene save updates `UNSUPPORTED_CAS` rather than claiming persistence. Wrong project, stale session, missing asset, unresolved preview, inbound attachment, etc. require real diagnoses when triggered.

## F. Deferred

Drag/drop asset palette, canvas click-to-place, pixel-perfect hit-testing, multi-select/box selection, transform gizmos, undo/redo, collision/navmesh/pathfinding, prefab system/hierarchy, asset file delete, gameplay entity spawning, NPC AI, combat/VFX playback implementation, authoring-wide migration, feature browser testing/visual regression matrix. Contracts remain extensible without implementing these now.

## G. Required checkpoint handoff

- Version/capability: `v0.17.2` / `VP03`. Link exact task from `editor/docs/tasks/phase17-visual-object-placement/` in checkpoint.
- Preflight: base commit, parent HEAD, active branch, actual matching Phase14/15/16 signatures; identify any missing dependency *before* feature code; note changed paths and owner.
- Implement bounded version capability, run actual three harness gates and relevant UI build, finite positive/negative examples. Record pass/fail/not-checked precisely.
- Commit **only this version** with a focused message e.g. `feat(editor): asset selection placement context (v0.17.2)` (v0.17.0 / v0.17.12 may be docs audit commits). Do not squash earlier checkpoints.
- **Next:** v0.17.3 — Positioning & Map Bounds. Proceed only after valid checkpoint commit and rereading its task; no routine approval pauses. If blocked, write `BLOCKED_WITH_EVIDENCE`, owner, source signature, minimal proposal and stop rather than misrepresent completion.
