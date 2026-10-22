# Game Server — project-specific agent guidance

**Canonical owner:** Responsibilities required by THIS game, e.g. session setup, result validation, settlement, reward issuance, identity checks and persistence.

Read root agent guidance first.

- Reuse the chosen Runtime Engine's game rules; do not copy/reimplement combat or reward formulas in network/database code.
- Do **not** assume a realtime MMO server, monster-by-monster HP sync or fixed ticks. PvE waves with end-of-session settlement may be appropriate.
- Replay versus coarse validation versus trust policy is a **game-specific tradeoff**, not a Foundation default. Build success is not proof the validation policy is secure.
- Use content appropriate for server; it may keep secret drop/reward data. Never accept Client-declared item grants without game-chosen checks.
- Runtime Render use is optional, if there is an approved headless scene/geometry requirement; no GPU frame is necessary for normal validation/rewards.
- Build-only verification; no generated tests or test matrices.
