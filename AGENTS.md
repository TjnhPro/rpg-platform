# Agent entrypoint — RPG Platform

## Mission

Maintain the architecture of **five independently owned projects** while evolving an individual game. Before coding: identify the *behavior owner*, inspect relevant public contracts, and choose the minimum legitimate project scope. Never route by a shared feature name alone.

## Non-negotiable boundaries

1. `runtime-engine`: composes frozen L1/L2 capabilities and implements **game-specific rules** (identity/state/lifecycle/simulation semantics of that game). No Editor, browser renderer, client UI or server infrastructure imports.
2. `runtime-render`: scene/presentation, sprite/animation/VFX/camera; no combat, loot, progression, reward or gameplay-authority implementation. Editor and Client share this implementation.
3. `editor`: authors content/config, project/scene tools, inspection, validation, preview via the appropriate Runtime and Render public APIs. **Never independently recomputes gameplay rules.**
4. `game-client`: user interaction and the client's selected execution/presentation responsibilities. No presumed network or authority architecture.
5. `game-server`: only the responsibilities this particular game needs (e.g. preparation, verification, settlement, rewards, persistence). **Do not impose tick-based MMO authority or realtime sync.** Render/scene support is optional; correctness must not require producing GPU frames.
6. `@rpg/core/kernel` (L1) and `@rpg/gameplay` (L2) are **read-only external foundations in this roadmap**. No edits, reimplementation, blanket 'promotion to L2', or deep/private imports. Escalate missing capabilities to Developer.
7. Exactly five projects. Harness files are tooling, not a sixth production project. No automatic `shared`, `common`, `engine-core`, generic RPG schema or universal Rule DSL.

## Mandatory preflight (before each change)

1. Read this file, `ARCHITECTURE.md`, `harness/OWNERSHIP.md`, relevant project `AGENTS.md` and the current source/public APIs. Do not trust stale documentation over code.
2. Describe: requested behavior; **one canonical primary owner**; required collaborators; why each is touched; external L1/L2 APIs; impact on public contracts. Unknown ownership => stop and ask for an architecture decision, not an invented module.
3. Use `node harness/cli.mjs route -- "..."` only for **hints**, never as the final decision. Report uncertain or multiple-owner changes explicitly.
4. Identify scope and expected build commands. For boundary or public contract modifications, get explicit Developer approval before implementation. Do not silently expand scope.
5. Implement behind the declared owner public surface; add or change consumers only as justified. Use existing APIs; no duplicate renderer or gameplay calculations.
6. Run `node harness/cli.mjs check`. If applicable run `scope`. Run `verify --projects <touched>`; add `--with-consumers` if a public contract changed.
7. Report exactly what was changed, which builds passed, any unconfigured/failed builds, and what **has not** been functionally or visually verified. Developer alone accepts completion.

## Testing policy: intentionally build-only

- **Never create unit, integration, snapshot, browser, Playwright, visual or E2E tests** unless Developer explicitly changes this policy.
- Do not introduce runners, test matrices, code coverage, or 'test count' targets. Do not run historic exhaustive test suites automatically.
- Required automatic gates are static architecture check + genuine project build(s), not simulated success.
- A successful build is **not** proof a feature works. Do not report behavioral PASS without independent evidence. Manual product review is Developer-owned.

## Game-driven evolution

Do not finalize Player, Monster, Skill, Item, Scene, Server protocol, fixed timestep or game mechanics in Phase 0. Use MVP 1 (Editor + Render), MVP 2 (Editor + Runtime), MVP 3 (Client + Server) to discover actual contracts. Only propose cross-game reuse after real compatibility evidence. Never infer shared semantics from identical names.
