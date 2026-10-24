# AM12 — Asset Manager integration and review packet

READY_FOR_DEVELOPER_REVIEW; manual MVP acceptance remains incomplete.
Editor is the sole production owner. AM12 is documentation/audit only against
production HEAD `fe5d74de2609c826bce45fb0754fe8a85d5b731c`; no new API or UI.
One phase branch: feat/asset-manager-browser-v0.14. No automatic merge/release/tag
or next phase. Developer decides whether to finish or waive remaining evidence.

## Ordered checkpoint audit

All previous checkpoint records exist and carry actual build/evidence limitations.
Each version is one commit, in order, from accepted Phase13 baseline
`f4ccba404c8b48994206cb5e803079fd435b3b51`.

| Capability/version | Exact commit | Audited result |
| --- | --- | --- |
| AM01 / 0.14.0 | 99a3b8aee4b96c569e0705524cc449e2f84514c2 | Architecture/contract ledger and supplied task package |
| AM02 / 0.14.1 | 0071f3d481d32f939b3ac8391cc27fed8b5d0d5a | Exact project/root/generation and complete catalog rebuild |
| AM03 / 0.14.2 | ad9526d5b468e8085ccd2e8f0b0e0cff8ce51091 | Optional category metadata, valid/absent/invalid distinctions |
| AM04 / 0.14.3 | 8ddbcf8937a2231e1bcd5847f31b022a00f2b202 | Register/update/remove candidates; no implicit persistence |
| AM05 / 0.14.4 | 389d133de4dd96666bc822e64aecfa4f68246e0f | Existing resource host observation, real PNG/denied/missing |
| AM06 / 0.14.5 | 6a1b6de0ce7ddf5b4672597d8a2f3a77e091de79 | Deterministic query/category/kind projections |
| AM07 / 0.14.6 | 6194ed8e7c2eff7560a3fd90d902e941ad603ddd | Read-only current-catalog inspection, existence NOT_CHECKED |
| AM08 / 0.14.7 | 72b8c48809873821104cfa60cf9c86c47572edf4 | Scoped selection, foreign/kind/subresource rejection |
| AM09 / 0.14.8 | 9f5da3bfd9188462da140264dc1cee181fbf2db4 | Render preview/late-result disposal adapter |
| AM10 / 0.14.9 | 78626b7794b1fcde4d82f2cbd481bb185086454d | One Browser/viewport in existing Shell; approved stable Project owner |
| AM11 / 0.14.10 | fe5d74de2609c826bce45fb0754fe8a85d5b731c | Finite real host, two independent asset saves, separate manifest save/reopen, B isolation |
| AM12 / 0.14.11 | Unique commit adding this report/checkpoint (git log) | Documentation-only source/declaration/scope/build/evidence closure |

[Public inventory](asset-manager-api-inventory-v0.14.11.md) records all 33 added
root names, 174 preserved names, emitted declarations and canonical ownership.
[MVP recipe](asset-manager-mvp.md) records actual physical paths, PNG hash, per-file
receipts, rebuild, conflict preservation, cleanup and the outstanding manual flow.

## Separate factual statuses

| Status | Evidence and limits |
| --- | --- |
| ARCH_CHECK_PASS | 223 JS/TS sources; static boundaries only |
| BUILD_PASS | check/scope/Editor-with-consumers verification exit0; Editor ui:check 14 sources/3 styles, zero errors/manual warnings; portable TS and actual TypeScript/Vite UI build; root npm run build (tsc -b five configured project references) exit0 |
| CATALOG_API_OBSERVED | Earlier root-API observations plus AM11 independent loaded-Document rebuild, retained metadata, search/category/kind and Inspector; no file-existence inference |
| STORAGE_REOPEN_OBSERVED | A two asset Documents and project.json actually committed/read back, separate receipts; no cross-file atomicity or existing-file replacement |
| PROJECT_ISOLATION_OBSERVED | Different physical B root empty/not-selected, A reference PROJECT_MISMATCH, foreign relative read denied; CLI evidence |
| UI_NOT_VERIFIED | Full AM11 host/control/switch/save/reopen flow has no qualifying finite manual product review |
| VISUAL_NOT_VERIFIED | No actual visible PNG pixel inspection; no PNG_VISUAL_OBSERVED claim |

Earlier AM09/AM10 notes recorded browser/API operations assisted by Playwright.
That route did not meet the task's manual-only/no-Playwright requirement and is
not credited as qualifying UI acceptance here. Their reported Render ready/binding,
Item unsupported, late-clear and resource-release counters remain historical
API observations only; they do not prove pixels or the new AM11 host flow. No
automated test suite/runner was committed. No further Playwright was used in AM11
storage observation or this closure. Resource release for the complete AM11 UI
flow still needs manual review. This audit does not retroactively repair that gap.

No configured build failed in the final run. Existing Vite >500kB chunk and Windows
DEP0190 warnings remain. Harness --with-consumers selected Editor only (no project
imports Editor); root build includes all five project's TypeScript references.
CI/PR status must be read at the final pushed SHA, never inferred from local builds.

## Review boundaries and handoff

AM11 host supports first publication only. Save Documents before the first Project
Save, then explicitly save the manifest; later updates/recovery and partial-save
retry UX are unavailable. Project switching discards unsaved asset registrations
with an explicit UI message. Late completions cannot publish state to another
active capability; already committed files are not rolled back. Source/host
topology is trusted, not a hostile same-account containment guarantee.

No framework/CSS/schema/dependency/gameplay or non-Editor production change.
Untracked local .mcp.json/.playwright-mcp artifacts are excluded. Actual UI/pixels,
responsive release and full A↔B preview cleanup are still Developer review items
using the seven-step MVP recipe. Stop at this review packet; do not label the phase
functionally/visually accepted based on builds or documentation.
