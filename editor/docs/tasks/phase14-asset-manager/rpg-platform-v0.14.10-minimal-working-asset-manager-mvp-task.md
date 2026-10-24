# TASK — RPG Platform v0.14.10: Minimal Working Asset Manager MVP

**Phase:** 14 — L4 Editor Asset Manager & Browser  
**Checkpoint:** 11/12 · **Capability:** AM11  
**Canonical owner:** L4 `editor` (business + existing Phase12 Editor UI only as authorized)  
**Repository:** https://github.com/TjnhPro/rpg-platform  
**Task status:** Specification only; not evidence of implementation, UI or actual persisted files.  
**One objective:** Demonstrate a real minimal Asset Manager on the existing Mantine UI with two Project A assets, persisted reopen, Render PNG preview and Project B isolation—nothing more.

## A. Mục tiêu version, dependencies và contract cần triển khai

### Preconditions and scope for this capability

AM02–AM10 complete on actual HEAD; real Phase12/13 UI/Project contracts, Phase5 DocumentRead/Write ports and supported Render PNG preview are available. Reuse existing host, never bypass missing dependencies.

### Deliverables

Tiny user-operated MVP recipe, actual registered assets/documents under two real project roots, minimal browser host wiring, finite Node/Browser observations and clear failures.

### Exact implementation/architecture instructions

- Setup **Project A** with two real/authored assets only: (1) image `kind:'image'`, `metadata.editorBrowserCategory:'player'`, source `sprites/player.png` backed by actual readable PNG, (2) metadata-only `kind:'text'` (or another existing supported nonvisual kind) with category `item`, and no invented image. Other categories remain available filters but empty.
- Project A path: **Open A** via real Phase13 Project Manager → register existing authorized PNG and Item via AM04/AM05 → list/search/filter exact category/kind → select one → Inspector shows identity/kind/sources/metadata/reference → PNG preview via actual AM09 Render API. Item preview explicitly `unsupported`; no fake item image.
- Persist **each asset's own DocumentEnvelope** through existing Phase5 `DocumentSession`/`saveDocument` with real host receipts; Project Manager updates only tracked document references and saves its manifest **separately**. Do not promise one atomic `Save All` operation. Close/reopen A, load tracked asset documents, rebuild catalog and confirm both entries/metadata/category/reference from actual storage.
- Setup **Project B** in a different authorized physical root, with empty catalog or a B-local asset. Switching A↔B must not leak A results/selection/resources; a valid-looking A AssetReference passed under B must reject `PROJECT_MISMATCH`. No cross-root fallback, no path-based ID.
- UI MVP is **one browser panel** in existing React/Mantine Shell, not full Editor features. Minimal controls: Register existing, search, category filter, asset list/select, read-only Inspector and PNG preview. User may use Phase13 UI to switch/open/save project; do not duplicate Create/Open/Save into Asset Browser.
- A minimal Node/manual real-file observation may prove physical persistence/isolation and independent reloads. One finite browser manual smoke proves actual controls/PNG pixels only if performed; no Playwright or generated tests. Keep execution and evidence small.
- Distinguish after each action: catalog in-memory, document save receipt, Project Manifest save receipt, resource ready and actual visible PNG. `BUILD_PASS` never equals `IO_VERIFIED` or `VISUAL_VERIFIED`.
- If source asset PNG or browser host is unavailable, report `BLOCKED_DEPENDENCY`, `UI_NOT_VERIFIED` or `VISUAL_NOT_VERIFIED` with exact evidence; do not replace with constructed sample frames or fake persisted files.

### Forbidden shortcuts for this version

No complete Player/Monster/Map/Item/VFX preview matrix, scene placement, animation playback, dragging assets, bulk import, auto metadata forms or cross-platform browser test matrix.

### Expected concrete files

Minimum `editor/ui/**` MVP wiring, Editor-only real host demo/adapter in `editor/manual/**` if needed, `editor/docs/asset-manager-mvp.md`, checkpoint. No Runtime source changes.

### Finite acceptance/evidence for this capability

Real persisted A readback for two asset docs + project manifest; Project B isolation negative; one real selected PNG visible with actual browser observation when available; Item unsupported; one UI interaction trace; cleanup logs.


## B. Strict ownership, source baseline, dependency gates

**Primary/canonical production owner: L4 `editor` only.** Portable/project asset orchestration in Editor (new `asset-manager-*.ts` adapters as necessary), user-facing UI in **existing Phase12 `editor/ui/**`**; permitted manual host under `editor/manual/**`. Canonical asset identity/catalog/factory remains Phase2 Editor. Phase5 Document Foundation remains the serializer/read/write authority. Phase13 Project Manager remains the active-project/root/document tracking authority. `runtime-render` retains all texture, atlas, visual resource, GPU, animation and scene preview authority. Engine retains all gameplay rules. `runtime-engine/`, `runtime-render/`, `game-client/`, `game-server/`, `rpg_core/`, `rpg_gameplay/` and external pinned L1/L2 packages are **READ-ONLY**.

