# Runtime Engine — project-specific agent guidance

**Canonical owner:** Composition of frozen L1/L2 public capabilities and game-specific executable rules, their state transitions and lifecycle. It is not a universal RPG Engine schema.

Read `../AGENTS.md`, `../ARCHITECTURE.md` and `../harness/OWNERSHIP.md` first.

- Before implementing a rule, determine requirements of **this game**. Similar names across games do not establish compatible contracts.
- L1 (`@rpg/core/kernel`) numerical calculation and L2 (`@rpg/gameplay`) reusable capability integrations are imported through public APIs only, never copied. No L1/L2 edits.
- Publish only what Editor/Client/Server actually need via deliberate contracts. Config semantics are Runtime-owned; Editor should not reconstruct them.
- Do not import Three.js, Editor, Client UI, Game Server persistence/networking.
- Do not force fixed ticks, network authority, universal collision, inventory schemas, or replay unless the selected game requires them.
- Build command must be configured in `../harness/config.json` from the real project. No automatic tests or synthetic build success.
