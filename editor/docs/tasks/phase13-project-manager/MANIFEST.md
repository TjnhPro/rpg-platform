# Phase 13 — Project Manager · implementation task manifest

**Repository:** https://github.com/TjnhPro/rpg-platform  
**Phase:** `v0.13.0–v0.13.10`, **11 capabilities / 11 independent tasks / 1 branch / 1 PR**.  
**Canonical owner:** L4 `editor` (pure Project APIs in Editor business core; UI in existing Phase12 Editor React/Mantine shell).  
**Goal:** Project identity, metadata, resources/document refs, active Scene, session and honest Create/Open/Save via existing Document Foundation; minimal A/B isolation MVP.

## Required project rules

- **Foundation-first:** v0.13.0–0.13.8 are Project content/contracts/APIs; v0.13.9 only a small user-facing React/Mantine panel + actual IO; v0.13.10 closure only. One task per capability; no merged stages, no reduced contract detail.
- **Read-only external workspaces:** `runtime-engine`, `runtime-render`, `game-client`, `game-server`, L1 `@rpg/core/kernel`, L2 `@rpg/gameplay`. No sixth workspace. No Renderer/Engine code changes. Cross-project hard stop with a concrete dependency report.
- **Source truth:** Editor main inspected 2026-10-24 contains DocumentEnvelope/DocumentSession/loadDocument/saveDocument and project-local Asset/Scene identities. Phase12 React/Mantine actual implementation was not visible on main when authored; verify its real exports/components/tools on actual execution HEAD, do not fabricate missing API.
- **Schema:** Project manifest v1 as one Editor DocumentEnvelope of kind `project`, strict Project content admission in Editor Document diagnostics, no second serializer/persistence stack. PM01 freezes exact field shape; PM02 implements metadata/content owner; later capabilities fill separate APIs.
- **Save Project ≠ Save All Documents**. `create-only` and token-based conditional write only if host attests existing Document Write preconditions; never simulate atomic CAS with read + plain rename. No overclaim of physical containment from lexical paths.
- **MVP:** real Create/Save/Open for `game-a`/`game-b`, independent root/session, one wrong-project refusal. Small Mantine panel within Phase12 Editor UI: Create, Open, Save, project status. CLI real directories + finite UI smoke; no WebGL, heavy browser matrix, Playwright or automated tests.
- **UI:** must reuse Phase12 theme, component defaults, panel layout and `ui:check`. No custom CSS per feature, second Button system, new design system or new UI stack.

## Roadmap and files

| Version | Capability | Task file |
| --- | --- | --- |
| `v0.13.0` | PM01 — Project Manager Architecture & Contract Foundation | [rpg-platform-v0.13.0-project-manager-architecture-contract-foundation-task.md](./rpg-platform-v0.13.0-project-manager-architecture-contract-foundation-task.md) |
| `v0.13.1` | PM02 — Project Identity, Metadata & Manifest Contract | [rpg-platform-v0.13.1-project-identity-metadata-manifest-contract-task.md](./rpg-platform-v0.13.1-project-identity-metadata-manifest-contract-task.md) |
| `v0.13.2` | PM03 — Project Root & Resource Root Contracts | [rpg-platform-v0.13.2-project-root-resource-root-contracts-task.md](./rpg-platform-v0.13.2-project-root-resource-root-contracts-task.md) |
| `v0.13.3` | PM04 — Project Document Tracking | [rpg-platform-v0.13.3-project-document-tracking-task.md](./rpg-platform-v0.13.3-project-document-tracking-task.md) |
| `v0.13.4` | PM05 — Active Scene Reference | [rpg-platform-v0.13.4-active-scene-reference-task.md](./rpg-platform-v0.13.4-active-scene-reference-task.md) |
| `v0.13.5` | PM06 — Project Session & Lifecycle | [rpg-platform-v0.13.5-project-session-lifecycle-task.md](./rpg-platform-v0.13.5-project-session-lifecycle-task.md) |
| `v0.13.6` | PM07 — Create Project | [rpg-platform-v0.13.6-create-project-task.md](./rpg-platform-v0.13.6-create-project-task.md) |
| `v0.13.7` | PM08 — Open Project | [rpg-platform-v0.13.7-open-project-task.md](./rpg-platform-v0.13.7-open-project-task.md) |
| `v0.13.8` | PM09 — Save Project | [rpg-platform-v0.13.8-save-project-task.md](./rpg-platform-v0.13.8-save-project-task.md) |
| `v0.13.9` | PM10 — Minimal Working Project Manager UI & MVP | [rpg-platform-v0.13.9-minimal-working-project-manager-ui-mvp-task.md](./rpg-platform-v0.13.9-minimal-working-project-manager-ui-mvp-task.md) |
| `v0.13.10` | PM11 — Project Manager Integration & MVP Closure | [rpg-platform-v0.13.10-project-manager-integration-mvp-closure-task.md](./rpg-platform-v0.13.10-project-manager-integration-mvp-closure-task.md) |

## Strict execution contract

1. Read exact HEAD/checkpoint and current Phase12 Editor UI Foundation before coding; do not treat task-date source snapshots as current.
2. Implement one scope only; all production changes under `editor/`. Harness docs/checkpoints allowed; root package/CI/other projects not authorized.
3. Preserve old Editor public contracts. Add correct Project API owner only; escalate any backwards-incompatible API, unsafe persistence or cross-project scope change.
4. Follow repo build-only verification: `node harness/cli.mjs check`, `node harness/cli.mjs scope --projects editor --allow-infra`, `node harness/cli.mjs verify --projects editor --with-consumers`; include Editor UI checks/build at PM10 and closure; actual status only.
5. One checkpoint commit each version, continuous phase progress, no routine Developer approval between checkpoints, stop for genuine blocking prerequisites. Final Developer review after v0.13.10; no self-merge.

## Minimal acceptable evidence for MVP

A and B stored under **two real separate filesystem roots**; create-only first save results in actual distinct manifest files, close/open roundtrip preserves identities and selected portable metadata; wrong-project reference/root attempt rejects and does not mutate either state. UI has real Mantine Create/Open/Save controls wired to these same APIs; one small browser smoke if supported. If browser was not executed, report `UI_NOT_VERIFIED` instead of `UI_PASS`. If host cannot guarantee replacement CAS, support only proven create-only path and report existing-file updates unsupported; do not pretend all Save modes work.

**Deferred:** Project Wizard, Recent Projects, Save All, autosave, filesystem scanning/index, Scene content loading, Asset Manager integration, project ZIP import/export, cloud sync, multiwindow, app-wide router, large browser test matrix.