**Re-audit current execution HEAD before coding.** Source inspected on 2026-10-24 main `aceea67f95cb309bdd06f1d6193767bfa06f42ce`: `editor/src/asset-catalog.ts` exports `createAssetCatalog`, `getAssetDefinition`, `registerAssetDefinition`, `updateAssetDefinition`, `removeAssetDefinition`, `resolveAssetReference`; `editor/src/asset-definition.ts` has open `kind`/portable `metadata`/`sources`/`dependencies`; `editor/src/asset-visual.ts` `describeResolvedVisualAsset` currently supports image kind; `editor/src/document-load.ts`/`document-save.ts` expose owner-specific Document persistence; `editor/src/asset-sources.ts` validates project-relative lexical locators. On this inspected main, **Phase12 UI and Phase13 Project Manager production implementation are not yet present**; their task files and designs are not implementation evidence. Do not assume planned APIs are already real, and do not build replacement subsystems to bypass them.

**Allowed scope, narrow per checkpoint:** new `editor/src/asset-manager-*.ts` plus additive exports in `editor/src/index.ts`, `editor/docs/asset-manager-*.md`, minimal `editor/ui/**` ONLY in AM10/AM11, minimal `editor/manual/**` ONLY for explicit import/MVP observation, `harness/checkpoints/asset-manager-v0.14.N.md` and necessary tiny Harness ownership/contract pointers. Existing canonical `editor/src/asset-catalog.ts`, `asset-definition.ts`, `asset-reference.ts`, `asset-sources.ts`, `asset-visual.ts`, `document-*.ts`, `project-*.ts`, `viewport-host.ts`, UI theme/components/panels and source schema are **read-only by default**. If a real dependency gap requires additive changes to a canonical owner, **STOP with evidence and propose the smallest correct-owner delta**, not an unauthorized patch or shim. No edits to root package/lock, Harness CLI/checker/config, CI workflows, external pins or a sixth workspace. Do not add libraries/dependencies for basic search, UI, import or preview.

**Preconditions:** API checkpoints AM02–AM09 require Phase13 Project Manager real source and current Phase2/5 contracts when relevant; UI checkpoints AM10/AM11 require actual installed Phase12 React/Mantine theme, panel shell and `ui:check` and Phase13 active-project APIs. If a prerequisite is absent, document `BLOCKED_DEPENDENCY` and missing exact signature; proceed only through genuinely independent prior work, never substitute homegrown Manager/Theme/Render. The phase must not require Developer review every checkpoint; stop only on genuine owner, safety, breaking-API, unauthorized scope or missing-dependency blockers.

## C. Mandatory contract invariants — apply to this exact task

1. **Single catalog owner.** Existing immutable Phase2 `AssetCatalog` and its public registration/update/remove/resolve are authoritative; browser indexes, local state, view models and project adapters must not become alternate asset stores.
2. **One project scope.** Asset identity includes exact `projectId`; Project A/B root capability, catalog, tracked documents, UI selection, preview handles and save receipts must never mix. No global singleton with fallback to prior project.
3. **Kind ≠ category ≠ gameplay.** `AssetDefinition.kind` describes resource/data (`image`, `text`, vendor types); optional browser category (`player`,`monster`,`map`,`item`,`vfx`, extensions) is authoring metadata. No Owner migration to L3, no categories requiring five separate render/gameplay pipelines.
4. **Logical refs ≠ physical storage.** `AssetReference`/`DocumentIdentity`/`ResourceLocator` are portable data. Host-approved Phase13 root capability alone authorizes disk access and physical containment; lexical locator checks are not filesystem/symlink proof. Never serialize absolute root paths into authored asset definitions.
5. **No second persistence.** Each asset is an owner-validated AssetDefinition Document through Phase5 `DocumentEnvelope`/`loadDocument`/`saveDocument`; Project Manager tracks its document reference. In-memory catalog state, asset-document commit and project-manifest commit are separate; never report Save Project as Save All Assets or promise cross-file atomicity.
6. **Reference semantics preserve ownership.** `resolveAssetReference` is project/kind aware; a `subresourceId` is opaque and cannot be claimed resolved by catalog when Phase2 reports unsupported. No filename-to-ID, image-dimension-to-kind, path-derived category or silent rebind/repair.
7. **Render owns preview resources.** Adapter may request supported image preview via Render public APIs; no Editor-owned PNG decoder, texture cache, Three import, GPU lifecycle, sprite renderer, clone of 8-direction animation or camera math. Unsupported kinds are explicit, not fabricated visual proof.
8. **Phase12 owns UI conventions.** Mantine native components, one theme, AppShell/Panel primitives and enforced CSS rules. No raw styled Button/Input/Panel competitor, no per-screen global CSS, no second router/library. Asset Browser is a feature panel, not a second Editor app.
9. **MVP deliberately tiny.** One real PNG categorized Player + one metadata-only Item asset, browse/search/filter/inspect/ref/preview, asset-document save/reopen, and A/B isolation. Full animation/Map/Monster/VFX preview, drag/drop, bulk import, asset file manipulation, recursive scan, thumbnails, editing forms, graph/UI matrix deferred.
10. **Honest results.** TypeScript build or static policy scan cannot prove physical reads, browser UI interaction, GPU pixels or resource cleanup. No fake file-system receipts, placeholder PNG-as-proof, magic sample source, unit/Playwright/E2E/snapshot/coverage test suites or fake PASS. Manual finite observations with actual files/actions only when supported.

