# Phase 17 — Visual Object Placement · Execution Manifest

**Repository:** https://github.com/TjnhPro/rpg-platform  
**Owner:** Editor (L4), portable authored Scene + React/Mantine UI only  
**Scope:** `v0.17.0–v0.17.12`; 13 ordered capabilities, 13 independent `.md` tasks, 13 checkpoint commits, **one branch and one PR**.  
**Developer-approved objective:** Select visual asset; place object into Map; select/move/duplicate/delete; Position; authored Player/Monster/NPC/Item/VFX **without Runtime Engine**.  
**Final review:** ChatGPT examines entire PR against every task, then Developer authorizes merge. Codex does not self-merge or prematurely mark visual UI verified.

## Foundation preflight (source truth, not speculative implementation)

Last inspected GitHub `main` 2026-10-24 contains through merged Phase13. Key contracts: `editor/src/scene-membership.ts` exports `addSceneObject`, `getSceneObject`, `removeSceneObject`, `replaceSceneObject`, `updateSceneObjectPlacement`; `scene-spatial-placement.ts` exports `updateSceneObjectSpatialPlacement`; Scene preview bridge at `scene-preview.ts`; `document-scene-edit.ts` only **replaces** an existing object and preserves declared metadata, cannot insert/delete. `document-session.ts`, `document-load.ts`, `document-save.ts` own persistence. Runtime Render owns camera/viewport inverse conversions and visual instances. Phase12 React/Mantine shell exists. **Phase14, Phase15 and Phase16 completion was not visible on inspected main**: these are **mandatory actual-code dependency audits**, not permission to scaffold replacements. If absent when a version requires them: `BLOCKED_DEPENDENCY` with evidence.

## Sequenced task folder

| Version | ID | Single capability | File |
| --- | --- | --- | --- |
| `v0.17.0` | VP01 | Visual Placement Architecture & Contract Foundation | [rpg-platform-v0.17.0-visual-placement-architecture-contract-foundation-task.md](./rpg-platform-v0.17.0-visual-placement-architecture-contract-foundation-task.md) |
| `v0.17.1` | VP02 | Object Identity & Classification | [rpg-platform-v0.17.1-object-identity-classification-task.md](./rpg-platform-v0.17.1-object-identity-classification-task.md) |
| `v0.17.2` | VP03 | Asset Selection & Placement Context | [rpg-platform-v0.17.2-asset-selection-placement-context-task.md](./rpg-platform-v0.17.2-asset-selection-placement-context-task.md) |
| `v0.17.3` | VP04 | Positioning & Map Bounds | [rpg-platform-v0.17.3-positioning-map-bounds-task.md](./rpg-platform-v0.17.3-positioning-map-bounds-task.md) |
| `v0.17.4` | VP05 | Place Visual Object | [rpg-platform-v0.17.4-place-visual-object-task.md](./rpg-platform-v0.17.4-place-visual-object-task.md) |
| `v0.17.5` | VP06 | Object Selection | [rpg-platform-v0.17.5-object-selection-task.md](./rpg-platform-v0.17.5-object-selection-task.md) |
| `v0.17.6` | VP07 | Move Visual Object | [rpg-platform-v0.17.6-move-visual-object-task.md](./rpg-platform-v0.17.6-move-visual-object-task.md) |
| `v0.17.7` | VP08 | Duplicate Visual Object | [rpg-platform-v0.17.7-duplicate-visual-object-task.md](./rpg-platform-v0.17.7-duplicate-visual-object-task.md) |
| `v0.17.8` | VP09 | Delete Visual Object | [rpg-platform-v0.17.8-delete-visual-object-task.md](./rpg-platform-v0.17.8-delete-visual-object-task.md) |
| `v0.17.9` | VP10 | Scene Document Edit Integration | [rpg-platform-v0.17.9-scene-document-edit-integration-task.md](./rpg-platform-v0.17.9-scene-document-edit-integration-task.md) |
| `v0.17.10` | VP11 | Placement Preview & Viewport Integration | [rpg-platform-v0.17.10-placement-preview-viewport-integration-task.md](./rpg-platform-v0.17.10-placement-preview-viewport-integration-task.md) |
| `v0.17.11` | VP12 | Minimal Working Visual Placement MVP | [rpg-platform-v0.17.11-minimal-working-visual-placement-mvp-task.md](./rpg-platform-v0.17.11-minimal-working-visual-placement-mvp-task.md) |
| `v0.17.12` | VP13 | Integration & MVP Closure | [rpg-platform-v0.17.12-visual-placement-integration-mvp-closure-task.md](./rpg-platform-v0.17.12-visual-placement-integration-mvp-closure-task.md) |

