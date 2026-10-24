# Phase 14 — Asset Manager & Browser · task manifest

**Repository:** https://github.com/TjnhPro/rpg-platform  
**Roadmap:** `v0.14.0–v0.14.11` · **12 independent capabilities / 12 checkpoint commits / one branch / one PR**.  
**Primary owner:** L4 `editor` only.  
**Architecture:** Phase13 Active Project → Phase2 AssetCatalog/References/Definitions → Phase5 asset Document persistence → Phase12 React/Mantine Browser UI; Phase7/8/9 Render owns any supported preview. No second renderer/catalog/storage or UI framework.

## MVP nhỏ nhưng thật

- Project A has **one real project-root PNG `kind:image`, browser category Player**, and **one metadata-only Item `kind:text`** (no Item preview).
- Register existing source; search/filter; select; inspect metadata, sources and canonical reference; preview one real PNG via Render.
- Save each AssetDefinition via existing Asset Document persistence and separately save Project Manager manifest tracking; reopen Project A and reconstruct catalog from real saved documents.
- Open Project B in separate root; no access to A catalog, selections, resource leases or reference resolution. Wrong-project reference explicitly rejects.
- Use **one minimal Asset Browser feature panel** within the existing Phase12 React/Mantine AppShell and Panel rules. Do not build five product category editors or any animation/gameplay preview.
- Manual small file/CLI + browser smoke only when actually available. `BUILD_PASS` != `UI_OBSERVED` != `PNG_VISUAL_OBSERVED` != `STORAGE_REOPEN_OBSERVED`.

## Roadmap

| Version | Capability | Task file |
| --- | --- | --- |
| `v0.14.0` | AM01 — Asset Manager Architecture & Contract Foundation | [rpg-platform-v0.14.0-asset-manager-architecture-contract-foundation-task.md](./rpg-platform-v0.14.0-asset-manager-architecture-contract-foundation-task.md) |
| `v0.14.1` | AM02 — Project-bound Asset Catalog | [rpg-platform-v0.14.1-project-bound-asset-catalog-task.md](./rpg-platform-v0.14.1-project-bound-asset-catalog-task.md) |
| `v0.14.2` | AM03 — Asset Categories & Organization | [rpg-platform-v0.14.2-asset-categories-organization-task.md](./rpg-platform-v0.14.2-asset-categories-organization-task.md) |
| `v0.14.3` | AM04 — Asset Registration & Management | [rpg-platform-v0.14.3-asset-registration-management-task.md](./rpg-platform-v0.14.3-asset-registration-management-task.md) |
| `v0.14.4` | AM05 — Resource Import Contracts | [rpg-platform-v0.14.4-resource-import-contracts-task.md](./rpg-platform-v0.14.4-resource-import-contracts-task.md) |
| `v0.14.5` | AM06 — Asset Search & Filtering | [rpg-platform-v0.14.5-asset-search-filtering-task.md](./rpg-platform-v0.14.5-asset-search-filtering-task.md) |
| `v0.14.6` | AM07 — Asset Metadata Inspector | [rpg-platform-v0.14.6-asset-metadata-inspector-task.md](./rpg-platform-v0.14.6-asset-metadata-inspector-task.md) |
| `v0.14.7` | AM08 — Asset Reference Selection | [rpg-platform-v0.14.7-asset-reference-selection-task.md](./rpg-platform-v0.14.7-asset-reference-selection-task.md) |
| `v0.14.8` | AM09 — Asset Preview Integration | [rpg-platform-v0.14.8-asset-preview-integration-task.md](./rpg-platform-v0.14.8-asset-preview-integration-task.md) |
| `v0.14.9` | AM10 — Asset Browser UI Integration | [rpg-platform-v0.14.9-asset-browser-ui-integration-task.md](./rpg-platform-v0.14.9-asset-browser-ui-integration-task.md) |
| `v0.14.10` | AM11 — Minimal Working Asset Manager MVP | [rpg-platform-v0.14.10-minimal-working-asset-manager-mvp-task.md](./rpg-platform-v0.14.10-minimal-working-asset-manager-mvp-task.md) |
| `v0.14.11` | AM12 — Asset Manager Integration & MVP Closure | [rpg-platform-v0.14.11-asset-manager-integration-mvp-closure-task.md](./rpg-platform-v0.14.11-asset-manager-integration-mvp-closure-task.md) |

## Mandatory boundaries

1. All production changes are confined to `editor/**`. Other four workspaces and external L1/L2 **READ-ONLY**. Do not modify Runtime Render to implement Editor preview or L3 to add category rules.
2. Only the existing Phase2 AssetCatalog is authoritative. AssetKind is not UI category. Optional `metadata.editorBrowserCategory` uses explicit authored values. No new serialized catalog, second data store or ad-hoc resource parser.
3. Phase13 owns project identity, physical root host binding and project document tracking. Phase5 owns Doc codec/save/load; **Save Project ≠ Save Asset Documents**, no implied transaction across files.
4. Phase12 React/Mantine AppShell/theme/Panel/`ui:check` must actually exist on execution HEAD before starting UI integration. If not, `BLOCKED_DEPENDENCY`; never build a second shell/theme.
5. Portable asset resource locator cannot establish physical containment. Any real import/IO requires authorized host root and actual read/commit evidence.
6. Preview reuses Phase7/8/9 public Render APIs and supported image types only; Item/VFX/Monster/etc. animated preview deferred.
7. One task = one capability. Every checkpoint requires source/architecture audit, truthful build/CI, no generated tests, and separate runtime/IO/visual evidence status. One Developer approval at phase closure unless blocked by real upstream contract change.
8. **Do not treat these specification files as implementation**. On 2026-10-24 main inspected, Phase12 and Phase13 production code were not yet present, even though tasks exist. Check actual current HEAD and execution branch before coding.

## Deferred / not authorized

Recursive directory scan, bulk import, drag/drop file copy, filesystem moves/deletes, auto thumbnails, full Player/Monster/Map/Item/VFX preview types, animator/editor designer, VFX preview designer, asset schema forms, cross-project asset sharing, reference graph view, hot reload, asset build/publish. Contracts leave future extension possible; MVP intentionally omits them.

## Verification

```bash
node harness/cli.mjs check
node harness/cli.mjs scope --projects editor --allow-infra
node harness/cli.mjs verify --projects editor --with-consumers
```

Additionally for any UI source checkpoint run current Editor `ui:check` and real UI build; full root build at closure per actual Harness. No newly generated unit/integration/E2E/Playwright/snapshot tests. Real manual CLI/browser observations allowed.