## D. Agent workflow — one capability/task/checkpoint commit

1. Read root `AGENTS.md`, `ARCHITECTURE.md`, `FOUNDATION.md`, `editor/AGENTS.md`, relevant Phase2/5/7/12/13 source/public roots, `harness/{OWNERSHIP,CONTRACTS,WORKFLOW,VERIFICATION,FAILURES}.md`, previous AM checkpoint and actual consumed implementations. Use `node harness/cli.mjs route -- "editor asset manager browser"` as advisory only; source ownership decides.
2. Use **one phase branch** (suggest `feat/asset-manager-browser-v0.14`) and **one PR**; implement versions `v0.14.0` through `v0.14.11` in order. Each version = **one distinct feature/capability = one checkpoint commit**. No compressed tasks, no designing ahead by implementing later features, no routine Developer review between commits. Final Developer review at closure; no automatic merge/release/tag.
3. For this task inspect exact current HEAD, last checkpoint, allowed file list, real exported signatures and compiler declarations. State a concise delta plan and actual owner, then implement only its named scope. Do not assume source names from this planning package match future HEAD.
4. After delta run actual Harness commands, adjusted only for current HEAD:

```bash
node harness/cli.mjs check
node harness/cli.mjs scope --projects editor --allow-infra
node harness/cli.mjs verify --projects editor --with-consumers
```

At UI checkpoints and closure also run existing Editor `ui:check` and actual UI build (names from current package scripts). At closure run full real root build according to current policy. When public API changes, compile actual impacted consumers, never bypass imports with `any` or deep imports. **Build-only automation:** do not generate unit/integration/E2E/browser/Playwright/snapshot tests, coverage or separate test runner; manual finite source/API/CLI/browser checks are permitted with honest limitations. CI/PR must refer to actual commit if available, not invented run/status.
5. Write `harness/checkpoints/asset-manager-v0.14.N.md`: exact SHA/PR/source changes, scope/owner review, public API delta, check+build outputs, finite observed positive/negative behavior, not-verified claims, dependency blockers and next handoff. Continue to next version after truthful gate unless truly blocked. Do not repeatedly re-audit unrelated workspace at every checkpoint.
6. If required API or native behavior is absent, **STOP** at real boundary with minimal reproduction, owner, impacted exports and additive delta proposal. Do not introduce a duplicate asset store, alternate UI theme, browser-specific save protocol, private Render import or cross-project patch to hide a gap.

## E. Common acceptance / handoff

- This version's **one** objective and explicit positive/negative cases are implemented or, for architecture/closure checkpoints, audited in the allowed scope. No next-version capability silently built.
- Canonical public contracts remain backward compatible; source/root declaration changes are enumerated, and no unauthorized project or asset schema changes appear.
- `ARCH_CHECK_PASS`, `BUILD_PASS`, `API_OBSERVED`, `IO_NOT_VERIFIED`, `UI_NOT_VERIFIED`, `VISUAL_NOT_VERIFIED`, `BLOCKED_DEPENDENCY` are separate factual statuses. Checkpoint carries any missing runtime UI/IO evidence forward without claiming it was fixed.
- No broad visual/browser test matrix. The phase's acceptance depends on foundation/source correctness plus a small genuine MVP proof, not number of widgets or assets.

## F. Version-specific acceptance checklist (do not replace with general build PASS)

- [ ] Verify preconditions from current HEAD; keep source-backed API names and module owner correct.
- [ ] Deliver **AM11 / Minimal Working Asset Manager MVP** only; no functionality from later AM checkpoints.
- [ ] Check one valid case and at least one invalid/foreign/stale/unsupported case appropriate to this exact feature; preserve prior canonical owners and unchanged data.
- [ ] Review file list against the per-checkpoint allowlist, including changed root exports. Zero unauthorized changes across non-Editor production projects.
- [ ] Run genuine architecture and Editor verification commands and record exact results; UI checks only when this checkpoint touches UI.
- [ ] Write `harness/checkpoints/asset-manager-v0.14.10.md` recording what was **observed**, what remains **NOT_VERIFIED**, and whether any blocker exists.
- [ ] Commit only this capability on Phase14 branch; link exact PR/CI evidence only when available.

## G. Next handoff

After an honest v0.14.10 checkpoint, continue to **v0.14.11 — Asset Manager Integration & MVP Closure** without routine Developer review. Carry forward exact source contracts and any unverified runtime/storage/UI evidence. Do not implement next feature early.