## Non-negotiable acceptance

- Identity is Scene-local, asset reference is Project-local; authored class `player/monster/npc/item/vfx` is never a gameplay entity or Renderer mode.
- SceneMembership remains single canonical store for definition/asset/layer/placement; Phase16 owns Visual Property metadata. Selection remains transient.
- Move/clone/delete preserve Scene Document/Map/Visual Profile metadata. Duplicate gets new ID, deleting target with inbound attachments defaults REJECT. No cascade.
- No production changes outside Editor; Runtime Engine/Render and L1/L2 unchanged, five-workspace graph unchanged. No duplicate renderer, gameplay or authoring storage layer.
- Save Scene via canonical DocumentSession/saveDocument only; Phase13 demo host is project.json-only/create-only and cannot be reused to claim general Scene write/overwrite. Capture host-supported real IO or transparent `SCENE_IO_NOT_VERIFIED`.
- UI wired to actual Editor commands with Mantine reuse; no new UI design system. Browser visual/interaction verification may occur in dedicated UI phase later, but no false PASS.
- Keep automated test budget minimal: build, scope, few finite negative/positive manual runs, evidence. No new large unit/E2E/Playwright/snapshot suites.

## Exact agent execution process

1. Read repo and task folder and exact HEAD; verify Phase14–16 source/contracts; note any gaps and overlap with Map/Inspector owners.
2. Execute `v0.17.0`, commit checkpoint; then `v0.17.1`, commit; ... through `v0.17.12`. **Do not batch commits even though folder is batched.** No intermediate routine Human review.
3. Run `node harness/cli.mjs check`, `node harness/cli.mjs scope --projects editor --allow-infra`, `node harness/cli.mjs verify --projects editor --with-consumers` each relevant checkpoint; UI check/build when UI changes; full five-project and forced build on closure. Record actual exit statuses.
4. Checkpoints: `harness/checkpoints/visual-object-placement-v0.17.0.md` ... `visual-object-placement-v0.17.12.md`. Keep one branch `feat/visual-object-placement-v0.17` and one PR.
5. Closure has task→commit→source evidence and explicit `UI_NOT_VERIFIED`, `VISUAL_NOT_VERIFIED`, `UNSUPPORTED_CAS` when applicable; exact-head CI and Developer approval required for merge.

## Minimum finite MVP (VP12)

- Map/Scene with valid Project, one PNG visual Asset selection, one object created and classified, choose/select through object list.
- Move by numeric coordinates (or grid-cell through Phase4), duplicate with different objectId, delete unreferenced duplicate, keep correct original and visual properties.
- Capture canonical Scene data/revision; save-and-reopen **only through actually available authorized Scene host**; if create-only, perform create-before-first-save proof and mark overwrite unsupported; do not treat memory-only readback as disk IO.
- Preview through existing bridge where possible; no VFX playback claim unless true host/asset supports it. No gizmo or canvas drag requirement.

## Explicit stop gates

`BLOCKED_DEPENDENCY` if Phase14 Asset Manager, Phase15 Map/Layers/Bounds, Phase16 Visual Profile/selection or suitable Scene Document authoring seam is genuinely absent and version cannot proceed without replacing it. `BLOCKED_CONTRACT` if preserving metadata across Scene Document add/remove is impossible without correct-owner change. `BLOCKED_IO` if required actual filesystem save cannot be demonstrated through authorized host. For each, give source evidence, owner and smallest delta, never invent missing API/green status. Isolated earlier pure contracts can be completed honestly if sequential policy and task allow it; do not skip a blocked version to implement later ones.

## Boundaries / future phases

No test suite explosion, no drag/drop/gizmos/multi-select/collision/AI/combat/autosave/asset-file manipulation/untested persistence. Dedicated UI Verification phase will inspect real browser interactions later; until then accurately label UI build vs interaction vs visual evidence.
