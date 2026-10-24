# TASK — RPG Platform v0.14.3: Asset Registration & Management

**Phase:** 14 — L4 Editor Asset Manager & Browser  
**Checkpoint:** 4/12 · **Capability:** AM04  
**Canonical owner:** L4 `editor` (business + existing Phase12 Editor UI only as authorized)  
**Repository:** https://github.com/TjnhPro/rpg-platform  
**Task status:** Specification only; not evidence of implementation, UI or actual persisted files.  
**One objective:** Expose a project-admitted create/update/unregister workflow by composing canonical Phase2 immutable AssetCatalog APIs and Phase5/13 tracking without independent CRUD.

## A. Mục tiêu version, dependencies và contract cần triển khai

### Preconditions and scope for this capability

AM02 project-bound session and AM03 optional category semantic exists; inspect canonical registration/update/remove behavior and owner data.

### Deliverables

One safe admission/transitions adapter for register, metadata-update and unregister with defined invalidation, persistence boundaries and noncascading delete semantics.

### Exact implementation/architecture instructions

- `register` must call canonical `createAssetDefinition` and `registerAssetDefinition`; duplicate assetId rejection is never upsert. An `update` must call `updateAssetDefinition`, keep the exact identity, be explicit about replacing complete authored metadata/sources/dependencies and preserve nonedited unknown fields. An `unregister` calls `removeAssetDefinition`; only affects the in-memory catalog candidate.
- Every definition and dependency belongs to the bound project. Accept source locators only through existing `createResourceLocator` validation, not by editing absolute paths. Do not equate `File exists` with `registered`.
- Document tracking: an AssetDefinition is persisted in its own `DocumentEnvelope` of owner `asset` using Phase5 APIs. Require explicit authored document identity/locator and Phase13 tracking; do not invent one from `assetId` unless supplied by an approved deterministic host mapping and validated. One asset candidate does not magically update an already persisted manifest.
- No multi-file transaction promise. Explain commit ordering and partial failure: asset Document save and Project Manifest tracking commit are independent; expose pending/untracked/failed status where appropriate, retain truthful last committed state and recover through explicit host action.
- Removing a catalog entry does **not** physically delete PNGs, atlas files, documents, Scene references or GPU leases. Existing inbound references may become unresolved; never silently cascade.
- No filesystem copying here (separate AM05). Support one direct concrete asset registration for MVP without schema-migration framework.

### Forbidden shortcuts for this version

Do not modify source `editor/src/asset-catalog.ts`/`asset-definition.ts` for convenience; breaking core API requires STOP, not shadow implementation.

### Expected concrete files

`editor/src/asset-manager-registration.ts`, root exports, docs and checkpoint; no UI or physical IO.

### Finite acceptance/evidence for this capability

Manual pure admission of two catalog assets, duplicate ID refusal, invalid project refusal, update retains unrelated fields, unregister leaves external references untouched. Record persistence NOT_VERIFIED.


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
- [ ] Deliver **AM04 / Asset Registration & Management** only; no functionality from later AM checkpoints.
- [ ] Check one valid case and at least one invalid/foreign/stale/unsupported case appropriate to this exact feature; preserve prior canonical owners and unchanged data.
- [ ] Review file list against the per-checkpoint allowlist, including changed root exports. Zero unauthorized changes across non-Editor production projects.
- [ ] Run genuine architecture and Editor verification commands and record exact results; UI checks only when this checkpoint touches UI.
- [ ] Write `harness/checkpoints/asset-manager-v0.14.3.md` recording what was **observed**, what remains **NOT_VERIFIED**, and whether any blocker exists.
- [ ] Commit only this capability on Phase14 branch; link exact PR/CI evidence only when available.

## G. Next handoff

After an honest v0.14.3 checkpoint, continue to **v0.14.4 — Resource Import Contracts** without routine Developer review. Carry forward exact source contracts and any unverified runtime/storage/UI evidence. Do not implement next feature early.
